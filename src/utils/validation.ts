import { FormElement, FieldConfig, FormSchema, ValidationError, FormDataRecord } from '../types/form';

/**
 * Validate a single field's value against its configuration
 */
export function validateFieldValue(field: FieldConfig, value: any): string | null {
  const isValueEmpty = value === undefined || value === null || value === '';

  // Required validation
  if (field.validation?.required && isValueEmpty) {
    return field.validation.requiredMessage || `${field.label} is required`;
  }

  // If empty and not required, skip remaining validations
  if (isValueEmpty) {
    return null;
  }

  if (field.type === 'text') {
    const { validation } = field;
    if (!validation) return null;
    const stringVal = String(value);

    // MinLength
    if (validation.minLength !== undefined && stringVal.length < validation.minLength) {
      return (
        validation.minLengthMessage ||
        `${field.label} must be at least ${validation.minLength} character${validation.minLength === 1 ? '' : 's'}`
      );
    }

    // MaxLength
    if (validation.maxLength !== undefined && stringVal.length > validation.maxLength) {
      return (
        validation.maxLengthMessage ||
        `${field.label} must be at most ${validation.maxLength} character${validation.maxLength === 1 ? '' : 's'}`
      );
    }
  }

  if (field.type === 'number') {
    const { validation } = field;
    if (!validation) return null;
    const num = typeof value === 'number' ? value : Number(value);

    if (isNaN(num)) {
      return `${field.label} must be a valid number`;
    }

    // Min
    if (validation.min !== undefined && num < validation.min) {
      return validation.minMessage || `${field.label} must be at least ${validation.min}`;
    }

    // Max
    if (validation.max !== undefined && num > validation.max) {
      return validation.maxMessage || `${field.label} cannot exceed ${validation.max}`;
    }
  }

  return null;
}

/**
 * Validate an entire dataset against elements schema recursively
 */
export function validateFormTree(
  elements: FormElement[],
  formData: FormDataRecord,
  parentPath = ''
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const element of elements) {
    const currentPath = parentPath ? `${parentPath}.${element.name}` : element.name;

    if (element.type === 'group') {
      const groupData = formData && typeof formData[element.name] === 'object' ? formData[element.name] : {};
      const childErrors = validateFormTree(element.elements, groupData, currentPath);
      Object.assign(errors, childErrors);
    } else {
      const val = formData ? formData[element.name] : undefined;
      const error = validateFieldValue(element, val);
      if (error) {
        errors[currentPath] = error;
      }
    }
  }

  return errors;
}

/**
 * Build initial default form data values based on schema
 */
export function getInitialFormData(elements: FormElement[]): FormDataRecord {
  const data: FormDataRecord = {};

  for (const elem of elements) {
    if (elem.type === 'group') {
      data[elem.name] = getInitialFormData(elem.elements);
    } else {
      data[elem.name] = elem.defaultValue !== undefined ? elem.defaultValue : '';
    }
  }

  return data;
}

/**
 * Helper to update a nested property in an object using a dot-path (e.g. "contact.emergency.phone")
 */
export function setNestedValue(obj: FormDataRecord, path: string, value: any): FormDataRecord {
  const keys = path.split('.');
  const result = { ...obj };
  let current: any = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Helper to get a nested value by dot-path
 */
export function getNestedValue(obj: FormDataRecord, path: string): any {
  if (!obj) return undefined;
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }

  return current;
}
