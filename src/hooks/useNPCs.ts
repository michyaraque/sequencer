import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { NPC, DialogNodeData } from "@/types/dialog";

export function useNPCs() {
  const [npcs, setNPCs] = useState<NPC[]>([]);

  const handleAddNPC = useCallback((npc: NPC) => {
    setNPCs((prev) => [...prev, npc]);
  }, []);

  const handleEditNPC = useCallback((oldId: string, npc: NPC, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setNPCs((prev) => prev.map((n) => (n.id === oldId ? npc : n)));

    if (oldId !== npc.id) {
      setNodes((nds) =>
        nds.map((node) => {
          const updates: Partial<DialogNodeData> = {};

          if (node.data.botId === oldId) {
            updates.botId = npc.id;
          }
          if (node.data.userId === oldId) {
            updates.userId = npc.id;
          }

          if (Object.keys(updates).length > 0) {
            return {
              ...node,
              data: { ...node.data, ...updates },
            };
          }
          return node;
        })
      );
    }
  }, []);

  const handleDeleteNPC = useCallback((id: string, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setNPCs((prev) => prev.filter((n) => n.id !== id));

    setNodes((nds) =>
      nds.map((node) => {
        const updates: Partial<DialogNodeData> = {};

        if (node.data.botId === id) {
          updates.botId = "#(bot_id)";
        }
        if (node.data.userId === id) {
          updates.userId = "$(user_id)";
        }

        if (Object.keys(updates).length > 0) {
          return {
            ...node,
            data: { ...node.data, ...updates },
          };
        }
        return node;
      })
    );
  }, []);

  return {
    npcs,
    setNPCs,
    handleAddNPC,
    handleEditNPC,
    handleDeleteNPC,
  };
}
