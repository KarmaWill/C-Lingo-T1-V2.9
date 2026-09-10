/** Figma 主界面1/2 默认画布（HSK / Business 仍用奶油底） */
export const HUB_CANVAS = '#FFF8F0'
/** 主界面1 · 2508 画布 background #F2F8FF，只给 C-Lingo /AI */
export const HUB_CANVAS_CLINGO = '#F2F8FF'
export const HUB_SURFACE = '#FFFFFF'
export const HUB_SURFACE_SHADOW = '0px 4px 20px rgba(213, 213, 213, 0.6)'

export const HUB_FRAME_PAD_X = 60
export const HUB_FRAME_PAD_TOP = 10
/** 主界面1：教材卡底 1257 → dock 顶 1305，约 48px / 1.30625 */
export const HUB_FRAME_PAD_BOTTOM = 36

/** 首次进入页 Start Conversation 与 Studio「AI Tutor」同色 */
export const AI_TUTOR_SURFACE =
  'linear-gradient(103.66deg, #FEDC5E -6.18%, #3FB266 43.73%)'
export const AI_TUTOR_GLOW = 'rgba(63, 178, 102, 0.55)'

/**
 * 主界面1 画布 2508×1567.5 = 1920×1200 × 1.30625。
 * 下列已除过系数，再交给 figmaPx。
 */
export const STUDIO_MAIN1 = {
  hero: 1298,
  rail: 464,
  gap: 37,
  pairGap: 38,
  tutor: AI_TUTOR_SURFACE,
  pinyin: '#00B4A0',
} as const

/** 主界面1 Frame 1410141149 · Explore 2508 → 1920 */
export const EXPLORE_MAIN1 = {
  left: 1309,
  right: 494,
  gap: 31,
  cardRadius: 54,
  settingsW: 494,
  settingsH: 749,
  settingsRadius: 46,
  clockRadius: 38,
  icon: 115,
  iconRadius: 31,
  goBar: 142,
  goBarRadius: 15,
  goThumb: 96,
  goThumbRadius: 14,
  goPill: 61,
  goFont: 28,
} as const

/** 主界面1 Frame 1410141869 · HSK Preparation 2508 → 1920 */
export const HSK_PREP_MAIN1 = {
  left: 794,
  cardH: 364,
  cardRadius: 54,
  icon: 60,
  iconLeft: 27,
  iconTop: 28,
  textLeft: 96,
  textTop: 22,
  textGap: 15,
  titleSize: 43,
  subtitleSize: 31,
  scoreW: 127,
  scoreH: 155,
  scoreRight: 66,
  enterW: 286,
  enterH: 61,
  enterTop: 266,
  enterRadius: 38,
  enterRadiusSpeaking: 54,
  right: 968,
  mockH: 765,
  gap: 38,
  /** 稿上 38；fillHost 只加宽 Mock，左卡 794×364 不动 */
  colGap: 38,
  rowW: 794 + 38 + 968,
  rowH: 364 * 2 + 38,
  diagnostic: '#BE123C',
  speaking: '#3EC5FE',
  mockFrom: '#056AFF',
  mockTo: '#5145FF',
  mockMaskFrom: '#001AFE',
  mockMaskTo: '#3F00FE',
  mockRadius: 54,
  mockWhite: 235,
  mockPadX: 53,
  mockPadT: 35,
  mockTitle: 49,
  mockBody: 31,
  go: '#2768FD',
  goW: 351,
  goH: 113,
} as const
