import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Wifi, Bluetooth } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { getChromeThemeFromPath } from '../../data/programTracks';

export default function SystemStatusBar() {
  const location = useLocation();
  const chrome = getChromeThemeFromPath(location.pathname);
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
        bgcolor: chrome.statusBarBg,
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: chrome.statusBarBorder,
        zIndex: 1300,
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Left: Time */}
      <Typography
        sx={{
          fontSize: is960 ? '11px' : (is2000x1200 ? '17px' : (is1920x1125 ? '16px' : '13px')),
          fontWeight: 700,
          color: chrome.statusBarText,
          letterSpacing: '-0.02em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </Typography>

      {/* Right: Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : (is2000x1200 ? 2.5 : (is1920x1125 ? 2 : 1.5)) }}>
        <Bluetooth sx={{ fontSize: is960 ? 12 : (is2000x1200 ? 22 : (is1920x1125 ? 20 : 14)), color: chrome.statusBarIcon, opacity: 0.8, transition: 'color 0.5s' }} />
        <Wifi sx={{ fontSize: is960 ? 12 : (is2000x1200 ? 22 : (is1920x1125 ? 20 : 14)), color: chrome.statusBarIcon, opacity: 0.8, transition: 'color 0.5s' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.65 : 1 }}>
          <Typography sx={{ fontSize: is960 ? '10px' : (is2000x1200 ? '15px' : (is1920x1125 ? '14px' : '11px')), fontWeight: 700, color: chrome.statusBarText, letterSpacing: '-0.01em', transition: 'color 0.5s' }}>
            100%
          </Typography>
          <Box
            sx={{
              width: is960 ? 24 : (is2000x1200 ? 38 : (is1920x1125 ? 34 : 28)),
              height: is960 ? 11 : (is2000x1200 ? 15 : (is1920x1125 ? 14 : 12)),
              borderRadius: '5px',
              border: chrome.batteryBorder,
              boxSizing: 'border-box',
              p: '2px',
              display: 'flex',
              alignItems: 'stretch',
              transition: 'border-color 0.5s',
            }}
            aria-hidden
          >
            <Box
              sx={{
                flex: 1,
                maxWidth: '92%',
                borderRadius: '3px',
                background: chrome.batteryFill,
                transition: 'background 0.5s',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
