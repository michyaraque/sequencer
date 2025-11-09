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
import { NodeContainer } from "./NodeContainer";
import { ListCheck } from "lucide-react";

export const ConditionVariableNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const variables = useGameDialogStore((state) => state.variables);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(data.value3 || "0");

  const operators = [
    { value: "1", label: "> (Greater)" },
    { value: "2", label: "≥ (Greater or Equal)" },
    { value: "3", label: "= (Equal)" },
    { value: "4", label: "< (Less)" },
    { value: "5", label: "≤ (Less or Equal)" },
    { value: "6", label: "≠ (Not Equal)" },
  ];

  const handleVariableChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  const handleOperatorChange = (value: string) => {
    updateNodeData(id, { value2: value });
  };

  const handleValueChange = (newValue: string) => {
    updateNodeData(id, { value3: newValue });
    setIsEditingValue(false);
  };

  return (
    <NodeContainer
      selected={selected}
      color="orange"
      icon={<ListCheck size={20} />}
      label={data.label}
      subtitle="Check variable condition"
    >

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
              <SelectItem value="-1">None (-1)</SelectItem>
              {variables.map((variable) => (
                <SelectItem key={variable.id} value={variable.id}>
                  {variable.name} ({variable.id})
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
              className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded font-mono"
              autoFocus
            />
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setTempValue(data.value3 || "0");
                setIsEditingValue(true);
              }}
              className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded font-mono cursor-text hover:bg-neutral-50"
            >
              {data.value3 || "0"}
            </div>
          )}
        </div>
      </div>
    </NodeContainer>
  );
});

ConditionVariableNode.displayName = "ConditionVariableNode";
