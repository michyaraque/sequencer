"use client";

import { useEffect, useState } from "react";
import { Sequence } from "@/store/useSequencesStore";
import { Copy, Trash2 } from "lucide-react";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  sequences: Sequence[];
  onClose: () => void;
  onCreateSequence: (sequence: Sequence) => void;
  onDeleteSequence: (sequenceId: string) => void;
}

export default function CanvasContextMenu({
  x,
  y,
  sequences,
  onClose,
  onCreateSequence,
  onDeleteSequence,
}: CanvasContextMenuProps) {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position if menu would go off-screen
    const menuWidth = 280;
    const menuHeight = Math.min(400, sequences.length * 40 + 100);

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }

    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y, sequences.length]);

  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleCreateClick = (e: React.MouseEvent, sequence: Sequence) => {
    e.stopPropagation();
    onCreateSequence(sequence);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, sequenceId: string) => {
    e.stopPropagation();
    onDeleteSequence(sequenceId);
  };

  return (
    <div
      className="fixed bg-white border border-neutral-300 rounded-lg shadow-xl z-50 py-2 min-w-[280px] max-w-[320px] max-h-[400px] overflow-y-auto"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        Create Sequence
      </div>

      {sequences.length === 0 ? (
        <div className="px-3 py-6 text-sm text-neutral-500 text-center">
          No sequences saved yet.
          <br />
          <span className="text-xs">Select nodes and save them as a sequence.</span>
        </div>
      ) : (
        <div className="space-y-0.5">
          {sequences.map((sequence) => (
            <div
              key={sequence.id}
              className="group flex items-center justify-between px-3 py-2 hover:bg-neutral-100 cursor-pointer transition-colors"
              onClick={(e) => handleCreateClick(e, sequence)}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <Copy size={14} className="text-neutral-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">
                      {sequence.name}
                    </div>
                    {sequence.description && (
                      <div className="text-xs text-neutral-500 truncate">
                        {sequence.description}
                      </div>
                    )}
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {sequence.nodes.length} node{sequence.nodes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteClick(e, sequence.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded transition-all flex-shrink-0"
                title="Delete sequence"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
