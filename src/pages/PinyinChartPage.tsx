import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  ButtonBase,
  Dialog,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { resolveBackPath } from '../utils/navigateBack';
import { applyTone, combineInitialFinal } from '../utils/pinyinCombine';
import { lookupPinyinSyllable, resolvePinyinMeaning } from '../utils/pinyinSyllableLookup';
import { useLocale } from '../context/LocaleContext';
import PinyinRubyText from '../components/PinyinRubyText';
import PinyinTianziGrid from '../components/PinyinTianziGrid';

const TONE_OPTIONS = [
  { tone: 1 as const, label: '1st Tone' },
  { tone: 2 as const, label: '2nd Tone' },
  { tone: 3 as const, label: '3rd Tone' },
  { tone: 4 as const, label: '4th Tone' },
];

function speakPinyin(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export default function PinyinChartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLocale();

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const initials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
  const finals = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'ia', 'iao', 'ua', 'uo', 'an', 'en', 'in', 'un', 'ün', 'ian', 'uan', 'üan', 'ang', 'eng', 'ing', 'ong'];

  const [selectedInitial, setSelectedInitial] = useState<string>('b');
  const [selectedFinal, setSelectedFinal] = useState<string>('a');
  const [selectedTone, setSelectedTone] = useState<1 | 2 | 3 | 4>(1);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [phrasesOpen, setPhrasesOpen] = useState(false);

  const baseSyllable = useMemo(
    () => combineInitialFinal(selectedInitial, selectedFinal),
    [selectedInitial, selectedFinal],
  );

  const tonedSyllables = useMemo(
    () => TONE_OPTIONS.map(({ tone }) => applyTone(baseSyllable, tone)),
    [baseSyllable],
  );

  const activeTonedSyllable = useMemo(
    () => applyTone(baseSyllable, selectedTone),
    [baseSyllable, selectedTone],
  );

  const lookupEntry = useMemo(
    () => lookupPinyinSyllable(activeTonedSyllable),
    [activeTonedSyllable],
  );

  const openLookup = (tone: 1 | 2 | 3 | 4) => {
    setSelectedTone(tone);
    setPhrasesOpen(false);
    setLookupOpen(true);
  };

  const dialogMaxHeight = is960 ? 488 : 548;

  const formulaChipSx = (bg: string, color: string, minW = 44) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: is960 ? minW : minW + 6,
    minHeight: is960 ? 34 : 38,
    px: is960 ? 0.85 : 1,
    borderRadius: is960 ? '10px' : '12px',
    bgcolor: bg,
    color,
    fontWeight: 900,
    fontSize: is960 ? '1.05rem' : '1.18rem',
    lineHeight: 1,
    boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
  });

  const handleSpeak = () => {
    speakPinyin(activeTonedSyllable);
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        p: is960 ? 2 : (is1920x1125 ? 4 : 3),
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
          flexShrink: 0,
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            position: 'absolute',
            left: 0,
            width: is960 ? 40 : (is1920x1125 ? 56 : 48),
            height: is960 ? 40 : (is1920x1125 ? 56 : 48),
            borderRadius: '50%',
            bgcolor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24), color: '#1F2937' }} />
        </ButtonBase>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.5rem'),
            color: '#1F2937',
          }}
        >
          Pinyin Chart
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: '#F7F7F7',
              borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'),
              p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
                fontWeight: 900,
                color: '#E88B52',
                mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
              }}
            >
              Initial Consonants
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1),
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {initials.map((initial) => {
                const isSelected = selectedInitial === initial;
                return (
                  <ButtonBase
                    key={initial}
                    onClick={() => setSelectedInitial(initial)}
                    sx={{
                      py: is960 ? 1.15 : (is1920x1125 ? 1.65 : 1.4),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: isSelected ? '#E88B52' : 'white',
                      color: isSelected ? 'white' : '#E88B52',
                      border: '1px solid',
                      borderColor: '#E88B52',
                      fontWeight: 800,
                      fontSize: is960 ? '1.08rem' : (is1920x1125 ? '1.35rem' : '1.22rem'),
                      transition: 'all 0.2s',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    {initial}
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: '#F7F7F7',
              borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'),
              p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
                fontWeight: 900,
                color: '#008B8B',
                mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
              }}
            >
              Finals
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1),
                flex: 1,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: is960 ? 4 : (is1920x1125 ? 8 : 6) },
                '&::-webkit-scrollbar-track': { bgcolor: '#E5E5E5', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#C0C0C0',
                  borderRadius: '4px',
                  '&:hover': { bgcolor: '#A0A0A0' },
                },
              }}
            >
              {finals.map((final) => {
                const isSelected = selectedFinal === final;
                return (
                  <ButtonBase
                    key={final}
                    onClick={() => setSelectedFinal(final)}
                    sx={{
                      py: is960 ? 1.15 : (is1920x1125 ? 1.65 : 1.4),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: isSelected ? '#008B8B' : 'white',
                      color: isSelected ? 'white' : '#008B8B',
                      border: '1px solid',
                      borderColor: '#008B8B',
                      fontWeight: 800,
                      fontSize: is960 ? '1.08rem' : (is1920x1125 ? '1.35rem' : '1.22rem'),
                      transition: 'all 0.2s',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    {final}
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: '#F7F7F7',
            borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'),
            p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: is960 ? 1.25 : (is1920x1125 ? 2 : 1.75),
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
                fontWeight: 900,
                color: '#3D68B3',
              }}
            >
              Combine & Tones
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: is960 ? 0.75 : 1,
                px: is960 ? 1.25 : 1.5,
                py: is960 ? 0.65 : 0.85,
                borderRadius: '999px',
                bgcolor: 'white',
                border: '1px solid rgba(61,104,179,0.22)',
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#E88B52',
                  fontSize: is960 ? '0.9rem' : '1rem',
                }}
              >
                {selectedInitial}
              </Typography>
              <Typography component="span" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                +
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#008B8B',
                  fontSize: is960 ? '0.9rem' : '1rem',
                }}
              >
                {selectedFinal}
              </Typography>
              <Typography component="span" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                =
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontWeight: 900,
                  color: '#3D68B3',
                  fontSize: is960 ? '1rem' : '1.12rem',
                  letterSpacing: '0.02em',
                }}
              >
                {baseSyllable}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
            }}
          >
            {TONE_OPTIONS.map(({ tone, label }, idx) => {
              const toned = tonedSyllables[idx];
              const isActive = selectedTone === tone;
              return (
                <ButtonBase
                  key={tone}
                  onClick={() => openLookup(tone)}
                  sx={{
                    flex: 1,
                    py: is960 ? 1.35 : (is1920x1125 ? 2.25 : 1.85),
                    borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                    bgcolor: isActive ? '#3D68B3' : 'white',
                    color: isActive ? 'white' : '#3D68B3',
                    border: '1px solid',
                    borderColor: '#3D68B3',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: is960 ? 0.45 : (is1920x1125 ? 0.75 : 0.55),
                    transition: 'all 0.2s',
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: is960 ? '1.65rem' : (is1920x1125 ? '2.5rem' : '2.1rem'),
                      fontWeight: 900,
                      lineHeight: 1,
                      color: 'inherit',
                    }}
                  >
                    {toned}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.62rem' : (is1920x1125 ? '0.875rem' : '0.72rem'),
                      fontWeight: 700,
                      color: 'inherit',
                      opacity: 0.92,
                    }}
                  >
                    {label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            sx={{
              mt: is960 ? 1.1 : 1.35,
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 1 : 1.25,
              px: is960 ? 1.35 : 1.6,
              py: is960 ? 0.85 : 1,
              borderRadius: is960 ? '14px' : '16px',
              bgcolor: '#EEF4FF',
              border: '1px solid rgba(61,104,179,0.22)',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.45,
                flexShrink: 0,
                px: is960 ? 0.85 : 1,
                py: is960 ? 0.35 : 0.45,
                borderRadius: '999px',
                bgcolor: '#3D68B3',
                color: 'white',
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: is960 ? 16 : 18 }} />
              <Typography
                sx={{
                  fontSize: is960 ? '0.72rem' : '0.78rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                TIP
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: is960 ? '0.88rem' : '0.98rem',
                color: '#334155',
                fontWeight: 650,
                lineHeight: 1.4,
              }}
            >
              Tap a tone to look up the character and hear the pronunciation.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={lookupOpen}
        onClose={() => setLookupOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: is960 ? '22px' : '28px',
            overflow: 'hidden',
            m: is960 ? 1.5 : 2,
            maxHeight: dialogMaxHeight,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            p: is960 ? 2 : 2.5,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: dialogMaxHeight,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <IconButton
            onClick={() => setLookupOpen(false)}
            aria-label="Close"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: '#F1F5F9',
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              mb: is960 ? 1.25 : 1.5,
              p: is960 ? 1.25 : 1.5,
              borderRadius: is960 ? '16px' : '18px',
              bgcolor: '#1E3A8A',
              border: '2px solid #3B82F6',
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(30,58,138,0.2)',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '0.62rem' : '0.68rem',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.72)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                mb: is960 ? 0.75 : 0.9,
              }}
            >
              Syllable Formula
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: is960 ? 0.55 : 0.7,
              }}
            >
              <Box component="span" sx={formulaChipSx('#E88B52', '#FFFFFF')}>
                {selectedInitial}
              </Box>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.15rem', fontWeight: 900, color: 'rgba(255,255,255,0.55)' }}>
                +
              </Typography>
              <Box component="span" sx={formulaChipSx('#008B8B', '#FFFFFF')}>
                {selectedFinal}
              </Box>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.15rem', fontWeight: 900, color: 'rgba(255,255,255,0.55)' }}>
                →
              </Typography>
              <Box component="span" sx={formulaChipSx('#2563EB', '#FFFFFF', 72)}>
                {TONE_OPTIONS.find((t) => t.tone === selectedTone)?.label ?? ''}
              </Box>
            </Box>

            <Typography
              sx={{
                mt: is960 ? 0.75 : 0.9,
                fontSize: is960 ? '1.55rem' : '1.75rem',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              = {activeTonedSyllable}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: is960 ? 0.75 : 0.9,
              mb: phrasesOpen ? (is960 ? 0.75 : 1) : 0,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: is960 ? '1.25rem' : '1.45rem',
                  fontWeight: 800,
                  color: '#3D68B3',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}
              >
                {lookupEntry.pinyin}
              </Typography>
              <IconButton
                onClick={handleSpeak}
                aria-label="Play pronunciation"
                sx={{
                  width: is960 ? 40 : 44,
                  height: is960 ? 40 : 44,
                  bgcolor: '#EEF2FF',
                  color: '#3D68B3',
                  '&:hover': { bgcolor: '#E0E7FF' },
                }}
              >
                <VolumeUpIcon sx={{ fontSize: is960 ? 20 : 22 }} />
              </IconButton>
            </Box>

            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {lookupEntry.hskLevel && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -10,
                    zIndex: 2,
                    px: is960 ? 0.7 : 0.85,
                    py: 0.25,
                    borderRadius: '7px',
                    bgcolor: '#C8102E',
                    color: '#FFFFFF',
                    fontSize: is960 ? '0.62rem' : '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    boxShadow: '0 3px 8px rgba(200,16,46,0.3)',
                  }}
                >
                  HSK {lookupEntry.hskLevel}
                </Box>
              )}
              <PinyinTianziGrid character={lookupEntry.hanzi} size={is960 ? 92 : 104} />
            </Box>

            <Typography
              sx={{
                fontSize: is960 ? '0.8rem' : '0.88rem',
                fontWeight: 650,
                color: '#475569',
                textAlign: 'center',
                px: 1,
              }}
            >
              {resolvePinyinMeaning(lookupEntry.meaning, locale.id)}
            </Typography>

            <ButtonBase
              onClick={() => setPhrasesOpen((open) => !open)}
              sx={{
                minHeight: is960 ? 40 : 44,
                px: is960 ? 1.5 : 1.85,
                borderRadius: '999px',
                bgcolor: phrasesOpen ? '#3D68B3' : '#EEF4FF',
                color: phrasesOpen ? '#FFFFFF' : '#3D68B3',
                border: '2px solid',
                borderColor: phrasesOpen ? '#3D68B3' : 'rgba(61,104,179,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.65,
                transition: 'all 0.2s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <AutoStoriesOutlinedIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.88rem', fontWeight: 800 }}>
                Word Association
              </Typography>
              <ExpandMoreIcon
                sx={{
                  fontSize: 20,
                  transform: phrasesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </ButtonBase>
          </Box>

          {phrasesOpen && (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: is960 ? 0.75 : 0.85,
                pr: 0.5,
                mt: 0.25,
                '&::-webkit-scrollbar': { width: 5 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '999px' },
              }}
            >
              {lookupEntry.phrases.map((phraseItem) => (
                <Box
                  key={`${phraseItem.hanzi}-${phraseItem.pinyin}`}
                  sx={{
                    p: is960 ? 0.95 : 1.05,
                    borderRadius: '14px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 1 : 1.15,
                    flexWrap: 'wrap',
                  }}
                >
                  <PinyinRubyText
                    original={phraseItem.hanzi}
                    words={[{ chinese: phraseItem.hanzi, pinyin: phraseItem.pinyin }]}
                    hanziClassName="text-lg font-bold text-slate-900 leading-none"
                    pinyinClassName="text-xs font-semibold text-blue-600 tracking-wide leading-none mb-1 whitespace-nowrap"
                  />
                  <Typography
                    sx={{
                      color: '#CBD5E1',
                      fontWeight: 300,
                      fontSize: is960 ? '1rem' : '1.1rem',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    |
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.78rem' : '0.84rem',
                      color: '#475569',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      flex: 1,
                      minWidth: is960 ? 120 : 140,
                    }}
                  >
                    {resolvePinyinMeaning(phraseItem.meanings, locale.id)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
