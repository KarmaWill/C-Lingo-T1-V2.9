import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import coverLogo from '../../assets/c-lingo-cover.png'

type SizeTier = '960' | 'default' | '2000' | '1920'

export function coverLogoHeight(tier: SizeTier) {
  if (tier === '960') return 220
  if (tier === '1920') return 420
  if (tier === '2000') return 440
  return 320
}

interface DeviceCoverLogoProps {
  sizeTier: SizeTier
  animated?: boolean
}

export default function DeviceCoverLogo({ sizeTier, animated = false }: DeviceCoverLogoProps) {
  const logoH = Math.round(coverLogoHeight(sizeTier) * (animated ? 1.12 : 1))

  const imgSx = {
    height: logoH,
    width: 'auto',
    maxWidth: '82%',
    objectFit: 'contain' as const,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
  }

  if (animated) {
    return (
      <Box
        component={motion.img}
        src={coverLogo}
        alt="C-Lingo AIOS"
        draggable={false}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        sx={imgSx}
      />
    )
  }

  return (
    <Box component="img" src={coverLogo} alt="C-Lingo AIOS" draggable={false} sx={imgSx} />
  )
}
