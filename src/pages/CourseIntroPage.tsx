import { Box, Typography } from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { useLocation } from 'react-router-dom';
import SystemPageShell from '../components/SystemPageShell';
import { getCourseIntroMeta } from '../data/lessonCatalog';

export default function CourseIntroPage() {
  const location = useLocation();
  const state = location.state as { from?: string; lessonId?: string } | null;
  const meta = getCourseIntroMeta(state?.from, state?.lessonId);
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <SystemPageShell
      title={meta.title}
      subtitle={meta.subtitle}
      icon={<MenuBookOutlinedIcon sx={{ fontSize: is960 ? 28 : 32, color: meta.accent }} />}
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: is960 ? 0.85 : 1 }}>
          {meta.highlights.map((item) => (
            <Box key={item.label} sx={{ p: is960 ? 1.25 : 1.5, borderRadius: '18px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: meta.accent, mb: 0.35 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.76rem', color: '#6B7280', lineHeight: 1.35 }}>{item.desc}</Typography>
            </Box>
          ))}
        </Box>

        {meta.sections.map((section) => (
          <Box key={section.title} sx={{ p: is960 ? 1.5 : 1.85, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: '#111827', mb: 0.75 }}>{section.title}</Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#4B5563', lineHeight: 1.6 }}>{section.body}</Typography>
          </Box>
        ))}

        <Box sx={{ p: is960 ? 1.5 : 1.85, borderRadius: '20px', bgcolor: meta.tipBg, border: `1px solid ${meta.tipBorder}` }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '0.98rem', color: meta.tipTitle, mb: 0.5 }}>Tip</Typography>
          <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: meta.tipBody, lineHeight: 1.55 }}>
            {meta.tip}
          </Typography>
        </Box>
      </Box>
    </SystemPageShell>
  );
}
