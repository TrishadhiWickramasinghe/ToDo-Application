'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validateTodoTitle, validateTodoDescription } from '@/utils/validation';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTodoModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

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
    if (!validateForm()) return;

    try {
      await onSubmit(title, description);
      setTitle('');
      setDescription('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating todo:', error);
      setErrors({ title: 'Failed to create todo. Please try again.' });
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
      title="Create New Todo"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmText="Create"
      isConfirming={isLoading}
    >
      <div className="space-y-4">
        <Input
          label="Title *"
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter todo description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            maxLength={500}
            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
              errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">{description.length}/500</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
