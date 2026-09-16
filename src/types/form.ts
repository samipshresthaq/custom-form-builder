export type FieldType = 'text' | 'number';

export interface BaseFieldValidation {
  required?: boolean;
  requiredMessage?: string;
}

export interface TextFieldValidation extends BaseFieldValidation {
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
}

export interface NumberFieldValidation extends BaseFieldValidation {
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;
}

export interface BaseFieldConfig {
  id: string;
  name: string; // Key in form data
  label: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
  defaultValue?: string;
  validation: TextFieldValidation;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  defaultValue?: number | '';
  validation: NumberFieldValidation;
}

export type FieldConfig = TextFieldConfig | NumberFieldConfig;

export interface GroupConfig {
  id: string;
  type: 'group';
  name: string; // Namespace key in form data
  label: string;
  description?: string;
  elements: FormElement[];
}

export type FormElement = FieldConfig | GroupConfig;

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  version: string;
  elements: FormElement[];
}

export interface ValidationError {
  path: string; // e.g. "contact.phone"
  message: string;
}

export type FormDataRecord = Record<string, any>;
