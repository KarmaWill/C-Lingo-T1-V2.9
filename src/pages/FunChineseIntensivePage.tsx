/**
 * Hello & Home Podcast — synced with Audiobook interaction pattern.
 */
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, ButtonBase, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  PlayArrow,
  Pause,
  Replay,
  VolumeUp,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReadingRubyLine from '../components/ReadingRubyLine';
import { FUN_CHINESE_UNIT1_PODCAST_TITLE } from '../utils/funChineseUnitPodcastCopy';

const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';

interface PodcastSentence {
  id: string;
  title: string;
  /** Space-separated word pinyin (GB/T 16159); not character-split. */
  pinyin: string;
  zh: string;
  en: string;
}

const PODCAST_CONTENT: PodcastSentence[] = [
  {
    id: 'p1',
    title: 'Greetings',
    pinyin: 'Nǐhǎo Nǐhǎo ma',
    zh: '你好！你好吗？',
    en: 'Hello! How are you?',
  },
  {
    id: 'p2',
    title: 'Name',
    pinyin: 'Nǐ jiào shénme Wǒ jiào Ānnà',
    zh: '你叫什么？我叫安娜。',
    en: 'What is your name? My name is Anna.',
  },
  {
    id: 'p3',
    title: 'Home',
    pinyin: 'Nǐ jiā zài nǎr Wǒ jiā zài Běijīng',
    zh: '你家在哪儿？我家在北京。',
    en: 'Where is your home? My home is in Beijing.',
  },
  {
    id: 'p4',
    title: 'Polite Closing',
    pinyin: 'Xièxie Búkèqi',
    zh: '谢谢！不客气。',
    en: 'Thank you! You are welcome.',
  },
];

const CONTENT_TITLE = '你好';

export default function FunChineseIntensivePage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [languageMode, setLanguageMode] = useState<'both' | 'zh'>('both');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsLoading(false);
  };

  const playSentence = (index: number, autoNext = false) => {
    stopAudio();
    setCurrentSentenceIndex(index);
    setIsLoading(true);
    const line = PODCAST_CONTENT[index];
    const utterance = new SpeechSynthesisUtterance(`${line.zh}. ${line.en}`);
    utterance.lang = 'zh-CN';
    utterance.rate = playbackSpeed;
    utterance.onstart = () => setIsLoading(false);
    utterance.onend = () => {
      if (autoNext && isPlaying && index < PODCAST_CONTENT.length - 1) {
        playSentence(index + 1, true);
      } else if (index === PODCAST_CONTENT.length - 1) {
        setIsPlaying(false);
        setCurrentSentenceIndex(null);
      }
    };
    utterance.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMasterPlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    playSentence(currentSentenceIndex !== null ? currentSentenceIndex : 0, true);
  };

  useEffect(() => () => stopAudio(), []);

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#FDFCF8' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: is960 ? 2 : is1920x1125 ? 6 : 4,
          py: is960 ? 1.5 : is1920x1125 ? 3 : 2.5,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 2 }}>
          <ButtonBase
            onClick={() => navigate('/library/hub/fun-chinese')}
            sx={{
              width: is960 ? 40 : is1920x1125 ? 56 : 48,
              height: is960 ? 40 : is1920x1125 ? 56 : 48,
              borderRadius: '50%',
              bgcolor: '#F3F4F6',
              '&:hover': { bgcolor: '#E5E7EB' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : is1920x1125 ? 28 : 24, color: '#6B7280' }} />
          </ButtonBase>
          <Box>
            <Typography sx={{ fontSize: is960 ? '1rem' : is1920x1125 ? '1.75rem' : '1.25rem', fontWeight: 900, color: '#1F2937' }}>
              {FUN_CHINESE_UNIT1_PODCAST_TITLE}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.6rem' : is1920x1125 ? '0.875rem' : '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              UNIT 1: CHINA & YOU
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : is1920x1125 ? 2.5 : 2 }}>
          <ButtonBase
            onClick={() => setShowPinyin(!showPinyin)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 0.5 : 1,
              px: is960 ? 1.5 : is1920x1125 ? 3 : 2.5,
              py: is960 ? 0.75 : is1920x1125 ? 1.25 : 1,
              borderRadius: is960 ? '12px' : is1920x1125 ? '20px' : '16px',
              border: '1px solid #E5E7EB',
              bgcolor: '#F3F4F6',
              color: showPinyin ? '#1F2937' : '#9CA3AF',
            }}
          >
            {showPinyin ? <Visibility sx={{ fontSize: is960 ? 14 : is1920x1125 ? 20 : 18 }} /> : <VisibilityOff sx={{ fontSize: is960 ? 14 : is1920x1125 ? 20 : 18 }} />}
            <Typography sx={{ fontSize: is960 ? '0.7rem' : is1920x1125 ? '1rem' : '0.85rem', fontWeight: 700 }}>Pinyin</Typography>
          </ButtonBase>

          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F3F4F6', p: is960 ? 0.375 : 0.5, borderRadius: is960 ? '12px' : '14px', border: '1px solid #E5E7EB', gap: is960 ? 0.25 : 0.4 }}>
            {(['zh', 'both'] as const).map((mode) => (
              <ButtonBase
                key={mode}
                onClick={() => setLanguageMode(mode)}
                sx={{
                  px: is960 ? 2 : is1920x1125 ? 4 : 3,
                  py: is960 ? 0.5 : is1920x1125 ? 1 : 0.75,
                  borderRadius: is960 ? '8px' : '10px',
                  fontSize: is960 ? '0.7rem' : is1920x1125 ? '1rem' : '0.8rem',
                  fontWeight: 700,
                  bgcolor: languageMode === mode ? '#FFFFFF' : 'transparent',
                  color: languageMode === mode ? '#1F2937' : '#9CA3AF',
                  border: languageMode === mode ? '1px solid #E5E7EB' : 'none',
                  boxShadow: languageMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {mode === 'zh' ? 'Chinese' : 'Bilingual'}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: is960 ? 2 : is1920x1125 ? 6 : 4, py: is960 ? 3 : is1920x1125 ? 8 : 6, maxWidth: is960 ? 800 : is1920x1125 ? 1600 : 1000, mx: 'auto', width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: is960 ? 6 : is1920x1125 ? 12 : 10 }}>
          <Typography
            sx={{
              fontSize: is960 ? '1.5rem' : is1920x1125 ? '3.5rem' : '2.5rem',
              fontWeight: 900,
              color: '#1F2937',
              mb: is960 ? 1 : is1920x1125 ? 3 : 2,
              fontFamily: KAI_TI,
            }}
          >
            {CONTENT_TITLE}
          </Typography>
          <Box sx={{ width: is960 ? 60 : is1920x1125 ? 120 : 80, height: is960 ? 3 : is1920x1125 ? 6 : 4, bgcolor: '#00A396', mx: 'auto', borderRadius: 99, opacity: 0.3 }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 4 : is1920x1125 ? 8 : 6 }}>
          {PODCAST_CONTENT.map((sentence, idx) => {
            const isCurrent = currentSentenceIndex === idx;
            return (
              <ButtonBase
                key={sentence.id}
                onClick={() => {
                  setIsPlaying(false);
                  playSentence(idx, false);
                }}
                sx={{
                  p: is960 ? 3 : is1920x1125 ? 6 : 5,
                  borderRadius: is960 ? '20px' : is1920x1125 ? '32px' : '28px',
                  border: isCurrent ? '1px solid' : 'none',
                  borderColor: isCurrent ? '#00B4A0' : 'transparent',
                  bgcolor: isCurrent ? '#FFFFFF' : 'transparent',
                  transition: 'all 0.3s',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  '&:hover': { borderColor: '#E5E7EB', bgcolor: '#FFFFFF' },
                }}
              >
                {isCurrent && (
                  <Box sx={{ position: 'absolute', left: is960 ? -10 : is1920x1125 ? -16 : -12, top: '50%', transform: 'translateY(-50%)', width: is960 ? 40 : is1920x1125 ? 64 : 48, height: is960 ? 40 : is1920x1125 ? 64 : 48, borderRadius: '50%', bgcolor: '#FF9800', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,152,0,0.3)' }}>
                    {isLoading ? (
                      <Box sx={{ width: is960 ? 16 : is1920x1125 ? 24 : 20, height: is960 ? 16 : is1920x1125 ? 24 : 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                    ) : (
                      <VolumeUp sx={{ fontSize: is960 ? 20 : is1920x1125 ? 32 : 24 }} />
                    )}
                  </Box>
                )}

                <Typography sx={{ fontSize: is960 ? '0.6rem' : is1920x1125 ? '0.9rem' : '0.7rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: is960 ? 0.8 : is1920x1125 ? 1.4 : 1.1, pl: isCurrent ? (is960 ? 3 : is1920x1125 ? 5 : 4) : 0 }}>
                  {sentence.title}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: languageMode === 'both' ? 'row' : 'column', gap: is960 ? 3 : 4 }}>
                  <Box sx={{ flex: 1, pl: isCurrent ? (is960 ? 3 : is1920x1125 ? 5 : 4) : 0, minWidth: 0 }}>
                    <ReadingRubyLine
                      chinese={sentence.zh}
                      pinyin={sentence.pinyin}
                      showPinyin={showPinyin}
                      active={isCurrent}
                      hanziSize={is960 ? '1.25rem' : is1920x1125 ? '2.25rem' : '1.8rem'}
                      pinyinSize={is960 ? '0.7rem' : is1920x1125 ? '1.125rem' : '0.8rem'}
                    />
                  </Box>
                  {languageMode === 'both' && (
                    <>
                      <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', bgcolor: '#E5E7EB', mx: is960 ? 2 : is1920x1125 ? 4 : 3, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: is960 ? '0.9rem' : is1920x1125 ? '1.5rem' : '1.2rem', fontWeight: 400, color: isCurrent ? '#1F2937' : '#9CA3AF', lineHeight: 1.6 }}>
                          {sentence.en}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
      <Box sx={{ px: is960 ? 2 : is1920x1125 ? 6 : 4, pb: is960 ? 2 : is1920x1125 ? 6 : 4 }}>
        <Box sx={{ maxWidth: is960 ? 600 : is1920x1125 ? 1400 : 800, mx: 'auto', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderRadius: is960 ? '20px' : is1920x1125 ? '40px' : '32px', px: is960 ? 3 : is1920x1125 ? 7 : 5, py: is960 ? 2 : is1920x1125 ? 4 : 3, display: 'flex', alignItems: 'center', gap: is960 ? 2 : is1920x1125 ? 5 : 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: is960 ? '0.6rem' : is1920x1125 ? '0.875rem' : '0.65rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: is960 ? 0.75 : is1920x1125 ? 1.5 : 1 }}>
              {currentSentenceIndex !== null ? `Reading ${currentSentenceIndex + 1}/${PODCAST_CONTENT.length}` : 'CLICK TO READ'}
            </Typography>
            <Box sx={{ height: is960 ? 4 : is1920x1125 ? 8 : 6, bgcolor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', bgcolor: '#4CAF50', borderRadius: 99, transition: 'width 0.5s', width: `${((currentSentenceIndex || 0) / (PODCAST_CONTENT.length - 1)) * 100}%` }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 2 : is1920x1125 ? 4 : 3 }}>
            <IconButton
              onClick={() => {
                stopAudio();
                setCurrentSentenceIndex(0);
                if (isPlaying) playSentence(0, true);
              }}
              sx={{ width: is960 ? 36 : is1920x1125 ? 56 : 44, height: is960 ? 36 : is1920x1125 ? 56 : 44, borderRadius: '50%', bgcolor: '#1F2937', color: '#FFFFFF', '&:hover': { bgcolor: '#374151' } }}
            >
              <Replay sx={{ fontSize: is960 ? 18 : is1920x1125 ? 28 : 22 }} />
            </IconButton>

            <ButtonBase
              onClick={toggleMasterPlay}
              disabled={isLoading}
              sx={{ width: is960 ? 48 : is1920x1125 ? 72 : 56, height: is960 ? 48 : is1920x1125 ? 72 : 56, borderRadius: '50%', bgcolor: '#4CAF50', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(76,175,80,0.3)', '&:active': { transform: 'scale(0.95)' }, '&:disabled': { opacity: 0.5 } }}
            >
              {isLoading ? (
                <Box sx={{ width: is960 ? 20 : is1920x1125 ? 32 : 24, height: is960 ? 20 : is1920x1125 ? 32 : 24, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              ) : isPlaying ? (
                <Pause sx={{ fontSize: is960 ? 24 : is1920x1125 ? 36 : 28 }} />
              ) : (
                <PlayArrow sx={{ fontSize: is960 ? 24 : is1920x1125 ? 36 : 28, ml: 0.5 }} />
              )}
            </ButtonBase>

            <Box sx={{ position: 'relative' }}>
              <ButtonBase
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                sx={{ width: is960 ? 36 : is1920x1125 ? 56 : 44, height: is960 ? 36 : is1920x1125 ? 56 : 44, borderRadius: '50%', bgcolor: '#1F2937', color: '#FFFFFF', fontWeight: 900, fontSize: is960 ? '0.7rem' : is1920x1125 ? '1rem' : '0.8rem', '&:hover': { bgcolor: '#374151' } }}
              >
                {playbackSpeed}x
              </ButtonBase>
              {showSpeedMenu && (
                <Box sx={{ position: 'absolute', bottom: '100%', right: 0, mb: 1, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '16px', p: 1, minWidth: 100 }}>
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <ButtonBase
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                      sx={{ width: '100%', px: 3, py: 1.5, borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, color: playbackSpeed === speed ? '#00A396' : '#9CA3AF', '&:hover': { bgcolor: '#F9FAFB' } }}
                    >
                      {speed}x
                    </ButtonBase>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
