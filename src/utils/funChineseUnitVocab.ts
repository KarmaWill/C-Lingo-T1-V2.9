/**
 * Fun Chinese Unit 1 vocabulary for flashcards / LingoFlash deck mapping.
 */
import { loadCompletedLessonIds } from './funChineseUnitProgress';

export type FunChineseVocabRow = { lessonId: number; zh: string; en: string };

/** Same content previously inline on FunChineseHubPage (MOCK_VOCAB). */
export const FUN_CHINESE_UNIT1_VOCAB: FunChineseVocabRow[] = [
  { lessonId: 1, zh: '你好', en: 'Hello' },
  { lessonId: 1, zh: '谢谢', en: 'Thank you' },
  { lessonId: 1, zh: '再见', en: 'Goodbye' },
  { lessonId: 2, zh: '你叫什么？', en: "What's your name?" },
  { lessonId: 2, zh: '我叫…', en: 'My name is…' },
  { lessonId: 3, zh: '家', en: 'home' },
  { lessonId: 3, zh: '在哪儿', en: 'where' },
];

/** Shape compatible with LingoFlash `Word` (avoid importing from page). */
export type FunChineseMappedLingoWord = {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  exampleEn: string;
  exampleCn: string;
  memoryAid?: string;
};

/**
 * Words from completed lessons only, mapped for LingoFlash `LearningSession`.
 * IDs use prefix `fc-unit1-` so they do not collide with built-in DECK numeric ids.
 */
export function getFunChineseFlashWordsForHub(): FunChineseMappedLingoWord[] {
  const completed = loadCompletedLessonIds();
  const out: FunChineseMappedLingoWord[] = [];
  FUN_CHINESE_UNIT1_VOCAB.forEach((v, masterIdx) => {
    if (!completed.has(v.lessonId)) return;
    const id = `fc-unit1-L${v.lessonId}-${masterIdx}`;
    out.push({
      id,
      word: v.zh,
      phonetic: '—',
      translation: v.en,
      definition: `Core phrase or word for this unit: ${v.en}.`,
      exampleEn: `Try saying “${v.zh}” in a short reply.`,
      exampleCn: `例：${v.zh}`,
      memoryAid: `${v.zh} ↔ ${v.en}`,
    });
  });
  return out;
}
