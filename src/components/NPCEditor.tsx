"use client";

import { useState } from "react";
import { NPC } from "@/types/dialog";
import { toast } from "sonner";

interface NPCEditorProps {
  npc: NPC | null;
  onSave: (npc: NPC) => void;
  onCancel: () => void;
  existingIds: string[];
}

export default function NPCEditor({ npc, onSave, onCancel, existingIds }: NPCEditorProps) {
  const [id, setId] = useState(npc?.id || "");
  const [name, setName] = useState(npc?.name || "");

  const handleSave = () => {
    if (!id.trim() || !name.trim()) {
      toast.error("ID and name are required!");
      return;
    }

    const newNPC: NPC = {
      id: id.trim(),
      name: name.trim(),
    };

    if (existingIds.includes(newNPC.id) && npc?.id !== newNPC.id) {
      toast.error(`NPC ID ${newNPC.id} already exists!`);
      return;
    }

    onSave(newNPC);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-neutral-800">
        {npc ? "Edit NPC" : "New NPC"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            NPC ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono"
            placeholder="e.g., NPC001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            NPC Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            placeholder="e.g., John the Merchant"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-neutral-200">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
        >
          Save NPC
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
