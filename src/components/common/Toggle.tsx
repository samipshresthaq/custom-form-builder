import React, { memo } from 'react';
import './Toggle.scss';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle = memo<ToggleProps>(
  ({ id, checked, onChange, label, description, disabled = false }) => {
    return (
      <label
        htmlFor={id}
        className={`toggle-wrapper ${disabled ? 'toggle-wrapper--disabled' : ''}`}
      >
        {(label || description) && (
          <div className="toggle-wrapper__content">
            {label && <span className="toggle-wrapper__label">{label}</span>}
            {description && <span className="toggle-wrapper__description">{description}</span>}
          </div>
        )}
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={`toggle-wrapper__switch ${checked ? 'toggle-wrapper__switch--checked' : ''}`}
        >
          <span
            className={`toggle-wrapper__thumb ${checked ? 'toggle-wrapper__thumb--checked' : ''}`}
          />
        </button>
      </label>
    );
  }
);

