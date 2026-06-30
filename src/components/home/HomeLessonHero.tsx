import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface HomeLessonHeroProps {
  is960: boolean;
  from: string;
  lessonId?: string;
  imageSrc?: string;
  imagePosition?: string;
  eyebrow?: string;
  title?: string;
  wordCount?: number;
  patternCount?: number;
  durationLabel?: string;
  masteryLabel?: string;
  masteryValue?: number;
  progressColor?: string;
}

export default function HomeLessonHero({
  is960,
  from,
  lessonId = '1',
  imageSrc = '/images/homepage-hero-portrait.png',
  imagePosition = 'center',
  eyebrow = 'CURRENT LEARNING',
  title = 'Lesson 1 | How many people in your family?',
  wordCount = 31,
  patternCount = 3,
  durationLabel = '15 MINS',
  masteryLabel = 'Unit Mastery',
  masteryValue = 65,
  progressColor = '#00B4A0',
}: HomeLessonHeroProps) {
  const navigate = useNavigate();

  const onStartLesson = () => {
    navigate(`/lesson/${lessonId}`, { state: { from } });
  };

  return (
    <Box sx={{ minWidth: 0, minHeight: 0, height: { lg: '100%' }, boxSizing: 'border-box', overflow: 'hidden' }}>
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
        <Box
          component="img"
          src={imageSrc}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: imagePosition,
            zIndex: 1,
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(12, 16, 24, 0.24)', zIndex: 2 }} />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.28) 42%, transparent 70%)',
            zIndex: 2,
          }}
        />

        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            navigate('/course-intro', { state: { from, lessonId } });
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
          <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 800, letterSpacing: '0.02em' }}>
            About
          </Typography>
        </ButtonBase>

        <Box
          sx={{
            position: 'absolute',
            top: is960 ? 16 : 32,
            left: is960 ? 16 : 32,
            display: 'flex',
            flexDirection: 'column',
            gap: is960 ? 1 : 2,
            zIndex: 3,
          }}
        >
          <Box
            sx={{
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
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1 }}>{wordCount}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>Words</Typography>
            </Box>
            <Box sx={{ width: 1.5, height: is960 ? 10 : 16, bgcolor: 'rgba(255,249,234,0.48)', borderRadius: '2px', mx: 0.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1 }}>{patternCount}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>Patterns</Typography>
            </Box>
          </Box>

          <Box
            sx={{
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
            }}
          >
            <Typography sx={{ fontSize: is960 ? '0.8rem' : '1.125rem' }}>⏱</Typography>
            <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.875rem', fontWeight: 900, letterSpacing: '0.05em' }}>
              {durationLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: is960 ? 20 : 40, left: is960 ? 20 : 40, right: is960 ? 20 : 40, zIndex: 3 }}>
          <Typography
            sx={{
              color: '#FFDFA3',
              fontWeight: 900,
              fontSize: is960 ? '0.75rem' : '1.125rem',
              mb: is960 ? 0.75 : 1.5,
              letterSpacing: '0.05em',
              opacity: 0.98,
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            sx={{
              color: 'white',
              fontSize: is960 ? '1.05rem' : '1.75rem',
              fontWeight: 900,
              lineHeight: 1.25,
              mb: is960 ? 1.25 : 2.25,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 4 }}>
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation();
                onStartLesson();
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: is960 ? '0.7rem' : '1rem',
                  fontWeight: 900,
                  mb: is960 ? 0.6 : 1,
                }}
              >
                <span>{masteryLabel}</span>
                <span>{masteryValue}%</span>
              </Box>
              <Box sx={{ height: is960 ? 5 : 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: is960 ? '5px' : '8px', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', bgcolor: progressColor, width: `${masteryValue}%`, borderRadius: is960 ? '5px' : '8px' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
