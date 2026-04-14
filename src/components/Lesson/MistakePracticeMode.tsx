import { useState, useEffect } from 'react';
import { Box, Typography, ButtonBase, Grid, LinearProgress, Paper, TextField, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Question, ExerciseType } from '../../types/lesson';

interface Props {
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | null;
    unitTitle: string;
  }>;
  onComplete: () => void;
  onExit: () => void;
}

export default function MistakePracticeMode({ wrongQuestions, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userInput, setUserInput] = useState(''); // 用于T01图片填空
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());

  const handlePlayAudio = () => {
    if (currentQuestion?.audioUrl) {
      setIsPlayingAudio(true);
      const audio = new Audio(currentQuestion.audioUrl);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    }
  };

  const currentResult = wrongQuestions[currentIndex];
  const currentQuestion = currentResult?.question;
  const progress = wrongQuestions.length > 0 ? ((currentIndex + 1) / wrongQuestions.length) * 100 : 0;

  useEffect(() => {
    // Reset state when question changes
    setSelectedOption(null);
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setIsPlayingAudio(false);
  }, [currentIndex]);

  const handleCheck = () => {
    if (!currentQuestion) return;
    
    let correct = false;
    let userAnswer: string | string[] = '';
    
    if (currentQuestion.type === ExerciseType.S01_SPEAKING) {
      correct = true; // Simulate success for speaking
      userAnswer = 'simulate_success';
    } else if (currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN) {
      // T01: 图片填空 - 使用用户输入的文本
      userAnswer = userInput.trim().toLowerCase();
      correct = userAnswer === String(currentQuestion.correctAnswer).toLowerCase();
    } else {
      userAnswer = selectedOption || '';
      correct = Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.includes(userAnswer)
        : userAnswer === currentQuestion.correctAnswer;
    }
    
    setIsCorrect(correct);
    setIsChecked(true);
    
    // Save result to localStorage
    localStorage.setItem(`question_${currentQuestion.id}_result`, JSON.stringify({
      userAnswer,
      isCorrect: correct
    }));
    
    // Mark as completed
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
  };

  const handleNext = () => {
    if (currentIndex < wrongQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All questions completed, go to review page
      onComplete();
    }
  };

  if (wrongQuestions.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F7F9F8' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#4CAF50', mb: 2 }}>
          🎉 太棒了！
        </Typography>
        <Typography sx={{ fontSize: '1rem', color: '#636E72', mb: 3 }}>
          没有错题需要练习
        </Typography>
        <ButtonBase
          onClick={onComplete}
          sx={{
            bgcolor: '#00B4A0',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 900,
            fontSize: '1rem',
            '&:active': { transform: 'scale(0.95)' }
          }}
        >
          查看全部题目
        </ButtonBase>
      </Box>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F7F9F8', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '2px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonBase onClick={onExit} sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>退出练习</Typography>
        </ButtonBase>
        <Box sx={{ flex: 1, mx: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#6B7280', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              错题练习 ({currentIndex + 1}/{wrongQuestions.length})
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#EF4444', fontSize: '0.875rem' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 10, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#EF4444' } }} />
        </Box>
        <Box sx={{ width: 100 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Title Section */}
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F2937', mb: 1, fontSize: '1.5rem' }}>
            {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && "听音选图"}
            {currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN && "选词填空"}
            {currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT && "词意选择"}
            {currentQuestion.type === ExerciseType.T03_LISTEN_SELECT_SENTENCE && "听力选择"}
            {currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT && "词汇选择"}
            {currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT && "语义选择"}
            {currentQuestion.type === ExerciseType.L01_LISTEN_SELECT && "Visual Recognition"}
            {currentQuestion.type === ExerciseType.S01_SPEAKING && "Oral Proficiency"}
            {currentQuestion.type === ExerciseType.L02_LISTEN_TEXT && "Contextual Logic"}
          </Typography>
          <Typography sx={{ color: '#6B7280', fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 }}>
            {currentQuestion.prompt}
          </Typography>
          {currentQuestion.subPrompt && (
            <Typography sx={{ color: '#636E72', fontWeight: 500, fontSize: '0.9rem', mt: 1 }}>
              {currentQuestion.subPrompt}
            </Typography>
          )}
        </Box>

        {/* Options Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, px: 2, pt: 2, pb: 2, overflow: 'auto' }}>
          {/* T00: 听音选图 */}
          {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && (
            <Box sx={{ width: '100%', maxWidth: 900, textAlign: 'center' }}>
              <IconButton
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#4F46E5',
                  color: 'white',
                  mb: 3,
                  borderRadius: '20px',
                  '&:active': { transform: 'scale(0.95)' },
                  '&:disabled': { bgcolor: '#9CA3AF' }
                }}
              >
                <VolumeUpIcon sx={{ fontSize: 40 }} />
              </IconButton>
              <Grid container spacing={2} sx={{ maxWidth: 700, width: '100%', mx: 'auto', px: 2 }}>
                {currentQuestion.imageUrls?.map((url, idx) => {
                  const opt = currentQuestion.options![idx]
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  const labels = ['A', 'B', 'C', 'D']
                  return (
                    <Grid item xs={6} key={idx}>
                      <Paper
                        component="button"
                        onClick={() => !isChecked && setSelectedOption(opt)}
                        sx={{
                          width: '100%',
                          p: 1.5,
                          overflow: 'hidden',
                          borderRadius: '16px',
                          border: '3px solid',
                          borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          cursor: isChecked ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 8px 20px rgba(239,68,68,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                          '&:active': !isChecked ? { transform: 'scale(0.95)' } : {},
                          bgcolor: 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '50%', 
                          bgcolor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          color: isAnswer || isSelected ? 'white' : '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          flexShrink: 0
                        }}>
                          {labels[idx]}
                        </Box>
                        {url.match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                          <Box sx={{ fontSize: '60px', lineHeight: 1 }}>
                            {url}
                          </Box>
                        ) : (
                          <Box component="img" src={url} sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '12px' }} />
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* T01: 图片填空 */}
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
                          borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          cursor: isChecked ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          boxShadow: isSelected ? '0 6px 16px rgba(239,68,68,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                          bgcolor: isSelected ? '#FEF2F2' : 'white',
                          transition: 'all 0.2s',
                          position: 'relative',
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
                        {isSelected && !isAnswer && (
                          <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
                            <CloseIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* T02: 词意选择 - 显示英文，然后显示4个并列方块选项（一行4个） */}
          {currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT && (
            <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
              {/* 显示英文 */}
              {currentQuestion.englishText && (
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937', bgcolor: 'white', px: 4, py: 2, borderRadius: '20px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {currentQuestion.englishText}
                  </Typography>
                </Box>
              )}
              {/* 如果没有英文，显示图片（向后兼容） */}
              {!currentQuestion.englishText && currentQuestion.imageUrls && currentQuestion.imageUrls[0] && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  {currentQuestion.imageUrls[0].match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                    <Box sx={{ fontSize: '70px', mb: 1, lineHeight: 1 }}>{currentQuestion.imageUrls[0]}</Box>
                  ) : (
                    <Box component="img" src={currentQuestion.imageUrls[0]} sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '16px', mb: 1, mx: 'auto' }} />
                  )}
                </Box>
              )}
              {/* 显示文字选项 - 一行4个，但可能只有3个选项 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', maxWidth: 900, mx: 'auto' }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  const labels = ['A', 'B', 'C', 'D']
                  const isThreeOptions = currentQuestion.options?.length === 3
                  
                  // 解析选项格式：可能是"包子 bāozi 包子"或单个汉字"米"
                  let displayImage: string | null = null
                  let displayPinyin: string = ''
                  let displayText: string = ''
                  
                  if (opt.includes(' ')) {
                    // 格式：汉字 拼音 汉字，例如"包子 bāozi 包子"
                    const parts = opt.split(' ')
                    displayText = parts[0] // 第一个汉字
                    displayPinyin = parts[1] || '' // 拼音
                    // 如果有对应的图片URL，使用它
                    if (currentQuestion.imageUrls && currentQuestion.imageUrls[idx]) {
                      displayImage = currentQuestion.imageUrls[idx]
                    }
                  } else {
                    // 单个汉字，例如"米"
                    displayText = opt
                    // 拼音映射
                    const pinyinMap: { [key: string]: string } = {
                      '米': 'mǐ', '饺': 'jiǎo', '水': 'shuǐ', '茶': 'chá',
                      '这': 'zhè', '是': 'shì', '不': 'bù', '我': 'wǒ',
                      '叫': 'jiào', '吃': 'chī', '喝': 'hē', '有': 'yǒu'
                    }
                    displayPinyin = pinyinMap[opt] || opt
                  }
                  
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        width: isThreeOptions ? 180 : 219,
                        aspectRatio: '1',
                        p: 1,
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        boxShadow: isSelected ? '0 6px 16px rgba(239,68,68,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        position: 'relative',
                        flexShrink: 0,
                        '&:active': !isChecked ? { transform: 'scale(0.95)' } : {}
                      }}
                    >
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          left: 4, 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          color: isAnswer || isSelected ? 'white' : '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          flexShrink: 0
                        }}>
                          {labels[idx]}
                        </Box>
                        {/* 图片 */}
                        {displayImage && (
                          <Box sx={{ mb: 0.5 }}>
                            {displayImage.match(/[\u{1F300}-\u{1F9FF}]/u) ? (
                              <Box sx={{ fontSize: '40px', lineHeight: 1 }}>{displayImage}</Box>
                            ) : (
                              <Box component="img" src={displayImage} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                            )}
                          </Box>
                        )}
                        {/* 拼音 */}
                        <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, fontFamily: 'monospace' }}>{displayPinyin}</Typography>
                        {/* 汉字 */}
                        <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.75rem', lineHeight: 1 }}>{displayText}</Typography>
                        {isAnswer && (
                          <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                            <CheckIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                          </Box>
                        )}
                        {isSelected && !isAnswer && (
                          <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                            <CloseIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                          </Box>
                        )}
                      </Paper>
                  )
                })}
                {/* 如果只有3个选项，添加一个空的占位符以预留第4个位置 */}
                {currentQuestion.options?.length === 3 && (
                  <Box sx={{ width: 180, aspectRatio: '1', flexShrink: 0 }} />
                )}
              </Box>
            </Box>
          )}

          {/* T03: 听力选择句子 */}
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
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: isSelected ? '0 8px 20px rgba(239,68,68,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                      {isAnswer && <CheckIcon sx={{ color: '#4CAF50', fontSize: 32 }} />}
                      {isSelected && !isAnswer && <CloseIcon sx={{ color: '#EF4444', fontSize: 32 }} />}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* T04: 词意选择 - 显示英文+中文+拼音，然后显示英文选项（一行4个） */}
          {currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT && (
            <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', py: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {/* 显示英文 */}
                {currentQuestion.englishText && (
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937', mb: 3, bgcolor: 'white', px: 4, py: 2, borderRadius: '20px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {currentQuestion.englishText}
                  </Typography>
                )}
                {/* 语音播放按钮 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5 }}>
                  <IconButton
                    onClick={() => {
                      if (currentQuestion.chineseText) {
                        // 使用Web Speech API播放中文
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
                      width: 64,
                      height: 64,
                      bgcolor: '#00B4A0',
                      color: 'white',
                      borderRadius: '16px',
                      '&:active': { transform: 'scale(0.95)' },
                      '&:disabled': { bgcolor: '#9CA3AF', opacity: 0.6 }
                    }}
                  >
                    <VolumeUpIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
                    <Typography sx={{ fontSize: '1rem', color: '#6B7280', fontWeight: 600 }}>
                      {currentQuestion.pinyin}
                    </Typography>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#1F2937' }}>
                      {currentQuestion.chineseText}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* 一行4个布局 */}
              <Grid container spacing={1}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  const isAnswer = isChecked && opt === currentQuestion.correctAnswer
                  const labels = ['A', 'B', 'C', 'D']
                  return (
                    <Grid item xs={3} key={idx}>
                      <Paper
                        component="button"
                        onClick={() => !isChecked && setSelectedOption(opt)}
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          p: 1,
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          cursor: isChecked ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          boxShadow: isSelected ? '0 6px 16px rgba(239,68,68,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                          bgcolor: 'white',
                          transition: 'all 0.2s',
                          position: 'relative',
                          '&:active': !isChecked ? { transform: 'scale(0.95)' } : {}
                        }}
                      >
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          left: 4, 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                          color: isAnswer || isSelected ? 'white' : '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          flexShrink: 0
                        }}>
                          {labels[idx]}
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.125rem', textAlign: 'center' }}>{opt}</Typography>
                        {isAnswer && (
                          <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                            <CheckIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                          </Box>
                        )}
                        {isSelected && !isAnswer && (
                          <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                            <CloseIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* T05: 语法选择 */}
          {currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT && (
            <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937', bgcolor: 'white', px: 3, py: 2, borderRadius: '20px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', lineHeight: 1.4 }}>
                  {currentQuestion.englishText}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    // 处理常见句子
                    if (text.includes('我吃米饭')) return 'Wǒ chī mǐfàn.'
                    if (text.includes('这是米饭')) return 'Zhè shì mǐfàn.'
                    if (text.includes('我有米饭')) return 'Wǒ yǒu mǐfàn.'
                    if (text.includes('米饭好吃')) return 'Mǐfàn hǎo chī.'
                    return result || text
                  }
                  const pinyin = generatePinyin(opt)
                  return (
                    <Paper
                      key={idx}
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        width: '100%',
                        p: 1.5,
                        borderRadius: '14px',
                        textAlign: 'left',
                        border: '2px solid',
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        boxShadow: isSelected ? '0 6px 16px rgba(239,68,68,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                        bgcolor: 'white',
                        transition: 'all 0.2s',
                        position: 'relative',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                      }}
                    >
                      <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600, fontFamily: 'monospace' }}>{pinyin}</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.125rem', lineHeight: 1.3 }}>{opt}</Typography>
                      {isAnswer && (
                        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                          <CheckIcon sx={{ color: '#4CAF50', fontSize: 24, flexShrink: 0 }} />
                        </Box>
                      )}
                      {isSelected && !isAnswer && (
                        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                          <CloseIcon sx={{ color: '#EF4444', fontSize: 24, flexShrink: 0 }} />
                        </Box>
                      )}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* 保留旧题型支持 */}
          {currentQuestion.type === ExerciseType.L01_LISTEN_SELECT && currentQuestion.imageUrls && (
            <Grid container spacing={2} sx={{ maxWidth: 900 }}>
              {currentQuestion.imageUrls.map((url, idx) => {
                const opt = currentQuestion.options![idx];
                const isSelected = selectedOption === opt;
                const isAnswer = isChecked && (Array.isArray(currentQuestion.correctAnswer) 
                  ? currentQuestion.correctAnswer.includes(opt)
                  : opt === currentQuestion.correctAnswer);
                return (
                  <Grid item xs={6} key={idx}>
                    <Paper
                      component="button"
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      sx={{
                        width: '100%', p: 0, overflow: 'hidden', borderRadius: '16px', border: '3px solid',
                        borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                        cursor: isChecked ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 8px 20px rgba(239,68,68,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                        '&:active': !isChecked ? { transform: 'scale(0.98)' } : {},
                        bgcolor: 'white'
                      }}
                    >
                      <Box component="img" src={url} sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      <Box sx={{ p: 2, bgcolor: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'white' }}>
                        <Typography sx={{ fontWeight: 800, color: isSelected ? '#EF4444' : '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {currentQuestion.type === ExerciseType.S01_SPEAKING && (
            <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              <Paper sx={{ p: 4, borderRadius: '20px', mb: 4, border: '2px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', bgcolor: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, color: '#1F2937', fontSize: '2rem' }}>{currentQuestion.pinyin}</Typography>
                <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '1.125rem' }}>"{currentQuestion.subPrompt}"</Typography>
              </Paper>
              <ButtonBase
                onClick={() => !isChecked && setSelectedOption('simulate_success')}
                disabled={isChecked}
                sx={{
                  width: 100, height: 100, bgcolor: '#00B4A0', color: 'white',
                  borderRadius: '50%',
                  '&:active': { bgcolor: '#009688', transform: 'scale(0.95)' },
                  boxShadow: '0 12px 30px rgba(0,180,160,0.3)',
                  transition: 'all 0.2s',
                  opacity: isChecked ? 0.6 : 1
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>开始录音</Typography>
              </ButtonBase>
            </Box>
          )}

          {currentQuestion.type === ExerciseType.L02_LISTEN_TEXT && currentQuestion.options && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 900 }}>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isAnswer = isChecked && (Array.isArray(currentQuestion.correctAnswer)
                  ? currentQuestion.correctAnswer.includes(opt)
                  : opt === currentQuestion.correctAnswer);
                return (
                  <Paper
                    key={idx}
                    component="button"
                    onClick={() => !isChecked && setSelectedOption(opt)}
                    sx={{
                      width: '100%', p: 2.5, borderRadius: '16px', textAlign: 'left', border: '3px solid',
                      borderColor: isAnswer ? '#4CAF50' : isSelected ? '#EF4444' : '#E5E7EB',
                      cursor: isChecked ? 'default' : 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      boxShadow: isSelected ? '0 8px 20px rgba(239,68,68,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                      bgcolor: 'white',
                      transition: 'all 0.2s',
                      '&:active': !isChecked ? { transform: 'scale(0.98)' } : {}
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem' }}>{opt}</Typography>
                    {isAnswer && <CheckIcon sx={{ color: '#4CAF50', fontSize: 32 }} />}
                    {isSelected && !isAnswer && <CloseIcon sx={{ color: '#EF4444', fontSize: 32 }} />}
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 3, borderTop: '4px solid #F3F4F6', bgcolor: 'white' }}>
        {isChecked ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: isCorrect ? '#4CAF50' : '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isCorrect ? <CheckIcon sx={{ fontSize: 32 }} /> : <CloseIcon sx={{ fontSize: 32 }} />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: isCorrect ? '#4CAF50' : '#EF4444', textTransform: 'uppercase', fontSize: '1rem', mb: 0.25 }}>
                  {isCorrect ? "正确！" : "再想想"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>{currentQuestion.explanation}</Typography>
              </Box>
            </Box>
            <ButtonBase
              onClick={handleNext}
              sx={{
                px: 4, py: 1.5, borderRadius: '14px', fontWeight: 900, fontSize: '1rem',
                bgcolor: isCorrect ? '#4CAF50' : '#EF4444',
                color: 'white',
                '&:active': { bgcolor: isCorrect ? '#388E3C' : '#DC2626', transform: 'scale(0.95)' },
                boxShadow: 'none',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {currentIndex < wrongQuestions.length - 1 ? '下一题' : '完成练习'}
              <ArrowForwardIcon />
            </ButtonBase>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonBase
              disabled={
                !selectedOption && 
                currentQuestion.type !== ExerciseType.S01_SPEAKING &&
                (currentQuestion.type !== ExerciseType.T01_PICTURE_FILL_IN || !userInput.trim())
              }
              onClick={handleCheck}
              sx={{
                px: 5, py: 2.5, borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem',
                bgcolor: '#EF4444', color: 'white',
                border: '4px solid #DC2626',
                '&:active': { bgcolor: '#DC2626', transform: 'scale(0.98)' },
                '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', border: '4px solid #D1D5DB' },
                boxShadow: 'none',
                minWidth: 180
              }}
            >
              {currentQuestion.type === ExerciseType.T01_PICTURE_FILL_IN ? '选项确认' : '确认答案'}
            </ButtonBase>
          </Box>
        )}
      </Box>
    </Box>
  );
}

