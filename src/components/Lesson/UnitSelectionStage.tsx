import { Box, Typography, LinearProgress, ButtonBase } from '@mui/material'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DescriptionIcon from '@mui/icons-material/Description'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { SxProps, Theme } from '@mui/material/styles'
import { Lesson, Unit } from '../../types/lesson'

type HubBlockProps = {
  sx?: SxProps<Theme>
  is960: boolean
  is1920: boolean
  allLessonsDone: boolean
  onSelectUpsell: () => void
  navigate: NavigateFunction
}

/** 参考稿：未 100% 完成课时 → 整块玻璃遮罩；完成后 → AI Tutor + Audio Reading + Video 全亮 */
function DeepLearningHubBlock({ sx, is960, is1920, allLessonsDone, onSelectUpsell, navigate }: HubBlockProps) {
  const pad = is960 ? 1.25 : is1920 ? 1.75 : 1.5
  /** 硬朗圆角：与右侧 Bonus / Hub 外框一致 */
  const r = is960 ? '12px' : is1920 ? '16px' : '14px'
  const titleSize = is960 ? '0.95rem' : is1920 ? '1.15rem' : '1.1rem'

  const aiTitle = is1920 ? '1.35rem' : is960 ? '1.05rem' : '1.2rem'

  const chip = (label: string) => (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: is960 ? 1 : 1.25,
        py: 0.35,
        borderRadius: '999px',
        bgcolor: 'rgba(255,255,255,0.22)',
        color: 'white',
        fontWeight: 800,
        fontSize: is960 ? '0.55rem' : '0.65rem',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: allLessonsDone ? '#F8FAFC' : 'transparent',
        border: allLessonsDone ? '1px solid rgba(0,0,0,0.06)' : 'none',
        minHeight: 0,
        height: '100%',
        ...sx,
        ...(!allLessonsDone ? { p: 0 } : {}),
      }}
    >
      {!allLessonsDone ? (
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            width: '100%',
            height: '100%',
            alignSelf: 'stretch',
            borderRadius: 'inherit',
            overflow: 'hidden',
            isolation: 'isolate',
          }}
        >
          {/* 玻璃拟态背景：半透明，可透视后方内容 */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(18px) saturate(150%)',
              WebkitBackdropFilter: 'blur(18px) saturate(150%)',
              border: '1.5px solid rgba(255,255,255,0.52)',
              borderRadius: 'inherit',
            }}
          />
          {/* 淡淡的渐变提升层次 */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(165deg, rgba(255,255,255,0.18) 0%, rgba(100,116,139,0.08) 100%)',
              borderRadius: 'inherit',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 3,
              bgcolor: 'rgba(100,116,139,0.24)',
              backdropFilter: 'blur(8px)',
              borderBottomLeftRadius: is960 ? '10px' : '12px',
              px: is960 ? 1.1 : 1.35,
              py: is960 ? 0.65 : 0.85,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            <LockIcon sx={{ fontSize: is960 ? 20 : 24, color: '#475569' }} />
          </Box>

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              minHeight: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: is960 ? 2 : 3,
              py: is960 ? 2 : 2.5,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: is960 ? '1.1rem' : is1920 ? '1.65rem' : '1.35rem',
                color: '#1F2937',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(255,255,255,0.5)',
              }}
            >
              Deep Learning Hub
            </Typography>
            <Typography
              sx={{
                mt: is960 ? 1 : 1.25,
                fontWeight: 700,
                fontSize: is960 ? '0.78rem' : is1920 ? '1rem' : '0.9rem',
                color: '#64748B',
              }}
            >
              Unlock at 100%
            </Typography>
            <Typography
              sx={{
                mt: is960 ? 0.75 : 1,
                fontWeight: 600,
                fontSize: is960 ? '0.62rem' : '0.72rem',
                color: '#94A3B8',
                maxWidth: 280,
                lineHeight: 1.45,
              }}
            >
              Complete all lessons in this unit to unlock AI Tutor, Audio Reading, and Video.
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ flexShrink: 0, mb: is960 ? 1 : 1.25 }}>
            <Typography sx={{ fontWeight: 900, fontSize: titleSize, color: '#1F2937' }}>Deep Learning Hub</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1.15fr 0.85fr' },
              gridTemplateRows: { xs: 'auto auto auto', sm: '1fr 1fr' },
              gap: is960 ? 1 : 1.25,
              alignItems: 'stretch',
            }}
          >
            <ButtonBase
              onClick={() => onSelectUpsell()}
              sx={{
                gridColumn: { xs: '1', sm: '1' },
                gridRow: { xs: 'auto', sm: '1 / 3' },
                borderRadius: r,
                overflow: 'hidden',
                display: 'block',
                textAlign: 'left',
                position: 'relative',
                minHeight: { xs: is960 ? 120 : 140, sm: 0 },
                bgcolor: 'transparent',
                p: 0,
                background: 'linear-gradient(145deg, #2563EB 0%, #1D4ED8 42%, #312E81 100%)',
                boxShadow: '0 12px 32px rgba(37,99,235,0.35)',
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <Box
                sx={{
                  p: pad,
                  height: '100%',
                  minHeight: { xs: 0, sm: is1920 ? 200 : 180 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: aiTitle, color: 'white', letterSpacing: '-0.02em' }}>AI Tutor</Typography>
                    {chip('Daily speaking')}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.95 }}>
                    <AutoAwesomeIcon sx={{ fontSize: is960 ? 36 : 44, color: 'rgba(255,255,255,0.35)' }} />
                    <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', maxWidth: 120 }} />
                  </Box>
                </Box>
                <Box
                  sx={{
                    alignSelf: 'flex-start',
                    mt: 1.5,
                    px: is960 ? 1.5 : 2,
                    py: is960 ? 0.75 : 1,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: '#1E40AF',
                    fontWeight: 900,
                    fontSize: is960 ? '0.72rem' : '0.85rem',
                  }}
                >
                  Enter AI practice
                </Box>
              </Box>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/audio-reading')}
              sx={{
                gridColumn: { xs: '1', sm: '2' },
                gridRow: { xs: 'auto', sm: '1' },
                borderRadius: r,
                overflow: 'hidden',
                display: 'block',
                textAlign: 'left',
                p: 0,
                minHeight: is960 ? 100 : 112,
                background: 'linear-gradient(145deg, #9333EA 0%, #6D28D9 55%, #4C1D95 100%)',
                boxShadow: '0 8px 24px rgba(147,51,234,0.3)',
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <Box sx={{ p: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1.05rem', color: 'white' }}>Audio Reading</Typography>
                </Box>
                <MenuBookIcon sx={{ alignSelf: 'flex-end', fontSize: is960 ? 32 : 38, color: 'rgba(255,255,255,0.35)' }} />
              </Box>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/culture-video')}
              sx={{
                gridColumn: { xs: '1', sm: '2' },
                gridRow: { xs: 'auto', sm: '2' },
                borderRadius: r,
                overflow: 'hidden',
                display: 'block',
                textAlign: 'left',
                p: 0,
                minHeight: is960 ? 100 : 112,
                background: 'linear-gradient(145deg, #FB923C 0%, #EA580C 55%, #C2410C 100%)',
                boxShadow: '0 8px 24px rgba(234,88,12,0.28)',
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <Box sx={{ p: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1.05rem', color: 'white' }}>Video</Typography>
                </Box>
                <PlayCircleOutlineIcon sx={{ alignSelf: 'flex-end', fontSize: is960 ? 34 : 40, color: 'rgba(255,255,255,0.4)' }} />
              </Box>
            </ButtonBase>
          </Box>
        </>
      )}
    </Box>
  )
}

interface Props {
  lesson: Lesson
  completedUnitIds: string[]
  onSelectUnit: (unit: Unit) => void
  onSelectCulture: () => void
  onSelectUpsell: () => void
}

export default function UnitSelectionStage({ lesson, completedUnitIds, onSelectUnit, onSelectCulture, onSelectUpsell }: Props) {
  const navigate = useNavigate()
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920 = screenSize === '1920x1125'

  const firstUnit = lesson.units[0]
  const totalLessons = 3
  const completedLessons = firstUnit ? completedUnitIds.filter(id => id.startsWith(`${firstUnit.id}-lesson-`)).length : 0
  const cultureUnlocked = totalLessons > 0 ? (completedLessons / totalLessons) >= (2/3) : false
  const allLessonsDone = completedLessons >= totalLessons
  const unitProgressPercent = 10
  /** 右侧 Bonus / Deep Learning Hub 外框：硬朗小圆角（与 flex 4:6 布局共用） */
  const rightColCardRadius = is960 ? '12px' : '14px'

  // 1920x1125 设计稿尺寸（px），其他分辨率按比例
  const px = (v1920: number, v960?: number) => {
    if (is1920) return v1920
    if (is960 && v960 !== undefined) return v960
    const scale = is960 ? 0.5 : 0.533
    return Math.round(v1920 * scale)
  }

  // 设计稿参数（1920x1125）：绝对位置与尺寸
  /** 右侧 Bonus : Hub ≈ 4 : 6（总高约 925px，含间距） */
  const layout1920RightGap = 12
  const layout1920RightTotal = 925
  const bonus1920H = Math.round(((layout1920RightTotal - layout1920RightGap) * 4) / 10)
  const hub1920H = layout1920RightTotal - layout1920RightGap - bonus1920H

  const layout1920 = {
    unitGoal: { width: 1060, height: 210, left: 60, top: 200 },
    lessonCard: { width: 1060, height: 710, left: 60, top: 450, borderRadius: 40, borderWidth: 1 },
    buttonsRow: { width: 1058, height: 110, left: 61, top: 1049 },
    bonusClass: { width: 700, height: bonus1920H, left: 1160, top: 200 },
    deepHub: { width: 700, height: hub1920H, left: 1160, top: 200 + bonus1920H + layout1920RightGap },
  }

  // 1920x1125 使用设计稿绝对定位布局
  if (is1920) {
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#F1F5F9', boxSizing: 'border-box' }}>
        {/* Header — 参考：白顶栏 */}
        <Box sx={{ position: 'absolute', left: 0, top: 0, right: 0, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, boxSizing: 'border-box', bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
          <ButtonBase
            onClick={() => navigate('/')}
            sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F1F5F9', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', '&:active': { transform: 'scale(0.95)' } }}
          >
            <ChevronLeftIcon sx={{ fontSize: 28 }} />
          </ButtonBase>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ px: 2, py: 0.6, bgcolor: '#00B4A0', color: 'white', borderRadius: '12px', fontSize: '1rem', fontWeight: 900 }}>
              Level {lesson.hskLevel ?? 1}
            </Box>
            <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>C-Lingo Chinese</Typography>
          </Box>
          <Box sx={{ width: 56 }} />
        </Box>

        {/* Unit Goal Card - 1060×210, left 60, top 200 */}
        <Box
          sx={{
            position: 'absolute',
            left: layout1920.unitGoal.left,
            top: layout1920.unitGoal.top,
            width: layout1920.unitGoal.width,
            height: layout1920.unitGoal.height,
            bgcolor: 'white',
            borderRadius: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ width: 72, height: 72, borderRadius: '18px', bgcolor: '#FFF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,107,53,0.2)' }}>
            <GpsFixedIcon sx={{ fontSize: 36, color: '#EA580C' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#6B7280', fontSize: '1rem', mb: 0.5 }}>After this unit, I can:</Typography>
            <Typography sx={{ color: '#1F2937', fontSize: '1.25rem', mb: 1 }}>Name staple Chinese foods like rice and dumplings.</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <LinearProgress variant="determinate" value={unitProgressPercent} sx={{ height: 10, borderRadius: 6, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#00B4A0', borderRadius: 6 } }} />
              </Box>
              <Typography sx={{ fontWeight: 900, color: '#00B4A0', fontSize: '1.1rem', minWidth: 48, textAlign: 'right' }}>{unitProgressPercent}%</Typography>
            </Box>
          </Box>
        </Box>

        {/* Lesson Card - 设计稿: 1060×710, left 60, top 450, border-radius 40px, border 1px */}
        <Box
          sx={{
            position: 'absolute',
            left: 60,
            top: 450,
            width: 1060,
            height: 710,
            border: '1px solid #E5E7EB',
            borderRadius: '40px',
            bgcolor: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: '1.35rem', p: 3, pb: 2, flexShrink: 0 }}>Lesson 1 | Staple Food</Typography>
          {/* 课节列表 + Study Report / Mistakes 同在一个方框内 */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', px: 3, pb: 2, boxSizing: 'border-box' }}>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', overflowX: 'hidden', mb: 2 }}>
              {(() => {
                if (!firstUnit) return null
                const lessonTitles = ['Lesson 1: Rice', 'Lesson 2: Dumplings', 'Lesson 3: Eat Baozi']
                const lessons: Array<{ id: string; title: string; questions: typeof firstUnit.questions; learnings: typeof firstUnit.learnings }> = []
                const questionsPerLesson = 3
                const learningsPerLesson = 3
                for (let i = 0; i < Math.min(firstUnit.questions.length, 9); i += questionsPerLesson) {
                  const lessonIndex = i / questionsPerLesson
                  const learningStart = lessonIndex * learningsPerLesson
                  const lessonLearnings = firstUnit.learnings.slice(learningStart, learningStart + learningsPerLesson)
                  const finalLearnings = lessonLearnings.length > 0 ? lessonLearnings : firstUnit.learnings.slice(0, Math.min(learningsPerLesson, firstUnit.learnings.length))
                  lessons.push({
                    id: `lesson-${lessonIndex + 1}`,
                    title: lessonTitles[lessonIndex] ?? `Lesson ${lessonIndex + 1}`,
                    questions: firstUnit.questions.slice(i, i + questionsPerLesson),
                    learnings: finalLearnings,
                  })
                }

                return lessons.map((lessonItem, idx) => {
                  const prevLessonId = idx > 0 ? `${firstUnit.id}-lesson-${idx}` : null
                  const currentLessonId = `${firstUnit.id}-lesson-${idx + 1}`
                  const isPrevDone = idx === 0 || (prevLessonId != null && completedUnitIds.includes(prevLessonId))
                  const isLocked = !isPrevDone
                  const isDone = completedUnitIds.includes(currentLessonId)
                  const isCurrent = idx === completedLessons && !isDone && !isLocked
                  const totalTasks = lessonItem.learnings.length + lessonItem.questions.length

                  return (
                    <ButtonBase
                      key={lessonItem.id}
                      disabled={isLocked}
                      onClick={() => {
                        const tempUnit: Unit = {
                          ...firstUnit,
                          id: currentLessonId,
                          title: lessonItem.title,
                          questions: lessonItem.questions,
                          learnings: lessonItem.learnings,
                        }
                        onSelectUnit(tempUnit)
                      }}
                      sx={{
                        width: '100%',
                        p: is1920 ? 2 : (is960 ? 1 : 1.5),
                        borderRadius: is1920 ? '16px' : (is960 ? '12px' : '14px'),
                        bgcolor: isDone ? '#E8F5E9' : isCurrent ? '#FFF4E6' : isLocked ? '#F3F4F6' : 'white',
                        border: '2px solid',
                        borderColor: isDone ? '#4CAF50' : isCurrent ? '#FF6B35' : isLocked ? '#E5E7EB' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: is1920 ? 2 : (is960 ? 1 : 1.5),
                        textAlign: 'left',
                        opacity: isLocked ? 0.7 : 1,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        '&:active': { transform: isLocked ? 'none' : 'scale(0.98)' },
                      }}
                    >
                      <Box sx={{ width: px(48), height: px(48), borderRadius: '12px', bgcolor: isDone ? '#4CAF50' : isCurrent ? '#00B4A0' : isLocked ? '#9CA3AF' : '#00B4A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DescriptionIcon sx={{ fontSize: px(24), color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif', fontWeight: 700, color: isDone ? '#2E7D32' : isCurrent ? '#E65100' : '#1F2937', fontSize: is1920 ? '32px' : (is960 ? '0.8rem' : '1rem'), lineHeight: 1.6, mb: 0.25 }}>{lessonItem.title}</Typography>
                        <Typography sx={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif', fontWeight: 400, color: '#6B7280', fontSize: is1920 ? '24px' : (is960 ? '0.65rem' : '0.85rem'), lineHeight: 1.6 }}>{lessonItem.learnings.length} cards + {lessonItem.questions.length} practices</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Typography sx={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif', fontWeight: 400, fontSize: is1920 ? '24px' : (is960 ? '0.7rem' : '0.8rem'), color: '#9CA3AF', textAlign: 'right' }}>{totalTasks} tasks</Typography>
                        {isDone && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleIcon sx={{ fontSize: px(22), color: 'white' }} /></Box>}
                        {isCurrent && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowForwardIcon sx={{ fontSize: px(22), color: 'white' }} /></Box>}
                        {isLocked && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LockIcon sx={{ fontSize: px(20), color: '#9CA3AF' }} /></Box>}
                      </Box>
                    </ButtonBase>
                  )
                })
              })()}
            </Box>

            {/* 设计稿：1058×110，距左 1px（整体 left 61） */}
            <Box sx={{ flexShrink: 0, height: 110, width: 1058, mx: '1px', mb: 1, display: 'flex', gap: 2, alignItems: 'center', boxSizing: 'border-box' }}>
              <ButtonBase onClick={() => navigate('/study-report', { state: { lesson } })} sx={{ flex: 1, height: '100%', borderRadius: '16px', bgcolor: '#00B4A0', color: 'white', fontWeight: 900, fontSize: '1.05rem', '&:active': { transform: 'scale(0.98)' } }}>
                Study Report
              </ButtonBase>
              <ButtonBase onClick={() => navigate('/mistakes-review', { state: { lesson } })} sx={{ flex: 1, height: '100%', borderRadius: '16px', bgcolor: '#FF6B35', color: 'white', fontWeight: 900, fontSize: '1.05rem', '&:active': { transform: 'scale(0.98)' } }}>
                Mistakes
              </ButtonBase>
            </Box>
          </Box>
        </Box>

        {/* Bonus Class - 700×460, left 1160, top 200 */}
        <Box
          sx={{
            position: 'absolute',
            left: layout1920.bonusClass.left,
            top: layout1920.bonusClass.top,
            width: layout1920.bonusClass.width,
            height: layout1920.bonusClass.height,
            bgcolor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#FFD93D', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <CardGiftcardIcon sx={{ fontSize: 40, color: '#1F2937' }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: '#1F2937', mb: 0.5 }}>Bonus Class</Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>{cultureUnlocked ? 'Content unlocked' : 'Unlock at 60%'}</Typography>
          </Box>
          <ButtonBase disabled={!cultureUnlocked} onClick={onSelectCulture} sx={{ width: '100%', py: 1.5, borderRadius: '16px', bgcolor: cultureUnlocked ? '#00B4A0' : '#E8ECEF', color: cultureUnlocked ? 'white' : '#64748B', fontWeight: 900, fontSize: '1.05rem', '&:active': { transform: 'scale(0.98)' } }}>
            {cultureUnlocked ? 'Enter' : 'Locked'}
          </ButtonBase>
        </Box>

        <DeepLearningHubBlock
          is960={false}
          is1920={true}
          allLessonsDone={allLessonsDone}
          onSelectUpsell={onSelectUpsell}
          navigate={navigate}
          sx={{
            position: 'absolute',
            left: layout1920.deepHub.left,
            top: layout1920.deepHub.top,
            width: layout1920.deepHub.width,
            height: layout1920.deepHub.height,
            borderRadius: '16px',
            p: 2.5,
            boxShadow: '0 8px 28px rgba(15,23,42,0.08)',
          }}
        />
      </Box>
    )
  }

  // 非 1920x1125：与参考稿一致的 flex 布局
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9', p: is960 ? 1.5 : 2, boxSizing: 'border-box', gap: is960 ? 1 : 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, minHeight: px(56), bgcolor: 'white', borderRadius: is960 ? '14px' : '18px', px: is960 ? 1.5 : 2, py: is960 ? 1 : 1.25, boxShadow: '0 1px 0 rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <ButtonBase onClick={() => navigate('/')} sx={{ width: px(56), height: px(56), borderRadius: '50%', bgcolor: '#F1F5F9', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', '&:active': { transform: 'scale(0.95)' } }}>
          <ChevronLeftIcon sx={{ fontSize: px(28) }} />
        </ButtonBase>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ px: 2, py: 0.6, bgcolor: '#00B4A0', color: 'white', borderRadius: '12px', fontSize: is960 ? '0.75rem' : '0.875rem', fontWeight: 900 }}>Level {lesson.hskLevel ?? 1}</Box>
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '1rem' : '1.25rem', letterSpacing: '-0.02em' }}>C-Lingo Chinese</Typography>
        </Box>
        <Box sx={{ width: px(56) }} />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: is960 ? 1.5 : 2, overflow: 'hidden', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.5, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'white', borderRadius: is960 ? '16px' : '20px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', border: '1px solid rgba(0,0,0,0.05)', p: is960 ? 1.5 : 2.5, display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.5, flexShrink: 0, boxSizing: 'border-box' }}>
            <Box sx={{ width: px(72), height: px(72), borderRadius: '18px', bgcolor: '#FFF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(234,88,12,0.15)' }}>
              <GpsFixedIcon sx={{ fontSize: px(36), color: '#EA580C' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: '#6B7280', fontSize: is960 ? '0.8rem' : '0.9rem', mb: 0.5 }}>After this unit, I can:</Typography>
              <Typography sx={{ color: '#1F2937', fontSize: is960 ? '0.85rem' : '1rem', mb: 1.5 }}>Name staple Chinese foods like rice and dumplings.</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <LinearProgress variant="determinate" value={unitProgressPercent} sx={{ height: is960 ? 6 : 8, borderRadius: 6, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#00B4A0', borderRadius: 6 } }} />
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#00B4A0', fontSize: is960 ? '0.85rem' : '1rem', minWidth: 48, textAlign: 'right' }}>{unitProgressPercent}%</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'white', borderRadius: is960 ? '16px' : '20px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', border: '1px solid rgba(0,0,0,0.05)', p: is960 ? 1.5 : 2.5, overflow: 'hidden', boxSizing: 'border-box' }}>
            <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.9rem' : '1.1rem', mb: 2, flexShrink: 0 }}>Lesson 1 | Staple Food</Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: is960 ? 0.75 : 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {firstUnit && (() => {
                const lessonTitles = ['Lesson 1: Rice', 'Lesson 2: Dumplings', 'Lesson 3: Eat Baozi']
                const lessons: Array<{ id: string; title: string; questions: typeof firstUnit.questions; learnings: typeof firstUnit.learnings }> = []
                for (let i = 0; i < Math.min(firstUnit.questions.length, 9); i += 3) {
                  const lessonIndex = i / 3
                  const learningStart = lessonIndex * 3
                  const lessonLearnings = firstUnit.learnings.slice(learningStart, learningStart + 3)
                  lessons.push({
                    id: `lesson-${lessonIndex + 1}`,
                    title: lessonTitles[lessonIndex] ?? `Lesson ${lessonIndex + 1}`,
                    questions: firstUnit.questions.slice(i, i + 3),
                    learnings: lessonLearnings.length > 0 ? lessonLearnings : firstUnit.learnings.slice(0, 3),
                  })
                }
                return lessons.map((lessonItem, idx) => {
                  const prevLessonId = idx > 0 ? `${firstUnit.id}-lesson-${idx}` : null
                  const currentLessonId = `${firstUnit.id}-lesson-${idx + 1}`
                  const isPrevDone = idx === 0 || (prevLessonId != null && completedUnitIds.includes(prevLessonId))
                  const isLocked = !isPrevDone
                  const isDone = completedUnitIds.includes(currentLessonId)
                  const isCurrent = idx === completedLessons && !isDone && !isLocked
                  const totalTasks = lessonItem.learnings.length + lessonItem.questions.length
                  return (
                    <ButtonBase
                      key={lessonItem.id}
                      disabled={isLocked}
                      onClick={() => onSelectUnit({ ...firstUnit, id: currentLessonId, title: lessonItem.title, questions: lessonItem.questions, learnings: lessonItem.learnings })}
                      sx={{
                        width: '100%', p: is960 ? 1 : 1.5, borderRadius: is960 ? '12px' : '14px',
                        bgcolor: isDone ? '#E8F5E9' : isCurrent ? '#FFF4E6' : isLocked ? '#F3F4F6' : 'white',
                        border: '2px solid', borderColor: isDone ? '#4CAF50' : isCurrent ? '#FF6B35' : isLocked ? '#E5E7EB' : '#E5E7EB',
                        display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.5, textAlign: 'left', opacity: isLocked ? 0.7 : 1, flexShrink: 0, boxSizing: 'border-box',
                        '&:active': { transform: isLocked ? 'none' : 'scale(0.98)' },
                      }}
                    >
                      <Box sx={{ width: px(48), height: px(48), borderRadius: '12px', bgcolor: isDone ? '#4CAF50' : isCurrent ? '#00B4A0' : isLocked ? '#9CA3AF' : '#00B4A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DescriptionIcon sx={{ fontSize: px(24), color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, color: isDone ? '#2E7D32' : isCurrent ? '#E65100' : '#1F2937', fontSize: is960 ? '0.8rem' : '1rem', mb: 0.25 }}>{lessonItem.title}</Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: is960 ? '0.65rem' : '0.85rem' }}>{lessonItem.learnings.length} cards + {lessonItem.questions.length} practices</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.8rem', fontWeight: 700, color: '#9CA3AF' }}>{totalTasks} tasks</Typography>
                        {isDone && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleIcon sx={{ fontSize: px(22), color: 'white' }} /></Box>}
                        {isCurrent && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowForwardIcon sx={{ fontSize: px(22), color: 'white' }} /></Box>}
                        {isLocked && <Box sx={{ width: px(40), height: px(40), borderRadius: '50%', bgcolor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LockIcon sx={{ fontSize: px(20), color: '#9CA3AF' }} /></Box>}
                      </Box>
                    </ButtonBase>
                  )
                })
              })()}
            </Box>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 1.5, flexShrink: 0 }}>
              <ButtonBase onClick={() => navigate('/study-report', { state: { lesson } })} sx={{ flex: 1, py: is960 ? 0.75 : 1.25, borderRadius: is960 ? '12px' : '14px', bgcolor: '#00B4A0', color: 'white', fontWeight: 900, fontSize: is960 ? '0.75rem' : '0.95rem', '&:active': { transform: 'scale(0.98)' } }}>Study Report</ButtonBase>
              <ButtonBase onClick={() => navigate('/mistakes-review', { state: { lesson } })} sx={{ flex: 1, py: is960 ? 0.75 : 1.25, borderRadius: is960 ? '12px' : '14px', bgcolor: '#FF6B35', color: 'white', fontWeight: 900, fontSize: is960 ? '0.75rem' : '0.95rem', '&:active': { transform: 'scale(0.98)' } }}>Mistakes</ButtonBase>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: is960 ? 280 : 360,
            flexShrink: 0,
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            gap: is960 ? 1.5 : 2,
            overflow: 'hidden',
            minHeight: 0,
            height: '100%',
          }}
        >
          <Box
            sx={{
              flex: '4 1 0%',
              minHeight: 0,
              overflow: 'auto',
              bgcolor: 'white',
              borderRadius: rightColCardRadius,
              boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              p: is960 ? 2 : 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <Box>
              <Box sx={{ width: px(80), height: px(80), borderRadius: '50%', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, border: '1px solid rgba(245,158,11,0.25)' }}>
                <CardGiftcardIcon sx={{ fontSize: px(40), color: '#B45309' }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.15rem', color: '#1F2937', mb: 0.5 }}>Bonus Class</Typography>
              <Typography sx={{ color: '#6B7280', fontSize: is960 ? '0.75rem' : '0.85rem' }}>{cultureUnlocked ? 'Content unlocked' : 'Unlock at 60%'}</Typography>
            </Box>
            <ButtonBase disabled={!cultureUnlocked} onClick={onSelectCulture} sx={{ width: '100%', py: is960 ? 1 : 1.25, borderRadius: is960 ? '12px' : '14px', bgcolor: cultureUnlocked ? '#00B4A0' : '#E8ECEF', color: cultureUnlocked ? 'white' : '#64748B', fontWeight: 900, fontSize: is960 ? '0.8rem' : '0.95rem', '&:active': { transform: 'scale(0.98)' } }}>{cultureUnlocked ? 'Enter' : 'Locked'}</ButtonBase>
          </Box>
          <DeepLearningHubBlock
            is960={is960}
            is1920={false}
            allLessonsDone={allLessonsDone}
            onSelectUpsell={onSelectUpsell}
            navigate={navigate}
            sx={{
              flex: '6 1 0%',
              minHeight: 0,
              borderRadius: rightColCardRadius,
              p: is960 ? 1.75 : 2,
              boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
