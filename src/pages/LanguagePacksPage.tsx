import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { useLocale } from '../context/LocaleContext'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'

type PackStatus = 'installed' | 'available' | 'update'

type LanguagePack = {
  id: string
  label: string
  status: PackStatus
  progress: number
  /** Built-in pack — never show Delete (PRD: en only) */
  builtin?: boolean
  /** Right-column cards show the soft teal status circle */
  showStatusCircle?: boolean
}

/** Figma subtitle-language-packs · 双栏语言卡顺序 */
const INITIAL_PACKS: LanguagePack[] = [
  { id: 'zh', label: '简体中文', status: 'installed', progress: 100 },
  { id: 'en', label: 'English', status: 'installed', progress: 100, builtin: true, showStatusCircle: true },
  { id: 'es', label: 'Español', status: 'available', progress: 0 },
  { id: 'ko', label: '한국어', status: 'available', progress: 0, showStatusCircle: true },
  { id: 'id', label: 'Bahasa Indonesia', status: 'available', progress: 0 },
  { id: 'fr', label: 'Français', status: 'available', progress: 0, showStatusCircle: true },
  { id: 'vi', label: 'Tiếng Việt', status: 'available', progress: 0 },
  { id: 'th', label: 'ไทย', status: 'available', progress: 0, showStatusCircle: true },
  { id: 'ja', label: '日本語', status: 'available', progress: 0 },
  { id: 'ar', label: 'العربية', status: 'available', progress: 0, showStatusCircle: true },
]

const PACK_SIZE_LABEL = '~8–16 MB'

function packMeta(pack: LanguagePack): string {
  if (pack.builtin && pack.status === 'installed') return 'Built-in · Always available'
  if (pack.status === 'installed') return 'Downloaded · Offline ready'
  return `Language pack · ${PACK_SIZE_LABEL}`
}

export default function LanguagePacksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { locale } = useLocale()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [packs, setPacks] = useState(INITIAL_PACKS)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const leftColumn = packs.filter((_, index) => index % 2 === 0)
  const rightColumn = packs.filter((_, index) => index % 2 === 1)
  const pendingDelete = packs.find((item) => item.id === pendingDeleteId) ?? null

  const handleDownload = (id: string) => {
    if (downloadingId) return
    setDownloadingId(id)
    let progress = packs.find((item) => item.id === id)?.progress ?? 0
    const timer = window.setInterval(() => {
      progress += 18
      setPacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, progress: Math.min(100, progress) } : item)),
      )
      if (progress >= 100) {
        window.clearInterval(timer)
        setPacks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: 'installed', progress: 100 } : item,
          ),
        )
        setDownloadingId(null)
      }
    }, 280)
  }

  const confirmDelete = () => {
    if (!pendingDeleteId) return
    setPacks((prev) =>
      prev.map((item) =>
        item.id === pendingDeleteId
          ? { ...item, status: 'available', progress: 0 }
          : item,
      ),
    )
    setPendingDeleteId(null)
  }

  const renderCard = (pack: LanguagePack) => {
    const installed = pack.status === 'installed'
    const downloading = downloadingId === pack.id
    const isCurrent = locale.id === pack.id
    const canDelete = installed && !pack.builtin
    const deleteBlocked = canDelete && isCurrent

    return (
      <Box
        key={pack.id}
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          minHeight: p(120),
          px: `${p(25)}px`,
          py: `${p(22)}px`,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: `${p(20)}px`,
          bgcolor: '#FFFFFF',
          border: `${Math.max(1, p(1.35))}px solid #E9EFF1`,
          borderRadius: `${p(21)}px`,
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
          {pack.showStatusCircle ? (
            <Box
              sx={{
                width: p(68),
                height: p(68),
                borderRadius: '50%',
                bgcolor: '#E6F7F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {installed ? (
                <CheckRoundedIcon sx={{ fontSize: p(30), color: '#00B4A0' }} />
              ) : (
                <FileDownloadOutlinedIcon sx={{ fontSize: p(30), color: '#00B4A0' }} />
              )}
            </Box>
          ) : null}

          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: `${p(10)}px`,
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(34),
                lineHeight: `${p(42)}px`,
                color: '#1A252C',
              }}
            >
              {pack.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(24),
                lineHeight: `${p(30)}px`,
                color: '#7B8A95',
              }}
            >
              {packMeta(pack)}
            </Typography>
            {downloading ? (
              <LinearProgress
                variant="determinate"
                value={pack.progress}
                sx={{
                  width: '100%',
                  maxWidth: p(320),
                  height: p(8),
                  borderRadius: 99,
                  bgcolor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': { bgcolor: '#00B4A0', borderRadius: 99 },
                }}
              />
            ) : null}
          </Box>
        </Box>

        {installed ? (
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: `${p(16)}px`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: `${p(14)}px`,
              }}
            >
              <Box
                sx={{
                  width: p(16),
                  height: p(16),
                  borderRadius: '50%',
                  bgcolor: '#00B4A0',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 600,
                  fontSize: p(28),
                  lineHeight: `${p(34)}px`,
                  color: '#00B4A0',
                  whiteSpace: 'nowrap',
                }}
              >
                Downloaded
              </Typography>
            </Box>
            {canDelete ? (
              <ButtonBase
                onClick={() => {
                  if (deleteBlocked) return
                  setPendingDeleteId(pack.id)
                }}
                disabled={deleteBlocked}
                aria-label={
                  deleteBlocked
                    ? `Switch to another language before deleting ${pack.label}`
                    : `Delete ${pack.label}`
                }
                title={deleteBlocked ? 'Switch to another language first' : `Delete ${pack.label}`}
                sx={{
                  flexShrink: 0,
                  minWidth: p(140),
                  height: p(70),
                  px: `${p(22)}px`,
                  borderRadius: `${p(22)}px`,
                  border: `${Math.max(1, p(2))}px solid ${deleteBlocked ? '#D1D5DB' : '#FECACA'}`,
                  bgcolor: deleteBlocked ? '#F3F4F6' : '#FEF2F2',
                  color: deleteBlocked ? '#9CA3AF' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${p(8)}px`,
                  fontFamily: FIGMA_FONT,
                  fontWeight: 600,
                  fontSize: p(26),
                  '&:active': { opacity: deleteBlocked ? 1 : 0.92 },
                  '&.Mui-disabled': { opacity: 1 },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: p(26) }} />
                Delete
              </ButtonBase>
            ) : null}
          </Box>
        ) : (
          <ButtonBase
            onClick={() => handleDownload(pack.id)}
            disabled={downloadingId !== null && downloadingId !== pack.id}
            sx={{
              flexShrink: 0,
              minWidth: p(166),
              height: p(70),
              px: `${p(28)}px`,
              borderRadius: `${p(22)}px`,
              bgcolor: '#00B4A0',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(10)}px`,
              fontFamily: FIGMA_FONT,
              fontWeight: 600,
              fontSize: p(26),
              '&:active': { opacity: 0.92 },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: p(26) }} />
            {pack.status === 'update' ? 'Update' : 'Download'}
          </ButtonBase>
        )}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F4F7F9',
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
          borderBottom: '1px solid #E2E8F0',
          boxSizing: 'border-box',
        }}
      >
        <HskPrepBackButton
          onClick={() => navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })}
          sx={{
            width: p(80),
            height: p(80),
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: p(40) },
          }}
        />
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${p(6)}px` }}>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: `${p(48)}px`,
              color: '#1E293B',
            }}
          >
            Language Packs
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(22),
              lineHeight: `${p(28)}px`,
              color: '#64748B',
            }}
          >
            Download language packs to enable local subtitles in videos.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(48)}px`,
          py: `${p(36)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: `${p(42)}px`,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(21)}px` }}>
            {leftColumn.map(renderCard)}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(21)}px` }}>
            {rightColumn.map(renderCard)}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDeleteId(null)}
        PaperProps={{
          sx: {
            width: p(420),
            maxWidth: '72%',
            borderRadius: `${p(20)}px`,
            fontFamily: FIGMA_FONT,
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.16)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(22),
            lineHeight: 1.3,
            color: '#1E293B',
            px: `${p(22)}px`,
            pt: `${p(20)}px`,
            pb: `${p(6)}px`,
          }}
        >
          Delete language pack?
        </DialogTitle>
        <DialogContent sx={{ px: `${p(22)}px`, py: 0 }}>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(16),
              lineHeight: 1.4,
              color: '#64748B',
            }}
          >
            Remove {pendingDelete?.label ?? 'this pack'} ({PACK_SIZE_LABEL}). You can download it again
            later.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: `${p(18)}px`,
            pt: `${p(16)}px`,
            pb: `${p(16)}px`,
            gap: `${p(8)}px`,
          }}
        >
          <ButtonBase
            onClick={() => setPendingDeleteId(null)}
            sx={{
              minWidth: p(96),
              height: p(44),
              px: `${p(16)}px`,
              borderRadius: `${p(12)}px`,
              bgcolor: '#F1F5F9',
              color: '#334155',
              fontFamily: FIGMA_FONT,
              fontWeight: 600,
              fontSize: p(15),
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            onClick={confirmDelete}
            sx={{
              minWidth: p(96),
              height: p(44),
              px: `${p(16)}px`,
              borderRadius: `${p(12)}px`,
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 600,
              fontSize: p(15),
              '&:active': { opacity: 0.92 },
            }}
          >
            Delete
          </ButtonBase>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
