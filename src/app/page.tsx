"use client";

import { useState, useCallback, useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, Node, NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Undo2, Redo2, Trash2, Variable, Download, Copy, Upload } from "lucide-react";

import DialogNode, {
  InitializeSpeechNode,
  NextSpeechNode,
  ChangeVariableNode,
  ConditionVariableNode,
  ChangeVariableVariableNode,
  ConditionVariableVariableNode,
  ChoiceNode,
  CustomActionNode,
  EndSpeechNode,
  CustomNodeProps
} from "@/components/DialogNode";
import NodeEditor from "@/components/NodeEditor";
import SpeechTextManager from "@/components/SpeechTextManager";
import NPCManager from "@/components/NPCManager";
import VariableManager from "@/components/VariableManager";
import Sidebar from "@/components/Sidebar";
import { DialogNodeData } from "@/types/dialog";
import { useDialogHistory } from "@/hooks/useDialogHistory";
import { useDialogNodes } from "@/hooks/useDialogNodes";
import { useDialogKeyboard } from "@/hooks/useDialogKeyboard";
import { useDialogExport } from "@/hooks/useDialogExport";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { useReactFlow } from "@xyflow/react";

// Helper function to get default node data based on node type
function getDefaultNodeData(nodeType: string, nodeId: string): DialogNodeData {
  const baseData = {
    botId: "#(bot_id)",
    userId: "#(user_id)",
    nextNodeId: "-1",
    speechId: "SpeechId",
    speechSpeed: "1/2/3",
    value1: "-1",
    value2: "-1",
    value3: "-1",
  };

  switch (nodeType) {
    case "initializeSpeech":
      return { ...baseData, actionId: "1", label: "Initialize Speech" };
    case "nextSpeech":
      return { ...baseData, actionId: "2", label: "Next Speech" };
    case "changeVariable":
      return { ...baseData, actionId: "3", label: "Change Variable" };
    case "conditionVariable":
      return { ...baseData, actionId: "4", label: "Condition Variable" };
    case "changeVariableVariable":
      return { ...baseData, actionId: "5", label: "Change Variable Variable" };
    case "conditionVariableVariable":
      return { ...baseData, actionId: "6", label: "Condition Variable Variable" };
    case "choice":
      return { ...baseData, actionId: "7", label: "Choice" };
    case "customAction":
      return { ...baseData, actionId: "98", label: "Custom Action" };
    case "endSpeech":
      return { ...baseData, actionId: "99", label: "End Speech" };
    default:
      return { ...baseData, actionId: "1001", label: `New Node ${nodeId}` };
  }
}

const initialNodes: Node<DialogNodeData>[] = [
  {
    id: "1",
    type: "initializeSpeech",
    position: { x: 250, y: 100 },
    data: {
      botId: "#(bot_id)",
      userId: "#(user_id)",
      nextNodeId: "0",
      speechId: "SpeechId",
      speechSpeed: "1/2/3",
      actionId: "1",
      value1: "-1",
      value2: "-1",
      value3: "-1",
      label: "Initialize Speech",
    },
  },
];

function FlowEditor() {
  const [showSpeechTextManager, setShowSpeechTextManager] = useState(false);
  const [showNPCManager, setShowNPCManager] = useState(false);
  const [showVariableManager, setShowVariableManager] = useState(false);

  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const variables = useGameDialogStore((state) => state.variables);

  // Create node types with callbacks
  const nodeTypes: NodeTypes = useMemo(() => {
    const createNodeWithProps = (Component: React.ComponentType<CustomNodeProps>) => {
      return (props: CustomNodeProps) => (
        <Component {...props} onOpenSpeechManager={() => setShowSpeechTextManager(true)} />
      );
    };

    return {
      dialogNode: createNodeWithProps(DialogNode),
      initializeSpeech: createNodeWithProps(InitializeSpeechNode),
      nextSpeech: createNodeWithProps(NextSpeechNode),
      changeVariable: createNodeWithProps(ChangeVariableNode),
      conditionVariable: createNodeWithProps(ConditionVariableNode),
      changeVariableVariable: createNodeWithProps(ChangeVariableVariableNode),
      conditionVariableVariable: createNodeWithProps(ConditionVariableVariableNode),
      choice: createNodeWithProps(ChoiceNode),
      customAction: createNodeWithProps(CustomActionNode),
      endSpeech: createNodeWithProps(EndSpeechNode),
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
  } = useDialogNodes({ initialNodes, saveToHistory });

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
        if (node.data.userId === id) updates.userId = "#(user_id)";
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

  const { handleExport, handleCopyToClipboard, handleImport } = useDialogExport({
    nodes,
    setNodes,
    setEdges,
    setSelectedNode,
    saveToHistory,
  });

  const handleUndo = () => undo(setNodes, setEdges, setSelectedNode);
  const handleRedo = () => redo(setNodes, setEdges, setSelectedNode);

  useDialogKeyboard({
    nodes,
    edges,
    undo: handleUndo,
    redo: handleRedo,
    onDeleteNodes: deleteNodesByIds,
    isModalOpen: showSpeechTextManager || showNPCManager || showVariableManager,
  });

  const { screenToFlowPosition } = useReactFlow();

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

      const newNodeId = `${nodes.length + 1}`;
      const newNode: Node<DialogNodeData> = {
        id: newNodeId,
        type,
        position,
        data: getDefaultNodeData(type, newNodeId),
      };

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        setTimeout(() => saveToHistory(newNodes, edges), 0);
        return newNodes;
      });
    },
    [screenToFlowPosition, nodes, edges, setNodes, saveToHistory]
  );

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        onOpenNPCManager={() => setShowNPCManager(!showNPCManager)}
        onOpenSpeechTextManager={() => setShowSpeechTextManager(!showSpeechTextManager)}
        onOpenVariableManager={() => setShowVariableManager(!showVariableManager)}
      />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-neutral-200 px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={currentHistoryIndex === 0}
              className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>

            <button
              onClick={handleRedo}
              disabled={currentHistoryIndex === history.length - 1}
              className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedNode && (
              <button
                onClick={deleteSelectedNode}
                className="px-3 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="w-px h-8 bg-neutral-300" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="px-3 py-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors font-medium flex items-center gap-2"
            >
              <Copy size={18} />
              Copy
            </button>

            <label className="px-3 py-2 bg-neutral-400 text-white rounded-md hover:bg-neutral-500 transition-colors font-medium cursor-pointer inline-flex items-center gap-2">
              <Upload size={18} />
              Import
              <input
                type="file"
                accept=".txt"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex-1 relative">
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
            nodeTypes={nodeTypes}
            minZoom={0.25}
            maxZoom={1.5}
            defaultViewport={{ x: 90, y: 200, zoom: 1 }}
            fitViewOptions={{ padding: 0.5 }}
            className="bg-neutral-100"
            proOptions={{
              hideAttribution: true
            }}
          >
            <Background className="bg-neutral-100" />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                return node.selected ? "#171717" : "#d4d4d4";
              }}
              className="bg-white! border! border-neutral-300!"
            />
          </ReactFlow>
        </div>
      </div>

      <NodeEditor
        selectedNode={selectedNode}
        onUpdate={updateNodeData}
        speechTexts={speechTexts}
        npcs={npcs}
        variables={variables}
      />

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
