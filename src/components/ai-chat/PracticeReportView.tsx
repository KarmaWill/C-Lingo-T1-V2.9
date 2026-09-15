import { Box, ButtonBase, Typography } from '@mui/material'
import { ArrowBack as BackIcon, InfoOutlined, TrendingUp } from '@mui/icons-material'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../../utils/figmaScale'
import { useFeedback } from '../feedback/FeedbackProvider'

const REPORT_FEEDBACK_ART = '/images/clingo-ai-mascot-think.png'

const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

const headerCtrlSx = {
  bgcolor: '#FFFFFF',
  border: '1px solid #E0E0DF',
  color: '#2D3436',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '&:active': { transform: 'scale(0.95)' },
} as const

export type PracticeReportCorrection = {
  original: string
  corrected: string
  explanation?: string
  type: string
}

export type PracticeReportPayload = {
  score: number
  date: Date
  durationMin: number
  turns: number
  summary: string
  suggestedFocus: string
  corrections: PracticeReportCorrection[]
}

const typeLabel = (type: string) =>
  type === 'grammar' ? 'Grammar' : type === 'vocabulary' ? 'Vocabulary' : 'Fluency'

const typeColor = (type: string) => (type === 'grammar' ? '#FF6B35' : '#00B4A0')

export default function PracticeReportView({
  payload,
  onBack,
  onDone,
}: {
  payload: PracticeReportPayload
  onBack: () => void
  onDone?: () => void
}) {
  const { openFeedback, isDialogOpen } = useFeedback()
  const high = payload.score >= 60
  const accent = high ? '#3FB266' : '#F34D47'
  const wash = high ? 'rgba(138, 200, 141, 0.2)' : '#FFF0F1'
  const dateStr = `${payload.date.getFullYear()} / ${payload.date.getMonth() + 1} / ${payload.date.getDate()}`
  const highlights = Math.max(0, payload.turns - payload.corrections.length)
  const titleSx = {
    fontFamily: FIGMA_FONT,
    fontWeight: 700,
    fontSize: p(32),
    lineHeight: `${p(48)}px`,
    color: '#000000',
  } as const

  return (
    <Box sx={{ height: '100%', bgcolor: '#F8F9F8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          height: p(160),
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ButtonBase
          onClick={onBack}
          aria-label="Back"
          sx={{
            ...headerCtrlSx,
            position: 'absolute',
            left: p(60),
            width: p(80),
            height: p(80),
            borderRadius: `${p(100)}px`,
          }}
        >
          <BackIcon sx={{ fontSize: p(40), color: '#2D3436' }} />
        </ButtonBase>
        <Box sx={{ textAlign: 'center', px: `${p(180)}px` }}>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: 1.6,
              color: '#2D3436',
            }}
          >
            Practice Report
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(28),
              lineHeight: 1.6,
              color: '#636E72',
            }}
          >
            {dateStr}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: p(60),
            display: 'flex',
            alignItems: 'center',
            gap: `${p(16)}px`,
          }}
        >
          {onDone ? (
            <ButtonBase
              onClick={onDone}
              aria-label="Done"
              sx={{
                ...headerCtrlSx,
                height: p(80),
                px: `${p(28)}px`,
                borderRadius: `${p(18)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(28),
                color: '#2D3436',
              }}
            >
              Done
            </ButtonBase>
          ) : null}
          {isDialogOpen ? null : (
            <ButtonBase
              onClick={() => openFeedback({ screen: 'ai_tutor_report' })}
              aria-label="Feedback"
              title="Feedback"
              sx={{
                ...headerCtrlSx,
                width: p(80),
                height: p(80),
                minWidth: p(80),
                minHeight: p(80),
                p: 0,
                overflow: 'hidden',
                borderRadius: `${p(18)}px`,
              }}
            >
              <Box
                component="img"
                src={REPORT_FEEDBACK_ART}
                alt=""
                sx={{
                  width: '88%',
                  height: '88%',
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </ButtonBase>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: `${p(40)}px`,
          px: `${p(60)}px`,
          py: `${p(40)}px`,
        }}
      >
        <Box
          sx={{
            width: p(680),
            flex: `0 0 ${p(680)}px`,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: `0 0 ${p(360)}px`,
              position: 'relative',
              overflow: 'hidden',
              background: high
                ? 'linear-gradient(0deg, #3FB266, #3FB266)'
                : 'linear-gradient(140.03deg, #FD636D 4.75%, #FD8089 50%, #FD9EA4 95.25%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: p(455),
                height: p(237),
                left: p(-133),
                top: p(-10),
                background: high
                  ? 'linear-gradient(185.08deg, #FEDC5E 37.43%, #3FB266 97.86%)'
                  : 'linear-gradient(180deg, rgba(255, 233, 152, 0.58) 0%, rgba(248, 117, 123, 0.58) 100%)',
                opacity: 0.8,
                filter: 'blur(60px)',
                transform: 'rotate(-44.14deg)',
                pointerEvents: 'none',
              }}
            />
            <Typography
              sx={{
                position: 'relative',
                zIndex: 1,
                pt: `${p(40)}px`,
                pl: `${p(40)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: 1.6,
                color: '#FFFFFF',
              }}
            >
              Overall score
            </Typography>
            <Typography
              sx={{
                position: 'relative',
                zIndex: 1,
                pl: `${p(24)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(160),
                lineHeight: 1.15,
                color: '#FFFFFF',
              }}
            >
              {payload.score}
            </Typography>
            <Box
              component="img"
              src={high ? '/images/clingo-ai-mascot-score.png' : '/images/clingo-ai-mascot-score-low.png'}
              alt=""
              sx={{
                position: 'absolute',
                right: p(-12),
                bottom: p(-48),
                height: p(340),
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              mt: `${p(-62)}px`,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              gap: `${p(40)}px`,
              px: `${p(40)}px`,
              py: `${p(48)}px`,
              background: 'linear-gradient(176.54deg, rgba(255, 255, 255, 0.86) -0.09%, #FFFFFF 20.51%)',
              backdropFilter: 'blur(25px)',
              borderRadius: `${p(40)}px`,
            }}
          >
            {[
              {
                label: 'Study time',
                caption: `${payload.turns} turns completed`,
                value: payload.durationMin,
                unit: 'min',
              },
              {
                label: 'Highlights',
                caption: 'Strong lines',
                value: highlights,
                unit: 'lines',
              },
            ].map((row) => (
              <Box
                key={row.label}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  bgcolor: wash,
                  borderRadius: `${p(40)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: `${p(40)}px`,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(8)}px` }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(28),
                      lineHeight: 1.6,
                      color: '#A7B3B8',
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(32),
                      lineHeight: 1.6,
                      color: '#2D3436',
                    }}
                  >
                    {row.caption}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${p(8)}px`, flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(64),
                      lineHeight: `${p(93)}px`,
                      color: accent,
                    }}
                  >
                    {row.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(40),
                      lineHeight: `${p(60)}px`,
                      color: '#636E72',
                    }}
                  >
                    {row.unit}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${p(40)}px`,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(40)}px`,
              px: `${p(50)}px`,
              py: `${p(30)}px`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(20)}px`, flexShrink: 0 }}>
              <Box
                sx={{
                  width: p(48),
                  height: p(48),
                  borderRadius: '50%',
                  background: 'linear-gradient(103.66deg, #FEDC5E 0.16%, #3FB266 78.79%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src="/images/clingo-ai-mascot-head.png"
                  alt=""
                  sx={{
                    display: 'block',
                    width: '92%',
                    height: '92%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
              <Typography sx={titleSx}>AI Feedback</Typography>
            </Box>
            <Typography
              sx={{
                flex: 1,
                minHeight: 0,
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: `${p(64)}px`,
                color: '#000000',
                overflow: 'auto',
              }}
            >
              {payload.summary}
            </Typography>
            <Box
              sx={{
                mt: `${p(16)}px`,
                flexShrink: 0,
                minHeight: p(80),
                bgcolor: wash,
                borderRadius: `${p(20)}px`,
                display: 'flex',
                alignItems: 'center',
                gap: `${p(16)}px`,
                px: `${p(28)}px`,
              }}
            >
              <TrendingUp sx={{ fontSize: p(36), color: accent, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(28),
                  lineHeight: `${p(41)}px`,
                  color: accent,
                }}
              >
                Focus: {payload.suggestedFocus}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(40)}px`,
              px: `${p(50)}px`,
              py: `${p(30)}px`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(20)}px`, flexShrink: 0 }}>
              <InfoOutlined sx={{ fontSize: p(36), color: accent }} />
              <Typography sx={titleSx}>Key Fixes</Typography>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 400,
                  fontSize: p(24),
                  lineHeight: `${p(35)}px`,
                  color: accent,
                }}
              >
                {payload.corrections.length} fixes
              </Typography>
            </Box>
            <Box
              sx={{
                minHeight: 0,
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: `${p(20)}px`,
                pr: `${p(8)}px`,
              }}
            >
              {payload.corrections.map((item, idx) => (
                <Box
                  key={`${item.original}-${idx}`}
                  sx={{
                    position: 'relative',
                    flexShrink: 0,
                    bgcolor: wash,
                    borderRadius: `${p(30)}px`,
                    px: `${p(52)}px`,
                    py: `${p(24)}px`,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      height: p(50),
                      px: `${p(20)}px`,
                      bgcolor: typeColor(item.type),
                      display: 'flex',
                      alignItems: 'center',
                      borderBottomLeftRadius: `${p(16)}px`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 400,
                        fontSize: p(24),
                        lineHeight: `${p(36)}px`,
                        color: '#FFFFFF',
                      }}
                    >
                      {typeLabel(item.type)}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(32),
                      lineHeight: `${p(48)}px`,
                      color: '#636E72',
                      mb: `${p(8)}px`,
                    }}
                  >
                    #{idx + 1}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: KAI_TI,
                      fontWeight: 400,
                      fontSize: p(24),
                      lineHeight: `${p(36)}px`,
                      color: '#636E72',
                      textDecoration: 'line-through',
                      mb: `${p(12)}px`,
                      pr: `${p(120)}px`,
                    }}
                  >
                    {item.original}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(13)}px` }}>
                    <Box
                      component="svg"
                      width={p(28)}
                      height={p(23)}
                      viewBox="0 0 28 23"
                      sx={{ flexShrink: 0, color: accent }}
                      aria-hidden
                    >
                      <path
                        d="M3 11.5h16M13 4l11 7.5L13 19"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: KAI_TI,
                        fontWeight: 400,
                        fontSize: p(32),
                        lineHeight: `${p(48)}px`,
                        color: '#2D3436',
                      }}
                    >
                      {item.corrected}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
