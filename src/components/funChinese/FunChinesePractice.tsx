import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import {
  loadLessonQuizzes,
  pickLocale,
  quizImageUrl,
  type ChoiceQuizOption,
  type HappyChinese2Quiz,
  type QuizContent,
} from '../../data/happyChinese2'
import { APP_FONT_FAMILY } from '../../theme/appFont'
import { APP_SCREEN_SIZE, figmaPx } from '../../utils/figmaScale'

interface Props {
  lessonResourceId: string
  onBack: () => void
  onComplete: () => void
  onSpeak: (text: string) => void
}

type ResultState = null | 'correct' | 'wrong-first' | 'wrong-repeat'

const TEAL = '#00B4A0'
const ORANGE = '#FF6B35'
const BLUE = '#2188FE'
const GREEN = '#13C377'
const RED = '#F34D47'
const INK = '#2D3436'
const MUTED = '#636E72'
const KAI_FONT = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'
const WAVE_HEIGHTS = [35, 25, 33, 32, 22, 41, 29, 31, 23, 47, 39, 26, 35, 28, 38, 34, 39, 33, 22, 48, 45, 24]

function contentText(content?: QuizContent) {
  return pickLocale(content?.text, 'en', 'zh')
}

function AudioControl({
  text,
  onSpeak,
}: {
  text: string
  onSpeak: (text: string) => void
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <ButtonBase
      onClick={(event) => {
        event.stopPropagation()
        onSpeak(text)
      }}
      aria-label={`Play ${text}`}
      sx={{
        width: p(120),
        height: p(80),
        minWidth: p(120),
        borderRadius: 999,
        bgcolor: ORANGE,
        color: '#FFFFFF',
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <VolumeUpIcon sx={{ fontSize: p(44) }} />
    </ButtonBase>
  )
}

function Waveform({ active = false }: { active?: boolean }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box
      aria-hidden
      sx={{
        height: p(57),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${p(6)}px`,
      }}
    >
      {WAVE_HEIGHTS.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: p(6),
            height: p(height),
            borderRadius: p(3),
            bgcolor: active ? BLUE : '#D0D0C8',
          }}
        />
      ))}
    </Box>
  )
}

function QuizItem({
  item,
  compact = false,
}: {
  item: QuizContent
  compact?: boolean
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const text = contentText(item)

  if (item.kind === 'image' && item.image) {
    return (
      <Box
        component="img"
        src={quizImageUrl(item.image)}
        alt={text || 'Quiz option'}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }

  if (item.kind === 'audio') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${p(24)}px` }}>
        <Box
          sx={{
            width: p(80),
            height: p(80),
            borderRadius: '50%',
            bgcolor: ORANGE,
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <VolumeUpIcon sx={{ fontSize: p(44) }} />
        </Box>
        <Waveform />
      </Box>
    )
  }

  const containsChinese = /[\u3400-\u9fff]/.test(text)
  return (
    <Box sx={{ textAlign: 'center' }}>
      {item.pinyin && (
        <Typography sx={{ fontSize: compact ? p(24) : p(28), lineHeight: 1.35, color: INK }}>
          {item.pinyin}
        </Typography>
      )}
      <Typography
        sx={{
          mt: item.pinyin ? `${p(4)}px` : 0,
          fontFamily: containsChinese ? KAI_FONT : APP_FONT_FAMILY,
          fontSize: compact ? p(40) : containsChinese ? p(56) : p(40),
          lineHeight: 1.35,
          color: 'inherit',
        }}
      >
        {text}
      </Typography>
    </Box>
  )
}

function optionPalette(state: 'idle' | 'selected' | 'correct' | 'wrong' | 'disabled') {
  if (state === 'selected') return { border: BLUE, background: 'rgba(218,235,255,0.4)', color: BLUE }
  if (state === 'correct') return { border: GREEN, background: 'rgba(236,251,241,0.4)', color: GREEN }
  if (state === 'wrong') return { border: RED, background: 'rgba(254,241,241,0.4)', color: RED }
  if (state === 'disabled') return { border: '#E0E0DF', background: 'rgba(127,127,127,0.1)', color: '#A7B3B8' }
  return { border: '#E0E0DF', background: '#FFFFFF', color: INK }
}

export default function FunChinesePractice({ lessonResourceId, onBack, onComplete, onSpeak }: Props) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const retryTimer = useRef<number | null>(null)
  const [quizzes, setQuizzes] = useState<HappyChinese2Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [selectedStem, setSelectedStem] = useState<number | null>(null)
  const [selectedMatchOption, setSelectedMatchOption] = useState<number | null>(null)
  const [matchedKeys, setMatchedKeys] = useState<string[]>([])
  const [recentMatchedKey, setRecentMatchedKey] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState>(null)
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({})
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(false)
    loadLessonQuizzes(lessonResourceId)
      .then((items) => {
        if (!active) return
        setQuizzes(items)
        setLoading(false)
        setLoadError(items.length === 0)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
        setLoadError(true)
      })
    return () => {
      active = false
      if (retryTimer.current !== null) window.clearTimeout(retryTimer.current)
    }
  }, [lessonResourceId])

  const quiz = quizzes[questionIndex]
  const total = quizzes.length
  const choiceOptions = useMemo(
    () => (quiz?.mode === 'choice' ? (quiz.options as ChoiceQuizOption[]) : []),
    [quiz],
  )
  const matchOptions = useMemo(
    () => (quiz?.mode === 'match' ? (quiz.options as QuizContent[]) : []),
    [quiz],
  )

  const resetInteraction = () => {
    if (retryTimer.current !== null) window.clearTimeout(retryTimer.current)
    retryTimer.current = null
    setSelectedChoice(null)
    setSelectedStem(null)
    setSelectedMatchOption(null)
    setMatchedKeys([])
    setRecentMatchedKey(null)
    setResult(null)
  }

  const goNext = () => {
    if (questionIndex < total - 1) {
      resetInteraction()
      setQuestionIndex((index) => index + 1)
    } else {
      onComplete()
    }
  }

  const registerWrong = () => {
    if (!quiz) return
    const attempts = wrongAttempts[quiz.id] || 0
    setWrongAttempts((current) => ({ ...current, [quiz.id]: attempts + 1 }))
    if (attempts === 0) {
      setResult('wrong-first')
      return
    }
    setResult('wrong-repeat')
    retryTimer.current = window.setTimeout(() => {
      setSelectedChoice(null)
      setSelectedStem(null)
      setSelectedMatchOption(null)
      setResult(null)
    }, 1000)
  }

  const confirmChoice = () => {
    if (selectedChoice === null || !quiz) return
    if (choiceOptions[selectedChoice]?.correct) {
      setResult('correct')
    } else {
      registerWrong()
    }
  }

  const evaluateMatch = (stemIndex: number, optionIndex: number) => {
    if (!quiz || quiz.mode !== 'match') return
    const stems = quiz.stems || []
    const stemKey = stems[stemIndex]?.key
    const optionKey = matchOptions[optionIndex]?.key
    setSelectedStem(stemIndex)
    setSelectedMatchOption(optionIndex)
    if (stemKey && stemKey === optionKey) {
      const nextMatched = [...matchedKeys, stemKey]
      setMatchedKeys(nextMatched)
      setRecentMatchedKey(stemKey)
      retryTimer.current = window.setTimeout(() => {
        setSelectedStem(null)
        setSelectedMatchOption(null)
        setRecentMatchedKey(null)
        if (nextMatched.length === stems.length) setResult('correct')
      }, 1000)
      return
    }
    registerWrong()
  }

  const chooseStem = (index: number) => {
    if (result || matchedKeys.includes(quiz?.stems?.[index]?.key || '')) return
    const stem = quiz?.stems?.[index]
    if (stem?.kind === 'audio') onSpeak(contentText(stem))
    if (selectedMatchOption !== null) evaluateMatch(index, selectedMatchOption)
    else setSelectedStem(index)
  }

  const chooseMatchOption = (index: number) => {
    if (result || matchedKeys.includes(matchOptions[index]?.key || '')) return
    const option = matchOptions[index]
    if (option?.kind === 'audio') onSpeak(contentText(option))
    if (selectedStem !== null) evaluateMatch(selectedStem, index)
    else setSelectedMatchOption(index)
  }

  if (loading || loadError || !quiz) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#FFFFFF' }}>
        <Typography sx={{ fontFamily: APP_FONT_FAMILY, fontSize: p(32), color: MUTED }}>
          {loadError ? 'Practice data is unavailable. Please try again.' : 'Loading practice…'}
        </Typography>
      </Box>
    )
  }

  const progress = `${((questionIndex + 1) / total) * 100}%`
  const choiceState = (index: number) => {
    if (selectedChoice !== index) return result === 'correct' ? 'disabled' : 'idle'
    if (result === 'correct') return 'correct'
    if (result === 'wrong-first' || result === 'wrong-repeat') return 'wrong'
    return 'selected'
  }
  const title =
    quiz.title.en?.trim() ||
    (quiz.mode === 'match' ? 'Match the pairs' : 'Choose the correct answer')
  const stemText = contentText(quiz.stem)

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        bgcolor: '#FFFFFF',
        color: INK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        sx={{
          height: p(160),
          flexShrink: 0,
          boxSizing: 'border-box',
          px: `${p(60)}px`,
          py: `${p(40)}px`,
          borderBottom: '1px solid #E2E2E3',
          display: 'flex',
          alignItems: 'center',
          gap: `${p(50)}px`,
        }}
      >
        <ButtonBase
          onClick={() => setShowExitConfirm(true)}
          aria-label="Exit practice"
          sx={{
            width: p(80),
            height: p(80),
            minWidth: p(80),
            borderRadius: '50%',
            border: '1px solid #E0E0DF',
            color: INK,
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: p(40) }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${p(16)}px` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: p(32), lineHeight: 1.6 }}>Practice</Typography>
            <Typography sx={{ fontSize: p(32), lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>
              {questionIndex + 1}/{total}
            </Typography>
          </Box>
          <Box sx={{ height: p(10), borderRadius: 999, bgcolor: '#E8E8E8', overflow: 'hidden' }}>
            <Box sx={{ width: progress, height: '100%', borderRadius: 'inherit', bgcolor: TEAL }} />
          </Box>
        </Box>
        <CheckCircleIcon sx={{ width: p(44), height: p(44), color: TEAL }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          boxSizing: 'border-box',
          px: `${p(190)}px`,
          py: `${p(40)}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${p(40)}px`,
          overflowY: 'auto',
        }}
      >
        <Typography component="h1" sx={{ fontSize: p(40), lineHeight: 1.6, fontWeight: 700, textAlign: 'center' }}>
          {title}
        </Typography>

        {quiz.mode === 'choice' ? (
          <>
            <Box
              sx={{
                minHeight: p(160),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: ORANGE,
              }}
            >
              {quiz.stem?.kind === 'audio' ? (
                <AudioControl text={stemText} onSpeak={onSpeak} />
              ) : quiz.stem ? (
                <Box sx={{ width: quiz.stem.kind === 'image' ? p(320) : 'auto', height: quiz.stem.kind === 'image' ? p(320) : 'auto', overflow: 'hidden', borderRadius: `${p(44)}px` }}>
                  <QuizItem item={quiz.stem} />
                </Box>
              ) : null}
            </Box>

            <Box
              sx={{
                width: '100%',
                maxWidth: p(1540),
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: `${p(40)}px`,
              }}
            >
              {choiceOptions.map((option, index) => {
                const state = choiceState(index)
                const palette = optionPalette(state)
                const image = option.kind === 'image'
                return (
                  <ButtonBase
                    key={`${contentText(option)}-${index}`}
                    aria-label={`Option ${String.fromCharCode(65 + index)}: ${contentText(option)}`}
                    disabled={result !== null}
                    onClick={() => {
                      if (option.kind === 'audio') onSpeak(contentText(option))
                      setSelectedChoice(index)
                    }}
                    sx={{
                      height: image ? p(320) : p(140),
                      minHeight: p(140),
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: image ? `${p(44)}px` : `${p(28)}px`,
                      border: `2px solid ${palette.border}`,
                      bgcolor: palette.background,
                      color: palette.color,
                      fontFamily: APP_FONT_FAMILY,
                      '&:active': { transform: 'scale(0.995)' },
                    }}
                  >
                    {image && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: p(20),
                          top: p(20),
                          zIndex: 2,
                          width: p(70),
                          height: p(70),
                          borderRadius: '50%',
                          bgcolor: state === 'idle' ? '#F3F4F6' : palette.border,
                          color: state === 'idle' ? INK : '#FFFFFF',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: p(32),
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </Box>
                    )}
                    <QuizItem item={option} compact />
                  </ButtonBase>
                )
              })}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              width: '100%',
              maxWidth: p(1540),
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: `${p(40)}px`,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(40)}px` }}>
              {(quiz.stems || []).map((stem, index) => {
                const key = stem.key || ''
                const state = recentMatchedKey === key
                  ? 'correct'
                  : matchedKeys.includes(key)
                    ? 'disabled'
                  : selectedStem === index
                    ? result?.startsWith('wrong')
                      ? 'wrong'
                      : 'selected'
                    : 'idle'
                const palette = optionPalette(state)
                return (
                  <ButtonBase
                    key={`${key}-${index}`}
                    aria-label={`Match item ${index + 1}: ${contentText(stem)}`}
                    onClick={() => chooseStem(index)}
                    disabled={matchedKeys.includes(key)}
                    sx={{
                      minHeight: p(140),
                      borderRadius: `${p(28)}px`,
                      border: `2px solid ${palette.border}`,
                      bgcolor: palette.background,
                      color: palette.color,
                    }}
                  >
                    <QuizItem item={stem} compact />
                  </ButtonBase>
                )
              })}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(40)}px` }}>
              {matchOptions.map((option, index) => {
                const key = option.key || ''
                const state = recentMatchedKey === key
                  ? 'correct'
                  : matchedKeys.includes(key)
                    ? 'disabled'
                  : selectedMatchOption === index
                    ? result?.startsWith('wrong')
                      ? 'wrong'
                      : 'selected'
                    : 'idle'
                const palette = optionPalette(state)
                return (
                  <ButtonBase
                    key={`${key}-${index}`}
                    aria-label={`Match option ${index + 1}: ${contentText(option)}`}
                    onClick={() => chooseMatchOption(index)}
                    disabled={matchedKeys.includes(key)}
                    sx={{
                      minHeight: p(140),
                      borderRadius: `${p(28)}px`,
                      border: `2px solid ${palette.border}`,
                      bgcolor: palette.background,
                      color: palette.color,
                    }}
                  >
                    <QuizItem item={option} compact />
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>
        )}
      </Box>

      {quiz.mode === 'choice' && result === null && (
        <Box sx={{ height: p(131), flexShrink: 0, px: `${p(190)}px`, pb: `${p(40)}px`, boxSizing: 'border-box' }}>
          <ButtonBase
            disabled={selectedChoice === null}
            onClick={confirmChoice}
            sx={{
              width: '100%',
              height: p(91),
              borderRadius: 999,
              bgcolor: TEAL,
              color: '#FFFFFF',
              opacity: selectedChoice === null ? 0.3 : 1,
              fontSize: p(32),
              fontWeight: 700,
              fontFamily: APP_FONT_FAMILY,
            }}
          >
            Confirm
          </ButtonBase>
        </Box>
      )}

      {(result === 'correct' || result === 'wrong-first') && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            height: p(360),
            bgcolor: result === 'correct' ? '#ECFBF1' : '#FEF1F1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${p(50)}px`,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${p(16)}px` }}>
              {result === 'correct' ? (
                <CheckCircleIcon sx={{ fontSize: p(44), color: GREEN }} />
              ) : (
                <CancelIcon sx={{ fontSize: p(44), color: RED }} />
              )}
              <Typography sx={{ fontSize: p(32), fontWeight: 700, color: result === 'correct' ? GREEN : RED }}>
                {result === 'correct' ? 'Correct' : 'Incorrect'}
              </Typography>
            </Box>
            {result === 'wrong-first' && (
              <Typography sx={{ mt: `${p(12)}px`, fontSize: p(32), color: MUTED }}>Try again</Typography>
            )}
          </Box>
          <ButtonBase
            onClick={() => {
              if (result === 'correct') goNext()
              else {
                setSelectedChoice(null)
                setSelectedStem(null)
                setSelectedMatchOption(null)
                setResult(null)
              }
            }}
            sx={{
              width: p(224),
              height: p(90),
              borderRadius: 999,
              bgcolor: result === 'correct' ? GREEN : RED,
              color: '#FFFFFF',
              fontSize: p(32),
              fontWeight: 700,
            }}
          >
            Continue
          </ButtonBase>
        </Box>
      )}

      {showExitConfirm && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            bgcolor: 'rgba(0,0,0,0.6)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box
            role="dialog"
            aria-modal="true"
            aria-labelledby="practice-exit-title"
            sx={{
              width: p(900),
              minHeight: p(495),
              boxSizing: 'border-box',
              p: `${p(80)}px`,
              borderRadius: `${p(60)}px`,
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${p(70)}px`,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography id="practice-exit-title" sx={{ fontSize: p(48), lineHeight: 1.6, fontWeight: 700 }}>
                Exit practice?
              </Typography>
              <Typography sx={{ mt: `${p(24)}px`, fontSize: p(40), lineHeight: 1.6, color: MUTED }}>
                Your answer progress will be lost.
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: `${p(80)}px`, width: '100%' }}>
              <ButtonBase
                onClick={() => setShowExitConfirm(false)}
                sx={{ height: p(90), borderRadius: 999, bgcolor: '#F3F4F6', color: '#666666', fontSize: p(36) }}
              >
                Cancel
              </ButtonBase>
              <ButtonBase
                onClick={onBack}
                sx={{ height: p(90), borderRadius: 999, bgcolor: TEAL, color: '#FFFFFF', fontSize: p(36) }}
              >
                Exit
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
