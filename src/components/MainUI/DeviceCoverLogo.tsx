import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import coverLogo from '../../assets/c-lingo-cover.png'

type SizeTier = '960' | 'default' | '2000' | '1920'

export function coverLogoHeight(tier: SizeTier) {
  if (tier === '960') return 120
  if (tier === '2000') return 180
  return 168
}

interface DeviceCoverLogoProps {
  sizeTier: SizeTier
  animated?: boolean
}

export default function DeviceCoverLogo({ sizeTier, animated = false }: DeviceCoverLogoProps) {
  const logoH = coverLogoHeight(sizeTier)

  const imgSx = {
    height: logoH,
    width: 'auto',
    maxWidth: '88%',
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
