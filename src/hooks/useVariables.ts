import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { Variable, DialogNodeData } from "@/types/dialog";

export function useVariables() {
  const [variables, setVariables] = useState<Variable[]>([]);

  const handleAddVariable = useCallback((variable: Variable) => {
    setVariables((prev) => [...prev, variable]);
  }, []);

  const handleEditVariable = useCallback((oldId: string, variable: Variable, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setVariables((prev) => prev.map((v) => (v.id === oldId ? variable : v)));

    if (oldId !== variable.id) {
      setNodes((nds) =>
        nds.map((node) => {
          const updates: Partial<DialogNodeData> = {};

          if (node.data.value1 === oldId) {
            updates.value1 = variable.id;
          }
          if (node.data.value2 === oldId) {
            updates.value2 = variable.id;
          }
          if (node.data.value3 === oldId) {
            updates.value3 = variable.id;
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

  const handleDeleteVariable = useCallback((id: string, setNodes: (updater: (nodes: Node<DialogNodeData>[]) => Node<DialogNodeData>[]) => void) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));

    setNodes((nds) =>
      nds.map((node) => {
        const updates: Partial<DialogNodeData> = {};

        if (node.data.value1 === id) {
          updates.value1 = "-1";
        }
        if (node.data.value2 === id) {
          updates.value2 = "-1";
        }
        if (node.data.value3 === id) {
          updates.value3 = "-1";
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
    variables,
    setVariables,
    handleAddVariable,
    handleEditVariable,
    handleDeleteVariable,
  };
}
