import React, { useState, useRef, useEffect, memo } from 'react';
import { Plus, Type, Hash, FolderPlus, ChevronDown } from 'lucide-react';
import { FieldType } from '../../types/form';
import './AddElementMenu.scss';

export interface AddElementMenuProps {
  onAdd: (type: FieldType | 'group') => void;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'outline' | 'dashed';
  disabled?: boolean;
}

export const AddElementMenu = memo<AddElementMenuProps>(
  ({ onAdd, label = 'Add Element', size = 'sm', variant = 'secondary', disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (type: FieldType | 'group') => {
      onAdd(type);
      setIsOpen(false);
    };

    return (
      <div className="add-menu" ref={menuRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`add-menu__trigger add-menu__trigger--${size} add-menu__trigger--${variant}`}
        >
          <Plus size={14} />
          <span>{label}</span>
          <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {isOpen && (
          <div className="add-menu__dropdown">
            <div className="add-menu__section-title">Field Types</div>

            <button
              type="button"
              onClick={() => handleSelect('text')}
              className="add-menu__item"
            >
              <div className="add-menu__icon-box add-menu__icon-box--text">
                <Type size={14} />
              </div>
              <div>
                <div className="add-menu__item-title">Text Input</div>
                <div className="add-menu__item-desc">Single line text input field</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelect('number')}
              className="add-menu__item"
            >
              <div className="add-menu__icon-box add-menu__icon-box--number">
                <Hash size={14} />
              </div>
              <div>
                <div className="add-menu__item-title">Number Input</div>
                <div className="add-menu__item-desc">Numeric input with min, & max</div>
              </div>
            </button>

            <div className="add-menu__divider" />
            <div className="add-menu__section-title">Container</div>

            <button
              type="button"
              onClick={() => handleSelect('group')}
              className="add-menu__item"
            >
              <div className="add-menu__icon-box add-menu__icon-box--group">
                <FolderPlus size={14} />
              </div>
              <div>
                <div className="add-menu__item-title">Nested Group</div>
                <div className="add-menu__item-desc">Hierarchical container for fields & groups</div>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }
);

AddElementMenu.displayName = 'AddElementMenu';
