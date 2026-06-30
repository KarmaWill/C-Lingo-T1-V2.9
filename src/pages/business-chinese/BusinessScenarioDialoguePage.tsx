import { Box, Typography } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import BusinessChinesePageShell from '../../components/business-chinese/BusinessChinesePageShell';

export default function BusinessScenarioDialoguePage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <BusinessChinesePageShell
      title="Scenario Dialogue"
      subtitle="Practice business conversations by scenario"
      icon={
        <Box sx={{ width: is960 ? 40 : 44, height: is960 ? 40 : 44, borderRadius: '12px', bgcolor: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ForumOutlinedIcon sx={{ color: '#D4A853', fontSize: is960 ? 22 : 24 }} />
        </Box>
      }
    >
      <Box sx={{ p: is960 ? 2 : 3 }}>
        <Box sx={{ p: is960 ? 2 : 2.5, borderRadius: '22px', bgcolor: '#1A1A1A', border: '1px solid rgba(212,168,83,0.15)' }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.05rem', color: '#F5F0E8', mb: 1 }}>
            Business scenario dialogue
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: 'rgba(245,240,232,0.55)', lineHeight: 1.6 }}>
            Role-play workplace conversations for meetings, negotiations, and client calls. Scoring and feedback appear after each full dialogue session.
          </Typography>
        </Box>
      </Box>
    </BusinessChinesePageShell>
  );
}
