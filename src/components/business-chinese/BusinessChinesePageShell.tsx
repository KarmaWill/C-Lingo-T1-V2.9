import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { resolveBackPath } from '../../utils/navigateBack';

interface BusinessChinesePageShellProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function BusinessChinesePageShell({ title, subtitle, icon, children }: BusinessChinesePageShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'rgba(18, 18, 18, 0.96)',
          borderBottom: '1px solid rgba(212, 168, 83, 0.15)',
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location, { defaultPath: '/business-chinese' }), { replace: true })}
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(212, 168, 83, 0.12)',
            color: '#D4A853',
            flexShrink: 0,
            '&:active': { bgcolor: 'rgba(212, 168, 83, 0.2)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#F5F0E8', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: 'rgba(212,168,83,0.65)', mt: 0.25, fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
    </Box>
  );
}
