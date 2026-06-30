import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ReactNode } from 'react';

export function useHomeSideStyles(is960: boolean) {
  const sideCardSx = {
    p: is960 ? '1.35rem 1rem 1.35rem 1.35rem' : '2.25rem 1.25rem 2.25rem 2.25rem',
    borderRadius: is960 ? '16px' : '24px',
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: is960 ? 0.75 : 1,
    cursor: 'pointer',
    transition: '0.3s',
    boxSizing: 'border-box' as const,
    '&:active': { transform: 'scale(0.98)' },
  };

  const sideTrailingSx = {
    display: 'flex',
    alignItems: 'center',
    gap: is960 ? 0.75 : 1,
    flexShrink: 0,
    zIndex: 1,
  };

  const sideArrowSx = {
    bgcolor: 'rgba(255,255,255,0.2)',
    width: is960 ? 44 : 52,
    height: is960 ? 44 : 52,
    borderRadius: is960 ? '14px' : '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    flexShrink: 0,
  };

  const sideNextSx = {
    color: 'rgba(255,255,255,0.92)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  };

  return { sideCardSx, sideTrailingSx, sideArrowSx, sideNextSx };
}

export function HomePageShell({
  is960,
  pageBg,
  children,
}: {
  is960: boolean;
  pageBg?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: is960 ? 2 : 3,
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: pageBg ?? 'transparent',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2.45fr) minmax(0, 1fr)' },
        gridTemplateRows: { xs: 'minmax(220px, 1fr) auto', lg: 'minmax(0, 1fr)' },
        gap: is960 ? 1.25 : 1.5,
        alignItems: 'stretch',
      }}
    >
      {children}
    </Box>
  );
}

export function HomeSideCard({
  label,
  lines,
  bgcolor,
  icon,
  extra,
  is960,
  sideCardSx,
  sideTrailingSx,
  sideArrowSx,
  sideNextSx,
  onClick,
}: {
  label?: string;
  lines?: [string, string];
  bgcolor: string;
  icon: ReactNode;
  extra?: ReactNode;
  is960: boolean;
  sideCardSx: object;
  sideTrailingSx?: object;
  sideArrowSx: object;
  sideNextSx?: object;
  onClick: () => void;
}) {
  const defaultStyles = useHomeSideStyles(is960);

  return (
    <Box onClick={onClick} sx={{ ...sideCardSx, bgcolor }}>
      <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
        {lines ? (
          <Typography
            component="div"
            sx={{
              fontWeight: 900,
              fontSize: is960 ? '0.9rem' : '1.22rem',
              lineHeight: 1.2,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>{lines[0]}</span>
            <span>{lines[1]}</span>
          </Typography>
        ) : (
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1.22rem', lineHeight: 1.2 }}>
            {label}
          </Typography>
        )}
        {extra}
      </Box>
      <Box sx={{ ...defaultStyles.sideTrailingSx, ...sideTrailingSx }}>
        <Box sx={sideArrowSx}>{icon}</Box>
        <Box sx={{ ...defaultStyles.sideNextSx, ...sideNextSx }} aria-hidden>
          <ChevronRightIcon sx={{ fontSize: is960 ? 22 : 26 }} />
        </Box>
      </Box>
    </Box>
  );
}

export function HomeSideCardStack({ is960, children }: { is960: boolean; children: ReactNode }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: { lg: '100%' },
        display: 'grid',
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
        gap: is960 ? 1.1 : 1.35,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
