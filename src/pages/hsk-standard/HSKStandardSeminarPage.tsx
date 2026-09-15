import { Box, Typography } from '@mui/material'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import HSKStandardPageShell from '../../components/hsk-standard/HSKStandardPageShell'

export default function HSKStandardSeminarPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  return (
    <HSKStandardPageShell
      title="Seminar"
      subtitle="Burnside High School classroom talk"
      icon={
        <Box
          sx={{
            width: is960 ? 40 : 44,
            height: is960 ? 40 : 44,
            borderRadius: '12px',
            bgcolor: 'rgba(0, 180, 160, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GroupsOutlined sx={{ color: '#00B4A0', fontSize: is960 ? 22 : 24 }} />
        </Box>
      }
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
        <Box
          sx={{
            p: is960 ? 2 : 2.5,
            borderRadius: is960 ? '18px' : '22px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(0, 180, 160, 0.16)',
            boxShadow: '0 8px 24px rgba(0, 180, 160, 0.06)',
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.05rem', color: '#111827', mb: 1 }}>
            Classroom seminar
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#4B5563', lineHeight: 1.6 }}>
            Practice spoken Chinese in a Burnside seminar: take a role, follow the prompt, and keep the
            conversation going. Scores and line notes appear after the session, so the talk is not interrupted.
          </Typography>
        </Box>
      </Box>
    </HSKStandardPageShell>
  )
}
