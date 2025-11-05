"use client";

import { MessageSquareDashed, MessageSquare, Users, Variable as VariableIcon } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onOpenSpeechTextManager: () => void;
  onOpenNPCManager: () => void;
  onOpenVariableManager: () => void;
}

export default function Sidebar({ onOpenSpeechTextManager, onOpenNPCManager, onOpenVariableManager }: SidebarProps) {

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col">
      <div className="p-4 border-b border-neutral-200 bg-white">
        <h2 className="text-sm font-bold text-neutral-700 mb-3">Data Management</h2>
        <div className="space-y-2">
          <button
            onClick={onOpenSpeechTextManager}
            className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2"
          >
            <MessageSquare size={18} />
            Speeches
          </button>

          <button
            onClick={onOpenNPCManager}
            className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2"
          >
            <Users size={18} />
            NPCs
          </button>

          <button
            onClick={onOpenVariableManager}
            className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2"
          >
            <VariableIcon size={18} />
            Variables
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold text-neutral-700 mb-3">Node Types</h2>

        <div className="space-y-2">
          <div
            draggable
            onDragStart={(e) => onDragStart(e, "dialogNode")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareDashed size={18} className="text-neutral-700" />
              <span className="font-semibold text-neutral-800">Dialog Node</span>
            </div>
            <p className="text-xs text-neutral-600">
              Standard dialog node with speech text, NPCs, and actions
            </p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
          <p className="text-xs text-neutral-600">
            <span className="font-semibold text-neutral-800 block mb-1">How to use:</span>
            Drag a node type onto the canvas to create a new node
          </p>
        </div>
      </div>
    </div>
  );
}
