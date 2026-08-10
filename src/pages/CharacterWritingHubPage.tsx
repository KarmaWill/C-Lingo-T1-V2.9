import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { resolveBackPath } from '../utils/navigateBack';
import { WRITING_MODULES } from '../data/characterWritingCourse';

const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';

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
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: `
          radial-gradient(ellipse 90% 70% at 8% 0%, rgba(45, 158, 143, 0.14) 0%, transparent 55%),
          radial-gradient(ellipse 70% 55% at 100% 15%, rgba(180, 83, 9, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #F7F8F5 0%, #EEF1EC 48%, #E8ECE6 100%)
        `,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1 : 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            minWidth: 48,
            minHeight: 48,
            borderRadius: '16px',
            bgcolor: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(15,23,42,0.08)',
            color: '#1E293B',
            boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
            '&:active': { bgcolor: '#F1F5F9' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: is960 ? '1.05rem' : is1920x1125 ? '1.55rem' : '1.28rem',
              color: '#0F172A',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
            }}
          >
            Character Writing
          </Typography>
          <Typography
            sx={{
              mt: 0.3,
              fontSize: is960 ? '0.68rem' : '0.76rem',
              fontWeight: 600,
              color: '#64748B',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Strokes · Radicals · Structure
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: is960 ? 2 : 3,
          pb: is960 ? 2 : 3,
          display: 'grid',
          gridTemplateColumns: is960 ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: is960 ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)',
          gap: is960 ? 1.1 : 1.75,
          position: 'relative',
        }}
      >
        {!is960 && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: is1920x1125 ? 56 : 48,
              left: '16.5%',
              right: '16.5%',
              height: 2,
              background:
                'linear-gradient(90deg, rgba(29,107,99,0.35) 0%, rgba(15,118,110,0.28) 50%, rgba(180,83,9,0.3) 100%)',
              borderRadius: 99,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}

        {WRITING_MODULES.map((module, index) => (
          <ButtonBase
            key={module.id}
            onClick={() =>
              navigate(`/character-writing/${module.id}`, {
                state: { from: '/character-writing', ...(location.state as object) },
              })
            }
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '100%',
              minHeight: 0,
              textAlign: 'left',
              borderRadius: is960 ? '18px' : is1920x1125 ? '28px' : '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              bgcolor: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(255,255,255,0.95)',
              boxShadow: '0 10px 32px rgba(15,23,42,0.06)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
              '&:hover': {
                transform: is960 ? 'none' : 'translateY(-2px)',
                boxShadow: `0 18px 40px ${module.color}22`,
                borderColor: `${module.color}40`,
              },
              '&:active': { transform: 'scale(0.985)' },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(165deg, ${module.color}12 0%, transparent 42%),
                  linear-gradient(0deg, rgba(255,255,255,0.35) 0%, transparent 35%)
                `,
                pointerEvents: 'none',
              }}
            />

            <Box
              sx={{
                position: 'relative',
                flex: 1,
                minHeight: 0,
                p: is960 ? 1.35 : 2.1,
                display: 'flex',
                flexDirection: 'column',
                gap: is960 ? 0.85 : 1.2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: is960 ? 26 : 32,
                      height: is960 ? 26 : 32,
                      borderRadius: '50%',
                      bgcolor: module.color,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: is960 ? '0.74rem' : '0.84rem',
                      boxShadow: `0 6px 14px ${module.color}40`,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.64rem' : '0.74rem',
                      fontWeight: 800,
                      color: module.color,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {module.stepLabel}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 700, color: '#94A3B8' }}>
                  {module.itemCount} lessons
                </Typography>
              </Box>

              {/* 田字格必须正方形（汉字书写硬规则），禁止用 flex 拉高 */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: is960 ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: is960 ? 'flex-start' : 'center',
                  gap: is960 ? 1.25 : 1.1,
                }}
              >
                <Box
                  sx={{
                    flex: '0 0 auto',
                    flexGrow: 0,
                    flexShrink: 0,
                    width: is960 ? 72 : is1920x1125 ? 240 : 200,
                    height: is960 ? 72 : is1920x1125 ? 240 : 200,
                    aspectRatio: '1 / 1',
                    boxSizing: 'border-box',
                    borderRadius: is960 ? '16px' : '22px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.92) 100%)',
                    border: `1px solid ${module.color}28`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.8), 0 8px 20px ${module.color}12`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '50%',
                      top: '12%',
                      bottom: '12%',
                      width: '1px',
                      transform: 'translateX(-50%)',
                      bgcolor: `${module.color}22`,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '12%',
                      right: '12%',
                      height: '1px',
                      transform: 'translateY(-50%)',
                      bgcolor: `${module.color}22`,
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
                      fontSize: is960 ? '2.1rem' : is1920x1125 ? '5.2rem' : '4rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      fontFamily: KAI_TI,
                      zIndex: 1,
                      lineHeight: 1,
                    }}
                  >
                    {module.previewChar}
                  </Typography>
                </Box>

                <Box sx={{ flex: is960 ? 1 : '0 0 auto', minWidth: 0, textAlign: is960 ? 'left' : 'center' }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '1.05rem' : is1920x1125 ? '1.55rem' : '1.35rem',
                      color: '#0F172A',
                      lineHeight: 1.15,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: is960 ? '0.72rem' : '0.86rem',
                      color: '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    {module.subtitle}
                  </Typography>
                  <Typography
                    sx={{
                      mt: is960 ? 0.45 : 0.65,
                      fontSize: is960 ? '0.7rem' : '0.84rem',
                      color: '#475569',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {module.description}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: is960 ? 44 : 52,
                  px: is960 ? 1.3 : 1.55,
                  borderRadius: is960 ? '14px' : '16px',
                  background: module.gradient,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 18px ${module.color}30`,
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.84rem' : '0.95rem', letterSpacing: '0.01em' }}>
                  Start path
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              </Box>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}
