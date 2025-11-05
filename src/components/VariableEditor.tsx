"use client";

import { useState } from "react";
import { Variable } from "@/types/dialog";
import { useAlert } from "@/components/AlertProvider";

interface VariableEditorProps {
  variable: Variable | null;
  onSave: (variable: Variable) => void;
  onCancel: () => void;
  existingIds: string[];
}

export default function VariableEditor({
  variable,
  onSave,
  onCancel,
  existingIds,
}: VariableEditorProps) {
  const [id, setId] = useState(variable?.id || "");
  const [name, setName] = useState(variable?.name || "");
  const [description, setDescription] = useState(variable?.description || "");

  const { showAlert } = useAlert();

  const handleSave = () => {
    if (!id.trim() || !name.trim()) {
      showAlert({ message: "ID and name are required!", variant: "error" });
      return;
    }

    const newVariable: Variable = {
      id: id.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (existingIds.includes(newVariable.id) && variable?.id !== newVariable.id) {
      showAlert({ message: `Variable ID ${newVariable.id} already exists!`, variant: "error" });
      return;
    }

    onSave(newVariable);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-neutral-800">
        {variable ? "Edit Variable" : "New Variable"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Variable ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono"
            placeholder="e.g., VAR001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Variable Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            placeholder="e.g., Player Health"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            rows={3}
            placeholder="e.g., Tracks the player's current health points"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-neutral-200">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
        >
          Save Variable
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
