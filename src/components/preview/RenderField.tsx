import React, { memo, useCallback } from 'react';
import { FieldConfig } from '../../types/form';
import { Input } from '../common/Input';
import './RenderField.scss';

export interface RenderFieldProps {
  field: FieldConfig;
  path: string;
  value: any;
  error?: string;
  onChange: (path: string, value: any) => void;
  onBlur: (path: string) => void;
}

export const RenderField = memo<RenderFieldProps>(
  ({ field, path, value, error, onChange, onBlur }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (field.type === 'number') {
          const val = e.target.value === '' ? '' : Number(e.target.value);
          onChange(path, val);
        } else {
          onChange(path, e.target.value);
        }
      },
      [field.type, onChange, path]
    );

    const handleBlur = useCallback(() => {
      onBlur(path);
    }, [onBlur, path]);

    const isText = field.type === 'text';
    const isNumber = field.type === 'number';

    return (
      <div className="preview-field-container" style={{ width: '100%' }}>
        <Input
          id={`render_${path}`}
          name={path}
          type={isNumber ? 'number' : 'text'}
          label={field.label}
          placeholder={field.placeholder}
          helperText={field.helperText}
          error={error}
          isRequired={Boolean(field.validation?.required)}
          disabled={field.disabled}
          readOnly={field.readOnly}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          // HTML validation attributes to sync with schema
          min={isNumber ? field.validation?.min : undefined}
          max={isNumber ? field.validation?.max : undefined}
          minLength={isText ? field.validation?.minLength : undefined}
          maxLength={isText ? field.validation?.maxLength : undefined}
        />
      </div>
    );
  }
);

