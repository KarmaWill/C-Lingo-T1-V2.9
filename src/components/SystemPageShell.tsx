import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import { HskPrepBackButton } from './hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'

interface SystemPageShellProps {
  title: string
  subtitle: string
  icon?: ReactNode
  children: ReactNode
  headerBg?: string
  pageBg?: string
}

export default function SystemPageShell({
  title,
  subtitle,
  icon,
  children,
  headerBg = '#FFFFFF',
  pageBg = '#F8F9F8',
}: SystemPageShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: pageBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: p(160),
          px: `${p(60)}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(24)}px`,
          bgcolor: headerBg,
          borderBottom: '1px solid #E2E2E3',
          boxSizing: 'border-box',
        }}
      >
        <HskPrepBackButton
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{ width: p(80), height: p(80), flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: p(40) } }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: `${p(58)}px`,
              color: '#2D3436',
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(24),
              lineHeight: `${p(32)}px`,
              color: '#636E72',
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {icon ? (
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        ) : null}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
    </Box>
  )
}
