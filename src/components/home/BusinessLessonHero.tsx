import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface BusinessLessonHeroProps {
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
  pointsLabel?: string;
  modulesLabel?: string;
  startSessionLabel?: string;
  aboutLabel?: string;
  masteryLabel?: string;
  masteryValue?: number;
}

export default function BusinessLessonHero({
  is960,
  from,
  lessonId = 'business-bct1-meeting',
  imageSrc = '/images/business-chinese-hero.png',
  imagePosition = '38% center',
  eyebrow = 'BUSINESS KNOWLEDGE',
  title = 'BCT 1 | Meeting: Opening & Agenda',
  wordCount = 22,
  patternCount = 2,
  durationLabel = '14 MINS',
  pointsLabel = 'Points',
  modulesLabel = 'Modules',
  startSessionLabel = 'Start Session',
  aboutLabel = 'About',
  masteryLabel = 'Module Mastery',
  masteryValue = 38,
}: BusinessLessonHeroProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minWidth: 0, minHeight: 0, height: { lg: '100%' }, boxSizing: 'border-box', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: is960 ? 220 : 280,
          borderRadius: is960 ? '24px' : '32px',
          overflow: 'hidden',
          border: `${is960 ? '2px' : '3px'} solid rgba(212,168,83,0.35)`,
          boxShadow: '0 15px 40px rgba(0,0,0,0.55)',
          bgcolor: '#0D0D0D',
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: imagePosition,
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt=""
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePosition, zIndex: 1, opacity: 1 }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.22) 0%, rgba(26,18,0,0.1) 55%, rgba(13,13,13,0.24) 100%)', zIndex: 2 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.22) 45%, transparent 78%)', zIndex: 2 }} />

        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            navigate('/course-intro', { state: { from, lessonId } });
          }}
          aria-label="Module overview"
          sx={{
            position: 'absolute',
            top: is960 ? 16 : 32,
            right: is960 ? 16 : 32,
            zIndex: 4,
            minWidth: 44,
            minHeight: 44,
            px: is960 ? 1.25 : 1.5,
            borderRadius: is960 ? '12px' : '16px',
            bgcolor: 'rgba(212,168,83,0.14)',
            color: '#F5F0E8',
            border: '1px solid rgba(212,168,83,0.35)',
            backdropFilter: 'blur(12px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: is960 ? 20 : 22, color: '#D4A853' }} />
          <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 800, color: '#D4A853' }}>{aboutLabel}</Typography>
        </ButtonBase>

        <Box sx={{ position: 'absolute', top: is960 ? 16 : 32, left: is960 ? 16 : 32, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 2, zIndex: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 0.75 : 1.5,
              bgcolor: 'rgba(212,168,83,0.12)',
              color: '#F5F0E8',
              px: is960 ? 1.5 : 2.5,
              py: is960 ? 0.65 : 1.2,
              borderRadius: is960 ? '12px' : '16px',
              border: '1px solid rgba(212,168,83,0.28)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1, color: '#D4A853' }}>{wordCount}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>{pointsLabel}</Typography>
            </Box>
            <Box sx={{ width: 1.5, height: is960 ? 10 : 16, bgcolor: 'rgba(212,168,83,0.35)', borderRadius: '2px', mx: 0.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.25rem', fontWeight: 900, lineHeight: 1, color: '#D4A853' }}>{patternCount}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.55rem' : '0.75rem', fontWeight: 600 }}>{modulesLabel}</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 0.6 : 1,
              bgcolor: 'rgba(212,168,83,0.12)',
              color: '#F5F0E8',
              px: is960 ? 1.5 : 2.5,
              py: is960 ? 0.6 : 1,
              borderRadius: is960 ? '12px' : '16px',
              width: 'fit-content',
              border: '1px solid rgba(212,168,83,0.28)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Typography sx={{ fontSize: is960 ? '0.8rem' : '1.125rem' }}>⏱</Typography>
            <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.875rem', fontWeight: 900, letterSpacing: '0.05em', color: '#D4A853' }}>
              {durationLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: is960 ? 20 : 40, left: is960 ? 20 : 40, right: is960 ? 20 : 40, zIndex: 3 }}>
          <Typography sx={{ color: '#D4A853', fontWeight: 900, fontSize: is960 ? '0.75rem' : '1.125rem', mb: is960 ? 0.75 : 1.5, letterSpacing: '0.06em', opacity: 0.95 }}>
            {eyebrow}
          </Typography>
          <Typography sx={{ color: '#F5F0E8', fontSize: is960 ? '1.05rem' : '1.75rem', fontWeight: 900, lineHeight: 1.25, mb: is960 ? 1.25 : 2.25, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 4 }}>
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/lesson/${lessonId}`, { state: { from } });
              }}
              sx={{
                bgcolor: '#D4A853',
                color: '#0D0D0D',
                px: is960 ? 2.25 : 5,
                py: is960 ? 0.9 : 2,
                minHeight: 44,
                borderRadius: is960 ? '12px' : '18px',
                fontSize: is960 ? '0.8rem' : '1.25rem',
                fontWeight: 900,
                boxShadow: '0 10px 30px rgba(212,168,83,0.35)',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              {startSessionLabel}
            </ButtonBase>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(245,240,232,0.85)', fontSize: is960 ? '0.7rem' : '1rem', fontWeight: 900, mb: is960 ? 0.6 : 1 }}>
                <span>{masteryLabel}</span>
                <span>{masteryValue}%</span>
              </Box>
              <Box sx={{ height: is960 ? 5 : 8, bgcolor: 'rgba(212,168,83,0.15)', borderRadius: is960 ? '5px' : '8px', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', bgcolor: '#D4A853', width: `${masteryValue}%`, borderRadius: is960 ? '5px' : '8px' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
