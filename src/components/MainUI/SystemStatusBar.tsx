import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Wifi, Bluetooth } from '@mui/icons-material';

export default function SystemStatusBar() {
  const [time, setTime] = useState(new Date());
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is2000x1200 = screenSize === '2000x1200'
  const is1920x1125 = screenSize === '1920x1125'

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      id="system-status-bar"
      sx={{
        height: is960 ? 24 : (is2000x1200 ? 44 : (is1920x1125 ? 40 : 32)),
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: is960 ? 2 : (is2000x1200 ? 5 : (is1920x1125 ? 4 : 3)),
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.04)',
        zIndex: 1300,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {/* Left: Time */}
      <Typography
        sx={{
          fontSize: is960 ? '11px' : (is2000x1200 ? '17px' : (is1920x1125 ? '16px' : '13px')),
          fontWeight: 700,
          color: '#1F2937',
          letterSpacing: '-0.02em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        }}
      >
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </Typography>

      {/* Right: Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : (is2000x1200 ? 2.5 : (is1920x1125 ? 2 : 1.5)) }}>
        <Bluetooth sx={{ fontSize: is960 ? 12 : (is2000x1200 ? 22 : (is1920x1125 ? 20 : 14)), color: '#374151', opacity: 0.8 }} />
        <Wifi sx={{ fontSize: is960 ? 12 : (is2000x1200 ? 22 : (is1920x1125 ? 20 : 14)), color: '#374151', opacity: 0.8 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.65 : 1 }}>
          <Typography sx={{ fontSize: is960 ? '10px' : (is2000x1200 ? '15px' : (is1920x1125 ? '14px' : '11px')), fontWeight: 700, color: '#374151', letterSpacing: '-0.01em' }}>
            100%
          </Typography>
          <Box
            sx={{
              width: is960 ? 24 : (is2000x1200 ? 38 : (is1920x1125 ? 34 : 28)),
              height: is960 ? 11 : (is2000x1200 ? 15 : (is1920x1125 ? 14 : 12)),
              borderRadius: '5px',
              border: '1.5px solid rgba(55,65,81,0.4)',
              boxSizing: 'border-box',
              p: '2px',
              display: 'flex',
              alignItems: 'stretch',
            }}
            aria-hidden
          >
            <Box
              sx={{
                flex: 1,
                maxWidth: '92%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #6EE7B7 0%, #10B981 55%, #059669 100%)',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

