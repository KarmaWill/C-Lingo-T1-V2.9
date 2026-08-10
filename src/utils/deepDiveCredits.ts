/**
 * Deep Dive daily credits — local device quota.
 * 9 credits / calendar day; refresh when the local date rolls over (while online).
 */

const STORAGE_KEY = 'clingo-deep-dive-credits-v1';
export const DEEP_DIVE_DAILY_LIMIT = 9;
export const DEEP_DIVE_COST = 1;

export interface DeepDiveCreditState {
  date: string; // YYYY-MM-DD local
  remaining: number;
  limit: number;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readRaw(): DeepDiveCreditState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeepDiveCreditState;
    if (!parsed?.date || typeof parsed.remaining !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRaw(state: DeepDiveCreditState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Refresh to full quota when the calendar day changes. */
export function getDeepDiveCredits(): DeepDiveCreditState {
  const today = todayKey();
  const existing = readRaw();
  if (!existing || existing.date !== today) {
    const next: DeepDiveCreditState = {
      date: today,
      remaining: DEEP_DIVE_DAILY_LIMIT,
      limit: DEEP_DIVE_DAILY_LIMIT,
    };
    writeRaw(next);
    return next;
  }
  return {
    ...existing,
    limit: DEEP_DIVE_DAILY_LIMIT,
    remaining: Math.max(0, Math.min(DEEP_DIVE_DAILY_LIMIT, existing.remaining)),
  };
}

export function canSpendDeepDiveCredit(cost = DEEP_DIVE_COST): boolean {
  return getDeepDiveCredits().remaining >= cost;
}

/** Spend credits; returns updated state, or null if not enough. */
export function spendDeepDiveCredit(cost = DEEP_DIVE_COST): DeepDiveCreditState | null {
  const current = getDeepDiveCredits();
  if (current.remaining < cost) return null;
  const next: DeepDiveCreditState = {
    ...current,
    remaining: current.remaining - cost,
  };
  writeRaw(next);
  return next;
}

/** Dev / local: refill to daily limit for the current day. */
export function refreshDeepDiveCredits(): DeepDiveCreditState {
  const next: DeepDiveCreditState = {
    date: todayKey(),
    remaining: DEEP_DIVE_DAILY_LIMIT,
    limit: DEEP_DIVE_DAILY_LIMIT,
  };
  writeRaw(next);
  return next;
}
