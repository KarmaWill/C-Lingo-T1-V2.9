import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import WifiIcon from '@mui/icons-material/Wifi'
import BluetoothIcon from '@mui/icons-material/Bluetooth'
import Brightness6OutlinedIcon from '@mui/icons-material/Brightness6Outlined'
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined'
import TranslateIcon from '@mui/icons-material/Translate'
import BatteryFullOutlinedIcon from '@mui/icons-material/BatteryFullOutlined'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'

const SETTINGS_SECTIONS = [
  {
    title: 'Network & connections',
    items: [
      { id: 'wifi', label: 'Wi‑Fi', value: 'C-Lingo-Office', icon: WifiIcon },
      { id: 'bluetooth', label: 'Bluetooth', value: 'On', icon: BluetoothIcon },
    ],
  },
  {
    title: 'Device',
    items: [
      { id: 'display', label: 'Display', value: 'Brightness 72%', icon: Brightness6OutlinedIcon },
      { id: 'sound', label: 'Sound', value: 'Media 65%', icon: VolumeUpOutlinedIcon },
      { id: 'battery', label: 'Battery', value: '87% · Optimized', icon: BatteryFullOutlinedIcon },
      { id: 'storage', label: 'Storage', value: '24 GB free', icon: StorageOutlinedIcon },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'apps', label: 'Apps', value: 'Default apps', icon: AppsOutlinedIcon, path: '/android-app-picker' },
      { id: 'language', label: 'Languages', value: 'English', icon: TranslateIcon, path: '/system/language-packs' },
      { id: 'security', label: 'Security', value: 'Screen lock on', icon: SecurityOutlinedIcon },
    ],
  },
] as const

/**
 * Android Settings · DESIGN.md Locked 铬：
 * APP_SCREEN_SIZE + figmaPx、80 Back、字阶 24/32/40、青绿强调（去 Material 蓝）。
 */
export default function AndroidSettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#F6F7F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: p(160),
          px: `${p(54)}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(24)}px`,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxSizing: 'border-box',
        }}
      >
        <HskPrepBackButton
          onClick={() =>
            navigate(resolveBackPath(location, { defaultPath: '/apps' }), {
              replace: true,
              state: location.state,
            })
          }
          sx={{
            width: p(80),
            height: p(80),
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: p(40) },
          }}
        />
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: `${p(48)}px`,
            color: '#2D3436',
          }}
        >
          Settings
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(48)}px`,
          py: `${p(32)}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: `${p(28)}px`,
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            px: `${p(32)}px`,
            py: `${p(28)}px`,
            borderRadius: `${p(24)}px`,
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            boxShadow: '0px 4px 20px rgba(213,213,213,0.35)',
          }}
        >
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(32),
              lineHeight: `${p(40)}px`,
              color: '#2D3436',
            }}
          >
            NSK Tablet
          </Typography>
          <Typography
            sx={{
              mt: `${p(8)}px`,
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(24),
              lineHeight: `${p(30)}px`,
              color: '#636E72',
            }}
          >
            Android 14 · Build TQ3A.230805.001
          </Typography>
        </Box>

        {SETTINGS_SECTIONS.map((section) => (
          <Box key={section.title} sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: `${p(12)}px` }}>
            <Typography
              sx={{
                px: `${p(8)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(22),
                lineHeight: `${p(28)}px`,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#A5B0BA',
              }}
            >
              {section.title}
            </Typography>
            <Box
              sx={{
                borderRadius: `${p(24)}px`,
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
                border: '1px solid #E0E0DF',
                boxShadow: '0px 4px 20px rgba(213,213,213,0.35)',
              }}
            >
              {section.items.map((item, index) => {
                const Icon = item.icon
                const hasPath = 'path' in item && Boolean(item.path)
                return (
                  <ButtonBase
                    key={item.id}
                    onClick={() => {
                      if (!hasPath || !('path' in item) || !item.path) return
                      navigate(item.path, {
                        state: { from: '/android/settings', ...(location.state as object) },
                      })
                    }}
                    disabled={!hasPath}
                    sx={{
                      width: '100%',
                      minHeight: p(96),
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(24)}px`,
                      px: `${p(28)}px`,
                      py: `${p(18)}px`,
                      borderBottom: index < section.items.length - 1 ? '1px solid #E8ECEF' : 'none',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      '&.Mui-disabled': { opacity: 1 },
                      '&:active': hasPath ? { bgcolor: 'rgba(0, 180, 160, 0.06)' } : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        width: p(68),
                        height: p(68),
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 180, 160, 0.1)',
                        color: '#00B4A0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: p(32) }} />
                    </Box>
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: FIGMA_FONT,
                        fontWeight: 600,
                        fontSize: p(28),
                        lineHeight: `${p(34)}px`,
                        color: '#2D3436',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        flexShrink: 0,
                        fontFamily: FIGMA_FONT,
                        fontWeight: 400,
                        fontSize: p(24),
                        lineHeight: `${p(30)}px`,
                        color: '#636E72',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
