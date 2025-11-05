"use client";

import { memo } from "react";
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { useGameDialogStore } from "@/store/gameDialogStore";

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

  // Get the source node to access its speechSpeed
  const sourceNode = nodes.find((node) => node.id === source);
  const speechSpeed = sourceNode?.data?.speechSpeed;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {speechSpeed && speechSpeed !== "-1" && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white px-2 py-0.5 rounded border border-neutral-300 shadow-sm font-mono text-neutral-700 font-semibold"
          >
            {getSpeechSpeedLabel(speechSpeed)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CustomEdge);
