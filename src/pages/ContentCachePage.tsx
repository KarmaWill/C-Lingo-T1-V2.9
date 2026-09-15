import { useState } from 'react'
import { Box, Typography, ButtonBase, LinearProgress } from '@mui/material'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined'
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined'
import SystemPageShell from '../components/SystemPageShell'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

const CACHE_ITEMS = [
  { id: 'fc-audio', label: 'Fun Chinese · Lesson Audio', type: 'audio' as const, size: '286 MB', cached: true },
  { id: 'fc-video', label: 'Fun Chinese · Culture Clips', type: 'video' as const, size: '412 MB', cached: true },
  { id: 'hsk-audio', label: 'HSK Prep · Listening Pack', type: 'audio' as const, size: '98 MB', cached: true },
  { id: 'cw-video', label: 'Character Writing · Stroke Videos', type: 'video' as const, size: '156 MB', cached: false },
  { id: 'culture-video', label: 'Culture Map · Region Videos', type: 'video' as const, size: '520 MB', cached: true },
]

export default function ContentCachePage() {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [items, setItems] = useState(CACHE_ITEMS)
  const [clearingId, setClearingId] = useState<string | null>(null)

  const totalCached = items.filter((i) => i.cached).reduce((sum, i) => sum + parseInt(i.size, 10), 0)

  const handleClear = (id: string) => {
    setClearingId(id)
    window.setTimeout(() => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, cached: false } : item)))
      setClearingId(null)
    }, 600)
  }

  return (
    <SystemPageShell
      title="Content Management"
      subtitle={`Cached media for offline use · ~${totalCached} MB total`}
      icon={<FolderOutlinedIcon sx={{ fontSize: p(40), color: '#64748B' }} />}
    >
      <Box
        sx={{
          px: `${p(60)}px`,
          py: `${p(40)}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${p(20)}px`,
        }}
      >
        {items.map((item) => {
          const TypeIcon = item.type === 'audio' ? AudiotrackOutlinedIcon : MovieOutlinedIcon
          const tone = item.type === 'audio'
            ? { tile: '#FEF3C7', icon: '#B45309' }
            : { tile: '#EDE9FE', icon: '#7C3AED' }
          return (
            <Box
              key={item.id}
              sx={{
                p: `${p(28)}px`,
                borderRadius: `${p(24)}px`,
                bgcolor: '#FFFFFF',
                border: '1px solid #E0E0DF',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px` }}>
                <Box
                  sx={{
                    width: p(80),
                    height: p(80),
                    borderRadius: `${p(20)}px`,
                    bgcolor: tone.tile,
                    color: tone.icon,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TypeIcon sx={{ fontSize: p(40) }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(28),
                      lineHeight: `${p(40)}px`,
                      color: '#2D3436',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(22),
                      lineHeight: `${p(32)}px`,
                      color: '#636E72',
                    }}
                  >
                    {item.cached ? `${item.size} cached` : 'Not cached · tap to prefetch'}
                  </Typography>
                </Box>
                {item.cached ? (
                  <ButtonBase
                    onClick={() => handleClear(item.id)}
                    disabled={clearingId === item.id}
                    sx={{
                      width: p(80),
                      height: p(80),
                      borderRadius: `${p(18)}px`,
                      bgcolor: '#FEF2F2',
                      color: '#DC2626',
                      flexShrink: 0,
                      '&.Mui-disabled': { opacity: 0.5 },
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                    aria-label={`Clear ${item.label}`}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: p(36) }} />
                  </ButtonBase>
                ) : (
                  <ButtonBase
                    sx={{
                      minWidth: p(160),
                      height: p(80),
                      px: `${p(28)}px`,
                      borderRadius: `${p(18)}px`,
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(24),
                      flexShrink: 0,
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    Prefetch
                  </ButtonBase>
                )}
              </Box>
              {clearingId === item.id && (
                <LinearProgress
                  sx={{
                    mt: `${p(20)}px`,
                    borderRadius: 99,
                    height: p(8),
                    bgcolor: '#FEE2E2',
                    '& .MuiLinearProgress-bar': { bgcolor: '#DC2626' },
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </SystemPageShell>
  )
}
