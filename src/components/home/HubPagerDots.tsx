import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase } from '@mui/material'
import { figmaPx } from '../../utils/figmaScale'

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

export default function HubPagerDots({ screenSize }: { screenSize: string }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const p = (n: number) => figmaPx(n, screenSize)
  const active = hubPagerIndex(pathname)

  if (active < 0) return null

  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${p(26)}px`,
        height: p(48),
        mt: `${p(16)}px`,
        mb: 0,
      }}
    >
      {HUB_PAGER_ROUTES.map((route, index) => {
        const isActive = index === active
        const size = isActive ? p(24) : p(18)
        return (
          <ButtonBase
            key={route}
            aria-label={`Hub page ${index + 1}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(route)}
            sx={{
              width: p(48),
              height: p(48),
              minWidth: p(48),
              borderRadius: '50%',
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
                bgcolor: '#A5AEAC',
                opacity: isActive ? 1 : 0.45,
              }}
            />
          </ButtonBase>
        )
      })}
    </Box>
  )
}
