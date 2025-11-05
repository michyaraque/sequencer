"use client";

import { useState, useEffect } from "react";
import { SpeechText } from "@/types/dialog";
import SpeechTextEditor from "./SpeechTextEditor";
import { exportSpeechTexts, downloadSpeechTextsFile, importSpeechTexts } from "@/utils/export";

interface SpeechTextManagerProps {
  speechTexts: SpeechText[];
  onAdd: (speechText: SpeechText) => void;
  onEdit: (oldId: string, speechText: SpeechText) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function SpeechTextManager({
  speechTexts,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: SpeechTextManagerProps) {
  const [editingText, setEditingText] = useState<SpeechText | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreating || editingText) {
          handleCancel();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCreating, editingText, onClose]);

  const handleSave = (speechText: SpeechText) => {
    if (editingText) {
      onEdit(editingText.id, speechText);
    } else {
      onAdd(speechText);
    }
    setEditingText(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingText(null);
    setIsCreating(false);
  };

  const handleEdit = (speechText: SpeechText) => {
    setEditingText(speechText);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this speech text?")) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    const content = exportSpeechTexts(speechTexts);
    downloadSpeechTextsFile(content, "speech_texts.txt");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const imported = importSpeechTexts(content);
        imported.forEach((st) => onAdd(st));
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = "";
  };

  const filteredTexts = speechTexts.filter(
    (st) =>
      st.label?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      st.id.includes(searchTerm) ||
      st.text?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Sort by language ID then by ID
  const sortedTexts = [...filteredTexts].sort((a, b) => {
    if (a.languageId !== b.languageId) {
      return a.languageId - b.languageId;
    }
    return parseInt(a.id) - parseInt(b.id);
  });

  const existingIds = speechTexts.map((st) => st.id);

  if (isCreating || editingText) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <SpeechTextEditor
            speechText={editingText}
            onSave={handleSave}
            onCancel={handleCancel}
            existingIds={existingIds}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-800">Speech Text Manager</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, label, or text..."
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            />
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
            >
              + New Speech Text
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors font-medium text-sm"
            >
              Export Speech Texts
            </button>
            <label className="px-4 py-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors font-medium cursor-pointer text-sm">
              Import Speech Texts
              <input
                type="file"
                accept=".txt"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedTexts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {searchTerm ? "No speech texts found" : "No speech texts yet. Create one to get started!"}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTexts.map((speechText) => (
                <div
                  key={speechText.id}
                  className="border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-neutral-800 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {speechText.id}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {speechText.label}
                        </span>
                        <span className="text-xs text-neutral-500">
                          (Lang {speechText.languageId})
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600 font-mono bg-neutral-50 p-2 rounded overflow-x-auto">
                        {speechText.text}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(speechText)}
                        className="px-3 py-1 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(speechText.id)}
                        className="px-3 py-1 bg-neutral-400 text-white rounded hover:bg-neutral-500 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-600">
            <strong>{speechTexts.length}</strong> speech text{speechTexts.length !== 1 ? "s" : ""} total
          </div>
        </div>
      </div>
    </div>
  );
}
