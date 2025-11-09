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
import { ReplaceAll } from "lucide-react";

export const ChangeVariableVariableNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const variables = useGameDialogStore((state) => state.variables);

  const handleTargetVariableChange = (value: string) => {
    updateNodeData(id, { value1: value, value2: "-1" });
  };

  const handleSourceVariableChange = (value: string) => {
    updateNodeData(id, { value3: value });
  };

  return (
    <NodeContainer
      selected={selected}
      color="purple"
      icon={<ReplaceAll size={20} />}
      label={data.label}
      subtitle="Change Variable With Variable"
    >
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
            <SelectItem value="-1">None (-1)</SelectItem>
            {variables.map((variable) => (
              <SelectItem key={variable.id} value={variable.id}>
                {variable.name} ({variable.id})
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

ChangeVariableVariableNode.displayName = "ChangeVariableVariableNode";
