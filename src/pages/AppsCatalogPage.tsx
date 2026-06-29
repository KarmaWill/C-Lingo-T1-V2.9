import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AndroidIcon from '@mui/icons-material/Android';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resolveBackPath } from '../utils/navigateBack';
import {
  GOOGLE_CATALOG_APPS,
  loadInstalledExtraAppIds,
  MAX_EXTRA_APPS,
  toggleInstalledExtraApp,
} from '../data/appsCatalog';

export default function AppsCatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => setInstalledIds(loadInstalledExtraAppIds()), []);
  useEffect(() => { refresh(); }, [refresh, location.key]);

  const handleToggle = (appId: string) => {
    const result = toggleInstalledExtraApp(appId);
    setInstalledIds(result.ids);
    if (!result.ok) {
      setToast(`Home screen supports up to ${MAX_EXTRA_APPS} extra apps. Remove one first.`);
    } else {
      setToast('');
    }
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white', borderBottom: '1px solid #F1F3F5' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location), { replace: true })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#374151' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827' }}>Add Apps</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>
            Pin up to {MAX_EXTRA_APPS} extra apps · {installedIds.length}/{MAX_EXTRA_APPS} used
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, pt: is960 ? 1.5 : 2 }}>
        <ButtonBase
          onClick={() => navigate('/android-app-picker', { state: { from: '/apps-catalog', ...(location.state as object) } })}
          sx={{
            width: '100%',
            minHeight: 52,
            borderRadius: '18px',
            px: 2,
            bgcolor: '#121212',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <AndroidIcon sx={{ fontSize: 28, color: '#3DDC84' }} />
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem' }}>Browse Android Apps</Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
              Open the system app drawer to choose apps
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#3DDC84' }}>Open</Typography>
        </ButtonBase>
      </Box>

      {toast && (
        <Box sx={{ px: is960 ? 2 : 3, pt: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>{toast}</Typography>
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3, display: 'grid', gridTemplateColumns: is960 ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: is960 ? 1 : 1.25, alignContent: 'start' }}>
        {GOOGLE_CATALOG_APPS.map((app) => {
          const installed = installedIds.includes(app.id);
          const atLimit = !installed && installedIds.length >= MAX_EXTRA_APPS;
          return (
            <Box
              key={app.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: is960 ? 1.5 : 1.75,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                opacity: atLimit ? 0.55 : 1,
              }}
            >
              <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: app.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                {app.label.charAt(0)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#111827' }}>{app.label}</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#9CA3AF' }}>{app.publisher}</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#6B7280', mt: 0.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {app.description}
                </Typography>
              </Box>
              <ButtonBase
                onClick={() => handleToggle(app.id)}
                disabled={atLimit}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  px: 1.25,
                  borderRadius: '14px',
                  bgcolor: installed ? '#ECFDF5' : '#EFF6FF',
                  color: installed ? '#059669' : '#2563EB',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {installed ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                {installed ? 'Added' : 'Add'}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
