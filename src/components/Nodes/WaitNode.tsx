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

export const WaitNode = memo((props: CustomNodeProps) => {
  const { data, id } = props;
  const { updateNodeData } = useReactFlow();

  const waitTimeOptions = [];
  for (let i = 0.5; i <= 10; i += 0.5) {
    waitTimeOptions.push(i.toFixed(1));
  }

  const currentWaitTime = data.value1 || "1.0";

  const handleWaitTimeChange = (value: string) => {
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
        accentColor="bg-emerald-50"
        borderColor="border-emerald-300"
        badgeColor="bg-emerald-700"
      />
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <Select value={currentWaitTime} onValueChange={handleWaitTimeChange}>
          <SelectTrigger className="w-20 h-6 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {waitTimeOptions.map((time) => (
              <SelectItem key={time} value={time}>
                {time}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

WaitNode.displayName = "WaitNode";
