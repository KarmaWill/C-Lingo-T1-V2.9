import { Box, ButtonBase, Typography } from '@mui/material'
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

/** 左主课卡默认 1250；C-Lingo 主界面1 用 1298 / 464 / 37 */
export function HomePageShell({
  screenSize,
  children,
  hero = 1250,
  rail = 510,
  gap = 40,
}: {
  screenSize: string
  children: ReactNode
  hero?: number
  rail?: number
  gap?: number
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
        gridTemplateColumns: `${p(hero)}fr ${p(rail)}fr`,
        gridTemplateRows: 'minmax(0, 1fr)',
        gap: `${p(gap)}px`,
        alignItems: 'stretch',
        fontFamily: FIGMA_FONT,
      }}
    >
      {children}
    </Box>
  )
}

/** triple：280+192+192；pair：主界面1 两张等高，缝 38 */
export function HomeSideCardStack({
  screenSize,
  children,
  pair = false,
}: {
  screenSize: string
  children: ReactNode
  pair?: boolean
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'grid',
        gridTemplateRows: pair ? '1fr 1fr' : `${p(280)}fr ${p(192)}fr ${p(192)}fr`,
        gap: `${p(pair ? 38 : 23)}px`,
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
  leadingIcon,
  pair = false,
  glow,
}: {
  screenSize: string
  label: string
  subtitle?: string
  bgcolor: string
  onClick: () => void
  variant?: 'spotlight' | 'tool'
  spotlightVisual?: ReactNode
  spotlightArrowColor?: string
  leadingIcon?: ReactNode
  /** 主界面1 右栏：标题顶左、箭头底左 */
  pair?: boolean
  glow?: string
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  const isGradient = bgcolor.includes('gradient')
  const arrow = p(pair ? 76 : 99)

  const arrowBox = (
    <Box
      sx={{
        width: arrow,
        height: arrow,
        borderRadius: `${p(pair ? 25 : 33)}px`,
        bgcolor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FigmaForwardArrow size={p(pair ? 37 : 48)} color="#fff" stroke={p(pair ? 2.5 : 3.3)} />
    </Box>
  )

  const pairGlow = glow ? (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        width: '108%',
        height: '82%',
        left: '18%',
        top: '18%',
        bgcolor: glow,
        filter: 'blur(28px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  ) : null

  if (variant === 'spotlight') {
    return (
      <ButtonBase
        onClick={onClick}
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: 0,
          width: '100%',
          borderRadius: `${p(54)}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          ...(isGradient ? { background: bgcolor } : { bgcolor }),
          px: `${p(pair ? 34 : 40)}px`,
          pt: `${p(pair ? 31 : 40)}px`,
          pb: `${p(pair ? 31 : 36)}px`,
          boxSizing: 'border-box',
          textAlign: 'left',
          isolation: 'isolate',
          cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 120ms ease-out',
          '&:active': { transform: 'scale(0.98)' },
          '&:focus-visible': { outline: '3px solid #FDD83B', outlineOffset: 4 },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:active': { transform: 'none' },
          },
          ...(pair
            ? {}
            : {
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
              }),
        }}
      >
        {pair ? pairGlow : null}
        <Typography
          sx={{
            position: 'relative',
            zIndex: 2,
            color: '#fff',
            fontWeight: 700,
            fontSize: p(pair ? 43 : 56),
            lineHeight: `${p(pair ? 63 : 81)}px`,
            fontFamily: FIGMA_FONT,
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            alignSelf: pair ? 'flex-start' : 'flex-end',
            mt: 'auto',
          }}
        >
          {arrowBox}
        </Box>
        {spotlightVisual ? (
          <Box
            onClick={
              pair
                ? (event) => {
                    event.stopPropagation()
                    onClick()
                  }
                : undefined
            }
            sx={{
              position: 'absolute',
              right: pair ? p(10) : p(-6),
              bottom: 0,
              width: p(pair ? 228 : 240),
              height: p(pair ? 228 : 260),
              zIndex: pair ? 3 : 1,
              pointerEvents: pair ? 'auto' : 'none',
              cursor: pair ? 'pointer' : 'inherit',
              transform: 'none',
              transformOrigin: 'bottom right',
            }}
          >
            {spotlightVisual}
          </Box>
        ) : null}
      </ButtonBase>
    )
  }

  if (pair) {
    return (
      <ButtonBase
        onClick={onClick}
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: 0,
          width: '100%',
          borderRadius: `${p(54)}px`,
          overflow: 'hidden',
          bgcolor,
          px: `${p(34)}px`,
          pt: `${p(31)}px`,
          pb: `${p(31)}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          textAlign: 'left',
          isolation: 'isolate',
          cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 120ms ease-out',
          '&:active': { transform: 'scale(0.98)' },
          '&:focus-visible': { outline: '3px solid #FDD83B', outlineOffset: 4 },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:active': { transform: 'none' },
          },
        }}
      >
        {pairGlow}
        <Box sx={{ position: 'relative', zIndex: 2, minWidth: 0, maxWidth: '92%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(7)}px`, minWidth: 0 }}>
            {leadingIcon}
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: p(43),
                lineHeight: `${p(54)}px`,
                fontFamily: FIGMA_FONT,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {label}
            </Typography>
          </Box>
          {subtitle ? (
            <Typography
              sx={{
                mt: `${p(9)}px`,
                color: '#fff',
                opacity: 0.6,
                fontWeight: 500,
                fontSize: p(28),
                lineHeight: `${p(34)}px`,
                fontFamily: FIGMA_FONT,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2 }}>{arrowBox}</Box>
        {spotlightVisual ? (
          <Box
            onClick={(event) => {
              event.stopPropagation()
              onClick()
            }}
            sx={{
              position: 'absolute',
              right: p(10),
              bottom: 0,
              width: p(228),
              height: p(228),
              zIndex: 3,
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            {spotlightVisual}
          </Box>
        ) : null}
      </ButtonBase>
    )
  }

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 0,
        width: '100%',
        borderRadius: `${p(54)}px`,
        overflow: 'hidden',
        bgcolor,
        px: `${p(40)}px`,
        py: `${p(36)}px`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: `${p(16)}px`,
        boxSizing: 'border-box',
        textAlign: 'left',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 120ms ease-out',
        '&:active': { transform: 'scale(0.98)' },
        '&:focus-visible': { outline: '3px solid #FDD83B', outlineOffset: 4 },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:active': { transform: 'none' },
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, alignSelf: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(9)}px`, minWidth: 0 }}>
          {leadingIcon}
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: p(56),
              lineHeight: `${p(70)}px`,
              fontFamily: FIGMA_FONT,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {label}
          </Typography>
        </Box>
        {subtitle ? (
          <Typography
            sx={{
              mt: `${p(12)}px`,
              color: '#fff',
              opacity: 0.6,
              fontWeight: 500,
              fontSize: p(36),
              lineHeight: `${p(45)}px`,
              fontFamily: FIGMA_FONT,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {arrowBox}
    </ButtonBase>
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
