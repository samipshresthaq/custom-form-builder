import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { FormElement, FormSchema, FieldConfig, GroupConfig, FieldType } from '../types/form';
import {
  createDefaultTextField,
  createDefaultNumberField,
  createDefaultGroup,
  addElementToTree,
  updateElementInTree,
  removeElementFromTree,
  moveElementInTree,
  duplicateElementInTree,
  findElementById,
  getTreeStatistics,
} from '../utils/schemaUtils';
import { TEMPLATES } from '../utils/templates';

interface FormBuilderContextType {
  schema: FormSchema;
  selectedElementId: string | null;
  selectedElement: FormElement | null;
  collapsedGroupIds: Set<string>;
  statistics: ReturnType<typeof getTreeStatistics>;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  addElement: (type: FieldType | 'group', targetGroupId?: string | null) => void;
  updateField: (id: string, updater: Partial<FieldConfig> | ((prev: FieldConfig) => FieldConfig)) => void;
  updateGroup: (id: string, updater: Partial<GroupConfig> | ((prev: GroupConfig) => GroupConfig)) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, direction: 'up' | 'down') => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  toggleGroupCollapse: (id: string) => void;
  setSchema: (newSchema: FormSchema) => void;
  loadTemplate: (key: string) => void;
  undo: () => void;
  redo: () => void;
  clearForm: () => void;
}

const FormBuilderContext = createContext<FormBuilderContextType | null>(null);

const MAX_HISTORY = 30;

export const FormBuilderProvider: React.FC<{
  initialSchema?: FormSchema;
  children: React.ReactNode;
}> = ({ initialSchema = TEMPLATES.blank, children }) => {
  const [schema, setSchemaState] = useState<FormSchema>(initialSchema);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(() => {
    return initialSchema.elements[0]?.id || null;
  });
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  // Undo / Redo history
  const [past, setPast] = useState<FormSchema[]>([]);
  const [future, setFuture] = useState<FormSchema[]>([]);

  // Push to history when schema changes via user actions
  const applySchemaChange = useCallback((updater: (prev: FormSchema) => FormSchema) => {
    setSchemaState((current) => {
      const next = updater(current);
      if (next === current) return current;
      setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), current]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [schema, ...prevFuture]);
      setSchemaState(previous);
      return newPast;
    });
  }, [schema]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast((prevPast) => [...prevPast, schema]);
      setSchemaState(next);
      return newFuture;
    });
  }, [schema]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Set explicit schema (e.g. from import or template)
  const setSchema = useCallback((newSchema: FormSchema) => {
    setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), schema]);
    setFuture([]);
    setSchemaState(newSchema);
    setSelectedElementId(newSchema.elements[0]?.id || null);
  }, [schema]);

  const loadTemplate = useCallback((key: string) => {
    const template = TEMPLATES[key];
    if (template) {
      setSchema(template);
    }
  }, [setSchema]);

  const clearForm = useCallback(() => {
    setSchema(TEMPLATES.blank);
  }, [setSchema]);

  const updateTitle = useCallback((title: string) => {
    applySchemaChange((prev) => ({ ...prev, title }));
  }, [applySchemaChange]);

  const updateDescription = useCallback((description: string) => {
    applySchemaChange((prev) => ({ ...prev, description }));
  }, [applySchemaChange]);

  const addElement = useCallback((type: FieldType | 'group', targetGroupId?: string | null) => {
    let newElement: FormElement;
    if (type === 'text') {
      newElement = createDefaultTextField();
    } else if (type === 'number') {
      newElement = createDefaultNumberField();
    } else {
      newElement = createDefaultGroup();
    }

    applySchemaChange((prev) => ({
      ...prev,
      elements: addElementToTree(prev.elements, newElement, targetGroupId),
    }));

    // Select the new element immediately for rapid configuration
    setSelectedElementId(newElement.id);

    // If added into a collapsed group, uncollapse it
    if (targetGroupId) {
      setCollapsedGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(targetGroupId);
        return next;
      });
    }
  }, [applySchemaChange]);

  const updateField = useCallback(
    (id: string, updater: Partial<FieldConfig> | ((prev: FieldConfig) => FieldConfig)) => {
      applySchemaChange((prev) => ({
        ...prev,
        elements: updateElementInTree(prev.elements, id, (elem) => {
          if (elem.type === 'group') return elem;
          if (typeof updater === 'function') {
            return updater(elem as FieldConfig);
          }
          return { ...elem, ...updater } as FieldConfig;
        }),
      }));
    },
    [applySchemaChange]
  );

  const updateGroup = useCallback(
    (id: string, updater: Partial<GroupConfig> | ((prev: GroupConfig) => GroupConfig)) => {
      applySchemaChange((prev) => ({
        ...prev,
        elements: updateElementInTree(prev.elements, id, (elem) => {
          if (elem.type !== 'group') return elem;
          if (typeof updater === 'function') {
            return updater(elem as GroupConfig);
          }
          return { ...elem, ...updater } as GroupConfig;
        }),
      }));
    },
    [applySchemaChange]
  );

  const removeElement = useCallback(
    (id: string) => {
      applySchemaChange((prev) => ({
        ...prev,
        elements: removeElementFromTree(prev.elements, id),
      }));
      setSelectedElementId((curr) => (curr === id ? null : curr));
    },
    [applySchemaChange]
  );

  const moveElement = useCallback(
    (id: string, direction: 'up' | 'down') => {
      applySchemaChange((prev) => ({
        ...prev,
        elements: moveElementInTree(prev.elements, id, direction),
      }));
    },
    [applySchemaChange]
  );

  const duplicateElement = useCallback(
    (id: string) => {
      applySchemaChange((prev) => ({
        ...prev,
        elements: duplicateElementInTree(prev.elements, id),
      }));
    },
    [applySchemaChange]
  );

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const toggleGroupCollapse = useCallback((id: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Selected element memoized
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return findElementById(schema.elements, selectedElementId);
  }, [schema.elements, selectedElementId]);

  // Statistics memoized
  const statistics = useMemo(() => {
    return getTreeStatistics(schema.elements);
  }, [schema.elements]);

  const value = useMemo(
    () => ({
      schema,
      selectedElementId,
      selectedElement,
      collapsedGroupIds,
      statistics,
      canUndo,
      canRedo,
      updateTitle,
      updateDescription,
      addElement,
      updateField,
      updateGroup,
      removeElement,
      moveElement,
      duplicateElement,
      selectElement,
      toggleGroupCollapse,
      setSchema,
      loadTemplate,
      undo,
      redo,
      clearForm,
    }),
    [
      schema,
      selectedElementId,
      selectedElement,
      collapsedGroupIds,
      statistics,
      canUndo,
      canRedo,
      updateTitle,
      updateDescription,
      addElement,
      updateField,
      updateGroup,
      removeElement,
      moveElement,
      duplicateElement,
      selectElement,
      toggleGroupCollapse,
      setSchema,
      loadTemplate,
      undo,
      redo,
      clearForm,
    ]
  );

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};
