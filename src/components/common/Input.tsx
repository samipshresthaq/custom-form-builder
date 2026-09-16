import React, { memo, forwardRef } from 'react';
import './Input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    ({ label, helperText, error, isRequired, id, className = '', disabled, ...props }, ref) => {
      const inputId = id || props.name;

      return (
        <div className="form-field">
          {label && (
            <label htmlFor={inputId} className="form-field__label">
              <span>{label}</span>
              {isRequired && <span className="form-field__required">*</span>}
            </label>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`form-field__input ${error ? 'form-field__input--error' : ''} ${className}`}
            {...props}
          />

          {error ? (
            <p className="form-field__error">{error}</p>
          ) : helperText ? (
            <p className="form-field__helper">{helperText}</p>
          ) : null}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
