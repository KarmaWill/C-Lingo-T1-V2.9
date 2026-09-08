import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, ButtonBase, Menu, MenuItem } from '@mui/material'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import { figmaPx, FIGMA_FONT } from '../../utils/figmaScale'
import HubLangProfile from './HubLangProfile'
import {
  HUB_CANVAS,
  HUB_FRAME_PAD_BOTTOM,
  HUB_FRAME_PAD_TOP,
  HUB_FRAME_PAD_X,
  HUB_SURFACE,
} from './hubChrome'
import {
  PROGRAM_TRACK_IDS,
  getProgramTrackById,
  getProgramBadgeKey,
  type ProgramTrackId,
} from '../../data/programTracks'

/** Menu 挂在 body，吃不到 #ipad-container 的壳层 scale，要自己乘回去 */
function useTabletShellScale() {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = document.getElementById('ipad-container')
    if (!el) return
    const sync = () => {
      const layoutW = el.offsetWidth || 1
      setScale(el.getBoundingClientRect().width / layoutW)
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])
  return scale
}

export type StudioMenuSelect = {
  label: string
  ariaLabel: string
  options: { value: string; label: string }[]
  onSelect: (value: string) => void
}

/**
 * Figma 主界面2 页内顶栏：AI Class Studio + 徽章 + 课轨 / Level / Unit 下拉
 * 三轨共用同一套壳，课轨身份只在徽章和下拉选项上。
 */
export default function StudioHomeHeader({
  screenSize,
  trackId,
  levelSelect,
  unitSelect,
}: {
  screenSize: string
  trackId: ProgramTrackId
  levelSelect: StudioMenuSelect
  unitSelect: StudioMenuSelect
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [programAnchor, setProgramAnchor] = useState<null | HTMLElement>(null)
  const [titleAnchor, setTitleAnchor] = useState<null | HTMLElement>(null)
  const [levelAnchor, setLevelAnchor] = useState<null | HTMLElement>(null)
  const [unitAnchor, setUnitAnchor] = useState<null | HTMLElement>(null)
  const p = (n: number) => figmaPx(n, screenSize)
  const shellScale = useTabletShellScale()
  /** 下拉挂 body，按壳层视觉比例出数，避免 zoom 和 Popover transform 互掐 */
  const m = (n: number) => Math.max(1, Math.round(p(n) * shellScale))
  const activeTrack = getProgramTrackById(trackId)!

  const menuPaperSx = {
    width: m(510),
    maxWidth: m(510),
    maxHeight: m(550),
    borderRadius: `${m(50)}px`,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    p: `${m(30)}px`,
    mt: `${m(8)}px`,
    overflow: 'hidden',
  }

  const menuListSx = {
    p: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${m(10)}px`,
    maxHeight: m(490),
    overflowY: 'auto',
  }

  const menuItemSx = {
    fontWeight: 700,
    fontSize: m(24),
    lineHeight: `${m(36)}px`,
    minHeight: m(90),
    height: m(90),
    flexShrink: 0,
    py: `${m(20)}px`,
    px: `${m(30)}px`,
    borderRadius: `${m(20)}px`,
    fontFamily: FIGMA_FONT,
    color: '#4B5563',
    '&.Mui-selected': {
      bgcolor: 'rgba(0, 180, 160, 0.06)',
      color: '#00B4A0',
    },
    '&.Mui-selected:hover': {
      bgcolor: 'rgba(0, 180, 160, 0.1)',
    },
  }

  const handleProgramSelect = (nextId: ProgramTrackId) => {
    const track = getProgramTrackById(nextId)
    if (track) navigate(track.route)
    setProgramAnchor(null)
    setTitleAnchor(null)
  }

  const selectSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${p(24)}px`,
    height: p(48),
    py: 0,
    px: 0,
    borderRadius: `${p(10)}px`,
    fontFamily: FIGMA_FONT,
    '&:active': { bgcolor: 'rgba(0,0,0,0.04)' },
    '&:focus-visible': {
      outline: `3px solid #00B4A0`,
      outlineOffset: 4,
    },
  } as const

  const selectTextSx = {
    fontWeight: 700,
    fontSize: p(32),
    lineHeight: `${p(48)}px`,
    color: '#777777',
    fontFamily: FIGMA_FONT,
    whiteSpace: 'nowrap' as const,
  }

  const chevronSx = {
    fontSize: p(25),
    color: '#9F9F9F',
    opacity: 0.7,
    flexShrink: 0,
  }

  const renderSelect = (
    select: StudioMenuSelect,
    anchor: HTMLElement | null,
    setAnchor: (el: HTMLElement | null) => void,
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <ButtonBase
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="true"
        aria-expanded={Boolean(anchor)}
        aria-label={select.ariaLabel}
        sx={selectSx}
      >
        <Typography sx={selectTextSx}>{select.label}</Typography>
        <KeyboardArrowDown sx={chevronSx} />
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: menuPaperSx }}
        MenuListProps={{ sx: menuListSx }}
      >
        {select.options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.label === select.label || option.value === select.label}
            onClick={() => {
              select.onSelect(option.value)
              setAnchor(null)
            }}
            sx={menuItemSx}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )

  return (
    <Box
      sx={{
        flexShrink: 0,
        mx: `-${p(HUB_FRAME_PAD_X)}px`,
        mt: `-${p(HUB_FRAME_PAD_TOP)}px`,
        mb: `${p(30)}px`,
        px: `${p(HUB_FRAME_PAD_X)}px`,
        pt: `${p(16)}px`,
        pb: `${p(12)}px`,
        bgcolor: HUB_SURFACE,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: p(90),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0 }}>
          <ButtonBase
            onClick={(e) => setTitleAnchor(e.currentTarget)}
            aria-label="Switch program"
            aria-haspopup="true"
            aria-expanded={Boolean(titleAnchor)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${p(24)}px`,
              borderRadius: `${p(12)}px`,
              '&:active': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: p(48),
                color: '#2D3436',
                lineHeight: `${p(72)}px`,
                fontFamily: FIGMA_FONT,
                whiteSpace: 'nowrap',
              }}
            >
              {t('program.hubTitle')}
            </Typography>
            <KeyboardArrowDown sx={chevronSx} />
          </ButtonBase>
          <Menu
            anchorEl={titleAnchor}
            open={Boolean(titleAnchor)}
            onClose={() => setTitleAnchor(null)}
            PaperProps={{ sx: menuPaperSx }}
            MenuListProps={{ sx: menuListSx }}
          >
            {PROGRAM_TRACK_IDS.map((id) => (
              <MenuItem
                key={id}
                selected={id === trackId}
                onClick={() => handleProgramSelect(id)}
                sx={menuItemSx}
              >
                {t(`program.tracks.${id}`)}
              </MenuItem>
            ))}
          </Menu>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${p(10)}px`,
              height: p(46),
              px: `${p(20)}px`,
              borderRadius: '999px',
              bgcolor: activeTrack.badge.bg,
              border: `1px solid ${activeTrack.badge.border}`,
              color: activeTrack.badge.color,
              boxShadow: 'none',
              flexShrink: 0,
            }}
          >
            {activeTrack.badge.dot ? (
              <Box
                sx={{
                  width: p(12),
                  height: p(12),
                  borderRadius: '50%',
                  bgcolor: activeTrack.badge.dot,
                  flexShrink: 0,
                }}
              />
            ) : null}
            <Typography
              sx={{
                fontSize: p(24),
                fontWeight: 400,
                letterSpacing: 0,
                textTransform: 'uppercase',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                color: 'inherit',
              }}
            >
              {t(getProgramBadgeKey(activeTrack.id))}
            </Typography>
          </Box>
        </Box>

        <HubLangProfile screenSize={screenSize} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: `${p(80)}px`,
          height: p(60),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ButtonBase
            onClick={(e) => setProgramAnchor(e.currentTarget)}
            aria-haspopup="true"
            aria-expanded={Boolean(programAnchor)}
            aria-label="Program track"
            sx={selectSx}
          >
            <Typography sx={selectTextSx}>{t(`program.tracks.${trackId}`)}</Typography>
            <KeyboardArrowDown sx={chevronSx} />
          </ButtonBase>
          <Menu
            anchorEl={programAnchor}
            open={Boolean(programAnchor)}
            onClose={() => setProgramAnchor(null)}
            PaperProps={{ sx: menuPaperSx }}
            MenuListProps={{ sx: menuListSx }}
          >
            {PROGRAM_TRACK_IDS.map((id) => (
              <MenuItem
                key={id}
                selected={id === trackId}
                onClick={() => handleProgramSelect(id)}
                sx={menuItemSx}
              >
                {t(`program.tracks.${id}`)}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {renderSelect(levelSelect, levelAnchor, setLevelAnchor)}
        {renderSelect(unitSelect, unitAnchor, setUnitAnchor)}
      </Box>
    </Box>
  )
}

export function HubTopBar({
  screenSize,
  children,
}: {
  screenSize: string
  children: ReactNode
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: p(90),
        mx: `-${p(HUB_FRAME_PAD_X)}px`,
        mt: `-${p(HUB_FRAME_PAD_TOP)}px`,
        mb: `${p(16)}px`,
        px: `${p(HUB_FRAME_PAD_X)}px`,
        pt: `${p(16)}px`,
        pb: `${p(12)}px`,
        bgcolor: HUB_SURFACE,
      }}
    >
      {children}
    </Box>
  )
}

export function StudioHomeFrame({
  screenSize,
  children,
}: {
  screenSize: string
  children: ReactNode
}) {
  const p = (n: number) => figmaPx(n, screenSize)
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: HUB_CANVAS,
        display: 'flex',
        flexDirection: 'column',
        pt: `${p(HUB_FRAME_PAD_TOP)}px`,
        px: `${p(HUB_FRAME_PAD_X)}px`,
        pb: `${p(HUB_FRAME_PAD_BOTTOM)}px`,
        fontFamily: FIGMA_FONT,
      }}
    >
      {children}
    </Box>
  )
}
