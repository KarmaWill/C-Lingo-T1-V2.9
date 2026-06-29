import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase, Switch } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import TimerIcon from '@mui/icons-material/Timer';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { resolveBackPath } from '../utils/navigateBack';

export default function ParentalControlsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [screenTimeLimit, setScreenTimeLimit] = useState(true);
  const [dailyLimitHours, setDailyLimitHours] = useState(2);
  const [contentFilter, setContentFilter] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [pinRequired, setPinRequired] = useState(true);

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white', borderBottom: '1px solid #F1F3F5' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location), { replace: true })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#374151' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827' }}>Parental Controls</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>Manage screen time, content, and app access</Typography>
        </Box>
        <FamilyRestroomIcon sx={{ fontSize: is960 ? 28 : 32, color: '#F65068' }} />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3, display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
        <ControlCard
          icon={<TimerIcon sx={{ color: '#2563EB' }} />}
          title="Daily Screen Time"
          description={`Limit learning device use to ${dailyLimitHours} hours per day.`}
          is960={is960}
          action={
            <Switch
              checked={screenTimeLimit}
              onChange={(_, v) => setScreenTimeLimit(v)}
              inputProps={{ 'aria-label': 'Daily screen time limit' }}
            />
          }
        >
          {screenTimeLimit && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
              {[1, 2, 3, 4].map((h) => (
                <ButtonBase
                  key={h}
                  onClick={() => setDailyLimitHours(h)}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    px: 1.5,
                    borderRadius: '12px',
                    bgcolor: dailyLimitHours === h ? '#2563EB' : '#EEF2FF',
                    color: dailyLimitHours === h ? 'white' : '#2563EB',
                    fontWeight: 800,
                    fontSize: is960 ? '0.82rem' : '0.9rem',
                  }}
                >
                  {h}h
                </ButtonBase>
              ))}
            </Box>
          )}
        </ControlCard>

        <ControlCard
          icon={<VisibilityOffIcon sx={{ color: '#F59E0B' }} />}
          title="Content Filter"
          description="Hide age-restricted apps and block unsafe web content."
          is960={is960}
          action={<Switch checked={contentFilter} onChange={(_, v) => setContentFilter(v)} inputProps={{ 'aria-label': 'Content filter' }} />}
        />

        <ControlCard
          icon={<LockIcon sx={{ color: '#0D9488' }} />}
          title="App Lock"
          description="Require parent approval before installing new apps."
          is960={is960}
          action={<Switch checked={appLock} onChange={(_, v) => setAppLock(v)} inputProps={{ 'aria-label': 'App lock' }} />}
        />

        <ControlCard
          icon={<LockIcon sx={{ color: '#F65068' }} />}
          title="PIN Protection"
          description="Parents must enter a PIN to change these settings."
          is960={is960}
          action={<Switch checked={pinRequired} onChange={(_, v) => setPinRequired(v)} inputProps={{ 'aria-label': 'PIN protection' }} />}
        />
      </Box>
    </Box>
  );
}

function ControlCard({
  icon,
  title,
  description,
  is960,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  is960: boolean;
  action: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', p: is960 ? 1.5 : 2, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#111827' }}>{title}</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#6B7280', mt: 0.35, lineHeight: 1.45 }}>{description}</Typography>
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}
