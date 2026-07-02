const TONE_VOWELS: Record<string, [string, string, string, string]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

export function combineInitialFinal(initial: string, final: string): string {
  if (!final) return initial;
  if (!initial) return final;

  if (['j', 'q', 'x'].includes(initial)) {
    return initial + final.replace(/ü/g, 'u');
  }

  if (initial === 'y') {
    if (final === 'i') return 'yi';
    if (final === 'ü') return 'yu';
    if (final === 'üe') return 'yue';
    if (final === 'ün') return 'yun';
    if (final === 'üan') return 'yuan';
    if (final.startsWith('i')) return 'y' + final.slice(1);
    if (final.startsWith('ü')) return 'y' + final.slice(1);
    return initial + final;
  }

  if (initial === 'w') {
    if (final === 'u') return 'wu';
    if (final.startsWith('u')) return 'w' + final.slice(1);
    return initial + final;
  }

  return initial + final;
}

function toneVowelIndex(syllable: string): number {
  const lower = syllable.toLowerCase();

  if (lower.includes('a')) return lower.lastIndexOf('a');
  if (lower.includes('e')) return lower.lastIndexOf('e');
  if (lower.includes('ou')) return lower.lastIndexOf('o');

  const vowels = ['i', 'u', 'v', 'ü'];
  for (let i = lower.length - 1; i >= 0; i -= 1) {
    if (vowels.includes(lower[i])) return i;
  }

  return -1;
}

export function applyTone(syllable: string, tone: 1 | 2 | 3 | 4): string {
  if (!syllable) return '';

  const index = toneVowelIndex(syllable);
  if (index === -1) return syllable;

  const vowel = syllable[index].toLowerCase();
  const marks = TONE_VOWELS[vowel];
  if (!marks) return syllable;

  const replacement = marks[tone - 1];
  return syllable.slice(0, index) + replacement + syllable.slice(index + 1);
}

export function stripTone(syllable: string): string {
  return syllable
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜü]/g, 'v')
    .toLowerCase();
}
