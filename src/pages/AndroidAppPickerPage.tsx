import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AndroidIcon from '@mui/icons-material/Android';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resolveBackPath } from '../utils/navigateBack';
import {
  ANDROID_SYSTEM_APPS,
  loadInstalledExtraAppIds,
  MAX_EXTRA_APPS,
  toggleInstalledExtraApp,
} from '../data/appsCatalog';

export default function AndroidAppPickerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [installedIds, setInstalledIds] = useState(() => loadInstalledExtraAppIds());
  const [message, setMessage] = useState('');

  const handleSelect = useCallback((appId: string) => {
    const result = toggleInstalledExtraApp(appId);
    setInstalledIds(result.ids);
    if (!result.ok) {
      setMessage(`You can only pin ${MAX_EXTRA_APPS} extra apps on the home screen.`);
      return;
    }
    setMessage('');
  }, []);

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#121212', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location, { defaultPath: '/apps-catalog' }), { replace: true, state: location.state })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem' }}>Android Apps</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: 'rgba(255,255,255,0.55)', mt: 0.25 }}>
            Select apps to add to Applications · {installedIds.length}/{MAX_EXTRA_APPS} used
          </Typography>
        </Box>
        <AndroidIcon sx={{ fontSize: is960 ? 28 : 32, color: '#3DDC84' }} />
      </Box>

      {message && (
        <Box sx={{ px: is960 ? 2 : 3, py: 1, bgcolor: 'rgba(239,68,68,0.15)', borderBottom: '1px solid rgba(239,68,68,0.25)' }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#FCA5A5', fontWeight: 600 }}>{message}</Typography>
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: is960 ? 1.25 : 1.75 }}>
          {ANDROID_SYSTEM_APPS.map((app) => {
            const installed = installedIds.includes(app.id);
            return (
              <ButtonBase
                key={app.id}
                onClick={() => handleSelect(app.id)}
                sx={{
                  borderRadius: '20px',
                  p: is960 ? 1.25 : 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: installed ? 'rgba(61,220,132,0.12)' : 'rgba(255,255,255,0.06)',
                  border: installed ? '1px solid rgba(61,220,132,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                {installed && (
                  <CheckCircleIcon sx={{ position: 'absolute', top: 8, right: 8, fontSize: 18, color: '#3DDC84' }} />
                )}
                <Box sx={{ width: is960 ? 52 : 60, height: is960 ? 52 : 60, borderRadius: '16px', bgcolor: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: is960 ? '1.2rem' : '1.35rem' }}>
                  {app.label.charAt(0)}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: is960 ? '0.72rem' : '0.82rem', textAlign: 'center', lineHeight: 1.25 }}>
                  {app.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
