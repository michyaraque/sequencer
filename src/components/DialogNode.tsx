"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { DialogNodeData, ACTION_TYPES } from "@/types/dialog";

export type DialogRFNode = Node<DialogNodeData>;

function DialogNode({ data, selected, id }: NodeProps<DialogRFNode>) {
  const actionLabel = ACTION_TYPES[data.actionId as unknown as keyof typeof ACTION_TYPES] || `Action ${data.actionId}`;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white min-w-[220px] transition-all ${
        selected
          ? "border-neutral-900 shadow-xl"
          : "border-neutral-300 shadow-md hover:shadow-lg hover:border-neutral-400"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! bg-neutral-700!"
      />

      <div className="space-y-2">
        {/* Node ID Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-neutral-800 text-white px-2 py-1 rounded text-xs font-bold font-mono">
            ID: {id}
          </div>
          {data.label && (
            <div className="text-xs text-neutral-600 truncate flex-1">
              {data.label}
            </div>
          )}
        </div>

        <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
          <div className="flex justify-between gap-2">
            <span className="font-medium text-neutral-500">Bot ID:</span>
            <span className="font-mono text-neutral-900">{data.botId || "-1"}</span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-medium text-neutral-500">Action:</span>
            <span className="text-xs truncate max-w-[120px] text-neutral-900" title={actionLabel}>
              {data.actionId}
            </span>
          </div>

          {data.speechId !== "-1" && data.speechId && (
            <div className="flex justify-between gap-2">
              <span className="font-medium text-neutral-500">Speech:</span>
              <span className="font-mono text-neutral-900">{data.speechId}</span>
            </div>
          )}

          {data.value1 !== "-1" && data.value1 && (
            <div className="flex justify-between gap-2">
              <span className="font-medium text-neutral-500">Value1:</span>
              <span className="font-mono text-xs truncate max-w-[100px] text-neutral-900" title={data.value1}>
                {data.value1}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3! h-3! bg-neutral-700!"
      />
    </div>
  );
}

export default memo(DialogNode);
