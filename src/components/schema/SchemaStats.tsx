import React, { memo } from 'react';
import { Type, Hash, FolderTree, Layers } from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import './SchemaStats.scss';

export const SchemaStats = memo(() => {
  const { statistics } = useFormBuilder();

  return (
    <div className="schema-stats">
      <div className="schema-stats__item" title="Total Form Fields">
        <Layers size={14} style={{ color: '#94a3b8' }} />
        <span className="schema-stats__value">{statistics.fieldsCount}</span>
        <span>fields</span>
      </div>

      <span className="schema-stats__divider">•</span>

      <div className="schema-stats__item" title="Text Fields">
        <Type size={14} style={{ color: '#3b82f6' }} />
        <span className="schema-stats__value">{statistics.textCount}</span>
      </div>

      <div className="schema-stats__item" title="Number Fields">
        <Hash size={14} style={{ color: '#10b981' }} />
        <span className="schema-stats__value">{statistics.numberCount}</span>
      </div>

      <span className="schema-stats__divider">•</span>

      <div className="schema-stats__item" title="Nested Groups">
        <FolderTree size={14} style={{ color: '#8b5cf6' }} />
        <span className="schema-stats__value">{statistics.groupsCount}</span>
        <span>groups (depth: {statistics.maxDepth})</span>
      </div>
    </div>
  );
});

SchemaStats.displayName = 'SchemaStats';
