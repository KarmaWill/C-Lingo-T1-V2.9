import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import type { ExploreBuiltinId } from '../../data/exploreAppsConfig'

const flushSx = {
  width: '100%',
  height: '100%',
  display: 'block',
} as const

/** Tutor · 紫系弥散对话标 */
function TutorDiffuseIcon() {
  return (
    <Box component="svg" viewBox="0 0 120 120" aria-hidden sx={flushSx}>
      <defs>
        <linearGradient id="tutor-blob" x1="18" y1="14" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B8A8FF" />
          <stop offset="0.55" stopColor="#7B6CFF" />
          <stop offset="1" stopColor="#5548E8" />
        </linearGradient>
        <linearGradient id="tutor-face" x1="36" y1="34" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F0ECFF" />
        </linearGradient>
        <filter id="tutor-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="#FFFFFF" />
      <circle cx="78" cy="34" r="28" fill="#E8E2FF" opacity="0.85" filter="url(#tutor-soft)" />
      <circle cx="38" cy="86" r="24" fill="#D9D2FF" opacity="0.7" filter="url(#tutor-soft)" />
      <rect x="28" y="30" width="64" height="50" rx="22" fill="url(#tutor-blob)" />
      <path d="M46 80 38 94 58 84Z" fill="url(#tutor-blob)" />
      <circle cx="48" cy="52" r="5.5" fill="url(#tutor-face)" />
      <circle cx="72" cy="52" r="5.5" fill="url(#tutor-face)" />
      <path
        d="M46 66c4.5 5 14.5 5 19 0"
        fill="none"
        stroke="url(#tutor-face)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </Box>
  )
}

/** AI FM · 青绿弥散电台标 */
function AiFmDiffuseIcon() {
  return (
    <Box component="svg" viewBox="0 0 120 120" aria-hidden sx={flushSx}>
      <defs>
        <linearGradient id="fm-blob" x1="22" y1="20" x2="96" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7EF0DF" />
          <stop offset="0.5" stopColor="#00B4A0" />
          <stop offset="1" stopColor="#089688" />
        </linearGradient>
        <filter id="fm-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="#FFFFFF" />
      <circle cx="34" cy="36" r="26" fill="#D7F8F2" opacity="0.9" filter="url(#fm-soft)" />
      <circle cx="88" cy="84" r="30" fill="#C5F3EB" opacity="0.75" filter="url(#fm-soft)" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="url(#fm-blob)" strokeWidth="5" opacity="0.35" />
      <circle cx="60" cy="60" r="24" fill="none" stroke="url(#fm-blob)" strokeWidth="5.5" opacity="0.55" />
      <circle cx="60" cy="60" r="14" fill="url(#fm-blob)" />
      <circle cx="60" cy="60" r="5.5" fill="#FFFFFF" />
      <rect x="56.5" y="18" width="7" height="16" rx="3.5" fill="url(#fm-blob)" />
      <circle cx="60" cy="16" r="5" fill="url(#fm-blob)" />
    </Box>
  )
}

/** FlashCards · 蓝系弥散卡组标 */
function FlashCardsDiffuseIcon() {
  return (
    <Box component="svg" viewBox="0 0 120 120" aria-hidden sx={flushSx}>
      <defs>
        <linearGradient id="fc-back" x1="24" y1="24" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9EC5FF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="fc-front" x1="30" y1="28" x2="92" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="fc-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="#FFFFFF" />
      <circle cx="86" cy="30" r="24" fill="#DBEAFE" opacity="0.9" filter="url(#fc-soft)" />
      <circle cx="30" cy="90" r="22" fill="#BFDBFE" opacity="0.7" filter="url(#fc-soft)" />
      <rect
        x="34"
        y="28"
        width="52"
        height="64"
        rx="12"
        fill="url(#fc-back)"
        transform="rotate(-12 60 60)"
        opacity="0.85"
      />
      <rect x="34" y="30" width="52" height="64" rx="12" fill="url(#fc-front)" />
      <rect x="44" y="46" width="32" height="6" rx="3" fill="#FFFFFF" opacity="0.92" />
      <rect x="44" y="58" width="24" height="6" rx="3" fill="#FFFFFF" opacity="0.7" />
      <rect x="44" y="70" width="28" height="6" rx="3" fill="#FFFFFF" opacity="0.55" />
    </Box>
  )
}

/** Pinyin · 蓝弥散耳机标（备用内建） */
function PinyinDiffuseIcon() {
  return (
    <Box component="svg" viewBox="0 0 120 120" aria-hidden sx={flushSx}>
      <defs>
        <linearGradient id="py-blob" x1="20" y1="18" x2="100" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7AA7FF" />
          <stop offset="1" stopColor="#2768FD" />
        </linearGradient>
        <filter id="py-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="#FFFFFF" />
      <circle cx="32" cy="40" r="22" fill="#DCE8FF" opacity="0.85" filter="url(#py-soft)" />
      <path
        d="M28 58c0-18 14-32 32-32s32 14 32 32"
        fill="none"
        stroke="url(#py-blob)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <rect x="22" y="54" width="18" height="28" rx="9" fill="url(#py-blob)" />
      <rect x="80" y="54" width="18" height="28" rx="9" fill="url(#py-blob)" />
    </Box>
  )
}

/** Writing · 琥珀弥散笔标（备用内建） */
function WritingDiffuseIcon() {
  return (
    <Box component="svg" viewBox="0 0 120 120" aria-hidden sx={flushSx}>
      <defs>
        <linearGradient id="wr-blob" x1="24" y1="18" x2="96" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE08A" />
          <stop offset="0.55" stopColor="#FFC72C" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="wr-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="#FFFFFF" />
      <circle cx="84" cy="34" r="24" fill="#FFF3C4" opacity="0.9" filter="url(#wr-soft)" />
      <path
        d="M34 86 72 30c3-4 9-4 12 0l6 6c3 3 3 9 0 12L52 98c-1.5 2-4 3-6.5 3H30l4-15Z"
        fill="url(#wr-blob)"
      />
      <path d="M68 36 84 52" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
    </Box>
  )
}

const BUILTIN_ICONS: Record<ExploreBuiltinId, () => ReactNode> = {
  tutor: () => <TutorDiffuseIcon />,
  'ai-fm': () => <AiFmDiffuseIcon />,
  flashcards: () => <FlashCardsDiffuseIcon />,
  pinyin: () => <PinyinDiffuseIcon />,
  writing: () => <WritingDiffuseIcon />,
}

export function exploreBuiltinUsesFlushIcon(id: string): boolean {
  return id in BUILTIN_ICONS
}

/** Explore 内建 App · 白底弥散标，与 Gmail / Chrome / YouTube PNG 同套 */
export function ExploreBuiltinGlyph({ id }: { id: ExploreBuiltinId }) {
  const render = BUILTIN_ICONS[id]
  return <>{render()}</>
}
