import { useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface CollectionPreviewCard {
  id: string;
  lessonId: number;
  lessonTitle: string;
  cardIndex: number;
  pinyin?: string;
  chinese: string;
  english?: string;
  lines?: { speaker: 'A' | 'B'; chinese: string; pinyin: string }[];
}

const grammarCards: CollectionPreviewCard[] = [
  { id: 'g-1', lessonId: 1, lessonTitle: '你好', cardIndex: 1, pinyin: 'ma', chinese: '吗' },
  { id: 'g-2', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 1, pinyin: 'jiào', chinese: '叫' },
  { id: 'g-3', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 1, pinyin: 'shì', chinese: '是' },
  { id: 'g-4', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 1, pinyin: 'zài', chinese: '在' },
  { id: 'g-5', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 1, pinyin: 'nǎr', chinese: '哪儿' },
];

const patternCards: CollectionPreviewCard[] = [
  { id: 'p-1', lessonId: 1, lessonTitle: '你好', cardIndex: 2, pinyin: 'Nǐ hǎo!', chinese: '你好！' },
  { id: 'p-2', lessonId: 2, lessonTitle: '你叫什么', cardIndex: 2, pinyin: 'Nǐ jiào shénme?', chinese: '你叫什么？' },
  { id: 'p-3', lessonId: 3, lessonTitle: '你家在哪儿', cardIndex: 2, pinyin: 'Nǐ jiā zài nǎr?', chinese: '你家在哪儿？' },
  { id: 'p-4', lessonId: 4, lessonTitle: '爸爸、妈妈', cardIndex: 2, pinyin: 'Zhè shì wǒ māma.', chinese: '这是我妈妈。' },
];

const dialogueCards: CollectionPreviewCard[] = [
  {
    id: 'd-1',
    lessonId: 1,
    lessonTitle: '你好',
    cardIndex: 0,
    chinese: '你好！',
    lines: [
      { speaker: 'A', chinese: '你好！', pinyin: 'Nǐ hǎo!' },
      { speaker: 'B', chinese: '你好！', pinyin: 'Nǐ hǎo!' },
    ],
  },
  {
    id: 'd-2',
    lessonId: 2,
    lessonTitle: '你叫什么',
    cardIndex: 0,
    chinese: '你叫什么？',
    lines: [
      { speaker: 'A', chinese: '你好！你叫什么？', pinyin: 'Nǐ hǎo! Nǐ jiào shénme?' },
      { speaker: 'B', chinese: '我叫王小龙。', pinyin: 'Wǒ jiào Wáng Xiǎolóng.' },
    ],
  },
  {
    id: 'd-3',
    lessonId: 3,
    lessonTitle: '你家在哪儿',
    cardIndex: 0,
    chinese: '你家在哪儿？',
    lines: [
      { speaker: 'A', chinese: '你家在哪儿？', pinyin: 'Nǐ jiā zài nǎr?' },
      { speaker: 'B', chinese: '我家在北京。', pinyin: 'Wǒ jiā zài Běijīng.' },
    ],
  },
  {
    id: 'd-4',
    lessonId: 4,
    lessonTitle: '爸爸、妈妈',
    cardIndex: 0,
    chinese: '这是我妈妈。',
    lines: [
      { speaker: 'A', chinese: '这是你妈妈吗？', pinyin: 'Zhè shì nǐ māma ma?' },
      { speaker: 'B', chinese: '这是我妈妈。', pinyin: 'Zhè shì wǒ māma.' },
    ],
  },
];

export default function FunChineseCardCollectionPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const openCard = (card: CollectionPreviewCard) => {
    navigate(`/library/hub/fun-chinese/lesson/${card.lessonId}?phase=cards&card=${card.cardIndex}`);
  };

  const sectionTitle = (title: string, en: string, color: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, mb: is960 ? 1 : 1.45 }}>
      <Box sx={{ width: is960 ? 4 : 5, height: is960 ? 20 : 25, borderRadius: '999px', bgcolor: color }} />
      <Typography sx={{ fontSize: is960 ? '1rem' : '1.2rem', color: '#111827', fontWeight: 900, letterSpacing: '-0.03em' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: is960 ? '0.6rem' : '0.7rem', color: '#D1D5DB', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        {en}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#F6F7F9', overflow: 'hidden' }}>
      <Box
        sx={{
          height: is960 ? 70 : 86,
          px: is960 ? 2.6 : 4,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: 'rgba(255,255,255,0.78)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/library/hub/fun-chinese')}
          aria-label="Back"
          sx={{
            width: is960 ? 38 : 46,
            height: is960 ? 38 : 46,
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            color: '#111827',
            bgcolor: '#FFFFFF',
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 23 : 27 }} />
        </ButtonBase>
        <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.28rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
          Card Collection
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: is960 ? 3.2 : 4.5, py: is960 ? 1.3 : 1.9, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.8 }}>
          <Box component="section">
            {sectionTitle('语法卡片', 'Grammar', '#2F80ED')}
            <Box sx={{ display: 'flex', gap: is960 ? 1.4 : 2, overflowX: 'auto', pb: is960 ? 0.6 : 0.8, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {grammarCards.map((card) => (
                <ButtonBase
                  key={card.id}
                  onClick={() => openCard(card)}
                  sx={{
                    width: is960 ? 164 : 210,
                    minWidth: is960 ? 164 : 210,
                    height: is960 ? 120 : 152,
                    borderRadius: is960 ? '14px' : '18px',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 28px rgba(15,23,42,0.04)',
                    p: is960 ? 1.5 : 2,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ position: 'absolute', top: is960 ? 13 : 16, left: is960 ? 14 : 18, right: is960 ? 14 : 18, display: 'flex', alignItems: 'center', gap: 0.55 }}>
                    <Box sx={{ px: 0.78, py: 0.28, borderRadius: '999px', bgcolor: '#EFF6FF', color: '#2F80ED', fontSize: is960 ? '0.5rem' : '0.6rem', fontWeight: 900 }}>
                      Lesson {card.lessonId}
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '0.52rem' : '0.62rem', color: '#9CA3AF', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.lessonTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.72rem', color: '#9CA3AF', fontWeight: 600, fontStyle: 'italic', mb: 0.42 }}>
                      {card.pinyin}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '2.55rem' : '3.25rem', color: '#111827', fontWeight: 400, lineHeight: 1, fontFamily: '"KaiTi","STKaiti","BiauKai","DFKai-SB","TW-Kai","SimKai",serif' }}>
                      {card.chinese}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
            <Box sx={{ width: is960 ? 330 : 440, height: is960 ? 10 : 13, borderRadius: '999px', bgcolor: '#E5E7EB', mt: 0.15 }} />
          </Box>

          <Box component="section">
            {sectionTitle('句型卡片', 'Patterns', '#14B8A6')}
            <Box sx={{ display: 'flex', gap: is960 ? 1.4 : 2, overflowX: 'auto', pb: is960 ? 0.6 : 0.8, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {patternCards.map((card) => (
                <ButtonBase
                  key={card.id}
                  onClick={() => openCard(card)}
                  sx={{
                    width: is960 ? 214 : 282,
                    minWidth: is960 ? 214 : 282,
                    height: is960 ? 108 : 138,
                    borderRadius: is960 ? '14px' : '18px',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 28px rgba(15,23,42,0.04)',
                    p: is960 ? 1.6 : 2.2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    textAlign: 'left',
                    position: 'relative',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ position: 'absolute', top: is960 ? 14 : 18, left: is960 ? 16 : 21, right: is960 ? 16 : 21, display: 'flex', alignItems: 'center', gap: 0.55 }}>
                    <Box sx={{ px: 0.78, py: 0.28, borderRadius: '999px', bgcolor: '#ECFDF5', color: '#14B8A6', fontSize: is960 ? '0.5rem' : '0.6rem', fontWeight: 900 }}>
                      Lesson {card.lessonId}
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '0.52rem' : '0.62rem', color: '#9CA3AF', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.lessonTitle}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.72rem', color: '#9CA3AF', fontWeight: 600, fontStyle: 'italic', mb: 0.58 }}>
                    {card.pinyin}
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.9rem' : '1.1rem', color: '#111827', fontWeight: 900, lineHeight: 1.25 }}>
                    {card.chinese}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
            <Box sx={{ width: is960 ? 560 : 740, height: is960 ? 10 : 13, borderRadius: '999px', bgcolor: '#E5E7EB', mt: 0.15 }} />
          </Box>

          <Box component="section">
            {sectionTitle('对话卡片', 'Dialogues', '#F97316')}
            <Box sx={{ display: 'flex', gap: is960 ? 1.4 : 2, overflowX: 'auto', pb: is960 ? 0.6 : 0.8, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {dialogueCards.map((card) => (
                <ButtonBase
                  key={card.id}
                  onClick={() => openCard(card)}
                  sx={{
                    width: is960 ? 214 : 282,
                    minWidth: is960 ? 214 : 282,
                    height: is960 ? 108 : 138,
                    borderRadius: is960 ? '14px' : '18px',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 28px rgba(15,23,42,0.04)',
                    p: is960 ? 1.5 : 2,
                    pt: is960 ? 3 : 3.6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: is960 ? 0.75 : 1,
                    textAlign: 'left',
                    position: 'relative',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ position: 'absolute', top: is960 ? 10 : 12, left: is960 ? 12 : 16, right: is960 ? 12 : 16, display: 'flex', alignItems: 'center', gap: 0.55 }}>
                    <Box sx={{ px: 0.78, py: 0.28, borderRadius: '999px', bgcolor: '#FFF7ED', color: '#F97316', fontSize: is960 ? '0.5rem' : '0.6rem', fontWeight: 900, flexShrink: 0 }}>
                      Lesson {card.lessonId}
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '0.52rem' : '0.62rem', color: '#9CA3AF', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {card.lessonTitle}
                    </Typography>
                  </Box>
                  {(card.lines || []).map((line, index) => (
                    <Box
                      key={`${card.id}-${line.speaker}`}
                      sx={{
                        bgcolor: index === 0 ? '#F8FAFC' : '#FFF7ED',
                        borderRadius: is960 ? '8px' : '11px',
                        px: is960 ? 1.2 : 1.5,
                        py: is960 ? 0.6 : 0.8,
                        borderRight: line.speaker === 'B' ? `3px solid #F97316` : 'none',
                        borderLeft: line.speaker === 'A' ? `3px solid #E2E8F0` : 'none',
                        alignSelf: line.speaker === 'B' ? 'flex-end' : 'flex-start',
                        width: '82%',
                      }}
                    >
                      <Typography sx={{ fontSize: is960 ? '0.42rem' : '0.5rem', color: '#9CA3AF', fontWeight: 900, letterSpacing: '0.12em' }}>
                        SPEAKER {line.speaker}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.78rem', color: '#111827', fontWeight: 900, mt: 0.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {line.chinese}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.48rem' : '0.56rem', color: '#9CA3AF', fontWeight: 600, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {line.pinyin}
                      </Typography>
                    </Box>
                  ))}
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
