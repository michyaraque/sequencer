"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { ACTION_TYPES, LANGUAGE_PREFIXES, SpeechText } from "@/types/dialog";
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
import { CustomNodeProps, getSpeechIdInLanguage, languageNames, truncateText } from "./shared";

export interface BaseDialogNodeProps extends CustomNodeProps {
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  showSpeech?: boolean;
  showBotId?: boolean;
  accentColor?: string;
  borderColor?: string;
  badgeColor?: string;
  className?: string;
}

export const BaseDialogNode = memo(({
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
}: BaseDialogNodeProps) => {
  const actionLabel = ACTION_TYPES[data.actionId as unknown as keyof typeof ACTION_TYPES] || `Action ${data.actionId}`;
  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const npcs = useGameDialogStore((state) => state.npcs);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);
  const addSpeechText = useGameDialogStore((state) => state.addSpeechText);
  const { updateNodeData } = useReactFlow();
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      className={cn(
        "px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[320px] transition-all",
        accentColor,
        selected
          ? "border-neutral-900 shadow-xl"
          : "shadow-md hover:shadow-lg hover:border-neutral-500",
        selected ? accentColor : borderColor,
        className
      )}
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
                          ? "None (-1)"
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
});