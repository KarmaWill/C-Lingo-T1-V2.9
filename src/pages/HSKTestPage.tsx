import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import type { ReactNode } from 'react';
import HubScoreBadge from '../components/HubScoreBadge';
import { loadDiagnosticBestScore, DIAGNOSTIC_PASS_LINE } from '../hsk/diagnosticScore';
import { loadSpeakingLatestScore, SPEAKING_PASS_LINE } from '../hsk/speakingScore';
function CardMetaBadge({
  children,
  is960,
  tone = 'neutral',
}: {
  children: ReactNode;
  is960: boolean;
  tone?: 'rose' | 'violet' | 'neutral';
}) {
  const tones = {
    rose: { bg: '#FEE2E2', color: '#BE123C' },
    violet: { bg: '#EDE9FE', color: '#6D28D9' },
    neutral: { bg: '#F3F4F6', color: '#6B7280' },
  };
  const t = tones[tone];
  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: t.bg,
        color: t.color,
        fontWeight: 800,
        fontSize: is960 ? '0.68rem' : '0.78rem',
        letterSpacing: '0.02em',
        px: is960 ? 1 : 1.15,
        py: is960 ? 0.45 : 0.5,
        borderRadius: is960 ? '8px' : '10px',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Typography>
  );
}

function GlassTag({ children, is960 }: { children: ReactNode; is960: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: is960 ? 1.1 : 1.35,
        py: is960 ? 0.45 : 0.55,
        borderRadius: '999px',
        bgcolor: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.38)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: is960 ? '0.72rem' : '0.84rem',
        letterSpacing: '0.03em',
        lineHeight: 1.2,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
    >
      {children}
    </Box>
  );
}

export default function HSKTestPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';
  const [diagnosticScore, setDiagnosticScore] = useState<number | undefined>(() => loadDiagnosticBestScore());
  const [speakingScore, setSpeakingScore] = useState<number | undefined>(() => loadSpeakingLatestScore());

  useEffect(() => {
    const refreshScores = () => {
      setDiagnosticScore(loadDiagnosticBestScore());
      setSpeakingScore(loadSpeakingLatestScore());
    };
    refreshScores();
    window.addEventListener('focus', refreshScores);
    return () => window.removeEventListener('focus', refreshScores);
  }, []);

  const cardRadius = is960 ? '16px' : '22px';
  /** 小圆角按钮 / 标签，与卡片大圆角区分，偏硬朗 */
  const hardRadius = is960 ? '8px' : '10px';
  const pad = is960 ? 1.5 : 2.25;
  const goStudyPad = is960 ? 2.5 : 4;
  const gap = is960 ? 1.5 : 2;

  const cardShell = {
    height: '100%',
    minHeight: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as const;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFF8F0',
        px: is960 ? 2 : is1920x1125 ? 4 : 3,
        pt: is960 ? 2 : is1920x1125 ? 4 : 3,
        /* 与底栏区保留一点呼吸距（主布局已预留 bottomNav 高度） */
        pb: is960 ? 1.5 : 2,
        boxSizing: 'border-box',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gridTemplateRows: { xs: 'repeat(4, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
          gap,
          alignItems: 'stretch',
        }}
      >
        {/* Diagnostic + AI Speaking Rater — two 1:1 tiles */}
        <Box
          sx={{
            ...cardShell,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: is960 ? 1 : 1.25,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              height: '100%',
              minHeight: 0,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'white',
                p: pad,
                borderRadius: cardRadius,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', gap: is960 ? 1 : 1.25, alignItems: 'center', flexShrink: 0, minHeight: is960 ? 50 : 62 }}>
                <HubScoreBadge score={diagnosticScore} is960={is960} passLine={DIAGNOSTIC_PASS_LINE} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.28rem', color: '#1F2937', lineHeight: 1.2 }}>
                    Diagnostic Test
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 'auto', pt: 1.25, width: '100%' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  <CardMetaBadge is960={is960} tone="rose">
                    25 Questions · 25 Min
                  </CardMetaBadge>
                </Box>
                <ButtonBase
                  onClick={() => navigate('/hsk-prep-test')}
                  sx={{
                    width: '100%',
                    minHeight: is960 ? 44 : 48,
                    borderRadius: hardRadius,
                    bgcolor: '#BE123C',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: is960 ? '0.85rem' : '0.95rem',
                    letterSpacing: '0.04em',
                    justifyContent: 'center',
                    '&:active': { bgcolor: '#9F1239' },
                  }}
                >
                  Enter
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              height: '100%',
              minHeight: 0,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'white',
                p: pad,
                borderRadius: cardRadius,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', gap: is960 ? 1 : 1.25, alignItems: 'center', flexShrink: 0, minHeight: is960 ? 50 : 62 }}>
                <HubScoreBadge score={speakingScore} is960={is960} passLine={SPEAKING_PASS_LINE} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.28rem', color: '#1F2937', lineHeight: 1.2 }}>
                    AI Speaking Rater
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 'auto', pt: 1.25, width: '100%' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  <CardMetaBadge is960={is960} tone="violet">
                    AI Feedback
                  </CardMetaBadge>
                </Box>
                <ButtonBase
                  onClick={() => navigate('/hsk-oral-review')}
                  sx={{
                    width: '100%',
                    minHeight: is960 ? 44 : 48,
                    borderRadius: hardRadius,
                    bgcolor: '#6D28D9',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: is960 ? '0.85rem' : '0.95rem',
                    letterSpacing: '0.04em',
                    justifyContent: 'center',
                    '&:active': { bgcolor: '#5B21B6' },
                  }}
                >
                  Enter
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Mock Exam — single premium entrance → level & paper selection */}
        <ButtonBase
          onClick={() => navigate('/hsk-prep-training')}
          sx={{
            ...cardShell,
            textAlign: 'left',
            borderRadius: cardRadius,
            overflow: 'hidden',
            alignItems: 'stretch',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              ...cardShell,
              p: goStudyPad,
              borderRadius: cardRadius,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 16px 40px rgba(217, 119, 6, 0.38)',
              justifyContent: 'space-between',
              position: 'relative',
              isolation: 'isolate',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: is960 ? -34 : -46,
                right: is960 ? -26 : -34,
                width: is960 ? 110 : 148,
                height: is960 ? 110 : 148,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.16)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: is960 ? 16 : 24,
                bottom: is960 ? 18 : 24,
                width: is960 ? 92 : 124,
                height: is960 ? 54 : 68,
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.22)',
                transform: 'rotate(-12deg)',
                zIndex: 0,
              }}
            />
            <Box sx={{ display: 'flex', gap: is960 ? 1.75 : 2, flexShrink: 0, alignItems: 'flex-start' }}>
              <EmojiEventsIcon
                sx={{
                  color: '#FFFFFF',
                  fontSize: is960 ? 36 : 44,
                  flexShrink: 0,
                  mt: 0.25,
                  opacity: 0.98,
                  zIndex: 1,
                }}
              />
              <Box sx={{ minWidth: 0, zIndex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.05rem' : '1.35rem',
                    color: '#FFFFFF',
                    mb: is960 ? 0.75 : 1,
                    lineHeight: 1.2,
                  }}
                >
                  Mock Exam
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.75rem' : '0.95rem',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    lineHeight: 1.45,
                    opacity: 0.95,
                  }}
                >
                  Authentic HSK exam environment simulation.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: is960 ? 36 : 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: is960 ? 1.25 : 1.5,
                pt: is960 ? 1.5 : 2,
                pb: is960 ? 0.25 : 0.5,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, minWidth: 0 }}>
                <GlassTag is960={is960}>HSK 1–9</GlassTag>
                <GlassTag is960={is960}>Official & C-Lingo</GlassTag>
              </Box>
              <Box
                component="span"
                sx={{
                  width: is960 ? 56 : 64,
                  height: is960 ? 56 : 64,
                  minWidth: is960 ? 56 : 64,
                  minHeight: is960 ? 56 : 64,
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: is960 ? 26 : 30 }} />
              </Box>
            </Box>
          </Box>
        </ButtonBase>

        {/* Grammar Study — grammar-point training, opens a learning path map */}
        <ButtonBase
          onClick={() => navigate('/hsk-go-study')}
          sx={{
            ...cardShell,
            textAlign: 'left',
            borderRadius: cardRadius,
            overflow: 'hidden',
            alignItems: 'stretch',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              ...cardShell,
              p: goStudyPad,
              borderRadius: cardRadius,
              background: 'linear-gradient(135deg, #7B42F6 0%, #3B59F6 100%)',
              boxShadow: '0 16px 40px rgba(59, 89, 246, 0.38)',
              justifyContent: 'space-between',
              position: 'relative',
              isolation: 'isolate',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: is960 ? -34 : -46,
                right: is960 ? -26 : -34,
                width: is960 ? 110 : 148,
                height: is960 ? 110 : 148,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.14)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: is960 ? 16 : 24,
                bottom: is960 ? 18 : 24,
                width: is960 ? 92 : 124,
                height: is960 ? 54 : 68,
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.22)',
                transform: 'rotate(-12deg)',
                zIndex: 0,
              }}
            />
            <Box sx={{ display: 'flex', gap: is960 ? 1.75 : 2, flexShrink: 0, alignItems: 'flex-start' }}>
              <MenuBookOutlinedIcon
                sx={{
                  color: '#FFFFFF',
                  fontSize: is960 ? 36 : 44,
                  flexShrink: 0,
                  mt: 0.25,
                  opacity: 0.98,
                  zIndex: 1,
                }}
              />
              <Box sx={{ minWidth: 0, zIndex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.05rem' : '1.35rem',
                    color: '#FFFFFF',
                    mb: is960 ? 0.75 : 1,
                    lineHeight: 1.2,
                  }}
                >
                  Grammar Snap
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.75rem' : '0.95rem',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    lineHeight: 1.45,
                    opacity: 0.95,
                  }}
                >
                  Step-by-step grammar study path.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: is960 ? 36 : 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: is960 ? 1.25 : 1.5,
                pt: is960 ? 1.5 : 2,
                pb: is960 ? 0.25 : 0.5,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, minWidth: 0 }}>
                <GlassTag is960={is960}>HSK 1–6</GlassTag>
                <GlassTag is960={is960}>Grammar</GlassTag>
              </Box>
              <Box
                component="span"
                sx={{
                  width: is960 ? 56 : 64,
                  height: is960 ? 56 : 64,
                  minWidth: is960 ? 56 : 64,
                  minHeight: is960 ? 56 : 64,
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  color: '#3B59F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: is960 ? 26 : 30 }} />
              </Box>
            </Box>
          </Box>
        </ButtonBase>

        {/* Specialized drills — single premium entrance → drill-type selection */}
        <ButtonBase
          onClick={() => navigate('/hsk-skill-drill')}
          sx={{
            ...cardShell,
            textAlign: 'left',
            borderRadius: cardRadius,
            overflow: 'hidden',
            alignItems: 'stretch',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              ...cardShell,
              p: goStudyPad,
              borderRadius: cardRadius,
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              boxShadow: '0 16px 40px rgba(4, 120, 87, 0.36)',
              justifyContent: 'space-between',
              position: 'relative',
              isolation: 'isolate',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: is960 ? -34 : -46,
                right: is960 ? -26 : -34,
                width: is960 ? 110 : 148,
                height: is960 ? 110 : 148,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.14)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: is960 ? 16 : 24,
                bottom: is960 ? 18 : 24,
                width: is960 ? 92 : 124,
                height: is960 ? 54 : 68,
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.22)',
                transform: 'rotate(-12deg)',
                zIndex: 0,
              }}
            />
            <Box sx={{ display: 'flex', gap: is960 ? 1.75 : 2, flexShrink: 0, alignItems: 'flex-start' }}>
              <TuneIcon
                sx={{
                  color: '#FFFFFF',
                  fontSize: is960 ? 36 : 44,
                  flexShrink: 0,
                  mt: 0.25,
                  opacity: 0.98,
                  zIndex: 1,
                }}
              />
              <Box sx={{ minWidth: 0, zIndex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.05rem' : '1.35rem',
                    color: '#FFFFFF',
                    mb: is960 ? 0.75 : 1,
                    lineHeight: 1.2,
                  }}
                >
                  Specialized drills
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.75rem' : '0.95rem',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    lineHeight: 1.45,
                    opacity: 0.95,
                  }}
                >
                  Listening, Reading, Writing
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: is960 ? 36 : 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: is960 ? 1.25 : 1.5,
                pt: is960 ? 1.5 : 2,
                pb: is960 ? 0.25 : 0.5,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, minWidth: 0 }}>
                <GlassTag is960={is960}>HSK 1–9</GlassTag>
                <GlassTag is960={is960}>19 Question Types</GlassTag>
              </Box>
              <Box
                component="span"
                sx={{
                  width: is960 ? 56 : 64,
                  height: is960 ? 56 : 64,
                  minWidth: is960 ? 56 : 64,
                  minHeight: is960 ? 56 : 64,
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: is960 ? 26 : 30 }} />
              </Box>
            </Box>
          </Box>
        </ButtonBase>
      </Box>
    </Box>
  );
}
