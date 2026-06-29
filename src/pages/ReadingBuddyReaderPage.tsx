import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useLocale } from '../context/LocaleContext';
import type { AppLocaleId } from '../data/localeConfig';
import {
  getReadingBuddyDocument,
  touchReadingBuddyDocument,
  type ReadingBuddyParagraph,
  type ReadingBuddyWord,
} from '../data/readingBuddyStorage';
import { lookupWordWithAi, readParagraphAloud } from '../utils/readingBuddyProcessor';

export default function ReadingBuddyReaderPage() {
  const { docId = '' } = useParams();
  const navigate = useNavigate();
  const { locale, locales } = useLocale();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const doc = useMemo(() => getReadingBuddyDocument(docId), [docId]);
  const [showPinyin, setShowPinyin] = useState(true);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<ReadingBuddyWord | null>(null);
  const [lookupLocale, setLookupLocale] = useState<AppLocaleId>(locale.id);

  useEffect(() => {
    if (doc) {
      touchReadingBuddyDocument(doc.id);
      setActiveParagraphId(doc.paragraphs[0]?.id ?? null);
    }
  }, [doc]);

  useEffect(() => {
    setLookupLocale(locale.id);
  }, [locale.id]);

  if (!doc) {
    return (
      <Box sx={{ p: 3, height: '100%', bgcolor: '#F4F7FB' }}>
        <IconButton onClick={() => navigate('/reading-buddy')} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800 }}>Document not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/reading-buddy')}>
          Back to Reading Buddy
        </Button>
      </Box>
    );
  }

  const activeParagraph: ReadingBuddyParagraph | undefined = doc.paragraphs.find(
    (p) => p.id === activeParagraphId,
  );
  const touchMin = is960 ? 44 : 48;

  const displayWord = selectedWord
    ? lookupWordWithAi(selectedWord, lookupLocale)
    : null;

  const handleWordTap = (word: ReadingBuddyWord, paragraphId: string) => {
    setActiveParagraphId(paragraphId);
    setSelectedWord(word);
  };

  const handleAiRead = () => {
    if (!activeParagraph) return;
    readParagraphAloud(activeParagraph.raw);
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F4F7FB',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: is960 ? 1.5 : 2.5,
          py: is960 ? 1 : 1.35,
          flexShrink: 0,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: 'white',
        }}
      >
        <IconButton
          onClick={() => navigate('/reading-buddy')}
          aria-label="Back"
          sx={{ width: touchMin, height: touchMin }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.2rem', color: '#0F172A' }}>
            {doc.title}
          </Typography>
          <Typography noWrap sx={{ color: '#64748B', fontSize: is960 ? '0.72rem' : '0.82rem' }}>
            Tap any word · AI read-along · multilingual lookup
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={showPinyin ? 'on' : 'off'}
          onChange={(_, value) => {
            if (value) setShowPinyin(value === 'on');
          }}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="on" sx={{ px: 1.5, minHeight: 40, textTransform: 'none', fontWeight: 700 }}>
            Pinyin
          </ToggleButton>
          <ToggleButton value="off" sx={{ px: 1.5, minHeight: 40, textTransform: 'none', fontWeight: 700 }}>
            Hanzi
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: is960 ? '1fr' : '1.15fr 0.85fr',
          gridTemplateRows: is960 ? '1fr auto' : '1fr',
          gap: is960 ? 1 : 0,
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            overflow: 'auto',
            p: is960 ? 1.5 : 2.5,
          }}
        >
          {doc.paragraphs.map((paragraph, pIndex) => {
            const isActive = paragraph.id === activeParagraphId;
            return (
              <Box
                key={paragraph.id}
                onClick={() => setActiveParagraphId(paragraph.id)}
                sx={{
                  mb: is960 ? 1.25 : 1.75,
                  p: is960 ? 1.5 : 2,
                  borderRadius: '22px',
                  bgcolor: 'white',
                  border: isActive ? '2px solid #2563EB' : '2px solid transparent',
                  boxShadow: isActive
                    ? '0 10px 30px rgba(37,99,235,0.12)'
                    : '0 4px 16px rgba(15,23,42,0.05)',
                  cursor: 'pointer',
                }}
              >
                <Typography
                  sx={{
                    color: '#94A3B8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    mb: 1,
                  }}
                >
                  PARAGRAPH {pIndex + 1}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.75 : 1, alignItems: 'flex-end' }}>
                  {paragraph.words.map((word, wIndex) => {
                    const isSelected = selectedWord?.text === word.text && isActive;
                    const hasHanzi = /[\u4e00-\u9fff]/.test(word.text);
                    return (
                      <Box
                        key={`${paragraph.id}-${wIndex}-${word.text}`}
                        component="button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWordTap(word, paragraph.id);
                        }}
                        sx={{
                          border: 'none',
                          bgcolor: isSelected ? '#DBEAFE' : 'transparent',
                          borderRadius: '12px',
                          p: is960 ? '6px 8px' : '8px 10px',
                          minWidth: hasHanzi ? touchMin - 8 : undefined,
                          minHeight: touchMin - 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          transition: '0.15s',
                          '&:hover': { bgcolor: '#EFF6FF' },
                          '&:active': { transform: 'scale(0.97)' },
                        }}
                      >
                        {showPinyin && word.pinyin && hasHanzi && (
                          <Typography
                            sx={{
                              fontSize: is960 ? '0.68rem' : '0.78rem',
                              color: '#2563EB',
                              fontWeight: 600,
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            {word.pinyin}
                          </Typography>
                        )}
                        <Typography
                          sx={{
                            fontSize: hasHanzi ? (is960 ? '1.35rem' : '1.65rem') : (is960 ? '0.95rem' : '1.05rem'),
                            fontWeight: hasHanzi ? 700 : 500,
                            color: '#0F172A',
                            fontFamily: hasHanzi ? 'KaiTi, STKaiti, SimKai, serif' : 'inherit',
                            lineHeight: 1.2,
                          }}
                        >
                          {word.text}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white',
            borderLeft: is960 ? 'none' : '1px solid #E2E8F0',
            borderTop: is960 ? '1px solid #E2E8F0' : 'none',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: is960 ? 1.5 : 2, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <TranslateRoundedIcon sx={{ color: '#2563EB' }} />
              <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.05rem' }}>
                Word lookup
              </Typography>
            </Box>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={lookupLocale}
              onChange={(_, value) => {
                if (value) setLookupLocale(value as AppLocaleId);
              }}
              sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
            >
              {locales.map((item) => (
                <ToggleButton
                  key={item.id}
                  value={item.id}
                  sx={{ minHeight: 40, px: 1.25, textTransform: 'none', fontWeight: 700 }}
                >
                  {item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {displayWord ? (
              <Box
                sx={{
                  borderRadius: '18px',
                  bgcolor: '#F8FAFC',
                  p: is960 ? 1.5 : 2,
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography
                  sx={{
                    fontSize: is960 ? '2rem' : '2.4rem',
                    fontWeight: 800,
                    fontFamily: 'KaiTi, STKaiti, SimKai, serif',
                    color: '#0F172A',
                    lineHeight: 1.1,
                  }}
                >
                  {displayWord.text}
                </Typography>
                {displayWord.pinyin && (
                  <Typography sx={{ color: '#2563EB', fontWeight: 700, mt: 0.5, mb: 1 }}>
                    {displayWord.pinyin}
                  </Typography>
                )}
                {displayWord.partOfSpeech && (
                  <Chip
                    size="small"
                    label={displayWord.partOfSpeech}
                    sx={{ mb: 1, fontWeight: 700, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                  />
                )}
                <Typography sx={{ color: '#334155', fontSize: is960 ? '0.92rem' : '1rem', lineHeight: 1.5 }}>
                  {displayWord.meanings[lookupLocale] ?? displayWord.meanings.en}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.88rem' : '0.95rem' }}>
                Tap a word in the text to see pinyin and meaning in your chosen language.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ p: is960 ? 1.5 : 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <AutoAwesomeRoundedIcon sx={{ color: '#7C3AED' }} />
              <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.05rem' }}>
                AI read-along
              </Typography>
            </Box>

            {activeParagraph ? (
              <>
                <Typography
                  sx={{
                    color: '#64748B',
                    fontSize: is960 ? '0.82rem' : '0.9rem',
                    mb: 1.5,
                    lineHeight: 1.55,
                  }}
                >
                  {activeParagraph.aiSummary?.[lookupLocale] ??
                    activeParagraph.aiSummary?.en ??
                    'Select a paragraph and use AI to read and explain.'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VolumeUpRoundedIcon />}
                  onClick={handleAiRead}
                  sx={{
                    minHeight: touchMin,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 800,
                    bgcolor: '#2563EB',
                    boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                  fullWidth
                >
                  Read this paragraph aloud
                </Button>
              </>
            ) : (
              <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.88rem' : '0.95rem' }}>
                Tap a paragraph to activate AI read-along for that section.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
