import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, ButtonBase } from '@mui/material'
import { figmaPx } from '../../utils/figmaScale'

/**
 * Figma Frame 1171277717（2508 画布 ÷ 1.30625 → 1920）
 * 4 Tab 胶囊 828×115 + gap 40 + 外侧 Camera 115 圆
 */
const FIGMA = {
  dockW: 828,
  dockH: 115,
  dockRadius: 108,
  dockPadX: 93,
  icon: 60,
  iconGap: 130,
  cameraW: 115,
  cameraH: 115,
  cameraRadius: 1002,
  cameraGap: 40,
  bottom: 56,
} as const

const DOCK_SHADOW = '0px 4px 20px rgba(213, 213, 213, 0.6)'
const ICON_ACTIVE = 'linear-gradient(148.83deg, #7BFFF2 7.44%, #3ED8F8 40.08%, #00B1FF 92.56%)'
const SURFACE = '#FFFFFF'

type NavItem = {
  labelKey: string
  value: string
  iconSrc: string
  match: (path: string) => boolean
}

/** dock 内仅 4 项；Camera 不进 dock。稿：主界面1 Home=教材，主界面2 书签=Studio */
const dockItems: NavItem[] = [
  {
    labelKey: 'nav.learn',
    value: '/Home',
    iconSrc: '/shell/nav/home.svg',
    match: (p) =>
      p === '/Home' ||
      p === '/library' ||
      p === '/starting-learning' ||
      p.startsWith('/library/'),
  },
  {
    labelKey: 'nav.library',
    value: '/AI',
    iconSrc: '/shell/nav/library.svg',
    match: (p) =>
      p === '/AI' ||
      p === '/' ||
      p === '/hsk-standard' ||
      p === '/business-chinese' ||
      p.startsWith('/lesson'),
  },
  {
    labelKey: 'nav.hsk',
    value: '/hsk-test',
    iconSrc: '/shell/nav/plan.svg',
    match: (p) =>
      p === '/hsk-test' ||
      p === '/hsk-prep-test' ||
      p === '/hsk-mock-exam' ||
      p === '/hsk-prep-training' ||
      p === '/hsk-skill-drill' ||
      p === '/hsk-oral-review',
  },
  {
    labelKey: 'nav.explore',
    value: '/apps',
    iconSrc: '/shell/nav/apps.svg',
    match: (p) => p === '/apps',
  },
]

export function getBottomNavReserve(screenSize: string) {
  return figmaPx(Math.max(FIGMA.dockH, FIGMA.cameraH) + FIGMA.bottom, screenSize)
}

function NavGlyph({ src, active, size, label }: { src: string; active: boolean; size: number; label: string }) {
  return (
    <Box sx={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <Box
        component="img"
        src={src}
        alt={label}
        draggable={false}
        sx={{
          width: size,
          height: size,
          display: 'block',
          objectFit: 'contain',
          // CSS mask + 外壳 scale 容易把 glyph 吃掉；idle 用原图压成稿色 #D5D5D5
          filter: active
            ? 'none'
            : 'brightness(0) saturate(100%) invert(89%) sepia(0%) saturate(0%)',
          opacity: active ? 0 : 1,
        }}
      />
      {active ? (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: ICON_ACTIVE,
            WebkitMaskImage: `url("${src}")`,
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: `url("${src}")`,
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
      ) : null}
    </Box>
  )
}

export default function BottomNavigator() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '2000x1200'
  const dockW = figmaPx(FIGMA.dockW, screenSize)
  const dockH = figmaPx(FIGMA.dockH, screenSize)
  const icon = figmaPx(FIGMA.icon, screenSize)
  const padX = figmaPx(FIGMA.dockPadX, screenSize)
  const bottom = figmaPx(FIGMA.bottom, screenSize)
  const radius = figmaPx(FIGMA.dockRadius, screenSize)
  const cameraW = figmaPx(FIGMA.cameraW, screenSize)
  const cameraH = figmaPx(FIGMA.cameraH, screenSize)
  const cameraRadius = figmaPx(FIGMA.cameraRadius, screenSize)
  const cameraGap = figmaPx(FIGMA.cameraGap, screenSize)

  const isCameraPage = location.pathname === '/camera'
  const isAIPage = location.pathname === '/ai-chat'
  const isFullScreen = isCameraPage || isAIPage
  const isCameraActive = isCameraPage

  const goCamera = () => {
    navigate('/camera')
    setTimeout(() => {
      if (window.location.pathname !== '/camera') window.location.assign('/camera')
    }, 0)
  }

  return (
    <Box
      id="bottom-nav-container"
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        height: dockH,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        // 不要用 left:50% + translateX：外壳 scale 会把中心算歪，相机看起来贴右沿
        transform: isFullScreen ? 'translateY(150px)' : 'none',
        opacity: isFullScreen ? 0 : 1,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFullScreen ? 'none' : 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: dockH,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: cameraW + cameraGap,
            flexShrink: 0,
            visibility: 'hidden',
          }}
        />
        <Box
          sx={{
            width: dockW,
            height: dockH,
            borderRadius: `${radius}px`,
            backgroundColor: SURFACE,
            boxShadow: DOCK_SHADOW,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: `${padX}px`,
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          {dockItems.map((item) => {
            const active = item.match(location.pathname)
            return (
              <ButtonBase
                key={item.value}
                onClick={() => navigate(item.value)}
                aria-label={t(item.labelKey)}
                aria-current={active ? 'page' : undefined}
                sx={{
                  width: icon,
                  height: dockH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: `${Math.round(icon * 0.28)}px`,
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.92)' },
                }}
              >
                <NavGlyph src={item.iconSrc} active={active} size={icon} label={t(item.labelKey)} />
              </ButtonBase>
            )
          })}
        </Box>

        <ButtonBase
          onClick={goCamera}
          aria-label={t('nav.camera')}
          aria-current={isCameraActive ? 'page' : undefined}
          sx={{
            width: cameraW,
            height: cameraH,
            ml: `${cameraGap}px`,
            borderRadius: `${cameraRadius}px`,
            backgroundColor: SURFACE,
            boxShadow: DOCK_SHADOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.15s ease',
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <NavGlyph src="/shell/nav/camera.svg" active={isCameraActive} size={icon} label={t('nav.camera')} />
        </ButtonBase>
      </Box>
    </Box>
  )
}
