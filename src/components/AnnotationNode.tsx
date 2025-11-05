"use client";

import { memo, useState, useCallback } from "react";
import { NodeProps, Node, useReactFlow } from "@xyflow/react";
import { MessageSquare } from "lucide-react";

export type AnnotationNodeData = {
  label?: string;
  text: string;
  level?: string;
};

export type AnnotationRFNode = Node<AnnotationNodeData>;

function AnnotationNode({ data, selected, id }: NodeProps<AnnotationRFNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.text || "");
  const { updateNodeData } = useReactFlow();

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(data.text || "");
  }, [data.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editText.trim() !== data.text) {
      updateNodeData(id, { text: editText.trim() || "Double-click to edit" });
    }
  }, [editText, data.text, id, updateNodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(data.text || "");
    }
    // Don't close on Enter since we want multiline support
  }, [data.text]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  }, []);

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 min-w-[180px] max-w-[280px] transition-all bg-yellow-50 ${
        selected
          ? "border-yellow-600 shadow-xl"
          : "border-yellow-400 shadow-md hover:shadow-lg hover:border-yellow-500"
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={14} className="text-yellow-700" />
        <span className="text-xs font-bold text-yellow-800 uppercase">Note</span>
        {data.level && (
          <span className="text-xs text-yellow-700 font-mono">{data.level}</span>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full min-h-[60px] px-2 py-1 text-sm border border-yellow-400 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white resize-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="text-sm text-yellow-900 whitespace-pre-wrap break-words cursor-text">
          {data.text || "Double-click to edit"}
        </div>
      )}

      {!isEditing && (
        <div className="text-xs text-yellow-600 mt-2 italic">
          Double-click to edit
        </div>
      )}
    </div>
  );
}

export default memo(AnnotationNode);
