import { useState, useEffect, useRef } from 'react';
import { Box, Typography, ButtonBase, IconButton } from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Replay, 
  ArrowBack as BackIcon, 
  VolumeUp, 
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

interface Sentence {
  id: string;
  en: string;
  cn: string;
  pinyin: string;
}

const AUDIOBOOK_CONTENT = {
  title: "Beijing, China's Capital City",
  subtitle: "北京：中国的首都",
  sentences: [
    { 
      id: 's1', 
      en: "The People's Republic of China was established on October 1, 1949, and Beijing became its capital city.", 
      cn: "中华人民共和国成立于1949年10月1日，北京成为其首都。", 
      pinyin: "Zhōnghuá Rénmín Gònghéguó chénglì yú yījiǔsìjiǔ nián shí yuè yī rì, Běijīng chéngwéi qí shǒudū." 
    },
    { 
      id: 's2', 
      en: "Beijing is in the north of China, and is the political and cultural center of the country.", 
      cn: "北京位于中国北部，是国家的政治和文化中心。", 
      pinyin: "Běijīng wèiyú Zhōngguó běibù, shì guójiā de zhèngzhì hé wénhuà zhōngxīn." 
    },
    { 
      id: 's3', 
      en: "Tian'anmen Square and the Forbidden City are symbols of Beijing as a modern city.", 
      cn: "天安门广场和故宫是北京作为现代化城市的象征。", 
      pinyin: "Tiān'ānmén Guǎngchǎng hé Gùgōng shì Běijīng zuòwéi xiàndàihuà chéngshì de xiàngzhēng." 
    },
    { 
      id: 's4', 
      en: "In addition, Beijing hosted both the 2008 Summer Olympics and the 2022 Winter Olympics, making it the world's first dual Olympic city.", 
      cn: "此外，北京还举办了2008年夏季奥运会和2022年冬季奥运会，成为世界上第一个双奥之城。", 
      pinyin: "Cǐwài, Běijīng hái jǔbànle èr líng líng bā nián xiàjì àoyùnhuì hé èr líng èr èr nián dōngjì àoyùnhuì, chéngwéi shìjiè shàng dì yī gè shuāng ào zhī chéng." 
    }
  ]
};

interface AudiobookPageProps {
  onBack: () => void;
}

export default function AudiobookPage({ onBack }: AudiobookPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [languageMode, setLanguageMode] = useState<'both' | 'cn'>('both');
  const [isLoading, setIsLoading] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const allSentences = AUDIOBOOK_CONTENT.sentences;

  // 停止当前播放
  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsLoading(false);
  };

  // 播放指定句子
  const playSentence = (index: number, autoNext = false) => {
    stopAudio();
    setIsLoading(true);
    setCurrentSentenceIndex(index);
    
    const sentence = allSentences[index];
    
    // 使用 Web Speech API
    const utterance = new SpeechSynthesisUtterance(`${sentence.cn}. ${sentence.en}`);
    utterance.lang = 'zh-CN';
    utterance.rate = playbackSpeed;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsLoading(false);
    };
    
    utterance.onend = () => {
      if (autoNext && isPlaying && index < allSentences.length - 1) {
        playSentence(index + 1, true);
      } else if (index === allSentences.length - 1) {
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

  // 主播放/暂停按钮
  const toggleMasterPlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSentence(currentSentenceIndex !== null ? currentSentenceIndex : 0, true);
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <Box sx={{ 
      height: '100%', 
      bgcolor: '#FDFCF8', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: is960 ? 2 : (is1920x1125 ? 6 : 4), 
        py: is960 ? 1.5 : (is1920x1125 ? 3 : 2.5), 
        bgcolor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : (is1920x1125 ? 3 : 2) }}>
          <ButtonBase 
            onClick={onBack}
            sx={{ 
              width: is960 ? 40 : (is1920x1125 ? 56 : 48),
              height: is960 ? 40 : (is1920x1125 ? 56 : 48),
              borderRadius: '50%',
              bgcolor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { bgcolor: '#E5E7EB' },
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            <BackIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24), color: '#6B7280' }} />
          </ButtonBase>
          <Box>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.75rem' : '1.25rem'), 
              fontWeight: 900, 
              color: '#1F2937',
              mb: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.25)
            }}>
              {AUDIOBOOK_CONTENT.title}
            </Typography>
            <Typography sx={{ 
              fontSize: is960 ? '0.6rem' : (is1920x1125 ? '0.875rem' : '0.7rem'), 
              fontWeight: 700, 
              color: '#9CA3AF', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em' 
            }}>
              UNIT 1: CHINA & YOU
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : (is1920x1125 ? 2.5 : 2) }}>
          {/* 拼音开关 */}
          <ButtonBase 
            onClick={() => setShowPinyin(!showPinyin)}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 0.5 : (is1920x1125 ? 1.5 : 1),
              px: is960 ? 1.5 : (is1920x1125 ? 3 : 2.5), 
              py: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1), 
              borderRadius: is960 ? '12px' : (is1920x1125 ? '20px' : '16px'), 
              border: '1px solid',
              borderColor: showPinyin ? '#E5E7EB' : '#E5E7EB',
              bgcolor: showPinyin ? '#F3F4F6' : '#F3F4F6',
              color: showPinyin ? '#1F2937' : '#9CA3AF',
              transition: 'all 0.2s'
            }}
          >
            {showPinyin ? <Visibility sx={{ fontSize: is960 ? 14 : (is1920x1125 ? 20 : 18) }} /> : <VisibilityOff sx={{ fontSize: is960 ? 14 : (is1920x1125 ? 20 : 18) }} />}
            <Typography sx={{ fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.85rem'), fontWeight: 700 }}>拼音</Typography>
          </ButtonBase>

          {/* 语言模式 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#F3F4F6', 
            p: is960 ? 0.375 : (is1920x1125 ? 0.75 : 0.5), 
            borderRadius: is960 ? '12px' : (is1920x1125 ? '18px' : '14px'),
            border: '1px solid #E5E7EB',
            gap: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.25)
          }}>
            {(['cn', 'both'] as const).map((mode) => (
              <ButtonBase 
                key={mode}
                onClick={() => setLanguageMode(mode)}
                sx={{ 
                  px: is960 ? 2 : (is1920x1125 ? 4 : 3), 
                  py: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75), 
                  borderRadius: is960 ? '8px' : (is1920x1125 ? '14px' : '10px'), 
                  fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.8rem'), 
                  fontWeight: 700,
                  bgcolor: languageMode === mode ? 'white' : 'transparent',
                  color: languageMode === mode ? '#1F2937' : '#9CA3AF',
                  boxShadow: languageMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                  border: languageMode === mode ? '1px solid #E5E7EB' : 'none'
                }}
              >
                {mode === 'cn' ? '中文' : '双语'}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        px: is960 ? 2 : (is1920x1125 ? 6 : 4), 
        py: is960 ? 3 : (is1920x1125 ? 8 : 6),
        maxWidth: is960 ? 800 : (is1920x1125 ? 1600 : 1000), 
        mx: 'auto', 
        width: '100%'
      }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: is960 ? 6 : (is1920x1125 ? 12 : 10) }}>
          <Typography sx={{ 
            fontSize: is960 ? '1.5rem' : (is1920x1125 ? '3.5rem' : '2.5rem'), 
            fontWeight: 900, 
            color: '#1F2937', 
            mb: is960 ? 1 : (is1920x1125 ? 3 : 2)
          }}>
            {AUDIOBOOK_CONTENT.subtitle}
          </Typography>
          <Box sx={{ 
            width: is960 ? 60 : (is1920x1125 ? 120 : 80), 
            height: is960 ? 3 : (is1920x1125 ? 6 : 4), 
            bgcolor: '#00A396', 
            mx: 'auto', 
            borderRadius: is960 ? '3px' : (is1920x1125 ? '6px' : '4px'), 
            opacity: 0.3 
          }} />
        </Box>

        {/* Sentences */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 4 : (is1920x1125 ? 8 : 6) }}>
          {allSentences.map((sentence, idx) => {
            const isCurrent = currentSentenceIndex === idx;
            return (
              <ButtonBase 
                key={sentence.id}
                onClick={() => {
                  setIsPlaying(false);
                  playSentence(idx, false);
                }}
                sx={{ 
                  p: is960 ? 3 : (is1920x1125 ? 6 : 5), 
                  borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '28px'), 
                  border: isCurrent ? '1px solid' : 'none',
                  borderColor: isCurrent ? '#00B4A0' : 'transparent',
                  bgcolor: isCurrent ? 'white' : 'transparent',
                  boxShadow: isCurrent ? 'none' : 'none',
                  transition: 'all 0.3s',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  '&:hover': {
                    borderColor: '#E5E7EB',
                    bgcolor: 'white'
                  }
                }}
              >
                {isCurrent && (
                  <Box sx={{
                    position: 'absolute',
                    left: is960 ? -10 : (is1920x1125 ? -16 : -12),
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: is960 ? 40 : (is1920x1125 ? 64 : 48),
                    height: is960 ? 40 : (is1920x1125 ? 64 : 48),
                    borderRadius: '50%',
                    bgcolor: '#FF9800',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255,152,0,0.3)'
                  }}>
                    {isLoading ? (
                      <Box sx={{
                        width: is960 ? 16 : (is1920x1125 ? 24 : 20),
                        height: is960 ? 16 : (is1920x1125 ? 24 : 20),
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    ) : (
                      <VolumeUp sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 32 : 24) }} />
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: languageMode === 'both' ? 'row' : 'column', gap: 4 }}>
                  <Box sx={{ flex: 1, pl: isCurrent ? (is960 ? 3 : (is1920x1125 ? 5 : 4)) : 0 }}>
                    {showPinyin && (
                      <Typography sx={{ 
                        fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.125rem' : '0.8rem'), 
                        color: '#636E72', 
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        mb: is960 ? 1 : (is1920x1125 ? 2 : 1.5),
                        lineHeight: 1.4
                      }}>
                        {sentence.pinyin}
                      </Typography>
                    )}
                    <Typography sx={{ 
                      fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2.25rem' : '1.8rem'), 
                      fontWeight: 600,
                      color: isCurrent ? '#1F2937' : '#6B7280',
                      lineHeight: 1.6
                    }}>
                      {sentence.cn}
                    </Typography>
                  </Box>

                  {languageMode === 'both' && (
                    <>
                      <Box sx={{ 
                        display: { xs: 'none', md: 'block' },
                        width: '1px', 
                        bgcolor: '#E5E7EB',
                        mx: is960 ? 2 : (is1920x1125 ? 4 : 3)
                      }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ 
                          fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.5rem' : '1.2rem'), 
                          fontWeight: 400,
                          color: isCurrent ? '#1F2937' : '#9CA3AF',
                          lineHeight: 1.6
                        }}>
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

      {/* Footer Controls */}
      <Box sx={{ px: is960 ? 2 : (is1920x1125 ? 6 : 4), pb: is960 ? 2 : (is1920x1125 ? 6 : 4), zIndex: 20 }}>
        <Box sx={{ 
          maxWidth: is960 ? 600 : (is1920x1125 ? 1400 : 800), 
          mx: 'auto', 
          bgcolor: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          borderRadius: is960 ? '20px' : (is1920x1125 ? '40px' : '32px'), 
          px: is960 ? 3 : (is1920x1125 ? 7 : 5), 
          py: is960 ? 2 : (is1920x1125 ? 4 : 3), 
          display: 'flex', 
          alignItems: 'center', 
          gap: is960 ? 2 : (is1920x1125 ? 5 : 4)
        }}>
          
          {/* Progress */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ 
              fontSize: is960 ? '0.6rem' : (is1920x1125 ? '0.875rem' : '0.65rem'), 
              fontWeight: 900, 
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: is960 ? 0.75 : (is1920x1125 ? 1.5 : 1)
            }}>
              {currentSentenceIndex !== null ? `Reading ${currentSentenceIndex + 1}/${allSentences.length}` : 'CLICK TO READ'}
            </Typography>
            <Box sx={{ height: is960 ? 4 : (is1920x1125 ? 8 : 6), bgcolor: '#F3F4F6', borderRadius: is960 ? '4px' : (is1920x1125 ? '8px' : '6px'), overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  bgcolor: '#4CAF50',
                  borderRadius: is960 ? '4px' : (is1920x1125 ? '8px' : '6px'),
                  transition: 'width 0.5s',
                  width: `${((currentSentenceIndex || 0) / (allSentences.length - 1)) * 100}%`
                }}
              />
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 2 : (is1920x1125 ? 4 : 3) }}>
            <IconButton 
              onClick={() => {
                stopAudio();
                setCurrentSentenceIndex(0);
                if(isPlaying) playSentence(0, true);
              }}
              sx={{ 
                width: is960 ? 36 : (is1920x1125 ? 56 : 44),
                height: is960 ? 36 : (is1920x1125 ? 56 : 44),
                borderRadius: '50%',
                bgcolor: '#1F2937',
                color: 'white',
                '&:hover': { bgcolor: '#374151' }
              }}
            >
              <Replay sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 28 : 22) }} />
            </IconButton>

            <ButtonBase 
              onClick={toggleMasterPlay}
              disabled={isLoading}
              sx={{ 
                width: is960 ? 48 : (is1920x1125 ? 72 : 56), 
                height: is960 ? 48 : (is1920x1125 ? 72 : 56), 
                borderRadius: '50%', 
                bgcolor: isPlaying ? '#4CAF50' : '#4CAF50',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                '&:active': { transform: 'scale(0.95)' },
                '&:disabled': { opacity: 0.5 }
              }}
            >
              {isLoading ? (
                <Box sx={{
                  width: is960 ? 20 : (is1920x1125 ? 32 : 24),
                  height: is960 ? 20 : (is1920x1125 ? 32 : 24),
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              ) : isPlaying ? (
                <Pause sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 36 : 28) }} />
              ) : (
                <PlayArrow sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 36 : 28), ml: 0.5 }} />
              )}
            </ButtonBase>

            <Box sx={{ position: 'relative' }}>
              <ButtonBase 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: is960 ? 36 : (is1920x1125 ? 56 : 44),
                  height: is960 ? 36 : (is1920x1125 ? 56 : 44),
                  borderRadius: '50%',
                  bgcolor: '#1F2937',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.8rem'),
                  '&:hover': { bgcolor: '#374151' }
                }}
              >
                {playbackSpeed}x
              </ButtonBase>
              {showSpeedMenu && (
                <Box sx={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  mb: 1,
                  bgcolor: 'white',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  p: 1,
                  minWidth: 100
                }}>
                  {[0.75, 1, 1.25, 1.5].map(speed => (
                    <ButtonBase 
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                      sx={{ 
                        width: '100%',
                        px: 3, 
                        py: 1.5, 
                        borderRadius: '10px', 
                        fontSize: '0.8rem', 
                        fontWeight: 900,
                        textAlign: 'right',
                        color: playbackSpeed === speed ? '#00A396' : '#9CA3AF',
                        '&:hover': { bgcolor: '#F9FAFB' }
                      }}
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

