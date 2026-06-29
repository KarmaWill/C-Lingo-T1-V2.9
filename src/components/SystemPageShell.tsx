import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { resolveBackPath } from '../utils/navigateBack';

interface SystemPageShellProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  headerBg?: string;
  pageBg?: string;
}

export default function SystemPageShell({
  title,
  subtitle,
  icon,
  children,
  headerBg = 'white',
  pageBg = '#F8F9FA',
}: SystemPageShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: pageBg, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: headerBg, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <ButtonBase onClick={() => navigate(resolveBackPath(location), { replace: true })} sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#374151' }}>
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827' }}>{title}</Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>{subtitle}</Typography>
        </Box>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
    </Box>
  );
}
