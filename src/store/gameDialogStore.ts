import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import { SpeechText, NPC, Variable, Choice, ChoiceText, DialogNodeData, ExportSettings } from "@/types/dialog";
import { getDefaultExportFields } from "@/utils/export";

interface GameDialogStore {
  projectName: string;
  selectedLanguage: number; // 1 = English, 2 = Spanish, 3 = Portuguese, 4 = French
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];
  choices: Choice[];
  choiceTexts: ChoiceText[];
  exportSettings: ExportSettings;

  setProjectName: (projectName: string) => void;
  setExportSettings: (settings: ExportSettings) => void;
  setSelectedLanguage: (language: number) => void;
  setNodes: (nodes: Node<DialogNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (nodeId: string, data: Partial<DialogNodeData>) => void;
  addNode: (node: Node<DialogNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;

  setSpeechTexts: (speechTexts: SpeechText[]) => void;
  addSpeechText: (speechText: SpeechText) => void;
  editSpeechText: (oldId: string, speechText: SpeechText) => void;
  deleteSpeechText: (id: string) => void;

  setNPCs: (npcs: NPC[]) => void;
  addNPC: (npc: NPC) => void;
  editNPC: (oldId: string, npc: NPC) => void;
  deleteNPC: (id: string) => void;

  setVariables: (variables: Variable[]) => void;
  addVariable: (variable: Variable) => void;
  editVariable: (oldId: string, variable: Variable) => void;
  deleteVariable: (id: string) => void;

  setChoices: (choices: Choice[]) => void;
  addChoice: (choice: Choice) => void;
  editChoice: (id: string, choice: Partial<Choice>) => void;
  deleteChoice: (id: string) => void;
  deleteChoicesByNodeId: (nodeId: string) => void;

  setChoiceTexts: (choiceTexts: ChoiceText[]) => void;
  addChoiceText: (choiceText: ChoiceText) => void;
  editChoiceText: (oldId: string, choiceText: ChoiceText) => void;
  deleteChoiceText: (id: string) => void;
}

export const useGameDialogStore = create<GameDialogStore>()(
  persist(
    (set) => ({
      projectName: "Untitled Project",
      selectedLanguage: 1,
      nodes: [],
      edges: [],
      speechTexts: [],
      npcs: [],
      variables: [],
      choices: [],
      choiceTexts: [],
      exportSettings: {
        fields: getDefaultExportFields(),
      },

      setProjectName: (projectName) => set({ projectName }),
      setExportSettings: (exportSettings) => set({ exportSettings }),
      setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
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

      setSpeechTexts: (speechTexts) => set({ speechTexts }),
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

      setNPCs: (npcs) => set({ npcs }),
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

      setVariables: (variables) => set({ variables }),
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

      setChoices: (choices) => set({ choices }),
      addChoice: (choice) =>
        set((state) => ({ choices: [...state.choices, choice] })),

      editChoice: (id, choice) =>
        set((state) => ({
          choices: state.choices.map((c) => (c.id === id ? { ...c, ...choice } : c)),
        })),

      deleteChoice: (id) =>
        set((state) => ({
          choices: state.choices.filter((c) => c.id !== id),
        })),

      deleteChoicesByNodeId: (nodeId) =>
        set((state) => ({
          choices: state.choices.filter((c) => c.nodeId !== nodeId),
        })),

      setChoiceTexts: (choiceTexts) => set({ choiceTexts }),
      addChoiceText: (choiceText) =>
        set((state) => ({ choiceTexts: [...state.choiceTexts, choiceText] })),

      editChoiceText: (oldId, choiceText) =>
        set((state) => ({
          choiceTexts: state.choiceTexts.map((ct) => (ct.id === oldId ? choiceText : ct)),
        })),

      deleteChoiceText: (id) =>
        set((state) => ({
          choiceTexts: state.choiceTexts.filter((ct) => ct.id !== id),
        })),
    }),
    {
      name: "game-dialog-storage",
    }
  )
);
