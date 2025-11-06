"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useGameDialogStore } from "@/store/gameDialogStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomNodeProps } from "./shared";

export const ChangeVariableVariableNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const variables = useGameDialogStore((state) => state.variables);

  // value1: VariableId (target variable to change)
  // value2: -1 (fixed)
  // value3: VariableId (source variable)

  const handleTargetVariableChange = (value: string) => {
    updateNodeData(id, { value1: value, value2: "-1" });
  };

  const handleSourceVariableChange = (value: string) => {
    updateNodeData(id, { value3: value });
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all ${
          selected
            ? 'border-neutral-900 shadow-xl bg-purple-100'
            : 'border-purple-400 shadow-md hover:shadow-lg hover:border-neutral-500 bg-purple-100'
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-purple-800 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            {/* Target Variable Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Target Var:</span>
              <Select value={data.value1 || "-1"} onValueChange={handleTargetVariableChange}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono flex-1"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue placeholder="Select Variable" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="-1">-1 (None)</SelectItem>
                  {variables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      {variable.id} - {variable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Variable Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Source Var:</span>
              <Select value={data.value3 || "-1"} onValueChange={handleSourceVariableChange}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono flex-1"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue placeholder="Select Variable" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="-1">-1 (None)</SelectItem>
                  {variables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      {variable.id} - {variable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-3! h-3! bg-neutral-700!"
        />
      </div>
    </div>
  );
});

ChangeVariableVariableNode.displayName = "ChangeVariableVariableNode";
