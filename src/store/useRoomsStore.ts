import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "@xyflow/react";
import { SpeechText, NPC, Variable, DialogNodeData } from "@/types/dialog";

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

const createDefaultRoom = (id: string, name: string): RoomData => ({
  id,
  name,
  projectName: "Untitled Project",
  selectedLanguage: 1,
  nodes: [],
  edges: [],
  speechTexts: [],
  npcs: [],
  variables: [],
});

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
