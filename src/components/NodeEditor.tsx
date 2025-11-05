"use client";

import { DialogNodeData, ACTION_TYPES, SPEECH_SPEEDS, SpeechText, NPC, Variable } from "@/types/dialog";
import { Node } from "@xyflow/react";

interface NodeEditorProps {
  selectedNode: Node<DialogNodeData> | null;
  onUpdate: (nodeId: string, data: Partial<DialogNodeData>) => void;
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];
}

export default function NodeEditor({ selectedNode, onUpdate, speechTexts, npcs, variables }: NodeEditorProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-neutral-50 border-l border-neutral-200 p-4">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Node Properties</h2>
        <p className="text-neutral-500 text-sm">Select a node to edit its properties</p>
      </div>
    );
  }

  const handleChange = (field: keyof DialogNodeData, value: string) => {
    onUpdate(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-neutral-50 border-l border-neutral-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-neutral-800 mb-4">Node Properties</h2>
      <div className="bg-neutral-800 text-white px-2 py-1 rounded text-xs font-bold font-mono mb-4 inline-block">
        Node ID: {selectedNode.id}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            placeholder="Node label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Bot ID (NPC)
          </label>
          <select
            value={selectedNode.data.botId || ""}
            onChange={(e) => handleChange("botId", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="#(bot_id)">#(bot_id)</option>
            {npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.id} - {npc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            User ID (NPC)
          </label>
          <select
            value={selectedNode.data.userId || ""}
            onChange={(e) => handleChange("userId", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="#(user_id)">#(user_id)</option>
            {npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.id} - {npc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Next Node ID
          </label>
          <input
            type="text"
            value={selectedNode.data.nextNodeId || ""}
            onChange={(e) => handleChange("nextNodeId", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 font-mono bg-white"
            placeholder="-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Speech ID
          </label>
          <select
            value={selectedNode.data.speechId || ""}
            onChange={(e) => handleChange("speechId", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="-1">-1 (None)</option>
            {speechTexts.map((st) => (
              <option key={st.id} value={st.id}>
                {st.id} - {st.label}
              </option>
            ))}
          </select>
          {selectedNode.data.speechId && selectedNode.data.speechId !== "-1" && (
            <div>
              {speechTexts.find((st) => st.id === selectedNode.data.speechId) && (
                <div className="mt-2 p-2 bg-neutral-50 border border-neutral-200 rounded text-xs">
                  <div className="font-medium text-neutral-700 mb-1">Preview:</div>
                  <div className="text-neutral-600 font-mono">
                    {speechTexts.find((st) => st.id === selectedNode.data.speechId)?.text}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Speech Speed
          </label>
          <select
            value={selectedNode.data.speechSpeed || "1/2/3"}
            onChange={(e) => handleChange("speechSpeed", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
          >
            <option value="1">1 (Slow)</option>
            <option value="2">2 (Normal)</option>
            <option value="3">3 (Fast)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Action ID
          </label>
          <select
            value={selectedNode.data.actionId || "1001"}
            onChange={(e) => handleChange("actionId", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
          >
            {Object.entries(ACTION_TYPES).map(([id, label]) => (
              <option key={id} value={id}>
                {id} - {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Value 1 (Variable)
          </label>
          <select
            value={selectedNode.data.value1 || ""}
            onChange={(e) => handleChange("value1", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="-1">-1 (None)</option>
            {variables.map((variable) => (
              <option key={variable.id} value={variable.id}>
                {variable.id} - {variable.name}
              </option>
            ))}
          </select>
     
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Value 2 (Variable)
          </label>
          <select
            value={selectedNode.data.value2 || ""}
            onChange={(e) => handleChange("value2", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="-1">-1 (None)</option>
            {variables.map((variable) => (
              <option key={variable.id} value={variable.id}>
                {variable.id} - {variable.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Value 3 (Variable)
          </label>
          <select
            value={selectedNode.data.value3 || ""}
            onChange={(e) => handleChange("value3", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm mb-2"
          >
            <option value="-1">-1 (None)</option>
            {variables.map((variable) => (
              <option key={variable.id} value={variable.id}>
                {variable.id} - {variable.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
