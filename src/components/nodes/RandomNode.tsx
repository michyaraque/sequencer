"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomNodeProps } from "./shared";
import { Shuffle } from "lucide-react";
import { NodeContainer } from "./NodeContainer";

export const RandomNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();

  const randomOutputOptions = Array.from({ length: 9 }, (_, i) => (i + 2).toString());
  const currentOutputs = parseInt(data.value1 || "2");

  const handleOutputsChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  // Calculate handle positions
  const handlePositions = Array.from({ length: currentOutputs }, (_, i) => {
    const spacing = 100 / (currentOutputs + 1);
    return spacing * (i + 1);
  });

  return (
    <NodeContainer
      selected={selected}
      color="teal"
      icon={<Shuffle size={20} />}
      label={data.label}
      subtitle="Bot Speaks - Whisper, Talk, or Shout"
      showTargetHandle={false}
    >

        {/* Output Count Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-neutral-500 whitespace-nowrap">Outputs:</span>
          <Select value={currentOutputs.toString()} onValueChange={handleOutputsChange}>
            <SelectTrigger
              className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono flex-1"
              onClick={(e) => e.stopPropagation()}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
              {randomOutputOptions.map((num) => (
                <SelectItem key={num} value={num}>
                  {num} outputs
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {/* Dynamic output handles */}
      {handlePositions.map((position, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${index}`}
          style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
          className="w-3! h-3! bg-teal-700! "
        />
      ))}
    </NodeContainer>
  );
});

RandomNode.displayName = "RandomNode";
