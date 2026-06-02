'use client';

import React from 'react';
import { Todo } from '@/services/todoService';
import { formatDateOnly } from '@/utils/formatDate';
import { Button } from '@/components/common/Button';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: 'pending' | 'completed') => void;
  isLoading?: boolean;
}

export function TodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: TodoCardProps) {
  const isCompleted = todo.status === 'completed';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox and Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            onClick={() =>
              onToggleStatus(todo.id, isCompleted ? 'pending' : 'completed')
            }
            disabled={isLoading}
            className="mt-1 flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors disabled:opacity-50"
          >
            {isCompleted && <span className="text-green-600 text-lg">✓</span>}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base md:text-lg transition-colors ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h3>
            <p className={`mt-1 text-sm line-clamp-2 ${isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
              {todo.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {isCompleted ? '✓ Completed' : '⏳ Pending'}
              </span>
              {/* Date */}
              <span className="text-xs text-gray-400">{formatDateOnly(todo.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(todo)}
            disabled={isLoading || isCompleted}
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(todo.id)}
            disabled={isLoading}
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}
