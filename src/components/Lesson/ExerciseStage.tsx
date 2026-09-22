import { useEffect, useMemo, useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Unit, ExerciseType, type Question } from '../../types/lesson'
import FeedbackEntryButton from '../feedback/FeedbackEntryButton'
import { HskPrepBackButton } from '../hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../../utils/figmaScale'

const INK = '#2D3436'
const MUTED = '#636E72'
const LINE = '#E0E0DF'
const TEAL = '#00B4A0'
const ORANGE = '#FF6B35'
const SELECT_BLUE = '#2188FE'
const CORRECT_GREEN = '#13C377'
const INCORRECT_RED = '#F34D47'
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const
const HAN_RE = /[\u4e00-\u9fff]/
const EMOJI_RE = /[\u{1F300}-\u{1F9FF}]/u
const PINYIN_FONT = '"FZPinYinHandwriting", "Google Sans Flex Variable", "Google Sans Flex", sans-serif'
const KAI_FONT = '"FZNewKai GB18030L2", "KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

const OPTION_PINYIN: Record<string, string> = {
  米: 'mǐ',
  饭: 'fàn',
  是: 'shì',
  谁: 'shéi',
  水: 'shuǐ',
  饺: 'jiǎo',
  茶: 'chá',
  包: 'bāo',
  子: 'zi',
  面: 'miàn',
  条: 'tiáo',
  米饭: 'mǐfàn',
  饺子: 'jiǎozi',
  包子: 'bāozi',
  面条: 'miàntiáo',
  '我吃米饭。': 'wǒ chī mǐfàn',
  '这是米饭。': 'zhè shì mǐfàn',
  '我有米饭。': 'wǒ yǒu mǐfàn',
  '米饭好吃。': 'mǐfàn hǎo chī',
  '我吃饺子。': 'wǒ chī jiǎozi',
  '这是饺子。': 'zhè shì jiǎozi',
  '我吃包子。': 'wǒ chī bāozi',
  '这是包子。': 'zhè shì bāozi',
  '我喝水。': 'wǒ hē shuǐ',
  '我喝茶。': 'wǒ hē chá',
}

function playPromptAudio(text: string, audioUrl?: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  const usableUrl = audioUrl && !audioUrl.startsWith('mock-') && /^(https?:|\/)/.test(audioUrl)
  if (usableUrl) {
    const audio = new Audio(audioUrl)
    void audio.play().catch(() => speakChinese(text))
    return
  }
  speakChinese(text)
}

function speakChinese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

function resolvePracticeImage(url: string | undefined, option = '') {
  const source = url || ''
  if (
    option === '米饭' ||
    option === '米' ||
    source.includes('米饭') ||
    source.includes('大米') ||
    source.includes('rice-grain') ||
    source === '🍚'
  ) {
    return '/assets/images/rice-bowl-white.png'
  }
  if (option === '饺子' || source.includes('饺子') || source === '🥟') return '/assets/images/dumplings-white.png'
  if (option === '包子' || source.includes('包子') || source === '🍞') return '/assets/images/baozi-white.png'
  if (option === '面条' || source.includes('面条') || source === '🍜') return '/assets/images/noodles-white.png'
  return source
}

function extractHanzi(raw: string) {
  const chars = [...raw].filter((ch) => HAN_RE.test(ch)).join('')
  return chars || raw
}

function optionPinyin(raw: string) {
  if (OPTION_PINYIN[raw]) return OPTION_PINYIN[raw]
  const hanzi = extractHanzi(raw)
  if (OPTION_PINYIN[hanzi]) return OPTION_PINYIN[hanzi]
  const leftover = raw.replace(/[\u4e00-\u9fff]/g, ' ').replace(/[.,!?。？！]/g, ' ').trim()
  return leftover && /[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(leftover) ? leftover : ''
}

function isEmoji(value: string) {
  return EMOJI_RE.test(value)
}

function optionTone(opt: string, selected: string | null, checked: boolean, correct: string) {
  if (checked && opt === correct) return CORRECT_GREEN
  if (checked && selected === opt && opt !== correct) return INCORRECT_RED
  if (!checked && selected === opt) return SELECT_BLUE
  return ''
}

function typeCopy(question: Question, imageChoice: boolean) {
  switch (question.type) {
    case ExerciseType.T00_LISTEN_SELECT_IMAGE:
      return { title: 'Listening Comprehension', subtitle: 'Listen and select the correct image' }
    case ExerciseType.T01_PICTURE_FILL_IN:
      return { title: 'Image Comprehension', subtitle: 'Look at the picture, select the correct character' }
    case ExerciseType.T02_PICTURE_SELECT_TEXT:
      return imageChoice
        ? { title: 'Translation', subtitle: 'Choose the matching picture and character' }
        : { title: 'Image Comprehension', subtitle: 'Look at the picture, select the correct character' }
    case ExerciseType.T03_LISTEN_SELECT_SENTENCE:
      return { title: 'Listening Comprehension', subtitle: 'Listen and select the sentence you heard' }
    case ExerciseType.T04_WORD_MEANING_SELECT:
      return { title: 'Image Comprehension', subtitle: 'Choose the correct meaning' }
    case ExerciseType.T05_GRAMMAR_SELECT:
      return { title: 'Translation', subtitle: 'Choose the correct Chinese translation' }
    case ExerciseType.S01_SPEAKING:
      return { title: 'Oral Practice', subtitle: question.prompt || 'Speak the sentence' }
    default:
      return { title: 'Practice', subtitle: question.prompt || '' }
  }
}

interface Props {
  unit: Unit
  onComplete: () => void
  onExit: () => void
}

export default function ExerciseStage({ unit, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [currentIndex])

  const questions = unit.questions || []
  const currentQuestion = questions[currentIndex]

  const options = useMemo(() => {
    if (!currentQuestion) return []
    if (currentQuestion.options?.length) return currentQuestion.options
    if (currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN) {
      const answer = String(currentQuestion.correctAnswer)
      const fallback = ['米饭', '饺子', '包子', '面条']
      return [answer, ...fallback.filter((item) => item !== answer)].slice(0, 4)
    }
    return []
  }, [currentQuestion])

  const imageChoice =
    currentQuestion?.type === ExerciseType.T02_PICTURE_SELECT_TEXT &&
    (currentQuestion.imageUrls?.length || 0) >= 3 &&
    options.length >= 3

  if (!currentQuestion) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF' }}>
        <Typography sx={{ color: MUTED, fontFamily: FIGMA_FONT, fontSize: p(28) }}>
          {questions.length === 0 ? 'No questions available' : 'Question not found'}
        </Typography>
      </Box>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100
  const copy = typeCopy(currentQuestion, imageChoice)
  const correctAnswer = String(currentQuestion.correctAnswer)
  const canConfirm = Boolean(selectedOption) || currentQuestion.type === ExerciseType.S01_SPEAKING

  const handleCheck = () => {
    const userAnswer = selectedOption || ''
    const correct = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.includes(userAnswer)
      : userAnswer === currentQuestion.correctAnswer ||
        (currentQuestion.type === ExerciseType.S01_SPEAKING)
    localStorage.setItem(
      `question_${currentQuestion.id}_result`,
      JSON.stringify({ userAnswer, isCorrect: correct }),
    )
    setIsCorrect(correct)
    setIsChecked(true)
  }

  const spokenPrompt =
    typeof currentQuestion.correctAnswer === 'string'
      ? currentQuestion.correctAnswer
      : currentQuestion.chineseText || options[0] || ''

  const handlePlayAudio = () => {
    setIsPlayingAudio(true)
    playPromptAudio(spokenPrompt, currentQuestion.audioUrl)
    window.setTimeout(() => setIsPlayingAudio(false), 1600)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsChecked(false)
      setIsCorrect(false)
      setIsPlayingAudio(false)
    } else {
      onComplete()
    }
  }

  const promptImage = resolvePracticeImage(
    currentQuestion.imageUrls?.[0] || (currentQuestion.imageEmoji ? currentQuestion.imageEmoji : ''),
    currentQuestion.chineseText || extractHanzi(spokenPrompt),
  )

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          flexShrink: 0,
          height: p(160),
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          display: 'flex',
          alignItems: 'center',
          px: `${p(60)}px`,
          gap: `${p(100)}px`,
        }}
      >
        <HskPrepBackButton onClick={() => setLeaveOpen(true)} sx={{ width: p(80), height: p(80) }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${p(16)}px` }}>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(32), lineHeight: 1.6, color: INK }}>
              Reinforcement Practice
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px` }}>
              <FeedbackEntryButton context={{ screen: 'lesson_exercise' }} />
              <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(32), lineHeight: 1.6, color: INK }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: p(10), bgcolor: '#E8E8E8', borderRadius: '20px', overflow: 'hidden' }}>
            <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: TEAL, borderRadius: '20px' }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: `${p(60)}px`,
          pt: `${p(40)}px`,
          pb: isChecked ? 0 : `${p(24)}px`,
          overflow: 'auto',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: `${p(28)}px`, flexShrink: 0 }}>
          <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(40), lineHeight: 1.6, color: INK }}>
            {copy.title}
          </Typography>
          <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(28), lineHeight: 1.6, color: MUTED }}>
            {copy.subtitle}
          </Typography>
        </Box>

        {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && (
          <T00Body
            p={p}
            options={options}
            imageUrls={currentQuestion.imageUrls || []}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            isPlayingAudio={isPlayingAudio}
            onPlay={handlePlayAudio}
            onSelect={setSelectedOption}
          />
        )}

        {(currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN ||
          (currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT && !imageChoice)) && (
          <ChipSelectBody
            p={p}
            imageSrc={promptImage}
            options={options}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            onSelect={setSelectedOption}
          />
        )}

        {imageChoice && (
          <ImageLabelBody
            p={p}
            options={options}
            imageUrls={currentQuestion.imageUrls || []}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            prompt={currentQuestion.englishText || currentQuestion.prompt}
            onSelect={setSelectedOption}
          />
        )}

        {currentQuestion.type === ExerciseType.T03_LISTEN_SELECT_SENTENCE && (
          <SentenceGridBody
            p={p}
            options={options}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            showSpeaker
            isPlayingAudio={isPlayingAudio}
            onPlay={handlePlayAudio}
            onSelect={setSelectedOption}
          />
        )}

        {currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT && (
          <MeaningBody
            p={p}
            imageSrc={promptImage}
            word={currentQuestion.chineseText || extractHanzi(spokenPrompt)}
            pinyin={currentQuestion.pinyin || optionPinyin(currentQuestion.chineseText || spokenPrompt)}
            options={options}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            onPlay={() => playPromptAudio(currentQuestion.chineseText || spokenPrompt, currentQuestion.audioUrl)}
            onSelect={setSelectedOption}
          />
        )}

        {currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT && (
          <SentenceGridBody
            p={p}
            options={options}
            selectedOption={selectedOption}
            isChecked={isChecked}
            correctAnswer={correctAnswer}
            prompt={currentQuestion.englishText}
            onSelect={setSelectedOption}
          />
        )}

        {currentQuestion.type === ExerciseType.S01_SPEAKING && (
          <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(48), color: INK, mt: `${p(40)}px` }}>
            {currentQuestion.chineseText || spokenPrompt}
          </Typography>
        )}
      </Box>

      {!isChecked ? (
        <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', pb: `${p(40)}px` }}>
          <ButtonBase
            disabled={!canConfirm}
            onClick={handleCheck}
            sx={{
              minWidth: p(240),
              height: p(90),
              px: `${p(80)}px`,
              borderRadius: '100px',
              bgcolor: TEAL,
              opacity: canConfirm ? 1 : 0.3,
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(32),
              lineHeight: 1.6,
            }}
          >
            Confirm
          </ButtonBase>
        </Box>
      ) : (
        <Box
          sx={{
            flexShrink: 0,
            minHeight: p(280),
            bgcolor: isCorrect ? '#ECFBF1' : '#FFF3F2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${p(12)}px`,
            px: `${p(80)}px`,
            py: `${p(40)}px`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px` }}>
            {isCorrect ? (
              <CheckCircleIcon sx={{ fontSize: p(38), color: CORRECT_GREEN }} />
            ) : (
              <CancelIcon sx={{ fontSize: p(38), color: INCORRECT_RED }} />
            )}
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                lineHeight: 1.6,
                color: isCorrect ? CORRECT_GREEN : INCORRECT_RED,
              }}
            >
              {isCorrect ? 'Correct' : 'Incorrect'}
            </Typography>
          </Box>
          {currentQuestion.explanation && (
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(24),
                lineHeight: 1.6,
                color: MUTED,
                textAlign: 'center',
                maxWidth: p(1400),
              }}
            >
              {currentQuestion.explanation}
            </Typography>
          )}
          <ButtonBase
            onClick={handleNext}
            sx={{
              minWidth: p(240),
              height: p(90),
              px: `${p(80)}px`,
              mt: `${p(8)}px`,
              borderRadius: '100px',
              bgcolor: isCorrect ? CORRECT_GREEN : INCORRECT_RED,
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(32),
            }}
          >
            Continue
          </ButtonBase>
        </Box>
      )}

      {leaveOpen && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(45, 52, 54, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <Box
            sx={{
              width: p(720),
              bgcolor: '#FFFFFF',
              borderRadius: `${p(48)}px`,
              px: `${p(64)}px`,
              py: `${p(56)}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${p(40)}px`,
            }}
          >
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(40), lineHeight: 1.6, color: INK, textAlign: 'center' }}>
              Leave this lesson?
            </Typography>
            <Box sx={{ display: 'flex', gap: `${p(32)}px` }}>
              <ButtonBase
                onClick={() => setLeaveOpen(false)}
                sx={{
                  minWidth: p(200),
                  height: p(90),
                  px: `${p(48)}px`,
                  borderRadius: '100px',
                  bgcolor: '#F3F4F6',
                  color: INK,
                  fontFamily: FIGMA_FONT,
                  fontSize: p(32),
                }}
              >
                Cancel
              </ButtonBase>
              <ButtonBase
                onClick={onExit}
                sx={{
                  minWidth: p(200),
                  height: p(90),
                  px: `${p(48)}px`,
                  borderRadius: '100px',
                  bgcolor: TEAL,
                  color: '#FFFFFF',
                  fontFamily: FIGMA_FONT,
                  fontSize: p(32),
                }}
              >
                Confirm
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function SpeakerButton({
  p,
  onClick,
  disabled,
}: {
  p: (n: number) => number
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label="Play audio"
      sx={{
        width: p(120),
        height: p(80),
        borderRadius: '50px',
        bgcolor: ORANGE,
        color: '#FFFFFF',
        flexShrink: 0,
        '&:disabled': { opacity: 0.6 },
      }}
    >
      <VolumeUpIcon sx={{ fontSize: p(44) }} />
    </ButtonBase>
  )
}

function ImageTile({
  p,
  src,
  label,
  tone,
  disabled,
  onClick,
  caption,
  captionPinyin,
}: {
  p: (n: number) => number
  src: string
  label: string
  tone: string
  disabled?: boolean
  onClick: () => void
  caption?: string
  captionPinyin?: string
}) {
  const localFood = src.startsWith('/assets/images/')
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: p(310),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          width: p(310),
          height: p(310),
          borderRadius: `${p(48)}px`,
          overflow: 'hidden',
          position: 'relative',
          boxSizing: 'border-box',
          border: tone ? `${p(6)}px solid ${tone}` : `1px solid ${LINE}`,
          bgcolor: '#FFFFFF',
        }}
      >
        {isEmoji(src) ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p(96) }}>
            {src}
          </Box>
        ) : (
          <Box
            component="img"
            src={src}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: localFood ? 'contain' : 'cover',
              objectPosition: 'center',
              display: 'block',
              bgcolor: '#FFFFFF',
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: p(12),
            left: p(12),
            width: p(70),
            height: p(70),
            borderRadius: '50%',
            bgcolor: tone || '#FFFFFF',
            color: tone ? '#FFFFFF' : INK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FIGMA_FONT,
            fontSize: p(32),
            boxShadow: tone ? 'none' : '0 2px 8px rgba(45,52,54,0.08)',
          }}
        >
          {label}
        </Box>
      </Box>
      {caption && (
        <Box sx={{ mt: `${p(16)}px`, textAlign: 'center' }}>
          {captionPinyin && (
            <Typography sx={{ fontFamily: PINYIN_FONT, fontSize: p(24), lineHeight: 1.6, color: INK }}>
              {captionPinyin}
            </Typography>
          )}
          <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(36), lineHeight: 1.4, color: INK }}>
            {caption}
          </Typography>
        </Box>
      )}
    </ButtonBase>
  )
}

function T00Body({
  p,
  options,
  imageUrls,
  selectedOption,
  isChecked,
  correctAnswer,
  isPlayingAudio,
  onPlay,
  onSelect,
}: {
  p: (n: number) => number
  options: string[]
  imageUrls: string[]
  selectedOption: string | null
  isChecked: boolean
  correctAnswer: string
  isPlayingAudio: boolean
  onPlay: () => void
  onSelect: (value: string) => void
}) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${p(48)}px`, flex: 1, justifyContent: 'center' }}>
      <SpeakerButton p={p} onClick={onPlay} disabled={isPlayingAudio} />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: `${p(60)}px`, flexWrap: 'wrap' }}>
        {options.map((opt, idx) => (
          <ImageTile
            key={opt}
            p={p}
            src={resolvePracticeImage(imageUrls[idx], opt)}
            label={OPTION_LABELS[idx] || String(idx + 1)}
            tone={optionTone(opt, selectedOption, isChecked, correctAnswer)}
            disabled={isChecked}
            onClick={() => onSelect(opt)}
          />
        ))}
      </Box>
    </Box>
  )
}

function ChipSelectBody({
  p,
  imageSrc,
  options,
  selectedOption,
  isChecked,
  correctAnswer,
  onSelect,
}: {
  p: (n: number) => number
  imageSrc: string
  options: string[]
  selectedOption: string | null
  isChecked: boolean
  correctAnswer: string
  onSelect: (value: string) => void
}) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: `${p(36)}px` }}>
      {isEmoji(imageSrc) ? (
        <Typography sx={{ fontSize: p(160), lineHeight: 1 }}>{imageSrc}</Typography>
      ) : (
        <Box
          component="img"
          src={imageSrc}
          alt=""
          sx={{ width: p(360), height: p(270), objectFit: 'contain', bgcolor: '#FFFFFF' }}
        />
      )}
      <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(28), color: MUTED }}>
        {selectedOption ? optionPinyin(selectedOption) || ' ' : 'Tap an option below'}
      </Typography>
      <Box sx={{ display: 'flex', gap: `${p(28)}px`, flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((opt) => {
          const tone = optionTone(opt, selectedOption, isChecked, correctAnswer)
          return (
            <ButtonBase
              key={opt}
              disabled={isChecked}
              onClick={() => onSelect(opt)}
              sx={{
                minWidth: p(180),
                height: p(120),
                px: `${p(28)}px`,
                borderRadius: '100px',
                bgcolor: '#F3F4F6',
                boxSizing: 'border-box',
                border: tone ? `${p(4)}px solid ${tone}` : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontFamily: PINYIN_FONT, fontSize: p(24), color: MUTED, lineHeight: 1.2 }}>
                {optionPinyin(opt)}
              </Typography>
              <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(40), color: INK, lineHeight: 1.2 }}>
                {extractHanzi(opt)}
              </Typography>
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}

function ImageLabelBody({
  p,
  options,
  imageUrls,
  selectedOption,
  isChecked,
  correctAnswer,
  prompt,
  onSelect,
}: {
  p: (n: number) => number
  options: string[]
  imageUrls: string[]
  selectedOption: string | null
  isChecked: boolean
  correctAnswer: string
  prompt?: string
  onSelect: (value: string) => void
}) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: `${p(36)}px` }}>
      {prompt && (
        <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(56), lineHeight: 1.4, color: ORANGE }}>
          {prompt}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: `${p(48)}px`, flexWrap: 'wrap' }}>
        {options.map((opt, idx) => (
          <ImageTile
            key={opt}
            p={p}
            src={resolvePracticeImage(imageUrls[idx], extractHanzi(opt))}
            label={OPTION_LABELS[idx] || String(idx + 1)}
            tone={optionTone(opt, selectedOption, isChecked, correctAnswer)}
            disabled={isChecked}
            onClick={() => onSelect(opt)}
            caption={extractHanzi(opt)}
            captionPinyin={optionPinyin(opt)}
          />
        ))}
      </Box>
    </Box>
  )
}

function MeaningBody({
  p,
  imageSrc,
  word,
  pinyin,
  options,
  selectedOption,
  isChecked,
  correctAnswer,
  onPlay,
  onSelect,
}: {
  p: (n: number) => number
  imageSrc: string
  word: string
  pinyin: string
  options: string[]
  selectedOption: string | null
  isChecked: boolean
  correctAnswer: string
  onPlay: () => void
  onSelect: (value: string) => void
}) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: `${p(28)}px` }}>
      {isEmoji(imageSrc) ? (
        <Typography sx={{ fontSize: p(140), lineHeight: 1 }}>{imageSrc}</Typography>
      ) : (
        <Box component="img" src={imageSrc} alt="" sx={{ width: p(320), height: p(240), objectFit: 'contain' }} />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px` }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: PINYIN_FONT, fontSize: p(28), color: INK }}>{pinyin}</Typography>
          <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(48), color: INK }}>{word}</Typography>
        </Box>
        <ButtonBase
          onClick={onPlay}
          aria-label={`Play ${word}`}
          sx={{ width: p(56), height: p(56), borderRadius: '50%', color: ORANGE }}
        >
          <VolumeUpIcon sx={{ fontSize: p(36) }} />
        </ButtonBase>
      </Box>
      <Box sx={{ display: 'flex', gap: `${p(24)}px`, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        {options.map((opt) => {
          const tone = optionTone(opt, selectedOption, isChecked, correctAnswer)
          return (
            <ButtonBase
              key={opt}
              disabled={isChecked}
              onClick={() => onSelect(opt)}
              sx={{
                flex: '1 1 0',
                minWidth: p(220),
                maxWidth: p(400),
                height: p(100),
                borderRadius: '100px',
                bgcolor: '#F3F4F6',
                border: tone ? `${p(4)}px solid ${tone}` : '1px solid transparent',
                fontFamily: FIGMA_FONT,
                fontSize: p(32),
                color: INK,
              }}
            >
              {opt}
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}

function SentenceGridBody({
  p,
  options,
  selectedOption,
  isChecked,
  correctAnswer,
  showSpeaker,
  isPlayingAudio,
  prompt,
  onPlay,
  onSelect,
}: {
  p: (n: number) => number
  options: string[]
  selectedOption: string | null
  isChecked: boolean
  correctAnswer: string
  showSpeaker?: boolean
  isPlayingAudio?: boolean
  prompt?: string
  onPlay?: () => void
  onSelect: (value: string) => void
}) {
  return (
    <Box sx={{ width: '100%', maxWidth: p(1800), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: `${p(32)}px` }}>
      {showSpeaker && onPlay && <SpeakerButton p={p} onClick={onPlay} disabled={isPlayingAudio} />}
      {prompt && (
        <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(56), lineHeight: 1.4, color: ORANGE, textAlign: 'center' }}>
          {prompt}
        </Typography>
      )}
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${p(28)}px`,
        }}
      >
        {options.map((opt) => {
          const tone = optionTone(opt, selectedOption, isChecked, correctAnswer)
          return (
            <ButtonBase
              key={opt}
              disabled={isChecked}
              onClick={() => onSelect(opt)}
              sx={{
                minHeight: p(140),
                px: `${p(40)}px`,
                py: `${p(24)}px`,
                borderRadius: `${p(40)}px`,
                bgcolor: '#F8F9F8',
                border: tone ? `${p(4)}px solid ${tone}` : `1px solid ${LINE}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
              }}
            >
              <Typography sx={{ fontFamily: PINYIN_FONT, fontSize: p(24), color: MUTED, lineHeight: 1.4 }}>
                {optionPinyin(opt)}
              </Typography>
              <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(40), color: INK, lineHeight: 1.4 }}>
                {opt}
              </Typography>
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}
