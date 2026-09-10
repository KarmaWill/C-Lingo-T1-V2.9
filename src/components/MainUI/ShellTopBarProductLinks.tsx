import type { ReactNode } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import hubTileScan from '../../assets/hub-tile-scan.png'

const MotionButtonBase = motion.create(ButtonBase)

interface ShellTopBarProductLinksProps {
  onOpenScanPen: () => void
}

function ProductLink({
  ariaLabel,
  label,
  onClick,
  children,
}: {
  ariaLabel: string
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <MotionButtonBase
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
      <Typography
        component="span"
        sx={{
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1.1,
          color: 'rgba(247, 255, 246, 0.88)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </Typography>
    </MotionButtonBase>
  )
}

export default function ShellTopBarProductLinks({ onOpenScanPen }: ShellTopBarProductLinksProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 10, sm: 16 },
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        zIndex: 2,
      }}
    >
      <ProductLink ariaLabel="C-Lingo ScanPen" label="C-Lingo ScanPen" onClick={onOpenScanPen}>
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
