/**
 * Culture Hub — Figma「Culture Hub」1900×1200
 * Podcast / Mindmap / Videos 入口
 */
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, ButtonBase, Snackbar, Typography } from '@mui/material'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

interface HubEntry {
  id: string
  title: string
  description: string
  meta: string
  cta: string
  titleColor: string
  descColor: string
  metaColor: string
  cardBg: string
  buttonBg: string
  glassLine: string
  glow: string
  route?: string
  illustration: ReactNode
}

function PodcastIllustration({ p }: { p: (n: number) => number }) {
  return (
    <Box sx={{ position: 'relative', width: p(266), height: p(252), mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: p(8),
          transform: 'translateX(-50%)',
          width: p(220),
          height: p(120),
          border: `${p(20)}px solid #6F2ED1`,
          borderBottom: 'none',
          borderRadius: `${p(120)}px ${p(120)}px 0 0`,
        }}
      />
      {[
        { left: 0 },
        { right: 0 },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: p(96),
            ...pos,
            width: p(48),
            height: p(92),
            borderRadius: `${p(18)}px`,
            bgcolor: '#9D53F1',
            boxShadow: '0 10px 20px rgba(111,46,209,0.25)',
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          transform: 'translate(-50%, -50%) rotate(5deg)',
          width: p(140),
          height: p(140),
          borderRadius: `${p(28)}px`,
          background: 'linear-gradient(135deg, #CDB8FF 0%, #9579E8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(10)}px`,
          boxShadow: '0 14px 28px rgba(111,46,209,0.22)',
        }}
      >
        <Box
          sx={{
            width: '78%',
            height: '78%',
            borderRadius: `${p(18)}px`,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F2ECFF 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: `${p(8)}px`,
            pb: `${p(18)}px`,
          }}
        >
          {[28, 48, 22, 40, 32].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: p(10),
                height: p(h),
                borderRadius: 99,
                bgcolor: i % 2 === 0 ? '#8B70DF' : '#AF97EE',
              }}
            />
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: p(8),
          top: p(28),
          width: p(36),
          height: p(36),
          borderRadius: '50%',
          bgcolor: '#F7A2D9',
          border: `${p(4)}px solid #FFFFFF`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: p(4),
          top: p(12),
          width: p(36),
          height: p(36),
          borderRadius: '50%',
          bgcolor: '#D9EFC1',
          border: `${p(4)}px solid #6F9D39`,
        }}
      />
    </Box>
  )
}

function MindmapIllustration({ p }: { p: (n: number) => number }) {
  return (
    <Box sx={{ position: 'relative', width: p(280), height: p(252), mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '42%',
          width: p(130),
          height: p(130),
          borderRadius: '50%',
          border: `${p(24)}px solid #6EC5B5`,
          transform: 'translate(-50%, -50%)',
          opacity: 0.55,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: p(36),
          transform: 'translateX(-50%)',
          width: p(110),
          height: p(110),
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C7F2E8 0%, #33BA9E 100%)',
          boxShadow: '0 12px 24px rgba(20,148,136,0.25)',
          border: `${p(6)}px solid #72C7B7`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: p(12),
          bottom: p(36),
          width: p(96),
          height: p(96),
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D8CAFF 0%, #AD90FB 100%)',
          boxShadow: '0 10px 20px rgba(124,58,237,0.2)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: p(12),
          bottom: p(36),
          width: p(96),
          height: p(96),
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD8C6 0%, #FE9B79 100%)',
          boxShadow: '0 10px 20px rgba(249,115,22,0.22)',
          border: `${p(6)}px solid #EDA487`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: p(12),
          transform: 'translateX(-50%)',
          width: p(160),
          height: p(18),
          borderRadius: '50%',
          bgcolor: '#54847D',
          opacity: 0.11,
        }}
      />
    </Box>
  )
}

function VideoIllustration({ p }: { p: (n: number) => number }) {
  return (
    <Box sx={{ position: 'relative', width: p(280), height: p(252), mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: p(28),
          transform: 'translateX(-50%) rotate(-2deg)',
          width: p(210),
          height: p(150),
          borderRadius: `${p(22)}px`,
          background: 'linear-gradient(135deg, #FFF8F2 0%, #FFE9DA 100%)',
          boxShadow: '0 14px 28px rgba(194,65,12,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: p(150),
            height: p(108),
            borderRadius: `${p(16)}px`,
            background: 'linear-gradient(135deg, #FFD7BD 0%, #F29570 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: `${p(18)}px solid transparent`,
              borderBottom: `${p(18)}px solid transparent`,
              borderLeft: `${p(28)}px solid #FFFFFF`,
              ml: `${p(6)}px`,
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: p(28),
          transform: 'translateX(-50%)',
          width: p(120),
          height: p(28),
          borderRadius: 99,
          background: 'linear-gradient(135deg, #FFAD85 0%, #EF6F50 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: p(8),
          top: p(18),
          width: p(40),
          height: p(40),
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFEBB1 0%, #F4C85D 100%)',
          border: `${p(4)}px solid #FFFFFF`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: p(8),
          bottom: p(72),
          width: p(40),
          height: p(40),
          borderRadius: '50%',
          bgcolor: '#B8EADF',
          border: `${p(4)}px solid #FFFFFF`,
        }}
      />
    </Box>
  )
}

function buildEntries(p: (n: number) => number): HubEntry[] {
  return [
    {
      id: 'podcast',
      title: 'AI Culture Podcast',
      description: 'Listen to culture stories.',
      meta: '3–5 min episodes',
      cta: 'Start Listening',
      titleColor: '#3E176A',
      descColor: '#705B81',
      metaColor: '#B59AB3',
      cardBg: 'linear-gradient(180deg, #9D50EC 0%, #D6AFF4 38%, #F8F0FD 100%)',
      buttonBg: 'linear-gradient(135deg, #C482FF 0%, #964AFF 100%)',
      glassLine: 'rgba(124, 72, 165, 0.18)',
      glow: 'rgba(153, 91, 235, 0.12)',
      route: '/audio-reading',
      illustration: <PodcastIllustration p={p} />,
    },
    {
      id: 'mindmap',
      title: 'Culture Mindmap',
      description: 'Explore knowledge links.',
      meta: 'Visual connections',
      cta: 'Explore Map',
      titleColor: '#145F59',
      descColor: '#527A76',
      metaColor: '#9AB5B0',
      cardBg: 'linear-gradient(180deg, #20BCAE 0%, #A7E8DC 38%, #EFFBF7 100%)',
      buttonBg: 'linear-gradient(135deg, #2EC8B8 0%, #0CA394 100%)',
      glassLine: 'rgba(22, 123, 115, 0.18)',
      glow: 'rgba(73, 178, 170, 0.12)',
      illustration: <MindmapIllustration p={p} />,
    },
    {
      id: 'video',
      title: 'Culture Videos',
      description: 'Watch unlocked videos.',
      meta: 'Bonus lessons',
      cta: 'Watch Videos',
      titleColor: '#71351E',
      descColor: '#826557',
      metaColor: '#B5A59A',
      cardBg: 'linear-gradient(180deg, #FF794D 0%, #FFC28F 38%, #FFF6EC 100%)',
      buttonBg: 'linear-gradient(135deg, #FF9B58 0%, #FF6A3C 100%)',
      glassLine: 'rgba(162, 94, 66, 0.18)',
      glow: 'rgba(255, 113, 71, 0.12)',
      route: '/culture-video',
      illustration: <VideoIllustration p={p} />,
    },
  ]
}

export default function CultureMapPage() {
  const navigate = useNavigate()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const entries = buildEntries(p)

  const handleEntryClick = (entry: HubEntry) => {
    if (entry.route) {
      navigate(entry.route)
      return
    }
    setSnackbarOpen(true)
  }

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Atmosphere */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #F7FAFF 0%, #FFF6EE 48%, #F7F4FF 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: p(400),
          height: p(400),
          left: p(-60),
          bottom: p(-40),
          borderRadius: '50%',
          bgcolor: '#F3E3FF',
          filter: 'blur(69px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: p(460),
          height: p(460),
          left: p(230),
          bottom: p(-130),
          borderRadius: '50%',
          bgcolor: '#FFECE8',
          filter: 'blur(69px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: p(580),
          height: p(580),
          right: p(-140),
          top: p(-110),
          borderRadius: '50%',
          bgcolor: '#FFEDDC',
          filter: 'blur(123px)',
          pointerEvents: 'none',
        }}
      />

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
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          px: `${p(92)}px`,
          pt: `${p(78)}px`,
          pb: `${p(48)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${p(28)}px`, flexShrink: 0, mb: `${p(36)}px` }}>
          <HskPrepBackButton
            onClick={() => navigate(-1)}
            sx={{ width: p(80), height: p(80), flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: p(40) } }}
          />
          <Box sx={{ minWidth: 0, pt: `${p(4)}px` }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(56),
                lineHeight: `${p(70)}px`,
                color: '#172033',
              }}
            >
              CULTURE HUB
            </Typography>
            <Typography
              sx={{
                mt: `${p(8)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(44),
                lineHeight: `${p(55)}px`,
                color: '#8F99A5',
              }}
            >
              Choose a way to explore Chinese culture.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: `${p(72)}px`,
            alignItems: 'stretch',
          }}
        >
          {entries.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                position: 'relative',
                minHeight: 0,
                height: '100%',
                maxHeight: p(780),
                borderRadius: `${p(28)}px`,
                overflow: 'hidden',
                background: entry.cardBg,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 18px 40px rgba(23,32,51,0.08)',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  width: p(180),
                  height: p(180),
                  right: p(-40),
                  top: p(-50),
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  opacity: 0.16,
                  pointerEvents: 'none',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  width: p(120),
                  height: p(120),
                  left: p(-40),
                  top: '15%',
                  borderRadius: '50%',
                  bgcolor: entry.glow,
                  pointerEvents: 'none',
                }}
              />

              <ButtonBase
                onClick={() => handleEntryClick(entry)}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'center',
                  px: `${p(28)}px`,
                  pt: `${p(28)}px`,
                  pb: 0,
                  color: 'inherit',
                }}
              >
                <Box sx={{ flex: '0 0 38%', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {entry.illustration}
                </Box>
                <Typography
                  sx={{
                    mt: `${p(8)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(38),
                    lineHeight: `${p(48)}px`,
                    color: entry.titleColor,
                  }}
                >
                  {entry.title}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(6)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(24),
                    lineHeight: `${p(30)}px`,
                    color: entry.descColor,
                  }}
                >
                  {entry.description}
                </Typography>
              </ButtonBase>

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  flex: '0 0 41%',
                  minHeight: 0,
                  mt: 'auto',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  borderTop: `1px solid ${entry.glassLine}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: `${p(36)}px`,
                  pt: `${p(28)}px`,
                  pb: `${p(36)}px`,
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(32),
                    lineHeight: `${p(40)}px`,
                    color: entry.metaColor,
                    textAlign: 'center',
                  }}
                >
                  {entry.meta}
                </Typography>
                <ButtonBase
                  onClick={() => handleEntryClick(entry)}
                  aria-label={entry.cta}
                  sx={{
                    width: '100%',
                    height: p(78),
                    borderRadius: `${p(40)}px`,
                    background: entry.buttonBg,
                    color: '#FFFFFF',
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(27),
                    lineHeight: `${p(34)}px`,
                    boxShadow: '0 10px 24px rgba(23,32,51,0.12)',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  {entry.cta}
                </ButtonBase>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
