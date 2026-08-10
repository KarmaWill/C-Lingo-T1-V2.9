import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import type { ReactNode } from 'react';

export function useHomeSideStyles(is960: boolean) {
  const sideCardSx = {
    p: is960 ? '1.15rem 1rem 1.15rem 1.25rem' : '1.55rem 1.2rem 1.55rem 1.65rem',
    borderRadius: is960 ? '28px' : '36px',
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
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.12)',
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
    bgcolor: 'rgba(255,255,255,0.22)',
    width: is960 ? 48 : 56,
    height: is960 ? 48 : 56,
    borderRadius: is960 ? '16px' : '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
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
        // Tablet shell is fixed landscape — never stack on viewport < lg (that caused the broken "compressed" home).
        gridTemplateColumns: 'minmax(0, 2.45fr) minmax(0, 1fr)',
        gridTemplateRows: 'minmax(0, 1fr)',
        gap: is960 ? 1.25 : 1.5,
        alignItems: 'stretch',
      }}
    >
      {children}
    </Box>
  );
}

function TitleBlock({
  label,
  lines,
  subtitle,
  is960,
}: {
  label?: string;
  lines?: [string, string];
  subtitle?: string;
  is960: boolean;
}) {
  return (
    <>
      {lines ? (
        <Typography
          component="div"
          sx={{
            fontWeight: 900,
            fontSize: is960 ? '0.95rem' : '1.28rem',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>{lines[0]}</span>
          <span>{lines[1]}</span>
        </Typography>
      ) : (
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: is960 ? '0.95rem' : '1.28rem',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </Typography>
      )}
      {subtitle ? (
        <Typography
          sx={{
            mt: is960 ? 0.45 : 0.6,
            fontSize: is960 ? '0.68rem' : '0.78rem',
            fontWeight: 650,
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.78)',
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </>
  );
}

export function HomeSideCard({
  label,
  lines,
  subtitle,
  bgcolor,
  icon,
  extra,
  is960,
  sideCardSx,
  sideTrailingSx,
  sideArrowSx,
  sideNextSx,
  onClick,
  variant = 'default',
  spotlightVisual,
  accentColor,
}: {
  label?: string;
  lines?: [string, string];
  subtitle?: string;
  bgcolor: string;
  icon?: ReactNode;
  extra?: ReactNode;
  is960: boolean;
  sideCardSx: object;
  sideTrailingSx?: object;
  sideArrowSx: object;
  sideNextSx?: object;
  onClick: () => void;
  /** default = legacy icon+chevron; spotlight = pill CTA + right visual; tool = glass arrow only */
  variant?: 'default' | 'spotlight' | 'tool';
  spotlightVisual?: ReactNode;
  accentColor?: string;
}) {
  const defaultStyles = useHomeSideStyles(is960);
  const accent = accentColor ?? bgcolor;

  if (variant === 'spotlight') {
    return (
      <Box
        onClick={onClick}
        sx={{
          ...sideCardSx,
          bgcolor,
          alignItems: 'stretch',
          // Match tool-card left inset so "AI Tutor" lines up with "Reading"
          pl: is960 ? '1.25rem' : '1.65rem',
          pr: 0,
          py: 0,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: is960 ? 1.15 : 1.4,
            // Nudge content slightly down to match tool-card visual weight
            pt: is960 ? 1.55 : 1.85,
            pb: is960 ? 1.05 : 1.2,
          }}
        >
          <TitleBlock label={label} lines={lines} is960={is960} />
          <Box
            sx={{
              mt: is960 ? 1.15 : 1.4,
              ml: is960 ? 0.35 : 0.5,
              width: is960 ? 42 : 48,
              height: is960 ? 42 : 48,
              borderRadius: '999px',
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.16)',
              flexShrink: 0,
            }}
            aria-hidden
          >
            <ArrowForwardRoundedIcon sx={{ fontSize: is960 ? 22 : 26, color: accent }} />
          </Box>
          {extra}
        </Box>
        <Box
          sx={{
            position: 'relative',
            width: is960 ? '48%' : '52%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            alignSelf: 'stretch',
            overflow: 'visible',
            // Pull mascot left into the card so ears stay visible
            ml: is960 ? -2.5 : -3.5,
            pr: is960 ? 0.25 : 0.5,
            zIndex: 2,
          }}
        >
          {spotlightVisual}
        </Box>
      </Box>
    );
  }

  if (variant === 'tool') {
    const toolArrowSx = {
      ...sideArrowSx,
      width: is960 ? 52 : 64,
      height: is960 ? 52 : 64,
      borderRadius: is960 ? '18px' : '22px',
      bgcolor: 'rgba(255,255,255,0.24)',
    };
    return (
      <Box onClick={onClick} sx={{ ...sideCardSx, bgcolor }}>
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, pr: 0.5 }}>
          <TitleBlock label={label} lines={lines} subtitle={subtitle} is960={is960} />
        </Box>
        <Box sx={toolArrowSx} aria-hidden>
          <ArrowForwardRoundedIcon sx={{ fontSize: is960 ? 26 : 30, color: 'rgba(255,255,255,0.96)' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box onClick={onClick} sx={{ ...sideCardSx, bgcolor }}>
      <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
        <TitleBlock label={label} lines={lines} subtitle={subtitle} is960={is960} />
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
