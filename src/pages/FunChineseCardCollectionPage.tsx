import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { APP_FONT_FAMILY } from '../theme/appFont'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

type CardKind = 'grammar' | 'pattern' | 'dialogue'
type Speaker = 'A' | 'B'

type Glyph = {
  han: string
  pinyin: string
}

type DialogueLine = {
  speaker: Speaker
  chinese: string
  pinyin: string
}

type CollectionCard = {
  id: string
  kind: CardKind
  lessonId: number
  lessonTitle: string
  cardIndex: number
  chinese: string
  pinyin: string
  lines?: DialogueLine[]
}

const INK = '#2D3436'
const MUTED = '#A7B3B8'
const PAGE_BG = '#F8F9F8'
const PINYIN_FONT = '"FZPinYinHandwriting", "Google Sans Flex Variable", "Google Sans Flex", sans-serif'
const KAI_FONT = '"FZNewKai GB18030L2", "KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

const KIND_THEME: Record<
  CardKind,
  { bar: string; badgeBg: string; badgeColor: string; title: string }
> = {
  grammar: { bar: '#1A73E8', badgeBg: '#EDF2FF', badgeColor: '#2768FD', title: '语法卡片' },
  pattern: { bar: '#FBBC04', badgeBg: 'rgba(255, 217, 61, 0.2)', badgeColor: '#DAB000', title: '句型卡片' },
  dialogue: { bar: '#FF6B35', badgeBg: '#FFF3EE', badgeColor: '#FF6B35', title: '对话卡片' },
}

const GRAMMAR_CARDS: CollectionCard[] = [
  { id: 'g-1', kind: 'grammar', lessonId: 1, lessonTitle: '你好', cardIndex: 1, chinese: '吗', pinyin: 'ma' },
  { id: 'g-2', kind: 'grammar', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 1, chinese: '叫', pinyin: 'jiào' },
  { id: 'g-3', kind: 'grammar', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 1, chinese: '是', pinyin: 'shì' },
  { id: 'g-4', kind: 'grammar', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 1, chinese: '在', pinyin: 'zài' },
  { id: 'g-5', kind: 'grammar', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 1, chinese: '哪儿', pinyin: 'nǎ ér' },
]

const PATTERN_CARDS: CollectionCard[] = [
  { id: 'p-1', kind: 'pattern', lessonId: 1, lessonTitle: '你好', cardIndex: 2, chinese: '你好', pinyin: 'nǐ hǎo' },
  { id: 'p-2', kind: 'pattern', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 2, chinese: '你叫什么', pinyin: 'nǐ jiào shén me' },
  { id: 'p-3', kind: 'pattern', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 2, chinese: '你家在哪儿', pinyin: 'nǐ jiā zài nǎ ér' },
]

const DIALOGUE_CARDS: CollectionCard[] = [
  {
    id: 'd-1',
    kind: 'dialogue',
    lessonId: 1,
    lessonTitle: '你好',
    cardIndex: 0,
    chinese: '你好！',
    pinyin: 'nǐ hǎo',
    lines: [
      { speaker: 'A', chinese: '你好', pinyin: 'nǐ hǎo' },
      { speaker: 'B', chinese: '你好', pinyin: 'nǐ hǎo' },
    ],
  },
  {
    id: 'd-2',
    kind: 'dialogue',
    lessonId: 2,
    lessonTitle: '你叫什么',
    cardIndex: 0,
    chinese: '星期一我有体育课吗？',
    pinyin: 'xīng qī yī wǒ yǒu tǐ yù kè ma',
    lines: [
      { speaker: 'A', chinese: '星期一我有体育课，星期一你有体育课吗？', pinyin: 'xīng qī yī wǒ yǒu tǐ yù kè xīng qī yī nǐ yǒu tǐ yù kè ma' },
      { speaker: 'B', chinese: '星期一我没有体育课，星期一我有中文课。', pinyin: 'xīng qī yī wǒ méi yǒu tǐ yù kè xīng qī yī wǒ yǒu zhōng wén kè' },
    ],
  },
]

function pairGlyphs(chinese: string, pinyin: string): Glyph[] {
  const syllables = pinyin.trim().split(/\s+/).filter(Boolean)
  const glyphs: Glyph[] = []
  let syllableIndex = 0

  for (const ch of [...chinese]) {
    if (/[\u4e00-\u9fff]/.test(ch)) {
      glyphs.push({ han: ch, pinyin: syllables[syllableIndex] || '' })
      syllableIndex += 1
      continue
    }
    if (glyphs.length > 0) {
      glyphs[glyphs.length - 1] = {
        ...glyphs[glyphs.length - 1],
        han: `${glyphs[glyphs.length - 1].han}${ch}`,
      }
    }
  }

  return glyphs
}

function chunkGlyphs(glyphs: Glyph[], perRow: number): Glyph[][] {
  if (glyphs.length <= perRow) return [glyphs]
  const rows: Glyph[][] = []
  for (let i = 0; i < glyphs.length; i += perRow) {
    rows.push(glyphs.slice(i, i + perRow))
  }
  return rows
}

function GlyphColumn({
  glyph,
  hanSize,
  compact,
}: {
  glyph: Glyph
  hanSize: number
  compact?: boolean
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const wide = glyph.han.length > 1
  return (
    <Box
      sx={{
        width: wide ? p(96) : p(60),
        minWidth: wide ? p(96) : p(60),
        height: compact ? p(101) : p(133),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: compact ? 'flex-end' : 'flex-start',
      }}
    >
      <Typography
        sx={{
          width: '100%',
          fontFamily: PINYIN_FONT,
          fontSize: p(28),
          lineHeight: 1.6,
          color: INK,
          textAlign: 'center',
          my: `${p(-14)}px`,
        }}
      >
        {glyph.pinyin}
      </Typography>
      <Typography
        sx={{
          width: '100%',
          fontFamily: KAI_FONT,
          fontSize: p(hanSize),
          lineHeight: 1.6,
          color: INK,
          textAlign: 'center',
        }}
      >
        {glyph.han}
      </Typography>
    </Box>
  )
}

function LessonChip({
  kind,
  lessonId,
  title,
  compact,
}: {
  kind: CardKind
  lessonId: number
  title: string
  compact?: boolean
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const theme = KIND_THEME[kind]
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(14)}px`, minWidth: 0, maxWidth: '100%' }}>
      <Box
        sx={{
          minWidth: p(113),
          height: p(35),
          px: `${p(10)}px`,
          borderRadius: `${p(150)}px`,
          bgcolor: theme.badgeBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Noto Sans SC", "Source Han Sans CN", sans-serif',
            fontSize: p(24),
            lineHeight: `${p(35)}px`,
            color: theme.badgeColor,
            whiteSpace: 'nowrap',
          }}
        >
          {`Lesson${lessonId}`}
        </Typography>
      </Box>
      {!compact && (
        <Typography
          sx={{
            fontFamily: '"Noto Sans SC", "Source Han Sans CN", sans-serif',
            fontSize: p(24),
            lineHeight: `${p(35)}px`,
            color: MUTED,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  )
}

function SpeakerBadge({ speaker }: { speaker: Speaker }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        width: p(60),
        height: p(60),
        borderRadius: `${p(50)}px`,
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        boxShadow: '0 1px 4px rgba(45,52,54,0.06)',
      }}
    >
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontWeight: 500,
          fontSize: p(36),
          lineHeight: `${p(28)}px`,
          color: INK,
        }}
      >
        {speaker}
      </Typography>
    </Box>
  )
}

function SpeechBubble({ line }: { line: DialogueLine }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const isA = line.speaker === 'A'
  const rows = chunkGlyphs(pairGlyphs(line.chinese, line.pinyin), 8)
  const fill = isA ? '#FFF3EE' : '#F8F9F8'

  return (
    <Box
      sx={{
        position: 'relative',
        alignSelf: isA ? 'flex-start' : 'flex-end',
        width: 'fit-content',
        maxWidth: '100%',
        pr: isA ? `${p(8)}px` : 0,
        pl: isA ? 0 : `${p(8)}px`,
        pb: `${p(30)}px`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: p(23),
          height: p(23),
          bgcolor: fill,
          borderRadius: `${p(2)}px`,
          transform: 'rotate(45deg)',
          ...(isA
            ? { left: p(2), top: p(36) }
            : { right: p(2), top: p(12) }),
        }}
      />
      <Box
        sx={{
          position: 'relative',
          width: 'fit-content',
          maxWidth: p(551 + 40),
          minWidth: p(239),
          px: `${p(30)}px`,
          py: rows.length > 1 ? `${p(20)}px` : 0,
          minHeight: p(118),
          bgcolor: fill,
          borderRadius: `${p(20)}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: isA ? 'flex-end' : 'flex-start',
          gap: `${p(0)}px`,
        }}
      >
        {rows.map((row, rowIndex) => (
          <Box
            key={`${line.speaker}-${rowIndex}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isA && rowIndex > 0 ? 'flex-end' : 'flex-start',
              gap: `${p(5)}px`,
            }}
          >
            {row.map((glyph, glyphIndex) => (
              <GlyphColumn
                key={`${glyph.han}-${glyphIndex}`}
                glyph={glyph}
                hanSize={44}
                compact
              />
            ))}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          ...(isA ? { left: p(40) } : { right: p(40) }),
        }}
      >
        <SpeakerBadge speaker={line.speaker} />
      </Box>
    </Box>
  )
}

function OverviewCard({ card, onOpen }: { card: CollectionCard; onOpen: () => void }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const glyphs = pairGlyphs(card.chinese, card.pinyin)
  const patternWidth = Math.max(
    255,
    80 + glyphs.length * 60 + Math.max(0, glyphs.length - 1) * 5,
  )

  if (card.kind === 'dialogue') {
    const wide = (card.lines || []).some((line) => pairGlyphs(line.chinese, line.pinyin).length > 4)
    return (
      <ButtonBase
        onClick={onOpen}
        aria-label={`${card.lessonTitle} dialogue card`}
        sx={{
          width: p(wide ? 921 : 639),
          minHeight: p(wide ? 635 : 394),
          alignItems: 'stretch',
          borderRadius: `${p(36)}px`,
          bgcolor: '#FFFFFF',
          p: `${p(20)}px ${p(25)}px`,
          textAlign: 'left',
          '&:active': { transform: 'scale(0.99)' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: `${p(27)}px`,
          }}
        >
          <LessonChip kind="dialogue" lessonId={card.lessonId} title={card.lessonTitle} />
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: `${p(18)}px`,
            }}
          >
            {(card.lines || []).map((line, index) => (
              <SpeechBubble key={`${card.id}-${line.speaker}-${index}`} line={line} />
            ))}
          </Box>
        </Box>
      </ButtonBase>
    )
  }

  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`${card.lessonTitle} ${card.kind} card`}
      sx={{
        width: p(card.kind === 'pattern' ? patternWidth : 255),
        height: p(238),
        borderRadius: `${p(36)}px`,
        bgcolor: '#FFFFFF',
        px: `${p(40)}px`,
        py: `${p(20)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <LessonChip
        kind={card.kind}
        lessonId={card.lessonId}
        title={card.lessonTitle}
        compact={card.kind === 'grammar' || patternWidth <= 255}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(5)}px`,
        }}
      >
        {glyphs.map((glyph, index) => (
          <GlyphColumn key={`${card.id}-${glyph.han}-${index}`} glyph={glyph} hanSize={64} />
        ))}
      </Box>
    </ButtonBase>
  )
}

function Section({
  kind,
  cards,
  onOpen,
}: {
  kind: CardKind
  cards: CollectionCard[]
  onOpen: (card: CollectionCard) => void
}) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const theme = KIND_THEME[kind]
  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: `${p(20)}px`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px` }}>
        <Box sx={{ width: p(6), height: p(52), borderRadius: `${p(100)}px`, bgcolor: theme.bar }} />
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontSize: p(32),
            lineHeight: 1.6,
            color: '#202124',
          }}
        >
          {theme.title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: kind === 'dialogue' ? 'flex-start' : 'center',
          flexWrap: 'wrap',
          gap: `${p(30)}px`,
        }}
      >
        {cards.map((card) => (
          <OverviewCard key={card.id} card={card} onOpen={() => onOpen(card)} />
        ))}
      </Box>
    </Box>
  )
}

export default function FunChineseCardCollectionPage() {
  const navigate = useNavigate()
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)

  const openCard = (card: CollectionCard) => {
    navigate(`/library/hub/fun-chinese/lesson/${card.lessonId}?phase=cards&card=${card.cardIndex}`)
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: PAGE_BG,
        overflow: 'hidden',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: p(142),
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
        }}
      >
        <ButtonBase
          onClick={() => navigate('/library/hub/fun-chinese')}
          aria-label="Back"
          sx={{
            position: 'absolute',
            left: p(60),
            top: '50%',
            transform: 'translateY(-50%)',
            width: p(80),
            height: p(80),
            minWidth: p(80),
            borderRadius: '100px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            color: INK,
            '&:active': { transform: 'translateY(-50%) scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: p(40) }} />
        </ButtonBase>
        <Typography
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: 1.6,
            color: INK,
            whiteSpace: 'nowrap',
          }}
        >
          Card Collection
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(60)}px`,
          py: `${p(40)}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: `${p(34)}px`,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Section kind="grammar" cards={GRAMMAR_CARDS} onOpen={openCard} />
        <Section kind="pattern" cards={PATTERN_CARDS} onOpen={openCard} />
        <Section kind="dialogue" cards={DIALOGUE_CARDS} onOpen={openCard} />
      </Box>
    </Box>
  )
}
