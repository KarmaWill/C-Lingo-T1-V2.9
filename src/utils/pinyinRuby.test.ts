import { describe, expect, it } from 'vitest';
import { buildRubySegmentsFromText, splitPinyinInput } from './pinyinRuby';

describe('pinyinRuby GB/T 16159 word alignment', () => {
  it('keeps multi-syllable words in one ruby unit without Chinese spaces', () => {
    const segments = buildRubySegmentsFromText(
      '你好！欢迎来到我们的咖啡店。',
      'Nǐhǎo! Huānyíng láidào wǒmen de kāfēidiàn.',
    );

    expect(segments.filter((segment) => segment.pinyin)).toEqual([
      { text: '你好', pinyin: 'Nǐhǎo' },
      { text: '欢迎', pinyin: 'Huānyíng' },
      { text: '来到', pinyin: 'láidào' },
      { text: '我们', pinyin: 'wǒmen' },
      { text: '的', pinyin: 'de' },
      { text: '咖啡店', pinyin: 'kāfēidiàn' },
    ]);
  });

  it('aligns manually segmented Chinese and word-level pinyin', () => {
    const segments = buildRubySegmentsFromText(
      '小雨 今天 去 吃',
      'xiaoyu jintian qu chi',
    );

    expect(segments.filter((segment) => segment.pinyin)).toEqual([
      { text: '小雨', pinyin: 'xiaoyu' },
      { text: '今天', pinyin: 'jintian' },
      { text: '去', pinyin: 'qu' },
      { text: '吃', pinyin: 'chi' },
    ]);
  });

  it('preserves leading tone letters when stripping edge punctuation', () => {
    expect(splitPinyinInput('Nǐhǎo! Ānnà.')).toEqual(['Nǐhǎo', 'Ānnà']);
    expect(
      buildRubySegmentsFromText('你叫什么？我叫安娜。', 'Nǐ jiào shénme Wǒ jiào Ānnà')
        .filter((segment) => segment.pinyin)
        .map((segment) => segment.text),
    ).toEqual(['你', '叫', '什么', '我', '叫', '安娜']);
  });

  it('keeps digit tokens and pairs spaced Chinese with word pinyin', () => {
    expect(splitPinyinInput('yú 1949 nián 10 yuè 1 rì')).toEqual([
      'yú',
      '1949',
      'nián',
      '10',
      'yuè',
      '1',
      'rì',
    ]);
    expect(
      buildRubySegmentsFromText(
        '成立 于 1949 年',
        'chénglì yú 1949 nián',
      ).filter((segment) => segment.pinyin),
    ).toEqual([
      { text: '成立', pinyin: 'chénglì' },
      { text: '于', pinyin: 'yú' },
      { text: '1949', pinyin: '1949' },
      { text: '年', pinyin: 'nián' },
    ]);
  });
});
