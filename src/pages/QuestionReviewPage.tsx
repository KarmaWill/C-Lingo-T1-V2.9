import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { CURRENT_LESSON } from '../mock/lessonData';
import { Question, ExerciseType } from '../types/lesson';

interface QuestionResult {
  question: Question;
  userAnswer: string | null;
  isCorrect: boolean;
  unitId: string;
  unitTitle: string;
  questionIndex: number;
}

export default function QuestionReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  // Get lesson data from location state or use CURRENT_LESSON as fallback
  const lesson = (location.state as any)?.lesson || CURRENT_LESSON;

  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Load all question results
    const allResults: QuestionResult[] = [];
    let globalIndex = 0;
    
    lesson.units.forEach(unit => {
      unit.questions.forEach(question => {
        const storedResult = localStorage.getItem(`question_${question.id}_result`);
        if (storedResult) {
          const result = JSON.parse(storedResult);
          allResults.push({
            question,
            userAnswer: result.userAnswer,
            isCorrect: result.isCorrect,
            unitId: unit.id,
            unitTitle: unit.title,
            questionIndex: globalIndex++
          });
        } else {
          // Include unanswered questions too
          allResults.push({
            question,
            userAnswer: null,
            isCorrect: false,
            unitId: unit.id,
            unitTitle: unit.title,
            questionIndex: globalIndex++
          });
        }
      });
    });
    
    setQuestionResults(allResults);
  }, [lesson]);

  const currentResult = questionResults[currentQuestionIndex];
  const currentQuestion = currentResult?.question;

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    // Will be set by useEffect
  };

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion) return;
    
    setSelectedOption(option);
    setShowExplanation(true);
    
    // Check if correct
    const isCorrect = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.includes(option)
      : option === currentQuestion.correctAnswer;
    
    // Save result
    localStorage.setItem(`question_${currentQuestion.id}_result`, JSON.stringify({
      userAnswer: option,
      isCorrect
    }));
    
    // Update state
    setQuestionResults(prev => prev.map((r, idx) => 
      idx === currentQuestionIndex 
        ? { ...r, userAnswer: option, isCorrect }
        : r
    ));
  };

  useEffect(() => {
    // Reset selection when question changes
    if (currentResult) {
      setSelectedOption(currentResult.userAnswer);
      setShowExplanation(currentResult.userAnswer !== null);
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
    }
  }, [currentQuestionIndex]);

  const handleBack = () => {
    navigate(-1);
  };

  const mistakesCount = questionResults.filter(r => !r.isCorrect && r.userAnswer !== null).length;

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#F7F9F8',
      position: 'relative'
    }}>
      {/* Top Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: is960 ? 1.5 : 2,
        bgcolor: 'white',
        borderBottom: '2px solid #E0E0E0',
        position: 'relative'
      }}>
        <ButtonBase
          onClick={handleBack}
          sx={{
            bgcolor: 'white', 
            color: '#636E72', 
            px: 2, 
            py: 1, 
            borderRadius: 1,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            border: '2px solid #E0E0E0', 
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>退出</Typography>
        </ButtonBase>

        <Box sx={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5 
        }}>
          <AssignmentIcon sx={{ fontSize: is960 ? 20 : 24, color: '#00B4A0' }} />
          <Typography sx={{ fontWeight: 900, color: '#2D3436', fontSize: is960 ? '0.9rem' : '1.125rem' }}>
            题目总览
          </Typography>
        </Box>

        <Box sx={{ width: 100 }} /> {/* Spacer to balance the layout */}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Question Board */}
        <Box sx={{ 
          width: is960 ? 180 : 240, 
          bgcolor: 'white', 
          borderRight: '2px solid #E0E0E0',
          p: 2,
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <Typography sx={{ 
            fontSize: is960 ? '0.7rem' : '0.75rem', 
            fontWeight: 900, 
            color: '#636E72',
            textTransform: 'uppercase',
            mb: 2
          }}>
            题目板 QUESTION BOARD
          </Typography>
          <Grid container spacing={1}>
            {questionResults.map((result, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const hasAnswer = result.userAnswer !== null;
              const isWrong = hasAnswer && !result.isCorrect;
              
              return (
                <Grid item xs={6} key={idx}>
                  <ButtonBase
                    onClick={() => handleQuestionSelect(idx)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 1,
                      bgcolor: isCurrent 
                        ? '#00B4A0' 
                        : isWrong 
                          ? '#FEE2E2' 
                          : hasAnswer 
                            ? '#D1FAE5' 
                            : '#F3F4F6',
                      color: isCurrent 
                        ? 'white' 
                        : isWrong 
                          ? '#EF4444' 
                          : hasAnswer 
                            ? '#4CAF50' 
                            : '#636E72',
                      border: isCurrent ? '3px solid #00B4A0' : '2px solid',
                      borderColor: isCurrent 
                        ? '#00B4A0' 
                        : isWrong 
                          ? '#EF4444' 
                          : hasAnswer 
                            ? '#4CAF50' 
                            : '#E0E0E0',
                      fontWeight: 900,
                      fontSize: is960 ? '0.9rem' : '1rem',
                      transition: 'all 0.2s',
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    {idx + 1}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Right Content - Question Detail */}
        <Box sx={{ flex: 1, overflow: 'auto', p: is960 ? 2 : 3 }}>
          {currentQuestion && (
            <Box>
              {/* Section Header */}
              <Typography sx={{ 
                fontSize: is960 ? '0.85rem' : '1rem', 
                fontWeight: 700, 
                color: '#636E72',
                mb: 2
              }}>
                阅读部分·任务{currentQuestionIndex + 1}
              </Typography>

              {/* Instruction */}
              <Typography sx={{ 
                fontSize: is960 ? '1rem' : '1.25rem', 
                fontWeight: 700, 
                color: '#2D3436',
                mb: 3
              }}>
                {currentQuestion.prompt}
              </Typography>

              {/* Question Content */}
              {currentQuestion.type === ExerciseType.L01_LISTEN_SELECT && currentQuestion.imageUrls && (
                <>
                  {/* Phrase Box */}
                  <Box sx={{ 
                    p: 3, 
                    mb: 3, 
                    border: '2px dashed #00B4A0', 
                    borderRadius: 2,
                    bgcolor: '#F0FDFA',
                    textAlign: 'center'
                  }}>
                    <Typography sx={{ 
                      fontSize: is960 ? '1.25rem' : '1.75rem', 
                      fontWeight: 900, 
                      color: '#2D3436',
                      mb: 1,
                      fontFamily: 'monospace'
                    }}>
                      {currentQuestion.pinyin || 'Tā de mèimei'}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '1rem' : '1.25rem', 
                      color: '#636E72',
                      fontWeight: 600
                    }}>
                      ({(() => {
                        // Try to find the phrase from learnings or use a default
                        const unit = lesson.units.find(u => u.questions.some(q => q.id === currentQuestion.id));
                        const learning = unit?.learnings.find(l => l.pinyin === currentQuestion.pinyin);
                        return learning?.content || '她的妹妹';
                      })()})
                    </Typography>
                  </Box>

                  {/* Image Options */}
                  <Grid container spacing={2}>
                    {currentQuestion.imageUrls.map((url, idx) => {
                      const option = currentQuestion.options![idx];
                      const isSelected = selectedOption === option;
                      const isCorrect = Array.isArray(currentQuestion.correctAnswer)
                        ? currentQuestion.correctAnswer.includes(option)
                        : option === currentQuestion.correctAnswer;
                      const userSelected = currentResult?.userAnswer === option;
                      
                      return (
                        <Grid item xs={6} key={idx}>
                          <Paper
                            component="button"
                            onClick={() => handleOptionSelect(option)}
                            sx={{
                              width: '100%',
                              p: 0,
                              overflow: 'hidden',
                              borderRadius: 2,
                              border: '3px solid',
                              borderColor: showExplanation && isCorrect
                                ? '#4CAF50'
                                : showExplanation && userSelected && !isCorrect
                                  ? '#EF4444'
                                  : isSelected
                                    ? '#00B4A0'
                                    : '#E0E0E0',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative',
                              '&:active': { transform: 'scale(0.98)' }
                            }}
                          >
                            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                              <Box sx={{ 
                                width: is960 ? 24 : 32, 
                                height: is960 ? 24 : 32, 
                                borderRadius: '50%', 
                                bgcolor: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: is960 ? '0.75rem' : '0.875rem',
                                color: '#2D3436'
                              }}>
                                {String.fromCharCode(65 + idx)}
                              </Box>
                            </Box>
                            <Box component="img" src={url} sx={{ width: '100%', height: is960 ? 120 : 160, objectFit: 'cover' }} />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}

              {currentQuestion.type === ExerciseType.L02_LISTEN_TEXT && currentQuestion.options && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = Array.isArray(currentQuestion.correctAnswer)
                      ? currentQuestion.correctAnswer.includes(opt)
                      : opt === currentQuestion.correctAnswer;
                    const userSelected = currentResult?.userAnswer === opt;
                    
                    return (
                      <Paper
                        key={idx}
                        component="button"
                        onClick={() => handleOptionSelect(opt)}
                        sx={{
                          width: '100%',
                          p: 2.5,
                          borderRadius: 2,
                          textAlign: 'left',
                          border: '3px solid',
                          borderColor: showExplanation && isCorrect
                            ? '#4CAF50'
                            : showExplanation && userSelected && !isCorrect
                              ? '#EF4444'
                              : isSelected
                                ? '#00B4A0'
                                : '#E0E0E0',
                          cursor: 'pointer',
                          bgcolor: showExplanation && isCorrect
                            ? '#D1FAE5'
                            : showExplanation && userSelected && !isCorrect
                              ? '#FEE2E2'
                              : 'white',
                          transition: 'all 0.2s',
                          '&:active': { transform: 'scale(0.98)' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontWeight: 800, color: '#2D3436', fontSize: is960 ? '1rem' : '1.25rem' }}>
                            {String.fromCharCode(65 + idx)}. {opt}
                          </Typography>
                          {showExplanation && isCorrect && <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 28 }} />}
                          {showExplanation && userSelected && !isCorrect && <CancelIcon sx={{ color: '#EF4444', fontSize: 28 }} />}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}

              {currentQuestion.type === ExerciseType.S01_SPEAKING && (
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 2, border: '2px solid #E0E0E0' }}>
                  <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#2D3436', mb: 2 }}>
                    {currentQuestion.pinyin}
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '1rem' : '1.25rem', color: '#636E72', fontWeight: 600 }}>
                    {currentQuestion.subPrompt}
                  </Typography>
                </Box>
              )}

              {/* Explanation */}
              {showExplanation && currentQuestion.explanation && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2.5, 
                  bgcolor: currentResult?.isCorrect ? '#D1FAE5' : '#FEE2E2', 
                  borderRadius: 2,
                  border: `2px solid ${currentResult?.isCorrect ? '#4CAF50' : '#EF4444'}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {currentResult?.isCorrect ? (
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#EF4444', fontSize: 24 }} />
                    )}
                    <Typography sx={{ 
                      fontWeight: 900, 
                      color: currentResult?.isCorrect ? '#4CAF50' : '#EF4444',
                      fontSize: is960 ? '0.9rem' : '1rem'
                    }}>
                      {currentResult?.isCorrect ? '回答正确' : '回答错误'}
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: is960 ? '0.8rem' : '0.9rem', 
                    color: '#2D3436',
                    lineHeight: 1.6
                  }}>
                    {currentQuestion.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

