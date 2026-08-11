/**
 * Culture Hub Page - 中国文化入口
 * 聚合 AI 播客、知识图谱和文化视频。
 */
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, ButtonBase, Snackbar, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface HubEntry {
  id: string;
  title: string;
  description: string;
  meta: string;
  cta: string;
  titleColor: string;
  descColor: string;
  topBg: string;
  buttonBg: string;
  shadow: string;
  route?: string;
  illustration: ReactNode;
}

function SoftCircle({
  size,
  top,
  left,
  right,
  bottom,
  color,
}: {
  size: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  color: string;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        top,
        left,
        right,
        bottom,
        pointerEvents: 'none',
      }}
    />
  );
}

function PodcastIllustration({ is960 }: { is960: boolean }) {
  const scale = is960 ? 0.95 : 1.12;
  return (
    <Box sx={{ position: 'relative', width: 132 * scale, height: 118 * scale, mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%)',
          width: 72 * scale,
          height: 72 * scale,
          borderRadius: 2.2,
          background: 'linear-gradient(160deg, #E9D5FF 0%, #C4B5FD 100%)',
          boxShadow: '0 10px 22px rgba(91, 33, 182, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.55,
          zIndex: 1,
        }}
      >
        {[18, 28, 14, 22].map((h, i) => (
          <Box
            key={i}
            sx={{
              width: 5 * scale,
              height: h * scale,
              borderRadius: 99,
              bgcolor: '#7C3AED',
              opacity: 0.9,
            }}
          />
        ))}
      </Box>
      {/* Headset band */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 8 * scale,
          transform: 'translateX(-50%)',
          width: 86 * scale,
          height: 48 * scale,
          border: `${10 * scale}px solid #7C3AED`,
          borderBottom: 'none',
          borderRadius: `${48 * scale}px ${48 * scale}px 0 0`,
          zIndex: 0,
        }}
      />
      {/* Ear cups */}
      {[
        { left: 4 * scale },
        { right: 4 * scale },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: 38 * scale,
            ...pos,
            width: 28 * scale,
            height: 40 * scale,
            borderRadius: 2,
            background: 'linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)',
            boxShadow: '0 8px 16px rgba(91, 33, 182, 0.28)',
            zIndex: 2,
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          left: -2,
          top: 18 * scale,
          width: 22 * scale,
          height: 22 * scale,
          borderRadius: '50%',
          bgcolor: '#86EFAC',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 14 * scale,
          zIndex: 3,
          boxShadow: '0 4px 10px rgba(22,101,52,0.18)',
        }}
      >
        −
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: -2,
          top: 14 * scale,
          width: 22 * scale,
          height: 22 * scale,
          borderRadius: '50%',
          bgcolor: '#F9A8D4',
          color: '#9D174D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 14 * scale,
          zIndex: 3,
          boxShadow: '0 4px 10px rgba(157,23,77,0.16)',
        }}
      >
        +
      </Box>
    </Box>
  );
}

function MindmapIllustration({ is960 }: { is960: boolean }) {
  const scale = is960 ? 0.95 : 1.12;
  return (
    <Box sx={{ position: 'relative', width: 140 * scale, height: 118 * scale, mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '48%',
          width: 86 * scale,
          height: 3,
          bgcolor: 'rgba(255,255,255,0.85)',
          transform: 'translate(-50%, -50%) rotate(-18deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '42%',
          top: '58%',
          width: 70 * scale,
          height: 3,
          bgcolor: 'rgba(255,255,255,0.75)',
          transform: 'translate(-50%, -50%) rotate(28deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '62%',
          top: '62%',
          width: 54 * scale,
          height: 3,
          bgcolor: 'rgba(255,255,255,0.7)',
          transform: 'translate(-50%, -50%) rotate(-42deg)',
        }}
      />
      {[
        { top: 18, left: 52, size: 34, color: 'linear-gradient(145deg,#FFFFFF,#E0E7FF)' },
        { top: 48, left: 18, size: 28, color: 'linear-gradient(145deg,#A78BFA,#7C3AED)' },
        { top: 42, left: 96, size: 30, color: 'linear-gradient(145deg,#FB923C,#F97316)' },
        { top: 78, left: 58, size: 26, color: 'linear-gradient(145deg,#5EEAD4,#14B8A6)' },
      ].map((node, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: node.top * scale,
            left: node.left * scale,
            width: node.size * scale,
            height: node.size * scale,
            borderRadius: '50%',
            background: node.color,
            boxShadow: '0 8px 18px rgba(15,23,42,0.16)',
            border: '2px solid rgba(255,255,255,0.65)',
          }}
        />
      ))}
    </Box>
  );
}

function VideoIllustration({ is960 }: { is960: boolean }) {
  const scale = is960 ? 0.95 : 1.12;
  return (
    <Box sx={{ position: 'relative', width: 140 * scale, height: 118 * scale, mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 10 * scale,
          transform: 'translateX(-50%)',
          width: 108 * scale,
          height: 78 * scale,
          borderRadius: 3,
          background: 'linear-gradient(160deg, #FB923C 0%, #EA580C 100%)',
          boxShadow: '0 14px 28px rgba(194, 65, 12, 0.28)',
          border: `${5 * scale}px solid #FDBA74`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: 0,
            height: 0,
            borderTop: `${14 * scale}px solid transparent`,
            borderBottom: `${14 * scale}px solid transparent`,
            borderLeft: `${22 * scale}px solid #FFFFFF`,
            ml: 0.5,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 12 * scale,
          transform: 'translateX(-50%)',
          width: 54 * scale,
          height: 10 * scale,
          borderRadius: 99,
          bgcolor: '#FDBA74',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 4,
          top: 22 * scale,
          width: 22 * scale,
          height: 22 * scale,
          borderRadius: '50%',
          bgcolor: '#86EFAC',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 14 * scale,
          zIndex: 3,
          boxShadow: '0 4px 10px rgba(22,101,52,0.18)',
        }}
      >
        −
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: 2,
          top: 12 * scale,
          width: 22 * scale,
          height: 22 * scale,
          borderRadius: '50%',
          bgcolor: '#FDE047',
          color: '#A16207',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 14 * scale,
          zIndex: 3,
          boxShadow: '0 4px 10px rgba(161,98,7,0.16)',
        }}
      >
        +
      </Box>
    </Box>
  );
}

function buildEntries(is960: boolean): HubEntry[] {
  return [
    {
      id: 'podcast',
      title: 'AI Culture Podcast',
      description: 'Listen to culture stories.',
      meta: '3–5 min episodes',
      cta: 'Start Listening',
      titleColor: '#5B21B6',
      descColor: '#7C3AED',
      topBg: 'linear-gradient(165deg, #EDE4FF 0%, #D8C4FF 48%, #C4B0F5 100%)',
      buttonBg: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 55%, #6D28D9 100%)',
      shadow: '0 18px 40px rgba(109, 40, 217, 0.16)',
      route: '/audio-reading',
      illustration: <PodcastIllustration is960={is960} />,
    },
    {
      id: 'mindmap',
      title: 'Culture Mindmap',
      description: 'Explore knowledge links.',
      meta: 'Visual connections',
      cta: 'Explore Map',
      titleColor: '#0F766E',
      descColor: '#0D9488',
      topBg: 'linear-gradient(165deg, #D1FAF4 0%, #99F0E4 48%, #5ED9C8 100%)',
      buttonBg: 'linear-gradient(90deg, #2DD4BF 0%, #14B8A6 55%, #0D9488 100%)',
      shadow: '0 18px 40px rgba(13, 148, 136, 0.16)',
      illustration: <MindmapIllustration is960={is960} />,
    },
    {
      id: 'video',
      title: 'Culture Videos',
      description: 'Watch unlocked videos.',
      meta: 'Bonus lessons',
      cta: 'Watch Videos',
      titleColor: '#C2410C',
      descColor: '#EA580C',
      topBg: 'linear-gradient(165deg, #FFE8D6 0%, #FFD0A8 48%, #FFB77A 100%)',
      buttonBg: 'linear-gradient(90deg, #FB923C 0%, #F97316 55%, #EA580C 100%)',
      shadow: '0 18px 40px rgba(234, 88, 12, 0.16)',
      route: '/culture-video',
      illustration: <VideoIllustration is960={is960} />,
    },
  ];
}

export default function CultureMapPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const entries = buildEntries(is960);

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
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at 12% 18%, rgba(196, 181, 253, 0.45) 0%, transparent 42%), radial-gradient(ellipse at 88% 12%, rgba(253, 186, 116, 0.38) 0%, transparent 40%), radial-gradient(ellipse at 70% 88%, rgba(125, 211, 252, 0.28) 0%, transparent 45%), linear-gradient(160deg, #F8F4FF 0%, #FFF8F1 46%, #F3F7FF 100%)',
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

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          px: is960 ? 2.25 : 3,
          pt: is960 ? 1.5 : 1.85,
          pb: is960 ? 1.75 : 2.25,
          gap: is960 ? 1.25 : 1.5,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: is960 ? 1.1 : 1.35, flexShrink: 0 }}>
          <ButtonBase
            onClick={() => navigate(-1)}
            aria-label="Back"
            sx={{
              width: is960 ? 42 : 46,
              height: is960 ? 42 : 46,
              borderRadius: '50%',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(15,23,42,0.06)',
              color: '#334155',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
              mt: 0.15,
              '&:active': { transform: 'scale(0.96)', bgcolor: '#F8FAFC' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 28 }} />
          </ButtonBase>
          <Box sx={{ minWidth: 0, pt: 0.15 }}>
            <Typography
              sx={{
                fontSize: is960 ? '1.4rem' : '1.65rem',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
              }}
            >
              CULTURE HUB
            </Typography>
            <Typography
              sx={{
                mt: is960 ? 0.3 : 0.4,
                fontSize: is960 ? '0.88rem' : '0.98rem',
                fontWeight: 600,
                color: '#64748B',
                lineHeight: 1.3,
              }}
            >
              Choose a way to explore Chinese culture.
            </Typography>
          </Box>
        </Box>

        {/* Entry cards — ~88% tall, vertically centered (design breathing room) */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: is960 ? 1.35 : 1.75,
            alignItems: 'center',
            justifyItems: 'stretch',
          }}
        >
          {entries.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                width: '100%',
                height: '88%',
                minHeight: 0,
                borderRadius: is960 ? '26px' : '32px',
                bgcolor: '#FFFFFF',
                boxShadow: entry.shadow,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              {/* Colored top — illustration + title copy, matching the reference */}
              <Box
                onClick={() => handleEntryClick(entry)}
                sx={{
                  flex: '55 1 0',
                  minHeight: 0,
                  position: 'relative',
                  background: entry.topBg,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  px: is960 ? 1.4 : 1.7,
                  pt: is960 ? 1.2 : 1.4,
                  pb: is960 ? 1.05 : 1.2,
                }}
              >
                <SoftCircle size={is960 ? 110 : 140} top={-36} right={-30} color="rgba(255,255,255,0.28)" />
                <SoftCircle size={is960 ? 80 : 100} bottom={-28} left={-24} color="rgba(255,255,255,0.2)" />
                <SoftCircle size={is960 ? 34 : 42} top={16} left={16} color="rgba(255,255,255,0.35)" />
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {entry.illustration}
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center', flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: is960 ? '1.08rem' : '1.28rem',
                      fontWeight: 900,
                      color: entry.titleColor,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                    }}
                  >
                    {entry.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: is960 ? 0.35 : 0.45,
                      fontSize: is960 ? '0.82rem' : '0.92rem',
                      fontWeight: 600,
                      color: '#64748B',
                      lineHeight: 1.25,
                    }}
                  >
                    {entry.description}
                  </Typography>
                </Box>
              </Box>

              {/* White footer — meta and CTA sit near the top, as in the reference */}
              <Box
                sx={{
                  flex: '45 1 0',
                  minHeight: 0,
                  bgcolor: '#FFFFFF',
                  px: is960 ? 1.5 : 1.85,
                  pt: is960 ? 2.4 : 2.9,
                  pb: is960 ? 1.35 : 1.6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 650, color: '#94A3B8', textAlign: 'center' }}>
                  {entry.meta}
                </Typography>

                <ButtonBase
                  onClick={() => handleEntryClick(entry)}
                  aria-label={entry.cta}
                  sx={{
                    width: '100%',
                    minHeight: is960 ? 46 : 52,
                    borderRadius: '999px',
                    background: entry.buttonBg,
                    color: '#FFFFFF',
                    px: is960 ? 1.25 : 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                    flexShrink: 0,
                    mt: is960 ? 2.4 : 2.8,
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.9rem' : '1rem', fontWeight: 800, pl: 0.5, letterSpacing: '-0.01em' }}>
                    {entry.cta}
                  </Typography>
                  <Box
                    sx={{
                      width: is960 ? 30 : 34,
                      height: is960 ? 30 : 34,
                      borderRadius: '50%',
                      bgcolor: '#FFFFFF',
                      color: entry.titleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: is960 ? 17 : 19 }} />
                  </Box>
                </ButtonBase>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
