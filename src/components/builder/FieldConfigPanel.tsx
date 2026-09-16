import React, { memo, useCallback } from 'react';
import {
  Type,
  Hash,
  Folder,
  Sliders,
  Trash2,
  Copy,
} from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FieldConfig, GroupConfig, TextFieldConfig, NumberFieldConfig } from '../../types/form';
import { Input } from '../common/Input';
import { Toggle } from '../common/Toggle';
import { Button } from '../common/Button';
import { sanitizeFieldName } from '../../utils/schemaUtils';
import './FieldConfigPanel.scss';

export const FieldConfigPanel: React.FC = memo(() => {
  const {
    selectedElement,
    updateField,
    updateGroup,
    removeElement,
    duplicateElement,
    addElement,
  } = useFormBuilder();

  // Callbacks for updating properties
  const handleUpdate = useCallback(
    (fieldKey: string, val: any) => {
      if (!selectedElement) return;
      if (selectedElement.type === 'group') {
        updateGroup(selectedElement.id, { [fieldKey]: val });
      } else {
        updateField(selectedElement.id, { [fieldKey]: val });
      }
    },
    [selectedElement, updateField, updateGroup]
  );

  const handleValidationUpdate = useCallback(
    (valKey: string, val: any) => {
      if (!selectedElement || selectedElement.type === 'group') return;
      const currentValidation = selectedElement.validation || {};
      updateField(selectedElement.id, {
        validation: {
          ...currentValidation,
          [valKey]: val,
        },
      });
    },
    [selectedElement, updateField]
  );

  if (!selectedElement) {
    return (
      <div className="config-panel">
        <div className="config-panel__empty">
          <div className="config-panel__empty-icon">
            <Sliders size={22} />
          </div>
          <h4 className="config-panel__empty-title">No Element Selected</h4>
          <p className="config-panel__empty-desc">
            Click on any text input, number input, or nested group in the builder canvas to configure its settings.
          </p>
        </div>
      </div>
    );
  }

  const isGroup = selectedElement.type === 'group';
  const isText = selectedElement.type === 'text';
  const isNumber = selectedElement.type === 'number';

  return (
    <div className="config-panel">
      {/* Panel Header */}
      <div className="config-panel__header">
        <div className="config-panel__header-left">
          <div
            className={`add-menu__icon-box ${
              isGroup
                ? 'add-menu__icon-box--group'
                : isText
                ? 'add-menu__icon-box--text'
                : 'add-menu__icon-box--number'
            }`}
          >
            {isGroup ? (
              <Folder size={15} />
            ) : isText ? (
              <Type size={15} />
            ) : (
              <Hash size={15} />
            )}
          </div>
          <div>
            <h4 className="config-panel__header-title">
              {isGroup ? 'Configure Group' : `Configure ${isText ? 'Text' : 'Number'} Input`}
            </h4>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
              ID: {selectedElement.id}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => duplicateElement(selectedElement.id)}
            title="Duplicate"
            className="builder-field__btn"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => removeElement(selectedElement.id)}
            title="Delete"
            className="builder-field__btn builder-field__btn--delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Panel Body Scrollable */}
      <div className="config-panel__content">
        {/* GROUP CONFIGURATION */}
        {isGroup && (
          <>
            <div className="config-panel__section">
              <h5 className="config-panel__section-title">Group Settings</h5>

              <Input
                label="Group Label (Display Header)"
                value={selectedElement.label}
                onChange={(e) => handleUpdate('label', e.target.value)}
                placeholder="e.g. Contact Details"
              />

              <Input
                label="Group Namespace (JSON Key)"
                value={selectedElement.name}
                onChange={(e) => handleUpdate('name', sanitizeFieldName(e.target.value))}
                placeholder="e.g. contactDetails"
                helperText="This forms the nested object key in output data: { contactDetails: { ... } }"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                  Group Description
                </label>
                <textarea
                  rows={2}
                  value={(selectedElement as GroupConfig).description || ''}
                  onChange={(e) => handleUpdate('description', e.target.value)}
                  placeholder="Optional brief description for this section..."
                  className="form-field__input"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="config-panel__section">
              <h5 className="config-panel__section-title">Quick Actions for this Group</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Type size={13} />}
                  onClick={() => addElement('text', selectedElement.id)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Add Text Input Inside Group
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Hash size={13} />}
                  onClick={() => addElement('number', selectedElement.id)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Add Number Input Inside Group
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Folder size={13} />}
                  onClick={() => addElement('group', selectedElement.id)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Add Sub-Group Inside Group
                </Button>
              </div>
            </div>
          </>
        )}

        {/* FIELD CONFIGURATION (TEXT & NUMBER) */}
        {!isGroup && (
          <>
            {/* General Attributes */}
            <div className="config-panel__section">
              <h5 className="config-panel__section-title">Field Properties</h5>

              <Input
                label="Field Label"
                value={selectedElement.label}
                onChange={(e) => handleUpdate('label', e.target.value)}
                placeholder="e.g. Email Address"
                isRequired
              />

              <Input
                label="Field Name (JSON Property Key)"
                value={selectedElement.name}
                onChange={(e) => handleUpdate('name', sanitizeFieldName(e.target.value))}
                placeholder="e.g. emailAddress"
                helperText="Must be unique within parent group"
                isRequired
              />

              <Input
                label="Placeholder"
                value={selectedElement.placeholder || ''}
                onChange={(e) => handleUpdate('placeholder', e.target.value)}
                placeholder="e.g. user@example.com"
              />

              {isText && (
                <Input
                  label="Default Value"
                  value={(selectedElement as TextFieldConfig).defaultValue || ''}
                  onChange={(e) => handleUpdate('defaultValue', e.target.value)}
                  placeholder="Optional initial text"
                />
              )}

              {isNumber && (
                <Input
                  type="number"
                  label="Default Value"
                  value={
                    (selectedElement as NumberFieldConfig).defaultValue !== undefined
                      ? (selectedElement as NumberFieldConfig).defaultValue
                      : ''
                  }
                  onChange={(e) =>
                    handleUpdate('defaultValue', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="e.g. 0"
                />
              )}

              <Input
                label="Helper / Hint Text"
                value={selectedElement.helperText || ''}
                onChange={(e) => handleUpdate('helperText', e.target.value)}
                placeholder="e.g. We will never share your email."
              />
            </div>

            {/* Validation Rules */}
            <div className="config-panel__section">
              <h5 className="config-panel__section-title">Validation Rules</h5>

              {/* Required Switch */}
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Toggle
                  id="toggle-required"
                  label="Required Field"
                  description="User must fill this before submitting"
                  checked={Boolean((selectedElement as FieldConfig).validation?.required)}
                  onChange={(checked) => handleValidationUpdate('required', checked)}
                />

                {(selectedElement as FieldConfig).validation?.required && (
                  <Input
                    label="Custom Required Error Message"
                    value={(selectedElement as FieldConfig).validation?.requiredMessage || ''}
                    onChange={(e) => handleValidationUpdate('requiredMessage', e.target.value)}
                    placeholder={`${selectedElement.label} is required`}
                  />
                )}
              </div>

              {/* Text specific validations */}
              {isText && (
                <>
                  <div className="config-panel__grid-2">
                    <Input
                      type="number"
                      label="Min Length"
                      min={0}
                      value={(selectedElement as TextFieldConfig).validation?.minLength ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate(
                          'minLength',
                          e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        )
                      }
                      placeholder="e.g. 3"
                    />
                    <Input
                      type="number"
                      label="Max Length"
                      min={0}
                      value={(selectedElement as TextFieldConfig).validation?.maxLength ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate(
                          'maxLength',
                          e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        )
                      }
                      placeholder="e.g. 100"
                    />
                  </div>
                </>
              )}

              {/* Number specific validations */}
              {isNumber && (
                <>
                  <div className="config-panel__grid-2">
                    <Input
                      type="number"
                      label="Minimum Value"
                      value={(selectedElement as NumberFieldConfig).validation?.min ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate(
                          'min',
                          e.target.value === '' ? undefined : Number(e.target.value)
                        )
                      }
                      placeholder="e.g. 0"
                    />
                    <Input
                      type="number"
                      label="Maximum Value"
                      value={(selectedElement as NumberFieldConfig).validation?.max ?? ''}
                      onChange={(e) =>
                        handleValidationUpdate(
                          'max',
                          e.target.value === '' ? undefined : Number(e.target.value)
                        )
                      }
                      placeholder="e.g. 100"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Field State / UI Flags */}
            <div className="config-panel__section">
              <h5 className="config-panel__section-title">State & Modifiers</h5>
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Toggle
                  id="toggle-disabled"
                  label="Disabled"
                  description="Field cannot be interacted with or focused"
                  checked={Boolean((selectedElement as FieldConfig).disabled)}
                  onChange={(checked) => handleUpdate('disabled', checked)}
                />
                <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
                <Toggle
                  id="toggle-readonly"
                  label="Read Only"
                  description="Value can be viewed but not changed"
                  checked={Boolean((selectedElement as FieldConfig).readOnly)}
                  onChange={(checked) => handleUpdate('readOnly', checked)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

FieldConfigPanel.displayName = 'FieldConfigPanel';
