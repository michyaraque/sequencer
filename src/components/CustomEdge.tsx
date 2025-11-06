"use client";

import { memo, useState } from "react";
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from "@xyflow/react";
import { useGameDialogStore } from "@/store/gameDialogStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getNodeSpeedLabel(speedValueInMs: string): string {
  const ms = parseFloat(speedValueInMs);
  if (isNaN(ms)) return speedValueInMs;

  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  style = {},
  markerEnd,
}: EdgeProps) {
  const nodes = useGameDialogStore((state) => state.nodes);
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);

  const sourceNode = nodes.find((node) => node.id === source);
  const nodeSpeed = sourceNode?.data?.speechSpeed;
  const sourceNodeType = sourceNode?.type;

  const nodeTypesWithNodeSpeed = ["botSpeech", "showMessage", "choice"];
  const shouldShowNodeSpeed = sourceNodeType && nodeTypesWithNodeSpeed.includes(sourceNodeType);

  const nodeSpeedOptions = [];
  for (let i = 0.5; i <= 10; i += 0.5) {
    nodeSpeedOptions.push(i.toFixed(1));
  }

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const rawValue = nodeSpeed || "1000";
  let currentSpeedInMs = rawValue;

  if (parseFloat(rawValue) <= 10) {
    currentSpeedInMs = (parseFloat(rawValue) * 1000).toString();
  }

  const currentSpeedInSeconds = (parseFloat(currentSpeedInMs) / 1000).toFixed(1);

  const handleSpeedChange = (valueInSeconds: string) => {
    if (sourceNode) {
      const milliseconds = (parseFloat(valueInSeconds) * 1000).toString();
      updateNodeData(sourceNode.id, { speechSpeed: milliseconds });
      setIsEditing(false);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {shouldShowNodeSpeed && nodeSpeed && nodeSpeed !== "-1" && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
              <Select value={currentSpeedInSeconds} onValueChange={handleSpeedChange}>
                <SelectTrigger className="w-18 h-auto text-xs bg-neutral-200 hover:bg-neutral-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {nodeSpeedOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
         
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CustomEdge);
