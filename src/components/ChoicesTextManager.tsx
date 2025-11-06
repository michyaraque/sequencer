"use client";

import { useState, useEffect } from "react";
import { ChoiceText } from "@/types/dialog";
import ChoiceTextEditor from "./ChoiceTextEditor";
import { useConfirm } from "@/components/ConfirmProvider";

interface ChoicesTextManagerProps {
  choiceTexts: ChoiceText[];
  onAdd: (choiceText: ChoiceText) => void;
  onEdit: (oldId: string, choiceText: ChoiceText) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ChoicesTextManager({
  choiceTexts,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: ChoicesTextManagerProps) {
  const [editingChoiceText, setEditingChoiceText] = useState<ChoiceText | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showConfirm } = useConfirm();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreating || editingChoiceText) {
          handleCancel();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCreating, editingChoiceText, onClose]);

  const handleSave = (choiceText: ChoiceText) => {
    if (editingChoiceText) {
      onEdit(editingChoiceText.id, choiceText);
    } else {
      onAdd(choiceText);
    }
    setEditingChoiceText(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingChoiceText(null);
    setIsCreating(false);
  };

  const handleEdit = (choiceText: ChoiceText) => {
    setEditingChoiceText(choiceText);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      message: "Are you sure you want to delete this choice text?",
      title: "Delete Choice Text",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      onDelete(id);
    }
  };

  const filteredChoiceTexts = choiceTexts.filter(
    (ct) =>
      ct.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ct.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ct.speechId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedChoiceTexts = [...filteredChoiceTexts].sort((a, b) => a.id.localeCompare(b.id));

  const existingIds = choiceTexts.map((ct) => ct.id);

  if (isCreating || editingChoiceText) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <ChoiceTextEditor
            choiceText={editingChoiceText}
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
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-800">Choice Text Manager</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, text, or speech ID..."
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            />
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
            >
              + New Choice Text
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sortedChoiceTexts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {searchTerm ? "No choice texts found" : "No choice texts yet. Create one to get started!"}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChoiceTexts.map((choiceText) => (
                <div
                  key={choiceText.id}
                  className="border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-neutral-800 text-white px-2 py-1 rounded text-xs font-mono font-bold">
                          {choiceText.id}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {choiceText.text}
                        </span>
                      </div>
                      {choiceText.speechId && choiceText.speechId !== "-1" && (
                        <div className="text-sm text-neutral-600 ml-2 font-mono">
                          Speech ID: {choiceText.speechId}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(choiceText)}
                        className="px-3 py-1 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(choiceText.id)}
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

        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-600">
            <strong>{choiceTexts.length}</strong> choice text{choiceTexts.length !== 1 ? "s" : ""} total
          </div>
        </div>
      </div>
    </div>
  );
}
