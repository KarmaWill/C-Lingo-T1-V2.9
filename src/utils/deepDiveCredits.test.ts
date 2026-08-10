import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEEP_DIVE_DAILY_LIMIT,
  getDeepDiveCredits,
  refreshDeepDiveCredits,
  spendDeepDiveCredit,
} from './deepDiveCredits';

function mockLocalStorage() {
  const store = new Map<string, string>();
  const api = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: api,
    configurable: true,
  });
}

describe('deepDiveCredits', () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it('starts at daily limit', () => {
    expect(getDeepDiveCredits().remaining).toBe(DEEP_DIVE_DAILY_LIMIT);
  });

  it('spends one credit per call', () => {
    const after = spendDeepDiveCredit(1);
    expect(after?.remaining).toBe(DEEP_DIVE_DAILY_LIMIT - 1);
    expect(getDeepDiveCredits().remaining).toBe(DEEP_DIVE_DAILY_LIMIT - 1);
  });

  it('returns null when empty', () => {
    for (let i = 0; i < DEEP_DIVE_DAILY_LIMIT; i += 1) {
      expect(spendDeepDiveCredit(1)).not.toBeNull();
    }
    expect(spendDeepDiveCredit(1)).toBeNull();
    expect(getDeepDiveCredits().remaining).toBe(0);
  });

  it('refreshDeepDiveCredits refills to daily limit', () => {
    spendDeepDiveCredit(1);
    spendDeepDiveCredit(1);
    const refreshed = refreshDeepDiveCredits();
    expect(refreshed.remaining).toBe(DEEP_DIVE_DAILY_LIMIT);
    expect(getDeepDiveCredits().remaining).toBe(DEEP_DIVE_DAILY_LIMIT);
  });
});
