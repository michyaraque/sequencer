"use client";

import { memo, useCallback } from "react";
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { DialogNodeData, ACTION_TYPES } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DialogRFNode = Node<DialogNodeData>;

// Extended node props with custom callbacks
export interface CustomNodeProps extends NodeProps<DialogRFNode> {
  onOpenSpeechManager?: () => void;
  onOpenNPCManager?: () => void;
}

interface BaseDialogNodeProps extends CustomNodeProps {
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  accentColor?: string;
  borderColor?: string;
  badgeColor?: string;
}

function BaseDialogNode({
  data,
  selected,
  id,
  showTargetHandle = true,
  showSourceHandle = true,
  accentColor = "bg-neutral-50",
  borderColor = "border-neutral-300",
  badgeColor = "bg-neutral-800",
  onOpenSpeechManager,
  onOpenNPCManager
}: BaseDialogNodeProps) {
  const actionLabel = ACTION_TYPES[data.actionId as unknown as keyof typeof ACTION_TYPES] || `Action ${data.actionId}`;
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const { updateNodeData } = useReactFlow();

  const handleSpeechChange = useCallback((value: string) => {
    updateNodeData(id, { speechId: value });
  }, [id, updateNodeData]);

  const handleCreateSpeech = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSpeechManager) {
      onOpenSpeechManager();
    }
  }, [onOpenSpeechManager]);

  const handleBotIdChange = useCallback((value: string) => {
    updateNodeData(id, { botId: value });
  }, [id, updateNodeData]);

  const handleCreateNPC = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenNPCManager) {
      onOpenNPCManager();
    }
  }, [onOpenNPCManager]);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[220px] transition-all ${
        selected
          ? `border-neutral-900 shadow-xl ${accentColor}`
          : `${borderColor} shadow-md hover:shadow-lg hover:border-neutral-500 ${accentColor}`
      }`}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3! h-3! bg-neutral-700!"
        />
      )}

      <div className="space-y-2">
        {/* Node ID Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`${badgeColor} text-white px-2 py-1 rounded text-xs font-bold font-mono`}>
            ID: {id}
          </div>
          {data.label && (
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          )}
        </div>

        <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-neutral-500">Bot ID:</span>
            <div className="flex gap-1">
              <Select
                value={data.botId || "#(bot_id)"}
                onValueChange={handleBotIdChange}
              >
                <SelectTrigger
                  className="flex-1 h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue placeholder="Select Bot ID" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="#(bot_id)">#(bot_id)</SelectItem>
                  {npcs.map((npc) => (
                    <SelectItem key={npc.id} value={npc.id}>
                      {npc.id} - {npc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleCreateNPC}
                className="px-2 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors"
                title="Create new NPC"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-medium text-neutral-500">Action:</span>
            <span className="text-xs truncate max-w-[120px] text-neutral-900" title={actionLabel}>
              {data.actionId}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-medium text-neutral-500">Speech:</span>
            <div className="flex gap-1">
              <Select
                value={data.speechId || "-1"}
                onValueChange={handleSpeechChange}
              >
                <SelectTrigger
                  className="flex-1 h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue placeholder="Select Speech" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="-1">-1 (None)</SelectItem>
                  {speechTexts.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.id} - {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleCreateSpeech}
                className="px-2 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors"
                title="Create new speech"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {data.value1 !== "-1" && data.value1 && (
            <div className="flex justify-between gap-2">
              <span className="font-medium text-neutral-500">Value1:</span>
              <span className="font-mono text-xs truncate max-w-[100px] text-neutral-900" title={data.value1}>
                {data.value1}
              </span>
            </div>
          )}
        </div>
      </div>

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3! h-3! bg-neutral-700!"
        />
      )}
    </div>
  );
}

// Initialize Speech Node (Action ID 1) - Can only send connections
export const InitializeSpeechNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={false}
    showSourceHandle={true}
    accentColor="bg-green-50"
    borderColor="border-green-300"
    badgeColor="bg-green-700"
  />
));

// Next Speech Node (Action ID 2)
export const NextSpeechNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-blue-50"
    borderColor="border-blue-300"
    badgeColor="bg-blue-700"
  />
));

// Change Variable Node (Action ID 3)
export const ChangeVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-purple-50"
    borderColor="border-purple-300"
    badgeColor="bg-purple-700"
  />
));

// Condition Variable Node (Action ID 4)
export const ConditionVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-orange-50"
    borderColor="border-orange-300"
    badgeColor="bg-orange-700"
  />
));

// Change Variable Variable Node (Action ID 5)
export const ChangeVariableVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-purple-100"
    borderColor="border-purple-400"
    badgeColor="bg-purple-800"
  />
));

// Condition Variable Variable Node (Action ID 6)
export const ConditionVariableVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-orange-100"
    borderColor="border-orange-400"
    badgeColor="bg-orange-800"
  />
));

// Choice Node (Action ID 7)
export const ChoiceNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-cyan-50"
    borderColor="border-cyan-300"
    badgeColor="bg-cyan-700"
  />
));

// Custom Action Node (Action ID 98)
export const CustomActionNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-amber-50"
    borderColor="border-amber-300"
    badgeColor="bg-amber-700"
  />
));

// End Speech Node (Action ID 99)
export const EndSpeechNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={false}
    accentColor="bg-red-50"
    borderColor="border-red-300"
    badgeColor="bg-red-700"
  />
));

// Default export for backward compatibility
const DialogNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    accentColor="bg-neutral-50"
    borderColor="border-neutral-300"
    badgeColor="bg-neutral-800"
  />
));

export default DialogNode;
