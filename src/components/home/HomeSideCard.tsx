import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { figmaPx, FIGMA_FONT } from '../../utils/figmaScale'

/** 稿上 4px 描边直角箭头；不用 MUI rounded，避免光学中心发歪 */
function FigmaForwardArrow({
  size,
  color,
  stroke,
}: {
  size: number
  color: string
  stroke: number
}) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 48"
      aria-hidden
      sx={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
      }}
    >
      <path
        d="M6 24h26M24 12l14 12-14 12"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Box>
  )
}

/** Figma 主界面1：左 1250 · 右 510 · 缝 40 */
export function HomePageShell({
  screenSize,
  children,
}: {
  screenSize: string
  children: ReactNode
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: `${p(1250)}fr ${p(510)}fr`,
        gridTemplateRows: 'minmax(0, 1fr)',
        gap: `${p(40)}px`,
        alignItems: 'stretch',
        fontFamily: FIGMA_FONT,
      }}
    >
      {children}
    </Box>
  )
}

/** Figma 主界面2 右栏：280 + 192 + 192，缝 23 */
export function HomeSideCardStack({
  screenSize,
  children,
}: {
  screenSize: string
  children: ReactNode
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'grid',
        gridTemplateRows: `${p(280)}fr ${p(192)}fr ${p(192)}fr`,
        gap: `${p(23)}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  )
}

export function HomeSideCard({
  screenSize,
  label,
  subtitle,
  bgcolor,
  onClick,
  variant = 'tool',
  spotlightVisual,
  spotlightArrowColor = '#4F46E5',
}: {
  screenSize: string
  label: string
  subtitle?: string
  bgcolor: string
  onClick: () => void
  variant?: 'spotlight' | 'tool'
  spotlightVisual?: ReactNode
  spotlightArrowColor?: string
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  const isGradient = bgcolor.includes('gradient')

  if (variant === 'spotlight') {
    return (
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: 0,
          borderRadius: `${p(50)}px`,
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          ...(isGradient ? { background: bgcolor } : { bgcolor }),
          px: `${p(40)}px`,
          pt: `${p(46)}px`,
          pb: `${p(32)}px`,
          boxSizing: 'border-box',
          '&:active': { transform: 'scale(0.98)' },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: p(403),
            height: p(118),
            left: p(-176),
            top: p(-129),
            bgcolor: '#A24BFF',
            filter: 'blur(47px)',
            mixBlendMode: 'screen',
            transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: p(403),
            height: p(208),
            right: p(-40),
            bottom: p(-80),
            bgcolor: '#7300FF',
            opacity: 0.51,
            filter: 'blur(47px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography
          sx={{
            position: 'relative',
            zIndex: 2,
            color: '#fff',
            fontWeight: 600,
            fontSize: p(48),
            fontFamily: FIGMA_FONT,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            mt: 'auto',
            width: p(141),
            height: p(80),
            borderRadius: `${p(67)}px`,
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FigmaForwardArrow size={p(48)} color={spotlightArrowColor} stroke={p(4)} />
        </Box>
        {spotlightVisual ? (
          <Box
            sx={{
              position: 'absolute',
              right: p(-10),
              bottom: 0,
              width: p(220),
              height: p(200),
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {spotlightVisual}
          </Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 0,
        borderRadius: `${p(50)}px`,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor,
        px: `${p(40)}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: `${p(16)}px`,
        boxSizing: 'border-box',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 600,
            fontSize: p(44),
            fontFamily: FIGMA_FONT,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            whiteSpace: 'normal',
          }}
        >
          {label}
        </Typography>
        {subtitle ? (
          <Typography
            sx={{
              mt: `${p(8)}px`,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              fontSize: p(28),
              fontFamily: FIGMA_FONT,
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: p(120),
          height: p(120),
          borderRadius: `${p(40)}px`,
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FigmaForwardArrow size={p(56)} color="#fff" stroke={p(4)} />
      </Box>
    </Box>
  )
}

/** @deprecated kept for older imports */
export function useHomeSideStyles(_is960: boolean) {
  return {
    sideCardSx: {},
    sideTrailingSx: {},
    sideArrowSx: {},
    sideNextSx: {},
  }
}
