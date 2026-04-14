/**
 * Fun Chinese Lesson Page - 学习流程页面
 * 包含 Warmup -> Learn -> Practice -> Complete 等阶段
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import MessageIcon from '@mui/icons-material/ChatBubbleOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

type Phase = 'warmup' | 'learn' | 'cards' | 'practice' | 'complete';
type Language = 'en' | 'vi' | 'th' | 'id';
type ExerciseType = 'tone' | 'match';

interface VocabItem {
  id: string;
  chinese: string;
  pinyin: string;
  translations: {
    en: string;
    vi: string;
    th?: string;
    id?: string;
  };
  tones: number[];
  hskLevel: number;
  partOfSpeech: string;
  partOfSpeechTranslations: {
    en: string;
    vi: string;
  };
}

interface DialogueLine {
  role: 'A' | 'B';
  speaker: string;
  chinese: string;
  pinyin: string;
  translation: {
    en: string;
    vi: string;
  };
}

interface KnowledgeCard {
  type: 'dialogue' | 'grammar' | 'pattern';
  title: string;
  titleVi: string;
  content: {
    scene?: string;
    dialogueLines?: DialogueLine[];
    point?: string;
    function?: string;
    formula?: string;
    examples?: { chinese: string; pinyin: string; translation: string }[];
  };
}

interface Exercise {
  type: ExerciseType;
  question: string;
  options?: string[];
  answer?: string;
  pairs?: { zh: string; vi: string }[];
}

const LESSON_DATA = {
  title: '你好',
  titleEn: 'Hello',
  warmup: {
    scene: '🏫 越南某学校第一天',
    description: '一个中国同学转学来了，你会怎么和他打招呼？',
    exampleVi: 'Xin chào',
    exampleZh: '你好',
  },
  knowledgeCards: [
    {
      type: 'dialogue' as const,
      title: '打招呼',
      titleVi: 'Chào hỏi',
      content: {
        scene: 'Gặp bạn bè lần đầu hoặc chào buổi sáng',
        dialogueLines: [
          {
            role: 'A',
            speaker: '小明',
            chinese: '你好！',
            pinyin: 'Nǐ hǎo!',
            translation: { en: 'Hello!', vi: 'Xin chào!' }
          },
          {
            role: 'B',
            speaker: 'An',
            chinese: '你好！',
            pinyin: 'Nǐ hǎo!',
            translation: { en: 'Hello!', vi: 'Xin chào!' }
          },
          {
            role: 'A',
            speaker: '小明',
            chinese: '你好吗？',
            pinyin: 'Nǐ hǎo ma?',
            translation: { en: 'How are you?', vi: 'Bạn có khỏe không?' }
          },
          {
            role: 'B',
            speaker: 'An',
            chinese: '我很好。谢谢！',
            pinyin: 'Wǒ hěn hǎo. Xièxie!',
            translation: { en: 'I am fine. Thank you!', vi: 'Tôi khỏe. Cảm ơn!' }
          },
        ]
      }
    },
    {
      type: 'grammar' as const,
      title: '语气助词',
      titleVi: 'Trợ từ ngữ khí',
      content: {
        point: '吗 (ma)',
        function: 'Biến câu trần thuật thành câu hỏi Yes/No',
        formula: '[ 陈述句 ] + 吗 → 是/否疑问句',
      }
    },
    {
      type: 'pattern' as const,
      title: '句型练习',
      titleVi: 'Luyện mẫu câu',
      content: {
        formula: '主语 + 很 + 形容词',
        function: '表达状态或性质程度',
        examples: [
          { chinese: '我很好', pinyin: 'Wǒ hěn hǎo', translation: 'Tôi rất khỏe' },
          { chinese: '你很好', pinyin: 'Nǐ hěn hǎo', translation: 'Bạn rất khỏe' },
          { chinese: '他很高', pinyin: 'Tā hěn gāo', translation: 'Anh ấy rất cao' },
        ]
      }
    }
  ] as KnowledgeCard[],
  practice: [
    {
      type: 'tone' as const,
      question: '你听到的是哪个声调？',
      options: ['1声', '2声', '3声', '4声'],
      answer: '3声'
    },
    {
      type: 'match' as const,
      question: '连一连，词义配对',
      pairs: [
        { zh: '你好', vi: 'Xin chào' },
        { zh: '谢谢', vi: 'Cảm ơn' },
        { zh: '我', vi: 'Tôi' },
      ]
    }
  ] as Exercise[],
  vocabulary: [
    { 
      id: 'v1', 
      chinese: '你', 
      pinyin: 'nǐ', 
      translations: { en: 'you', vi: 'bạn', th: 'คุณ', id: 'kamu' }, 
      tones: [3],
      hskLevel: 1,
      partOfSpeech: '代词',
      partOfSpeechTranslations: { en: 'pronoun', vi: 'đại từ' }
    },
    { 
      id: 'v2', 
      chinese: '好', 
      pinyin: 'hǎo', 
      translations: { en: 'good', vi: 'tốt', th: 'ดี', id: 'baik' }, 
      tones: [3],
      hskLevel: 1,
      partOfSpeech: '形容词',
      partOfSpeechTranslations: { en: 'adjective', vi: 'tính từ' }
    },
    { 
      id: 'v3', 
      chinese: '你好', 
      pinyin: 'nǐ hǎo', 
      translations: { en: 'hello', vi: 'xin chào', th: 'สวัสดี', id: 'halo' }, 
      tones: [3, 3],
      hskLevel: 1,
      partOfSpeech: '问候语',
      partOfSpeechTranslations: { en: 'greeting', vi: 'lời chào' }
    },
    { 
      id: 'v4', 
      chinese: '吗', 
      pinyin: 'ma', 
      translations: { en: 'modal particle', vi: '(ngữ khí từ)', th: '(คำช่วยกริยา)', id: '(partikel)' }, 
      tones: [0],
      hskLevel: 1,
      partOfSpeech: '助词',
      partOfSpeechTranslations: { en: 'particle', vi: 'trợ từ' }
    },
    { 
      id: 'v5', 
      chinese: '你好吗', 
      pinyin: 'nǐ hǎo ma', 
      translations: { en: 'how are you', vi: 'bạn có khỏe không', th: 'คุณสบายดีไหม', id: 'apa kabar' }, 
      tones: [3, 3, 0],
      hskLevel: 1,
      partOfSpeech: '问候语',
      partOfSpeechTranslations: { en: 'greeting', vi: 'lời chào' }
    },
    { 
      id: 'v6', 
      chinese: '我', 
      pinyin: 'wǒ', 
      translations: { en: 'I / me', vi: 'tôi', th: 'ฉัน', id: 'saya' }, 
      tones: [3],
      hskLevel: 1,
      partOfSpeech: '代词',
      partOfSpeechTranslations: { en: 'pronoun', vi: 'đại từ' }
    },
    { 
      id: 'v7', 
      chinese: '很', 
      pinyin: 'hěn', 
      translations: { en: 'very', vi: 'rất', th: 'มาก', id: 'sangat' }, 
      tones: [3],
      hskLevel: 1,
      partOfSpeech: '副词',
      partOfSpeechTranslations: { en: 'adverb', vi: 'trạng từ' }
    },
  ],
};

export default function FunChineseLessonPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [currentPhase, setCurrentPhase] = useState<Phase>('warmup');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  // TODO: 从用户设置或系统语言获取，目前默认越南语
  const [userLanguage] = useState<Language>('vi');

  const orange = '#FF7A45';
  const teal = '#14B8A6';

  // 追踪已出现的单个汉字
  const getSeenCharacters = (): Set<string> => {
    const seen = new Set<string>();
    for (let i = 0; i < vocabIndex; i++) {
      const vocab = LESSON_DATA.vocabulary[i];
      if (vocab.chinese.length === 1) {
        seen.add(vocab.chinese);
      }
    }
    return seen;
  };

  const currentVocab = LESSON_DATA.vocabulary[vocabIndex];
  const seenChars = getSeenCharacters();
  
  // 判断当前词是否为单字且首次出现
  const isSingleChar = currentVocab.chinese.length === 1;
  const isFirstTimeChar = isSingleChar && !seenChars.has(currentVocab.chinese);
  const shouldShowWriting = isFirstTimeChar;
  const shouldShowTones = isFirstTimeChar;

  const handleNextPhase = () => {
    if (currentPhase === 'warmup') {
      setCurrentPhase('learn');
    } else if (currentPhase === 'learn') {
      setCurrentPhase('cards');
      setCardIndex(0);
    } else if (currentPhase === 'cards') {
      setCurrentPhase('practice');
      setExerciseIndex(0);
    } else if (currentPhase === 'practice') {
      setCurrentPhase('complete');
    }
  };

  const handlePrevVocab = () => {
    if (vocabIndex > 0) {
      setVocabIndex(vocabIndex - 1);
    }
  };

  const handleNextVocab = () => {
    if (vocabIndex < LESSON_DATA.vocabulary.length - 1) {
      setVocabIndex(vocabIndex + 1);
    } else {
      handleNextPhase();
    }
  };

  // Warmup Phase
  if (currentPhase === 'warmup') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FDF6E9',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: is960 ? 12 : 20,
            right: is960 ? 12 : 20,
            width: is960 ? 44 : 52,
            height: is960 ? 44 : 52,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.04)',
            color: '#64748B',
            zIndex: 10,
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <CloseIcon sx={{ fontSize: is960 ? 24 : 28 }} />
        </ButtonBase>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: is960 ? 2.5 : 3.5,
            gap: is960 ? 2 : 2.5,
            minHeight: 0,
          }}
        >
          {/* Compact Scene Info */}
          <Box
            sx={{
              px: is960 ? 2 : 2.5,
              py: is960 ? 1.5 : 2,
              bgcolor: 'white',
              borderRadius: is960 ? '18px' : '22px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '2px solid rgba(0,0,0,0.04)',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
              <Typography sx={{ fontSize: is960 ? '1.2rem' : '1.4rem' }}>{LESSON_DATA.warmup.scene.split(' ')[0]}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.1rem', fontWeight: 800, color: '#1E293B', flex: 1 }}>
                {LESSON_DATA.warmup.scene.split(' ').slice(1).join(' ')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#64748B', fontWeight: 600 }}>
              {LESSON_DATA.warmup.description}
            </Typography>
          </Box>

          {/* Knowledge List - Language Comparison */}
          <Box
            sx={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: is960 ? 2 : 2.5,
              minHeight: 0,
            }}
          >
            {/* Vietnamese Column */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: is960 ? '20px' : '26px',
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: is960 ? 2 : 2.5,
                  py: is960 ? 1.5 : 2,
                  bgcolor: '#F8FAFC',
                  borderBottom: '2px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.6rem' }}>🇻🇳</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '0.08em' }}>
                  VIETNAMESE
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: is960 ? 1.5 : 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 0.75 : 1,
                }}
              >
                {LESSON_DATA.vocabulary.map((vocab) => (
                  <Box
                    key={vocab.id}
                    sx={{
                      p: is960 ? 1 : 1.25,
                      bgcolor: '#F8FAFC',
                      borderRadius: is960 ? '10px' : '12px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 700, color: '#475569', mb: 0.25 }}>
                      {vocab.translations[userLanguage] || vocab.translations.en}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                      {vocab.chinese} · {vocab.pinyin}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Chinese Column */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: is960 ? '20px' : '26px',
                border: `2px solid ${orange}30`,
                boxShadow: `0 4px 16px ${orange}15`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: is960 ? 2 : 2.5,
                  py: is960 ? 1.5 : 2,
                  bgcolor: `${orange}08`,
                  borderBottom: `2px solid ${orange}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.6rem' }}>🇨🇳</Typography>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', fontWeight: 800, color: orange, letterSpacing: '0.08em' }}>
                  中文
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: is960 ? 1.5 : 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 0.75 : 1,
                }}
              >
                {LESSON_DATA.vocabulary.map((vocab) => (
                  <Box
                    key={vocab.id}
                    sx={{
                      p: is960 ? 1 : 1.25,
                      bgcolor: `${orange}05`,
                      borderRadius: is960 ? '10px' : '12px',
                      border: `1px solid ${orange}20`,
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#1E293B', mb: 0.25 }}>
                      {vocab.chinese}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: orange, fontWeight: 700, mb: 0.25 }}>
                      {vocab.pinyin}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      {vocab.translations[userLanguage] || vocab.translations.en}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Bottom Actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexShrink: 0,
            }}
          >
            {/* Learning Goal */}
            <Box
              sx={{
                flex: 1,
                px: is960 ? 2 : 2.5,
                py: is960 ? 1.25 : 1.5,
                bgcolor: `${teal}10`,
                borderRadius: is960 ? '16px' : '20px',
                border: `2px solid ${teal}30`,
              }}
            >
              <Typography
                sx={{
                  color: teal,
                  fontSize: is960 ? '0.82rem' : '0.92rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                💡 <Box component="span">今天学完，你能用中文和新同学打招呼！</Box>
              </Typography>
            </Box>

            <ButtonBase
              onClick={handleNextPhase}
              sx={{
                px: is960 ? 4 : 5,
                py: is960 ? 1.35 : 1.65,
                bgcolor: orange,
                color: 'white',
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '1.05rem' : '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: `0 12px 28px ${orange}40`,
                flexShrink: 0,
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              开始学习
              <PlayArrowIcon sx={{ fontSize: is960 ? 22 : 26 }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    );
  }

  // Learn Phase - Vocabulary Cards
  if (currentPhase === 'learn') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FDF6E9',
          p: is960 ? 2 : 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: is960 ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: is960 ? 40 : 48,
                height: is960 ? 40 : 48,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: orange,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: is960 ? '1.05rem' : '1.2rem',
                fontWeight: 800,
              }}
            >
              1
            </Box>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#1E293B' }}>
              生词学习
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#94A3B8', fontWeight: 700 }}>
              {vocabIndex + 1} / {LESSON_DATA.vocabulary.length}
            </Typography>
            <ButtonBase
              onClick={() => navigate(-1)}
              sx={{
                width: is960 ? 36 : 40,
                height: is960 ? 36 : 40,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#64748B',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <CloseIcon sx={{ fontSize: is960 ? 20 : 22 }} />
            </ButtonBase>
          </Box>
        </Box>

        {/* Vocabulary Card */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: is960 ? 2 : 3,
            minHeight: 0,
          }}
        >
          <ButtonBase
            onClick={handlePrevVocab}
            disabled={vocabIndex === 0}
            sx={{
              width: is960 ? 56 : 64,
              height: is960 ? 56 : 64,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.05)',
              opacity: vocabIndex === 0 ? 0 : 1,
              pointerEvents: vocabIndex === 0 ? 'none' : 'auto',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 36 : 44, color: '#94A3B8' }} />
          </ButtonBase>

          <Box
            sx={{
              width: is960 ? 420 : 580,
              aspectRatio: '1',
              bgcolor: 'white',
              borderRadius: is960 ? '36px' : '48px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
              border: '3px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: is960 ? 3.5 : 5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                bgcolor: orange,
              }}
            />

            {/* HSK Level and Part of Speech Tags */}
            <Box
              sx={{
                position: 'absolute',
                top: is960 ? 20 : 28,
                left: is960 ? 20 : 28,
                display: 'flex',
                gap: 1.2,
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.6 : 0.75,
                  bgcolor: `${orange}`,
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: is960 ? '0.78rem' : '0.88rem',
                  fontWeight: 800,
                  boxShadow: `0 4px 12px ${orange}50`,
                }}
              >
                HSK {currentVocab.hskLevel}
              </Box>
              <Box
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.6 : 0.75,
                  bgcolor: `${teal}`,
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: is960 ? '0.78rem' : '0.88rem',
                  fontWeight: 800,
                  boxShadow: `0 4px 12px ${teal}50`,
                }}
              >
                {currentVocab.partOfSpeech}
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 
                  currentVocab.chinese.length === 1 
                    ? is960 ? '7rem' : '9rem'
                    : currentVocab.chinese.length === 2
                    ? is960 ? '5.5rem' : '7.5rem'
                    : is960 ? '4rem' : '5.5rem',
                fontWeight: 900,
                color: '#1E293B',
                lineHeight: 1,
                mb: is960 ? 1.5 : 2,
              }}
            >
              {currentVocab.chinese}
            </Typography>

            {/* Pinyin with Tone Tags (only for single chars first appearance) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: is960 ? '1.85rem' : '2.5rem',
                  fontWeight: 700,
                  color: orange,
                }}
              >
                {currentVocab.pinyin}
              </Typography>
              {shouldShowTones && currentVocab.tones.map((tone, i) => (
                <Box
                  key={i}
                  sx={{
                    px: is960 ? 1.1 : 1.4,
                    py: is960 ? 0.45 : 0.6,
                    bgcolor: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: is960 ? '0.72rem' : '0.82rem',
                    fontWeight: 800,
                    color: '#64748B',
                    border: '2px solid #E2E8F0',
                  }}
                >
                  {tone === 0 ? '轻声' : `${tone}声`}
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: is960 ? '1.25rem' : '1.55rem',
                color: '#94A3B8',
                fontWeight: 600,
                mb: is960 ? 3.5 : 4.5,
              }}
            >
              {currentVocab.translations[userLanguage] || currentVocab.translations.en}
            </Typography>

            <Box sx={{ width: '80%', height: 1.5, bgcolor: '#E2E8F0', mb: is960 ? 3 : 3.5 }} />

            <Box sx={{ display: 'flex', gap: is960 ? 2 : 2.5 }}>
              {/* Writing Practice Button - Only for single chars first appearance */}
              {shouldShowWriting && (
                <ButtonBase
                  onClick={() => {
                    navigate(`/character-writing/${encodeURIComponent(currentVocab.chinese)}`);
                  }}
                  sx={{
                    px: is960 ? 2.5 : 3.5,
                    py: is960 ? 1.25 : 1.6,
                    borderRadius: is960 ? '16px' : '20px',
                    bgcolor: `${teal}15`,
                    color: teal,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: is960 ? '0.95rem' : '1.12rem',
                    fontWeight: 800,
                    border: `2px solid ${teal}30`,
                    '&:hover': {
                      bgcolor: `${teal}25`,
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: is960 ? 20 : 24 }} />
                  练习书写
                </ButtonBase>
              )}

              <ButtonBase
                sx={{
                  width: is960 ? 64 : 76,
                  height: is960 ? 64 : 76,
                  borderRadius: is960 ? '18px' : '22px',
                  bgcolor: `${orange}15`,
                  color: orange,
                  '&:hover': {
                    bgcolor: `${orange}25`,
                  },
                }}
              >
                <VolumeUpIcon sx={{ fontSize: is960 ? 32 : 38 }} />
              </ButtonBase>
            </Box>
          </Box>

          <ButtonBase
            onClick={handleNextVocab}
            sx={{
              width: is960 ? 56 : 64,
              height: is960 ? 56 : 64,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: is960 ? 36 : 44, color: '#94A3B8' }} />
          </ButtonBase>
        </Box>

        {/* Progress Dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: is960 ? 2.5 : 3.5 }}>
          {LESSON_DATA.vocabulary.map((_, i) => (
            <Box
              key={i}
              sx={{
                height: is960 ? 7 : 8,
                borderRadius: '999px',
                bgcolor: i === vocabIndex ? orange : '#E2E8F0',
                width: i === vocabIndex ? is960 ? 36 : 40 : is960 ? 7 : 8,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Complete Phase
  if (currentPhase === 'complete') {
    const handleRestart = () => {
      setCurrentPhase('warmup');
      setVocabIndex(0);
      setCardIndex(0);
      setExerciseIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setLeftSelected(null);
      setRightSelected(null);
      setMatchedPairs([]);
    };

    const handleNextLesson = () => {
      // Get current lesson ID and navigate to next lesson
      const currentLessonId = parseInt(lessonId || '1');
      const nextLessonId = currentLessonId + 1;
      navigate(`/library/hub/fun-chinese/lesson/${nextLessonId}`);
    };

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FDF6E9',
          p: is960 ? 3 : 4,
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: is960 ? 80 : 100, color: teal, mb: 3 }} />
        <Typography sx={{ fontSize: is960 ? '1.8rem' : '2.25rem', fontWeight: 900, color: '#1E293B', mb: 2 }}>
          恭喜完成！
        </Typography>
        <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.25rem', color: '#64748B', fontWeight: 600, mb: is960 ? 4 : 5 }}>
          你已经学会了基本的中文问候语
        </Typography>

        {/* Statistics Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: is960 ? 1.5 : 2,
            width: '100%',
            maxWidth: is960 ? 480 : 600,
            mb: is960 ? 4 : 5,
          }}
        >
          <Box
            sx={{
              p: is960 ? 1.5 : 2,
              bgcolor: 'white',
              borderRadius: is960 ? '16px' : '20px',
              border: '2px solid #E2E8F0',
            }}
          >
            <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.8rem', fontWeight: 900, color: orange, lineHeight: 1 }}>
              {LESSON_DATA.vocabulary.length}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              生词掌握
            </Typography>
          </Box>
          <Box
            sx={{
              p: is960 ? 1.5 : 2,
              bgcolor: 'white',
              borderRadius: is960 ? '16px' : '20px',
              border: '2px solid #E2E8F0',
            }}
          >
            <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.8rem', fontWeight: 900, color: '#3B82F6', lineHeight: 1 }}>
              {LESSON_DATA.knowledgeCards.length}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              知识点
            </Typography>
          </Box>
          <Box
            sx={{
              p: is960 ? 1.5 : 2,
              bgcolor: 'white',
              borderRadius: is960 ? '16px' : '20px',
              border: '2px solid #E2E8F0',
            }}
          >
            <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.8rem', fontWeight: 900, color: teal, lineHeight: 1 }}>
              {LESSON_DATA.practice.length}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5 }}>
              练习完成
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2, width: '100%', maxWidth: is960 ? 380 : 480 }}>
          <ButtonBase
            onClick={handleNextLesson}
            sx={{
              py: is960 ? 1.5 : 1.8,
              bgcolor: teal,
              color: 'white',
              borderRadius: is960 ? '18px' : '22px',
              fontSize: is960 ? '1.08rem' : '1.28rem',
              fontWeight: 800,
              boxShadow: `0 12px 28px ${teal}40`,
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            进入下一课
          </ButtonBase>

          <Box sx={{ display: 'flex', gap: is960 ? 1.5 : 2 }}>
            <ButtonBase
              onClick={handleRestart}
              sx={{
                flex: 1,
                py: is960 ? 1.25 : 1.5,
                bgcolor: 'white',
                color: '#64748B',
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '0.92rem' : '1.05rem',
                fontWeight: 800,
                border: '2px solid #E2E8F0',
                '&:hover': {
                  borderColor: teal,
                  color: teal,
                },
              }}
            >
              重新学习
            </ButtonBase>
            <ButtonBase
              onClick={() => navigate(-1)}
              sx={{
                flex: 1,
                py: is960 ? 1.25 : 1.5,
                bgcolor: 'white',
                color: '#64748B',
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '0.92rem' : '1.05rem',
                fontWeight: 800,
                border: '2px solid #E2E8F0',
                '&:hover': {
                  borderColor: '#94A3B8',
                  color: '#475569',
                },
              }}
            >
              返回课程
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    );
  }

  // Cards Phase - Knowledge Cards
  if (currentPhase === 'cards') {
    const currentCard = LESSON_DATA.knowledgeCards[cardIndex];

    const handleNextCard = () => {
      if (cardIndex < LESSON_DATA.knowledgeCards.length - 1) {
        setCardIndex(cardIndex + 1);
      } else {
        handleNextPhase();
      }
    };

    const handlePrevCard = () => {
      if (cardIndex > 0) {
        setCardIndex(cardIndex - 1);
      }
    };

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FDF6E9',
          p: is960 ? 2 : 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: is960 ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: is960 ? 40 : 48,
                height: is960 ? 40 : 48,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: '#3B82F6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: is960 ? '1.05rem' : '1.2rem',
                fontWeight: 800,
              }}
            >
              2
            </Box>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#1E293B' }}>
              知识整理
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {LESSON_DATA.knowledgeCards.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: is960 ? 8 : 10,
                    height: is960 ? 8 : 10,
                    borderRadius: '50%',
                    bgcolor: i === cardIndex ? '#3B82F6' : '#E2E8F0',
                    transform: i === cardIndex ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </Box>
            <ButtonBase
              onClick={() => navigate(-1)}
              sx={{
                width: is960 ? 36 : 40,
                height: is960 ? 36 : 40,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#64748B',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <CloseIcon sx={{ fontSize: is960 ? 20 : 22 }} />
            </ButtonBase>
          </Box>
        </Box>

        {/* Knowledge Card */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, px: is960 ? 1 : 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: is960 ? 500 : 680,
              maxHeight: '92%',
              bgcolor: 'white',
              borderRadius: is960 ? '26px' : '32px',
              boxShadow: '0 20px 56px rgba(0,0,0,0.12)',
              border: '2px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                p: is960 ? 2 : 2.5,
                bgcolor: currentCard.type === 'dialogue' ? orange : currentCard.type === 'pattern' ? teal : '#3B82F6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {currentCard.type === 'dialogue' ? (
                  <MessageIcon sx={{ fontSize: is960 ? 28 : 32 }} />
                ) : currentCard.type === 'pattern' ? (
                  <ViewModuleIcon sx={{ fontSize: is960 ? 28 : 32 }} />
                ) : (
                  <BoltIcon sx={{ fontSize: is960 ? 28 : 32 }} />
                )}
                <Box>
                  <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800 }}>
                    {currentCard.title}
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', opacity: 0.9, fontWeight: 600 }}>
                    {currentCard.titleVi}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.5 : 0.6,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  borderRadius: '999px',
                  fontSize: is960 ? '0.65rem' : '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                }}
              >
                {currentCard.type.toUpperCase()}
              </Box>
            </Box>

            {/* Card Content */}
            <Box sx={{ p: is960 ? 2.5 : 3.5, flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {currentCard.type === 'dialogue' ? (
                <Box>
                  <Box
                    sx={{
                      p: is960 ? 1.5 : 2,
                      bgcolor: `${orange}10`,
                      borderRadius: is960 ? '14px' : '18px',
                      borderLeft: `5px solid ${orange}`,
                      mb: is960 ? 2 : 2.5,
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: orange, fontWeight: 800, mb: 0.4 }}>
                      场景说明 / Tình huống:
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#64748B', fontWeight: 600 }}>
                      {currentCard.content.scene}
                    </Typography>
                  </Box>
                  
                  {/* Dialogue Lines */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.2 : 1.5 }}>
                    {currentCard.content.dialogueLines?.map((line, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: is960 ? 1.4 : 1.8,
                          bgcolor: line.role === 'A' ? `${orange}08` : '#F8FAFC',
                          borderRadius: is960 ? '14px' : '18px',
                          borderLeft: `4px solid ${line.role === 'A' ? orange : teal}`,
                        }}
                      >
                        <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.72rem', color: line.role === 'A' ? orange : teal, fontWeight: 800, mb: 0.4 }}>
                          {line.speaker}:
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: is960 ? '1.08rem' : '1.32rem',
                            fontWeight: 800,
                            color: '#1E293B',
                            mb: 0.4,
                            lineHeight: 1.3,
                          }}
                        >
                          {line.chinese}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: line.role === 'A' ? orange : teal, fontWeight: 600, mb: 0.5 }}>
                          {line.pinyin}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#64748B', fontWeight: 600 }}>
                          {line.translation[userLanguage] || line.translation.en}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : currentCard.type === 'pattern' ? (
                <Box>
                  <Box
                    sx={{
                      p: is960 ? 1.8 : 2.5,
                      bgcolor: '#0F172A',
                      borderRadius: is960 ? '16px' : '22px',
                      textAlign: 'center',
                      mb: is960 ? 1.8 : 2.5,
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.7rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em', mb: 0.8 }}>
                      句型公式 / CÔNG THỨC
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.45rem', color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>
                      {currentCard.content.formula}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: is960 ? 1.5 : 2,
                      bgcolor: `${teal}10`,
                      borderRadius: is960 ? '14px' : '18px',
                      borderLeft: `5px solid ${teal}`,
                      mb: is960 ? 1.8 : 2.5,
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: teal, fontWeight: 800, mb: 0.4 }}>
                      功能 / Chức năng:
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#64748B', fontWeight: 600 }}>
                      {currentCard.content.function}
                    </Typography>
                  </Box>
                  
                  {/* Pattern Examples */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.2 }}>
                    {currentCard.content.examples?.map((example, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: is960 ? 1.2 : 1.6,
                          bgcolor: 'white',
                          borderRadius: is960 ? '12px' : '16px',
                          border: '2px solid #F1F5F9',
                        }}
                      >
                        <Typography sx={{ fontSize: is960 ? '1rem' : '1.22rem', fontWeight: 800, color: '#1E293B', mb: 0.35, lineHeight: 1.2 }}>
                          {example.chinese}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: teal, fontWeight: 600, mb: 0.35 }}>
                          {example.pinyin}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600 }}>
                          {example.translation}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: is960 ? 1.5 : 2, mb: is960 ? 2 : 2.5 }}>
                    <Box
                      sx={{
                        p: is960 ? 1.8 : 2.5,
                        bgcolor: '#EFF6FF',
                        borderRadius: is960 ? '16px' : '22px',
                      }}
                    >
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#3B82F6', fontWeight: 800, mb: 1 }}>
                        核心语法点 / Điểm ngữ pháp:
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#3B82F6' }}>
                        {currentCard.content.point}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: is960 ? 1.8 : 2.5,
                        bgcolor: '#F8FAFC',
                        borderRadius: is960 ? '16px' : '22px',
                      }}
                    >
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 800, mb: 1 }}>
                        功能 / Chức năng:
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.98rem', color: '#64748B', fontWeight: 600, lineHeight: 1.5 }}>
                        {currentCard.content.function}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: is960 ? 1.8 : 2.5,
                      bgcolor: '#0F172A',
                      borderRadius: is960 ? '16px' : '22px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.7rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em', mb: 1 }}>
                      句型公式 / CÔNG THỨC
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.45rem', color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>
                      {currentCard.content.formula}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Card Footer */}
            <Box
              sx={{
                p: is960 ? 2 : 2.5,
                bgcolor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <ButtonBase
                onClick={handlePrevCard}
                disabled={cardIndex === 0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: '#94A3B8',
                  fontSize: is960 ? '0.88rem' : '1rem',
                  fontWeight: 700,
                  opacity: cardIndex === 0 ? 0 : 1,
                  pointerEvents: cardIndex === 0 ? 'none' : 'auto',
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : 24 }} />
                上一张
              </ButtonBase>
              <ButtonBase
                onClick={handleNextCard}
                sx={{
                  px: is960 ? 3 : 4,
                  py: is960 ? 1 : 1.25,
                  bgcolor: '#0F172A',
                  color: 'white',
                  borderRadius: is960 ? '12px' : '14px',
                  fontSize: is960 ? '0.88rem' : '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    bgcolor: '#1E293B',
                  },
                }}
              >
                {cardIndex === LESSON_DATA.knowledgeCards.length - 1 ? '开始练习' : '下一张'}
                <ChevronRightIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Practice Phase
  if (currentPhase === 'practice') {
    const currentExercise = LESSON_DATA.practice[exerciseIndex];
    
    // 检查当前题目是否完成
    const isExerciseComplete = 
      currentExercise.type === 'tone' 
        ? isCorrect === true
        : currentExercise.type === 'match'
        ? matchedPairs.length === currentExercise.pairs?.length
        : false;

    const handleCheckAnswer = (answer: string) => {
      setSelectedAnswer(answer);
      const correct = answer === currentExercise.answer;
      setIsCorrect(correct);
    };

    const handleMatch = (val: string, side: 'left' | 'right') => {
      if (side === 'left') {
        setLeftSelected(val);
        if (rightSelected) {
          checkMatch(val, rightSelected);
        }
      } else {
        setRightSelected(val);
        if (leftSelected) {
          checkMatch(leftSelected, val);
        }
      }
    };

    const checkMatch = (left: string, right: string) => {
      const pair = currentExercise.pairs?.find(p => p.zh === left && p.vi === right);
      if (pair) {
        const newMatched = [...matchedPairs, left];
        setMatchedPairs(newMatched);
        setLeftSelected(null);
        setRightSelected(null);
      } else {
        // 错误配对，显示错误状态
        setIsCorrect(false);
        setTimeout(() => {
          setLeftSelected(null);
          setRightSelected(null);
          setIsCorrect(null);
        }, 1000);
      }
    };

    const handleNextExercise = () => {
      if (exerciseIndex < LESSON_DATA.practice.length - 1) {
        setExerciseIndex(exerciseIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setLeftSelected(null);
        setRightSelected(null);
        setMatchedPairs([]);
      } else {
        // 最后一题完成，进入完成阶段
        handleNextPhase();
      }
    };

    const handlePrevExercise = () => {
      if (exerciseIndex > 0) {
        setExerciseIndex(exerciseIndex - 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setLeftSelected(null);
        setRightSelected(null);
        setMatchedPairs([]);
      }
    };

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FDF6E9',
          p: is960 ? 2 : 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: is960 ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: is960 ? 40 : 48,
                height: is960 ? 40 : 48,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: teal,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: is960 ? '1.05rem' : '1.2rem',
                fontWeight: 800,
              }}
            >
              3
            </Box>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#1E293B' }}>
              练一练
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#94A3B8', fontWeight: 700 }}>
              进度: {exerciseIndex + 1} / {LESSON_DATA.practice.length}
            </Typography>
            <ButtonBase
              onClick={() => navigate(-1)}
              sx={{
                width: is960 ? 36 : 40,
                height: is960 ? 36 : 40,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#64748B',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <CloseIcon sx={{ fontSize: is960 ? 20 : 22 }} />
            </ButtonBase>
          </Box>
        </Box>

        {/* Exercise Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <Typography
            sx={{
              fontSize: is960 ? '1.5rem' : '1.85rem',
              fontWeight: 800,
              color: '#1E293B',
              textAlign: 'center',
              mb: is960 ? 4 : 6,
            }}
          >
            {currentExercise.question}
          </Typography>

          {/* Tone Exercise */}
          {currentExercise.type === 'tone' && (
            <Box sx={{ width: '100%', maxWidth: 640 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: is960 ? 4 : 6 }}>
                <ButtonBase
                  sx={{
                    width: is960 ? 80 : 96,
                    height: is960 ? 80 : 96,
                    borderRadius: '50%',
                    bgcolor: orange,
                    color: 'white',
                    boxShadow: `0 12px 28px ${orange}40`,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: is960 ? 36 : 44 }} />
                </ButtonBase>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: is960 ? 1.5 : 2 }}>
                {currentExercise.options?.map((opt) => (
                  <ButtonBase
                    key={opt}
                    onClick={() => handleCheckAnswer(opt)}
                    disabled={isCorrect === true}
                    sx={{
                      p: is960 ? 2.5 : 3,
                      borderRadius: is960 ? '18px' : '22px',
                      fontSize: is960 ? '1.15rem' : '1.35rem',
                      fontWeight: 800,
                      border: '3px solid',
                      borderColor:
                        selectedAnswer === opt
                          ? isCorrect
                            ? teal
                            : '#EF4444'
                          : '#E2E8F0',
                      bgcolor:
                        selectedAnswer === opt
                          ? isCorrect
                            ? `${teal}15`
                            : '#FEE2E2'
                          : 'white',
                      color:
                        selectedAnswer === opt
                          ? isCorrect
                            ? teal
                            : '#EF4444'
                          : '#64748B',
                      '&:hover': {
                        borderColor: orange,
                      },
                    }}
                  >
                    {opt}
                  </ButtonBase>
                ))}
              </Box>

              {isCorrect !== null && (
                <Box
                  sx={{
                    mt: is960 ? 3 : 4,
                    p: is960 ? 2 : 2.5,
                    borderRadius: is960 ? '16px' : '20px',
                    bgcolor: isCorrect ? `${teal}15` : '#FEE2E2',
                    color: isCorrect ? teal : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    fontSize: is960 ? '1.05rem' : '1.25rem',
                    fontWeight: 800,
                  }}
                >
                  {isCorrect ? (
                    <>
                      <CheckIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                      太棒了！正确答案
                    </>
                  ) : (
                    <>
                      <ClearIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                      再试一次哦
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Match Exercise */}
          {currentExercise.type === 'match' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: is960 ? 8 : 12, width: '100%', maxWidth: 840 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
                  {currentExercise.pairs?.map((p) => (
                    <ButtonBase
                      key={p.zh}
                      onClick={() => !matchedPairs.includes(p.zh) && handleMatch(p.zh, 'left')}
                      disabled={matchedPairs.includes(p.zh)}
                      sx={{
                        p: is960 ? 2 : 2.5,
                        borderRadius: is960 ? '16px' : '20px',
                        fontSize: is960 ? '1.15rem' : '1.35rem',
                        fontWeight: 800,
                        border: '3px solid',
                        borderColor: matchedPairs.includes(p.zh) ? teal : leftSelected === p.zh ? orange : '#E2E8F0',
                        bgcolor: matchedPairs.includes(p.zh) ? `${teal}15` : leftSelected === p.zh ? `${orange}15` : 'white',
                        color: matchedPairs.includes(p.zh) ? teal : leftSelected === p.zh ? orange : '#64748B',
                        opacity: matchedPairs.includes(p.zh) ? 0.6 : 1,
                      }}
                    >
                      {p.zh}
                    </ButtonBase>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
                  {currentExercise.pairs
                    ?.map((p) => p.vi)
                    .sort()
                    .map((vi) => {
                      const isMatched = matchedPairs.some((mp) => currentExercise.pairs?.find((cp) => cp.zh === mp)?.vi === vi);
                      return (
                        <ButtonBase
                          key={vi}
                          onClick={() => !isMatched && handleMatch(vi, 'right')}
                          disabled={isMatched}
                          sx={{
                            p: is960 ? 2 : 2.5,
                            borderRadius: is960 ? '16px' : '20px',
                            fontSize: is960 ? '1.15rem' : '1.35rem',
                            fontWeight: 800,
                            border: '3px solid',
                            borderColor: isMatched ? teal : rightSelected === vi ? orange : '#E2E8F0',
                            bgcolor: isMatched ? `${teal}15` : rightSelected === vi ? `${orange}15` : 'white',
                            color: isMatched ? teal : rightSelected === vi ? orange : '#64748B',
                            opacity: isMatched ? 0.6 : 1,
                          }}
                        >
                          {vi}
                        </ButtonBase>
                      );
                    })}
                </Box>
              </Box>

              {/* Match Error Feedback */}
              {isCorrect === false && (
                <Box
                  sx={{
                    mt: is960 ? 2 : 3,
                    p: is960 ? 1.5 : 2,
                    borderRadius: is960 ? '14px' : '18px',
                    bgcolor: '#FEE2E2',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    fontSize: is960 ? '0.95rem' : '1.08rem',
                    fontWeight: 800,
                  }}
                >
                  <ClearIcon sx={{ fontSize: is960 ? 22 : 26 }} />
                  配对错误，请重试
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Practice Navigation Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: is960 ? 2 : 3,
            gap: 2,
          }}
        >
          <ButtonBase
            onClick={handlePrevExercise}
            disabled={exerciseIndex === 0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: '#94A3B8',
              fontSize: is960 ? '0.88rem' : '1rem',
              fontWeight: 700,
              opacity: exerciseIndex === 0 ? 0.3 : 1,
              px: is960 ? 2 : 2.5,
              py: is960 ? 1 : 1.25,
              borderRadius: is960 ? '14px' : '16px',
              '&:hover': exerciseIndex > 0 ? {
                bgcolor: 'rgba(0,0,0,0.04)',
              } : {},
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : 24 }} />
            上一题
          </ButtonBase>

          {isExerciseComplete && (
            <ButtonBase
              onClick={handleNextExercise}
              sx={{
                px: is960 ? 4 : 5,
                py: is960 ? 1.25 : 1.5,
                bgcolor: teal,
                color: 'white',
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '0.95rem' : '1.08rem',
                fontWeight: 800,
                boxShadow: `0 8px 20px ${teal}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  bgcolor: '#0F9D8E',
                },
              }}
            >
              {exerciseIndex === LESSON_DATA.practice.length - 1 ? '完成练习' : '下一题'}
              <ChevronRightIcon sx={{ fontSize: is960 ? 20 : 22 }} />
            </ButtonBase>
          )}

          {!isExerciseComplete && (
            <Box
              sx={{
                px: is960 ? 3 : 4,
                py: is960 ? 1 : 1.25,
                bgcolor: '#F8FAFC',
                color: '#94A3B8',
                borderRadius: is960 ? '14px' : '16px',
                fontSize: is960 ? '0.85rem' : '0.95rem',
                fontWeight: 700,
                border: '2px solid #E2E8F0',
              }}
            >
              {currentExercise.type === 'tone' ? '请选择答案' : '请完成配对'}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Default fallback
  return null;
}
