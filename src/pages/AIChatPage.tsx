import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, IconButton, Avatar, ButtonBase, Button, TextField, Grid, Tab, Tabs, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, Paper, Divider, Snackbar, Alert } from '@mui/material';
import { APP_FONT_FAMILY } from '../theme/appFont';

// 语音识别类型定义
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
import {
  Send, 
  AutoAwesome as AutoAwesomeIcon, 
  Person, 
  SmartToy as BotIcon,
  CheckCircle,
  Translate,
  Abc,
  Book,
  ArrowBack as BackIcon,
  VolumeUp,
  Search,
  Keyboard,
  Mic,
  ArrowForward,
  Close,
  Refresh,
  Timeline,
  BubbleChart,
  ErrorOutline as AlertCircle,
  History,
  Delete,
  Assessment,
  Star,
  Visibility,
  VisibilityOff,
  SlowMotionVideo,
  GTranslate,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveBackPath } from '../utils/navigateBack';
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';
import { AI_TUTOR_SURFACE } from '../components/home/hubChrome';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addHistory, deleteHistory, ChatHistoryItem } from '../store/slices/chatHistorySlice';
import { aiService } from '../services/aiService';
import PracticeReportView from '../components/ai-chat/PracticeReportView';
import { AiRequestTimeoutError } from '../utils/requestWrapper';
import { buildRubySegmentsFromText } from '../utils/pinyinRuby';
import { pickDeepDiveKeywords } from '../utils/deepDiveKeywords';
import {
  canSpendDeepDiveCredit,
  DEEP_DIVE_COST,
  DEEP_DIVE_DAILY_LIMIT,
  getDeepDiveCredits,
  refreshDeepDiveCredits,
  spendDeepDiveCredit,
  type DeepDiveCreditState,
} from '../utils/deepDiveCredits';

const ROLE_A_AVATAR = '/images/ai-chat-role-student.png';
const ROLE_B_AVATAR = '/images/ai-chat-role-classmate.png';
const AI_PARTNER_ART = '/images/ai-practice-partner.png';
import {
  AiConversationPipeline,
  type PipelineStage,
  type RunFullTurnOptions,
  type RunFullTurnResult,
  type LlmFailedInfo,
  type PlaybackFailedInfo,
} from '../services/aiConversationPipeline';

// --- Types ---
enum ScreenState {
  HOME = 'home',
  TOPIC_SELECTION = 'topic_selection',
  CONFIG = 'config',
  ROLE_SELECTION = 'role_selection',
  CHAT = 'chat',
  FEEDBACK = 'feedback',
  DEEP_LEARNING = 'deep_learning',
  HISTORY_LIST = 'history_list',
  HISTORY_DETAIL = 'history_detail'
}

interface Topic {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  badge?: string;
}

interface SpeechScoreBreakdown {
  speech: number;
  fluency: number;
  accuracy: number;
  completeness: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  pinyin?: string;
  translation?: string;
  timestamp: Date;
  score?: number;
  speechBreakdown?: SpeechScoreBreakdown;
  isVoiceInput?: boolean; // 标识是否为语音输入
  systemKind?: 'llm_fail' | 'tts_fail';
  replayText?: string;
  replayMessageId?: string;
}

interface ConversationRubyTextProps {
  text: string;
  pinyin?: string;
  showPinyin?: boolean;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
  pinyinColor?: string;
  textSize?: string;
  pinyinSize?: string;
  /** Hanzi typeface — Deep Dive / reading surfaces prefer KaiTi. */
  hanziFontFamily?: string;
  columnGap?: string | number;
  rowGap?: number;
}

const DEFAULT_HANZI_FONT = APP_FONT_FAMILY;
const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';
const PINYIN_SANS = APP_FONT_FAMILY;

/** ~半高半低，方便同时看到 ≥60 / <60 两种样式 */
function mockVoiceScore(): number {
  if (Math.random() < 0.5) {
    return Math.floor(Math.random() * 39) + 60; // 60–98
  }
  return Math.floor(Math.random() * 40) + 20; // 20–59
}

function buildSpeechBreakdown(total: number): SpeechScoreBreakdown {
  const clamp = (n: number) => Math.min(100, Math.max(5, Math.round(n)));
  const jitter = () => (Math.random() - 0.5) * 14;
  return {
    speech: clamp(total + jitter()),
    fluency: clamp(total + jitter()),
    accuracy: clamp(total + jitter()),
    completeness: clamp(total * 0.75 + jitter()),
  };
}

function ConversationRubyText({
  text,
  pinyin,
  showPinyin = true,
  align = 'left',
  textColor = 'inherit',
  pinyinColor = 'inherit',
  textSize = '1.15rem',
  pinyinSize = '0.72rem',
  hanziFontFamily = DEFAULT_HANZI_FONT,
  columnGap = '0.38em',
  rowGap = 1.25,
}: ConversationRubyTextProps) {
  const segments = React.useMemo(
    () => buildRubySegmentsFromText(text, showPinyin ? (pinyin ?? '') : ''),
    [text, pinyin, showPinyin],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap,
        rowGap,
        textAlign: align,
        width: '100%',
      }}
    >
      {segments.map((segment, index) => (
        segment.pinyin ? (
          <Box
            component="span"
            key={`${segment.text}-${index}`}
            sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', maxWidth: '100%' }}
          >
            <Box
              component="span"
              sx={{
                mb: 0.3,
                color: pinyinColor,
                fontFamily: PINYIN_SANS,
                fontSize: pinyinSize,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {segment.pinyin}
            </Box>
            <Box
              component="span"
              sx={{
                color: textColor,
                fontFamily: hanziFontFamily,
                fontSize: textSize,
                fontWeight: 600,
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
              }}
            >
              {segment.text}
            </Box>
          </Box>
        ) : (
          <Box
            component="span"
            key={`${segment.text}-${index}`}
            sx={{
              color: textColor,
              fontFamily: hanziFontFamily,
              fontSize: textSize,
              fontWeight: 600,
              lineHeight: 1.35,
              whiteSpace: 'pre-wrap',
            }}
          >
            {segment.text}
          </Box>
        )
      ))}
    </Box>
  );
}

type LlmSnackState =
  | { open: false }
  | { open: true; mode: 'timeout' }
  | { open: true; mode: 'error'; detail: string };

// --- Mock Data ---
const TOPICS: Topic[] = [
  { id: 'ordering', title: 'Coffee Shop', emoji: '☕', desc: 'Practice ordering drinks and snacks.', badge: '95% REVIEW' },
  { id: 'dating', title: 'Asking Out', emoji: '💑', desc: 'Invite a classmate to a movie.', badge: 'NEW' },
  { id: 'market', title: 'At the Market', emoji: '🍎', desc: 'Master fresh produce vocabulary.' },
  { id: 'travel', title: 'Travel Help', emoji: '✈️', desc: 'Ask for directions and book hotels.' },
  { id: 'job', title: 'Job Interview', emoji: '💼', desc: 'Prepare for professional conversations.' }
];

// Difficulty descriptions
const DIFFICULTY_DESCRIPTIONS = {
  Easy: {
    title: 'Beginner',
    features: ['Basic vocabulary & sentence patterns', 'Slower speech', 'Simple scenes', 'HSK 1–2 level'],
  },
  Medium: {
    title: 'Intermediate',
    features: ['Everyday vocabulary & expressions', 'Natural speech rate', 'Daily scenes', 'HSK 3–4 level'],
  },
  Hard: {
    title: 'Advanced',
    features: ['Complex vocabulary & grammar', 'Faster speech', 'Professional scenes', 'HSK 5–6 level'],
  },
} as const;

type DifficultyLevel = keyof typeof DIFFICULTY_DESCRIPTIONS;

// Random role generators
const RANDOM_USER_ROLES = [
  'Student', 'Customer', 'Tourist', 'Job seeker', 'Friend', 'Colleague', 'Neighbor', 'Visitor',
];

const RANDOM_AI_ROLES = [
  'Classmate', 'Barista', 'Tour guide', 'Interviewer', 'Friend', 'Colleague', 'Neighbor', 'Waiter',
];

const RANDOM_SCENE_DESCS = [
  'Order drinks at a café and practice everyday conversation.',
  'Invite a friend to a movie and practice social expressions.',
  'Shop at a market and learn shopping vocabulary.',
  'Ask for directions while traveling.',
  'Practice a job interview and workplace language.',
  'Chat with a friend about daily life.',
  'Order food at a restaurant.',
  'Ask about time and places in basic conversation.',
];

export default function AIChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  /** AI Tutor 的入口在 /AI（AI Class Studio），课内入口会带 state.from */
  const exitPath = resolveBackPath(location, { defaultPath: '/AI' });
  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const dispatch = useDispatch();
  const { histories } = useSelector((state: RootState) => state.chatHistory);
  const [screen, setScreen] = useState<ScreenState>(ScreenState.HOME);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMagicGenerating, setIsMagicGenerating] = useState(false);
  const [deepLearningSentence, setDeepLearningSentence] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ChatHistoryItem | null>(null);
  
  // Dictionary & Tools State
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictTab, setDictTab] = useState(0);
  const [showAITranslation, setShowAITranslation] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [llmSnack, setLlmSnack] = useState<LlmSnackState>({ open: false });
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  const pendingLlmRetryRef = useRef<{ text: string; isVoiceInput: boolean } | null>(null);
  const clearChatInputRef = useRef<(() => void) | null>(null);
  const speechRateRef = useRef(0.9);
  const pipelineRef = useRef<AiConversationPipeline | null>(null);
  const getPipeline = () => {
    if (!pipelineRef.current) {
      pipelineRef.current = new AiConversationPipeline();
    }
    return pipelineRef.current;
  };

  // Config Screen State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [userRole, setUserRole] = useState<string>('');
  const [aiRole, setAiRole] = useState<string>('');
  const [sceneDesc, setSceneDesc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<{ userRole?: boolean; aiRole?: boolean; sceneDesc?: boolean }>({});
  /** Which role card the learner plays in chat (A = student avatar, B = classmate). */
  const [playedRole, setPlayedRole] = useState<'A' | 'B' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = messagesScrollRef.current
    if (!box) return
    box.scrollTop = box.scrollHeight
  }, [messages, isTyping, screen]);

  const goHome = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
    setPipelineStage('idle');
    setLlmSnack({ open: false });
    pendingLlmRetryRef.current = null;
    setScreen(ScreenState.HOME);
    setSelectedTopic(null);
    setMessages([]);
    setPlayedRole(null);
  };

  const handleStartChat = (topic: Topic) => {
    setSelectedTopic(topic);
    // Initialize config values based on topic
    if (topic.id === 'free') {
      setUserRole('Li Ming');
      setAiRole('Teacher Wang');
      setSceneDesc('At a café, Li Ming wants a latte. Teacher Wang is the barista.');
    } else if (topic.id === 'ordering') {
      setUserRole('Customer');
      setAiRole('Barista');
      setSceneDesc(topic.desc);
    } else {
      setUserRole('Student');
      setAiRole('Classmate');
      setSceneDesc(topic.desc);
    }
    setScreen(ScreenState.CONFIG);
  };

  const generateRandomRole = (type: 'user' | 'ai') => {
    const roles = type === 'user' ? RANDOM_USER_ROLES : RANDOM_AI_ROLES;
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    if (type === 'user') {
      setUserRole(randomRole);
    } else {
      setAiRole(randomRole);
    }
    setIsMagicGenerating(true);
    setTimeout(() => setIsMagicGenerating(false), 800);
  };

  const generateRandomScene = () => {
    const randomScene = RANDOM_SCENE_DESCS[Math.floor(Math.random() * RANDOM_SCENE_DESCS.length)];
    setSceneDesc(randomScene);
    setIsMagicGenerating(true);
    setTimeout(() => setIsMagicGenerating(false), 800);
  };

  const speakUtterance = useCallback((text: string, messageId: string): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      setPlayingAudioId(messageId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = speechRateRef.current;
      utterance.pitch = 1;
      utterance.onend = () => {
        setPlayingAudioId(null);
        resolve(true);
      };
      utterance.onerror = (ev) => {
        setPlayingAudioId(null);
        console.warn('[TTS] utterance error', ev);
        resolve(false);
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setPlayingAudioId(null);
        console.warn('[TTS] speak threw', e);
        resolve(false);
      }
    });
  }, []);

  const runFullTurn = useCallback(
    async (
      textToSend: string,
      isVoiceInput: boolean,
      opts?: RunFullTurnOptions,
    ): Promise<RunFullTurnResult> => {
    if (!textToSend.trim()) return { ok: false };

    const skipUserMessage = opts?.skipUserMessage === true;

    // 为语音输入生成拼音和翻译（模拟）
    const generatePinyin = (text: string): string => {
      // 更完善的拼音映射
      const pinyinMap: { [key: string]: string } = {
        '你好': 'Nǐhǎo',
        '您好': 'Nínhǎo',
        '咖啡': 'kāfēi',
        '我想要一杯': 'Wǒ xiǎngyào yìbēi',
        '我想要': 'Wǒ xiǎngyào',
        '我想': 'Wǒ xiǎng',
        '想要': 'xiǎngyào',
        '想喝': 'xiǎng hē',
        '点': 'diǎn',
        '一杯': 'yìbēi',
        '一个': 'yígè',
        '热': 'rè',
        '拿铁': 'nátiě',
        '美式': 'měishì',
        '卡布奇诺': 'kǎbùqínuò',
        '谢谢': 'Xièxiè',
        '请问': 'Qǐngwèn',
        '多少钱': 'duōshaoqián',
        '可以': 'kěyǐ',
        '不要': 'búyào',
        '要': 'yào',
        '有': 'yǒu',
        '没有': 'méiyǒu',
        '是': 'shì',
        '不是': 'búshì',
        '好的': 'hǎode',
        '好': 'hǎo',
        '不好': 'bùhǎo',
        '坐': 'zuò',
        '这里': 'zhèlǐ',
        '吗': 'ma',
        '什么': 'shénme',
        '喝': 'hē',
        '今天': 'jīntiān',
        '欢迎': 'huānyíng',
      };
      
      // 尝试匹配最长的短语
      let result = '';
      let remainingText = text;
      
      while (remainingText.length > 0) {
        let matched = false;
        // 从长到短尝试匹配
        for (let len = Math.min(remainingText.length, 10); len > 0; len--) {
          const substring = remainingText.substring(0, len);
          if (pinyinMap[substring]) {
            result += (result ? ' ' : '') + pinyinMap[substring];
            remainingText = remainingText.substring(len);
            matched = true;
            break;
          }
        }
        if (!matched) {
          // 如果没有匹配，跳过这个字符
          remainingText = remainingText.substring(1);
        }
      }
      
      return result || text;
    };
    
    const generateTranslation = (text: string): string => {
      // 更完善的翻译映射
      const translationMap: { [key: string]: string } = {
        '你好': 'Hello',
        '您好': 'Hello (formal)',
        '咖啡': 'coffee',
        '我想': 'I want',
        '我想要': 'I would like',
        '想要': 'want',
        '一杯': 'one cup of',
        '拿铁': 'latte',
        '美式': 'Americano',
        '卡布奇诺': 'cappuccino',
        '谢谢': 'Thank you',
        '请问': 'Excuse me',
        '多少钱': 'How much',
        '可以': 'can / may',
        '不要': "don't want",
        '要': 'want',
        '有': 'have',
        '没有': "don't have",
        '是': 'is / yes',
        '不是': "is not / no",
        '好的': 'Okay',
        '好': 'good',
        '不好': 'not good'
      };
      
      // 尝试匹配最长的短语
      let result = '';
      let remainingText = text;
      
      while (remainingText.length > 0) {
        let matched = false;
        // 从长到短尝试匹配
        for (let len = Math.min(remainingText.length, 10); len > 0; len--) {
          const substring = remainingText.substring(0, len);
          if (translationMap[substring]) {
            result += (result ? ' ' : '') + translationMap[substring];
            remainingText = remainingText.substring(len);
            matched = true;
            break;
          }
        }
        if (!matched) {
          // 如果没有匹配，保留原文
          result += remainingText[0];
          remainingText = remainingText.substring(1);
        }
      }
      
      return result || text;
    };

    const voiceScore = isVoiceInput ? mockVoiceScore() : undefined;
    const userMsg: Message = { 
      id: Date.now().toString(),
      text: textToSend, 
      sender: 'user',
      timestamp: new Date(),
      isVoiceInput: isVoiceInput,
      // 只有语音输入才设置评分，但所有消息都有拼音和翻译
      score: voiceScore,
      speechBreakdown: voiceScore != null ? buildSpeechBreakdown(voiceScore) : undefined,
      pinyin: generatePinyin(textToSend),
      translation: generateTranslation(textToSend)
    };

    if (!skipUserMessage) {
      setMessages((prev) => [...prev, userMsg]);
      clearChatInputRef.current?.();
      setShowAITranslation(false);
    }
    setIsTyping(true);

    const thinkMs = skipUserMessage ? 300 : 1200;
    await new Promise<void>((r) => setTimeout(r, thinkMs));
    try {
      const response = await aiService.chat(textToSend);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        pinyin: "Zhè shì nǐ de kāfēi, qǐng mànyòng.",
        translation: "Here is your coffee, please enjoy."
      };
      setMessages((prev) => [...prev, aiMsg]);
      return { ok: true, id: aiMsg.id, text: aiMsg.text };
    } catch (e) {
      const isTimeout = e instanceof AiRequestTimeoutError;
      return { ok: false, error: e, isTimeout };
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleLlmFailed = useCallback((info: LlmFailedInfo) => {
    pendingLlmRetryRef.current = { text: info.text, isVoiceInput: info.isVoiceInput };
    if (info.isTimeout) {
      setLlmSnack({ open: true, mode: 'timeout' });
    } else {
      const detail =
        info.error instanceof Error
          ? info.error.message
          : typeof info.error === 'string'
            ? info.error
            : 'Something went wrong. Check your network and try again.';
      setLlmSnack({ open: true, mode: 'error', detail });
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-llm-${Date.now()}`,
        sender: 'system',
        systemKind: 'llm_fail',
        text: info.isTimeout ? 'The reply timed out.' : 'The reply could not load.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handlePlaybackFailed = useCallback((info: PlaybackFailedInfo) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-tts-${Date.now()}`,
        sender: 'system',
        systemKind: 'tts_fail',
        text: 'Playback failed. You can still read the reply.',
        timestamp: new Date(),
        replayText: info.text,
        replayMessageId: info.messageId,
      },
    ]);
  }, []);

  useEffect(() => {
    getPipeline().setHandlers({
      runFullTurn,
      speakUtterance,
      onStage: setPipelineStage,
      onLlmFailed: handleLlmFailed,
      onPlaybackFailed: handlePlaybackFailed,
    });
  }, [runFullTurn, speakUtterance, handleLlmFailed, handlePlaybackFailed]);

  const handleSendLine = (line: string) => {
    const t = line.trim();
    if (!t) return;
    getPipeline().enqueueKeyboardTurn(t);
  };

  const headerCtrlSx = {
    bgcolor: '#FFFFFF',
    border: '1px solid #E0E0DF',
    color: '#2D3436',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '&:active': { transform: 'scale(0.95)' },
  } as const

  const PracticeHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <Box
      sx={{
        height: p(160),
        flexShrink: 0,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E2E3',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: `${p(60)}px`,
      }}
    >
      <ButtonBase
        onClick={onBack}
        aria-label="Back"
        sx={{
          ...headerCtrlSx,
          position: 'absolute',
          left: p(60),
          width: p(80),
          height: p(80),
          borderRadius: `${p(100)}px`,
        }}
      >
        <BackIcon sx={{ fontSize: p(40), color: '#2D3436' }} />
      </ButtonBase>
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontWeight: 700,
          fontSize: p(40),
          lineHeight: 1.6,
          color: '#2D3436',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>
      <ButtonBase
        onClick={() => setScreen(ScreenState.HISTORY_LIST)}
        aria-label="History"
        sx={{
          ...headerCtrlSx,
          position: 'absolute',
          right: p(45),
          width: p(84),
          height: p(84),
          borderRadius: `${p(42)}px`,
        }}
      >
        <History sx={{ fontSize: p(46), color: '#2D3436' }} />
      </ButtonBase>
    </Box>
  )

  const FloatingBackButton = ({ variant = 'light' }: { variant?: 'light' | 'dark' } = {}) => {
    const onDark = variant === 'dark';
    const btn = p(80);
    const icon = p(40);
    const inset = p(60);
    return (
    <ButtonBase 
      onClick={() => {
        if (screen === ScreenState.HOME) navigate(exitPath);
        else if (screen === ScreenState.DEEP_LEARNING) setScreen(ScreenState.CHAT);
        else if (screen === ScreenState.HISTORY_LIST) setScreen(ScreenState.TOPIC_SELECTION);
        else if (screen === ScreenState.CONFIG) setScreen(ScreenState.TOPIC_SELECTION);
        else if (screen === ScreenState.ROLE_SELECTION) setScreen(ScreenState.CONFIG);
        else if (screen === ScreenState.CHAT) setScreen(ScreenState.ROLE_SELECTION);
        else setScreen(ScreenState.HOME);
      }}
      aria-label="Back"
      sx={{
        position: 'absolute',
        top: inset,
        left: inset,
        zIndex: 200,
        width: btn,
        height: btn,
        minWidth: btn,
        minHeight: btn,
        borderRadius: '50%',
        bgcolor: onDark ? 'rgba(255,255,255,0.14)' : '#FFFFFF',
        backdropFilter: onDark ? 'blur(16px)' : undefined,
        border: onDark ? '1px solid rgba(255,255,255,0.32)' : '1px solid #E0E0DF',
        color: onDark ? '#FFFFFF' : '#2D3436',
        boxShadow: onDark ? '0 8px 20px rgba(0,0,0,0.22)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      <BackIcon sx={{ fontSize: icon }} />
    </ButtonBase>
    );
  };

  /**
   * 首次进入页 —— Figma「首次进入页_全屏弥散」，画布 1920×1200。
   * 位置用画布百分比、尺寸用 figmaPx：实际内容区约 1968×1168，不等于画布。
   */
  const HomeScreen = () => {
    const px = p;
    const diffuseBlur = `blur(${px(125)}px)`;

    return (
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          bgcolor: '#F8F9F8',
          fontFamily: FIGMA_FONT,
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #F5FDED 0%, #FAFAFA 100%)' }} />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '1.92%',
            bottom: 0,
            background: 'linear-gradient(180deg, #EDF5FD 0%, #FAFAFA 100%)',
          }}
        />

        {[
          {
            width: '53.85%',
            height: '31.42%',
            left: '-22.71%',
            top: '53.75%',
            background:
              'linear-gradient(122.91deg, rgba(254,252,182,0.47) 33.45%, rgba(227,241,251,0) 91.58%)',
            filter: diffuseBlur,
          },
          {
            width: '95.30%',
            height: '33.63%',
            left: '51.67%',
            top: '69.48%',
            background:
              'linear-gradient(122.91deg, rgba(254,252,182,0.3995) 33.45%, rgba(227,241,251,0) 91.58%)',
            filter: diffuseBlur,
            transform: 'rotate(-8.29deg)',
          },
          {
            width: '81.39%',
            height: '31.44%',
            left: '39.17%',
            top: '-10.05%',
            background: 'linear-gradient(200.45deg, #E9FFCD 40.04%, #F1FFEB 86.42%)',
            filter: diffuseBlur,
          },
          {
            width: '78.25%',
            height: '41.33%',
            left: '-7.19%',
            top: '76.31%',
            background:
              'linear-gradient(180deg, rgba(166,255,170,0) 0%, rgba(138,200,141,0.23) 51.92%)',
            filter: `blur(${px(27)}px)`,
            transform: 'rotate(5.79deg)',
          },
        ].map((blob, i) => (
          <Box key={i} sx={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...blob }} />
        ))}

        <FloatingBackButton />

        <Box
          sx={{
            position: 'absolute',
            top: px(32),
            right: px(40),
            minHeight: 44,
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            gap: `${px(12)}px`,
            bgcolor: 'rgba(255,255,255,0.72)',
            px: `${Math.max(16, px(28))}px`,
            py: `${Math.max(10, px(14))}px`,
            borderRadius: '999px',
            border: '1px solid rgba(63,178,102,0.24)',
            boxShadow: `0 ${px(8)}px ${px(24)}px rgba(0,84,53,0.08)`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              flexShrink: 0,
              borderRadius: '50%',
              bgcolor: '#3FB266',
              boxShadow: '0 0 0 4px rgba(63,178,102,0.15)',
            }}
          />
          <Typography
            sx={{
              fontSize: Math.max(14, px(22)),
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#005435',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            C-Lingo AI ready
          </Typography>
        </Box>

        {/* AI 形象：用整圆合成图（形象+绿底+描边），不再叠椭圆/旋转切图 */}
        <Box
          sx={{
            position: 'absolute',
            left: '15%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: px(485),
            height: px(485),
          }}
        >
          <Box
            component="img"
            src={AI_PARTNER_ART}
            alt="C-Lingo AI"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: `drop-shadow(0 0 ${px(24)}px rgba(63,178,102,0.25))`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </Box>

        {/* 文案 + 入口按钮：Figma Group（画布 x 960，整体垂直居中）。
            用流式排布而非绝对定位——译文换行时只会把后续元素推下去，不会压到分隔线上。 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44.43%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: px(40),
              lineHeight: `${px(50)}px`,
              color: '#005435',
            }}
          >
            Speak naturally
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: px(80),
              lineHeight: `${px(100)}px`,
              color: '#005435',
            }}
          >
            AI Practice Partner
          </Typography>
          <Typography
            sx={{
              width: '100%',
              fontWeight: 400,
              fontSize: px(40),
              lineHeight: `${px(50)}px`,
              color: '#27664B',
            }}
          >
            Embark on every exploration with your exclusive partner
          </Typography>
          <Box
            sx={{
              mt: `${px(21)}px`,
              ml: `${px(3)}px`,
              width: '91.9%',
              height: px(4),
              flexShrink: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #8AC88D 0%, #3FB266 55%, #005435 100%)',
            }}
          />
          <Typography
            sx={{
              mt: `${px(18)}px`,
              width: '100%',
              fontWeight: 400,
              fontSize: px(24),
              lineHeight: `${px(30)}px`,
              color: '#5A806B',
            }}
          >
            Real-time error correction, authentic expressions, speak with confidence
          </Typography>

          <ButtonBase
            onClick={() => setScreen(ScreenState.TOPIC_SELECTION)}
            sx={{
              position: 'relative',
              mt: `${px(65)}px`,
              width: px(594),
              height: px(118),
              flexShrink: 0,
              borderRadius: '999px',
              background: AI_TUTOR_SURFACE,
              boxShadow: `0 ${px(16)}px ${px(36)}px rgba(63,178,102,0.28)`,
              transition: 'transform 0.18s ease',
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            <Typography
              sx={{
                position: 'absolute',
                left: px(89),
                top: px(34),
                fontWeight: 700,
                fontSize: px(38),
                lineHeight: `${px(50)}px`,
                color: '#FFFFFF',
              }}
            >
              Start Conversation
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                left: px(494),
                top: px(19),
                width: px(79),
                height: px(79),
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowForward sx={{ fontSize: px(38), color: '#FFFFFF' }} />
            </Box>
          </ButtonBase>
        </Box>
      </Box>
    );
  };

  const TopicSelectionScreen = () => {
    /** Figma Ai导师1：1920×1200。高度用剩余空间吃满，避免 2000×1200 按宽缩放后溢出 */
    const scenarioLabels: Record<string, string> = {
      ordering: 'Coffee shop',
      dating: 'Asking Out',
      market: 'At the Market',
      travel: 'Travel Help',
      job: 'Job Interview',
    };
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F8F9F8',
          fontFamily: FIGMA_FONT,
        }}
      >
        <PracticeHeader title="Practice Mode" onBack={() => setScreen(ScreenState.HOME)} />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: `${p(40)}px`,
            px: `${p(60)}px`,
            pt: `${p(40)}px`,
            pb: `${p(40)}px`,
          }}
        >
          <ButtonBase
            onClick={() => {
              setSelectedTopic({ id: 'free', title: 'Free Practice', emoji: '🎙️', desc: 'DIY free conversation mode' });
              setUserRole('Li Ming');
              setAiRole('Teacher Wang');
              setSceneDesc('At a café, Li Ming wants a latte. Teacher Wang is the barista.');
              setScreen(ScreenState.CONFIG);
            }}
            sx={{
              width: p(550),
              flexShrink: 0,
              height: '100%',
              p: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(60)}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              pt: `${p(60)}px`,
              px: `${p(70)}px`,
              pb: `${p(74)}px`,
              boxSizing: 'border-box',
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                lineHeight: 1.6,
                color: '#FF6B35',
                textAlign: 'center',
                mb: `${p(60)}px`,
                flexShrink: 0,
              }}
            >
              Mode 1: Free Chat
            </Typography>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                bgcolor: '#FFF7EC',
                borderRadius: `${p(40)}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(70)}px`,
              }}
            >
              <Box
                sx={{
                  width: p(172),
                  height: p(172),
                  bgcolor: '#FF6B35',
                  borderRadius: `${p(24)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: p(80),
                  lineHeight: 1,
                }}
              >
                💬
              </Box>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(40),
                  lineHeight: `${p(50)}px`,
                  color: '#2D3436',
                  textAlign: 'center',
                }}
              >
                Free practice
              </Typography>
            </Box>
          </ButtonBase>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(60)}px`,
              display: 'flex',
              flexDirection: 'column',
              pt: `${p(60)}px`,
              px: `${p(130)}px`,
              pb: `${p(70)}px`,
              boxSizing: 'border-box',
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                lineHeight: 1.6,
                color: '#3FB266',
                textAlign: 'center',
                mb: `${p(84)}px`,
                flexShrink: 0,
              }}
            >
              Mode 2: Scenarios
            </Typography>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(3, minmax(0, ${p(280)}px))`,
                gridTemplateRows: `repeat(2, minmax(0, ${p(280)}px))`,
                columnGap: `${p(55)}px`,
                rowGap: `${p(50)}px`,
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              {TOPICS.map((topic) => (
                <ButtonBase
                  key={topic.id}
                  onClick={() => handleStartChat(topic)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#F3F4F6',
                    borderRadius: `${p(48)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${p(26)}px`,
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  <Box
                    sx={{
                      width: p(80),
                      height: p(80),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: p(72),
                      lineHeight: 1,
                    }}
                  >
                    {topic.emoji}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(32),
                      lineHeight: `${p(40)}px`,
                      color: '#2D3436',
                      textAlign: 'center',
                    }}
                  >
                    {scenarioLabels[topic.id] || topic.title}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const ConfigScreen = () => {
    const isFreeMode = selectedTopic?.id === 'free';
    const difficultyInfo = DIFFICULTY_DESCRIPTIONS[difficulty];
    const canStart = Boolean(userRole && aiRole && sceneDesc);
    const fieldValueSx = {
      fontFamily: FIGMA_FONT,
      fontSize: p(32),
      fontWeight: 700,
      lineHeight: 1.6,
      color: '#2D3436',
    } as const

    const configRow = (
      icon: React.ReactNode,
      label: string,
      body: React.ReactNode,
      onShuffle: (e: React.MouseEvent) => void,
    ) => (
      <Box sx={{ display: 'flex', gap: `${p(20)}px`, alignItems: 'center' }}>
        <Box
          sx={{
            width: p(80),
            height: p(80),
            borderRadius: `${p(18)}px`,
            bgcolor: '#FFF7EC',
            color: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${p(12)}px` }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), fontWeight: 400, lineHeight: 1.6, color: '#636E72', mb: `${p(4)}px` }}>
              {label}
            </Typography>
            {body}
          </Box>
          <ButtonBase
            onClick={onShuffle}
            aria-label={`Shuffle ${label}`}
            sx={{
              width: p(56),
              height: p(56),
              borderRadius: `${p(16)}px`,
              color: '#FF6B35',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <Star sx={{ fontSize: p(32) }} />
          </ButtonBase>
        </Box>
      </Box>
    )

    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F8F9F8',
          fontFamily: FIGMA_FONT,
        }}
      >
        <PracticeHeader
          title={isFreeMode ? 'Free mode' : 'Scenario mode'}
          onBack={() => setScreen(ScreenState.TOPIC_SELECTION)}
        />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            gap: `${p(40)}px`,
            px: `${p(60)}px`,
            py: `${p(40)}px`,
          }}
        >
          <Box
            sx={{
              width: '34%',
              flexShrink: 0,
              minWidth: 0,
              height: '100%',
              bgcolor: '#3FB266',
              color: '#FFFFFF',
              borderRadius: `${p(40)}px`,
              p: `${p(40)}px`,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, mb: `${p(24)}px` }}>
              Scene setup
            </Typography>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'flex',
                gap: `${p(8)}px`,
                p: `${p(6)}px`,
                borderRadius: `${p(18)}px`,
                bgcolor: 'rgba(0,0,0,0.12)',
                mb: `${p(24)}px`,
              }}
            >
              {(['Easy', 'Medium', 'Hard'] as const).map((lv) => (
                <ButtonBase
                  key={lv}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDifficulty(lv)
                  }}
                  sx={{
                    flexGrow: 1,
                    minHeight: p(56),
                    borderRadius: `${p(14)}px`,
                    fontFamily: FIGMA_FONT,
                    fontSize: p(24),
                    fontWeight: 700,
                    color: lv === difficulty ? '#3FB266' : '#FFFFFF',
                    bgcolor: lv === difficulty ? '#FFFFFF' : 'transparent',
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  {lv}
                </ButtonBase>
              ))}
            </Box>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(32), fontWeight: 700, lineHeight: 1.6, mb: `${p(16)}px` }}>
              {difficultyInfo.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(12)}px` }}>
              {difficultyInfo.features.map((feature, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
                  <Box sx={{ width: p(8), height: p(8), borderRadius: '50%', bgcolor: '#FFFFFF', flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), fontWeight: 400, lineHeight: 1.6 }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(40)}px`,
              px: `${p(40)}px`,
              py: `${p(36)}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${p(28)}px`,
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            {configRow(
              <Person sx={{ fontSize: p(40) }} />,
              'Role A',
              isEditing.userRole ? (
                <TextField
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  onBlur={() => setIsEditing({ ...isEditing, userRole: false })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing({ ...isEditing, userRole: false })
                  }}
                  variant="standard"
                  autoFocus
                  InputProps={{ disableUnderline: true, sx: fieldValueSx }}
                  sx={{ width: '100%' }}
                />
              ) : (
                <Typography
                  onClick={() => isFreeMode && setIsEditing({ ...isEditing, userRole: true })}
                  sx={{ ...fieldValueSx, cursor: isFreeMode ? 'text' : 'default' }}
                >
                  {userRole}
                </Typography>
              ),
              (e) => {
                e.stopPropagation()
                generateRandomRole('user')
              },
            )}
            {configRow(
              <BotIcon sx={{ fontSize: p(40) }} />,
              'Role B',
              isEditing.aiRole ? (
                <TextField
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value)}
                  onBlur={() => setIsEditing({ ...isEditing, aiRole: false })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing({ ...isEditing, aiRole: false })
                  }}
                  variant="standard"
                  autoFocus
                  InputProps={{ disableUnderline: true, sx: fieldValueSx }}
                  sx={{ width: '100%' }}
                />
              ) : (
                <Typography
                  onClick={() => isFreeMode && setIsEditing({ ...isEditing, aiRole: true })}
                  sx={{ ...fieldValueSx, cursor: isFreeMode ? 'text' : 'default' }}
                >
                  {aiRole}
                </Typography>
              ),
              (e) => {
                e.stopPropagation()
                generateRandomRole('ai')
              },
            )}
            {configRow(
              <Book sx={{ fontSize: p(40) }} />,
              'Scene',
              isEditing.sceneDesc ? (
                <TextField
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  onBlur={() => setIsEditing({ ...isEditing, sceneDesc: false })}
                  variant="standard"
                  autoFocus
                  multiline
                  maxRows={2}
                  InputProps={{ disableUnderline: true, sx: fieldValueSx }}
                  sx={{ width: '100%' }}
                />
              ) : (
                <Typography
                  onClick={() => isFreeMode && setIsEditing({ ...isEditing, sceneDesc: true })}
                  sx={{ ...fieldValueSx, cursor: isFreeMode ? 'text' : 'default' }}
                >
                  {sceneDesc}
                </Typography>
              ),
              (e) => {
                e.stopPropagation()
                generateRandomScene()
              },
            )}
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (canStart) setScreen(ScreenState.ROLE_SELECTION)
              }}
              disabled={!canStart}
              sx={{
                mt: `${p(8)}px`,
                height: p(76),
                borderRadius: `${p(38)}px`,
                background: canStart ? 'linear-gradient(135deg, #00B4A0 0%, #26D6C3 100%)' : '#D5D5D5',
                color: '#FFFFFF',
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                cursor: canStart ? 'pointer' : 'not-allowed',
                '&:active': { transform: canStart ? 'scale(0.98)' : 'none' },
              }}
            >
              Start practice
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    );
  };

  const RoleSelectionScreen = () => {
    const [isStarting, setIsStarting] = useState(false);
    const selectedRole = playedRole;

    const handleConfirm = () => {
      if (!selectedRole) return;
      setIsStarting(true);
      setTimeout(() => {
        // AI 先说话 - 初始化对话
        const aiGreeting: Message = {
          id: 'ai-init',
          text: '你好！欢迎来到我们的咖啡店。今天想喝点什么？',
          sender: 'ai',
          timestamp: new Date(),
          pinyin: 'Nǐhǎo! Huānyíng láidào wǒmen de kāfēidiàn. Jīntiān xiǎng hē diǎn shénme?',
          translation: 'Hello! Welcome to our coffee shop. What would you like to drink today?'
        };
        setMessages([aiGreeting]);
        setScreen(ScreenState.CHAT);
        getPipeline().enqueueAudioOnly(aiGreeting.text, aiGreeting.id);
      }, 1500);
    };

    if (isStarting) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#080E21',
            color: '#FFFFFF',
            fontFamily: FIGMA_FONT,
          }}
        >
          <Box
            sx={{
              width: p(80),
              height: p(80),
              border: '6px solid rgba(255,255,255,0.12)',
              borderTopColor: '#3FB266',
              borderRadius: '50%',
              '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
              animation: 'spin 1s linear infinite',
            }}
          />
          <Typography sx={{ mt: `${p(32)}px`, fontSize: p(32), fontWeight: 700, fontFamily: FIGMA_FONT }}>
            AI tutor is getting ready...
          </Typography>
        </Box>
      )
    }

    const roleCard = (role: 'A' | 'B', name: string, caption: string, src: string, accent: string) => {
      const on = selectedRole === role
      return (
        <ButtonBase
          onClick={() => setPlayedRole(role)}
          sx={{
            flex: 1,
            minWidth: 0,
            height: p(380),
            maxHeight: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            borderRadius: `${p(48)}px`,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            border: on ? `4px solid ${accent}` : '4px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxSizing: 'border-box',
            px: `${p(70)}px`,
            gap: `${p(60)}px`,
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: p(162),
              height: p(60),
              bgcolor: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(28), fontWeight: 400, lineHeight: 1.6, color: '#FFFFFF' }}>
              Role {role}
            </Typography>
          </Box>
          <Box
            component="img"
            src={src}
            alt={name}
            sx={{
              width: p(200),
              height: p(200),
              borderRadius: `${p(40)}px`,
              border: '2px solid #FFFFFF',
              objectFit: 'cover',
              flexShrink: 0,
              bgcolor: 'rgba(255,255,255,0.08)',
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${p(8)}px` }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(48),
                lineHeight: 1.6,
                color: '#FFFFFF',
                width: '100%',
              }}
            >
              {name}
            </Typography>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.6)',
                width: '100%',
              }}
            >
              {caption}
            </Typography>
          </Box>
        </ButtonBase>
      )
    }

    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          bgcolor: '#080E21',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: FIGMA_FONT,
          position: 'relative',
        }}
      >
        <ButtonBase
          onClick={() => setScreen(ScreenState.CONFIG)}
          aria-label="Back"
          sx={{
            position: 'absolute',
            left: p(60),
            top: p(40),
            zIndex: 2,
            width: p(80),
            height: p(80),
            borderRadius: `${p(100)}px`,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          <BackIcon sx={{ fontSize: p(40), color: '#FFFFFF' }} />
        </ButtonBase>

        <Box
          sx={{
            flexShrink: 0,
            pt: `${p(160)}px`,
            px: `${p(140)}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${p(12)}px`,
          }}
        >
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(56),
              lineHeight: 1.6,
              color: '#FFFFFF',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Choose Your Role
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(32),
              lineHeight: 1.6,
              color: '#E0E0DF',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Select a role to start chatting
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${p(80)}px`,
            px: `${p(140)}px`,
          }}
        >
          {roleCard(
            'A',
            userRole || 'Customer',
            /customer/i.test(userRole) ? 'Wants to order coffee' : 'Your character',
            ROLE_A_AVATAR,
            '#00B4A0',
          )}
          {roleCard(
            'B',
            aiRole || 'Barista',
            /barista/i.test(aiRole) ? 'Friendly barista' : 'AI partner',
            ROLE_B_AVATAR,
            '#FF6B35',
          )}
        </Box>

        <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', pb: `${p(80)}px`, pt: `${p(20)}px` }}>
          <ButtonBase
            onClick={handleConfirm}
            disabled={!selectedRole}
            sx={{
              width: p(570),
              height: p(100),
              borderRadius: `${p(127)}px`,
              background: 'linear-gradient(96.12deg, #4DAB6D 0%, #3FB266 56.18%, #AAD9AC 103.35%)',
              opacity: selectedRole ? 1 : 0.3,
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(32),
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(12)}px`,
              cursor: selectedRole ? 'pointer' : 'not-allowed',
              '&:active': { transform: selectedRole ? 'scale(0.97)' : 'none' },
            }}
          >
            Start Conversation
            <ArrowForward sx={{ fontSize: p(40), color: '#FFFFFF' }} />
          </ButtonBase>
        </Box>
      </Box>
    );
  };

  const ChatScreen = () => {
    const [maskedIds, setMaskedIds] = useState<string[]>([]);
    const [showPinyin, setShowPinyin] = useState(true);
    const [slowSpeech, setSlowSpeech] = useState(false);
    const [showPipeline, setShowPipeline] = useState(false);
    const [inputText, setInputText] = useState('');
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
    const [activeDeepLearning, setActiveDeepLearning] = useState<Message | null>(null);
    const [deepDiveLoading, setDeepDiveLoading] = useState(false);
    const deepDiveLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [deepDiveCredits, setDeepDiveCredits] = useState<DeepDiveCreditState>(() => getDeepDiveCredits());
    const [deepDiveCreditToast, setDeepDiveCreditToast] = useState(false);
    const [creditChipPulse, setCreditChipPulse] = useState(false);
    const [deepDiveOpenSections, setDeepDiveOpenSections] = useState({
      when: true,
      grammar: false,
      culture: false,
    });
    const [showTranslationIds, setShowTranslationIds] = useState<string[]>([]); // Track which messages show translation
    const [expandedSpeechIds, setExpandedSpeechIds] = useState<string[]>([]);
    
    // 语音录音相关状态
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState<string>(''); // 录音识别的文本（用于显示）
    const [countdown, setCountdown] = useState<number>(0); // 倒计时（秒）
    const recognition = useRef<SpeechRecognition | null>(null);
    const recordedTextRef = useRef<string>(''); // 用于在 onend 中访问最新的文本
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null); // 倒计时定时器
    /** 与 recognition 实际是否在跑同步；避免 stopRecording 读到过期的 isRecording 闭包（快速点按尤其明显） */
    const isRecordingActiveRef = useRef(false);
    const talkHoldStartedAtRef = useRef(0);
    const [voiceUiError, setVoiceUiError] = useState<string | null>(null);

    useEffect(() => {
      clearChatInputRef.current = () => setInputText('');
      return () => {
        clearChatInputRef.current = null;
      };
    }, []);

    useEffect(() => {
      speechRateRef.current = slowSpeech ? 0.65 : 0.9;
    }, [slowSpeech]);

    useEffect(() => {
      const refreshCredits = () => setDeepDiveCredits(getDeepDiveCredits());
      refreshCredits();
      window.addEventListener('online', refreshCredits);
      window.addEventListener('focus', refreshCredits);
      return () => {
        window.removeEventListener('online', refreshCredits);
        window.removeEventListener('focus', refreshCredits);
        if (deepDiveLoadTimerRef.current) window.clearTimeout(deepDiveLoadTimerRef.current);
      };
    }, []);

    const handleSend = () => {
      const t = inputText.trim();
      if (!t) return;
      getPipeline().enqueueKeyboardTurn(t);
    };

    const openDeepDive = (msg: Message) => {
      if (activeDeepLearning?.id === msg.id) return;
      if (!canSpendDeepDiveCredit(DEEP_DIVE_COST)) {
        setDeepDiveCredits(getDeepDiveCredits());
        setDeepDiveCreditToast(true);
        return;
      }
      const next = spendDeepDiveCredit(DEEP_DIVE_COST);
      if (!next) {
        setDeepDiveCreditToast(true);
        return;
      }
      setDeepDiveCredits(next);
      setCreditChipPulse(true);
      window.setTimeout(() => setCreditChipPulse(false), 420);
      setDeepDiveOpenSections({ when: true, grammar: false, culture: false });
      setDeepDiveLoading(true);
      setActiveDeepLearning(msg);
      if (deepDiveLoadTimerRef.current) window.clearTimeout(deepDiveLoadTimerRef.current);
      deepDiveLoadTimerRef.current = window.setTimeout(() => setDeepDiveLoading(false), 720);
    };

    // 初始化语音识别
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = true; // 改为连续模式以支持60秒录音
          recognitionInstance.interimResults = true; // 启用临时结果
          recognitionInstance.lang = 'zh-CN';
          
          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            
            const fullText = finalTranscript + interimTranscript;
            recordedTextRef.current = fullText;
            setRecordedText(fullText);
          };
          
          recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            const voiceErrorMessages: Record<string, string> = {
              'not-allowed': 'Microphone permission is off. Allow C-LingoAIOS to use the mic in system settings.',
              'audio-capture': 'Cannot access the microphone. Check if another app is using it.',
              network: 'Speech recognition failed to connect. Check your network, or switch to keyboard input.',
              'no-speech': 'Didn’t catch that. Move closer to the mic and try again.',
              aborted: 'Recording cancelled.',
            };
            setVoiceUiError(voiceErrorMessages[event.error] || 'Speech recognition is unavailable right now. Please try again.');
            isRecordingActiveRef.current = false;
            setIsRecording(false);
            recordedTextRef.current = '';
            setRecordedText('');
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setCountdown(0);
          };
          
          recognitionInstance.onend = () => {
            isRecordingActiveRef.current = false;
            setIsRecording(false);
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setCountdown(0);
            // 松开时立即发送识别结果
            const text = recordedTextRef.current.trim();
            if (text) {
              getPipeline().enqueueVoiceAsrFinal(text);
              recordedTextRef.current = '';
              setRecordedText('');
            }
          };
          
          recognition.current = recognitionInstance;
        } else {
          console.warn('Speech Recognition API not supported in this browser');
        }
      }
      
      // 清理函数
      return () => {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      };
    }, []);
    
    // 开始录音
    const startRecording = () => {
      if (pipelineStage !== 'idle') return;
      if (!recognition.current) {
        setVoiceUiError(
          'Voice uses the Web Speech API. Cursor’s embedded browser often does not support it. Open this app in Chrome or Edge with the microphone allowed, or switch to keyboard input.'
        );
        return;
      }
      if (isRecordingActiveRef.current) return;

      isRecordingActiveRef.current = true;
      recordedTextRef.current = '';
      setRecordedText('');
      setIsRecording(true);
      setCountdown(60); // 设置60秒倒计时

      // 启动倒计时
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // 倒计时结束，自动停止录音
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      try {
        recognition.current.start();
      } catch (e) {
        console.error('Failed to start recording:', e);
        isRecordingActiveRef.current = false;
        setIsRecording(false);
        setCountdown(0);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setVoiceUiError('Could not start the microphone. Try again, or switch to keyboard input.');
      }
    };

    // 停止录音
    const stopRecording = () => {
      if (!recognition.current || !isRecordingActiveRef.current) return;
      try {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        recognition.current.stop();
        // onend 回调会自动处理发送
      } catch (e) {
        console.error('Failed to stop recording:', e);
        isRecordingActiveRef.current = false;
        setIsRecording(false);
        setCountdown(0);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    };
    
    
    // TTS播放函数
    const playTTS = (text: string, messageId: string) => {
      if (playingAudioId === messageId) {
        window.speechSynthesis.cancel();
        setPlayingAudioId(null);
      } else {
        getPipeline().enqueuePlayback(text, messageId);
      }
    };
    
    // 检测是否包含非中文字符（用户母语）
    const hasNonChineseContent = (text: string): boolean => {
      // 匹配英文字母、数字和常见标点
      const nonChineseRegex = /[a-zA-Z]+/;
      return nonChineseRegex.test(text);
    };
    
    const pipelineBusy = pipelineStage !== 'idle';
    const actionChipSx = {
      boxSizing: 'border-box' as const,
      height: p(60),
      px: `${p(20)}px`,
      borderRadius: `${p(12)}px`,
      bgcolor: '#F3F4F6',
      border: '1px solid #E0E0DF',
      color: '#636E72',
      display: 'flex',
      alignItems: 'center',
      gap: `${p(8)}px`,
      flexShrink: 0,
      '&:active': { transform: 'scale(0.97)' },
    };
    const actionChipLabelSx = {
      fontFamily: FIGMA_FONT,
      fontWeight: 400,
      fontSize: p(24),
      lineHeight: 1.6,
      color: 'inherit',
    };
    const WaveBars = ({ color = '#636E72' }: { color?: string }) => (
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${p(4)}px`, height: p(22), width: p(24) }} aria-hidden>
        {[22, 14, 8, 16].map((h, i) => (
          <Box key={i} sx={{ width: p(3), height: p(h), bgcolor: color, borderRadius: `${p(10)}px` }} />
        ))}
      </Box>
    );

    return (
      <>
      <Box sx={{ height: '100%', minHeight: 0, display: 'flex', bgcolor: '#F8F9F8', position: 'relative', overflow: 'hidden' }}>
        {/* Main Chat Area */}
        <Box sx={{ 
          flex: '1 1 auto',
          minWidth: 0,
          minHeight: 0,
          display: 'flex', 
          flexDirection: 'column', 
          bgcolor: '#F8F9F8',
          borderRight: 'none'
        }}>
          {/* Header — 容器查询：窄了就收右簇，标题保持单行 */}
          <Box
            sx={{
              height: p(160),
              flexShrink: 0,
              px: `${p(40)}px`,
              bgcolor: '#FFFFFF',
              borderBottom: '1px solid #E2E2E3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: `${p(16)}px`,
              zIndex: 10,
              containerType: 'inline-size',
              containerName: 'chatHeader',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
              <ButtonBase
                onClick={() => setScreen(ScreenState.TOPIC_SELECTION)}
                aria-label="Back"
                sx={{
                  ...headerCtrlSx,
                  width: p(80),
                  height: p(80),
                  borderRadius: `${p(100)}px`,
                }}
              >
                <BackIcon sx={{ fontSize: p(40), color: '#2D3436' }} />
              </ButtonBase>
              <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(40),
                    lineHeight: 1.2,
                    color: '#2D3436',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  AI Tutor · Immersion
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(28),
                    lineHeight: 1.2,
                    color: '#636E72',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '@container chatHeader (max-width: 920px)': {
                      display: 'none',
                    },
                  }}
                >
                  Live Practice
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${p(20)}px`,
                flexShrink: 0,
                '@container chatHeader (max-width: 1400px)': {
                  gap: `${p(10)}px`,
                },
              }}
            >
              <ButtonBase
                onClick={() => setSlowSpeech((prev) => !prev)}
                aria-label={slowSpeech ? 'Slow speech on' : 'Normal speech speed'}
                aria-pressed={slowSpeech}
                sx={{
                  width: p(90),
                  height: p(90),
                  minWidth: p(90),
                  borderRadius: `${p(28)}px`,
                  bgcolor: '#F8F8FA',
                  border: '1px solid #E2E3E3',
                  color: '#636E72',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <SlowMotionVideo
                  sx={{
                    fontSize: p(40),
                    color: slowSpeech ? 'transparent' : '#636E72',
                    ...(slowSpeech
                      ? { background: 'linear-gradient(212.84deg, #FEDC5E 9.46%, #3FB266 90.54%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                      : {}),
                  }}
                />
              </ButtonBase>
              <ButtonBase
                onClick={() => setShowPinyin(!showPinyin)}
                aria-label={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
                aria-pressed={showPinyin}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${p(16)}px`,
                  width: p(202),
                  height: p(90),
                  borderRadius: `${p(28)}px`,
                  bgcolor: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  flexShrink: 0,
                  '&:active': { transform: 'scale(0.98)' },
                  '@container chatHeader (max-width: 1400px)': {
                    width: p(90),
                    minWidth: p(90),
                    gap: 0,
                  },
                }}
              >
                {showPinyin
                  ? <Visibility sx={{ fontSize: p(36), color: '#2D3436' }} />
                  : <VisibilityOff sx={{ fontSize: p(36), color: '#2D3436' }} />}
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(28),
                    lineHeight: 1.2,
                    color: '#4B5563',
                    whiteSpace: 'nowrap',
                    '@container chatHeader (max-width: 1400px)': {
                      display: 'none',
                    },
                  }}
                >
                  Pinyin
                </Typography>
              </ButtonBase>
              <ButtonBase
                onClick={() => setScreen(ScreenState.FEEDBACK)}
                sx={{
                  width: p(227),
                  height: p(90),
                  px: `${p(24)}px`,
                  borderRadius: `${p(28)}px`,
                  bgcolor: '#2D3436',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  '&:active': { transform: 'scale(0.98)' },
                  '@container chatHeader (max-width: 920px)': {
                    width: 'auto',
                    minWidth: p(90),
                    px: `${p(20)}px`,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(28),
                    lineHeight: 1.2,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Practice End
                </Typography>
              </ButtonBase>
            </Box>
          </Box>

          {/* Messages — flex 吃满 160 顶栏与 160 底栏之间 */}
          <Box ref={messagesScrollRef} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', px: `${p(60)}px`, pt: `${p(40)}px`, pb: `${p(24)}px`, display: 'flex', flexDirection: 'column', gap: `${p(60)}px` }}>
            {messages.map(msg => {
              if (msg.sender === 'system') {
                const showRetryLlm = msg.systemKind === 'llm_fail';
                const showReplayTts =
                  msg.systemKind === 'tts_fail' && msg.replayText && msg.replayMessageId;
                const compact = msg.systemKind === 'tts_fail';
                return (
                  <Box key={msg.id} sx={{ alignSelf: 'stretch', maxWidth: '100%', px: 0.25 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        gap: compact ? 1 : 2,
                        px: compact ? 1.25 : 2,
                        py: compact ? 0.75 : 2,
                        borderRadius: compact ? '12px' : '16px',
                        bgcolor: compact ? '#FFF7ED' : '#FEF2F2',
                        border: '1px solid',
                        borderColor: compact ? '#FED7AA' : '#FECACA',
                      }}
                    >
                      <AlertCircle sx={{ color: compact ? '#EA580C' : '#DC2626', fontSize: compact ? 18 : 28, flexShrink: 0 }} />
                      <Typography
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: 700,
                          color: compact ? '#9A3412' : '#7F1D1D',
                          fontSize: compact ? '0.8rem' : '0.95rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {msg.text}
                      </Typography>
                      {showRetryLlm && (
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => {
                            const p = pendingLlmRetryRef.current;
                            if (p) getPipeline().enqueueLlmRetry(p.text, p.isVoiceInput);
                          }}
                          sx={{ borderRadius: '12px', fontWeight: 800, minHeight: 48, px: 3, bgcolor: '#991B1B', '&:hover': { bgcolor: '#7F1D1D' } }}
                        >
                          Retry
                        </Button>
                      )}
                      {showReplayTts && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            getPipeline().enqueuePlayback(msg.replayText!, msg.replayMessageId!);
                          }}
                          sx={{
                            flexShrink: 0,
                            borderRadius: '10px',
                            fontWeight: 800,
                            minHeight: 36,
                            px: 1.25,
                            color: '#C2410C',
                            '&:hover': { bgcolor: 'rgba(194,65,12,0.08)' },
                          }}
                        >
                          Replay
                        </Button>
                      )}
                    </Paper>
                  </Box>
                );
              }
              return (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: msg.sender === 'user' ? 'auto' : '100%',
                  maxWidth: '100%',
                }}
              >
                <Box sx={{ display: 'flex', gap: `${p(20)}px`, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <Avatar
                    src={
                      msg.sender === 'user'
                        ? (playedRole === 'B' ? ROLE_B_AVATAR : ROLE_A_AVATAR)
                        : (playedRole === 'B' ? ROLE_A_AVATAR : ROLE_B_AVATAR)
                    }
                    alt={msg.sender === 'user' ? (userRole || 'You') : (aiRole || 'Partner')}
                    sx={{
                      width: p(100),
                      height: p(100),
                      bgcolor: '#F3F4F6',
                      borderRadius: `${p(20)}px`,
                      flexShrink: 0,
                      '& .MuiAvatar-img': { objectFit: 'cover' },
                    }}
                  />
                  
                  <Box sx={{ flexGrow: msg.sender === 'ai' ? 0 : 0, minWidth: 0, maxWidth: msg.sender === 'user' ? p(625) : p(1200) }}>
                    {msg.sender === 'user' && msg.score != null ? (
                      (() => {
                        const breakdown = msg.speechBreakdown ?? buildSpeechBreakdown(msg.score);
                        const metricsOpen = expandedSpeechIds.includes(msg.id);
                        const metricItems = [
                          { label: 'Pronunciation', value: breakdown.speech },
                          { label: 'Fluency', value: breakdown.fluency },
                          { label: 'Accuracy', value: breakdown.accuracy },
                          { label: 'Completeness', value: breakdown.completeness },
                        ];
                        return (
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              minWidth: p(420),
                              borderRadius: `${p(32)}px`,
                              overflow: 'hidden',
                              background: metricsOpen
                                ? 'linear-gradient(140.03deg, #FD636D 4.75%, #FDA085 50.45%, #FDDD9E 95.25%)'
                                : '#FFFFFF',
                              border: '1px solid #E0E0DF',
                            }}
                          >
                            {metricsOpen && (
                              <Box
                                sx={{
                                  px: `${p(22)}px`,
                                  height: p(48),
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: FIGMA_FONT,
                                    fontSize: p(16),
                                    fontWeight: 600,
                                    lineHeight: 1.6,
                                    color: '#FFFFFF',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {metricItems.map((item) => `${item.label}: ${item.value}`).join('  ')}
                                </Typography>
                              </Box>
                            )}

                            <Box
                              sx={{
                                position: 'relative',
                                bgcolor: '#FFFFFF',
                                border: metricsOpen ? '1px solid #E0E0DF' : 'none',
                                borderRadius: `${p(32)}px`,
                                minHeight: p(180),
                              }}
                            >
                              <ButtonBase
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedSpeechIds((prev) =>
                                    prev.includes(msg.id) ? prev.filter((id) => id !== msg.id) : [...prev, msg.id],
                                  );
                                }}
                                aria-label={metricsOpen ? 'Hide speech scores' : 'Show speech scores'}
                                aria-expanded={metricsOpen}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  zIndex: 3,
                                  width: p(176),
                                  height: p(40),
                                  background: 'linear-gradient(140.03deg, #F34D47 4.75%, #FD8089 95.25%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: `${p(4)}px`,
                                  pr: `${p(22)}px`,
                                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 12px 100%)',
                                  '&:active': { transform: 'scale(0.98)' },
                                }}
                              >
                                <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(24), lineHeight: '30px', color: '#FFFFFF' }}>
                                  Speech
                                </Typography>
                                <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(24), lineHeight: 1.6, color: '#FFFFFF' }}>
                                  {msg.score}
                                </Typography>
                              </ButtonBase>

                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: `${p(12)}px`,
                                  px: `${p(40)}px`,
                                  pt: `${p(48)}px`,
                                  pb: `${p(28)}px`,
                                }}
                              >
                                <ButtonBase
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playTTS(msg.text, msg.id);
                                  }}
                                  aria-label="Play sentence"
                                  sx={{
                                    width: p(40),
                                    height: p(30),
                                    minWidth: p(40),
                                    borderRadius: `${p(20)}px`,
                                    bgcolor: '#FF6B35',
                                    color: '#FFFFFF',
                                    flexShrink: 0,
                                    '&:active': { transform: 'scale(0.94)' },
                                  }}
                                >
                                  <VolumeUp sx={{ fontSize: p(22) }} />
                                </ButtonBase>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <ConversationRubyText
                                    text={msg.text}
                                    pinyin={msg.pinyin}
                                    showPinyin={showPinyin}
                                    align="left"
                                    textColor="#2D3436"
                                    pinyinColor="#2D3436"
                                    textSize={`${p(32)}px`}
                                    pinyinSize={`${p(28)}px`}
                                    hanziFontFamily={FIGMA_FONT}
                                  />
                                  {showTranslationIds.includes(msg.id) && msg.translation && (
                                    <Typography
                                      sx={{
                                        mt: `${p(12)}px`,
                                        pt: `${p(12)}px`,
                                        borderTop: '1px solid #E0E0DF',
                                        fontFamily: FIGMA_FONT,
                                        fontSize: p(24),
                                        fontWeight: 400,
                                        fontStyle: 'italic',
                                        color: '#636E72',
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {msg.translation}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })()
                    ) : (
                      <>
                    {/* Message Bubble — Figma 白泡 32 圆角 */}
                    <Box 
                      onClick={() => msg.sender === 'ai' && setMaskedIds(prev => prev.includes(msg.id) ? prev.filter(mid => mid !== msg.id) : [...prev, msg.id])}
                      sx={{ 
                        px: `${p(40)}px`,
                        py: `${p(15)}px`,
                        borderRadius: `${p(32)}px`,
                        bgcolor: '#FFFFFF',
                        color: '#2D3436', 
                        border: '1px solid #E0E0DF',
                        cursor: msg.sender === 'ai' ? 'pointer' : 'default',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Box sx={{
                        filter: (msg.sender === 'ai' && maskedIds.includes(msg.id)) || playingAudioId === msg.id ? 'blur(6px)' : 'none',
                        transition: 'filter 0.5s'
                      }}>
                        <ConversationRubyText
                          text={msg.text}
                          pinyin={msg.pinyin}
                          showPinyin={showPinyin}
                          align="left"
                          textColor="#2D3436"
                          pinyinColor="#2D3436"
                          textSize={`${p(32)}px`}
                          pinyinSize={`${p(28)}px`}
                          hanziFontFamily={FIGMA_FONT}
                        />
                      </Box>
                      
                      {/* Audio Playing Indicator */}
                      {playingAudioId === msg.id && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          zIndex: 10
                        }}>
                          <VolumeUp sx={{ 
                            fontSize: p(40), 
                            color: '#3FB266',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                              '50%': { opacity: 0.7, transform: 'scale(1.1)' }
                            }
                          }} />
                          <Typography sx={{ 
                            fontFamily: FIGMA_FONT,
                            fontSize: p(24), 
                            fontWeight: 400, 
                            color: '#3FB266',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            px: 2,
                            py: 0.5,
                            borderRadius: `${p(12)}px`,
                          }}>
                            Playing...
                          </Typography>
                        </Box>
                      )}
                      
                      {showTranslationIds.includes(msg.id) && msg.translation && (
                        <Box sx={{ 
                          mt: `${p(16)}px`, 
                          pt: `${p(16)}px`, 
                          borderTop: '1px solid #E0E0DF',
                        }}>
                          <Typography sx={{ 
                            fontFamily: FIGMA_FONT,
                            fontSize: p(24), 
                            fontWeight: 400, 
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            color: '#636E72',
                          }}>
                            {msg.translation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                      </>
                    )}

                    {/* Action Buttons — Figma 60 高灰芯 + Deep Dive 绿黄渐变 */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: `${p(20)}px`, 
                      mt: `${p(18)}px`, 
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      flexWrap: 'wrap'
                    }}>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          playTTS(msg.text, msg.id);
                        }}
                        sx={{
                          ...actionChipSx,
                          color: playingAudioId === msg.id ? '#3FB266' : '#636E72',
                          borderColor: playingAudioId === msg.id ? '#3FB266' : '#E0E0DF',
                        }}
                      >
                        <WaveBars color={playingAudioId === msg.id ? '#3FB266' : '#636E72'} />
                        <Typography sx={actionChipLabelSx}>
                          {playingAudioId === msg.id ? 'Playing' : 'AI'}
                        </Typography>
                      </ButtonBase>

                      {msg.translation && (
                        <ButtonBase 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTranslationIds(prev => 
                              prev.includes(msg.id) 
                                ? prev.filter(id => id !== msg.id) 
                                : [...prev, msg.id]
                            );
                          }}
                          sx={{ 
                            ...actionChipSx,
                            bgcolor: showTranslationIds.includes(msg.id) ? '#EEF8F1' : '#F3F4F6',
                            color: showTranslationIds.includes(msg.id) ? '#3FB266' : '#636E72',
                          }}
                        >
                          <GTranslate sx={{ fontSize: p(32) }} />
                          <Typography sx={actionChipLabelSx}>Translate</Typography>
                        </ButtonBase>
                      )}

                      <ButtonBase 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeepDive(msg);
                        }}
                        sx={{ 
                          ...actionChipSx,
                          background: deepDiveCredits.remaining > 0
                            ? 'linear-gradient(322.54deg, #3FB266 29.05%, #FEDC5E 110.48%)'
                            : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          opacity: deepDiveCredits.remaining > 0 || activeDeepLearning?.id === msg.id ? 1 : 0.72,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: p(32) }} />
                        <Typography sx={{ ...actionChipLabelSx, color: '#FFFFFF' }}>
                          Deep Dive
                        </Typography>
                        <Box
                          sx={{
                            minWidth: p(24),
                            height: p(24),
                            px: `${p(6)}px`,
                            borderRadius: `${p(999)}px`,
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: deepDiveCredits.remaining > 0 ? '#3FB266' : '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: FIGMA_FONT,
                            fontSize: p(16),
                            fontWeight: 700,
                            lineHeight: 1,
                            transform: creditChipPulse ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 180ms ease',
                          }}
                        >
                          {deepDiveCredits.remaining}
                        </Box>
                      </ButtonBase>
                    </Box>
                  </Box>
                </Box>
              </Box>
              );
            })}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: `${p(20)}px`, alignItems: 'flex-start' }}>
                <Box sx={{ width: p(100), height: p(100), flexShrink: 0 }} />
                <Box
                  sx={{
                    width: p(250),
                    height: p(120),
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E0E0DF',
                    borderRadius: `${p(32)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: `${p(8)}px`, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: p(10),
                          height: p(10),
                          bgcolor: '#636E72',
                          borderRadius: '50%',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
                            '40%': { transform: 'translateY(-8px)', opacity: 1 },
                          },
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* AI Translation Popup */}
          {showAITranslation && (
            <Box sx={{ position: 'absolute', bottom: 110, left: 24, right: 24, bgcolor: 'white', p: 3, borderRadius: '20px', border: '2px solid #0D9F72', zIndex: 50, boxShadow: '0 10px 40px rgba(13,159,114,0.18)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Translate sx={{ fontSize: 18, color: '#0D9F72' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#0D9F72' }}>AI translation tip</Typography>
                </Box>
                <IconButton size="small" onClick={() => setShowAITranslation(false)}><Close sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 2, color: '#1F2937', fontFamily: KAI_TI }}>我想点一杯热拿铁。</Typography>
              <ButtonBase onClick={() => handleSendLine("我想点一杯热拿铁。")} sx={{ width: '100%', py: 2, bgcolor: '#0D9F72', color: 'white', borderRadius: '14px', fontWeight: 900, fontSize: '0.95rem', '&:active': { transform: 'scale(0.98)' } }}>
                Send this line
              </ButtonBase>
            </Box>
          )}

          {/* Input Area — Figma 160 底栏。Refresh / Pipeline 在平板外，不是屏内交互 */}
          <Box sx={{ flexShrink: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E3E3', zIndex: 20 }}>
            {typeof document !== 'undefined' && createPortal(
              <Box
                id="ai-chat-dev-tools"
                sx={{
                  position: 'fixed',
                  left: 16,
                  bottom: 16,
                  zIndex: 4000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 0.75,
                  pointerEvents: 'auto',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  <ButtonBase
                    onClick={() => {
                      setDeepDiveCredits(refreshDeepDiveCredits());
                      setCreditChipPulse(true);
                      window.setTimeout(() => setCreditChipPulse(false), 420);
                    }}
                    aria-label="Refresh Deep Dive credits"
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      minHeight: 36,
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      bgcolor: '#FFFBEB',
                      color: '#B45309',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                      Refresh credits ({deepDiveCredits.remaining}/{DEEP_DIVE_DAILY_LIMIT})
                    </Typography>
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => setShowPipeline((prev) => !prev)}
                    aria-expanded={showPipeline}
                    aria-label={showPipeline ? 'Hide pipeline' : 'Show pipeline'}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      minHeight: 36,
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      bgcolor: showPipeline ? '#F0FDF4' : '#FFFFFF',
                      color: showPipeline ? '#087A58' : '#6B7280',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                      {showPipeline ? 'Hide pipeline' : 'Pipeline'}
                    </Typography>
                  </ButtonBase>
                </Box>
                {showPipeline && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      flexWrap: 'wrap',
                      px: 1,
                      py: 0.75,
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                    aria-label="Conversation pipeline"
                  >
                    {(
                      [
                        { id: 'mic', label: 'Mic', on: isRecording },
                        { id: 'asr', label: 'ASR', on: pipelineStage === 'asr_finalize' },
                        { id: 'llm', label: 'LLM', on: pipelineStage === 'llm' },
                        { id: 'tts', label: 'TTS', on: pipelineStage === 'playback' },
                        { id: 'audio', label: 'Audio', on: pipelineStage === 'playback' },
                      ] as const
                    ).map((step, i, arr) => (
                      <React.Fragment key={step.id}>
                        <Box
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            borderRadius: '10px',
                            bgcolor: step.on ? 'rgba(13,159,114,0.12)' : 'transparent',
                            border: '1px solid',
                            borderColor: step.on ? '#0D9F72' : 'transparent',
                            minHeight: 36,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: step.on ? '#087A58' : '#9CA3AF',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {step.label}
                          </Typography>
                        </Box>
                        {i < arr.length - 1 && (
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#D1D5DB', px: 0.25 }}>→</Typography>
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </Box>,
              document.body,
            )}
            {/* AI Tools - Only show in text mode */}
            {inputMode === 'text' && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, overflowX: 'auto', px: 0.5 }}>
                <ButtonBase 
                  onClick={() => inputText.trim() && setShowDictionary(true)}
                  disabled={!inputText.trim()}
                  sx={{ 
                    px: 2.5, 
                    py: 1, 
                    borderRadius: '12px', 
                    bgcolor: inputText.trim() ? '#FFF7ED' : '#F3F4F6', 
                    border: '1.5px solid',
                    borderColor: inputText.trim() ? '#FDBA74' : '#E5E7EB',
                    color: inputText.trim() ? '#EA580C' : '#9CA3AF', 
                    fontSize: '0.8rem', 
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    opacity: inputText.trim() ? 1 : 0.5,
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    '&:active': { transform: inputText.trim() ? 'scale(0.95)' : 'none' }
                  }}
                >
                  <Search sx={{ fontSize: 16 }} /> Look up
                </ButtonBase>
                <ButtonBase 
                  onClick={() => {
                    if (inputText.trim() && hasNonChineseContent(inputText)) {
                      setToolLoading(true); 
                      setTimeout(() => { 
                        setToolLoading(false); 
                        setShowAITranslation(true); 
                      }, 800);
                    }
                  }}
                  disabled={!inputText.trim() || !hasNonChineseContent(inputText)}
                  sx={{ 
                    px: 2.5, 
                    py: 1, 
                    borderRadius: '12px', 
                    bgcolor: (inputText.trim() && hasNonChineseContent(inputText)) ? '#EEF2FF' : '#F3F4F6', 
                    border: '1.5px solid',
                    borderColor: (inputText.trim() && hasNonChineseContent(inputText)) ? '#C7D2FE' : '#E5E7EB',
                    color: (inputText.trim() && hasNonChineseContent(inputText)) ? '#0D9F72' : '#9CA3AF',
                    fontSize: '0.8rem', 
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    opacity: (inputText.trim() && hasNonChineseContent(inputText)) ? 1 : 0.5,
                    cursor: (inputText.trim() && hasNonChineseContent(inputText)) ? 'pointer' : 'not-allowed',
                    '&:active': { transform: (inputText.trim() && hasNonChineseContent(inputText)) ? 'scale(0.95)' : 'none' }
                  }}
                >
                  {toolLoading ? <Refresh sx={{ 
                    fontSize: 16,
                    '@keyframes spin': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' }
                    },
                    animation: 'spin 1s infinite linear' 
                  }} /> : <Translate sx={{ fontSize: 16 }} />} 
                  AI Translate
                </ButtonBase>
              </Box>
            )}

            {/* Input Row — Figma 100 圆钮 + 100 高胶囊 */}
            <Box
              sx={{
                height: p(160),
                px: `${p(60)}px`,
                display: 'flex',
                alignItems: 'center',
                gap: `${p(30)}px`,
              }}
            >
              <IconButton 
                onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')}
                aria-label={inputMode === 'voice' ? 'Switch to keyboard' : 'Switch to voice'}
                sx={{ 
                  width: p(100), 
                  height: p(100), 
                  bgcolor: '#F3F4F6', 
                  border: '1px solid #E0E0DF',
                  borderRadius: `${p(100)}px`,
                  color: '#636E72',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#ECEDEF' }
                }}
              >
                {inputMode === 'voice' ? <Keyboard sx={{ fontSize: p(40) }} /> : <Mic sx={{ fontSize: p(40) }} />}
              </IconButton>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {inputMode === 'text' ? (
        <TextField
          fullWidth
          value={inputText}
                    onChange={e => setInputText(e.target.value)} 
                    onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSend();
                      }
                    }} 
                    placeholder="Type Chinese or English..." 
                    variant="standard"
                    InputProps={{ 
                      disableUnderline: true, 
                      sx: { 
                        height: p(100), 
                        px: `${p(40)}px`, 
                        bgcolor: '#FFFFFF', 
                        borderRadius: `${p(100)}px`, 
                        border: '2px solid #E0E0DF',
                        fontFamily: FIGMA_FONT,
                        fontWeight: 700,
                        fontSize: p(32),
                        color: '#2D3436',
                      } 
                    }} 
                  />
                ) : (
                  <ButtonBase 
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (pipelineBusy && !isRecordingActiveRef.current) return;
                      if (isRecordingActiveRef.current) {
                        stopRecording();
                        return;
                      }
                      talkHoldStartedAtRef.current = Date.now();
                      startRecording();
                    }}
                    onPointerUp={(e) => {
                      e.preventDefault();
                      if (!isRecordingActiveRef.current) return;
                      if (Date.now() - talkHoldStartedAtRef.current >= 280) {
                        stopRecording();
                      }
                    }}
                    onPointerCancel={(e) => {
                      e.preventDefault();
                      if (!isRecordingActiveRef.current) return;
                      if (Date.now() - talkHoldStartedAtRef.current >= 280) {
                        stopRecording();
                      }
                    }}
                    sx={{ 
                      width: '100%', 
                      height: p(100), 
                      bgcolor: '#FFFFFF',
                      color: '#2D3436', 
                      border: '2px solid #E0E0DF',
                      borderRadius: `${p(100)}px`, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: `${p(12)}px`,
                      opacity: pipelineBusy && !isRecording ? 0.3 : 1,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                      cursor: pipelineBusy && !isRecording ? 'not-allowed' : 'pointer',
                      '&:active': {
                        transform: isRecording ? 'scale(0.99)' : 'none',
                      }
                    }}
                  >
                    {isRecording ? (
                      <>
                        <Box sx={{ width: p(12), height: p(12), borderRadius: '50%', bgcolor: '#FD636D', animation: 'recordDot 0.9s ease-in-out infinite alternate', '@keyframes recordDot': { from: { opacity: 0.4 }, to: { opacity: 1 } } }} />
                        <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: '#2D3436' }}>
                          {recordedText || 'Listening… tap to send'}
                        </Typography>
                        <Typography component="span" sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), fontWeight: 700, color: '#636E72', fontVariantNumeric: 'tabular-nums' }}>
                          00:{String(countdown).padStart(2, '0')}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Mic sx={{ fontSize: p(50), color: '#636E72' }} />
                        <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: '#2D3436' }}>
                          {pipelineBusy ? 'Please wait...' : 'Hold to talk'}
                        </Typography>
                      </>
                    )}
                  </ButtonBase>
                )}
              </Box>
              
              {inputMode === 'text' && (
                <ButtonBase 
                  onClick={() => handleSend()} 
                  disabled={!inputText.trim()}
                  sx={{ 
                    width: p(100), 
                    height: p(100), 
                    bgcolor: inputText.trim() ? '#2D3436' : '#F3F4F6', 
                    color: inputText.trim() ? '#FFFFFF' : '#636E72', 
                    borderRadius: `${p(100)}px`,
                    border: '1px solid #E0E0DF',
                    opacity: inputText.trim() ? 1 : 0.5,
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                    '&:active': inputText.trim() ? { transform: 'scale(0.95)' } : {}
                  }}
                >
                  <Send sx={{ fontSize: p(36) }} />
                </ButtonBase>
              )}
            </Box>
          </Box>
        </Box>

        {/* Deep Learning Split Panel */}
        {activeDeepLearning && (
          <Box sx={{ 
            flex: `0 0 ${p(720)}px`,
            width: p(720),
            maxWidth: '40%',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #F5FDED 0%, #FAFAFA 100%)',
            borderLeft: '1px solid #E0E0DF',
            animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideInRight': {
              from: { transform: 'translateX(100%)', opacity: 0 },
              to: { transform: 'translateX(0)', opacity: 1 }
            }
          }}>
            <Box
              sx={{
                position: 'absolute',
                width: p(360),
                height: p(360),
                right: p(-80),
                top: p(-140),
                background: 'linear-gradient(200.45deg, #E9FFCD 40.04%, #F1FFEB 86.42%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                height: p(160),
                flexShrink: 0,
                px: `${p(60)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: `${p(16)}px`,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, minWidth: 0 }}>
                <Box
                  component="svg"
                  width={p(32)}
                  height={p(30)}
                  viewBox="0 0 32 30"
                  sx={{ flexShrink: 0 }}
                  aria-hidden
                >
                  <path d="M13 14.5 16.2 8l3.2 6.5 7.1.9-5.2 4.8 1.3 7-6.4-3.6-6.4 3.6 1.3-7-5.2-4.8 7.1-.9Z" fill="#3FB266" />
                  <path d="M24 6.5 26 4l1.2 2.6 2.8.4-2.1 1.9.5 2.7-2.4-1.4-2.4 1.4.5-2.7-2.1-1.9 2.8-.4Z" fill="#3FB266" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(40),
                      lineHeight: 1.4,
                      background: 'linear-gradient(271.47deg, #51C378 -7.46%, #8AC88D 35.02%, #3FB266 97.41%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Sentence Analysis
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(22),
                      lineHeight: 1.4,
                      color: '#636E72',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    −{DEEP_DIVE_COST} credit · {deepDiveCredits.remaining} left today
                  </Typography>
                </Box>
              </Box>
              <ButtonBase
                onClick={() => {
                  setActiveDeepLearning(null);
                  setDeepDiveLoading(false);
                }}
                aria-label="Close Deep Dive"
                sx={{
                  width: p(64),
                  height: p(64),
                  minWidth: p(64),
                  flexShrink: 0,
                  color: '#999999',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Close sx={{ fontSize: p(36) }} />
              </ButtonBase>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                px: `${p(60)}px`,
                pb: `${p(40)}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: `${p(28)}px`,
                zIndex: 1,
              }}
            >
              {deepDiveLoading ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px` }}>
                    <Box sx={{ width: '100%', height: p(50), bgcolor: '#FFFFFF', borderRadius: `${p(12)}px` }} />
                    <Box sx={{ width: '100%', height: p(50), bgcolor: '#FFFFFF', borderRadius: `${p(12)}px` }} />
                    <Box sx={{ width: '50%', height: p(50), bgcolor: '#FFFFFF', borderRadius: `${p(12)}px` }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px`, pt: `${p(12)}px` }}>
                    <Box sx={{ width: p(6), height: p(28), bgcolor: '#3FB266', borderRadius: '1px' }} />
                    <Box sx={{ width: p(165), height: p(32), bgcolor: '#FFFFFF', borderRadius: `${p(8)}px` }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px` }}>
                    <Box sx={{ width: '100%', height: p(100), bgcolor: '#FFFFFF', borderRadius: `${p(20)}px` }} />
                    <Box sx={{ width: '100%', height: p(100), bgcolor: '#FFFFFF', borderRadius: `${p(20)}px` }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px`, pt: `${p(12)}px` }}>
                    <Box sx={{ width: p(6), height: p(28), bgcolor: '#3FB266', borderRadius: '1px' }} />
                    <Box sx={{ width: p(150), height: p(32), bgcolor: '#FFFFFF', borderRadius: `${p(8)}px` }} />
                  </Box>
                  <Box sx={{ width: '100%', height: p(160), bgcolor: '#FFFFFF', borderRadius: `${p(20)}px` }} />
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      bgcolor: '#FFFFFF',
                      px: `${p(40)}px`,
                      py: `${p(40)}px`,
                      borderRadius: `${p(32)}px`,
                      flexShrink: 0,
                    }}
                  >
                    <ConversationRubyText
                      text={activeDeepLearning.text}
                      pinyin={activeDeepLearning.pinyin}
                      showPinyin
                      align="left"
                      textColor="#2D3436"
                      pinyinColor="#2D3436"
                      textSize={`${p(32)}px`}
                      pinyinSize={`${p(28)}px`}
                      hanziFontFamily={FIGMA_FONT}
                      columnGap="0.4em"
                      rowGap={0.5}
                    />
                    {activeDeepLearning.translation && (
                      <Typography
                        sx={{
                          mt: `${p(20)}px`,
                          fontFamily: FIGMA_FONT,
                          fontSize: p(28),
                          fontWeight: 400,
                          color: '#636E72',
                          lineHeight: 1.6,
                        }}
                      >
                        {activeDeepLearning.translation}
                      </Typography>
                    )}
                  </Box>

                  {(() => {
                    const keywords = pickDeepDiveKeywords(
                      activeDeepLearning.text,
                      activeDeepLearning.pinyin ?? '',
                      3,
                    );
                    if (!keywords.length) return null;
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(28)}px`, flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
                          <Box sx={{ width: p(6), height: p(28), bgcolor: '#3FB266', borderRadius: '1px', flexShrink: 0 }} />
                          <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: '#2D3436' }}>
                            Key Words
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px` }}>
                          {keywords.map((kw) => (
                            <Box
                              key={`${kw.chinese}-${kw.pinyin}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: `${p(20)}px`,
                                px: `${p(40)}px`,
                                py: `${p(28)}px`,
                                bgcolor: '#FFFFFF',
                                borderRadius: `${p(32)}px`,
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: p(56) }}>
                                <Typography
                                  sx={{
                                    fontFamily: FIGMA_FONT,
                                    fontWeight: 400,
                                    fontSize: p(28),
                                    lineHeight: 1.6,
                                    color: '#2D3436',
                                    textAlign: 'center',
                                  }}
                                >
                                  {kw.pinyin}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: FIGMA_FONT,
                                    fontWeight: 700,
                                    fontSize: p(56),
                                    lineHeight: 1.4,
                                    color: '#2D3436',
                                    textAlign: 'center',
                                  }}
                                >
                                  {kw.chinese}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontFamily: FIGMA_FONT,
                                    fontWeight: 400,
                                    fontSize: p(32),
                                    lineHeight: 1.6,
                                    color: '#636E72',
                                  }}
                                >
                                  {kw.gloss}
                                </Typography>
                                <Box sx={{ mt: `${p(8)}px`, display: 'flex', flexWrap: 'wrap', gap: `${p(8)}px` }}>
                                  <Box
                                    sx={{
                                      px: `${p(10)}px`,
                                      py: `${p(2)}px`,
                                      borderRadius: `${p(8)}px`,
                                      bgcolor: '#F3F4F6',
                                      color: '#636E72',
                                      fontFamily: FIGMA_FONT,
                                      fontSize: p(20),
                                      fontWeight: 400,
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {kw.pos}
                                  </Box>
                                  {kw.hsk != null && (
                                    <Box
                                      sx={{
                                        px: `${p(10)}px`,
                                        py: `${p(2)}px`,
                                        borderRadius: `${p(8)}px`,
                                        bgcolor: '#F3F4F6',
                                        color: '#636E72',
                                        fontFamily: FIGMA_FONT,
                                        fontSize: p(20),
                                        fontWeight: 400,
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      HSK {kw.hsk}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                              <ButtonBase
                                onClick={() => void speakUtterance(kw.chinese, `deep-dive-kw-${kw.chinese}`)}
                                aria-label={`Play ${kw.chinese}`}
                                sx={{
                                  width: p(50),
                                  height: p(36),
                                  minWidth: p(50),
                                  flexShrink: 0,
                                  bgcolor: '#FF6B35',
                                  borderRadius: `${p(26)}px`,
                                  color: '#FFFFFF',
                                  '&:active': { transform: 'scale(0.94)' },
                                }}
                              >
                                <VolumeUp sx={{ fontSize: p(22) }} />
                              </ButtonBase>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px`, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
                      <Box sx={{ width: p(6), height: p(28), bgcolor: '#3FB266', borderRadius: '1px', flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: '#2D3436' }}>
                        Grammar
                      </Typography>
                    </Box>
                    {([
                      {
                        key: 'when' as const,
                        title: 'When to use',
                        subtitle: 'Situations & timing',
                        body:
                          'Use this line when greeting a guest and inviting an order — opening a service conversation in a café, restaurant, or shop. Pair it with a smile and clear pace so the question feels welcoming, not rushed.',
                      },
                      {
                        key: 'grammar' as const,
                        title: 'Grammar structure',
                        subtitle: 'Pattern to reuse',
                        body:
                          'Pattern: 想 + Verb + 点 + Question word？ → “want to [do] a bit of what?” Example core: 想喝点什么？ Softens the request versus a bare 喝什么？ Keep 点 for a casual, polite offer.',
                      },
                      {
                        key: 'culture' as const,
                        title: 'Culture tip',
                        subtitle: 'Local feel',
                        body:
                          '咖啡 is a phonetic loanword from “coffee.” Mandarin often borrows foreign drink and brand names by sound. Staff may also say 来点什么？ — same invite, slightly more colloquial.',
                      },
                    ]).map((section) => {
                      const open = deepDiveOpenSections[section.key];
                      return (
                        <Box
                          key={section.key}
                          sx={{
                            bgcolor: '#FFFFFF',
                            borderRadius: `${p(32)}px`,
                            overflow: 'hidden',
                          }}
                        >
                          <ButtonBase
                            onClick={() =>
                              setDeepDiveOpenSections((prev) => ({
                                ...prev,
                                [section.key]: !prev[section.key],
                              }))
                            }
                            sx={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: `${p(16)}px`,
                              px: `${p(40)}px`,
                              py: `${p(28)}px`,
                              textAlign: 'left',
                              '&:active': { bgcolor: '#FAFAFA' },
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), color: '#2D3436', lineHeight: 1.4 }}>
                                {section.title}
                              </Typography>
                              <Typography sx={{ mt: `${p(4)}px`, fontFamily: FIGMA_FONT, fontSize: p(24), fontWeight: 400, color: '#636E72', lineHeight: 1.6 }}>
                                {section.subtitle}
                              </Typography>
                            </Box>
                            <ExpandMore
                              sx={{
                                color: '#636E72',
                                fontSize: p(36),
                                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 180ms ease',
                                flexShrink: 0,
                              }}
                            />
                          </ButtonBase>
                          {open && (
                            <Box sx={{ px: `${p(40)}px`, pb: `${p(40)}px` }}>
                              <Typography
                                sx={{
                                  fontFamily: FIGMA_FONT,
                                  fontSize: p(32),
                                  fontWeight: 700,
                                  color: '#3FB266',
                                  lineHeight: 1.6,
                                  mb: `${p(16)}px`,
                                }}
                              >
                                {section.subtitle}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: FIGMA_FONT,
                                  fontSize: p(32),
                                  fontWeight: 400,
                                  color: '#2D3436',
                                  lineHeight: 1.6,
                                }}
                              >
                                {section.body}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontSize: p(22),
                      fontWeight: 400,
                      color: '#636E72',
                      textAlign: 'center',
                      pb: `${p(8)}px`,
                      flexShrink: 0,
                    }}
                  >
                    Credits refresh daily · {deepDiveCredits.remaining}/{DEEP_DIVE_DAILY_LIMIT} left
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Dictionary Tool Overlay */}
        {showDictionary && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: activeDeepLearning ? '45%' : 0, 
            height: '70%', 
            bgcolor: 'white', 
            borderRadius: '32px 32px 0 0', 
            zIndex: 100, 
            boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideUp': {
              from: { transform: 'translateY(100%)' },
              to: { transform: 'translateY(0)' }
            }
          }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F3F4F6' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>AI Dictionary</Typography>
              <IconButton onClick={() => setShowDictionary(false)} sx={{ '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}>
                <Close />
              </IconButton>
            </Box>
            <Tabs value={dictTab} onChange={(_, v) => setDictTab(v)} centered sx={{ borderBottom: '2px solid #F3F4F6' }}>
              <Tab label="Meaning" icon={<Book fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
              <Tab label="Word map" icon={<BubbleChart fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
              <Tab label="Etymology" icon={<Timeline fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
            </Tabs>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
              {dictTab === 0 && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0D9F72', mb: 1, fontFamily: KAI_TI }}>咖啡 (kāfēi)</Typography>
                  <Typography sx={{ color: '#6B7280', mb: 3, fontSize: '1rem', fontWeight: 600 }}>Coffee — a phonetic loanword.</Typography>
                  <Typography sx={{ fontWeight: 900, mb: 2, fontSize: '0.9rem', color: '#6B7280' }}>Example:</Typography>
                  <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: '16px', border: '2px solid #E5E7EB' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 1, fontFamily: KAI_TI }}>我想喝一杯热咖啡。</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#9CA3AF', fontStyle: 'italic' }}>I want to drink a cup of hot coffee.</Typography>
                  </Box>
                </Box>
              )}
              {dictTab === 1 && <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>Building word map...</Typography></Box>}
              {dictTab === 2 && <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>Loading character history...</Typography></Box>}
            </Box>
          </Box>
        )}
      </Box>
      <Snackbar
        open={!!voiceUiError}
        autoHideDuration={8000}
        onClose={() => setVoiceUiError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ maxWidth: 'min(92vw, 560px)' }}
      >
        <Alert onClose={() => setVoiceUiError(null)} severity="warning" variant="filled" sx={{ width: '100%' }}>
          {voiceUiError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={deepDiveCreditToast}
        autoHideDuration={4000}
        onClose={() => setDeepDiveCreditToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeepDiveCreditToast(false)} severity="info" variant="filled" sx={{ width: '100%' }}>
          No Deep Dive credits left today. Refreshes to {DEEP_DIVE_DAILY_LIMIT} daily.
        </Alert>
      </Snackbar>
      </>
    );
  };

  const DeepLearningScreen = () => (
    <Box sx={{ height: '100%', bgcolor: 'white', p: 4, display: 'flex', flexDirection: 'column' }}>
      <FloatingBackButton />
      <Box sx={{ textAlign: 'center', mt: 8, mb: 6 }}>
        <Typography sx={{ color: '#9CA3AF', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>Analysis</Typography>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>{deepLearningSentence}</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}><Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#F9FAFB' }}><Typography sx={{ fontWeight: 900, mb: 2 }}>Word breakdown</Typography><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'white', borderRadius: '16px' }}><Box><Typography sx={{ fontWeight: 900, fontFamily: KAI_TI }}>咖啡 (kāfēi)</Typography><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Coffee</Typography></Box><IconButton size="small"><VolumeUp fontSize="small" /></IconButton></Box></Box></Grid>
        </Grid>
      </Box>
      <ButtonBase onClick={() => setScreen(ScreenState.CHAT)} sx={{ mt: 'auto', py: 2, bgcolor: '#111827', color: 'white', borderRadius: '18px', fontWeight: 900 }}>Back to chat</ButtonBase>
    </Box>
  );

  const FeedbackScreen = () => {
    const sessionDuration = Math.floor((Date.now() - (messages[0]?.timestamp.getTime() || Date.now())) / 1000 / 60) || 5;
    const messageCount = messages.filter(m => m.sender === 'user').length || 8;
    const userScores = messages
      .filter((m) => m.sender === 'user' && m.score != null)
      .map((m) => m.score as number);
    const score = userScores.length
      ? Math.round(userScores.reduce((sum, n) => sum + n, 0) / userScores.length)
      : 88;

    const mockFeedback = {
      score,
      summary: "Great job in today's conversation practice! Your grammar is accurate and your vocabulary is strong. Keep up this learning pace, and you'll reach HSK 3 very soon.",
      suggestedFocus: 'tone & fluency',
      corrections: [
        {
          original: '我想要一个咖啡',
          corrected: '我想要一杯咖啡',
          explanation: 'Use the measure word 杯 for coffee, not 个.',
          type: 'vocabulary' as const,
        },
        {
          original: '多少钱这个？',
          corrected: '这个多少钱？',
          explanation: 'Put 多少钱 at the end: subject + object + how much.',
          type: 'grammar' as const,
        },
        {
          original: '可以我坐在这里吗？',
          corrected: '我可以坐在这里吗？',
          explanation: 'In questions, 可以 comes after the subject 我.',
          type: 'grammar' as const,
        },
      ],
    };

    return (
      <PracticeReportView
        payload={{
          score: mockFeedback.score,
          date: new Date(),
          durationMin: sessionDuration,
          turns: messageCount,
          summary: mockFeedback.summary,
          suggestedFocus: mockFeedback.suggestedFocus,
          corrections: mockFeedback.corrections,
        }}
        onBack={() => setScreen(ScreenState.CHAT)}
        onDone={() => {
          if (selectedTopic && messages.length > 0) {
            const historyItem: ChatHistoryItem = {
              id: Date.now().toString(),
              topic: selectedTopic.title,
              topicEmoji: selectedTopic.emoji || '💬',
              date: new Date().toISOString(),
              duration: sessionDuration,
              messageCount: messageCount,
              score: mockFeedback.score,
              feedback: {
                summary: mockFeedback.summary,
                suggestedFocus: mockFeedback.suggestedFocus,
                corrections: mockFeedback.corrections,
              },
            };
            dispatch(addHistory(historyItem));
          }
          goHome();
        }}
      />
    );
  };

  const HistoryListScreen = () => (
    <Box sx={{ height: '100%', bgcolor: '#FFF8F0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingBackButton />
      
      {/* Header */}
      <Box sx={{ px: 4, py: 3, borderBottom: '2px solid #E5E7EB', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 8 }}>
          <History sx={{ fontSize: 28, color: '#0D9F72' }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937' }}>History</Typography>
        </Box>
        {histories.length > 0 && (
          <ButtonBase
            onClick={() => {
              if (window.confirm('Clear all history?')) {
                histories.forEach(h => dispatch(deleteHistory(h.id)));
              }
            }}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              bgcolor: '#FEE2E2',
              color: '#DC2626',
              fontSize: '0.85rem',
              fontWeight: 900,
              border: '2px solid #FCA5A5',
              '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' },
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            Clear all
          </ButtonBase>
        )}
      </Box>

      {/* History List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
        {histories.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <History sx={{ fontSize: 64, color: '#D1D5DB' }} />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#9CA3AF' }}>No history yet</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#D1D5DB' }}>Finished sessions will show up here</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1000, mx: 'auto' }}>
            {histories.map((history) => (
              <Paper
                key={history.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '2px solid #E5E7EB',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#0D9F72',
                    boxShadow: '0 4px 12px rgba(13,159,114,0.15)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Topic Emoji & Info */}
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '20px', 
                  bgcolor: '#F3F4F6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  flexShrink: 0
                }}>
                  {history.topicEmoji}
                </Box>
                
                {/* Main Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#1F2937' }}>
                      {history.topic}
                    </Typography>
                    <Box sx={{ 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: '8px', 
                      bgcolor: history.score >= 90 ? '#DCFCE7' : history.score >= 80 ? '#FEF3C7' : '#FEE2E2',
                      border: '2px solid',
                      borderColor: history.score >= 90 ? '#86EFAC' : history.score >= 80 ? '#FDE047' : '#FCA5A5'
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: history.score >= 90 ? '#16A34A' : history.score >= 80 ? '#D97706' : '#DC2626' }}>
                        {history.score}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                      {new Date(history.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                      {history.duration} min · {history.messageCount} turns
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
                  <ButtonBase
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHistory(history);
                      setScreen(ScreenState.HISTORY_DETAIL);
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#0D9F72',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      '&:hover': { bgcolor: '#087A58' },
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <Assessment sx={{ fontSize: 16, mr: 0.5 }} />
                    View report
                  </ButtonBase>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this record?')) {
                        dispatch(deleteHistory(history.id));
                      }
                    }}
                    sx={{
                      bgcolor: '#FEE2E2',
                      color: '#DC2626',
                      '&:hover': { bgcolor: '#FCA5A5', color: 'white' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  const HistoryDetailScreen = () => {
    if (!selectedHistory) {
      setScreen(ScreenState.HISTORY_LIST);
      return null;
    }

    return (
      <PracticeReportView
        payload={{
          score: selectedHistory.score,
          date: new Date(selectedHistory.date),
          durationMin: selectedHistory.duration,
          turns: selectedHistory.messageCount,
          summary: selectedHistory.feedback.summary,
          suggestedFocus: selectedHistory.feedback.suggestedFocus,
          corrections: selectedHistory.feedback.corrections,
        }}
        onBack={() => setScreen(ScreenState.HISTORY_LIST)}
      />
    );
  };

  return (
    <Box id="ai-chat-root" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9F8', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden', bgcolor: '#F8F9F8' }}>
        {screen === ScreenState.HOME && <HomeScreen />}
        {screen === ScreenState.TOPIC_SELECTION && <TopicSelectionScreen />}
        {screen === ScreenState.CONFIG && <ConfigScreen />}
        {screen === ScreenState.ROLE_SELECTION && <RoleSelectionScreen />}
        {screen === ScreenState.CHAT && <ChatScreen />}
        {screen === ScreenState.FEEDBACK && <FeedbackScreen />}
        {screen === ScreenState.DEEP_LEARNING && <DeepLearningScreen />}
        {screen === ScreenState.HISTORY_LIST && <HistoryListScreen />}
        {screen === ScreenState.HISTORY_DETAIL && <HistoryDetailScreen />}
      </Box>
      <Snackbar
        open={llmSnack.open}
        autoHideDuration={llmSnack.open && llmSnack.mode === 'timeout' ? 8000 : 10000}
        onClose={() => setLlmSnack({ open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ maxWidth: 'min(92vw, 560px)' }}
      >
        <Alert
          onClose={() => setLlmSnack({ open: false })}
          severity="warning"
          variant="filled"
          sx={{
            width: '100%',
            alignItems: 'center',
            fontSize: '1rem',
            py: 1.5,
            px: 2,
            borderRadius: 2,
            boxShadow: 4,
          }}
          action={
            <Button
              color="inherit"
              size="large"
              sx={{ fontWeight: 800, minHeight: 48, px: 2 }}
              onClick={() => {
                const p = pendingLlmRetryRef.current;
                if (p) getPipeline().enqueueLlmRetry(p.text, p.isVoiceInput);
                setLlmSnack({ open: false });
              }}
            >
              Retry
            </Button>
          }
        >
          {!llmSnack.open
            ? ''
            : llmSnack.mode === 'timeout'
              ? 'Request timed out. Check your connection, then tap Retry.'
              : llmSnack.detail}
        </Alert>
      </Snackbar>
    </Box>
  );
}
