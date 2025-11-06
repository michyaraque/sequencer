import { NodeProps, Node } from "@xyflow/react";
import { DialogNodeData, LANGUAGE_PREFIXES, SpeechText } from "@/types/dialog";

export type DialogRFNode = Node<DialogNodeData>;

export interface CustomNodeProps extends NodeProps<DialogRFNode> {
  onOpenSpeechManager?: () => void;
  onOpenNPCManager?: () => void;
}

export function getSpeechIdInLanguage(
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

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const languageNames: Record<number, string> = {
  1: "English",
  2: "Spanish",
  3: "Portuguese",
  4: "French",
};
