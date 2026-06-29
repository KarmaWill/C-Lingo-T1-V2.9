import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GestureIcon from '@mui/icons-material/Gesture';
import CategoryIcon from '@mui/icons-material/Category';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { resolveBackPath } from '../utils/navigateBack';
import { WRITING_MODULES, type WritingModuleId } from '../data/characterWritingCourse';

const MODULE_ICONS: Record<WritingModuleId, typeof GestureIcon> = {
  strokes: GestureIcon,
  radicals: CategoryIcon,
  structure: ViewModuleIcon,
};

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
        bgcolor: '#FFF8F0',
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
          borderBottom: '1px solid #F1F3F5',
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.05)',
            color: '#374151',
            '&:active': { bgcolor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827', lineHeight: 1.2 }}>
            Character Writing
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>
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
          display: 'grid',
          gridTemplateColumns: is960 ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: is960 ? 1.25 : 1.75,
          alignContent: 'start',
        }}
      >
        {WRITING_MODULES.map((module) => {
          const Icon = MODULE_ICONS[module.id];
          return (
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
                borderRadius: is1920x1125 ? '28px' : '24px',
                p: is960 ? 2 : 2.5,
                minHeight: is960 ? 148 : 176,
                background: module.gradient,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                boxShadow: `0 14px 36px ${module.color}33`,
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.985)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: is960 ? 48 : 56,
                    height: is960 ? 48 : 56,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: is960 ? 26 : 30 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.72rem' : '0.8rem', color: 'rgba(255,255,255,0.88)' }}>
                  {module.itemCount} lessons
                </Typography>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.15rem' : '1.35rem', lineHeight: 1.15, mb: 0.35 }}>
                  {module.title}
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: 'rgba(255,255,255,0.82)', mb: 0.75 }}>
                  {module.subtitle}
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.84rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.45 }}>
                  {module.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.82rem' : '0.9rem' }}>Start</Typography>
                <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
