import React, { memo, useState, useRef, useEffect } from "react";
import {
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { useFormBuilder } from "../../hooks/useFormBuilder";
import { validateFormSchemaJson } from "../../utils/schemaUtils";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import "./JsonSchemaModal.scss";

export interface JsonSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "export" | "import";
}

export const JsonSchemaModal = memo<JsonSchemaModalProps>(
  ({ isOpen, onClose, defaultTab = "export" }) => {
    const { schema, setSchema } = useFormBuilder();
    const [activeTab, setActiveTab] = useState<"export" | "import">(
      () => defaultTab,
    );
    const [copied, setCopied] = useState(false);
    const [importText, setImportText] = useState("");
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const schemaJsonString = JSON.stringify(schema, null, 2);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(schemaJsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy schema", err);
      }
    };

    useEffect(() => {
      setActiveTab(defaultTab);
    }, [defaultTab]);

    const handleDownload = () => {
      const fileName = `${schema.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "form"}-schema.json`;
      const blob = new Blob([schemaJsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportText(content);
        setImportError(null);
      };
      reader.onerror = () => {
        setImportError("Failed to read file from disk.");
      };
      reader.readAsText(file);
    };

    const handleImportSubmit = () => {
      setImportError(null);
      if (!importText.trim()) {
        setImportError("Please paste schema JSON or upload a .json file.");
        return;
      }

      try {
        const parsed = JSON.parse(importText);
        const result = validateFormSchemaJson(parsed);

        if (!result.valid || !result.schema) {
          setImportError(result.error || "Invalid form schema structure.");
          return;
        }

        setSchema(result.schema);
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 800);
      } catch (err: any) {
        setImportError(`JSON Parse Error: ${err.message}`);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${activeTab === "export" ? "Export" : "Import"} "JSON Configuration Schema"`}
        description="Export the active form configuration as a portable JSON schema, or import a pre-configured schema."
        maxWidth="2xl"
        footer={
          activeTab === "export" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={
                  copied ? (
                    <Check size={14} style={{ color: "#059669" }} />
                  ) : (
                    <Copy size={14} />
                  )
                }
                onClick={handleCopy}
              >
                {copied ? "Copied Schema!" : "Copy to Clipboard"}
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Download size={14} />}
                onClick={handleDownload}
              >
                Download JSON File
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Upload size={14} />}
                onClick={handleImportSubmit}
              >
                Apply Imported Schema
              </Button>
            </>
          )
        }
      >
        <div className="schema-modal">
          {/* Tabs */}
          <div className="schema-modal__tabs">
            <button
              type="button"
              onClick={() => setActiveTab("export")}
              className={`schema-modal__tab ${activeTab === "export" ? "schema-modal__tab--active" : ""}`}
            >
              <Download size={13} />
              <span>Export Schema (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`schema-modal__tab ${activeTab === "import" ? "schema-modal__tab--active" : ""}`}
            >
              <Upload size={13} />
              <span>Import Schema (JSON)</span>
            </button>
          </div>

          {/* Export View */}
          {activeTab === "export" && (
            <div>
              <div className="schema-modal__export-meta">
                <span>
                  Schema definition adhering to FormSchema specification
                </span>
                <code>{schemaJsonString.length} bytes</code>
              </div>
              <div className="schema-modal__code-box">
                <pre>{schemaJsonString}</pre>
              </div>
            </div>
          )}

          {/* Import View */}
          {activeTab === "import" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* File Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="schema-modal__dropzone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,application/json"
                  style={{ display: "none" }}
                />
                <FileUp
                  size={24}
                  style={{ color: "#64748b", marginBottom: "4px" }}
                />
                <span className="schema-modal__dropzone-title">
                  Click to choose a .json schema file
                </span>
                <span className="schema-modal__dropzone-subtitle">
                  Or paste JSON schema content into the editor below
                </span>
              </div>

              {/* Textarea Paste */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#334155",
                  }}
                >
                  Schema JSON Payload
                </label>
                <textarea
                  rows={9}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder='Paste JSON schema here... e.g. { "title": "My Form", "elements": [...] }'
                  className="schema-modal__textarea"
                />
              </div>

              {/* Error feedback */}
              {importError && (
                <div className="schema-modal__alert schema-modal__alert--error">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success feedback */}
              {importSuccess && (
                <div className="schema-modal__alert schema-modal__alert--success">
                  <Check size={15} style={{ flexShrink: 0 }} />
                  <span>Schema successfully loaded and applied!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    );
  },
);

