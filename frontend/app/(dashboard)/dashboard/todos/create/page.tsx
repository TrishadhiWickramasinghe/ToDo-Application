'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { ImageUploader, UploadedImage } from '@/components/common/ImageUploader';
import { todoService, CreateTodoRequest } from '@/services/todoService';
import { dateToBackend } from '@/utils/dateUtils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  startDateTime: Date | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDateTime?: string;
  general?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  const trimmedTitle = data.title.trim();
  if (!trimmedTitle) {
    errors.title = 'Title is required';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (trimmedTitle.length > 255) {
    errors.title = 'Title must not exceed 255 characters';
  }

  const trimmedDesc = data.description.trim();
  if (trimmedDesc.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateTodoPage() {
  const router = useRouter();
//const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
     startDateTime: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field error as the user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Serialize Date → ISO string so JSON.stringify sends a proper date string
      // (dateToBackend returns { date, time } but backend accepts 'nullable|date' ISO strings too)
      const { date: dateStr, time: timeStr } = dateToBackend(formData.startDateTime);
      const payload: CreateTodoRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDateTime:
          dateStr && timeStr ? (`${dateStr}T${timeStr}` as unknown as Date) : null,
        // Images are attached separately as FormData when the backend is ready
        images: images.map((img) => img.file),
      };

      await todoService.createTodo(payload);

      toast.success('Todo created successfully! ✨');
      router.push('/dashboard/todos');
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      if (error.response?.status === 422 && error.response.data?.errors) {
        // Map Laravel validation errors back to form fields
        const serverErrors: FormErrors = {};
        const laravelErrors = error.response.data.errors;

        if (laravelErrors.title) {
          serverErrors.title = laravelErrors.title[0];
        }
        if (laravelErrors.description) {
          serverErrors.description = laravelErrors.description[0];
        }
        setErrors(serverErrors);
        toast.error('Please fix the errors below.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
      } else {
        const message =
          error.response?.data?.message ?? 'Failed to create todo. Please try again.';
        setErrors({ general: message });
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const isDirty = formData.title.trim() || formData.description.trim();
    if (isDirty) {
      if (window.confirm('Discard unsaved changes?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const titleCount = formData.title.length;
  const descCount = formData.description.length;
  const canSubmit = !isLoading && formData.title.trim().length >= 3;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div>
        <Link
          href="/dashboard/todos"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors"
        >
          ← Back to Todos
        </Link>

        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-1">✨ Create New Todo</h1>
          <p className="text-blue-100 text-sm">
            Add a new task to your list. Be specific so it&apos;s easy to track.
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-lg shadow-md p-8">

        {/* General API error banner */}
        {errors.general && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>

            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Complete project proposal"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={255}
              autoFocus
              className={errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />

            <div className="flex items-center justify-between mt-1.5">
              {errors.title ? (
                <p className="text-red-500 text-xs">{errors.title}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ml-auto ${
                  titleCount > 240 ? 'text-red-500 font-medium' : 'text-gray-400'
                }`}
              >
                {titleCount}/255
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Description{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Add details, context, or acceptance criteria…"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={5}
              maxLength={1000}
              className={`w-full px-4 py-2.5 border-2 rounded-lg resize-none transition-colors focus:outline-none focus:ring-1 ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
            />

            <div className="flex items-center justify-between mt-1.5">
              {errors.description ? (
                <p className="text-red-500 text-xs">{errors.description}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ml-auto ${
                  descCount > 900 ? 'text-red-500 font-medium' : 'text-gray-400'
                }`}
              >
                {descCount}/1000
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <DateTimePicker
            label="Start Date & Time"
            selected={formData.startDateTime}
            onChange={(date) => {
              setFormData((prev) => ({ ...prev, startDateTime: date }));
              // Clear date error as user selects
              if (errors.startDateTime) {
                setErrors((prev) => ({ ...prev, startDateTime: undefined }));
              }
            }}
            disabled={isLoading}
            disablePastDates={true}
            showTimeSelect={true}
            timeFormat="24h"
            placeholder="Choose date and time"
            error={errors.startDateTime}
            className="mb-4"
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Attachments
              <span className="text-gray-400 font-normal ml-1">(optional · up to 5 images)</span>
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxFiles={5}
              maxSizeMB={5}
              disabled={isLoading}
            />
          </div>

          {/* Tip box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Clear, specific titles make tasks easier
              to track and complete.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!canSubmit}
              className="flex-1"
            >
              {isLoading ? 'Creating…' : '✨ Create Todo'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* ── Quick-reference examples ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">✅ Good example</h3>
          <p className="text-sm text-green-800">
            <strong>Title:</strong> &ldquo;Review API documentation&rdquo;<br />
            <strong>Description:</strong> &ldquo;Go through the updated API docs
            and provide feedback on clarity and code examples by Friday.&rdquo;
          </p>
        </div>

        <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">❌ Avoid</h3>
          <p className="text-sm text-red-800">
            <strong>Title:</strong> &ldquo;stuff&rdquo;<br />
            <strong>Description:</strong> &ldquo;do things&rdquo;<br />
            Vague tasks are hard to act on and easy to forget.
          </p>
        </div>
      </div>
    </div>
  );
}
