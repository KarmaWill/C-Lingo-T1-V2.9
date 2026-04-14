import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import GridViewIcon from '@mui/icons-material/GridView'
import BookOpenIcon from '@mui/icons-material/MenuBook'
import MapIcon from '@mui/icons-material/Map'
import CameraIcon from '@mui/icons-material/CameraAlt'
import AppsIcon from '@mui/icons-material/Apps'
import SmartToyIcon from '@mui/icons-material/SmartToy'

// Main navigation items (excluding AI)
const navItems = [
  { label: '首页', value: '/', icon: GridViewIcon },
  { label: '书籍', value: '/library', icon: BookOpenIcon },
  { label: '专项', value: '/specialized', icon: MapIcon },
  { label: '相机', value: '/camera', icon: CameraIcon },
  { label: '应用', value: '/apps', icon: AppsIcon },
]

export default function BottomNavigator() {
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(location.pathname)

  const isCameraPage = location.pathname === '/camera'
  const isAIPage = location.pathname === '/ai-chat'
  const isFullScreen = isCameraPage || isAIPage

  useEffect(() => {
    setValue(location.pathname)
  }, [location.pathname])

  return (
    <Box
      id="bottom-nav-container"
      sx={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) ${isFullScreen ? 'translateY(150px)' : 'translateY(0)'}`,
        opacity: isFullScreen ? 0 : 1,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        pointerEvents: isFullScreen ? 'none' : 'auto',
      }}
    >
      {/* Main Dock */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '32px',
          height: 84,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          gap: 1,
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}
      >
        {navItems.map((item) => {
          const isSelected = value === item.value
          const Icon = item.icon

          return (
            <ButtonBase
              key={item.value}
              onClick={() => navigate(item.value)}
              sx={{
                width: 72,
                height: 68,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '20px',
                transition: 'all 0.2s ease',
                color: isSelected ? '#00B4A0' : '#636E72',
                gap: 0.5,
                '&:active': {
                  transform: 'scale(0.9)',
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <Icon sx={{ fontSize: 26, mb: 0.25 }} />
              <Typography 
                sx={{ 
                  fontSize: '10px', 
                  fontWeight: 900, 
                  color: isSelected ? '#00B4A0' : '#9CA3AF',
                  letterSpacing: '0.02em'
                }}
              >
                {item.label}
              </Typography>
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: '#00B4A0',
                  }}
                />
              )}
            </ButtonBase>
          )
        })}
      </Box>

      {/* Siri-like AI Module */}
      <ButtonBase
        onClick={() => navigate('/ai-chat')}
        sx={{
          width: 84,
          height: 84,
          borderRadius: '32px',
          backgroundColor: value === '/ai-chat' ? '#4F46E5' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: value === '/ai-chat' ? 'white' : '#4F46E5',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          gap: 0.5,
          '&:active': {
            transform: 'scale(0.9)',
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <SmartToyIcon sx={{ fontSize: 32 }} />
          {/* Siri-like pulse effect when active or hover-like visual */}
          <Box
            sx={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '2px solid currentColor',
              opacity: 0.3,
              animation: 'siri-pulse 2s infinite ease-in-out'
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>AI</Typography>
      </ButtonBase>

      <style>{`
        @keyframes siri-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </Box>
  )
}
