/**
 * Ruby pinyin layout helpers aligned with GB/T 16159-2012 (汉语拼音正词法基本规则):
 * - Annotate by word segment (分词), not arbitrary character splits
 * - One ruby unit per 词; multi-syllable words keep syllable spacing in <rt>
 * - Non-Chinese punctuation passes through without pinyin
 */

export interface PinyinWordSegment {
  chinese: string;
  pinyin: string;
}

export interface RubySegment {
  text: string;
  pinyin: string;
}

/** Normalize syllables for ruby display: trim, collapse spaces, lowercase body syllables. */
export function formatPinyinForRuby(pinyin: string): string {
  return pinyin
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((syllable, index) => {
      if (index === 0 && /^[A-Z]/.test(syllable)) {
        return syllable;
      }
      return syllable.toLowerCase();
    })
    .join(' ');
}

/**
 * Build ruby segments by walking `original` with segmented `words`.
 * Falls back to plain text when word alignment fails.
 */
export function buildRubySegments(original: string, words: PinyinWordSegment[]): RubySegment[] {
  if (!original) return [];

  if (!words?.length) {
    return [{ text: original, pinyin: '' }];
  }

  const segments: RubySegment[] = [];
  let cursor = 0;

  for (const word of words) {
    const chinese = word.chinese?.trim();
    if (!chinese) continue;

    const index = original.indexOf(chinese, cursor);
    if (index === -1) continue;

    if (index > cursor) {
      segments.push({ text: original.slice(cursor, index), pinyin: '' });
    }

    segments.push({
      text: chinese,
      pinyin: formatPinyinForRuby(word.pinyin),
    });
    cursor = index + chinese.length;
  }

  if (cursor < original.length) {
    segments.push({ text: original.slice(cursor), pinyin: '' });
  }

  if (!segments.length) {
    return [{ text: original, pinyin: '' }];
  }

  return segments;
}
