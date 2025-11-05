import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import { SpeechText, NPC, Variable, DialogNodeData } from "@/types/dialog";

interface GameDialogStore {
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];

  setNodes: (nodes: Node<DialogNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (nodeId: string, data: Partial<DialogNodeData>) => void;
  addNode: (node: Node<DialogNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;

  addSpeechText: (speechText: SpeechText) => void;
  editSpeechText: (oldId: string, speechText: SpeechText) => void;
  deleteSpeechText: (id: string) => void;

  addNPC: (npc: NPC) => void;
  editNPC: (oldId: string, npc: NPC) => void;
  deleteNPC: (id: string) => void;

  addVariable: (variable: Variable) => void;
  editVariable: (oldId: string, variable: Variable) => void;
  deleteVariable: (id: string) => void;
}

export const useGameDialogStore = create<GameDialogStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      speechTexts: [],
      npcs: [],
      variables: [],

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      updateNode: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
          ),
        })),

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),

      deleteNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        })),

      deleteNodes: (nodeIds) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
          edges: state.edges.filter(
            (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
          ),
        })),

      addSpeechText: (speechText) =>
        set((state) => ({ speechTexts: [...state.speechTexts, speechText] })),

      editSpeechText: (oldId, speechText) =>
        set((state) => ({
          speechTexts: state.speechTexts.map((st) => (st.id === oldId ? speechText : st)),
        })),

      deleteSpeechText: (id) =>
        set((state) => ({
          speechTexts: state.speechTexts.filter((st) => st.id !== id),
        })),

      addNPC: (npc) =>
        set((state) => ({ npcs: [...state.npcs, npc] })),

      editNPC: (oldId, npc) =>
        set((state) => ({
          npcs: state.npcs.map((n) => (n.id === oldId ? npc : n)),
        })),

      deleteNPC: (id) =>
        set((state) => ({
          npcs: state.npcs.filter((n) => n.id !== id),
        })),

      addVariable: (variable) =>
        set((state) => ({ variables: [...state.variables, variable] })),

      editVariable: (oldId, variable) =>
        set((state) => ({
          variables: state.variables.map((v) => (v.id === oldId ? variable : v)),
        })),

      deleteVariable: (id) =>
        set((state) => ({
          variables: state.variables.filter((v) => v.id !== id),
        })),
    }),
    {
      name: "game-dialog-storage",
    }
  )
);
