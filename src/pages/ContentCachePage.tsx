import { useState } from 'react';
import { Box, Typography, ButtonBase, LinearProgress } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import SystemPageShell from '../components/SystemPageShell';

const CACHE_ITEMS = [
  { id: 'fc-audio', label: 'Fun Chinese · Lesson Audio', type: 'audio' as const, size: '286 MB', cached: true },
  { id: 'fc-video', label: 'Fun Chinese · Culture Clips', type: 'video' as const, size: '412 MB', cached: true },
  { id: 'hsk-audio', label: 'HSK Prep · Listening Pack', type: 'audio' as const, size: '98 MB', cached: true },
  { id: 'cw-video', label: 'Character Writing · Stroke Videos', type: 'video' as const, size: '156 MB', cached: false },
  { id: 'culture-video', label: 'Culture Map · Region Videos', type: 'video' as const, size: '520 MB', cached: true },
];

export default function ContentCachePage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [items, setItems] = useState(CACHE_ITEMS);
  const [clearingId, setClearingId] = useState<string | null>(null);

  const totalCached = items.filter((i) => i.cached).reduce((sum, i) => sum + parseInt(i.size, 10), 0);

  const handleClear = (id: string) => {
    setClearingId(id);
    window.setTimeout(() => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, cached: false } : item)));
      setClearingId(null);
    }, 600);
  };

  return (
    <SystemPageShell
      title="Content Management"
      subtitle={`Cached media for offline use · ~${totalCached} MB total`}
      icon={<FolderOutlinedIcon sx={{ fontSize: is960 ? 28 : 32, color: '#64748B' }} />}
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
        {items.map((item) => {
          const TypeIcon = item.type === 'audio' ? AudiotrackOutlinedIcon : MovieOutlinedIcon;
          return (
            <Box key={item.id} sx={{ p: is960 ? 1.5 : 1.75, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: item.type === 'audio' ? '#FEF3C7' : '#EDE9FE', color: item.type === 'audio' ? '#B45309' : '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TypeIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '0.96rem', color: '#111827' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#9CA3AF' }}>
                    {item.cached ? `${item.size} cached` : 'Not cached · tap to prefetch'}
                  </Typography>
                </Box>
                {item.cached ? (
                  <ButtonBase
                    onClick={() => handleClear(item.id)}
                    disabled={clearingId === item.id}
                    sx={{ minHeight: 44, minWidth: 44, borderRadius: '14px', bgcolor: '#FEF2F2', color: '#DC2626' }}
                    aria-label={`Clear ${item.label}`}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 22 }} />
                  </ButtonBase>
                ) : (
                  <ButtonBase sx={{ minHeight: 44, px: 1.5, borderRadius: '14px', bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.78rem' }}>
                    Prefetch
                  </ButtonBase>
                )}
              </Box>
              {clearingId === item.id && (
                <LinearProgress sx={{ mt: 1.25, borderRadius: 99, height: 4, bgcolor: '#FEE2E2', '& .MuiLinearProgress-bar': { bgcolor: '#DC2626' } }} />
              )}
            </Box>
          );
        })}
      </Box>
    </SystemPageShell>
  );
}
