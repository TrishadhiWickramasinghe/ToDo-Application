'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { ImageUploader, UploadedImage } from '@/components/common/ImageUploader';
import { validateTodoTitle, validateTodoDescription } from '@/utils/validation';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, images: File[]) => Promise<void>;
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
  const [images, setImages] = useState<UploadedImage[]>([]);
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
      await onSubmit(title, description, images.map((i) => i.file));
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating todo:', error);
      setErrors({ title: 'Failed to create todo. Please try again.' });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="✨ Create New Todo"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmText="Create Todo"
      isConfirming={isLoading}
    >
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Title *"
          placeholder="e.g. Complete project proposal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
          maxLength={255}
          autoFocus
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Add details or acceptance criteria…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            maxLength={500}
            className={`w-full px-4 py-2.5 border-2 rounded-lg resize-none transition-colors
              focus:outline-none focus:ring-1
              ${errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-600">{errors.description}</p>
              : <span />
            }
            <p className="text-xs text-gray-400 ml-auto">{description.length}/500</p>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments <span className="text-gray-400 font-normal">(optional · up to 5 images)</span>
          </label>
          <ImageUploader
            images={images}
            onChange={setImages}
            maxFiles={5}
            maxSizeMB={5}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
