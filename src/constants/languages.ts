export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  speechPrefix: number;
  flag?: string;
}

export const LANGUAGES: Language[] = [
  {
    id: 1,
    code: "en",
    name: "English",
    nativeName: "English",
    speechPrefix: 100000,
    flag: "🇬🇧",
  },
  {
    id: 2,
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    speechPrefix: 200000,
    flag: "🇪🇸",
  },
  {
    id: 3,
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    speechPrefix: 300000,
    flag: "🇵🇹",
  },
  {
    id: 4,
    code: "fr",
    name: "French",
    nativeName: "Français",
    speechPrefix: 400000,
    flag: "🇫🇷",
  },
];

export const LANGUAGE_MAP = LANGUAGES.reduce((acc, lang) => {
  acc[lang.id] = lang;
  return acc;
}, {} as Record<number, Language>);

export const LANGUAGE_PREFIX_MAP = LANGUAGES.reduce((acc, lang) => {
  acc[lang.speechPrefix] = lang;
  return acc;
}, {} as Record<number, Language>);

export function getLanguageById(id: number): Language | undefined {
  return LANGUAGE_MAP[id];
}

export function getLanguageByPrefix(prefix: number): Language | undefined {
  return LANGUAGE_PREFIX_MAP[prefix];
}

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

export function getSpeechIdForLanguage(localId: number, languageId: number): string {
  const language = getLanguageById(languageId);
  if (!language) return (100000 + localId).toString();
  return (language.speechPrefix + localId).toString();
}

export function extractLocalId(speechId: string | number): number {
  const numericId = typeof speechId === 'string' ? parseInt(speechId, 10) : speechId;
  return numericId % 100000;
}

export function getLanguageFromSpeechId(speechId: string | number): Language {
  const numericId = typeof speechId === 'string' ? parseInt(speechId, 10) : speechId;

  for (const lang of LANGUAGES) {
    if (numericId >= lang.speechPrefix && numericId < lang.speechPrefix + 100000) {
      return lang;
    }
  }

  return LANGUAGES[0];
}

export const DEFAULT_LANGUAGE_ID = 1;
