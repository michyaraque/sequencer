"use client";

import { memo } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseDialogNode } from "./BaseDialogNode";
import { CustomNodeProps } from "./shared";

export const RandomNode = memo((props: CustomNodeProps) => {
  const { data, id } = props;
  const { updateNodeData } = useReactFlow();

  const randomOutputOptions = Array.from({ length: 9 }, (_, i) => (i + 2).toString());
  const currentOutputs = data.value1 || "2";

  const handleOutputsChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  return (
    <div className="relative">
      <BaseDialogNode
        {...props}
        showTargetHandle={true}
        showSourceHandle={true}
        showSpeech={false}
        showBotId={false}
        accentColor="bg-teal-50"
        borderColor="border-teal-300"
        badgeColor="bg-teal-700"
      />
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <Select value={currentOutputs} onValueChange={handleOutputsChange}>
          <SelectTrigger className="w-20 h-6 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {randomOutputOptions.map((num) => (
              <SelectItem key={num} value={num}>
                {num} salidas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

RandomNode.displayName = "RandomNode";
