import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MicIcon from '@mui/icons-material/Mic';

/** Placeholder for AI oral review (credits / scoring to be wired). */
export default function HSKOralReviewPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFF8F0',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
          p: is960 ? 2 : is1920x1125 ? 3 : 2.5,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'rgba(255,255,255,0.92)',
        }}
      >
        <ButtonBase
          onClick={() => navigate('/hsk-test')}
          sx={{
            width: is960 ? 44 : 48,
            height: is960 ? 44 : 48,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.05)',
            color: '#374151',
            flexShrink: 0,
            '&:active': { bgcolor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : 26 }} />
        </ButtonBase>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: is960 ? 40 : 44,
              height: is960 ? 40 : 44,
              borderRadius: '12px',
              bgcolor: 'rgba(124, 58, 237, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MicIcon sx={{ color: '#6D28D9', fontSize: is960 ? 22 : 24 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: is960 ? '1.05rem' : is1920x1125 ? '1.55rem' : '1.3rem',
              color: '#111827',
              lineHeight: 1.2,
            }}
          >
            AI Speaking Rater
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: is960 ? 2 : 3, boxSizing: 'border-box' }}>
        <Box
          sx={{
            maxWidth: 640,
            mx: 'auto',
            bgcolor: '#fff',
            borderRadius: is960 ? '16px' : '22px',
            p: is960 ? 2.25 : 3,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            component="span"
            sx={{
              display: 'inline-block',
              fontWeight: 800,
              fontSize: is960 ? '0.55rem' : '0.62rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#B45309',
              bgcolor: 'rgba(245, 158, 11, 0.15)',
              px: 1.25,
              py: 0.45,
              borderRadius: '8px',
              mb: 1.5,
            }}
          >
            Uses credits
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#334155', lineHeight: 1.55, fontWeight: 500, mb: 2 }}>
            Each AI Speaking Rater session will deduct from your included credits (or paid quota). Recording, scoring, and
            line-by-line feedback will live on this screen in a later build.
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
            口语批改按次数扣减额度，正式流程与支付/会员策略对接后再开放完整交互。
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
