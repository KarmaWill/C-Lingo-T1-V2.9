import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/** Prep test intro: HSK Mock Test 01 → full mock exam. Reached from HSK Preparation → HIGHLY RECOMMENDED / Mock Exam. */
export default function HSKPrepTestIntroPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const handleStartTest = () => {
    navigate('/hsk-mock-exam');
  };

  return (
    <Box sx={{
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#FFF8F0',
      p: is960 ? 2 : (is1920x1125 ? 4 : 3),
      boxSizing: 'border-box',
    }}>
      <Box sx={{
        position: 'absolute',
        top: is960 ? 16 : (is1920x1125 ? 32 : 24),
        left: is960 ? 16 : (is1920x1125 ? 32 : 24),
      }}>
        <ButtonBase
          onClick={() => navigate('/hsk-test')}
          sx={{
            width: is960 ? 40 : (is1920x1125 ? 56 : 48),
            height: is960 ? 40 : (is1920x1125 ? 56 : 48),
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.06)',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            '&:active': { transform: 'scale(0.95)', bgcolor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
        </ButtonBase>
      </Box>

      <ButtonBase
        onClick={handleStartTest}
        sx={{
          width: '100%',
          maxWidth: is960 ? 480 : (is1920x1125 ? 680 : 560),
          textAlign: 'left',
          transition: 'all 0.2s',
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            p: 0,
            bgcolor: 'white',
            borderRadius: is1920x1125 ? '24px' : '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(234,88,12,0.12)',
            display: 'flex',
            alignItems: 'stretch',
            overflow: 'hidden',
            minHeight: is960 ? 100 : (is1920x1125 ? 160 : 130),
          }}
        >
          <Box
            sx={{
              width: is960 ? 72 : (is1920x1125 ? 120 : 96),
              flexShrink: 0,
              bgcolor: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: is1920x1125 ? '24px 0 0 24px' : '20px 0 0 20px',
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontWeight: 900,
                fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.5rem'),
                letterSpacing: '-0.02em',
              }}
            >
              HSK
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: is960 ? 2 : (is1920x1125 ? 3.5 : 2.5),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: is960 ? '1.15rem' : (is1920x1125 ? '1.75rem' : '1.5rem'),
                color: '#374151',
                mb: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.625),
              }}
            >
              HSK Mock Test 01
            </Typography>
            <Typography
              sx={{
                color: '#6B7280',
                fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1.1rem' : '1rem'),
                fontWeight: 500,
                mb: is960 ? 0.75 : (is1920x1125 ? 1 : 0.875),
              }}
            >
              25 Questions | 25 Min
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                sx={{
                  color: '#EA580C',
                  fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'),
                  fontWeight: 800,
                }}
              >
                Start Mock Test
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22), color: '#EA580C' }} />
            </Box>
          </Box>
        </Box>
      </ButtonBase>

      <Box sx={{ position: 'absolute', bottom: is960 ? 24 : (is1920x1125 ? 40 : 32), left: 0, right: 0, textAlign: 'center' }}>
        <Typography
          sx={{
            color: '#9CA3AF',
            fontSize: is960 ? '0.85rem' : (is1920x1125 ? '1.1rem' : '1rem'),
            fontWeight: 500,
          }}
        >
          More tests coming soon
        </Typography>
      </Box>
    </Box>
  );
}
