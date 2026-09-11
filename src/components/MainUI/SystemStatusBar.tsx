import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { getChromeThemeFromPath } from '../../data/programTracks'
import { HUB_SURFACE } from '../home/hubChrome'
import { APP_FONT_FAMILY } from '../../theme/appFont'
import { APP_SCREEN_SIZE, figmaPx, figmaScale } from '../../utils/figmaScale'

/** Figma 主界面1 · Group 17（2508×65.31 ÷ 1.30625）：时间 31.35/700，右簇 signal/蓝牙/Wi‑Fi/电量 */
const FIGMA_STATUS = {
  height: 50,
  timeSize: 24,
  padX: 30,
  iconSlot: 36,
  signalW: 26,
  signalH: 21,
  wifiW: 25,
  wifiH: 20,
  batteryW: 34,
  batteryH: 20,
  iconGap: 6,
  timeColor: '#333333',
} as const

export function getSystemBarMetrics(screenSize: string) {
  const p = (n: number) => figmaPx(n, screenSize)
  return {
    scale: figmaScale(screenSize),
    height: p(FIGMA_STATUS.height),
    timeSize: p(FIGMA_STATUS.timeSize),
    padX: p(FIGMA_STATUS.padX),
    iconSlot: p(FIGMA_STATUS.iconSlot),
    signalW: p(FIGMA_STATUS.signalW),
    signalH: p(FIGMA_STATUS.signalH),
    wifiW: p(FIGMA_STATUS.wifiW),
    wifiH: p(FIGMA_STATUS.wifiH),
    batteryW: p(FIGMA_STATUS.batteryW),
    batteryH: p(FIGMA_STATUS.batteryH),
    iconGap: p(FIGMA_STATUS.iconGap),
  }
}

function StatusIcon({
  src,
  width,
  height,
  alt,
  dark,
}: {
  src: string
  width: number
  height: number
  alt: string
  dark: boolean
}) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      draggable={false}
      sx={{
        width,
        height,
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
        // Figma assets are #333; invert for dark chrome themes
        filter: dark ? 'brightness(0) invert(1)' : 'none',
        opacity: dark ? 0.85 : 1,
      }}
    />
  )
}

export default function SystemStatusBar({
  variant = 'overlay',
}: {
  /** overlay: 壳层绝对定位；inline: 占文档流；canvas: HubContainBoard 内用 Figma 1920 原像素 */
  variant?: 'overlay' | 'inline' | 'canvas'
} = {}) {
  const location = useLocation()
  const chrome = getChromeThemeFromPath(location.pathname)
  const [time, setTime] = useState(new Date())

  const screenSize = APP_SCREEN_SIZE
  const scaled = getSystemBarMetrics(screenSize)
  const m = variant === 'canvas'
    ? {
        height: FIGMA_STATUS.height,
        timeSize: FIGMA_STATUS.timeSize,
        padX: FIGMA_STATUS.padX,
        iconSlot: FIGMA_STATUS.iconSlot,
        signalW: FIGMA_STATUS.signalW,
        signalH: FIGMA_STATUS.signalH,
        wifiW: FIGMA_STATUS.wifiW,
        wifiH: FIGMA_STATUS.wifiH,
        batteryW: FIGMA_STATUS.batteryW,
        batteryH: FIGMA_STATUS.batteryH,
        iconGap: FIGMA_STATUS.iconGap,
      }
    : scaled
  const isDarkChrome =
    chrome.statusBarText === '#F5F0E8' ||
    chrome.statusBarText === '#F4FBF8' ||
    chrome.statusBarBg.startsWith('rgba(13') ||
    chrome.statusBarBg === '#004840'
  const isCanvas = variant === 'canvas'
  const isInline = variant === 'inline'

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      id="system-status-bar"
      sx={{
        height: m.height,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: `${m.padX}px`,
        // 浅色 Hub 铺白底，和页内顶栏 HUB_SURFACE 对齐；深色主题仍用课轨 chrome
        bgcolor: isDarkChrome && !isCanvas ? chrome.statusBarBg : HUB_SURFACE,
        backdropFilter: !isCanvas && isDarkChrome ? 'blur(12px) saturate(160%)' : 'none',
        borderBottom: !isCanvas && isDarkChrome ? chrome.statusBarBorder : 'none',
        zIndex: isInline || isCanvas ? 2 : 1300,
        position: isInline ? 'relative' : 'absolute',
        top: 0,
        left: 0,
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography
        sx={{
          fontSize: `${m.timeSize}px`,
          fontWeight: 700,
          lineHeight: 1,
          color: isDarkChrome ? chrome.statusBarText : FIGMA_STATUS.timeColor,
          fontFamily: APP_FONT_FAMILY,
          letterSpacing: 0,
          transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: `${m.iconGap}px`,
          height: m.iconSlot,
        }}
        aria-label="Signal, Bluetooth, Wi-Fi, Battery"
      >
        {(
          [
            { src: '/shell/status-signal.svg', w: m.signalW, h: m.signalH, alt: 'Signal' },
            { src: '/shell/status-bluetooth.svg', w: m.iconSlot, h: m.iconSlot, alt: 'Bluetooth' },
            { src: '/shell/status-wifi.svg', w: m.wifiW, h: m.wifiH, alt: 'Wi-Fi' },
            { src: '/shell/status-battery.svg', w: m.batteryW, h: m.batteryH, alt: 'Battery' },
          ] as const
        ).map((icon) => (
          <Box
            key={icon.alt}
            sx={{
              width: m.iconSlot,
              height: m.iconSlot,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StatusIcon
              src={icon.src}
              width={icon.w}
              height={icon.h}
              alt={icon.alt}
              dark={isDarkChrome}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
