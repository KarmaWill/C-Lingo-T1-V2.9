import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import WifiIcon from '@mui/icons-material/Wifi';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import Brightness6OutlinedIcon from '@mui/icons-material/Brightness6Outlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import BatteryFullOutlinedIcon from '@mui/icons-material/BatteryFullOutlined';
import { resolveBackPath } from '../utils/navigateBack';

const SETTINGS_SECTIONS = [
  {
    title: 'Network & connections',
    items: [
      { id: 'wifi', label: 'Wi‑Fi', value: 'C-Lingo-Office', icon: WifiIcon },
      { id: 'bluetooth', label: 'Bluetooth', value: 'On', icon: BluetoothIcon },
    ],
  },
  {
    title: 'Device',
    items: [
      { id: 'display', label: 'Display', value: 'Brightness 72%', icon: Brightness6OutlinedIcon },
      { id: 'sound', label: 'Sound', value: 'Media 65%', icon: VolumeUpOutlinedIcon },
      { id: 'battery', label: 'Battery', value: '87% · Optimized', icon: BatteryFullOutlinedIcon },
      { id: 'storage', label: 'Storage', value: '24 GB free', icon: StorageOutlinedIcon },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'apps', label: 'Apps', value: 'Default apps', icon: AppsOutlinedIcon, path: '/android-app-picker' },
      { id: 'language', label: 'Languages', value: 'English', icon: TranslateIcon, path: '/system/language-packs' },
      { id: 'security', label: 'Security', value: 'Screen lock on', icon: SecurityOutlinedIcon },
    ],
  },
];

export default function AndroidSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#F1F3F4', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white', borderBottom: '1px solid #E8EAED' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location, { defaultPath: '/android/home' }), { replace: true, state: location.state })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: '#F1F3F4', color: '#3C4043' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Typography sx={{ fontWeight: 500, fontSize: is960 ? '1.15rem' : '1.35rem', color: '#202124' }}>Settings</Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: is960 ? 1.5 : 2 }}>
        <Box sx={{ px: is960 ? 2 : 3, pb: 1.5 }}>
          <Box sx={{ p: is960 ? 1.75 : 2.25, borderRadius: '24px', bgcolor: 'white', boxShadow: '0 1px 3px rgba(60,64,67,0.12)' }}>
            <Typography sx={{ fontWeight: 500, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#202124' }}>NSK Tablet</Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#5F6368', mt: 0.5 }}>Android 14 · Build TQ3A.230805.001</Typography>
          </Box>
        </Box>

        {SETTINGS_SECTIONS.map((section) => (
          <Box key={section.title} sx={{ px: is960 ? 2 : 3, mb: is960 ? 1.5 : 2 }}>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', fontWeight: 700, color: '#5F6368', mb: 0.75, px: 0.5, letterSpacing: '0.02em' }}>
              {section.title.toUpperCase()}
            </Typography>
            <Box sx={{ borderRadius: '20px', bgcolor: 'white', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,64,67,0.12)' }}>
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ButtonBase
                    key={item.id}
                    onClick={() => item.path && navigate(item.path, { state: { from: '/android/settings', ...(location.state as object) } })}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: is960 ? 1.5 : 2,
                      py: is960 ? 1.25 : 1.5,
                      borderBottom: index < section.items.length - 1 ? '1px solid #E8EAED' : 'none',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      '&:active': { bgcolor: '#F8F9FA' },
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#E8F0FE', color: '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: is960 ? '0.92rem' : '1rem', color: '#202124' }}>{item.label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#5F6368', flexShrink: 0 }}>{item.value}</Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
