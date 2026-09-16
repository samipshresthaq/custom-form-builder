import React, { memo, useState } from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import './SubmissionResultModal.scss';

export interface SubmissionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, any> | null;
}

export const SubmissionResultModal = memo<SubmissionResultModalProps>(({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Submitted Successfully"
      description="The live form was validated and submitted with the following output payload:"
      maxWidth="lg"
      footer={
        <>
          <Button
            size="sm"
            variant="outline"
            icon={copied ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
            onClick={handleCopy}
          >
            {copied ? 'Copied Output!' : 'Copy JSON'}
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="submit-modal">
        <div className="submit-modal__alert">
          <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
          <span>All required validations passed. Hierarchical nested group values were preserved.</span>
        </div>

        <div className="submit-modal__code">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </Modal>
  );
});

SubmissionResultModal.displayName = 'SubmissionResultModal';
