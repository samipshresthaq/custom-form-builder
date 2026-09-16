import React, { memo } from 'react';
import { GroupConfig } from '../../types/form';
import { RenderField } from './RenderField';
import { getNestedValue } from '../../utils/validation';
import './RenderGroup.scss';

export interface RenderGroupProps {
  group: GroupConfig;
  parentPath?: string;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onChange: (path: string, value: any) => void;
  onBlur: (path: string) => void;
  depth?: number;
}

export const RenderGroup = memo<RenderGroupProps>(
  ({ group, parentPath = '', formData, errors, onChange, onBlur, depth = 0 }) => {
    const currentGroupPath = parentPath ? `${parentPath}.${group.name}` : group.name;

    return (
      <fieldset className="preview-group">
        {/* Group Legend / Header */}
        <legend className="preview-group__legend">
          {group.label}
        </legend>

        {group.description && (
          <p className="preview-group__description">{group.description}</p>
        )}

        <div className="preview-group__content">
          {group.elements.map((element) => {
            const elementPath = `${currentGroupPath}.${element.name}`;

            if (element.type === 'group') {
              return (
                <RenderGroup
                  key={element.id}
                  group={element}
                  parentPath={currentGroupPath}
                  formData={formData}
                  errors={errors}
                  onChange={onChange}
                  onBlur={onBlur}
                  depth={depth + 1}
                />
              );
            }

            const val = getNestedValue(formData, elementPath);
            const err = errors[elementPath];

            return (
              <RenderField
                key={element.id}
                field={element}
                path={elementPath}
                value={val}
                error={err}
                onChange={onChange}
                onBlur={onBlur}
              />
            );
          })}
        </div>
      </fieldset>
    );
  }
);

