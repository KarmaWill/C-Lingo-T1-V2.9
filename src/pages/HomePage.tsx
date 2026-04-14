import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, ButtonBase } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import ExtensionIcon from '@mui/icons-material/Extension';

export default function HomePage() {
  const navigate = useNavigate();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const onStartLesson = () => {
    navigate('/lesson/1');
  };

  return (
    <Box sx={{ 
      p: is960 ? 2 : 4,
      height: '100%', 
      width: '100%',
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column', 
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Main Integrated Grid */}
      <Grid container spacing={is960 ? 2 : 3} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', boxSizing: 'border-box', width: '100%', m: 0 }}>
        {/* Left Column: Hero Card */}
        <Grid item xs={12} lg={8} sx={{ height: '100%', boxSizing: 'border-box', overflow: 'hidden', p: 0 }}>
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              borderRadius: is960 ? '28px' : '40px',
              overflow: 'hidden',
              border: is960 ? '3px solid white' : '4px solid white',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* 老师图片 - 铺满整个卡片 */}
            <Box 
              component="img" 
              src="/images/homepage-hero-portrait.png" 
              sx={{ 
                position: 'absolute', 
                inset: 0,
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: 'center center',
                zIndex: 1
              }} 
            />
            {/* 整体压暗 + 底部加深，提升文字可读性 */}
            <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(12, 16, 24, 0.24)', zIndex: 2 }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.28) 42%, transparent 70%)', zIndex: 2 }} />

            <Box sx={{ position: 'absolute', top: is960 ? 16 : 32, left: is960 ? 16 : 32, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 2, zIndex: 3 }}>
              {/* 词汇和句型标签 - 玻璃拟态 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: is960 ? 0.75 : 1.5,
                bgcolor: 'rgba(255,255,255,0.16)',
                color: '#FFF9EA',
                px: is960 ? 1.5 : 2.5, 
                py: is960 ? 0.65 : 1.2, 
                borderRadius: is960 ? '12px' : '16px',
                border: '1px solid rgba(255,255,255,0.38)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
                zIndex: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1 }}>31</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>Words</Typography>
                </Box>
                <Box sx={{ width: 1.5, height: is960 ? 10 : 16, bgcolor: 'rgba(255,249,234,0.48)', borderRadius: '2px', mx: 0.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1 }}>3</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>Patterns</Typography>
                </Box>
      </Box>

              {/* 时间标签 - 玻璃拟态 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: is960 ? 0.6 : 1,
                bgcolor: 'rgba(255,255,255,0.16)',
                color: '#FFF9EA',
                px: is960 ? 1.5 : 2.5, 
                py: is960 ? 0.6 : 1, 
                borderRadius: is960 ? '12px' : '16px',
                width: 'fit-content',
                border: '1px solid rgba(255,255,255,0.38)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
                zIndex: 3
              }}>
                <Typography sx={{ fontSize: is960 ? '0.8rem' : '1.125rem' }}>⏱</Typography>
                <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.875rem', fontWeight: 900, letterSpacing: '0.05em' }}>15 MINS</Typography>
              </Box>
            </Box>

            <Box sx={{ position: 'absolute', bottom: is960 ? 20 : 40, left: is960 ? 20 : 40, right: is960 ? 20 : 40, zIndex: 3 }}>
              <Typography sx={{ color: '#FFDFA3', fontWeight: 900, fontSize: is960 ? '0.75rem' : '1.125rem', mb: is960 ? 0.75 : 1.5, letterSpacing: '0.05em', opacity: 0.98 }}>CURRENT LEARNING</Typography>
              <Typography sx={{ color: 'white', fontSize: is960 ? '1.35rem' : '2.5rem', fontWeight: 900, lineHeight: 1.2, mb: is960 ? 1.5 : 3, letterSpacing: '-0.02em' }}>
                Lesson 1 | How many people in your family?
        </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 4 }}>
                <ButtonBase
                  onClick={(e) => {
                    e.stopPropagation()
                    onStartLesson()
                  }}
                  sx={{
                    bgcolor: 'white',
                    color: '#111827',
                    px: is960 ? 2.25 : 5,
                    py: is960 ? 0.9 : 2,
                    minHeight: 44,
                    borderRadius: is960 ? '12px' : '18px',
                    fontSize: is960 ? '0.8rem' : '1.25rem',
                    fontWeight: 900,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    '&:active': { transform: 'scale(0.95)' },
                  }}
                >
                  Start Session
                </ButtonBase>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.9)', fontSize: is960 ? '0.7rem' : '1rem', fontWeight: 900, mb: is960 ? 0.6 : 1 }}>
                    <span>Unit Mastery</span>
                    <span>65%</span>
                  </Box>
                  <Box sx={{ height: is960 ? 5 : 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: is960 ? '5px' : '8px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', bgcolor: '#00B4A0', width: '65%', borderRadius: is960 ? '5px' : '8px' }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Cards Stack */}
        <Grid item xs={12} lg={4} sx={{ height: '100%', boxSizing: 'border-box', overflow: 'hidden', p: 0, minHeight: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
              gap: is960 ? 1.75 : 2.5,
              height: '100%',
              minHeight: 0,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* AI Tutor — 原 Practice */}
            <Box 
              onClick={() => navigate('/ai-chat')}
              sx={{ 
                bgcolor: '#8B5CF6', 
                p: is960 ? 1.75 : 3.5, 
                borderRadius: is960 ? '18px' : '32px', 
                color: 'white', 
                position: 'relative', 
                overflow: 'hidden', 
                minHeight: 0,
                height: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: '0.3s',
                boxSizing: 'border-box',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 0.85 : 1.25, flex: 1, minWidth: 0 }}>
                <SmartToyIcon sx={{ fontSize: is960 ? 20 : 30, opacity: 0.95, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.82rem' : '1.2rem', lineHeight: 1.25, minWidth: 0 }}>AI Tutor</Typography>
              </Box>
              <Box sx={{ 
                zIndex: 1,
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: is960 ? 40 : 72, 
                height: is960 ? 40 : 72, 
                borderRadius: is960 ? '14px' : '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}>
                <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 32 }} />
              </Box>
            </Box>

            {/* Flashcards */}
            <Box
              onClick={() => navigate('/lingo-flash')}
              sx={{
                bgcolor: '#0D9488',
                p: is960 ? 1.75 : 3.5,
                borderRadius: is960 ? '18px' : '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 0,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: '0.3s',
                boxSizing: 'border-box',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 0.85 : 1.25, flex: 1, minWidth: 0 }}>
                <StyleIcon sx={{ fontSize: is960 ? 20 : 30, opacity: 0.95, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.82rem' : '1.2rem', lineHeight: 1.25, minWidth: 0 }}>Flashcards</Typography>
              </Box>
              <Box
                sx={{
                  zIndex: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: is960 ? 40 : 72,
                  height: is960 ? 40 : 72,
                  borderRadius: is960 ? '14px' : '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 32 }} />
              </Box>
            </Box>

            {/* Grammar Puzzle */}
            <Box
              onClick={() => navigate('/grammar-puzzle')}
              sx={{
                bgcolor: '#0E7490',
                p: is960 ? 1.75 : 3.5,
                borderRadius: is960 ? '18px' : '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 0,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: '0.3s',
                boxSizing: 'border-box',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 0.85 : 1.25, flex: 1, minWidth: 0 }}>
                <ExtensionIcon sx={{ fontSize: is960 ? 20 : 30, opacity: 0.95, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.82rem' : '1.2rem', lineHeight: 1.25, minWidth: 0 }}>Grammar Puzzle</Typography>
              </Box>
              <Box
                sx={{
                  zIndex: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: is960 ? 40 : 72,
                  height: is960 ? 40 : 72,
                  borderRadius: is960 ? '14px' : '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 32 }} />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
