import { Box, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HSKStandardPageShell from '../../components/hsk-standard/HSKStandardPageShell';

const SECTIONS = [
  {
    title: 'HSK Exam Registration',
    body: 'Register for official HSK exams and track your test dates.',
  },
  {
    title: 'Study Abroad Services',
    body: 'Explore agencies and programs for studying in China.',
  },
  {
    title: 'Learning Community',
    body: 'Join forums and resources for Chinese learners abroad.',
  },
];

export default function HSKStandardStudyWorkChinaPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <HSKStandardPageShell
      title="Study & Work in China"
      subtitle="HSK, study abroad, and learner community"
      icon={
        <Box
          sx={{
            width: is960 ? 40 : 44,
            height: is960 ? 40 : 44,
            borderRadius: '12px',
            bgcolor: 'rgba(192, 57, 43, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SchoolOutlinedIcon sx={{ color: '#C0392B', fontSize: is960 ? 22 : 24 }} />
        </Box>
      }
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.35 }}>
        {SECTIONS.map((section) => (
          <Box
            key={section.title}
            sx={{
              p: is960 ? 1.75 : 2.25,
              borderRadius: is960 ? '18px' : '22px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(192, 57, 43, 0.12)',
              boxShadow: '0 6px 20px rgba(192, 57, 43, 0.05)',
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.02rem', color: '#991B1B', mb: 0.65 }}>
              {section.title}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
              {section.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </HSKStandardPageShell>
  );
}
