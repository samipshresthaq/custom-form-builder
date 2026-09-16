import React, { memo, useCallback } from 'react';
import {
  Type,
  Hash,
  FolderPlus,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
} from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { BuilderElementNode } from './BuilderElementNode';
import { AddElementMenu } from './AddElementMenu';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import './BuilderCanvas.scss';

export const BuilderCanvas: React.FC = memo(() => {
  const {
    schema,
    selectedElementId,
    collapsedGroupIds,
    updateTitle,
    updateDescription,
    addElement,
    removeElement,
    moveElement,
    duplicateElement,
    selectElement,
    toggleGroupCollapse,
    loadTemplate,
  } = useFormBuilder();

  const handleAddRoot = useCallback(
    (type: 'text' | 'number' | 'group') => {
      addElement(type, null);
    },
    [addElement]
  );

  const hasElements = schema.elements.length > 0;

  return (
    <div className="builder-canvas">
      {/* Form Metadata Header */}
      <div className="builder-canvas__header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="text"
            value={schema.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Enter Form Title..."
            className="form-field__input"
            style={{ fontWeight: 600, fontSize: '15px', padding: '4px 8px', marginBottom: '4px' }}
          />
          <input
            type="text"
            value={schema.description || ''}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder="Add an optional form description or instructions..."
            className="form-field__input"
            style={{ fontSize: '12px', padding: '3px 8px', color: '#64748b' }}
          />
        </div>
      </div>

      {/* Quick Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <AddElementMenu onAdd={handleAddRoot} label="Add to Form" size="sm" variant="primary" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Structure</span>
          <Badge variant="neutral" size="sm" title={`${schema.elements.length} root item${schema.elements.length === 1 ? '' : 's'}`} />
        </div>
      </div>

      {/* Canvas Elements Area */}
      <div className="builder-canvas__content">
        {!hasElements ? (
          <div className="builder-canvas__empty">
            <div className="builder-canvas__empty-icon">
              <FileSpreadsheet size={22} />
            </div>
            <h3 className="builder-canvas__empty-title">Your Form Structure is Empty</h3>
            <p className="builder-canvas__empty-desc">
              Start by adding text inputs, number inputs, or nested group containers to construct your form.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
              <Button
                size="sm"
                variant="outline"
                icon={<Type size={13} />}
                onClick={() => handleAddRoot('text')}
              >
                Add Text Input
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Hash size={13} />}
                onClick={() => handleAddRoot('number')}
              >
                Add Number Input
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<FolderPlus size={13} />}
                onClick={() => handleAddRoot('group')}
              >
                Add Nested Group
              </Button>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
              Or load a pre-built example:{' '}
              <button
                type="button"
                onClick={() => loadTemplate('employeeOnboarding')}
                style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                Employee Onboarding
              </button>
            </div>
          </div>
        ) : (
          <div className="builder-canvas__elements-list">
            {schema.elements.map((element, index) => (
              <BuilderElementNode
                key={element.id}
                element={element}
                depth={0}
                isFirst={index === 0}
                isLast={index === schema.elements.length - 1}
                selectedElementId={selectedElementId}
                collapsedGroupIds={collapsedGroupIds}
                onSelect={selectElement}
                onToggleCollapse={toggleGroupCollapse}
                onAddElement={addElement}
                onMoveUp={(id) => moveElement(id, 'up')}
                onMoveDown={(id) => moveElement(id, 'down')}
                onDuplicate={duplicateElement}
                onDelete={removeElement}
              />
            ))}

            {/* Bottom Add Bar */}
            <div className="builder-canvas__footer-add">
              <AddElementMenu
                onAdd={handleAddRoot}
                label="Add Item to Root"
                size="sm"
                variant="dashed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BuilderCanvas.displayName = 'BuilderCanvas';
