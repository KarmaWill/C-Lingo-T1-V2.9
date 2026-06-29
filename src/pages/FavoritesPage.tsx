import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StyleIcon from '@mui/icons-material/Style';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { resolveBackPath } from '../utils/navigateBack';
import { loadAllFavorites } from '../utils/favoritesHub';
import type { FunChineseSavedCard } from '../utils/funChineseCardCollection';
import type { LingoFlashWord } from '../data/lingoFlashDeck';

const CARD_TYPE_LABEL: Record<FunChineseSavedCard['cardType'], string> = {
  dialogue: 'Dialogue',
  grammar: 'Grammar',
  pattern: 'Pattern',
};

export default function FavoritesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const [flashWords, setFlashWords] = useState<LingoFlashWord[]>([]);
  const [lessonCards, setLessonCards] = useState<FunChineseSavedCard[]>([]);

  const refresh = useCallback(() => {
    const data = loadAllFavorites();
    setFlashWords(data.flashWords);
    setLessonCards(data.lessonCards);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, location.key]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const totalCount = flashWords.length + lessonCards.length;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#F8F9FA',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
          bgcolor: 'white',
          borderBottom: '1px solid #F1F3F5',
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.05)',
            color: '#374151',
            '&:active': { bgcolor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 26 }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827', lineHeight: 1.2 }}>
            Favorites
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.25 }}>
            Everything you saved across FlashCards and lessons
          </Typography>
        </Box>
        <Box
          sx={{
            minWidth: is960 ? 44 : 52,
            height: is960 ? 44 : 52,
            px: 1.5,
            borderRadius: '16px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.15rem', color: '#2563EB' }}>
            {totalCount}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3 }}>
        {totalCount === 0 ? (
          <Box
            sx={{
              height: '100%',
              minHeight: is960 ? 220 : 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 3,
            }}
          >
            <StarOutlineIcon sx={{ fontSize: is960 ? 48 : 56, color: '#D1D5DB', mb: 1.5 }} />
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1rem' : '1.15rem', color: '#374151', mb: 0.75 }}>
              No favorites yet
            </Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: is960 ? '0.82rem' : '0.92rem', lineHeight: 1.5, maxWidth: 420 }}>
              Star words in FlashCards or save lesson cards in Happy Chinese. They will show up here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5 }}>
            {flashWords.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<StyleIcon sx={{ fontSize: is960 ? 18 : 20, color: '#2563EB' }} />}
                  title="FlashCards"
                  count={flashWords.length}
                  is960={is960}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
                  {flashWords.map((word) => (
                    <ButtonBase
                      key={word.id}
                      onClick={() => navigate('/lingo-flash', { state: { from: '/favorites' } })}
                      sx={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: is1920x1125 ? '22px' : '18px',
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.06)',
                        p: is960 ? 1.5 : 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: is960 ? 1.25 : 1.5,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.995)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: is960 ? 44 : 52,
                          height: is960 ? 44 : 52,
                          borderRadius: '14px',
                          bgcolor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#2563EB' }}>
                          {word.word}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '0.98rem', color: '#111827' }}>
                          {word.translation}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#9CA3AF', mt: 0.25 }}>
                          {word.phonetic}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>
              </Box>
            )}

            {lessonCards.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<MenuBookIcon sx={{ fontSize: is960 ? 18 : 20, color: '#F59E0B' }} />}
                  title="Lesson Cards"
                  count={lessonCards.length}
                  is960={is960}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
                  {lessonCards.map((card) => (
                    <ButtonBase
                      key={card.id}
                      onClick={() =>
                        navigate(`/library/hub/fun-chinese/lesson/${card.lessonId}`, {
                          state: { from: '/favorites' },
                        })
                      }
                      sx={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: is1920x1125 ? '22px' : '18px',
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.06)',
                        p: is960 ? 1.5 : 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: is960 ? 1.25 : 1.5,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.995)' },
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          borderRadius: '999px',
                          bgcolor: '#FFFBEB',
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', color: '#B45309', letterSpacing: '0.04em' }}>
                          {CARD_TYPE_LABEL[card.cardType]}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '0.98rem', color: '#111827', lineHeight: 1.3 }}>
                          {card.cardTitle}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#6B7280', mt: 0.35 }}>
                          {card.lessonTitleEn} · {card.lessonTitle}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: is960 ? '0.72rem' : '0.8rem',
                            color: '#9CA3AF',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {card.preview}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  is960,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  is960: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1 : 1.25 }}>
      {icon}
      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.02rem', color: '#111827' }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.78rem' : '0.85rem', color: '#9CA3AF' }}>
        {count}
      </Typography>
    </Box>
  );
}
