import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { SpeechText, DialogNodeData } from "@/types/dialog";

export function useSpeechTexts() {
  const [speechTexts, setSpeechTexts] = useState<SpeechText[]>([]);

  const handleAddSpeechText = useCallback((speechText: SpeechText) => {
    setSpeechTexts((prev) => [...prev, speechText]);
  }, []);

  const handleEditSpeechText = useCallback((oldId: string, speechText: SpeechText, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setSpeechTexts((prev) => prev.map((st) => (st.id === oldId ? speechText : st)));

    if (oldId !== speechText.id) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.speechId === oldId) {
            return {
              ...node,
              data: { ...node.data, speechId: speechText.id },
            };
          }
          return node;
        })
      );
    }
  }, []);

  const handleDeleteSpeechText = useCallback((id: string, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setSpeechTexts((prev) => prev.filter((st) => st.id !== id));

    setNodes((nds) =>
      nds.map((node) => {
        if (node.data.speechId === id) {
          return {
            ...node,
            data: { ...node.data, speechId: "-1" },
          };
        }
        return node;
      })
    );
  }, []);

  return {
    speechTexts,
    setSpeechTexts,
    handleAddSpeechText,
    handleEditSpeechText,
    handleDeleteSpeechText,
  };
}
