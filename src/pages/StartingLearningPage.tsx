import { Box, ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useNavigate } from 'react-router-dom'

/**
 * Blank canvas for upcoming ebook flow design.
 */
export default function StartingLearningPage() {
  const navigate = useNavigate()
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 0, bgcolor: '#FFFFFF', position: 'relative' }}>
      <ButtonBase
        onClick={() => navigate(-1)}
        aria-label="Back"
        sx={{
          position: 'absolute',
          top: is960 ? 16 : 20,
          left: is960 ? 16 : 20,
          width: is960 ? 48 : 56,
          height: is960 ? 48 : 56,
          borderRadius: '50%',
          bgcolor: '#F3F4F6',
          color: '#374151',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 2,
          '&:active': { transform: 'scale(0.96)', bgcolor: '#E5E7EB' },
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
      </ButtonBase>
    </Box>
  )
}
