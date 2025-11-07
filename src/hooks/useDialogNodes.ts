import { useState, useCallback, useRef } from "react";
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, OnNodesChange, OnEdgesChange, OnConnect, useReactFlow } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";
import { toast } from "sonner";
import { useGameDialogStore } from "@/store/gameDialogStore";

interface UseDialogNodesProps {
  initialNodes: Node<DialogNodeData>[];
  saveToHistory: (nodes: Node<DialogNodeData>[], edges: Edge[]) => void;
}

// Helper function to generate unique node IDs based on highest existing ID
export const getNextNodeId = (nodes: Node<DialogNodeData>[]): string => {
  const numericIds = nodes
    .map(node => parseInt(node.id, 10))
    .filter(id => !isNaN(id));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  return `${maxId + 1}`;
};

export function useDialogNodes({ initialNodes, saveToHistory }: UseDialogNodesProps) {
  const [nodes, setNodes] = useState<Node<DialogNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<DialogNodeData> | null>(null);
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const deleteChoicesByNodeId = useGameDialogStore((state) => state.deleteChoicesByNodeId);

  const onNodesChange: OnNodesChange = useCallback(
    /*@ts-ignore*/
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      let newNodes: Node<DialogNodeData>[] = [];
      let newEdges: Edge[] = [];

      setEdges((eds) => {
        newEdges = applyEdgeChanges(changes, eds);
        return newEdges;
      });

      changes.forEach((change) => {
        if (change.type === "remove") {
          setEdges((currentEdges) => {
            const edgeToRemove = currentEdges.find((e) => e.id === change.id);
            if (edgeToRemove) {
              setNodes((nds) => {
                newNodes = nds.map((node) => {
                  if (node.id === edgeToRemove.source) {
                    return {
                      ...node,
                      data: { ...node.data, nextNodeId: "-1" },
                    };
                  }
                  return node;
                });
                return newNodes;
              });

              setSelectedNode((prev) => {
                if (prev && prev.id === edgeToRemove.source) {
                  return {
                    ...prev,
                    data: { ...prev.data, nextNodeId: "-1" },
                  };
                }
                return prev;
              });

              setTimeout(() => saveToHistory(newNodes, newEdges), 0);
            }
            return currentEdges;
          });
        }
      });
    },
    [saveToHistory]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: { nodeId: string | null }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Disabled drag-to-create feature - simply reset the connecting node
      connectingNodeId.current = null;
    },
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) return;

      // Validate connection rules before creating the connection
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (sourceNode?.type === 'initializeSpeech') {
        const existingOutgoing = edges.find(e => e.source === params.source);
        if (existingOutgoing) {
          // Already has an outgoing connection, reject
          toast.error('Initialize Speech can only have one outgoing connection');
          return;
        }
      }

     /* if (targetNode?.type === 'endDialogue') {
        const existingIncoming = edges.find(e => e.target === params.target);
        if (existingIncoming) {
          // Already has an incoming connection, reject
          toast.error('End Dialogue can only have one incoming connection');
          return;
        }
      } */

      // Connection is valid, proceed
      let newNodes: Node<DialogNodeData>[] = [];
      let newEdges: Edge[] = [];

      setEdges((eds) => {
        newEdges = addEdge(params, eds);
        return newEdges;
      });

      setNodes((nds) => {
        newNodes = nds.map((node) => {
          if (node.id === params.source) {
            return {
              ...node,
              data: { ...node.data, nextNodeId: params.target as string },
            };
          }
          return node;
        });
        return newNodes;
      });

      setSelectedNode((prev) => {
        if (prev && prev.id === params.source) {
          return {
            ...prev,
            data: { ...prev.data, nextNodeId: params.target as string },
          };
        }
        return prev;
      });

      setTimeout(() => saveToHistory(newNodes, newEdges), 0);
    },
    [nodes, edges, saveToHistory]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<DialogNodeData>) => {
    // Don't select annotation nodes (they have their own interaction)
    if (node.type === "annotation") {
      return;
    }
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNewNode = useCallback(() => {
    setNodes((nds) => {
      const newNodeId = getNextNodeId(nds);
      const newNode: Node<DialogNodeData> = {
        id: newNodeId,
        type: "dialogNode",
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          botId: "#(bot_id)",
          userId: "$(user_id)",
          nextNodeId: "-1",
          speechId: "SpeechId",
          speechSpeed: "-1",
          actionId: "1001",
          value1: "-1",
          value2: "-1",
          value3: "-1",
          label: `New Node ${newNodeId}`,
        },
      };
      const newNodes = [...nds, newNode];
      setTimeout(() => saveToHistory(newNodes, edges), 0);
      return newNodes;
    });
  }, [edges, saveToHistory]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<DialogNodeData>) => {
    let newNodes: Node<DialogNodeData>[] = [];

    setNodes((nds) => {
      newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      });
      return newNodes;
    });

    setSelectedNode((prevSelected) => {
      if (prevSelected && prevSelected.id === nodeId) {
        return {
          ...prevSelected,
          data: { ...prevSelected.data, ...data },
        };
      }
      return prevSelected;
    });

    setTimeout(() => saveToHistory(newNodes, edges), 100);
  }, [edges, saveToHistory]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      let newNodes: Node<DialogNodeData>[] = [];
      let newEdges: Edge[] = [];

      // Delete associated choices if it's a choice node
      if (selectedNode.type === 'choice') {
        deleteChoicesByNodeId(selectedNode.id);
      }

      setNodes((nds) => {
        newNodes = nds.filter((node) => node.id !== selectedNode.id).map((node) => {
          if (node.data.nextNodeId === selectedNode.id) {
            return {
              ...node,
              data: { ...node.data, nextNodeId: "-1" },
            };
          }
          return node;
        });
        return newNodes;
      });

      setEdges((eds) => {
        newEdges = eds.filter(
          (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
        );
        return newEdges;
      });

      setSelectedNode(null);
      setTimeout(() => saveToHistory(newNodes, newEdges), 0);
    }
  }, [selectedNode, saveToHistory, deleteChoicesByNodeId]);

  const deleteNodesByIds = useCallback((nodeIds: string[]) => {
    let newNodes: Node<DialogNodeData>[] = [];
    let newEdges: Edge[] = [];
    let choiceNodesToDelete: string[] = [];

    // Delete associated choices for all choice nodes being deleted
    setNodes((nds) => {
      // First, identify which nodes are choice nodes that will be deleted
      choiceNodesToDelete = nds
        .filter((node) => nodeIds.includes(node.id) && node.type === 'choice')
        .map(node => node.id);

      newNodes = nds.filter((node) => !nodeIds.includes(node.id)).map((node) => {
        if (nodeIds.includes(node.data.nextNodeId)) {
          return {
            ...node,
            data: { ...node.data, nextNodeId: "-1" },
          };
        }
        return node;
      });
      return newNodes;
    });

    // Delete choices AFTER setNodes has completed (outside the state update)
    choiceNodesToDelete.forEach((nodeId) => {
      deleteChoicesByNodeId(nodeId);
    });

    setEdges((eds) => {
      newEdges = eds.filter(
        (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      );
      return newEdges;
    });

    setSelectedNode(null);
    saveToHistory(newNodes, newEdges);
  }, [saveToHistory, deleteChoicesByNodeId]);

  const deleteEdgesByIds = useCallback((edgeIds: string[]) => {
    let newNodes: Node<DialogNodeData>[] = [];
    let newEdges: Edge[] = [];

    setEdges((eds) => {
      newEdges = eds.filter((edge) => !edgeIds.includes(edge.id));

      // For each deleted edge, update the source node's nextNodeId
      const deletedEdges = eds.filter((edge) => edgeIds.includes(edge.id));

      setNodes((nds) => {
        newNodes = nds.map((node) => {
          const wasSource = deletedEdges.some((edge) => edge.source === node.id);
          if (wasSource) {
            return {
              ...node,
              data: { ...node.data, nextNodeId: "-1" },
            };
          }
          return node;
        });
        return newNodes;
      });

      return newEdges;
    });

    setSelectedNode((prev) => {
      if (prev) {
        const wasSource = edgeIds.some((edgeId) => {
          const edge = edges.find((e) => e.id === edgeId);
          return edge && edge.source === prev.id;
        });
        if (wasSource) {
          return {
            ...prev,
            data: { ...prev.data, nextNodeId: "-1" },
          };
        }
      }
      return prev;
    });

    setTimeout(() => saveToHistory(newNodes, newEdges), 0);
  }, [edges, saveToHistory]);

  return {
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
  };
}
