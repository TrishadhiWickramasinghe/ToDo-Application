'use client';

import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  disablePastDates?: boolean;
  showTimeSelect?: boolean;
  timeFormat?: '12h' | '24h';
  placeholder?: string;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  disabled = false,
  disablePastDates = true,
  showTimeSelect = true,
  timeFormat = '24h',
  placeholder = 'Select date and time',
  className = '',
  error,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Format string for react-datepicker's timeFormat prop
  const rdpTimeFormat = timeFormat === '24h' ? 'HH:mm' : 'h:mm aa';

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter out past dates
  const filterDate = (date: Date) => {
    if (!disablePastDates) return true;
    return !isBefore(date, startOfDay(new Date()));
  };

  // Display text in the trigger button
  const getDisplayText = () => {
    if (!selected) return placeholder;
    if (showTimeSelect) {
      const timeStr =
        timeFormat === '12h' ? format(selected, 'h:mm a') : format(selected, 'HH:mm');
      return `${format(selected, 'EEE, MMM d, yyyy')} · ${timeStr}`;
    }
    return format(selected, 'EEE, MMM d, yyyy');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  // Quick-select shortcuts
  const setQuick = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    if (showTimeSelect) d.setHours(9, 0, 0, 0);
    onChange(d);
    if (!showTimeSelect) setIsOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div ref={pickerRef} className="relative">
        {/* ── Trigger Button ── */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          className={[
            'w-full px-4 py-2.5 text-left border-2 rounded-lg',
            'transition-all duration-200 flex items-center justify-between',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : isOpen
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300',
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white hover:bg-gray-50',
            'focus:outline-none focus:ring-1',
          ].join(' ')}
        >
          <span className={`text-sm font-medium ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
            {getDisplayText()}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {selected && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                title="Clear date"
              >
                ✕
              </button>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </button>

        {/* Error message */}
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

        {/* ── Dropdown Panel ── */}
        {isOpen && !disabled && (
          <div className="dtp-dropdown absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

            {/* ── ONE ROW: calendar left │ time list right ── */}
            <div className="flex">

              {/* Left — Date calendar */}
              <div className="dtp-cal-col p-3 pb-0">
                <DatePicker
                  selected={selected}
                  onChange={(date: any) => {
                    if (date && selected && showTimeSelect) {
                      // Preserve existing time when a new date is picked
                      date.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
                    }
                    onChange(date);
                    if (!showTimeSelect) setIsOpen(false);
                  }}
                  inline
                  showTimeSelect={false}
                  dateFormat="yyyy-MM-dd"
                  filterDate={filterDate}
                  minDate={disablePastDates ? new Date() : undefined}
                  calendarClassName="dtp-calendar"
                  dayClassName={(date) => {
                    const base = 'dtp-day';
                    if (selected && format(date, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd'))
                      return `${base} dtp-day--selected`;
                    if (isToday(date)) return `${base} dtp-day--today`;
                    return base;
                  }}
                />
              </div>

              {/* Right — Time list (only when showTimeSelect) */}
              {showTimeSelect && (
                <div className="dtp-time-col border-l border-gray-100">
                  <DatePicker
                    selected={selected ?? (() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; })()}
                    onChange={(date: any) => {
                      if (!date) return;
                      const base = selected ? new Date(selected) : new Date();
                      base.setHours(date.getHours(), date.getMinutes(), 0, 0);
                      onChange(base);
                    }}
                    inline
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeFormat={rdpTimeFormat}
                    dateFormat={rdpTimeFormat}
                    timeCaption={timeFormat === '24h' ? '24-hour' : '12-hour'}
                    calendarClassName="dtp-time-only"
                  />
                </div>
              )}
            </div>

            {/* ── Footer: quick-select shortcuts ── */}
            <div className="px-3 py-2 border-t border-gray-100 grid grid-cols-3 gap-1.5">
              {[
                { label: 'Today', offset: 0 },
                { label: 'Tomorrow', offset: 1 },
                { label: 'Next Week', offset: 7 },
              ].map(({ label: btnLabel, offset }) => (
                <button
                  key={btnLabel}
                  type="button"
                  onClick={() => setQuick(offset)}
                  className="py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {btnLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Scoped CSS ── */}
      <style>{`
        .dtp-dropdown { font-family: inherit; }

        /* ─── Left: Calendar ─────────────────────────── */

        .dtp-cal-col { min-width: 260px; }

        .dtp-calendar {
          border: none !important;
          width: 100% !important;
          font-size: 0.8125rem;
        }
        .dtp-calendar .react-datepicker__month-container { width: 100%; }

        /* Calendar header: month name + day-names row */
        .dtp-calendar .react-datepicker__header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 0;
          padding: 0.6rem 0.5rem 0.4rem;
        }
        .dtp-calendar .react-datepicker__current-month {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.4rem;
        }
        .dtp-calendar .react-datepicker__day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin: 0;
        }
        .dtp-calendar .react-datepicker__day-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          text-align: center;
          padding: 0.25rem 0;
          width: auto;
          margin: 0;
        }
        .dtp-calendar .react-datepicker__month { margin: 0.25rem 0; }
        .dtp-calendar .react-datepicker__week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        /* Day cells */
        .dtp-day {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: auto !important;
          margin: 0 !important;
          padding: 0.35rem 0 !important;
          font-size: 0.8rem;
          border-radius: 6px;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dtp-day:hover { background: #eff6ff !important; color: #2563eb !important; }
        .dtp-day--today { background: #dbeafe !important; color: #1d4ed8 !important; font-weight: 700; }
        .dtp-day--selected { background: #2563eb !important; color: #fff !important; font-weight: 700; }
        .dtp-day--selected:hover { background: #1d4ed8 !important; }

        .dtp-calendar .react-datepicker__day--outside-month { color: #cbd5e1; }
        .dtp-calendar .react-datepicker__day--disabled { color: #d1d5db !important; cursor: not-allowed; }
        .dtp-calendar .react-datepicker__day--disabled:hover { background: transparent !important; color: #d1d5db !important; }

        /* Navigation arrows */
        .dtp-calendar .react-datepicker__navigation { top: 0.55rem; }
        .dtp-calendar .react-datepicker__navigation--previous { left: 0.5rem; }
        .dtp-calendar .react-datepicker__navigation--next { right: 0.5rem; }
        .dtp-calendar .react-datepicker__navigation-icon::before {
          border-color: #64748b;
          border-width: 2px 2px 0 0;
          width: 7px; height: 7px;
        }

        /* ─── Right: Time list ────────────────────────── */

        .dtp-time-col { width: 90px; }

        .dtp-time-only {
          border: none !important;
          width: 90px !important;
          font-size: 0.8125rem;
        }
        .dtp-time-only .react-datepicker__time-container {
          float: none;
          width: 90px !important;
          border: none;
        }

        /*
         * KEY ALIGNMENT FIX:
         * The calendar header spans two visual rows (month name + day-names).
         * The time header only has one row ("24-hour" label).
         * We set min-height on the time header to match the calendar header height
         * so the time list items start at the same Y position as the calendar day cells.
         *
         * Calendar header height breakdown (in rem):
         *   padding-top   : 0.6rem
         *   month text    : 0.875rem × 1.5 line-height = 1.3125rem
         *   margin-bottom : 0.4rem
         *   day-names row : (0.7rem × 1.5) + (0.25rem × 2) = 1.55rem
         *   padding-bottom: 0.4rem
         *   border        : ~0.063rem
         *   ──────────────────────────────
         *   Total         : ≈ 4.325rem  → use 4.35rem for safety
         */
        .dtp-time-only .react-datepicker__header--time {
          min-height: 4.35rem;
          display: flex !important;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 0;
          padding: 0 !important;
          gap: 0.2rem;
        }

        /* "24-hour" / "12-hour" caption */
        .dtp-time-only .react-datepicker-time__header {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0;
          line-height: 1;
        }

        .dtp-time-only .react-datepicker__time { border: none; border-radius: 0; }
        .dtp-time-only .react-datepicker__time-box {
          width: 90px !important;
          border-radius: 0;
        }
        .dtp-time-only .react-datepicker__time-list {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          padding: 0 !important;
        }
        .dtp-time-only .react-datepicker__time-list-item {
          font-size: 0.78rem;
          font-weight: 500;
          padding: 0.42rem 0 !important;
          height: auto !important;
          color: #374151;
          text-align: center;
          border-radius: 0 !important;
          transition: background 0.1s;
        }
        .dtp-time-only .react-datepicker__time-list-item:hover {
          background: #eff6ff !important;
          color: #2563eb !important;
        }
        .dtp-time-only .react-datepicker__time-list-item--selected {
          background: #2563eb !important;
          color: #fff !important;
          font-weight: 600;
        }
        .dtp-time-only .react-datepicker__time-list-item--selected:hover {
          background: #1d4ed8 !important;
        }
        .dtp-time-only .react-datepicker__time-list-item--disabled {
          color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
};
