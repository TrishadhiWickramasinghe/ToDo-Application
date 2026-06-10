'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { Todo } from '@/services/todoService';
import { validateTodoTitle, validateTodoDescription } from '@/utils/validation';
import { dateToBackend } from '@/utils/dateUtils';

interface EditTodoModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSubmit: (id: number, title: string, description: string, startDateTime: string | null) => Promise<void>;
  isLoading?: boolean;
}

export function EditTodoModal({
  isOpen,
  todo,
  onClose,
  onSubmit,
  isLoading = false,
}: EditTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Sync form state when a todo is opened for editing
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description ?? '');
      setStartDateTime(
        todo.start_date_time ? new Date(todo.start_date_time) : null
      );
      setErrors({});
    }
  }, [todo, isOpen]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const titleError = validateTodoTitle(title);
    const descError = validateTodoDescription(description);
    if (titleError) newErrors.title = titleError;
    if (descError) newErrors.description = descError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !todo) return;
    try {
      // Serialise Date → "YYYY-MM-DDTHH:mm:ss" string for the backend
      const { date: d, time: t } = dateToBackend(startDateTime);
      const isoStr = d && t ? `${d}T${t}` : null;
      await onSubmit(todo.id, title, description, isoStr);
      onClose();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartDateTime(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="✏️ Edit Todo"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmText="Save Changes"
      isConfirming={isLoading}
    >
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Title"
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Add details or context…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className={`w-full px-4 py-2.5 border-2 rounded-lg resize-none
              focus:outline-none transition-colors
              ${errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Start Date & Time */}
        <DateTimePicker
          label="Start Date & Time"
          selected={startDateTime}
          onChange={setStartDateTime}
          disabled={isLoading}
          disablePastDates={false}
          showTimeSelect
          timeFormat="24h"
          placeholder="Choose date and time"
        />
      </div>
    </Modal>
  );
}
