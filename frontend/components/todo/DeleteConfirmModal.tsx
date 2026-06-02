'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Delete Todo"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Delete"
      isConfirming={isLoading}
      isDanger={true}
    >
      <p className="text-gray-600">
        Are you sure you want to delete this todo? This action cannot be undone.
      </p>
    </Modal>
  );
}
