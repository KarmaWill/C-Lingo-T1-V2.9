import { useState } from 'react';
import { Box, Typography, ButtonBase, LinearProgress } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SystemPageShell from '../components/SystemPageShell';

const LANGUAGE_PACKS = [
  { id: 'en', label: 'English', size: '12 MB', status: 'installed' as const, progress: 100 },
  { id: 'th', label: 'Thai', size: '18 MB', status: 'installed' as const, progress: 100 },
  { id: 'vi', label: 'Vietnamese', size: '16 MB', status: 'update' as const, progress: 100 },
  { id: 'ms', label: 'Malay', size: '14 MB', status: 'available' as const, progress: 0 },
  { id: 'id', label: 'Indonesian', size: '15 MB', status: 'available' as const, progress: 0 },
  { id: 'ar', label: 'Arabic (Dubai)', size: '22 MB', status: 'available' as const, progress: 0 },
  { id: 'es', label: 'Spanish', size: '14 MB', status: 'available' as const, progress: 0 },
];

export default function LanguagePacksPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [packs, setPacks] = useState(LANGUAGE_PACKS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    let progress = packs.find((p) => p.id === id)?.progress ?? 0;
    const timer = window.setInterval(() => {
      progress += 18;
      setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, progress: Math.min(100, progress) } : p)));
      if (progress >= 100) {
        window.clearInterval(timer);
        setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'installed', progress: 100 } : p)));
        setDownloadingId(null);
      }
    }, 280);
  };

  return (
    <SystemPageShell
      title="Language Packs"
      subtitle="Download UI and course interface languages"
      icon={<TranslateIcon sx={{ fontSize: is960 ? 28 : 32, color: '#2563EB' }} />}
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
        {packs.map((pack) => (
          <Box key={pack.id} sx={{ p: is960 ? 1.5 : 1.75, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {pack.label.slice(0, 2).toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#111827' }}>{pack.label}</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#9CA3AF' }}>{pack.size}</Typography>
              </Box>
              {pack.status === 'installed' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669', fontWeight: 800, fontSize: '0.78rem' }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} /> Installed
                </Box>
              ) : (
                <ButtonBase
                  onClick={() => handleDownload(pack.id)}
                  disabled={downloadingId !== null && downloadingId !== pack.id}
                  sx={{ minHeight: 44, px: 1.5, borderRadius: '14px', bgcolor: pack.status === 'update' ? '#FEF3C7' : '#EFF6FF', color: pack.status === 'update' ? '#B45309' : '#2563EB', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <CloudDownloadIcon sx={{ fontSize: 18 }} />
                  {pack.status === 'update' ? 'Update' : 'Download'}
                </ButtonBase>
              )}
            </Box>
            {downloadingId === pack.id && (
              <LinearProgress variant="determinate" value={pack.progress} sx={{ mt: 1.25, borderRadius: 99, height: 6, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 99 } }} />
            )}
          </Box>
        ))}
      </Box>
    </SystemPageShell>
  );
}
