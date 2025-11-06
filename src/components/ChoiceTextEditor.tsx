"use client";

import { useState, useMemo } from "react";
import { ChoiceText, SpeechText } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
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
import { languageNames, getSpeechIdInLanguage, truncateText } from "@/components/nodes/shared";

interface ChoiceTextEditorProps {
  choiceText: ChoiceText | null;
  onSave: (choiceText: ChoiceText) => void;
  onCancel: () => void;
  existingIds: string[];
}

export default function ChoiceTextEditor({
  choiceText,
  onSave,
  onCancel,
  existingIds,
}: ChoiceTextEditorProps) {
  const [id, setId] = useState(choiceText?.id || "");
  const [text, setText] = useState(choiceText?.text || "");
  const [speechId, setSpeechId] = useState(choiceText?.speechId || "-1");
  const [speechComboboxOpen, setSpeechComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const speechTexts = useGameDialogStore((state) => state.speechTexts);
  const selectedLanguage = useGameDialogStore((state) => state.selectedLanguage);

  const displaySpeech = useMemo(() => {
    return getSpeechIdInLanguage(speechId || "-1", selectedLanguage, speechTexts);
  }, [speechId, selectedLanguage, speechTexts]);

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

  const handleSave = () => {
    if (!id.trim() || !text.trim()) {
      toast.error("ID and text are required!");
      return;
    }

    const newChoiceText: ChoiceText = {
      id: id.trim(),
      text: text.trim(),
      speechId: speechId || "-1",
    };

    if (existingIds.includes(newChoiceText.id) && choiceText?.id !== newChoiceText.id) {
      toast.error(`Choice ID ${newChoiceText.id} already exists!`);
      return;
    }

    onSave(newChoiceText);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-neutral-800">
        {choiceText ? "Edit Choice" : "New Choice"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Choice ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono"
            placeholder="e.g., CHOICE001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Choice Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            placeholder="e.g., Attack with sword"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Speech ID
          </label>
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
                className="w-full justify-between font-mono"
              >
                <span className="truncate">
                  {displaySpeech.speechId === "-1"
                    ? "-1 (None)"
                    : speechTextObj
                      ? truncateText(speechTextObj.text)
                      : speechId
                  }
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search by ID or text..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No speech found.</CommandEmpty>

                  <CommandGroup heading="General">
                    <CommandItem
                      value="-1-none"
                      onSelect={() => {
                        setSpeechId("-1");
                        setSpeechComboboxOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      -1 (None)
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          speechId === "-1" ? "opacity-100" : "opacity-0"
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
                              setSpeechId(st.id);
                              setSpeechComboboxOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            {truncateText(st.text)}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                speechId === st.id ? "opacity-100" : "opacity-0"
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
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-neutral-200">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
        >
          Save Choice
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
