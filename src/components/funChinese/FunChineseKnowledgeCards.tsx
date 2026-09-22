import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import type { ReactNode } from 'react'
import { APP_FONT_FAMILY } from '../../theme/appFont'
import { APP_SCREEN_SIZE, figmaPx } from '../../utils/figmaScale'

type CardType = 'dialogue' | 'grammar' | 'pattern'

type DialogueLine = {
  role: 'A' | 'B'
  speaker: string
  chinese: string
  pinyin: string
  translation: { en: string; vi: string }
}

export type KnowledgeCardData = {
  type: CardType
  title: string
  titleVi: string
  content: {
    scene?: string
    dialogueLines?: DialogueLine[]
    point?: string
    function?: string
    formula?: string
    examples?: { chinese: string; pinyin: string; translation: string }[]
  }
}

interface Props {
  card: KnowledgeCardData
  index: number
  total: number
  onBack: () => void
  onPrevious: () => void
  onNext: () => void
  onSpeak: (text: string) => void
}

const TEAL = '#00B4A0'
const INK = '#2D3436'
const SECONDARY = '#636E72'
const ORANGE = '#FF6B35'
const YELLOW = '#FBBC04'
const BLUE = '#1A73E8'
const GREEN = '#34A853'
const KAI_FONT = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

function cardName(type: CardType) {
  if (type === 'pattern') return 'Pattern Card'
  if (type === 'dialogue') return 'Dialogue Card'
  return 'Grammar Card'
}

function AudioButton({ text, onSpeak }: { text: string; onSpeak: (text: string) => void }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <ButtonBase
      onClick={() => onSpeak(text)}
      aria-label={`Play ${text}`}
      sx={{
        width: p(86),
        height: p(55),
        minWidth: p(86),
        borderRadius: 999,
        bgcolor: ORANGE,
        color: '#FFFFFF',
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <VolumeUpIcon sx={{ fontSize: p(28) }} />
    </ButtonBase>
  )
}

function SectionCard({
  accent,
  title,
  children,
  minHeight,
}: {
  accent: string
  title: string
  children: ReactNode
  minHeight?: number
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        minHeight: minHeight ? p(minHeight) : undefined,
        boxSizing: 'border-box',
        p: `${p(32)}px ${p(40)}px`,
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0DF',
        borderRadius: `${p(24)}px`,
        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: `${p(24)}px`, height: '100%' }}>
        <Box sx={{ width: p(6), borderRadius: 999, bgcolor: accent, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: p(32), lineHeight: 1.6, color: INK }}>
            {title}
          </Typography>
          <Box sx={{ mt: `${p(12)}px` }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  )
}

function Sentence({
  pinyin,
  chinese,
  translation,
  onSpeak,
  align = 'left',
}: {
  pinyin: string
  chinese: string
  translation: string
  onSpeak: (text: string) => void
  align?: 'left' | 'right'
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box sx={{ minWidth: 0, textAlign: align }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'right' ? 'flex-end' : 'space-between',
          gap: `${p(24)}px`,
        }}
      >
        {align === 'right' && <AudioButton text={chinese} onSpeak={onSpeak} />}
        <Box>
          <Typography sx={{ fontSize: p(24), lineHeight: 1.45, color: INK }}>
            {pinyin}
          </Typography>
          <Typography
            sx={{
              mt: `${p(4)}px`,
              fontFamily: KAI_FONT,
              fontSize: p(58),
              lineHeight: 1.35,
              color: INK,
              whiteSpace: 'nowrap',
            }}
          >
            {chinese}
          </Typography>
        </Box>
        {align === 'left' && <AudioButton text={chinese} onSpeak={onSpeak} />}
      </Box>
      <Typography
        sx={{
          mt: `${p(12)}px`,
          pt: `${p(12)}px`,
          borderTop: '1px solid #F3F4F6',
          fontSize: p(32),
          lineHeight: 1.25,
          color: SECONDARY,
        }}
      >
        {translation}
      </Typography>
    </Box>
  )
}

function GrammarCard({
  card,
  onSpeak,
}: {
  card: KnowledgeCardData
  onSpeak: (text: string) => void
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const point = card.content.point || '吗 (ma)'
  const hanzi = point.match(/^[^\s(]+/)?.[0] || '吗'
  const pinyin = point.match(/\(([^)]+)\)/)?.[1] || 'ma'
  const examples = [
    { slots: [{ py: 'nǐ', zh: '你' }, { py: 'hǎo', zh: '好' }, { py: pinyin, zh: hanzi }], en: 'Are you okay?' },
    { slots: [{ py: 'tā', zh: '他' }, { py: 'hěn hǎo', zh: '很好' }, { py: pinyin, zh: hanzi }], en: 'Is he fine?' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(30)}px` }}>
      <Box
        sx={{
          minHeight: p(229),
          boxSizing: 'border-box',
          px: `${p(48)}px`,
          py: `${p(26)}px`,
          border: '1px solid #E0E0DF',
          borderRadius: `${p(24)}px`,
          boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(48)}px`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: p(28), lineHeight: 1.4 }}>{pinyin}</Typography>
          <Typography sx={{ fontFamily: KAI_FONT, fontSize: p(90), lineHeight: 1.25 }}>{hanzi}</Typography>
        </Box>
        <Box sx={{ width: '1px', height: p(100), bgcolor: '#DADCE0', flexShrink: 0 }} />
        <Box>
          <Box
            sx={{
              display: 'inline-flex',
              px: `${p(16)}px`,
              py: `${p(3)}px`,
              borderRadius: 999,
              bgcolor: '#E8F0FE',
              color: BLUE,
              fontSize: p(32),
            }}
          >
            Particle
          </Box>
          <Typography sx={{ mt: `${p(8)}px`, fontSize: p(36), color: INK }}>
            question particle
          </Typography>
        </Box>
        <AudioButton text={hanzi} onSpeak={onSpeak} />
      </Box>

      <SectionCard accent={GREEN} title="Function" minHeight={213}>
        <Typography sx={{ fontSize: p(36), lineHeight: 1.55, color: SECONDARY }}>
          {card.content.function}
        </Typography>
      </SectionCard>

      <SectionCard accent={YELLOW} title="Structure" minHeight={213}>
        <Typography sx={{ fontSize: p(40), lineHeight: 1.55, color: SECONDARY }}>
          {card.content.formula}
        </Typography>
      </SectionCard>

      <SectionCard accent={BLUE} title="Example usage">
        <Box sx={{ mt: `${p(12)}px`, overflow: 'hidden', borderRadius: `${p(24)}px`, bgcolor: '#F8F9FA' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', minHeight: p(90) }}>
            {['Subject', 'Statement', 'Question marker'].map((label) => (
              <Typography
                key={label}
                sx={{ display: 'grid', placeItems: 'center', fontSize: p(32), fontWeight: 700, color: SECONDARY }}
              >
                {label}
              </Typography>
            ))}
          </Box>
          {examples.map((example, row) => (
            <Box key={row}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {example.slots.map((slot, column) => (
                  <Box
                    key={`${slot.zh}-${column}`}
                    sx={{
                      minHeight: p(150),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #EEF1F3',
                      color: column === 1 ? TEAL : INK,
                    }}
                  >
                    <Typography sx={{ fontSize: p(24) }}>{slot.py}</Typography>
                    <Typography sx={{ mt: `${p(4)}px`, fontFamily: KAI_FONT, fontSize: p(58), lineHeight: 1.3 }}>
                      {slot.zh}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  minHeight: p(92),
                  px: `${p(48)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontSize: p(32), color: SECONDARY }}>{example.en}</Typography>
                <AudioButton text={example.slots.map((slot) => slot.zh).join('')} onSpeak={onSpeak} />
              </Box>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Box>
  )
}

function PatternCard({
  card,
  onSpeak,
}: {
  card: KnowledgeCardData
  onSpeak: (text: string) => void
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const examples = (card.content.examples || []).slice(0, 2)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(40)}px` }}>
      <SectionCard accent={YELLOW} title="Pattern" minHeight={213}>
        <Typography sx={{ fontSize: p(40), lineHeight: 1.55, color: SECONDARY }}>
          {card.content.function} ({card.content.formula})
        </Typography>
      </SectionCard>
      {examples.map((example, index) => (
        <Box
          key={`${example.chinese}-${index}`}
          sx={{
            minHeight: p(281),
            boxSizing: 'border-box',
            p: `${p(48)}px`,
            border: '1px solid #E0E0DF',
            borderRadius: `${p(24)}px`,
            boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
          }}
        >
          <Sentence
            pinyin={example.pinyin}
            chinese={example.chinese}
            translation={example.translation}
            onSpeak={onSpeak}
          />
        </Box>
      ))}
    </Box>
  )
}

function DialogueCard({
  card,
  onSpeak,
}: {
  card: KnowledgeCardData
  onSpeak: (text: string) => void
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const lines = card.content.dialogueLines || []
  const patternA = lines.find((line) => line.role === 'A' && line.chinese.includes('吗')) || lines.find((line) => line.role === 'A')
  const patternB = lines.find((line) => line.role === 'B' && !line.chinese.includes('你好')) || lines.find((line) => line.role === 'B')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(40)}px` }}>
      <SectionCard accent={GREEN} title="Use case" minHeight={213}>
        <Typography sx={{ fontSize: p(40), lineHeight: 1.55, color: SECONDARY }}>
          {card.content.scene || card.content.function}
        </Typography>
      </SectionCard>

      <SectionCard accent={YELLOW} title="Sentence pattern" minHeight={281}>
        <Typography sx={{ fontSize: p(40), lineHeight: 1.55, color: SECONDARY }}>
          A: {patternA?.chinese || '你好吗？'}
        </Typography>
        <Typography sx={{ fontSize: p(40), lineHeight: 1.55, color: SECONDARY }}>
          B: {patternB?.chinese || '我很好。谢谢！'}
        </Typography>
      </SectionCard>

      <SectionCard accent={BLUE} title="Dialogue">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px`, mt: `${p(20)}px` }}>
          {lines.map((line, index) => {
            const right = line.role === 'B'
            return (
              <Box
                key={`${line.speaker}-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: right ? 'flex-end' : 'flex-start',
                  gap: `${p(15)}px`,
                }}
              >
                {!right && (
                  <Box
                    sx={{
                      width: p(90),
                      height: p(90),
                      borderRadius: '50%',
                      bgcolor: '#F3F4F6',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: p(42),
                    }}
                  >
                    A
                  </Box>
                )}
                <Box
                  sx={{
                    width: p(550),
                    boxSizing: 'border-box',
                    p: `${p(28)}px ${p(32)}px`,
                    bgcolor: '#F8F9FA',
                    borderRadius: `${p(24)}px`,
                  }}
                >
                  <Sentence
                    pinyin={line.pinyin}
                    chinese={line.chinese}
                    translation={line.translation.en}
                    onSpeak={onSpeak}
                    align={right ? 'right' : 'left'}
                  />
                </Box>
                {right && (
                  <Box
                    sx={{
                      width: p(90),
                      height: p(90),
                      borderRadius: '50%',
                      bgcolor: '#F3F4F6',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: p(42),
                    }}
                  >
                    B
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      </SectionCard>
    </Box>
  )
}

export default function FunChineseKnowledgeCards({
  card,
  index,
  total,
  onBack,
  onPrevious,
  onNext,
  onSpeak,
}: Props) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const progress = `${((index + 1) / total) * 100}%`

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
          onClick={onBack}
          aria-label="Back"
          sx={{
            width: p(80),
            height: p(80),
            minWidth: p(80),
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            color: INK,
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: p(40) }} />
        </ButtonBase>

        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: `${p(16)}px` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: p(32), lineHeight: 1.6, color: INK }}>
              Knowledge – {cardName(card.type)}
            </Typography>
            <Typography sx={{ fontSize: p(32), lineHeight: 1.6, color: INK, fontVariantNumeric: 'tabular-nums' }}>
              {index + 1}/{total}
            </Typography>
          </Box>
          <Box sx={{ height: p(10), borderRadius: 999, bgcolor: '#E8E8E8', overflow: 'hidden' }}>
            <Box
              sx={{
                width: progress,
                height: '100%',
                borderRadius: 'inherit',
                bgcolor: TEAL,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          px: `${p(60)}px`,
          py: `${p(40)}px`,
          scrollbarWidth: 'thin',
          scrollbarColor: '#C5CECC transparent',
          '&::-webkit-scrollbar': { width: p(8) },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#C5CECC', borderRadius: 999 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: p(1800), mx: 'auto' }}>
          {card.type === 'grammar' && <GrammarCard card={card} onSpeak={onSpeak} />}
          {card.type === 'pattern' && <PatternCard card={card} onSpeak={onSpeak} />}
          {card.type === 'dialogue' && <DialogueCard card={card} onSpeak={onSpeak} />}
        </Box>
      </Box>

      <Box
        sx={{
          height: p(141),
          flexShrink: 0,
          boxSizing: 'border-box',
          px: `${p(60)}px`,
          pb: `${p(40)}px`,
          display: 'grid',
          gridTemplateColumns: `${p(570)}px minmax(0, 1fr)`,
          gap: `${p(24)}px`,
        }}
      >
        <ButtonBase
          disabled={index === 0}
          onClick={onPrevious}
          sx={{
            height: p(101),
            borderRadius: 999,
            bgcolor: '#FFFFFF',
            border: '2.4px solid',
            borderColor: index === 0 ? '#E2E8F0' : '#A7B3B8',
            color: index === 0 ? '#A7B3B8' : SECONDARY,
            opacity: index === 0 ? 0.5 : 1,
            fontSize: p(32),
            fontWeight: 700,
            fontFamily: APP_FONT_FAMILY,
          }}
        >
          Previous
        </ButtonBase>
        <ButtonBase
          onClick={onNext}
          sx={{
            height: p(101),
            borderRadius: 999,
            bgcolor: TEAL,
            color: '#FFFFFF',
            fontSize: p(32),
            fontWeight: 700,
            fontFamily: APP_FONT_FAMILY,
            '&:active': { transform: 'scale(0.995)' },
          }}
        >
          {index === total - 1 ? 'Start Practice' : 'Next Card'}
        </ButtonBase>
      </Box>
    </Box>
  )
}
