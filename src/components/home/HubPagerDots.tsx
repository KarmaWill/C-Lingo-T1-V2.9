import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase } from '@mui/material'
import { figmaPx } from '../../utils/figmaScale'
import {
  HUB_FRAME_PAD_BOTTOM,
  HUB_MAIN1_TO_1920,
  HUB_PAGER_BAND,
  HUB_PAGER_MAIN1,
} from './hubChrome'

/** Figma Frame 86：四圆点对应四个主 Tab */
export const HUB_PAGER_ROUTES = ['/Home', '/AI', '/hsk-test', '/apps'] as const

export function hubPagerIndex(pathname: string): number {
  if (pathname === '/Home' || pathname === '/library' || pathname.startsWith('/library/')) return 0
  if (
    pathname === '/AI' ||
    pathname === '/' ||
    pathname === '/hsk-standard' ||
    pathname === '/business-chinese'
  ) {
    return 1
  }
  if (pathname === '/hsk-test' || pathname.startsWith('/hsk-')) return 2
  if (pathname === '/apps') return 3
  return -1
}

export default function HubPagerDots({
  screenSize,
  onDark = false,
}: {
  screenSize: string
  onDark?: boolean
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const p = (n: number) => figmaPx(n, screenSize)
  const p1 = (n2508: number) => figmaPx(n2508 * HUB_MAIN1_TO_1920, screenSize)
  const active = hubPagerIndex(pathname)

  if (active < 0) return null

  const padBottom = p(HUB_FRAME_PAD_BOTTOM)
  const band = p(HUB_PAGER_BAND)
  const hit = p(40)

  return (
    <Box
      sx={{
        flexShrink: 0,
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${p1(HUB_PAGER_MAIN1.gap)}px`,
        width: 'fit-content',
        height: band,
        mt: 0,
        mb: `-${padBottom}px`,
      }}
    >
      {HUB_PAGER_ROUTES.map((route, index) => {
        const isActive = index === active
        const size = isActive ? p1(HUB_PAGER_MAIN1.active) : p1(HUB_PAGER_MAIN1.inactive)
        const bleed = Math.max(0, (hit - size) / 2)
        return (
          <ButtonBase
            key={route}
            aria-label={`Hub page ${index + 1}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(route)}
            sx={{
              position: 'relative',
              width: size,
              height: size,
              minWidth: size,
              borderRadius: '50%',
              // 热区外扩，flex gap 仍是圆点边距（稿上 26）
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: `-${bleed}px`,
              },
              '&:focus-visible': {
                outline: '3px solid #00B4A0',
                outlineOffset: 2,
              },
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                bgcolor: onDark
                  ? isActive
                    ? '#F4FBF8'
                    : 'rgba(244, 251, 248, 0.28)'
                  : HUB_PAGER_MAIN1.color,
                opacity: onDark ? 1 : isActive ? 1 : 0.4,
              }}
            />
          </ButtonBase>
        )
      })}
    </Box>
  )
}
