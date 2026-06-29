import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { ANDROID_SYSTEM_APPS } from '../data/appsCatalog';

const DOCK_APPS = ['chrome', 'gmail', 'maps', 'play-store'];

export default function AndroidHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const gridApps = ANDROID_SYSTEM_APPS.filter((app) => !DOCK_APPS.includes(app.id));
  const dockApps = DOCK_APPS.map((id) => ANDROID_SYSTEM_APPS.find((app) => app.id === id)).filter(Boolean);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
        color: 'white',
        position: 'relative',
      }}
    >
      <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, pt: is960 ? 2 : 2.75, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: is960 ? '2.5rem' : '3.25rem', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em' }}>{time}</Typography>
          <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.95rem', color: 'rgba(255,255,255,0.72)', mt: 0.75, fontWeight: 500 }}>{date}</Typography>
        </Box>
        <ButtonBase
          onClick={() => navigate('/android/settings', { state: location.state })}
          sx={{ minWidth: 48, minHeight: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', color: 'white' }}
          aria-label="Settings"
        >
          <SettingsOutlinedIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: is960 ? 2.5 : 3.5, py: is960 ? 1.5 : 2 }}>
        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', mb: 1.25, letterSpacing: '0.04em' }}>
          ALL APPS
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: is960 ? 1.25 : 1.75 }}>
          {gridApps.map((app) => (
            <ButtonBase
              key={app.id}
              onClick={() => navigate('/android-app-picker', { state: { from: '/android/home', ...(location.state as object) } })}
              sx={{ borderRadius: '20px', p: is960 ? 1 : 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, '&:active': { transform: 'scale(0.96)' } }}
            >
              <Box sx={{ width: is960 ? 54 : 62, height: is960 ? 54 : 62, borderRadius: '18px', bgcolor: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: is960 ? '1.2rem' : '1.35rem', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
                {app.label.charAt(0)}
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.25, color: 'rgba(255,255,255,0.92)' }}>
                {app.label}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, pb: is960 ? 2 : 2.75, pt: 1 }}>
        <Box sx={{ mx: 'auto', maxWidth: 520, px: is960 ? 1.5 : 2, py: is960 ? 1 : 1.25, borderRadius: '28px', bgcolor: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 1 }}>
          {dockApps.map((app) => app && (
            <ButtonBase key={app.id} sx={{ borderRadius: '16px', p: 0.5, '&:active': { transform: 'scale(0.92)' } }}>
              <Box sx={{ width: is960 ? 48 : 54, height: is960 ? 48 : 54, borderRadius: '16px', bgcolor: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                {app.label.charAt(0)}
              </Box>
            </ButtonBase>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.25 }}>
          <Box sx={{ width: 120, height: 5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.35)' }} />
        </Box>
      </Box>
    </Box>
  );
}
