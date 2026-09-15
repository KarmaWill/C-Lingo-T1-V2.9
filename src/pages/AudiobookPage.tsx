import { useState, useEffect, useRef } from 'react'
import { Box, Typography, ButtonBase } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReplayIcon from '@mui/icons-material/Replay'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ReadingRubyLine from '../components/ReadingRubyLine'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

const AUDIOBOOK_CONTENT = {
  title: "Beijing, China's Capital City",
  subtitle: '北京：中国的首都',
  sentences: [
    {
      id: 's1',
      en: "The People's Republic of China was established on October 1, 1949, and Beijing became its capital city.",
      cn: '中华 人民 共和国 成立 于 1949 年 10 月 1 日 北京 成为 其 首都',
      pinyin: 'Zhōnghuá Rénmín Gònghéguó chénglì yú 1949 nián 10 yuè 1 rì Běijīng chéngwéi qí shǒudū',
    },
    {
      id: 's2',
      en: 'Beijing is in the north of China, and is the political and cultural center of the country.',
      cn: '北京 位于 中国 北部 是 国家 的 政治 和 文化 中心',
      pinyin: 'Běijīng wèiyú Zhōngguó běibù shì guójiā de zhèngzhì hé wénhuà zhōngxīn',
    },
    {
      id: 's3',
      en: "Tian'anmen Square and the Forbidden City are symbols of Beijing as a modern city.",
      cn: '天安门 广场 和 故宫 是 北京 作为 现代化 城市 的 象征',
      pinyin: "Tiān'ānmén Guǎngchǎng hé Gùgōng shì Běijīng zuòwéi xiàndàihuà chéngshì de xiàngzhēng",
    },
    {
      id: 's4',
      en: 'In addition, Beijing hosted both the 2008 Summer Olympics and the 2022 Winter Olympics, making it the world\'s first dual Olympic city.',
      cn: '此外 北京 还 举办了 2008 年 夏季 奥运会 和 2022 年 冬季 奥运会 成为 世界 上 第一 个 双奥 之 城',
      pinyin: 'Cǐwài Běijīng hái jǔbànle 2008 nián xiàjì àoyùnhuì hé 2022 nián dōngjì àoyùnhuì chéngwéi shìjiè shàng dìyī gè shuāngào zhī chéng',
    },
  ],
}

interface AudiobookPageProps {
  onBack: () => void
}

export default function AudiobookPage({ onBack }: AudiobookPageProps) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showPinyin, setShowPinyin] = useState(true)
  const [languageMode, setLanguageMode] = useState<'both' | 'cn'>('both')
  const [isLoading, setIsLoading] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const playingRef = useRef(false)

  const allSentences = AUDIOBOOK_CONTENT.sentences

  const stopAudio = () => {
    window.speechSynthesis.cancel()
    setIsLoading(false)
  }

  const playSentence = (index: number, autoNext = false) => {
    stopAudio()
    setIsLoading(true)
    setCurrentSentenceIndex(index)

    const sentence = allSentences[index]
    const utterance = new SpeechSynthesisUtterance(`${sentence.cn.replace(/\s+/g, '')}. ${sentence.en}`)
    utterance.lang = 'zh-CN'
    utterance.rate = playbackSpeed
    utterance.pitch = 1

    utterance.onstart = () => setIsLoading(false)
    utterance.onend = () => {
      if (autoNext && playingRef.current && index < allSentences.length - 1) {
        playSentence(index + 1, true)
      } else if (index === allSentences.length - 1) {
        playingRef.current = false
        setIsPlaying(false)
        setCurrentSentenceIndex(null)
      }
    }
    utterance.onerror = () => {
      setIsLoading(false)
      playingRef.current = false
      setIsPlaying(false)
    }

    currentUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const toggleMasterPlay = () => {
    if (isPlaying) {
      stopAudio()
      playingRef.current = false
      setIsPlaying(false)
      return
    }
    playingRef.current = true
    setIsPlaying(true)
    playSentence(currentSentenceIndex !== null ? currentSentenceIndex : 0, true)
  }

  useEffect(() => {
    return () => {
      playingRef.current = false
      stopAudio()
    }
  }, [])

  const progress =
    currentSentenceIndex === null
      ? 0
      : ((currentSentenceIndex + 1) / allSentences.length) * 100

  const chipSx = (active: boolean) => ({
    height: p(64),
    px: `${p(24)}px`,
    borderRadius: `${p(16)}px`,
    border: '1px solid #E0E0DF',
    bgcolor: active ? '#FFFFFF' : '#F3F4F6',
    color: active ? '#2D3436' : '#98A2B3',
    fontFamily: FIGMA_FONT,
    fontWeight: 700,
    fontSize: p(24),
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
    '&:active': { transform: 'scale(0.98)' },
  })

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#F8F9F8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: p(160),
          px: `${p(60)}px`,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${p(24)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0, flex: 1 }}>
          <HskPrepBackButton
            onClick={() => {
              stopAudio()
              onBack()
            }}
            sx={{ width: p(80), height: p(80), flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: p(40) } }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(36),
                lineHeight: `${p(48)}px`,
                color: '#2D3436',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {AUDIOBOOK_CONTENT.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 500,
                fontSize: p(22),
                lineHeight: `${p(28)}px`,
                color: '#636E72',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              UNIT 1: CHINA & YOU
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, flexShrink: 0 }}>
          <ButtonBase onClick={() => setShowPinyin((v) => !v)} sx={chipSx(showPinyin)}>
            {showPinyin ? (
              <VisibilityIcon sx={{ fontSize: p(28), mr: `${p(8)}px` }} />
            ) : (
              <VisibilityOffIcon sx={{ fontSize: p(28), mr: `${p(8)}px` }} />
            )}
            Pinyin
          </ButtonBase>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: p(64),
              p: `${p(6)}px`,
              borderRadius: `${p(16)}px`,
              bgcolor: '#F3F4F6',
              border: '1px solid #E0E0DF',
              gap: `${p(6)}px`,
            }}
          >
            {([
              { id: 'cn' as const, label: 'Chinese' },
              { id: 'both' as const, label: 'Bilingual' },
            ]).map((mode) => (
              <ButtonBase
                key={mode.id}
                onClick={() => setLanguageMode(mode.id)}
                sx={{
                  height: p(52),
                  px: `${p(22)}px`,
                  borderRadius: `${p(12)}px`,
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(22),
                  bgcolor: languageMode === mode.id ? '#FFFFFF' : 'transparent',
                  color: languageMode === mode.id ? '#2D3436' : '#98A2B3',
                  border: languageMode === mode.id ? '1px solid #E0E0DF' : '1px solid transparent',
                  boxShadow: languageMode === mode.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {mode.label}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(80)}px`,
          py: `${p(40)}px`,
        }}
      >
        <Box sx={{ maxWidth: p(1600), mx: 'auto', width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: `${p(48)}px` }}>
            <Typography
              sx={{
                fontFamily: KAI_TI,
                fontWeight: 700,
                fontSize: p(48),
                lineHeight: `${p(64)}px`,
                color: '#2D3436',
                mb: `${p(16)}px`,
              }}
            >
              {AUDIOBOOK_CONTENT.subtitle}
            </Typography>
            <Box
              sx={{
                width: p(80),
                height: p(6),
                bgcolor: '#00B4A0',
                opacity: 0.35,
                borderRadius: 99,
                mx: 'auto',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(28)}px` }}>
            {allSentences.map((sentence, idx) => {
              const isCurrent = currentSentenceIndex === idx
              return (
                <ButtonBase
                  key={sentence.id}
                  onClick={() => {
                    playingRef.current = false
                    setIsPlaying(false)
                    playSentence(idx, false)
                  }}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    p: `${p(36)}px`,
                    borderRadius: `${p(28)}px`,
                    border: isCurrent ? '2px solid #00B4A0' : '2px solid transparent',
                    bgcolor: isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    textAlign: 'left',
                    display: 'block',
                    boxSizing: 'border-box',
                    '&:active': { transform: 'scale(0.995)' },
                  }}
                >
                  {isCurrent && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: p(-18),
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: p(64),
                        height: p(64),
                        borderRadius: '50%',
                        bgcolor: '#FF6B35',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(255,107,53,0.35)',
                      }}
                    >
                      {isLoading ? (
                        <Box
                          sx={{
                            width: p(28),
                            height: p(28),
                            border: `${p(3)}px solid rgba(255,255,255,0.35)`,
                            borderTopColor: '#FFFFFF',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />
                      ) : (
                        <VolumeUpIcon sx={{ fontSize: p(32) }} />
                      )}
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: languageMode === 'both' ? 'minmax(0, 1.15fr) 1px minmax(0, 1fr)' : '1fr',
                      gap: `${p(32)}px`,
                      alignItems: 'start',
                      pl: isCurrent ? `${p(40)}px` : 0,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <ReadingRubyLine
                        chinese={sentence.cn}
                        pinyin={sentence.pinyin}
                        showPinyin={showPinyin}
                        active={isCurrent}
                        hanziSize={p(40)}
                        pinyinSize={p(22)}
                      />
                    </Box>
                    {languageMode === 'both' && (
                      <>
                        <Box sx={{ bgcolor: '#E8ECEF', alignSelf: 'stretch', minHeight: p(80) }} />
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontWeight: 400,
                            fontSize: p(28),
                            lineHeight: 1.55,
                            color: isCurrent ? '#2D3436' : '#98A2B3',
                          }}
                        >
                          {sentence.en}
                        </Typography>
                      </>
                    )}
                  </Box>
                </ButtonBase>
              )
            })}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: `${p(60)}px`,
          pb: `${p(40)}px`,
          pt: `${p(12)}px`,
        }}
      >
        <Box
          sx={{
            maxWidth: p(1200),
            mx: 'auto',
            bgcolor: 'rgba(255,255,255,0.96)',
            border: '1px solid #E0E0DF',
            boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
            borderRadius: `${p(40)}px`,
            px: `${p(36)}px`,
            py: `${p(24)}px`,
            display: 'flex',
            alignItems: 'center',
            gap: `${p(28)}px`,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(20),
                lineHeight: `${p(28)}px`,
                color: '#98A2B3',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: `${p(10)}px`,
              }}
            >
              {currentSentenceIndex !== null
                ? `Reading ${currentSentenceIndex + 1}/${allSentences.length}`
                : 'Click to read'}
            </Typography>
            <Box sx={{ height: p(10), bgcolor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${progress}%`,
                  bgcolor: '#00B4A0',
                  borderRadius: 99,
                  transition: 'width 0.35s ease',
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, flexShrink: 0 }}>
            <ButtonBase
              onClick={() => {
                stopAudio()
                setCurrentSentenceIndex(0)
                if (isPlaying) playSentence(0, true)
              }}
              aria-label="Restart"
              sx={{
                width: p(72),
                height: p(72),
                borderRadius: '50%',
                bgcolor: '#2D3436',
                color: '#FFFFFF',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <ReplayIcon sx={{ fontSize: p(34) }} />
            </ButtonBase>

            <ButtonBase
              onClick={toggleMasterPlay}
              disabled={isLoading}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              sx={{
                width: p(96),
                height: p(96),
                borderRadius: '50%',
                bgcolor: '#00B4A0',
                color: '#FFFFFF',
                boxShadow: '0 10px 24px rgba(0,180,160,0.35)',
                '&.Mui-disabled': { opacity: 0.5 },
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    width: p(36),
                    height: p(36),
                    border: `${p(3)}px solid rgba(255,255,255,0.35)`,
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : isPlaying ? (
                <PauseIcon sx={{ fontSize: p(48) }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: p(48), ml: `${p(4)}px` }} />
              )}
            </ButtonBase>

            <Box sx={{ position: 'relative' }}>
              <ButtonBase
                onClick={() => setShowSpeedMenu((v) => !v)}
                aria-label="Playback speed"
                sx={{
                  width: p(72),
                  height: p(72),
                  borderRadius: '50%',
                  bgcolor: '#2D3436',
                  color: '#FFFFFF',
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(22),
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                {playbackSpeed}x
              </ButtonBase>
              {showSpeedMenu && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '110%',
                    right: 0,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E0E0DF',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderRadius: `${p(20)}px`,
                    p: `${p(10)}px`,
                    minWidth: p(140),
                    zIndex: 30,
                  }}
                >
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <ButtonBase
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed)
                        setShowSpeedMenu(false)
                      }}
                      sx={{
                        width: '100%',
                        height: p(56),
                        borderRadius: `${p(12)}px`,
                        fontFamily: FIGMA_FONT,
                        fontWeight: 700,
                        fontSize: p(24),
                        color: playbackSpeed === speed ? '#00B4A0' : '#636E72',
                        '&:active': { bgcolor: '#F8F9F8' },
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
  )
}
