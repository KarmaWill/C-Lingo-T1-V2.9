export type FunChineseCardType = 'dialogue' | 'grammar' | 'pattern';

export interface FunChineseSavedCard {
  id: string;
  lessonId: number;
  lessonTitle: string;
  lessonTitleEn: string;
  cardIndex: number;
  cardType: FunChineseCardType;
  cardTitle: string;
  cardSubtitle: string;
  preview: string;
  savedAt: number;
}

export const FUN_CHINESE_CARD_COLLECTION_KEY = 'fun-chinese-card-collection-v1';

const TYPE_ORDER: FunChineseCardType[] = ['grammar', 'pattern', 'dialogue'];

export const FUN_CHINESE_UNIT1_COLLECTION_CARDS: FunChineseSavedCard[] = [
  {
    id: 'fun-chinese:1:1:grammar',
    lessonId: 1,
    lessonTitle: '你好',
    lessonTitleEn: 'Hello',
    cardIndex: 1,
    cardType: 'grammar',
    cardTitle: '语气助词',
    cardSubtitle: 'Trợ từ ngữ khí',
    preview: '吗 (ma) turns a statement into a yes/no question.',
    savedAt: 0,
  },
  {
    id: 'fun-chinese:1:2:pattern',
    lessonId: 1,
    lessonTitle: '你好',
    lessonTitleEn: 'Hello',
    cardIndex: 2,
    cardType: 'pattern',
    cardTitle: '句型练习',
    cardSubtitle: 'Luyện mẫu câu',
    preview: '主语 + 很 + 形容词',
    savedAt: 0,
  },
  {
    id: 'fun-chinese:1:0:dialogue',
    lessonId: 1,
    lessonTitle: '你好',
    lessonTitleEn: 'Hello',
    cardIndex: 0,
    cardType: 'dialogue',
    cardTitle: '打招呼',
    cardSubtitle: 'Chào hỏi',
    preview: '你好！你好吗？我很好。谢谢！',
    savedAt: 0,
  },
];

const safeParse = (raw: string | null): FunChineseSavedCard[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FunChineseSavedCard[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item?.id === 'string' &&
        typeof item?.lessonId === 'number' &&
        typeof item?.cardIndex === 'number' &&
        typeof item?.cardType === 'string'
    );
  } catch {
    return [];
  }
};

const writeAll = (cards: FunChineseSavedCard[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FUN_CHINESE_CARD_COLLECTION_KEY, JSON.stringify(cards));
};

export const loadFunChineseSavedCards = (): FunChineseSavedCard[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(FUN_CHINESE_CARD_COLLECTION_KEY);
  const cards = safeParse(raw);
  return cards.sort((a, b) => b.savedAt - a.savedAt);
};

export const isFunChineseCardSaved = (cardId: string): boolean =>
  loadFunChineseSavedCards().some((card) => card.id === cardId);

export const toggleFunChineseSavedCard = (
  card: Omit<FunChineseSavedCard, 'savedAt'>
): { saved: boolean; cards: FunChineseSavedCard[] } => {
  const cards = loadFunChineseSavedCards();
  const exists = cards.some((item) => item.id === card.id);
  const next = exists
    ? cards.filter((item) => item.id !== card.id)
    : [{ ...card, savedAt: Date.now() }, ...cards];
  writeAll(next);
  return { saved: !exists, cards: next };
};

export const removeFunChineseSavedCard = (cardId: string): FunChineseSavedCard[] => {
  const next = loadFunChineseSavedCards().filter((card) => card.id !== cardId);
  writeAll(next);
  return next;
};

export const clearFunChineseSavedCards = () => {
  writeAll([]);
};

export const groupFunChineseSavedCards = (cards: FunChineseSavedCard[]) => {
  const buckets: Record<FunChineseCardType, FunChineseSavedCard[]> = {
    dialogue: [],
    grammar: [],
    pattern: [],
  };
  cards.forEach((card) => {
    buckets[card.cardType].push(card);
  });
  return TYPE_ORDER.map((type) => ({ type, cards: buckets[type] })).filter((section) => section.cards.length > 0);
};
