/**
 * Culture Hub — Figma「Culture Hub」1900×1200
 * 双卡：AI Culture Podcast + Culture Videos（gap 125）
 */
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import HubContainBoard from '../components/home/HubContainBoard'
import { FIGMA_FONT } from '../utils/figmaScale'

const FIGMA_W = 1900
const FIGMA_H = 1200
const CARD_W = 652
const CARD_H = 780
const CARD_GAP = 125

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
  route: string
  illustration: ReactNode
}

function PodcastIllustration() {
  return (
    <Box sx={{ position: 'relative', width: 288, height: 252, mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 8,
          transform: 'translateX(-50%)',
          width: 240,
          height: 130,
          border: '20px solid #6F2ED1',
          borderBottom: 'none',
          borderRadius: '120px 120px 0 0',
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
            top: 104,
            ...pos,
            width: 52,
            height: 98,
            borderRadius: '18px',
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
          width: 148,
          height: 148,
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #CDB8FF 0%, #9579E8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 14px 28px rgba(111,46,209,0.22)',
        }}
      >
        <Box
          sx={{
            width: '78%',
            height: '78%',
            borderRadius: '18px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F2ECFF 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '8px',
            pb: '18px',
          }}
        >
          {[28, 48, 22, 40, 32].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 10,
                height: h,
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
          left: 8,
          top: 28,
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#F7A2D9',
          border: '4px solid #FFFFFF',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 4,
          top: 12,
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#D9EFC1',
          border: '4px solid #6F9D39',
        }}
      />
    </Box>
  )
}

function VideoIllustration() {
  return (
    <Box sx={{ position: 'relative', width: 288, height: 252, mx: 'auto' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 28,
          transform: 'translateX(-50%) rotate(-2deg)',
          width: 220,
          height: 158,
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #FFF8F2 0%, #FFE9DA 100%)',
          boxShadow: '0 14px 28px rgba(194,65,12,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 156,
            height: 112,
            borderRadius: '16px',
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
              borderTop: '18px solid transparent',
              borderBottom: '18px solid transparent',
              borderLeft: '28px solid #FFFFFF',
              ml: '6px',
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 28,
          transform: 'translateX(-50%)',
          width: 128,
          height: 30,
          borderRadius: 99,
          background: 'linear-gradient(135deg, #FFAD85 0%, #EF6F50 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          top: 18,
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFEBB1 0%, #F4C85D 100%)',
          border: '4px solid #FFFFFF',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 72,
          width: 42,
          height: 42,
          borderRadius: '50%',
          bgcolor: '#B8EADF',
          border: '4px solid #FFFFFF',
        }}
      />
    </Box>
  )
}

const ENTRIES: HubEntry[] = [
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
    illustration: <PodcastIllustration />,
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
    illustration: <VideoIllustration />,
  },
]

function CultureCard({ entry, onOpen }: { entry: HubEntry; onOpen: () => void }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: CARD_W,
        height: CARD_H,
        flex: 'none',
        borderRadius: '28px',
        overflow: 'hidden',
        background: entry.cardBg,
        boxShadow: '0 18px 40px rgba(23,32,51,0.08)',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 220,
          height: 220,
          right: -70,
          top: -80,
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
          width: 140,
          height: 140,
          left: -70,
          top: '15%',
          borderRadius: '50%',
          bgcolor: entry.glow,
          pointerEvents: 'none',
        }}
      />

      <ButtonBase
        onClick={onOpen}
        aria-label={`${entry.title}. ${entry.description}`}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'block',
          textAlign: 'center',
          color: 'inherit',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 48,
            height: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {entry.illustration}
        </Box>

        <Typography
          sx={{
            position: 'absolute',
            left: '8%',
            right: '8%',
            top: '41.92%',
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 38,
            lineHeight: '48px',
            color: entry.titleColor,
            textAlign: 'center',
          }}
        >
          {entry.title}
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            top: '49.62%',
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '30px',
            color: entry.descColor,
            textAlign: 'center',
          }}
        >
          {entry.description}
        </Typography>
      </ButtonBase>

      {/* 玻璃底栏 ≈ 稿 59% → 底 */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '59%',
          bottom: 0,
          zIndex: 2,
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${entry.glassLine}`,
          pointerEvents: 'none',
        }}
      />

      <Typography
        sx={{
          position: 'absolute',
          left: '12%',
          right: '12%',
          top: '67.56%',
          zIndex: 3,
          fontFamily: FIGMA_FONT,
          fontWeight: 700,
          fontSize: 32,
          lineHeight: '40px',
          color: entry.metaColor,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {entry.meta}
      </Typography>

      <ButtonBase
        onClick={onOpen}
        aria-label={entry.cta}
        sx={{
          position: 'absolute',
          left: '11.54%',
          right: '11.54%',
          top: '80.13%',
          height: 78,
          zIndex: 3,
          borderRadius: 999,
          background: entry.buttonBg,
          color: '#FFFFFF',
          fontFamily: FIGMA_FONT,
          fontWeight: 700,
          fontSize: 27,
          lineHeight: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          boxShadow: '0 10px 24px rgba(23,32,51,0.12)',
          '&:active': { transform: 'scale(0.98)' },
          '&:focus-visible': {
            outline: '3px solid #FFFFFF',
            outlineOffset: 3,
          },
        }}
      >
        <Box component="span" sx={{ flex: 1, textAlign: 'center', pl: '48px' }}>
          {entry.cta}
        </Box>
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            mr: '12px',
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.24)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
        </Box>
      </ButtonBase>
    </Box>
  )
}

export default function CultureMapPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HubContainBoard width={FIGMA_W} height={FIGMA_H}>
        {/* Atmosphere — Figma Vector + Ellipses */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '-4.77%',
            right: '-4%',
            top: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #F7FAFF 0%, #FFF6EE 48%, #F7F4FF 100%)',
            borderRadius: '145px',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '-3.32%',
            right: '82.63%',
            top: '70%',
            bottom: '-2.75%',
            bgcolor: '#F3E3FF',
            filter: 'blur(68.6px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '12.11%',
            right: '63.68%',
            top: '72.67%',
            bottom: '-11%',
            bgcolor: '#FFECE8',
            filter: 'blur(68.6px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '77.11%',
            right: '-7.58%',
            top: '-9.33%',
            bottom: '61.08%',
            bgcolor: '#FFEDDC',
            filter: 'blur(123.2px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <HskPrepBackButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: 50,
            top: 78,
            zIndex: 2,
            width: 80,
            height: 80,
            '& .MuiSvgIcon-root': { fontSize: 40 },
          }}
        />

        <Typography
          sx={{
            position: 'absolute',
            left: '8.37%',
            top: '6.92%',
            zIndex: 2,
            m: 0,
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#172033',
            fontOpticalSizing: 'auto',
          }}
        >
          CULTURE HUB
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            left: '8.37%',
            right: '45.84%',
            top: '13.92%',
            zIndex: 2,
            m: 0,
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: '55px',
            color: '#8F99A5',
            fontOpticalSizing: 'auto',
          }}
        >
          Choose a way to explore Chinese culture.
        </Typography>

        {/* Frame 1410141833 · 双卡 gap 125 */}
        <Box
          sx={{
            position: 'absolute',
            left: 236,
            top: 304,
            width: CARD_W * 2 + CARD_GAP,
            height: CARD_H,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: `${CARD_GAP}px`,
            zIndex: 2,
          }}
        >
          {ENTRIES.map((entry) => (
            <CultureCard key={entry.id} entry={entry} onOpen={() => navigate(entry.route)} />
          ))}
        </Box>
      </HubContainBoard>
    </Box>
  )
}
