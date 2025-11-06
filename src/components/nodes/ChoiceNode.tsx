"use client";

import { memo, useMemo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { CustomNodeProps } from "./shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Choice } from "@/types/dialog";

export const ChoiceNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const choices = useGameDialogStore((state) => state.choices);
  const addChoice = useGameDialogStore((state) => state.addChoice);
  const editChoice = useGameDialogStore((state) => state.editChoice);
  const deleteChoice = useGameDialogStore((state) => state.deleteChoice);

  const nodeChoices = useMemo(() => {
    return choices
      .filter((c) => c.nodeId === id)
      .sort((a, b) => a.order - b.order);
  }, [choices, id]);

  const choiceCount = nodeChoices.length;
  if (data.value1 !== choiceCount.toString()) {
    updateNodeData(id, { value1: choiceCount.toString() });
  }

  const showChoices = data.value2 !== "0";

  const handleShowChoicesChange = (checked: boolean) => {
    updateNodeData(id, { value2: checked ? "1" : "0" });
  };

  const handleAddChoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOrder = nodeChoices.length;
    const newChoice: Choice = {
      id: `${id}-choice-${Date.now()}`,
      nodeId: id,
      text: "",
      order: newOrder,
    };
    addChoice(newChoice);
  };

  const handleDeleteChoice = (e: React.MouseEvent, choiceId: string) => {
    e.stopPropagation();
    deleteChoice(choiceId);
  };

  const handleTextChange = (choiceId: string, text: string) => {
    editChoice(choiceId, { text });
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[280px] max-w-[400px] transition-all ${
          selected
            ? 'border-neutral-900 shadow-xl bg-cyan-50'
            : 'border-cyan-300 shadow-md hover:shadow-lg hover:border-neutral-500 bg-cyan-50'
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            {/* Show choices checkbox */}
            <div className="flex items-center space-x-2 py-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`show-choices-${id}`}
                checked={showChoices}
                onCheckedChange={handleShowChoicesChange}
                className="h-4 w-4"
              />
              <label
                htmlFor={`show-choices-${id}`}
                className="text-xs text-neutral-700 cursor-pointer select-none"
              >
                Show choices
              </label>
            </div>

            {/* Add choice button */}
            <button
              onClick={handleAddChoice}
              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-cyan-100 rounded transition-colors"
            >
              <Plus className="h-3 w-3" />
              add choice
            </button>

            {/* Choices list */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {nodeChoices.map((choice, index) => (
                <div key={choice.id} className="flex items-center gap-1.5 group relative">
                  <button
                    onClick={(e) => handleDeleteChoice(e, choice.id)}
                    className="h-5 w-5 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-cyan-100 rounded transition-colors shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <Input
                    value={choice.text}
                    onChange={(e) => handleTextChange(choice.id, e.target.value)}
                    placeholder="Enter choice text"
                    className="flex-1 border-neutral-300 text-neutral-900 text-xs placeholder:text-neutral-400 px-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`choice-${index}`}
                    className="w-3! h-3! bg-cyan-700! relative! translate-x-0! translate-y-0! right-0!"
                    style={{ position: 'relative', transform: 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChoiceNode.displayName = "ChoiceNode";
