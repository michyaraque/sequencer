"use client";

import { useState, useEffect } from "react";
import { NPC } from "@/types/dialog";
import NPCEditor from "./NPCEditor";
import { useConfirm } from "@/components/ConfirmProvider";

interface NPCManagerProps {
  npcs: NPC[];
  onAdd: (npc: NPC) => void;
  onEdit: (oldId: string, npc: NPC) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function NPCManager({ npcs, onAdd, onEdit, onDelete, onClose }: NPCManagerProps) {
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showConfirm } = useConfirm();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreating || editingNPC) {
          handleCancel();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCreating, editingNPC, onClose]);

  const handleSave = (npc: NPC) => {
    if (editingNPC) {
      onEdit(editingNPC.id, npc);
    } else {
      onAdd(npc);
    }
    setEditingNPC(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingNPC(null);
    setIsCreating(false);
  };

  const handleEdit = (npc: NPC) => {
    setEditingNPC(npc);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      message: "Are you sure you want to delete this NPC?",
      title: "Delete NPC",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      onDelete(id);
    }
  };

  const filteredNPCs = npcs.filter(
    (npc) =>
      npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNPCs = [...filteredNPCs].sort((a, b) => a.id.localeCompare(b.id));

  const existingIds = npcs.map((npc) => npc.id);

  if (isCreating || editingNPC) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <NPCEditor
            npc={editingNPC}
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-800">NPC Manager</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or name..."
              className="flex-1 px-3 py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            />
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              + New NPC
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {sortedNPCs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {searchTerm ? "No NPCs found" : "No NPCs yet. Create one to get started!"}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedNPCs.map((npc) => (
                <div
                  key={npc.id}
                  className="border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="bg-neutral-800 text-white px-2 py-1 rounded text-xs font-mono font-bold">
                        {npc.id}
                      </span>
                      <span className="font-medium text-neutral-800 truncate">
                        {npc.name}
                      </span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(npc)}
                        className="px-3 py-1 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(npc.id)}
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

        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="text-xs sm:text-sm text-neutral-600">
            <strong>{npcs.length}</strong> NPC{npcs.length !== 1 ? "s" : ""} total
          </div>
        </div>
      </div>
    </div>
  );
}
