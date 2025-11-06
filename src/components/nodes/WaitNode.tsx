"use client";

import { memo, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomNodeProps } from "./shared";

export const WaitNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();

  const waitTimeOptions = [];
  for (let i = 0.5; i <= 10; i += 0.5) {
    waitTimeOptions.push(i.toFixed(1));
  }

  const rawValue = data.value1 || "1000";
  let currentWaitTimeInMs = rawValue;
  let needsMigration = false;

  if (parseFloat(rawValue) <= 10) {
    currentWaitTimeInMs = (parseFloat(rawValue) * 1000).toString();
    needsMigration = true;
  }

  const currentWaitTimeInSeconds = (parseFloat(currentWaitTimeInMs) / 1000).toFixed(1);

  useEffect(() => {
    if (needsMigration) {
      updateNodeData(id, { value1: currentWaitTimeInMs });
    }
  }, [needsMigration, id, currentWaitTimeInMs, updateNodeData]);

  const handleWaitTimeChange = (valueInSeconds: string) => {
    const milliseconds = (parseFloat(valueInSeconds) * 1000).toString();
    updateNodeData(id, { value1: milliseconds });
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all ${
          selected
            ? 'border-neutral-900 shadow-xl bg-emerald-50'
            : 'border-emerald-300 shadow-md hover:shadow-lg hover:border-neutral-500 bg-emerald-50'
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-emerald-700 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            {/* Wait Time Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Wait Time:</span>
              <Select value={currentWaitTimeInSeconds} onValueChange={handleWaitTimeChange}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono flex-1"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]" onClick={(e) => e.stopPropagation()}>
                  {waitTimeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}s
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

WaitNode.displayName = "WaitNode";
