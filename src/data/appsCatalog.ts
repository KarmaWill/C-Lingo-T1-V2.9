export interface CatalogApp {
  id: string;
  label: string;
  publisher: string;
  bg: string;
  description: string;
}

export const GOOGLE_CATALOG_APPS: CatalogApp[] = [
  { id: 'chrome', label: 'Chrome', publisher: 'Google LLC', bg: '#4285F4', description: 'Fast, secure web browser.' },
  { id: 'gmail', label: 'Gmail', publisher: 'Google LLC', bg: '#EA4335', description: 'Email by Google.' },
  { id: 'drive', label: 'Drive', publisher: 'Google LLC', bg: '#34A853', description: 'Cloud storage and files.' },
  { id: 'maps', label: 'Maps', publisher: 'Google LLC', bg: '#0F9D58', description: 'Navigation and places.' },
  { id: 'photos', label: 'Photos', publisher: 'Google LLC', bg: '#FBBC04', description: 'Photo library and backup.' },
  { id: 'youtube', label: 'YouTube', publisher: 'Google LLC', bg: '#FF0000', description: 'Video streaming.' },
  { id: 'calendar', label: 'Calendar', publisher: 'Google LLC', bg: '#4285F4', description: 'Schedule and reminders.' },
  { id: 'keep', label: 'Keep', publisher: 'Google LLC', bg: '#FBBC04', description: 'Notes and checklists.' },
];

export const NSK_STORE_APPS = [
  { id: 'c-lingo', label: 'C-Lingo', version: '1.0.0', size: '128 MB', status: 'installed' as const, bg: '#00B4A0' },
  { id: 'scan-pen', label: 'C-Lingo ScanPen', version: '0.9.2', size: '42 MB', status: 'update' as const, bg: '#4F46E5' },
  { id: 'hsk-pack', label: 'HSK Exam Pack', version: '1.2.0', size: '86 MB', status: 'available' as const, bg: '#2563EB' },
  { id: 'culture-pack', label: 'Culture Video Pack', version: '1.0.1', size: '210 MB', status: 'available' as const, bg: '#F59E0B' },
  { id: 'voice-pack', label: 'Voice Teacher Pack', version: '1.1.0', size: '64 MB', status: 'available' as const, bg: '#0D9488' },
];

/** Featured apps in the JiuXueWang device app mall. */
export const JXW_MALL_APPS: CatalogApp[] = [
  { id: 'jxw-study', label: 'Study Center', publisher: 'JiuXueWang', bg: '#2563EB', description: 'Homework, schedules, and class tools.' },
  { id: 'jxw-dict', label: 'Smart Dictionary', publisher: 'JiuXueWang', bg: '#0D9488', description: 'Look up words across subjects.' },
  { id: 'jxw-parent', label: 'Parent Connect', publisher: 'JiuXueWang', bg: '#7C3AED', description: 'Progress reports for guardians.' },
  ...GOOGLE_CATALOG_APPS.slice(0, 6),
];

export const INSTALLED_EXTRA_APPS_KEY = 'apps-extra-installed-v1';
export const MAX_EXTRA_APPS = 6;

export function loadInstalledExtraAppIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(INSTALLED_EXTRA_APPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function saveInstalledExtraAppIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INSTALLED_EXTRA_APPS_KEY, JSON.stringify(ids));
}

export function toggleInstalledExtraApp(appId: string): { ids: string[]; ok: boolean } {
  const current = loadInstalledExtraAppIds();
  if (current.includes(appId)) {
    const next = current.filter((id) => id !== appId);
    saveInstalledExtraAppIds(next);
    return { ids: next, ok: true };
  }
  if (current.length >= MAX_EXTRA_APPS) {
    return { ids: current, ok: false };
  }
  const next = [...current, appId];
  saveInstalledExtraAppIds(next);
  return { ids: next, ok: true };
}

export function removeInstalledExtraApp(appId: string): string[] {
  const next = loadInstalledExtraAppIds().filter((id) => id !== appId);
  saveInstalledExtraAppIds(next);
  return next;
}

export function getInstalledExtraApps(): CatalogApp[] {
  return loadInstalledExtraAppIds()
    .map((id) => ANDROID_SYSTEM_APPS.find((app) => app.id === id))
    .filter((app): app is CatalogApp => Boolean(app));
}

/** Apps shown in the Android system picker (includes catalog + more system apps). */
export const ANDROID_SYSTEM_APPS: CatalogApp[] = [
  ...GOOGLE_CATALOG_APPS,
  { id: 'play-store', label: 'Play Store', publisher: 'Google LLC', bg: '#01875F', description: 'Download apps and games.' },
  { id: 'messages', label: 'Messages', publisher: 'Google LLC', bg: '#1A73E8', description: 'SMS and chat.' },
  { id: 'clock', label: 'Clock', publisher: 'Google LLC', bg: '#5F6368', description: 'Alarms, timer, stopwatch.' },
  { id: 'contacts', label: 'Contacts', publisher: 'Google LLC', bg: '#3367D6', description: 'Phone contacts.' },
  { id: 'camera-app', label: 'Camera', publisher: 'Google LLC', bg: '#202124', description: 'Photos and video.' },
  { id: 'files-go', label: 'Files', publisher: 'Google LLC', bg: '#64748B', description: 'Browse local storage.' },
];
