import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import HubContainBoard from '../components/home/HubContainBoard'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { useFeedback } from '../components/feedback/FeedbackProvider'
import { FIGMA_FONT } from '../utils/figmaScale'

/** 诊断卷一期固定：25 题 / 25 分钟 / 100 分，不套模考稿上的 40/200。 */
const DIAGNOSTIC_QUESTIONS = 25
const DIAGNOSTIC_DURATION_MIN = 25
const DIAGNOSTIC_MAX_SCORE = 100

/** 稿宽只作比例尺；fillHost 把画布加宽到槽位，不再 contain 锁 1900。 */
const BOARD_W = 1900
const BOARD_H = 1200

const RULES = [
  'Stay focused and complete the test independently.',
  'Answer every question within the time limit. Blank answers count as incorrect.',
  'You may submit early. When time is up, the system will auto-submit.',
  'Your score estimates your current HSK level. Manage time wisely.',
] as const

const PAGE_GRADIENT = 'linear-gradient(135deg, #F7FAFF 0%, #FFF6EE 48%, #F7F4FF 100%)'

function x(designX: number, boardW: number) {
  return (designX / BOARD_W) * boardW
}

function StatIcon({ kind }: { kind: 'time' | 'questions' | 'score' }) {
  if (kind === 'time') {
    return (
      <Box
        sx={{
          width: 71,
          height: 71,
          borderRadius: '18px',
          bgcolor: '#FFF0F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 48 48"
          sx={{ width: 40, height: 40, display: 'block' }}
        >
          <circle cx="24" cy="24" r="16" fill="none" stroke="#F15B85" strokeWidth="5" />
          <path d="M24 16v9l7 4" fill="none" stroke="#F15B85" strokeWidth="5" strokeLinecap="round" />
        </Box>
      </Box>
    )
  }
  if (kind === 'questions') {
    return (
      <Box
        sx={{
          width: 71,
          height: 71,
          borderRadius: '18px',
          bgcolor: '#EEF5FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 48 48"
          sx={{ width: 40, height: 40, display: 'block' }}
        >
          <rect x="10" y="12" width="6" height="24" rx="1.5" fill="#668BFF" />
          <path d="M22 16h16M22 24h16M22 32h12" fill="none" stroke="#668BFF" strokeWidth="3.6" strokeLinecap="round" />
        </Box>
      </Box>
    )
  }
  return (
    <Box
      sx={{
        width: 71,
        height: 71,
        borderRadius: '18px',
        bgcolor: '#FFF6DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 48 48"
        sx={{ width: 40, height: 40, display: 'block' }}
      >
        <path d="M16 18h16v8c0 6-3.4 10-8 12-4.6-2-8-6-8-12V18Z" fill="none" stroke="#F3B93F" strokeWidth="3.6" />
        <path d="M18 38h12l-2 4h-8l-2-4Z" fill="#F3B93F" />
      </Box>
    </Box>
  )
}

function StatBlock({
  left,
  kind,
  value,
  label,
}: {
  left: number
  kind: 'time' | 'questions' | 'score'
  value: number
  label: string
}) {
  return (
    <Box sx={{ position: 'absolute', left, top: 250, display: 'flex', alignItems: 'center', gap: '22px' }}>
      <StatIcon kind={kind} />
      <Box>
        <Typography
          sx={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 50,
            lineHeight: '57px',
            color: '#172033',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 400,
            fontSize: 28,
            lineHeight: '35px',
            color: '#687289',
            mt: '4px',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  )
}

function GlassCard({
  left,
  width,
  children,
}: {
  left: number
  width: number
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        top: 426,
        width,
        height: 532,
        bgcolor: 'rgba(255,255,255,0.66)',
        border: '2px solid rgba(255,255,255,0.82)',
        borderRadius: '36px',
        boxSizing: 'border-box',
        px: '42px',
        pt: '36px',
        pb: '28px',
        backdropFilter: 'blur(22px)',
        '@media (prefers-reduced-transparency: reduce)': {
          bgcolor: '#FFFFFF',
          backdropFilter: 'none',
        },
      }}
    >
      {children}
    </Box>
  )
}

function FeedbackMark() {
  return (
    <Box component="svg" viewBox="0 0 37 40" sx={{ width: 37, height: 40, display: 'block' }}>
      <rect x="1.5" y="3" width="32" height="34" rx="7" fill="none" stroke="#636E72" strokeWidth="5" />
      <rect x="8" y="16" width="12" height="4" rx="2" fill="#636E72" />
      <rect x="8" y="23" width="16" height="4" rx="2" fill="#636E72" />
      <rect x="20" y="0" width="22" height="5" rx="2.5" fill="#636E72" transform="rotate(-53.47 22 2)" />
    </Box>
  )
}

/** Prep test intro. Diagnostic Test 01 opens the diagnostic exam flow. */
export default function HSKPrepTestIntroPage() {
  const navigate = useNavigate()
  const { openFeedback } = useFeedback()
  const [rulesAccepted, setRulesAccepted] = useState(false)

  return (
    <Box sx={{ height: '100%', display: 'flex', overflow: 'hidden', background: PAGE_GRADIENT }}>
      <HubContainBoard width={BOARD_W} height={BOARD_H} fillHost>
        {({ width: boardW }) => (
          <>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: PAGE_GRADIENT,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              width: x(520, boardW),
              height: 420,
              left: x(-40, boardW),
              top: 180,
              bgcolor: 'rgba(255, 181, 217, 0.27)',
              filter: 'blur(94px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              width: x(420, boardW),
              height: 420,
              right: x(40, boardW),
              top: 380,
              bgcolor: 'rgba(185, 201, 255, 0.33)',
              filter: 'blur(94px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              width: x(520, boardW),
              height: 420,
              left: x(950, boardW),
              bottom: -200,
              bgcolor: 'rgba(255, 209, 182, 0.33)',
              filter: 'blur(94px)',
              pointerEvents: 'none',
            }}
          />
        </Box>

        <HskPrepBackButton
          onClick={() => navigate('/hsk-test')}
          sx={{
            position: 'absolute',
            left: x(60, boardW),
            top: 78,
            zIndex: 2,
          }}
        />

        <Typography
          sx={{
            position: 'absolute',
            left: x(159, boardW),
            top: 84,
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#172033',
            whiteSpace: 'nowrap',
          }}
        >
          Test 01
        </Typography>

        <Box
          sx={{
            position: 'absolute',
            left: x(458, boardW),
            top: 95,
            height: 49,
            px: '22px',
            bgcolor: '#DF171C',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFFFFF', flexShrink: 0 }} />
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '30px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            HSK Diagnostic Test
          </Typography>
        </Box>

        <ButtonBase
          onClick={() => openFeedback({ screen: 'hsk_diagnostic_intro', force: true })}
          aria-label="Feedback"
          sx={{
            position: 'absolute',
            left: x(1714, boardW),
            top: 78,
            width: 80,
            height: 80,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            zIndex: 2,
            '&:active': { bgcolor: '#F9FAFB' },
          }}
        >
          <FeedbackMark />
        </ButtonBase>

        <StatBlock left={x(211, boardW)} kind="time" value={DIAGNOSTIC_DURATION_MIN} label="Duration · min" />
        <StatBlock left={x(741, boardW)} kind="questions" value={DIAGNOSTIC_QUESTIONS} label="Total questions" />
        <StatBlock left={x(1270, boardW)} kind="score" value={DIAGNOSTIC_MAX_SCORE} label="Full score" />

        <GlassCard left={x(152, boardW)} width={x(798, boardW)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', mb: '28px' }}>
            <Box
              sx={{
                width: 10,
                height: 50,
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #F55BC8 0%, #F27A8D 52%, #FF9B68 100%)',
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 700,
                fontSize: 34,
                lineHeight: '39px',
                color: '#172033',
              }}
            >
              Exam rules
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {RULES.map((rule, idx) => (
              <Box key={rule} sx={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '14px',
                    bgcolor: '#FFF0F4',
                    color: '#E94E77',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: 24,
                    lineHeight: '28px',
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: 28,
                    lineHeight: '35px',
                    color: '#172033',
                    pt: '8px',
                  }}
                >
                  {rule}
                </Typography>
              </Box>
            ))}
          </Box>
        </GlassCard>

        <GlassCard left={x(996, boardW)} width={x(752, boardW)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', mb: '28px' }}>
            <Box
              sx={{
                width: 10,
                height: 50,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6395FF 0%, #8F73FF 100%)',
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 700,
                fontSize: 34,
                lineHeight: '39px',
                color: '#172033',
              }}
            >
              Question types
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {[
              { title: 'Listening & Reading', detail: '25 questions', meta: '~25 min' },
              { title: 'Level estimate', detail: 'HSK 1-2 snapshot', meta: 'Instant' },
            ].map((row) => (
              <Box
                key={row.title}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 110,
                  px: '28px',
                  bgcolor: 'rgba(217, 222, 248, 0.2)',
                  border: '2px solid rgba(255,255,255,0.82)',
                  borderRadius: '24px',
                  boxSizing: 'border-box',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: 32,
                      lineHeight: '40px',
                      color: '#172033',
                    }}
                  >
                    {row.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#687289',
                      mt: '4px',
                    }}
                  >
                    {row.detail}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: 132,
                    height: 46,
                    px: '16px',
                    borderRadius: '14px',
                    bgcolor: 'rgba(255,255,255,0.72)',
                    border: '2px solid rgba(255,255,255,0.82)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#687289',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.meta}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </GlassCard>

        <ButtonBase
          onClick={() => setRulesAccepted((v) => !v)}
          aria-pressed={rulesAccepted}
          sx={{
            position: 'absolute',
            left: x(159, boardW),
            top: 1068,
            minHeight: 72,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: rulesAccepted ? '#DF171C' : 'rgba(255,255,255,0.55)',
              border: rulesAccepted ? '2px solid #DF171C' : '2px solid #AAB6C9',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {rulesAccepted && (
              <Box
                component="svg"
                viewBox="0 0 16 16"
                sx={{ width: 16, height: 16, display: 'block' }}
              >
                <path d="M3 8.2 6.4 12 13 4" fill="none" stroke="#fff" strokeWidth="2.2" />
              </Box>
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '30px',
              color: '#172033',
            }}
          >
            I have read and understand the exam rules
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={() => navigate('/hsk-mock-exam')}
          disabled={!rulesAccepted}
          aria-label="Start exam"
          sx={{
            position: 'absolute',
            left: x(1371, boardW),
            top: 1052,
            width: x(376, boardW),
            height: 94,
            borderRadius: '28px',
            background: rulesAccepted
              ? 'linear-gradient(90deg, #F55BC8 0%, #F27A8D 52%, #FF9B68 100%)'
              : '#D5D9E2',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 2,
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.72)' },
          }}
        >
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: '50px',
            }}
          >
            Start exam
          </Typography>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 16 16"
              sx={{ width: 18, height: 18, display: 'block' }}
            >
              <path d="M4 2.5 12 8 4 13.5" fill="none" stroke="#fff" strokeWidth="2.4" />
            </Box>
          </Box>
        </ButtonBase>
          </>
        )}
      </HubContainBoard>
    </Box>
  )
}
