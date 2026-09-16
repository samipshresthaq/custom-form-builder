import React, { memo, useCallback } from 'react';
import { Type, Hash, ArrowUp, ArrowDown, Copy, Trash2, Sliders } from 'lucide-react';
import { FieldConfig } from '../../types/form';
import { Badge } from '../common/Badge';
import './BuilderNode.scss';

export interface BuilderFieldNodeProps {
  field: FieldConfig;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const BuilderFieldNode = memo<BuilderFieldNodeProps>(
  ({
    field,
    isSelected,
    isFirst,
    isLast,
    onSelect,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
  }) => {
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect(field.id);
      },
      [field.id, onSelect]
    );

    const isText = field.type === 'text';
    const hasRequired = field.validation?.required;

    return (
      <div
        onClick={handleCardClick}
        className={`builder-field ${isSelected ? 'builder-field--selected' : ''}`}
      >
        <div className="builder-field__main">
          {/* Field info */}
          <div className="builder-field__info">
            <div
              className={`builder-field__icon ${
                isText ? 'builder-field__icon--text' : 'builder-field__icon--number'
              }`}
            >
              {isText ? <Type size={15} /> : <Hash size={15} />}
            </div>

            <div className="builder-field__meta">
              <div className="builder-field__title-row">
                <span className="builder-field__label">
                  {field.label || 'Untitled Field'}
                </span>
                {hasRequired && (
                  <span className="builder-field__required" title="Required field">
                    *
                  </span>
                )}
              </div>
              <div className="builder-field__name">
                name: <span>{field.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="builder-field__actions">
            <button
              type="button"
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(field.id);
              }}
              title="Move Up"
              className="builder-field__btn"
            >
              <ArrowUp size={14} />
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(field.id);
              }}
              title="Move Down"
              className="builder-field__btn"
            >
              <ArrowDown size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(field.id);
              }}
              title="Duplicate Field"
              className="builder-field__btn"
            >
              <Copy size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(field.id);
              }}
              title="Configure Field"
              className={`builder-field__btn ${isSelected ? 'builder-field__btn--active' : ''}`}
            >
              <Sliders size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(field.id);
              }}
              title="Delete Field"
              className="builder-field__btn builder-field__btn--delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Validation & Tag summary */}
        <div className="builder-field__badges">
          <Badge variant={isText ? 'blue' : 'green'} size="sm" title={isText ? 'text input' : 'number input'} />

          {hasRequired && (
            <Badge variant="amber" size="sm" title="required" />
          )}

          {isText && field.validation?.minLength !== undefined && (
            <Badge variant="neutral" size="sm" title={`min: ${field.validation.minLength}`} />
          )}

          {isText && field.validation?.maxLength !== undefined && (
            <Badge variant="neutral" size="sm" title={`max: ${field.validation.maxLength}`} />
          )}

          {!isText && field.validation?.min !== undefined && (
            <Badge variant="neutral" size="sm" title={`min: ${field.validation.min}`} />
          )}

          {!isText && field.validation?.max !== undefined && (
            <Badge variant="neutral" size="sm" title={`max: ${field.validation.max}`} />
          )}

          {field.disabled && (
            <Badge variant="neutral" size="sm" title="disabled" />
          )}

          {field.readOnly && (
            <Badge variant="neutral" size="sm" title="read-only" />
          )}
        </div>
      </div>
    );
  }
);

BuilderFieldNode.displayName = 'BuilderFieldNode';
