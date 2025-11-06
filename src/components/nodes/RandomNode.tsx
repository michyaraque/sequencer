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
    // Distribute handles evenly across the height of the node
    // Add some padding at top and bottom
    const spacing = 100 / (currentOutputs + 1);
    return spacing * (i + 1);
  });

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] h-[150px] transition-all ${
          selected
            ? 'border-neutral-900 shadow-xl bg-teal-50'
            : 'border-teal-300 shadow-md hover:shadow-lg hover:border-neutral-500 bg-teal-50'
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-teal-700 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            {/* Output Count Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Salidas:</span>
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
          </div>
        </div>

        {/* Dynamic output handles */}
        {handlePositions.map((position, index) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`output-${index}`}
            style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
            className="w-3! h-3! bg-teal-700!"
          />
        ))}
      </div>
    </div>
  );
});

RandomNode.displayName = "RandomNode";
