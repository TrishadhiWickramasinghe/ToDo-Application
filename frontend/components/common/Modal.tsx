'use client';

import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  isDanger = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in-50 duration-200 scale-95 animate-out">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
          <div className="mb-6 text-gray-600">{children}</div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={isDanger ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={isConfirming}
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
