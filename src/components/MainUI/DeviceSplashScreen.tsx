import { useEffect } from 'react'
import { Box } from '@mui/material'
import DeviceCoverLogo from './DeviceCoverLogo'

type SizeTier = '960' | 'default' | '2000' | '1920'

interface DeviceSplashScreenProps {
  onDone: () => void
  sizeTier: SizeTier
}

export default function DeviceSplashScreen({ onDone, sizeTier }: DeviceSplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2200)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <Box
      component="button"
      type="button"
      onClick={onDone}
      aria-label="Enter C-Lingo"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 9500,
        border: 0,
        p: 0,
        m: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#000',
        cursor: 'pointer',
      }}
    >
      <DeviceCoverLogo sizeTier={sizeTier} animated />
    </Box>
  )
}
