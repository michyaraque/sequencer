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

  const localId = numericId % 100000;
  const targetPrefix = LANGUAGE_PREFIXES[selectedLanguage as keyof typeof LANGUAGE_PREFIXES] || 100000;
  const targetSpeechId = (targetPrefix + localId).toString();
  const speechExists = speechTexts.some(st => st.id === targetSpeechId);

  if (speechExists) {
    return { speechId: targetSpeechId, isTranslated: true, localId };
  }

  const englishId = (100000 + localId).toString();
  const englishExists = speechTexts.some(st => st.id === englishId);

  if (englishExists && selectedLanguage !== 1) {
    return { speechId: englishId, isTranslated: false, localId };
  }

  return { speechId: baseSpeechId, isTranslated: selectedLanguage === 1, localId };
}

export interface CustomNodeProps extends NodeProps<DialogRFNode> {
  onOpenSpeechManager?: () => void;
  onOpenNPCManager?: () => void;
}

interface BaseDialogNodeProps extends CustomNodeProps {
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  showSpeech?: boolean;
  showBotId?: boolean;
  accentColor?: string;
  borderColor?: string;
  badgeColor?: string;
  className?: string;
}

function BaseDialogNode({
  data,
  selected,
  id,
  showTargetHandle = true,
  showSourceHandle = true,
  showSpeech = true,
  showBotId = true,
  accentColor = "bg-neutral-50",
  borderColor = "border-neutral-300",
  badgeColor = "bg-neutral-800",
  onOpenSpeechManager,
  onOpenNPCManager,
  className
}: BaseDialogNodeProps) {
  const actionLabel = ACTION_TYPES[data.actionId as unknown as keyof typeof ACTION_TYPES] || `Action ${data.actionId}`;
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const { updateNodeData } = useReactFlow();
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };


  const displaySpeech = useMemo(() => {
    return getSpeechIdInLanguage(data.speechId || "-1", selectedLanguage, speechTexts);
  }, [data.speechId, selectedLanguage, speechTexts]);


  const speechTextObj = useMemo(() => {
    return speechTexts.find(st => st.id === displaySpeech.speechId);
  }, [speechTexts, displaySpeech.speechId]);


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
    1: "English",
    2: "Spanish",
    3: "Portuguese",
    4: "French",
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
      } ${className}`}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 mb-2 pr-24">
          <div className={`${badgeColor} text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0`}>
            ID: {id}
          </div>
          {data.label && (
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          )}
        </div>

        <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
          {showBotId && (
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Bot ID:</span>
              <div className="flex gap-1 min-w-0 flex-1 ">
                <Select

                  value={data.botId || "#(bot_id)"}
                  onValueChange={handleBotIdChange}
                >
                  <SelectTrigger
                    className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
                    onClick={(e) => e.stopPropagation()}
                    size="sm"
                  >
                    <SelectValue placeholder="Seleccionar Bot ID" />
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
                  className="px-2 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                  title="Crear nuevo NPC"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          )}

          {showSpeech && (
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="font-medium text-neutral-500 whitespace-nowrap shrink-0">Speech:</span>
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
                        placeholder="Buscar por ID o texto..."
                        className="h-9"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>No se encontró speech.</CommandEmpty>

                        {searchQuery && (
                          <CommandGroup heading="Crear Nuevo">
                            <CommandItem
                              onSelect={() => handleCreateNewSpeech(searchQuery)}
                              className="text-blue-600"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Crear "{searchQuery}"
                            </CommandItem>
                          </CommandGroup>
                        )}

                        <CommandGroup heading="General">
                          <CommandItem
                            value="-1-none"
                            onSelect={() => {
                              handleSpeechChange("-1");
                              setSpeechComboboxOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            -1 (Ninguno)
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                data.speechId === "-1" ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        </CommandGroup>

                        {Object.entries(speechesByLanguage).map(([langId, speeches]) => {
                          if (parseInt(langId) !== 1 || speeches.length === 0) return null;

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
                    className="shrink-0 flex items-center"
                    title={displaySpeech.isTranslated
                      ? "Traducido en idioma seleccionado"
                      : "Usando versión en inglés (traducción no disponible)"}
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
                  className="px-1.5 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                  title="Crear nuevo speech"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
          )}

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
          position={Position.Right}
          className="w-3! h-3! bg-neutral-700!"
        />
      )}
    </div>
  );
}


export const InitializeSpeechNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={false}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-green-50"
    borderColor="border-green-300"
    badgeColor="bg-green-700"
  />
));


export const ChangeVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-purple-50"
    borderColor="border-purple-300"
    badgeColor="bg-purple-700"
  />
));


export const ChangeVariableVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-purple-100"
    borderColor="border-purple-400"
    badgeColor="bg-purple-800"
  />
));


export const ConditionVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-orange-50"
    borderColor="border-orange-300"
    badgeColor="bg-orange-700"
  />
));


export const ConditionVariableVariableNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-orange-100"
    borderColor="border-orange-400"
    badgeColor="bg-orange-800"
  />
));


export const ChoiceNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-cyan-50"
    borderColor="border-cyan-300"
    badgeColor="bg-cyan-700"
  />
));


export const CustomActionNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-amber-50"
    borderColor="border-amber-300"
    badgeColor="bg-amber-700"
  />
));

export const BotSpeechNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const speechModes = {
    "1": { label: "Whisper", color: "bg-indigo-50", border: "border-indigo-300", badge: "bg-indigo-700" },
    "2": { label: "Talk", color: "bg-blue-50", border: "border-blue-300", badge: "bg-blue-700" },
    "3": { label: "Shout", color: "bg-sky-50", border: "border-sky-300", badge: "bg-sky-700" },
  };

  const currentMode = speechModes[data.value1 as keyof typeof speechModes] || speechModes["2"];

  const handleModeChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  const handleBotIdChange = useCallback((value: string) => {
    updateNodeData(id, { botId: value });
  }, [id, updateNodeData]);

  const handleCreateNPC = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.onOpenNPCManager) {
      props.onOpenNPCManager();
    }
  }, [props]);

  const handleSpeechChange = useCallback((value: string) => {
    updateNodeData(id, { speechId: value });
  }, [id, updateNodeData]);

  const handleCreateSpeech = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.onOpenSpeechManager) {
      props.onOpenSpeechManager();
    }
  }, [props]);

  const handleCreateNewSpeech = useCallback((textContent: string) => {
    const maxLocalId = speechTexts.reduce((max, st) => {
      const numericId = parseInt(st.id);
      const localId = numericId % 100000;
      return Math.max(max, localId);
    }, 0);

    const nextLocalId = maxLocalId + 1;
    const languagePrefix = LANGUAGE_PREFIXES[selectedLanguage as keyof typeof LANGUAGE_PREFIXES] || 100000;
    const newId = (languagePrefix + nextLocalId).toString();

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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displaySpeech = useMemo(() => {
    return getSpeechIdInLanguage(data.speechId || "-1", selectedLanguage, speechTexts);
  }, [data.speechId, selectedLanguage, speechTexts]);

  const speechTextObj = useMemo(() => {
    return speechTexts.find(st => st.id === displaySpeech.speechId);
  }, [speechTexts, displaySpeech.speechId]);

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

    Object.keys(grouped).forEach((langId) => {
      grouped[parseInt(langId)].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    });

    return grouped;
  }, [speechTexts]);

  const languageNames: Record<number, string> = {
    1: "English",
    2: "Spanish",
    3: "Portuguese",
    4: "French",
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all ${
        selected
          ? `border-neutral-900 shadow-xl ${currentMode.color}`
          : `${currentMode.border} shadow-md hover:shadow-lg hover:border-neutral-500 ${currentMode.color}`
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-neutral-700!"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 mb-2 pr-24">
          <div className={`${currentMode.badge} text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0`}>
            ID: {id}
          </div>
          {data.label && (
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          )}
        </div>

        <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
          {/* Bot ID */}
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
                className="px-2 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                title="Create new NPC"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Speech */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="font-medium text-neutral-500 whitespace-nowrap shrink-0">Speech:</span>
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
                    className="h-[33px] px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 flex-1 justify-between overflow-hidden bg-neutral-900/10 hover:bg-neutral-900/15"
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
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No speech found.</CommandEmpty>

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

                      {Object.entries(speechesByLanguage).map(([langId, speeches]) => {
                        if (parseInt(langId) !== 1 || speeches.length === 0) return null;

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
                  className="shrink-0 flex items-center"
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
                className="px-1.5 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                title="Create new speech"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>

          {/* Value1 - Speech Mode */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-neutral-500 whitespace-nowrap">Value1:</span>
            <div className="flex gap-1 min-w-0 flex-1">
              <Select value={data.value1 || "2"} onValueChange={handleModeChange}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="1">1 - Whisper</SelectItem>
                  <SelectItem value="2">2 - Talk</SelectItem>
                  <SelectItem value="3">3 - Shout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-neutral-700!"
      />
    </div>
  );
});

export const ShowMessageNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleValue1Change = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  const handleValue2Change = (value: string) => {
    updateNodeData(id, { value2: value });
  };

  const handleValue3Change = (value: string) => {
    updateNodeData(id, { value3: value });
  };

  const isPrivate = data.value2 === "1";
  const color = isPrivate ? "bg-violet-50" : "bg-fuchsia-50";
  const border = isPrivate ? "border-violet-300" : "border-fuchsia-300";
  const badge = isPrivate ? "bg-violet-700" : "bg-fuchsia-700";

  const handleSpeechChange = useCallback((value: string) => {
    updateNodeData(id, { speechId: value });
  }, [id, updateNodeData]);

  const handleCreateSpeech = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.onOpenSpeechManager) {
      props.onOpenSpeechManager();
    }
  }, [props]);

  const handleCreateNewSpeech = useCallback((textContent: string) => {
    const maxLocalId = speechTexts.reduce((max, st) => {
      const numericId = parseInt(st.id);
      const localId = numericId % 100000;
      return Math.max(max, localId);
    }, 0);

    const nextLocalId = maxLocalId + 1;
    const languagePrefix = LANGUAGE_PREFIXES[selectedLanguage as keyof typeof LANGUAGE_PREFIXES] || 100000;
    const newId = (languagePrefix + nextLocalId).toString();

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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displaySpeech = useMemo(() => {
    return getSpeechIdInLanguage(data.speechId || "-1", selectedLanguage, speechTexts);
  }, [data.speechId, selectedLanguage, speechTexts]);

  const speechTextObj = useMemo(() => {
    return speechTexts.find(st => st.id === displaySpeech.speechId);
  }, [speechTexts, displaySpeech.speechId]);

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

    Object.keys(grouped).forEach((langId) => {
      grouped[parseInt(langId)].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    });

    return grouped;
  }, [speechTexts]);

  const languageNames: Record<number, string> = {
    1: "English",
    2: "Spanish",
    3: "Portuguese",
    4: "French",
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[370px] max-w-[420px] transition-all ${
        selected
          ? `border-neutral-900 shadow-xl ${color}`
          : `${border} shadow-md hover:shadow-lg hover:border-neutral-500 ${color}`
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-neutral-700!"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 mb-2 pr-24">
          <div className={`${badge} text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0`}>
            ID: {id}
          </div>
          {data.label && (
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          )}
        </div>

        <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
          {/* Speech */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="font-medium text-neutral-500 whitespace-nowrap shrink-0">Speech:</span>
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
                    className="h-[35px] px-2 text-xs border-neutral-300 font-mono min-w-0 flex-1 justify-between overflow-hidden bg-neutral-900/10 hover:bg-neutral-900/15"
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
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No speech found.</CommandEmpty>

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

                      {Object.entries(speechesByLanguage).map(([langId, speeches]) => {
                        if (parseInt(langId) !== 1 || speeches.length === 0) return null;

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
                  className="shrink-0 flex items-center"
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
                className="px-1.5 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                title="Create new speech"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>

          {/* Value1 - Notification Style */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-neutral-500 whitespace-nowrap">Value1:</span>
            <div className="flex gap-1 min-w-0 flex-1">
              <Select value={data.value1 || "-1"} onValueChange={handleValue1Change}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="-1">-1 (Default)</SelectItem>
                  <SelectItem value="200">Notification Red</SelectItem>
                  <SelectItem value="201">Notification Green</SelectItem>
                  <SelectItem value="202">Notification Blue</SelectItem>
                  <SelectItem value="210">Notification Alert</SelectItem>
                  <SelectItem value="211">Notification Info</SelectItem>
                  <SelectItem value="212">Notification Warning</SelectItem>
                  <SelectItem value="220">Notification Wrong</SelectItem>
                  <SelectItem value="221">Notification Wrong Circle</SelectItem>
                  <SelectItem value="222">Notification Correct</SelectItem>
                  <SelectItem value="223">Notification Correct Circle</SelectItem>
                  <SelectItem value="224">Notification Question Mark</SelectItem>
                  <SelectItem value="225">Notification Question Mark Circle</SelectItem>
                  <SelectItem value="226">Notification Arrow Up</SelectItem>
                  <SelectItem value="227">Notification Arrow Up Circle</SelectItem>
                  <SelectItem value="228">Notification Arrow Down</SelectItem>
                  <SelectItem value="229">Notification Arrow Down Circle</SelectItem>
                  <SelectItem value="250">Notification Skull</SelectItem>
                  <SelectItem value="251">Notification Skull 2</SelectItem>
                  <SelectItem value="252">Notification Magnifier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Value2 - Visibility */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-neutral-500 whitespace-nowrap">Value2:</span>
            <div className="flex gap-1 min-w-0 flex-1">
              <Select value={data.value2 || "1"} onValueChange={handleValue2Change}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="1">1 - Only the user</SelectItem>
                  <SelectItem value="2">2 - Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Value3 - Sender */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-neutral-500 whitespace-nowrap">Value3:</span>
            <div className="flex gap-1 min-w-0 flex-1">
              <Select value={data.value3 || "1"} onValueChange={handleValue3Change}>
                <SelectTrigger
                  className="h-auto px-2 py-1 text-xs border-neutral-300 font-mono min-w-0 w-full"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="1">1 - User</SelectItem>
                  <SelectItem value="2">2 - Bot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-neutral-700!"
      />
    </div>
  );
});


export const WaitNode = memo((props: CustomNodeProps) => {
  const { data, id } = props;
  const { updateNodeData } = useReactFlow();


  const waitTimeOptions = [];
  for (let i = 0.5; i <= 10; i += 0.5) {
    waitTimeOptions.push(i.toFixed(1));
  }

  const currentWaitTime = data.value1 || "1.0";

  const handleWaitTimeChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  return (
    <div className="relative">
      <BaseDialogNode
        {...props}
        showTargetHandle={true}
        showSourceHandle={true}
        showSpeech={false}
        showBotId={false}
        accentColor="bg-emerald-50"
        borderColor="border-emerald-300"
        badgeColor="bg-emerald-700"
      />
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <Select value={currentWaitTime} onValueChange={handleWaitTimeChange}>
          <SelectTrigger className="w-20 h-6 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {waitTimeOptions.map((time) => (
              <SelectItem key={time} value={time}>
                {time}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});


export const RandomNode = memo((props: CustomNodeProps) => {
  const { data, id } = props;
  const { updateNodeData } = useReactFlow();


  const randomOutputOptions = Array.from({ length: 9 }, (_, i) => (i + 2).toString());
  const currentOutputs = data.value1 || "2";

  const handleOutputsChange = (value: string) => {
    updateNodeData(id, { value1: value });
  };

  return (
    <div className="relative">
      <BaseDialogNode
        {...props}
        showTargetHandle={true}
        showSourceHandle={true}
        showSpeech={false}
        showBotId={false}
        accentColor="bg-teal-50"
        borderColor="border-teal-300"
        badgeColor="bg-teal-700"
      />
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <Select value={currentOutputs} onValueChange={handleOutputsChange}>
          <SelectTrigger className="w-20 h-6 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {randomOutputOptions.map((num) => (
              <SelectItem key={num} value={num}>
                {num} salidas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});


export const EndDialogueNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={false}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-red-50"
    borderColor="border-red-300"
    badgeColor="bg-red-700"
  />
));


const DialogNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    accentColor="bg-neutral-50"
    borderColor="border-neutral-300"
    badgeColor="bg-neutral-800"
  />
));

export default DialogNode;
