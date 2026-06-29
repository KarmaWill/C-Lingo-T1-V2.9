import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export default function HomePage() {
  const navigate = useNavigate();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const onStartLesson = () => {
    navigate('/lesson/1');
  };

  const sideCardSx = {
    p: is960 ? '1.35rem 0.45rem 1.35rem 1.35rem' : '2.25rem 0.75rem 2.25rem 2.25rem',
    borderRadius: is960 ? '16px' : '24px',
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: '0.3s',
    boxSizing: 'border-box' as const,
    '&:active': { transform: 'scale(0.98)' },
  };

  const sideArrowSx = {
    zIndex: 1,
    bgcolor: 'rgba(255,255,255,0.2)',
    width: is960 ? 44 : 64,
    height: is960 ? 44 : 64,
    borderRadius: is960 ? '14px' : '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    flexShrink: 0,
  };

  const sideNextSx = {
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    color: 'rgba(255,255,255,0.92)',
    width: is960 ? 14 : 18,
    height: is960 ? 44 : 64,
    mr: is960 ? -0.45 : -0.85,
    transform: is960 ? 'translateX(2px)' : 'translateX(4px)',
  };

  const speakingTutorIcon = (
    <Box sx={{ position: 'relative', width: is960 ? 28 : 36, height: is960 ? 28 : 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SmartToyIcon sx={{ fontSize: is960 ? 24 : 31, opacity: 0.96 }} />
      <ChatBubbleRoundedIcon
        sx={{
          position: 'absolute',
          right: is960 ? -3 : -4,
          bottom: is960 ? -2 : -3,
          fontSize: is960 ? 11 : 14,
          color: '#FFF7ED',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18))',
        }}
      />
    </Box>
  );

  const readingBuddyIcon = (
    <Box sx={{ position: 'relative', width: is960 ? 30 : 38, height: is960 ? 30 : 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MenuBookRoundedIcon sx={{ fontSize: is960 ? 25 : 32, opacity: 0.96 }} />
      <Box
        sx={{
          position: 'absolute',
          right: is960 ? -4 : -5,
          top: is960 ? -3 : -4,
          width: is960 ? 18 : 22,
          height: is960 ? 18 : 22,
          borderRadius: '8px',
          bgcolor: 'rgba(255,255,255,0.9)',
          color: '#2563EB',
          fontSize: is960 ? '0.48rem' : '0.58rem',
          fontWeight: 950,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(0,0,0,0.16)',
          letterSpacing: '-0.05em',
        }}
      >
        AI
      </Box>
    </Box>
  );

  const classGeneratorIcon = (
    <Box sx={{ position: 'relative', width: is960 ? 30 : 38, height: is960 ? 30 : 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AutoAwesomeRoundedIcon sx={{ fontSize: is960 ? 28 : 36, opacity: 0.98 }} />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -46%)',
          fontSize: is960 ? '0.46rem' : '0.56rem',
          fontWeight: 950,
          color: '#791F87',
          bgcolor: 'rgba(255,255,255,0.92)',
          borderRadius: '6px',
          px: 0.35,
          lineHeight: 1.25,
          letterSpacing: '-0.06em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        AI
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        p: is960 ? 2 : 3,
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2.45fr) minmax(0, 1fr)' },
        gridTemplateRows: { xs: 'minmax(220px, 1fr) auto', lg: 'minmax(0, 1fr)' },
        gap: is960 ? 1.25 : 1.5,
        alignItems: 'stretch',
      }}
    >
      {/* Hero — current lesson */}
      <Box
        sx={{
          minWidth: 0,
          minHeight: 0,
          height: { lg: '100%' },
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              minHeight: is960 ? 220 : 280,
              borderRadius: is960 ? '24px' : '32px',
              overflow: 'hidden',
              border: is960 ? '3px solid white' : '4px solid white',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
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

            <ButtonBase
              onClick={(e) => {
                e.stopPropagation();
                navigate('/course-intro', { state: { from: '/AI' } });
              }}
              aria-label="Lesson overview"
              sx={{
                position: 'absolute',
                top: is960 ? 16 : 32,
                right: is960 ? 16 : 32,
                zIndex: 4,
                minWidth: 44,
                minHeight: 44,
                px: is960 ? 1.25 : 1.5,
                borderRadius: is960 ? '12px' : '16px',
                bgcolor: 'rgba(255,255,255,0.16)',
                color: '#FFF9EA',
                border: '1px solid rgba(255,255,255,0.38)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                '&:active': { transform: 'scale(0.96)', bgcolor: 'rgba(255,255,255,0.22)' },
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: is960 ? 20 : 22 }} />
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 800, letterSpacing: '0.02em' }}>About</Typography>
            </ButtonBase>

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
              <Typography sx={{ color: 'white', fontSize: is960 ? '1.05rem' : '1.75rem', fontWeight: 900, lineHeight: 1.25, mb: is960 ? 1.25 : 2.25, letterSpacing: '-0.02em' }}>
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
      </Box>

      {/* Side shortcuts — equal height stack */}
      <Box
        sx={{
          minWidth: 0,
          minHeight: 0,
          height: { lg: '100%' },
          display: 'grid',
          gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
          gap: is960 ? 1.1 : 1.35,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
            <Box onClick={() => navigate('/ai-chat')} sx={{ ...sideCardSx, bgcolor: '#F97316' }}>
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, pr: is960 ? 0.75 : 1 }}>
                <Typography
                  component="div"
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '0.9rem' : '1.22rem',
                    lineHeight: 1.2,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span>Speaking</span>
                  <span>Tutor</span>
                </Typography>
              </Box>
              <Box sx={sideArrowSx}>
                {speakingTutorIcon}
              </Box>
              <Box sx={sideNextSx} aria-hidden>
                <ChevronRightIcon sx={{ fontSize: is960 ? 22 : 28 }} />
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/reading-buddy')}
              sx={{ ...sideCardSx, bgcolor: '#2563EB' }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, pr: is960 ? 0.75 : 1 }}>
                <Typography
                  component="div"
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '0.9rem' : '1.22rem',
                    lineHeight: 1.2,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span>Reading</span>
                  <span>Buddy</span>
                </Typography>
              </Box>
              <Box sx={sideArrowSx}>
                {readingBuddyIcon}
              </Box>
              <Box sx={sideNextSx} aria-hidden>
                <ChevronRightIcon sx={{ fontSize: is960 ? 22 : 28 }} />
              </Box>
            </Box>

            <Box onClick={() => navigate('/grammar-puzzle')} sx={{ ...sideCardSx, bgcolor: '#791F87' }}>
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, pr: is960 ? 0.75 : 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1.22rem', lineHeight: 1.25, minWidth: 0 }}>Class Generator</Typography>
              </Box>
              <Box sx={sideArrowSx}>
                {classGeneratorIcon}
              </Box>
              <Box sx={sideNextSx} aria-hidden>
                <ChevronRightIcon sx={{ fontSize: is960 ? 22 : 28 }} />
              </Box>
            </Box>
      </Box>
    </Box>
  );
}
