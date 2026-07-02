import { combineInitialFinal, stripTone } from '../utils/pinyinCombine';
import { STANDARD_PINYIN_SYLLABLE_SET } from './pinyinStandardSyllables';

/** Matches PinyinChartPage UI order. */
export const PINYIN_INITIALS = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x',
  'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
] as const;

/** Matches PinyinChartPage UI order. Ü shown in UI; combine rules handle spelling. */
export const PINYIN_FINALS = [
  'a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  'ia', 'iao', 'ua', 'uo', 'an', 'en', 'in', 'un', 'ün', 'ian', 'uan', 'üan',
  'ang', 'eng', 'ing', 'ong',
] as const;

export type PinyinInitial = (typeof PINYIN_INITIALS)[number];
export type PinyinFinal = (typeof PINYIN_FINALS)[number];

export interface PinyinChartOverrides {
  /** Force-allow pairs not in the standard bootstrap (PDF-confirmed). */
  allow: ReadonlyArray<readonly [PinyinInitial | string, PinyinFinal | string]>;
  /** Force-deny pairs (PDF-confirmed gaps). */
  deny: ReadonlyArray<readonly [PinyinInitial | string, PinyinFinal | string]>;
}

/** Patch list after PDF diff review. Empty until user confirms overrides. */
export const PINYIN_CHART_OVERRIDES: PinyinChartOverrides = {
  allow: [],
  deny: [],
};

function pairKey(initial: string, final: string): string {
  return `${initial}|${final}`;
}

function normalizeBaseSyllable(syllable: string): string {
  return stripTone(syllable);
}

function isStandardSyllable(combined: string): boolean {
  return STANDARD_PINYIN_SYLLABLE_SET.has(normalizeBaseSyllable(combined));
}

function buildBootstrapValidPairs(): Set<string> {
  const pairs = new Set<string>();
  for (const initial of PINYIN_INITIALS) {
    for (const final of PINYIN_FINALS) {
      const combined = combineInitialFinal(initial, final);
      if (isStandardSyllable(combined)) {
        pairs.add(pairKey(initial, final));
      }
    }
  }
  return pairs;
}

const BOOTSTRAP_VALID_PAIRS = buildBootstrapValidPairs();

function buildValidPairSet(): Set<string> {
  const pairs = new Set(BOOTSTRAP_VALID_PAIRS);
  for (const [initial, final] of PINYIN_CHART_OVERRIDES.allow) {
    pairs.add(pairKey(initial, final));
  }
  for (const [initial, final] of PINYIN_CHART_OVERRIDES.deny) {
    pairs.delete(pairKey(initial, final));
  }
  return pairs;
}

const VALID_PAIR_SET = buildValidPairSet();

export function isValidPair(initial: string, final: string): boolean {
  return VALID_PAIR_SET.has(pairKey(initial, final));
}

export function buildValidBaseSyllable(initial: string, final: string): string | null {
  if (!isValidPair(initial, final)) return null;
  return combineInitialFinal(initial, final);
}

export function getValidFinals(initial: string): PinyinFinal[] {
  return PINYIN_FINALS.filter((final) => isValidPair(initial, final));
}

export function getValidInitials(final: string): PinyinInitial[] {
  return PINYIN_INITIALS.filter((initial) => isValidPair(initial, final));
}

/** For diff script / debugging. */
export function getAllValidPairs(): Array<{ initial: string; final: string; syllable: string }> {
  return [...VALID_PAIR_SET]
    .map((key) => {
      const [initial, final] = key.split('|');
      return { initial, final, syllable: combineInitialFinal(initial, final) };
    })
    .sort((a, b) => a.syllable.localeCompare(b.syllable));
}

export function getBootstrapPairCount(): number {
  return BOOTSTRAP_VALID_PAIRS.size;
}

export function getValidPairCount(): number {
  return VALID_PAIR_SET.size;
}

/** Syllables in the standard list not reachable with current initial/final UI (zero-initial etc.). */
export function getUnreachableStandardSyllables(): string[] {
  const reachable = new Set(getAllValidPairs().map((p) => normalizeBaseSyllable(p.syllable)));
  return [...STANDARD_PINYIN_SYLLABLE_SET].filter((s) => !reachable.has(s)).sort();
}
