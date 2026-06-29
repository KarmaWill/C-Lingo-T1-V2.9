import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { getSkillDrillMeta, HSK_SKILL_DRILLS } from '../hsk/hskSkillDrills';

function sectionLabelFor(section: 'listening' | 'reading') {
  return section === 'listening' ? 'Listening' : 'Reading';
}

export default function HSKSkillDrillPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const meta = getSkillDrillMeta(type);

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';
  const headerPadX = is960 ? 1.75 : is1920x1125 ? 2.5 : 2.25;
  const headerPadY = is960 ? 1 : is1920x1125 ? 1.35 : 1.25;
  const backBtnSize = is960 ? 44 : 48;

  const sectionColor = meta?.section === 'listening' ? '#0369A1' : '#047857';
  const sectionLabel = meta?.section === 'listening' ? 'Listening' : 'Reading';

  const drillHeaderSx = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: is960 ? 1.25 : 1.5,
    px: headerPadX,
    py: headerPadY,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    bgcolor: 'rgba(255,255,255,0.92)',
    boxSizing: 'border-box' as const,
    minHeight: backBtnSize + headerPadY * 2,
  };

  const drillBackBtnSx = {
    width: backBtnSize,
    height: backBtnSize,
    minWidth: backBtnSize,
    minHeight: backBtnSize,
    borderRadius: '50%',
    bgcolor: 'rgba(0,0,0,0.05)',
    color: '#374151',
    flexShrink: 0,
    '&:active': { bgcolor: 'rgba(0,0,0,0.1)' },
  };

  // 无 type 参数：展示题型选择页
  if (!type) {
    return (
      <Box sx={{ height: '100%', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden', boxSizing: 'border-box' }}>
        <Box sx={drillHeaderSx}>
          <ButtonBase
            onClick={() => navigate('/hsk-test')}
            sx={drillBackBtnSx}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : 24 }} />
          </ButtonBase>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.28rem', color: '#111827', lineHeight: 1.2 }}>
              Specialized drills
            </Typography>
            <Typography noWrap sx={{ fontSize: is960 ? '0.72rem' : '0.85rem', color: '#64748B', mt: 0.25, fontWeight: 600 }}>
              Pick a question type to practice
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: is960 ? 2 : 3, boxSizing: 'border-box' }}>
          <Box
            sx={{
              maxWidth: 960,
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: is960 ? 1.5 : 2,
            }}
          >
            {HSK_SKILL_DRILLS.map((drill) => {
              const accent = drill.section === 'listening' ? '#0369A1' : '#047857';
              const tintBg = drill.section === 'listening' ? 'rgba(3,105,161,0.08)' : 'rgba(4,120,87,0.08)';
              const Icon = drill.section === 'listening' ? HeadphonesIcon : MenuBookIcon;
              return (
                <ButtonBase
                  key={drill.id}
                  onClick={() => setSearchParams({ type: drill.id })}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 1.5 : 2,
                    p: is960 ? 1.75 : 2.25,
                    borderRadius: is960 ? '16px' : '20px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
                    textAlign: 'left',
                    '&:active': { transform: 'scale(0.99)', bgcolor: '#FAFAFA' },
                  }}
                >
                  <Box
                    sx={{
                      width: is960 ? 48 : 56,
                      height: is960 ? 48 : 56,
                      borderRadius: is960 ? '14px' : '16px',
                      bgcolor: tintBg,
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: is960 ? 26 : 30 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.08rem', color: '#111827', lineHeight: 1.25, mb: 0.35 }}>
                      {drill.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: is960 ? '0.6rem' : '0.68rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: accent,
                      }}
                    >
                      {sectionLabelFor(drill.section)} · {drill.levelsHint}
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ fontSize: is960 ? 20 : 22, color: '#9CA3AF', flexShrink: 0 }} />
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFF8F0',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={drillHeaderSx}>
        <ButtonBase
          onClick={() => setSearchParams({})}
          sx={drillBackBtnSx}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 900,
              fontSize: is960 ? '1.05rem' : is1920x1125 ? '1.45rem' : '1.28rem',
              color: '#111827',
              lineHeight: 1.2,
            }}
          >
            {meta ? meta.title : 'Specialized drill'}
          </Typography>
          {meta && (
            <Typography noWrap sx={{ fontSize: is960 ? '0.7rem' : '0.8rem', color: '#64748B', mt: 0.25, fontWeight: 600 }}>
              Typical levels: {meta.levelsHint}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: is960 ? 2 : 3, boxSizing: 'border-box' }}>
        {meta ? (
          <Box
            sx={{
              maxWidth: 720,
              mx: 'auto',
              bgcolor: '#fff',
              borderRadius: is960 ? '16px' : '22px',
              p: is960 ? 2.25 : 3,
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
            }}
          >
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                fontWeight: 800,
                fontSize: is960 ? '0.58rem' : '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: sectionColor,
                bgcolor: meta.section === 'listening' ? 'rgba(3, 105, 161, 0.08)' : 'rgba(4, 120, 87, 0.08)',
                px: 1.25,
                py: 0.45,
                borderRadius: '8px',
                mb: 1.5,
              }}
            >
              {sectionLabel}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#334155', lineHeight: 1.55, fontWeight: 500, mb: 2 }}>
              {meta.description}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Question sets for this format will plug in here (same taxonomy as the HSK mock product spec). For now this
              screen confirms the correct drill type from the hub.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Typography sx={{ fontWeight: 800, color: '#1F2937', mb: 1, fontSize: is960 ? '1rem' : '1.2rem' }}>
              Unknown drill type
            </Typography>
            <Typography sx={{ color: '#64748B', mb: 2, fontSize: is960 ? '0.85rem' : '0.95rem' }}>
              Go back to HSK Test and pick one of the six specialized entrances.
            </Typography>
            <ButtonBase
              onClick={() => navigate('/hsk-test')}
              sx={{
                px: 3,
                py: 1.25,
                minHeight: 48,
                borderRadius: '12px',
                bgcolor: '#0F172A',
                color: '#fff',
                fontWeight: 800,
                fontSize: is960 ? '0.85rem' : '0.95rem',
                '&:active': { bgcolor: '#1E293B' },
              }}
            >
              Open HSK Test
            </ButtonBase>
          </Box>
        )}
      </Box>
    </Box>
  );
}
