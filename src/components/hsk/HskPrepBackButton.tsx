import { ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import type { SxProps, Theme } from '@mui/material/styles'

/** 诊断 intro 锁定的备考线 Back：80 圆、白底、#E0E0DF、顶左 (60, 78) */
export const HSK_PREP_BACK = {
  size: 80,
  icon: 40,
  left: 60,
  top: 78,
} as const

export function HskPrepBackButton({
  onClick,
  disabled,
  sx,
}: {
  onClick: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label="Back"
      sx={{
        width: HSK_PREP_BACK.size,
        height: HSK_PREP_BACK.size,
        borderRadius: '100px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0DF',
        color: '#2D3436',
        flexShrink: 0,
        '&:active': { bgcolor: '#F9FAFB' },
        '&:focus-visible': {
          outline: '3px solid #00B4A0',
          outlineOffset: 3,
        },
        '&.Mui-disabled': { opacity: 0.45 },
        ...sx,
      }}
    >
      <ChevronLeftIcon sx={{ fontSize: HSK_PREP_BACK.icon }} />
    </ButtonBase>
  )
}
