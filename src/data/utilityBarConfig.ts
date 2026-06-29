export type BuiltinUtilityId = 'alarm' | 'calendar' | 'daycountdown' | 'pomodoro';

export interface BuiltinUtilityItem {
  id: BuiltinUtilityId;
  label: string;
  description: string;
  color: string;
}

export const BUILTIN_UTILITY_ITEMS: BuiltinUtilityItem[] = [
  { id: 'alarm', label: 'Alarm', description: 'Clock and alarms.', color: '#334155' },
  { id: 'calendar', label: 'Calendar', description: 'Date and schedule.', color: '#334155' },
  { id: 'daycountdown', label: 'Day Countdown', description: 'Days until a target date.', color: '#2563EB' },
  { id: 'pomodoro', label: 'Pomodoro', description: 'Focus timer sessions.', color: '#EF4444' },
];

const STORAGE_KEY = 'apps-builtin-utilities-v1';
const DEFAULT_IDS: BuiltinUtilityId[] = ['alarm', 'calendar', 'daycountdown', 'pomodoro'];

export function loadBuiltinUtilityIds(): BuiltinUtilityId[] {
  if (typeof window === 'undefined') return [...DEFAULT_IDS];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_IDS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_IDS];
    return parsed.filter((id): id is BuiltinUtilityId =>
      typeof id === 'string' && BUILTIN_UTILITY_ITEMS.some((item) => item.id === id)
    );
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

export function toggleBuiltinUtility(id: BuiltinUtilityId): { ids: BuiltinUtilityId[]; ok: boolean } {
  const current = loadBuiltinUtilityIds();
  if (current.includes(id)) {
    const next = current.filter((item) => item !== id);
    saveBuiltinUtilityIds(next);
    return { ids: next, ok: true };
  }
  const next = [...current, id];
  saveBuiltinUtilityIds(next);
  return { ids: next, ok: true };
}
