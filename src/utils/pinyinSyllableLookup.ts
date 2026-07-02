import type { AppLocaleId } from '../data/localeConfig';

export type PinyinMeanings = Partial<Record<AppLocaleId, string>> & {
  en: string;
  zh: string;
  vi: string;
  ms: string;
};

export interface PinyinPhraseEntry {
  hanzi: string;
  pinyin: string;
  meanings: PinyinMeanings;
}

export interface PinyinLookupEntry {
  hanzi: string;
  pinyin: string;
  difficulty: number;
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6 | null;
  meaning: PinyinMeanings;
  phrases: [PinyinPhraseEntry, PinyinPhraseEntry, PinyinPhraseEntry];
}

/** HSK level by single character (fallback when not on syllable entry). */
export const HSK_LEVEL_BY_CHAR: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
  八: 1,
  拔: 4,
  把: 2,
  爸: 1,
  妈: 1,
  马: 1,
  你: 1,
  好: 1,
  我: 1,
  他: 1,
  大: 1,
  小: 1,
  女: 1,
  普: 4,
  学: 1,
  一: 1,
  吃: 1,
  天: 1,
  音: 3,
};

const LOCALE_ORDER: AppLocaleId[] = ['en', 'zh', 'vi', 'ms'];

export const LOCALE_LABELS: Record<AppLocaleId, string> = {
  en: 'EN',
  zh: 'CN',
  vi: 'VI',
  ms: 'MS',
  es: 'ES',
  fr: 'FR',
  ja: 'JA',
  ko: 'KO',
};

function phrase(hanzi: string, pinyin: string, meanings: PinyinMeanings): PinyinPhraseEntry {
  return { hanzi, pinyin, meanings };
}

function entry(
  hanzi: string,
  pinyin: string,
  difficulty: number,
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6 | null,
  meaning: PinyinMeanings,
  p1: PinyinPhraseEntry,
  p2: PinyinPhraseEntry,
  p3: PinyinPhraseEntry,
): PinyinLookupEntry {
  return { hanzi, pinyin, difficulty, hskLevel, meaning, phrases: [p1, p2, p3] };
}

/** Keyed by toned pinyin; phrases use GB/T 16159 word-level spacing in `pinyin`. */
export const PINYIN_SYLLABLE_LOOKUP: Record<string, PinyinLookupEntry> = {
  bā: entry('八', 'bā', 1, 1, { en: 'eight', zh: '数字八', vi: 'số tám', ms: 'lapan' },
    phrase('八个', 'bā ge', { en: 'eight items', zh: '八个', vi: 'tám cái', ms: 'lapan biji' }),
    phrase('八月', 'bā yuè', { en: 'August', zh: '八月', vi: 'tháng tám', ms: 'Ogos' }),
    phrase('八方', 'bā fāng', { en: 'all directions', zh: '四面八方', vi: 'mọi phía', ms: 'semua arah' }),
  ),
  bá: entry('拔', 'bá', 2, 4, { en: 'to pull out', zh: '拔出', vi: 'nhổ / rút', ms: 'cabut' },
    phrase('拔河', 'bá hé', { en: 'tug of war', zh: '拔河比赛', vi: 'kéo co', ms: 'tarik tali' }),
    phrase('海拔', 'hǎi bá', { en: 'altitude', zh: '海拔高度', vi: 'độ cao', ms: 'ketinggian' }),
    phrase('提拔', 'tí bá', { en: 'to promote', zh: '提拔干部', vi: 'thăng tiến', ms: 'naik pangkat' }),
  ),
  bǎ: entry('把', 'bǎ', 2, 2, { en: 'handle; measure word', zh: '把（量词）', vi: 'cái / tay cầm', ms: 'pemegang' },
    phrase('把手', 'bǎ shou', { en: 'handle', zh: '把手', vi: 'tay cầm', ms: 'pemegang' }),
    phrase('一把', 'yī bǎ', { en: 'a (measure word)', zh: '一把椅子', vi: 'một cái', ms: 'seekor / sebilah' }),
    phrase('把门', 'bǎ mén', { en: 'close the door', zh: '把门关上', vi: 'đóng cửa', ms: 'tutup pintu' }),
  ),
  bà: entry('爸', 'bà', 1, 1, { en: 'dad', zh: '爸爸', vi: 'bố', ms: 'ayah' },
    phrase('爸爸', 'bàba', { en: 'father', zh: '爸爸', vi: 'bố', ms: 'ayah' }),
    phrase('老爸', 'lǎo bà', { en: 'old man / dad', zh: '老爸', vi: 'bố già', ms: 'ayah tersayang' }),
    phrase('爸妈', 'bà mā', { en: 'parents', zh: '爸爸妈妈', vi: 'bố mẹ', ms: 'ibu bapa' }),
  ),
  mā: entry('妈', 'mā', 1, 1, { en: 'mom', zh: '妈妈', vi: 'mẹ', ms: 'ibu' },
    phrase('妈妈', 'māma', { en: 'mother', zh: '妈妈', vi: 'mẹ', ms: 'ibu' }),
    phrase('大妈', 'dà mā', { en: 'auntie', zh: '大妈', vi: 'dì', ms: 'mak cik' }),
    phrase('妈祖', 'mā zǔ', { en: 'Mazu (goddess)', zh: '妈祖', vi: 'Mazu', ms: 'Mazu' }),
  ),
  mǎ: entry('马', 'mǎ', 1, 1, { en: 'horse', zh: '马', vi: 'ngựa', ms: 'kuda' },
    phrase('马上', 'mǎ shàng', { en: 'right away', zh: '马上', vi: 'ngay lập tức', ms: 'segera' }),
    phrase('马路', 'mǎ lù', { en: 'road', zh: '马路', vi: 'đường phố', ms: 'jalan raya' }),
    phrase('骑马', 'qí mǎ', { en: 'ride a horse', zh: '骑马', vi: 'cưỡi ngựa', ms: 'menunggang kuda' }),
  ),
  nǐ: entry('你', 'nǐ', 1, 1, { en: 'you', zh: '你', vi: 'bạn', ms: 'awak' },
    phrase('你好', 'nǐ hǎo', { en: 'hello', zh: '你好', vi: 'xin chào', ms: 'hello' }),
    phrase('你们', 'nǐmen', { en: 'you (plural)', zh: '你们', vi: 'các bạn', ms: 'kamu semua' }),
    phrase('你的', 'nǐ de', { en: 'your', zh: '你的', vi: 'của bạn', ms: 'milik awak' }),
  ),
  hǎo: entry('好', 'hǎo', 1, 1, { en: 'good', zh: '好', vi: 'tốt', ms: 'baik' },
    phrase('你好', 'nǐ hǎo', { en: 'hello', zh: '你好', vi: 'xin chào', ms: 'hello' }),
    phrase('好吃', 'hǎo chī', { en: 'delicious', zh: '好吃', vi: 'ngon', ms: 'sedap' }),
    phrase('很好', 'hěn hǎo', { en: 'very good', zh: '很好', vi: 'rất tốt', ms: 'sangat baik' }),
  ),
  wǒ: entry('我', 'wǒ', 1, 1, { en: 'I; me', zh: '我', vi: 'tôi', ms: 'saya' },
    phrase('我们', 'wǒmen', { en: 'we; us', zh: '我们', vi: 'chúng tôi', ms: 'kami' }),
    phrase('我的', 'wǒ de', { en: 'my; mine', zh: '我的', vi: 'của tôi', ms: 'milik saya' }),
    phrase('我是', 'wǒ shì', { en: 'I am', zh: '我是', vi: 'tôi là', ms: 'saya ialah' }),
  ),
  tā: entry('他', 'tā', 1, 1, { en: 'he; him', zh: '他', vi: 'anh ấy', ms: 'dia' },
    phrase('他们', 'tāmen', { en: 'they', zh: '他们', vi: 'họ', ms: 'mereka' }),
    phrase('他的', 'tā de', { en: 'his', zh: '他的', vi: 'của anh ấy', ms: 'miliknya' }),
    phrase('他是', 'tā shì', { en: 'he is', zh: '他是', vi: 'anh ấy là', ms: 'dia ialah' }),
  ),
  dà: entry('大', 'dà', 1, 1, { en: 'big', zh: '大', vi: 'lớn', ms: 'besar' },
    phrase('大家', 'dàjiā', { en: 'everyone', zh: '大家', vi: 'mọi người', ms: 'semua orang' }),
    phrase('大学', 'dàxué', { en: 'university', zh: '大学', vi: 'đại học', ms: 'universiti' }),
    phrase('大小', 'dà xiǎo', { en: 'size', zh: '大小', vi: 'kích cỡ', ms: 'saiz' }),
  ),
  xiǎo: entry('小', 'xiǎo', 1, 1, { en: 'small', zh: '小', vi: 'nhỏ', ms: 'kecil' },
    phrase('小学', 'xiǎoxué', { en: 'primary school', zh: '小学', vi: 'tiểu học', ms: 'sekolah rendah' }),
    phrase('小孩', 'xiǎo hái', { en: 'child', zh: '小孩', vi: 'trẻ em', ms: 'kanak-kanak' }),
    phrase('小心', 'xiǎo xīn', { en: 'be careful', zh: '小心', vi: 'cẩn thận', ms: 'berhati-hati' }),
  ),
  nǚ: entry('女', 'nǚ', 1, 1, { en: 'female', zh: '女', vi: 'nữ', ms: 'perempuan' },
    phrase('女儿', 'nǚ ér', { en: 'daughter', zh: '女儿', vi: 'con gái', ms: 'anak perempuan' }),
    phrase('女人', 'nǚ rén', { en: 'woman', zh: '女人', vi: 'phụ nữ', ms: 'wanita' }),
    phrase('女孩', 'nǚ hái', { en: 'girl', zh: '女孩', vi: 'cô gái', ms: 'gadis' }),
  ),
  pǔ: entry('普', 'pǔ', 2, 4, { en: 'general; common', zh: '普通', vi: 'phổ biến', ms: 'umum' },
    phrase('普通', 'pǔ tōng', { en: 'ordinary', zh: '普通', vi: 'bình thường', ms: 'biasa' }),
    phrase('普及', 'pǔ jí', { en: 'to popularize', zh: '普及', vi: 'phổ cập', ms: 'memperkasa' }),
    phrase('普遍', 'pǔ biàn', { en: 'universal', zh: '普遍', vi: 'phổ biến', ms: 'meluas' }),
  ),
  xué: entry('学', 'xué', 1, 1, { en: 'to learn', zh: '学习', vi: 'học', ms: 'belajar' },
    phrase('学习', 'xuéxí', { en: 'to study', zh: '学习', vi: 'học tập', ms: 'belajar' }),
    phrase('学生', 'xuésheng', { en: 'student', zh: '学生', vi: 'học sinh', ms: 'pelajar' }),
    phrase('学校', 'xuéxiào', { en: 'school', zh: '学校', vi: 'trường học', ms: 'sekolah' }),
  ),
  yī: entry('一', 'yī', 1, 1, { en: 'one', zh: '一', vi: 'một', ms: 'satu' },
    phrase('一个', 'yī ge', { en: 'one (item)', zh: '一个', vi: 'một cái', ms: 'satu' }),
    phrase('一起', 'yīqǐ', { en: 'together', zh: '一起', vi: 'cùng nhau', ms: 'bersama' }),
    phrase('第一', 'dì yī', { en: 'first', zh: '第一', vi: 'thứ nhất', ms: 'pertama' }),
  ),
  chī: entry('吃', 'chī', 1, 1, { en: 'to eat', zh: '吃', vi: 'ăn', ms: 'makan' },
    phrase('吃饭', 'chī fàn', { en: 'to eat a meal', zh: '吃饭', vi: 'ăn cơm', ms: 'makan' }),
    phrase('好吃', 'hǎo chī', { en: 'delicious', zh: '好吃', vi: 'ngon', ms: 'sedap' }),
    phrase('吃惊', 'chī jīng', { en: 'surprised', zh: '吃惊', vi: 'ngạc nhiên', ms: 'terkejut' }),
  ),
  tiān: entry('天', 'tiān', 1, 1, { en: 'sky; day', zh: '天', vi: 'trời; ngày', ms: 'langit; hari' },
    phrase('今天', 'jīntiān', { en: 'today', zh: '今天', vi: 'hôm nay', ms: 'hari ini' }),
    phrase('明天', 'míngtiān', { en: 'tomorrow', zh: '明天', vi: 'ngày mai', ms: 'esok' }),
    phrase('天气', 'tiān qì', { en: 'weather', zh: '天气', vi: 'thời tiết', ms: 'cuaca' }),
  ),
};

function buildFallbackEntry(tonedPinyin: string): PinyinLookupEntry {
  return entry(
    '音',
    tonedPinyin,
    3,
    HSK_LEVEL_BY_CHAR['音'] ?? null,
    {
      en: `Syllable ${tonedPinyin}`,
      zh: `音节 ${tonedPinyin}`,
      vi: `âm tiết ${tonedPinyin}`,
      ms: `suku kata ${tonedPinyin}`,
    },
    phrase('拼音', 'pīn yīn', { en: 'pinyin', zh: '拼音', vi: 'bính âm', ms: 'pinyin' }),
    phrase('发音', 'fā yīn', { en: 'pronunciation', zh: '发音', vi: 'phát âm', ms: 'sebutan' }),
    phrase('声调', 'shēng diào', { en: 'tone', zh: '声调', vi: 'thanh điệu', ms: 'nada bunyi' }),
  );
}

export function resolvePinyinMeaning(meanings: PinyinMeanings, localeId: AppLocaleId): string {
  return meanings[localeId] ?? meanings.en;
}

export function lookupPinyinSyllable(tonedPinyin: string): PinyinLookupEntry {
  return PINYIN_SYLLABLE_LOOKUP[tonedPinyin] ?? buildFallbackEntry(tonedPinyin);
}

export function hasPinyinSyllableEntry(tonedPinyin: string): boolean {
  return tonedPinyin in PINYIN_SYLLABLE_LOOKUP;
}

export function formatMultilingualLine(meanings: PinyinMeanings): string {
  return LOCALE_ORDER.map((id) => `${LOCALE_LABELS[id]}: ${meanings[id] ?? '—'}`).join('  ·  ');
}
