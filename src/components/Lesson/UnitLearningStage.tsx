import { useEffect, useMemo, useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { HskPrepBackButton } from '../hsk/HskPrepBackButton'
import { Unit } from '../../types/lesson'
import { CURRENT_LESSON } from '../../mock/lessonData'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../../utils/figmaScale'
import { splitPinyinInput, splitPinyinWord } from '../../utils/pinyinRuby'

interface Props {
  unit: Unit
  onComplete: () => void
  onExit: () => void
}

const PAGE_BG = '#F8F9F8'
const INK = '#2D3436'
const MUTED = '#636E72'
const LINE = '#E0E0DF'
const TEAL = '#00B4A0'
const ORANGE = '#FF6B35'
const HAN_RE = /[\u4e00-\u9fff]/
const PINYIN_FONT = '"FZPinYinHandwriting", "Google Sans Flex Variable", "Google Sans Flex", sans-serif'
const KAI_FONT = '"FZNewKai GB18030L2", "KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

type Glyph = { han: string; pinyin: string }

function pairGlyphs(content: string, pinyin: string): Glyph[] {
  const hanzi = [...content].filter((ch) => HAN_RE.test(ch))
  const syllables = splitPinyinInput(pinyin).flatMap((token) => {
    const parts = splitPinyinWord(token)
    return parts.length ? parts : [token]
  })
  return hanzi.map((han, index) => ({ han, pinyin: syllables[index] ?? '' }))
}

function extractNativeLanguage(meaning: string) {
  const parts = meaning.split(' / ')
  return parts.length > 1 ? parts.slice(1).join(' / ') : meaning
}

function posAbbrev(raw: string) {
  const key = raw.toLowerCase()
  if (key === 'noun' || key === 'n.') return 'n.'
  if (key === 'verb' || key === 'v.') return 'v.'
  if (key === 'adjective' || key === 'adj.') return 'adj.'
  if (key === 'adverb' || key === 'adv.') return 'adv.'
  return 'n.'
}

function guessPartOfSpeech(content: string, meaning: string) {
  const meaningText = extractNativeLanguage(meaning)
  const match = meaningText.match(/\((noun|verb|adjective|adverb|n\.|v\.|adj\.|adv\.)\)/i)
  if (match?.[1]) return posAbbrev(match[1])

  const common: Record<string, string> = {
    rice: 'n.',
    water: 'n.',
    noodles: 'n.',
    dumplings: 'n.',
    tea: 'n.',
    coffee: 'n.',
    bread: 'n.',
    food: 'n.',
    bun: 'n.',
    eat: 'v.',
    drink: 'v.',
    want: 'v.',
    have: 'v.',
    good: 'adj.',
    nice: 'adj.',
    big: 'adj.',
    small: 'adj.',
    米: 'n.',
    米饭: 'n.',
  }

  const words = meaningText
    .toLowerCase()
    .replace(/[().,]/g, '')
    .split(/\s+/)
    .filter((word) => word && !['a', 'an', 'the'].includes(word))
  const last = words[words.length - 1]
  const first = words[0]

  return common[content] || common[last] || common[first] || 'n.'
}

function playChineseAudio(text: string, audioUrl?: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    void audio.play().catch(() => {
      speak(text)
    })
    return
  }
  speak(text)
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.9
  utterance.pitch = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

function ArrowIcon({ color, flip, size }: { color: string; flip?: boolean; size: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 28 23"
      sx={{
        width: size,
        height: size * 0.82,
        display: 'block',
        transform: flip ? 'scaleX(-1)' : 'none',
        flexShrink: 0,
      }}
    >
      <path
        d="M2 11.5h18.5M14.2 4.2 22.6 11.5 14.2 18.8"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  )
}

function PinyinStaff({ width, gap }: { width: number; gap: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        pointerEvents: 'none',
      }}
    >
      {['solid', 'dashed', 'dashed', 'solid'].map((style, index) => (
        <Box
          key={index}
          sx={{
            width: '100%',
            height: 0,
            borderTop: `1px ${style} ${LINE}`,
          }}
        />
      ))}
    </Box>
  )
}

function TianziCell({
  han,
  size,
  radius,
}: {
  han: string
  size: number
  radius: number
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        aspectRatio: '1 / 1',
        flexShrink: 0,
        boxSizing: 'border-box',
        bgcolor: '#FFF3EE',
        border: '2px solid rgba(255, 107, 53, 0.5)',
        borderRadius: `${radius}px`,
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.6,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            borderColor: 'rgba(255, 107, 53, 0.5)',
          },
          '&::before': {
            left: '50%',
            top: '2%',
            bottom: '2%',
            borderLeft: '1.5px dashed rgba(255, 107, 53, 0.5)',
          },
          '&::after': {
            top: '50%',
            left: '2%',
            right: '2%',
            borderTop: '1.5px dashed rgba(255, 107, 53, 0.5)',
          },
        }}
      />
      <Typography
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: KAI_FONT,
          fontWeight: 400,
          fontSize: size * 0.5,
          lineHeight: 1,
          color: INK,
          zIndex: 1,
        }}
      >
        {han}
      </Typography>
    </Box>
  )
}

export default function UnitLearningStage({ unit, onComplete, onExit }: Props) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const learnings = unit.learnings
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = learnings[currentIndex]
  const isLast = currentIndex === learnings.length - 1
  const hskLevel = CURRENT_LESSON.hskLevel || 1

  useEffect(() => {
    if (currentIndex > 0 && currentIndex >= learnings.length) {
      setCurrentIndex(Math.max(0, learnings.length - 1))
    }
  }, [currentIndex, learnings.length])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [currentIndex])

  const glyphs = useMemo(
    () => (currentCard ? pairGlyphs(currentCard.content, currentCard.pinyin) : []),
    [currentCard],
  )
  const hanziCount = glyphs.length
  const hasPunctuation = currentCard ? /[，。？！、：；“”"]/.test(currentCard.content) : false
  const isWordCard = hanziCount > 0 && hanziCount <= 2 && !hasPunctuation
  const isSingle = hanziCount === 1
  const cardTitle = isSingle ? 'Character Card' : 'Vocabulary Card'
  const showPos = isWordCard
  const cell = hanziCount <= 2 ? 200 : hanziCount <= 5 ? 140 : 110
  const pinyinSize = hanziCount <= 2 ? 44 : hanziCount <= 5 ? 32 : 24
  const staffGap = hanziCount <= 2 ? 24 : 17
  const cellRadius = hanziCount <= 2 ? 32 : 22
  const glyphGap = hanziCount <= 2 ? 60 : 24
  const nativeMeaning = currentCard ? extractNativeLanguage(currentCard.meaning) : ''
  const partOfSpeech = currentCard ? guessPartOfSpeech(currentCard.content, currentCard.meaning) : 'n.'
  const progressPct =
    learnings.length > 0 ? ((currentIndex + 1) / learnings.length) * 100 : 0

  const next = () => {
    if (isLast) onComplete()
    else setCurrentIndex((prev) => prev + 1)
  }

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((prevIndex) => prevIndex - 1)
  }

  if (!currentCard) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: PAGE_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <HskPrepBackButton onClick={onExit} sx={{ width: p(80), height: p(80) }} />
      </Box>
    )
  }

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
        <HskPrepBackButton onClick={onExit} sx={{ width: p(80), height: p(80) }} />
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${p(16)}px`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: `${p(24)}px`,
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: 1.6,
                color: INK,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {unit.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: 1.6,
                color: INK,
                flexShrink: 0,
              }}
            >
              {currentIndex + 1}/{learnings.length}
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: p(10),
              bgcolor: '#E8E8E8',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${progressPct}%`,
                height: '100%',
                bgcolor: TEAL,
                borderRadius: '20px',
                transition: 'width 0.25s ease',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: `${p(40)}px`,
          px: `${p(60)}px`,
          pt: `${p(40)}px`,
          pb: `${p(40)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            border: `1px solid ${LINE}`,
            borderRadius: `${p(40)}px`,
            display: 'flex',
            flexDirection: 'column',
            px: `${p(32)}px`,
            pt: `${p(32)}px`,
            pb: `${p(32)}px`,
            gap: `${p(32)}px`,
          }}
        >
          <Box
            sx={{
              alignSelf: 'flex-start',
              boxSizing: 'border-box',
              height: p(54),
              px: `${p(20)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F3F4F6',
              border: `1px solid ${LINE}`,
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(28),
                lineHeight: 1.6,
                color: MUTED,
                textAlign: 'center',
              }}
            >
              Memory Aids
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
          <Box
            sx={{
              width: '100%',
              maxHeight: '100%',
              aspectRatio: '4 / 3',
              boxSizing: 'border-box',
              border: `1px solid ${LINE}`,
              borderRadius: `${p(40)}px`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#FFFFFF',
            }}
          >
            {currentCard.imageUrl ? (
              <Box
                component="img"
                key={currentCard.id}
                src={currentCard.imageUrl}
                alt=""
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  backgroundColor: '#FFFFFF',
                }}
              />
            ) : null}
          </Box>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              boxSizing: 'border-box',
              minHeight: p(120),
              px: `${p(32)}px`,
              py: `${p(28)}px`,
              bgcolor: '#F3FAF6',
              border: '1px solid rgba(0, 180, 160, 0.25)',
              borderRadius: `${p(32)}px`,
              display: 'flex',
              alignItems: 'center',
              gap: `${p(24)}px`,
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(40),
                lineHeight: 1.6,
                color: INK,
                minWidth: 0,
              }}
            >
              {nativeMeaning}
            </Typography>
            {showPos ? (
              <Box
                sx={{
                  flexShrink: 0,
                  height: p(54),
                  px: `${p(24)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#D4F3EE',
                  borderRadius: '12px',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(28),
                    lineHeight: 1.6,
                    color: TEAL,
                    textAlign: 'center',
                  }}
                >
                  {partOfSpeech}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${p(40)}px`,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              boxSizing: 'border-box',
              bgcolor: '#FFFFFF',
              border: `1px solid ${LINE}`,
              borderRadius: `${p(40)}px`,
              px: `${p(40)}px`,
              pt: `${p(32)}px`,
              pb: `${p(40)}px`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 400,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: MUTED,
                }}
              >
                {cardTitle}
              </Typography>
              <Box
                sx={{
                  boxSizing: 'border-box',
                  height: p(54),
                  px: `${p(40)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#F3FAF6',
                  border: `1px solid ${TEAL}`,
                  borderRadius: '12px',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(28),
                    lineHeight: 1.6,
                    color: TEAL,
                    textAlign: 'center',
                  }}
                >
                  HSK {hskLevel}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(40)}px`,
              }}
            >
              <Box sx={{ position: 'relative', width: 'fit-content', maxWidth: '100%' }}>
                <PinyinStaff
                  width={p(Math.min(796, cell * Math.max(hanziCount, 1) + glyphGap * Math.max(0, hanziCount - 1)))}
                  gap={p(staffGap)}
                />
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: `${p(glyphGap)}px`,
                    flexWrap: hanziCount > 5 ? 'wrap' : 'nowrap',
                  }}
                >
                  {glyphs.map((glyph, index) => (
                    <Box
                      key={`${glyph.han}-${index}`}
                      sx={{
                        width: p(cell),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          width: '100%',
                          height: p(hanziCount <= 2 ? 72 : 51),
                          fontFamily: PINYIN_FONT,
                          fontWeight: 400,
                          fontSize: p(pinyinSize),
                          lineHeight: 1.6,
                          color: INK,
                          textAlign: 'center',
                        }}
                      >
                        {glyph.pinyin}
                      </Typography>
                      <TianziCell han={glyph.han} size={p(cell)} radius={p(cellRadius)} />
                    </Box>
                  ))}
                </Box>
              </Box>

              <ButtonBase
                onClick={() => playChineseAudio(currentCard.content, currentCard.audioUrl)}
                aria-label={`Play pronunciation ${currentCard.content}`}
                sx={{
                  width: p(110),
                  height: p(70),
                  borderRadius: '50px',
                  bgcolor: ORANGE,
                  color: '#FFFFFF',
                  flexShrink: 0,
                  '&:active': { transform: 'scale(0.96)', bgcolor: '#E55A2B' },
                }}
              >
                <VolumeUpIcon sx={{ fontSize: p(44) }} />
              </ButtonBase>
            </Box>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: `${p(32)}px`,
            }}
          >
            <ButtonBase
              onClick={prev}
              disabled={currentIndex === 0}
              aria-label="Previous"
              sx={{
                boxSizing: 'border-box',
                width: p(160),
                height: p(100),
                borderRadius: '100px',
                bgcolor: '#E8E8E8',
                border: `1px solid ${LINE}`,
                '&.Mui-disabled': { opacity: 0.5 },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <ArrowIcon color={INK} flip size={p(40)} />
            </ButtonBase>
            <ButtonBase
              onClick={next}
              sx={{
                boxSizing: 'border-box',
                flex: 1,
                height: p(100),
                borderRadius: '100px',
                bgcolor: TEAL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(12)}px`,
                '&:active': { transform: 'scale(0.99)', bgcolor: '#009688' },
              }}
            >
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 400,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                }}
              >
                Next
              </Typography>
              <ArrowIcon color="#FFFFFF" size={p(40)} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
