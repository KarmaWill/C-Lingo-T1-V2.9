/**
 * HSK Prep Training — HSK 备考训练完整版
 * 从 hsk-mock-exam.zip 还原，适配 iPad 交互
 * HomeScreen → ExamScreen → ResultScreen
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

type Screen = 'home' | 'exam' | 'result';
type HSKLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExamPaper {
  id: string;
  level: HSKLevel;
  duration: number; // minutes
  questions: Question[];
}

interface ExamResult {
  paperId: string;
  score: number;
  answers: Record<string, string>;
  completedAt: string;
}

// Mock 试卷数据
const MOCK_PAPER: ExamPaper = {
  id: 'hsk1-mock-01',
  level: 1,
  duration: 25,
  questions: [
    {
      id: 'q1',
      question: '你好吗？',
      options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      correctAnswer: 'Hello',
    },
    {
      id: 'q2',
      question: '谢谢',
      options: ['Please', 'Thank you', 'Sorry', 'Excuse me'],
      correctAnswer: 'Thank you',
    },
    {
      id: 'q3',
      question: '我爱你',
      options: ['I love you', 'I hate you', 'I miss you', 'I like you'],
      correctAnswer: 'I love you',
    },
    {
      id: 'q4',
      question: '再见',
      options: ['Hello', 'Goodbye', 'See you', 'Welcome'],
      correctAnswer: 'Goodbye',
    },
    {
      id: 'q5',
      question: '对不起',
      options: ['Thank you', 'Sorry', 'Please', 'Excuse me'],
      correctAnswer: 'Sorry',
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════════
   HomeScreen — HSK 级别选择
   ═══════════════════════════════════════════════════════════════════════════════ */
function HomeScreen({ onSelectLevel, onBack, is960 }: { onSelectLevel: (level: HSKLevel) => void; onBack: () => void; is960: boolean }) {
  const levels: { level: HSKLevel; title: string; desc: string; color: string }[] = [
    { level: 1, title: 'HSK 1', desc: '150 词 · 基础', color: '#10B981' },
    { level: 2, title: 'HSK 2', desc: '300 词 · 初级', color: '#3B82F6' },
    { level: 3, title: 'HSK 3', desc: '600 词 · 中级', color: '#F59E0B' },
    { level: 4, title: 'HSK 4', desc: '1200 词 · 流利', color: '#EC4899' },
    { level: 5, title: 'HSK 5', desc: '2500 词 · 高级', color: '#8B5CF6' },
    { level: 6, title: 'HSK 6', desc: '5000 词 · 精通', color: '#EF4444' },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF8F0', p: is960 ? 3 : 4, position: 'relative' }}>
      {/* Back Button */}
      <Box sx={{ position: 'absolute', top: is960 ? 12 : 16, left: is960 ? 12 : 16 }}>
        <ButtonBase
          onClick={onBack}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
      </Box>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <SchoolIcon sx={{ fontSize: is960 ? 56 : 72, color: '#268BD2', mb: 2 }} />
        <Typography sx={{ fontSize: is960 ? '1.75rem' : '2.5rem', fontWeight: 900, color: '#111827', mb: 1 }}>
          HSK 备考训练
        </Typography>
        <Typography sx={{ fontSize: is960 ? '0.9rem' : '1.1rem', fontWeight: 600, color: '#6B7280' }}>
          选择你的目标级别开始模拟测试
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: is960 ? 1.5 : 2, width: '100%', maxWidth: 800 }}>
        {levels.map((item, i) => (
          <motion.div
            key={item.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ButtonBase
              onClick={() => onSelectLevel(item.level)}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'white',
                borderRadius: '20px',
                p: is960 ? 2.5 : 3.5,
                border: `3px solid ${item.color}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Typography sx={{ fontSize: is960 ? '1.75rem' : '2.25rem', fontWeight: 900, color: item.color, mb: 0.75 }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#6B7280', textAlign: 'center' }}>
                {item.desc}
              </Typography>
            </ButtonBase>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ExamScreen — 考试进行中
   ═══════════════════════════════════════════════════════════════════════════════ */
function ExamScreen({ paper, onFinish, onExit, is960 }: { paper: ExamPaper; onFinish: (answers: Record<string, string>) => void; onExit: () => void; is960: boolean }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(paper.duration * 60);

  const currentQuestion = paper.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id];

  const handleSelectAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < paper.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onFinish(answers);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / paper.questions.length) * 100;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <ButtonBase
          onClick={onExit}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.25rem', color: '#111827' }}>
            HSK {paper.level} 模拟考试
          </Typography>
          <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.8rem', color: '#DC2626', fontWeight: 700 }}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </Typography>
        </Box>

        <ButtonBase
          onClick={handleSubmit}
          disabled={answeredCount === 0}
          sx={{
            px: 2.5,
            py: 1,
            bgcolor: answeredCount > 0 ? '#00B4A0' : '#E5E7EB',
            color: answeredCount > 0 ? 'white' : '#9CA3AF',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: is960 ? '0.8rem' : '0.9rem',
            '&:active': answeredCount > 0 ? { transform: 'scale(0.95)' } : {},
          }}
        >
          提交
        </ButtonBase>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Progress */}
        <Box sx={{ width: is960 ? 180 : 240, flexShrink: 0, bgcolor: 'white', borderRight: '1px solid rgba(0,0,0,0.06)', p: is960 ? 2 : 2.5, overflow: 'auto' }}>
          <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', fontWeight: 800, color: '#6B7280', mb: 2, textTransform: 'uppercase' }}>
            进度 {answeredCount}/{paper.questions.length}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.75 }}>
            {paper.questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const hasAnswer = !!answers[q.id];
              return (
                <ButtonBase
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: '10px',
                    bgcolor: isCurrent ? '#2563EB' : hasAnswer ? '#E0F2FE' : '#F3F4F6',
                    color: isCurrent ? 'white' : hasAnswer ? '#0284C7' : '#9CA3AF',
                    fontWeight: 900,
                    fontSize: is960 ? '0.7rem' : '0.8rem',
                    '&:active': { transform: 'scale(0.95)' },
                  }}
                >
                  {idx + 1}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        {/* Right Content - Question */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: is960 ? 2.5 : 3.5 }}>
          <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: '#6B7280', mb: 2 }}>
            第 {currentQuestionIndex + 1} 题
          </Typography>

          <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.75rem', fontWeight: 900, color: '#111827', mb: 3, lineHeight: 1.3 }}>
            {currentQuestion.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              return (
                <ButtonBase
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  sx={{
                    width: '100%',
                    p: is960 ? 2 : 2.5,
                    bgcolor: isSelected ? '#EFF6FF' : 'white',
                    border: isSelected ? '3px solid #2563EB' : '2px solid #E5E7EB',
                    borderRadius: '16px',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: isSelected ? '#2563EB' : '#F3F4F6',
                        color: isSelected ? 'white' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: is960 ? '1rem' : '1.15rem', color: isSelected ? '#2563EB' : '#374151' }}>
                      {option}
                    </Typography>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <ButtonBase
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: currentQuestionIndex > 0 ? 'white' : '#F3F4F6',
                color: currentQuestionIndex > 0 ? '#374151' : '#9CA3AF',
                border: '2px solid #E5E7EB',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: is960 ? '0.85rem' : '0.95rem',
                '&:active': currentQuestionIndex > 0 ? { transform: 'scale(0.95)' } : {},
              }}
            >
              上一题
            </ButtonBase>

            <ButtonBase
              onClick={handleNext}
              disabled={currentQuestionIndex === paper.questions.length - 1}
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: currentQuestionIndex < paper.questions.length - 1 ? '#2563EB' : '#E5E7EB',
                color: currentQuestionIndex < paper.questions.length - 1 ? 'white' : '#9CA3AF',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: is960 ? '0.85rem' : '0.95rem',
                '&:active': currentQuestionIndex < paper.questions.length - 1 ? { transform: 'scale(0.95)' } : {},
              }}
            >
              下一题
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ResultScreen — 考试结果
   ═══════════════════════════════════════════════════════════════════════════════ */
function ResultScreen({ paper, result, onRestart, onGoHome, is960 }: { paper: ExamPaper; result: ExamResult; onRestart: () => void; onGoHome: () => void; is960: boolean }) {
  const correctCount = paper.questions.filter(q => result.answers[q.id] === q.correctAnswer).length;
  const totalCount = paper.questions.length;
  const score = Math.round((correctCount / totalCount) * 100);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF8F0', p: is960 ? 3 : 4 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
      >
        <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: '32px', p: is960 ? 4 : 6, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', width: '100%', maxWidth: is960 ? 500 : 720 }}>
          <EmojiEventsIcon sx={{ fontSize: is960 ? 64 : 80, color: '#F59E0B', mb: 2 }} />
          
          <Typography sx={{ fontSize: is960 ? '2rem' : '3rem', fontWeight: 900, color: '#111827', mb: 1 }}>
            {score}分
          </Typography>
          
          <Typography sx={{ fontSize: is960 ? '1rem' : '1.25rem', fontWeight: 700, color: '#6B7280', mb: 4 }}>
            HSK {paper.level} 模拟考试完成
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
            <Box sx={{ bgcolor: '#D1FAE5', borderRadius: '16px', p: 2.5 }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
              <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#10B981' }}>
                {correctCount}
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#065F46', fontWeight: 700 }}>
                答对
              </Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#FEE2E2', borderRadius: '16px', p: 2.5 }}>
              <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#EF4444', mb: 1 }}>
                {totalCount - correctCount}
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#991B1B', fontWeight: 700 }}>
                答错
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <ButtonBase
              onClick={onRestart}
              sx={{
                width: '100%',
                py: 2,
                bgcolor: '#2563EB',
                color: 'white',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.15rem',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              再做一次
            </ButtonBase>

            <ButtonBase
              onClick={onGoHome}
              sx={{
                width: '100%',
                py: 2,
                bgcolor: 'white',
                color: '#374151',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.15rem',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              返回首页
            </ButtonBase>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Container
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HSKPrepTrainingPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const handleSelectLevel = (level: HSKLevel) => {
    setSelectedLevel(level);
    setCurrentScreen('exam');
  };

  const handleFinishExam = (answers: Record<string, string>) => {
    const correctCount = MOCK_PAPER.questions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;

    const result: ExamResult = {
      paperId: MOCK_PAPER.id,
      score: Math.round((correctCount / MOCK_PAPER.questions.length) * 100),
      answers,
      completedAt: new Date().toISOString(),
    };

    setExamResult(result);
    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setExamResult(null);
    setCurrentScreen('exam');
  };

  const handleGoHome = () => {
    setExamResult(null);
    setSelectedLevel(null);
    setCurrentScreen('home');
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <HomeScreen onSelectLevel={handleSelectLevel} onBack={() => navigate(-1)} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'exam' && selectedLevel && (
        <motion.div key="exam" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} style={{ height: '100%' }}>
          <ExamScreen paper={MOCK_PAPER} onFinish={handleFinishExam} onExit={handleGoHome} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'result' && examResult && (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <ResultScreen paper={MOCK_PAPER} result={examResult} onRestart={handleRestart} onGoHome={handleGoHome} is960={is960} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
