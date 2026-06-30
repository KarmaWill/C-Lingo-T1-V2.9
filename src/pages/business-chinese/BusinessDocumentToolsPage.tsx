import { Box, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BusinessChinesePageShell from '../../components/business-chinese/BusinessChinesePageShell';

const TOOLS = [
  { title: 'Document Reading Assistant', body: 'Upload or paste business documents for guided reading with pinyin and translation support.' },
  { title: 'Business Writing Tool', body: 'Draft emails, reports, and proposals with tone suggestions for professional Chinese.' },
];

export default function BusinessDocumentToolsPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <BusinessChinesePageShell
      title="Document & Writing"
      subtitle="Reading assistant and business writing tools"
      icon={
        <Box sx={{ width: is960 ? 40 : 44, height: is960 ? 40 : 44, borderRadius: '12px', bgcolor: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DescriptionOutlinedIcon sx={{ color: '#D4A853', fontSize: is960 ? 22 : 24 }} />
        </Box>
      }
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.35 }}>
        {TOOLS.map((tool) => (
          <Box key={tool.title} sx={{ p: is960 ? 1.75 : 2.25, borderRadius: '22px', bgcolor: '#1A1A1A', border: '1px solid rgba(212,168,83,0.15)' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.02rem', color: '#D4A853', mb: 0.65 }}>{tool.title}</Typography>
            <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.88rem', color: 'rgba(245,240,232,0.55)', lineHeight: 1.55 }}>{tool.body}</Typography>
          </Box>
        ))}
      </Box>
    </BusinessChinesePageShell>
  );
}
