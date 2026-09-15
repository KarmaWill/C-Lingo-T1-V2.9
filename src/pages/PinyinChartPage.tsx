import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  ButtonBase,
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { resolveBackPath } from '../utils/navigateBack';
import { APP_FONT_FAMILY } from '../theme/appFont';
import { APP_SCREEN_SIZE, figmaPx } from '../utils/figmaScale';
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton';
import { applyTone } from '../utils/pinyinCombine';
import {
  PINYIN_FINALS,
  PINYIN_INITIALS,
  buildValidBaseSyllable,
  isValidPair,
} from '../utils/pinyinChartValidate';
import { hasPinyinSyllableEntry, lookupPinyinSyllable, resolvePinyinMeaning } from '../utils/pinyinSyllableLookup';
import { useLocale } from '../context/LocaleContext';
import PinyinRubyText from '../components/PinyinRubyText';
import PinyinTianziGrid from '../components/PinyinTianziGrid';

const C = {
  page: '#F8F9F8',
  surface: '#FFFFFF',
  mutedFill: '#F3F4F6',
  mint: '#F3FAF6',
  cream: '#FFF8F0',
  line: '#E0E0DF',
  text: '#292E2E',
  muted: '#636E72',
  weak: '#A5B0BA',
  idle: '#D5D5D5',
  teal: '#00B4A0',
  orange: '#FF6B35',
  glow: '0px 0px 24px #BBD8D5',
} as const

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

  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const is960 = screenSize === '960x540';
  const backSize = p(80)
  const backIcon = p(40)

  const initials = PINYIN_INITIALS;
  const finals = PINYIN_FINALS;

  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [selectedFinal, setSelectedFinal] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<1 | 2 | 3 | 4>(1);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [phrasesOpen, setPhrasesOpen] = useState(false);

  const isPairValid = Boolean(
    selectedInitial && selectedFinal && isValidPair(selectedInitial, selectedFinal),
  );

  const baseSyllable = useMemo(() => {
    if (!selectedInitial || !selectedFinal) return '';
    return buildValidBaseSyllable(selectedInitial, selectedFinal) ?? '';
  }, [selectedInitial, selectedFinal]);

  const tonedSyllables = useMemo(
    () => (baseSyllable
      ? TONE_OPTIONS.map(({ tone }) => applyTone(baseSyllable, tone))
      : TONE_OPTIONS.map(() => '')),
    [baseSyllable],
  );

  const activeTonedSyllable = useMemo(
    () => (baseSyllable ? applyTone(baseSyllable, selectedTone) : ''),
    [baseSyllable, selectedTone],
  );

  const hasLookupEntry = useMemo(
    () => Boolean(activeTonedSyllable) && hasPinyinSyllableEntry(activeTonedSyllable),
    [activeTonedSyllable],
  );

  const lookupEntry = useMemo(
    () => (activeTonedSyllable ? lookupPinyinSyllable(activeTonedSyllable) : null),
    [activeTonedSyllable],
  );

  const handleSelectInitial = (initial: string) => {
    setLookupOpen(false);
    setPhrasesOpen(false);
    setSelectedInitial((prev) => (prev === initial ? null : initial));
  };

  const handleSelectFinal = (final: string) => {
    setLookupOpen(false);
    setPhrasesOpen(false);
    setSelectedFinal((prev) => (prev === final ? null : final));
  };

  const getInitialButtonState = (initial: string) => {
    const isSelected = selectedInitial === initial;
    if (isSelected) return { isSelected: true, isHighlighted: false, isDisabled: false };

    if (selectedFinal && !selectedInitial) {
      const matches = isValidPair(initial, selectedFinal);
      return { isSelected: false, isHighlighted: matches, isDisabled: !matches };
    }

    if (selectedInitial && selectedFinal) {
      const matches = isValidPair(initial, selectedFinal);
      return { isSelected: false, isHighlighted: matches, isDisabled: !matches };
    }

    return { isSelected: false, isHighlighted: false, isDisabled: false };
  };

  const getFinalButtonState = (final: string) => {
    const isSelected = selectedFinal === final;
    if (isSelected) return { isSelected: true, isHighlighted: false, isDisabled: false };

    if (selectedInitial && !selectedFinal) {
      const matches = isValidPair(selectedInitial, final);
      return { isSelected: false, isHighlighted: matches, isDisabled: !matches };
    }

    if (selectedInitial && selectedFinal) {
      const matches = isValidPair(selectedInitial, final);
      return { isSelected: false, isHighlighted: matches, isDisabled: !matches };
    }

    return { isSelected: false, isHighlighted: false, isDisabled: false };
  };

  const tipMessage = useMemo(() => {
    if (!selectedInitial && !selectedFinal) {
      return 'Tap an initial or a final to start.';
    }
    if (!selectedInitial || !selectedFinal) {
      return 'Tap a matching option on the other side.';
    }
    if (!isPairValid) {
      return 'This combination is not used in Mandarin. Try another pair.';
    }
    return 'Tap a tone to look up the character and hear the pronunciation.';
  }, [selectedInitial, selectedFinal, isPairValid]);

  const openLookup = (tone: 1 | 2 | 3 | 4) => {
    if (!isPairValid || !baseSyllable) return;
    setSelectedTone(tone);
    setPhrasesOpen(false);
    setLookupOpen(true);
  };

  const dialogMaxHeight = is960 ? 488 : 548;

  const formulaChipSx = (bg: string, color: string, minW = 44) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: p(minW),
    minHeight: p(48),
    px: `${p(12)}px`,
    borderRadius: `${p(12)}px`,
    bgcolor: bg,
    color,
    fontWeight: 900,
    fontSize: p(32),
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
        p: `${p(40)}px`,
        bgcolor: C.page,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: backSize,
          mb: `${p(24)}px`,
          flexShrink: 0,
        }}
      >
        <HskPrepBackButton
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          sx={{
            position: 'absolute',
            left: 0,
            width: backSize,
            height: backSize,
            '& .MuiSvgIcon-root': { fontSize: `${backIcon}px` },
          }}
        />

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: 1.6,
            color: C.text,
            fontFamily: APP_FONT_FAMILY,
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
          gap: `${p(24)}px`,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: `${p(24)}px`,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: `${p(40)}px`,
              p: `${p(28)}px`,
              boxShadow: '0 4px 20px rgba(213,213,213,0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                fontSize: p(32),
                lineHeight: 1.6,
                fontWeight: 700,
                color: C.orange,
                mb: `${p(16)}px`,
              }}
            >
              Initial Consonants
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: `${p(12)}px`,
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {initials.map((initial) => {
                const { isSelected, isHighlighted, isDisabled } = getInitialButtonState(initial);
                return (
                  <ButtonBase
                    key={initial}
                    onClick={() => handleSelectInitial(initial)}
                    disabled={isDisabled}
                    sx={{
                      py: `${p(12)}px`,
                      borderRadius: `${p(16)}px`,
                      minHeight: p(64),
                      bgcolor: isSelected || isHighlighted ? C.cream : C.surface,
                      color: isDisabled ? C.idle : C.text,
                      border: '1px solid',
                      borderColor: isSelected || isHighlighted ? C.orange : isDisabled ? C.line : C.line,
                      fontWeight: 700,
                      fontSize: p(32),
                      lineHeight: 1.2,
                      opacity: isDisabled ? 0.45 : 1,
                      boxShadow: isSelected ? C.glow : 'none',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:focus-visible': { outline: `2px solid ${C.teal}`, outlineOffset: 2 },
                      '&:active': { transform: isDisabled ? 'none' : 'scale(0.95)' },
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
              bgcolor: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: `${p(40)}px`,
              p: `${p(28)}px`,
              boxShadow: '0 4px 20px rgba(213,213,213,0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                fontSize: p(32),
                lineHeight: 1.6,
                fontWeight: 700,
                color: C.teal,
                mb: `${p(16)}px`,
              }}
            >
              Finals
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: `${p(12)}px`,
                flex: 1,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: p(8) },
                '&::-webkit-scrollbar-track': { bgcolor: '#E5E5E5', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#C0C0C0',
                  borderRadius: '4px',
                  '&:hover': { bgcolor: '#A0A0A0' },
                },
              }}
            >
              {finals.map((final) => {
                const { isSelected, isHighlighted, isDisabled } = getFinalButtonState(final);
                return (
                  <ButtonBase
                    key={final}
                    onClick={() => handleSelectFinal(final)}
                    disabled={isDisabled}
                    sx={{
                      py: `${p(12)}px`,
                      borderRadius: `${p(16)}px`,
                      minHeight: p(64),
                      bgcolor: isSelected || isHighlighted ? C.mint : C.surface,
                      color: isDisabled ? C.idle : C.text,
                      border: '1px solid',
                      borderColor: isSelected || isHighlighted ? C.teal : C.line,
                      fontWeight: 700,
                      fontSize: p(32),
                      lineHeight: 1.2,
                      opacity: isDisabled ? 0.45 : 1,
                      boxShadow: isSelected ? C.glow : 'none',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:focus-visible': { outline: `2px solid ${C.teal}`, outlineOffset: 2 },
                      '&:active': { transform: isDisabled ? 'none' : 'scale(0.95)' },
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
            bgcolor: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: `${p(40)}px`,
            p: `${p(28)}px`,
            boxShadow: '0 4px 20px rgba(213,213,213,0.35)',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${p(16)}px`,
              mb: `${p(16)}px`,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontSize: p(32),
                lineHeight: 1.6,
                fontWeight: 700,
                color: C.text,
              }}
            >
              Combine & Tones
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${p(12)}px`,
                px: `${p(16)}px`,
                py: `${p(8)}px`,
                borderRadius: '999px',
                bgcolor: C.mutedFill,
                border: `1px solid ${C.line}`,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  color: selectedInitial ? C.orange : C.weak,
                  fontSize: p(32),
                  lineHeight: 1,
                }}
              >
                {selectedInitial ?? '—'}
              </Typography>
              <Typography component="span" sx={{ color: C.weak, fontWeight: 700, fontSize: p(28) }}>
                +
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  color: selectedFinal ? C.teal : C.weak,
                  fontSize: p(32),
                  lineHeight: 1,
                }}
              >
                {selectedFinal ?? '—'}
              </Typography>
              <Typography component="span" sx={{ color: C.weak, fontWeight: 700, fontSize: p(28) }}>
                =
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontWeight: 900,
                  color: C.text,
                  fontSize: p(32),
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}
              >
                {baseSyllable || '—'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: `${p(16)}px`,
            }}
          >
            {TONE_OPTIONS.map(({ tone, label }, idx) => {
              const toned = tonedSyllables[idx];
              const isActive = selectedTone === tone;
              return (
                <ButtonBase
                  key={tone}
                  onClick={() => openLookup(tone)}
                  disabled={!isPairValid}
                  sx={{
                    flex: 1,
                    py: `${p(16)}px`,
                    borderRadius: `${p(16)}px`,
                    bgcolor: isActive ? C.mint : C.surface,
                    color: isPairValid ? C.text : C.weak,
                    border: '1px solid',
                    borderColor: isActive ? C.teal : isPairValid ? C.line : C.line,
                    boxShadow: isActive ? C.glow : 'none',
                    backgroundImage: isActive
                      ? 'linear-gradient(150.37deg, #1BE0CA, #00B4A0)'
                      : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: `${p(8)}px`,
                    opacity: isPairValid ? 1 : 0.45,
                    transition: 'all 0.2s',
                    '&:active': { transform: isPairValid ? 'scale(0.97)' : 'none' },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: p(40),
                      fontWeight: 900,
                      lineHeight: 1,
                      color: 'inherit',
                    }}
                  >
                    {toned}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: p(24),
                      fontWeight: 700,
                      lineHeight: 1.3,
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
              mt: `${p(16)}px`,
              display: 'flex',
              alignItems: 'center',
              gap: `${p(12)}px`,
              px: `${p(16)}px`,
              py: `${p(12)}px`,
              borderRadius: `${p(16)}px`,
              bgcolor: C.mint,
              border: `1px solid ${C.line}`,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: p(28), color: C.teal, flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: p(24),
                color: C.muted,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              {tipMessage}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={lookupOpen && isPairValid}
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
              bgcolor: C.surface,
              border: `1px solid ${C.line}`,
              color: C.text,
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
              bgcolor: C.mint,
              border: `1px solid ${C.line}`,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(213,213,213,0.35)',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '0.72rem' : '0.78rem',
                fontWeight: 700,
                color: C.muted,
                mb: is960 ? 0.75 : 0.9,
              }}
            >
              Syllable
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
              <Box component="span" sx={formulaChipSx(C.cream, C.text)}>
                {selectedInitial ?? '—'}
              </Box>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.15rem', fontWeight: 700, color: C.weak }}>
                +
              </Typography>
              <Box component="span" sx={formulaChipSx(C.mint, C.text)}>
                {selectedFinal ?? '—'}
              </Box>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.15rem', fontWeight: 700, color: C.weak }}>
                →
              </Typography>
              <Box component="span" sx={formulaChipSx(C.mutedFill, C.text, 72)}>
                {TONE_OPTIONS.find((t) => t.tone === selectedTone)?.label ?? ''}
              </Box>
            </Box>

            <Typography
              sx={{
                mt: is960 ? 0.75 : 0.9,
                fontSize: is960 ? '1.55rem' : '1.75rem',
                fontWeight: 700,
                color: C.text,
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
              mb: phrasesOpen && hasLookupEntry ? (is960 ? 0.75 : 1) : 0,
              flexShrink: 0,
            }}
          >
            {hasLookupEntry && lookupEntry ? (
              <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: is960 ? '1.25rem' : '1.45rem',
                  fontWeight: 800,
                  color: C.teal,
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
                  width: is960 ? 48 : 56,
                  height: is960 ? 48 : 56,
                  bgcolor: C.orange,
                  color: C.surface,
                  '&:hover': { bgcolor: '#FF926A' },
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
                    bgcolor: C.orange,
                    color: C.surface,
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
                color: C.muted,
                textAlign: 'center',
                px: 1,
              }}
            >
              {resolvePinyinMeaning(lookupEntry.meaning, locale.id)}
            </Typography>

            <ButtonBase
              onClick={() => setPhrasesOpen((open) => !open)}
              sx={{
                minHeight: 56,
                px: is960 ? 1.5 : 1.85,
                borderRadius: '999px',
                bgcolor: phrasesOpen ? C.mint : C.mutedFill,
                color: C.text,
                border: '1px solid',
                borderColor: phrasesOpen ? C.teal : C.line,
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
              </>
            ) : (
              <Box
                sx={{
                  py: is960 ? 2 : 2.5,
                  px: is960 ? 2 : 2.5,
                  textAlign: 'center',
                  maxWidth: 360,
                }}
              >
                <Typography
                  sx={{
                    fontSize: is960 ? '1.05rem' : '1.15rem',
                    fontWeight: 800,
                    color: C.text,
                    mb: 0.75,
                  }}
                >
                  Valid syllable
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.85rem' : '0.92rem',
                    fontWeight: 600,
                    color: C.muted,
                    lineHeight: 1.5,
                    mb: 1.25,
                  }}
                >
                  {activeTonedSyllable} is a valid Mandarin syllable, but character lookup is not available yet.
                </Typography>
                <ButtonBase
                  onClick={handleSpeak}
                  sx={{
                    minHeight: is960 ? 44 : 48,
                    px: is960 ? 1.75 : 2,
                    borderRadius: '999px',
                    bgcolor: C.orange,
                    color: C.surface,
                    border: `1px solid ${C.orange}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.65,
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                  <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.88rem', fontWeight: 800 }}>
                    Hear pronunciation
                  </Typography>
                </ButtonBase>
              </Box>
            )}
          </Box>

          {phrasesOpen && hasLookupEntry && lookupEntry && (
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
                '&::-webkit-scrollbar-thumb': { bgcolor: C.idle, borderRadius: '999px' },
              }}
            >
              {lookupEntry.phrases.map((phraseItem) => (
                <Box
                  key={`${phraseItem.hanzi}-${phraseItem.pinyin}`}
                  sx={{
                    p: is960 ? 0.95 : 1.05,
                    borderRadius: '14px',
                    bgcolor: C.surface,
                    border: `1px solid ${C.line}`,
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
                    hanziClassName="text-lg font-bold leading-none"
                    pinyinClassName="text-xs font-semibold tracking-wide leading-none mb-1 whitespace-nowrap"
                  />
                  <Typography
                    sx={{
                      color: C.idle,
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
                      color: C.muted,
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
