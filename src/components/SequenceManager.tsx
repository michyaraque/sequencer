"use client";

import { useState, useEffect } from "react";
import { Sequence } from "@/store/useSequencesStore";
import { useConfirm } from "@/components/ConfirmProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SequenceManagerProps {
  sequences: Sequence[];
  onEdit: (id: string, data: { name: string; description?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function SequenceManager({ sequences, onEdit, onDelete, onClose }: SequenceManagerProps) {
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { showConfirm } = useConfirm();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingSequence) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editingSequence, onClose]);

  const handleEdit = (sequence: Sequence) => {
    setEditingSequence(sequence);
    setEditName(sequence.name);
    setEditDescription(sequence.description || "");
  };

  const handleSaveEdit = () => {
    if (editingSequence && editName.trim()) {
      onEdit(editingSequence.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingSequence(null);
    setEditName("");
    setEditDescription("");
  };

  const handleDelete = async (sequence: Sequence) => {
    const confirmed = await showConfirm({
      message: `Are you sure you want to delete the sequence "${sequence.name}"? This action cannot be undone.`,
      title: "Delete Sequence",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      onDelete(sequence.id);
    }
  };

  const filteredSequences = sequences.filter(
    (seq) =>
      seq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seq.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSequences = [...filteredSequences].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (editingSequence) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleCancelEdit}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold text-neutral-800 mb-4">Edit Sequence</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">
                Sequence Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Sequence name"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe what this sequence does..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()} className="flex-1">
              Save Changes
            </Button>
          </div>
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
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-800">Sequence Manager</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sequences..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sortedSequences.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {searchTerm ? "No sequences found" : "No sequences yet. Select nodes and save them as a sequence!"}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSequences.map((sequence) => (
                <div
                  key={sequence.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-neutral-800 text-lg">
                          {sequence.name}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          {sequence.nodes.length} node{sequence.nodes.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {sequence.description && (
                        <p className="text-neutral-600 text-sm mb-3">
                          {sequence.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-2">
                        {sequence.nodes.slice(0, 5).map((node) => (
                          <span
                            key={node.id}
                            className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-xs font-mono"
                          >
                            {node.data.label || node.type}
                          </span>
                        ))}
                        {sequence.nodes.length > 5 && (
                          <span className="bg-neutral-100 text-neutral-500 px-2 py-1 rounded text-xs">
                            +{sequence.nodes.length - 5} more
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500">
                        Created {new Date(sequence.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(sequence)}
                        className="px-3 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sequence)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
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
            <strong>{sequences.length}</strong> sequence{sequences.length !== 1 ? 's' : ''} total
            {sequences.length > 0 && (
              <span className="ml-4">
                <strong>{sequences.reduce((sum, seq) => sum + seq.nodes.length, 0)}</strong> total nodes
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
