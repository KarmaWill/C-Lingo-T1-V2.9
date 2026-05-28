import { useState, useEffect, useRef, type MouseEvent, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import './funChineseInteractiveEbook.css';
import {
  Volume2, Play, Pause, Mic, Settings, Tv,
  ChevronLeft, ChevronRight, Check, X, RotateCcw,
  Star, Sliders, Eye, EyeOff, Sparkles, Smile, RefreshCw,
  Link2, ListTodo, CircleHelp, MessageCircle, PenLine,
  Maximize2, Minimize2, LayoutList,
} from 'lucide-react';

const EXERCISE_TABS = [
  { id: 'match' as const, label: 'Match', Icon: Link2 },
  { id: 'fill' as const, label: 'Fill', Icon: ListTodo },
  { id: 'truefalse' as const, label: 'Quiz', Icon: CircleHelp },
  { id: 'roleplay' as const, label: 'Story', Icon: MessageCircle },
  { id: 'stroke' as const, label: 'Write', Icon: PenLine },
];

const VOICE_SPEED_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

// --- DATA STRUCTURES ---
export interface WordItem {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface SentenceSegment {
  text: string;
  pinyin: string;
  speakable?: boolean;
}

export interface SentenceItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  segments?: SentenceSegment[];
}

export interface MatchOption {
  id: string;
  left: string; // English
  right: string; // Chinese
  isMatched: boolean;
}

export interface StrokeCharacter {
  char: string;
  meaning: string;
  strokes: string[]; // Relative paths for Tianzige step rendering
  meanings: string[]; // Stroke names
}

export interface Lesson {
  id: number;
  title: string;
  pinyin: string;
  englishTitle: string;
  desc: string;
  textbookLeft: {
    illustration: string; // Tailwind emoji class
    sentences: SentenceItem[];
  };
  vocabList: WordItem[];
  matchOptions: MatchOption[];
  fillBlank: {
    audioText: string;
    pinyin: string;
    options: string[];
    correctAnswer: string;
    english: string;
  };
  trueFalse: {
    illustration: string;
    text: string;
    correctAnswer: boolean;
    explanation: string;
  };
  comicRoleplay: {
    name: string;
    avatar: string;
    bubbleText: string;
    pinyin: string;
  }[];
  strokeChars: StrokeCharacter[];
}

// --- LESSONS DATASET ---
const LESSONS_DATA: Lesson[] = [
  {
    id: 1,
    title: "你好",
    pinyin: "Nǐ Hǎo",
    englishTitle: "Hello!",
    desc: "学习基础招呼用语与自我介绍",
    textbookLeft: {
      illustration: "👋🧑‍🤝‍🧑",
      sentences: [
        {
          id: "1-1", chinese: "你好！我叫小明。", pinyin: "Nǐ hǎo! Wǒ jiào Xiǎomíng.", english: "Hello! My name is Xiaoming.",
          segments: [
            { text: "你好", pinyin: "Nǐ hǎo" }, { text: "！", pinyin: "", speakable: false },
            { text: "我", pinyin: "Wǒ" }, { text: "叫", pinyin: "jiào" }, { text: "小明", pinyin: "Xiǎomíng" }, { text: "。", pinyin: "", speakable: false },
          ],
        },
        {
          id: "1-2", chinese: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzì?", english: "What is your name?",
          segments: [
            { text: "你", pinyin: "Nǐ" }, { text: "叫", pinyin: "jiào" }, { text: "什么", pinyin: "shénme" }, { text: "名字", pinyin: "míngzì" }, { text: "？", pinyin: "", speakable: false },
          ],
        },
        {
          id: "1-3", chinese: "我叫美林。很高兴认识你！", pinyin: "Wǒ jiào Měilín. Hěn gāoxìng rènshì nǐ!", english: "My name is Meilin. Nice to meet you!",
          segments: [
            { text: "我", pinyin: "Wǒ" }, { text: "叫", pinyin: "jiào" }, { text: "美林", pinyin: "Měilín" }, { text: "。", pinyin: "", speakable: false },
            { text: "很", pinyin: "Hěn" }, { text: "高兴", pinyin: "gāoxìng" }, { text: "认识", pinyin: "rènshì" }, { text: "你", pinyin: "nǐ" }, { text: "！", pinyin: "", speakable: false },
          ],
        },
        {
          id: "1-4", chinese: "我们一起学中文吧！", pinyin: "Wǒmen yīqǐ xué Zhōngwén ba!", english: "Let's learn Chinese together!",
          segments: [
            { text: "我们", pinyin: "Wǒmen" }, { text: "一起", pinyin: "yīqǐ" }, { text: "学", pinyin: "xué" }, { text: "中文", pinyin: "Zhōngwén" }, { text: "吧", pinyin: "ba" }, { text: "！", pinyin: "", speakable: false },
          ],
        },
      ]
    },
    vocabList: [
      { chinese: "你好", pinyin: "nǐ hǎo", english: "hello" },
      { chinese: "名字", pinyin: "míngzi", english: "name" },
      { chinese: "中文", pinyin: "Zhōngwén", english: "Chinese language" },
      { chinese: "高兴", pinyin: "gāoxìng", english: "happy / glad" }
    ],
    matchOptions: [
      { id: "m1", left: "Hello", right: "你好", isMatched: false },
      { id: "m2", left: "Name", right: "名字", isMatched: false },
      { id: "m3", left: "Chinese", right: "中文", isMatched: false },
      { id: "m4", left: "Happy", right: "高兴", isMatched: false }
    ],
    fillBlank: {
      audioText: "你叫什么名字",
      pinyin: "míngzì",
      options: ["名字", "高兴", "苹果"],
      correctAnswer: "名字",
      english: "What is your name?"
    },
    trueFalse: {
      illustration: "🎒🏫",
      text: "“学中文”的意思是 'Study Math'",
      correctAnswer: false,
      explanation: "“学中文”的意思是 'Study Chinese'。这代表我们一起快乐学汉语！"
    },
    comicRoleplay: [
      { name: "小明", avatar: "👦", bubbleText: "你好！你叫什么名字？", pinyin: "Nǐ hǎo! Nǐ jiào shénme míngzì?" },
      { name: "美林", avatar: "👧", bubbleText: "你好！我叫美林。我们学中文吧！", pinyin: "Nǐ hǎo! Wǒ jiào Měilín. Wǒmen xué Zhōngwén ba!" }
    ],
    strokeChars: [
      {
        char: "中",
        meaning: "Middle",
        strokes: [
          "M 30,35 L 30,65", // 竖
          "M 30,35 L 70,35 L 70,65", // 横折
          "M 30,65 L 70,65", // 横
          "M 50,15 L 50,85"  // 中竖
        ],
        meanings: ["竖 (Vertical)", "横折 (Turn)", "横 (Horizontal)", "竖 (Center vertical)"]
      },
      {
        char: "你",
        meaning: "You",
        strokes: [
          "M 35,20 C 30,30 20,45 15,55", // 撇
          "M 27,38 L 27,85", // 竖
          "M 55,20 C 58,20 68,22 75,25", // 撇
          "M 65,25 L 65,75 C 65,85 58,85 54,82", // 竖钩
          "M 45,45 Q 38,58 35,65", // 撇
          "M 75,45 Q 83,60 88,72"  // 点
        ],
        meanings: ["撇 (Falling Left)", "竖 (Vertical)", "撇 (Short slant)", "竖钩 (Hook)", "撇 (Inner slant)", "点 (Dot)"]
      }
    ]
  },
  {
    id: 2,
    title: "数一数",
    pinyin: "Shǔ Yī Shǔ",
    englishTitle: "Counting Numbers",
    desc: "学习基本数字口诀与数量表达",
    textbookLeft: {
      illustration: "🍎🔢",
      sentences: [
        {
          id: "2-1", chinese: "一、二、三，三个苹果。", pinyin: "Yī, èr, sān, sān gè píngguǒ.", english: "One, two, three, three apples.",
          segments: [
            { text: "一", pinyin: "Yī" }, { text: "、", pinyin: "", speakable: false }, { text: "二", pinyin: "èr" }, { text: "、", pinyin: "", speakable: false }, { text: "三", pinyin: "sān" }, { text: "，", pinyin: "", speakable: false },
            { text: "三个", pinyin: "sān gè" }, { text: "苹果", pinyin: "píngguǒ" }, { text: "。", pinyin: "", speakable: false },
          ],
        },
        {
          id: "2-2", chinese: "四、五、六，我们一起数。", pinyin: "Sì, wǔ, liù, wǒmen yīqǐ shǔ.", english: "Four, five, six, we count together.",
          segments: [
            { text: "四", pinyin: "Sì" }, { text: "、", pinyin: "", speakable: false }, { text: "五", pinyin: "wǔ" }, { text: "、", pinyin: "", speakable: false }, { text: "六", pinyin: "liù" }, { text: "，", pinyin: "", speakable: false },
            { text: "我们", pinyin: "wǒmen" }, { text: "一起", pinyin: "yīqǐ" }, { text: "数", pinyin: "shǔ" }, { text: "。", pinyin: "", speakable: false },
          ],
        },
        {
          id: "2-3", chinese: "七、八、九、十，这里有十个！", pinyin: "Qī, bā, jiǔ, shí, zhèlǐ yǒu shí gè!", english: "Seven, eight, nine, ten, here are ten!",
          segments: [
            { text: "七", pinyin: "Qī" }, { text: "、", pinyin: "", speakable: false }, { text: "八", pinyin: "bā" }, { text: "、", pinyin: "", speakable: false }, { text: "九", pinyin: "jiǔ" }, { text: "、", pinyin: "", speakable: false }, { text: "十", pinyin: "shí" }, { text: "，", pinyin: "", speakable: false },
            { text: "这里", pinyin: "zhèlǐ" }, { text: "有", pinyin: "yǒu" }, { text: "十", pinyin: "shí" }, { text: "个", pinyin: "gè" }, { text: "！", pinyin: "", speakable: false },
          ],
        },
        {
          id: "2-4", chinese: "太棒了！你数得非常好！", pinyin: "Tài bàng le! Nǐ shǔ de fēicháng hǎo!", english: "Great! You counted beautifully!",
          segments: [
            { text: "太", pinyin: "Tài" }, { text: "棒了", pinyin: "bàng le" }, { text: "！", pinyin: "", speakable: false },
            { text: "你", pinyin: "Nǐ" }, { text: "数", pinyin: "shǔ" }, { text: "得", pinyin: "de" }, { text: "非常", pinyin: "fēicháng" }, { text: "好", pinyin: "hǎo" }, { text: "！", pinyin: "", speakable: false },
          ],
        },
      ]
    },
    vocabList: [
      { chinese: "苹果", pinyin: "píngguǒ", english: "apple" },
      { chinese: "我们", pinyin: "wǒmen", english: "we / us" },
      { chinese: "一起", pinyin: "yīqǐ", english: "together" },
      { chinese: "非常", pinyin: "fēicháng", english: "very much" }
    ],
    matchOptions: [
      { id: "n1", left: "Apple", right: "苹果", isMatched: false },
      { id: "n2", left: "We", right: "我们", isMatched: false },
      { id: "n3", left: "Together", right: "一起", isMatched: false },
      { id: "n4", left: "Very", right: "非常", isMatched: false }
    ],
    fillBlank: {
      audioText: "三个苹果",
      pinyin: "píngguǒ",
      options: ["苹果", "你们", "高兴"],
      correctAnswer: "苹果",
      english: "three apples"
    },
    trueFalse: {
      illustration: "🍎🎒",
      text: "“十个苹果”的意思是 '10 apples'",
      correctAnswer: true,
      explanation: "“十”是数字 10，“苹果”是 Apple，所以是 '10 apples'。数数让我们更有信心！"
    },
    comicRoleplay: [
      { name: "小明", avatar: "👦", bubbleText: "一二三，共有几个苹果？", pinyin: "Yī èr sān, gòng yǒu jǐ gè píngguǒ?" },
      { name: "美林", avatar: "👧", bubbleText: "这里有一二三...三个红苹果！", pinyin: "Zhèlǐ yǒu yī èr sān... sān gè hóng píngguǒ!" }
    ],
    strokeChars: [
      {
        char: "文",
        meaning: "Culture",
        strokes: [
          "M 50,20 L 50,30", // 点
          "M 25,40 L 75,40", // 横
          "M 47,40 C 40,55 25,75 15,85", // 撇
          "M 45,47 C 55,60 70,75 88,85"  // 捺
        ],
        meanings: ["点 (Dot)", "横 (Horizontal Cross)", "撇 (Left sweep)", "捺 (Right drop)"]
      },
      {
        char: "一",
        meaning: "One",
        strokes: [
          "M 20,50 L 80,50" // 一横
        ],
        meanings: ["横 (Horizontal line)"]
      }
    ]
  }
];

export default function FunChineseInteractiveEbook() {
  const navigate = useNavigate();
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const currentLesson = LESSONS_DATA.find(l => l.id === currentLessonId) || LESSONS_DATA[0];
  const leftPageNum = (currentLessonId - 1) * 4 + 4;
  const rightPageNum = (currentLessonId - 1) * 4 + 5;
  const totalPages = LESSONS_DATA.length * 8;

  // --- INTERACTION MODES ---
  // read: 点读模式, repeat: 复读模式, shadow: 跟读模式, exercise: 互动练习
  const [mode, setMode] = useState<'read' | 'repeat' | 'shadow' | 'exercise'>('read');
  const [showReadHighlights, setShowReadHighlights] = useState<boolean>(true);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [aiAssistEnabled, setAiAssistEnabled] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLessonPicker, setShowLessonPicker] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  const voiceSpeedIndex = Math.max(0, VOICE_SPEED_STEPS.indexOf(voiceSpeed as typeof VOICE_SPEED_STEPS[number]));

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => {
      if (!prev) {
        setShowSettings(false);
        setShowLessonPicker(false);
      }
      return !prev;
    });
  };

  const selectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setShowLessonPicker(false);
    setShowSettings(false);
  };

  // --- POINT-TO-READ (点读 BUBBLE) ---
  const [activeBubble, setActiveBubble] = useState<{ sentenceId: string } | null>(null);
  const [activePlayingKey, setActivePlayingKey] = useState<string | null>(null);

  const getSentenceSegments = (sentence: SentenceItem): SentenceSegment[] => {
    if (sentence.segments?.length) return sentence.segments;
    return [{ text: sentence.chinese, pinyin: sentence.pinyin }];
  };

  const switchMode = (next: 'read' | 'repeat' | 'shadow' | 'exercise') => {
    setMode(next);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    if (next === 'read') {
      setIsRepeatPlaying(false);
      setSelectedRepeatIds([]);
      setCurrentRepeatPlayingId(null);
      setShadowSessionActive(false);
      setShadowSessionReportOpen(false);
    } else if (next === 'repeat') {
      setActiveBubble(null);
      setSelectedShadowIds([]);
    } else if (next === 'shadow') {
      setActiveBubble(null);
      setSelectedRepeatIds([]);
      setIsRepeatPlaying(false);
    } else {
      setActiveBubble(null);
      setActivePlayingKey(null);
    }
  };

  const speakZH = (text: string, playingKey?: string) => {
    const chineseOnly = text.replace(/[^\u4e00-\u9fff]/g, '');
    if (!chineseOnly) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chineseOnly);
      utterance.lang = 'zh-CN';
      utterance.rate = voiceSpeed;
      if (playingKey) {
        setActivePlayingKey(playingKey);
        utterance.onend = () => setActivePlayingKey((k) => (k === playingKey ? null : k));
        utterance.onerror = () => setActivePlayingKey((k) => (k === playingKey ? null : k));
      }
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis not supported in this client environment.');
    }
  };

  const handleReadSentenceTap = (sentence: SentenceItem) => {
    speakZH(sentence.chinese, `sentence-${sentence.id}`);
    setActiveBubble({ sentenceId: sentence.id });
  };

  const handleReadWordTap = (sentence: SentenceItem, segment: SentenceSegment, segIdx: number, e: MouseEvent) => {
    e.stopPropagation();
    if (segment.speakable === false) return;
    speakZH(segment.text, `word-${sentence.id}-${segIdx}`);
    setActiveBubble({ sentenceId: sentence.id });
  };

  const openFollowRead = (
    text: string,
    pinyin: string,
    english: string,
    sentenceId?: string,
    shadowSession = false,
  ) => {
    speakZH(text);
    setFollowModal({ isOpen: true, text, pinyin, english, sentenceId, shadowSession });
    setFollowRecordState('idle');
    setEvalResultScore(0);
  };

  // --- REPEAT LOOP (复读) STATE ---
  const [selectedRepeatIds, setSelectedRepeatIds] = useState<string[]>([]);
  const [isRepeatPlaying, setIsRepeatPlaying] = useState<boolean>(false);
  const [currentRepeatPlayingId, setCurrentRepeatPlayingId] = useState<string | null>(null);
  const repeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRepeatSentence = (sentenceId: string) => {
    setSelectedRepeatIds((prev) => {
      if (prev.includes(sentenceId)) {
        return prev.filter((id) => id !== sentenceId);
      }
      const nextIds = [...prev, sentenceId];
      return currentLesson.textbookLeft.sentences
        .filter((s) => nextIds.includes(s.id))
        .map((s) => s.id);
    });
    setIsRepeatPlaying(false);
  };

  const selectedRepeatSentences = currentLesson.textbookLeft.sentences.filter((s) =>
    selectedRepeatIds.includes(s.id)
  );

  // --- SHADOW READING (句子口语挑战) ---
  const [selectedShadowIds, setSelectedShadowIds] = useState<string[]>([]);
  const [shadowSentenceScores, setShadowSentenceScores] = useState<Record<string, number>>({});
  const [shadowFilter, setShadowFilter] = useState<'all' | 'not_scored' | 'retry'>('all');
  const [shadowSessionActive, setShadowSessionActive] = useState<boolean>(false);
  const [shadowSessionQueue, setShadowSessionQueue] = useState<string[]>([]);
  const [shadowSessionIndex, setShadowSessionIndex] = useState<number>(0);
  const [shadowSessionReportOpen, setShadowSessionReportOpen] = useState<boolean>(false);

  const toggleShadowSentence = (sentenceId: string) => {
    setSelectedShadowIds((prev) => {
      if (prev.includes(sentenceId)) {
        return prev.filter((id) => id !== sentenceId);
      }
      const nextIds = [...prev, sentenceId];
      return currentLesson.textbookLeft.sentences
        .filter((s) => nextIds.includes(s.id))
        .map((s) => s.id);
    });
  };

  const selectedShadowSentences = currentLesson.textbookLeft.sentences.filter((s) =>
    selectedShadowIds.includes(s.id)
  );

  const getFilteredShadowSentences = (): SentenceItem[] => {
    const base = selectedShadowSentences.length > 0
      ? selectedShadowSentences
      : currentLesson.textbookLeft.sentences;
    if (shadowFilter === 'not_scored') {
      return base.filter((s) => shadowSentenceScores[s.id] == null);
    }
    if (shadowFilter === 'retry') {
      return base.filter((s) => shadowSentenceScores[s.id] != null && shadowSentenceScores[s.id] < 80);
    }
    return base;
  };

  const filteredShadowSentences = getFilteredShadowSentences();

  const startShadowTraining = () => {
    const queue = selectedShadowIds.length > 0
      ? selectedShadowIds
      : currentLesson.textbookLeft.sentences.map((s) => s.id);
    if (queue.length === 0) return;
    const first = currentLesson.textbookLeft.sentences.find((s) => s.id === queue[0]);
    if (!first) return;
    setShadowSessionQueue(queue);
    setShadowSessionIndex(0);
    setShadowSessionActive(true);
    setShadowSessionReportOpen(false);
    openFollowRead(first.chinese, first.pinyin, first.english, first.id, true);
  };

  const advanceShadowSession = () => {
    const nextIdx = shadowSessionIndex + 1;
    if (nextIdx >= shadowSessionQueue.length) {
      setFollowModal((prev) => ({ ...prev, isOpen: false, shadowSession: false }));
      setShadowSessionActive(false);
      setShadowSessionReportOpen(true);
      return;
    }
    setShadowSessionIndex(nextIdx);
    const next = currentLesson.textbookLeft.sentences.find((s) => s.id === shadowSessionQueue[nextIdx]);
    if (next) {
      openFollowRead(next.chinese, next.pinyin, next.english, next.id, true);
    }
  };

  // --- FOLLOW-READ MODAL (跟读弹窗) ---
  const [followModal, setFollowModal] = useState<{
    isOpen: boolean;
    text: string;
    pinyin: string;
    english: string;
    sentenceId?: string;
    shadowSession?: boolean;
  }>({ isOpen: false, text: "", pinyin: "", english: "" });

  const [followRecordState, setFollowRecordState] = useState<'idle' | 'recording' | 'evaluating' | 'result'>('idle');
  const [micAmplitude, setMicAmplitude] = useState<number>(0);
  const [evalResultScore, setEvalResultScore] = useState<number>(0);
  const [isMyVoicePlaying, setIsMyVoicePlaying] = useState<boolean>(false);

  // Audio Context elements
  const evaluationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- EXERCISE STATES ---
  const [exerciseTab, setExerciseTab] = useState<'match' | 'fill' | 'truefalse' | 'roleplay' | 'stroke'>('match');

  // 1. Line Match State
  const [matchOptions, setMatchOptions] = useState<MatchOption[]>(currentLesson.matchOptions);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null); // English Id
  const [matchStatusMsg, setMatchStatusMsg] = useState<string>("");

  // 2. Fill Blank State
  const [fillSelected, setFillSelected] = useState<string | null>(null);
  const [fillFeedback, setFillFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);

  // 3. True or False State
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [trueFalseSubmitted, setTrueFalseSubmitted] = useState<boolean>(false);

  // 4. Role Play States
  const [rolePlayRecords, setRolePlayRecords] = useState<{ [index: number]: boolean }>({});

  // 5. Stroke writing animator state
  const [activeStrokeCharIdx, setActiveStrokeCharIdx] = useState<number>(0);
  const [activeStrokeStep, setActiveStrokeStep] = useState<number>(-1); // -1 is full outline
  const [isStrokeAnimating, setIsStrokeAnimating] = useState<boolean>(false);
  const strokeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ANIMATED VIDEO SCREEN (导学视频) ---
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [videoScene, setVideoScene] = useState<number>(0);

  // Sync lesson exercise defaults when chapter changes
  useEffect(() => {
    setMatchOptions(currentLesson.matchOptions);
    setSelectedLeft(null);
    setMatchStatusMsg("");
    setFillSelected(null);
    setFillFeedback(null);
    setTrueFalseAnswer(null);
    setTrueFalseSubmitted(false);
    setRolePlayRecords({});
    setSelectedShadowIds([]);
    setShadowSentenceScores({});
    setShadowFilter('all');
    setShadowSessionActive(false);
    setShadowSessionQueue([]);
    setShadowSessionIndex(0);
    setShadowSessionReportOpen(false);
    setActiveStrokeStep(-1);
    setIsStrokeAnimating(false);
    // cancel timers
    if (strokeTimerRef.current) clearInterval(strokeTimerRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    setIsRepeatPlaying(false);
    setSelectedRepeatIds([]);
    setCurrentRepeatPlayingId(null);
    setActiveBubble(null);
    setActivePlayingKey(null);
  }, [currentLessonId]);

  // Handle Repeat loop ticking
  useEffect(() => {
    if (isRepeatPlaying && selectedRepeatIds.length > 0) {
      const lines = currentLesson.textbookLeft.sentences.filter((s) => selectedRepeatIds.includes(s.id));
      if (lines.length === 0) return;

      let currentIdx = 0;

      const playLine = () => {
        const s = lines[currentIdx];
        setCurrentRepeatPlayingId(s.id);
        speakZH(s.chinese);

        const textDuration = Math.max(3000, s.chinese.length * 350 * (2.0 - voiceSpeed));

        repeatIntervalRef.current = setTimeout(() => {
          currentIdx = (currentIdx + 1) % lines.length;
          playLine();
        }, textDuration);
      };

      playLine();
    } else {
      if (repeatIntervalRef.current) clearTimeout(repeatIntervalRef.current);
      setCurrentRepeatPlayingId(null);
    }

    return () => {
      if (repeatIntervalRef.current) clearTimeout(repeatIntervalRef.current);
    };
  }, [isRepeatPlaying, selectedRepeatIds, currentLessonId, voiceSpeed]);

  // Mic simulation driver for visual soundwave feedback
  const startMicSimulation = () => {
    let tick = 0;
    const interval = setInterval(() => {
      // Simulate real vocal amplitude values fluctuated between 20 & 95
      const randomAmp = 20 + Math.sin(tick) * 30 + Math.random() * 45;
      setMicAmplitude(randomAmp);
      tick += 0.4;
    }, 100);

    return {
      stop: () => clearInterval(interval)
    };
  };

  // Click start user voice recording (Simulation with actual volume visualization)
  const handleStartRecording = () => {
    setFollowRecordState('recording');

    // Setup volume analysis and recording mockup
    const analyzer = startMicSimulation();
    (window as any)._micAnalyzer = analyzer;

    // Timeout after 4 seconds to execute standard pronunciation evaluation
    evaluationTimerRef.current = setTimeout(() => {
      handleStopRecording();
    }, 4000);
  };

  const handleStopRecording = () => {
    if (evaluationTimerRef.current) clearTimeout(evaluationTimerRef.current);
    if ((window as any)._micAnalyzer) {
      (window as any)._micAnalyzer.stop();
    }

    setFollowRecordState('evaluating');
    setMicAmplitude(0);

    // Give a friendly high-accuracy rating simulated to keep kids excited
    setTimeout(() => {
      const score = 88 + Math.floor(Math.random() * 11);
      setEvalResultScore(score);
      setFollowRecordState('result');
      setFollowModal((prev) => {
        if (prev.sentenceId) {
          setShadowSentenceScores((scores) => {
            const prevScore = scores[prev.sentenceId!];
            if (prevScore == null || score > prevScore) {
              return { ...scores, [prev.sentenceId!]: score };
            }
            return scores;
          });
        }
        return prev;
      });
    }, 1500);
  };

  // Line matching action
  const handleLeftMatchSelect = (leftId: string) => {
    setSelectedLeft(leftId);
    setMatchStatusMsg('Tap the matching Chinese word on the right.');
  };

  const handleRightMatchSelect = (rightChar: string) => {
    if (!selectedLeft) return;

    // Retrieve target item
    const matchItem = matchOptions.find(o => o.id === selectedLeft);
    if (matchItem && matchItem.right === rightChar) {
      // Correct Match
      setMatchOptions(prev => prev.map(o => o.id === selectedLeft ? { ...o, isMatched: true } : o));
      setMatchStatusMsg('Correct match!');
      speakZH(rightChar);
      setSelectedLeft(null);
    } else {
      setMatchStatusMsg('Not quite — try again.');
      setTimeout(() => setMatchStatusMsg(""), 2000);
    }
  };

  // Fill in the blank check
  const handleFillOptionSelect = (opt: string) => {
    setFillSelected(opt);
    const isCorrect = opt === currentLesson.fillBlank.correctAnswer;
    setFillFeedback({ isCorrect, show: true });
    if (isCorrect) speakZH("真棒！答对了");
  };

  // True / False Check
  const handleTrueFalseSelect = (answer: boolean) => {
    setTrueFalseAnswer(answer);
    setTrueFalseSubmitted(true);
    if (answer === currentLesson.trueFalse.correctAnswer) {
      speakZH("太厉害了！回答正确");
    }
  };

  // Stroke Animator sequencer
  const startStrokeAnimation = (char: StrokeCharacter) => {
    if (isStrokeAnimating) return;
    setIsStrokeAnimating(true);
    setActiveStrokeStep(0);

    const stepDelay = 1800; // time to display each stroke
    let currentStep = 0;

    strokeTimerRef.current = setInterval(() => {
      if (currentStep < char.strokes.length - 1) {
        currentStep++;
        setActiveStrokeStep(currentStep);
      } else {
        // Animation finished, pause a bit then loop or stop
        clearInterval(strokeTimerRef.current!);
        setIsStrokeAnimating(false);
      }
    }, stepDelay);
  };

  const stopStrokeAnimation = () => {
    if (strokeTimerRef.current) clearInterval(strokeTimerRef.current);
    setIsStrokeAnimating(false);
  };

  // Clean-up refs on destroy
  useEffect(() => {
    return () => {
      if (evaluationTimerRef.current) clearTimeout(evaluationTimerRef.current);
      if (strokeTimerRef.current) clearInterval(strokeTimerRef.current);
      if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#F6F2E9] flex flex-col selection:bg-orange-100 font-sans relative overflow-hidden">
      
      {/* Decorative desktop shadows & school leaves backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-orange-200/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-emerald-200/10 blur-3xl pointer-events-none" />

      {/* Main Container - Elegant Bound Notebook sitting on Desk */}
      <div 
        id="book-notebook-body" 
        className="w-full h-full min-h-0 bg-[#FAF8F5] rounded-2xl p-4 shadow-lg border border-amber-900/10 relative flex flex-col overflow-hidden"
      >
        
        {/* Top Minimal Brand Header */}
        {!isFocusMode && (
        <div className="flex items-center justify-center text-[10px] text-slate-400 font-medium select-none border-b border-orange-100/60 pb-2 mb-3 gap-3">
          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <span className="font-extrabold text-[#2C2925] text-sm tracking-tight shrink-0">
              Happy Chinese
            </span>
            <span className="text-slate-300 px-0.5 shrink-0">|</span>
            <span className="text-slate-500 text-xs font-medium truncate">
              Unit {currentLesson.id}: {currentLesson.pinyin} · {currentLesson.englishTitle}
            </span>
          </div>
        </div>
        )}

        {/* --- HEADER CONTROLS & DYNAMIC MODE SELECTOR BAR --- */}
        {!isFocusMode && (
        <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-orange-100/80 z-10">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="shrink-0 w-[52px] h-[52px] rounded-full bg-white/95 text-slate-700 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.12)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-[30px] h-[30px]" strokeWidth={2.25} />
            </button>
          </div>

          {/* Core Brand segmented control for learning modes */}
          <div className="flex items-center bg-orange-100/40 p-1 rounded-2xl border border-orange-200/50">
            <button
              onClick={() => switchMode('read')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'read' ? 'bg-[#FCFAF0] text-amber-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📖</span>
              <span>Tap to Read</span>
            </button>
            <button
              onClick={() => switchMode('repeat')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'repeat' ? 'bg-[#FCFAF0] text-sky-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🔁</span>
              <span>Repeat Range</span>
            </button>
            <button
              onClick={() => switchMode('shadow')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'shadow' ? 'bg-[#FCFAF0] text-pink-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎙️</span>
              <span>Shadow Reading</span>
            </button>
            <button
              onClick={() => switchMode('exercise')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'exercise' ? 'bg-[#FCFAF0] text-emerald-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📝</span>
              <span>Practice</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowLessonPicker((v) => !v);
                setShowSettings(false);
              }}
              id="btn-lesson-picker"
              className={`p-1.5 border rounded-xl transition-all hover:scale-105 shadow-sm ${
                showLessonPicker
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-[#FAF8F5] hover:bg-orange-50 border-orange-200/40 text-slate-600'
              }`}
              title="Lessons"
              aria-label="Lessons"
            >
              <LayoutList className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => {
                setShowSettings((v) => !v);
                setShowLessonPicker(false);
              }}
              id="btn-settings-toggle"
              className="p-1.5 bg-[#FAF8F5] hover:bg-orange-50 border border-orange-200/40 text-slate-600 rounded-xl transition-all hover:scale-105 shadow-sm"
              title="Settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>
        )}

        {/* Focus mode — minimal floating controls */}
        {isFocusMode && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="pointer-events-auto shrink-0 w-[52px] h-[52px] rounded-full bg-white/95 text-slate-700 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.12)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-[30px] h-[30px]" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={toggleFocusMode}
              aria-label="Show controls"
              title="Show controls"
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full bg-white/95 text-slate-700 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.12)] text-xs font-bold active:scale-95 transition-transform cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Controls</span>
            </button>
          </div>
        )}

        {/* --- MAIN DOUBLE-PAGE TEXTBOOK SPREAD --- */}
        <main className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-5 relative overflow-hidden bg-orange-100/10 rounded-2xl p-3 border border-orange-100/30 transition-all duration-300 ${isFocusMode ? 'mt-0' : 'mt-3'}`}>
          
          {/* Ring binder division effect in landscape mode to resemble physical workbook */}
          <div className="hidden lg:flex absolute left-1/2 top-4 bottom-4 w-1 bg-amber-800/10 -translate-x-1/2 z-20 flex-col justify-around py-6 pointer-events-none">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-6 h-4 bg-gradient-to-r from-orange-300 via-amber-400 to-amber-600 rounded-full border border-amber-900/15 -ml-[11px] shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            ))}
          </div>

          {/* =========================================
              LEFT PAGE: TEXTBOOK CORES / READING SPREADS
              ========================================= */}
          <section className="rounded-2xl flex flex-col p-4 relative transition-all duration-300 shadow-sm bg-[#FDFDFB] border border-orange-100/60 text-slate-800 md:mr-1">

            <div className={`flex-1 flex flex-col justify-between py-1 overflow-y-auto min-h-0 ${isFocusMode ? 'pb-9' : ''}`}>
              {/* Lesson topic strip — compact */}
              <div className="px-3 py-2 flex items-center gap-2.5 bg-amber-50/75 border border-amber-100 rounded-xl relative overflow-hidden">
                <div className="text-3xl filter drop-shadow select-none shrink-0 leading-none">{currentLesson.textbookLeft.illustration}</div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-orange-600">
                    Lesson {currentLesson.id}
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm tracking-tight leading-tight mt-0.5" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                    {currentLesson.title}
                    <span className="text-xs font-normal text-slate-500 italic ml-1" style={{ fontFamily: '"Google Sans", sans-serif' }}>
                      ({currentLesson.englishTitle})
                    </span>
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold mt-0.5 truncate" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                    {showPinyin ? currentLesson.pinyin : '\u00A0'}
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-video-guide"
                  onClick={() => { setIsVideoOpen(true); setVideoScene(0); }}
                  className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 min-w-[52px] min-h-[52px] rounded-xl bg-orange-100 hover:bg-orange-200 border border-orange-200/70 text-orange-700 transition-colors cursor-pointer"
                  title="Intro Video"
                  aria-label="Intro Video"
                >
                  <Tv className="w-4 h-4" />
                  <span className="text-[9px] font-bold leading-none">Video</span>
                </button>
              </div>

              {/* Instructions banner */}
              <div className="my-2 bg-[#F9F7F1]/80 px-3 py-1.5 rounded-xl border border-orange-100/30 text-[11px] text-slate-600 flex items-center gap-2">
                <span className="text-sm">💡</span>
                {mode === 'read' && (
                  <p><strong className="text-orange-600">Tap to Read</strong> — Tap any word or sentence to hear pronunciation. Use the right panel to practice speaking.</p>
                )}
                {mode === 'repeat' && (
                  <p><strong className="text-sky-700">Repeat Range</strong> — Tap sentences to build a listening playlist. Use Loop to review before your exam.</p>
                )}
                {mode === 'shadow' && (
                  <p><strong className="text-pink-700">Shadow Reading</strong> — Tap sentences to select, then speak each line on the right. AI scores every line you practice.</p>
                )}
                {mode === 'exercise' && (
                  <p>当前处于<strong className="text-emerald-700">互动练习</strong>：点击右半面卡片标签，完成连线、填空、笔画等丰富测试。</p>
                )}
              </div>

              {/* Chinese & Pinyin sentence list styled with workbooks lines */}
              <div className="space-y-3.5 my-2">
                {currentLesson.textbookLeft.sentences.map((sentence) => {
                  const isHighlightedRepeatLine = currentRepeatPlayingId === sentence.id;
                  const isRepeatSelected = selectedRepeatIds.includes(sentence.id);
                  const repeatSelectionIndex = selectedRepeatIds.indexOf(sentence.id);
                  const isShadowSelected = selectedShadowIds.includes(sentence.id);
                  const shadowSelectionIndex = selectedShadowIds.indexOf(sentence.id);
                  const isActiveReadSentence = mode === 'read' && activeBubble?.sentenceId === sentence.id;
                  const isSentencePlaying = activePlayingKey === `sentence-${sentence.id}`;
                  const segments = getSentenceSegments(sentence);

                  return (
                    <div
                      key={sentence.id}
                      onClick={() => {
                        if (mode === 'read') {
                          handleReadSentenceTap(sentence);
                        } else if (mode === 'repeat') {
                          toggleRepeatSentence(sentence.id);
                        } else if (mode === 'shadow') {
                          toggleShadowSentence(sentence.id);
                        }
                      }}
                      className={`group p-3 rounded-2xl border transition-all relative ${
                        isHighlightedRepeatLine 
                          ? 'bg-sky-500/10 border-sky-400 ring-2 ring-sky-300 translate-x-1 shadow-sm' 
                          : isActiveReadSentence || isSentencePlaying
                            ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 shadow-sm'
                          : isRepeatSelected
                            ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-200'
                          : isShadowSelected
                            ? 'bg-pink-50 border-pink-300 ring-1 ring-pink-200'
                            : showReadHighlights && mode === 'read'
                              ? 'bg-[#FCFAF5]/90 border-orange-100 hover:border-orange-300 hover:bg-[#FDFDFB]' 
                              : showReadHighlights
                              ? 'bg-[#FCFAF5]/90 border-orange-100 hover:border-orange-300 hover:bg-[#FDFDFB]' 
                              : 'bg-transparent border-transparent hover:border-orange-100'
                      }`}
                      style={{ cursor: mode === 'read' || mode === 'repeat' || mode === 'shadow' ? 'pointer' : 'default' }}
                    >
                      {mode === 'repeat' && isRepeatSelected && (
                        <span className="absolute -left-2 -top-2 min-w-[20px] h-5 px-1 bg-sky-500 text-white font-extrabold rounded-full flex items-center justify-center text-[10px] shadow-sm">
                          {repeatSelectionIndex + 1}
                        </span>
                      )}
                      {mode === 'shadow' && isShadowSelected && (
                        <span className="absolute -left-2 -top-2 min-w-[20px] h-5 px-1 bg-pink-500 text-white font-extrabold rounded-full flex items-center justify-center text-[10px] shadow-sm">
                          {shadowSelectionIndex + 1}
                        </span>
                      )}

                      {/* Character / word tap blocks for point-to-read */}
                      <div className="flex flex-wrap items-end gap-x-1 gap-y-1 mb-1 leading-normal">
                        {segments.map((segment, segIdx) => {
                          const wordKey = `word-${sentence.id}-${segIdx}`;
                          const isActiveWord = activePlayingKey === wordKey;
                          const isSpeakable = segment.speakable !== false;

                          if (!isSpeakable) {
                            return (
                              <span key={wordKey} className="text-lg font-extrabold text-[#2C2925] px-0.5 select-none" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                                {segment.text}
                              </span>
                            );
                          }

                          return (
                            <button
                              key={wordKey}
                              type="button"
                              onClick={(e) => mode === 'read' && handleReadWordTap(sentence, segment, segIdx, e)}
                              disabled={mode !== 'read'}
                              className={`rounded-lg px-1 py-0.5 transition-all border ${
                                isActiveWord
                                  ? 'bg-orange-200 border-orange-400 scale-105 shadow-sm'
                                  : mode === 'read'
                                    ? 'bg-transparent border-transparent hover:bg-orange-100/80 hover:border-orange-200 active:scale-95'
                                    : 'bg-transparent border-transparent'
                              }`}
                              style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                            >
                              <ruby className="text-lg font-extrabold text-[#2C2925] tracking-wide">
                                {segment.text}
                                {showPinyin && segment.pinyin ? (
                                  <rt className="text-amber-800 text-[10px] font-semibold font-mono tracking-normal block pt-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                                    {segment.pinyin}
                                  </rt>
                                ) : null}
                              </ruby>
                            </button>
                          );
                        })}
                      </div>

                      {aiAssistEnabled && (
                        <p className="text-xs text-slate-500 italic font-medium font-serif flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                          <span>{sentence.english}</span>
                        </p>
                      )}
                      
                      {/* Dynamic volume helper icon */}
                      {mode === 'read' && (
                        <span className="absolute right-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-orange-100 p-1 rounded-md text-orange-600 hover:scale-110 shadow-sm border border-orange-200/50">
                          <Volume2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Repeat Interval Loop controller */}
              {mode === 'repeat' && (
                <div id="repeat-loop-panel" className="bg-sky-50/70 p-3 rounded-2xl border border-sky-200 flex items-center justify-between mt-3 text-slate-800">
                  <div className="text-xs min-w-0">
                    <p className="font-extrabold text-sky-700 flex items-center gap-1">
                      <span>🔁 Loop Player</span>
                    </p>
                    <p className="text-[10px] text-slate-550 mt-0.5 truncate">
                      {selectedRepeatIds.length === 0
                        ? 'Select sentences on the left to start'
                        : `${selectedRepeatIds.length} line${selectedRepeatIds.length > 1 ? 's' : ''} selected · tap again to deselect`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 select-none shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsRepeatPlaying(!isRepeatPlaying)}
                      disabled={selectedRepeatIds.length === 0}
                      className={`px-3.5 py-1.5 min-h-[36px] text-xs font-bold rounded-xl flex items-center gap-1 transition-colors ${
                        selectedRepeatIds.length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                          : isRepeatPlaying 
                            ? 'bg-pink-600 hover:bg-pink-500 text-white' 
                            : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                      }`}
                    >
                      {isRepeatPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isRepeatPlaying ? 'Pause' : 'Loop'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRepeatIds([]);
                        setIsRepeatPlaying(false);
                        setCurrentRepeatPlayingId(null);
                      }}
                      className="p-1.5 min-h-[36px] min-w-[36px] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-650 flex items-center justify-center"
                      title="Clear selection"
                      aria-label="Clear selection"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            {/* Pagination textbook footer navigation indicators */}
            {!isFocusMode && (
            <div className="mt-3 pt-2.5 border-t border-orange-100/60 flex items-center justify-between select-none">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">快乐中文 C-Lingo © 2026</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { if (currentLessonId > 1) setCurrentLessonId(prev => prev - 1); }}
                  disabled={currentLessonId === 1}
                  className="p-1 px-3 bg-orange-100 hover:bg-orange-200 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg text-xs text-orange-700 font-extrabold border border-orange-200/20 shadow-sm"
                >
                  ◀ 课前一单元
                </button>
                <button
                  onClick={() => { if (currentLessonId < LESSONS_DATA.length) setCurrentLessonId(prev => prev + 1); }}
                  disabled={currentLessonId === LESSONS_DATA.length}
                  className="p-1 px-3 bg-orange-100 hover:bg-orange-200 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg text-xs text-orange-700 font-extrabold border border-orange-200/20 shadow-sm"
                >
                  课后一单元 ▶
                </button>
              </div>
            </div>
            )}
            </div>

            {isFocusMode && (
              <div className="absolute inset-x-4 bottom-3 pt-2 border-t border-orange-100/50 flex items-end justify-start pointer-events-none select-none">
                <span className="text-[10px] text-slate-500 font-mono font-semibold">{leftPageNum}</span>
              </div>
            )}
          </section>

          {/* =========================================
              RIGHT PAGE: ADAPTIVE INTERACTION MODES
              ========================================= */}
          <section className="rounded-2xl flex flex-col p-4 bg-[#F8F5EF] border border-[#E9E4D9] shadow-sm text-slate-800 min-h-0 overflow-hidden md:ml-1 relative">
            
            <div className={`flex-1 min-h-0 overflow-y-auto ${isFocusMode ? 'pb-9' : ''}`}>
            {mode === 'read' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b pb-2 border-orange-100/80 mb-3 select-none">
                  <h3 className="font-extrabold text-[#2C2925] text-sm flex items-center gap-2">
                    <span className="p-1 bg-orange-100 text-orange-600 rounded-lg">📖</span>
                    <span>Tap to Read · Vocabulary</span>
                  </h3>
                </div>

                <p className="text-[10px] text-slate-500 mb-3 select-none">
                  Tap a word below to hear it. Tap a sentence on the left to hear the full line.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {currentLesson.vocabList.map((vocab, vIdx) => (
                    <button
                      key={vIdx}
                      type="button"
                      onClick={() => speakZH(vocab.chinese, `vocab-${vIdx}`)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer select-none ${
                        activePlayingKey === `vocab-${vIdx}`
                          ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-200'
                          : 'bg-[#FDFDFB] border-slate-200 hover:bg-orange-50/80 hover:border-orange-200'
                      }`}
                    >
                      <ruby className="font-extrabold text-sm text-[#2C2925]" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                        {vocab.chinese}
                        {showPinyin && (
                          <rt className="text-[10px] font-mono text-amber-800 block pt-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>{vocab.pinyin}</rt>
                        )}
                      </ruby>
                      {aiAssistEnabled && (
                        <span className="text-[10px] block text-slate-500 mt-1 font-medium">{vocab.english}</span>
                      )}
                    </button>
                  ))}
                </div>

                {activeBubble && (() => {
                  const activeSent = currentLesson.textbookLeft.sentences.find(s => s.id === activeBubble.sentenceId);
                  if (!activeSent) return null;
                  return (
                    <div className="mt-auto bg-[#FAF7F1] rounded-2xl p-4 border border-orange-200 shadow-sm animate-fade-in">
                      <p className="text-[9px] uppercase text-orange-600 tracking-wider font-extrabold mb-2">Selected line</p>
                      <p className="text-base font-bold text-slate-800 leading-relaxed" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{activeSent.chinese}</p>
                      {showPinyin && (
                        <p className="text-xs text-amber-800 font-mono mt-1" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>{activeSent.pinyin}</p>
                      )}
                      {aiAssistEnabled && (
                        <p className="text-xs text-slate-500 italic mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                          <span>"{activeSent.english}"</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => speakZH(activeSent.chinese, `sentence-${activeSent.id}`)}
                          className="p-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl border border-orange-200/40"
                          aria-label="Play again"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openFollowRead(activeSent.chinese, activeSent.pinyin, activeSent.english)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Practice pronunciation</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {!activeBubble && (
                  <div className="mt-auto text-center py-6 px-3 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200 text-[11px] text-slate-500">
                    Select a word or sentence on the left to start tap-to-read.
                  </div>
                )}
              </div>
            ) : mode === 'repeat' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b pb-2 border-orange-100/80 mb-3 select-none shrink-0">
                  <h3 className="font-extrabold text-[#2C2925] text-sm flex items-center gap-2">
                    <span className="p-1 bg-sky-100 text-sky-600 rounded-lg">🔁</span>
                    <span>Review Playlist</span>
                  </h3>
                  {selectedRepeatSentences.length > 0 && (
                    <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded-full text-sky-700 font-mono font-bold">
                      {selectedRepeatSentences.length} lines
                    </span>
                  )}
                </div>

                {selectedRepeatSentences.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center text-center px-3 select-none">
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Tap sentences on the left to build your listening queue.
                      Use Loop on the left to repeat them — no speaking required.
                    </p>
                    <div className="bg-sky-50/70 rounded-2xl border border-dashed border-sky-200 p-4 text-[11px] text-slate-400">
                      No lines selected yet
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-500 mb-2 select-none shrink-0">
                      Listen-only review. Tap a line to play, or use Loop on the left page.
                    </p>
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
                      {selectedRepeatSentences.map((sentence, idx) => {
                        const isLoopPlaying = currentRepeatPlayingId === sentence.id;

                        return (
                          <div
                            key={sentence.id}
                            className={`rounded-2xl border p-3 transition-all ${
                              isLoopPlaying
                                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                                : 'bg-[#FDFDFB] border-orange-100'
                            }`}
                          >
                            <span className="text-[10px] font-extrabold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-md">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed mt-1.5" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                              {sentence.chinese}
                            </p>
                            {showPinyin && (
                              <p className="text-[10px] text-amber-800 font-mono mt-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                                {sentence.pinyin}
                              </p>
                            )}
                            {aiAssistEnabled && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-violet-500 shrink-0" />
                                <span>{sentence.english}</span>
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => speakZH(sentence.chinese, `repeat-${sentence.id}`)}
                              className="w-full mt-2.5 min-h-[44px] py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-orange-200/50"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : mode === 'shadow' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b pb-2 border-orange-100/80 mb-2 select-none shrink-0">
                  <h3 className="font-extrabold text-[#2C2925] text-sm flex items-center gap-2">
                    <span className="p-1 bg-pink-100 text-pink-600 rounded-lg">🎙️</span>
                    <span>Sentence Challenge</span>
                  </h3>
                  <span className="text-[10px] bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 font-mono font-bold">
                    {selectedShadowIds.length > 0 ? `${selectedShadowIds.length} selected` : `${currentLesson.textbookLeft.sentences.length} lines`}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 mb-2 select-none shrink-0">
                  Select sentences on the left, or practice all lines below. Every line requires AI scoring.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-2 shrink-0">
                  {(['all', 'not_scored', 'retry'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setShadowFilter(f)}
                      className={`px-2.5 py-1 min-h-[32px] rounded-lg text-[10px] font-bold border transition-colors ${
                        shadowFilter === f
                          ? 'bg-pink-600 text-white border-pink-500'
                          : 'bg-[#FDFDFB] text-slate-600 border-orange-100 hover:bg-pink-50'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'not_scored' ? 'Not scored' : 'Retry (<80)'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedShadowIds(currentLesson.textbookLeft.sentences.map((s) => s.id))}
                    className="px-2.5 py-1 min-h-[32px] rounded-lg text-[10px] font-bold border bg-[#FDFDFB] text-slate-600 border-orange-100 hover:bg-pink-50"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShadowIds([])}
                    className="px-2.5 py-1 min-h-[32px] rounded-lg text-[10px] font-bold border bg-[#FDFDFB] text-slate-600 border-orange-100 hover:bg-pink-50"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
                  {filteredShadowSentences.map((sentence) => {
                    const score = shadowSentenceScores[sentence.id];
                    const queueIdx = selectedShadowIds.indexOf(sentence.id);
                    const isSelected = selectedShadowIds.includes(sentence.id);

                    return (
                      <div
                        key={sentence.id}
                        className={`rounded-2xl border p-3 transition-all ${
                          score != null && score >= 80
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : score != null
                              ? 'bg-amber-50/50 border-amber-200'
                              : isSelected
                                ? 'bg-pink-50/60 border-pink-200'
                                : 'bg-[#FDFDFB] border-orange-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            {isSelected && (
                              <span className="text-[10px] font-extrabold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-md">
                                {queueIdx + 1}
                              </span>
                            )}
                            {score == null && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Not scored</span>
                            )}
                          </div>
                          {score != null && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                              score >= 80 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                            }`}>
                              {score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                          {sentence.chinese}
                        </p>
                        {showPinyin && (
                          <p className="text-[10px] text-amber-800 font-mono mt-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                            {sentence.pinyin}
                          </p>
                        )}
                        {aiAssistEnabled && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-violet-500 shrink-0" />
                            <span>{sentence.english}</span>
                          </p>
                        )}
                        <div className="flex gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => speakZH(sentence.chinese, `shadow-${sentence.id}`)}
                            className="flex-1 min-h-[44px] py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-orange-200/50"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openFollowRead(sentence.chinese, sentence.pinyin, sentence.english, sentence.id, false)}
                            className="flex-1 min-h-[44px] py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>Speak & Score</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2.5 border-t border-orange-100/60 shrink-0 select-none space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Scored{' '}
                      {Object.keys(shadowSentenceScores).filter((id) =>
                        (selectedShadowIds.length > 0 ? selectedShadowIds : currentLesson.textbookLeft.sentences.map((s) => s.id)).includes(id)
                      ).length}
                      /{selectedShadowIds.length > 0 ? selectedShadowIds.length : currentLesson.textbookLeft.sentences.length}
                    </span>
                    {Object.keys(shadowSentenceScores).length > 0 && (
                      <span className="font-mono font-bold text-emerald-700">
                        Avg{' '}
                        {Math.round(
                          (selectedShadowIds.length > 0 ? selectedShadowSentences : currentLesson.textbookLeft.sentences)
                            .filter((s) => shadowSentenceScores[s.id] != null)
                            .reduce((sum, s) => sum + shadowSentenceScores[s.id], 0) /
                            Math.max(
                              1,
                              (selectedShadowIds.length > 0 ? selectedShadowSentences : currentLesson.textbookLeft.sentences)
                                .filter((s) => shadowSentenceScores[s.id] != null).length
                            )
                        )}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={startShadowTraining}
                    className="w-full min-h-[48px] py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs"
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      Start Training
                      {selectedShadowIds.length > 0 ? ` (${selectedShadowIds.length} lines)` : ' (all lines)'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              // Condition B: Render Standard Exercise panels with 5 custom tabs
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Horizontal Navigation tabs on the right side for exercises */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-orange-100/60 pb-2 mb-3 select-none">
                  {EXERCISE_TABS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={label}
                      title={label}
                      onClick={() => { setExerciseTab(id); switchMode('exercise'); }}
                      className={`min-h-[36px] min-w-[36px] py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 ${
                        exerciseTab === id
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-[#FDFDFB] text-slate-600 hover:bg-orange-100/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* --- DISPLAY ACTIVE SUB-EXERCISE --- */}
                <div className="flex-1 flex flex-col justify-between mt-1">

                  {/* 1. LINE MATCH PANEL */}
                  {exerciseTab === 'match' && (
                    <div id="exercise-line-match" className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs select-none mb-1">
                          <p className="font-extrabold text-slate-800">Word Match</p>
                          <button
                            onClick={() => {
                              setMatchOptions(currentLesson.matchOptions);
                              setSelectedLeft(null);
                              setMatchStatusMsg("");
                            }}
                            className="text-[10px] text-orange-600 hover:underline font-extrabold flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 select-none">Tap English on the left, then tap the matching Chinese word.</p>

                        <div className="grid grid-cols-2 gap-3.5">
                          {/* Left English options */}
                          <div className="space-y-2 select-none">
                            {matchOptions.map((opt) => (
                              <button
                                key={opt.id}
                                disabled={opt.isMatched}
                                onClick={() => handleLeftMatchSelect(opt.id)}
                                className={`w-full p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                                  opt.isMatched 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-400 line-through opacity-50' 
                                    : selectedLeft === opt.id 
                                      ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300' 
                                      : 'bg-[#FDFDFB] hover:bg-orange-50 border-slate-250 text-slate-700'
                                }`}
                              >
                                <span className="mr-1">🔹</span> {opt.left}
                              </button>
                            ))}
                          </div>

                          {/* Right Chinese options shuffled */}
                          <div className="space-y-2 select-none">
                            {matchOptions.map((opt, oIdx) => {
                              const charItem = matchOptions[(oIdx + 1) % matchOptions.length];
                              const actualTargetMatched = matchOptions.find(o => o.right === charItem.right)?.isMatched;

                              return (
                                <button
                                  key={oIdx}
                                  disabled={actualTargetMatched}
                                  onClick={() => handleRightMatchSelect(charItem.right)}
                                  className={`w-full p-2.5 rounded-xl text-xs font-extrabold border text-left transition-all ${
                                    actualTargetMatched 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 opacity-50' 
                                      : 'bg-[#FDFDFB] hover:bg-orange-50 border-slate-250 text-slate-800'
                                  }`}
                                >
                                  <span className="mr-1">🔸</span>
                                  <span style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{charItem.right}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Status indicator msg and progress bar */}
                      <div className="mt-4 bg-[#FDFDFB] p-3 rounded-2xl border border-orange-100 flex flex-col justify-center min-h-[56px] shadow-sm select-none">
                        {matchStatusMsg ? (
                          <p className="text-xs text-orange-700 font-extrabold text-center">{matchStatusMsg}</p>
                        ) : matchOptions.every(o => o.isMatched) ? (
                          <div className="text-center">
                            <p className="text-xs text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                              <span>All matched — great job!</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">+3 stars</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Progress</span>
                            <span className="font-bold">{matchOptions.filter(o => o.isMatched).length}/{matchOptions.length}</span>
                          </div>
                        )}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 transition-all duration-300" 
                            style={{ width: `${(matchOptions.filter(o => o.isMatched).length / matchOptions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. FILL BLANK QUESTIONS CARD */}
                  {exerciseTab === 'fill' && (
                    <div id="exercise-fill-blank" className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 select-none">Fill in the Blank</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 select-none mb-3">Listen, then choose the correct word.</p>

                        <div className="my-3 bg-[#FDFDFB] rounded-2xl p-4 border border-orange-100 text-center relative shadow-sm">
                          <button
                            onClick={() => speakZH(currentLesson.fillBlank.audioText)}
                            className="absolute top-3 left-3 bg-orange-100 hover:bg-orange-200 text-orange-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer border border-orange-200/30"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>

                          <div className="py-2.5 mt-4">
                            <span className="text-slate-405 italic font-serif text-xs block mb-1">“{currentLesson.fillBlank.english}”</span>
                            <div className="text-lg font-extrabold tracking-wide text-slate-800">
                              你叫什么{" "}
                              <span className="inline-block px-4 py-0.5 border-b-2 border-dashed border-orange-400 text-orange-700 font-extrabold">
                                {fillSelected || "_____"}
                              </span>{" "}
                              ？
                            </div>
                            <span className="text-xs text-slate-400 font-mono block mt-1.5">nǐ jiào shén me ({currentLesson.fillBlank.pinyin}) ?</span>
                          </div>
                        </div>

                        {/* Answers choices options */}
                        <div className="grid grid-cols-3 gap-2 select-none">
                          {currentLesson.fillBlank.options.map((option, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleFillOptionSelect(option)}
                              className={`p-3 rounded-xl border font-bold text-sm cursor-pointer transition-all ${
                                fillSelected === option
                                  ? option === currentLesson.fillBlank.correctAnswer
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                    : 'bg-pink-50 border-pink-200 text-pink-600'
                                  : 'bg-[#FDFDFB] hover:bg-orange-50 border-slate-250 text-slate-700'
                              }`}
                              style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instant evaluation panel */}
                      {fillFeedback && (
                        <div className={`mt-3 p-3 rounded-2xl border select-none ${fillFeedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-slate-800' : 'bg-pink-50 border-pink-100 text-slate-800'}`}>
                          {fillFeedback.isCorrect ? (
                            <div>
                              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct!
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">You picked the right character.</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-bold text-pink-700 flex items-center gap-1">
                                <X className="w-4 h-4" /> Not quite.
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Listen again and try another word.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. TRUE OR FALSE PANEL */}
                  {exerciseTab === 'truefalse' && (
                    <div id="exercise-true-false" className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 select-none">True or False</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 select-none mb-3">Read the statement and choose True or False.</p>

                        <div className="bg-[#FDFDFB] rounded-2xl p-4 text-center my-3 border border-orange-100 shadow-sm relative">
                          <span className="text-5xl block filter drop-shadow mb-2 select-none">{currentLesson.trueFalse.illustration}</span>
                          <p className="text-sm font-extrabold text-slate-800">“ {currentLesson.trueFalse.text} ”</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 select-none">
                          <button
                            onClick={() => handleTrueFalseSelect(true)}
                            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              trueFalseAnswer === true
                                ? currentLesson.trueFalse.correctAnswer === true
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-pink-50 border-pink-200 text-pink-600'
                                : 'bg-[#FDFDFB] hover:bg-orange-50 border-slate-250 text-slate-700'
                            }`}
                          >
                            <span className="text-emerald-500 text-lg">✓</span> <span>True</span>
                          </button>
                          <button
                            onClick={() => handleTrueFalseSelect(false)}
                            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              trueFalseAnswer === false
                                ? currentLesson.trueFalse.correctAnswer === false
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-pink-50 border-pink-200 text-pink-600'
                                : 'bg-[#FDFDFB] hover:bg-orange-50 border-slate-250 text-slate-700'
                            }`}
                          >
                            <span className="text-pink-500 text-lg">✗</span> <span>False</span>
                          </button>
                        </div>
                      </div>

                      {trueFalseSubmitted && (
                        <div className={`mt-3 p-3.5 rounded-2xl border text-xs leading-relaxed select-none ${
                          trueFalseAnswer === currentLesson.trueFalse.correctAnswer 
                            ? 'bg-emerald-55 border-emerald-200 text-slate-800 shadow-sm' 
                            : 'bg-pink-50 border-pink-100 text-slate-800 shadow-sm'
                        }`}>
                          <strong className="block font-extrabold text-orange-700">Explanation</strong>
                          <p className="mt-0.5 text-slate-600 font-medium">{currentLesson.trueFalse.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. DIALOGUE ROLE-PLAY WITH AUDIO SAVER */}
                  {exerciseTab === 'roleplay' && (
                    <div id="exercise-roleplay" className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 select-none">Dialogue Recording</p>
                        <p className="text-[10px] text-slate-550 mt-0.5 select-none mb-3">Tap the mic and record each line in the comic.</p>

                        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                          {currentLesson.comicRoleplay.map((chat, cIdx) => (
                            <div key={cIdx} className="flex gap-2.5 items-start">
                              <span className="text-2xl filter drop-shadow bg-[#FDFDFB] p-2 rounded-xl border border-orange-100 shadow-sm select-none">{chat.avatar}</span>
                              <div className="flex-1 bg-[#FDFDFB] rounded-r-2xl rounded-bl-2xl p-2.5 border border-orange-100 relative shadow-sm text-left">
                                <span className="text-[10px] text-orange-600 block font-extrabold select-none">{chat.name}：</span>
                                
                                <p className="text-xs font-extrabold text-slate-800 mt-0.5" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{chat.bubbleText}</p>
                                <p className="text-[9px] text-slate-400 font-mono font-semibold mt-0.5">{chat.pinyin}</p>

                                {/* Action bar for roleplay mic */}
                                <div className="mt-2 flex items-center justify-between border-t pt-1.5 border-orange-100/50 select-none">
                                  <button
                                    onClick={() => speakZH(chat.bubbleText)}
                                    className="p-1 px-2.5 bg-[#FAF8F5] hover:bg-orange-50 border border-orange-200/30 rounded-lg text-[9px] flex items-center gap-1 text-slate-600 font-bold"
                                  >
                                    <Volume2 className="w-3 h-3 text-orange-600" />
                                    <span>Listen</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      speakZH(chat.bubbleText);
                                      setFollowModal({
                                        isOpen: true,
                                        text: chat.bubbleText,
                                        pinyin: chat.pinyin,
                                        english: 'Comic dialogue practice'
                                      });
                                      setFollowRecordState('idle');
                                      setEvalResultScore(0);
                                      setRolePlayRecords(prev => ({ ...prev, [cIdx]: true }));
                                    }}
                                    className={`p-1 px-2.5 rounded-lg text-[9px] flex items-center gap-1 font-bold ${
                                      rolePlayRecords[cIdx] 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                  >
                                    <Mic className="w-3 h-3" />
                                    <span>{rolePlayRecords[cIdx] ? 'Replay mine' : 'Record'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#FCFAF5] p-2 text-center rounded-xl text-[9px] text-slate-500 mt-2 border border-orange-100/50 font-medium select-none">
                        Recordings are saved locally in this e-book session.
                      </div>
                    </div>
                  )}

                  {/* 5. STROKE ORDER ANIMATOR GRID */}
                  {exerciseTab === 'stroke' && (
                    <div id="exercise-stroke-order" className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Selector of stroke character guides */}
                        <div className="flex justify-between items-center mb-1 text-xs select-none">
                          <p className="font-extrabold text-slate-800">Stroke Order</p>
                          <div className="flex bg-[#FDFDFB] rounded-lg p-0.5 border border-orange-200/50 shadow-sm">
                            {currentLesson.strokeChars.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveStrokeCharIdx(idx);
                                  setActiveStrokeStep(-1);
                                  stopStrokeAnimation();
                                }}
                                className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer font-bold ${
                                  activeStrokeCharIdx === idx 
                                    ? 'bg-orange-600 text-white font-extrabold shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                                style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                              >
                                {s.char}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Stroke Guide Chinese Rice Work sheet drawing */}
                        {(() => {
                          const charObj = currentLesson.strokeChars[activeStrokeCharIdx];
                          if (!charObj) return null;
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                              {/* Left Calligraphy Tianzige red lines sheet */}
                              <div className="relative bg-[#FDFDFB] rounded-2xl p-4 flex flex-col items-center justify-center border border-red-500/15 overflow-hidden shadow-sm h-36">
                                
                                {/* Background Calligraphy grid helper (Tianzige 田字格) */}
                                <div className="absolute inset-0 m-2 tianzige-pattern tianzige-diagonal rounded border-2 border-dashed border-red-500/10 pointer-events-none" />

                                <svg viewBox="0 0 100 100" className="w-28 h-28 relative select-none">
                                  <text
                                    x="50"
                                    y="56"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#E2E8F0"
                                    style={{ fontFamily: 'KaiTi, STKaiti, serif', fontSize: 68, fontWeight: 700 }}
                                  >
                                    {charObj.char}
                                  </text>
                                  {/* Render base background character elements in light brush gray */}
                                  {charObj.strokes.map((path, idx) => (
                                    <path
                                      key={`bg-${idx}`}
                                      d={path}
                                      fill="none"
                                      stroke="#E2E8F0"
                                      strokeWidth="9"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  ))}

                                  {/* Animated red brush traces over based on step selection */}
                                  {charObj.strokes.map((path, idx) => {
                                    const isVisible = activeStrokeStep === -1 || idx <= activeStrokeStep;
                                    const isCurrentlyDrawing = activeStrokeStep === idx;
                                    return (
                                      <path
                                        key={`fg-${idx}`}
                                        d={path}
                                        fill="none"
                                        stroke={isCurrentlyDrawing ? "#e28600" : "#C2410C"}
                                        strokeWidth="9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                          transition: "all 0.8s ease-in-out",
                                          strokeDasharray: isCurrentlyDrawing ? "200" : "none",
                                          strokeDashoffset: isCurrentlyDrawing ? "0" : "none",
                                          display: isVisible ? 'block' : 'none'
                                        }}
                                      />
                                    );
                                  })}
                                </svg>
                              </div>

                              {/* Right detailed control definitions */}
                              <div className="flex flex-col justify-between py-0.5 text-left">
                                <div className="bg-[#FDFDFB] px-3.5 py-2.5 rounded-2xl border border-orange-100 text-xs shadow-sm">
                                  <div className="flex justify-between items-center font-bold text-orange-850">
                                    <span className="font-extrabold text-sm" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{charObj.char}</span>
                                    <span className="bg-orange-100 text-orange-700 p-0.5 px-2 rounded-md font-extrabold text-[10px]">{charObj.meaning}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono font-medium">
                                    Stroke {activeStrokeStep === -1 ? 0 : activeStrokeStep + 1} / {charObj.strokes.length}
                                  </p>
                                  <div className="mt-2 text-slate-600 leading-relaxed text-[11px] min-h-[38px] font-medium">
                                    {activeStrokeStep === -1 ? (
                                      <span>Tap play to watch the stroke order animation.</span>
                                    ) : (
                                      <span>{charObj.meanings[activeStrokeStep]}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-1.5 mt-2 select-none">
                                  <button
                                    onClick={() => {
                                      stopStrokeAnimation();
                                      startStrokeAnimation(charObj);
                                    }}
                                    disabled={isStrokeAnimating}
                                    className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer shadow-sm shadow-orange-600/10"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>{isStrokeAnimating ? 'Playing…' : 'Play strokes'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      stopStrokeAnimation();
                                      setActiveStrokeStep(-1);
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl"
                                    title="Reset"
                                  >
                                    <RotateCcw className="w-4 h-4 text-slate-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-orange-100/60 pt-2.5 mt-3 select-none">
                        <span>支持点选笔画定位跟学。</span>
                        <div className="flex gap-1 font-bold">
                          <button 
                            disabled={activeStrokeStep <= -1}
                            onClick={() => { stopStrokeAnimation(); setActiveStrokeStep(prev => prev - 1); }}
                            className="p-1 px-3 bg-[#FDFDFB] hover:bg-orange-50 border border-orange-200/30 disabled:opacity-40 text-[10px] rounded"
                          >
                            ◀ 上一笔
                          </button>
                          <button 
                            disabled={activeStrokeStep >= currentLesson.strokeChars[activeStrokeCharIdx].strokes.length - 1}
                            onClick={() => { stopStrokeAnimation(); setActiveStrokeStep(prev => prev + 1); }}
                            className="p-1 px-3 bg-[#FDFDFB] hover:bg-orange-50 border border-orange-200/30 disabled:opacity-40 text-[10px] rounded"
                          >
                            下一笔 ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            </div>

            {isFocusMode && (
              <div className="absolute inset-x-4 bottom-3 pt-2 border-t border-orange-100/50 flex items-end justify-end gap-2 pointer-events-none select-none">
                <span className="text-[10px] text-slate-500 font-mono font-semibold">{rightPageNum}</span>
                <span className="text-[9px] text-slate-400 font-medium">of {totalPages}</span>
              </div>
            )}

          </section>

        </main>

        {/* Minimal functional footer */}
        {!isFocusMode && (
        <footer className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-orange-100/60 pt-3 z-10 select-none gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold shrink-0">
            <span>Reading speed:</span>
            <span className="font-extrabold text-orange-700 font-mono px-2 py-0.5 bg-orange-100 rounded-full border border-orange-200/20">{voiceSpeed}x</span>
          </div>

          <button
            type="button"
            onClick={toggleFocusMode}
            aria-label="Focus reading"
            title="Hide controls for full-page reading"
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200/50 text-[10px] font-bold transition-colors cursor-pointer shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono font-semibold shrink-0">
            Pages {leftPageNum}–{rightPageNum} of {totalPages}
          </span>
        </footer>
        )}

        {/* Lesson picker dropdown — chapter preview */}
        {showLessonPicker && !isFocusMode && (
          <div
            id="lesson-picker-panel"
            className="absolute top-[72px] right-4 w-[280px] bg-[#FDFDFB] border border-orange-200/80 rounded-2xl shadow-2xl p-4 z-40 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-2 mb-2 select-none">
              <h3 className="font-extrabold text-orange-800 text-xs uppercase tracking-wider">Lessons</h3>
              <button
                type="button"
                onClick={() => setShowLessonPicker(false)}
                className="p-1 hover:bg-orange-100/50 rounded-lg text-slate-400 hover:text-slate-800"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {LESSONS_DATA.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => selectLesson(lesson.id)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border flex justify-between items-center gap-2 cursor-pointer transition-colors ${
                    currentLessonId === lesson.id
                      ? 'bg-orange-50 border-orange-300 text-orange-800'
                      : 'bg-[#FAF8F5] border-orange-100 text-slate-600 hover:bg-[#FAF7F1]'
                  }`}
                >
                  <span>Lesson {lesson.id}: {lesson.englishTitle}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">{lesson.pinyin}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            OVERLAY MODALS AND DRAWER POPUPS
            ========================================= */}

        {/* 1. AUDIO RECORDING FOLLOW-READ EVAL MODAL (跟读弹窗) */}
        {followModal.isOpen && (
          <div id="follow-read-modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-[#FDFDFB] border border-orange-200/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left relative mt-4">
              
              <button
                onClick={() => {
                  if (followRecordState === 'recording') handleStopRecording();
                  setFollowModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="absolute top-4 right-4 bg-orange-100 hover:bg-orange-200 text-orange-700 p-1 rounded-full transition-colors cursor-pointer shadow-sm border border-orange-200/30"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎙️</span>
                <span className="text-xs font-extrabold text-orange-700 tracking-wide uppercase">
                  {followModal.shadowSession ? 'Shadow Reading · AI Score' : 'Speak & Score'}
                </span>
                {followModal.shadowSession && (
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">
                    {shadowSessionIndex + 1}/{shadowSessionQueue.length}
                  </span>
                )}
              </div>

              {/* Character Focus text */}
              <div className="bg-[#FAF7F1] rounded-2xl p-4 text-center border border-orange-100 my-4 shadow-inner">
                <ruby className="text-3xl font-extrabold text-slate-800 tracking-widest block py-2 select-none">
                  {followModal.text}
                  <rt className="text-amber-800 text-xs font-semibold font-mono block pt-1 tracking-tight">{showPinyin ? followModal.pinyin : ''}</rt>
                </ruby>
                {aiAssistEnabled && (
                  <p className="text-xs text-slate-400 italic mt-1 font-serif">"{followModal.english}"</p>
                )}
              </div>

              {/* Main recording control center */}
              <div className="my-5 flex flex-col items-center justify-center min-h-[140px] select-none">
                
                {followRecordState === 'idle' && (
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-4 font-medium">Allow microphone access, then tap to record your pronunciation.</p>
                    <button
                      onClick={handleStartRecording}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer text-xs min-h-[48px]"
                    >
                      <Mic className="w-4 h-4 animate-pulse text-emerald-100" />
                      <span>Start Recording</span>
                    </button>
                  </div>
                )}

                {followRecordState === 'recording' && (
                  <div className="text-center w-full">
                    <p className="text-xs text-rose-500 font-extrabold animate-pulse mb-3">Recording…</p>
                    
                    {/* Animated Volume Audio Waveform */}
                    <div className="h-12 flex items-center justify-center gap-1 px-4 my-2">
                      {[...Array(10)].map((_, i) => {
                        const h = micAmplitude > 0 ? Math.max(8, micAmplitude * (0.2 + Math.random() * 0.8)) : 8;
                        return (
                          <div 
                            key={i} 
                            style={{ height: `${h}px` }}
                            className="w-1.5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full transition-all duration-100 shadow" 
                          />
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2">Up to 4 seconds, or tap stop when finished.</p>
                    <button
                      onClick={handleStopRecording}
                      className="mt-4 px-4 py-1.5 min-h-[36px] bg-rose-600 hover:bg-rose-500 rounded-xl text-[10px] font-extrabold text-white transition-all cursor-pointer shadow-sm shadow-rose-600/10"
                    >
                      Stop & Evaluate
                    </button>
                  </div>
                )}

                {followRecordState === 'evaluating' && (
                  <div className="text-center">
                    <div className="inline-block relative">
                      <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute inset-0 m-auto animate-bounce" />
                    </div>
                    <p className="text-xs text-orange-700 font-extrabold mt-4 animate-pulse">AI analyzing pronunciation…</p>
                    <p className="text-[9px] text-slate-400 mt-1">Accuracy · Tones · Fluency</p>
                  </div>
                )}

                {followRecordState === 'result' && (
                  <div className="text-center w-full">
                    
                    {/* Stars visual reward */}
                    <div className="flex items-center justify-center gap-1 text-amber-500 my-1">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < Math.ceil(evalResultScore / 20);
                        return <Star key={i} className={`w-6 h-6 fill-current ${filled ? 'text-[#F59E0B] animate-bounce' : 'text-slate-200'}`} style={{ animationDelay: `${i*100}ms` }} />;
                      })}
                    </div>

                    <div className="text-xs font-extrabold text-slate-700 mt-1">Score: <span className="text-xl text-emerald-600 font-mono font-extrabold">{evalResultScore}</span></div>
                    <p className="text-xs text-[#2C2925] font-extrabold mt-1">
                      {evalResultScore >= 95 ? 'Excellent — native-like clarity!' :
                       evalResultScore >= 90 ? 'Great job — tones are on point!' : 'Good effort — keep practicing!'}
                    </p>

                    {/* Speech subdimensions details */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FAF7F1] p-2.5 rounded-xl border border-orange-100 my-3 text-[9px] font-bold">
                      <div>
                        <span className="text-slate-450 block font-normal">Accuracy</span>
                        <span className="text-emerald-600 font-extrabold font-mono">{evalResultScore - 1}%</span>
                      </div>
                      <div>
                        <span className="text-slate-455 block font-normal">Tones</span>
                        <span className="text-[#F59E0B] font-extrabold font-mono">{evalResultScore >= 92 ? "95%" : "89%"}</span>
                      </div>
                      <div>
                        <span className="text-slate-460 block font-normal">Fluency</span>
                        <span className="text-orange-600 font-extrabold font-mono">{evalResultScore}%</span>
                      </div>
                    </div>

                    {/* Playback simulation */}
                    <div className="flex gap-2 justify-center mt-4">
                      <button
                        onClick={() => {
                          setIsMyVoicePlaying(true);
                          speakZH(followModal.text); // TTS simulated replay
                          setTimeout(() => setIsMyVoicePlaying(false), 2000);
                        }}
                        className={`px-4 py-1.5 text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                          isMyVoicePlaying ? 'bg-amber-600 text-white shadow-sm' : 'bg-[#FAF8F5] hover:bg-orange-50 border border-orange-200/30 text-slate-700'
                        }`}
                      >
                        <Volume2 className="w-3 h-3 text-orange-600" />
                        <span>{isMyVoicePlaying ? 'Playing…' : 'My recording'}</span>
                      </button>

                      <button
                        onClick={handleStartRecording}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-extrabold text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-emerald-500/10"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>

                    {followModal.shadowSession && (
                      <button
                        type="button"
                        onClick={advanceShadowSession}
                        className="w-full mt-3 min-h-[44px] py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        {shadowSessionIndex + 1 >= shadowSessionQueue.length ? 'View Session Report' : 'Next line ▶'}
                      </button>
                    )}

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* Shadow session report */}
        {shadowSessionReportOpen && (
          <div id="shadow-session-report" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-[#FDFDFB] border border-pink-200/80 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShadowSessionReportOpen(false)}
                className="absolute top-4 right-4 bg-pink-100 hover:bg-pink-200 text-pink-700 p-1 rounded-full"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h3 className="font-extrabold text-slate-800 text-sm">Session Report</h3>
              </div>
              {(() => {
                const lines = shadowSessionQueue
                  .map((id) => currentLesson.textbookLeft.sentences.find((s) => s.id === id))
                  .filter(Boolean) as SentenceItem[];
                const scored = lines.filter((s) => shadowSentenceScores[s.id] != null);
                const avg = scored.length
                  ? Math.round(scored.reduce((sum, s) => sum + shadowSentenceScores[s.id], 0) / scored.length)
                  : 0;
                return (
                  <>
                    <div className="text-center py-3 mb-3 bg-pink-50 rounded-2xl border border-pink-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall</p>
                      <p className="text-4xl font-mono font-extrabold text-pink-600 mt-1">{avg || '—'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{scored.length}/{lines.length} lines scored</p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      {lines.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF7F1] border border-orange-100 text-xs">
                          <span className="truncate font-bold text-slate-800" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{s.chinese}</span>
                          <span className={`font-mono font-extrabold shrink-0 ${
                            shadowSentenceScores[s.id] == null ? 'text-slate-400' :
                            shadowSentenceScores[s.id] >= 80 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {shadowSentenceScores[s.id] ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShadowSessionReportOpen(false);
                        const weakIds = lines.filter((s) => shadowSentenceScores[s.id] == null || shadowSentenceScores[s.id] < 80).map((s) => s.id);
                        if (weakIds.length > 0) {
                          setSelectedShadowIds(weakIds);
                          setShadowFilter('retry');
                        }
                      }}
                      className="w-full min-h-[44px] py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs"
                    >
                      Retry weak lines
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* 2. SYSTEM INSTRUCTIONAL VIDEO INTRO OVERLAY (导学视频模拟) */}
        {isVideoOpen && (
          <div id="video-intro-overlay" className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 select-none animate-fade-in">
            <div className="w-full max-w-lg bg-[#FDFDFB] border border-orange-200/80 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
              
              {/* Video Title Bar */}
              <div className="bg-[#FAF7F1] px-4 py-3 flex justify-between items-center border-b border-orange-100">
                <span className="text-slate-800 text-xs font-extrabold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>C-Lingo 快乐导修大课堂 — {currentLesson.title}</span>
                </span>
                <button 
                  onClick={() => setIsVideoOpen(false)} 
                  className="p-1 text-slate-400 hover:text-slate-800 rounded bg-[#FAF8F5] border border-orange-100 hover:scale-105"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Simulated Video Screen display */}
              <div className="aspect-video bg-[#EEF2F6] relative flex flex-col items-center justify-center p-6 text-center text-slate-800 overflow-hidden">
                <div className="absolute inset-x-0 top-3 text-[9px] text-slate-400 tracking-wider font-extrabold">
                  PLAYING INTERACTIVE GRAPHICS TIMELINE STREAM MOCK
                </div>

                {/* Animated Cartoon Characters Scenes */}
                {videoScene === 0 && (
                  <div className="animate-fade-in flex flex-col items-center justify-center">
                    <span className="text-6xl block filter drop-shadow animate-bounce">👦👋🎒</span>
                    <p className="text-base font-extrabold text-[#2C2925] mt-3">“你好呀！我是导学学伴小明。”</p>
                    <p className="text-[11px] text-slate-550 mt-1 max-w-sm font-medium">"在这里我们开始美妙的快乐中文课！今天我们学习如何用规范中文打招呼问好！"</p>
                  </div>
                )}

                {videoScene === 1 && (
                  <div className="animate-fade-in flex flex-col items-center justify-center">
                    <span className="text-6xl block filter drop-shadow">👧🏫✨</span>
                    <p className="text-base font-extrabold text-[#2C2925] mt-3">“你好！我叫美林。”</p>
                    <p className="text-[11px] text-slate-555 mt-1 max-w-sm font-medium">"询问别人的名字可以使用‘你叫什么名字’，回答可以用‘我叫...’哦。快去点击点读区跟我一起拼读吧！"</p>
                  </div>
                )}

                {videoScene === 2 && (
                  <div className="animate-fade-in flex flex-col items-center justify-center">
                    <span className="text-6xl block filter drop-shadow">🍎🍇🔢</span>
                    <p className="text-base font-extrabold text-[#2C2925] mt-3">第二单元学：数数真好玩！</p>
                    <p className="text-[11px] text-slate-560 mt-1 max-w-sm font-medium">"通过数一数苹果，我们可以学懂数字 1 到 10 的口诀！练习数一数可以增加拼读的协调性呢！"</p>
                  </div>
                )}

                {/* Simulated playback progress visual line */}
                <div className="absolute bottom-14 inset-x-8 h-1 bg-slate-350 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-600 h-1 transition-all duration-300" 
                    style={{ width: `${((videoScene + 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Speaker Sound trigger */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (videoScene === 0) speakZH("你好呀！我是导学学伴小明。在这里我们开始美妙的快乐中文课！今天我们学习如何用规范中文打招呼。");
                      if (videoScene === 1) speakZH("你好！我叫美林。询问别人的名字可以使用你叫什么名字，回答可以用我叫。");
                      if (videoScene === 2) speakZH("第二单元学，数数真好玩！通过数一数苹果，我们可以学懂数字一到十的口诀！");
                    }}
                    className="p-1 px-2.5 bg-orange-100 hover:bg-orange-200 rounded-lg text-[9px] font-extrabold text-orange-700 flex items-center gap-1 border border-orange-200/40"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>听取卡通讲解语音</span>
                  </button>
                </div>
              </div>

              {/* Bottom timeline controller bar */}
              <div className="bg-[#FAF7F1] p-4 flex justify-between items-center border-t border-orange-100 select-none">
                <span className="text-[10px] font-extrabold text-slate-400">导学动画: Chapter Step {videoScene + 1}/3</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (videoScene > 0) setVideoScene(prev => prev - 1); }}
                    disabled={videoScene === 0}
                    className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-orange-200/20 text-slate-700 hover:bg-orange-50 rounded-lg disabled:opacity-40 font-bold"
                  >
                    ◀ 上一幕
                  </button>
                  <button
                    onClick={() => { 
                      if (videoScene < 2) {
                        setVideoScene(prev => prev + 1);
                      } else {
                        setIsVideoOpen(false);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs bg-orange-600 text-white hover:bg-orange-500 rounded-lg font-extrabold shadow-sm shadow-orange-600/10"
                  >
                    {videoScene === 2 ? "看完视频，开始点读课本！" : "下一幕 ▶"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. SETTINGS SECTOR SLIDE PANEL (右侧设置抽屉) */}
        {showSettings && (
          <div id="settings-slide-drawer" className="absolute top-0 bottom-0 right-0 w-80 bg-[#FDFDFB] border-l border-orange-200/80 shadow-2xl p-6 z-50 animate-slide-in text-slate-800 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b pb-3 border-orange-100 select-none shrink-0">
              <h3 className="font-extrabold text-orange-800 text-sm flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5" />
                <span>Settings</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-1 hover:bg-orange-100/50 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto py-1">
              {/* Setting 1: Voice Speed */}
              <div className="my-5 select-none">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                    Speech playback speed
                  </label>
                  <span className="text-xs font-extrabold text-orange-700 font-mono px-2 py-0.5 bg-orange-100 rounded-full border border-orange-200/30">
                    {voiceSpeed}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={VOICE_SPEED_STEPS.length - 1}
                  step={1}
                  value={voiceSpeedIndex}
                  onChange={(e) => setVoiceSpeed(VOICE_SPEED_STEPS[Number(e.target.value)])}
                  style={{ '--speed-progress': `${(voiceSpeedIndex / (VOICE_SPEED_STEPS.length - 1)) * 100}%` } as CSSProperties}
                  className="voice-speed-range w-full"
                  aria-label="Speech playback speed"
                />
                <div className="flex justify-between mt-1.5 px-0.5">
                  {VOICE_SPEED_STEPS.map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setVoiceSpeed(step)}
                      className={`min-w-[28px] min-h-[28px] text-[9px] font-bold rounded-lg transition-colors ${
                        voiceSpeed === step
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-normal font-medium">
                  Drag the slider or tap a step. Slower speeds help with pinyin.
                </p>
              </div>

              {/* Setting 2: Pinyin */}
              <div className="my-5 border-t pt-4 border-orange-100 select-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <label className="text-[10px] text-slate-400 block font-extrabold uppercase tracking-wider">
                      Pinyin display
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                      Show pinyin above characters in the textbook and vocabulary.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showPinyin}
                    onClick={() => setShowPinyin(!showPinyin)}
                    className={`shrink-0 w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300 ${showPinyin ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="bg-white w-5 h-5 rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Setting 3: Multilingual AI assist */}
              <div className="my-5 border-t pt-4 border-orange-100 select-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <label className="text-[10px] text-slate-400 block font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span>Multilingual AI assist</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                      Show AI-powered English translations for sentences and vocabulary.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={aiAssistEnabled}
                    onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
                    className={`shrink-0 w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300 ${aiAssistEnabled ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="bg-white w-5 h-5 rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Setting 4: Highlights Switch */}
              <div className="my-5 border-t pt-4 border-orange-100 select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-extrabold uppercase tracking-wider">
                      Sentence highlight markers
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                      Show dashed borders on tappable sentences.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReadHighlights(!showReadHighlights)}
                    className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-305 ${showReadHighlights ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="bg-white w-5 h-5 rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-orange-100 select-none shrink-0">
              <button
                onClick={() => {
                  setVoiceSpeed(1.0);
                  setShowPinyin(true);
                  setAiAssistEnabled(false);
                  setShowReadHighlights(true);
                  setCurrentLessonId(1);
                  switchMode('read');
                  setShowSettings(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs hover:bg-slate-200 font-bold"
              >
                Reset to default settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
