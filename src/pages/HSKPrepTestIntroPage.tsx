import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const DIAGNOSTIC_QUESTIONS = 25;
const DIAGNOSTIC_DURATION_MIN = 25;
const DIAGNOSTIC_MAX_SCORE = 100;
const ACCENT = '#BE123C';
const ACCENT_BG = '#FEF2F2';
const HEADER_BADGE_BG = 'linear-gradient(135deg, #EF4444 0%, #BE123C 100%)';

const QUESTION_TYPE_LINES = [
  { title: 'Mixed skills (25 questions)', subtitle: `~${DIAGNOSTIC_DURATION_MIN} min`, Icon: QuizOutlinedIcon },
  { title: 'Listening & Reading', subtitle: '', Icon: HeadphonesIcon },
  { title: 'HSK level estimate', subtitle: 'Instant', Icon: EmojiEventsIcon },
] as const;

/** Prep test intro — Diagnostic Test 01 → full diagnostic exam flow. */
export default function HSKPrepTestIntroPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const card = {
    bgcolor: '#FFFFFF',
    borderRadius: is960 ? '18px' : '22px',
    border: '1px solid rgba(15,23,42,0.06)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
    p: is960 ? 2 : 2.5,
  } as const;

  const sectionTitle = (text: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1.25 : 1.75 }}>
      <Box sx={{ width: 5, height: is960 ? 18 : 22, borderRadius: '999px', bgcolor: ACCENT }} />
      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827' }}>
        {text}
      </Typography>
    </Box>
  );

  const statItem = (icon: ReactNode, value: string | number, label: string, tint: string, tintBg: string) => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 1.2 : 1.6, px: is960 ? 1 : 1.75, py: 0.75 }}>
      <Box
        sx={{
          width: is960 ? 44 : 56,
          height: is960 ? 44 : 56,
          borderRadius: is960 ? '12px' : '16px',
          bgcolor: tintBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: tint,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.55rem' : '2rem', color: '#111827', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.95rem', color: '#4B5563', fontWeight: 700, lineHeight: 1.35, mt: 0.45 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ButtonBase
          onClick={() => navigate('/hsk-test')}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'white', border: '1px solid #E5E7EB', color: '#586E75', flexShrink: 0, '&:active': { bgcolor: '#F3F4F6' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.4rem' : '1.85rem', color: '#111827', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Test 01
            </Typography>
            <Box
              sx={{
                px: is960 ? 1.1 : 1.35,
                py: is960 ? 0.45 : 0.55,
                borderRadius: '10px',
                background: HEADER_BADGE_BG,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.76rem' : '0.92rem', color: '#FFFFFF', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                HSK Diagnostic Test
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 2.5 : 3.5, pt: is960 ? 0.5 : 1, pb: is960 ? 1 : 1.5 }}>
        <Box sx={{ ...card, display: 'flex', alignItems: 'stretch', p: is960 ? 1.75 : 2.5, mb: is960 ? 1.5 : 2 }}>
          {statItem(<AccessTimeIcon sx={{ fontSize: is960 ? 24 : 30 }} />, DIAGNOSTIC_DURATION_MIN, 'Duration · min', ACCENT, ACCENT_BG)}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<QuizOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, DIAGNOSTIC_QUESTIONS, 'Total questions', '#2563EB', '#EFF6FF')}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<WorkspacePremiumOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, DIAGNOSTIC_MAX_SCORE, 'Full score', '#CA8A04', '#FEF9C3')}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: is960 ? 1.5 : 2 }}>
          <Box sx={{ ...card, flex: 1.3, minWidth: 0, p: is960 ? 2 : 3 }}>
            {sectionTitle('Exam rules')}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.5 }}>
              {[
                'Stay focused and complete the test independently.',
                'Answer every question within the time limit — blank answers count as incorrect.',
                <>
                  When time is up, the system will <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>auto-submit</Box>.
                </>,
                'Your score estimates your current HSK level — manage time wisely.',
              ].map((rule, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: is960 ? 1.1 : 1.35, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: is960 ? 24 : 30,
                      height: is960 ? 24 : 30,
                      borderRadius: '9px',
                      bgcolor: ACCENT_BG,
                      color: ACCENT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.15,
                      fontWeight: 900,
                      fontSize: is960 ? '0.72rem' : '0.88rem',
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#374151', fontWeight: 600, lineHeight: 1.5 }}>
                    {rule}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ ...card, flex: 1, minWidth: 0, p: is960 ? 2 : 3 }}>
            {sectionTitle('What you get')}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
              {QUESTION_TYPE_LINES.map((line) => {
                const Icon = line.Icon;
                return (
                  <Box
                    key={line.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.35,
                      px: is960 ? 1.35 : 1.75,
                      py: is960 ? 1.15 : 1.4,
                      borderRadius: is960 ? '12px' : '16px',
                      bgcolor: '#F9FAFB',
                      border: '1px solid #F1F3F5',
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 38 : 48,
                        height: is960 ? 38 : 48,
                        borderRadius: '12px',
                        bgcolor: 'white',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: is960 ? 20 : 26 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#111827', fontWeight: 800, lineHeight: 1.3 }}>
                        {line.title}
                      </Typography>
                    </Box>
                    {line.subtitle && (
                      <Typography
                        sx={{
                          fontSize: is960 ? '0.82rem' : '0.95rem',
                          color: '#374151',
                          fontWeight: 800,
                          flexShrink: 0,
                          px: 1.15,
                          py: 0.5,
                          borderRadius: '10px',
                          bgcolor: 'white',
                          border: '1px solid #E5E7EB',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {line.subtitle}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Sticky confirm bar */}
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2.5 : 3.5,
          pb: is960 ? 2 : 2.5,
          pt: is960 ? 1.25 : 1.5,
          bgcolor: 'rgba(255,248,240,0.92)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(15,23,42,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
        }}
      >
        <ButtonBase
          onClick={() => setRulesAccepted((v) => !v)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            borderRadius: '10px',
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
            '&:active': { opacity: 0.85 },
          }}
        >
          {rulesAccepted ? (
            <CheckBoxIcon sx={{ fontSize: is960 ? 26 : 30, color: ACCENT }} />
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: is960 ? 26 : 30, color: '#9CA3AF' }} />
          )}
          <Typography sx={{ fontSize: is960 ? '0.88rem' : '1.02rem', color: '#374151', fontWeight: 700, textAlign: 'left', lineHeight: 1.4 }}>
            I have read and understand the exam rules
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={() => navigate('/hsk-mock-exam')}
          disabled={!rulesAccepted}
          sx={{
            minWidth: is960 ? 180 : 240,
            minHeight: is960 ? 52 : 60,
            px: 3,
            borderRadius: is960 ? '14px' : '16px',
            bgcolor: rulesAccepted ? ACCENT : '#E5E7EB',
            color: rulesAccepted ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 900,
            fontSize: is960 ? '1rem' : '1.15rem',
            letterSpacing: '0.02em',
            boxShadow: rulesAccepted ? '0 8px 20px rgba(190,18,60,0.35)' : 'none',
            transition: 'all 0.2s',
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
          }}
        >
          Start exam
        </ButtonBase>
      </Box>
    </Box>
  );
}
