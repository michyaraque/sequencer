import { useEffect } from "react";
import { Node, Edge } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";

interface UseDialogKeyboardProps {
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  undo: () => void;
  redo: () => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  onDeleteEdges: (edgeIds: string[]) => void;
  isModalOpen?: boolean;
}

export function useDialogKeyboard({
  nodes,
  edges,
  undo,
  redo,
  onDeleteNodes,
  onDeleteEdges,
  isModalOpen = false,
}: UseDialogKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if a modal is open
      if (isModalOpen) {
        return;
      }

      // Don't handle keyboard shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isEditingText =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.hasAttribute('contenteditable');

      if (isEditingText) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        ((event.ctrlKey || event.metaKey) && event.key === "y") ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "z")
      ) {
        event.preventDefault();
        redo();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length > 0) {
          event.preventDefault();
          const selectedNodeIds = selectedNodes.map((node) => node.id);
          onDeleteNodes(selectedNodeIds);
        } else if (selectedEdges.length > 0) {
          event.preventDefault();
          const selectedEdgeIds = selectedEdges.map((edge) => edge.id);
          onDeleteEdges(selectedEdgeIds);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, undo, redo, onDeleteNodes, onDeleteEdges, isModalOpen]);
}
