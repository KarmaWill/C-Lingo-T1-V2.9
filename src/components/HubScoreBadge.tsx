import { Box, Typography } from '@mui/material';
import { scoreBadgeBackground } from '../hsk/diagnosticScore';

export default function HubScoreBadge({
  score,
  is960,
  passLine = 60,
}: {
  score?: number;
  is960: boolean;
  passLine?: number;
}) {
  const hasScore = score !== undefined;
  const size = is960 ? 50 : 62;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: is960 ? '14px' : '16px',
        background: scoreBadgeBackground(score, passLine),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: is960 ? 0.12 : 0.15,
        flexShrink: 0,
        boxShadow: hasScore ? '0 4px 12px rgba(15,23,42,0.16)' : '0 2px 6px rgba(15,23,42,0.06)',
      }}
    >
      <Typography
        sx={{
          fontSize: is960 ? '0.4rem' : '0.44rem',
          fontWeight: 800,
          color: hasScore ? 'rgba(255,255,255,0.85)' : '#9CA3AF',
          letterSpacing: '0.1em',
          lineHeight: 1,
          textAlign: 'center',
          width: '100%',
        }}
      >
        SCORE
      </Typography>
      <Typography
        sx={{
          fontSize: is960 ? '1.38rem' : '1.62rem',
          fontWeight: 900,
          color: hasScore ? '#FFFFFF' : '#9CA3AF',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {hasScore ? score : '--'}
      </Typography>
    </Box>
  );
}
