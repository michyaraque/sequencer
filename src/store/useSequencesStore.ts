import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  createdAt: string;
}

interface SequencesStore {
  sequences: Sequence[];

  addSequence: (sequence: Omit<Sequence, 'id' | 'createdAt'>) => void;
  deleteSequence: (id: string) => void;
  updateSequence: (id: string, data: Partial<Omit<Sequence, 'id' | 'createdAt'>>) => void;
}

export const useSequencesStore = create<SequencesStore>()(
  persist(
    (set) => ({
      sequences: [],

      addSequence: (sequence) => {
        const newSequence: Sequence = {
          ...sequence,
          id: `seq-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          sequences: [...state.sequences, newSequence],
        }));
      },

      deleteSequence: (id) => {
        set((state) => ({
          sequences: state.sequences.filter(seq => seq.id !== id),
        }));
      },

      updateSequence: (id, data) => {
        set((state) => ({
          sequences: state.sequences.map(seq =>
            seq.id === id ? { ...seq, ...data } : seq
          ),
        }));
      },
    }),
    {
      name: "sequences-storage",
    }
  )
);
