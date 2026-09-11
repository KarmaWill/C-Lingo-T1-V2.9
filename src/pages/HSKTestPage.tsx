import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import HubLangProfile from '../components/home/HubLangProfile'
import HubContainBoard from '../components/home/HubContainBoard'
import { StudioHomeFrame } from '../components/home/StudioHomeHeader'
import HubPagerDots from '../components/home/HubPagerDots'
import {
  HUB_CANVAS_CLINGO,
  HUB_FRAME_PAD_X,
  HUB_FRAME_PAD_TOP,
  HUB_SURFACE,
  HUB_SURFACE_SHADOW,
  HSK_PREP_MAIN1,
} from '../components/home/hubChrome'
import { loadDiagnosticBestScore } from '../hsk/diagnosticScore'
import type { PaperSource } from '../hsk/hskExamBlueprint'
import { loadSpeakingLatestScore } from '../hsk/speakingScore'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale'

function DiagnosticIcon({ size }: { size: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 48"
      aria-hidden
      sx={{ width: size, height: size, display: 'block' }}
    >
      <rect
        x="7"
        y="7"
        width="34"
        height="34"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M16 24.5 21.5 30 33 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  )
}

function SpeakingIcon({ size }: { size: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 48"
      aria-hidden
      sx={{ width: size, height: size, display: 'block' }}
    >
      <rect x="18" y="8" width="12" height="20" rx="6" fill="currentColor" />
      <path
        d="M12 22a12 12 0 0 0 24 0M24 34v6M16 40h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
      />
    </Box>
  )
}

function HskPrepHeader({ screenSize }: { screenSize: string }) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        flexShrink: 0,
        mx: `-${p(HUB_FRAME_PAD_X)}px`,
        mt: `-${p(HUB_FRAME_PAD_TOP)}px`,
        mb: `${p(20)}px`,
        px: `${p(HUB_FRAME_PAD_X)}px`,
        pt: `${p(16)}px`,
        pb: `${p(16)}px`,
        bgcolor: HUB_SURFACE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: p(90),
        gap: `${p(24)}px`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: p(48),
            lineHeight: `${p(60)}px`,
            color: '#2D3436',
            fontFamily: FIGMA_FONT,
            whiteSpace: 'nowrap',
          }}
        >
          HSK Preparation
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${p(10)}px`,
            height: p(47),
            px: `${p(20)}px`,
            borderRadius: '999px',
            bgcolor: '#EAF0FF',
            border: '2px solid #2768FD',
            flexShrink: 0,
          }}
        >
          <Box sx={{ width: p(12), height: p(12), borderRadius: '50%', bgcolor: '#2768FD', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: p(24),
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#2768FD',
              fontFamily: FIGMA_FONT,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            ONLINE ONLY
          </Typography>
        </Box>
      </Box>
      <HubLangProfile screenSize={screenSize} />
    </Box>
  )
}

/** 一期只开放 HSK1 / HSK2，角标估级不跨到锁定等级。 */
function estimatePrepLevel(score: number | undefined): string {
  if (score === undefined) return '--'
  return score >= 50 ? 'HSK2' : 'HSK1'
}

function ScoreRibbon({
  accent,
  score,
  level,
  onClick,
}: {
  accent: string
  score?: number
  level: string
  onClick: () => void
}) {
  const hasScore = score !== undefined
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={hasScore ? `Open, score ${score}, ${level}` : 'Open, no score yet'}
      sx={{
        position: 'absolute',
        top: 0,
        right: HSK_PREP_MAIN1.scoreRight,
        width: HSK_PREP_MAIN1.scoreW,
        height: HSK_PREP_MAIN1.scoreH,
        zIndex: 3,
        bgcolor: accent,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '9px',
        boxSizing: 'border-box',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        '&:active': { opacity: 0.88 },
        '&:focus-visible': { outline: '3px solid #FFFFFF', outlineOffset: -4 },
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 31,
          lineHeight: '38px',
          color: '#FFFFFF',
          fontFamily: FIGMA_FONT,
        }}
      >
        SCORE
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 43,
          lineHeight: '54px',
          color: '#FFFFFF',
          fontFamily: FIGMA_FONT,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {hasScore ? score : '--'}
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 25,
          lineHeight: '31px',
          color: '#FFFFFF',
          fontFamily: FIGMA_FONT,
          whiteSpace: 'nowrap',
        }}
      >
        {level}
      </Typography>
    </ButtonBase>
  )
}

function PrepToolCard({
  top,
  title,
  subtitle,
  accent,
  iconBg,
  icon,
  score,
  enterRadius = HSK_PREP_MAIN1.enterRadius,
  onClick,
}: {
  top: number
  title: string
  subtitle: string
  accent: string
  iconBg: string
  icon: ReactNode
  score?: number
  enterRadius?: number
  onClick: () => void
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top,
        width: HSK_PREP_MAIN1.left,
        height: HSK_PREP_MAIN1.cardH,
        bgcolor: '#FFFFFF',
        border: `1px solid ${accent}`,
        boxShadow: '0px 4px 20px rgba(213, 213, 213, 0.6)',
        borderRadius: `${HSK_PREP_MAIN1.cardRadius}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <ScoreRibbon
        accent={accent}
        score={score}
        level={estimatePrepLevel(score)}
        onClick={onClick}
      />
      <Box
        sx={{
          position: 'absolute',
          left: HSK_PREP_MAIN1.iconLeft,
          top: HSK_PREP_MAIN1.iconTop,
          width: HSK_PREP_MAIN1.icon,
          height: HSK_PREP_MAIN1.icon,
          borderRadius: '50%',
          bgcolor: iconBg,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: HSK_PREP_MAIN1.textLeft,
          top: HSK_PREP_MAIN1.textTop,
          right: HSK_PREP_MAIN1.scoreW + HSK_PREP_MAIN1.scoreRight + 12,
          display: 'flex',
          flexDirection: 'column',
          gap: `${HSK_PREP_MAIN1.textGap}px`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: HSK_PREP_MAIN1.titleSize,
            lineHeight: '53px',
            color: '#2D3436',
            fontFamily: FIGMA_FONT,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: HSK_PREP_MAIN1.subtitleSize,
            lineHeight: '49px',
            color: '#636E72',
            fontFamily: FIGMA_FONT,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
      <ButtonBase
        onClick={onClick}
        sx={{
          position: 'absolute',
          left: '50%',
          top: HSK_PREP_MAIN1.enterTop,
          width: HSK_PREP_MAIN1.enterW,
          height: HSK_PREP_MAIN1.enterH,
          transform: 'translateX(-50%)',
          borderRadius: `${enterRadius}px`,
          bgcolor: accent,
          border: `1px solid ${accent}`,
          color: '#FFFFFF',
          fontWeight: 500,
          fontSize: 37,
          lineHeight: '46px',
          fontFamily: FIGMA_FONT,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          '&:active': { transform: 'translateX(-50%) scale(0.97)' },
          '&:focus-visible': { outline: `3px solid ${accent}`, outlineOffset: 4 },
        }}
      >
        Enter
      </ButtonBase>
    </Box>
  )
}

const MOCK_LEVELS = [1, 2, 3, 4, 5, 6] as const
const PHASE_ONE_LEVELS = new Set<number>([1, 2])

function MockDeskArt({ screenSize }: { screenSize: string }) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      component="img"
      src="/images/hsk-mock-desk.png"
      alt=""
      aria-hidden
      sx={{
        width: p(420),
        height: 'auto',
        maxHeight: p(280),
        objectFit: 'contain',
        objectPosition: 'left bottom',
        display: 'block',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

function MockTrackSwitch({
  screenSize,
  value,
  onChange,
}: {
  screenSize: string
  value: PaperSource
  onChange: (track: PaperSource) => void
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  const tracks: { id: PaperSource; label: string }[] = [
    { id: 'official', label: 'Past Papers' },
    { id: 'clingo', label: 'C-Test' },
  ]
  return (
    <Box
      role="tablist"
      aria-label="Paper system"
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        p: `${p(5)}px`,
        borderRadius: '999px',
        bgcolor: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.38)',
        boxSizing: 'border-box',
      }}
    >
      {tracks.map((track) => {
        const selected = value === track.id
        return (
          <ButtonBase
            key={track.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(track.id)}
            sx={{
              flex: 1,
              minHeight: p(48),
              px: `${p(10)}px`,
              borderRadius: '999px',
              bgcolor: selected ? HSK_PREP_MAIN1.go : 'transparent',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: p(20),
              lineHeight: 1,
              fontFamily: FIGMA_FONT,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              '&:focus-visible': { outline: '3px solid #FFFFFF', outlineOffset: 2 },
            }}
          >
            {track.label}
          </ButtonBase>
        )
      })}
    </Box>
  )
}

function MockLevelPanel({
  screenSize,
  paperTrack,
  onTrackChange,
  onSelectLevel,
}: {
  screenSize: string
  paperTrack: PaperSource
  onTrackChange: (track: PaperSource) => void
  onSelectLevel: (level: 1 | 2) => void
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 2,
        width: p(392),
        flexShrink: 0,
        alignSelf: 'flex-start',
        bgcolor: 'rgba(186, 214, 255, 0.22)',
        border: '1px solid rgba(255,255,255,0.42)',
        borderRadius: `${p(36)}px`,
        px: `${p(16)}px`,
        pt: `${p(16)}px`,
        pb: `${p(16)}px`,
        boxSizing: 'border-box',
      }}
    >
      <MockTrackSwitch screenSize={screenSize} value={paperTrack} onChange={onTrackChange} />
      <Box
        sx={{
          mt: `${p(14)}px`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${p(12)}px`,
        }}
      >
        {MOCK_LEVELS.map((level) => {
          const open = PHASE_ONE_LEVELS.has(level)
          return (
            <ButtonBase
              key={level}
              disabled={!open}
              onClick={() => {
                if (open) onSelectLevel(level as 1 | 2)
              }}
              aria-label={open ? `HSK ${level}` : `HSK ${level} locked`}
              sx={{
                minHeight: p(58),
                borderRadius: `${p(18)}px`,
                bgcolor: open ? '#FFFFFF' : 'transparent',
                border: open ? 'none' : '1.5px solid rgba(255,255,255,0.55)',
                color: open ? HSK_PREP_MAIN1.go : 'rgba(219, 232, 255, 0.72)',
                fontWeight: 700,
                fontSize: p(26),
                fontFamily: FIGMA_FONT,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                '&:active': open ? { transform: 'scale(0.97)' } : undefined,
                '&.Mui-disabled': {
                  color: 'rgba(219, 232, 255, 0.72)',
                },
              }}
            >
              HSK {level}
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}

export default function HSKTestPage() {
  const navigate = useNavigate()
  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const [paperTrack, setPaperTrack] = useState<PaperSource>('official')
  const diagnosticScore = loadDiagnosticBestScore()
  const speakingScore = loadSpeakingLatestScore()

  const enterMockExam = (track: PaperSource = paperTrack, level?: 1 | 2) => {
    const query = new URLSearchParams({ track })
    if (level) query.set('level', String(level))
    navigate(`/hsk-prep-training?${query.toString()}`)
  }

  return (
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_CLINGO}>
      <HskPrepHeader screenSize={screenSize} />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <HubContainBoard width={HSK_PREP_MAIN1.rowW} height={HSK_PREP_MAIN1.rowH} fillHost>
          {({ width: boardW }) => {
            const mockW = boardW - HSK_PREP_MAIN1.left - HSK_PREP_MAIN1.colGap
            return (
              <>
            <PrepToolCard
              top={0}
              title="Diagnostic Test"
              subtitle="25 Questions | 25 Min"
              accent={HSK_PREP_MAIN1.diagnostic}
              iconBg="#FEF1F1"
              icon={<DiagnosticIcon size={42} />}
              score={diagnosticScore}
              onClick={() => navigate('/hsk-prep-test')}
            />
            <PrepToolCard
              top={HSK_PREP_MAIN1.cardH + HSK_PREP_MAIN1.gap}
              title="AI Speaking Rater"
              subtitle="AI Feedback"
              accent={HSK_PREP_MAIN1.speaking}
              iconBg="rgba(62, 197, 254, 0.1)"
              icon={<SpeakingIcon size={42} />}
              score={speakingScore}
              enterRadius={HSK_PREP_MAIN1.enterRadiusSpeaking}
              onClick={() => navigate('/hsk-oral-review')}
            />
          <Box
            sx={{
              position: 'absolute',
              left: HSK_PREP_MAIN1.left + HSK_PREP_MAIN1.colGap,
              top: 0,
              width: mockW,
              height: HSK_PREP_MAIN1.rowH,
            }}
          >
            <Box
              sx={{
                width: mockW,
                height: HSK_PREP_MAIN1.rowH,
                borderRadius: `${HSK_PREP_MAIN1.mockRadius}px`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0px 4px 20px rgba(213, 213, 213, 0.6)',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(101.66deg, ${HSK_PREP_MAIN1.mockFrom} 78.73%, ${HSK_PREP_MAIN1.mockTo} 100%)`,
                  pointerEvents: 'none',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(101.66deg, ${HSK_PREP_MAIN1.mockMaskFrom} 78.73%, ${HSK_PREP_MAIN1.mockMaskTo} 100%)`,
                  mixBlendMode: 'multiply',
                  opacity: 0.28,
                  pointerEvents: 'none',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  width: 783,
                  height: 327,
                  left: 527,
                  top: -409,
                  bgcolor: '#609EFF',
                  mixBlendMode: 'screen',
                  filter: 'blur(91px)',
                  borderRadius: `${HSK_PREP_MAIN1.mockRadius}px`,
                  transform: 'matrix(-0.74, -0.67, -0.25, 0.97, 0, 0)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  width: 645,
                  height: 624,
                  left: 144,
                  top: 622,
                  bgcolor: '#5E9DF9',
                  mixBlendMode: 'screen',
                  opacity: 0.51,
                  filter: 'blur(47px)',
                  borderRadius: `${HSK_PREP_MAIN1.mockRadius}px`,
                  pointerEvents: 'none',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  width: 530,
                  height: 439,
                  left: 487,
                  top: 545,
                  bgcolor: 'rgba(43, 0, 255, 0.42)',
                  mixBlendMode: 'screen',
                  filter: 'blur(81px)',
                  borderRadius: `${HSK_PREP_MAIN1.mockRadius}px`,
                  transform: 'matrix(0.88, -0.47, 0.15, 0.99, 0, 0)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  flex: 1,
                  minHeight: 0,
                  px: `${HSK_PREP_MAIN1.mockPadX}px`,
                  pt: `${HSK_PREP_MAIN1.mockPadT}px`,
                  pb: '22px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  gap: '24px',
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, minHeight: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: HSK_PREP_MAIN1.mockTitle,
                      lineHeight: '61px',
                      color: '#FFFFFF',
                      fontFamily: FIGMA_FONT,
                    }}
                  >
                    Mock Exam
                  </Typography>
                  <Typography
                    sx={{
                      mt: '2px',
                      maxWidth: 360,
                      fontWeight: 400,
                      fontSize: HSK_PREP_MAIN1.mockBody,
                      lineHeight: '40px',
                      color: '#FFFFFF',
                      fontFamily: FIGMA_FONT,
                    }}
                  >
                    Targeted practice for HSK topics and grammar points.
                  </Typography>
                </Box>
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    left: HSK_PREP_MAIN1.mockPadX,
                    bottom: 8,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <MockDeskArt screenSize="1920x1125" />
                </Box>
                <MockLevelPanel
                  screenSize="1920x1125"
                  paperTrack={paperTrack}
                  onTrackChange={setPaperTrack}
                  onSelectLevel={(level) => enterMockExam(paperTrack, level)}
                />
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  flexShrink: 0,
                  height: HSK_PREP_MAIN1.mockWhite,
                  bgcolor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ButtonBase
                  onClick={() => navigate('/hsk-prep-training')}
                  aria-label="GO to Mock Exam"
                  sx={{
                    width: HSK_PREP_MAIN1.goW,
                    height: HSK_PREP_MAIN1.goH,
                    borderRadius: `${HSK_PREP_MAIN1.mockRadius}px`,
                    bgcolor: HSK_PREP_MAIN1.go,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    fontWeight: 700,
                    fontSize: HSK_PREP_MAIN1.mockTitle,
                    lineHeight: 1,
                    fontFamily: FIGMA_FONT,
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'transform 120ms ease-out',
                    '&:active': { transform: 'scale(0.97)' },
                    '&:focus-visible': { outline: '3px solid #FDD83B', outlineOffset: 4 },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                      '&:active': { transform: 'none' },
                    },
                  }}
                >
                  GO
                  <Box
                    component="svg"
                    viewBox="0 0 16 28"
                    aria-hidden
                    sx={{ width: 13, height: 26, display: 'block' }}
                  >
                    <path d="M2 2l11 12L2 26" fill="none" stroke="#fff" strokeWidth="3.2" />
                  </Box>
                </ButtonBase>
              </Box>
            </Box>
          </Box>
              </>
            )
          }}
        </HubContainBoard>
      </Box>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}
