import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { resolveBackPath } from '../../utils/navigateBack';

interface HSKStandardPageShellProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function HSKStandardPageShell({ title, subtitle, icon, children }: HSKStandardPageShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#FBF7F7',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'rgba(255, 252, 252, 0.96)',
          borderBottom: '1px solid rgba(192, 57, 43, 0.1)',
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location, { defaultPath: '/hsk-standard' }), { replace: true })}
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(192, 57, 43, 0.08)',
            color: '#991B1B',
            flexShrink: 0,
            '&:active': { bgcolor: 'rgba(192, 57, 43, 0.14)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#991B1B', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#B45309', mt: 0.25, fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
    </Box>
  );
}
