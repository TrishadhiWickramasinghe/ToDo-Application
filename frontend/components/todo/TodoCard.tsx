'use client';

import React from 'react';
import { Todo } from '@/services/todoService';
import { Button } from '@/components/common/Button';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: 'pending' | 'completed') => void;
  isLoading?: boolean;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDisplayDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Returns "overdue" | "today" | "upcoming" | null */
function getScheduleStatus(startDateTime: string | null): 'overdue' | 'today' | 'upcoming' | null {
  if (!startDateTime) return null;
  const dt = new Date(startDateTime);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  if (dt < now) return 'overdue';
  if (dt >= todayStart && dt < todayEnd) return 'today';
  return 'upcoming';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: TodoCardProps) {
  const isCompleted = todo.status === 'completed';
  const scheduleStatus = isCompleted ? null : getScheduleStatus(todo.start_date_time);

  // Left accent colour based on state
  const accentClass = isCompleted
    ? 'border-l-green-400'
    : scheduleStatus === 'overdue'
    ? 'border-l-red-400'
    : scheduleStatus === 'today'
    ? 'border-l-orange-400'
    : 'border-l-blue-500';

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        hover:shadow-md transition-all duration-200
        border-l-4 ${accentClass}
        ${isCompleted ? 'opacity-75' : ''}
      `}
    >
      {/* ── Main body ── */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">

          {/* Checkbox toggle */}
          <button
            onClick={() => onToggleStatus(todo.id, isCompleted ? 'pending' : 'completed')}
            disabled={isLoading}
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            className={`
              mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
              transition-all duration-200 disabled:opacity-50
              ${isCompleted
                ? 'bg-green-500 border-green-500 hover:bg-green-600'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }
            `}
          >
            {isCompleted && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-semibold text-base leading-snug ${
                  isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>

              {/* Action buttons */}
              <div className="flex gap-1.5 flex-shrink-0 ml-2">
                <button
                  onClick={() => onEdit(todo)}
                  disabled={isLoading || isCompleted}
                  title="Edit todo"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  disabled={isLoading}
                  title="Delete todo"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <p className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${
                isCompleted ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {todo.description}
              </p>
            )}

            {/* ── Meta row ── */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isCompleted ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                  </>
                )}
              </span>

              {/* Separator */}
              <span className="text-gray-200 text-sm">|</span>

              {/* Created date */}
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created {formatDisplayDate(todo.created_at)}
              </span>

              {/* Start date/time (if set) */}
              {todo.start_date_time && (
                <>
                  <span className="text-gray-200 text-sm">|</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      scheduleStatus === 'overdue'
                        ? 'text-red-500'
                        : scheduleStatus === 'today'
                        ? 'text-orange-500'
                        : 'text-blue-500'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {scheduleStatus === 'overdue' && '⚠ Overdue · '}
                    {scheduleStatus === 'today' && '📅 Today · '}
                    {scheduleStatus === 'upcoming' && '🗓 '}
                    {formatDisplayDateTime(todo.start_date_time)}
                  </span>
                </>
              )}

              {/* Updated date (only if different from created) */}
              {todo.updated_at !== todo.created_at && (
                <>
                  <span className="text-gray-200 text-sm">|</span>
                  <span className="text-xs text-gray-400">
                    Updated {formatDisplayDate(todo.updated_at)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading bar ── */}
      {isLoading && (
        <div className="h-0.5 bg-blue-100 overflow-hidden rounded-b-xl">
          <div className="h-full bg-blue-500 animate-pulse" />
        </div>
      )}
    </div>
  );
}
