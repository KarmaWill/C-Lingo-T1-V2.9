import { Box, Typography, ButtonBase } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lesson, Unit } from '../../types/lesson'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../../utils/figmaScale'
import { resolveBackPath } from '../../utils/navigateBack'

const PAGE_BG = '#F8F9F8'
const CARD_BORDER = '#E0E0DF'
const TEXT = '#2D3436'
const MUTED = '#636E72'
const TEAL = '#00B4A0'
const IMG = '/images/unit-hub'

function countLabel(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}

function lessonMetaLine(cards: number, practices: number) {
  return `${countLabel(cards, 'card', 'cards')} + ${countLabel(practices, 'practice', 'practices')}`
}

function TargetMark({ size }: { size: number }) {
  const ring = Math.round(size * 0.51)
  const inset = Math.round((size - ring) / 2)
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: `${Math.round(size * 0.18)}px`, bgcolor: '#FFF3EE' }} />
      <Box
        component="img"
        src={`${IMG}/target-rings.svg`}
        alt=""
        sx={{ position: 'absolute', left: inset, top: inset, width: ring, height: ring, display: 'block' }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: size * 0.46,
          top: size * 0.27,
          width: size * 0.27,
          height: size * 0.27,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: size * 0.28, height: size * 0.1, transform: 'rotate(-45deg)', flexShrink: 0 }}>
          <Box
            component="img"
            src={`${IMG}/target-dart.svg`}
            alt=""
            sx={{ display: 'block', width: '100%', height: '100%' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

function LessonDocIcon({ tone }: { tone: 'teal' | 'gray' }) {
  const fill = tone === 'teal' ? TEAL : '#D0D0D0'
  return (
    <Box sx={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
      <Box sx={{ position: 'absolute', left: 3, top: 3, width: 44, height: 44, borderRadius: '12px', bgcolor: fill }} />
      <Box sx={{ position: 'absolute', left: 14, top: 13, width: 22, height: 24, borderRadius: '4px', bgcolor: '#fff' }} />
      <Box sx={{ position: 'absolute', left: 18, top: 20, width: 14, height: 2.5, borderRadius: '10px', bgcolor: fill }} />
      <Box sx={{ position: 'absolute', left: 18, top: 26, width: 8, height: 2.5, borderRadius: '10px', bgcolor: fill }} />
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

export default function UnitSelectionStage({
  lesson,
  completedUnitIds,
  onSelectUnit,
  onSelectCulture,
  onSelectUpsell,
}: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const firstUnit = lesson.units[0]
  const totalLessons = 3
  const completedLessons = firstUnit
    ? completedUnitIds.filter((id) => id.startsWith(`${firstUnit.id}-lesson-`)).length
    : 0
  const cultureUnlocked = totalLessons > 0 ? completedLessons / totalLessons >= 2 / 3 : false
  const unitProgressPercent = 10

  const lessons = (() => {
    if (!firstUnit) return []
    const lessonTitles = ['Lesson 1: Rice', 'Lesson 2: Dumplings', 'Lesson 3: Eat Baozi']
    const items: Array<{
      id: string
      title: string
      questions: typeof firstUnit.questions
      learnings: typeof firstUnit.learnings
    }> = []
    for (let i = 0; i < Math.min(firstUnit.questions.length, 9); i += 3) {
      const lessonIndex = i / 3
      const learningStart = lessonIndex * 3
      const lessonLearnings = firstUnit.learnings.slice(learningStart, learningStart + 3)
      items.push({
        id: `lesson-${lessonIndex + 1}`,
        title: lessonTitles[lessonIndex] ?? `Lesson ${lessonIndex + 1}`,
        questions: firstUnit.questions.slice(i, i + 3),
        learnings: lessonLearnings.length > 0 ? lessonLearnings : firstUnit.learnings.slice(0, 3),
      })
    }
    return items
  })()

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: PAGE_BG,
        overflow: 'hidden',
        fontFamily: FIGMA_FONT,
      }}
    >
          <Box
            sx={{
              flexShrink: 0,
              position: 'relative',
              height: p(100),
              bgcolor: '#fff',
              borderBottom: '1px solid #E2E2E3',
            }}
          >
            <ButtonBase
              onClick={() => navigate(resolveBackPath(location, { defaultPath: '/AI' }))}
              aria-label="Back"
              sx={{
                position: 'absolute',
                left: p(28),
                top: '50%',
                transform: 'translateY(-50%)',
                width: p(56),
                height: p(56),
                borderRadius: '100px',
                bgcolor: '#fff',
                border: '1px solid #E0E0DF',
                '&:active': { transform: 'translateY(-50%) scale(0.96)' },
              }}
            >
              <Box
                component="img"
                src={`${IMG}/back-chevron.svg`}
                alt=""
                sx={{ width: p(28), height: p(28), display: 'block' }}
              />
            </ButtonBase>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(16)}px`,
              }}
            >
              <Box
                sx={{
                  height: p(36),
                  px: `${p(12)}px`,
                  borderRadius: '8px',
                  bgcolor: TEAL,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: p(18),
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: FIGMA_FONT,
                }}
              >
                Level {lesson.hskLevel ?? 1}
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: p(28),
                  lineHeight: 1.2,
                  color: TEXT,
                  fontFamily: FIGMA_FONT,
                  whiteSpace: 'nowrap',
                }}
              >
                C-Lingo Chinese
              </Typography>
            </Box>
          </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
          gap: `${p(24)}px`,
          px: `${p(28)}px`,
          py: `${p(20)}px`,
        }}
      >
        <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(16)}px` }}>
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: `${p(16)}px`,
              px: `${p(20)}px`,
              py: `${p(16)}px`,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: `${p(28)}px`,
              boxSizing: 'border-box',
            }}
          >
            <TargetMark size={p(88)} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 400, fontSize: p(16), lineHeight: 1.4, color: MUTED, fontFamily: FIGMA_FONT }}>
                After this unit, I can:
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: p(22), lineHeight: 1.35, color: TEXT, fontFamily: FIGMA_FONT }}>
                Name staple Chinese foods like rice and dumplings.
              </Typography>
              <Box sx={{ mt: `${p(10)}px`, display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
                <Box sx={{ flex: 1, height: 8, bgcolor: '#E8E8E8', borderRadius: '10px', overflow: 'hidden' }}>
                  <Box sx={{ width: `${unitProgressPercent}%`, height: '100%', bgcolor: TEAL, borderRadius: '10px' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: p(18), color: TEAL, fontFamily: FIGMA_FONT, flexShrink: 0 }}>
                  {unitProgressPercent}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: `${p(28)}px`,
              px: `${p(20)}px`,
              pt: `${p(16)}px`,
              pb: `${p(16)}px`,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: p(22), lineHeight: 1.4, color: TEXT, fontFamily: FIGMA_FONT, mb: `${p(12)}px` }}>
              Unit 1: Main Foods
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(10)}px` }}>
              {firstUnit &&
                lessons.map((lessonItem, idx) => {
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
                      onClick={() =>
                        onSelectUnit({
                          ...firstUnit,
                          id: currentLessonId,
                          title: lessonItem.title,
                          questions: lessonItem.questions,
                          learnings: lessonItem.learnings,
                        })
                      }
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        borderRadius: `${p(20)}px`,
                        bgcolor: isCurrent ? '#FFF3EE' : isDone ? '#E8F5E9' : '#F3F4F6',
                        border: isCurrent ? '1px solid rgba(255,107,53,0.2)' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: `${p(16)}px`,
                        textAlign: 'left',
                        '&:active': { transform: isLocked ? 'none' : 'scale(0.99)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px`, minWidth: 0 }}>
                        <LessonDocIcon tone={isLocked ? 'gray' : 'teal'} />
                        <Box sx={{ opacity: isLocked ? 0.4 : 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: p(20), lineHeight: 1.3, color: TEXT, fontFamily: FIGMA_FONT }}>
                            {lessonItem.title}
                          </Typography>
                          <Typography sx={{ fontWeight: 400, fontSize: p(15), lineHeight: 1.4, color: MUTED, fontFamily: FIGMA_FONT }}>
                            {lessonMetaLine(lessonItem.learnings.length, lessonItem.questions.length)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(10)}px`, flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 400, fontSize: p(15), color: isLocked ? '#A7B3B8' : MUTED, fontFamily: FIGMA_FONT }}>
                          {totalTasks} tasks
                        </Typography>
                        <Box
                          component="img"
                          src={isLocked ? `${IMG}/lesson-lock.svg` : `${IMG}/lesson-go.svg`}
                          alt=""
                          sx={{ width: p(40), height: p(40), display: 'block' }}
                        />
                      </Box>
                    </ButtonBase>
                  )
                })}
            </Box>
            <Box sx={{ flexShrink: 0, display: 'flex', gap: `${p(12)}px`, mt: `${p(12)}px` }}>
              <ButtonBase
                onClick={() =>
                  navigate('/study-report', { state: { lesson, from: `/lesson/${lesson.id}` } })
                }
                sx={{
                  flex: 1,
                  height: p(48),
                  borderRadius: '100px',
                  bgcolor: TEAL,
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: p(18),
                  fontFamily: FIGMA_FONT,
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                Study Report
              </ButtonBase>
              <ButtonBase
                onClick={() =>
                  navigate('/mistakes-review', { state: { lesson, from: `/lesson/${lesson.id}` } })
                }
                sx={{
                  flex: 1,
                  height: p(48),
                  borderRadius: '100px',
                  bgcolor: '#FFF3EE',
                  color: '#FF6B35',
                  border: '1px solid rgba(255,107,53,0.2)',
                  fontWeight: 500,
                  fontSize: p(18),
                  fontFamily: FIGMA_FONT,
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                Mistakes
              </ButtonBase>
            </Box>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(16)}px` }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: `${p(28)}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(10)}px`,
              px: `${p(20)}px`,
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ position: 'relative', width: p(72), height: p(72) }}>
              <Box
                component="img"
                src={`${IMG}/bonus-circle.svg`}
                alt=""
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
              />
              <Box sx={{ position: 'absolute', left: '25%', top: '25%', width: '50%', height: '50%', borderRadius: '50%', overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={`${IMG}/bonus-coin.png`}
                  alt=""
                  sx={{ position: 'absolute', width: '240%', height: '290%', left: '-68%', top: '-70%', display: 'block', maxWidth: 'none' }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: p(22), lineHeight: 1.3, color: TEXT, fontFamily: FIGMA_FONT }}>
                Bonus Class
              </Typography>
              <Typography sx={{ fontWeight: 400, fontSize: p(15), lineHeight: 1.4, color: MUTED, fontFamily: FIGMA_FONT }}>
                {cultureUnlocked ? 'Content unlocked' : 'Unlock at 60%'}
              </Typography>
            </Box>
            <ButtonBase
              disabled={!cultureUnlocked}
              onClick={onSelectCulture}
              sx={{
                width: '78%',
                height: p(44),
                borderRadius: '100px',
                bgcolor: cultureUnlocked ? TEAL : '#F3F4F6',
                border: `1px solid ${CARD_BORDER}`,
                color: cultureUnlocked ? '#fff' : MUTED,
                fontWeight: 500,
                fontSize: p(18),
                fontFamily: FIGMA_FONT,
              }}
            >
              {cultureUnlocked ? 'Enter' : 'Locked'}
            </ButtonBase>
          </Box>

          <ButtonBase
            onClick={onSelectUpsell}
            sx={{
              flex: 1,
              minHeight: 0,
              borderRadius: `${p(28)}px`,
              bgcolor: '#2768FD',
              overflow: 'hidden',
              display: 'block',
              textAlign: 'left',
              position: 'relative',
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            <Box
              component="img"
              src={`${IMG}/tutor-bg.png`}
              alt=""
              sx={{
                position: 'absolute',
                right: '-8%',
                top: '8%',
                width: '82%',
                height: '110%',
                opacity: 0.38,
                display: 'block',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
            <Box
              component="img"
              src={`${IMG}/tutor-bubbles.png`}
              alt=""
              sx={{
                position: 'absolute',
                right: '18%',
                bottom: '18%',
                width: p(88),
                height: p(76),
                display: 'block',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: p(20),
                top: p(18),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: `${p(8)}px`,
                zIndex: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: p(26), lineHeight: 1.2, color: '#fff', fontFamily: FIGMA_FONT }}>
                AI Tutor
              </Typography>
              <Box
                sx={{
                  height: p(32),
                  px: `${p(12)}px`,
                  borderRadius: '999px',
                  bgcolor: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.42)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: p(14), lineHeight: 1, color: '#fff', fontFamily: FIGMA_FONT, whiteSpace: 'nowrap' }}>
                  Kehidupan Sehari-hari
                </Typography>
              </Box>
            </Box>
            <Box
              component="img"
              src={`${IMG}/tutor-go.svg`}
              alt=""
              sx={{ position: 'absolute', left: p(20), bottom: p(18), width: p(48), height: p(36), display: 'block', zIndex: 1 }}
            />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  )
}
