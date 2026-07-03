/**
 * Ruby pinyin layout helpers aligned with GB/T 16159-2012 (汉语拼音正词法基本规则):
 * - Annotate by word segment (分词), not arbitrary character splits
 * - One ruby unit per 词; multi-syllable words keep syllable spacing in <rt>
 * - Non-Chinese punctuation passes through without pinyin
 */

import { STANDARD_PINYIN_SYLLABLE_SET } from '../data/pinyinStandardSyllables';

export interface PinyinWordSegment {
  chinese: string;
  pinyin: string;
}

export interface RubySegment {
  text: string;
  pinyin: string;
}

const HAN_RE = /[\u4e00-\u9fff]/;

const TONE_VOWELS: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v',
  ü: 'v',
};

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

export function countHanInText(text: string): number {
  return [...text].filter((ch) => HAN_RE.test(ch)).length;
}

export function countHanWordSegments(text: string): { segmentCount: number; segments: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { segmentCount: 0, segments: [] };

  const spaced = trimmed.split(/\s+/).filter(Boolean);
  if (spaced.length >= 2 && spaced.some((part) => [...part].some((ch) => HAN_RE.test(ch)))) {
    return { segmentCount: spaced.length, segments: spaced };
  }

  return { segmentCount: 1, segments: [trimmed] };
}

function toBaseSyllable(raw: string): string {
  let result = '';
  for (const ch of raw.toLowerCase()) {
    result += TONE_VOWELS[ch] ?? ch;
  }
  return result.replace(/[^a-zv]/g, '');
}

/** Split a连写拼音词 into standard syllables (longest-match greedy). */
export function splitPinyinWord(word: string): string[] {
  const letters = word.replace(/[^a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, '');
  if (!letters) return [];

  const base = toBaseSyllable(letters);
  if (STANDARD_PINYIN_SYLLABLE_SET.has(base)) {
    return [word];
  }

  const out: string[] = [];
  let i = 0;
  while (i < base.length) {
    let matched = false;
    for (let len = Math.min(6, base.length - i); len >= 1; len -= 1) {
      const slice = base.slice(i, i + len);
      if (STANDARD_PINYIN_SYLLABLE_SET.has(slice)) {
        out.push(letters.slice(i, i + len));
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out.push(letters[i] ?? '');
      i += 1;
    }
  }

  return out.length ? out : [word];
}

/** Split pinyin input on spaces; strip trailing punctuation from each token. */
export function splitPinyinInput(pinyin: string): string[] {
  return pinyin
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-zA-ZüÜ]+|[^a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+$/g, ''))
    .filter(Boolean);
}

function extractHanChars(text: string): string[] {
  return [...text].filter((ch) => HAN_RE.test(ch));
}

/**
 * Align Chinese text with pinyin per GB/T 16159:
 * 1. If Chinese has manual word spaces matching pinyin word count → pair by segment
 * 2. Else greedy grouping by syllable count from splitPinyinWord
 */
export function alignChinesePinyinToWords(chinese: string, pinyin: string): PinyinWordSegment[] {
  const { segmentCount, segments: hanWordSegments } = countHanWordSegments(chinese);
  const pinyinWords = splitPinyinInput(pinyin);

  if (segmentCount >= 2 && segmentCount === pinyinWords.length) {
    return hanWordSegments.map((ch, index) => ({
      chinese: ch,
      pinyin: pinyinWords[index] ?? '',
    }));
  }

  const hanChars = extractHanChars(chinese);
  if (!hanChars.length || !pinyinWords.length) {
    return [{ chinese: chinese.trim(), pinyin: pinyin.trim() }];
  }

  const words: PinyinWordSegment[] = [];
  let charCursor = 0;

  for (const token of pinyinWords) {
    const syllableCount = Math.max(1, splitPinyinWord(token).length);
    const slice = hanChars.slice(charCursor, charCursor + syllableCount).join('');
    if (!slice) break;
    words.push({ chinese: slice, pinyin: token });
    charCursor += syllableCount;
  }

  if (!words.length) {
    return [{ chinese: chinese.trim(), pinyin: pinyin.trim() }];
  }

  return words;
}

export function buildRubySegmentsFromText(chinese: string, pinyin: string): RubySegment[] {
  const words = alignChinesePinyinToWords(chinese, pinyin);
  return buildRubySegments(chinese, words);
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
