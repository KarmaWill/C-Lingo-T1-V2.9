/**
 * Hello & Home Podcast — full-width audio placeholder (Unit 100% unlock from hub).
 */
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { useNavigate } from 'react-router-dom';
import {
  FUN_CHINESE_UNIT1_PODCAST_TAGLINE,
  FUN_CHINESE_UNIT1_PODCAST_TITLE,
} from '../utils/funChineseUnitPodcastCopy';

export default function FunChineseIntensivePage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F172A',
        color: 'white',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: is960 ? 2 : 3,
          py: is960 ? 2 : 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/library/hub/fun-chinese')}
          sx={{
            minHeight: is960 ? 48 : 52,
            minWidth: is960 ? 48 : 52,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
        </ButtonBase>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <HeadphonesIcon sx={{ fontSize: is960 ? 28 : 32, color: '#FF7A45' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem', lineHeight: 1.2 }}>
              {FUN_CHINESE_UNIT1_PODCAST_TITLE}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, mt: 0.25 }}>
              {FUN_CHINESE_UNIT1_PODCAST_TAGLINE}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: is960 ? 3 : 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          maxWidth: 720,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Box
          sx={{
            p: is960 ? 3 : 4,
            borderRadius: is960 ? '24px' : '28px',
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.05rem', color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            AI-generated episodes will play here once audio is wired up.
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.9rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, mb: 3 }}>
            Placeholder — add a stream URL to enable the native player below.
          </Typography>
          <Typography component="p" sx={{ fontSize: is960 ? '0.75rem' : '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
            {/* Native audio when src is available: <audio controls style={{ width: '100%' }} src={url} /> */}
            Large play bar will use the same full-width layout as this screen.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
