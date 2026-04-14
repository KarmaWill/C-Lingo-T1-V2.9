import { Box, Typography, ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useNavigate } from 'react-router-dom'

/**
 * Placeholder for HSK Go Study (from HSK Preparation grid).
 * Replace content when the prototype is ready.
 */
export default function HSKGoStudyPlaceholderPage() {
  const navigate = useNavigate()
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: is960 ? 2 : 3,
          py: is960 ? 1.5 : 2,
          flexShrink: 0,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: 'white',
        }}
      >
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            minHeight: 48,
            minWidth: 48,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:active': { transform: 'scale(0.95)', bgcolor: '#E2E8F0' },
          }}
          aria-label="Back"
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 28 }} />
        </ButtonBase>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem', color: '#0F172A' }}>
          HSK Go Study
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: is960 ? 2 : 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.9rem' : '1rem', textAlign: 'center', maxWidth: 420 }}>
          Content placeholder — targeted HSK practice flow goes here.
        </Typography>
      </Box>
    </Box>
  )
}
