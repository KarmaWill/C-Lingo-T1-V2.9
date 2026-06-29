import { useState } from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SystemPageShell from '../components/SystemPageShell';

import { PRODUCT_APPS, getPendingAppUpdatesCount } from '../data/appUpdatesCatalog';

export default function AppUpdatesPage() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [versions, setVersions] = useState(() =>
    Object.fromEntries(PRODUCT_APPS.map((app) => [app.id, app.current]))
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = getPendingAppUpdatesCount(versions);

  const handleUpdate = (id: string, latest: string) => {
    setUpdatingId(id);
    window.setTimeout(() => {
      setVersions((prev) => ({ ...prev, [id]: latest }));
      setUpdatingId(null);
    }, 1200);
  };

  return (
    <SystemPageShell
      title="App Updates"
      subtitle={pendingCount === 0 ? 'All products are up to date' : `${pendingCount} update(s) available`}
      icon={<SystemUpdateAltIcon sx={{ fontSize: is960 ? 28 : 32, color: '#00B4A0' }} />}
    >
      <Box sx={{ p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
        {PRODUCT_APPS.map((app) => {
          const installed = versions[app.id];
          const needsUpdate = installed !== app.latest;
          return (
            <Box key={app.id} sx={{ p: is960 ? 1.5 : 1.75, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                  {app.label.charAt(0)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#111827' }}>{app.label}</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#9CA3AF' }}>{app.packageName}</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.78rem', color: '#6B7280', mt: 0.35 }}>
                    v{installed} {needsUpdate ? `→ v${app.latest}` : '· latest'} · {app.size}
                  </Typography>
                </Box>
                {needsUpdate ? (
                  <ButtonBase
                    onClick={() => handleUpdate(app.id, app.latest)}
                    disabled={updatingId === app.id}
                    sx={{ minHeight: 44, px: 1.5, borderRadius: '14px', bgcolor: '#00B4A0', color: 'white', fontWeight: 800, fontSize: '0.78rem' }}
                  >
                    {updatingId === app.id ? 'Updating…' : 'Update'}
                  </ButtonBase>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669', fontWeight: 800, fontSize: '0.78rem' }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} /> Up to date
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </SystemPageShell>
  );
}
