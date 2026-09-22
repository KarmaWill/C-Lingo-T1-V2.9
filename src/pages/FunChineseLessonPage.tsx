/**
 * Fun Chinese Lesson Page - 学习流程页面
 * 包含 Warmup -> Learn -> Practice -> Complete 等阶段
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import { APP_FONT_FAMILY } from '../theme/appFont';
import { FIGMA_FONT } from '../utils/figmaScale';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { markLessonCompleted, UNIT_LESSON_COUNT, getLessonResourceId } from '../utils/funChineseUnitProgress';
import { loadLessonContent } from '../data/happyChinese2';
import { listDemoUnitLessonMeta, mapContentVocab, type UiVocabItem } from '../data/happyChinese2/mapToLessonUi';import {
  getInitialPhase,
  getLessonPeriod,
  getNextPhaseInFlow,
  getVocabEndIndex,
  getVocabStartIndex,
  isFinalLessonPeriod,
  markPeriodCompleted,
} from '../utils/lessonPackageLoader';
import FeedbackEntryButton from '../components/feedback/FeedbackEntryButton';
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton';
import HubContainBoard from '../components/home/HubContainBoard';
import {
  buildWritingPracticeHref,
  buildWritingPracticeState,
  readLessonRestoreState,
} from '../utils/navigateBack';
import FunChineseKnowledgeCards from '../components/funChinese/FunChineseKnowledgeCards';
import FunChinesePractice from '../components/funChinese/FunChinesePractice';

type Phase = 'warmup' | 'learn' | 'cards' | 'practice' | 'complete';
type Language = 'en' | 'vi' | 'th' | 'id';
type ExerciseType = 'tone' | 'match';

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
      type: 'grammar' as const,
      title: '语气助词',
      titleVi: 'Trợ từ ngữ khí',
      content: {
        point: '吗 (ma)',
        function:
          'The particle “吗” turns a statement into a yes/no question. Add it to the end of a sentence to ask.',
        formula: '[statement] + 吗 → yes/no question',
      },
    },
    {
      type: 'pattern' as const,
      title: '句型练习',
      titleVi: 'Luyện mẫu câu',
      content: {
        formula: '[place] + 有 + [animal] + 吗？',
        function: 'Ask about possession',
        examples: [
          {
            chinese: '你家有小狗吗？',
            pinyin: 'Nǐ jiā yǒu xiǎo gǒu ma?',
            translation: 'Do you have a little dog at your house?',
          },
          {
            chinese: '我很好。',
            pinyin: 'Wǒ hěn hǎo.',
            translation: "I'm fine.",
          },
        ],
      },
    },
    {
      type: 'dialogue' as const,
      title: '打招呼',
      titleVi: 'Chào hỏi',
      content: {
        scene: 'Meeting a friend for the first time, or greeting in the morning',
        dialogueLines: [
          {
            role: 'A',
            speaker: '小明',
            chinese: '你好！',
            pinyin: 'Nǐ hǎo!',
            translation: { en: 'Hello!', vi: 'Xin chào!' },
          },
          {
            role: 'B',
            speaker: 'An',
            chinese: '你好！',
            pinyin: 'Nǐ hǎo!',
            translation: { en: 'Hello!', vi: 'Xin chào!' },
          },
          {
            role: 'A',
            speaker: '小明',
            chinese: '你好吗？',
            pinyin: 'Nǐ hǎo ma?',
            translation: { en: 'How are you?', vi: 'Bạn có khỏe không?' },
          },
          {
            role: 'B',
            speaker: 'An',
            chinese: '我很好。谢谢！',
            pinyin: 'Wǒ hěn hǎo. Xièxie!',
            translation: { en: "I'm fine. Thank you!", vi: 'Tôi khỏe. Cảm ơn!' },
          },
        ],
      },
    },
  ] as KnowledgeCard[],
  practice: [
    {
      type: 'tone' as const,
      question: 'Which tone do you hear?',
      options: ['Tone 1', 'Tone 2', 'Tone 3', 'Tone 4'],
      answer: 'Tone 3'
    },
    {
      type: 'match' as const,
      question: 'Match the meanings',
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
      translations: { en: 'good, fine', vi: 'tốt', th: 'ดี', id: 'baik' }, 
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
  const location = useLocation();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const parsedLessonId = Number.parseInt(lessonId || '1', 10);
  const safeLessonId = Number.isFinite(parsedLessonId) ? parsedLessonId : 1;
  const fromCollection = searchParams.get('from') === 'collection';
  const queryWantsCards = searchParams.get('phase') === 'cards';
  const queryWantsLearn = searchParams.get('phase') === 'learn';  const parsedPeriod = Number.parseInt(searchParams.get('period') || '0', 10);
  const activePeriod = Number.isFinite(parsedPeriod) && parsedPeriod >= 1 ? parsedPeriod : null;
  const periodConfig = activePeriod ? getLessonPeriod(1, safeLessonId, activePeriod) : null;
  const periodFlow = periodConfig?.flow ?? null;
  const queryCardIndex = Number.parseInt(searchParams.get('card') || '0', 10);
  const knowledgeCardsForPeriod = useMemo(() => {
    const all = LESSON_DATA.knowledgeCards;
    const indices = periodFlow?.cardIndices;
    if (!indices?.length) return all;
    return indices.map((i) => all[i]).filter(Boolean);
  }, [periodFlow]);
  const practiceExercisesForPeriod = useMemo(() => {
    const all = LESSON_DATA.practice;
    const indices = periodFlow?.exerciseIndices;
    if (!indices?.length) return all;
    return indices.map((i) => all[i]).filter(Boolean);
  }, [periodFlow]);
  const initialVocabEndIndex = getVocabEndIndex(periodFlow, LESSON_DATA.vocabulary.length);
  const vocabStartIndex = getVocabStartIndex(periodFlow);
  const initialCardIndex = Number.isFinite(queryCardIndex)
    ? Math.min(Math.max(queryCardIndex, 0), knowledgeCardsForPeriod.length - 1)
    : 0;
  const lessonRestore = readLessonRestoreState(location);

  const [currentPhase, setCurrentPhase] = useState<Phase>(() => {
    if (lessonRestore?.phase) return lessonRestore.phase;
    if (queryWantsCards) return 'cards';
    if (queryWantsLearn) return 'learn';
    if (periodFlow) return getInitialPhase(periodFlow);
    return 'warmup';
  });
  const [vocabIndex, setVocabIndex] = useState(
    lessonRestore && Number.isFinite(lessonRestore.vocabIndex)
      ? Math.min(Math.max(lessonRestore.vocabIndex, vocabStartIndex), initialVocabEndIndex)
      : vocabStartIndex,
  );
  const [cardIndex, setCardIndex] = useState(initialCardIndex);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [userLanguage] = useState<Language>('vi');
  const [packetVocab, setPacketVocab] = useState<UiVocabItem[] | null>(null);
  const [packetTitleZh, setPacketTitleZh] = useState<string | null>(null);
  const [packetGoalsEn, setPacketGoalsEn] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const meta = listDemoUnitLessonMeta().find((m) => m.id === safeLessonId);
    const resourceId = meta?.resourceId || getLessonResourceId(safeLessonId);
    if (meta) {
      setPacketTitleZh(meta.title);
      setPacketGoalsEn(meta.goalsEn.filter(Boolean));
    }
    if (!resourceId) return;
    loadLessonContent(resourceId)
      .then((content) => {
        if (cancelled) return;
        const mapped = mapContentVocab(content);
        setPacketVocab(mapped.length ? mapped : null);
      })
      .catch((err) => {
        console.error('[happy_chinese2] content load failed', err);
        if (!cancelled) setPacketVocab(null);
      });
    return () => {
      cancelled = true;
    };
  }, [safeLessonId]);

  const vocabulary = packetVocab?.length ? packetVocab : LESSON_DATA.vocabulary;
  const lessonTitleZh = packetTitleZh || LESSON_DATA.title;
  const learningGoals =
    packetGoalsEn?.length
      ? packetGoalsEn
      : [
          'Greet each other',
          'Distinguish and pronounce the three final sounds a, o, and e with correct tones',
        ];
  const vocabEndIndex = getVocabEndIndex(periodFlow, vocabulary.length);

  useEffect(() => {
    if (currentPhase !== 'complete') return;
    const id = safeLessonId;
    if (!Number.isFinite(id) || id < 1 || id > UNIT_LESSON_COUNT) return;
    if (activePeriod) {
      markPeriodCompleted(1, id, activePeriod);
      if (isFinalLessonPeriod(1, id, activePeriod)) {
        markLessonCompleted(id);
      }
      return;
    }
    markLessonCompleted(id);
  }, [currentPhase, safeLessonId, activePeriod]);

  const orange = '#FF7A45';
  const teal = '#14B8A6';

  // 追踪已出现的单个汉字
  const getSeenCharacters = (): Set<string> => {
    const seen = new Set<string>();
    for (let i = 0; i < vocabIndex; i++) {
      const vocab = vocabulary[i];
      if (vocab?.chinese.length === 1) {
        seen.add(vocab.chinese);
      }
    }
    return seen;
  };

  const currentVocab = vocabulary[Math.min(vocabIndex, Math.max(vocabulary.length - 1, 0))] || vocabulary[0] || LESSON_DATA.vocabulary[0];
  const seenChars = getSeenCharacters();
  
  // 判断当前词是否为单字且首次出现
  const isSingleChar = currentVocab.chinese.length === 1;
  const isFirstTimeChar = isSingleChar && !seenChars.has(currentVocab.chinese);
  const shouldShowWriting = isFirstTimeChar;

  const handleCloseLesson = () => {
    if (fromCollection) {
      navigate('/library/hub/fun-chinese');
      return;
    }
    navigate(-1);
  };

  const handleNextPhase = () => {
    if (periodFlow) {
      const next = getNextPhaseInFlow(currentPhase, periodFlow);
      if (next) {
        if (next === 'cards') setCardIndex(0);
        if (next === 'practice') setExerciseIndex(0);
        setCurrentPhase(next);
      } else {
        setCurrentPhase('complete');
      }
      return;
    }
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
    if (vocabIndex > vocabStartIndex) {
      setVocabIndex(vocabIndex - 1);
    }
  };

  const handleNextVocab = () => {
    if (vocabIndex < vocabEndIndex) {
      setVocabIndex(vocabIndex + 1);
    } else {
      handleNextPhase();
    }
  };

  const playChineseAudio = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Warmup Phase — Figma「课程学习列表1单元学习1」1920×1200
  if (currentPhase === 'warmup') {
    const goals = learningGoals;

    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <HubContainBoard width={1920} height={1200}>
          <Box
            sx={{
              width: 1920,
              height: 1200,
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: FIGMA_FONT,
            }}
          >
            {/* Top bar 160 */}
            <Box
              sx={{
                boxSizing: 'border-box',
                width: '100%',
                height: 160,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                px: '60px',
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E2E2E3',
                position: 'relative',
              }}
            >
              <HskPrepBackButton onClick={() => navigate(-1)} />
              <Typography
                sx={{
                  position: 'absolute',
                  left: 140,
                  right: 140,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: 40,
                  lineHeight: 1.6,
                  color: '#2D3436',
                  pointerEvents: 'none',
                }}
              >
                Lesson {lessonId}: {lessonTitleZh}
              </Typography>
              <Box sx={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)' }}>
                <FeedbackEntryButton is960={is960} context={{ screen: 'fun_chinese_lesson', lessonId: String(safeLessonId) }} />
              </Box>
            </Box>

            {/* Body 1040 */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                boxSizing: 'border-box',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: '60px',
                py: '40px',
                gap: '40px',
              }}
            >
              {/* Learning Goals card */}
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: 1800,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  px: '40px',
                  py: '20px',
                  gap: '9px',
                  bgcolor: '#FFFFFF',
                  border: '0.8px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(60, 64, 67, 0.3)',
                  borderRadius: '24px',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: 40,
                    lineHeight: 1.6,
                    color: '#2D3436',
                  }}
                >
                  Learning Goals
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    p: 0,
                    listStyle: 'none',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {goals.map((goal) => (
                    <Box
                      component="li"
                      key={goal}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: '16px',
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#00BC7D',
                          flexShrink: 0,
                          mt: '22px',
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 400,
                          fontSize: 32,
                          lineHeight: 1.6,
                          color: '#2D3436',
                        }}
                      >
                        {goal}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Vocab table card */}
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: 1800,
                  flex: 1,
                  minHeight: 0,
                  bgcolor: '#FFFFFF',
                  border: '0.8px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(60, 64, 67, 0.3)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* Header + rows share the same 2-col grid so ENGLISH/CHINESE line up */}
                <Box
                  sx={{
                    boxSizing: 'border-box',
                    height: 77,
                    flexShrink: 0,
                    display: 'grid',
                    gridTemplateColumns: '1fr 700px',
                    alignItems: 'center',
                    columnGap: '80px',
                    px: '164px',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 500,
                      fontSize: 40,
                      lineHeight: '28px',
                      color: '#2D3436',
                      textAlign: 'left',
                    }}
                  >
                    ENGLISH
                  </Typography>
                  <Typography
                    sx={{
                      width: 340,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 500,
                      fontSize: 40,
                      lineHeight: '28px',
                      color: '#2D3436',
                      textAlign: 'left',
                      px: '20px',
                      boxSizing: 'border-box',
                    }}
                  >
                    CHINESE
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {vocabulary.map((vocab) => (
                    <Box
                      key={vocab.id}
                      sx={{
                        boxSizing: 'border-box',
                        width: '100%',
                        minHeight: 149,
                        display: 'grid',
                        gridTemplateColumns: '1fr 700px',
                        alignItems: 'center',
                        columnGap: '80px',
                        px: '164px',
                        py: '22px',
                        borderTop: '0.8px solid #F3F4F6',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 400,
                          fontSize: 36,
                          lineHeight: '32px',
                          color: '#2D3436',
                          textAlign: 'left',
                        }}
                      >
                        {vocab.translations.en}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: 700,
                          flexShrink: 0,
                          px: '20px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            width: 340,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: FIGMA_FONT,
                              fontWeight: 400,
                              fontSize: 28,
                              lineHeight: 1.6,
                              color: '#2D3436',
                              textAlign: 'left',
                              mb: '4px',
                            }}
                          >
                            {vocab.pinyin}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily:
                                '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif',
                              fontWeight: 400,
                              fontSize: 48,
                              lineHeight: 1.6,
                              color: '#2D3436',
                              textAlign: 'left',
                            }}
                          >
                            {vocab.chinese}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '50px',
                          }}
                        >
                          <Box
                            sx={{
                              boxSizing: 'border-box',
                              width: 93,
                              height: 55,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#F3FAF6',
                              border: '1px solid #00B4A0',
                              borderRadius: '12px',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: FIGMA_FONT,
                                fontWeight: 500,
                                fontSize: 20,
                                lineHeight: 1.6,
                                color: '#00B4A0',
                                textAlign: 'center',
                              }}
                            >
                              HSK {vocab.hskLevel}
                            </Typography>
                          </Box>
                          <ButtonBase
                            onClick={() => playChineseAudio(vocab.chinese)}
                            aria-label={`Play pronunciation ${vocab.chinese}`}
                            sx={{
                              boxSizing: 'border-box',
                              width: 86,
                              height: 55,
                              borderRadius: '50px',
                              bgcolor: '#FF6B35',
                              border: '2px solid #FF6B35',
                              color: '#FFFFFF',
                              '&:active': { transform: 'scale(0.96)' },
                            }}
                          >
                            <VolumeUpIcon sx={{ fontSize: 24 }} />
                          </ButtonBase>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Start Learning CTA */}
              <ButtonBase
                onClick={handleNextPhase}
                sx={{
                  boxSizing: 'border-box',
                  width: 1800,
                  height: 100,
                  flexShrink: 0,
                  bgcolor: '#00B4A0',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: 32,
                    lineHeight: 1.6,
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  Start Learning
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
              </ButtonBase>
            </Box>
          </Box>
        </HubContainBoard>
      </Box>
    );
  }

  // Learn Phase — Figma「课程学习列表1生词学习1」1920×1200
  if (currentPhase === 'learn') {
    const totalVocab = vocabulary.length;
    const progressFill = Math.round(((vocabIndex + 1) / totalVocab) * 1620);
    const posLabel =
      (currentVocab.partOfSpeechTranslations?.en || currentVocab.partOfSpeech || '')
        .replace(/^./, (c) => c.toUpperCase());
    const hanziLen = [...currentVocab.chinese].length;
    const hanziSize = hanziLen <= 1 ? 250 : hanziLen === 2 ? 150 : hanziLen <= 4 ? 96 : 64;
    const pinyinSize = hanziLen <= 1 ? 90 : hanziLen === 2 ? 52 : hanziLen <= 4 ? 36 : 28;
    const dotCompact = totalVocab > 8;
    const dotActiveW = dotCompact ? 48 : 111;
    const dotIdle = dotCompact ? 12 : 17;
    const dotGap = dotCompact ? 10 : 14;

    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <HubContainBoard width={1920} height={1200}>
          <Box
            sx={{
              position: 'relative',
              width: 1920,
              height: 1200,
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: FIGMA_FONT,
            }}
          >
            {/* Top bar */}
            <Box
              sx={{
                boxSizing: 'border-box',
                width: '100%',
                height: 160,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                px: '60px',
                gap: '50px',
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E2E2E3',
              }}
            >
              <HskPrepBackButton onClick={handleCloseLesson} />
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: 32,
                      lineHeight: 1.6,
                      color: '#2D3436',
                    }}
                  >
                    Vocabulary Learning
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: 32,
                      lineHeight: 1.6,
                      color: '#2D3436',
                    }}
                  >
                    {vocabIndex + 1}/{totalVocab}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 10,
                    bgcolor: '#E8E8E8',
                    borderRadius: '20px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: progressFill,
                      maxWidth: '100%',
                      height: 10,
                      bgcolor: '#00B4A0',
                      borderRadius: '20px',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Body — Figma Frame 1410141252：余高给卡，底栏不叠 absolute */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: '60px',
                py: '40px',
                gap: '40px',
              }}
            >
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: 1331,
                  height: 820,
                  maxHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: '64px',
                  py: '30px',
                  bgcolor: '#FFFFFF',
                  border: '0.8px solid #F3F4F6',
                  boxShadow:
                    '0px 20px 25px -5px rgba(229, 231, 235, 0.5), 0px 8px 10px -6px rgba(229, 231, 235, 0.5)',
                  borderRadius: '40px',
                }}
              >
                <Box
                  sx={{
                    width: 1201,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  {/* Tags: POS + HSK */}
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                    <Box
                      sx={{
                        boxSizing: 'border-box',
                        height: 54,
                        px: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#D4F3EE',
                        borderRadius: '12px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 500,
                          fontSize: 28,
                          lineHeight: 1.6,
                          color: '#00B4A0',
                          textAlign: 'center',
                        }}
                      >
                        {posLabel}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        boxSizing: 'border-box',
                        height: 54,
                        px: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#F3FAF6',
                        border: '1px solid #00B4A0',
                        borderRadius: '12px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 500,
                          fontSize: 28,
                          lineHeight: 1.6,
                          color: '#00B4A0',
                          textAlign: 'center',
                        }}
                      >
                        HSK {currentVocab.hskLevel}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Character block */}
                  <Box
                    sx={{
                      flex: 1,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '30px',
                      pt: '20px',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 900,
                        minHeight: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${Math.max(24, Math.round(pinyinSize * 0.28))}px`,
                        boxSizing: 'border-box',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 400,
                          fontSize: pinyinSize,
                          lineHeight: 1.2,
                          color: '#2D3436',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {currentVocab.pinyin}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily:
                            '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif',
                          fontWeight: 400,
                          fontSize: hanziSize,
                          lineHeight: 1.15,
                          color: '#2D3436',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {currentVocab.chinese}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 400,
                        fontSize: 36,
                        lineHeight: '32px',
                        color: '#636E72',
                        textAlign: 'center',
                        pt: '24px',
                        borderTop: '1px solid #E5E7EB',
                        width: 600,
                        maxWidth: '90%',
                      }}
                    >
                      {currentVocab.translations.en}
                    </Typography>
                  </Box>
                </Box>

                {/* Practice Writing + Speaker */}
                <Box
                  sx={{
                    width: 1201,
                    height: 101,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    flexShrink: 0,
                  }}
                >
                  {shouldShowWriting && (
                    <ButtonBase
                      onClick={() => {
                        const lessonPath = `/library/hub/fun-chinese/lesson/${safeLessonId}${
                          fromCollection ? '?from=collection' : ''
                        }`;
                        navigate(
                          buildWritingPracticeHref(currentVocab.chinese, {
                            lessonPath,
                            vocabIndex,
                            phase: 'learn',
                          }),
                          {
                            state: buildWritingPracticeState({
                              lessonPath,
                              vocabIndex,
                              phase: 'learn',
                            }),
                          },
                        );
                      }}
                      sx={{
                        boxSizing: 'border-box',
                        flex: 1,
                        height: 101,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        bgcolor: 'transparent',
                        border: '1.6px solid #00B4A0',
                        borderRadius: '100px',
                        '&:active': { transform: 'scale(0.99)' },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 30, color: '#00B4A0' }} />
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 700,
                          fontSize: 32,
                          lineHeight: 1.6,
                          color: '#00B4A0',
                          textAlign: 'center',
                        }}
                      >
                        Practice Writing
                      </Typography>
                    </ButtonBase>
                  )}
                  <ButtonBase
                    onClick={() => playChineseAudio(currentVocab.chinese)}
                    aria-label={`Play pronunciation ${currentVocab.chinese}`}
                    sx={{
                      boxSizing: 'border-box',
                      width: 150,
                      height: 101,
                      borderRadius: '50px',
                      bgcolor: '#FF6B35',
                      border: '2px solid #FF6B35',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    <VolumeUpIcon sx={{ fontSize: 36 }} />
                  </ButtonBase>
                </Box>
              </Box>
            </Box>

            {/* Bottom nav bar — Figma Frame 1410141312 */}
            <Box
              sx={{
                boxSizing: 'border-box',
                flexShrink: 0,
                width: '100%',
                height: 140,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: '60px',
                bgcolor: '#FFFFFF',
                borderTop: '2px solid #E2E3E3',
              }}
            >
              <ButtonBase
                onClick={handlePrevVocab}
                disabled={vocabIndex === 0}
                sx={{
                  boxSizing: 'border-box',
                  width: 336,
                  height: 94,
                  borderRadius: '100px',
                  bgcolor: vocabIndex === 0 ? 'transparent' : '#FFFFFF',
                  border: vocabIndex === 0 ? 'none' : '2.4px solid #A7B3B8',
                  opacity: vocabIndex === 0 ? 0 : 1,
                  pointerEvents: vocabIndex === 0 ? 'none' : 'auto',
                  visibility: vocabIndex === 0 ? 'hidden' : 'visible',
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: 32,
                    lineHeight: 1.6,
                    color: '#636E72',
                  }}
                >
                  Previous
                </Typography>
              </ButtonBase>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${dotGap}px`,
                  maxWidth: 900,
                  overflow: 'hidden',
                  justifyContent: 'center',
                }}
              >
                {vocabulary.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: i === vocabIndex ? dotActiveW : dotIdle,
                      height: i === vocabIndex ? 18 : dotIdle,
                      borderRadius: i === vocabIndex ? '9px' : '50%',
                      bgcolor: i === vocabIndex ? '#00B4A0' : '#D9D9D9',
                      transition: 'all 0.25s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Box>

              <ButtonBase
                onClick={handleNextVocab}
                sx={{
                  boxSizing: 'border-box',
                  width: 336,
                  height: 94,
                  borderRadius: '100px',
                  bgcolor: '#00B4A0',
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: 32,
                    lineHeight: 1.6,
                    color: '#FFFFFF',
                  }}
                >
                  Next
                </Typography>
              </ButtonBase>
            </Box>
          </Box>
        </HubContainBoard>
      </Box>
    );
  }

  // Complete Phase
  if (currentPhase === 'complete') {
    const currentLessonId = parseInt(lessonId || '1', 10);
    const hasNextLesson = Number.isFinite(currentLessonId) && currentLessonId < UNIT_LESSON_COUNT;
    const periodOnlyDone =
      activePeriod !== null &&
      periodConfig !== null &&
      !isFinalLessonPeriod(1, safeLessonId, activePeriod);

    const handleRestart = () => {
      setCurrentPhase(periodFlow ? getInitialPhase(periodFlow) : 'warmup');
      setVocabIndex(vocabStartIndex);
      setCardIndex(0);
      setExerciseIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setLeftSelected(null);
      setRightSelected(null);
      setMatchedPairs([]);
    };

    const handleNextLesson = () => {
      if (periodOnlyDone) {
        navigate('/library/hub/fun-chinese');
        return;
      }
      if (!hasNextLesson) {
        navigate('/library/hub/fun-chinese');
        return;
      }
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
        <Typography sx={{ fontSize: is960 ? '1.8rem' : '2.25rem', fontWeight: 900, color: '#1E293B', mb: 2, fontFamily: APP_FONT_FAMILY }}>
          {periodOnlyDone ? `Period ${activePeriod} Complete!` : 'Congratulations!'}
        </Typography>
        <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.25rem', color: '#64748B', fontWeight: 600, mb: is960 ? 4 : 5, fontFamily: APP_FONT_FAMILY }}>
          {periodOnlyDone
            ? (periodConfig?.titleEn || periodConfig?.title || 'Keep going with the next period')
            : "You've learned basic Chinese greetings"}
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
              {vocabulary.length}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5, fontFamily: APP_FONT_FAMILY }}>
              Words Mastered
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
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5, fontFamily: APP_FONT_FAMILY }}>
              Key Points
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
            <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 700, mt: 0.5, fontFamily: APP_FONT_FAMILY }}>
              Exercises Done
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
              fontFamily: APP_FONT_FAMILY,
              boxShadow: `0 12px 28px ${teal}40`,
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {periodOnlyDone ? 'Back to Hub' : hasNextLesson ? 'Next Lesson' : 'Back to Course'}
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
                fontFamily: APP_FONT_FAMILY,
                border: '2px solid #E2E8F0',
                '&:hover': {
                  borderColor: teal,
                  color: teal,
                },
              }}
            >
              Review
            </ButtonBase>
            <ButtonBase
              onClick={() => navigate('/library/hub/fun-chinese')}
              sx={{
                flex: 1,
                py: is960 ? 1.25 : 1.5,
                bgcolor: 'white',
                color: '#64748B',
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '0.92rem' : '1.05rem',
                fontWeight: 800,
                fontFamily: APP_FONT_FAMILY,
                border: '2px solid #E2E8F0',
                '&:hover': {
                  borderColor: '#94A3B8',
                  color: '#475569',
                },
              }}
            >
              Back to Course
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    );
  }

  // Cards Phase - Knowledge Cards
  if (currentPhase === 'cards') {
    const currentCard = knowledgeCardsForPeriod[cardIndex];
    if (knowledgeCardsForPeriod.length > 0) {
      return (
        <FunChineseKnowledgeCards
          card={currentCard}
          index={cardIndex}
          total={knowledgeCardsForPeriod.length}
          onBack={handleCloseLesson}
          onPrevious={() => setCardIndex((index) => Math.max(0, index - 1))}
          onNext={() => {
            if (cardIndex < knowledgeCardsForPeriod.length - 1) {
              setCardIndex((index) => index + 1);
            } else {
              handleNextPhase();
            }
          }}
          onSpeak={playChineseAudio}
        />
      );
    }
    const cardTypeTitle =
      currentCard.type === 'dialogue'
        ? 'Dialogue Card'
        : currentCard.type === 'pattern'
          ? 'Pattern Card'
          : 'Grammar Card';
    const dialogueLines = currentCard.content.dialogueLines || [];
    const patternALine = dialogueLines.find((line) => line.role === 'A' && line.chinese.includes('吗')) || dialogueLines.find((line) => line.role === 'A');
    const patternBLine = dialogueLines.find((line) => line.role === 'B' && !line.chinese.includes('你好')) || dialogueLines.find((line) => line.role === 'B');
    const cardAccent = currentCard.type === 'grammar' ? '#2F80ED' : currentCard.type === 'pattern' ? teal : orange;
    const grammarPoint = currentCard.content.point || '';
    const grammarChar = grammarPoint.match(/^[^\s(]+/)?.[0] || '吗';
    const grammarPinyin = grammarPoint.match(/\(([^)]+)\)/)?.[1] || 'ma';
    const grammarExamples = [
      {
        subjectPinyin: 'nǐ',
        subject: '你',
        verbPinyin: 'hǎo',
        verb: '好',
        markerPinyin: grammarPinyin,
        marker: grammarChar,
        translation: '"Are you okay?"',
      },
      {
        subjectPinyin: 'tā',
        subject: '他',
        verbPinyin: 'hěn hǎo',
        verb: '很好',
        markerPinyin: grammarPinyin,
        marker: grammarChar,
        translation: '"Is he fine?"',
      },
    ];

    const handleNextCard = () => {
      if (cardIndex < knowledgeCardsForPeriod.length - 1) {
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
          bgcolor: '#FFFFFF',
          color: '#111827',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: is960 ? 70 : 86,
            px: is960 ? 2.6 : 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ButtonBase
              onClick={handleCloseLesson}
              aria-label="Back"
              sx={{
                width: is960 ? 38 : 46,
                height: is960 ? 38 : 46,
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                color: '#111827',
                bgcolor: '#FFFFFF',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: is960 ? 23 : 27 }} />
            </ButtonBase>
            <Box
              sx={{
                width: is960 ? 42 : 48,
                height: is960 ? 42 : 48,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: orange,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: is960 ? '1.18rem' : '1.34rem',
                fontWeight: 900,
                boxShadow: `0 8px 18px ${orange}2E`,
              }}
            >
              2
            </Box>
            <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.28rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: APP_FONT_FAMILY }}>
              Knowledge - {cardTypeTitle}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: is960 ? '0.96rem' : '1.08rem', color: '#4B5563', fontWeight: 800 }}>
            {cardIndex + 1}/{knowledgeCardsForPeriod.length}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            px: is960 ? 4 : 5.2,
            pb: is960 ? 1.5 : 2,
            overflow: 'hidden',
          }}
        >
          {currentCard.type === 'grammar' ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25, overflow: 'hidden' }}>
              <Box
                sx={{
                  minHeight: is960 ? 84 : 108,
                  bgcolor: '#F8F8F8',
                  display: 'grid',
                  gridTemplateColumns: is960 ? '160px 1px 1fr' : '200px 1px 1fr',
                  alignItems: 'center',
                  px: is960 ? 4 : 5.5,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.9rem', color: '#111827', fontWeight: 500, lineHeight: 1 }}>
                    {grammarPinyin}
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: is960 ? 0.45 : 0.6 }}>
                    <Typography
                      sx={{
                        fontSize: is960 ? '2.1rem' : '2.65rem',
                        color: '#111827',
                        fontWeight: 500,
                        lineHeight: 1.05,
                        fontFamily: '"KaiTi","STKaiti","BiauKai","DFKai-SB","TW-Kai","SimKai",serif',
                      }}
                    >
                      {grammarChar}
                    </Typography>
                    <ButtonBase
                      onClick={() => playChineseAudio(grammarChar)}
                      aria-label={`Play pronunciation ${grammarChar}`}
                      sx={{
                        width: is960 ? 24 : 28,
                        height: is960 ? 24 : 28,
                        borderRadius: '50%',
                        color: cardAccent,
                        bgcolor: '#FFFFFF',
                        border: `1px solid ${cardAccent}33`,
                        '&:active': { transform: 'scale(0.95)' },
                      }}
                    >
                      <VolumeUpIcon sx={{ fontSize: is960 ? 15 : 17 }} />
                    </ButtonBase>
                  </Box>
                </Box>
                <Box sx={{ height: is960 ? 50 : 64, bgcolor: '#111827' }} />
                <Box sx={{ pl: is960 ? 4 : 5.5 }}>
                  <Box sx={{ display: 'inline-flex', px: is960 ? 1.1 : 1.35, py: 0.3, borderRadius: '999px', bgcolor: '#EEF4FF', color: cardAccent, fontSize: is960 ? '0.68rem' : '0.78rem', fontWeight: 750, mb: is960 ? 0.8 : 1.15 }}>
                    语气助词 Particle
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '1.22rem' : '1.55rem', color: '#1F2937', fontWeight: 900, letterSpacing: '-0.03em' }}>
                    question particle
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: is960 ? '0.86rem' : '1rem', color: '#4B5563', fontWeight: 650, mb: is960 ? 0.7 : 0.9 }}>
                  功能
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: is960 ? '14px 1fr' : '18px 1fr', border: '1px solid #D1D5DB', boxShadow: '0 2px 5px rgba(15,23,42,0.08)', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ bgcolor: cardAccent }} />
                  <Box sx={{ px: is960 ? 2.4 : 3, py: is960 ? 1.25 : 1.55 }}>
                    <Typography sx={{ fontSize: is960 ? '0.84rem' : '0.96rem', color: '#111827', fontWeight: 650, lineHeight: 1.4, mb: 0.55 }}>
                      语气助词“{grammarChar}”用于把陈述句变成是/否疑问句。
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.9rem', color: '#111827', fontWeight: 500, lineHeight: 1.3 }}>
                      The particle {grammarPinyin} turns a statement into a yes/no question. Add it to the end of a sentence to ask.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: is960 ? '0.86rem' : '1rem', color: '#4B5563', fontWeight: 650, mb: is960 ? 0.7 : 0.9 }}>
                  结构
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: is960 ? '14px 1fr' : '18px 1fr', border: '1px solid #D1D5DB', boxShadow: '0 2px 5px rgba(15,23,42,0.08)', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ bgcolor: orange }} />
                  <Box sx={{ px: is960 ? 2.4 : 3, py: is960 ? 1.15 : 1.45 }}>
                    <Typography sx={{ fontSize: is960 ? '0.98rem' : '1.16rem', color: '#111827', fontWeight: 900 }}>
                      {currentCard.content.formula}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Typography sx={{ fontSize: is960 ? '0.86rem' : '1rem', color: '#4B5563', fontWeight: 650, mb: is960 ? 0.7 : 0.9 }}>
                  例句用法
                </Typography>
                <Box sx={{ height: 'calc(100% - 24px)', border: '1px solid #E5E7EB', borderRadius: is960 ? '14px' : '18px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ height: is960 ? 32 : 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB', alignItems: 'center' }}>
                    {['主语', '陈述句', '疑问标记'].map((label) => (
                      <Typography key={label} sx={{ textAlign: 'center', fontSize: is960 ? '0.82rem' : '0.95rem', color: '#4B5563', fontWeight: 900 }}>
                        {label}
                      </Typography>
                    ))}
                  </Box>
                  {grammarExamples.map((example, idx) => (
                    <Box key={`${example.subject}-${idx}`} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: idx === grammarExamples.length - 1 ? 'none' : '1px solid #E5E7EB' }}>
                      <Box sx={{ minHeight: is960 ? 36 : 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E5E7EB' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.66rem', color: '#111827', lineHeight: 1 }}>{example.subjectPinyin}</Typography>
                          <Typography sx={{ fontSize: is960 ? '1.02rem' : '1.24rem', color: '#111827', fontWeight: 500, lineHeight: 1.08 }}>{example.subject}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ minHeight: is960 ? 36 : 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E5E7EB' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.66rem', color: orange, lineHeight: 1 }}>{example.verbPinyin}</Typography>
                          <Typography sx={{ fontSize: is960 ? '1.02rem' : '1.24rem', color: orange, fontWeight: 500, lineHeight: 1.08 }}>{example.verb}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ minHeight: is960 ? 36 : 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.66rem', color: '#111827', lineHeight: 1 }}>{example.markerPinyin}</Typography>
                          <Typography sx={{ fontSize: is960 ? '1.02rem' : '1.24rem', color: '#111827', fontWeight: 500, lineHeight: 1.08 }}>{example.marker}</Typography>
                        </Box>
                        <ButtonBase
                          onClick={() => playChineseAudio(`${example.subject}${example.verb}${example.marker}`)}
                          aria-label={`Play grammar example ${idx + 1}`}
                          sx={{ width: is960 ? 28 : 32, height: is960 ? 28 : 32, borderRadius: '50%', color: cardAccent }}
                        >
                          <VolumeUpIcon sx={{ fontSize: is960 ? 18 : 20 }} />
                        </ButtonBase>
                      </Box>
                      <Box sx={{ gridColumn: '1 / -1', bgcolor: '#FAFAFA', px: is960 ? 4 : 5.2, py: is960 ? 0.25 : 0.45, borderTop: '1px solid #F3F4F6' }}>
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.84rem', color: '#6B7280', fontWeight: 500 }}>
                          {example.translation}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : currentCard.type === 'pattern' ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: is960 ? 2.2 : 3, pt: is960 ? 0.8 : 1.2, overflow: 'hidden' }}>
              {(currentCard.content.examples || []).slice(0, 2).map((example, idx) => (
                <Box key={idx} sx={{ flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, mb: is960 ? 1.1 : 1.4 }}>
                    <Box sx={{ width: 4, height: is960 ? 17 : 21, borderRadius: '999px', bgcolor: teal }} />
                    <Typography sx={{ fontSize: is960 ? '0.94rem' : '1.08rem', color: '#111827', fontWeight: 900 }}>
                      {currentCard.content.function}（{currentCard.content.formula}）
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      minHeight: is960 ? 74 : 92,
                      px: is960 ? 1.8 : 2.4,
                      py: is960 ? 1.2 : 1.55,
                      bgcolor: '#FAFAFA',
                      borderRadius: is960 ? '10px' : '14px',
                      boxShadow: '0 8px 22px rgba(15,23,42,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: is960 ? 2 : 3,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.72rem', color: '#111827', fontWeight: 500, letterSpacing: '0.08em', lineHeight: 1 }}>
                        {example.pinyin}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.58rem', color: '#111827', fontWeight: 650, lineHeight: 1.1, mt: 0.25 }}>
                        {example.chinese}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.96rem', color: '#111827', fontWeight: 500, mt: is960 ? 0.65 : 0.8 }}>
                        {example.translation}
                      </Typography>
                    </Box>
                    <ButtonBase
                      onClick={() => playChineseAudio(example.chinese)}
                      aria-label={`Play pattern example ${idx + 1}`}
                      sx={{
                        width: is960 ? 38 : 44,
                        height: is960 ? 38 : 44,
                        borderRadius: '50%',
                        color: teal,
                        flexShrink: 0,
                        '&:active': { transform: 'scale(0.96)' },
                      }}
                    >
                      <VolumeUpIcon sx={{ fontSize: is960 ? 22 : 26 }} />
                    </ButtonBase>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: is960 ? 1.4 : 1.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 0.8 : 1.1 }}>
                  <Box sx={{ width: 4, height: is960 ? 16 : 20, borderRadius: '999px', bgcolor: orange }} />
                  <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.92rem', color: '#6B7280', fontWeight: 650 }}>
                    使用场景
                  </Typography>
                </Box>
                <Box sx={{ minHeight: is960 ? 42 : 52, px: is960 ? 1.6 : 2, py: is960 ? 1.15 : 1.35, bgcolor: '#FAFAFA', borderRadius: is960 ? '10px' : '13px', display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: is960 ? '0.96rem' : '1.1rem', color: '#374151', fontWeight: 600 }}>
                    {currentCard.content.scene || currentCard.content.function}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: is960 ? 1.4 : 1.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 0.8 : 1.1 }}>
                  <Box sx={{ width: 4, height: is960 ? 16 : 20, borderRadius: '999px', bgcolor: orange }} />
                  <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.92rem', color: '#6B7280', fontWeight: 650 }}>
                    句型
                  </Typography>
                </Box>
                <Box sx={{ px: is960 ? 1.6 : 2, py: is960 ? 1.2 : 1.45, bgcolor: '#FAFAFA', borderRadius: is960 ? '10px' : '13px' }}>
                  {currentCard.type === 'dialogue' ? (
                    <>
                      <Typography sx={{ fontSize: is960 ? '0.94rem' : '1.05rem', color: '#111827', fontWeight: 650, lineHeight: 1.7 }}>
                        <Box component="span" sx={{ color: orange, fontWeight: 800, mr: 1 }}>A:</Box>
                        {patternALine?.chinese || '你好吗？'}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.94rem' : '1.05rem', color: '#111827', fontWeight: 650, lineHeight: 1.7 }}>
                        <Box component="span" sx={{ color: teal, fontWeight: 800, mr: 1 }}>B:</Box>
                        {patternBLine?.chinese || '我很好。谢谢！'}
                      </Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: is960 ? '0.98rem' : '1.12rem', color: '#111827', fontWeight: 750, lineHeight: 1.7 }}>
                      {currentCard.content.formula || currentCard.content.point}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1 : 1.25 }}>
                <Box sx={{ width: 4, height: is960 ? 16 : 20, borderRadius: '999px', bgcolor: orange }} />
                <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.92rem', color: '#6B7280', fontWeight: 650 }}>
                  对话
                </Typography>
              </Box>

              <Box
                sx={{
                  height: is960 ? 230 : 310,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {dialogueLines.map((line, idx) => {
                    const isRight = line.role === 'B';
                    const bubbleTop = is960 ? [0, 58, 116, 174][idx] : [0, 74, 148, 222][idx];
                    return (
                      <Box
                        key={`${line.speaker}-${idx}`}
                        sx={{
                          position: 'absolute',
                          top: bubbleTop,
                          left: isRight ? 'auto' : is960 ? 8 : 12,
                          right: isRight ? is960 ? 8 : 20 : 'auto',
                          width: is960 ? 180 : 230,
                          px: is960 ? 1.15 : 1.35,
                          py: is960 ? 0.9 : 1.05,
                          bgcolor: isRight ? '#F0FAF6' : '#FFF3EE',
                          borderRadius: is960 ? '12px' : '16px',
                          boxShadow: '0 10px 22px rgba(15,23,42,0.04)',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: is960 ? 22 : 27,
                            [isRight ? 'right' : 'left']: -9,
                            width: 0,
                            height: 0,
                            borderTop: '7px solid transparent',
                            borderBottom: '7px solid transparent',
                            ...(isRight
                              ? { borderLeft: '10px solid #F0FAF6' }
                              : { borderRight: '10px solid #FFF3EE' }),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: is960 ? '0.56rem' : '0.62rem', color: '#111827', fontWeight: 650, letterSpacing: '0.08em', lineHeight: 1 }}>
                              {line.pinyin}
                            </Typography>
                            <Typography sx={{ fontSize: is960 ? '1.06rem' : '1.26rem', color: '#111827', fontWeight: 700, lineHeight: 1.12, mt: 0.2 }}>
                              {line.chinese}
                            </Typography>
                          </Box>
                          <VolumeUpIcon sx={{ fontSize: is960 ? 17 : 20, color: isRight ? teal : orange, flexShrink: 0, mt: 0.35 }} />
                        </Box>
                        <Box sx={{ height: 1, bgcolor: 'rgba(17,24,39,0.1)', my: is960 ? 0.55 : 0.7 }} />
                        <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.88rem', color: '#6B7280', fontWeight: 500, lineHeight: 1.2 }}>
                          {line.translation[userLanguage] || line.translation.en}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            </>
          )}
        </Box>

        <Box
          sx={{
            height: is960 ? 62 : 72,
            borderTop: '1px solid #E5E7EB',
            px: is960 ? 2.4 : 3.6,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <ButtonBase
            onClick={handlePrevCard}
            disabled={cardIndex === 0}
            sx={{
              justifySelf: 'start',
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              color: '#111827',
              fontSize: is960 ? '0.9rem' : '1.02rem',
              fontWeight: 650,
              opacity: cardIndex === 0 ? 0.35 : 1,
              pointerEvents: cardIndex === 0 ? 'none' : 'auto',
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 24 : 28 }} />
            上一张
          </ButtonBase>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.75 : 0.9 }}>
            {knowledgeCardsForPeriod.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === cardIndex ? is960 ? 54 : 62 : is960 ? 8 : 10,
                  height: is960 ? 8 : 10,
                  borderRadius: '999px',
                  bgcolor: i === cardIndex ? cardAccent : '#E5E7EB',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </Box>

          <ButtonBase
            onClick={handleNextCard}
            sx={{
              justifySelf: 'end',
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              color: '#111827',
              fontSize: is960 ? '0.9rem' : '1.02rem',
              fontWeight: 650,
            }}
          >
            {cardIndex === knowledgeCardsForPeriod.length - 1 ? '进入练习' : '下一张'}
            <ChevronRightIcon sx={{ fontSize: is960 ? 24 : 28 }} />
          </ButtonBase>
        </Box>
      </Box>
    );
  }

  // Practice Phase
  if (currentPhase === 'practice') {
    const practiceResourceId = getLessonResourceId(safeLessonId);
    if (practiceResourceId) {
      return (
        <FunChinesePractice
          lessonResourceId={practiceResourceId}
          onBack={handleCloseLesson}
          onComplete={handleNextPhase}
          onSpeak={playChineseAudio}
        />
      );
    }
    const currentExercise = practiceExercisesForPeriod[exerciseIndex];
    
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
      if (exerciseIndex < practiceExercisesForPeriod.length - 1) {
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
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#1E293B', fontFamily: APP_FONT_FAMILY }}>
              Practice
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#94A3B8', fontWeight: 700, fontFamily: APP_FONT_FAMILY }}>
              Progress: {exerciseIndex + 1} / {practiceExercisesForPeriod.length}
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
                      Excellent! Correct answer
                    </>
                  ) : (
                    <>
                      <ClearIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                      Try again
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
              fontFamily: APP_FONT_FAMILY,
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
            Previous
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
                fontFamily: APP_FONT_FAMILY,
                boxShadow: `0 8px 20px ${teal}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  bgcolor: '#0F9D8E',
                },
              }}
            >
              {exerciseIndex === practiceExercisesForPeriod.length - 1 ? 'Complete' : 'Next'}
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
                fontFamily: APP_FONT_FAMILY,
                border: '2px solid #E2E8F0',
              }}
            >
              {currentExercise.type === 'tone' ? 'Select Answer' : 'Complete Matching'}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Default fallback
  return null;
}
