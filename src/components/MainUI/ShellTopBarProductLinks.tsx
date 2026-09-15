import type { ReactNode } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import hubTileScan from '../../assets/hub-tile-scan.png'

const MotionButtonBase = motion.create(ButtonBase)

interface ShellTopBarProductLinksProps {
  onOpenScanPen: () => void
  onLight?: boolean
  studioToggle?: {
    onboarded: boolean
    onToggle: () => void
  }
}

const LABEL_SX = {
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.1,
  whiteSpace: 'nowrap' as const,
  textAlign: 'center' as const,
  userSelect: 'none' as const,
  letterSpacing: '0.01em',
}

function ProductLink({
  ariaLabel,
  label,
  reserveLabel,
  onClick,
  onLight = false,
  className,
  children,
}: {
  ariaLabel: string
  label: string
  reserveLabel?: string
  onClick: () => void
  onLight?: boolean
  className?: string
  children: ReactNode
}) {
  const labelColor = onLight ? 'rgb(22 62 104 / 0.78)' : 'rgba(247, 255, 246, 0.88)'
  return (
    <MotionButtonBase
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.96 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '8px',
        p: 0,
        minWidth: 0,
        cursor: 'pointer',
        '&:hover': { opacity: 0.92 },
      }}
    >
      {children}
      {reserveLabel ? (
        <Box
          sx={{
            display: 'grid',
            justifyItems: 'center',
            width: 'max-content',
          }}
        >
          <Typography component="span" sx={{ ...LABEL_SX, gridArea: '1 / 1', color: labelColor }}>
            {label}
          </Typography>
          <Typography
            component="span"
            aria-hidden
            sx={{ ...LABEL_SX, gridArea: '1 / 1', visibility: 'hidden', color: labelColor }}
          >
            {reserveLabel}
          </Typography>
        </Box>
      ) : (
        <Typography component="span" sx={{ ...LABEL_SX, color: labelColor }}>
          {label}
        </Typography>
      )}
    </MotionButtonBase>
  )
}

function StudioLampTile({ on }: { on: boolean }) {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '11px',
        overflow: 'hidden',
        bgcolor: '#000',
        boxShadow: on
          ? '0 6px 16px rgba(246, 200, 58, 0.28)'
          : '0 6px 16px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 48 48"
        width={34}
        height={34}
        aria-hidden
        sx={{ display: 'block', overflow: 'visible' }}
      >
        {on ? (
          <path d="M24 8 L40 28 H8 Z" fill="rgba(246,200,58,0.22)" />
        ) : null}
        <path
          d="M18 16.5 C18 12.4 21.1 10 24 10 C26.9 10 30 12.4 30 16.5 C30 19.2 28.4 21.2 26.2 22.6 V26.5 H21.8 V22.6 C19.6 21.2 18 19.2 18 16.5 Z"
          fill={on ? '#F6C83A' : '#6B7280'}
        />
        <rect x="22.6" y="26.5" width="2.8" height="6.2" rx="1" fill={on ? '#E8D48A' : '#9CA3AF'} />
        <rect x="16" y="32.4" width="16" height="3.2" rx="1.4" fill={on ? '#D4A017' : '#4B5563'} />
        <rect
          x={on ? 26.2 : 18.4}
          y="33"
          width="4.2"
          height="2"
          rx="1"
          fill={on ? '#B9FF5A' : '#9CA3AF'}
        />
      </Box>
    </Box>
  )
}

export default function ShellTopBarProductLinks({
  onOpenScanPen,
  onLight = false,
  studioToggle,
}: ShellTopBarProductLinksProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 18, sm: 28 },
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2.5, sm: 3 },
        zIndex: 2,
        transform: 'translate(-4px, 6px)',
      }}
    >
      {studioToggle ? (
        <ProductLink
          className="studio-toggle"
          ariaLabel={studioToggle.onboarded ? 'Restart' : 'Home'}
          label={studioToggle.onboarded ? 'Restart' : 'Home'}
          reserveLabel={studioToggle.onboarded ? 'Home' : 'Restart'}
          onClick={studioToggle.onToggle}
          onLight={onLight}
        >
          <StudioLampTile on={studioToggle.onboarded} />
        </ProductLink>
      ) : null}
      <ProductLink ariaLabel="ScanPen" label="ScanPen" onClick={onOpenScanPen} onLight={onLight}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '11px',
            overflow: 'hidden',
            bgcolor: '#000',
            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={hubTileScan}
            alt=""
            draggable={false}
            sx={{
              maxHeight: '78%',
              maxWidth: '88%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </Box>
      </ProductLink>
    </Box>
  )
}
