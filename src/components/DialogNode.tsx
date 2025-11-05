"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { DialogNodeData, ACTION_TYPES, LANGUAGE_PREFIXES, SpeechText } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { Plus, CheckCircle2, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DialogRFNode = Node<DialogNodeData>;

// Helper function to get speech in selected language with fallback to English
function getSpeechIdInLanguage(
  baseSpeechId: string,
  selectedLanguage: number,
  speechTexts: SpeechText[]
): { speechId: string; isTranslated: boolean; localId: number } {
  if (baseSpeechId === "-1" || !baseSpeechId) {
    return { speechId: baseSpeechId, isTranslated: true, localId: 0 };
  }

  const numericId = parseInt(baseSpeechId);
  if (isNaN(numericId)) {
    return { speechId: baseSpeechId, isTranslated: true, localId: 0 };
  }

  // Calculate local ID (remove language prefix)
  const localId = numericId % 100000;

  // Calculate target speech ID in selected language
  const targetPrefix = LANGUAGE_PREFIXES[selectedLanguage as keyof typeof LANGUAGE_PREFIXES] || 100000;
  const targetSpeechId = (targetPrefix + localId).toString();

  // Check if speech exists in selected language
  const speechExists = speechTexts.some(st => st.id === targetSpeechId);

  if (speechExists) {
    return { speechId: targetSpeechId, isTranslated: true, localId };
  }

  // Fallback to English (language 1)
  const englishId = (100000 + localId).toString();
  const englishExists = speechTexts.some(st => st.id === englishId);

  if (englishExists && selectedLanguage !== 1) {
    return { speechId: englishId, isTranslated: false, localId };
  }

  // If nothing exists, return original
  return { speechId: baseSpeechId, isTranslated: selectedLanguage === 1, localId };
}

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
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const { updateNodeData } = useReactFlow();
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to truncate text for display
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculate display speech in selected language with fallback to English
  const displaySpeech = useMemo(() => {
    return getSpeechIdInLanguage(data.speechId || "-1", selectedLanguage, speechTexts);
  }, [data.speechId, selectedLanguage, speechTexts]);

  // Get the speech text object for display
  const speechTextObj = useMemo(() => {
    return speechTexts.find(st => st.id === displaySpeech.speechId);
  }, [speechTexts, displaySpeech.speechId]);

  // Group speeches by language
  const speechesByLanguage = useMemo(() => {
    const grouped: Record<number, SpeechText[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    speechTexts.forEach((st) => {
      if (grouped[st.languageId]) {
        grouped[st.languageId].push(st);
      }
    });

    // Sort speeches within each language
    Object.keys(grouped).forEach((langId) => {
      grouped[parseInt(langId)].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    });

    return grouped;
  }, [speechTexts]);

  const languageNames: Record<number, string> = {
    1: "English (100000)",
    2: "Spanish (200000)",
    3: "Portuguese (300000)",
    4: "French (400000)",
  };

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

  const handleCreateNewSpeech = useCallback((textContent: string) => {
    // Calculate next available local ID
    const maxLocalId = speechTexts.reduce((max, st) => {
      const numericId = parseInt(st.id);
      const localId = numericId % 100000;
      return Math.max(max, localId);
    }, 0);

    const nextLocalId = maxLocalId + 1;
    const languagePrefix = LANGUAGE_PREFIXES[selectedLanguage as keyof typeof LANGUAGE_PREFIXES] || 100000;
    const newId = (languagePrefix + nextLocalId).toString();

    // Create the new speech
    const newSpeech = {
      id: newId,
      languageId: selectedLanguage,
      text: textContent || "New Speech",
    };

    addSpeechText(newSpeech);
    handleSpeechChange(newId);
    setSpeechComboboxOpen(false);
    setSearchQuery("");
  }, [speechTexts, selectedLanguage, addSpeechText, handleSpeechChange]);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all ${
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
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-neutral-500 whitespace-nowrap">Bot ID:</span>
            <div className="flex gap-1 min-w-0 flex-1">
              <Select
                value={data.botId || "#(bot_id)"}
                onValueChange={handleBotIdChange}
              >
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
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
                className="px-2 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors flex-shrink-0"
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

          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="font-medium text-neutral-500 whitespace-nowrap flex-shrink-0">Speech:</span>
            <div className="flex gap-1 min-w-0 flex-1 items-center overflow-hidden">
              <Popover
                open={speechComboboxOpen}
                onOpenChange={(open) => {
                  setSpeechComboboxOpen(open);
                  if (!open) setSearchQuery("");
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={speechComboboxOpen}
                    className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 flex-1 justify-between overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="truncate flex-1 text-left">
                      {displaySpeech.speechId === "-1"
                        ? "-1 (None)"
                        : speechTextObj
                          ? truncateText(speechTextObj.text)
                          : data.speechId
                      }
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0"
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Search by ID or text..."
                      className="h-9"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No speech found.</CommandEmpty>

                      {/* Create new speech option when searching */}
                      {searchQuery && (
                        <CommandGroup heading="Create New">
                          <CommandItem
                            onSelect={() => handleCreateNewSpeech(searchQuery)}
                            className="text-blue-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{searchQuery}"
                          </CommandItem>
                        </CommandGroup>
                      )}

                      {/* None option */}
                      <CommandGroup heading="General">
                        <CommandItem
                          value="-1-none"
                          onSelect={() => {
                            handleSpeechChange("-1");
                            setSpeechComboboxOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          -1 (None)
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              data.speechId === "-1" ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      </CommandGroup>

                      {/* Speeches grouped by language */}
                      {Object.entries(speechesByLanguage).map(([langId, speeches]) => {
                        if (speeches.length === 0) return null;

                        return (
                          <CommandGroup key={langId} heading={languageNames[parseInt(langId)]}>
                            {speeches.map((st) => (
                              <CommandItem
                                key={st.id}
                                value={`${st.id}-${st.text}`.toLowerCase()}
                                onSelect={() => {
                                  handleSpeechChange(st.id);
                                  setSpeechComboboxOpen(false);
                                  setSearchQuery("");
                                }}
                              >
                                {truncateText(st.text)}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    data.speechId === st.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        );
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {displaySpeech.speechId !== "-1" && data.speechId && data.speechId !== "-1" && (
                <div
                  className="flex-shrink-0 flex items-center"
                  title={displaySpeech.isTranslated
                    ? "Translated in selected language"
                    : "Using English version (translation not available)"}
                >
                  {displaySpeech.isTranslated ? (
                    <CheckCircle2 size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} className="text-amber-500" />
                  )}
                </div>
              )}
              <button
                onClick={handleCreateSpeech}
                className="px-1.5 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors flex-shrink-0"
                title="Create new speech"
              >
                <Plus size={10} />
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
