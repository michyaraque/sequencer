"use client";

import { memo, useState, useCallback } from "react";
import { NodeProps, Node, useReactFlow } from "@xyflow/react";
import { MessageSquare, Palette } from "lucide-react";

export type AnnotationNodeData = {
  label?: string;
  text: string;
  level?: string;
  color?: string;
};

export type AnnotationRFNode = Node<AnnotationNodeData>;

const ANNOTATION_COLORS = [
  { name: "Yellow", bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-900", hover: "hover:border-yellow-500", icon: "text-yellow-700" },
  { name: "Blue", bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-900", hover: "hover:border-blue-500", icon: "text-blue-700" },
  { name: "Green", bg: "bg-green-50", border: "border-green-400", text: "text-green-900", hover: "hover:border-green-500", icon: "text-green-700" },
  { name: "Pink", bg: "bg-pink-50", border: "border-pink-400", text: "text-pink-900", hover: "hover:border-pink-500", icon: "text-pink-700" },
  { name: "Purple", bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-900", hover: "hover:border-purple-500", icon: "text-purple-700" },
  { name: "Orange", bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-900", hover: "hover:border-orange-500", icon: "text-orange-700" },
];

function AnnotationNode({ data, selected, id }: NodeProps<AnnotationRFNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.text || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { updateNodeData } = useReactFlow();

  const currentColor = ANNOTATION_COLORS.find(c => c.name === data.color) || ANNOTATION_COLORS[0];

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
    e.stopPropagation();

    if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(data.text || "");
    }
  }, [data.text]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleColorChange = useCallback((colorName: string) => {
    updateNodeData(id, { color: colorName });
    setShowColorPicker(false);
  }, [id, updateNodeData]);

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 min-w-[180px] max-w-[280px] transition-all ${currentColor.bg} ${
        selected
          ? `${currentColor.border.replace('400', '600')} shadow-xl`
          : `${currentColor.border} shadow-md hover:shadow-lg ${currentColor.hover}`
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center gap-2 mb-2 justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className={currentColor.icon} />
          <span className={`text-xs font-bold uppercase ${currentColor.text}`}>Note</span>
          {data.level && (
            <span className={`text-xs font-mono ${currentColor.icon}`}>{data.level}</span>
          )}
        </div>

        {/* Color picker button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${currentColor.icon}`}
            title="Change color"
          >
            <Palette size={12} />
          </button>

          {showColorPicker && (
            <div
              className="absolute top-6 right-0 bg-white rounded-lg shadow-xl border border-neutral-200 p-2 z-50 flex gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {ANNOTATION_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-6 h-6 rounded ${color.bg} ${color.border} border-2 hover:scale-110 transition-transform ${
                    currentColor.name === color.name ? 'ring-2 ring-neutral-900 ring-offset-1' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`w-full min-h-[60px] px-2 py-1 text-sm border ${currentColor.border} rounded focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white resize-none`}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className={`text-sm ${currentColor.text} whitespace-pre-wrap wrap-break-word cursor-text`}>
          {data.text || "Double-click to edit"}
        </div>
      )}

      
    </div>
  );
}

export default memo(AnnotationNode);
