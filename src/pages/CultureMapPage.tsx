/**
 * Culture Hub Page - 中国文化入口
 * 聚合 AI 播客、知识图谱和文化视频。
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, ButtonBase, Snackbar, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';

interface HubEntry {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  gradient: string;
  route?: string;
}

const CULTURE_ENTRIES: HubEntry[] = [
  {
    id: 'podcast',
    title: 'AI Culture Podcast',
    description: 'Listen to culture stories.',
    meta: '3-5 min episodes',
    icon: <GraphicEqIcon />,
    color: '#7C3AED',
    bg: '#F3E8FF',
    gradient: 'linear-gradient(145deg, #7C3AED 0%, #A855F7 58%, #F5D0FE 100%)',
    route: '/audio-reading',
  },
  {
    id: 'mindmap',
    title: 'Culture Mindmap',
    description: 'Explore knowledge links.',
    meta: 'Visual connections',
    icon: <AccountTreeIcon />,
    color: '#14B8A6',
    bg: '#DCFDF7',
    gradient: 'linear-gradient(145deg, #0F766E 0%, #14B8A6 58%, #CCFBF1 100%)',
  },
  {
    id: 'video',
    title: 'Culture Videos',
    description: 'Watch unlocked videos.',
    meta: 'Bonus lessons',
    icon: <SmartDisplayIcon />,
    color: '#FF7A45',
    bg: '#FFF0E8',
    gradient: 'linear-gradient(145deg, #EA580C 0%, #FF7A45 56%, #FED7AA 100%)',
    route: '/culture-video',
  },
];

export default function CultureMapPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const pageBg = '#FDF6E9';
  const ink = '#1E293B';

  const handleEntryClick = (entry: HubEntry) => {
    if (entry.route) {
      navigate(entry.route);
      return;
    }
    setSnackbarOpen(true);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        position: 'relative',
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3600}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" variant="filled" sx={{ fontWeight: 700 }}>
          Culture Mindmap is being prepared for this hub.
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          gap: is960 ? 1.6 : 2,
          p: is960 ? 2 : 3,
          minHeight: 0,
        }}
      >
        {/* Page Intro */}
        <Box
          sx={{
            minHeight: is960 ? 96 : 118,
            borderRadius: is960 ? '22px' : '26px',
            p: is960 ? 1.6 : 2,
            color: 'white',
            background:
              'radial-gradient(circle at 82% 18%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0) 26%), linear-gradient(135deg, #0F172A 0%, #0F766E 54%, #FF7A45 100%)',
            boxShadow: '0 16px 36px rgba(15,23,42,0.16)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: is960 ? 1.6 : 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.6 : 2, minWidth: 0 }}>
            <ButtonBase
              onClick={() => navigate(-1)}
              aria-label="Back"
              sx={{
                minHeight: is960 ? 44 : 48,
                minWidth: is960 ? 44 : 48,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                backdropFilter: 'blur(12px)',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' },
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: is960 ? 25 : 28 }} />
            </ButtonBase>
            <Box sx={{ maxWidth: is960 ? 560 : 680, minWidth: 0 }}>
              <Typography sx={{ fontSize: is960 ? '0.66rem' : '0.74rem', fontWeight: 900, letterSpacing: '0.14em', opacity: 0.78, mb: 0.55 }}>
                CULTURE HUB
              </Typography>
              <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.68rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08 }}>
                Choose a way to explore Chinese culture.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Core Entries */}
        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: is960 ? 2 : 2.6,
          }}
        >
          {CULTURE_ENTRIES.map((entry) => (
            <ButtonBase
              key={entry.id}
              onClick={() => handleEntryClick(entry)}
              aria-label={entry.title}
              sx={{
                minHeight: is960 ? 310 : 390,
                borderRadius: is960 ? '28px' : '36px',
                bgcolor: 'white',
                boxShadow: '0 16px 36px rgba(15,23,42,0.1)',
                p: 0,
                alignItems: 'stretch',
                justifyContent: 'stretch',
                textAlign: 'left',
                overflow: 'hidden',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 22px 42px ${entry.color}24`,
                },
                '&:active': { transform: 'scale(0.985)' },
              }}
            >
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: is960 ? 164 : 210,
                    p: is960 ? 2.4 : 3,
                    color: 'white',
                    background: entry.gradient,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: is960 ? 150 : 190,
                      height: is960 ? 150 : 190,
                      borderRadius: '50%',
                      right: is960 ? -50 : -60,
                      top: is960 ? -46 : -58,
                      bgcolor: 'rgba(255,255,255,0.22)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      width: is960 ? 98 : 130,
                      height: is960 ? 98 : 130,
                      borderRadius: '50%',
                      left: is960 ? -32 : -42,
                      bottom: is960 ? -38 : -48,
                      bgcolor: 'rgba(15,23,42,0.12)',
                    }}
                  />
                  <Box
                    sx={{
                      width: is960 ? 66 : 80,
                      height: is960 ? 66 : 80,
                      borderRadius: is960 ? '22px' : '26px',
                      bgcolor: 'rgba(255,255,255,0.22)',
                      border: '1px solid rgba(255,255,255,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(12px)',
                      position: 'relative',
                      zIndex: 1,
                      '& svg': { fontSize: is960 ? 34 : 42 },
                    }}
                  >
                    {entry.icon}
                  </Box>
                </Box>

                <Box sx={{ p: is960 ? 2.4 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.4 }}>
                  <Typography sx={{ fontSize: is960 ? '1.32rem' : '1.62rem', fontWeight: 900, color: ink, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                    {entry.title}
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.05rem', color: '#475569', fontWeight: 750, lineHeight: 1.25 }}>
                    {entry.description}
                  </Typography>
                  <Box sx={{ mt: is960 ? 1.3 : 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.9rem', color: '#94A3B8', fontWeight: 850 }}>
                      {entry.meta}
                    </Typography>
                    <Box
                      sx={{
                        width: is960 ? 48 : 56,
                        height: is960 ? 48 : 56,
                        borderRadius: '50%',
                        bgcolor: entry.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: is960 ? 22 : 26 }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
