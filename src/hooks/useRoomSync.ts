import { useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { useRoomsStore, RoomData } from "@/store/useRoomsStore";

interface UseRoomSyncProps {
  currentRoomId: string;
  currentRoom: RoomData | undefined;
  rooms: RoomData[];
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<DialogNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  saveToHistory: (nodes: Node<DialogNodeData>[], edges: Edge[]) => void;
}

export function useRoomSync({
  currentRoomId,
  currentRoom,
  rooms,
  nodes,
  edges,
  setNodes,
  setEdges,
  saveToHistory,
}: UseRoomSyncProps) {
  const isLoadingRoom = useRef(false);
  const hasInitialized = useRef(false);

  const updateRoomData = useRoomsStore((state) => state.updateRoomData);
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const variables = useGameDialogStore((state) => state.variables);
  const choices = useGameDialogStore((state) => state.choices);
  const choiceTexts = useGameDialogStore((state) => state.choiceTexts);
  const exportSettings = useGameDialogStore((state) => state.exportSettings);
  const projectName = useGameDialogStore((state) => state.projectName);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);

  useEffect(() => {
    if (currentRoom) {
      isLoadingRoom.current = true;

      useGameDialogStore.getState().setNodes(currentRoom.nodes);
      useGameDialogStore.getState().setEdges(currentRoom.edges);
      useGameDialogStore.getState().setSpeechTexts(currentRoom.speechTexts);
      useGameDialogStore.getState().setNPCs(currentRoom.npcs);
      useGameDialogStore.getState().setVariables(currentRoom.variables);
      useGameDialogStore.getState().setChoices(currentRoom.choices || []);
      useGameDialogStore.getState().setChoiceTexts(currentRoom.choiceTexts || []);
      useGameDialogStore.getState().setProjectName(currentRoom.projectName);
      useGameDialogStore.getState().setSelectedLanguage(currentRoom.selectedLanguage);
      if (currentRoom.exportSettings) {
        useGameDialogStore.getState().setExportSettings(currentRoom.exportSettings);
      }

      setNodes(currentRoom.nodes);
      setEdges(currentRoom.edges);

      setTimeout(() => {
        isLoadingRoom.current = false;
      }, 100);
    }
  }, [currentRoomId, currentRoom, setNodes, setEdges]);

  useEffect(() => {
    if (currentRoomId && !isLoadingRoom.current) {
      const timeoutId = setTimeout(() => {
        updateRoomData(currentRoomId, {
          nodes,
          edges,
          speechTexts,
          npcs,
          variables,
          choices,
          choiceTexts,
          exportSettings,
          projectName,
          selectedLanguage,
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    nodes,
    edges,
    speechTexts,
    npcs,
    variables,
    choices,
    choiceTexts,
    exportSettings,
    projectName,
    selectedLanguage,
    currentRoomId,
    updateRoomData,
  ]);

  useEffect(() => {
    if (!hasInitialized.current && rooms.length > 0 && currentRoomId && nodes.length === 0) {
      const firstRoom = currentRoom;
      if (firstRoom && firstRoom.nodes.length > 0) {
        isLoadingRoom.current = true;
        setNodes(firstRoom.nodes);
        setEdges(firstRoom.edges);
        saveToHistory(firstRoom.nodes, firstRoom.edges);
        hasInitialized.current = true;
        setTimeout(() => {
          isLoadingRoom.current = false;
        }, 100);
      }
    }
  }, [rooms, currentRoomId, currentRoom, nodes.length, setNodes, setEdges, saveToHistory]);

  return { isLoadingRoom };
}
