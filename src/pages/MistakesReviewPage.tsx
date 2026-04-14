import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CURRENT_LESSON } from '../mock/lessonData';
import { Question, ExerciseType } from '../types/lesson';
import MistakePracticeMode from '../components/Lesson/MistakePracticeMode';

interface QuestionResult {
  question: Question;
  userAnswer: string | null;
  isCorrect: boolean;
  unitId: string;
  unitTitle: string;
}

export default function MistakesReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  // Get lesson data from location state or use CURRENT_LESSON as fallback
  const lesson = (location.state as any)?.lesson || CURRENT_LESSON;

  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [showPracticeMode, setShowPracticeMode] = useState(false);
  const [showReviewPage, setShowReviewPage] = useState(false);

  const loadResults = () => {
    const allResults: QuestionResult[] = [];
    
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
            unitTitle: unit.title
          });
        }
      });
    });
    
    setQuestionResults(allResults);
    const mistakes = allResults.filter(r => !r.isCorrect).length;
    setMistakesCount(mistakes);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleAnswerQuestion = (questionId: string, userAnswer: string, correctAnswer: string | string[]) => {
    const isCorrect = Array.isArray(correctAnswer) 
      ? correctAnswer.includes(userAnswer)
      : userAnswer === correctAnswer;
    
    // Save to localStorage
    localStorage.setItem(`question_${questionId}_result`, JSON.stringify({
      userAnswer,
      isCorrect
    }));
    
    // Reload results to update the display
    loadResults();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const wrongQuestions = questionResults.filter(r => !r.isCorrect);
  const correctQuestions = questionResults.filter(r => r.isCorrect);

  // Step 1: Practice Mode - Practice wrong questions first
  if (showPracticeMode && wrongQuestions.length > 0) {
    return (
      <MistakePracticeMode
        wrongQuestions={wrongQuestions.map(r => ({
          question: r.question,
          userAnswer: r.userAnswer,
          unitTitle: r.unitTitle
        }))}
        onComplete={() => {
          setShowPracticeMode(false);
          loadResults(); // Reload to get updated results
          // Navigate to review page
          navigate('/question-review', { state: { lesson } });
        }}
        onExit={() => {
          setShowPracticeMode(false);
        }}
      />
    );
  }

  // Step 2: Review Page - Show all questions in HSK mock exam style
  if (showReviewPage) {
    return (
      <Box sx={{ height: '100%', width: '100%' }}>
        {/* This will be handled by QuestionReviewPage component */}
        {/* We'll navigate to it instead */}
      </Box>
    );
  }

  // Initial View - Show summary and start practice
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
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: is960 ? 2 : 3,
        borderBottom: '2px solid #E0E0E0'
      }}>
        <ButtonBase
          onClick={handleBack}
          sx={{
            bgcolor: 'white', 
            color: '#636E72', 
            px: 2.5, 
            py: 1.2, 
            borderRadius: 1,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '2px solid #E0E0E0', 
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>退出</Typography>
        </ButtonBase>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436', fontSize: is960 ? '1.25rem' : '1.75rem', mb: 0.5 }}>
            Mistakes Review
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.75rem' : '1rem', color: mistakesCount > 0 ? '#EF4444' : '#4CAF50', fontWeight: 700 }}>
            Mistakes: {mistakesCount}
          </Typography>
        </Box>

        <Box sx={{ width: 100 }} />
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: is960 ? 2 : 4,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Start Practice Button */}
        {wrongQuestions.length > 0 && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <ButtonBase
              onClick={() => setShowPracticeMode(true)}
              sx={{
                bgcolor: '#EF4444',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: 2,
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.25rem',
                boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              开始练习错题 ({wrongQuestions.length} 题)
            </ButtonBase>
            <Typography sx={{ mt: 2, fontSize: is960 ? '0.75rem' : '0.875rem', color: '#636E72' }}>
              完成错题练习后，将进入题目回顾页面
            </Typography>
          </Box>
        )}

        {/* Wrong Questions List */}
        {wrongQuestions.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : '1.25rem', 
              fontWeight: 900, 
              color: '#EF4444',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CancelIcon sx={{ fontSize: is960 ? 20 : 24 }} />
              错题 ({wrongQuestions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {wrongQuestions.map((result) => (
                <Box key={result.question.id} sx={{ 
                  bgcolor: '#FEE2E2', 
                  p: is960 ? 1.5 : 2.5, 
                  borderRadius: is960 ? '12px' : '16px', 
                  border: '2px solid #EF4444',
                  borderLeftWidth: '4px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.75rem', color: '#636E72', fontWeight: 600 }}>
                      {result.unitTitle.replace(/^单元 \d+: /, '')}
                    </Typography>
                    <CancelIcon sx={{ fontSize: is960 ? 18 : 20, color: '#EF4444' }} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: is960 ? '0.9rem' : '1.125rem', 
                    fontWeight: 700, 
                    color: '#2D3436',
                    mb: 1.5
                  }}>
                    {result.question.prompt}
                  </Typography>
                  {result.question.subPrompt && (
                    <Typography sx={{ 
                      fontSize: is960 ? '0.8rem' : '1rem', 
                      color: '#636E72',
                      mb: 1.5
                    }}>
                      {result.question.subPrompt}
                    </Typography>
                  )}
                  {result.question.pinyin && (
                    <Typography sx={{ 
                      fontSize: is960 ? '0.7rem' : '0.875rem', 
                      color: '#00B4A0',
                      fontFamily: 'monospace',
                      mb: 1.5
                    }}>
                      {result.question.pinyin}
                    </Typography>
                  )}
                  {result.question.options && (
                    <Grid container spacing={1.5} sx={{ mt: 1 }}>
                      {result.question.options.map((option, idx) => {
                        const isSelected = result.userAnswer === option;
                        const isCorrect = Array.isArray(result.question.correctAnswer)
                          ? result.question.correctAnswer.includes(option)
                          : result.question.correctAnswer === option;
                        
                        return (
                          <Grid item xs={6} key={idx}>
                            <ButtonBase
                              onClick={() => handleAnswerQuestion(
                                result.question.id,
                                option,
                                result.question.correctAnswer
                              )}
                              sx={{
                                width: '100%',
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: isCorrect ? '#D1FAE5' : isSelected ? '#FEE2E2' : 'white',
                                border: '2px solid',
                                borderColor: isCorrect ? '#4CAF50' : isSelected ? '#EF4444' : '#E0E0E0',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                '&:active': { transform: 'scale(0.98)' }
                              }}
                            >
                              <Typography sx={{ 
                                fontSize: is960 ? '0.75rem' : '0.875rem',
                                fontWeight: isSelected || isCorrect ? 700 : 500,
                                color: isCorrect ? '#4CAF50' : isSelected ? '#EF4444' : '#2D3436'
                              }}>
                                {option}
                              </Typography>
                            </ButtonBase>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                  {result.question.explanation && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography sx={{ 
                        fontSize: is960 ? '0.7rem' : '0.75rem', 
                        color: '#636E72',
                        fontStyle: 'italic'
                      }}>
                        {result.question.explanation}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Correct Questions */}
        {correctQuestions.length > 0 && (
          <Box>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : '1.25rem', 
              fontWeight: 900, 
              color: '#4CAF50',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckCircleIcon sx={{ fontSize: is960 ? 20 : 24 }} />
              已掌握 ({correctQuestions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {correctQuestions.map((result) => (
                <Box key={result.question.id} sx={{ 
                  bgcolor: '#D1FAE5', 
                  p: is960 ? 1.5 : 2, 
                  borderRadius: is960 ? '12px' : '16px', 
                  border: '2px solid #4CAF50',
                  borderLeftWidth: '4px',
                  opacity: 0.8
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.85rem' : '1rem', 
                      fontWeight: 600, 
                      color: '#2D3436'
                    }}>
                      {result.question.prompt}
                    </Typography>
                    <CheckCircleIcon sx={{ fontSize: is960 ? 18 : 20, color: '#4CAF50' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {questionResults.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#9CA3AF'
          }}>
            <Typography sx={{ fontSize: is960 ? '0.9rem' : '1.125rem', fontWeight: 600 }}>
              还没有答题记录
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.875rem', mt: 1 }}>
              完成练习后，错题会显示在这里
            </Typography>
          </Box>
        )}

        {/* View All Questions Button */}
        {wrongQuestions.length === 0 && questionResults.length > 0 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <ButtonBase
              onClick={() => navigate('/question-review', { state: { lesson } })}
              sx={{
                bgcolor: '#00B4A0',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: 2,
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.25rem',
                boxShadow: '0 8px 24px rgba(0,180,160,0.3)',
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              查看全部题目
            </ButtonBase>
          </Box>
        )}
      </Box>
    </Box>
  );
}

