import type { ReactNode } from 'react'
import { Box } from '@mui/material'

const FULL_BLEED_ICON_SRC: Record<string, string> = {
  chrome: '/images/app-icon-chrome.png',
  gmail: '/images/app-icon-gmail.png',
  youtube: '/images/app-icon-youtube.png',
}

export function catalogAppUsesFullBleedIcon(id: string): boolean {
  return Boolean(FULL_BLEED_ICON_SRC[id])
}

/** Simplified brand glyphs for Explore / Android tiles (not official assets). */
export function CatalogAppGlyph({ id, size = '58%' }: { id: string; size?: string | number }) {
  const fullBleed = FULL_BLEED_ICON_SRC[id]
  if (fullBleed) {
    return (
      <Box
        component="img"
        src={fullBleed}
        alt=""
        aria-hidden
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    )
  }

  const common = {
    width: size,
    height: size,
    display: 'block',
  } as const

  switch (id) {
    case 'maps':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path
            fill="#FFFFFF"
            d="M24 6c-7.2 0-13 5.7-13 12.7 0 9.6 11.4 22.1 12.1 22.8a1.3 1.3 0 0 0 1.8 0C25.6 40.8 37 28.3 37 18.7 37 11.7 31.2 6 24 6zm0 18.2a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"
          />
        </Box>
      )
    case 'chrome':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <circle cx="24" cy="24" r="18" fill="#FFFFFF" opacity="0.95" />
          <circle cx="24" cy="24" r="7.2" fill="#4285F4" />
          <path fill="#EA4335" d="M24 6a18 18 0 0 1 15.6 9H24z" />
          <path fill="#FBBC04" d="M39.6 15A18 18 0 0 1 30.8 39.2L24 24z" />
          <path fill="#34A853" d="M30.8 39.2A18 18 0 0 1 8.4 15h15.6z" />
          <circle cx="24" cy="24" r="7.2" fill="#FFFFFF" />
          <circle cx="24" cy="24" r="5.2" fill="#4285F4" />
        </Box>
      )
    case 'drive':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path fill="#FFFFFF" d="M17.2 10h13.6L44 36H30.4L17.2 10z" opacity="0.95" />
          <path fill="#FFFFFF" d="M4 36h13.6l6.8-12H10.8L4 36z" opacity="0.75" />
          <path fill="#FFFFFF" d="M17.2 10 4 36h13.6l6.8-12L17.2 10z" opacity="0.55" />
        </Box>
      )
    case 'photos':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path fill="#FFFFFF" d="M24 8a8 8 0 0 1 8 8v8h-8a8 8 0 1 1 0-16z" opacity="0.95" />
          <path fill="#FFFFFF" d="M40 24a8 8 0 0 1-8 8h-8v-8a8 8 0 1 1 16 0z" opacity="0.8" />
          <path fill="#FFFFFF" d="M24 40a8 8 0 0 1-8-8v-8h8a8 8 0 1 1 0 16z" opacity="0.65" />
          <path fill="#FFFFFF" d="M8 24a8 8 0 0 1 8-8h8v8a8 8 0 1 1-16 0z" opacity="0.5" />
        </Box>
      )
    case 'calendar':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <rect x="8" y="10" width="32" height="30" rx="5" fill="#FFFFFF" />
          <rect x="8" y="10" width="32" height="9" rx="5" fill="#FFFFFF" opacity="0.35" />
          <path fill="#4285F4" d="M16 26h4v4h-4zm8 0h4v4h-4zm8 0h4v4h-4zm-16 7h4v4h-4zm8 0h4v4h-4zm8 0h4v4h-4z" />
        </Box>
      )
    case 'keep':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path
            fill="#FFFFFF"
            d="M17 8h14a3 3 0 0 1 3 3v16.2c0 1.1-.5 2.1-1.3 2.8L28 35v5h-8v-5l-4.7-5c-.8-.7-1.3-1.7-1.3-2.8V11a3 3 0 0 1 3-3z"
          />
        </Box>
      )
    case 'play-store':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path fill="#FFFFFF" d="M12 8.8 34.8 24 12 39.2V8.8z" />
        </Box>
      )
    case 'messages':
      return (
        <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={common}>
          <path
            fill="#FFFFFF"
            d="M10 12h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20l-8 6v-6h-2a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"
          />
        </Box>
      )
    default:
      return null
  }
}

export function catalogAppGlyph(id: string): ReactNode {
  return <CatalogAppGlyph id={id} />
}
