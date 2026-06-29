export interface SystemTool {
  id: string;
  label: string;
  description: string;
  color: string;
}

export const GOOGLE_SYSTEM_TOOLS: SystemTool[] = [
  { id: 'calculator', label: 'Calculator', description: 'Quick calculations.', color: '#4285F4' },
  { id: 'notes', label: 'Notes', description: 'Capture ideas and lists.', color: '#FBBC04' },
  { id: 'weather', label: 'Weather', description: 'Local forecast at a glance.', color: '#34A853' },
  { id: 'compass', label: 'Compass', description: 'Direction and orientation.', color: '#0D9488' },
  { id: 'recorder', label: 'Recorder', description: 'Voice memos and audio notes.', color: '#EA4335' },
  { id: 'files', label: 'Files', description: 'Browse device storage.', color: '#64748B' },
  { id: 'settings', label: 'Settings', description: 'System preferences shortcut.', color: '#475569' },
  { id: 'translate', label: 'Translate', description: 'Quick phrase translation.', color: '#2563EB' },
];

export const INSTALLED_UTILITY_TOOLS_KEY = 'apps-utility-tools-installed-v1';
export const COUNTDOWN_TARGET_KEY = 'apps-day-countdown-target-v1';
export const MAX_UTILITY_TOOLS = 5;

export function loadInstalledUtilityToolIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(INSTALLED_UTILITY_TOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function toggleInstalledUtilityTool(toolId: string): { ids: string[]; ok: boolean } {
  const current = loadInstalledUtilityToolIds();
  if (current.includes(toolId)) {
    const next = current.filter((id) => id !== toolId);
    saveInstalledUtilityToolIds(next);
    return { ids: next, ok: true };
  }
  if (current.length >= MAX_UTILITY_TOOLS) {
    return { ids: current, ok: false };
  }
  const next = [...current, toolId];
  saveInstalledUtilityToolIds(next);
  return { ids: next, ok: true };
}

export function removeInstalledUtilityTool(toolId: string): string[] {
  const next = loadInstalledUtilityToolIds().filter((id) => id !== toolId);
  saveInstalledUtilityToolIds(next);
  return next;
}

function saveInstalledUtilityToolIds(ids: string[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(INSTALLED_UTILITY_TOOLS_KEY, JSON.stringify(ids));
  }
}

export function getInstalledUtilityTools(): SystemTool[] {
  const ids = new Set(loadInstalledUtilityToolIds());
  return GOOGLE_SYSTEM_TOOLS.filter((tool) => ids.has(tool.id));
}

export function loadCountdownTarget(): string {
  if (typeof window === 'undefined') return defaultCountdownTarget();
  const raw = window.localStorage.getItem(COUNTDOWN_TARGET_KEY);
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return defaultCountdownTarget();
}

export function saveCountdownTarget(isoDate: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COUNTDOWN_TARGET_KEY, isoDate);
}

function defaultCountdownTarget(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function getDaysUntil(targetIso: string, from = new Date()): number {
  const target = new Date(`${targetIso}T00:00:00`);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diff = target.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
