'use client';

import React, { useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedImage {
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  error?: string;
}

// ─── Accepted types ───────────────────────────────────────────────────────────

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_LABEL = 'JPG, PNG, WEBP, GIF';

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageUploader({
  images,
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  disabled = false,
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error ?? localError;

  // ── File processing ────────────────────────────────────────────────────────

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      setLocalError(null);

      const remaining = maxFiles - images.length;
      if (remaining <= 0) {
        setLocalError(`Maximum ${maxFiles} image${maxFiles !== 1 ? 's' : ''} allowed.`);
        return;
      }

      const incoming = Array.from(fileList).slice(0, remaining);
      const valid: UploadedImage[] = [];
      const errors: string[] = [];

      for (const file of incoming) {
        if (!ACCEPTED.includes(file.type)) {
          errors.push(`"${file.name}" is not a supported image type.`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`"${file.name}" exceeds the ${maxSizeMB} MB limit.`);
          continue;
        }
        valid.push({ file, previewUrl: URL.createObjectURL(file) });
      }

      if (errors.length) setLocalError(errors[0]);
      if (valid.length) onChange([...images, ...valid]);
    },
    [images, maxFiles, maxSizeMB, onChange]
  );

  // ── Remove ─────────────────────────────────────────────────────────────────

  const remove = (index: number) => {
    const next = [...images];
    URL.revokeObjectURL(next[index].previewUrl); // free memory
    next.splice(index, 1);
    onChange(next);
    setLocalError(null);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const canAdd = images.length < maxFiles && !disabled;

  return (
    <div className="space-y-3">
      {/* ── Drop-zone ── */}
      <div
        role="button"
        tabIndex={canAdd ? 0 : -1}
        aria-disabled={!canAdd}
        onClick={() => canAdd && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && canAdd && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'relative border-2 border-dashed rounded-xl px-6 py-8 text-center transition-all duration-200',
          canAdd ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
          dragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : displayError
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50',
        ].join(' ')}
      >
        {/* Cloud upload icon */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
            ${dragOver ? 'bg-blue-100' : 'bg-white shadow-sm border border-gray-200'}`}>
            <svg className={`w-6 h-6 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">
              {dragOver ? 'Drop images here' : (
                <>
                  <span className="text-blue-600">Click to upload</span>
                  {' '}or drag &amp; drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {ACCEPTED_LABEL} · max {maxSizeMB} MB per file · up to {maxFiles} image{maxFiles !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Badge showing current count */}
          {images.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {images.length} / {maxFiles} added
            </span>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          className="sr-only"
          disabled={!canAdd}
          onChange={(e) => processFiles(e.target.files)}
          // Reset value so same file can be re-selected after removal
          onClick={(e) => ((e.target as HTMLInputElement).value = '')}
        />
      </div>

      {/* ── Error message ── */}
      {displayError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {displayError}
        </p>
      )}

      {/* ── Image previews ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.previewUrl}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.file.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Overlay with filename + size */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] font-medium truncate">{img.file.name}</p>
                <p className="text-white/70 text-[9px]">
                  {(img.file.size / 1024).toFixed(0)} KB
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                disabled={disabled}
                title="Remove image"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Index label */}
              <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
