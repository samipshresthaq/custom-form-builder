import { FormElement, FormSchema, GroupConfig, FieldConfig, TextFieldConfig, NumberFieldConfig } from '../types/form';

export function generateId(prefix = 'elem'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function sanitizeFieldName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/**
 * Creates a default text field
 */
export function createDefaultTextField(customProps?: Partial<TextFieldConfig>): TextFieldConfig {
  const id = generateId('field_txt');
  return {
    id,
    type: 'text',
    name: `text_field_${id.slice(-4)}`,
    label: 'Text Field',
    placeholder: 'Enter text...',
    helperText: '',
    defaultValue: '',
    disabled: false,
    readOnly: false,
    validation: {
      required: false,
      requiredMessage: 'This field is required',
      minLength: undefined,
      maxLength: undefined,
    },
    ...customProps,
  };
}

/**
 * Creates a default number field
 */
export function createDefaultNumberField(customProps?: Partial<NumberFieldConfig>): NumberFieldConfig {
  const id = generateId('field_num');
  return {
    id,
    type: 'number',
    name: `number_field_${id.slice(-4)}`,
    label: 'Number Field',
    placeholder: 'Enter a number...',
    helperText: '',
    defaultValue: '',
    disabled: false,
    readOnly: false,
    validation: {
      required: false,
      requiredMessage: 'This field is required',
      min: undefined,
      max: undefined,
    },
    ...customProps,
  };
}

/**
 * Creates a default group container
 */
export function createDefaultGroup(customProps?: Partial<GroupConfig>): GroupConfig {
  const id = generateId('group');
  return {
    id,
    type: 'group',
    name: `group_${id.slice(-4)}`,
    label: 'Field Group',
    description: 'Group of related fields',
    elements: [],
    ...customProps,
  };
}

/**
 * Recursively find an element by ID
 */
export function findElementById(elements: FormElement[], id: string): FormElement | null {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.type === 'group') {
      const found = findElementById(element.elements, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively find the parent group or root containing an element
 */
export function findParentAndIndex(
  elements: FormElement[],
  id: string,
  parent: GroupConfig | null = null
): { parent: GroupConfig | null; index: number; siblings: FormElement[] } | null {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      return { parent, index: i, siblings: elements };
    }
    if (elements[i].type === 'group') {
      const res = findParentAndIndex((elements[i] as GroupConfig).elements, id, elements[i] as GroupConfig);
      if (res) return res;
    }
  }
  return null;
}

/**
 * Add an element to the root or inside a specific parent group
 */
export function addElementToTree(
  elements: FormElement[],
  newElement: FormElement,
  targetGroupId?: string | null
): FormElement[] {
  if (!targetGroupId) {
    return [...elements, newElement];
  }

  return elements.map((elem) => {
    if (elem.id === targetGroupId && elem.type === 'group') {
      return {
        ...elem,
        elements: [...elem.elements, newElement],
      };
    }
    if (elem.type === 'group') {
      return {
        ...elem,
        elements: addElementToTree(elem.elements, newElement, targetGroupId),
      };
    }
    return elem;
  });
}

/**
 * Update an element in the tree
 */
export function updateElementInTree(
  elements: FormElement[],
  id: string,
  updater: (element: FormElement) => FormElement
): FormElement[] {
  return elements.map((elem) => {
    if (elem.id === id) {
      return updater(elem);
    }
    if (elem.type === 'group') {
      return {
        ...elem,
        elements: updateElementInTree(elem.elements, id, updater),
      };
    }
    return elem;
  });
}

/**
 * Remove an element from the tree
 */
export function removeElementFromTree(elements: FormElement[], id: string): FormElement[] {
  return elements
    .filter((elem) => elem.id !== id)
    .map((elem) => {
      if (elem.type === 'group') {
        return {
          ...elem,
          elements: removeElementFromTree(elem.elements, id),
        };
      }
      return elem;
    });
}

/**
 * Move element up or down among its siblings
 */
export function moveElementInTree(
  elements: FormElement[],
  id: string,
  direction: 'up' | 'down'
): FormElement[] {
  const info = findParentAndIndex(elements, id);
  if (!info) return elements;

  const { index, siblings, parent } = info;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return elements; // Cannot move past boundary
  }

  const newSiblings = [...siblings];
  const [moved] = newSiblings.splice(index, 1);
  newSiblings.splice(targetIndex, 0, moved);

  if (!parent) {
    return newSiblings;
  }

  return updateElementInTree(elements, parent.id, (g) => ({
    ...g,
    elements: newSiblings,
  }));
}

/**
 * Deep clone and re-id element for duplicate
 */
export function cloneElementWithNewIds(element: FormElement): FormElement {
  const newId = generateId(element.type === 'group' ? 'group' : `field_${element.type}`);
  const newName = `${element.name}_copy`;

  if (element.type === 'group') {
    return {
      ...element,
      id: newId,
      name: newName,
      label: `${element.label} (Copy)`,
      elements: element.elements.map(cloneElementWithNewIds),
    };
  }

  return {
    ...element,
    id: newId,
    name: newName,
    label: `${element.label} (Copy)`,
  };
}

/**
 * Duplicate element in the tree right next to itself
 */
export function duplicateElementInTree(elements: FormElement[], id: string): FormElement[] {
  const info = findParentAndIndex(elements, id);
  if (!info) return elements;

  const { index, siblings, parent } = info;
  const original = siblings[index];
  const cloned = cloneElementWithNewIds(original);

  const newSiblings = [...siblings];
  newSiblings.splice(index + 1, 0, cloned);

  if (!parent) {
    return newSiblings;
  }

  return updateElementInTree(elements, parent.id, (g) => ({
    ...g,
    elements: newSiblings,
  }));
}

/**
 * Get count statistics for a schema
 */
export function getTreeStatistics(elements: FormElement[]) {
  let fieldsCount = 0;
  let textCount = 0;
  let numberCount = 0;
  let groupsCount = 0;
  let maxDepth = 0;

  function traverse(items: FormElement[], currentDepth: number) {
    if (currentDepth > maxDepth) maxDepth = currentDepth;
    for (const item of items) {
      if (item.type === 'group') {
        groupsCount++;
        traverse(item.elements, currentDepth + 1);
      } else {
        fieldsCount++;
        if (item.type === 'text') textCount++;
        if (item.type === 'number') numberCount++;
      }
    }
  }

  traverse(elements, 1);
  return {
    totalElements: fieldsCount + groupsCount,
    fieldsCount,
    textCount,
    numberCount,
    groupsCount,
    maxDepth: elements.length === 0 ? 0 : maxDepth,
  };
}

/**
 * Validate imported JSON against FormSchema
 */
export function validateFormSchemaJson(json: unknown): { valid: boolean; error?: string; schema?: FormSchema } {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Uploaded JSON is not an object.' };
  }

  const obj = json as any;

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    return { valid: false, error: 'Schema must include a valid "title" string.' };
  }

  if (!Array.isArray(obj.elements)) {
    return { valid: false, error: 'Schema must include an "elements" array.' };
  }

  function validateElements(elements: any[]): string | null {
    for (const elem of elements) {
      if (!elem || typeof elem !== 'object') return 'Each element must be an object.';
      if (!elem.id || typeof elem.id !== 'string') return 'Each element must have an "id".';
      if (!elem.name || typeof elem.name !== 'string') return 'Each element must have a "name".';
      if (!elem.label || typeof elem.label !== 'string') return 'Each element must have a "label".';

      if (elem.type === 'group') {
        if (!Array.isArray(elem.elements)) return `Group "${elem.label}" must have an elements array.`;
        const childErr = validateElements(elem.elements);
        if (childErr) return childErr;
      } else if (elem.type === 'text' || elem.type === 'number') {
        // Field validation
        if (elem.validation && typeof elem.validation !== 'object') {
          return `Field "${elem.label}" has invalid validation config.`;
        }
      } else {
        return `Unsupported element type: "${elem.type}". Supported types are "text", "number", and "group".`;
      }
    }
    return null;
  }

  const elemErr = validateElements(obj.elements);
  if (elemErr) {
    return { valid: false, error: elemErr };
  }

  const validatedSchema: FormSchema = {
    id: obj.id || generateId('schema'),
    title: obj.title,
    description: obj.description || '',
    version: obj.version || '1.0.0',
    elements: obj.elements,
  };

  return { valid: true, schema: validatedSchema };
}
