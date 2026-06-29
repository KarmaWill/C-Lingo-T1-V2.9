import { Box, Typography } from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SystemPageShell from '../components/SystemPageShell';

const HIGHLIGHTS = [
  { label: '31 Words', desc: 'Core family and counting vocabulary' },
  { label: '3 Patterns', desc: 'Ask and answer about family size' },
  { label: '15 mins', desc: 'Video, practice, and speaking wrap-up' },
];

const SECTIONS = [
  {
    title: 'What this lesson covers',
    body: 'You will learn how to ask and answer “How many people are in your family?” in natural, everyday Chinese. The lesson builds from listening to guided speaking.',
  },
  {
    title: 'Key skills',
    body: 'Recognize family-related words, use number + measure word patterns, and respond in short conversational exchanges suitable for HSK 1 learners.',
  },
  {
    title: 'How the session works',
    body: 'Watch the lesson video (skippable), complete bite-sized exercises, then finish with a short speaking check. Your progress updates on the home screen.',
  },
];

export default function CourseIntroPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <SystemPageShell
      title="Lesson 1 Overview"
      subtitle="How many people in your family?"
      icon={<MenuBookOutlinedIcon sx={{ fontSize: is960 ? 28 : 32, color: '#00B4A0' }} />}
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: is960 ? 0.85 : 1 }}>
          {HIGHLIGHTS.map((item) => (
            <Box key={item.label} sx={{ p: is960 ? 1.25 : 1.5, borderRadius: '18px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: '#00B4A0', mb: 0.35 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.76rem', color: '#6B7280', lineHeight: 1.35 }}>{item.desc}</Typography>
            </Box>
          ))}
        </Box>

        {SECTIONS.map((section) => (
          <Box key={section.title} sx={{ p: is960 ? 1.5 : 1.85, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: '#111827', mb: 0.75 }}>{section.title}</Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#4B5563', lineHeight: 1.6 }}>{section.body}</Typography>
          </Box>
        ))}

        <Box sx={{ p: is960 ? 1.5 : 1.85, borderRadius: '20px', bgcolor: '#FFF8F0', border: '1px solid rgba(255,107,53,0.15)' }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '0.98rem', color: '#C2410C', mb: 0.5 }}>Tip</Typography>
          <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#9A3412', lineHeight: 1.55 }}>
            Complete at least 60% to unlock bonus culture content and extra practice tools for this unit.
          </Typography>
        </Box>
      </Box>
    </SystemPageShell>
  );
}
