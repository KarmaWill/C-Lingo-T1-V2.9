import { Box, Typography, ButtonBase } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lesson, Unit } from '../../types/lesson'
import HubContainBoard from '../home/HubContainBoard'
import { FIGMA_FONT } from '../../utils/figmaScale'
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

function TargetMark() {
  return (
    <Box sx={{ position: 'relative', width: 136, height: 136, flexShrink: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '24px', bgcolor: '#FFF3EE' }} />
      <Box
        component="img"
        src={`${IMG}/target-rings.svg`}
        alt=""
        sx={{ position: 'absolute', left: 33, top: 33, width: 70, height: 70, display: 'block' }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 62.31,
          top: 37.24,
          width: 37.082,
          height: 37.082,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: 38.654, height: 13.788, transform: 'rotate(-45deg)', flexShrink: 0 }}>
          <Box
            component="img"
            src={`${IMG}/target-dart.svg`}
            alt=""
            sx={{ display: 'block', width: 38.654, height: 13.788 }}
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
      <HubContainBoard width={1920} height={1200}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: PAGE_BG }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1920,
              height: 160,
              bgcolor: '#fff',
              borderBottom: '1px solid #E2E2E3',
            }}
          >
            <ButtonBase
              onClick={() => navigate(resolveBackPath(location, { defaultPath: '/AI' }))}
              aria-label="Back"
              sx={{
                position: 'absolute',
                left: 60,
                top: 40,
                width: 80,
                height: 80,
                borderRadius: '100px',
                bgcolor: '#fff',
                border: '1px solid #E0E0DF',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <Box
                component="img"
                src={`${IMG}/back-chevron.svg`}
                alt=""
                sx={{ width: 40, height: 40, display: 'block' }}
              />
            </ButtonBase>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 48,
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                height: 64,
              }}
            >
              <Box
                sx={{
                  height: 46,
                  px: '16px',
                  py: '4px',
                  borderRadius: '8px',
                  bgcolor: TEAL,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: 1.6,
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
                  fontSize: 40,
                  lineHeight: 1.6,
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
              position: 'absolute',
              left: 60,
              top: 200,
              width: 1060,
              height: 210,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: '40px',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ position: 'absolute', left: 32, top: 32 }}>
              <TargetMark />
            </Box>
            <Box sx={{ position: 'absolute', left: 200, top: 32, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography sx={{ fontWeight: 400, fontSize: 24, lineHeight: 1.6, color: MUTED, fontFamily: FIGMA_FONT }}>
                After this unit, I can:
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 32, lineHeight: 1.6, color: TEXT, fontFamily: FIGMA_FONT }}>
                Name staple Chinese foods like rice and dumplings.
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                left: 200,
                top: 141,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                height: 45,
              }}
            >
              <Box sx={{ position: 'relative', width: 740, height: 10.75, flexShrink: 0 }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0.75, width: 740, height: 10, bgcolor: '#E8E8E8', borderRadius: '10px' }} />
                <Box sx={{ position: 'absolute', left: 0, top: 0, width: 120, height: 10, bgcolor: TEAL, borderRadius: '10px' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: 1.6, color: TEAL, fontFamily: FIGMA_FONT, width: 60, whiteSpace: 'nowrap' }}>
                {unitProgressPercent}%
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: 60,
              top: 450,
              width: 1060,
              height: 710,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: '40px',
              boxSizing: 'border-box',
            }}
          />
          <Typography
            sx={{
              position: 'absolute',
              left: 100,
              top: 490,
              fontWeight: 700,
              fontSize: 32,
              lineHeight: 1.6,
              color: TEXT,
              fontFamily: FIGMA_FONT,
            }}
          >
            Unit 1: Main Foods
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              left: 100,
              top: 565,
              width: 980,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
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
                      position: 'relative',
                      width: 980,
                      height: 144,
                      borderRadius: '32px',
                      bgcolor: isCurrent ? '#FFF3EE' : isDone ? '#E8F5E9' : '#F3F4F6',
                      border: isCurrent ? '1px solid rgba(255,107,53,0.2)' : '1px solid transparent',
                      display: 'block',
                      textAlign: 'left',
                      '&:active': { transform: isLocked ? 'none' : 'scale(0.99)' },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 32,
                        top: 24,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                      }}
                    >
                      <LessonDocIcon tone={isLocked ? 'gray' : 'teal'} />
                      <Box sx={{ opacity: isLocked ? 0.4 : 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 32, lineHeight: 1.6, color: TEXT, fontFamily: FIGMA_FONT, whiteSpace: 'nowrap' }}>
                          {lessonItem.title}
                        </Typography>
                        <Typography sx={{ mt: '8px', fontWeight: 400, fontSize: 24, lineHeight: 1.6, color: MUTED, fontFamily: FIGMA_FONT }}>
                          {lessonMetaLine(lessonItem.learnings.length, lessonItem.questions.length)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        position: 'absolute',
                        left: 783,
                        top: 53,
                        width: 77,
                        fontWeight: 400,
                        fontSize: 24,
                        lineHeight: 1.6,
                        color: isLocked ? '#A7B3B8' : MUTED,
                        fontFamily: FIGMA_FONT,
                        textAlign: 'right',
                      }}
                    >
                      {totalTasks} tasks
                    </Typography>
                    <Box
                      component="img"
                      src={isLocked ? `${IMG}/lesson-lock.svg` : `${IMG}/lesson-go.svg`}
                      alt=""
                      sx={{ position: 'absolute', left: 888, top: 42, width: 60, height: 60, display: 'block' }}
                    />
                  </ButtonBase>
                )
              })}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: 100,
              top: 1055,
              width: 980,
              height: 80,
              display: 'flex',
              gap: '20px',
            }}
          >
            <ButtonBase
              onClick={() =>
                navigate('/study-report', { state: { lesson, from: `/lesson/${lesson.id}` } })
              }
              sx={{
                flex: 1,
                height: 80,
                borderRadius: '100px',
                bgcolor: TEAL,
                color: '#fff',
                fontWeight: 400,
                fontSize: 32,
                lineHeight: '48px',
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
                height: 80,
                borderRadius: '100px',
                bgcolor: '#FFF3EE',
                color: '#FF6B35',
                border: '1px solid rgba(255,107,53,0.2)',
                fontWeight: 400,
                fontSize: 32,
                lineHeight: '48px',
                fontFamily: FIGMA_FONT,
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              Mistakes
            </ButtonBase>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: 1160,
              top: 200,
              width: 700,
              height: 460,
              bgcolor: '#fff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: '40px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', left: 290, top: 40, width: 120, height: 120 }}>
              <Box
                component="img"
                src={`${IMG}/bonus-circle.svg`}
                alt=""
                sx={{ position: 'absolute', inset: 0, width: 120, height: 120, display: 'block' }}
              />
              <Box sx={{ position: 'absolute', left: 30, top: 30, width: 60, height: 60, borderRadius: '188px', overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={`${IMG}/bonus-coin.png`}
                  alt=""
                  sx={{
                    position: 'absolute',
                    width: 142.94,
                    height: 173.53,
                    left: -40.53,
                    top: -42.41,
                    display: 'block',
                    maxWidth: 'none',
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                left: 254,
                top: 180,
                width: 192,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 32, lineHeight: 1.6, color: TEXT, fontFamily: FIGMA_FONT, width: '100%' }}>
                Bonus Class
              </Typography>
              <Typography sx={{ fontWeight: 400, fontSize: 24, lineHeight: 1.6, color: MUTED, fontFamily: FIGMA_FONT, width: '100%' }}>
                {cultureUnlocked ? 'Content unlocked' : 'Unlock at 60%'}
              </Typography>
            </Box>
            <ButtonBase
              disabled={!cultureUnlocked}
              onClick={onSelectCulture}
              sx={{
                position: 'absolute',
                left: 120,
                top: 330,
                width: 460,
                height: 80,
                borderRadius: '100px',
                bgcolor: cultureUnlocked ? TEAL : '#F3F4F6',
                border: `1px solid ${CARD_BORDER}`,
                color: cultureUnlocked ? '#fff' : MUTED,
                fontWeight: 400,
                fontSize: 32,
                lineHeight: '48px',
                fontFamily: FIGMA_FONT,
              }}
            >
              {cultureUnlocked ? 'Enter' : 'Locked'}
            </ButtonBase>
          </Box>

          <ButtonBase
            onClick={onSelectUpsell}
            sx={{
              position: 'absolute',
              left: 1160,
              top: 700,
              width: 700,
              height: 460,
              borderRadius: '40px',
              bgcolor: '#2768FD',
              overflow: 'hidden',
              display: 'block',
              textAlign: 'left',
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            <Box
              component="img"
              src={`${IMG}/tutor-bg.png`}
              alt=""
              sx={{
                position: 'absolute',
                left: 194.91,
                top: 49.34,
                width: 570.67,
                height: 492.08,
                opacity: 0.5,
                display: 'block',
                maxWidth: 'none',
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
                left: 310.4,
                top: 219.9,
                width: 166.1,
                height: 143,
                display: 'block',
                maxWidth: 'none',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 60,
                top: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 40, lineHeight: 1.6, color: '#fff', fontFamily: FIGMA_FONT }}>
                AI Tutor
              </Typography>
              <Box
                sx={{
                  height: 44,
                  px: '12px',
                  py: '3px',
                  borderRadius: '8px',
                  bgcolor: 'rgba(56,209,243,0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 24, lineHeight: 1.6, color: '#fff', fontFamily: FIGMA_FONT, whiteSpace: 'nowrap' }}>
                  Kehidupan Sehari-hari
                </Typography>
              </Box>
            </Box>
            <Box
              component="img"
              src={`${IMG}/tutor-go.svg`}
              alt=""
              sx={{ position: 'absolute', left: 58, top: 196, width: 80, height: 60, display: 'block' }}
            />
          </ButtonBase>
        </Box>
      </HubContainBoard>
    </Box>
  )
}
