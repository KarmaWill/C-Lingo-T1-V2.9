import { useState, useEffect, useRef, type MouseEvent, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSpeakingLatestScore } from '../../hsk/speakingScore';
import './funChineseInteractiveEbook.css';
import EbookRubyLine from './EbookRubyLine';
import { APP_FONT_FAMILY } from '../../theme/appFont';
import {
  Volume2, Play, Pause, Mic, Tv, User,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, X, RotateCcw,
  Star, Sliders, Eye, EyeOff, Sparkles, Smile, RefreshCw,
  Link2, ListTodo, CircleHelp, MessageCircle, PenLine,
  Maximize2, Minimize2, Languages, SquareDashed, ExternalLink,
  BookOpen, Repeat2,
} from 'lucide-react';

function EbookLessonsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="7.25" cy="8" r="2.35" stroke="currentColor" strokeWidth="1.55" />
      <circle cx="7.25" cy="8" r="0.72" fill="currentColor" />
      <circle cx="7.25" cy="16" r="2.35" stroke="currentColor" strokeWidth="1.55" />
      <rect x="12.25" y="6.75" width="8.5" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="12.25" y="10.75" width="8.5" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="12.25" y="14.75" width="8.5" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  );
}

function EbookSettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
      />
    </svg>
  );
}

const LEARNING_MODES = [
  { id: 'read' as const, label: 'Tap to Read', Icon: BookOpen },
  { id: 'repeat' as const, label: 'Repeat Range', Icon: Repeat2 },
  { id: 'shadow' as const, label: 'Shadow Reading', Icon: Mic },
  { id: 'exercise' as const, label: 'Practice', Icon: PenLine },
];

/** Modes affected by shared speech-speed setting */
const SPEECH_SPEED_MODES = LEARNING_MODES.filter((m) => m.id !== 'exercise');

const EXERCISE_TABS = [
  { id: 'match' as const, label: 'Match', Icon: Link2 },
  { id: 'fill' as const, label: 'Fill', Icon: ListTodo },
  { id: 'truefalse' as const, label: 'Quiz', Icon: CircleHelp },
  { id: 'roleplay' as const, label: 'Story', Icon: MessageCircle },
  { id: 'stroke' as const, label: 'Write', Icon: PenLine },
];

const VOICE_SPEED_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

const formatVoiceSpeedLabel = (speed: number) => (speed === 1 ? 'Normal' : `${speed}x`);
const formatFooterSpeedLabel = (speed: number) => `${speed === 1 ? 1 : speed}x`;

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
    sentenceChinese?: string;
    sentencePinyin?: string;
    blankHan?: string;
    segments?: SentenceSegment[];
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
    segments?: SentenceSegment[];
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
      english: "What is your name?",
      sentenceChinese: "你叫什么名字？",
      sentencePinyin: "nǐ jiào shénme míngzì",
      blankHan: "名字",
      segments: [
        { text: "你", pinyin: "nǐ" },
        { text: "叫", pinyin: "jiào" },
        { text: "什么", pinyin: "shénme" },
        { text: "名字", pinyin: "míngzì" },
        { text: "？", pinyin: "", speakable: false },
      ],
    },
    trueFalse: {
      illustration: "🎒🏫",
      text: "“学中文”的意思是 'Study Math'",
      correctAnswer: false,
      explanation: "“学中文”的意思是 'Study Chinese'。这代表我们一起快乐学汉语！"
    },
    comicRoleplay: [
      {
        name: "小明",
        avatar: "👦",
        bubbleText: "你好！你叫什么名字？",
        pinyin: "Nǐ hǎo! Nǐ jiào shénme míngzì?",
        segments: [
          { text: "你好", pinyin: "Nǐ hǎo" },
          { text: "！", pinyin: "", speakable: false },
          { text: "你", pinyin: "Nǐ" },
          { text: "叫", pinyin: "jiào" },
          { text: "什么", pinyin: "shénme" },
          { text: "名字", pinyin: "míngzì" },
          { text: "？", pinyin: "", speakable: false },
        ],
      },
      {
        name: "美林",
        avatar: "👧",
        bubbleText: "你好！我叫美林。我们学中文吧！",
        pinyin: "Nǐ hǎo! Wǒ jiào Měilín. Wǒmen xué Zhōngwén ba!",
        segments: [
          { text: "你好", pinyin: "Nǐ hǎo" },
          { text: "！", pinyin: "", speakable: false },
          { text: "我", pinyin: "Wǒ" },
          { text: "叫", pinyin: "jiào" },
          { text: "美林", pinyin: "Měilín" },
          { text: "。", pinyin: "", speakable: false },
          { text: "我们", pinyin: "Wǒmen" },
          { text: "学", pinyin: "xué" },
          { text: "中文", pinyin: "Zhōngwén" },
          { text: "吧", pinyin: "ba" },
          { text: "！", pinyin: "", speakable: false },
        ],
      },
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
      english: "three apples",
      sentenceChinese: "三个苹果",
      sentencePinyin: "sān gè píngguǒ",
      blankHan: "苹果",
      segments: [
        { text: "三个", pinyin: "sān gè" },
        { text: "苹果", pinyin: "píngguǒ" },
      ],
    },
    trueFalse: {
      illustration: "🍎🎒",
      text: "“十个苹果”的意思是 '10 apples'",
      correctAnswer: true,
      explanation: "“十”是数字 10，“苹果”是 Apple，所以是 '10 apples'。数数让我们更有信心！"
    },
    comicRoleplay: [
      {
        name: "小明",
        avatar: "👦",
        bubbleText: "一二三，共有几个苹果？",
        pinyin: "Yī èr sān, gòng yǒu jǐ gè píngguǒ?",
        segments: [
          { text: "一", pinyin: "Yī" },
          { text: "、", pinyin: "", speakable: false },
          { text: "二", pinyin: "èr" },
          { text: "、", pinyin: "", speakable: false },
          { text: "三", pinyin: "sān" },
          { text: "，", pinyin: "", speakable: false },
          { text: "共有", pinyin: "gòng yǒu" },
          { text: "几个", pinyin: "jǐ gè" },
          { text: "苹果", pinyin: "píngguǒ" },
          { text: "？", pinyin: "", speakable: false },
        ],
      },
      {
        name: "美林",
        avatar: "👧",
        bubbleText: "这里有一二三...三个红苹果！",
        pinyin: "Zhèlǐ yǒu yī èr sān... sān gè hóng píngguǒ!",
        segments: [
          { text: "这里", pinyin: "Zhèlǐ" },
          { text: "有", pinyin: "yǒu" },
          { text: "一二三", pinyin: "yī èr sān" },
          { text: "...", pinyin: "", speakable: false },
          { text: "三个", pinyin: "sān gè" },
          { text: "红", pinyin: "hóng" },
          { text: "苹果", pinyin: "píngguǒ" },
          { text: "！", pinyin: "", speakable: false },
        ],
      },
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
      { kind: 'lesson', lessonNum: 1, label: '你好', sublabel: 'Ni hao' },
      { kind: 'lesson', lessonNum: 2, label: '你叫什么', sublabel: "What's Your Name?" },
      { kind: 'lesson', lessonNum: 3, label: '你家在哪儿', sublabel: 'Where is Your Home?' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 2,
    titleZh: '我的家',
    titleEn: 'My Family',
    items: [
      { kind: 'lesson', lessonNum: 4, label: '爸爸、妈妈', sublabel: 'Dad and Mom' },
      { kind: 'lesson', lessonNum: 5, label: '我有一只小猫', sublabel: 'I Have a Kitten' },
      { kind: 'lesson', lessonNum: 6, label: '我家不大', sublabel: 'My Home Is Not Big' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 3,
    titleZh: '饮食和用餐',
    titleEn: 'Food and Dining',
    items: [
      { kind: 'lesson', lessonNum: 7, label: '喝牛奶，不喝咖啡', sublabel: 'Milk, Not Coffee' },
      { kind: 'lesson', lessonNum: 8, label: '我要苹果，你呢', sublabel: 'Apples for Me, How About You?' },
      { kind: 'lesson', lessonNum: 9, label: '我喜欢海鲜', sublabel: 'I Like Seafood' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 4,
    titleZh: '学校生活',
    titleEn: 'School Life',
    items: [
      { kind: 'lesson', lessonNum: 10, label: '中文课', sublabel: 'Chinese Class' },
      { kind: 'lesson', lessonNum: 11, label: '我们班', sublabel: 'Our Class' },
      { kind: 'lesson', lessonNum: 12, label: '我去图书馆', sublabel: 'I Go to the Library' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 5,
    titleZh: '时间和天气',
    titleEn: 'Time and Weather',
    items: [
      { kind: 'lesson', lessonNum: 13, label: '现在几点', sublabel: 'What Time Is It?' },
      { kind: 'lesson', lessonNum: 14, label: '我的生日', sublabel: 'My Birthday' },
      { kind: 'lesson', lessonNum: 15, label: '今天不冷', sublabel: "It's Not Cold Today" },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 6,
    titleZh: '职业和工作',
    titleEn: 'Work Life and Professions',
    items: [
      { kind: 'lesson', lessonNum: 16, label: '他是医生', sublabel: 'He Is a Doctor' },
      { kind: 'lesson', lessonNum: 17, label: '他在医院工作', sublabel: 'He Works at a Hospital' },
      { kind: 'lesson', lessonNum: 18, label: '我想做演员', sublabel: 'I Want to Be an Actor' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 7,
    titleZh: '兴趣和爱好',
    titleEn: 'Interests and Hobbies',
    items: [
      { kind: 'lesson', lessonNum: 19, label: '你的爱好是什么', sublabel: 'What Are Your Hobbies?' },
      { kind: 'lesson', lessonNum: 20, label: '你会打网球吗', sublabel: 'Can You Play Tennis?' },
      { kind: 'lesson', lessonNum: 21, label: '我天天看电视', sublabel: 'I Watch TV Every Day' },
      { kind: 'culture', label: 'Chinese Culture' },
      { kind: 'unit-summary', label: '单元小结', sublabel: 'Unit Review' },
    ],
  },
  {
    id: 8,
    titleZh: '交通和旅游',
    titleEn: 'Transportation and Travel',
    items: [
      { kind: 'lesson', lessonNum: 22, label: '这儿是火车站', sublabel: 'This Is the Train Station' },
      { kind: 'lesson', lessonNum: 23, label: '我坐飞机去', sublabel: 'I Go by Plane' },
      { kind: 'lesson', lessonNum: 24, label: '车站在前边', sublabel: 'The Station Is Ahead' },
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
          mode === 'shadow' ? 'textbook-speech-bubble-shadow' : ''
        } ${
          isActiveReadSentence || isSentencePlaying ? 'ring-2 ring-orange-300' : ''
        } ${
          isShadowSelected && shadowSelectionIndex === 0 ? 'is-hotspot-a' : ''
        } ${
          isShadowSelected && shadowSelectionIndex > 0 ? 'is-hotspot-b' : ''
        }`}
      >
        {mode === 'shadow' && isShadowSelected && (
          <span
            className={`textbook-hotspot-badge ${shadowSelectionIndex === 0 ? 'is-a' : 'is-b'}`}
            aria-hidden
          >
            {shadowSelectionIndex === 0 ? (
              <>
                <Volume2 className="textbook-hotspot-badge-icon" strokeWidth={2.4} />
                <span className="textbook-hotspot-badge-letter">A</span>
              </>
            ) : (
              <User className="textbook-hotspot-badge-icon" strokeWidth={2.4} />
            )}
          </span>
        )}
        <p className="text-[10px] text-sky-700 font-semibold leading-snug mb-0.5" style={{ fontFamily: APP_FONT_FAMILY }}>{sentence.pinyin}</p>
        <p className="text-sm font-bold text-slate-800 leading-snug" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{sentence.chinese}</p>
        {mode === 'shadow' && (
          <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">{sentence.english}</p>
        )}
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

  useEffect(() => {
    if (!shadowSessionReportOpen || shadowSessionQueue.length === 0) return;
    const lines = shadowSessionQueue
      .map((id) => currentLesson.textbookLeft.sentences.find((s) => s.id === id))
      .filter((s): s is SentenceItem => s != null);
    const scored = lines.filter((s) => shadowSentenceScores[s.id] != null);
    if (scored.length === 0) return;
    const avg = Math.round(
      scored.reduce((sum, s) => sum + shadowSentenceScores[s.id], 0) / scored.length,
    );
    saveSpeakingLatestScore(avg);
  }, [shadowSessionReportOpen, shadowSessionQueue, shadowSentenceScores, currentLesson]);

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
      saveSpeakingLatestScore(score);
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
          ? 'absolute inset-0 z-10 bg-[#F3F4F6]'
          : 'h-full w-full bg-[#F3F4F6] relative'
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
        className={`ebook-notebook-body w-full h-full min-h-0 relative flex flex-col overflow-hidden ${
          isFocusMode ? 'is-focus' : ''
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
        <header className="ebook-chrome-header z-10">
          <div className="ebook-chrome-header-inner">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="ebook-header-circle-btn shrink-0"
            >
              <ChevronLeft className="ebook-header-circle-icon" strokeWidth={2.25} />
            </button>

            {/* Core mode bar — icon-only until selected (Figma capsule) */}
            <div className="ebook-mode-bar" role="tablist" aria-label="Learning modes">
              {LEARNING_MODES.map(({ id, label, Icon }) => {
                const isActive = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={label}
                    onClick={() => switchMode(id)}
                    className={`ebook-mode-btn ${isActive ? 'ebook-mode-btn-active' : ''}`}
                  >
                    <Icon className="ebook-mode-icon" strokeWidth={2} aria-hidden />
                    {isActive && (
                      <span className="ebook-mode-label">{label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="ebook-chrome-header-actions">
              <button
                type="button"
                onClick={() => {
                  setShowLessonPicker((v) => !v);
                  setShowSettings(false);
                }}
                id="btn-lesson-picker"
                className={`ebook-header-circle-btn ${showLessonPicker ? 'ebook-header-circle-btn-active' : ''}`}
                title="Lessons"
                aria-label="Lessons"
                aria-pressed={showLessonPicker}
              >
                <EbookLessonsIcon className="ebook-header-circle-icon" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettings((v) => !v);
                  setShowLessonPicker(false);
                }}
                id="btn-settings-toggle"
                className={`ebook-header-circle-btn ${showSettings ? 'ebook-header-circle-btn-active' : ''}`}
                title="Settings"
                aria-label="Settings"
                aria-pressed={showSettings}
              >
                <EbookSettingsIcon className="ebook-header-circle-icon ebook-settings-gear-icon" />
              </button>
            </div>
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
        <main className={`textbook-spread flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden ${
          mode === 'shadow' ? 'textbook-spread-shadow' : ''
        } ${
          isFocusMode ? 'textbook-spread-focus' : ''
        }`}>

          {/* =========================================
              LEFT PAGE: TEXTBOOK CORES / READING SPREADS
              ========================================= */}
          <section className={`textbook-left-page-shell flex flex-col relative text-slate-800 ${
            mode === 'shadow' ? 'is-shadow-book' : ''
          } ${isFocusMode ? 'is-focus' : ''}`}>

            <div className="textbook-left-content flex-1 flex flex-col min-h-0 overflow-hidden py-1">
              <div className="textbook-left-header relative mb-2 shrink-0">
                <div className="textbook-wave-band flex items-end gap-3 pr-[88px] min-h-[72px]">
                  <div className="textbook-lesson-badge shrink-0">{currentLesson.id}</div>
                  <div className="min-w-0 pb-2">
                    <h2 className="textbook-lesson-title" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                      {currentLesson.title}
                    </h2>
                    <p className="text-[11px] text-sky-800/80 font-semibold mt-0.5" style={{ fontFamily: APP_FONT_FAMILY }}>
                      {currentLesson.pinyin}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-video-guide"
                  onClick={() => { setIsVideoOpen(true); setVideoScene(0); }}
                  className="ebook-video-chip"
                  title="Intro Video"
                  aria-label="Intro Video"
                >
                  <Tv className="ebook-video-chip-icon" strokeWidth={2} />
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

              {mode === 'exercise' && (
                <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-[#F9F7F1]/90 border border-orange-100/40 text-[10px] text-slate-600 shrink-0">
                  <p><strong className="text-emerald-700">Practice</strong> — Use the right page for exercises.</p>
                </div>
              )}

              <div
                className={`textbook-scene flex-1 min-h-[220px] relative overflow-hidden mb-2${
                  mode === 'shadow' && selectedShadowIds.length >= 2 ? ' is-range-selected' : ''
                }`}
              >
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

              {getExtraSceneSentences(currentLesson).length > 0 && (
                <div className="space-y-2 mb-2 shrink-0">
                  {getExtraSceneSentences(currentLesson).map((sentence, idx) =>
                    renderTextbookBubble(sentence, idx % 2 === 0 ? 'left' : 'right')
                  )}
                </div>
              )}

              {(mode === 'read' || mode === 'repeat') && activeBubble && (() => {
                const activeSent = currentLesson.textbookLeft.sentences.find((s) => s.id === activeBubble.sentenceId);
                if (!activeSent) return null;
                const segments = getSentenceSegments(activeSent);
                return (
                  <div className="shrink-0 p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/60 mb-2">
                    <p className="text-[9px] font-extrabold mb-1.5" style={{ color: '#FF6B35' }}>Tap words</p>
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
                                <rt className="text-[9px] text-amber-800 block" style={{ fontFamily: APP_FONT_FAMILY }}>{segment.pinyin}</rt>
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
            {!isFocusMode && mode !== 'shadow' && (
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
          <section className={`textbook-right-page-shell flex flex-col text-slate-800 min-h-0 overflow-hidden relative ${
            mode === 'shadow'
              ? 'speaking-reading-shell'
              : mode === 'exercise'
                ? 'exercise-panel-shell'
                : 'bg-[#FDFDFB]'
          } ${
            isFocusMode
              ? mode === 'shadow'
                ? 'speaking-reading-shell-focus md:ml-0'
                : mode === 'exercise'
                  ? 'exercise-panel-shell-focus md:ml-0'
                  : 'p-3 rounded-xl border border-orange-100/50 shadow-sm md:ml-0'
              : mode === 'shadow' || mode === 'exercise'
                ? 'md:ml-1'
                : 'rounded-2xl p-4 border border-orange-100/60 shadow-sm md:ml-1'
          }`}>
            
            {mode === 'shadow' ? (
              <div className="speaking-reading-panel">
                <div className="speaking-reading-header">
                  <h3 className="speaking-reading-title">Speaking Challenge</h3>
                  <div className="speaking-reading-toolbar">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={shadowSelectAllEnabled}
                      onClick={toggleShadowSelectAll}
                      title={shadowSelectAllEnabled ? 'Deselect all lines' : 'Select all lines on this page'}
                      className={`speaking-reading-chip${shadowSelectAllEnabled ? ' is-on' : ''}`}
                    >
                      {shadowSelectAllEnabled && (
                        <Check className="speaking-reading-chip-icon" strokeWidth={2.75} aria-hidden />
                      )}
                      <span>{shadowSelectAllEnabled ? 'All selected' : 'Select all'}</span>
                    </button>
                    <span className="speaking-reading-toolbar-divider" aria-hidden />
                    <button
                      type="button"
                      onClick={startShadowTraining}
                      disabled={!canShadowAll}
                      title={canShadowAll ? 'Start shadow reading for selected lines' : 'Select 2+ lines, or turn on Select all'}
                      className={`speaking-reading-btn speaking-reading-btn-primary${canShadowAll ? '' : ' is-disabled'}`}
                    >
                      <Mic className="speaking-reading-btn-icon" strokeWidth={2.25} />
                      <span>Shadow All</span>
                    </button>
                  </div>
                </div>

                <div className="speaking-reading-scroll textbook-right-scroll">
                  {selectedShadowSentences.length === 0 ? (
                    <div className="speaking-reading-empty" role="status">
                      <div className="speaking-reading-empty-icon" aria-hidden>
                        <Mic className="speaking-reading-empty-mic" strokeWidth={2.25} />
                      </div>
                      <p className="speaking-reading-empty-title">Tap a word to start</p>
                      <p className="speaking-reading-empty-sub">Listen first then shadow</p>
                      <div className="speaking-reading-empty-chip">
                        Choose any highlighted word
                      </div>
                    </div>
                  ) : (
                    <div className="speaking-reading-list">
                      {selectedShadowSentences.map((sentence, idx) => {
                        const score = shadowSentenceScores[sentence.id];
                        const segments = getSentenceSegments(sentence);
                        return (
                          <div
                            key={sentence.id}
                            className={`speaking-reading-card${
                              score != null && score >= 80
                                ? ' is-pass'
                                : score != null
                                  ? ' is-retry'
                                  : ''
                            }`}
                          >
                            <span
                              className={`speaking-reading-card-badge ${idx === 0 ? 'is-a' : 'is-b'}`}
                              aria-hidden
                            >
                              {idx === 0 ? (
                                <>
                                  <Volume2 className="speaking-reading-card-badge-icon" strokeWidth={2.4} />
                                  <span className="speaking-reading-card-badge-letter">A</span>
                                </>
                              ) : (
                                <User className="speaking-reading-card-badge-icon" strokeWidth={2.4} />
                              )}
                            </span>
                            {score != null && (
                              <span className={`speaking-reading-card-score${
                                score >= 80 ? ' is-pass' : ' is-retry'
                              }`}>
                                {score}
                              </span>
                            )}

                            <div className="speaking-reading-card-top">
                              <div className="speaking-reading-ruby-line">
                                {segments.map((segment, segIdx) => {
                                  const wordKey = `word-${sentence.id}-${segIdx}`;
                                  const isActiveWord = activePlayingKey === wordKey;
                                  if (segment.speakable === false) {
                                    return (
                                      <span
                                        key={wordKey}
                                        className="speaking-reading-ruby-punct"
                                        style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                                      >
                                        {segment.text}
                                      </span>
                                    );
                                  }
                                  return (
                                    <button
                                      key={wordKey}
                                      type="button"
                                      onClick={(e) => handleReadWordTap(sentence, segment, segIdx, e)}
                                      className={`speaking-reading-ruby-word${isActiveWord ? ' is-active' : ''}`}
                                    >
                                      <ruby style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
                                        {segment.text}
                                        {showPinyin && segment.pinyin ? (
                                          <rt style={{ fontFamily: APP_FONT_FAMILY }}>{segment.pinyin}</rt>
                                        ) : null}
                                      </ruby>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="speaking-reading-card-divider" aria-hidden />
                            <p className="speaking-reading-card-en">{sentence.english}</p>

                            <div className="speaking-reading-card-actions">
                              <button
                                type="button"
                                onClick={() => speakZH(sentence.chinese, `shadow-${sentence.id}`)}
                                className="speaking-reading-card-btn speaking-reading-card-btn-listen"
                                aria-label="Listen"
                                title="Listen"
                              >
                                <Volume2 className="speaking-reading-card-btn-icon" strokeWidth={2.25} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openFollowRead(sentence.chinese, sentence.pinyin, sentence.english, sentence.id, false)}
                                className="speaking-reading-card-btn speaking-reading-card-btn-speak"
                                aria-label="Speak and score"
                                title="Speak and score"
                              >
                                <Mic className="speaking-reading-card-btn-icon" strokeWidth={2.25} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
              <div className="ebook-exercise-panel flex-1 flex flex-col min-h-0">
                <div className="ebook-mode-bar ebook-exercise-tab-bar" role="tablist" aria-label="Exercise types">
                  {EXERCISE_TABS.map(({ id, label, Icon }) => {
                    const isActive = exerciseTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={label}
                        onClick={() => { setExerciseTab(id); switchMode('exercise'); }}
                        className={`ebook-mode-btn${isActive ? ' ebook-mode-btn-active' : ''}`}
                      >
                        <Icon className="ebook-mode-icon" strokeWidth={2} aria-hidden />
                        {isActive && (
                          <>
                            <span className="ebook-mode-divider" aria-hidden />
                            <span className="ebook-mode-label">{label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="ebook-exercise-body">

                  {/* 1. MATCH PANEL */}
                  {exerciseTab === 'match' && (
                    <div id="exercise-line-match" className="ebook-exercise-view">
                      <div className="ebook-exercise-head">
                        <p className="ebook-exercise-title">Word Match</p>
                        <div className="ebook-exercise-head-actions">
                          <button
                            type="button"
                            onClick={() => speakZH(currentLesson.vocabList.map((v) => v.chinese).join(''))}
                            className="ebook-exercise-chip-btn"
                          >
                            <Volume2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                            <span>Listen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMatchOptions(currentLesson.matchOptions);
                              setSelectedLeft(null);
                              setMatchStatusMsg('');
                            }}
                            className="ebook-exercise-link-btn"
                          >
                            <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      <div className="ebook-exercise-match-grid">
                        <div className="ebook-exercise-match-col">
                          {matchOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={opt.isMatched}
                              onClick={() => handleLeftMatchSelect(opt.id)}
                              className={`ebook-exercise-option${
                                opt.isMatched ? ' is-matched' : selectedLeft === opt.id ? ' is-selected' : ''
                              }`}
                            >
                              {opt.left}
                            </button>
                          ))}
                        </div>

                        <div className="ebook-exercise-match-col">
                          {matchOptions.map((opt, oIdx) => {
                            const charItem = matchOptions[(oIdx + 1) % matchOptions.length];
                            const actualTargetMatched = matchOptions.find((o) => o.right === charItem.right)?.isMatched;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={actualTargetMatched}
                                onClick={() => handleRightMatchSelect(charItem.right)}
                                className={`ebook-exercise-option ebook-exercise-option-cn${
                                  actualTargetMatched ? ' is-matched' : ''
                                }`}
                              >
                                <span style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{charItem.right}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {matchStatusMsg && (
                        <p className="ebook-exercise-status is-error">{matchStatusMsg}</p>
                      )}
                      {matchOptions.every((o) => o.isMatched) && !matchStatusMsg && (
                        <p className="ebook-exercise-status is-success">All matched!</p>
                      )}
                    </div>
                  )}

                  {/* 2. FILL BLANK PANEL */}
                  {exerciseTab === 'fill' && (
                    <div id="exercise-fill-blank" className="ebook-exercise-view">
                      <div className="ebook-exercise-head">
                        <p className="ebook-exercise-title">Fill in the Blank</p>
                        <button
                          type="button"
                          onClick={() => speakZH(currentLesson.fillBlank.audioText)}
                          className="ebook-exercise-chip-btn"
                        >
                          <Volume2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                          <span>Listen</span>
                        </button>
                      </div>

                      <div className="ebook-exercise-card ebook-exercise-fill-card">
                        <span className="ebook-exercise-fill-en">&ldquo;{currentLesson.fillBlank.english}&rdquo;</span>
                        <EbookRubyLine
                          text={currentLesson.fillBlank.sentenceChinese ?? currentLesson.fillBlank.audioText}
                          pinyin={currentLesson.fillBlank.sentencePinyin ?? currentLesson.fillBlank.pinyin}
                          segments={currentLesson.fillBlank.segments}
                          showPinyin={showPinyin}
                          blankHan={currentLesson.fillBlank.blankHan ?? currentLesson.fillBlank.correctAnswer}
                          blankDisplay={fillInput || fillSelected || '____'}
                          className="ebook-exercise-fill-ruby"
                        />
                      </div>

                      <div className="ebook-exercise-fill-row">
                        <input
                          type="text"
                          value={fillInput}
                          onChange={(e) => setFillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFillSubmit(); }}
                          placeholder="Type the missing word"
                          className="ebook-exercise-input"
                          style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                        />
                        <button
                          type="button"
                          onClick={handleFillSubmit}
                          className="ebook-exercise-primary-btn"
                        >
                          Check
                        </button>
                      </div>

                      {fillFeedback && (
                        <div className={`ebook-exercise-feedback${fillFeedback.isCorrect ? ' is-success' : ' is-error'}`}>
                          <p className="ebook-exercise-feedback-title">
                            {fillFeedback.isCorrect ? <><Check className="w-4 h-4" /> Correct</> : <><X className="w-4 h-4" /> Try again</>}
                          </p>
                          {!fillFeedback.isCorrect && (
                            <p className="ebook-exercise-feedback-detail">Answer: {currentLesson.fillBlank.correctAnswer}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. TRUE OR FALSE PANEL */}
                  {exerciseTab === 'truefalse' && (
                    <div id="exercise-true-false" className="ebook-exercise-view ebook-exercise-view-spaced">
                      <div>
                        <p className="ebook-exercise-title">True or False</p>

                        <div className="ebook-exercise-card ebook-exercise-quiz-card">
                          <span className="ebook-exercise-quiz-emoji">{currentLesson.trueFalse.illustration}</span>
                          <p className="ebook-exercise-quiz-text">{currentLesson.trueFalse.text}</p>
                        </div>

                        <div className="ebook-exercise-quiz-actions">
                          <button
                            type="button"
                            onClick={() => handleTrueFalseSelect(true)}
                            className={`ebook-exercise-option ebook-exercise-quiz-btn${
                              trueFalseAnswer === true
                                ? currentLesson.trueFalse.correctAnswer === true
                                  ? ' is-correct'
                                  : ' is-wrong'
                                : ''
                            }`}
                          >
                            <span className="ebook-exercise-quiz-mark is-true">✓</span>
                            <span>True</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTrueFalseSelect(false)}
                            className={`ebook-exercise-option ebook-exercise-quiz-btn${
                              trueFalseAnswer === false
                                ? currentLesson.trueFalse.correctAnswer === false
                                  ? ' is-correct'
                                  : ' is-wrong'
                                : ''
                            }`}
                          >
                            <span className="ebook-exercise-quiz-mark is-false">✗</span>
                            <span>False</span>
                          </button>
                        </div>
                      </div>

                      {trueFalseSubmitted && (
                        <div className={`ebook-exercise-feedback${
                          trueFalseAnswer === currentLesson.trueFalse.correctAnswer ? ' is-success' : ' is-error'
                        }`}>
                          <p className="ebook-exercise-feedback-title">
                            {trueFalseAnswer === currentLesson.trueFalse.correctAnswer
                              ? <><Check className="w-4 h-4" /> Correct — {currentLesson.trueFalse.correctAnswer ? 'True' : 'False'}</>
                              : <><X className="w-4 h-4" /> Incorrect — answer is {currentLesson.trueFalse.correctAnswer ? 'True' : 'False'}</>}
                          </p>
                          <p className="ebook-exercise-feedback-detail">{currentLesson.trueFalse.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. DIALOGUE ROLE-PLAY WITH AUDIO SAVER */}
                  {exerciseTab === 'roleplay' && (
                    <div id="exercise-roleplay" className="ebook-exercise-view ebook-exercise-view-spaced">
                      <div>
                        <p className="ebook-exercise-title">Complete the Dialogue</p>
                        <p className="ebook-exercise-subtitle">Finish each line based on the context.</p>

                        <div className="ebook-exercise-roleplay-list">
                          {currentLesson.comicRoleplay.map((chat, cIdx) => (
                            <div key={cIdx} className="ebook-exercise-roleplay-row">
                              <span className="ebook-exercise-roleplay-avatar">{chat.avatar}</span>
                              <div className="ebook-exercise-roleplay-bubble">
                                <span className="ebook-exercise-roleplay-name">{chat.name}：</span>
                                <EbookRubyLine
                                  text={chat.bubbleText}
                                  pinyin={chat.pinyin}
                                  segments={chat.segments}
                                  showPinyin={showPinyin}
                                  className="ebook-exercise-roleplay-ruby"
                                />

                                <div className="ebook-exercise-roleplay-actions">
                                  <button
                                    type="button"
                                    onClick={() => speakZH(chat.bubbleText)}
                                    className="ebook-exercise-chip-btn ebook-exercise-chip-btn-sm"
                                  >
                                    <Volume2 className="w-3 h-3" strokeWidth={2.25} />
                                    <span>Listen</span>
                                  </button>

                                  <button
                                    type="button"
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
                                    className={`ebook-exercise-record-btn${rolePlayRecords[cIdx] ? ' is-done' : ''}`}
                                  >
                                    <Mic className="w-3 h-3" strokeWidth={2.25} />
                                    <span>{rolePlayRecords[cIdx] ? 'Replay mine' : 'Record'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ebook-exercise-footnote">
                        Recordings are saved locally in this e-book session.
                      </div>
                    </div>
                  )}

                  {/* 5. STROKE ORDER ANIMATOR GRID */}
                  {exerciseTab === 'stroke' && (
                    <div id="exercise-stroke-order" className="ebook-exercise-view ebook-exercise-view-spaced">
                      <div>
                        <div className="ebook-exercise-head">
                          <p className="ebook-exercise-title">Stroke Order</p>
                          <div className="ebook-stroke-char-tabs">
                            {currentLesson.strokeChars.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setActiveStrokeCharIdx(idx);
                                  setActiveStrokeStep(-1);
                                  stopStrokeAnimation();
                                }}
                                className={`ebook-stroke-char-tab${activeStrokeCharIdx === idx ? ' is-active' : ''}`}
                                style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                              >
                                {s.char}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(() => {
                          const charObj = currentLesson.strokeChars[activeStrokeCharIdx];
                          if (!charObj) return null;
                          return (
                            <div className="ebook-stroke-layout">
                              <div className="ebook-stroke-canvas">
                                <div className="stroke-guide-square" aria-hidden="true" />

                                <span
                                  className="stroke-char-ghost ebook-stroke-ghost"
                                  aria-hidden="true"
                                >
                                  {charObj.char}
                                </span>

                                <svg viewBox="0 0 100 100" className="ebook-stroke-svg">
                                  {charObj.strokes.map((path, idx) => {
                                    const isVisible = activeStrokeStep === -1 || idx <= activeStrokeStep;
                                    const isCurrentlyDrawing = activeStrokeStep === idx;
                                    return (
                                      <path
                                        key={`fg-${idx}`}
                                        d={path}
                                        fill="none"
                                        stroke={isCurrentlyDrawing ? '#14b8a6' : '#0f766e'}
                                        strokeWidth="9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                          transition: 'all 0.8s ease-in-out',
                                          strokeDasharray: isCurrentlyDrawing ? '200' : 'none',
                                          strokeDashoffset: isCurrentlyDrawing ? '0' : 'none',
                                          display: isVisible ? 'block' : 'none'
                                        }}
                                      />
                                    );
                                  })}
                                </svg>
                              </div>

                              <div className="ebook-stroke-side">
                                <div className="ebook-exercise-card ebook-stroke-info">
                                  <div className="ebook-stroke-info-head">
                                    <span className="ebook-stroke-char-label" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>{charObj.char}</span>
                                    <span className="ebook-stroke-meaning">{charObj.meaning}</span>
                                  </div>
                                  <p className="ebook-stroke-progress">
                                    Stroke {activeStrokeStep === -1 ? 0 : activeStrokeStep + 1} / {charObj.strokes.length}
                                  </p>
                                  <div className="ebook-stroke-desc">
                                    {activeStrokeStep === -1 ? (
                                      <span>Tap play to watch the stroke order animation.</span>
                                    ) : (
                                      <span>{charObj.meanings[activeStrokeStep]}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="ebook-stroke-controls">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      stopStrokeAnimation();
                                      startStrokeAnimation(charObj);
                                    }}
                                    disabled={isStrokeAnimating}
                                    className="ebook-exercise-primary-btn ebook-stroke-play-btn"
                                  >
                                    <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    <span>{isStrokeAnimating ? 'Playing…' : 'Play strokes'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      stopStrokeAnimation();
                                      setActiveStrokeStep(-1);
                                    }}
                                    className="ebook-stroke-reset-btn"
                                    title="Reset"
                                    aria-label="Reset"
                                  >
                                    <RotateCcw className="w-4 h-4" strokeWidth={2.25} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="ebook-stroke-footer">
                        <span>支持点选笔画定位跟学。</span>
                        <div className="ebook-stroke-step-btns">
                          <button
                            type="button"
                            disabled={activeStrokeStep <= -1}
                            onClick={() => { stopStrokeAnimation(); setActiveStrokeStep(prev => prev - 1); }}
                            className="ebook-stroke-step-btn"
                          >
                            ◀ Prev
                          </button>
                          <button
                            type="button"
                            disabled={activeStrokeStep >= currentLesson.strokeChars[activeStrokeCharIdx].strokes.length - 1}
                            onClick={() => { stopStrokeAnimation(); setActiveStrokeStep(prev => prev + 1); }}
                            className="ebook-stroke-step-btn"
                          >
                            Next ▶
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

        {/* Footer toolbar — matches header circular / capsule style */}
        {!isFocusMode && (
        <footer className="ebook-footer-bar select-none">
          <button
            type="button"
            onClick={() => {
              setShowSettings(true);
              setShowLessonPicker(false);
            }}
            className="ebook-footer-chip justify-self-start"
            aria-label={`Reading speed ${formatFooterSpeedLabel(voiceSpeed)}. Open settings`}
            title="Speech speed (Settings)"
          >
            <span className="ebook-footer-chip-label">Speed</span>
            <span className="ebook-footer-chip-divider" aria-hidden />
            <span className="ebook-footer-chip-value">{formatFooterSpeedLabel(voiceSpeed)}</span>
          </button>

          <button
            type="button"
            onClick={toggleFocusMode}
            aria-label="Focus reading"
            title="Hide controls for full-page reading"
            className="ebook-footer-focus-btn justify-self-center"
          >
            <Maximize2 className="ebook-footer-focus-icon" strokeWidth={2.5} />
          </button>

          <div className="ebook-footer-chip ebook-footer-chip-static justify-self-end" aria-live="polite">
            <span className="ebook-footer-pages-label">PAGES</span>
            <span className="ebook-footer-pages-value">
              {leftPageNum}-{rightPageNum}
            </span>
          </div>
        </footer>
        )}

        {/* Focus mode footer — Controls overlay at bottom center, no layout space */}
        {isFocusMode && (
        <footer
          className={`ebook-footer-bar ebook-footer-bar-focus absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 transition-opacity duration-300 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent ${
            focusChromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div aria-hidden="true" />
          <button
            type="button"
            onClick={toggleFocusMode}
            aria-label="Show controls"
            title="Show controls"
            className="ebook-header-circle-btn justify-self-center"
          >
            <Minimize2 className="ebook-header-circle-icon" strokeWidth={2.25} />
          </button>
          <div aria-hidden="true" />
        </footer>
        )}

        {/* Lesson picker — contents panel (teal reference design) */}
        {showLessonPicker && !isFocusMode && (
          <div id="lesson-picker-panel" className="ebook-contents-drawer animate-fade-in">
            <div className="ebook-contents-header">
              <h3 className="ebook-contents-title">Contents</h3>
              <button
                type="button"
                onClick={() => setShowLessonPicker(false)}
                className="ebook-settings-close"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <div className="ebook-contents-body">
              {CURRICULUM_UNITS.map((unit) => {
                const isExpanded = expandedUnits.has(unit.id);
                const unitHasActiveLesson = unit.items.some(
                  (item) => item.kind === 'lesson' && item.lessonNum === currentLessonId
                );
                return (
                  <section key={unit.id} className="ebook-contents-unit">
                    <button
                      type="button"
                      onClick={() => toggleUnitExpanded(unit.id)}
                      aria-expanded={isExpanded}
                      className={`ebook-contents-unit-header${isExpanded ? ' is-expanded' : ' is-collapsed'}${unitHasActiveLesson ? ' has-active-lesson' : ''}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="ebook-contents-unit-chevron" aria-hidden />
                      ) : (
                        <ChevronUp className="ebook-contents-unit-chevron" aria-hidden />
                      )}
                      <span className="ebook-contents-unit-label">
                        Unit {unit.id}: {unit.titleZh}
                        <span className="ebook-contents-unit-label-en"> / {unit.titleEn}</span>
                      </span>
                    </button>
                    {isExpanded && (
                      <ul className="ebook-contents-lessons">
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
                                  className={`ebook-contents-lesson-row${isActive ? ' is-active' : ''}${!isAvailable ? ' is-disabled' : ''}`}
                                >
                                  <span className={`ebook-contents-lesson-num${isActive ? ' is-active' : ''}`}>
                                    {lessonId}
                                  </span>
                                  <span className="ebook-contents-lesson-text">
                                    <span className="ebook-contents-lesson-title">{item.label}</span>
                                    {item.sublabel && (
                                      <span className="ebook-contents-lesson-sub">{item.sublabel}</span>
                                    )}
                                  </span>
                                  {!isAvailable && (
                                    <span className="ebook-contents-soon">Soon</span>
                                  )}
                                </button>
                              </li>
                            );
                          }

                          const iconClass =
                            item.kind === 'culture'
                              ? 'ebook-contents-special-icon is-culture'
                              : 'ebook-contents-special-icon is-summary';
                          const iconContent =
                            item.kind === 'culture' ? (
                              <span aria-hidden>🏮</span>
                            ) : (
                              <ListTodo className="w-4 h-4" strokeWidth={2.25} aria-hidden />
                            );

                          return (
                            <li key={`u${unit.id}-${item.kind}-${idx}`}>
                              <div className="ebook-contents-lesson-row is-special">
                                <span className={iconClass}>{iconContent}</span>
                                <span className="ebook-contents-lesson-text">
                                  <span className="ebook-contents-lesson-title">{item.label}</span>
                                  {item.sublabel && (
                                    <span className="ebook-contents-lesson-sub">{item.sublabel}</span>
                                  )}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })}

              <section className="ebook-contents-appendix">
                <h4 className="ebook-contents-appendix-header">
                  附录
                  <span className="ebook-contents-appendix-header-en">Appendix</span>
                </h4>
                <ul className="ebook-contents-lessons">
                  {CURRICULUM_APPENDIX.map((item, idx) => (
                    <li key={`appendix-${idx}`}>
                      <div className="ebook-contents-lesson-row is-special">
                        <span className="ebook-contents-special-icon is-appendix">
                          <BookOpen className="w-4 h-4" strokeWidth={2.25} aria-hidden />
                        </span>
                        <span className="ebook-contents-lesson-text">
                          <span className="ebook-contents-lesson-title">{item.label}</span>
                          {item.sublabel && (
                            <span className="ebook-contents-lesson-sub">{item.sublabel}</span>
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
        {followModal.isOpen && (() => {
          const followModalSentence = followModal.sentenceId
            ? currentLesson.textbookLeft.sentences.find((s) => s.id === followModal.sentenceId)
            : undefined;
          const followModalSegments = followModalSentence
            ? getSentenceSegments(followModalSentence)
            : [{ text: followModal.text, pinyin: followModal.pinyin }];
          return (
          <div id="follow-read-modal" className="follow-read-overlay animate-fade-in">
            <div className="follow-read-dialog">
              {/* Left — sentence display */}
              <section className="follow-read-panel follow-read-panel-sentence">
                <button
                  type="button"
                  onClick={() => speakZH(followModal.text)}
                  className="follow-read-listen-btn"
                  aria-label="Listen"
                  title="Listen"
                >
                  <Volume2 className="follow-read-listen-icon" strokeWidth={2.25} />
                </button>
                <div className="follow-read-sentence-body">
                  <div className="follow-read-ruby-line">
                    {followModalSegments.map((segment, segIdx) => (
                      segment.speakable === false ? (
                        <span
                          key={`follow-seg-${segIdx}`}
                          className="follow-read-ruby-punct"
                          style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                        >
                          {segment.text}
                        </span>
                      ) : (
                        <span
                          key={`follow-seg-${segIdx}`}
                          className="follow-read-ruby-word"
                          style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
                        >
                          <ruby>
                            {segment.text}
                            {showPinyin && segment.pinyin ? (
                              <rt style={{ fontFamily: APP_FONT_FAMILY }}>{segment.pinyin}</rt>
                            ) : null}
                          </ruby>
                        </span>
                      )
                    ))}
                  </div>
                  {followModal.english && (
                    <>
                      <div className="follow-read-divider" aria-hidden />
                      <p className="follow-read-en">&ldquo;{followModal.english}&rdquo;</p>
                    </>
                  )}
                </div>
              </section>

              {/* Right — record & score */}
              <section className="follow-read-panel follow-read-panel-record">
                <button
                  type="button"
                  onClick={() => {
                    if (followRecordState === 'recording') handleStopRecording();
                    setFollowModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="follow-read-close ebook-settings-close"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>

                <div className="follow-read-record-head">
                  <h3 className="follow-read-record-title">
                    {followModal.shadowSession ? 'Shadow Reading' : 'Speak & Score'}
                  </h3>
                  {followModal.shadowSession && (
                    <p className="follow-read-record-progress">
                      {shadowSessionIndex + 1} / {shadowSessionQueue.length}
                    </p>
                  )}
                </div>

                <div className="follow-read-record-body">
                  {followRecordState === 'idle' && (
                    <div className="follow-read-idle">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="follow-read-record-btn"
                        aria-label="Tap to record"
                      >
                        <Mic className="follow-read-record-btn-icon" strokeWidth={2.25} />
                      </button>
                      <p className="follow-read-record-hint">Tap to record</p>
                    </div>
                  )}

                  {followRecordState === 'recording' && (
                    <div className="follow-read-recording">
                      <p className="follow-read-recording-label">Recording…</p>
                      <div className="follow-read-waveform">
                        {[...Array(10)].map((_, i) => {
                          const h = micAmplitude > 0 ? Math.max(8, micAmplitude * (0.2 + Math.random() * 0.8)) : 8;
                          return (
                            <div
                              key={i}
                              style={{ height: `${h}px` }}
                              className="follow-read-wave-bar"
                            />
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="follow-read-stop-btn"
                      >
                        Stop &amp; Score
                      </button>
                    </div>
                  )}

                  {followRecordState === 'evaluating' && (
                    <div className="follow-read-evaluating">
                      <div className="follow-read-spinner" aria-hidden />
                      <p className="follow-read-evaluating-label">Analyzing…</p>
                    </div>
                  )}

                  {followRecordState === 'result' && (
                    <div className="follow-read-result">
                      <div className="follow-read-stars">
                        {[...Array(5)].map((_, i) => {
                          const filled = i < Math.ceil(evalResultScore / 20);
                          return (
                            <Star
                              key={i}
                              className={`follow-read-star${filled ? ' is-filled' : ''}`}
                            />
                          );
                        })}
                      </div>

                      <div className="follow-read-score">{evalResultScore}</div>
                      <p className="follow-read-score-msg">
                        {evalResultScore >= 95
                          ? 'Excellent — native-like clarity!'
                          : evalResultScore >= 90
                            ? 'Great job — tones are on point!'
                            : 'Good effort — keep practicing!'}
                      </p>

                      <div className="follow-read-metrics">
                        <div>
                          <span className="follow-read-metric-label">Accuracy</span>
                          <span className="follow-read-metric-value">{evalResultScore - 1}%</span>
                        </div>
                        <div>
                          <span className="follow-read-metric-label">Tone</span>
                          <span className="follow-read-metric-value">
                            {evalResultScore >= 92 ? 95 : evalResultScore - 1}%
                          </span>
                        </div>
                        <div>
                          <span className="follow-read-metric-label">Fluency</span>
                          <span className="follow-read-metric-value">{evalResultScore}%</span>
                        </div>
                      </div>

                      <div className="follow-read-result-actions">
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="follow-read-secondary-action"
                        >
                          <span className="follow-read-secondary-action-icon">
                            <Mic className="w-5 h-5" strokeWidth={2.25} />
                          </span>
                          <span className="follow-read-secondary-action-label">Rerecord</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMyVoicePlaying(true);
                            speakZH(followModal.text);
                            setTimeout(() => setIsMyVoicePlaying(false), 2000);
                          }}
                          className="follow-read-secondary-action"
                        >
                          <span className={`follow-read-secondary-action-icon${isMyVoicePlaying ? ' is-active' : ''}`}>
                            <Play className="w-5 h-5 ml-0.5" strokeWidth={2.25} />
                          </span>
                          <span className="follow-read-secondary-action-label">Play</span>
                        </button>
                      </div>

                      {followModal.shadowSession && (
                        <button
                          type="button"
                          onClick={advanceShadowSession}
                          className="follow-read-next-btn"
                        >
                          {shadowSessionIndex + 1 >= shadowSessionQueue.length ? 'View Report' : 'Next line'}
                          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
          );
        })()}

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

        {/* Settings panel — teal reference design */}
        {showSettings && (
          <div id="settings-slide-drawer" className="ebook-settings-drawer animate-slide-in">
            <div className="ebook-settings-header">
              <h3 className="ebook-settings-title">
                <EbookSettingsIcon className="ebook-settings-title-icon" />
                <span>Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="ebook-settings-close"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <div className="ebook-settings-body">
              <section className="ebook-settings-section ebook-settings-applies-inline">
                <span className="ebook-settings-kicker-inline">Applies to</span>
                <div className="ebook-settings-mode-icons" aria-label="Speech speed applies to Tap to Read, Repeat Range, and Shadow Reading">
                  {SPEECH_SPEED_MODES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => switchMode(id)}
                      aria-label={label}
                      aria-pressed={mode === id}
                      title={label}
                      className={`ebook-settings-mode-icon-btn${mode === id ? ' ebook-settings-mode-icon-btn-active' : ''}`}
                    >
                      <Icon className="ebook-settings-mode-icon" strokeWidth={2} aria-hidden />
                    </button>
                  ))}
                </div>
              </section>

              <section className="ebook-settings-section ebook-settings-section-divider">
                <div className="ebook-settings-row">
                  <label className="ebook-settings-label" htmlFor="voice-speed-range">
                    Playback speed
                  </label>
                  <span className="ebook-settings-speed-badge">
                    {formatVoiceSpeedLabel(voiceSpeed)}
                  </span>
                </div>
                <div
                  className="ebook-settings-speed-wrap"
                  style={{ '--speed-progress': `${(voiceSpeedIndex / (VOICE_SPEED_STEPS.length - 1)) * 100}%` } as CSSProperties}
                >
                  <input
                    id="voice-speed-range"
                    type="range"
                    min={0}
                    max={VOICE_SPEED_STEPS.length - 1}
                    step={1}
                    value={voiceSpeedIndex}
                    onChange={(e) => setVoiceSpeed(VOICE_SPEED_STEPS[Number(e.target.value)])}
                    className="ebook-settings-speed-range"
                    aria-label="Playback speed"
                    aria-valuetext={formatVoiceSpeedLabel(voiceSpeed)}
                  />
                </div>
              </section>

              <section className={`ebook-settings-card${mode === 'read' ? ' is-active' : ' is-inactive'}`}>
                <h4 className="ebook-settings-card-title">Tap to Read</h4>
                <div className="ebook-settings-row">
                  <label className="ebook-settings-item-label" htmlFor="toggle-read-marker">
                    <SquareDashed className="ebook-settings-item-icon" strokeWidth={2} />
                    <span>Tap marker</span>
                  </label>
                  <button
                    id="toggle-read-marker"
                    type="button"
                    role="switch"
                    aria-checked={showReadHighlights}
                    disabled={mode !== 'read'}
                    onClick={() => setShowReadHighlights(!showReadHighlights)}
                    className={`ebook-settings-toggle ${showReadHighlights ? 'ebook-settings-toggle-on' : ''}`}
                  >
                    <span className="ebook-settings-toggle-thumb" />
                  </button>
                </div>
              </section>

              <section className={`ebook-settings-card${mode === 'shadow' ? ' is-active' : ' is-inactive'}`}>
                <h4 className="ebook-settings-card-title">Shadow Reading</h4>
                <div className="ebook-settings-card-stack">
                  <div className="ebook-settings-row">
                    <label className="ebook-settings-item-label" htmlFor="toggle-pinyin">
                      <Languages className="ebook-settings-item-icon" strokeWidth={2} />
                      <span>Pinyin</span>
                    </label>
                    <button
                      id="toggle-pinyin"
                      type="button"
                      role="switch"
                      aria-checked={showPinyin}
                      disabled={mode !== 'shadow'}
                      onClick={() => setShowPinyin(!showPinyin)}
                      className={`ebook-settings-toggle ${showPinyin ? 'ebook-settings-toggle-on' : ''}`}
                    >
                      <span className="ebook-settings-toggle-thumb" />
                    </button>
                  </div>
                  <div className="ebook-settings-row">
                    <label className="ebook-settings-item-label" htmlFor="toggle-translation">
                      <Sparkles className="ebook-settings-item-icon" strokeWidth={2} />
                      <span>Translation</span>
                    </label>
                    <button
                      id="toggle-translation"
                      type="button"
                      role="switch"
                      aria-checked={aiAssistEnabled}
                      disabled={mode !== 'shadow'}
                      onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
                      className={`ebook-settings-toggle ${aiAssistEnabled ? 'ebook-settings-toggle-on' : ''}`}
                    >
                      <span className="ebook-settings-toggle-thumb" />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="ebook-settings-footer">
              <button
                type="button"
                onClick={() => {
                  setVoiceSpeed(1.0);
                  setShowPinyin(false);
                  setAiAssistEnabled(false);
                  setShowReadHighlights(false);
                }}
                className="ebook-settings-reset"
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
