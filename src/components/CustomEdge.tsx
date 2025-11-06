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

// Convert speech speed value to display string
function getSpeechSpeedLabel(speedValue: string): string {
  switch (speedValue) {
    case "0":
      return "0.5s";
    case "1":
      return "1s";
    case "2":
      return "2s";
    case "3":
      return "3s";
    default:
      return speedValue;
  }
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

  // Get the source node to access its speechSpeed
  const sourceNode = nodes.find((node) => node.id === source);
  const speechSpeed = sourceNode?.data?.speechSpeed;
  const sourceNodeType = sourceNode?.type;

  // Only show speech speed for specific node types
  const nodeTypesWithSpeechSpeed = ["botSpeech", "showMessage", "choice"];
  const shouldShowSpeechSpeed = sourceNodeType && nodeTypesWithSpeechSpeed.includes(sourceNodeType);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleSpeedChange = (value: string) => {
    if (sourceNode) {
      updateNodeData(sourceNode.id, { speechSpeed: value });
      setIsEditing(false);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {shouldShowSpeechSpeed && speechSpeed && speechSpeed !== "-1" && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {isEditing ? (
              <Select value={speechSpeed} onValueChange={handleSpeedChange}>
                <SelectTrigger className="w-20 h-6 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0.5s</SelectItem>
                  <SelectItem value="1">1s</SelectItem>
                  <SelectItem value="2">2s</SelectItem>
                  <SelectItem value="3">3s</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="bg-white px-2 py-0.5 rounded border border-neutral-300 shadow-sm font-mono text-neutral-700 font-semibold cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                style={{ fontSize: 10 }}
              >
                {getSpeechSpeedLabel(speechSpeed)}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CustomEdge);
