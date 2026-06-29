import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resolveBackPath } from '../utils/navigateBack';
import { NSK_STORE_APPS } from '../data/appsCatalog';

export default function NskAppStorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(NSK_STORE_APPS.map((app) => [app.id, app.status]))
  );

  const handleAction = (id: string, current: string) => {
    if (current === 'installed') return;
    setStatusMap((prev) => ({ ...prev, [id]: current === 'update' ? 'installed' : 'installed' }));
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#0F172A', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location), { replace: true })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem' }}>APK Upgrade</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: 'rgba(255,255,255,0.62)', mt: 0.25 }}>
            Update C-Lingo apps and learning packs
          </Typography>
        </Box>
        <ButtonBase
          onClick={() => navigate('/jxw-app-store', { state: location.state })}
          aria-label="Open NSK App Store"
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(56,189,248,0.14)',
            color: '#38BDF8',
            flexShrink: 0,
            transition: 'background 0.15s, transform 0.15s',
            '&:active': { bgcolor: 'rgba(56,189,248,0.28)', transform: 'scale(0.94)' },
          }}
        >
          <StorefrontIcon sx={{ fontSize: is960 ? 28 : 32 }} />
        </ButtonBase>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
        {NSK_STORE_APPS.map((app) => {
          const status = statusMap[app.id] ?? app.status;
          return (
            <Box
              key={app.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: is960 ? 1.25 : 1.5,
                p: is960 ? 1.5 : 1.75,
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Box sx={{ width: is960 ? 52 : 60, height: is960 ? 52 : 60, borderRadius: '16px', bgcolor: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', flexShrink: 0 }}>
                {app.label.charAt(0)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem' }}>{app.label}</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: 'rgba(255,255,255,0.55)', mt: 0.25 }}>
                  v{app.version} · {app.size}
                </Typography>
              </Box>
              <ButtonBase
                onClick={() => handleAction(app.id, status)}
                disabled={status === 'installed'}
                sx={{
                  minHeight: 44,
                  px: is960 ? 1.5 : 2,
                  borderRadius: '14px',
                  bgcolor: status === 'installed' ? 'rgba(255,255,255,0.08)' : status === 'update' ? '#F59E0B' : '#2563EB',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: is960 ? '0.76rem' : '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  opacity: status === 'installed' ? 0.7 : 1,
                }}
              >
                {status === 'installed' ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 18 }} /> Installed
                  </>
                ) : status === 'update' ? (
                  <>
                    <SystemUpdateAltIcon sx={{ fontSize: 18 }} /> Update
                  </>
                ) : (
                  <>
                    <CloudDownloadIcon sx={{ fontSize: 18 }} /> Install
                  </>
                )}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
