import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { resolveBackPath } from '../utils/navigateBack';
import { WRITING_MODULES } from '../data/characterWritingCourse';

export default function CharacterWritingHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#F4F6FA',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
          bgcolor: 'white',
          borderBottom: '1px solid #E8ECF2',
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            color: '#334155',
            '&:active': { bgcolor: '#E2E8F0' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#0F172A', lineHeight: 1.2 }}>
            Character Writing
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#64748B', mt: 0.25 }}>
            Strokes · Radicals · Structure
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: is960 ? 2 : 3,
        }}
      >
        <Box
          sx={{
            mb: is960 ? 1.5 : 2,
            px: is960 ? 0.25 : 0.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: is960 ? '0.92rem' : '1.05rem',
              color: '#1E293B',
              letterSpacing: '-0.02em',
            }}
          >
            Build characters with confidence
          </Typography>
          <Typography sx={{ mt: 0.45, fontSize: is960 ? '0.78rem' : '0.86rem', color: '#64748B', lineHeight: 1.45 }}>
            Follow the path from strokes to radicals, then full character structure.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: is960 ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: is960 ? 1.15 : 1.5,
            alignContent: 'start',
          }}
        >
          {WRITING_MODULES.map((module, index) => (
            <ButtonBase
              key={module.id}
              onClick={() =>
                navigate(`/character-writing/${module.id}`, {
                  state: { from: '/character-writing', ...(location.state as object) },
                })
              }
              sx={{
                width: '100%',
                textAlign: 'left',
                borderRadius: is1920x1125 ? '26px' : '22px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                boxShadow: '0 8px 28px rgba(15,23,42,0.05)',
                transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                '&:hover': {
                  boxShadow: `0 14px 36px ${module.color}18`,
                },
                '&:active': { transform: 'scale(0.985)' },
              }}
            >
              <Box sx={{ height: 4, bgcolor: module.color }} />

              <Box sx={{ p: is960 ? 1.65 : 2, display: 'flex', flexDirection: 'column', gap: is960 ? 1.15 : 1.35, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box
                    sx={{
                      px: is960 ? 0.85 : 1,
                      py: 0.35,
                      borderRadius: '999px',
                      bgcolor: `${module.color}14`,
                      border: `1px solid ${module.color}28`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.62rem' : '0.68rem',
                        fontWeight: 800,
                        color: module.color,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Step {index + 1} · {module.stepLabel}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', fontWeight: 700, color: '#94A3B8' }}>
                    {module.itemCount} lessons
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.25 : 1.5 }}>
                  <Box
                    sx={{
                      width: is960 ? 72 : 84,
                      height: is960 ? 72 : 84,
                      borderRadius: is960 ? '16px' : '18px',
                      bgcolor: '#FAFBFF',
                      border: `1.5px solid ${module.color}30`,
                      position: 'relative',
                      flexShrink: 0,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        top: '10%',
                        bottom: '10%',
                        width: '1px',
                        transform: 'translateX(-50%)',
                        bgcolor: `${module.color}18`,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '10%',
                        right: '10%',
                        height: '1px',
                        transform: 'translateY(-50%)',
                        bgcolor: `${module.color}18`,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: is960 ? '2rem' : '2.35rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        fontFamily: '"KaiTi","STKaiti","SimKai",serif',
                        zIndex: 1,
                      }}
                    >
                      {module.previewChar}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: is960 ? '1.08rem' : '1.22rem',
                        color: '#0F172A',
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {module.title}
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: is960 ? '0.78rem' : '0.84rem', color: '#64748B', fontWeight: 650 }}>
                      {module.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: is960 ? '0.76rem' : '0.84rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    minHeight: is960 ? 36 : 40,
                  }}
                >
                  {module.description}
                </Typography>

                <Box
                  sx={{
                    mt: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 0.65,
                    minHeight: 44,
                    px: is960 ? 1.35 : 1.55,
                    borderRadius: '999px',
                    bgcolor: `${module.color}10`,
                    border: `1.5px solid ${module.color}35`,
                    color: module.color,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.82rem' : '0.88rem' }}>Start</Typography>
                  <ArrowForwardIcon sx={{ fontSize: is960 ? 17 : 18 }} />
                </Box>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
