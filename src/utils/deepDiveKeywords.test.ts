import { describe, expect, it } from 'vitest';
import { pickDeepDiveKeywords } from './deepDiveKeywords';

describe('pickDeepDiveKeywords', () => {
  it('picks content words and skips particles', () => {
    const keys = pickDeepDiveKeywords(
      '你好！欢迎来到我们的咖啡店。今天想喝点什么？',
      'Nǐhǎo! Huānyíng láidào wǒmen de kāfēidiàn. Jīntiān xiǎng hē diǎn shénme?',
      3,
    );
    expect(keys.length).toBeLessThanOrEqual(3);
    expect(keys.length).toBeGreaterThanOrEqual(2);
    expect(keys.every((k) => k.chinese !== '的' && k.chinese !== '点')).toBe(true);
    expect(keys.some((k) => k.chinese.includes('咖啡') || k.chinese === '欢迎' || k.chinese === '今天')).toBe(true);
    expect(keys.every((k) => typeof k.pos === 'string' && k.pos.length > 0)).toBe(true);
    const nihao = keys.find((k) => k.chinese === '你好');
    if (nihao) {
      expect(nihao.hsk).toBe(1);
      expect(nihao.pos).toBe('phrase');
    }
  });
});
