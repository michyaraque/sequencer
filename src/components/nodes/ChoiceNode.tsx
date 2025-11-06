"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { CustomNodeProps } from "./shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronsUpDown, Check } from "lucide-react";
import { Choice } from "@/types/dialog";
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

export const ChoiceNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;
  const { updateNodeData } = useReactFlow();
  const allChoices = useGameDialogStore((state) => state.choices);
  const choiceTexts = useGameDialogStore((state) => state.choiceTexts);
  const addChoice = useGameDialogStore((state) => state.addChoice);
  const editChoice = useGameDialogStore((state) => state.editChoice);
  const deleteChoice = useGameDialogStore((state) => state.deleteChoice);
  const addChoiceText = useGameDialogStore((state) => state.addChoiceText);

  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const nodeChoices = useMemo(() => {
    return allChoices
      .filter((c) => c.nodeId === id)
      .sort((a, b) => a.order - b.order);
  }, [allChoices, id]);

  const choiceCount = nodeChoices.length;
  if (data.value1 !== choiceCount.toString()) {
    updateNodeData(id, { value1: choiceCount.toString() });
  }

  const showChoices = data.value2 !== "0";

  const handleShowChoicesChange = (checked: boolean) => {
    updateNodeData(id, { value2: checked ? "1" : "0" });
  };

  const handleAddChoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOrder = nodeChoices.length;
    const newChoice: Choice = {
      id: `${id}-choice-${Date.now()}`,
      nodeId: id,
      text: "",
      speechId: "",
      order: newOrder,
    };
    addChoice(newChoice);
  };

  const handleDeleteChoice = (e: React.MouseEvent, choiceId: string) => {
    e.stopPropagation();
    deleteChoice(choiceId);
  };

  const handleChoiceTextChange = useCallback((choiceId: string, text: string) => {
    editChoice(choiceId, { text });
  }, [editChoice]);

  const handleCreateNewChoiceText = useCallback((choiceId: string, textContent: string) => {
    const existingChoiceText = choiceTexts.find(ct => ct.text === textContent);

    if (!existingChoiceText) {
      const newChoiceText = {
        id: `CHOICE_${Date.now()}`,
        text: textContent,
        speechId: "-1",
      };
      addChoiceText(newChoiceText);
    }

    editChoice(choiceId, { text: textContent });
    setOpenPopovers({ ...openPopovers, [choiceId]: false });
    setSearchQueries({ ...searchQueries, [choiceId]: "" });
  }, [editChoice, addChoiceText, choiceTexts, openPopovers, searchQueries]);

  const availableChoiceTexts = useMemo(() => {
    return choiceTexts
      .map((ct) => ct.text)
      .filter((text) => text && text.trim())
      .sort();
  }, [choiceTexts]);

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg border-2 min-w-[280px] max-w-[400px] transition-all ${
          selected
            ? 'border-neutral-900 shadow-xl bg-cyan-50'
            : 'border-cyan-300 shadow-md hover:shadow-lg hover:border-neutral-500 bg-cyan-50'
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-neutral-700!"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold font-mono shrink-0">
              ID: {id}
            </div>
            <div className="text-xs text-neutral-700 truncate flex-1 font-medium">
              {data.label}
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-neutral-700 border-t border-neutral-200 pt-2">
            <div className="flex items-center space-x-2 py-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`show-choices-${id}`}
                checked={showChoices}
                onCheckedChange={handleShowChoicesChange}
                className="h-4 w-4"
              />
              <label
                htmlFor={`show-choices-${id}`}
                className="text-xs text-neutral-700 cursor-pointer select-none"
              >
                Show choices
              </label>
            </div>

            <button
              onClick={handleAddChoice}
              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-cyan-100 rounded transition-colors"
            >
              <Plus className="h-3 w-3" />
              add choice
            </button>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {nodeChoices.map((choice, index) => {
                const searchQuery = searchQueries[choice.id] || "";

                return (
                  <div key={choice.id} className="flex items-center gap-1 relative">
                    <button
                      onClick={(e) => handleDeleteChoice(e, choice.id)}
                      className="h-5 w-5 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-cyan-100 rounded transition-colors shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    <Popover
                      open={openPopovers[choice.id] || false}
                      onOpenChange={(open) => {
                        setOpenPopovers({ ...openPopovers, [choice.id]: open });
                        if (!open) setSearchQueries({ ...searchQueries, [choice.id]: "" });
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPopovers[choice.id] || false}
                          className="h-6 px-2 py-0 text-xs border-neutral-300 font-mono flex-1 justify-between overflow-hidden bg-white hover:bg-neutral-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate flex-1 text-left">
                            {choice.text || "Select choice text"}
                          </span>
                          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[280px] p-0"
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search or type new..."
                            className="h-8 text-xs"
                            value={searchQuery}
                            onValueChange={(value) => setSearchQueries({ ...searchQueries, [choice.id]: value })}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          <CommandList>
                            <CommandEmpty>No choice text found.</CommandEmpty>

                            {searchQuery && (
                              <CommandGroup heading="Create New">
                                <CommandItem
                                  onSelect={() => handleCreateNewChoiceText(choice.id, searchQuery)}
                                  className="text-blue-600 text-xs"
                                >
                                  <Plus className="mr-2 h-3 w-3" />
                                  Create "{searchQuery}"
                                </CommandItem>
                              </CommandGroup>
                            )}

                            {availableChoiceTexts.length > 0 && (
                              <CommandGroup heading="Available Choices">
                                {availableChoiceTexts.map((text) => (
                                  <CommandItem
                                    key={text}
                                    value={text.toLowerCase()}
                                    onSelect={() => {
                                      handleChoiceTextChange(choice.id, text);
                                      setOpenPopovers({ ...openPopovers, [choice.id]: false });
                                      setSearchQueries({ ...searchQueries, [choice.id]: "" });
                                    }}
                                    className="text-xs"
                                  >
                                    {text}
                                    <Check
                                      className={cn(
                                        "ml-auto h-3 w-3",
                                        choice.text === text ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`choice-${index}`}
                      className="w-3! h-3! bg-cyan-700! relative! translate-x-0! translate-y-0! right-0!"
                      style={{ position: 'relative', transform: 'none' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChoiceNode.displayName = "ChoiceNode";
