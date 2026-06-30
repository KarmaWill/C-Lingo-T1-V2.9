import { Box, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import HSKStandardPageShell from '../../components/hsk-standard/HSKStandardPageShell';

export default function HSKStandardWritingTrainingPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <HSKStandardPageShell
      title="Writing Training"
      subtitle="HSK writing drills and character practice"
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
          <EditNoteIcon sx={{ color: '#C0392B', fontSize: is960 ? 22 : 24 }} />
        </Box>
      }
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
        <Box
          sx={{
            p: is960 ? 2 : 2.5,
            borderRadius: is960 ? '18px' : '22px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(192, 57, 43, 0.12)',
            boxShadow: '0 8px 24px rgba(192, 57, 43, 0.06)',
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.05rem', color: '#111827', mb: 1 }}>
            HSK writing practice
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#4B5563', lineHeight: 1.6 }}>
            Train stroke order, sentence patterns, and exam-style writing tasks aligned with your current HSK level
            and topic.
          </Typography>
        </Box>
      </Box>
    </HSKStandardPageShell>
  );
}
