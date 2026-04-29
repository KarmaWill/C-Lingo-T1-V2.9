import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  FUN_CHINESE_UNIT1_COLLECTION_CARDS,
  groupFunChineseSavedCards,
  loadFunChineseSavedCards,
  type FunChineseSavedCard,
} from '../utils/funChineseCardCollection';

export default function FunChineseCardCollectionPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [savedCards] = useState<FunChineseSavedCard[]>(() => loadFunChineseSavedCards());
  const [selectedCard, setSelectedCard] = useState<FunChineseSavedCard | null>(null);

  const sourceCards = savedCards.length > 0 ? savedCards : FUN_CHINESE_UNIT1_COLLECTION_CARDS;
  const sections = useMemo(() => groupFunChineseSavedCards(sourceCards), [sourceCards]);

  const grammarSection = sections.find(s => s.type === 'grammar');
  const patternSection = sections.find(s => s.type === 'pattern');
  const dialogueSection = sections.find(s => s.type === 'dialogue');

  const renderDetail = (card: FunChineseSavedCard) => {
    if (card.cardType === 'grammar') {
      return (
        <Box sx={{ py: 4, px: 3 }}>
          <Box sx={{ mb: 3, p: 3, borderRadius: '18px', bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 900, letterSpacing: '0.1em', mb: 0.4 }}>POINT</Typography>
            <Typography sx={{ fontSize: '4rem', color: '#1D4ED8', fontWeight: 400, my: 1 }}>吗</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>ma</Typography>
            <Typography sx={{ mt: 1.5, fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>Turns a statement into a yes/no question.</Typography>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 900, letterSpacing: '0.08em', mb: 0.5 }}>FORMULA</Typography>
            <Typography sx={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 850, fontFamily: 'monospace' }}>[Statement] + 吗</Typography>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 900, letterSpacing: '0.08em', mb: 0.5 }}>EXAMPLE</Typography>
            <Typography sx={{ fontSize: '1rem', color: '#111827', fontWeight: 900 }}>你好吗？</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 700 }}>Nǐ hǎo ma?</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>How are you?</Typography>
          </Box>
        </Box>
      );
    }

    if (card.cardType === 'pattern') {
      return (
        <Box sx={{ py: 4, px: 3 }}>
          <Box sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#0F172A', mb: 2 }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, letterSpacing: '0.08em', mb: 0.5 }}>PATTERN</Typography>
            <Typography sx={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 850, fontFamily: 'monospace' }}>主语 + 很 + 形容词</Typography>
          </Box>
          {[
            ['我很好', 'Wǒ hěn hǎo', 'I am very well'],
            ['你很好', 'Nǐ hěn hǎo', 'You are very well'],
          ].map((row) => (
            <Box key={row[0]} sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.98rem', color: '#111827', fontWeight: 900 }}>{row[0]}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F766E', fontWeight: 700 }}>{row[1]}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 650 }}>{row[2]}</Typography>
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box sx={{ py: 4, px: 3 }}>
        {[
          ['Speaker A', '你好！', 'Nǐ hǎo!', 'Hello!'],
          ['Speaker B', '你好吗？', 'Nǐ hǎo ma?', 'How are you?'],
          ['Speaker A', '我很好。谢谢！', 'Wǒ hěn hǎo. Xièxie!', 'I am fine. Thank you!'],
        ].map((row, index) => (
          <Box
            key={`${row[0]}-${index}`}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              bgcolor: row[0] === 'Speaker A' ? '#FFF7ED' : '#F0FDFA',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', color: row[0] === 'Speaker A' ? '#EA580C' : '#0F766E', fontWeight: 900, mb: 0.35 }}>{row[0]}</Typography>
            <Typography sx={{ fontSize: '1rem', color: '#111827', fontWeight: 900 }}>{row[1]}</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: row[0] === 'Speaker A' ? '#EA580C' : '#0F766E', fontWeight: 700 }}>{row[2]}</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 650 }}>{row[3]}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA' }}>
      {/* Header */}
      <Box
        sx={{
          px: is960 ? 2.2 : 3,
          py: is960 ? 1.7 : 2.1,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/library/hub/fun-chinese')}
          sx={{
            width: is960 ? 44 : 48,
            height: is960 ? 44 : 48,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.04)',
            color: '#64748B',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
        </ButtonBase>
        <Box>
          <Typography sx={{ fontSize: is960 ? '1.2rem' : '1.4rem', color: '#0F172A', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Card Collection
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.78rem', color: '#94A3B8', fontWeight: 700, mt: 0.2 }}>
            Browse by type
          </Typography>
        </Box>
      </Box>

      {/* Main Content - 3 Sections */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 3 : 4.8, py: is960 ? 2.5 : 4 }}>
        <Box sx={{ maxW: 1780, mx: 'auto', display: 'flex', flexDirection: 'column', gap: is960 ? 5 : 8 }}>
          
          {/* Section A: Grammar */}
          {grammarSection && (
            <Box component="section">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 2 : 3.2 }}>
                <Box sx={{ height: is960 ? 32 : 40, width: is960 ? 5 : 6, bgcolor: '#1A56DB', borderRadius: 999 }} />
                <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                  语法卡片
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.05rem', fontWeight: 300, color: '#D1D5DB', ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Grammar
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: is960 ? 2 : 3.2,
                  overflowX: 'auto',
                  pb: is960 ? 2 : 3.2,
                  pt: is960 ? 1 : 1.6,
                  px: 0.8,
                  mx: -0.8,
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {grammarSection.cards.map((card) => (
                  <ButtonBase
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    sx={{
                      width: is960 ? 260 : 320,
                      minWidth: is960 ? 260 : 320,
                      aspectRatio: '1',
                      bgcolor: '#FFFFFF',
                      borderRadius: is960 ? '28px' : '32px',
                      p: is960 ? 2.5 : 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-5px)',
                        boxShadow: '0 20px 50px rgba(26,86,219,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: is960 ? 20 : 24, left: is960 ? 20 : 24, right: is960 ? 20 : 24, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ bgcolor: '#EFF6FF', color: '#1A56DB', fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 900, px: 1.2, py: 0.5, borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Lesson {card.lessonId}
                      </Box>
                      <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 700, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.lessonTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.875rem', color: '#D1D5DB', fontWeight: 300, fontStyle: 'italic', mb: 0.8, letterSpacing: '0.04em' }}>
                        {card.cardSubtitle.split(' · ')[1] || 'ma'}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '4.5rem' : '5.25rem', color: '#111827', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.03em' }}>
                        {card.preview.includes('吗') ? '吗' : card.cardTitle}
                      </Typography>
                    </Box>
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          )}

          {/* Section B: Patterns */}
          {patternSection && (
            <Box component="section">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 2 : 3.2 }}>
                <Box sx={{ height: is960 ? 32 : 40, width: is960 ? 5 : 6, bgcolor: '#0FB8A0', borderRadius: 999 }} />
                <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                  句型卡片
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.05rem', fontWeight: 300, color: '#D1D5DB', ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Patterns
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: is960 ? 2 : 3.2,
                  overflowX: 'auto',
                  pb: is960 ? 2 : 3.2,
                  pt: is960 ? 1 : 1.6,
                  px: 0.8,
                  mx: -0.8,
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {patternSection.cards.map((card) => (
                  <ButtonBase
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    sx={{
                      width: is960 ? 350 : 420,
                      minWidth: is960 ? 350 : 420,
                      aspectRatio: '4/3',
                      bgcolor: '#FFFFFF',
                      borderRadius: is960 ? '28px' : '32px',
                      p: is960 ? 2.5 : 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      transition: 'all 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-5px)',
                        boxShadow: '0 20px 50px rgba(15,184,160,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: is960 ? 2 : 3.2 }}>
                      <Box sx={{ bgcolor: '#ECFDF5', color: '#0FB8A0', fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 900, px: 1.2, py: 0.5, borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Lesson {card.lessonId}
                      </Box>
                      <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 700, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.lessonTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: is960 ? 1.5 : 2.4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.875rem', color: '#9CA3AF', fontStyle: 'italic', mb: is960 ? 1.2 : 1.5, letterSpacing: '0.03em' }}>
                        {card.preview.split('\n')[0].split(' ')[0]}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.5rem', color: '#111827', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                        {card.cardTitle}
                      </Typography>
                    </Box>
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          )}

          {/* Section C: Dialogue */}
          {dialogueSection && (
            <Box component="section">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 2 : 3.2 }}>
                <Box sx={{ height: is960 ? 32 : 40, width: is960 ? 5 : 6, bgcolor: '#F97316', borderRadius: 999 }} />
                <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.875rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                  对话卡片
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.85rem' : '1.05rem', fontWeight: 300, color: '#D1D5DB', ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Dialogues
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: is960 ? 2 : 3.2,
                  overflowX: 'auto',
                  pb: is960 ? 2 : 3.2,
                  pt: is960 ? 1 : 1.6,
                  px: 0.8,
                  mx: -0.8,
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {dialogueSection.cards.map((card) => (
                  <ButtonBase
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    sx={{
                      width: is960 ? 350 : 420,
                      minWidth: is960 ? 350 : 420,
                      aspectRatio: '4/3',
                      bgcolor: '#FFFFFF',
                      borderRadius: is960 ? '28px' : '32px',
                      p: is960 ? 2.5 : 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      transition: 'all 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-5px)',
                        boxShadow: '0 20px 50px rgba(249,115,22,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: is960 ? 2 : 3.2 }}>
                      <Box sx={{ bgcolor: '#FFF7ED', color: '#F97316', fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 900, px: 1.2, py: 0.5, borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Lesson {card.lessonId}
                      </Box>
                      <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.69rem', fontWeight: 700, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.lessonTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, flex: 1 }}>
                      {card.preview.split('\n').slice(0, 2).map((line, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: is960 ? 1.6 : 2,
                            borderRadius: is960 ? '16px' : '20px',
                            bgcolor: idx === 0 ? '#F8F9FA' : '#FFF7ED',
                            borderRight: idx === 1 ? '4px solid #F97316' : 'none',
                          }}
                        >
                          <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.625rem', color: '#9CA3AF', fontWeight: 900, mb: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            Speaker {idx === 0 ? 'A' : 'B'}
                          </Typography>
                          <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.875rem', color: '#111827', fontWeight: 700, letterSpacing: '0.02em' }}>
                            {line.split('？')[0]}？
                          </Typography>
                          <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.69rem', color: '#9CA3AF', fontStyle: 'italic', mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            pinyin
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          )}

        </Box>
      </Box>

      {/* Full-screen Card Detail Overlay */}
      {selectedCard && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', bgcolor: '#F4F3EF' }}>
          <Box sx={{ px: is960 ? 2.2 : 3, py: is960 ? 1.7 : 2.1, borderBottom: '1px solid #E5E7EB', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ButtonBase
              onClick={() => setSelectedCard(null)}
              sx={{ width: is960 ? 44 : 48, height: is960 ? 44 : 48, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.04)', color: '#64748B', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, '&:active': { transform: 'scale(0.96)' } }}
            >
              <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
            </ButtonBase>
            <Box>
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {selectedCard.cardType} Card
              </Typography>
              <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.3rem', color: '#111827', fontWeight: 900, letterSpacing: '-0.01em' }}>
                {selectedCard.cardTitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', justifyContent: 'center', py: is960 ? 2.5 : 4 }}>
            <Box sx={{ width: '100%', maxWidth: is960 ? 700 : 800, mx: is960 ? 2 : 3, borderRadius: is960 ? '28px' : '40px', bgcolor: '#FFFFFF', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              {renderDetail(selectedCard)}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
