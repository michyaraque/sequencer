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
            onDragStart={(e) => onDragStart(e, "initializeSpeech")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareDashed size={18} className="text-green-600" />
              <span className="font-semibold text-neutral-800">Initialize Speech</span>
            </div>
            <p className="text-xs text-neutral-600">
              Start node - can only send connections (Action ID 1)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "nextSpeech")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareDashed size={18} className="text-blue-600" />
              <span className="font-semibold text-neutral-800">Next Speech</span>
            </div>
            <p className="text-xs text-neutral-600">
              Continue dialog flow (Action ID 2)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "changeVariable")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <VariableIcon size={18} className="text-purple-600" />
              <span className="font-semibold text-neutral-800">Change Variable</span>
            </div>
            <p className="text-xs text-neutral-600">
              Modify a variable value (Action ID 3)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "conditionVariable")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <VariableIcon size={18} className="text-orange-600" />
              <span className="font-semibold text-neutral-800">Condition Variable</span>
            </div>
            <p className="text-xs text-neutral-600">
              Check variable condition (Action ID 4)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "changeVariableVariable")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <VariableIcon size={18} className="text-purple-700" />
              <span className="font-semibold text-neutral-800">Change Var. Variable</span>
            </div>
            <p className="text-xs text-neutral-600">
              Change variable with variable (Action ID 5)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "conditionVariableVariable")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <VariableIcon size={18} className="text-orange-700" />
              <span className="font-semibold text-neutral-800">Cond. Var. Variable</span>
            </div>
            <p className="text-xs text-neutral-600">
              Check condition with variables (Action ID 6)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "choice")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={18} className="text-cyan-600" />
              <span className="font-semibold text-neutral-800">Choice</span>
            </div>
            <p className="text-xs text-neutral-600">
              Player choice node (Action ID 7)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "customAction")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareDashed size={18} className="text-yellow-600" />
              <span className="font-semibold text-neutral-800">Custom Action</span>
            </div>
            <p className="text-xs text-neutral-600">
              Custom action node (Action ID 98)
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "endSpeech")}
            className="bg-white p-3 rounded-lg border-2 border-neutral-300 cursor-grab active:cursor-grabbing hover:border-neutral-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareDashed size={18} className="text-red-600" />
              <span className="font-semibold text-neutral-800">End Speech</span>
            </div>
            <p className="text-xs text-neutral-600">
              End dialog - cannot receive connections (Action ID 99)
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
