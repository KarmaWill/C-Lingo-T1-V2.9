import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

export default function HSKTestPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

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
        {/* Diagnostic */}
        <ButtonBase
          onClick={() => navigate('/hsk-prep-test')}
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
              bgcolor: 'white',
              p: pad,
              borderRadius: cardRadius,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.25, flexShrink: 0 }}>
              <Box
                sx={{
                  width: is960 ? 44 : 52,
                  height: is960 ? 44 : 52,
                  borderRadius: '14px',
                  bgcolor: '#FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SearchIcon sx={{ color: '#E11D48', fontSize: is960 ? 26 : 30 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#1F2937', mb: 0.5 }}>
                  Diagnostic Test
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.8rem', color: '#6B7280', lineHeight: 1.4 }}>
                  Find your current level and weak points in 15 minutes.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 'auto', flexShrink: 0, pt: 1.25, borderTop: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: is960 ? 0.75 : 1, mb: 1 }}>
                <Typography
                  sx={{
                    display: 'inline-block',
                    bgcolor: '#FEE2E2',
                    color: '#B91C1C',
                    fontWeight: 800,
                    fontSize: is960 ? '0.55rem' : '0.65rem',
                    letterSpacing: '0.06em',
                    px: 1,
                    py: 0.35,
                    borderRadius: hardRadius,
                  }}
                >
                  HIGHLY RECOMMENDED
                </Typography>
                <Box
                  component="span"
                  sx={{
                    ml: { xs: 0, sm: 'auto' },
                    px: is960 ? 2 : 2.5,
                    py: is960 ? 0.85 : 1,
                    minHeight: is960 ? 44 : 48,
                    minWidth: is960 ? 88 : 100,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: hardRadius,
                    bgcolor: '#BE123C',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: is960 ? '0.9rem' : '1.05rem',
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                  }}
                >
                  Start
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: is960 ? 1 : 1.15,
                    py: is960 ? 0.45 : 0.55,
                    borderRadius: hardRadius,
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"SF Mono", "Roboto Mono", ui-monospace, monospace',
                      fontWeight: 800,
                      fontSize: is960 ? '0.6rem' : '0.7rem',
                      color: '#475569',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ~15 MIN
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: is960 ? '0.58rem' : '0.68rem',
                    color: '#64748B',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tap to begin
                </Typography>
              </Box>
            </Box>
          </Box>
        </ButtonBase>

        {/* Mock Exam — formal “exam hall” palette (navy + seal accent) */}
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
              position: 'relative',
              p: pad,
              borderRadius: cardRadius,
              background: 'linear-gradient(155deg, #0b1220 0%, #152238 42%, #1c2d4a 100%)',
              boxShadow: '0 14px 36px rgba(8, 15, 35, 0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #7f1d1d 0%, #b91c1c 35%, #991b1b 100%)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
                opacity: 0.45,
              },
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.25, flexShrink: 0, position: 'relative', zIndex: 1, pt: 0.5 }}>
              <Box
                sx={{
                  width: is960 ? 44 : 52,
                  height: is960 ? 44 : 52,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                <QuizIcon sx={{ color: '#e2e8f0', fontSize: is960 ? 26 : 30 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    display: 'inline-block',
                    fontWeight: 800,
                    fontSize: is960 ? '0.52rem' : '0.62rem',
                    letterSpacing: '0.14em',
                    color: '#cbd5e1',
                    mb: 0.75,
                    textTransform: 'uppercase',
                  }}
                >
                  Full simulation
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#f8fafc', mb: 0.5, letterSpacing: '-0.02em' }}>
                  Prep Training
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.8rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  Full HSK-style simulation with real exam conditions.
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 'auto',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: is960 ? 1 : 1.25,
                rowGap: 1,
                pt: is960 ? 1 : 1.25,
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: is960 ? 1 : 1.25,
                  flexShrink: 0,
                  minWidth: 'fit-content',
                  bgcolor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(226, 232, 240, 0.12)',
                  borderRadius: hardRadius,
                  px: is960 ? 1.75 : 2.25,
                  py: is960 ? 0.65 : 0.85,
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: '"SF Mono", "Roboto Mono", ui-monospace, monospace',
                    fontWeight: 800,
                    fontSize: is960 ? '0.68rem' : '0.8rem',
                    color: '#f1f5f9',
                    letterSpacing: '0.06em',
                  }}
                >
                  40 Q
                </Typography>
                <Box sx={{ width: 1, height: 16, flexShrink: 0, bgcolor: 'rgba(148, 163, 184, 0.35)' }} />
                <Typography
                  component="span"
                  sx={{
                    fontFamily: '"SF Mono", "Roboto Mono", ui-monospace, monospace',
                    fontWeight: 800,
                    fontSize: is960 ? '0.68rem' : '0.8rem',
                    color: '#cbd5e1',
                    letterSpacing: '0.04em',
                  }}
                >
                  35 MIN
                </Typography>
              </Box>
              <Box
                component="span"
                sx={{
                  ml: { xs: 0, sm: 'auto' },
                  flexShrink: 0,
                  px: is960 ? 1.5 : 1.75,
                  py: is960 ? 0.55 : 0.65,
                  borderRadius: hardRadius,
                  bgcolor: 'rgba(251, 191, 36, 0.18)',
                  border: '1px solid rgba(253, 224, 71, 0.45)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15) inset',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '0.68rem' : '0.82rem',
                    color: '#fef08a',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tap — prep test
                </Typography>
              </Box>
            </Box>
          </Box>
        </ButtonBase>

        {/* HSK Go Study — reference: purple→blue gradient, large radius, centered circular “Go” */}
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
            }}
          >
            <Box sx={{ display: 'flex', gap: is960 ? 1.75 : 2, flexShrink: 0, alignItems: 'flex-start' }}>
              <MenuBookOutlinedIcon
                sx={{
                  color: '#FFFFFF',
                  fontSize: is960 ? 36 : 44,
                  flexShrink: 0,
                  mt: 0.25,
                  opacity: 0.98,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.05rem' : '1.35rem',
                    color: '#FFFFFF',
                    mb: is960 ? 0.75 : 1,
                    lineHeight: 1.2,
                  }}
                >
                  HSK Go Study
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
                  Targeted practice for HSK topics and grammar points.
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: is960 ? 36 : 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pt: is960 ? 2 : 2.5,
                pb: is960 ? 0.25 : 0.5,
              }}
            >
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
                  fontWeight: 900,
                  fontSize: is960 ? '1.15rem' : '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                }}
              >
                Go
              </Box>
            </Box>
          </Box>
        </ButtonBase>

        {/* My Data */}
        <Box
          sx={{
            ...cardShell,
            bgcolor: 'white',
            p: pad,
            borderRadius: cardRadius,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: is960 ? 1 : 1.25,
              mb: 1.5,
              rowGap: 1,
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#1F2937' }}>
              My Data
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, flexShrink: 0, ml: { xs: 0, sm: 'auto' } }}>
              <ButtonBase
                onClick={() => navigate('/mistakes-review')}
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.75 : 1,
                  minHeight: 44,
                  borderRadius: hardRadius,
                  border: '1px solid rgba(0,0,0,0.12)',
                  bgcolor: '#F9FAFB',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: is960 ? '0.7rem' : '0.85rem',
                  '&:active': { bgcolor: '#F3F4F6' },
                }}
              >
                History
              </ButtonBase>
              <ButtonBase
                onClick={() => navigate('/profile')}
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.75 : 1,
                  minHeight: 44,
                  borderRadius: hardRadius,
                  bgcolor: '#7C3AED',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: is960 ? '0.7rem' : '0.85rem',
                  '&:active': { bgcolor: '#6D28D9' },
                }}
              >
                Level Settings
              </ButtonBase>
            </Box>
          </Box>

          <ButtonBase
            onClick={() => navigate('/study-report')}
            sx={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              borderRadius: hardRadius,
              overflow: 'hidden',
              alignItems: 'stretch',
              '&:active': { transform: 'scale(0.995)' },
            }}
          >
            <Box
              sx={{
                ...cardShell,
                flex: 1,
                minHeight: 0,
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.65rem', color: '#9CA3AF', fontWeight: 800, letterSpacing: '0.08em', mb: 0.5 }}>
                VOCABULARY
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : '1.5rem', color: '#1F2937', mb: 1 }}>
                124 / 150
              </Typography>
              <Box sx={{ height: is960 ? 8 : 10, bgcolor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', mb: 1.5, flexShrink: 0 }}>
                <Box sx={{ width: '82%', height: '100%', bgcolor: '#3B82F6', borderRadius: '999px' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', mt: 'auto', justifyContent: 'flex-end', minHeight: 36, flexShrink: 0 }}>
                {[16, 26, 18, 32, 22, 28].map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: is960 ? 8 : 10,
                      height: h,
                      bgcolor: '#BFDBFE',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </ButtonBase>

          <ButtonBase
            onClick={() => navigate('/study-report')}
            sx={{
              width: '100%',
              mt: 'auto',
              flexShrink: 0,
              minHeight: is960 ? 48 : 52,
              px: is960 ? 1.5 : 2,
              py: is960 ? 1 : 1.125,
              borderRadius: hardRadius,
              border: '1px solid #CBD5E1',
              bgcolor: '#F1F5F9',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: is960 ? '0.75rem' : '0.88rem',
              letterSpacing: '0.04em',
              justifyContent: 'center',
              '&:active': { bgcolor: '#E2E8F0' },
            }}
          >
            View full report
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}
