import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CURRENT_LESSON } from '../mock/lessonData';
import { Question, ExerciseType } from '../types/lesson';

interface QuestionResult {
  question: Question;
  userAnswer: string | null;
  isCorrect: boolean;
  questionIndex: number;
}

export default function HSKMockExamPage() {
  const navigate = useNavigate();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // Mock exam questions (25 questions)
  const [mockQuestions] = useState<Question[]>(() => {
    // Generate 25 questions from lesson data
    const allQuestions: Question[] = [];
    CURRENT_LESSON.units.forEach(unit => {
      allQuestions.push(...unit.questions);
    });
    // Repeat questions to reach 25 if needed
    while (allQuestions.length < 25) {
      allQuestions.push(...CURRENT_LESSON.units[0].questions);
    }
    return allQuestions.slice(0, 25);
  });

  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes (design: Time Left 05:00)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Initialize question results
    const results: QuestionResult[] = mockQuestions.map((q, idx) => ({
      question: q,
      userAnswer: null,
      isCorrect: false,
      questionIndex: idx
    }));
    setQuestionResults(results);
  }, [mockQuestions]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto submit when time runs out
          const checkedResults = questionResults.map(result => {
            const isCorrect = Array.isArray(result.question.correctAnswer)
              ? result.question.correctAnswer.includes(result.userAnswer || '')
              : result.userAnswer === result.question.correctAnswer;
            return { ...result, isCorrect };
          });
          setQuestionResults(checkedResults);
          setIsSubmitted(true);
          checkedResults.forEach(result => {
            localStorage.setItem(`question_${result.question.id}_result`, JSON.stringify({
              userAnswer: result.userAnswer,
              isCorrect: result.isCorrect
            }));
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isSubmitted, questionResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionResults.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextResult = questionResults[currentQuestionIndex + 1];
      setSelectedOption(nextResult?.userAnswer || null);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    
    setSelectedOption(option);
    
    // Update result
    setQuestionResults(prev => prev.map((r, idx) => 
      idx === currentQuestionIndex 
        ? { ...r, userAnswer: option }
        : r
    ));
    
    // Mark as answered
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check all answers
    const checkedResults = questionResults.map(result => {
      const isCorrect = Array.isArray(result.question.correctAnswer)
        ? result.question.correctAnswer.includes(result.userAnswer || '')
        : result.userAnswer === result.question.correctAnswer;
      return { ...result, isCorrect };
    });
    
    setQuestionResults(checkedResults);
    setIsSubmitted(true);
    setShowResult(true);
    
    // Save results to localStorage
    checkedResults.forEach(result => {
      localStorage.setItem(`question_${result.question.id}_result`, JSON.stringify({
        userAnswer: result.userAnswer,
        isCorrect: result.isCorrect
      }));
    });
  };

  const calculateScore = () => {
    const correctCount = questionResults.filter(r => r.isCorrect).length;
    const totalCount = questionResults.length;
    const score = Math.round((correctCount / totalCount) * 100);
    return { correctCount, totalCount, score };
  };

  const getHSKLevel = (score: number) => {
    if (score >= 90) return { level: 'HSK 6', description: '高级水平' };
    if (score >= 80) return { level: 'HSK 5', description: '中高级水平' };
    if (score >= 70) return { level: 'HSK 4', description: '中级水平' };
    if (score >= 60) return { level: 'HSK 3', description: '初中级水平' };
    if (score >= 50) return { level: 'HSK 2', description: '初级水平' };
    return { level: 'HSK 1', description: '入门水平' };
  };

  const handleBack = () => {
    navigate('/hsk-test');
  };

  const currentResult = questionResults[currentQuestionIndex];
  const currentQuestion = currentResult?.question;
  const answeredCount = questionResults.filter(r => r.userAnswer !== null).length;

  const headerHeight = is960 ? 72 : (is1920x1125 ? 100 : 88)
  const sidebarWidth = is960 ? 180 : (is1920x1125 ? 280 : 240)

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      minHeight: 0,
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#F7F9F8',
      position: 'relative'
    }}>
      {/* Top Header - only when NOT on result screen; result screen has its own header */}
      {!showResult && (
      <Box sx={{ 
        flexShrink: 0,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: is960 ? 2 : (is1920x1125 ? 4 : 3),
        py: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
        minHeight: headerHeight,
        bgcolor: 'white',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <ButtonBase
          onClick={handleBack}
          sx={{
            width: is960 ? 36 : (is1920x1125 ? 48 : 42),
            height: is960 ? 36 : (is1920x1125 ? 48 : 42),
            borderRadius: '12px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#374151',
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 24 : (is1920x1125 ? 28 : 26) }} />
        </ButtonBase>

        <Box sx={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25
        }}>
          <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '0.95rem' : (is1920x1125 ? '1.5rem' : '1.125rem') }}>
            HSK Mock Test 01
          </Typography>
          <Typography sx={{ 
            fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.8rem'), 
            color: isSubmitted ? '#6B7280' : '#DC2626', 
            fontWeight: 700 
          }}>
            {isSubmitted ? 'Completed' : `Time Left: ${formatTime(timeRemaining)}`}
          </Typography>
        </Box>

        {!isSubmitted && (
        <ButtonBase
          onClick={handleSubmit}
          sx={{
            bgcolor: '#00B4A0',
            color: 'white',
            px: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
            py: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1),
            borderRadius: is1920x1125 ? '14px' : '12px',
            fontWeight: 900,
            fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1rem' : '0.9rem'),
            '&:active': { transform: 'scale(0.95)', bgcolor: '#009688' }
          }}
        >
          Submit
        </ButtonBase>
        )}
      </Box>
      )}

      {/* Result Screen - design: header (back + title + "Test Completed"), white card with score, 3 summary cards, View Details → */}
      {showResult && (() => {
        const { correctCount, totalCount, score } = calculateScore();
        const incorrectCount = totalCount - correctCount;
        const { level, description } = getHSKLevel(score);
        const levelTag = score >= 90 ? 'Advanced' : score >= 70 ? 'Intermediate' : score >= 50 ? 'Elementary' : 'Beginner';
        const cardPad = is960 ? 2 : (is1920x1125 ? 4 : 3);
        const cardRadius = is1920x1125 ? '24px' : '20px';
        return (
          <Box sx={{ 
            flex: 1, 
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: '#F8F8F8'
          }}>
            {/* Header outside card: back, title, subtitle */}
            <Box sx={{ 
              flexShrink: 0,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              px: is960 ? 2 : (is1920x1125 ? 4 : 3),
              py: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
              bgcolor: 'transparent'
            }}>
              <ButtonBase
                onClick={handleBack}
                sx={{
                  width: is960 ? 40 : (is1920x1125 ? 56 : 48),
                  height: is960 ? 40 : (is1920x1125 ? 56 : 48),
                  borderRadius: '50%',
                  bgcolor: '#E5E7EB',
                  color: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '&:active': { transform: 'scale(0.95)', bgcolor: '#D1D5DB' }
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
              </ButtonBase>
              <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem') }}>
                  HSK Mock Test 01
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), color: '#6B7280', fontWeight: 600 }}>
                  Test Completed
                </Typography>
              </Box>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48) }} />
            </Box>

            {/* Main white card - centered, rounded, shadow */}
            <Box sx={{ 
              flex: 1, 
              minHeight: 0,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: is960 ? 2 : (is1920x1125 ? 4 : 3),
              overflow: 'auto'
            }}>
              <Box sx={{ 
                maxWidth: is960 ? 420 : (is1920x1125 ? 720 : 560), 
                width: '100%', 
                p: cardPad, 
                bgcolor: 'white', 
                borderRadius: cardRadius,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                textAlign: 'center',
                position: 'relative'
              }}>
                {/* Score + confetti */}
                <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', flexWrap: 'wrap', mb: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
                  {/* Confetti - small colored shapes around score */}
                  {[
                    { color: '#FBBF24', top: -4, left: -24, w: 8, h: 10, rotate: -15 },
                    { color: '#EF4444', top: 8, right: -20, left: 'auto', w: 6, h: 8, rotate: 20 },
                    { color: '#4CAF50', top: -8, right: -8, left: 'auto', w: 10, h: 6, rotate: 10 },
                    { color: '#3B82F6', bottom: 4, left: -16, top: 'auto', w: 8, h: 8, rotate: -20 },
                    { color: '#F59E0B', bottom: -4, right: -28, left: 'auto', top: 'auto', w: 7, h: 9, rotate: 15 }
                  ].map((c, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        top: c.top,
                        bottom: c.bottom,
                        left: c.left,
                        right: c.right,
                        width: is960 ? c.w * 0.8 : (is1920x1125 ? c.w * 1.2 : c.w),
                        height: is960 ? c.h * 0.8 : (is1920x1125 ? c.h * 1.2 : c.h),
                        bgcolor: c.color,
                        transform: `rotate(${c.rotate}deg)`,
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                  <Typography sx={{ 
                    fontSize: is960 ? '3rem' : (is1920x1125 ? '4.5rem' : '4rem'), 
                    fontWeight: 900, 
                    color: '#4CAF50',
                    lineHeight: 1,
                    mr: 0.5
                  }}>
                    {score}
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), color: '#6B7280', fontWeight: 700 }}>
                    pts
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1.1rem' : '1rem'), color: '#374151', fontWeight: 700, mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5) }}>
                  Score
                </Typography>

                {/* Three summary cards */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                  mb: is960 ? 2 : (is1920x1125 ? 3.5 : 3)
                }}>
                  <Box sx={{ p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), borderRadius: is1920x1125 ? '16px' : '12px', bgcolor: '#E6F4EA', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.25rem' : '2rem'), fontWeight: 900, color: '#137333', mb: 0.5 }}>{correctCount}</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), color: '#374151', fontWeight: 600 }}>Correct</Typography>
                  </Box>
                  <Box sx={{ p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), borderRadius: is1920x1125 ? '16px' : '12px', bgcolor: '#FDE6E6', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.25rem' : '2rem'), fontWeight: 900, color: '#C5221F', mb: 0.5 }}>{incorrectCount}</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), color: '#374151', fontWeight: 600 }}>Incorrect</Typography>
                  </Box>
                  <Box sx={{ p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), borderRadius: is1920x1125 ? '16px' : '12px', bgcolor: '#FFF0E6', textAlign: 'center', position: 'relative' }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: is960 ? -6 : (is1920x1125 ? -8 : -7), 
                      right: is960 ? -4 : (is1920x1125 ? -6 : -5), 
                      px: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25), 
                      py: 0.5, 
                      borderRadius: '999px', 
                      bgcolor: '#EA580C', 
                      color: 'white', 
                      fontWeight: 800, 
                      fontSize: is960 ? '0.6rem' : (is1920x1125 ? '0.85rem' : '0.75rem') 
                    }}>
                      {levelTag}
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '1.1rem' : (is1920x1125 ? '1.5rem' : '1.35rem'), fontWeight: 900, color: '#C2410C', mb: 0.5 }}>{level}</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), color: '#374151', fontWeight: 600 }}>Level Result</Typography>
                  </Box>
                </Box>

                {/* View Details → button */}
                <ButtonBase
                  onClick={() => setShowResult(false)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: is960 ? 3 : (is1920x1125 ? 5 : 4),
                    py: is960 ? 1.25 : (is1920x1125 ? 1.75 : 1.5),
                    bgcolor: '#20C997',
                    color: 'white',
                    borderRadius: is1920x1125 ? '14px' : '12px',
                    fontWeight: 900,
                    fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.1rem' : '1rem'),
                    '&:active': { transform: 'scale(0.98)', bgcolor: '#14B885' }
                  }}
                >
                  View Details →
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        );
      })()}

      {/* Main Content */}
      {!showResult && (
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Progress (design: "Progress" heading, 3-col grid, active = blue) */}
        <Box sx={{ 
          width: sidebarWidth, 
          bgcolor: 'white', 
          borderRight: '1px solid #E5E7EB',
          p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography sx={{ 
            fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.8rem'), 
            fontWeight: 900, 
            color: '#374151',
            mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.5)
          }}>
            Progress
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.6),
          }}>
            {questionResults.map((result, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const hasAnswer = result.userAnswer !== null;
              const isWrong = isSubmitted && hasAnswer && !result.isCorrect;
              const isCorrect = isSubmitted && hasAnswer && result.isCorrect;
              return (
                <ButtonBase
                  key={idx}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setSelectedOption(questionResults[idx]?.userAnswer ?? null);
                  }}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: is1920x1125 ? '12px' : '10px',
                    bgcolor: isCurrent 
                      ? '#2563EB' 
                      : isWrong 
                        ? '#FEE2E2' 
                        : isCorrect
                          ? '#D1FAE5'
                          : hasAnswer 
                            ? '#E0F2FE' 
                            : '#F3F4F6',
                    color: isCurrent 
                      ? 'white' 
                      : isWrong 
                        ? '#EF4444' 
                        : isCorrect
                          ? '#059669'
                          : hasAnswer 
                            ? '#0284C7' 
                            : '#4B5563',
                    fontWeight: 900,
                    fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.9rem' : '0.75rem'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    '&:active': { transform: 'scale(0.97)' }
                  }}
                >
                  {idx + 1}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        {/* Right Content - Question Detail (design: Reading · Task 1, prompt, phrase box, 4 image options A-D) */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: is960 ? 2 : (is1920x1125 ? 4 : 3), boxSizing: 'border-box' }}>
          {currentQuestion && (
            <Box sx={{ maxWidth: '100%' }}>
              {/* Section Header - "Reading · Task 1" */}
              <Typography sx={{ 
                fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1.1rem' : '1rem'), 
                fontWeight: 600, 
                color: '#6B7280',
                mb: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25)
              }}>
                Reading · Task {currentQuestionIndex + 1}
              </Typography>

              {/* Instruction / Prompt - e.g. 选择 'Ta' (她) */}
              <Typography sx={{ 
                fontSize: is960 ? '1rem' : (is1920x1125 ? '1.35rem' : '1.25rem'), 
                fontWeight: 700, 
                color: '#1F2937',
                mb: is960 ? 2 : (is1920x1125 ? 2.5 : 2)
              }}>
                {currentQuestion.prompt}
              </Typography>

              {/* Question Content - image select (T00) */}
              {currentQuestion.type === ExerciseType.T00_LISTEN_SELECT_IMAGE && currentQuestion.imageUrls && (
                <>
                  {/* Phrase Box - light blue bg, large blue pinyin, smaller gray hanzi in parentheses */}
                  <Box sx={{ 
                    p: is960 ? 2 : (is1920x1125 ? 3 : 2.5), 
                    mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5), 
                    borderRadius: is1920x1125 ? '16px' : '12px',
                    bgcolor: '#DBEAFE',
                    textAlign: 'center'
                  }}>
                    <Typography sx={{ 
                      fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
                      fontWeight: 900, 
                      color: '#2563EB',
                      mb: 0.5,
                      fontFamily: 'monospace'
                    }}>
                      {currentQuestion.pinyin || 'Tā de mèimei'}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.1rem' : '1rem'), 
                      color: '#4B5563',
                      fontWeight: 600
                    }}>
                      ({(() => {
                        const unit = CURRENT_LESSON.units.find(u => u.questions.some(q => q.id === currentQuestion.id));
                        const learning = unit?.learnings.find(l => l.pinyin === currentQuestion.pinyin);
                        return learning?.content || '她的妹妹';
                      })()})
                    </Typography>
                  </Box>

                  {/* Image Options - 4 in a row, A/B/C/D labels: dark gray circle + white letter, selected = blue border */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: is960 ? 1 : (is1920x1125 ? 2 : 1.5),
                    maxWidth: '100%'
                  }}>
                    {currentQuestion.imageUrls.slice(0, 4).map((url, idx) => {
                      const option = currentQuestion.options?.[idx] ?? '';
                      const isSelected = selectedOption === option;
                      const isCorrect = Array.isArray(currentQuestion.correctAnswer)
                        ? currentQuestion.correctAnswer.includes(option)
                        : option === currentQuestion.correctAnswer;
                      const userSelected = currentResult?.userAnswer === option;
                      const borderColor = isSubmitted && isCorrect
                        ? '#22C55E'
                        : isSubmitted && userSelected && !isCorrect
                          ? '#EF4444'
                          : isSelected
                            ? '#2563EB'
                            : '#E5E7EB';
                      return (
                        <ButtonBase
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          disabled={isSubmitted}
                          sx={{
                            width: '100%',
                            borderRadius: is1920x1125 ? '16px' : '12px',
                            border: '3px solid',
                            borderColor,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: isSubmitted ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            aspectRatio: '1',
                            p: 0,
                            '&:active': !isSubmitted ? { transform: 'scale(0.98)' } : {},
                            '&:disabled': { opacity: 1 }
                          }}
                        >
                          {/* Label A/B/C/D - dark gray circle, white letter, top-left */}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: is960 ? 6 : (is1920x1125 ? 10 : 8), 
                            left: is960 ? 6 : (is1920x1125 ? 10 : 8), 
                            zIndex: 1,
                            width: is960 ? 24 : (is1920x1125 ? 36 : 30), 
                            height: is960 ? 24 : (is1920x1125 ? 36 : 30), 
                            borderRadius: '50%', 
                            bgcolor: '#4B5563', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1rem' : '0.85rem'),
                            color: 'white'
                          }}>
                            {String.fromCharCode(65 + idx)}
                          </Box>
                          <Box 
                            component="img" 
                            src={url} 
                            alt=""
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                          />
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </>
              )}

              {/* Text/Grammar Options (T02/T03/T04/T05 or legacy L02) */}
              {(currentQuestion.type === ExerciseType.L02_LISTEN_TEXT || 
                currentQuestion.type === ExerciseType.T02_PICTURE_SELECT_TEXT ||
                currentQuestion.type === ExerciseType.T03_LISTEN_SELECT_SENTENCE ||
                currentQuestion.type === ExerciseType.T04_WORD_MEANING_SELECT ||
                currentQuestion.type === ExerciseType.T05_GRAMMAR_SELECT) && currentQuestion.options && (
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
                        disabled={isSubmitted}
                        sx={{
                          width: '100%',
                          p: 2.5,
                          borderRadius: 2,
                          textAlign: 'left',
                          border: '3px solid',
                          borderColor: isSubmitted && isCorrect
                            ? '#4CAF50'
                            : isSubmitted && userSelected && !isCorrect
                              ? '#EF4444'
                              : isSelected
                                ? '#00B4A0'
                                : '#E0E0E0',
                          cursor: isSubmitted ? 'default' : 'pointer',
                          bgcolor: isSubmitted && isCorrect
                            ? '#D1FAE5'
                            : isSubmitted && userSelected && !isCorrect
                              ? '#FEE2E2'
                              : 'white',
                          transition: 'all 0.2s',
                          '&:active': !isSubmitted ? { transform: 'scale(0.98)' } : {},
                          '&:disabled': { opacity: 1 }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontWeight: 800, color: '#2D3436', fontSize: is960 ? '1rem' : '1.25rem' }}>
                            {String.fromCharCode(65 + idx)}. {opt}
                          </Typography>
                          {isSubmitted && isCorrect && <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 28 }} />}
                          {isSubmitted && userSelected && !isCorrect && <CancelIcon sx={{ color: '#EF4444', fontSize: 28 }} />}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}

              {/* Next Button */}
              {!isSubmitted && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <ButtonBase
                    onClick={handleNext}
                    disabled={!selectedOption || currentQuestionIndex >= questionResults.length - 1}
                    sx={{
                      px: 4,
                      py: 1.5,
                      bgcolor: selectedOption ? '#00B4A0' : '#E5E7EB',
                      color: selectedOption ? 'white' : '#9CA3AF',
                      borderRadius: 2,
                      fontWeight: 900,
                      fontSize: is960 ? '0.9rem' : '1rem',
                      minWidth: 120,
                      transition: 'all 0.2s',
                      '&:active': selectedOption ? { transform: 'scale(0.95)', bgcolor: '#009688' } : {},
                      '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }
                    }}
                  >
                    {currentQuestionIndex >= questionResults.length - 1 ? '最后一题' : '下一题'}
                    {currentQuestionIndex < questionResults.length - 1 && (
                      <ArrowForwardIcon sx={{ ml: 1, fontSize: 20 }} />
                    )}
                  </ButtonBase>
                </Box>
              )}

              {/* Explanation (only after submission) */}
              {isSubmitted && currentQuestion.explanation && (
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
      )}
    </Box>
  );
}

