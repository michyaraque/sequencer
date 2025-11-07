import { NodeProps, Node } from "@xyflow/react";
import { DialogNodeData, SpeechText } from "@/types/dialog";
import { extractLocalId, getSpeechIdForLanguage, LANGUAGE_MAP } from "@/constants/languages";

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

  const localId = extractLocalId(numericId);
  const targetSpeechId = getSpeechIdForLanguage(localId, selectedLanguage);
  const speechExists = speechTexts.some(st => st.id === targetSpeechId);

  if (speechExists) {
    return { speechId: targetSpeechId, isTranslated: true, localId };
  }

  const englishId = getSpeechIdForLanguage(localId, 1);
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

export const languageNames: Record<number, string> = Object.fromEntries(
  Object.entries(LANGUAGE_MAP).map(([id, lang]) => [id, lang.name])
);
