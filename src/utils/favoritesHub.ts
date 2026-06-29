import { LINGO_FLASH_DECK, type LingoFlashWord } from '../data/lingoFlashDeck';
import { loadFunChineseSavedCards, type FunChineseSavedCard } from './funChineseCardCollection';

export const LINGOFLASH_SAVED_IDS_KEY = 'lingoflash-saved-word-ids';

export function loadLingoFlashSavedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LINGOFLASH_SAVED_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function loadLingoFlashSavedWords(): LingoFlashWord[] {
  const ids = new Set(loadLingoFlashSavedIds());
  return LINGO_FLASH_DECK.filter((word) => ids.has(word.id));
}

export function loadAllFavorites(): {
  flashWords: LingoFlashWord[];
  lessonCards: FunChineseSavedCard[];
  totalCount: number;
} {
  const flashWords = loadLingoFlashSavedWords();
  const lessonCards = loadFunChineseSavedCards();
  return {
    flashWords,
    lessonCards,
    totalCount: flashWords.length + lessonCards.length,
  };
}

export function getFavoritesCount(): number {
  return loadLingoFlashSavedIds().length + loadFunChineseSavedCards().length;
}
