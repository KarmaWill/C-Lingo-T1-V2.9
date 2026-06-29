export interface ProductAppUpdate {
  id: string;
  label: string;
  packageName: string;
  current: string;
  latest: string;
  size: string;
}

export const PRODUCT_APPS: ProductAppUpdate[] = [
  { id: 'c-lingo', label: 'C-Lingo', packageName: 'com.nsk.clingo', current: '1.0.0', latest: '1.0.0', size: '128 MB' },
  { id: 'scan-pen', label: 'C-Lingo ScanPen', packageName: 'com.nsk.scanpen', current: '0.9.1', latest: '0.9.2', size: '42 MB' },
  { id: 'launcher', label: 'NSK Launcher', packageName: 'com.nsk.launcher', current: '2.4.0', latest: '2.4.0', size: '18 MB' },
  { id: 'keyboard', label: 'Pinyin Keyboard', packageName: 'com.nsk.pinyin', current: '1.3.0', latest: '1.3.1', size: '24 MB' },
  { id: 'parental', label: 'Parental Service', packageName: 'com.nsk.parental', current: '1.1.0', latest: '1.1.0', size: '8 MB' },
];

export function getPendingAppUpdatesCount(
  versions: Record<string, string> = Object.fromEntries(PRODUCT_APPS.map((app) => [app.id, app.current])),
): number {
  return PRODUCT_APPS.filter((app) => versions[app.id] !== app.latest).length;
}
