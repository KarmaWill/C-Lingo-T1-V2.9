import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { CharacterWritingPractice } from '../components/Lesson/CharacterWritingPractice'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import FeedbackEntryButton from '../components/feedback/FeedbackEntryButton'
import { CURRENT_LESSON } from '../mock/lessonData'
import { LearningCard } from '../types/lesson'
import { APP_FONT_FAMILY } from '../theme/appFont'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

const INK = '#2D3436'
const HINT = '#A7B3B8'
const LINE = '#E0E0DF'
const PINYIN_FONT = '"FZPinYinHandwriting", "Google Sans Flex Variable", "Google Sans Flex", sans-serif'
const KAI_FONT = '"FZNewKai GB18030L2", "KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

type StatKind = 'hanzi' | 'vocab' | 'sentence'

function englishMeaning(meaning: string): string {
  const parts = meaning.split(/\s*\/\s*/)
  return (parts[parts.length - 1] || meaning).trim()
}

function hanziCount(content: string): number {
  return [...content.replace(/[。？！.?!,，、\s]/g, '')].length
}

function vocabCardWidth(content: string, p: (n: number) => number): number {
  const n = hanziCount(content)
  if (n <= 2) return p(223)
  if (n === 3) return p(250)
  if (n === 4) return p(303)
  return p(Math.min(394, 40 + n * 70))
}

function StatDecor({ kind, p }: { kind: StatKind; p: (n: number) => number }) {
  const palette = {
    hanzi: { back: '#9DCBFF', front: '#3F98FF' },
    vocab: { back: '#95E8D3', front: '#34C2B2' },
    sentence: { back: '#FFC6B1', front: '#FF7645' },
  }[kind]

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        right: p(16),
        top: p(16),
        width: p(147),
        height: p(147),
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: p(43),
          width: p(90),
          height: p(96),
          bgcolor: palette.back,
          borderRadius: `${p(22)}px`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: p(6),
          top: 0,
          width: p(110),
          height: p(120),
          bgcolor: palette.front,
          borderRadius: `${p(28)}px`,
          transform: 'rotate(-17deg)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 18px rgba(45, 52, 54, 0.08)',
        }}
      >
        {kind === 'hanzi' && (
          <Box sx={{ position: 'relative', width: p(56), height: p(56) }}>
            <Box sx={{ position: 'absolute', inset: 0, border: `1.5px dashed rgba(255,255,255,0.5)` }} />
            <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '1.5px dashed rgba(255,255,255,0.5)' }} />
            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 0, borderTop: '1.5px dashed rgba(255,255,255,0.5)' }} />
            <Typography
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: '#FFFFFF',
                fontFamily: KAI_FONT,
                fontSize: p(28),
                lineHeight: 1,
              }}
            >
              汉
            </Typography>
          </Box>
        )}
        {kind === 'vocab' && (
          <Typography
            sx={{
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(48),
              lineHeight: 1,
            }}
          >
            W
          </Typography>
        )}
        {kind === 'sentence' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(10)}px`, alignItems: 'flex-start' }}>
            <Box sx={{ width: p(48), height: p(8), bgcolor: '#FFFFFF', borderRadius: `${p(4)}px` }} />
            <Box sx={{ width: p(30), height: p(8), bgcolor: '#FFFFFF', borderRadius: `${p(4)}px` }} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

function TermCard({
  item,
  p,
  width,
  align = 'center',
  onClick,
}: {
  item: LearningCard
  p: (n: number) => number
  width: number | string
  align?: 'center' | 'left'
  onClick?: () => void
}) {
  const isSentence = align === 'left'
  const CardRoot = onClick ? ButtonBase : Box
  return (
    <CardRoot
      onClick={onClick}
      sx={{
        width,
        height: isSentence ? p(237) : p(223),
        boxSizing: 'border-box',
        bgcolor: '#FFFFFF',
        border: `1px solid ${LINE}`,
        borderRadius: `${p(40)}px`,
        px: `${p(isSentence ? 40 : 20)}px`,
        py: `${p(32)}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSentence ? 'flex-start' : 'center',
        justifyContent: 'center',
        textAlign: align,
        ...(onClick ? { '&:active': { transform: 'scale(0.985)' } } : {}),
      }}
    >
      <Typography
        sx={{
          width: '100%',
          fontFamily: PINYIN_FONT,
          fontWeight: 400,
          fontSize: p(28),
          lineHeight: 1.6,
          color: INK,
          mb: `${p(-8)}px`,
        }}
      >
        {item.pinyin}
      </Typography>
      <Typography
        sx={{
          width: '100%',
          fontFamily: KAI_FONT,
          fontWeight: 400,
          fontSize: p(48),
          lineHeight: 1.6,
          color: INK,
        }}
      >
        {item.content}
      </Typography>
      <Typography
        sx={{
          width: '100%',
          fontFamily: FIGMA_FONT,
          fontWeight: 400,
          fontSize: p(isSentence ? 32 : 28),
          lineHeight: 1.6,
          color: HINT,
        }}
      >
        {englishMeaning(item.meaning)}
      </Typography>
    </CardRoot>
  )
}

function SectionBlock({
  title,
  sectionRef,
  children,
}: {
  title: string
  sectionRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  return (
    <Box ref={sectionRef} sx={{ width: '100%' }}>
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontWeight: 700,
          fontSize: p(40),
          lineHeight: 1.6,
          color: INK,
          mb: `${p(28)}px`,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export default function StudyReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const hanziRef = useRef<HTMLDivElement>(null)
  const vocabRef = useRef<HTMLDivElement>(null)
  const sentenceRef = useRef<HTMLDivElement>(null)
  const [writingIndex, setWritingIndex] = useState<number | null>(null)

  const hskLevelRaw = searchParams.get('hskLevel')
  const hskReportLevel =
    hskLevelRaw != null && /^[1-6]$/.test(hskLevelRaw) ? (Number(hskLevelRaw) as 1 | 2 | 3 | 4 | 5 | 6) : null

  const lesson = (location.state as { lesson?: typeof CURRENT_LESSON } | null)?.lesson || CURRENT_LESSON

  const allVocab: LearningCard[] = []
  const allSentences: LearningCard[] = []
  const allHanzi: LearningCard[] = []

  lesson.units.forEach((unit) => {
    unit.learnings.forEach((learning) => {
      if (learning.type === 'vocab') allVocab.push(learning)
      else if (learning.type === 'sentence') allSentences.push(learning)
      else if (learning.type === 'hanzi') allHanzi.push(learning)
    })
  })

  const writingChars = allHanzi
    .map((item) => {
      const character = [...item.content].find((ch) => /[\u4e00-\u9fff]/.test(ch)) || item.content.trim()
      return {
        character,
        pinyin: item.pinyin,
        meaning: englishMeaning(item.meaning),
      }
    })
    .filter((item) => item.character)

  const handleBack = () => {
    const from = (location.state as { from?: string } | null)?.from
    if (from) {
      navigate(from)
      return
    }
    navigate(`/lesson/${lesson.id}`)
  }

  const scrollTo = (ref: RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openWriting = (index = 0) => {
    if (writingChars.length === 0) return
    setWritingIndex(Math.min(Math.max(0, index), writingChars.length - 1))
  }

  const stats: Array<{
    key: StatKind
    label: string
    value: number
    color: string
    gradient: string
    target: RefObject<HTMLDivElement | null>
  }> = [
    {
      key: 'hanzi',
      label: 'Characters',
      value: allHanzi.length,
      color: '#2188FE',
      gradient: 'linear-gradient(94.72deg, #EEF6FF 7.09%, #DBECFF 92.81%)',
      target: hanziRef,
    },
    {
      key: 'vocab',
      label: 'Vocabulary',
      value: allVocab.length,
      color: '#00B4A0',
      gradient: 'linear-gradient(277.79deg, #DDF9E9 25.56%, #F3FAF6 85.23%)',
      target: vocabRef,
    },
    {
      key: 'sentence',
      label: 'Sentences',
      value: allSentences.length,
      color: '#FF6B35',
      gradient: 'linear-gradient(95.17deg, #FFF3EE 9.38%, #FFE7DD 92.4%)',
      target: sentenceRef,
    },
  ]

  if (writingIndex != null && writingChars.length > 0) {
    return (
      <CharacterWritingPractice
        characters={writingChars}
        initialIndex={writingIndex}
        onClose={() => setWritingIndex(null)}
        finishLabel="Back to report"
      />
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          height: p(160),
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          boxSizing: 'border-box',
        }}
      >
        <HskPrepBackButton
          onClick={handleBack}
          sx={{
            position: 'absolute',
            left: p(60),
            top: p(40),
            width: p(80),
            height: p(80),
          }}
        />
        <Typography
          sx={{
            position: 'absolute',
            left: '50%',
            top: p(48),
            transform: 'translateX(-50%)',
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: 1.6,
            color: INK,
            whiteSpace: 'nowrap',
          }}
        >
          {hskReportLevel != null ? `HSK ${hskReportLevel} · Study Report` : 'Study Report'}
        </Typography>
        <Box sx={{ position: 'absolute', right: p(60), top: p(40) }}>
          <FeedbackEntryButton context={{ screen: 'study_report' }} />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          px: `${p(60)}px`,
          pt: `${p(40)}px`,
          pb: `${p(60)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', gap: `${p(40)}px`, mb: `${p(60)}px` }}>
          {stats.map((card) => (
            <ButtonBase
              key={card.key}
              onClick={() => {
                if (card.value <= 0) return
                if (card.key === 'hanzi') {
                  openWriting(0)
                  return
                }
                scrollTo(card.target)
              }}
              sx={{
                flex: 1,
                height: p(160),
                borderRadius: `${p(40)}px`,
                background: card.gradient,
                overflow: 'hidden',
                position: 'relative',
                justifyContent: 'flex-start',
                alignItems: 'center',
                px: `${p(80)}px`,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(28),
                    lineHeight: 1.6,
                    color: INK,
                    mb: `${p(-6)}px`,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(48),
                    lineHeight: 1.6,
                    color: card.color,
                  }}
                >
                  {card.value}
                </Typography>
              </Box>
              <StatDecor kind={card.key} p={p} />
            </ButtonBase>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(60)}px` }}>
          {allHanzi.length > 0 && (
            <SectionBlock title="Character List" sectionRef={hanziRef}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${p(40)}px` }}>
                {allHanzi.map((hanzi, index) => (
                  <TermCard
                    key={hanzi.id}
                    item={hanzi}
                    p={p}
                    width={p(223)}
                    onClick={() => openWriting(index)}
                  />
                ))}
              </Box>
            </SectionBlock>
          )}

          {allVocab.length > 0 && (
            <SectionBlock title="Vocabulary List" sectionRef={vocabRef}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${p(40)}px` }}>
                {allVocab.map((vocab) => (
                  <TermCard key={vocab.id} item={vocab} p={p} width={vocabCardWidth(vocab.content, p)} />
                ))}
              </Box>
            </SectionBlock>
          )}

          {allSentences.length > 0 && (
            <SectionBlock title="Key Sentences" sectionRef={sentenceRef}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(28)}px` }}>
                {allSentences.map((sentence) => (
                  <TermCard key={sentence.id} item={sentence} p={p} width="100%" align="left" />
                ))}
              </Box>
            </SectionBlock>
          )}
        </Box>
      </Box>
    </Box>
  )
}
