import { alignChinesePinyinToWords, type PinyinWordSegment } from './pinyinRuby';

/** Common function words / particles — skip for Deep Dive Keywords. */
const FUNCTION_WORDS = new Set([
  '的', '了', '吗', '呢', '吧', '啊', '呀', '么', '着', '过',
  '和', '与', '或', '在', '是', '有', '就', '都', '也', '很',
  '不', '没', '这', '那', '个', '一', '点', '些', '得', '地',
  '把', '被', '给', '从', '向', '对', '比', '让', '叫', '会',
  '能', '可以', '要', '到', '去', '来', '上', '下', '里', '外',
]);

type KeywordMeta = {
  gloss: string;
  /** English POS label shown on the chip (n. / v. / adj. / …). */
  pos: string;
  hsk: 1 | 2 | 3 | 4 | 5 | 6 | null;
};

const META: Record<string, KeywordMeta> = {
  你好: { gloss: 'hello', pos: 'phrase', hsk: 1 },
  欢迎: { gloss: 'welcome', pos: 'v.', hsk: 2 },
  来到: { gloss: 'arrive at', pos: 'v.', hsk: 2 },
  我们: { gloss: 'we / our', pos: 'pron.', hsk: 1 },
  咖啡店: { gloss: 'coffee shop', pos: 'n.', hsk: 2 },
  咖啡: { gloss: 'coffee', pos: 'n.', hsk: 2 },
  今天: { gloss: 'today', pos: 'n.', hsk: 1 },
  想: { gloss: 'want to', pos: 'v.', hsk: 1 },
  喝: { gloss: 'drink', pos: 'v.', hsk: 1 },
  什么: { gloss: 'what', pos: 'pron.', hsk: 1 },
  谢谢: { gloss: 'thank you', pos: 'phrase', hsk: 1 },
  再见: { gloss: 'goodbye', pos: 'phrase', hsk: 1 },
  朋友: { gloss: 'friend', pos: 'n.', hsk: 1 },
  老师: { gloss: 'teacher', pos: 'n.', hsk: 1 },
  学生: { gloss: 'student', pos: 'n.', hsk: 1 },
  喜欢: { gloss: 'to like', pos: 'v.', hsk: 1 },
  学习: { gloss: 'to study', pos: 'v.', hsk: 1 },
  中文: { gloss: 'Chinese', pos: 'n.', hsk: 1 },
  中国: { gloss: 'China', pos: 'n.', hsk: 1 },
};

export interface DeepDiveKeyword extends PinyinWordSegment {
  gloss: string;
  pos: string;
  hsk: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

function isContentWord(chinese: string): boolean {
  const trimmed = chinese.replace(/[^\u4e00-\u9fff]/g, '');
  if (!trimmed) return false;
  if (FUNCTION_WORDS.has(trimmed)) return false;
  if (trimmed.length === 1 && FUNCTION_WORDS.has(trimmed)) return false;
  return true;
}

function metaFor(chinese: string): KeywordMeta {
  const key = chinese.replace(/[^\u4e00-\u9fff]/g, '');
  return META[key] ?? { gloss: 'key word', pos: 'word', hsk: null };
}

/**
 * Pick 2–3 content words from a sentence for Deep Dive Keywords.
 * Prefers multi-character words first, then fills with remaining content words in order.
 */
export function pickDeepDiveKeywords(
  chinese: string,
  pinyin: string,
  max = 3,
): DeepDiveKeyword[] {
  const words = alignChinesePinyinToWords(chinese, pinyin).filter((w) => isContentWord(w.chinese));
  if (!words.length) return [];

  const multi = words.filter((w) => w.chinese.replace(/[^\u4e00-\u9fff]/g, '').length >= 2);
  const single = words.filter((w) => w.chinese.replace(/[^\u4e00-\u9fff]/g, '').length === 1);

  const picked: PinyinWordSegment[] = [];
  for (const w of [...multi, ...single]) {
    if (picked.length >= max) break;
    if (picked.some((p) => p.chinese === w.chinese)) continue;
    picked.push(w);
  }

  return picked.map((w) => {
    const meta = metaFor(w.chinese);
    return {
      ...w,
      gloss: meta.gloss,
      pos: meta.pos,
      hsk: meta.hsk,
    };
  });
}
