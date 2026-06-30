export type ProgramTrackId = 'c-lingo' | 'hsk-standard' | 'business-chinese';

export interface ProgramChromeTheme {
  screenBg: string;
  mainBg: string;
  statusBarBg: string;
  statusBarText: string;
  statusBarIcon: string;
  statusBarBorder: string;
  batteryBorder: string;
  batteryFill: string;
  topBarBg: string;
  topBarText: string;
  topBarBorder: string;
  hubTitleColor: string;
  programBtnBg: string;
  programBtnBorder: string;
  programBtnText: string;
  programBtnHoverBg: string;
  langBtnBg: string;
  langBtnText: string;
  langMenuBg: string;
  langMenuBorder: string;
  avatarBorder: string;
  bottomNavDockBg: string;
  bottomNavDockBorder: string;
  bottomNavShadow: string;
  bottomNavAccent: string;
  bottomNavInactive: string;
  bottomNavDotInactive: string;
  cameraBtnBg: string;
  cameraBtnColor: string;
  cameraBtnActiveBg: string;
}

export interface ProgramTrack {
  id: ProgramTrackId;
  label: string;
  route: string;
  hubTitle: string;
  badge: {
    text: string;
    bg: string;
    border: string;
    color: string;
    dot?: string;
  };
  pageBg: string;
  chrome: ProgramChromeTheme;
}

export const DEFAULT_CHROME: ProgramChromeTheme = {
  screenBg: '#FFF8F0',
  mainBg: '#FFF8F0',
  statusBarBg: 'rgba(255, 255, 255, 0.7)',
  statusBarText: '#1F2937',
  statusBarIcon: '#374151',
  statusBarBorder: '0.5px solid rgba(0, 0, 0, 0.04)',
  batteryBorder: '1.5px solid rgba(55,65,81,0.4)',
  batteryFill: 'linear-gradient(90deg, #6EE7B7 0%, #10B981 55%, #059669 100%)',
  topBarBg: 'rgba(255, 255, 255, 0.85)',
  topBarText: '#111827',
  topBarBorder: '0.5px solid rgba(0,0,0,0.06)',
  hubTitleColor: '#2D3436',
  programBtnBg: '#F3F4F6',
  programBtnBorder: '1px solid rgba(15, 23, 42, 0.08)',
  programBtnText: '#374151',
  programBtnHoverBg: '#EEF0F3',
  langBtnBg: '#F3F4F6',
  langBtnText: '#4B5563',
  langMenuBg: 'white',
  langMenuBorder: '1px solid #E5E7EB',
  avatarBorder: '2px solid rgba(255,255,255,0.9)',
  bottomNavDockBg: 'rgba(255, 255, 255, 0.85)',
  bottomNavDockBorder: '1px solid rgba(255, 255, 255, 0.4)',
  bottomNavShadow: '0 20px 50px rgba(0,0,0,0.15)',
  bottomNavAccent: '#00B4A0',
  bottomNavInactive: '#636E72',
  bottomNavDotInactive: 'rgba(45, 51, 54, 0.2)',
  cameraBtnBg: 'rgba(255, 255, 255, 0.85)',
  cameraBtnColor: '#4F46E5',
  cameraBtnActiveBg: '#4F46E5',
};

const HSK_CHROME: ProgramChromeTheme = {
  ...DEFAULT_CHROME,
  screenBg: '#FBF7F7',
  mainBg: '#FBF7F7',
  statusBarBg: 'rgba(251, 247, 247, 0.92)',
  statusBarBorder: '0.5px solid rgba(192, 57, 43, 0.08)',
  topBarBg: 'rgba(255, 252, 252, 0.9)',
  topBarBorder: '0.5px solid rgba(192, 57, 43, 0.1)',
  hubTitleColor: '#991B1B',
  programBtnBg: '#FEF2F2',
  programBtnBorder: '1px solid rgba(192, 57, 43, 0.15)',
  programBtnText: '#991B1B',
  programBtnHoverBg: '#FEE2E2',
  bottomNavAccent: '#C0392B',
  bottomNavDotInactive: 'rgba(192, 57, 43, 0.18)',
};

const BUSINESS_CHROME: ProgramChromeTheme = {
  screenBg: '#0D0D0D',
  mainBg: '#0D0D0D',
  statusBarBg: 'rgba(13, 13, 13, 0.92)',
  statusBarText: '#F5F0E8',
  statusBarIcon: 'rgba(245, 240, 232, 0.75)',
  statusBarBorder: '0.5px solid rgba(212, 168, 83, 0.12)',
  batteryBorder: '1.5px solid rgba(212, 168, 83, 0.35)',
  batteryFill: 'linear-gradient(90deg, #E8C878 0%, #D4A853 55%, #B8892E 100%)',
  topBarBg: 'rgba(18, 18, 18, 0.92)',
  topBarText: '#F5F0E8',
  topBarBorder: '0.5px solid rgba(212, 168, 83, 0.15)',
  hubTitleColor: '#F5F0E8',
  programBtnBg: 'rgba(212, 168, 83, 0.12)',
  programBtnBorder: '1px solid rgba(212, 168, 83, 0.28)',
  programBtnText: '#D4A853',
  programBtnHoverBg: 'rgba(212, 168, 83, 0.18)',
  langBtnBg: 'rgba(212, 168, 83, 0.1)',
  langBtnText: '#D4A853',
  langMenuBg: '#1A1A1A',
  langMenuBorder: '1px solid rgba(212, 168, 83, 0.2)',
  avatarBorder: '2px solid rgba(212, 168, 83, 0.35)',
  bottomNavDockBg: 'rgba(26, 26, 26, 0.88)',
  bottomNavDockBorder: '1px solid rgba(212, 168, 83, 0.2)',
  bottomNavShadow: '0 20px 50px rgba(0,0,0,0.45)',
  bottomNavAccent: '#D4A853',
  bottomNavInactive: 'rgba(245, 240, 232, 0.45)',
  bottomNavDotInactive: 'rgba(212, 168, 83, 0.22)',
  cameraBtnBg: 'rgba(26, 26, 26, 0.88)',
  cameraBtnColor: '#D4A853',
  cameraBtnActiveBg: '#D4A853',
};

export const PROGRAM_TRACKS: ProgramTrack[] = [
  {
    id: 'c-lingo',
    label: 'C-Lingo Chinese',
    route: '/AI',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'Online only',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      color: '#047857',
      dot: '#10B981',
    },
    pageBg: 'transparent',
    chrome: DEFAULT_CHROME,
  },
  {
    id: 'hsk-standard',
    label: 'HSK Standard',
    route: '/hsk-standard',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'Official exam',
      bg: '#FEF2F2',
      border: '#FECACA',
      color: '#B91C1C',
      dot: '#DC2626',
    },
    pageBg: '#FBF7F7',
    chrome: HSK_CHROME,
  },
  {
    id: 'business-chinese',
    label: 'Business Chinese',
    route: '/business-chinese',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'Premium',
      bg: 'rgba(212,168,83,0.12)',
      border: 'rgba(212,168,83,0.35)',
      color: '#D4A853',
      dot: '#D4A853',
    },
    pageBg: '#0D0D0D',
    chrome: BUSINESS_CHROME,
  },
];

const ID_TO_TRACK = new Map(PROGRAM_TRACKS.map((t) => [t.id, t]));

export function getProgramTrackFromPath(pathname: string): ProgramTrack {
  if (pathname === '/hsk-standard' || pathname.startsWith('/hsk-standard/')) {
    return ID_TO_TRACK.get('hsk-standard')!;
  }
  if (pathname === '/business-chinese' || pathname.startsWith('/business-chinese/')) {
    return ID_TO_TRACK.get('business-chinese')!;
  }
  return ID_TO_TRACK.get('c-lingo')!;
}

export function getProgramTrackById(id: ProgramTrackId): ProgramTrack | undefined {
  return ID_TO_TRACK.get(id);
}

export function getProgramBadgeKey(id: ProgramTrackId): string {
  if (id === 'hsk-standard') return 'program.badge.officialExam';
  if (id === 'business-chinese') return 'program.badge.premium';
  return 'program.badge.onlineOnly';
}

export function getChromeThemeFromPath(pathname: string): ProgramChromeTheme {
  return getProgramTrackFromPath(pathname).chrome;
}

export function getProgramTrackByLabel(label: string): ProgramTrack | undefined {
  return PROGRAM_TRACKS.find((t) => t.label === label);
}

export function isProgramHomePath(pathname: string): boolean {
  return pathname === '/' || pathname === '/AI' || pathname === '/hsk-standard' || pathname === '/business-chinese';
}

export const PROGRAM_TRACK_IDS = PROGRAM_TRACKS.map((t) => t.id);
