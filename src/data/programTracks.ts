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
  bottomNavAccent: '#00B090',
  bottomNavDotInactive: 'rgba(0, 176, 144, 0.22)',
};

/** Hub 首页整页林绿，和 values 海报同底；子页 Seminar 仍走浅底 HSK_CHROME */
const BHS_HUB_CHROME: ProgramChromeTheme = {
  ...HSK_CHROME,
  screenBg: '#004840',
  mainBg: '#004840',
  statusBarBg: '#004840',
  statusBarText: '#F4FBF8',
  statusBarIcon: '#F4FBF8',
  statusBarBorder: 'none',
  topBarBg: '#004840',
  topBarText: '#F4FBF8',
};

const BUSINESS_CHROME: ProgramChromeTheme = {
  ...DEFAULT_CHROME,
  bottomNavAccent: '#D4A853',
  bottomNavDotInactive: 'rgba(212, 168, 83, 0.22)',
};

export const PROGRAM_TRACKS: ProgramTrack[] = [
  {
    id: 'c-lingo',
    label: 'C-Lingo Chinese',
    route: '/AI',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'ONLINE ONLY',
      bg: 'rgba(0, 180, 160, 0.06)',
      border: '#00B4A0',
      color: '#00B4A0',
      dot: '#00B4A0',
    },
    pageBg: 'transparent',
    chrome: {
      ...DEFAULT_CHROME,
      screenBg: '#F2F8FF',
      mainBg: '#F2F8FF',
    },
  },
  {
    id: 'hsk-standard',
    label: 'Burnside High School',
    route: '/hsk-standard',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'School edition',
      bg: '#EEF2F7',
      border: '#C5D0DE',
      color: '#1B3A6B',
      dot: '#1B3A6B',
    },
    pageBg: '#004840',
    chrome: BHS_HUB_CHROME,
  },
  {
    id: 'business-chinese',
    label: 'Business Chinese',
    route: '/business-chinese',
    hubTitle: 'AI Class Studio',
    badge: {
      text: 'Premium',
      bg: '#FFF8E7',
      border: '#F3E0A8',
      color: '#A16207',
      dot: '#D4A853',
    },
    pageBg: '#FFF8F0',
    chrome: BUSINESS_CHROME,
  },
];

const ID_TO_TRACK = new Map(PROGRAM_TRACKS.map((t) => [t.id, t]));

export function getProgramTrackFromPath(pathname: string): ProgramTrack {
  if (pathname === '/hsk-standard') {
    return ID_TO_TRACK.get('hsk-standard')!;
  }
  if (pathname.startsWith('/hsk-standard/')) {
    return {
      ...ID_TO_TRACK.get('hsk-standard')!,
      pageBg: '#FFF8F0',
      chrome: HSK_CHROME,
    };
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
  if (id === 'hsk-standard') return 'program.badge.schoolEdition';
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
