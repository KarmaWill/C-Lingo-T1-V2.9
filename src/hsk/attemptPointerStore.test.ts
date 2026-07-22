import { describe, expect, it } from 'vitest';
import {
  ACTIVE_ATTEMPT_POINTER_KEY_PREFIX,
  LEGACY_ACTIVE_ATTEMPT_POINTER_KEY,
  clearActiveAttemptPointerIfMatches,
  hasBlockingAttemptPointer,
  listActiveAttemptPointers,
  scanAttemptPointers,
  type AttemptPointerStorage,
} from './attemptPointerStore';

class MemoryStorage implements AttemptPointerStorage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] || null;
  }

  getItem(key: string) {
    return this.values.get(key) || null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('attemptPointerStore', () => {
  it('keeps older pointers available when the newest pointer is stale', () => {
    const storage = new MemoryStorage();
    storage.setItem(`${ACTIVE_ATTEMPT_POINTER_KEY_PREFIX}new`, JSON.stringify({
      attemptId: 'new',
      catalog: { id: 'paper-new' },
      storedAt: 20,
    }));
    storage.setItem(`${ACTIVE_ATTEMPT_POINTER_KEY_PREFIX}old`, JSON.stringify({
      attemptId: 'old',
      catalog: { id: 'paper-old' },
      storedAt: 10,
    }));

    expect(listActiveAttemptPointers(storage).map((pointer) => pointer.attemptId))
      .toEqual(['new', 'old']);
  });

  it('deduplicates a migrated legacy pointer and removes malformed legacy data', () => {
    const storage = new MemoryStorage();
    const pointer = { attemptId: 'attempt-1', catalog: { id: 'paper-1' }, storedAt: 10 };
    storage.setItem(`${ACTIVE_ATTEMPT_POINTER_KEY_PREFIX}attempt-1`, JSON.stringify(pointer));
    storage.setItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY, JSON.stringify(pointer));

    expect(listActiveAttemptPointers(storage)).toHaveLength(1);

    storage.setItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY, '{bad-json');
    expect(clearActiveAttemptPointerIfMatches(storage, 'missing')).toBe(false);
    expect(storage.getItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY)).toBeNull();
  });

  it('keeps the newest submitted result when older pointers are missing', async () => {
    const pointers = [
      { attemptId: 'submitted', catalog: { id: 'paper-1' }, storedAt: 20 },
      { attemptId: 'missing', catalog: { id: 'paper-2' }, storedAt: 10 },
    ];

    const scan = await scanAttemptPointers(
      pointers,
      async (attemptId) => {
        if (attemptId === 'missing') throw new Error('404');
        return { status: 'submitted', result: { score: 10 } };
      },
      (error) => error instanceof Error && error.message === '404',
    );

    expect(scan.active).toBeUndefined();
    expect(scan.submitted?.pointer.attemptId).toBe('submitted');
    expect(scan.discardAttemptIds).toEqual(['submitted', 'missing']);
  });

  it('prefers a valid active attempt after a newer missing pointer', async () => {
    const pointers = [
      { attemptId: 'missing', catalog: { id: 'paper-1' }, storedAt: 20 },
      { attemptId: 'active', catalog: { id: 'paper-2' }, storedAt: 10 },
      { attemptId: 'submitted', catalog: { id: 'paper-3' }, storedAt: 5 },
    ];

    const scan = await scanAttemptPointers(
      pointers,
      async (attemptId) => {
        if (attemptId === 'missing') throw new Error('404');
        return attemptId === 'active'
          ? { status: 'in_progress' }
          : { status: 'submitted', result: { score: 8 } };
      },
      (error) => error instanceof Error && error.message === '404',
    );

    expect(scan.active?.pointer.attemptId).toBe('active');
    expect(scan.submitted?.pointer.attemptId).toBe('submitted');
    expect(scan.discardAttemptIds).toEqual(['missing', 'submitted']);
  });

  it('records transient failures without discarding their pointers', async () => {
    const pointers = [{ attemptId: 'unknown', catalog: { id: 'paper-1' }, storedAt: 10 }];

    const scan = await scanAttemptPointers(
      pointers,
      async () => { throw new Error('offline'); },
      () => false,
    );

    expect(scan.discardAttemptIds).toEqual([]);
    expect(scan.transientErrors).toHaveLength(1);
    expect(scan.transientErrors[0].pointer.attemptId).toBe('unknown');
  });

  it('continues after a newer transient failure and restores an older active attempt', async () => {
    const pointers = [
      { attemptId: 'unavailable', catalog: { id: 'paper-1' }, storedAt: 20 },
      { attemptId: 'active', catalog: { id: 'paper-2' }, storedAt: 10 },
    ];

    const scan = await scanAttemptPointers(
      pointers,
      async (attemptId) => {
        if (attemptId === 'unavailable') throw new Error('server error');
        return { status: 'in_progress' };
      },
      () => false,
    );

    expect(scan.active?.pointer.attemptId).toBe('active');
    expect(scan.transientErrors[0].pointer.attemptId).toBe('unavailable');
    expect(scan.discardAttemptIds).toEqual([]);
  });

  it('ignores only transient candidates while still detecting a concurrent new pointer', () => {
    const pointers = [
      { attemptId: 'transient', catalog: { id: 'paper-1' } },
      { attemptId: 'concurrent', catalog: { id: 'paper-2' } },
    ];

    expect(hasBlockingAttemptPointer(pointers, new Set(['transient']))).toBe(true);
    expect(hasBlockingAttemptPointer(pointers.slice(0, 1), new Set(['transient']))).toBe(false);
  });
});
