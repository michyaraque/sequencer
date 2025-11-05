export interface DialogNodeData extends Record<string, unknown> {
  botId: string;
  userId: string;
  nextNodeId: string;
  speechId: string;
  speechSpeed: string;
  actionId: string;
  value1: string;
  value2: string;
  value3: string;
  label: string;
}

export const ACTION_TYPES = {
  1: "Initialize Speech",
  2: "Whisper",
  3: "Talk",
  4: "Shout",
  5: "Private Message",
  6: "Public Message",
  7: "Choice",
  97: "Wait",
  98: "Custom Action",
  99: "End Speech",
} as const;

export const SPEECH_SPEEDS = {
  "1": "Slow",
  "2": "Normal",
  "3": "Fast",
} as const;

export const CHANGE_TYPES = {
  1: "Give Variable",
  2: "Remove Variable",
  3: "Add",
  4: "Subtract",
  5: "Set",
} as const;

export const CONDITION_TYPES = {
  1: "Greater Than",
  2: "Greater or Equal",
  3: "Equal",
  4: "Less or Equal",
  5: "Less Than",
  6: "Not Equal",
} as const;

export interface ExportFormat {
  index: number;
  botId: string;
  userId: string;
  nextNodeId: string;
  textId: string;
  textSpeed: string;
  actionId: string;
  value1: string;
  value2: string;
  value3: string;
}

export interface SpeechText {
  id: string;
  languageId: number; // 1 = 100000, 2 = 200000, etc.
  text: string; // Text with formatting tags
}

export const LANGUAGE_PREFIXES = {
  1: 100000,
  2: 200000,
  3: 300000,
  4: 400000,
} as const;

export const FORMATTING_TAGS = {
  bold: { open: "[b]", close: "[/b]" },
  underline: { open: "[u]", close: "[/u]" },
  italic: { open: "[i]", close: "[/i]" },
  blue: { open: "[blue]", close: "[/blue]" },
  cyan: { open: "[cyan]", close: "[/cyan]" },
  purple: { open: "[purple]", close: "[/purple]" },
  red: { open: "[red]", close: "[/red]" },
} as const;

export interface NPC {
  id: string;
  name: string;
}

export interface Variable {
  id: string;
  name: string;
  description?: string;
}
