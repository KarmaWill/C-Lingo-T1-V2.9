import { describe, expect, it } from 'vitest';
import { combineInitialFinal } from './pinyinCombine';
import {
  buildValidBaseSyllable,
  getValidFinals,
  getValidInitials,
  isValidPair,
  PINYIN_CHART_OVERRIDES,
} from '../data/pinyinChartMatrix';

describe('pinyinChartValidate', () => {
  it('allows common valid pairs', () => {
    expect(isValidPair('b', 'a')).toBe(true);
    expect(isValidPair('m', 'a')).toBe(true);
    expect(isValidPair('j', 'üe')).toBe(true);
    expect(isValidPair('y', 'i')).toBe(true);
    expect(isValidPair('w', 'u')).toBe(true);
    expect(buildValidBaseSyllable('b', 'a')).toBe('ba');
    expect(buildValidBaseSyllable('j', 'üe')).toBe('jue');
    expect(combineInitialFinal('y', 'i')).toBe('yi');
    expect(combineInitialFinal('w', 'u')).toBe('wu');
  });

  it('rejects common invalid pairs', () => {
    expect(isValidPair('b', 'e')).toBe(false);
    expect(isValidPair('f', 'ong')).toBe(false);
    expect(isValidPair('j', 'a')).toBe(false);
    expect(buildValidBaseSyllable('b', 'e')).toBeNull();
  });

  it('filters finals and initials bidirectionally', () => {
    const bFinals = getValidFinals('b');
    expect(bFinals).toContain('a');
    expect(bFinals).not.toContain('e');

    const aInitials = getValidInitials('a');
    expect(aInitials).toContain('b');
    expect(aInitials).not.toContain('j');
  });

  it('supports override hooks for PDF diff patches', () => {
    expect(Array.isArray(PINYIN_CHART_OVERRIDES.allow)).toBe(true);
    expect(Array.isArray(PINYIN_CHART_OVERRIDES.deny)).toBe(true);
  });
});
