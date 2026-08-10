import { useState } from 'react'
import { Box, Typography, IconButton, Button, ButtonBase, Grid, LinearProgress, Paper, TextField } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import MicIcon from '@mui/icons-material/Mic'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Unit, ExerciseType } from '../../types/lesson'
import FeedbackEntryButton from '../feedback/FeedbackEntryButton'

interface Props {
  unit: Unit
  onComplete: () => void
  onExit: () => void
}

export default function ExerciseStage({ unit, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [userInput, setUserInput] = useState('') // 用于T01图片填空
  const [isChecked, setIsChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({}) // 跟踪图片加载错误

  // 获取图片加载失败时的emoji兜底
  const getImageFallbackEmoji = (imageUrl: string, chineseText?: string): string => {
    // 检查是否与米饭相关
    if (imageUrl.includes('rice') || imageUrl.includes('米饭') || chineseText?.includes('米饭') || chineseText?.includes('饭')) {
      return '🍚'
    }
    // 可以根据需要添加更多映射
    return '🍚' // 默认使用米饭emoji
  }

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // Safety check: ensure questions exist and currentIndex is valid
  if (!unit.questions || unit.questions.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
        <Typography sx={{ color: '#636E72', fontSize: '1rem' }}>No questions available</Typography>
      </Box>
    )
  }

  const currentQuestion = unit.questions[currentIndex]
  const progress = ((currentIndex + 1) / unit.questions.length) * 100

  // Safety check: ensure currentQuestion exists
  if (!currentQuestion) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
        <Typography sx={{ color: '#636E72', fontSize: '1rem' }}>Question not found</Typography>
      </Box>
    )
  }

  const handleCheck = () => {
    let correct = false
    let userAnswer: string | string[] = ''
    
    if (currentQuestion.type === ExerciseType.S01_SPEAKING) {
      // Rule 6: Speech evaluation occurs at the end of the session, not per sentence.
      // We simulate immediate success for the flow but the actual scoring happens in the report.
      correct = true
      userAnswer = 'simulate_success'
    } else if (currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN) {
      // T01: 图片填空 - 使用用户输入的文本
      userAnswer = userInput.trim().toLowerCase()
      correct = userAnswer === String(currentQuestion.correctAnswer).toLowerCase()
    } else {
      userAnswer = selectedOption || ''
      correct = Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.includes(userAnswer)
        : userAnswer === currentQuestion.correctAnswer
    }
    
    // Save result to localStorage
    localStorage.setItem(`question_${currentQuestion.id}_result`, JSON.stringify({
      userAnswer,
      isCorrect: correct
    }))
    
    setIsCorrect(correct)
    setIsChecked(true)
  }

  const handlePlayAudio = () => {
    if (currentQuestion.audioUrl) {
      setIsPlayingAudio(true)
      const audio = new Audio(currentQuestion.audioUrl)
      audio.play()
      audio.onended = () => setIsPlayingAudio(false)
      audio.onerror = () => setIsPlayingAudio(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < unit.questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setUserInput('')
      setIsChecked(false)
      setIsCorrect(false)
      setIsPlayingAudio(false)
      setImageError({}) // 重置图片错误状态
    } else {
      onComplete()
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <Box sx={{ p: is960 ? 2 : (is1920x1125 ? 3 : 2.5), bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxSizing: 'border-box' }}>
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
        <Box sx={{ flex: 1, mx: is960 ? 2 : (is1920x1125 ? 4 : 3), maxWidth: is960 ? 400 : (is1920x1125 ? 600 : 500) }}>
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.95rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), mb: is960 ? 0.75 : (is1920x1125 ? 1 : 1) }}>
            Reinforcement Practice
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: is960 ? 6 : (is1920x1125 ? 8 : 8), 
              borderRadius: '4px', 
              bgcolor: '#E5E7EB', 
              '& .MuiLinearProgress-bar': { bgcolor: '#00B4A0', borderRadius: '4px' } 
            }} 
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.95rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), minWidth: is960 ? 40 : (is1920x1125 ? 60 : 48), textAlign: 'right' }}>
            {Math.round(progress)}%
          </Typography>
          <FeedbackEntryButton is960={is960} context={{ screen: 'exercise', unitId: unit.id }} />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: is960 ? 2 : (is1920x1125 ? 4 : 3), display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }}>
        {/* Title Section */}
        <Box sx={{ textAlign: 'center', mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5), flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F2937', mb: is960 ? 0.75 : (is1920x1125 ? 1 : 1), fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.75rem') }}>
            {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && "Listening Comprehension"}
            {currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN && "Picture Fill-in"}
            {currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT && "Image Comprehension"}
            {currentQuestion.type === ExerciseType.T03_LISTEN_SELECT_SENTENCE && "Listen & Select Sentence"}
            {currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT && "Vocabulary Selection"}
            {currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT && "Grammar Selection"}
            {currentQuestion.type === ExerciseType.L01_LISTEN_SELECT && "Visual Recognition"}
            {currentQuestion.type === ExerciseType.S01_SPEAKING && "Oral Proficiency"}
            {currentQuestion.type === ExerciseType.L02_LISTEN_TEXT && "Contextual Logic"}
          </Typography>
          <Typography sx={{ color: '#636E72', fontWeight: 500, fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'), lineHeight: 1.4 }}>
            {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE ? "Listen and select the correct image" : 
             currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT ? "Look at image, select correct character" :
             currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT ? "选择正确的英文翻译" :
             currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT ? "选择正确的中文翻译" :
             (currentQuestion.prompt || '')}
          </Typography>
        </Box>

        {/* Options Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, px: 2, pt: 2, pb: 2, overflow: 'auto' }}>
          {/* T00: 听音选图 - 有播放按钮，然后显示图片选项 */}
          {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && (
            <Box sx={{ width: '100%', maxWidth: is960 ? 600 : (is1920x1125 ? 1200 : 1000), textAlign: 'center', mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
              <ButtonBase
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                sx={{
                  width: is960 ? 64 : (is1920x1125 ? 96 : 80),
                  height: is960 ? 64 : (is1920x1125 ? 96 : 80),
                  bgcolor: '#FF6B35',
                  color: 'white',
                  mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                  borderRadius: '50%',
                  alignSelf: 'center',
                  boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
                  '&:active': { transform: 'scale(0.95)', bgcolor: '#E55A2B' },
                  '&:disabled': { bgcolor: '#9CA3AF', opacity: 0.6 }
                }}
              >
                <VolumeUpIcon sx={{ fontSize: is960 ? 32 : (is1920x1125 ? 48 : 40) }} />
              </ButtonBase>
              <Box sx={{ display: 'flex', gap: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', px: is960 ? 1 : (is1920x1125 ? 2 : 1.5), width: '100%' }}>
                {currentQuestion.imageUrls?.map((url, idx) => {
                  const opt = currentQuestion.options?.[idx] || ''
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  const labels = ['A', 'B', 'C', 'D']
                  if (!opt) return null
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        flex: '1 1 0',
                        minWidth: is960 ? 120 : (is1920x1125 ? 200 : 160),
                        maxWidth: is960 ? 140 : (is1920x1125 ? 240 : 200),
                        aspectRatio: '1',
                        p: 0,
                        overflow: 'hidden',
                        borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                        border: (isAnswer || isSelected) ? (is960 ? '3px solid' : (is1920x1125 ? '4px solid' : '3px solid')) : 'none',
                        borderColor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : 'transparent'),
                        cursor: isChecked ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 8px 20px rgba(0,180,160,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {},
                        bgcolor: 'white',
                        position: 'relative',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Letter Label - Top Left */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: is960 ? 8 : (is1920x1125 ? 12 : 10),
                        left: is960 ? 8 : (is1920x1125 ? 12 : 10),
                        width: is960 ? 32 : (is1920x1125 ? 40 : 36),
                        height: is960 ? 32 : (is1920x1125 ? 40 : 36),
                        borderRadius: '50%', 
                        bgcolor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : '#F3F4F6'),
                        color: (isAnswer || isSelected) ? 'white' : '#1F2937',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'),
                        zIndex: 1
                      }}>
                        {labels[idx]}
                      </Box>
                      {url.match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                        <Box sx={{ 
                          fontSize: is960 ? '60px' : (is1920x1125 ? '100px' : '80px'), 
                          lineHeight: 1, 
                          p: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {url}
                        </Box>
                      ) : (
                        <Box 
                          component="img" 
                          src={url} 
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            display: 'block'
                          }} 
                        />
                      )}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* T01: 图片填空 - 显示图片emoji，然后有选项选择器 */}
          {currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN && (
            <Box sx={{ width: '100%', maxWidth: 600, textAlign: 'center', mx: 'auto' }}>
              <Typography sx={{ fontSize: '140px', lineHeight: 1, mb: 4 }}>{currentQuestion.imageEmoji}</Typography>
              
              {/* 答案显示区域（类似输入框） */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  minHeight: 80,
                  mb: 3,
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '8px solid',
                  borderColor: userInput ? '#00B4A0' : '#E0E0E0',
                  borderRadius: 0,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {userInput ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600, fontFamily: 'monospace' }}>
                      {userInput === '米' ? 'mǐ' : userInput === '水' ? 'shuǐ' : userInput === '饺' ? 'jiǎo' : userInput === '茶' ? 'chá' : ''}
                    </Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#1F2937' }}>{userInput}</Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '1.25rem', color: '#9CA3AF', fontWeight: 500 }}>点击下方选项</Typography>
                )}
              </Box>

              {/* 选项按钮 */}
              <Grid container spacing={1.5} sx={{ maxWidth: 500, mx: 'auto' }}>
                {['米', '水', '饺', '茶'].map((opt, idx) => {
                  const pinyinMap: { [key: string]: string } = {
                    '米': 'mǐ',
                    '水': 'shuǐ',
                    '饺': 'jiǎo',
                    '茶': 'chá'
                  }
                  const pinyin = pinyinMap[opt]
                  const isSelected = userInput === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  
                  return (
                    <Grid item xs={6} key={idx}>
                      <Paper
                        component="button"
                        onClick={() => {
                          if (!isChecked) {
                            setUserInput(opt)
                          }
                        }}
                        sx={{
                          width: '100%',
                          p: 1.5,
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: isAnswer ? '#4CAF50' : isSelected ? '#00B4A0' : '#E5E7EB',
                          cursor: isChecked ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          boxShadow: isSelected ? '0 6px 16px rgba(0,180,160,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                          bgcolor: isSelected ? '#F0FDFA' : 'white',
                          transition: 'all 0.2s',
                          '&:active': !isChecked ? { transform: 'scale(0.95)' } : {}
                        }}
                      >
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, fontFamily: 'monospace' }}>{pinyin}</Typography>
                        <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem', lineHeight: 1 }}>{opt}</Typography>
                        {isAnswer && (
                          <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
                            <CheckIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* T02: 图片选择文字 - 显示中央图片，然后显示4个水平排列的选项 */}
          {currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT && (
            <Box sx={{ width: '100%', maxWidth: is960 ? 600 : (is1920x1125 ? 1200 : 1000), mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0, overflowY: 'auto', py: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
              {/* 中央图片 */}
              {currentQuestion.imageUrls && currentQuestion.imageUrls[0] && (
                <Box sx={{ textAlign: 'center', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.5), flexShrink: 0 }}>
                  {currentQuestion.imageUrls[0].match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                    <Box sx={{ fontSize: is960 ? '80px' : (is1920x1125 ? '120px' : '100px'), lineHeight: 1, display: 'inline-block' }}>
                      {currentQuestion.imageUrls[0]}
                    </Box>
                  ) : imageError[currentQuestion.imageUrls[0]] ? (
                    // 图片加载失败，显示emoji兜底
                    <Box sx={{ 
                      fontSize: is960 ? '80px' : (is1920x1125 ? '120px' : '100px'), 
                      lineHeight: 1, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: is960 ? 150 : (is1920x1125 ? 200 : 180),
                      height: is960 ? 150 : (is1920x1125 ? 200 : 180),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: '#F9FAFB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      mx: 'auto'
                    }}>
                      {getImageFallbackEmoji(currentQuestion.imageUrls[0], currentQuestion.chineseText)}
                    </Box>
                  ) : (
                    <Box 
                      component="img" 
                      src={currentQuestion.imageUrls[0]} 
                      onError={() => {
                        setImageError(prev => ({ ...prev, [currentQuestion.imageUrls![0]]: true }))
                      }}
                      sx={{ 
                        width: is960 ? 150 : (is1920x1125 ? 200 : 180), 
                        height: is960 ? 150 : (is1920x1125 ? 200 : 180), 
                        objectFit: 'contain',
                        borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                        mx: 'auto',
                        display: 'block',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                  )}
                </Box>
              )}
              
              {/* 选择框 - 选择前显示正确答案，选择后显示选中的选项 */}
              <Box sx={{ 
                textAlign: 'center', 
                mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.5), 
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.375)
              }}>
                {(() => {
                  // 选择前显示正确答案，选择后显示选中的选项
                  const raw = selectedOption || currentQuestion.correctAnswer
                  const displayOption: string = Array.isArray(raw) ? (raw[0] ?? '') : raw
                  
                  // 解析显示内容的格式
                  let displayPinyin: string = ''
                  let displayText: string = ''
                  
                  if (displayOption.includes(' ')) {
                    const parts = displayOption.split(' ')
                    displayText = parts[0]
                    displayPinyin = parts[1] || ''
                  } else {
                    displayText = displayOption
                    const pinyinMap: { [key: string]: string } = {
                      '米': 'mǐ', '饺': 'jiǎo', '水': 'shuǐ', '茶': 'chá',
                      '这': 'zhè', '是': 'shì', '不': 'bù', '我': 'wǒ',
                      '叫': 'jiào', '吃': 'chī', '喝': 'hē', '有': 'yǒu',
                      '饭': 'fàn', '谁': 'shéi'
                    }
                    displayPinyin = pinyinMap[displayOption] || displayOption
                  }
                  
                  return (
                    <Box sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: 'white',
                      px: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                      py: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.375),
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      minHeight: is960 ? 60 : (is1920x1125 ? 80 : 70)
                    }}>
                      <Typography sx={{ 
                        fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                        color: '#636E72', 
                        fontWeight: 600, 
                        fontFamily: 'monospace',
                        lineHeight: 1
                      }}>
                        {displayPinyin}
                      </Typography>
                      <Typography sx={{ 
                        fontWeight: 800, 
                        color: '#1F2937', 
                        fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
                        lineHeight: 1 
                      }}>
                        {displayText}
                      </Typography>
                    </Box>
                  )
                })()}
              </Box>
              
              {/* 提示文字 */}
              <Typography sx={{ 
                textAlign: 'center', 
                color: '#9CA3AF', 
                fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'),
                fontWeight: 500,
                mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.5),
                flexShrink: 0
              }}>
                Tap an option below
              </Typography>
              
              {/* 显示文字选项 - 水平排列，一行4个 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: is960 ? 1 : (is1920x1125 ? 2 : 1.5), flexWrap: 'wrap', width: '100%', px: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  
                  // 解析选项格式：可能是"包子 bāozi 包子"或单个汉字"米"
                  let displayPinyin: string = ''
                  let displayText: string = ''
                  
                  if (opt.includes(' ')) {
                    // 格式：汉字 拼音 汉字，例如"包子 bāozi 包子"
                    const parts = opt.split(' ')
                    displayText = parts[0] // 第一个汉字
                    displayPinyin = parts[1] || '' // 拼音
                  } else {
                    // 单个汉字，例如"米"
                    displayText = opt
                    // 拼音映射
                    const pinyinMap: { [key: string]: string } = {
                      '米': 'mǐ', '饺': 'jiǎo', '水': 'shuǐ', '茶': 'chá',
                      '这': 'zhè', '是': 'shì', '不': 'bù', '我': 'wǒ',
                      '叫': 'jiào', '吃': 'chī', '喝': 'hē', '有': 'yǒu',
                      '饭': 'fàn', '谁': 'shéi'
                    }
                    displayPinyin = pinyinMap[opt] || opt
                  }
                  
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        flex: '1 1 0',
                        minWidth: is960 ? 100 : (is1920x1125 ? 180 : 140),
                        maxWidth: is960 ? 120 : (is1920x1125 ? 220 : 180),
                        p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                        borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                        border: '1px solid',
                        borderColor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : '#E5E7EB'),
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5),
                        boxShadow: isSelected ? '0 4px 12px rgba(0,180,160,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        minHeight: is960 ? 80 : (is1920x1125 ? 120 : 100),
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                      }}
                    >
                      {/* 如果被选中，显示空白；否则显示完整内容 */}
                      {isSelected ? (
                        // 空白按钮
                        <Box sx={{ width: '100%', height: '100%' }} />
                      ) : (
                        <>
                          {/* 拼音 */}
                          <Typography sx={{ 
                            fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                            color: '#636E72', 
                            fontWeight: 600, 
                            fontFamily: 'monospace',
                            lineHeight: 1
                          }}>
                            {displayPinyin}
                          </Typography>
                          {/* 汉字 */}
                          <Typography sx={{ 
                            fontWeight: 800, 
                            color: '#1F2937', 
                            fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.25rem' : '1.875rem'), 
                            lineHeight: 1 
                          }}>
                            {displayText}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* T03: 听力选择句子 - 有播放按钮，然后显示文本选项 */}
          {currentQuestion.type === ExerciseType.T03_LISTEN_SELECT_SENTENCE && (
            <Box sx={{ width: '100%', maxWidth: 900 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <IconButton
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#4F46E5',
                    color: 'white',
                    mb: 2,
                    borderRadius: '20px',
                    '&:active': { transform: 'scale(0.95)' },
                    '&:disabled': { bgcolor: '#9CA3AF' }
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography sx={{ color: '#4F46E5', fontWeight: 700, fontSize: '1rem' }}>听句子</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        width: '100%',
                        p: 2.5,
                        borderRadius: '16px',
                        textAlign: 'left',
                        border: '3px solid',
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#00B4A0' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: isSelected ? '0 8px 20px rgba(0,180,160,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                      {isAnswer && <CheckIcon sx={{ color: '#4CAF50', fontSize: 32 }} />}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* T04: 词意选择 - 显示英文+中文+拼音，然后显示英文选项（一行4个） */}
          {currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT && (
            <Box sx={{ width: '100%', maxWidth: is960 ? 600 : (is1920x1125 ? 1200 : 1000), mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0, overflowY: 'auto', py: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
              {/* 中央图片 */}
              {currentQuestion.imageUrls && currentQuestion.imageUrls[0] && (
                <Box sx={{ textAlign: 'center', mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5), flexShrink: 0 }}>
                  {currentQuestion.imageUrls[0].match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                    <Box sx={{ fontSize: is960 ? '100px' : (is1920x1125 ? '150px' : '120px'), lineHeight: 1, display: 'inline-block' }}>
                      {currentQuestion.imageUrls[0]}
                    </Box>
                  ) : imageError[currentQuestion.imageUrls[0]] ? (
                    // 图片加载失败，显示emoji兜底
                    <Box sx={{ 
                      fontSize: is960 ? '100px' : (is1920x1125 ? '150px' : '120px'), 
                      lineHeight: 1, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: is960 ? 150 : (is1920x1125 ? 200 : 180),
                      height: is960 ? 150 : (is1920x1125 ? 200 : 180),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: '#F9FAFB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      mx: 'auto'
                    }}>
                      {getImageFallbackEmoji(currentQuestion.imageUrls[0], currentQuestion.chineseText)}
                    </Box>
                  ) : (
                    <Box 
                      component="img" 
                      src={currentQuestion.imageUrls[0]} 
                      onError={() => {
                        setImageError(prev => ({ ...prev, [currentQuestion.imageUrls![0]]: true }))
                      }}
                      sx={{ 
                        width: is960 ? 150 : (is1920x1125 ? 200 : 180), 
                        height: is960 ? 150 : (is1920x1125 ? 200 : 180), 
                        objectFit: 'contain',
                        borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                        mx: 'auto',
                        display: 'block',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                  )}
                </Box>
              )}
              
              {/* 拼音、汉字和音频按钮 */}
              {(currentQuestion.pinyin || currentQuestion.chineseText) && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                  mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                  flexShrink: 0
                }}>
                  {/* 音频按钮 */}
                  <IconButton
                    onClick={() => {
                      if (currentQuestion.chineseText) {
                        const utterance = new SpeechSynthesisUtterance(currentQuestion.chineseText)
                        utterance.lang = 'zh-CN'
                        utterance.rate = 0.8
                        speechSynthesis.speak(utterance)
                        setIsPlayingAudio(true)
                        utterance.onend = () => setIsPlayingAudio(false)
                        utterance.onerror = () => setIsPlayingAudio(false)
                      }
                    }}
                    disabled={isPlayingAudio}
                    sx={{
                      width: is960 ? 40 : (is1920x1125 ? 56 : 48),
                      height: is960 ? 40 : (is1920x1125 ? 56 : 48),
                      bgcolor: '#FF9800',
                      color: 'white',
                      borderRadius: '50%',
                      flexShrink: 0,
                      '&:active': { transform: 'scale(0.95)' },
                      '&:disabled': { bgcolor: '#9CA3AF', opacity: 0.6 }
                    }}
                  >
                    <VolumeUpIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
                  </IconButton>
                  
                  {/* 拼音和汉字 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.375) }}>
                    {currentQuestion.pinyin && (
                      <Typography sx={{ 
                        fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'), 
                        color: '#636E72', 
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        lineHeight: 1
                      }}>
                        {currentQuestion.pinyin}
                      </Typography>
                    )}
                    {currentQuestion.chineseText && (
                      <Typography sx={{ 
                        fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2rem' : '1.75rem'), 
                        fontWeight: 800, 
                        color: '#1F2937',
                        lineHeight: 1
                      }}>
                        {currentQuestion.chineseText}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* 选项 - 水平排列，带A/B/C/D标签 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: is960 ? 1 : (is1920x1125 ? 2 : 1.5), 
                flexWrap: 'wrap', 
                width: '100%', 
                px: is960 ? 1 : (is1920x1125 ? 2 : 1.5),
                flexShrink: 0
              }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  const labels = ['A', 'B', 'C', 'D']
                  
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        flex: '1 1 0',
                        minWidth: is960 ? 100 : (is1920x1125 ? 180 : 140),
                        maxWidth: is960 ? 120 : (is1920x1125 ? 220 : 180),
                        p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                        borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                        border: '1px solid',
                        borderColor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : '#E5E7EB'),
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5),
                        boxShadow: isSelected ? '0 4px 12px rgba(0,180,160,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        position: 'relative',
                        minHeight: is960 ? 80 : (is1920x1125 ? 100 : 90),
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                      }}
                    >
                      {/* A/B/C/D 标签 */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: is960 ? 6 : (is1920x1125 ? 8 : 7), 
                        left: is960 ? 8 : (is1920x1125 ? 12 : 10), 
                        width: is960 ? 20 : (is1920x1125 ? 28 : 24), 
                        height: is960 ? 20 : (is1920x1125 ? 28 : 24), 
                        borderRadius: '50%', 
                        bgcolor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : '#E5E7EB'),
                        color: isAnswer || isSelected ? 'white' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.875rem' : '0.75rem'),
                        flexShrink: 0
                      }}>
                        {labels[idx]}
                      </Box>
                      
                      {/* 选项文本 */}
                      <Typography sx={{ 
                        fontWeight: 600, 
                        color: '#1F2937', 
                        fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'), 
                        textAlign: 'center',
                        mt: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75)
                      }}>
                        {opt}
                      </Typography>
                      
                      {/* 正确答案标记 */}
                      {isAnswer && (
                        <Box sx={{ position: 'absolute', bottom: is960 ? 6 : (is1920x1125 ? 8 : 7), right: is960 ? 8 : (is1920x1125 ? 12 : 10) }}>
                          <CheckIcon sx={{ color: '#4CAF50', fontSize: is960 ? 16 : (is1920x1125 ? 20 : 18) }} />
                        </Box>
                      )}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* T05: 语法选择 - 显示英文句子，然后显示中文选项 */}
          {currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT && (
            <Box sx={{ width: '100%', maxWidth: is960 ? 600 : (is1920x1125 ? 1200 : 1000), mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0, overflowY: 'auto', py: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
              {/* 英文文本 - 橙色大字体 */}
              {currentQuestion.englishText && (
                <Box sx={{ textAlign: 'center', mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5), flexShrink: 0 }}>
                  <Typography sx={{ 
                    fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.5rem' : '2rem'), 
                    fontWeight: 900, 
                    color: '#FF9800', 
                    lineHeight: 1.2
                  }}>
                    {currentQuestion.englishText}
                  </Typography>
                </Box>
              )}
              
              {/* 选项 - 2x2网格布局 */}
              <Grid container spacing={is960 ? 1.5 : (is1920x1125 ? 2.5 : 2)} sx={{ flexShrink: 0 }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  
                  // 拼音映射
                  const pinyinMap: { [key: string]: string } = {
                    '我': 'wǒ', '吃': 'chī', '米饭': 'mǐfàn', '这是': 'zhè shì', '有': 'yǒu',
                    '好吃': 'hǎo chī', '。': ''
                  }
                  
                  // 生成拼音
                  const generatePinyin = (text: string): string => {
                    // 处理常见句子
                    if (text.includes('我吃米饭')) return 'Wǒ chī mǐfàn.'
                    if (text.includes('这是米饭')) return 'Zhè shì mǐfàn.'
                    if (text.includes('我有米饭')) return 'Wǒ yǒu mǐfàn.'
                    if (text.includes('米饭好吃')) return 'Mǐfàn hǎo chī.'
                    
                    let result = ''
                    let remainingText = text.replace(/[。，！？]/g, '')
                    while (remainingText.length > 0) {
                      let matched = false
                      for (let len = Math.min(remainingText.length, 4); len > 0; len--) {
                        const substring = remainingText.substring(0, len)
                        if (pinyinMap[substring]) {
                          result += (result ? ' ' : '') + pinyinMap[substring]
                          remainingText = remainingText.substring(len)
                          matched = true
                          break
                        }
                      }
                      if (!matched) {
                        remainingText = remainingText.substring(1)
                      }
                    }
                    return result || text
                  }
                  
                  const pinyin = generatePinyin(opt)
                  
                  return (
                    <Grid item xs={6} key={idx}>
                      <Paper
                        component="button"
                        onClick={() => !isChecked && setSelectedOption(opt)}
                        sx={{
                          width: '100%',
                          p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                          borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                          textAlign: 'left',
                          border: '1px solid',
                          borderColor: isAnswer ? '#4CAF50' : (isSelected ? '#00B4A0' : '#E5E7EB'),
                          cursor: isChecked ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.625),
                          boxShadow: isSelected ? '0 4px 12px rgba(0,180,160,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                          bgcolor: isSelected ? '#F9FAFB' : 'white',
                          transition: 'all 0.2s',
                          position: 'relative',
                          minHeight: is960 ? 80 : (is1920x1125 ? 120 : 100),
                          '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                        }}
                      >
                        <Typography sx={{ 
                          fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                          color: '#6B7280', 
                          fontWeight: 600, 
                          fontFamily: 'monospace',
                          lineHeight: 1
                        }}>
                          {pinyin}
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 800, 
                          color: '#1F2937', 
                          fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), 
                          lineHeight: 1.3 
                        }}>
                          {opt}
                        </Typography>
                        {isAnswer && (
                          <Box sx={{ position: 'absolute', top: is960 ? 8 : (is1920x1125 ? 12 : 10), right: is960 ? 8 : (is1920x1125 ? 12 : 10) }}>
                            <CheckIcon sx={{ color: '#4CAF50', fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24), flexShrink: 0 }} />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* 保留原有题型支持 */}
          {currentQuestion.type === ExerciseType.L01_LISTEN_SELECT && (
            <Grid container spacing={3} sx={{ maxWidth: 900, width: '100%', px: 2, pt: 1 }}>
              {currentQuestion.imageUrls?.map((url, idx) => {
                const opt = currentQuestion.options?.[idx] || ''
                const isSelected = selectedOption === opt
                const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                if (!opt) return null
                return (
                  <Grid item xs={6} key={idx}>
                    <Paper
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        width: '100%', p: 0, overflow: 'hidden', borderRadius: '16px', border: '3px solid',
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#00B4A0' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 8px 20px rgba(0,180,160,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {},
                        bgcolor: 'white'
                      }}
                    >
                      <Box component="img" src={url} sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      <Box sx={{ p: 2, bgcolor: isSelected ? 'rgba(0, 180, 160, 0.05)' : 'white' }}>
                        <Typography sx={{ fontWeight: 800, color: isSelected ? '#00B4A0' : '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          )}

          {currentQuestion.type === ExerciseType.S01_SPEAKING && (
            <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              <Paper sx={{ p: 4, borderRadius: '20px', mb: 4, border: '2px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', bgcolor: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, color: '#1F2937', fontSize: '2rem' }}>{currentQuestion.pinyin}</Typography>
                <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '1.125rem' }}>"{currentQuestion.subPrompt}"</Typography>
              </Paper>
              <IconButton 
                onClick={() => setIsRecording(!isRecording)}
                sx={{ 
                  width: 100, height: 100, bgcolor: isRecording ? '#EF4444' : '#00B4A0', color: 'white',
                  '&:active': { bgcolor: isRecording ? '#DC2626' : '#009688', transform: 'scale(0.95)' },
                  boxShadow: isRecording ? '0 12px 30px rgba(239,68,68,0.3)' : '0 12px 30px rgba(0,180,160,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <MicIcon sx={{ fontSize: 48 }} />
              </IconButton>
              <Typography sx={{ mt: 1.5, fontWeight: 800, color: isRecording ? '#EF4444' : '#6B7280', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                {isRecording ? "Recording..." : "Tap to Record"}
              </Typography>
            </Box>
          )}

          {currentQuestion.type === ExerciseType.L02_LISTEN_TEXT && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 900 }}>
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt
                const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                return (
                  <Paper
                    key={idx}
                    component="button"
                    onClick={() => !isChecked && setSelectedOption(opt)}
                    sx={{
                      width: '100%', p: 2.5, borderRadius: '16px', textAlign: 'left', border: '3px solid',
                      borderColor: isAnswer ? '#4CAF50' : isSelected ? '#00B4A0' : '#E5E7EB',
                      cursor: isChecked ? 'default' : 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      boxShadow: isSelected ? '0 8px 20px rgba(0,180,160,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                      bgcolor: 'white',
                      transition: 'all 0.2s',
                      '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                    {isAnswer && <CheckIcon sx={{ color: '#4CAF50', fontSize: 32 }} />}
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: is960 ? 2 : (is1920x1125 ? 3 : 2.5), bgcolor: isChecked && isCorrect ? '#E8F5E9' : 'white', flexShrink: 0, boxSizing: 'border-box' }}>
        {isChecked ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), textAlign: 'center' }}>
            {/* Correct Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: is960 ? 0.75 : (is1920x1125 ? 1 : 1) }}>
              {isCorrect ? (
                <>
                  <CheckIcon sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 32 : 28), color: '#4CAF50' }} />
                  <Typography sx={{ fontWeight: 700, color: '#4CAF50', fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem') }}>
                    Correct
                  </Typography>
                </>
              ) : (
                <>
                  <CloseIcon sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 32 : 28), color: '#EF4444' }} />
                  <Typography sx={{ fontWeight: 700, color: '#EF4444', fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem') }}>
                    Review Goal
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Explanation Text */}
            {currentQuestion.explanation && (
              <Typography sx={{ 
                color: '#1F2937', 
                fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'),
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: is960 ? 500 : (is1920x1125 ? 800 : 700),
                mx: 'auto'
              }}>
                {currentQuestion.explanation}
              </Typography>
            )}
            
            {/* Continue Button */}
            <Button 
              variant="contained" 
              onClick={handleNext} 
              sx={{ 
                px: is960 ? 4 : (is1920x1125 ? 6 : 5), 
                py: is960 ? 1.25 : (is1920x1125 ? 1.5 : 1.5), 
                borderRadius: is960 ? '16px' : (is1920x1125 ? '20px' : '18px'), 
                fontWeight: 900, 
                fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'),
                bgcolor: isCorrect ? '#4CAF50' : '#EF4444', 
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                '&:active': { bgcolor: isCorrect ? '#388E3C' : '#DC2626', transform: 'scale(0.95)' },
                boxShadow: 'none',
                mt: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75)
              }}
            >
              CONTINUE
            </Button>
          </Box>
        ) : (
          <Button 
            fullWidth 
            variant="contained" 
            disabled={
              !selectedOption && 
              !isRecording && 
              currentQuestion.type !== ExerciseType.S01_SPEAKING &&
              (currentQuestion.type !== ExerciseType.T01_PICTURE_FILL_IN || !userInput.trim())
            }
            onClick={handleCheck}
            sx={{ 
              py: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75), 
              borderRadius: is960 ? '20px' : (is1920x1125 ? '24px' : '22px'), 
              fontWeight: 900, 
              fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'), 
              bgcolor: (selectedOption || isRecording || currentQuestion.type === ExerciseType.S01_SPEAKING || (currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN && userInput.trim())) ? '#00B4A0' : '#8EDBC8', 
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&:active': { bgcolor: '#009688', transform: 'scale(0.98)' },
              '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
              boxShadow: 'none'
            }}
          >
            {currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN ? 'CONFIRM SELECTION' : 'CONFIRM SELECTION'}
          </Button>
        )}
      </Box>
    </Box>
  )
}
