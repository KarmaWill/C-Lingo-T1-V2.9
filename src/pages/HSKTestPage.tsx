import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { HSK_SKILL_DRILLS } from '../hsk/hskSkillDrills';

const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;

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
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', flexShrink: 0 }}>
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
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '1.02rem', color: '#1F2937', mb: 0.5, lineHeight: 1.25 }}>
                    Diagnostic Test
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>
                    25 Questions | 25 Min
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 'auto', pt: 1.25, width: '100%' }}>
                <Typography
                  sx={{
                    display: 'inline-block',
                    mb: 1,
                    bgcolor: '#FEE2E2',
                    color: '#B91C1C',
                    fontWeight: 800,
                    fontSize: is960 ? '0.5rem' : '0.58rem',
                    letterSpacing: '0.06em',
                    px: 1,
                    py: 0.35,
                    borderRadius: hardRadius,
                  }}
                >
                  HIGHLY RECOMMENDED
                </Typography>
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
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: is960 ? 44 : 52,
                    height: is960 ? 44 : 52,
                    borderRadius: '14px',
                    bgcolor: 'rgba(124, 58, 237, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MicIcon sx={{ color: '#6D28D9', fontSize: is960 ? 26 : 30 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '1.02rem', color: '#1F2937', mb: 0.5, lineHeight: 1.25 }}>
                    AI Speaking Rater
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>
                    Pronunciation & fluency feedback
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 'auto', pt: 1.25, width: '100%' }}>
                <Typography
                  sx={{
                    display: 'inline-block',
                    mb: 1,
                    bgcolor: 'rgba(245, 158, 11, 0.2)',
                    color: '#B45309',
                    fontWeight: 800,
                    fontSize: is960 ? '0.5rem' : '0.58rem',
                    letterSpacing: '0.06em',
                    px: 1,
                    py: 0.35,
                    borderRadius: hardRadius,
                  }}
                >
                  USES CREDITS
                </Typography>
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

        {/* Mock Exam — one entrance per HSK level (2×3) */}
        <Box
          sx={{
            ...cardShell,
            bgcolor: 'white',
            p: pad,
            borderRadius: cardRadius,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
            textAlign: 'left',
            minHeight: 0,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1, flexShrink: 0, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: is960 ? 44 : 52,
                height: is960 ? 44 : 52,
                borderRadius: '14px',
                bgcolor: '#FEF9C3',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <EmojiEventsIcon sx={{ color: '#CA8A04', fontSize: is960 ? 26 : 30 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#111827', mb: 0.5 }}>
                Mock Exam
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.8rem', color: '#6B7280', lineHeight: 1.45 }}>
                Full HSK-style simulation with real exam conditions.
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gridAutoRows: 'minmax(0, 1fr)',
              gap: is960 ? 1 : 1.25,
              pt: 0.5,
            }}
          >
            {HSK_LEVELS.map((lvl) => (
              <ButtonBase
                key={lvl}
                onClick={() => navigate(`/hsk-prep-training?level=${lvl}`)}
                sx={{
                  minHeight: is960 ? 48 : 52,
                  borderRadius: hardRadius,
                  border: '1px solid #E5E7EB',
                  bgcolor: '#FFFFFF',
                  color: '#111827',
                  fontWeight: 800,
                  fontSize: is960 ? '0.82rem' : '0.95rem',
                  letterSpacing: '-0.01em',
                  justifyContent: 'center',
                  '&:active': { transform: 'scale(0.98)', bgcolor: '#F9FAFB' },
                }}
              >
                HSK {lvl}
              </ButtonBase>
            ))}
          </Box>
        </Box>

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

        {/* Specialized drills — six HSK mock question-type entrances (design doc §第二步) */}
        <Box
          sx={{
            ...cardShell,
            bgcolor: 'white',
            p: pad,
            borderRadius: cardRadius,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
            textAlign: 'left',
            minHeight: 0,
          }}
        >
          <Box sx={{ mb: 1, flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#1F2937' }}>
              Specialized drills
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gridAutoRows: 'minmax(0, 1fr)',
              gap: is960 ? 1 : 1.25,
              pt: 0.5,
            }}
          >
            {HSK_SKILL_DRILLS.map((drill) => {
              const accent = drill.section === 'listening' ? '#0369A1' : '#047857';
              return (
                <ButtonBase
                  key={drill.id}
                  onClick={() => navigate(`/hsk-skill-drill?type=${drill.id}`)}
                  sx={{
                    minHeight: is960 ? 56 : 60,
                    borderRadius: hardRadius,
                    border: '1px solid #E5E7EB',
                    bgcolor: '#FFFFFF',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 0.35,
                    px: 0.75,
                    py: 0.75,
                    '&:active': { transform: 'scale(0.98)', bgcolor: '#F9FAFB' },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '0.68rem' : '0.78rem',
                      color: '#111827',
                      lineHeight: 1.25,
                      textAlign: 'center',
                    }}
                  >
                    {drill.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: is960 ? '0.5rem' : '0.55rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: accent,
                      textAlign: 'center',
                    }}
                  >
                    {drill.section === 'listening' ? 'Listening' : 'Reading'} · {drill.levelsHint}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
