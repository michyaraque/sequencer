"use client";

import { useState, useEffect } from "react";
import { ExportSettings, ExportField } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { getDefaultExportFields } from "@/utils/export";
import { Plus, X, GripVertical } from "lucide-react";

interface ExportSettingsDialogProps {
  onClose: () => void;
}

export default function ExportSettingsDialog({ onClose }: ExportSettingsDialogProps) {
  const exportSettings = useGameDialogStore((state) => state.exportSettings);
  const setExportSettings = useGameDialogStore((state) => state.setExportSettings);

  const [fields, setFields] = useState<ExportField[]>(() => {
    const settingsFields = exportSettings?.fields || getDefaultExportFields();
    return [...settingsFields].sort((a, b) => a.order - b.order);
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSave = () => {
    setExportSettings({ fields });
    onClose();
  };

  const handleReset = () => {
    setFields(getDefaultExportFields());
  };

  const handleAddField = () => {
    const newField: ExportField = {
      id: `custom_${Date.now()}`,
      name: "New Field",
      value: "",
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof ExportField, value: string | number) => {
    setFields(
      fields.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    newFields.forEach((f, i) => (f.order = i));
    setFields(newFields);
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    newFields.forEach((f, i) => (f.order = i));
    setFields(newFields);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-neutral-800">Export Settings</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-neutral-600">
            Customize the fields that will be exported in the dialog format. The order of fields determines their position in the export.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={handleAddField}
              className="w-full px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add New Field
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 transition-colors bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 3L2 7h8L6 3z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === fields.length - 1}
                      className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 9L2 5h8L6 9z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-500 w-16">Order: {index}</span>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleFieldChange(field.id, "name", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-medium"
                        placeholder="Field Name"
                      />
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono"
                      placeholder="Default Value"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete field"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No fields configured. Click "Add New Field" to start.
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800 block mb-1">Export Format:</span>
              index=<span className="text-purple-600">[field1]</span>¦<span className="text-purple-600">[field2]</span>¦<span className="text-purple-600">[field3]</span>¦...
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2 justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
