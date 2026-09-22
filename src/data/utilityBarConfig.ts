export type BuiltinUtilityId = 'alarm' | 'calendar' | 'daycountdown' | 'pomodoro';

/** Explore 时钟卡工具格：builtin + 自定义合计最多 4，满了必须先删再加 */
export const MAX_UTILITY_BAR_SLOTS = 4;

export interface BuiltinUtilityItem {
  id: BuiltinUtilityId;
  label: string;
  description: string;
  color: string;
}

export const BUILTIN_UTILITY_ITEMS: BuiltinUtilityItem[] = [
  { id: 'alarm', label: 'Alarm', description: 'Clock and alarms.', color: '#263244' },
  { id: 'daycountdown', label: 'Day Countdown', description: 'Days until a target date.', color: '#263244' },
  { id: 'pomodoro', label: 'Pomodoro', description: 'Focus timer sessions.', color: '#263244' },
];

const STORAGE_KEY = 'apps-builtin-utilities-v1';
const DEFAULT_IDS: BuiltinUtilityId[] = ['daycountdown', 'pomodoro'];

export function loadBuiltinUtilityIds(): BuiltinUtilityId[] {
  if (typeof window === 'undefined') return [...DEFAULT_IDS];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_IDS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_IDS];
    return parsed
      .filter((id): id is BuiltinUtilityId =>
        typeof id === 'string' && id !== 'alarm' && BUILTIN_UTILITY_ITEMS.some((item) => item.id === id)
      )
      .slice(0, MAX_UTILITY_BAR_SLOTS);
  } catch {
    return [...DEFAULT_IDS];
  }
}

function saveBuiltinUtilityIds(ids: BuiltinUtilityId[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function removeBuiltinUtility(id: BuiltinUtilityId): BuiltinUtilityId[] {
  const next = loadBuiltinUtilityIds().filter((item) => item !== id);
  saveBuiltinUtilityIds(next);
  return next;
}

export function toggleBuiltinUtility(
  id: BuiltinUtilityId,
  occupiedSlots = loadBuiltinUtilityIds().length,
): { ids: BuiltinUtilityId[]; ok: boolean } {
  const current = loadBuiltinUtilityIds();
  if (current.includes(id)) {
    const next = current.filter((item) => item !== id);
    saveBuiltinUtilityIds(next);
    return { ids: next, ok: true };
  }
  if (occupiedSlots >= MAX_UTILITY_BAR_SLOTS) {
    return { ids: current, ok: false };
  }
  const next = [...current, id].slice(0, MAX_UTILITY_BAR_SLOTS);
  saveBuiltinUtilityIds(next);
  return { ids: next, ok: true };
}
