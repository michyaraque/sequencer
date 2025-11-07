"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { LANGUAGE_PREFIXES, SpeechText } from "@/types/dialog";
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
import { CustomNodeProps, getSpeechIdInLanguage, truncateText, languageNames } from "./shared";

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

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[370px] max-w-[420px] transition-all ${selected
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
            <span className="font-medium text-neutral-500 whitespace-nowrap shrink-0">Text:</span>
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
                    className="h-[35px] px-2 text-xs border-neutral-300 font-mono min-w-0 flex-1 justify-between overflow-hidden bg-neutral-900/5 hover:bg-neutral-900/10"
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
            <span className="font-medium text-neutral-500 whitespace-nowrap">Style:</span>
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
            <span className="font-medium text-neutral-500 whitespace-nowrap">Visibility:</span>
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
          {data.value2 == "2" && (
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 whitespace-nowrap">Origin:</span>
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
          )}

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

ShowMessageNode.displayName = "ShowMessageNode";
