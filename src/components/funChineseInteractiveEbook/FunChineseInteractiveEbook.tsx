import { useState, useEffect, useRef, type MouseEvent, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import './funChineseInteractiveEbook.css';
import {
  Volume2, Play, Pause, Mic, Settings, Tv,
  ChevronLeft, ChevronRight, ChevronDown, Check, X, RotateCcw,
  Star, Sliders, Eye, EyeOff, Sparkles, Smile, RefreshCw,
  Link2, ListTodo, CircleHelp, MessageCircle, PenLine,
  Maximize2, Minimize2, LayoutList, Languages, SquareDashed,
} from 'lucide-react';

const EXERCISE_TABS = [
  { id: 'match' as const, label: 'Match', Icon: Link2 },
  { id: 'fill' as const, label: 'Fill', Icon: ListTodo },
  { id: 'truefalse' as const, label: 'Quiz', Icon: CircleHelp },
  { id: 'roleplay' as const, label: 'Story', Icon: MessageCircle },
  { id: 'stroke' as const, label: 'Write', Icon: PenLine },
];

const VOICE_SPEED_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

const formatVoiceSpeedLabel = (speed: number) => (speed === 1 ? 'Normal' : `${speed}x`);

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

export interface SceneDialogue {
  sentenceId: string;
  align: 'left' | 'right';
  characters: string;
}

export interface Lesson {
  id: number;
  title: string;
  pinyin: string;
  englishTitle: string;
  desc: string;
  learningObjectives?: string[];
  sceneDialogues?: SceneDialogue[];
  textbookLeft: {
    illustration: string;
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
    learningObjectives: [
      "Learn basic greetings and self-introduction.",
      "Ask and answer someone's name.",
      "Use common phrases to start learning Chinese together.",
    ],
    sceneDialogues: [
      { sentenceId: "1-1", align: "left", characters: "👦" },
      { sentenceId: "1-2", align: "right", characters: "👧" },
    ],
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
    learningObjectives: [
      "Count from one to ten in Chinese.",
      "Use numbers to describe quantities.",
      "Practice number phrases with everyday objects.",
    ],
    sceneDialogues: [
      { sentenceId: "2-1", align: "left", characters: "🍎" },
      { sentenceId: "2-2", align: "right", characters: "👧👦" },
    ],
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

// --- CURRICULUM OUTLINE (lesson picker tree) ---
type CurriculumItemKind = 'lesson' | 'culture' | 'unit-summary' | 'appendix';

interface CurriculumItem {
  kind: CurriculumItemKind;
  lessonNum?: number;
  label: string;
  sublabel?: string;
}

interface CurriculumUnit {
  id: number;
  titleZh: string;
  titleEn: string;
  items: CurriculumItem[];
}

const CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    id: 1,
    titleZh: '我和你',
    titleEn: 'You and I',
    items: [
      { kind: 'lesson', lessonNum: 1, label: '你好' },
      { kind: 'lesson', lessonNum: 2, label: '你叫什么' },
      { kind: 'lesson', lessonNum: 3, label: '你家在哪儿' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 2,
    titleZh: '我的家',
    titleEn: 'My Family',
    items: [
      { kind: 'lesson', lessonNum: 4, label: '爸爸、妈妈' },
      { kind: 'lesson', lessonNum: 5, label: '我有一只小猫' },
      { kind: 'lesson', lessonNum: 6, label: '我家不大' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 3,
    titleZh: '饮食和用餐',
    titleEn: 'Food and Dining',
    items: [
      { kind: 'lesson', lessonNum: 7, label: '喝牛奶，不喝咖啡' },
      { kind: 'lesson', lessonNum: 8, label: '我要苹果，你呢' },
      { kind: 'lesson', lessonNum: 9, label: '我喜欢海鲜' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 4,
    titleZh: '学校生活',
    titleEn: 'School Life',
    items: [
      { kind: 'lesson', lessonNum: 10, label: '中文课' },
      { kind: 'lesson', lessonNum: 11, label: '我们班' },
      { kind: 'lesson', lessonNum: 12, label: '我去图书馆' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 5,
    titleZh: '时间和天气',
    titleEn: 'Time and Weather',
    items: [
      { kind: 'lesson', lessonNum: 13, label: '现在几点' },
      { kind: 'lesson', lessonNum: 14, label: '我的生日' },
      { kind: 'lesson', lessonNum: 15, label: '今天不冷' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 6,
    titleZh: '职业和工作',
    titleEn: 'Work Life and Professions',
    items: [
      { kind: 'lesson', lessonNum: 16, label: '他是医生' },
      { kind: 'lesson', lessonNum: 17, label: '他在医院工作' },
      { kind: 'lesson', lessonNum: 18, label: '我想做演员' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 7,
    titleZh: '兴趣和爱好',
    titleEn: 'Interests and Hobbies',
    items: [
      { kind: 'lesson', lessonNum: 19, label: '你的爱好是什么' },
      { kind: 'lesson', lessonNum: 20, label: '你会打网球吗' },
      { kind: 'lesson', lessonNum: 21, label: '我天天看电视' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 8,
    titleZh: '交通和旅游',
    titleEn: 'Transportation and Travel',
    items: [
      { kind: 'lesson', lessonNum: 22, label: '这儿是火车站' },
      { kind: 'lesson', lessonNum: 23, label: '我坐飞机去' },
      { kind: 'lesson', lessonNum: 24, label: '车站在前边' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
];

const CURRICULUM_APPENDIX: CurriculumItem[] = [
  { kind: 'appendix', label: '词语表', sublabel: 'Vocabulary' },
  { kind: 'appendix', label: '书写汉字表', sublabel: 'Written Characters' },
  { kind: 'appendix', label: '汉字笔顺规则表', sublabel: 'Stroke Order Rules' },
];

const AVAILABLE_LESSON_IDS = new Set(LESSONS_DATA.map((l) => l.id));

const lessonUnitId = (lessonNum: number) => Math.ceil(lessonNum / 3);

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
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(() => new Set([1]));
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [focusChromeVisible, setFocusChromeVisible] = useState<boolean>(true);
  const focusChromeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  const voiceSpeedIndex = Math.max(0, VOICE_SPEED_STEPS.indexOf(voiceSpeed as typeof VOICE_SPEED_STEPS[number]));

  const revealFocusChrome = () => {
    setFocusChromeVisible(true);
    if (focusChromeTimerRef.current) clearTimeout(focusChromeTimerRef.current);
    focusChromeTimerRef.current = setTimeout(() => setFocusChromeVisible(false), 5000);
  };

  useEffect(() => {
    if (!isFocusMode) {
      setFocusChromeVisible(true);
      if (focusChromeTimerRef.current) clearTimeout(focusChromeTimerRef.current);
      return;
    }
    revealFocusChrome();
    return () => {
      if (focusChromeTimerRef.current) clearTimeout(focusChromeTimerRef.current);
    };
  }, [isFocusMode]);

  useEffect(() => {
    const shell = document.getElementById('fun-chinese-ebook-shell');
    if (!shell) return;
    if (isFocusMode) {
      shell.setAttribute('data-focus-mode', 'true');
    } else {
      shell.removeAttribute('data-focus-mode');
    }
    return () => shell.removeAttribute('data-focus-mode');
  }, [isFocusMode]);

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

  const toggleUnitExpanded = (unitId: number) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  useEffect(() => {
    if (!showLessonPicker) return;
    const activeUnit = lessonUnitId(currentLessonId);
    setExpandedUnits((prev) => new Set([...prev, activeUnit]));
  }, [showLessonPicker, currentLessonId]);

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

  const getLessonObjectives = (lesson: Lesson): string[] =>
    lesson.learningObjectives ?? [lesson.desc];

  const getSceneDialogues = (lesson: Lesson): SceneDialogue[] => {
    if (lesson.sceneDialogues?.length) return lesson.sceneDialogues;
    return lesson.textbookLeft.sentences.slice(0, 2).map((s, i) => ({
      sentenceId: s.id,
      align: i === 0 ? 'left' : 'right',
      characters: i === 0 ? '👦' : '👧',
    }));
  };

  const getExtraSceneSentences = (lesson: Lesson): SentenceItem[] => {
    const sceneIds = new Set(getSceneDialogues(lesson).map((d) => d.sentenceId));
    return lesson.textbookLeft.sentences.filter((s) => !sceneIds.has(s.id));
  };

  const renderTextbookListenChip = (text: string, playingKey: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speakZH(text, playingKey);
      }}
      className="mt-1 flex items-center gap-1 text-[9px] text-sky-600 font-bold py-0.5 px-1.5 bg-sky-50 rounded-full border border-sky-200 hover:bg-sky-100 transition-colors w-fit"
    >
      <Volume2 className="w-2.5 h-2.5" />
      <span>Listen</span>
    </button>
  );

  const renderTextbookBubble = (sentence: SentenceItem, align: 'left' | 'right') => {
    const isShadowSelected = selectedShadowIds.includes(sentence.id);
    const shadowSelectionIndex = selectedShadowIds.indexOf(sentence.id);
    const isActiveReadSentence =
      (mode === 'read' || mode === 'repeat') && activeBubble?.sentenceId === sentence.id;
    const isSentencePlaying = activePlayingKey === `sentence-${sentence.id}`;

    const handleTap = () => {
      if (mode === 'read' || mode === 'repeat') handleReadSentenceTap(sentence);
      else if (mode === 'shadow') toggleShadowSentence(sentence.id);
    };

    return (
      <button
        key={sentence.id}
        type="button"
        onClick={handleTap}
        disabled={mode === 'exercise'}
        className={`textbook-speech-bubble ${align === 'left' ? 'textbook-speech-bubble-left self-start' : 'textbook-speech-bubble-right self-end'} ${
          isActiveReadSentence || isSentencePlaying ? 'ring-2 ring-orange-300' :
          isShadowSelected ? 'ring-2 ring-pink-200' : ''
        }`}
      >
        {(mode === 'shadow' && isShadowSelected) && (
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{shadowSelectionIndex + 1}</span>
        )}
        <p className="text-[10px] text-sky-700 font-semibold leading-snug mb-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>{sentence.pinyin}</p>
        <p className="text-sm font-bold text-slate-800 leading-snug" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{sentence.chinese}</p>
        {mode === 'repeat' && showReadHighlights && renderTextbookListenChip(sentence.chinese, `bubble-listen-${sentence.id}`)}
      </button>
    );
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
  const repeatIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [shadowSelectAllEnabled, setShadowSelectAllEnabled] = useState<boolean>(false);
  const [shadowSentenceScores, setShadowSentenceScores] = useState<Record<string, number>>({});
  const [shadowFilter, setShadowFilter] = useState<'all' | 'not_scored' | 'retry'>('all');
  const [shadowSessionActive, setShadowSessionActive] = useState<boolean>(false);
  const [shadowSessionQueue, setShadowSessionQueue] = useState<string[]>([]);
  const [shadowSessionIndex, setShadowSessionIndex] = useState<number>(0);
  const [shadowSessionReportOpen, setShadowSessionReportOpen] = useState<boolean>(false);

  const toggleShadowSelectAll = () => {
    setShadowSelectAllEnabled((prev) => {
      const next = !prev;
      if (next) {
        setSelectedShadowIds(currentLesson.textbookLeft.sentences.map((s) => s.id));
      } else {
        setSelectedShadowIds([]);
      }
      return next;
    });
  };

  const toggleShadowSentence = (sentenceId: string) => {
    setShadowSelectAllEnabled(false);
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

  const canShadowAll =
    selectedShadowIds.length > 0 &&
    (shadowSelectAllEnabled || selectedShadowIds.length >= 2);

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
  const evaluationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- EXERCISE STATES ---
  const [exerciseTab, setExerciseTab] = useState<'match' | 'fill' | 'truefalse' | 'roleplay' | 'stroke'>('match');

  // 1. Line Match State
  const [matchOptions, setMatchOptions] = useState<MatchOption[]>(currentLesson.matchOptions);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null); // English Id
  const [matchStatusMsg, setMatchStatusMsg] = useState<string>("");

  // 2. Fill Blank State
  const [fillInput, setFillInput] = useState<string>('');
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
  const strokeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- ANIMATED VIDEO SCREEN (导学视频) ---
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [videoScene, setVideoScene] = useState<number>(0);

  // Sync lesson exercise defaults when chapter changes
  useEffect(() => {
    setMatchOptions(currentLesson.matchOptions);
    setSelectedLeft(null);
    setMatchStatusMsg("");
    setFillSelected(null);
    setFillInput('');
    setFillFeedback(null);
    setTrueFalseAnswer(null);
    setTrueFalseSubmitted(false);
    setRolePlayRecords({});
    setSelectedShadowIds([]);
    setShadowSelectAllEnabled(false);
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
  const handleFillSubmit = () => {
    const answer = fillInput.trim();
    if (!answer) return;
    setFillSelected(answer);
    const isCorrect = answer === currentLesson.fillBlank.correctAnswer;
    setFillFeedback({ isCorrect, show: true });
    if (isCorrect) speakZH('真棒！答对了');
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
    <div
      className={`flex flex-col selection:bg-orange-100 font-sans overflow-hidden ${
        isFocusMode
          ? 'absolute inset-0 z-10 bg-[#F6F2E9]'
          : 'h-full w-full bg-[#F6F2E9] relative'
      }`}
    >
      
      {/* Decorative desktop shadows & school leaves backgrounds */}
      {!isFocusMode && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-orange-200/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-emerald-200/10 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Main Container - Elegant Bound Notebook sitting on Desk */}
      <div 
        id="book-notebook-body" 
        className={`w-full h-full min-h-0 bg-[#FAF8F5] relative flex flex-col overflow-hidden ${
          isFocusMode
            ? 'p-3 rounded-2xl shadow-none border-0'
            : 'rounded-2xl p-4 shadow-lg border border-amber-900/10'
        }`}
        onClick={(e) => {
          if (!isFocusMode || focusChromeVisible) return;
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, textarea, [role="switch"], label')) return;
          revealFocusChrome();
        }}
      >
        
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
          <div className="flex items-center bg-orange-100/40 p-1.5 rounded-2xl border border-orange-200/50">
            <button
              onClick={() => switchMode('read')}
              className={`min-h-[44px] py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'read' ? 'bg-[#FCFAF0] text-amber-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base">📖</span>
              <span>Tap to Read</span>
            </button>
            <button
              onClick={() => switchMode('repeat')}
              className={`min-h-[44px] py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'repeat' ? 'bg-[#FCFAF0] text-sky-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base">🔁</span>
              <span>Repeat Range</span>
            </button>
            <button
              onClick={() => switchMode('shadow')}
              className={`min-h-[44px] py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'shadow' ? 'bg-[#FCFAF0] text-pink-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base">🎙️</span>
              <span>Shadow Reading</span>
            </button>
            <button
              onClick={() => switchMode('exercise')}
              className={`min-h-[44px] py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mode === 'exercise' ? 'bg-[#FCFAF0] text-emerald-700 shadow-sm border border-orange-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base">📝</span>
              <span>Practice</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowLessonPicker((v) => !v);
                setShowSettings(false);
              }}
              id="btn-lesson-picker"
              className={`min-w-[44px] min-h-[44px] p-2.5 border rounded-xl transition-all hover:scale-105 shadow-sm flex items-center justify-center ${
                showLessonPicker
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-[#FAF8F5] hover:bg-orange-50 border-orange-200/40 text-slate-600'
              }`}
              title="Lessons"
              aria-label="Lessons"
            >
              <LayoutList className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setShowSettings((v) => !v);
                setShowLessonPicker(false);
              }}
              id="btn-settings-toggle"
              className="min-w-[44px] min-h-[44px] p-2.5 bg-[#FAF8F5] hover:bg-orange-50 border border-orange-200/40 text-slate-600 rounded-xl transition-all hover:scale-105 shadow-sm flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>
        )}

        {/* Focus mode — back (top), auto-hide after 5s; tap non-interactive area to wake */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className={`absolute top-3 left-3 z-30 shrink-0 w-[52px] h-[52px] rounded-full bg-white/45 backdrop-blur-md text-slate-700/90 border border-white/50 shadow-[0_2px_8px_rgba(15,23,42,0.08)] flex items-center justify-center active:scale-95 hover:bg-white/65 transition-all cursor-pointer ${
              focusChromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-[30px] h-[30px]" strokeWidth={2.25} />
          </button>
        )}

        {/* --- MAIN DOUBLE-PAGE TEXTBOOK SPREAD --- */}
        <main className={`textbook-spread flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden transition-all duration-300 ${
          isFocusMode
            ? 'textbook-spread-focus mt-0 gap-2 p-2 rounded-xl border border-orange-100/25 bg-[#FFFAF1]'
            : 'gap-5 mt-3 p-3 rounded-2xl border border-orange-100/30 bg-orange-100/10'
        }`}>
          
          {/* Ring binder division effect in landscape mode to resemble physical workbook */}
          {!isFocusMode && (
          <div className="hidden lg:flex absolute left-1/2 top-4 bottom-4 w-1 bg-amber-800/10 -translate-x-1/2 z-20 flex-col justify-around py-6 pointer-events-none">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-6 h-4 bg-gradient-to-r from-orange-300 via-amber-400 to-amber-600 rounded-full border border-amber-900/15 -ml-[11px] shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            ))}
          </div>
          )}

          {/* =========================================
              LEFT PAGE: TEXTBOOK CORES / READING SPREADS
              ========================================= */}
          <section className={`textbook-left-page-shell flex flex-col relative transition-all duration-300 bg-[#FDFDFB] text-slate-800 ${
            isFocusMode
              ? 'p-3 rounded-xl shadow-sm border border-orange-100/50 md:mr-0'
              : 'rounded-2xl p-4 shadow-sm border border-orange-100/60 md:mr-1'
          }`}>

            <div className="textbook-left-content flex-1 flex flex-col min-h-0 overflow-hidden py-1">
              {/* Textbook left page — lesson header + scene */}
              <div className="textbook-left-header relative mb-2 shrink-0">
                <div className="textbook-wave-band flex items-end gap-3 pr-[58px] min-h-[72px]">
                  <div className="textbook-lesson-badge shrink-0">{currentLesson.id}</div>
                  <div className="min-w-0 pb-2">
                    <h2 className="textbook-lesson-title" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                      {currentLesson.title}
                    </h2>
                    <p className="text-[11px] text-sky-800/80 font-semibold mt-0.5" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                      {currentLesson.pinyin}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-video-guide"
                  onClick={() => { setIsVideoOpen(true); setVideoScene(0); }}
                  className="absolute top-1 right-0 shrink-0 flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 min-w-[52px] min-h-[52px] rounded-xl bg-orange-100 hover:bg-orange-200 border border-orange-200/70 text-orange-700 transition-colors cursor-pointer z-10"
                  title="Intro Video"
                  aria-label="Intro Video"
                >
                  <Tv className="w-4 h-4" />
                  <span className="text-[9px] font-bold leading-none">Video</span>
                </button>
                <div className="textbook-objectives-box absolute top-1 right-[58px] max-w-[48%] hidden sm:block">
                  <p className="text-[10px] font-extrabold text-sky-800 mb-1">Learning Objectives</p>
                  <ul className="text-[9px] text-slate-600 space-y-0.5 list-disc pl-3 leading-snug">
                    {getLessonObjectives(currentLesson).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mode hint — compact */}
              {mode !== 'read' && mode !== 'repeat' && (
                <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-[#F9F7F1]/90 border border-orange-100/40 text-[10px] text-slate-600 shrink-0">
                  {mode === 'shadow' && (
                    <p><strong className="text-pink-700">Shadow Reading</strong> — Tap lines to build your queue.</p>
                  )}
                  {mode === 'exercise' && (
                    <p><strong className="text-emerald-700">Practice</strong> — Use the right page for exercises.</p>
                  )}
                </div>
              )}

              {/* Scene illustration with speech bubbles */}
              <div className="textbook-scene flex-1 min-h-[220px] relative rounded-2xl overflow-hidden border border-sky-100/80 mb-2">
                <div className="absolute inset-0 textbook-scene-bg" />
                <div className="relative z-10 h-full flex flex-col p-3">
                  <div className="textbook-scene-symbol flex items-center justify-center gap-4 py-2 shrink-0">
                    <span className="text-5xl select-none">{currentLesson.textbookLeft.illustration}</span>
                  </div>
                  <div className="textbook-scene-dialogues flex-1 flex flex-col gap-3 justify-center px-1">
                    {getSceneDialogues(currentLesson).map((scene) => {
                      const sentence = currentLesson.textbookLeft.sentences.find((s) => s.id === scene.sentenceId);
                      if (!sentence) return null;
                      return (
                        <div key={scene.sentenceId} className={`textbook-character-row flex items-end gap-2 ${scene.align === 'right' ? 'flex-row-reverse' : ''}`}>
                          <span className="textbook-character-avatar text-3xl select-none shrink-0">{scene.characters}</span>
                          {renderTextbookBubble(sentence, scene.align)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Extra sentence bubbles (not in main scene) */}
              {getExtraSceneSentences(currentLesson).length > 0 && (
                <div className="space-y-2 mb-2 shrink-0">
                  {getExtraSceneSentences(currentLesson).map((sentence, idx) =>
                    renderTextbookBubble(sentence, idx % 2 === 0 ? 'left' : 'right')
                  )}
                </div>
              )}

              {/* Word-level tap strip — read & repeat */}
              {(mode === 'read' || mode === 'repeat') && activeBubble && (() => {
                const activeSent = currentLesson.textbookLeft.sentences.find((s) => s.id === activeBubble.sentenceId);
                if (!activeSent) return null;
                const segments = getSentenceSegments(activeSent);
                return (
                  <div className="shrink-0 p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/60 mb-2">
                    <p className="text-[9px] uppercase text-orange-600 font-extrabold mb-1.5">Tap words</p>
                    <div className="flex flex-wrap items-end gap-x-1 gap-y-1">
                      {segments.map((segment, segIdx) => {
                        const wordKey = `word-${activeSent.id}-${segIdx}`;
                        const isActiveWord = activePlayingKey === wordKey;
                        if (segment.speakable === false) {
                          return (
                            <span key={wordKey} className="text-base font-bold px-0.5" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{segment.text}</span>
                          );
                        }
                        return (
                          <button
                            key={wordKey}
                            type="button"
                            onClick={(e) => handleReadWordTap(activeSent, segment, segIdx, e)}
                            className={`rounded-lg px-1 py-0.5 border transition-all ${isActiveWord ? 'bg-orange-200 border-orange-400' : 'border-transparent hover:bg-orange-100'}`}
                            style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                          >
                            <ruby className="text-base font-bold">
                              {segment.text}
                              {segment.pinyin ? (
                                <rt className="text-[9px] text-amber-800 block" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>{segment.pinyin}</rt>
                              ) : null}
                            </ruby>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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
          <section className={`textbook-right-page-shell flex flex-col bg-[#FDFDFB] text-slate-800 min-h-0 overflow-hidden relative ${
            isFocusMode
              ? 'p-3 rounded-xl border border-orange-100/50 shadow-sm md:ml-0'
              : 'rounded-2xl p-4 border border-orange-100/60 shadow-sm md:ml-1'
          }`}>
            
            {mode === 'shadow' ? (
              <>
                <div className="flex items-center justify-between border-b pb-2 border-orange-100/80 mb-2 select-none shrink-0">
                  <h3 className="font-extrabold text-[#2C2925] text-sm flex items-center gap-2 min-w-0">
                    <span className="p-1 bg-pink-100 text-pink-600 rounded-lg text-xs shrink-0">🎙️</span>
                    <span className="truncate">Shadow Reading</span>
                    {selectedShadowIds.length > 0 && (
                      <span className="text-[10px] bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 font-mono font-bold shrink-0">
                        {selectedShadowIds.length}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={startShadowTraining}
                      disabled={!canShadowAll}
                      title={canShadowAll ? 'Start shadow reading for selected lines' : 'Select 2+ lines, or turn on Select all'}
                      className={`min-h-[36px] px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        canShadowAll
                          ? 'bg-pink-600 border-pink-500 text-white hover:bg-pink-500'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>Shadow All</span>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={shadowSelectAllEnabled}
                      onClick={toggleShadowSelectAll}
                      title="Select all lines on this page"
                      className={`min-h-[36px] px-2.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        shadowSelectAllEnabled
                          ? 'bg-pink-100 border-pink-300 text-pink-700'
                          : 'bg-[#FAF8F5] border-orange-100 text-slate-500 hover:bg-orange-50'
                      }`}
                    >
                      Select all
                    </button>
                  </div>
                </div>

                <div className="textbook-right-scroll flex-1 min-h-0 overflow-y-auto">
                  {selectedShadowSentences.length === 0 ? (
                    <div className="flex flex-col justify-center items-center px-3 py-8 select-none min-h-[200px]">
                      <div className="bg-pink-50/70 rounded-2xl border border-dashed border-pink-200 p-6 text-xs text-slate-400 w-full text-center">
                        Tap lines on the left, or turn on Select all
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pr-0.5 pb-2">
                      {selectedShadowSentences.map((sentence, idx) => {
                        const score = shadowSentenceScores[sentence.id];
                        return (
                          <div
                            key={sentence.id}
                            className={`rounded-2xl border p-3 transition-all ${
                              score != null && score >= 80
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : score != null
                                  ? 'bg-amber-50/50 border-amber-200'
                                  : 'bg-pink-50/60 border-pink-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-md">
                                  {idx + 1}
                                </span>
                                {score == null && (
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Pending</span>
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
                              <p className="text-[10px] text-slate-500 italic mt-0.5">
                                {sentence.english}
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
                  )}
                </div>
              </>
            ) : (
            <div className="textbook-right-scroll flex-1 min-h-0 overflow-y-auto">
            {mode === 'read' || mode === 'repeat' ? (
              <div className="flex-1 flex flex-col min-h-0 textbook-right-page">
                <div className="textbook-right-header shrink-0 select-none">
                  <span className="textbook-right-header-icon" aria-hidden="true">☁</span>
                  <span className="textbook-right-header-title" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                    {currentLesson.id} {currentLesson.title}
                  </span>
                </div>

                <div className="textbook-right-card shrink-0">
                  <h3 className="textbook-section-title">New Words</h3>
                  <div className="textbook-vocab-grid">
                    {currentLesson.vocabList.map((vocab, vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => speakZH(vocab.chinese, `vocab-${vIdx}`)}
                        className={`textbook-vocab-item ${
                          activePlayingKey === `vocab-${vIdx}` ? 'textbook-vocab-item-active' : ''
                        }`}
                      >
                        <span className="textbook-vocab-num">{vIdx + 1}.</span>
                        <span className="min-w-0 flex-1">
                          <span className="textbook-vocab-pinyin">{vocab.pinyin}</span>
                          <span className="textbook-vocab-char" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{vocab.chinese}</span>
                          <span className="textbook-vocab-en">{vocab.english}</span>
                          {mode === 'repeat' && showReadHighlights && renderTextbookListenChip(vocab.chinese, `vocab-listen-${vIdx}`)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="textbook-patterns-section">
                    <h3 className="textbook-section-title shrink-0">Sentence Patterns</h3>
                    <div className="textbook-pattern-grid">
                      {currentLesson.textbookLeft.sentences.map((sentence, sIdx) => {
                        const isActive =
                          activeBubble?.sentenceId === sentence.id ||
                          activePlayingKey === `sentence-${sentence.id}`;
                        return (
                          <button
                            key={sentence.id}
                            type="button"
                            onClick={() => handleReadSentenceTap(sentence)}
                            className={`textbook-pattern-item w-full text-left ${isActive ? 'textbook-pattern-item-active' : ''}`}
                          >
                            <span className="textbook-pattern-num">{sIdx + 1}.</span>
                            <span className="min-w-0 flex-1">
                              <span className="textbook-pattern-pinyin">{sentence.pinyin}</span>
                              <span className="textbook-pattern-char" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                                {sentence.chinese}
                              </span>
                              <span className="textbook-pattern-en">{sentence.english}</span>
                              {mode === 'repeat' && showReadHighlights && renderTextbookListenChip(sentence.chinese, `pattern-listen-${sentence.id}`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="textbook-listen-practice shrink-0">
                  <p className="textbook-listen-title">
                    <span className="textbook-listen-number">1</span>
                    <span>Listen and write Pinyin.</span>
                    <span className="text-slate-400 font-medium">听一听，写拼音。</span>
                  </p>
                  <div className="textbook-pinyin-table" aria-hidden="true">
                    {['A', 'B'].map((row) => (
                      <div className="textbook-pinyin-row" key={row}>
                        <div className="textbook-pinyin-label">{row}</div>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <div className="textbook-pinyin-cell" key={`${row}-${num}`}>
                            <span>{num}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="shrink-0 mt-auto pt-2 text-[10px] text-slate-500 select-none leading-snug">
                  Tap to Read — Tap any word or sentence to hear pronunciation. Use the left page for word-level practice.
                </p>
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

                  {/* 1. MATCH PANEL */}
                  {exerciseTab === 'match' && (
                    <div id="exercise-line-match" className="flex-1 flex flex-col overflow-y-auto">
                      <div className="flex items-center justify-between text-xs select-none mb-2">
                        <p className="font-extrabold text-slate-800">Word Match</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakZH(currentLesson.vocabList.map((v) => v.chinese).join(''))}
                            className="text-[10px] text-orange-700 font-bold flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg border border-orange-200/40"
                          >
                            <Volume2 className="w-3 h-3" /> Listen
                          </button>
                          <button
                            onClick={() => {
                              setMatchOptions(currentLesson.matchOptions);
                              setSelectedLeft(null);
                              setMatchStatusMsg('');
                            }}
                            className="text-[10px] text-orange-600 hover:underline font-extrabold flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
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
                              {opt.left}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2 select-none">
                          {matchOptions.map((opt, oIdx) => {
                            const charItem = matchOptions[(oIdx + 1) % matchOptions.length];
                            const actualTargetMatched = matchOptions.find((o) => o.right === charItem.right)?.isMatched;

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
                                <span style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{charItem.right}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {matchStatusMsg && (
                        <p className="mt-3 text-xs text-orange-700 font-extrabold text-center select-none">{matchStatusMsg}</p>
                      )}
                      {matchOptions.every((o) => o.isMatched) && !matchStatusMsg && (
                        <p className="mt-3 text-xs text-emerald-600 font-extrabold text-center select-none">All matched!</p>
                      )}
                    </div>
                  )}

                  {/* 2. FILL BLANK PANEL */}
                  {exerciseTab === 'fill' && (
                    <div id="exercise-fill-blank" className="flex-1 flex flex-col overflow-y-auto">
                      <div className="flex items-center justify-between mb-2 select-none">
                        <p className="text-xs font-extrabold text-slate-800">Fill in the Blank</p>
                        <button
                          type="button"
                          onClick={() => speakZH(currentLesson.fillBlank.audioText)}
                          className="text-[10px] text-orange-700 font-bold flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg border border-orange-200/40"
                        >
                          <Volume2 className="w-3 h-3" /> Listen
                        </button>
                      </div>

                      <div className="bg-[#FDFDFB] rounded-2xl p-4 border border-orange-100 text-center shadow-sm">
                          <span className="text-slate-400 italic font-serif text-xs block mb-2">"{currentLesson.fillBlank.english}"</span>
                        <div className="text-lg font-extrabold tracking-wide text-slate-800" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                          你叫什么{' '}
                          <span className="inline-block min-w-[4rem] px-2 py-0.5 border-b-2 border-dashed border-orange-400 text-orange-700">
                            {fillInput || fillSelected || '____'}
                          </span>
                          ？
                        </div>
                          <span className="text-xs text-slate-400 font-mono block mt-2">
                            nǐ jiào shénme ___ ?
                          </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={fillInput}
                          onChange={(e) => setFillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFillSubmit(); }}
                          placeholder="Type the missing word"
                          className="flex-1 min-h-[44px] px-3 rounded-xl border border-orange-200/60 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                          style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                        />
                        <button
                          type="button"
                          onClick={handleFillSubmit}
                          className="min-h-[44px] px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                        >
                          Check
                        </button>
                      </div>

                      {fillFeedback && (
                        <div className={`mt-3 p-3 rounded-2xl border select-none text-xs ${
                          fillFeedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-100'
                        }`}>
                          <p className={`font-bold flex items-center gap-1 ${fillFeedback.isCorrect ? 'text-emerald-700' : 'text-pink-700'}`}>
                            {fillFeedback.isCorrect ? <><Check className="w-4 h-4" /> Correct</> : <><X className="w-4 h-4" /> Try again</>}
                          </p>
                          {!fillFeedback.isCorrect && (
                            <p className="text-slate-500 mt-1">Answer: {currentLesson.fillBlank.correctAnswer}</p>
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

                        <div className="bg-[#FDFDFB] rounded-2xl p-4 text-center my-3 border border-orange-100 shadow-sm relative">
                          <span className="text-5xl block filter drop-shadow mb-2 select-none">{currentLesson.trueFalse.illustration}</span>
                          <p className="text-sm font-extrabold text-slate-800 leading-relaxed">{currentLesson.trueFalse.text}</p>
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
                            ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                            : 'bg-pink-50 border-pink-100 text-slate-800'
                        }`}>
                          <p className={`font-extrabold flex items-center gap-1.5 ${
                            trueFalseAnswer === currentLesson.trueFalse.correctAnswer ? 'text-emerald-700' : 'text-pink-700'
                          }`}>
                            {trueFalseAnswer === currentLesson.trueFalse.correctAnswer
                              ? <><Check className="w-4 h-4" /> Correct — {currentLesson.trueFalse.correctAnswer ? 'True' : 'False'}</>
                              : <><X className="w-4 h-4" /> Incorrect — answer is {currentLesson.trueFalse.correctAnswer ? 'True' : 'False'}</>}
                          </p>
                          <p className="mt-2 text-slate-600 font-medium leading-relaxed">{currentLesson.trueFalse.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. DIALOGUE ROLE-PLAY WITH AUDIO SAVER */}
                  {exerciseTab === 'roleplay' && (
                    <div id="exercise-roleplay" className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 select-none">Complete the Dialogue</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 select-none mb-3">Finish each line based on the context.</p>

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
                              {/* Left — 田字格 + 楷体笔顺 */}
                              <div className="relative bg-[#FFFCF8] rounded-2xl p-4 flex flex-col items-center justify-center border border-orange-200/40 overflow-hidden shadow-sm h-36">
                                <div className="stroke-guide-square" aria-hidden="true" />

                                <span
                                  className="stroke-char-ghost absolute text-[5.5rem] text-orange-100/90 z-0"
                                  aria-hidden="true"
                                >
                                  {charObj.char}
                                </span>

                                <svg viewBox="0 0 100 100" className="w-28 h-28 relative z-10 select-none">
                                  {/* Animated brush strokes (楷体轮廓由 HTML 层显示) */}
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
            )}

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
        <footer className="mt-3 grid grid-cols-3 items-center text-sm text-slate-400 border-t border-orange-100/60 pt-3 z-10 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold justify-self-start">
            <span>Reading speed:</span>
            <span className="font-extrabold text-orange-700 font-mono text-sm px-2.5 py-1 bg-orange-100 rounded-full border border-orange-200/20">{formatVoiceSpeedLabel(voiceSpeed)}</span>
          </div>

          <button
            type="button"
            onClick={toggleFocusMode}
            aria-label="Focus reading"
            title="Hide controls for full-page reading"
            className="justify-self-center flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200/50 text-xs font-bold transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Focus</span>
          </button>

          <span className="text-xs text-slate-500 font-mono font-semibold justify-self-end text-right">
            Pages {leftPageNum}–{rightPageNum} of {totalPages}
          </span>
        </footer>
        )}

        {/* Focus mode footer — Controls overlay at bottom center, no layout space */}
        {isFocusMode && (
        <footer
          className={`absolute bottom-0 left-0 right-0 grid grid-cols-3 items-center text-sm text-slate-400 border-t border-orange-100/60 pt-3 pb-3 px-4 z-30 select-none transition-opacity duration-300 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent ${
            focusChromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div aria-hidden="true" />
          <button
            type="button"
            onClick={toggleFocusMode}
            aria-label="Show controls"
            title="Show controls"
            className="justify-self-center flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200/50 text-xs font-bold transition-colors cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Controls</span>
          </button>
          <div aria-hidden="true" />
        </footer>
        )}

        {/* Lesson picker dropdown — full curriculum outline */}
        {showLessonPicker && !isFocusMode && (
          <div
            id="lesson-picker-panel"
            className="absolute top-[88px] right-4 w-[340px] bg-[#FDFDFB] border border-orange-200/80 rounded-2xl shadow-2xl p-4 z-40 animate-fade-in flex flex-col max-h-[min(520px,62vh)]"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-2.5 mb-3 select-none shrink-0">
              <h3 className="font-extrabold text-orange-800 text-sm uppercase tracking-wider">Contents</h3>
              <button
                type="button"
                onClick={() => setShowLessonPicker(false)}
                className="min-w-[36px] min-h-[36px] p-1.5 hover:bg-orange-100/50 rounded-lg text-slate-400 hover:text-slate-800 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1 min-h-0">
              {CURRICULUM_UNITS.map((unit) => {
                const isExpanded = expandedUnits.has(unit.id);
                return (
                <section key={unit.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleUnitExpanded(unit.id)}
                    aria-expanded={isExpanded}
                    className="w-full min-h-[44px] text-left text-xs font-extrabold text-orange-900/90 px-2.5 py-2 bg-orange-50/80 rounded-lg border border-orange-100/80 leading-snug hover:bg-orange-100/60 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-orange-600/70 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                      aria-hidden
                    />
                    <span className="flex-1 min-w-0">
                      Unit {unit.id}: {unit.titleZh}
                      <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">{unit.titleEn}</span>
                    </span>
                  </button>
                  {isExpanded && (
                  <ul className="space-y-0.5 pl-1 animate-fade-in">
                    {unit.items.map((item, idx) => {
                      const isLesson = item.kind === 'lesson';
                      const lessonId = item.lessonNum;
                      const isAvailable = isLesson && lessonId != null && AVAILABLE_LESSON_IDS.has(lessonId);
                      const isActive = isLesson && lessonId === currentLessonId;

                      if (isLesson) {
                        return (
                          <li key={`u${unit.id}-l${lessonId}`}>
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => isAvailable && lessonId != null && selectLesson(lessonId)}
                              className={`w-full min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-bold text-left border flex items-center gap-2 transition-colors ${
                                isActive
                                  ? 'bg-orange-50 border-orange-300 text-orange-800'
                                  : isAvailable
                                    ? 'bg-[#FAF8F5] border-orange-100/80 text-slate-700 hover:bg-[#FAF7F1] cursor-pointer'
                                    : 'bg-slate-50/60 border-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <span className="shrink-0 w-5 text-[10px] font-mono font-extrabold text-orange-600/80">{lessonId}</span>
                              <span className="flex-1 leading-snug">{item.label}</span>
                              {!isAvailable && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-300 shrink-0">Soon</span>
                              )}
                            </button>
                          </li>
                        );
                      }

                      const icon = item.kind === 'culture' ? '🏮' : item.kind === 'unit-summary' ? '📋' : '·';
                      return (
                        <li key={`u${unit.id}-${item.kind}-${idx}`}>
                          <div className="min-h-[36px] py-1.5 px-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 text-slate-500 bg-slate-50/40 border border-dashed border-slate-200/60">
                            <span className="shrink-0 text-sm leading-none">{icon}</span>
                            <span className="flex-1 leading-snug">
                              {item.label}
                              {item.sublabel && (
                                <span className="block text-[10px] font-medium text-slate-400">{item.sublabel}</span>
                              )}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  )}
                </section>
              );})}

              <section className="space-y-1 pt-1 border-t border-orange-100/80">
                <h4 className="text-xs font-extrabold text-slate-600 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  附录
                  <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Appendix</span>
                </h4>
                <ul className="space-y-0.5 pl-1">
                  {CURRICULUM_APPENDIX.map((item, idx) => (
                    <li key={`appendix-${idx}`}>
                      <div className="min-h-[36px] py-1.5 px-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 text-slate-500 bg-slate-50/40 border border-dashed border-slate-200/60">
                        <span className="shrink-0 text-sm leading-none">📎</span>
                        <span className="flex-1 leading-snug">
                          {item.label}
                          {item.sublabel && (
                            <span className="block text-[10px] font-medium text-slate-400">{item.sublabel}</span>
                          )}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* =========================================
            OVERLAY MODALS AND DRAWER POPUPS
            ========================================= */}

        {/* 1. AUDIO RECORDING FOLLOW-READ EVAL MODAL (跟读弹窗) */}
        {followModal.isOpen && (
          <div id="follow-read-modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[680px] overflow-hidden flex flex-col md:flex-row min-h-[340px] relative">

              {/* Left — sentence / word display */}
              <section className="flex-1 bg-[#E8E8E8] p-5 md:p-6 flex items-center gap-3 min-h-[180px] md:min-h-0">
                <button
                  type="button"
                  onClick={() => speakZH(followModal.text)}
                  className="shrink-0 w-11 h-11 rounded-xl bg-white/80 hover:bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 shadow-sm transition-colors cursor-pointer"
                  aria-label="Listen"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="flex-1 text-center min-w-0 px-1">
                  {followModal.pinyin && (
                    <p className="text-sm text-slate-600 font-semibold mb-1.5 leading-snug" style={{ fontFamily: 'OPPO Sans, sans-serif' }}>
                      {followModal.pinyin}
                    </p>
                  )}
                  <p
                    className="text-3xl md:text-4xl font-bold text-slate-800 leading-snug break-words"
                    style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                  >
                    {followModal.text}
                  </p>
                  {followModal.english && (
                    <p className="text-xs text-slate-500 italic mt-2 leading-snug">"{followModal.english}"</p>
                  )}
                </div>
              </section>

              {/* Right — record & score */}
              <section className="flex-1 p-5 md:p-6 flex flex-col bg-[#FAFAFA] border-t md:border-t-0 md:border-l border-slate-200/50 relative min-h-[260px]">
                <button
                  type="button"
                  onClick={() => {
                    if (followRecordState === 'recording') handleStopRecording();
                    setFollowModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer z-10"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center pt-1 pb-3 shrink-0">
                  <h3 className="text-sm font-bold text-slate-700">
                    {followModal.shadowSession ? 'Shadow Reading' : 'Speak & Score'}
                  </h3>
                  {followModal.shadowSession && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {shadowSessionIndex + 1} / {shadowSessionQueue.length}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center select-none min-h-0">
                  {followRecordState === 'idle' && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="w-[72px] h-[72px] rounded-full bg-[#ECECEC] hover:bg-slate-200 border border-slate-200/80 flex flex-col items-center justify-center gap-0.5 mx-auto transition-colors cursor-pointer shadow-sm"
                      >
                        <Mic className="w-6 h-6 text-slate-600" />
                      </button>
                      <p className="text-[11px] text-slate-500 font-semibold mt-3">Tap to record</p>
                    </div>
                  )}

                  {followRecordState === 'recording' && (
                    <div className="text-center w-full px-2">
                      <p className="text-xs text-rose-500 font-bold animate-pulse mb-3">Recording…</p>
                      <div className="h-12 flex items-center justify-center gap-1 px-2">
                        {[...Array(10)].map((_, i) => {
                          const h = micAmplitude > 0 ? Math.max(8, micAmplitude * (0.2 + Math.random() * 0.8)) : 8;
                          return (
                            <div
                              key={i}
                              style={{ height: `${h}px` }}
                              className="w-1.5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full transition-all duration-100"
                            />
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="mt-4 px-5 py-2 min-h-[40px] bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white cursor-pointer"
                      >
                        Stop & Score
                      </button>
                    </div>
                  )}

                  {followRecordState === 'evaluating' && (
                    <div className="text-center">
                      <div className="inline-block relative">
                        <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-4">Analyzing…</p>
                    </div>
                  )}

                  {followRecordState === 'result' && (
                    <div className="w-full flex flex-col items-center">
                      <div className="flex items-center justify-center gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => {
                          const filled = i < Math.ceil(evalResultScore / 20);
                          return (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${filled ? 'text-orange-400 fill-orange-400' : 'text-slate-200 fill-slate-200'}`}
                            />
                          );
                        })}
                      </div>

                      <div className="text-5xl font-extrabold text-slate-800 font-mono leading-none my-1">
                        {evalResultScore}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mb-4 text-center px-2">
                        {evalResultScore >= 95
                          ? 'Excellent — native-like clarity!'
                          : evalResultScore >= 90
                            ? 'Great job — tones are on point!'
                            : 'Good effort — keep practicing!'}
                      </p>

                      <div className="w-full grid grid-cols-3 gap-0 bg-[#ECECEC] rounded-xl py-2.5 px-1 mb-5 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Accuracy</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">{evalResultScore - 1}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Tone</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">
                            {evalResultScore >= 92 ? 95 : evalResultScore - 1}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Fluency</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">{evalResultScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-8 mb-4">
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                          <span className="w-14 h-14 rounded-full bg-[#ECECEC] group-hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center transition-colors">
                            <Mic className="w-5 h-5 text-slate-600" />
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600">Rerecord</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMyVoicePlaying(true);
                            speakZH(followModal.text);
                            setTimeout(() => setIsMyVoicePlaying(false), 2000);
                          }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                          <span className={`w-14 h-14 rounded-full border border-slate-200/80 flex items-center justify-center transition-colors ${
                            isMyVoicePlaying ? 'bg-orange-100' : 'bg-[#ECECEC] group-hover:bg-slate-200'
                          }`}>
                            <Play className="w-5 h-5 text-slate-600 ml-0.5" />
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600">Play</span>
                        </button>
                      </div>

                      {followModal.shadowSession && (
                        <button
                          type="button"
                          onClick={advanceShadowSession}
                          className="w-full min-h-[44px] py-2.5 bg-[#ECECEC] hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {shadowSessionIndex + 1 >= shadowSessionQueue.length ? 'View Report' : 'Next line'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
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
              <h3 className="font-extrabold text-orange-800 text-base flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="min-w-[44px] min-h-[44px] p-2 hover:bg-orange-100/50 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer transition-colors flex items-center justify-center"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto py-1 space-y-5">

              {/* Tap to Read · Repeat Range · Shadow Reading */}
              <section className="select-none">
                <div className="mb-3 px-2.5 py-2 rounded-xl bg-orange-50/80 border border-orange-100/80">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Applies to</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FCFAF0] text-amber-700 border border-orange-200/40">📖 Tap to Read</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FCFAF0] text-sky-700 border border-orange-200/40">🔁 Repeat Range</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FCFAF0] text-pink-700 border border-orange-200/40">🎙️ Shadow Reading</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                      Speech playback speed
                    </label>
                    <span className="text-sm font-extrabold text-orange-700 font-mono px-2.5 py-1 bg-orange-100 rounded-full border border-orange-200/30">
                      {formatVoiceSpeedLabel(voiceSpeed)}
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
                  <div className="flex justify-between mt-2 px-0.5">
                    {VOICE_SPEED_STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setVoiceSpeed(step)}
                        className={`min-w-[36px] min-h-[36px] text-xs font-bold rounded-lg transition-colors ${
                          voiceSpeed === step
                            ? 'text-orange-700 bg-orange-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Tap to Read */}
              <section className="select-none border-t border-orange-100 pt-4">
                <div className="mb-3 px-2.5 py-2 rounded-xl bg-amber-50/70 border border-amber-100/80">
                  <p className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                    <span>📖</span>
                    <span>Tap to Read</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <SquareDashed className="w-4 h-4 text-orange-500" />
                    <span>Tap-read marker</span>
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showReadHighlights}
                    onClick={() => setShowReadHighlights(!showReadHighlights)}
                    className={`shrink-0 w-12 h-7 rounded-full flex items-center p-0.5 transition-colors duration-300 ${showReadHighlights ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <div className="bg-white w-6 h-6 rounded-full shadow" />
                  </button>
                </div>
              </section>

              {/* Shadow Reading */}
              <section className="select-none border-t border-orange-100 pt-4">
                <div className="mb-3 px-2.5 py-2 rounded-xl bg-pink-50/70 border border-pink-100/80">
                  <p className="text-xs font-extrabold text-pink-700 flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>Shadow Reading</span>
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-sky-600" />
                      <span>Pinyin display</span>
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showPinyin}
                      onClick={() => setShowPinyin(!showPinyin)}
                      className={`shrink-0 w-12 h-7 rounded-full flex items-center p-0.5 transition-colors duration-300 ${showPinyin ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                      <div className="bg-white w-6 h-6 rounded-full shadow" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span>Show translation</span>
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={aiAssistEnabled}
                      onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
                      className={`shrink-0 w-12 h-7 rounded-full flex items-center p-0.5 transition-colors duration-300 ${aiAssistEnabled ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                      <div className="bg-white w-6 h-6 rounded-full shadow" />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="pt-4 border-t border-orange-100 select-none shrink-0">
              <button
                onClick={() => {
                  setVoiceSpeed(1.0);
                  setShowPinyin(false);
                  setAiAssistEnabled(false);
                  setShowReadHighlights(false);
                  setShowSettings(false);
                }}
                className="w-full min-h-[44px] py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-sm hover:bg-slate-200 font-bold"
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
