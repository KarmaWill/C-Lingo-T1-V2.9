import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase, Menu, MenuItem } from '@mui/material'
import { useLocale } from '../../context/LocaleContext'
import { figmaPx } from '../../utils/figmaScale'

/** Figma 主界面顶栏右侧：语言胶囊 + 吉祥物头像（朝向页面内侧） */
export default function HubLangProfile({
  screenSize,
  onDark = false,
}: {
  screenSize: string
  onDark?: boolean
}) {
  const navigate = useNavigate()
  const { locale, locales, setLocaleId } = useLocale()
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null)
  const p = (n: number) => figmaPx(n, screenSize)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(40)}px`, flexShrink: 0 }}>
      <ButtonBase
        onClick={(e) => setLangAnchor(e.currentTarget)}
        aria-label="Language"
        sx={{
          width: p(200),
          height: p(90),
          borderRadius: `${p(280)}px`,
          bgcolor: onDark ? 'rgba(244, 251, 248, 0.12)' : '#F3F4F6',
          border: onDark ? '1px solid rgba(244, 251, 248, 0.22)' : 'none',
          px: `${p(30)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: p(28) }}>{locale.flag}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: p(24), color: onDark ? '#F4FBF8' : '#4B5563' }}>
          {locale.label}
        </Typography>
        <Box
          component="span"
          sx={{
            width: 0,
            height: 0,
            borderLeft: `${p(8)}px solid transparent`,
            borderRight: `${p(8)}px solid transparent`,
            borderTop: `${p(10)}px solid ${onDark ? 'rgba(244, 251, 248, 0.7)' : '#9CA3AF'}`,
          }}
        />
      </ButtonBase>
      <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
        {locales.map((l) => (
          <MenuItem
            key={l.id}
            selected={l.id === locale.id}
            onClick={() => {
              setLocaleId(l.id)
              setLangAnchor(null)
            }}
          >
            {l.flag} {l.label}
          </MenuItem>
        ))}
      </Menu>

      <ButtonBase
        onClick={() => navigate('/profile')}
        aria-label="Profile"
        sx={{
          width: p(88),
          height: p(88),
          borderRadius: '50%',
          overflow: 'hidden',
          bgcolor: '#3EC5FE',
        }}
      >
        <Box
          component="img"
          src="/images/clingo-mascot-avatar.png?v=peace"
          alt=""
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </ButtonBase>
    </Box>
  )
}
