"use client";

import { MessageSquareDashed, MessageSquare, Users, Variable as VariableIcon, FolderOpen, Download, Upload, Edit2, StickyNote } from "lucide-react";
import { useState } from "react";
import { useGameDialogStore } from "@/store/gameDialogStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onOpenSpeechTextManager: () => void;
  onOpenNPCManager: () => void;
  onOpenVariableManager: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
}

export default function Sidebar({
  onOpenSpeechTextManager,
  onOpenNPCManager,
  onOpenVariableManager,
  onExportProject,
  onImportProject
}: SidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const projectName = useGameDialogStore((state) => state.projectName);
  const setProjectName = useGameDialogStore((state) => state.setProjectName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (!projectName.trim()) {
      setProjectName("Untitled Project");
    }
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col">
      {/* Project Management Section */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-neutral-700" />
            <span className="text-sm font-bold text-neutral-700">Project</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <span className="sr-only">Open project menu</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportProject}>
                <Download size={16} className="mr-2" />
                Export Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportProject}>
                <Upload size={16} className="mr-2" />
                Import Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-xs text-neutral-500">v1.0.0</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Name Editor */}
        <div className="flex items-center gap-1 group">
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameBlur();
              }}
              autoFocus
              className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
            />
          ) : (
            <>
              <span className="flex-1 text-xs text-neutral-600 truncate">{projectName}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-200 rounded"
                title="Edit project name"
              >
                <Edit2 size={12} className="text-neutral-600" />
              </button>
            </>
          )}
        </div>
      </div>

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
              Start node - can only send connections
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
              Continue dialog flow
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
              Modify a variable value
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
              Check variable condition
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
              Change variable with variable
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
              Check condition with variables
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
              Player choice node
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
              Custom action node
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
              End dialog - cannot receive connections
            </p>
          </div>

          <div
            draggable
            onDragStart={(e) => onDragStart(e, "annotation")}
            className="bg-white p-3 rounded-lg border-2 border-yellow-300 cursor-grab active:cursor-grabbing hover:border-yellow-500 hover:shadow-md transition-all bg-yellow-50"
          >
            <div className="flex items-center gap-2 mb-1">
              <StickyNote size={18} className="text-yellow-700" />
              <span className="font-semibold text-neutral-800">Note / Annotation</span>
            </div>
            <p className="text-xs text-neutral-600">
              Add comments and notes to your flow
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
