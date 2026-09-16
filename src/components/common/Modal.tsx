import React, { useEffect, memo } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal = memo<ModalProps>(
  ({ isOpen, onClose, title, description, children, footer, maxWidth = 'lg' }) => {
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        {/* Backdrop */}
        <div
          className="modal-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal dialog */}
        <div
          className={`modal-dialog modal-dialog--${maxWidth}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="modal-dialog__header">
            <div>
              <h3 className="modal-dialog__title">{title}</h3>
              {description && <p className="modal-dialog__description">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="modal-dialog__close-btn"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-dialog__content">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="modal-dialog__footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
