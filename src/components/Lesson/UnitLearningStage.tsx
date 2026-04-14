import { useState } from 'react'
import { Box, Typography, ButtonBase, LinearProgress, Grid } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Unit } from '../../types/lesson'
import { CURRENT_LESSON } from '../../mock/lessonData'

interface Props {
  unit: Unit
  onComplete: () => void
  onExit: () => void
}

export default function UnitLearningStage({ unit, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = unit.learnings[currentIndex]
  const isLast = currentIndex === unit.learnings.length - 1
  const hskLevel = CURRENT_LESSON.hskLevel || 1

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // 判断卡片类型：单字(1-2字) / 短语(3-8字无标点) / 句子(>8字或有标点)
  const contentLength = currentCard.content.length
  const hasPunctuation = /[，。？！、：；""]/.test(currentCard.content)
  const isCharacter = contentLength <= 2 && !hasPunctuation
  const isPhrase = contentLength > 2 && contentLength <= 8 && !hasPunctuation
  const isSentence = contentLength > 8 || hasPunctuation
  const hasImage = !!currentCard.imageUrl

  // 提取母语部分（去掉中文）
  const extractNativeLanguage = (meaning: string) => {
    const parts = meaning.split(' / ')
    return parts.length > 1 ? parts.slice(1).join(' / ') : meaning
  }

  // 获取词性
  const getPartOfSpeech = () => {
    const meaningText = extractNativeLanguage(currentCard.meaning)
    const partOfSpeechMatch = meaningText.match(/\((noun|verb|adjective|adverb|n\.|v\.|adj\.|adv\.)\)/i)
    const partOfSpeech = partOfSpeechMatch ? partOfSpeechMatch[1].toLowerCase() : null
    
    const commonPartsOfSpeech: { [key: string]: string } = {
      'rice': 'noun', 'water': 'noun', 'noodles': 'noun', 'dumplings': 'noun',
      'tea': 'noun', 'coffee': 'noun', 'bread': 'noun', 'food': 'noun',
      'eat': 'verb', 'drink': 'verb', 'want': 'verb', 'have': 'verb',
      'good': 'adjective', 'nice': 'adjective', 'big': 'adjective', 'small': 'adjective',
      'steamed': 'adjective', 'bun': 'noun', '米': 'noun', '米饭': 'noun'
    }
    
    return partOfSpeech || commonPartsOfSpeech[meaningText.toLowerCase().split(' ')[0]] || commonPartsOfSpeech[currentCard.content] || 'noun'
  }

  const next = () => {
    if (isLast) onComplete()
    else setCurrentIndex(prev => prev + 1)
  }

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const partOfSpeech = getPartOfSpeech()
  const partOfSpeechText = partOfSpeech === 'noun' || partOfSpeech === 'n.' ? 'n.' : 
                          partOfSpeech === 'verb' || partOfSpeech === 'v.' ? 'v.' :
                          partOfSpeech === 'adjective' || partOfSpeech === 'adj.' ? 'adj.' :
                          partOfSpeech === 'adverb' || partOfSpeech === 'adv.' ? 'adv.' : 'n.'
  
  // Split pinyin into syllables for display with dotted lines
  const pinyinSyllables = currentCard.pinyin.split(/\s+/).filter(s => s.length > 0)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F7F9F8', overflow: 'hidden', p: is960 ? 2 : (is1920x1125 ? 4 : 3), boxSizing: 'border-box' }}>
      {/* Top Navigation Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: is960 ? 2 : (is1920x1125 ? 3 : 3), flexShrink: 0 }}>
        <ButtonBase
          onClick={onExit}
          sx={{
            width: is960 ? 40 : (is1920x1125 ? 48 : 48),
            height: is960 ? 40 : (is1920x1125 ? 48 : 48),
            borderRadius: '50%',
            bgcolor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:active': { bgcolor: '#E5E7EB', transform: 'scale(0.95)' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 24 : 24), color: '#1F2937' }} />
        </ButtonBase>
        
        <Box sx={{ flex: 1, mx: is960 ? 2 : (is1920x1125 ? 4 : 4), maxWidth: is960 ? 400 : (is1920x1125 ? 600 : 500) }}>
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.95rem' : (is1920x1125 ? '1.5rem' : '1.125rem'), mb: is960 ? 0.75 : (is1920x1125 ? 1 : 1) }}>
            {unit.title}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={((currentIndex + 1) / unit.learnings.length) * 100} 
            sx={{ 
              height: is960 ? 6 : (is1920x1125 ? 8 : 8), 
              borderRadius: '4px', 
              bgcolor: '#E5E7EB', 
              '& .MuiLinearProgress-bar': { bgcolor: '#00B4A0', borderRadius: '4px' } 
            }} 
          />
        </Box>
        
        <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.95rem' : (is1920x1125 ? '1.5rem' : '1.125rem'), minWidth: is960 ? 40 : (is1920x1125 ? 60 : 48), textAlign: 'right' }}>
          {currentIndex + 1}/{unit.learnings.length}
        </Typography>
      </Box>

      {/* Main Content - Grid Layout */}
      <Grid container spacing={is960 ? 1.5 : (is1920x1125 ? 3 : 2)} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
        {/* Left: Memory Aids */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Box sx={{ 
            flex: 1,
            bgcolor: 'white', 
            borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '24px'), 
            p: is960 ? 2 : (is1920x1125 ? 3 : 3), 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            minHeight: 0,
            boxSizing: 'border-box'
          }}>
            {/* Memory Aids Tag */}
            <Box sx={{ 
              alignSelf: 'flex-start',
              px: is960 ? 1.5 : (is1920x1125 ? 2 : 2), 
              py: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.75), 
              borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'), 
              bgcolor: '#F3F4F6',
              mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2)
            }}>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                fontWeight: 700, 
                color: '#636E72'
              }}>
                Memory Aids
              </Typography>
            </Box>

            {/* Image Display */}
            <Box sx={{ 
              flex: 1,
              borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'),
              minHeight: 0,
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2)
            }}>
              {hasImage ? (
                <Box 
                  component="img" 
                  src={currentCard.imageUrl} 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    p: is960 ? 1 : (is1920x1125 ? 2 : 2)
                  }} 
                />
              ) : (
                <Box sx={{ textAlign: 'center', p: is960 ? 2 : (is1920x1125 ? 3 : 3) }}>
                  <Typography sx={{ fontSize: is960 ? '4rem' : (is1920x1125 ? '6rem' : '6rem') }}>🍚</Typography>
                </Box>
              )}
            </Box>
            
            {/* Meaning Text with Part of Speech */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 1 : (is1920x1125 ? 1.5 : 1.5),
              flexShrink: 0
            }}>
              <Typography sx={{ 
                fontWeight: 900, 
                color: '#1F2937', 
                fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.75rem')
              }}>
                {extractNativeLanguage(currentCard.meaning)}
              </Typography>
              <Box sx={{ 
                px: is960 ? 1 : (is1920x1125 ? 1.5 : 1.5), 
                py: is960 ? 0.4 : (is1920x1125 ? 0.5 : 0.5), 
                borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'), 
                bgcolor: '#00B4A0',
                display: 'inline-flex'
              }}>
                <Typography sx={{ 
                  fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                  color: 'white', 
                  fontWeight: 700 
                }}>
                  {partOfSpeechText}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right: Vocabulary Card */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Box sx={{ 
            flex: 1,
            bgcolor: 'white', 
            borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '24px'), 
            p: is960 ? 2 : (is1920x1125 ? 3 : 3), 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            minHeight: 0,
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            {/* Title and HSK Tag */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2) }}>
              <Typography sx={{ 
                fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.25rem' : '1.125rem'), 
                fontWeight: 900, 
                color: '#1F2937'
              }}>
                Vocabulary Card
              </Typography>
              <Box sx={{ 
                px: is960 ? 1 : (is1920x1125 ? 1.5 : 1.5), 
                py: is960 ? 0.4 : (is1920x1125 ? 0.5 : 0.5), 
                bgcolor: '#00B4A0', 
                color: 'white', 
                borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'),
                fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.875rem' : '0.75rem'),
                fontWeight: 900
              }}>
                HSK {hskLevel}
              </Box>
            </Box>

            {/* Pinyin with Dotted Lines */}
            <Box sx={{ 
              display: 'flex', 
              gap: is960 ? 1.5 : (is1920x1125 ? 2 : 2),
              mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2),
              flexWrap: 'wrap'
            }}>
              {pinyinSyllables.map((syllable, idx) => (
                <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                  <Typography sx={{ 
                    fontWeight: 700, 
                    color: '#1F2937', 
                    fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem')
                  }}>
                    {syllable}
                  </Typography>
                  <Box sx={{
                    position: 'absolute',
                    bottom: is960 ? -4 : (is1920x1125 ? -6 : -5),
                    left: 0,
                    right: 0,
                    height: '1px',
                    borderBottom: '1px dashed #D1D5DB'
                  }} />
                </Box>
              ))}
            </Box>

            {/* Character Cards - Orange Background with Grid */}
            {(isCharacter || isPhrase) ? (
              <Box sx={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2),
                minHeight: 0
              }}>
                <Box sx={{ display: 'flex', gap: is960 ? 1 : (is1920x1125 ? 1.5 : 1.5), flexWrap: 'wrap', justifyContent: 'center' }}>
                  {currentCard.content.split('').map((char, idx) => (
                    <Box key={idx} sx={{
                      width: is960 ? (isCharacter ? 100 : 80) : (is1920x1125 ? 160 : (isCharacter ? 140 : 110)),
                      height: is960 ? (isCharacter ? 100 : 80) : (is1920x1125 ? 160 : (isCharacter ? 140 : 110)),
                      border: is960 ? '2px solid #FFB74D' : (is1920x1125 ? '3px solid #FFB74D' : '2px solid #FFB74D'),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'),
                      position: 'relative',
                      bgcolor: '#FFF3E0',
                      backgroundImage: `
                        linear-gradient(to right, #FFE0B2 1px, transparent 1px),
                        linear-gradient(to bottom, #FFE0B2 1px, transparent 1px)
                      `,
                      backgroundSize: is960 ? '20px 20px' : (is1920x1125 ? '24px 24px' : '22px 22px'),
                      backgroundPosition: 'center'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1F2937',
                        fontSize: is960 ? (isCharacter ? '3.5rem' : '2.5rem') : (is1920x1125 ? (isCharacter ? '5.5rem' : '4rem') : (isCharacter ? '5rem' : '3.5rem')),
                        fontWeight: 900,
                        zIndex: 1
                      }}>
                        {char}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 2) }}>
                <Typography sx={{ 
                  fontWeight: 900, 
                  color: '#1F2937', 
                  fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.5rem' : '2rem'), 
                  lineHeight: 1.3,
                  textAlign: 'center'
                }}>
                  {currentCard.content}
                </Typography>
              </Box>
            )}

            {/* Audio Button */}
            <ButtonBase
              onClick={() => {/* Play audio */}}
              sx={{
                width: is960 ? 48 : (is1920x1125 ? 72 : 64),
                height: is960 ? 48 : (is1920x1125 ? 72 : 64),
                borderRadius: '50%',
                bgcolor: '#FF6B35',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
                '&:active': { transform: 'scale(0.95)', bgcolor: '#E55A2B' }
              }}
            >
              <VolumeUpIcon sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 36 : 32) }} />
            </ButtonBase>
          </Box>
        </Grid>
      </Grid>

      {/* Bottom Navigation Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mt: is960 ? 1.5 : (is1920x1125 ? 2 : 2),
        pt: is960 ? 1.5 : (is1920x1125 ? 2 : 2),
        flexShrink: 0
      }}>
        <ButtonBase
          onClick={prev}
          disabled={currentIndex === 0}
          sx={{
            px: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
            py: is960 ? 1 : (is1920x1125 ? 1.25 : 1.125),
            borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
            bgcolor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === 0 ? 0.5 : 1,
            '&:active': currentIndex === 0 ? {} : { bgcolor: '#E5E7EB', transform: 'scale(0.95)' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 24 : 24), color: '#1F2937' }} />
        </ButtonBase>
        
        <ButtonBase
          onClick={next}
          sx={{
            px: is960 ? 3 : (is1920x1125 ? 4 : 4),
            py: is960 ? 1 : (is1920x1125 ? 1.25 : 1.25),
            bgcolor: '#00B4A0',
            color: 'white',
            borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'),
            fontWeight: 900,
            fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.25rem' : '1.125rem'),
            display: 'flex',
            alignItems: 'center',
            gap: is960 ? 0.5 : (is1920x1125 ? 1 : 1),
            boxShadow: '0 4px 12px rgba(0,180,160,0.3)',
            '&:active': { bgcolor: '#009688', transform: 'scale(0.98)' }
          }}
        >
          {isLast ? 'Start Practice' : 'Next'}
          <ChevronRightIcon sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 24) }} />
        </ButtonBase>
      </Box>
    </Box>
  )
}

