/**
 * Syntax Snap（语法快照）— 拖词成句游戏
 * 通过拼图方式学习中文语法和句子结构
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RefreshIcon from '@mui/icons-material/Refresh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PinYinIcon from '@mui/icons-material/Abc';

interface WordBlock {
  id: string;
  text: string;
  pinyin?: string;
}

interface Level {
  id: number;
  sentence: string;
  pinyin: string;
  translation: string;
  words: WordBlock[];
  correctOrder: string[];
  imageUrl: string;
  theme: string;
}

// 示例关卡数据（简化版，包含6个基础关卡）
const DEMO_LEVELS: Level[] = [
  {
    id: 1,
    theme: '温馨日常',
    sentence: '我每天早上喝一杯咖啡。',
    pinyin: 'Wǒ měitiān zǎoshang hē yī bēi kāfēi.',
    translation: 'I drink a cup of coffee every morning.',
    words: [
      { id: '1-1', text: '我', pinyin: 'Wǒ' },
      { id: '1-2', text: '每天早上', pinyin: 'měitiān zǎoshang' },
      { id: '1-3', text: '喝', pinyin: 'hē' },
      { id: '1-4', text: '一杯咖啡', pinyin: 'yī bēi kāfēi' },
    ],
    correctOrder: ['1-1', '1-2', '1-3', '1-4'],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  },
  {
    id: 2,
    theme: '温馨日常',
    sentence: '周末我喜欢在家里看书。',
    pinyin: 'Zhōumò wǒ xǐhuān zài jiālǐ kànshū.',
    translation: 'I like to read at home on weekends.',
    words: [
      { id: '2-1', text: '周末', pinyin: 'Zhōumò' },
      { id: '2-2', text: '我', pinyin: 'wǒ' },
      { id: '2-3', text: '喜欢', pinyin: 'xǐhuān' },
      { id: '2-4', text: '在家里', pinyin: 'zài jiālǐ' },
      { id: '2-5', text: '看书', pinyin: 'kànshū' },
    ],
    correctOrder: ['2-1', '2-2', '2-3', '2-4', '2-5'],
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
  },
  {
    id: 3,
    theme: '温馨日常',
    sentence: '妈妈正在厨房里做晚饭。',
    pinyin: 'Māma zhèngzài chúfáng lǐ zuò wǎnfàn.',
    translation: 'Mom is cooking dinner in the kitchen.',
    words: [
      { id: '3-1', text: '妈妈', pinyin: 'Māma' },
      { id: '3-2', text: '正在', pinyin: 'zhèngzài' },
      { id: '3-3', text: '厨房里', pinyin: 'chúfáng lǐ' },
      { id: '3-4', text: '做晚饭', pinyin: 'zuò wǎnfàn' },
    ],
    correctOrder: ['3-1', '3-2', '3-3', '3-4'],
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
  },
  {
    id: 4,
    theme: '萌宠',
    sentence: '我有一只可爱的橘猫。',
    pinyin: 'Wǒ yǒu yī zhī kě\'ài de júmāo.',
    translation: 'I have a cute orange cat.',
    words: [
      { id: '4-1', text: '我', pinyin: 'Wǒ' },
      { id: '4-2', text: '有', pinyin: 'yǒu' },
      { id: '4-3', text: '一只', pinyin: 'yī zhī' },
      { id: '4-4', text: '可爱的', pinyin: 'kě\'ài de' },
      { id: '4-5', text: '橘猫', pinyin: 'júmāo' },
    ],
    correctOrder: ['4-1', '4-2', '4-3', '4-4', '4-5'],
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
  },
  {
    id: 5,
    theme: '美食',
    sentence: '这家餐厅的烤鸭非常好吃。',
    pinyin: 'Zhè jiā cāntīng de kǎoyā fēicháng hǎochī.',
    translation: 'This restaurant\'s roast duck is very delicious.',
    words: [
      { id: '5-1', text: '这家', pinyin: 'Zhè jiā' },
      { id: '5-2', text: '餐厅的', pinyin: 'cāntīng de' },
      { id: '5-3', text: '烤鸭', pinyin: 'kǎoyā' },
      { id: '5-4', text: '非常', pinyin: 'fēicháng' },
      { id: '5-5', text: '好吃', pinyin: 'hǎochī' },
    ],
    correctOrder: ['5-1', '5-2', '5-3', '5-4', '5-5'],
    imageUrl: 'https://images.unsplash.com/photo-1600555379765-f82335a05ba5?w=800',
  },
  {
    id: 6,
    theme: '旅游',
    sentence: '我们明天一起去看电影。',
    pinyin: 'Wǒmen míngtiān yīqǐ qù kàn diànyǐng.',
    translation: 'We will go watch a movie together tomorrow.',
    words: [
      { id: '6-1', text: '我们', pinyin: 'Wǒmen' },
      { id: '6-2', text: '明天', pinyin: 'míngtiān' },
      { id: '6-3', text: '一起', pinyin: 'yīqǐ' },
      { id: '6-4', text: '去', pinyin: 'qù' },
      { id: '6-5', text: '看电影', pinyin: 'kàn diànyǐng' },
    ],
    correctOrder: ['6-1', '6-2', '6-3', '6-4', '6-5'],
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  },
];

export default function SyntaxSnapPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [placedWords, setPlacedWords] = useState<(WordBlock | null)[]>([]);
  const [availableWords, setAvailableWords] = useState<WordBlock[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [wrongWordId, setWrongWordId] = useState<string | null>(null);

  const currentLevel = DEMO_LEVELS[currentLevelIndex];
  const wordCount = currentLevel.words.length;

  // 初始化关卡
  useEffect(() => {
    if (!currentLevel) return;
    const shuffled = [...currentLevel.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords(new Array(currentLevel.words.length).fill(null));
    setIsCorrect(false);
  }, [currentLevel]);

  const handleWordClick = (word: WordBlock) => {
    if (isCorrect) return;

    // 找到下一个空槽位
    const nextIndex = placedWords.findIndex(w => w === null);
    if (nextIndex === -1) return;

    // 检查是否是正确的词
    if (word.id === currentLevel.correctOrder[nextIndex]) {
      // 正确
      const newPlaced = [...placedWords];
      newPlaced[nextIndex] = word;
      setPlacedWords(newPlaced);
      setAvailableWords(prev => prev.filter(w => w.id !== word.id));

      // 检查是否完成
      if (newPlaced.every(w => w !== null)) {
        setIsCorrect(true);
      }
    } else {
      // 错误
      setWrongWordId(word.id);
      setTimeout(() => setWrongWordId(null), 500);
    }
  };

  const handleRemoveWord = (index: number) => {
    if (isCorrect) return;

    const word = placedWords[index];
    if (word) {
      const newPlaced = [...placedWords];
      newPlaced[index] = null;
      setPlacedWords(newPlaced);
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleReset = () => {
    const shuffled = [...currentLevel.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords(new Array(currentLevel.words.length).fill(null));
    setIsCorrect(false);
  };

  const handleNext = () => {
    if (currentLevelIndex < DEMO_LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      // 完成所有关卡
      navigate(-1);
    }
  };

  const speakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(currentLevel.sentence);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const correctCount = placedWords.filter(w => w !== null).length;
  const progress = (correctCount / wordCount) * 100;
  const INITIAL_BLUR = 30;
  const currentBlur = isCorrect ? 0 : INITIAL_BLUR - (correctCount * (INITIAL_BLUR / wordCount));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FFF8F0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>

        {/* Progress Bar */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#2AA198', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              关卡 {currentLevelIndex + 1}/{DEMO_LEVELS.length}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#2AA198' }}>{Math.round(progress)}%</Typography>
          </Box>
          <Box sx={{ height: 12, bgcolor: 'rgba(45,52,54,0.08)', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(to right, #2AA198, #268BD2)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </Box>
        </Box>

        {/* Controls */}
        <ButtonBase
          onClick={() => setShowPinyin(!showPinyin)}
          sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            fontWeight: 900,
            fontSize: '0.9rem',
            color: showPinyin ? 'white' : '#586E75',
            bgcolor: showPinyin ? '#2AA198' : 'white',
            border: showPinyin ? '2px solid #2AA198' : '2px solid transparent',
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          {showPinyin ? '拼' : 'Aa'}
        </ButtonBase>

        <ButtonBase
          onClick={handleReset}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { transform: 'rotate(180deg)', transition: 'all 0.5s' } }}
        >
          <RefreshIcon sx={{ fontSize: 20 }} />
        </ButtonBase>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 1.5 : 2, display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2, justifyContent: 'center', bgcolor: '#FFF8F0' }}>
        {/* Picture Area */}
        <Box
          sx={{
            position: 'relative',
            width: '92%',
            maxWidth: 880,
            mx: 'auto',
            height: is960 ? '200px' : '260px',
            minHeight: is960 ? '200px' : '260px',
            bgcolor: 'white',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            border: '6px solid white',
          }}
        >
          <motion.img
            src={currentLevel.imageUrl}
            alt="Scene"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            animate={{
              filter: `blur(${currentBlur}px) grayscale(${isCorrect ? 0 : 0.5})`,
              scale: isCorrect ? 1 : 1.1,
              opacity: isCorrect ? 1 : 0.6,
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Success Overlay */}
          {isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: is960 ? 24 : 32,
              }}
            >
              <Box sx={{ color: 'white', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  {showPinyin && (
                    <Typography sx={{ fontSize: is960 ? '0.9rem' : '1.1rem', fontWeight: 700, color: '#2AA198', mb: 0.5 }}>{currentLevel.pinyin}</Typography>
                  )}
                  <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, mb: 1.5, lineHeight: 1.2 }}>{currentLevel.sentence}</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', fontWeight: 600, opacity: 0.85, fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.2)', px: 2, py: 0.75, borderRadius: '12px', display: 'inline-block' }}>
                    {currentLevel.translation}
                  </Typography>
                </Box>

                <ButtonBase
                  onClick={speakSentence}
                  sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.4)' } }}
                >
                  <VolumeUpIcon sx={{ fontSize: 28 }} />
                </ButtonBase>

                <ButtonBase
                  onClick={handleNext}
                  sx={{
                    px: 4,
                    py: 2.5,
                    borderRadius: '18px',
                    bgcolor: '#2AA198',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: is960 ? '1.1rem' : '1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    boxShadow: '0 8px 24px rgba(42,161,152,0.4)',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  继续 <ArrowForwardIcon sx={{ fontSize: 28 }} />
                </ButtonBase>
              </Box>
            </motion.div>
          )}
        </Box>

        {/* Slots Area */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.25, minHeight: 60 }}>
          {placedWords.map((word, i) => (
            <ButtonBase
              key={i}
              onClick={() => handleRemoveWord(i)}
              sx={{
                minWidth: is960 ? 85 : 100,
                height: is960 ? 56 : 64,
                borderRadius: '16px',
                border: word ? '3px solid #2AA198' : '3px dashed rgba(147,161,161,0.3)',
                bgcolor: word ? 'white' : 'rgba(0,0,0,0.04)',
                boxShadow: word ? '0 4px 12px rgba(42,161,152,0.2)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: word ? 'pointer' : 'default',
                '&:active': word ? { transform: 'scale(0.95)' } : {},
              }}
              disabled={!word}
            >
              <AnimatePresence mode="wait">
                {word ? (
                  <motion.div
                    key={word.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    {showPinyin && word.pinyin && (
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,161,152,0.6)', mb: 0.25 }}>{word.pinyin}</Typography>
                    )}
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.75rem', fontWeight: 900, color: '#2AA198' }}>{word.text}</Typography>
                  </motion.div>
                ) : (
                  <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.5rem', fontWeight: 900, color: 'rgba(147,161,161,0.4)' }}>{i + 1}</Typography>
                )}
              </AnimatePresence>
            </ButtonBase>
          ))}
        </Box>

        {/* Available Words Area */}
        <Box sx={{ bgcolor: '#FFF8F0', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', p: is960 ? 2 : 2.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: is960 ? 1.25 : 1.5 }}>
            <AnimatePresence>
              {availableWords.map((word) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    wrongWordId === word.id
                      ? { x: [-5, 5, -5, 5, 0], backgroundColor: ['#ffffff', '#ff000022', '#ffffff'] }
                      : { opacity: 1, y: 0 }
                  }
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ButtonBase
                    onClick={() => handleWordClick(word)}
                    sx={{
                      px: is960 ? 2 : 2.5,
                      py: is960 ? 1.5 : 1.75,
                      borderRadius: '16px',
                      bgcolor: 'white',
                      color: '#2AA198',
                      fontWeight: 900,
                      fontSize: is960 ? '1.25rem' : '1.5rem',
                      boxShadow: '0 4px 0 rgba(147,161,161,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: '#2AA198', color: 'white', boxShadow: '0 4px 0 #073642' },
                      '&:active': { transform: 'translateY(4px)', boxShadow: 'none' },
                    }}
                  >
                    {showPinyin && word.pinyin && (
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6, mb: 0.2 }}>{word.pinyin}</Typography>
                    )}
                    <span>{word.text}</span>
                  </ButtonBase>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
