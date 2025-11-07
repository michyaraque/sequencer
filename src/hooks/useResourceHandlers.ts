import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { DialogNodeData, SpeechText, NPC, Variable, ChoiceText } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";

interface UseResourceHandlersProps {
  setNodes: React.Dispatch<React.SetStateAction<Node<DialogNodeData>[]>>;
}

export function useResourceHandlers({ setNodes }: UseResourceHandlersProps) {
  const editSpeechText = useGameDialogStore((state) => state.editSpeechText);
  const deleteSpeechText = useGameDialogStore((state) => state.deleteSpeechText);
  const editNPC = useGameDialogStore((state) => state.editNPC);
  const deleteNPC = useGameDialogStore((state) => state.deleteNPC);
  const editVariable = useGameDialogStore((state) => state.editVariable);
  const deleteVariable = useGameDialogStore((state) => state.deleteVariable);

  const updateNodesField = useCallback((oldId: string, newId: string, field: keyof DialogNodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data[field] === oldId) {
          return { ...node, data: { ...node.data, [field]: newId } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const updateNodesMultipleFields = useCallback((oldId: string, newId: string, fields: Array<keyof DialogNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        const updates: Partial<DialogNodeData> = {};
        fields.forEach(field => {
          if (node.data[field] === oldId) {
            updates[field] = newId;
          }
        });
        if (Object.keys(updates).length > 0) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const resetNodesField = useCallback((id: string, field: keyof DialogNodeData, defaultValue: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data[field] === id) {
          return { ...node, data: { ...node.data, [field]: defaultValue } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const resetNodesMultipleFields = useCallback((id: string, fieldsWithDefaults: Array<{ field: keyof DialogNodeData; defaultValue: string }>) => {
    setNodes((nds) =>
      nds.map((node) => {
        const updates: Partial<DialogNodeData> = {};
        fieldsWithDefaults.forEach(({ field, defaultValue }) => {
          if (node.data[field] === id) {
            updates[field] = defaultValue;
          }
        });
        if (Object.keys(updates).length > 0) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleEditSpeechText = useCallback((oldId: string, speechText: SpeechText) => {
    editSpeechText(oldId, speechText);
    if (oldId !== speechText.id) {
      updateNodesField(oldId, speechText.id, "speechId");
    }
  }, [editSpeechText, updateNodesField]);

  const handleDeleteSpeechText = useCallback((id: string) => {
    deleteSpeechText(id);
    resetNodesField(id, "speechId", "-1");
  }, [deleteSpeechText, resetNodesField]);

  const handleEditNPC = useCallback((oldId: string, npc: NPC) => {
    editNPC(oldId, npc);
    if (oldId !== npc.id) {
      updateNodesMultipleFields(oldId, npc.id, ["botId", "userId"]);
    }
  }, [editNPC, updateNodesMultipleFields]);

  const handleDeleteNPC = useCallback((id: string) => {
    deleteNPC(id);
    resetNodesMultipleFields(id, [
      { field: "botId", defaultValue: "#(bot_id)" },
      { field: "userId", defaultValue: "$(user_id)" }
    ]);
  }, [deleteNPC, resetNodesMultipleFields]);

  const handleEditVariable = useCallback((oldId: string, variable: Variable) => {
    editVariable(oldId, variable);
    if (oldId !== variable.id) {
      updateNodesMultipleFields(oldId, variable.id, ["value1", "value2", "value3"]);
    }
  }, [editVariable, updateNodesMultipleFields]);

  const handleDeleteVariable = useCallback((id: string) => {
    deleteVariable(id);
    resetNodesMultipleFields(id, [
      { field: "value1", defaultValue: "-1" },
      { field: "value2", defaultValue: "-1" },
      { field: "value3", defaultValue: "-1" }
    ]);
  }, [deleteVariable, resetNodesMultipleFields]);

  const handleEditChoiceText = useCallback((oldId: string, choiceText: ChoiceText) => {
    useGameDialogStore.getState().editChoiceText(oldId, choiceText);
  }, []);

  const handleDeleteChoiceText = useCallback((id: string) => {
    useGameDialogStore.getState().deleteChoiceText(id);
  }, []);

  return {
    handleEditSpeechText,
    handleDeleteSpeechText,
    handleEditNPC,
    handleDeleteNPC,
    handleEditVariable,
    handleDeleteVariable,
    handleEditChoiceText,
    handleDeleteChoiceText,
  };
}
