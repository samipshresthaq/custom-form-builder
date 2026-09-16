import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { useFormBuilder } from "../../hooks/useFormBuilder";
import { useFormRenderer } from "../../hooks/useFormRenderer";
import { RenderField } from "./RenderField";
import { RenderGroup } from "./RenderGroup";
import { SubmissionResultModal } from "./SubmissionResultModal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import "./LiveFormPreview.scss";

export const LiveFormPreview: React.FC = memo(() => {
  const { schema } = useFormBuilder();
  const [submissionData, setSubmissionData] = useState<Record<
    string,
    any
  > | null>(null);
  const [showLiveJson, setShowLiveJson] = useState(false);

  const handleValidSubmit = useCallback((data: Record<string, any>) => {
    setSubmissionData(data);
  }, []);

  const {
    formData,
    errors,
    allErrors,
    isValid,
    errorCount,
    submitted,
    setFieldValue,
    setFieldTouched,
    resetForm,
    handleSubmit,
  } = useFormRenderer({
    schema,
    onSubmit: handleValidSubmit,
  });

  const hasElements = schema.elements.length > 0;

  const liveJsonString = useMemo(() => {
    return JSON.stringify(formData, null, 2);
  }, [formData]);

  return (
    <div className="live-preview">
      {/* Header */}
      <div className="live-preview__header">
        <div className="live-preview__header-left">
          <div className="live-preview__icon">
            <Play size={14} style={{ fill: "#059669", color: "#059669" }} />
          </div>
          <div>
            <h3 className="live-preview__title">Live Form Preview</h3>
            <div className="live-preview__subtitle">
              Interactive live testing environment
            </div>
          </div>
        </div>

        <div>
          {hasElements && (
            <Badge
              variant={isValid ? "green" : "amber"}
              size="sm"
              icon={
                isValid ? <CheckCircle size={12} /> : <AlertCircle size={12} />
              }
              title={
                isValid
                  ? "Form is valid"
                  : `${errorCount} validation error${errorCount === 1 ? "" : "s"}`
              }
            />
          )}
        </div>
      </div>

      {/* Main Preview Form Area */}
      <div className="live-preview__body">
        {!hasElements ? (
          <div className="live-preview__empty">
            <p className="live-preview__empty-title">
              No form elements to render
            </p>
            <p className="live-preview__empty-desc">
              Add fields and groups in the form builder on the left to preview
              them in real time here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="live-preview__form">
            {/* Form Headline Card */}
            <div className="live-preview__form-header">
              <h2 className="live-preview__form-title">
                {schema.title || "Untitled Form"}
              </h2>
              {schema.description && (
                <p className="live-preview__form-desc">{schema.description}</p>
              )}
            </div>

            {/* Form Elements */}
            <div className="live-preview__elements">
              {schema.elements.map((element) => {
                if (element.type === "group") {
                  return (
                    <RenderGroup
                      key={element.id}
                      group={element}
                      formData={formData}
                      errors={errors}
                      onChange={setFieldValue}
                      onBlur={setFieldTouched}
                    />
                  );
                }

                const val = formData[element.name];
                const err = errors[element.name];

                return (
                  <RenderField
                    key={element.id}
                    field={element}
                    path={element.name}
                    value={val}
                    error={err}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                  />
                );
              })}
            </div>

            {/* Error Notification if submitted with errors */}
            {submitted && !isValid && (
              <div className="live-preview__error-summary">
                <AlertCircle
                  size={16}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Please fix the following validation errors:
                  </div>
                  <ul>
                    {Object.entries(allErrors).map(([path, msg]) => (
                      <li key={path}>
                        <code>{path}</code>: {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="live-preview__actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<RotateCcw size={14} />}
                onClick={resetForm}
              >
                Reset Values
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!isValid}
                icon={<Send size={14} />}
              >
                Submit Form
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Live Form State Inspector Tray */}
      {hasElements && (
        <div className="live-preview__tray">
          <button
            type="button"
            onClick={() => setShowLiveJson(!showLiveJson)}
            className="live-preview__tray-toggle"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Code2 size={14} />
              <span>
                Live Form Data State ({Object.keys(formData).length} top-level
                fields)
              </span>
            </div>
            {showLiveJson ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {showLiveJson && (
            <div className="live-preview__tray-content">
              <pre>{liveJsonString}</pre>
            </div>
          )}
        </div>
      )}

      {/* Submission Success Modal */}
      <SubmissionResultModal
        isOpen={Boolean(submissionData)}
        onClose={() => setSubmissionData(null)}
        data={submissionData}
      />
    </div>
  );
});

