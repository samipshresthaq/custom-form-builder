import React, { memo } from 'react';
import { FormElement, FieldType } from '../../types/form';
import { BuilderFieldNode } from './BuilderFieldNode';
import { BuilderGroupNode } from './BuilderGroupNode';

export interface BuilderElementNodeProps {
  element: FormElement;
  depth?: number;
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

export const BuilderElementNode = memo<BuilderElementNodeProps>(
  ({
    element,
    depth = 0,
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
    const isSelected = selectedElementId === element.id;

    if (element.type === 'group') {
      const isCollapsed = collapsedGroupIds.has(element.id);
      return (
        <BuilderGroupNode
          group={element}
          depth={depth}
          isSelected={isSelected}
          isCollapsed={isCollapsed}
          isFirst={isFirst}
          isLast={isLast}
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
      );
    }

    return (
      <BuilderFieldNode
        field={element}
        isSelected={isSelected}
        isFirst={isFirst}
        isLast={isLast}
        onSelect={onSelect}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }
);

