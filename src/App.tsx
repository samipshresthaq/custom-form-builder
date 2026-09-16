import React, { useState, useEffect } from 'react';
import { FormBuilderProvider, useFormBuilder } from './context/FormBuilderContext';
import { BuilderHeader, type ViewLayoutMode } from './components/builder/BuilderHeader';
import { BuilderCanvas } from './components/builder/BuilderCanvas';
import { FieldConfigPanel } from './components/builder/FieldConfigPanel';
import { LiveFormPreview } from './components/preview/LiveFormPreview';
import './App.scss';

const FormBuilderContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewLayoutMode>('split');
  const { undo, redo, canUndo, canRedo, selectElement } = useFormBuilder();

  // Keyboard shortcuts for Undo (Cmd+Z / Ctrl+Z), Redo (Cmd+Y / Ctrl+Y), Deselect (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input or textarea, let normal text undo/typing happen
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      if (e.key === 'Escape') {
        selectElement(null);
        return;
      }

      const isModifier = e.metaKey || e.ctrlKey;
      if (isModifier && !isInput) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          if (canRedo) redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, selectElement]);

  return (
    <div className="app-root">
      {/* Top Application Header */}
      <BuilderHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Main Workspace Area */}
      <main className="app-workspace">
        <div className="workspace-container">
          {/* SPLIT VIEW (Builder & Live Preview side by side) */}
          {viewMode === 'split' && (
            <div className="split-view">
              {/* Left Column: Form Builder Canvas + Config Panel */}
              <div className="split-view__builder-pane">
                <div className="split-view__canvas-col">
                  <BuilderCanvas />
                </div>
                <div className="split-view__config-col">
                  <FieldConfigPanel />
                </div>
              </div>

              {/* Right Column: Live Form Preview */}
              <div className="split-view__preview-col">
                <LiveFormPreview />
              </div>
            </div>
          )}

          {/* BUILDER CANVAS ONLY VIEW */}
          {viewMode === 'builder' && (
            <div className="builder-only-view">
              <div className="builder-only-view__canvas-col">
                <BuilderCanvas />
              </div>
              <div className="builder-only-view__config-col">
                <FieldConfigPanel />
              </div>
            </div>
          )}

          {/* LIVE PREVIEW ONLY VIEW */}
          {viewMode === 'preview' && (
            <div className="preview-only-view">
              <LiveFormPreview />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <FormBuilderProvider>
      <FormBuilderContent />
    </FormBuilderProvider>
  );
}
