"use client";

import { DialogNodeData, ACTION_TYPES, SPEECH_SPEEDS, CHANGE_TYPES, SpeechText, NPC, Variable } from "@/types/dialog";
import { Node } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NodeEditorProps {
  selectedNode: Node<DialogNodeData> | null;
  onUpdate: (nodeId: string, data: Partial<DialogNodeData>) => void;
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];
}

export default function NodeEditor({ selectedNode, onUpdate, speechTexts, npcs, variables }: NodeEditorProps) {
  // Helper function to truncate text for display
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!selectedNode) {
    return (
      <div className="w-80 h-screen bg-neutral-50 border-l border-neutral-200 p-4">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Node Properties</h2>
        <p className="text-neutral-500 text-sm">Select a node to edit its properties</p>
      </div>
    );
  }

  const handleChange = (field: keyof DialogNodeData, value: string) => {
    onUpdate(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-80 h-screen bg-neutral-50 border-l border-neutral-200 p-4 overflow-y-auto">
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
            className="w-full px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-neutral-900/5 hover:bg-neutral-900/10"
            placeholder="Node label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Bot ID (NPC)
          </label>
          <Select
            value={selectedNode.data.botId || "#(bot_id)"}
            onValueChange={(value) => handleChange("botId", value)}
          >
            <SelectTrigger className="w-full font-mono text-sm mb-2">
              <SelectValue placeholder="Select Bot ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#(bot_id)">#(bot_id)</SelectItem>
              {npcs.map((npc) => (
                <SelectItem key={npc.id} value={npc.id}>
                  {npc.id} - {npc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            User ID (NPC)
          </label>
          <Select
            value={selectedNode.data.userId || "$(user_id)"}
            onValueChange={(value) => handleChange("userId", value)}
          >
            <SelectTrigger className="w-full font-mono text-sm mb-2">
              <SelectValue placeholder="Select User ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$(user_id)">$(user_id)</SelectItem>
              {npcs.map((npc) => (
                <SelectItem key={npc.id} value={npc.id}>
                  {npc.id} - {npc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Next Node ID
          </label>
          <input
            type="text"
            value={selectedNode.data.nextNodeId || ""}
            onChange={(e) => handleChange("nextNodeId", e.target.value)}
            className="w-full px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 font-mono bg-neutral-900/5 hover:bg-neutral-900/10"
            placeholder="-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Speech ID
          </label>
          <Select
            value={selectedNode.data.speechId || "-1"}
            onValueChange={(value) => handleChange("speechId", value)}
          >
            <SelectTrigger className="w-full font-mono text-sm mb-2">
              <SelectValue placeholder="Select Speech" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">-1 (None)</SelectItem>
              {speechTexts.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.id} - {truncateText(st.text)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Only show Speech Speed for specific node types */}
        {(selectedNode.type === "botSpeech" || selectedNode.type === "showMessage" || selectedNode.type === "choice") && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Speech Speed
            </label>
            <Select
              value={selectedNode.data.speechSpeed || "2"}
              onValueChange={(value) => handleChange("speechSpeed", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Default)</SelectItem>
                <SelectItem value="1">1 (Fast)</SelectItem>
                <SelectItem value="2">2 (Normal)</SelectItem>
                <SelectItem value="3">3 (Slow)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Action ID
          </label>
          <Select
            value={selectedNode.data.actionId || "1"}
            onValueChange={(value) => handleChange("actionId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Action" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTION_TYPES).map(([id, label]) => (
                <SelectItem key={id} value={id}>
                  {id} - {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional rendering based on Action ID */}
        {selectedNode.data.actionId !== "1" && (
          <>
            {/* Action ID 3: Change Variable - Special fields */}
            {selectedNode.data.actionId === "3" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Variable ID
                  </label>
                  <Select
                    value={selectedNode.data.value1 || "-1"}
                    onValueChange={(value) => handleChange("value1", value)}
                  >
                    <SelectTrigger className="w-full font-mono text-sm mb-2">
                      <SelectValue placeholder="Select Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 (None)</SelectItem>
                      {variables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.id} - {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Change Type ID
                  </label>
                  <Select
                    value={selectedNode.data.value2 || "-1"}
                    onValueChange={(value) => handleChange("value2", value)}
                  >
                    <SelectTrigger className="w-full font-mono text-sm mb-2">
                      <SelectValue placeholder="Select Change Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 (None)</SelectItem>
                      {Object.entries(CHANGE_TYPES).map(([id, label]) => (
                        <SelectItem key={id} value={id}>
                          {id} - {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={selectedNode.data.value3 || ""}
                    onChange={(e) => handleChange("value3", e.target.value)}
                    className="w-full px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500  bg-neutral-900/5 hover:bg-neutral-900/10 font-mono"
                    placeholder="0"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Default fields for other Action IDs */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Value 1 (Variable)
                  </label>
                  <Select
                    value={selectedNode.data.value1 || "-1"}
                    onValueChange={(value) => handleChange("value1", value)}
                  >
                    <SelectTrigger className="w-full font-mono text-sm mb-2">
                      <SelectValue placeholder="Select Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 (None)</SelectItem>
                      {variables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.id} - {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Value 2 (Variable)
                  </label>
                  <Select
                    value={selectedNode.data.value2 || "-1"}
                    onValueChange={(value) => handleChange("value2", value)}
                  >
                    <SelectTrigger className="w-full font-mono text-sm mb-2">
                      <SelectValue placeholder="Select Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 (None)</SelectItem>
                      {variables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.id} - {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Value 3 (Variable)
                  </label>
                  <Select
                    value={selectedNode.data.value3 || "-1"}
                    onValueChange={(value) => handleChange("value3", value)}
                  >
                    <SelectTrigger className="w-full font-mono text-sm mb-2">
                      <SelectValue placeholder="Select Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 (None)</SelectItem>
                      {variables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.id} - {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
