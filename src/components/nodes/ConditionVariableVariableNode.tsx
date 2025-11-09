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
import { NodeContainer } from "./NodeContainer";
import { ListChecks, VariableIcon } from "lucide-react";

export const ConditionVariableVariableNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const variables = useGameDialogStore((state) => state.variables);

  // value1: VariableId (left side of comparison)
  // value2: Operator (1-6)
  // value3: VariableId (right side of comparison)

  const operators = [
    { value: "1", label: "= (Equal)" },
    { value: "2", label: "≠ (Not Equal)" },
    { value: "3", label: "> (Greater)" },
    { value: "4", label: "< (Less)" },
    { value: "5", label: "≥ (Greater or Equal)" },
    { value: "6", label: "≤ (Less or Equal)" }
  ];

  const handleLeftVariableChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  const handleOperatorChange = (value: string) => {
    updateNodeData(id, { value2: value });
  };

  const handleRightVariableChange = (value: string) => {
    updateNodeData(id, { value3: value });
  };

  return (
    <NodeContainer
      selected={selected}
      color="orange"
      icon={<ListChecks size={20} />}
      label={data.label}
      subtitle="Check conditions with variables"
    >

      {/* Left Variable Selector */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-neutral-500 whitespace-nowrap">Variable:</span>
        <Select value={data.value1 || "-1"} onValueChange={handleLeftVariableChange}>
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

      {/* Right Variable Selector */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-neutral-500 whitespace-nowrap">Variable:</span>
        <Select value={data.value3 || "-1"} onValueChange={handleRightVariableChange}>
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
    </NodeContainer>
  );
});

ConditionVariableVariableNode.displayName = "ConditionVariableVariableNode";
