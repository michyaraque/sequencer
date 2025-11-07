"use client";

import { memo, useState } from "react";
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

export const ChangeVariableNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const variables = useGameDialogStore((state) => state.variables);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(data.value3 || "0");

  const operators = [
    { value: "1", label: "Assign" },
    { value: "2", label: "Add" },
    { value: "3", label: "Substract" },
    { value: "4", label: "Multiply" },
    { value: "5", label: "Divide" },
    { value: "6", label: "Modulo" },
    { value: "7", label: "Random with upper bound" },
  ];

  const handleVariableChange = (value: string) => {
    updateNodeData(id, { value1: value, value2: "-1" });
  };

  const handleOperatorChange = (value: string) => {
    updateNodeData(id, { value2: value });
  };

  const handleValueChange = (newValue: string) => {
    updateNodeData(id, { value3: newValue });
    setIsEditingValue(false);
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all ${selected
          ? 'border-neutral-900 shadow-xl bg-purple-50'
          : 'border-purple-300 shadow-md hover:shadow-lg hover:border-neutral-500 bg-purple-50'
          }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-purple-700 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            {/* Variable Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Variable:</span>
              <Select value={data.value1 || "-1"} onValueChange={handleVariableChange}>
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

            {/* Operator Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Operator:</span>
              <Select value={data.value2 || "1"} onValueChange={handleOperatorChange}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono flex-1"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Value:</span>
              {isEditingValue ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleValueChange(tempValue)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') handleValueChange(tempValue);
                    if (e.key === 'Escape') setIsEditingValue(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-2 text-xs border bg-neutral-900/5 hover:bg-neutral-900/10 border-neutral-300 rounded-md font-mono"
                  autoFocus
                />
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempValue(data.value3 || "0");
                    setIsEditingValue(true);
                  }}
                  className="flex-1 px-2 py-2 text-xs border border-neutral-300 rounded-md font-mono cursor-text bg-neutral-900/5 hover:bg-neutral-900/10"
                >
                  {data.value3 || "0"}
                </div>
              )}
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

ChangeVariableNode.displayName = "ChangeVariableNode";
