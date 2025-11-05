import { useState, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";

interface HistoryState {
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
}

export function useDialogHistory(initialNodes: Node<DialogNodeData>[], initialEdges: Edge[]) {
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const isUpdatingFromHistory = useRef(false);

  const saveToHistory = useCallback((newNodes: Node<DialogNodeData>[], newEdges: Edge[]) => {
    if (isUpdatingFromHistory.current) return;

    setHistory((hist) => {
      const newHistory = hist.slice(0, currentHistoryIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      if (newHistory.length > 50) {
        newHistory.shift();
        setCurrentHistoryIndex((idx) => idx);
        return newHistory;
      }
      setCurrentHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentHistoryIndex]);

  const undo = useCallback((setNodes: (nodes: Node<DialogNodeData>[]) => void, setEdges: (edges: Edge[]) => void, setSelectedNode: (node: Node<DialogNodeData> | null) => void) => {
    if (currentHistoryIndex > 0) {
      isUpdatingFromHistory.current = true;
      const newIndex = currentHistoryIndex - 1;
      const state = history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setCurrentHistoryIndex(newIndex);
      setSelectedNode(null);
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 0);
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback((setNodes: (nodes: Node<DialogNodeData>[]) => void, setEdges: (edges: Edge[]) => void, setSelectedNode: (node: Node<DialogNodeData> | null) => void) => {
    if (currentHistoryIndex < history.length - 1) {
      isUpdatingFromHistory.current = true;
      const newIndex = currentHistoryIndex + 1;
      const state = history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setCurrentHistoryIndex(newIndex);
      setSelectedNode(null);
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 0);
    }
  }, [currentHistoryIndex, history]);

  return {
    history,
    currentHistoryIndex,
    saveToHistory,
    undo,
    redo,
  };
}
