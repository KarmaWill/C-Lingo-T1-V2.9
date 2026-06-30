import { Box, Typography } from '@mui/material';

interface PinyinTianziGridProps {
  character: string;
  size?: number;
}

export default function PinyinTianziGrid({ character, size = 120 }: PinyinTianziGridProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '12px',
        border: '2px solid rgba(61,104,179,0.28)',
        bgcolor: '#FAFBFF',
        overflow: 'hidden',
        flexShrink: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: '8%',
          bottom: '8%',
          width: '1px',
          transform: 'translateX(-50%)',
          bgcolor: 'rgba(61,104,179,0.16)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '8%',
          right: '8%',
          height: '1px',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(61,104,179,0.16)',
        },
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.58,
          fontWeight: 700,
          color: '#0F172A',
          lineHeight: 1,
          fontFamily: '"KaiTi","STKaiti","SimKai",serif',
          zIndex: 1,
        }}
      >
        {character}
      </Typography>
    </Box>
  );
}
