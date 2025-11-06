import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { DialogNodeData, ExportSettings } from "@/types/dialog";
import { exportToDialogFormat, downloadDialogFile, importFromDialogFormat } from "@/utils/export";

interface UseDialogExportProps {
  nodes: Node<DialogNodeData>[];
  setNodes: (nodes: Node<DialogNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node<DialogNodeData> | null) => void;
  saveToHistory: (nodes: Node<DialogNodeData>[], edges: Edge[]) => void;
  exportSettings?: ExportSettings;
  onShowAlert?: (message: string, variant?: 'default' | 'success' | 'error') => void;
}

export function useDialogExport({
  nodes,
  setNodes,
  setEdges,
  setSelectedNode,
  saveToHistory,
  exportSettings,
  onShowAlert,
}: UseDialogExportProps) {
  const handleExport = useCallback(() => {
    const exportContent = exportToDialogFormat(nodes, exportSettings);
    downloadDialogFile(exportContent, "dialog_export.txt");
  }, [nodes, exportSettings]);

  const handleCopyToClipboard = useCallback(() => {
    const exportContent = exportToDialogFormat(nodes, exportSettings);
    navigator.clipboard.writeText(exportContent);
    if (onShowAlert) {
      onShowAlert("Dialog data copied to clipboard!", "success");
    }
  }, [nodes, exportSettings, onShowAlert]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const importedData = importFromDialogFormat(content);

        const importedNodes: Node<DialogNodeData>[] = importedData.map((data, index) => ({
          id: `${index + 1}`,
          type: "dialogNode",
          position: {
            x: 100 + (index % 3) * 300,
            y: 100 + Math.floor(index / 3) * 200,
          },
          data,
        }));

        setNodes(importedNodes);
        setEdges([]);
        setSelectedNode(null);
        saveToHistory(importedNodes, []);
      };
      reader.readAsText(file);
    }
  }, [setNodes, setEdges, setSelectedNode, saveToHistory]);

  return {
    handleExport,
    handleCopyToClipboard,
    handleImport,
  };
}
