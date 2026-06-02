'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Todo } from '@/services/todoService';
import { validateTodoTitle, validateTodoDescription } from '@/utils/validation';

interface EditTodoModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSubmit: (id: number, title: string, description: string) => Promise<void>;
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
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
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
      await onSubmit(todo.id, title, description);
      onClose();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Todo"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmText="Update"
      isConfirming={isLoading}
    >
      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter todo description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
              errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
