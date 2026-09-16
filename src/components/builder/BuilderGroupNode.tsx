import React, { memo, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Sliders,
} from 'lucide-react';
import { GroupConfig, FieldType } from '../../types/form';
import { Badge } from '../common/Badge';
import { AddElementMenu } from './AddElementMenu';
import { BuilderElementNode } from './BuilderElementNode';
import './BuilderNode.scss';

export interface BuilderGroupNodeProps {
  group: GroupConfig;
  depth: number;
  isSelected: boolean;
  isCollapsed: boolean;
  isFirst: boolean;
  isLast: boolean;
  selectedElementId: string | null;
  collapsedGroupIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddElement: (type: FieldType | 'group', targetGroupId?: string | null) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const BuilderGroupNode = memo<BuilderGroupNodeProps>(
  ({
    group,
    depth,
    isSelected,
    isCollapsed,
    isFirst,
    isLast,
    selectedElementId,
    collapsedGroupIds,
    onSelect,
    onToggleCollapse,
    onAddElement,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
  }) => {
    const handleHeaderClick = useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect(group.id);
      },
      [group.id, onSelect]
    );

    const handleAddInside = useCallback(
      (type: FieldType | 'group') => {
        onAddElement(type, group.id);
      },
      [group.id, onAddElement]
    );

    const hasChildren = group.elements && group.elements.length > 0;

    return (
      <div className={`builder-group ${isSelected ? 'builder-group--selected' : ''}`}>
        {/* Group Header */}
        <div onClick={handleHeaderClick} className="builder-group__header">
          <div className="builder-group__info">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(group.id);
              }}
              title={isCollapsed ? 'Expand Group' : 'Collapse Group'}
              className="builder-group__toggle-btn"
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>

            <div className="builder-group__icon">
              {isCollapsed ? <Folder size={15} /> : <FolderOpen size={15} />}
            </div>

            <div className="builder-group__meta">
              <div className="builder-group__title-row">
                <span className="builder-group__label">
                  {group.label || 'Untitled Group'}
                </span>
                <Badge variant="purple" size="sm" title="group" />
                <Badge variant="neutral" size="sm" title={`Elements: ${group.elements.length}`} />
              </div>
              <div className="builder-group__name">
                namespace: <span>{group.name}</span>
              </div>
            </div>
          </div>

          {/* Group Header Actions */}
          <div className="builder-group__actions">
            <AddElementMenu onAdd={handleAddInside} label="Add" size="xs" variant="outline" />

            <button
              type="button"
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(group.id);
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
                onMoveDown(group.id);
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
                onDuplicate(group.id);
              }}
              title="Duplicate Group (with children)"
              className="builder-field__btn"
            >
              <Copy size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(group.id);
              }}
              title="Configure Group"
              className={`builder-field__btn ${isSelected ? 'builder-field__btn--active' : ''}`}
            >
              <Sliders size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(group.id);
              }}
              title="Delete Group"
              className="builder-field__btn builder-field__btn--delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Group Children Content */}
        {!isCollapsed && (
          <div className="builder-group__body">
            {hasChildren ? (
              <div className="builder-group__children">
                {group.elements.map((childElement, idx) => (
                  <BuilderElementNode
                    key={childElement.id}
                    element={childElement}
                    depth={depth + 1}
                    isFirst={idx === 0}
                    isLast={idx === group.elements.length - 1}
                    selectedElementId={selectedElementId}
                    collapsedGroupIds={collapsedGroupIds}
                    onSelect={onSelect}
                    onToggleCollapse={onToggleCollapse}
                    onAddElement={onAddElement}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="builder-group__empty">
                <p>This group has no fields yet</p>
                <AddElementMenu onAdd={handleAddInside} label="Add to Group" size="xs" variant="secondary" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

