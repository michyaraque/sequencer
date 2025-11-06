"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, Node, NodeTypes, EdgeTypes, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Undo2, Redo2, Trash2, Variable, Download, Copy, Upload, Languages, Save, Menu, X, Plus, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  InitializeSpeechNode,
  BotSpeechNode,
  ShowMessageNode,
  ChangeVariableNode,
  ChangeVariableVariableNode,
  ConditionVariableNode,
  ConditionVariableVariableNode,
  ChoiceNode,
  RandomNode,
  WaitNode,
  CustomActionNode,
  EndDialogueNode,
  CustomNodeProps,
  DialogNode,
  AnnotationNode
} from "@/components/nodes";
import CustomEdge from "@/components/CustomEdge";
import EmptyState from "@/components/EmptyState";
import NodeEditor from "@/components/NodeEditor";
import SpeechTextManager from "@/components/SpeechTextManager";
import NPCManager from "@/components/NPCManager";
import VariableManager from "@/components/VariableManager";
import ChoicesTextManager from "@/components/ChoicesTextManager";
import ExportSettingsDialog from "@/components/ExportSettingsDialog";
import Sidebar from "@/components/Sidebar";
import { DialogNodeData } from "@/types/dialog";
import { useDialogHistory } from "@/hooks/useDialogHistory";
import { useDialogNodes, getNextNodeId } from "@/hooks/useDialogNodes";
import { useDialogKeyboard } from "@/hooks/useDialogKeyboard";
import { useDialogExport } from "@/hooks/useNodeExport";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { useRecentProjectsStore } from "@/store/recentProjectsStore";
import { useRoomsStore } from "@/store/useRoomsStore";
import { useSequencesStore } from "@/store/useSequencesStore";
import RoomTabs from "@/components/RoomTabs";
import SaveSequenceDialog from "@/components/SaveSequenceDialog";
import CanvasContextMenu from "@/components/CanvasContextMenu";
import SequenceManager from "@/components/SequenceManager";
import MobileNodePalette from "@/components/MobileNodePalette";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useReactFlow } from "@xyflow/react";
import { exportProject, importProject, downloadProjectFile, exportSpeechTexts, downloadSpeechTextsFile } from "@/utils/export";
import { toast } from "sonner";

function getDefaultNodeData(nodeType: string, nodeId: string): DialogNodeData {
  // Only nodes of type botSpeech, showMessage, and choice should have speechSpeed
  const nodeTypesWithSpeechSpeed = ["botSpeech", "showMessage", "choice"];
  const defaultSpeechSpeed = nodeTypesWithSpeechSpeed.includes(nodeType) ? "2" : "-1";

  const baseData = {
    botId: "-1",
    userId: "$(user_id)",
    nextNodeId: "-1",
    speechId: "-1",
    speechSpeed: defaultSpeechSpeed,
    value1: "-1",
    value2: "-1",
    value3: "-1",
  };

  switch (nodeType) {
    case "initializeSpeech":
      return { ...baseData, actionId: "1", label: "Initialize Dialogue" };
    case "botSpeech":
      return { ...baseData, actionId: "2", label: "Bot Speech", value1: "2" }; // Default to Talk
    case "showMessage":
      return { ...baseData, actionId: "3", label: "Show Message", value1: "1", value2: "1", value3: "1" };
    case "changeVariable":
      return { ...baseData, actionId: "4", label: "Change Variable" };
    case "changeVariableVariable":
      return { ...baseData, actionId: "5", label: "Change Variable by Variable" };
    case "conditionVariable":
      return { ...baseData, actionId: "6", label: "Condition Variable" };
    case "conditionVariableVariable":
      return { ...baseData, actionId: "7", label: "Condition Variable by Variable" };
    case "choice":
      return { ...baseData, actionId: "8", label: "Choice", value1: "2" }; // Default 2 options
    case "random":
      return { ...baseData, actionId: "9", label: "Random", value1: "2" }; // Default 2 outputs
    case "wait":
      return { ...baseData, actionId: "97", label: "Wait", value1: "1000" };
    case "customAction":
      return { ...baseData, actionId: "98", label: "Custom Wired Action" };
    case "endDialogue":
      return { ...baseData, actionId: "99", label: "End Dialogue", nextNodeId: "-1" };
    default:
      return { ...baseData, actionId: "1001", label: `New Node ${nodeId}` };
  }
}

const initialNodes: Node<DialogNodeData>[] = [];

function FlowEditor() {
  const [showSpeechTextManager, setShowSpeechTextManager] = useState(false);
  const [showNPCManager, setShowNPCManager] = useState(false);
  const [showVariableManager, setShowVariableManager] = useState(false);
  const [showChoicesManager, setShowChoicesManager] = useState(false);
  const [showSequenceManager, setShowSequenceManager] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showSaveSequenceDialog, setShowSaveSequenceDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileNodeEditor, setShowMobileNodeEditor] = useState(false);
  const [showMobileNodePalette, setShowMobileNodePalette] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(true);

  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const variables = useGameDialogStore((state) => state.variables);
  const choices = useGameDialogStore((state) => state.choices);
  const choiceTexts = useGameDialogStore((state) => state.choiceTexts);
  const exportSettings = useGameDialogStore((state) => state.exportSettings);
  const projectName = useGameDialogStore((state) => state.projectName);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useGameDialogStore((state) => state.setSelectedLanguage);
  const setProjectName = useGameDialogStore((state) => state.setProjectName);
  const storedNodes = useGameDialogStore((state) => state.nodes);
  const storedEdges = useGameDialogStore((state) => state.edges);

  const currentRoom = useRoomsStore((state) => state.getCurrentRoom());
  const currentRoomId = useRoomsStore((state) => state.currentRoomId);
  const updateRoomData = useRoomsStore((state) => state.updateRoomData);
  const rooms = useRoomsStore((state) => state.rooms);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const hasRooms = rooms.length > 0;

  const sequences = useSequencesStore((state) => state.sequences);
  const addSequence = useSequencesStore((state) => state.addSequence);
  const deleteSequence = useSequencesStore((state) => state.deleteSequence);
  const updateSequence = useSequencesStore((state) => state.updateSequence);

  const isLoadingRoom = useRef(false);

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

      setTimeout(() => {
        isLoadingRoom.current = false;
      }, 100);
    }
  }, [currentRoomId, currentRoom]);

  useEffect(() => {
    if (currentRoomId && !isLoadingRoom.current) {
      const timeoutId = setTimeout(() => {
        updateRoomData(currentRoomId, {
          nodes: storedNodes,
          edges: storedEdges,
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
  }, [storedNodes, storedEdges, speechTexts, npcs, variables, choices, choiceTexts, exportSettings, projectName, selectedLanguage, currentRoomId, updateRoomData]);

  const nodeTypes: NodeTypes = useMemo(() => {
    const createNodeWithProps = (Component: React.ComponentType<CustomNodeProps>) => {
      return (props: CustomNodeProps) => (
        <Component
          {...props}
          onOpenSpeechManager={() => setShowSpeechTextManager(true)}
          onOpenNPCManager={() => setShowNPCManager(true)}
        />
      );
    };

    return {
      dialogNode: createNodeWithProps(DialogNode),
      initializeSpeech: createNodeWithProps(InitializeSpeechNode),
      botSpeech: createNodeWithProps(BotSpeechNode),
      showMessage: createNodeWithProps(ShowMessageNode),
      changeVariable: createNodeWithProps(ChangeVariableNode),
      changeVariableVariable: createNodeWithProps(ChangeVariableVariableNode),
      conditionVariable: createNodeWithProps(ConditionVariableNode),
      conditionVariableVariable: createNodeWithProps(ConditionVariableVariableNode),
      choice: createNodeWithProps(ChoiceNode),
      random: createNodeWithProps(RandomNode),
      wait: createNodeWithProps(WaitNode),
      customAction: createNodeWithProps(CustomActionNode),
      endDialogue: createNodeWithProps(EndDialogueNode),
      annotation: AnnotationNode,
    };
  }, []);

  const edgeTypes: EdgeTypes = useMemo(() => {
    return {
      default: CustomEdge,
    };
  }, []);

  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const editSpeechText = useGameDialogStore((state) => state.editSpeechText);
  const deleteSpeechText = useGameDialogStore((state) => state.deleteSpeechText);

  const addNPC = useGameDialogStore((state) => state.addNPC);
  const editNPC = useGameDialogStore((state) => state.editNPC);
  const deleteNPC = useGameDialogStore((state) => state.deleteNPC);

  const addVariable = useGameDialogStore((state) => state.addVariable);
  const editVariable = useGameDialogStore((state) => state.editVariable);
  const deleteVariable = useGameDialogStore((state) => state.deleteVariable);

  const addChoiceText = useGameDialogStore((state) => state.addChoiceText);
  const editChoiceText = useGameDialogStore((state) => state.editChoiceText);
  const deleteChoiceText = useGameDialogStore((state) => state.deleteChoiceText);

  const { history, currentHistoryIndex, saveToHistory, undo, redo } = useDialogHistory(
    initialNodes,
    []);

  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onNodeClick,
    onPaneClick,
    addNewNode,
    updateNodeData,
    deleteSelectedNode,
    deleteNodesByIds,
    deleteEdgesByIds,
  } = useDialogNodes({ initialNodes, saveToHistory });

  const hasInitialized = useRef(false);
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
  }, [rooms, currentRoomId, currentRoom]);

  useEffect(() => {
    const setStoredNodes = useGameDialogStore.getState().setNodes;
    const setStoredEdges = useGameDialogStore.getState().setEdges;

    const timeoutId = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        setStoredNodes(nodes);
        setStoredEdges(edges);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

  const handleEditSpeechText = useCallback((oldId: string, speechText: any) => {
    editSpeechText(oldId, speechText);
    if (oldId !== speechText.id) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.speechId === oldId) {
            return { ...node, data: { ...node.data, speechId: speechText.id } };
          }
          return node;
        })
      );
    }
  }, [editSpeechText, setNodes]);

  const handleDeleteSpeechText = useCallback((id: string) => {
    deleteSpeechText(id);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data.speechId === id) {
          return { ...node, data: { ...node.data, speechId: "-1" } };
        }
        return node;
      })
    );
  }, [deleteSpeechText, setNodes]);

  const handleEditNPC = useCallback((oldId: string, npc: any) => {
    editNPC(oldId, npc);
    if (oldId !== npc.id) {
      setNodes((nds) =>
        nds.map((node) => {
          const updates: any = {};
          if (node.data.botId === oldId) updates.botId = npc.id;
          if (node.data.userId === oldId) updates.userId = npc.id;
          if (Object.keys(updates).length > 0) {
            return { ...node, data: { ...node.data, ...updates } };
          }
          return node;
        })
      );
    }
  }, [editNPC, setNodes]);

  const handleDeleteNPC = useCallback((id: string) => {
    deleteNPC(id);
    setNodes((nds) =>
      nds.map((node) => {
        const updates: any = {};
        if (node.data.botId === id) updates.botId = "#(bot_id)";
        if (node.data.userId === id) updates.userId = "$(user_id)";
        if (Object.keys(updates).length > 0) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return node;
      })
    );
  }, [deleteNPC, setNodes]);

  const handleEditVariable = useCallback((oldId: string, variable: any) => {
    editVariable(oldId, variable);
    if (oldId !== variable.id) {
      setNodes((nds) =>
        nds.map((node) => {
          const updates: any = {};
          if (node.data.value1 === oldId) updates.value1 = variable.id;
          if (node.data.value2 === oldId) updates.value2 = variable.id;
          if (node.data.value3 === oldId) updates.value3 = variable.id;
          if (Object.keys(updates).length > 0) {
            return { ...node, data: { ...node.data, ...updates } };
          }
          return node;
        })
      );
    }
  }, [editVariable, setNodes]);

  const handleDeleteVariable = useCallback((id: string) => {
    deleteVariable(id);
    setNodes((nds) =>
      nds.map((node) => {
        const updates: any = {};
        if (node.data.value1 === id) updates.value1 = "-1";
        if (node.data.value2 === id) updates.value2 = "-1";
        if (node.data.value3 === id) updates.value3 = "-1";
        if (Object.keys(updates).length > 0) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return node;
      })
    );
  }, [deleteVariable, setNodes]);

  const handleEditChoiceText = useCallback((oldId: string, choiceText: any) => {
    editChoiceText(oldId, choiceText);
  }, [editChoiceText]);

  const handleDeleteChoiceText = useCallback((id: string) => {
    deleteChoiceText(id);
  }, [deleteChoiceText]);

  const { handleExport, handleCopyToClipboard, handleImport } = useDialogExport({
    nodes,
    setNodes,
    setEdges,
    setSelectedNode,
    saveToHistory,
    exportSettings,
    onShowAlert: (message, variant) => {
      if (variant === 'success') {
        toast.success(message);
      } else if (variant === 'error') {
        toast.error(message);
      } else {
        toast(message);
      }
    },
  });

  const handleExportProject = useCallback(() => {
    if (currentRoomId && !isLoadingRoom.current) {
      updateRoomData(currentRoomId, {
        nodes: storedNodes,
        edges: storedEdges,
        speechTexts,
        npcs,
        variables,
        projectName,
        selectedLanguage,
      });
    }

    const content = exportProject(rooms, projectName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.json`;
    downloadProjectFile(content, filename);
  }, [rooms, projectName, currentRoomId, storedNodes, storedEdges, speechTexts, npcs, variables, selectedLanguage, updateRoomData]);

  const handleExportSpeeches = useCallback(() => {
    const content = exportSpeechTexts(speechTexts);
    downloadSpeechTextsFile(content, "speech_texts.txt");
    toast.success("Speech texts exported successfully!");
  }, [speechTexts]);

  const handleImportProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const project = importProject(content);

          if (project && project.rooms) {
            useRoomsStore.setState({
              rooms: project.rooms,
              currentRoomId: project.rooms[0]?.id || "",
            });

            const firstRoom = project.rooms[0];
            if (firstRoom) {
              isLoadingRoom.current = true;
              useGameDialogStore.getState().setNodes(firstRoom.nodes);
              useGameDialogStore.getState().setEdges(firstRoom.edges);
              useGameDialogStore.getState().setSpeechTexts(firstRoom.speechTexts);
              useGameDialogStore.getState().setNPCs(firstRoom.npcs);
              useGameDialogStore.getState().setVariables(firstRoom.variables);
              useGameDialogStore.getState().setProjectName(firstRoom.projectName);
              useGameDialogStore.getState().setSelectedLanguage(firstRoom.selectedLanguage);

              saveToHistory(firstRoom.nodes, firstRoom.edges);

              setTimeout(() => {
                isLoadingRoom.current = false;
              }, 100);
            }

            toast.success(`Project imported with ${project.rooms.length} room(s)!`);
          } else {
            toast.error('Failed to import project. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [saveToHistory]);

  const handleCreateProject = useCallback((projectName: string) => {
    if (rooms.length === 0) {
      addRoom("Room 1");
    }

    // Set project name
    setProjectName(projectName);

    const initialNode: Node<DialogNodeData> = {
      id: "1",
      type: "initializeSpeech",
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

    setNodes([initialNode]);
    setEdges([]);
    saveToHistory([initialNode], []);

    toast.success(`Project "${projectName}" created successfully!`);
  }, [setProjectName, setNodes, setEdges, saveToHistory, addRoom, rooms.length]);

  const handleLoadRecentProject = useCallback((projectName: string) => {
    const roomsState = useRoomsStore.getState();

    if (roomsState.rooms.length > 0) {
      const targetRoom = roomsState.rooms.find(r => r.projectName === projectName) || roomsState.rooms[0];

      useRoomsStore.getState().switchRoom(targetRoom.id);

      toast.success(`Loaded "${targetRoom.projectName}"`);
    } else {
      toast.error('No saved projects found');
    }
  }, []);

  useEffect(() => {
    if (nodes.length > 0 && projectName !== "Untitled Project" && hasRooms) {
      const timeoutId = setTimeout(() => {
        const addRecentProject = useRecentProjectsStore.getState().addRecentProject;
        addRecentProject({
          name: projectName,
          nodeCount: nodes.length,
          speechCount: speechTexts.length,
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, speechTexts.length, projectName, hasRooms]);

  const handleUndo = () => undo(setNodes, setEdges, setSelectedNode);
  const handleRedo = () => redo(setNodes, setEdges, setSelectedNode);

  useDialogKeyboard({
    nodes,
    edges,
    undo: handleUndo,
    redo: handleRedo,
    onDeleteNodes: deleteNodesByIds,
    onDeleteEdges: deleteEdgesByIds,
    isModalOpen: showSpeechTextManager || showNPCManager || showVariableManager || showChoicesManager || showSequenceManager,
  });

  const { screenToFlowPosition } = useReactFlow();

  const handleExitProject = useCallback(() => {
    useRoomsStore.setState({
      currentRoomId: "",
    });

    useGameDialogStore.getState().setNodes([]);
    useGameDialogStore.getState().setEdges([]);
    useGameDialogStore.getState().setSpeechTexts([]);
    useGameDialogStore.getState().setNPCs([]);
    useGameDialogStore.getState().setVariables([]);
    useGameDialogStore.getState().setProjectName("Untitled Project");
    useGameDialogStore.getState().setSelectedLanguage(1);

    toast.success("Project closed");
  }, []);

  const handleSaveSequence = useCallback((name: string, description: string) => {
    const selectedNodes = nodes.filter(node => node.selected);

    if (selectedNodes.length === 0) {
      toast.error("No nodes selected");
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const selectedEdges = edges.filter(edge =>
      selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    addSequence({
      name,
      description,
      nodes: selectedNodes,
      edges: selectedEdges,
    });

    setShowSaveSequenceDialog(false);
    toast.success(`Sequence "${name}" saved with ${selectedNodes.length} nodes`);
  }, [nodes, edges, addSequence]);

  const handleCreateFromSequence = useCallback((sequence: any, clickPosition: { x: number; y: number }) => {
    if (!sequence.nodes || sequence.nodes.length === 0) {
      toast.error("Sequence has no nodes");
      return;
    }

    const originalNodes = sequence.nodes;
    const minX = Math.min(...originalNodes.map((n: Node) => n.position.x));
    const minY = Math.min(...originalNodes.map((n: Node) => n.position.y));

    const flowPosition = screenToFlowPosition(clickPosition);

    const idMap = new Map<string, string>();
    let currentMaxId = Math.max(...nodes.map(n => parseInt(n.id, 10)).filter(id => !isNaN(id)), 0);

    originalNodes.forEach((node: Node) => {
      currentMaxId++;
      const newId = `${currentMaxId}`;
      idMap.set(node.id, newId);
    });

    const newNodes: Node<DialogNodeData>[] = originalNodes.map((node: Node<DialogNodeData>) => {
      const newId = idMap.get(node.id)!;
      const offsetX = node.position.x - minX;
      const offsetY = node.position.y - minY;

      return {
        ...node,
        id: newId,
        position: {
          x: flowPosition.x + offsetX,
          y: flowPosition.y + offsetY,
        },
        selected: false,
      };
    });

    const newEdges: Edge[] = sequence.edges.map((edge: Edge) => {
      const newSource = idMap.get(edge.source);
      const newTarget = idMap.get(edge.target);

      if (!newSource || !newTarget) return null;

      return {
        ...edge,
        id: `${newSource}-${newTarget}`,
        source: newSource,
        target: newTarget,
      };
    }).filter(Boolean) as Edge[];

    const finalNodes = newNodes.map(node => {
      if (node.data.nextNodeId && idMap.has(node.data.nextNodeId)) {
        return {
          ...node,
          data: {
            ...node.data,
            nextNodeId: idMap.get(node.data.nextNodeId)!,
          },
        };
      }
      return node;
    });

    setNodes((nds) => {
      const updatedNodes = [...nds, ...finalNodes];
      setTimeout(() => saveToHistory(updatedNodes, [...edges, ...newEdges]), 0);
      return updatedNodes;
    });

    setEdges((eds) => [...eds, ...newEdges]);

    toast.success(`Created ${finalNodes.length} nodes from sequence "${sequence.name}"`);
  }, [nodes, edges, setNodes, setEdges, saveToHistory, screenToFlowPosition]);

  const handleContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteSequence = useCallback((sequenceId: string) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (sequence) {
      deleteSequence(sequenceId);
      toast.success(`Sequence "${sequence.name}" deleted`);
    }
  }, [sequences, deleteSequence]);

  const handleEditSequence = useCallback((id: string, data: { name: string; description?: string }) => {
    updateSequence(id, data);
    toast.success("Sequence updated");
  }, [updateSequence]);

  const handleMobileAddNode = useCallback((nodeType: string) => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const position = screenToFlowPosition({
      x: centerX,
      y: centerY,
    });

    const newNodeId = getNextNodeId(nodes);

    let newNode: Node<any>;

    if (nodeType === "annotation") {
      newNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: {
          text: "Double-click to edit",
          label: "Note",
          color: "Yellow",
        },
      };
    } else {
      newNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: getDefaultNodeData(nodeType, newNodeId),
      };
    }

    setNodes((nds) => {
      const newNodes = nds.concat(newNode);
      setTimeout(() => saveToHistory(newNodes, edges), 0);
      return newNodes;
    });

    toast.success("Node added to canvas");
  }, [screenToFlowPosition, nodes, edges, setNodes, saveToHistory]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getNextNodeId(nodes);

      let newNode: Node<any>;

      if (type === "annotation") {
        newNode = {
          id: newNodeId,
          type,
          position,
          data: {
            text: "Double-click to edit",
            label: "Note",
            color: "Yellow",
          },
        };
      } else {
        newNode = {
          id: newNodeId,
          type,
          position,
          data: getDefaultNodeData(type, newNodeId),
        };
      }

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        setTimeout(() => saveToHistory(newNodes, edges), 0);
        return newNodes;
      });
    },
    [screenToFlowPosition, nodes, edges, setNodes, saveToHistory]
  );

  useEffect(() => {
    if (selectedNode && window.innerWidth < 1024) {
      setShowMobileNodeEditor(true);
    }
  }, [selectedNode]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block h-full">
        <Sidebar
          onOpenNPCManager={() => setShowNPCManager(!showNPCManager)}
          onOpenSpeechTextManager={() => setShowSpeechTextManager(!showSpeechTextManager)}
          onOpenVariableManager={() => setShowVariableManager(!showVariableManager)}
          onOpenChoicesManager={() => setShowChoicesManager(!showChoicesManager)}
          onOpenSequenceManager={() => setShowSequenceManager(!showSequenceManager)}
          onOpenExportSettings={() => setShowExportSettings(!showExportSettings)}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
          onExitProject={handleExitProject}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
        <SheetContent side="left" className="w-[280px] p-0 overflow-y-auto">
          <Sidebar
            onOpenNPCManager={() => {
              setShowNPCManager(!showNPCManager);
              setShowMobileSidebar(false);
            }}
            onOpenSpeechTextManager={() => {
              setShowSpeechTextManager(!showSpeechTextManager);
              setShowMobileSidebar(false);
            }}
            onOpenVariableManager={() => {
              setShowVariableManager(!showVariableManager);
              setShowMobileSidebar(false);
            }}
            onOpenChoicesManager={() => {
              setShowChoicesManager(!showChoicesManager);
              setShowMobileSidebar(false);
            }}
            onOpenSequenceManager={() => {
              setShowSequenceManager(!showSequenceManager);
              setShowMobileSidebar(false);
            }}
            onOpenExportSettings={() => {
              setShowExportSettings(!showExportSettings);
              setShowMobileSidebar(false);
            }}
            onExportProject={() => {
              handleExportProject();
              setShowMobileSidebar(false);
            }}
            onImportProject={() => {
              handleImportProject();
              setShowMobileSidebar(false);
            }}
            onExitProject={() => {
              handleExitProject();
              setShowMobileSidebar(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        {currentRoomId && <RoomTabs />}

        {/* Toolbar - Responsive */}
        <div className="bg-white border-b border-neutral-200 px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 overflow-x-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors"
            title="Menu"
          >
            <Menu size={18} />
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleUndo}
              disabled={currentHistoryIndex === 0}
              className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handleRedo}
              disabled={currentHistoryIndex === history.length - 1}
              className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="hidden sm:block w-px h-8 bg-neutral-300" />

          {/* Language Selector - Hidden on small mobile */}
          <div className="hidden md:flex items-center gap-2">
            <Languages size={18} className="text-neutral-600" />
            <Select
              value={selectedLanguage.toString()}
              onValueChange={(value) => setSelectedLanguage(parseInt(value))}
            >
              <SelectTrigger className="w-32 lg:w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">English</SelectItem>
                <SelectItem value="2">Español</SelectItem>
                <SelectItem value="3">Português</SelectItem>
                <SelectItem value="4">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delete & Save Sequence */}
          <div className="flex items-center gap-1 sm:gap-2">
            {selectedNode && (
              <button
                onClick={deleteSelectedNode}
                className="p-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}

            {nodes.filter(n => n.selected).length > 1 && (
              <button
                onClick={() => setShowSaveSequenceDialog(true)}
                className="md:px-2 md:py-1.5 px-3 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors flex items-center gap-2 h-full"
                title="Save Sequence"
              >
                <Save size={16} className="w-[18px] h-[16px]" />
                <span className="hidden sm:inline">Save Sequence</span>
              </button>
            )}
          </div>

          <div className="hidden sm:block w-px h-8 bg-neutral-300 shrink-0" />

          {/* Export/Import Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleExport}
              className="p-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors"
              title="Export Nodes"
            >
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              onClick={handleExportSpeeches}
              className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              title="Export Speeches"
            >
              <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="hidden sm:flex p-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors"
              title="Copy"
            >
              <Copy size={18} />
            </button>

            <label className="p-2 bg-neutral-400 text-white rounded-md hover:bg-neutral-500 transition-colors cursor-pointer inline-flex items-center">
              <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
              <input
                type="file"
                accept=".txt"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Desktop Properties Panel Toggle */}
          <button
            onClick={() => setShowNodeEditor(!showNodeEditor)}
            className={`hidden lg:flex ml-auto p-2 rounded-md transition-colors items-center gap-1.5 ${
              showNodeEditor
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-neutral-300 text-neutral-700 hover:bg-neutral-400'
            }`}
            title={showNodeEditor ? "Hide Properties" : "Show Properties"}
          >
            <Variable size={18} />
            <span className="text-sm font-medium hidden xl:inline">Properties</span>
          </button>

          {/* Mobile Node Editor Toggle - Only when node selected */}
          {selectedNode && (
            <button
              onClick={() => setShowMobileNodeEditor(true)}
              className="lg:hidden ml-auto p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              title="Edit Node"
            >
              <Variable size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 relative">
          {!currentRoomId ? (
            <EmptyState
              onCreateProject={handleCreateProject}
              onImportProject={handleImportProject}
              onLoadRecentProject={handleLoadRecentProject}
            />
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onPaneContextMenu={handleContextMenu}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              minZoom={0.25}
              maxZoom={1.5}
              defaultViewport={{ x: 90, y: 200, zoom: 1 }}
              fitViewOptions={{ padding: 0.5 }}
              className="bg-neutral-100"
              connectionRadius={30}
              proOptions={{
                hideAttribution: true
              }}
            >
              <Background className="bg-neutral-100" />
              <Controls />
              <MiniMap
                zoomable
                pannable
                nodeColor={(node) => {
                  return node.selected ? "#171717" : "#d4d4d4";
                }}
                className="bg-white! border! border-neutral-300!"
              />
            </ReactFlow>
          )}

          {/* Floating Add Button - Mobile Only */}
          {currentRoomId && (
            <button
              onClick={() => setShowMobileNodePalette(true)}
              className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-40"
              title="Add Node"
            >
              <Plus size={28} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop NodeEditor - hidden on mobile */}
      {showNodeEditor && (
        <div className="hidden lg:block">
          <NodeEditor
            selectedNode={selectedNode}
            onUpdate={updateNodeData}
            speechTexts={speechTexts}
            npcs={npcs}
            variables={variables}
          />
        </div>
      )}

      {/* Mobile NodeEditor - Bottom Sheet */}
      <Sheet open={showMobileNodeEditor} onOpenChange={setShowMobileNodeEditor}>
        <SheetContent side="bottom" className="h-[85vh] p-0 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between z-10">
            <h3 className="font-bold text-lg">Edit Node</h3>
            <button
              onClick={() => setShowMobileNodeEditor(false)}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <NodeEditor
            selectedNode={selectedNode}
            onUpdate={updateNodeData}
            speechTexts={speechTexts}
            npcs={npcs}
            variables={variables}
          />
        </SheetContent>
      </Sheet>

      {showSpeechTextManager && (
        <SpeechTextManager
          speechTexts={speechTexts}
          onAdd={addSpeechText}
          onEdit={handleEditSpeechText}
          onDelete={handleDeleteSpeechText}
          onClose={() => setShowSpeechTextManager(false)}
        />
      )}

      {showNPCManager && (
        <NPCManager
          npcs={npcs}
          onAdd={addNPC}
          onEdit={handleEditNPC}
          onDelete={handleDeleteNPC}
          onClose={() => setShowNPCManager(false)}
        />
      )}

      {showVariableManager && (
        <VariableManager
          variables={variables}
          onAdd={addVariable}
          onEdit={handleEditVariable}
          onDelete={handleDeleteVariable}
          onClose={() => setShowVariableManager(false)}
        />
      )}

      {showChoicesManager && (
        <ChoicesTextManager
          choiceTexts={choiceTexts}
          onAdd={addChoiceText}
          onEdit={handleEditChoiceText}
          onDelete={handleDeleteChoiceText}
          onClose={() => setShowChoicesManager(false)}
        />
      )}

      {showExportSettings && (
        <ExportSettingsDialog
          onClose={() => setShowExportSettings(false)}
        />
      )}

      {showSaveSequenceDialog && (
        <SaveSequenceDialog
          selectedNodes={nodes.filter(n => n.selected)}
          onSave={handleSaveSequence}
          onClose={() => setShowSaveSequenceDialog(false)}
        />
      )}

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sequences={sequences}
          onClose={handleCloseContextMenu}
          onCreateSequence={(sequence) => handleCreateFromSequence(sequence, contextMenu)}
          onDeleteSequence={handleDeleteSequence}
        />
      )}

      {showSequenceManager && (
        <SequenceManager
          sequences={sequences}
          onEdit={handleEditSequence}
          onDelete={handleDeleteSequence}
          onClose={() => setShowSequenceManager(false)}
        />
      )}

      {/* Mobile Node Palette */}
      <MobileNodePalette
        open={showMobileNodePalette}
        onClose={() => setShowMobileNodePalette(false)}
        onSelectNode={handleMobileAddNode}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
