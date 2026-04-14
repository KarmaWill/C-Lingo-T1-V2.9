import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SchoolIcon from '@mui/icons-material/School'
import AppsIcon from '@mui/icons-material/Apps'
import CameraIcon from '@mui/icons-material/CameraAlt'

// Order: Library first, then Learn, then HSK, then Explore (round button is Camera)
const navItems = [
  { label: 'Library', value: '/Home', icon: HomeRoundedIcon },
  /** Hub: Start Session on home → /lesson/:id */
  { label: 'Learn', value: '/AI', icon: SmartToyIcon },
  { label: 'HSK', value: '/hsk-test', icon: SchoolIcon },
  { label: 'Explore', value: '/apps', icon: AppsIcon },
]

export default function BottomNavigator() {
  const navigate = useNavigate()
  const location = useLocation()

  const goCamera = () => {
    navigate('/camera')
    // Fallback: ensure route change even if SPA navigation is blocked by runtime state
    setTimeout(() => {
      if (window.location.pathname !== '/camera') {
        window.location.assign('/camera')
      }
    }, 0)
  }

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is2000x1200 = screenSize === '2000x1200'
  const is1920x1125 = screenSize === '1920x1125'

  const isCameraPage = location.pathname === '/camera'
  const isAIPage = location.pathname === '/ai-chat'
  const isFullScreen = isCameraPage || isAIPage

  const isNavSelected = (item: (typeof navItems)[number]) => {
    if (item.value === '/AI') {
      return (
        location.pathname === '/AI' ||
        location.pathname === '/' ||
        location.pathname.startsWith('/lesson')
      )
    }
    if (item.value === '/Home') {
      return location.pathname === '/Home' || location.pathname === '/library'
    }
    if (item.value === '/hsk-test') {
      return (
        location.pathname === '/hsk-test' ||
        location.pathname === '/hsk-prep-test' ||
        location.pathname === '/hsk-mock-exam'
      )
    }
    return location.pathname === item.value
  }

  return (
    <Box
      id="bottom-nav-container"
      sx={{
        position: 'absolute',
        bottom: is960 ? 16 : (is2000x1200 ? 36 : (is1920x1125 ? 32 : 24)),
        left: '50%',
        transform: `translateX(-50%) ${isFullScreen ? 'translateY(150px)' : 'translateY(0)'}`,
        opacity: isFullScreen ? 0 : 1,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: is960 ? 1 : (is2000x1200 ? 1.75 : (is1920x1125 ? 1.5 : 1.25)),
        pointerEvents: isFullScreen ? 'none' : 'auto',
      }}
    >
      {/* 四 Tab 页位置指示 — 与主导航同步，全 App 通用 */}
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: is960 ? 0.75 : 1,
          height: is960 ? 14 : 16,
        }}
      >
        {navItems.map((item) => {
          const active = isNavSelected(item)
          return (
            <Box
              key={`dot-${item.value}`}
              sx={{
                width: is960 ? 7 : 8,
                height: is960 ? 7 : 8,
                borderRadius: '50%',
                bgcolor: active ? '#00B4A0' : 'rgba(45, 51, 54, 0.2)',
                flexShrink: 0,
                transition: 'background-color 0.25s ease',
              }}
            />
          )
        })}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : (is2000x1200 ? 3 : (is1920x1125 ? 2.5 : 2)),
        }}
      >
      {/* Main Dock */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: is960 ? '24px' : (is2000x1200 ? '44px' : (is1920x1125 ? '40px' : '32px')),
          height: is960 ? 64 : (is2000x1200 ? 110 : (is1920x1125 ? 100 : 84)),
          display: 'flex',
          alignItems: 'center',
          px: is960 ? 1.5 : (is2000x1200 ? 3 : (is1920x1125 ? 2.5 : 2)),
          gap: is960 ? 0.75 : (is2000x1200 ? 1.75 : (is1920x1125 ? 1.5 : 1)),
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}
      >
        {navItems.map((item) => {
          const isSelected = isNavSelected(item)
          const Icon = item.icon

          return (
            <ButtonBase
              key={item.value}
              onClick={() => (item.value === '/camera' ? goCamera() : navigate(item.value))}
              sx={{
                width: is960 ? 56 : (is2000x1200 ? 96 : (is1920x1125 ? 88 : 72)),
                height: is960 ? 52 : (is2000x1200 ? 92 : (is1920x1125 ? 84 : 68)),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: is960 ? '16px' : (is2000x1200 ? '26px' : (is1920x1125 ? '24px' : '20px')),
                transition: 'all 0.2s ease',
                color: isSelected ? '#00B4A0' : '#636E72',
                gap: 0.5,
                '&:active': {
                  transform: 'scale(0.9)',
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <Icon sx={{ fontSize: is960 ? 28 : (is2000x1200 ? 48 : (is1920x1125 ? 44 : 36)) }} />
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: is960 ? 6 : (is2000x1200 ? 10 : (is1920x1125 ? 8 : 2)),
                    width: is960 ? 4 : (is2000x1200 ? 7 : (is1920x1125 ? 6 : 5)),
                    height: is960 ? 4 : (is2000x1200 ? 7 : (is1920x1125 ? 6 : 5)),
                    borderRadius: '50%',
                    bgcolor: '#00B4A0',
                  }}
                />
              )}
            </ButtonBase>
          )
        })}
      </Box>

      {/* Camera shortcut */}
      <ButtonBase
        onClick={goCamera}
        sx={{
          width: is960 ? 64 : (is1920x1125 ? 100 : 84),
          height: is960 ? 64 : (is1920x1125 ? 100 : 84),
          borderRadius: is960 ? '24px' : (is1920x1125 ? '40px' : '32px'),
          backgroundColor: location.pathname === '/camera' ? '#4F46E5' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: location.pathname === '/camera' ? 'white' : '#4F46E5',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          gap: 0.5,
          '&:active': {
            transform: 'scale(0.9)',
          }
        }}
      >
        <CameraIcon sx={{ fontSize: is960 ? 30 : (is2000x1200 ? 48 : (is1920x1125 ? 44 : 36)) }} />
      </ButtonBase>
      </Box>
    </Box>
  )
}
