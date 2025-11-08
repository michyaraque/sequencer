import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import { SpeechText, NPC, Variable, Choice, ChoiceText, DialogNodeData, ExportSettings } from "@/types/dialog";
import { getDefaultExportFields } from "@/utils/export";

/**
 * RoomsStore - Persistent Multi-Room Store
 *
 * Architecture Pattern: Working Copy + Persistent Store
 *
 * This store manages ALL rooms in the project and persists them to localStorage.
 * It is the single source of truth for all room data.
 *
 * Relationship with gameDialogStore:
 * - useRoomsStore: Contains ALL rooms (this file)
 * - gameDialogStore: Working copy of CURRENT room
 *
 * Room Structure:
 * - Each room is an independent workspace with its own:
 *   - Canvas nodes and edges
 *   - NPCs, variables, choices
 *   - Speech texts and settings
 *
 * Room Creation:
 * - New rooms automatically include an "Initialize Speech" node
 * - Rooms are created via addRoom() or during project creation
 *
 * @see /src/store/gameDialogStore.ts for the working copy store
 * @see /src/app/page.tsx lines 149-190 for synchronization logic
 */
export interface RoomData {
  id: string;
  name: string;
  projectName: string;
  selectedLanguage: number;
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];
  choices: Choice[];
  choiceTexts: ChoiceText[];
  exportSettings: ExportSettings;
}

interface RoomsStore {
  rooms: RoomData[];
  currentRoomId: string;

  getCurrentRoom: () => RoomData | undefined;
  addRoom: (name: string) => void;
  deleteRoom: (id: string) => void;
  switchRoom: (id: string) => void;
  updateRoomData: (id: string, data: Partial<Omit<RoomData, 'id'>>) => void;
  renameRoom: (id: string, name: string) => void;
}

const createDefaultRoom = (id: string, name: string): RoomData => {
  // Create initial node for the room
  const initialNode: Node<DialogNodeData> = {
    id: "1",
    type: "startSequence",
    position: { x: 250, y: 100 },
    data: {
      botId: "-1",
      userId: "$(user_id)",
      nextNodeId: "0",
      speechId: "-1",
      speechSpeed: "-1",
      actionId: "1",
      value1: "-1",
      value2: "-1",
      value3: "-1",
      label: "Initialize Speech",
    },
  };

  return {
    id,
    name,
    projectName: "Untitled Project",
    selectedLanguage: 1,
    nodes: [initialNode],
    edges: [],
    speechTexts: [],
    npcs: [],
    variables: [],
    choices: [],
    choiceTexts: [],
    exportSettings: {
      fields: getDefaultExportFields(),
    },
  };
};

export const useRoomsStore = create<RoomsStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      currentRoomId: "",

      getCurrentRoom: () => {
        const state = get();
        return state.rooms.find(room => room.id === state.currentRoomId);
      },

      addRoom: (name) => {
        const newId = `room-${Date.now()}`;
        const newRoom = createDefaultRoom(newId, name);

        set((state) => ({
          rooms: [...state.rooms, newRoom],
          currentRoomId: newId,
        }));
      },

      deleteRoom: (id) => {
        set((state) => {
          if (state.rooms.length === 1) {
            return state;
          }

          const newRooms = state.rooms.filter(room => room.id !== id);
          const newCurrentId = state.currentRoomId === id
            ? newRooms[0].id
            : state.currentRoomId;

          return {
            rooms: newRooms,
            currentRoomId: newCurrentId,
          };
        });
      },

      switchRoom: (id) => {
        set({ currentRoomId: id });
      },

      updateRoomData: (id, data) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === id ? { ...room, ...data } : room
          ),
        }));
      },

      renameRoom: (id, name) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === id ? { ...room, name } : room
          ),
        }));
      },
    }),
    {
      name: "rooms-storage",
    }
  )
);
