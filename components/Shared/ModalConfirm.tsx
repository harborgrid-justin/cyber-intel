
import React from 'react';
import Modal from './Modal';
import { Button } from './UI';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-300">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} variant="secondary">{cancelText}</Button>
          <Button onClick={() => { onConfirm(); onClose(); }} variant={isDanger ? 'danger' : 'primary'}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
