"use client";

import { MessageSquareDashed, MessageSquare, Users, Variable as VariableIcon, StickyNote, Clock, Shuffle, XCircle, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface NodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTypes: NodeType[] = [
  {
    type: "startSequence",
    label: "Start Sequence",
    description: "Start sequence - initiates sequence",
    icon: <MessageSquareDashed size={20} className="text-green-600" />,
    color: "border-green-300 hover:border-green-500"
  },
  {
    type: "botSpeech",
    label: "Bot Speech",
    description: "Bot speaks - Whisper, Talk, or Shout",
    icon: <MessageSquare size={20} className="text-indigo-600" />,
    color: "border-indigo-300 hover:border-indigo-500"
  },
  {
    type: "showMessage",
    label: "Show Message",
    description: "Show notification message",
    icon: <MessageSquare size={20} className="text-violet-600" />,
    color: "border-violet-300 hover:border-violet-500"
  },
  {
    type: "changeVariable",
    label: "Change Variable",
    description: "Modify a variable value",
    icon: <VariableIcon size={20} className="text-purple-600" />,
    color: "border-purple-300 hover:border-purple-500"
  },
  {
    type: "conditionVariable",
    label: "Condition Variable",
    description: "Check variable condition",
    icon: <VariableIcon size={20} className="text-orange-600" />,
    color: "border-orange-300 hover:border-orange-500"
  },
  {
    type: "changeVariableVariable",
    label: "Change Var. Variable",
    description: "Change variable with variable",
    icon: <VariableIcon size={20} className="text-purple-700" />,
    color: "border-purple-400 hover:border-purple-600"
  },
  {
    type: "conditionVariableVariable",
    label: "Cond. Var. Variable",
    description: "Check condition with variables",
    icon: <VariableIcon size={20} className="text-orange-700" />,
    color: "border-orange-400 hover:border-orange-600"
  },
  {
    type: "choice",
    label: "Choice",
    description: "Player choice node",
    icon: <MessageSquare size={20} className="text-cyan-600" />,
    color: "border-cyan-300 hover:border-cyan-500"
  },
  {
    type: "random",
    label: "Random",
    description: "Random selection with multiple outputs",
    icon: <Shuffle size={20} className="text-teal-600" />,
    color: "border-teal-300 hover:border-teal-500"
  },
  {
    type: "wait",
    label: "Wait",
    description: "Wait for specified time (0.5s - 10s)",
    icon: <Clock size={20} className="text-emerald-600" />,
    color: "border-emerald-300 hover:border-emerald-500"
  },
  {
    type: "customAction",
    label: "Custom Wired Action",
    description: "Execute custom wired action",
    icon: <MessageSquareDashed size={20} className="text-yellow-600" />,
    color: "border-yellow-300 hover:border-yellow-500"
  },
  {
    type: "endSequence",
    label: "End Sequence",
    description: "End sequence - no further connections",
    icon: <XCircle size={20} className="text-red-600" />,
    color: "border-red-300 hover:border-red-500"
  },
  {
    type: "annotation",
    label: "Note / Annotation",
    description: "Add comments and notes to your flow",
    icon: <StickyNote size={20} className="text-yellow-700" />,
    color: "border-yellow-300 hover:border-yellow-500 bg-yellow-50"
  }
];

interface MobileNodePaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

export default function MobileNodePalette({ open, onClose, onSelectNode }: MobileNodePaletteProps) {
  const handleNodeSelect = (nodeType: string) => {
    onSelectNode(nodeType);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between z-10">
            <h3 className="font-bold text-lg">Add Node</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {nodeTypes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => handleNodeSelect(node.type)}
                  className={`w-full bg-white p-4 rounded-lg border-2 ${node.color} transition-all text-left active:scale-95`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {node.icon}
                    <span className="font-semibold text-neutral-800">{node.label}</span>
                  </div>
                  <p className="text-xs text-neutral-600 pl-8">
                    {node.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <p className="text-xs text-neutral-600">
              Tap any node type to add it to the center of the canvas
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
