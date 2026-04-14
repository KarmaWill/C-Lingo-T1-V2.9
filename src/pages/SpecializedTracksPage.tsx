import { Box, Typography, ButtonBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SCALE = 0.75; // 整体 75% 缩放
const DESIGN_W = 1000;
const DESIGN_H = 460; // 压低高度，使缩放后能完整落在主内容区内（460*0.75=345）
const VIEW_W = DESIGN_W * SCALE;
const VIEW_H = DESIGN_H * SCALE;

const tracks = [
  {
    title: 'Pinyin Master',
    subtitle: 'TONES & FOUNDATION',
    bgColor: '#9C27B0',
    buttonColor: '#9C27B0',
    path: null,
  },
  {
    title: 'Hanzi Lab',
    subtitle: 'CHARACTER WRITING',
    bgColor: '#00B4A0',
    buttonColor: '#00B4A0',
    path: null,
  },
  {
    title: 'Culture Hub',
    subtitle: 'TIPS & ETIQUETTE',
    bgColor: '#FF6B35',
    buttonColor: '#FF6B35',
    path: null,
  },
  {
    title: 'Syntax Snap',
    subtitle: 'GRAMMAR PUZZLE',
    bgColor: '#2AA198',
    buttonColor: '#2AA198',
    path: '/syntax-snap',
  },
];

export default function SpecializedTracksPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: '#FBF8F4',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* 75% 缩放视口，限制不超出主内容区 */}
      <Box
        sx={{
          width: VIEW_W,
          height: VIEW_H,
          maxWidth: '100%',
          maxHeight: '100%',
          minWidth: 0,
          minHeight: 0,
          flexShrink: 1,
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${SCALE})`,
            transformOrigin: '0 0',
            boxSizing: 'border-box',
            background: '#FBF8F4',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              width: '100%',
              maxWidth: 920,
              mx: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {tracks.map((track, i) => (
              <ButtonBase
                key={i}
                onClick={() => track.path ? navigate(track.path) : console.log('Navigate to:', track.title)}
                sx={{
                  display: 'block',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                  transition: 'all 0.3s',
                  '&:active': { transform: 'scale(0.98)' },
                  width: '100%',
                  minHeight: 130,
                  boxSizing: 'border-box',
                  textAlign: 'left',
                  gridColumn: 'span 1',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 130,
                    bgcolor: track.bgColor,
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    border: '3px solid rgba(0,0,0,0.22)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 88,
                      height: 88,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    {i === 0 && (
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ position: 'absolute', fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.25)' }}>ā</Typography>
                        <Box component="span" sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>🎤</Box>
                      </Box>
                    )}
                    {i === 1 && (
                      <Typography sx={{ fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.95)', fontFamily: '"Noto Sans SC", sans-serif', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>汉</Typography>
                    )}
                    {i === 2 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box component="span" sx={{ fontSize: 22 }}>📚</Box>
                        <Box component="span" sx={{ fontSize: 18 }}>📖</Box>
                      </Box>
                    )}
                    {i === 3 && (
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: 40, fontWeight: 900, color: 'rgba(255,255,255,0.95)', fontFamily: '"Noto Sans SC", sans-serif', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>拼</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      pr: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.25 }}>
                        {track.subtitle}
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'white', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                        {track.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 1,
                        px: 1.25,
                        py: 0.5,
                        bgcolor: 'white',
                        borderRadius: 1,
                        width: 'fit-content',
                        border: '2px solid rgba(0,0,0,0.2)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                      }}
                    >
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: track.buttonColor }}>Start Learning</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: track.buttonColor }}>→</Typography>
                    </Box>
                  </Box>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
