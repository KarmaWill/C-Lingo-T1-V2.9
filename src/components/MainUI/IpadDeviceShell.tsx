import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import DeviceSplashScreen from './DeviceSplashScreen'
import DeviceCoverLogo from './DeviceCoverLogo'

type SizeTier = '960' | 'default' | '2000' | '1920'

interface IpadDeviceShellProps {
  width: number
  height: number
  sizeTier: SizeTier
  children: ReactNode
  transform?: string
  transformOrigin?: string
  position?: 'absolute' | 'relative'
}

const BEZEL_BY_TIER: Record<SizeTier, number> = {
  '960': 10,
  default: 14,
  '2000': 16,
  '1920': 18,
}

const RADIUS_BY_TIER: Record<SizeTier, string> = {
  '960': '20px',
  default: '26px',
  '2000': '30px',
  '1920': '34px',
}

const INNER_RADIUS_BY_TIER: Record<SizeTier, string> = {
  '960': '14px',
  default: '18px',
  '2000': '22px',
  '1920': '24px',
}

const VOLUME_STEP = 8
/** Top-edge keys: mirror of ScanPen bottom-edge — rounded top cap, flat bottom flush with bezel. */
const HARDWARE_BTN_RADIUS = '5px 5px 0 0'
const VOLUME_BTN_SHADOW = 'inset 0 2px 3px rgba(255,255,255,0.22), 0 -2px 4px rgba(0,0,0,0.4)'
const SCREEN_OFF_BTN_SHADOW = 'inset 0 1px 2px rgba(255,255,255,0.28), 0 -2px 5px rgba(0,0,0,0.45)'

function tierScale(tier: SizeTier) {
  if (tier === '960') return 0.72
  if (tier === '2000') return 0.92
  if (tier === '1920') return 0.96
  return 0.78
}

function PenVolumeButton({
  width,
  height,
  ariaLabel,
  onClick,
  children,
}: {
  width: number
  height: number
  ariaLabel: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      sx={{
        width,
        height,
        border: 0,
        p: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: HARDWARE_BTN_RADIUS,
        bgcolor: '#3a3b40',
        boxShadow: VOLUME_BTN_SHADOW,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: 700,
        fontSize: height >= 10 ? '11px' : '9px',
        lineHeight: 1,
        flexShrink: 0,
        '&:active': { bgcolor: 'rgba(0,0,0,0.35)' },
      }}
    >
      {children}
    </Box>
  )
}

function PenScreenOffButton({ width, height, onPress }: { width: number; height: number; onPress: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label="Screen Off"
      onClick={(e) => {
        e.stopPropagation()
        onPress()
      }}
      sx={{
        width,
        height,
        border: 0,
        p: 0,
        cursor: 'pointer',
        borderRadius: HARDWARE_BTN_RADIUS,
        bgcolor: '#c62828',
        boxShadow: SCREEN_OFF_BTN_SHADOW,
        flexShrink: 0,
        '&:active': { transform: 'scale(0.98)' },
      }}
    />
  )
}

function VolumeHud({ volume, tier, visible }: { volume: number; tier: SizeTier; visible: boolean }) {
  const compact = tier === '960'
  const pillW = compact ? 44 : 52
  const pillH = compact ? 132 : 168
  const trackW = compact ? 8 : 10
  const VolumeIcon = volume <= 0 ? VolumeOffIcon : VolumeUpIcon

  return (
    <Box
      aria-live="polite"
      aria-label={`Volume ${volume}%`}
      sx={{
        pointerEvents: 'none',
        position: 'absolute',
        right: compact ? 16 : 22,
        top: '50%',
        transform: `translateY(-50%) scale(${visible ? 1 : 0.92})`,
        zIndex: 1600,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease, transform 0.22s ease',
      }}
    >
      <Box
        sx={{
          width: pillW,
          minHeight: pillH,
          px: compact ? 1 : 1.25,
          py: compact ? 1.1 : 1.35,
          borderRadius: '999px',
          bgcolor: 'rgba(32, 33, 36, 0.88)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: compact ? 0.85 : 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: trackW,
            minHeight: compact ? 72 : 96,
            borderRadius: '999px',
            bgcolor: 'rgba(255,255,255,0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${volume}%`,
              borderRadius: '999px',
              bgcolor: '#FFFFFF',
              transition: 'height 0.2s ease',
            }}
          />
        </Box>
        <VolumeIcon
          sx={{
            fontSize: compact ? 18 : 22,
            color: volume <= 0 ? 'rgba(255,255,255,0.55)' : '#FFFFFF',
          }}
        />
      </Box>
    </Box>
  )
}

export default function IpadDeviceShell({
  width,
  height,
  sizeTier,
  children,
  transform,
  transformOrigin = 'top left',
  position = 'relative',
}: IpadDeviceShellProps) {
  const bezel = BEZEL_BY_TIER[sizeTier]
  const tier = tierScale(sizeTier)
  const btnH = Math.max(8, Math.round(10 * tier))
  const volumeBtnW = Math.round(72 * tier)
  const screenOffW = Math.round(88 * tier)
  const btnGap = Math.max(4, Math.round(6 * tier))

  const [screenOn, setScreenOn] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [volume, setVolume] = useState(72)
  const [showVolumeHud, setShowVolumeHud] = useState(false)

  const dismissSplash = useCallback(() => {
    setShowSplash(false)
  }, [])

  const bumpVolume = useCallback((delta: number) => {
    setVolume((v) => Math.max(0, Math.min(100, v + delta)))
    setShowVolumeHud(true)
  }, [])

  useEffect(() => {
    if (!showVolumeHud) return
    const timer = window.setTimeout(() => setShowVolumeHud(false), 1800)
    return () => window.clearTimeout(timer)
  }, [showVolumeHud, volume])

  const handleScreenOff = () => setScreenOn(false)
  const handleWakeScreen = () => setScreenOn(true)

  return (
    <Box
      id="ipad-container"
      sx={{
        width,
        height,
        position,
        top: position === 'absolute' ? 0 : undefined,
        left: position === 'absolute' ? 0 : undefined,
        flexShrink: 0,
        transform,
        transformOrigin,
        boxSizing: 'border-box',
        borderRadius: RADIUS_BY_TIER[sizeTier],
        p: `${bezel}px`,
        bgcolor: '#050505',
        backgroundImage: 'linear-gradient(145deg, #171717 0%, #050505 48%, #0a0a0a 100%)',
        boxShadow: `
          0 0 80px rgba(0,0,0,0.55),
          inset 0 0 0 1px rgba(255,255,255,0.07),
          inset 0 1px 0 rgba(255,255,255,0.12)
        `,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -btnH,
          left: bezel + Math.round(48 * tier),
          zIndex: 30,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: `${btnGap}px`,
          height: btnH,
          pointerEvents: 'none',
          '& > *': { pointerEvents: 'auto' },
        }}
      >
        <PenScreenOffButton width={screenOffW} height={btnH} onPress={handleScreenOff} />
        <PenVolumeButton
          width={volumeBtnW}
          height={btnH}
          ariaLabel="Volume up"
          onClick={() => bumpVolume(VOLUME_STEP)}
        >
          +
        </PenVolumeButton>
        <PenVolumeButton
          width={volumeBtnW}
          height={btnH}
          ariaLabel="Volume down"
          onClick={() => bumpVolume(-VOLUME_STEP)}
        >
          −
        </PenVolumeButton>
      </Box>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: INNER_RADIUS_BY_TIER[sizeTier],
          overflow: 'hidden',
          bgcolor: '#FFF8F0',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            opacity: screenOn && !showSplash ? 1 : 0,
            pointerEvents: screenOn && !showSplash ? 'auto' : 'none',
            transition: 'opacity 0.28s ease',
          }}
        >
          {children}
        </Box>

        {screenOn && !showSplash && <VolumeHud volume={volume} tier={sizeTier} visible={showVolumeHud} />}

        {showSplash && <DeviceSplashScreen onDone={dismissSplash} sizeTier={sizeTier} />}
      </Box>

      {!screenOn && !showSplash && (
        <Box
          component="button"
          type="button"
          onClick={handleWakeScreen}
          onTouchEnd={(e) => {
            e.preventDefault()
            handleWakeScreen()
          }}
          aria-label="Wake screen"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 9999,
            border: 0,
            p: 0,
            m: 0,
            bgcolor: '#000',
            cursor: 'pointer',
            borderRadius: RADIUS_BY_TIER[sizeTier],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DeviceCoverLogo sizeTier={sizeTier} />
        </Box>
      )}
    </Box>
  )
}
