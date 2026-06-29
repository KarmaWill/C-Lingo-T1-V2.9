export interface LingoFlashWord {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  exampleEn: string;
  exampleCn: string;
  memoryAid?: string;
}

export const LINGO_FLASH_DECK: LingoFlashWord[] = [
  {
    id: '1',
    word: '你好',
    phonetic: 'nǐ hǎo',
    translation: 'Hello · 你好',
    definition: 'A common greeting used when meeting people.',
    exampleEn: 'She smiled and said "nǐ hǎo" to everyone.',
    exampleCn: '她对每个人微笑着说"你好"。',
    memoryAid: 'nǐ = you, hǎo = good → "You good?" → Hello!',
  },
  {
    id: '2',
    word: '谢谢',
    phonetic: 'xiè xie',
    translation: 'Thank you · 谢谢',
    definition: 'Expression of gratitude, used universally.',
    exampleEn: '"Xièxie" — he bowed after receiving the gift.',
    exampleCn: '他收到礼物后鞠躬说"谢谢"。',
    memoryAid: 'xiè + xiè — the syllable repeats, doubling the thanks.',
  },
  {
    id: '3',
    word: '名字',
    phonetic: 'míng zi',
    translation: 'Name · 名字',
    definition: 'The word or words by which a person is known.',
    exampleEn: 'What is your míng zi?',
    exampleCn: '你的名字是什么？',
    memoryAid: 'míng (明 bright) + zi (字 character) → a bright character = your name.',
  },
  {
    id: '4',
    word: '电话',
    phonetic: 'diàn huà',
    translation: 'Phone · 电话',
    definition: 'A telephone or phone call.',
    exampleEn: 'Can I have your diàn huà number?',
    exampleCn: '我可以有你的电话号码吗？',
    memoryAid: 'diàn (电 electricity) + huà (话 speech) → electric speech = phone.',
  },
  {
    id: '5',
    word: '家',
    phonetic: 'jiā',
    translation: 'Home · 家',
    definition: 'The place where one lives; family.',
    exampleEn: 'Wǒ de jiā shì zài Shànghǎi.',
    exampleCn: '我的家在上海。',
    memoryAid: 'jiā looks like a roof over a pig — ancient symbol for household.',
  },
];
