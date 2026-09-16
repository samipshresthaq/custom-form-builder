import React, { useState, useCallback, useMemo, useEffect, useRef, FormEvent } from 'react';
import { FormSchema, FormDataRecord, FormElement } from '../types/form';
import {
  getInitialFormData,
  validateFormTree,
  validateFieldValue,
  setNestedValue,
  getNestedValue,
} from '../utils/validation';

export interface UseFormRendererOptions {
  schema: FormSchema;
  onSubmit?: (data: FormDataRecord) => void;
}

export function useFormRenderer({ schema, onSubmit }: UseFormRendererOptions) {
  // Store form data state
  const [formData, setFormData] = useState<FormDataRecord>(() => getInitialFormData(schema.elements));
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitSuccessCount, setSubmitSuccessCount] = useState(0);

  const prevSchemaIdRef = useRef(schema.id);

  // When schema ID changes completely (e.g. template loaded or imported), reset form data
  useEffect(() => {
    if (prevSchemaIdRef.current !== schema.id) {
      prevSchemaIdRef.current = schema.id;
      setFormData(getInitialFormData(schema.elements));
      setTouchedFields(new Set());
      setSubmitted(false);
    }
  }, [schema.id, schema.elements]);

  // Real-time validation map calculated from current data and schema elements
  const allErrors = useMemo(() => {
    return validateFormTree(schema.elements, formData);
  }, [schema.elements, formData]);

  // Visible errors: only display error if the field was touched or if user attempted submission
  const visibleErrors = useMemo(() => {
    if (submitted) {
      return allErrors;
    }
    const filtered: Record<string, string> = {};
    for (const [path, error] of Object.entries(allErrors)) {
      if (touchedFields.has(path) && typeof error === 'string') {
        filtered[path] = error;
      }
    }
    return filtered;
  }, [allErrors, touchedFields, submitted]);

  const isValid = useMemo(() => {
    return Object.keys(allErrors).length === 0;
  }, [allErrors]);

  const errorCount = useMemo(() => {
    return Object.keys(allErrors).length;
  }, [allErrors]);

  // Update a single nested field by dot path (e.g. "contactDetails.emergencyContact.phoneNumber")
  const setFieldValue = useCallback((path: string, value: any) => {
    setFormData((prev) => setNestedValue(prev, path, value));
  }, []);

  // Mark field as touched on blur
  const setFieldTouched = useCallback((path: string) => {
    setTouchedFields((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, []);

  // Form reset handler
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(schema.elements));
    setTouchedFields(new Set());
    setSubmitted(false);
  }, [schema.elements]);

  // Form submission handler
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      setSubmitted(true);

      const currentErrors = validateFormTree(schema.elements, formData);
      const hasErrors = Object.keys(currentErrors).length > 0;

      if (!hasErrors) {
        setSubmitSuccessCount((prev) => prev + 1);
        if (onSubmit) {
          onSubmit(formData);
        }
        return true;
      }

      return false;
    },
    [schema.elements, formData, onSubmit]
  );

  return {
    formData,
    errors: visibleErrors,
    allErrors,
    isValid,
    errorCount,
    submitted,
    submitSuccessCount,
    touchedFields,
    setFieldValue,
    setFieldTouched,
    resetForm,
    handleSubmit,
  };
}
