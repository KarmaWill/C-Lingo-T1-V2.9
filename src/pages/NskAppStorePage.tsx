import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { NSK_STORE_APPS } from '../data/appsCatalog'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'

/** Figma apk-upgrade · brand tile colors */
const BRAND_BG: Record<string, string> = {
  'c-lingo': '#00D0B6',
  'scan-pen': '#4F46E5',
  'hsk-pack': '#1D75FF',
  'culture-pack': '#FF9F0A',
  'voice-pack': '#00B4A0',
}

export default function NskAppStorePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(NSK_STORE_APPS.map((app) => [app.id, app.status])),
  )

  const handleAction = (id: string, current: string) => {
    if (current === 'installed') return
    setStatusMap((prev) => ({ ...prev, [id]: 'installed' }))
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0B0E1A',
        color: '#FFFFFF',
        fontFamily: FIGMA_FONT,
        px: `${p(64)}px`,
        pt: `${p(48)}px`,
        pb: `${p(40)}px`,
        boxSizing: 'border-box',
        gap: `${p(58)}px`,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: `${p(20)}px`,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: `${p(24)}px`,
          }}
        >
          <HskPrepBackButton
            onClick={() => navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })}
            sx={{
              width: p(80),
              height: p(80),
              flexShrink: 0,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid #E0E0DF',
              color: '#FFFFFF',
              '&:active': { bgcolor: 'rgba(255,255,255,0.28)' },
              '& .MuiSvgIcon-root': { fontSize: p(40), color: '#FFFFFF' },
            }}
          />
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${p(4)}px` }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(40),
                lineHeight: `${p(48)}px`,
                color: '#FFFFFF',
              }}
            >
              APK Upgrade
            </Typography>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(22),
                lineHeight: `${p(28)}px`,
                color: '#8492A6',
              }}
            >
              Update C-Lingo apps and learning packs
            </Typography>
          </Box>
        </Box>

        <ButtonBase
          onClick={() => navigate('/jxw-app-store', { state: location.state })}
          aria-label="Open NSK App Store"
          sx={{
            width: p(78),
            height: p(78),
            flexShrink: 0,
            borderRadius: `${p(20)}px`,
            bgcolor: '#1C2237',
            border: '2px solid rgba(29, 117, 255, 0.3)',
            color: '#1D75FF',
            '&:active': { opacity: 0.9 },
          }}
        >
          <StorefrontOutlinedIcon sx={{ fontSize: p(36) }} />
        </ButtonBase>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: `${p(42)}px`,
          pr: `${p(4)}px`,
        }}
      >
        {NSK_STORE_APPS.map((app) => {
          const status = statusMap[app.id] ?? app.status
          const brandBg = BRAND_BG[app.id] ?? app.bg
          const installed = status === 'installed'
          const isUpdate = status === 'update'

          return (
            <Box
              key={app.id}
              sx={{
                boxSizing: 'border-box',
                width: '100%',
                minHeight: p(110),
                px: `${p(24)}px`,
                py: `${p(20)}px`,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: `${p(20)}px`,
                bgcolor: '#14192A',
                border: '1px solid #1E253F',
                borderRadius: `${p(16)}px`,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: `${p(24)}px`,
                }}
              >
                <Box
                  sx={{
                    width: p(70),
                    height: p(70),
                    borderRadius: `${p(20)}px`,
                    bgcolor: brandBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(30),
                    lineHeight: 1,
                    color: '#FFFFFF',
                  }}
                >
                  {app.label.charAt(0)}
                </Box>
                <Box
                  sx={{
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: `${p(8)}px`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(28),
                      lineHeight: `${p(34)}px`,
                      color: '#FFFFFF',
                    }}
                  >
                    {app.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(20),
                      lineHeight: `${p(26)}px`,
                      color: '#8492A6',
                    }}
                  >
                    v{app.version} · {app.size}
                  </Typography>
                </Box>
              </Box>

              <ButtonBase
                onClick={() => handleAction(app.id, status)}
                disabled={installed}
                sx={{
                  flexShrink: 0,
                  minWidth: p(186),
                  height: p(52),
                  px: `${p(28)}px`,
                  borderRadius: `${p(17)}px`,
                  bgcolor: installed ? '#202639' : isUpdate ? '#FF9F0A' : '#1D75FF',
                  color: installed ? '#6E7B91' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${p(10)}px`,
                  fontFamily: FIGMA_FONT,
                  fontWeight: 600,
                  fontSize: p(22),
                  '&:active': { opacity: installed ? 1 : 0.92 },
                  '&.Mui-disabled': { opacity: 1 },
                }}
              >
                {installed ? (
                  <>
                    <CheckRoundedIcon sx={{ fontSize: p(22), color: '#6E7B91' }} />
                    Installed
                  </>
                ) : isUpdate ? (
                  <>
                    <SyncRoundedIcon sx={{ fontSize: p(22) }} />
                    Update
                  </>
                ) : (
                  <>
                    <FileDownloadOutlinedIcon sx={{ fontSize: p(22) }} />
                    Install
                  </>
                )}
              </ButtonBase>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
