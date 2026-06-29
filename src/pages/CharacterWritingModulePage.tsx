import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  getWritingModule,
  STROKE_LESSONS,
  RADICAL_LESSONS,
  STRUCTURE_LESSONS,
  type WritingModuleId,
} from '../data/characterWritingCourse';

export default function CharacterWritingModulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const moduleId = useMemo(() => {
    const segment = location.pathname.split('/').pop() ?? '';
    if (segment === 'strokes' || segment === 'radicals' || segment === 'structure') {
      return segment as WritingModuleId;
    }
    return '' as const;
  }, [location.pathname]);

  const module = getWritingModule(moduleId);

  const items = useMemo(() => {
    if (moduleId === 'strokes') return STROKE_LESSONS;
    if (moduleId === 'radicals') return RADICAL_LESSONS;
    if (moduleId === 'structure') return STRUCTURE_LESSONS;
    return [];
  }, [moduleId]);

  if (!module) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography sx={{ color: '#6B7280' }}>Module not found.</Typography>
      </Box>
    );
  }

  const openPractice = (character: string) => {
    navigate(`/character-writing/practice/${encodeURIComponent(character)}`, {
      state: { from: `/character-writing/${moduleId}`, ...(location.state as object) },
    });
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
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
          onClick={() => navigate('/character-writing', { state: location.state })}
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
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#111827', lineHeight: 1.2 }}>
            {module.title}
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>
            {module.subtitle}
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
          gridTemplateColumns: is960 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: is960 ? 1 : 1.25,
          alignContent: 'start',
        }}
      >
        {moduleId === 'strokes' &&
          STROKE_LESSONS.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              index={index + 1}
              primary={lesson.stroke}
              title={lesson.name}
              meta={lesson.pinyin}
              detail={lesson.tip}
              accent={module.color}
              is960={is960}
              onClick={() => openPractice(lesson.practiceChar)}
            />
          ))}

        {moduleId === 'radicals' &&
          RADICAL_LESSONS.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              index={index + 1}
              primary={lesson.radical}
              title={lesson.name}
              meta={lesson.meaning}
              detail={`Examples: ${lesson.examples.join(' · ')}`}
              accent={module.color}
              is960={is960}
              onClick={() => openPractice(lesson.practiceChar)}
            />
          ))}

        {moduleId === 'structure' &&
          STRUCTURE_LESSONS.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              index={index + 1}
              primary={lesson.pattern}
              title={lesson.name}
              meta={lesson.description}
              detail={`Examples: ${lesson.examples.join(' · ')}`}
              accent={module.color}
              is960={is960}
              onClick={() => openPractice(lesson.practiceChar)}
            />
          ))}

        {items.length === 0 && (
          <Typography sx={{ color: '#9CA3AF', fontSize: is960 ? '0.88rem' : '0.95rem' }}>
            Lessons coming soon.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function LessonCard({
  index,
  primary,
  title,
  meta,
  detail,
  accent,
  is960,
  onClick,
}: {
  index: number;
  primary: string;
  title: string;
  meta: string;
  detail: string;
  accent: string;
  is960: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        borderRadius: '20px',
        bgcolor: 'white',
        border: '1px solid rgba(0,0,0,0.06)',
        p: is960 ? 1.5 : 1.75,
        display: 'flex',
        alignItems: 'center',
        gap: is960 ? 1.25 : 1.5,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.995)' },
      }}
    >
      <Box
        sx={{
          width: is960 ? 56 : 64,
          height: is960 ? 56 : 64,
          borderRadius: '16px',
          bgcolor: `${accent}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: primary.length > 2 ? (is960 ? '1rem' : '1.1rem') : (is960 ? '1.65rem' : '1.9rem'),
            color: accent,
            fontFamily: '"KaiTi", "STKaiti", "SimKai", serif',
            lineHeight: 1,
          }}
        >
          {primary}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            minWidth: 20,
            height: 20,
            px: 0.5,
            borderRadius: '999px',
            bgcolor: accent,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 800,
          }}
        >
          {index}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#111827', lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.8rem', color: '#6B7280', mt: 0.35, lineHeight: 1.35 }}>
          {meta}
        </Typography>
        <Typography
          sx={{
            fontSize: is960 ? '0.72rem' : '0.78rem',
            color: '#9CA3AF',
            mt: 0.45,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {detail}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: `${accent}18`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PlayArrowIcon sx={{ fontSize: 22 }} />
      </Box>
    </ButtonBase>
  );
}
