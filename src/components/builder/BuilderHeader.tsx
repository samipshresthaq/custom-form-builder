import React, { memo, useState } from 'react';
import {
  Download,
  Upload,
  Columns,
  Layout,
  Eye,
  FileCode2,
} from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { Button } from '../common/Button';
import { SchemaStats } from '../schema/SchemaStats';
import { JsonSchemaModal } from '../schema/JsonSchemaModal';
import './BuilderHeader.scss';

export type ViewLayoutMode = 'split' | 'builder' | 'preview';

export interface BuilderHeaderProps {
  viewMode: ViewLayoutMode;
  onViewModeChange: (mode: ViewLayoutMode) => void;
}

export const BuilderHeader = memo<BuilderHeaderProps>(
  ({ viewMode, onViewModeChange }) => {
    const { canUndo, canRedo, undo, redo, loadTemplate, clearForm } = useFormBuilder();
    const [jsonModalState, setJsonModalState] = useState<{
      isOpen: boolean;
      tab: 'export' | 'import';
    }>({ isOpen: false, tab: 'export' });

    return (
      <header className="builder-header">
        <div className="builder-header__inner">
          {/* Left: Brand & Template Selector */}
          <div className="builder-header__brand-group">
            <div className="builder-header__brand">
              <div className="builder-header__logo">
                <FileCode2 size={16} />
              </div>
              <div>
                <h1 className="builder-header__app-title">
                  Configurable Form Builder
                </h1>
                <p className="builder-header__app-subtitle">
                  Construct, nest groups, preview live & schema JSON
                </p>
              </div>
            </div>

            {/* Template dropdown */}
            <div className="builder-header__template-picker">
              <label htmlFor="template-select">Template:</label>
              <select
                id="template-select"
                aria-label="Select form template"
                onChange={(e) => {
                  if (e.target.value === 'clear') {
                    clearForm();
                  } else if (e.target.value) {
                    loadTemplate(e.target.value);
                  }
                }}
                defaultValue="blank"
              >
                <option value="employeeOnboarding">Employee Onboarding (Nested)</option>
                <option value="simpleFeedback">Customer Feedback</option>
                <option value="blank">Blank Form</option>
              </select>
            </div>
          </div>

          {/* Middle: Stats */}
          <SchemaStats />

          {/* Right: Actions (Undo, Redo, JSON Export/Import, View Mode) */}
          <div className="builder-header__actions">

            {/* JSON Import & Export */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                size="xs"
                variant="outline"
                icon={<Upload size={12} />}
                onClick={() => setJsonModalState({ isOpen: true, tab: 'import' })}
              >
                Import JSON
              </Button>
              <Button
                size="xs"
                variant="secondary"
                icon={<Download size={12} />}
                onClick={() => setJsonModalState({ isOpen: true, tab: 'export' })}
              >
                Export JSON
              </Button>
            </div>

            {/* View Layout Switcher */}
            <div className="builder-header__view-group">
              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                title="Split View (Builder + Live Preview)"
                className={`builder-header__view-btn ${viewMode === 'split' ? 'builder-header__view-btn--active' : ''}`}
              >
                <Columns size={13} />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('builder')}
                title="Builder Canvas Only"
                className={`builder-header__view-btn ${viewMode === 'builder' ? 'builder-header__view-btn--active' : ''}`}
              >
                <Layout size={13} />
                <span>Builder</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('preview')}
                title="Live Preview Only"
                className={`builder-header__view-btn ${viewMode === 'preview' ? 'builder-header__view-btn--active' : ''}`}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* JSON Schema Modal */}
        <JsonSchemaModal
          isOpen={jsonModalState.isOpen}
          onClose={() => setJsonModalState((prev) => ({ ...prev, isOpen: false }))}
          defaultTab={jsonModalState.tab}
        />
      </header>
    );
  }
);

BuilderHeader.displayName = 'BuilderHeader';
