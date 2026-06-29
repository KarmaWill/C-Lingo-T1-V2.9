import { Box, Typography, ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CheckIcon from '@mui/icons-material/Check'
import LockIcon from '@mui/icons-material/Lock'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StarIcon from '@mui/icons-material/Star'
import { useNavigate } from 'react-router-dom'

type NodeStatus = 'done' | 'current' | 'locked'

interface GrammarNode {
  id: string
  level: string
  title: string
  point: string
  status: NodeStatus
}

/** Grammar learning path — winding roadmap of grammar points (HSK 1 → up). */
const GRAMMAR_PATH: GrammarNode[] = [
  { id: 'g1', level: 'HSK 1', title: 'Basic word order', point: '主 + 谓 + 宾', status: 'done' },
  { id: 'g2', level: 'HSK 1', title: 'The 是 sentence', point: 'A 是 B', status: 'done' },
  { id: 'g3', level: 'HSK 1', title: 'Yes/no questions', point: '…吗？', status: 'done' },
  { id: 'g4', level: 'HSK 1', title: 'Possession with 的', point: 'N + 的 + N', status: 'current' },
  { id: 'g5', level: 'HSK 2', title: 'Past with 了', point: 'V + 了', status: 'locked' },
  { id: 'g6', level: 'HSK 2', title: 'Comparison 比', point: 'A 比 B …', status: 'locked' },
  { id: 'g7', level: 'HSK 2', title: 'Progressive 在', point: '在 + V', status: 'locked' },
  { id: 'g8', level: 'HSK 3', title: 'Complement of degree', point: 'V + 得 + adj', status: 'locked' },
  { id: 'g9', level: 'HSK 3', title: 'The 把 sentence', point: '把 + O + V', status: 'locked' },
]

export default function HSKGoStudyPlaceholderPage() {
  const navigate = useNavigate()
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const accent = '#3B59F6'
  const nodeSize = is960 ? 64 : 76
  const headerPadX = is960 ? 1.75 : 2.25
  const headerPadY = is960 ? 1 : 1.25
  const backBtnSize = is960 ? 44 : 48
  // 三列蛇形布局：0=左, 1=中, 2=右, 1=中 …
  const columnFor = (idx: number) => {
    const pattern = [0, 1, 2, 1]
    return pattern[idx % pattern.length]
  }

  const doneCount = GRAMMAR_PATH.filter((n) => n.status === 'done').length

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFF8F0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.25 : 1.5,
          px: headerPadX,
          py: headerPadY,
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'white',
          boxSizing: 'border-box',
          minHeight: backBtnSize + headerPadY * 2,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/hsk-test')}
          sx={{
            width: backBtnSize,
            height: backBtnSize,
            minWidth: backBtnSize,
            minHeight: backBtnSize,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '&:active': { transform: 'scale(0.95)', bgcolor: '#E2E8F0' },
          }}
          aria-label="Back"
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 24 : 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.28rem', color: '#0F172A', lineHeight: 1.2 }}>
            Grammar Snap
          </Typography>
          <Typography noWrap sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 600 }}>
            {doneCount}/{GRAMMAR_PATH.length} grammar points mastered
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            px: is960 ? 1 : 1.25,
            py: is960 ? 0.45 : 0.55,
            borderRadius: '999px',
            bgcolor: '#EEF2FF',
            flexShrink: 0,
          }}
        >
          <StarIcon sx={{ fontSize: is960 ? 16 : 18, color: accent }} />
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.8rem' : '0.9rem', color: accent }}>
            {doneCount * 10}
          </Typography>
        </Box>
      </Box>

      {/* Path */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 2 : 3, py: is960 ? 2.5 : 3.5 }}>
        <Box
          sx={{
            position: 'relative',
            maxWidth: 560,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: is960 ? 2.5 : 3.25,
          }}
        >
          {GRAMMAR_PATH.map((node, idx) => {
            const col = columnFor(idx)
            const align = col === 0 ? 'flex-start' : col === 2 ? 'flex-end' : 'center'
            const isDone = node.status === 'done'
            const isCurrent = node.status === 'current'
            const isLocked = node.status === 'locked'

            const nodeBg = isLocked ? '#E5E7EB' : isDone ? '#C7D2FE' : accent
            const nodeColor = isLocked ? '#9CA3AF' : isDone ? accent : '#FFFFFF'

            return (
              <Box key={node.id} sx={{ display: 'flex', justifyContent: align }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: is960 ? 150 : 180 }}>
                  <ButtonBase
                    disabled={isLocked}
                    sx={{
                      width: nodeSize,
                      height: nodeSize,
                      borderRadius: '50%',
                      bgcolor: nodeBg,
                      color: nodeColor,
                      boxShadow: isCurrent
                        ? `0 10px 24px ${accent}66, 0 0 0 6px ${accent}22`
                        : isLocked
                        ? 'none'
                        : '0 6px 16px rgba(59,89,246,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.15s',
                      '&:active': isLocked ? {} : { transform: 'scale(0.95)' },
                    }}
                  >
                    {isDone ? (
                      <CheckIcon sx={{ fontSize: is960 ? 30 : 36 }} />
                    ) : isCurrent ? (
                      <PlayArrowIcon sx={{ fontSize: is960 ? 32 : 38 }} />
                    ) : (
                      <LockIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                    )}
                  </ButtonBase>

                  <Box
                    sx={{
                      mt: 1,
                      px: is960 ? 1.1 : 1.35,
                      py: is960 ? 0.75 : 0.9,
                      borderRadius: is960 ? '12px' : '14px',
                      bgcolor: isCurrent ? 'white' : 'rgba(255,255,255,0.7)',
                      border: isCurrent ? `2px solid ${accent}` : '1px solid rgba(15,23,42,0.06)',
                      boxShadow: isCurrent ? '0 8px 20px rgba(59,89,246,0.18)' : '0 2px 8px rgba(15,23,42,0.05)',
                      textAlign: 'center',
                      width: '100%',
                      opacity: isLocked ? 0.7 : 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.52rem' : '0.58rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: isLocked ? '#9CA3AF' : accent,
                        textTransform: 'uppercase',
                        mb: 0.3,
                      }}
                    >
                      {node.level}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.78rem' : '0.88rem',
                        fontWeight: 900,
                        color: isLocked ? '#9CA3AF' : '#111827',
                        lineHeight: 1.25,
                        mb: 0.3,
                      }}
                    >
                      {node.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.72rem' : '0.82rem',
                        fontWeight: 700,
                        color: isLocked ? '#CBD5E1' : '#6B7280',
                        lineHeight: 1.3,
                      }}
                    >
                      {node.point}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
