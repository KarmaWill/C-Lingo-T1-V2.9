import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Avatar, ButtonBase, Button, TextField, Grid, Tab, Tabs, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, Paper, Divider, Snackbar, Alert } from '@mui/material';

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
  GpsFixed as Target,
  TrendingUp,
  ErrorOutline as AlertCircle,
  History,
  Delete,
  Assessment,
  Star,
  Visibility,
  VisibilityOff,
  SlowMotionVideo,
  GraphicEq,
  GTranslate,
  ExpandMore,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addHistory, deleteHistory, ChatHistoryItem } from '../store/slices/chatHistorySlice';
import { aiService } from '../services/aiService';
import FeedbackEntryButton from '../components/feedback/FeedbackEntryButton';
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

const DEFAULT_HANZI_FONT = '"Noto Sans SC", "PingFang SC", sans-serif';
const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';
const PINYIN_SANS = 'Inter, "Noto Sans", system-ui, sans-serif';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const FloatingBackButton = ({ variant = 'light' }: { variant?: 'light' | 'dark' } = {}) => {
    const onDark = variant === 'dark';
    return (
    <ButtonBase 
      onClick={() => {
        if (screen === ScreenState.HOME) navigate('/');
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
        top: 24,
        left: 24,
        zIndex: 200,
        width: 48,
        height: 48,
        minWidth: 48,
        minHeight: 48,
        borderRadius: '50%',
        bgcolor: onDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px)',
        border: onDark ? '1px solid rgba(255,255,255,0.32)' : '1px solid rgba(23,63,53,0.12)',
        color: onDark ? '#FFFFFF' : '#173F35',
        boxShadow: onDark ? '0 8px 20px rgba(0,0,0,0.22)' : '0 6px 16px rgba(23,63,53,0.08)',
        '&:active': { transform: 'scale(0.92)' },
      }}
    >
      <BackIcon sx={{ fontSize: 22 }} />
    </ButtonBase>
    );
  };

  const HomeScreen = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 4,
        backgroundImage: 'url(/images/ai-speaking-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <FloatingBackButton />

      <Box
        sx={{
          position: 'absolute',
          top: 32,
          right: 40,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(255,255,255,0.72)',
          px: 2,
          py: 0.75,
          borderRadius: '999px',
          border: '1px solid rgba(13,170,120,0.22)',
          boxShadow: '0 8px 24px rgba(4,120,87,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            bgcolor: '#15B879',
            boxShadow: '0 0 0 4px rgba(21,184,121,0.13)',
          }}
        />
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#087A58', letterSpacing: '0.02em' }}>
          C-Lingo AI ready
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', maxWidth: 900 }}>
        <Box
          sx={{
            position: 'relative',
            width: 280,
            height: 300,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src="/images/clingo-ai-mascot-peace.png?v=wink"
            alt="C-Lingo AI"
            sx={{
              position: 'relative',
              zIndex: 1,
              width: 280,
              height: 280,
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 18px 28px rgba(4,80,59,0.16))',
            }}
          />
        </Box>

        <Box sx={{ textAlign: 'left', maxWidth: 430 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 1.5,
              px: 1.5,
              py: 0.65,
              borderRadius: '999px',
              bgcolor: '#EAF9F2',
              color: '#087A58',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18, color: '#E6A817' }} />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '0.08em' }}>
              C-LINGO AI SPEAKING
            </Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: '2.65rem',
              lineHeight: 1.12,
              mb: 1.5,
              color: '#173F35',
              letterSpacing: '-0.04em',
            }}
          >
            Speaking practice
            <br />
            <Box component="span" sx={{ color: '#0DAA78' }}>Speak naturally</Box>
          </Typography>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1.7, color: '#5E746D', fontWeight: 600, mb: 3 }}>
            Practice Chinese with C-Lingo AI.
            <br />
            Review pronunciation and phrasing after the conversation.
          </Typography>
          <ButtonBase
            onClick={() => setScreen(ScreenState.TOPIC_SELECTION)}
            sx={{
              minHeight: 54,
              px: 3.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #19BD82 0%, #07966A 100%)',
              color: 'white',
              boxShadow: '0 12px 26px rgba(7,150,106,0.24)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 900,
              fontSize: '1rem',
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Start chatting
            <ArrowForward sx={{ fontSize: 21 }} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );

  const TopicSelectionScreen = () => {
    const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
    const is960 = screenSize === '960x540';
    const is1920x1125 = screenSize === '1920x1125';
    const cardRadius = is1920x1125 ? '32px' : '28px';
    const scenarioLabels: Record<string, string> = { ordering: 'Coffee shop', dating: 'Asking Out', market: 'At the Market', travel: 'Travel Help', job: 'Job Interview' };
    const scenarioEmojis: Record<string, string> = { ordering: '☕️', dating: '😚', market: '🍎', travel: '✈️', job: '💼' };
    return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', p: is960 ? 2 : (is1920x1125 ? 4 : 3), position: 'relative' }}>
      {/* Top-left: circular back button */}
      <ButtonBase
        onClick={() => setScreen(ScreenState.HOME)}
        sx={{
          position: 'absolute',
          top: is960 ? 16 : (is1920x1125 ? 28 : 24),
          left: is960 ? 16 : (is1920x1125 ? 28 : 24),
          zIndex: 200,
          width: is960 ? 44 : (is1920x1125 ? 56 : 48),
          height: is960 ? 44 : (is1920x1125 ? 56 : 48),
          borderRadius: '50%',
          bgcolor: '#E5E7EB',
          color: '#374151',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        <BackIcon sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
      </ButtonBase>
      {/* Top-right: circular history/clock button */}
      <ButtonBase
        onClick={() => setScreen(ScreenState.HISTORY_LIST)}
        sx={{
          position: 'absolute',
          top: is960 ? 16 : (is1920x1125 ? 28 : 24),
          right: is960 ? 16 : (is1920x1125 ? 28 : 24),
          zIndex: 200,
          width: is960 ? 44 : (is1920x1125 ? 56 : 48),
          height: is960 ? 44 : (is1920x1125 ? 56 : 48),
          borderRadius: '50%',
          bgcolor: '#E5E7EB',
          color: '#374151',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        <History sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
      </ButtonBase>
      {/* Center title */}
      <Box sx={{ textAlign: 'center', mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5), pt: is960 ? 0 : (is1920x1125 ? 1 : 0) }}>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.65rem' : (is1920x1125 ? '2.4rem' : '2.15rem'), color: '#1F2937' }}>Choose practice mode</Typography>
      </Box>
      {/* Two cards side by side */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', px: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
        <Box sx={{ display: 'flex', gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5), maxWidth: is960 ? 700 : (is1920x1125 ? 1100 : 900), width: '100%', height: is960 ? '85%' : '90%', alignItems: 'stretch' }}>
          {/* Left card: Mode 1 - Free Dialogue (same height as right) */}
          <Box
            onClick={() => {
              setSelectedTopic({ id: 'free', title: 'Free Practice', emoji: '🎙️', desc: 'DIY free conversation mode' });
              setUserRole('Li Ming');
              setAiRole('Teacher Wang');
              setSceneDesc('At a café, Li Ming wants a latte. Teacher Wang is the barista.');
              setScreen(ScreenState.CONFIG);
            }}
            sx={{
              flex: is960 ? '0 0 38%' : '0 0 40%',
              p: is960 ? 2.5 : (is1920x1125 ? 3.5 : 3),
              bgcolor: 'white',
              borderRadius: cardRadius,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: '0.3s',
              minHeight: 0,
              '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.1)' },
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            <Typography sx={{ fontSize: is960 ? '1rem' : (is1920x1125 ? '1.25rem' : '1.15rem'), fontWeight: 900, color: '#DC2626', mb: is960 ? 2 : (is1920x1125 ? 2.5 : 2) }}>Mode 1: Free talk</Typography>
            <Box sx={{ width: is960 ? 72 : (is1920x1125 ? 100 : 88), height: is960 ? 72 : (is1920x1125 ? 100 : 88), borderRadius: is1920x1125 ? '20px' : '16px', bgcolor: '#EA580C', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: is960 ? '2rem' : (is1920x1125 ? '3rem' : '2.5rem') }}>💬</Box>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.2rem' : (is1920x1125 ? '1.65rem' : '1.45rem'), color: '#1F2937' }}>DIY: Free practice</Typography>
          </Box>
          {/* Right card: Mode 2 - Scenario Simulation (taller, 3x2 grid) */}
          <Box sx={{
            flex: '1 1 60%',
            p: is960 ? 2.5 : (is1920x1125 ? 3.5 : 3),
            bgcolor: 'white',
            borderRadius: cardRadius,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <Typography sx={{ fontSize: is960 ? '1rem' : (is1920x1125 ? '1.25rem' : '1.15rem'), fontWeight: 900, color: '#0D9F72', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75), textAlign: 'center' }}>Mode 2: Scenario practice</Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25) }}>
              {TOPICS.map(topic => (
                <ButtonBase
                  key={topic.id}
                  onClick={() => handleStartChat(topic)}
                  sx={{
                    p: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
                    bgcolor: '#FAFAFA',
                    borderRadius: is1920x1125 ? '16px' : '14px',
                    border: '1px solid #F0F0F0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.625),
                    transition: '0.3s',
                    '&:hover': { bgcolor: '#F5F5F5', borderColor: '#E5E7EB' },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.25rem' : '2rem') }}>{scenarioEmojis[topic.id] || topic.emoji}</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1.1rem' : '1rem'), color: '#1F2937', textAlign: 'center' }}>
                    {scenarioLabels[topic.id] || topic.title}
                  </Typography>
                </ButtonBase>
              ))}
              {/* Empty slot - bottom-right */}
              <Box sx={{ p: 1, bgcolor: 'transparent' }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    );
  };

  const ConfigScreen = () => {
    const isFreeMode = selectedTopic?.id === 'free';
    const difficultyInfo = DIFFICULTY_DESCRIPTIONS[difficulty];
    const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
    const is960 = screenSize === '960x540';
    const is1920x1125 = screenSize === '1920x1125';

    return (
      <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', p: is960 ? 2 : (is1920x1125 ? 4 : 3), position: 'relative' }}>
        {/* Header: circular back, center title "自由模式", circular clock */}
        <ButtonBase onClick={() => setScreen(ScreenState.TOPIC_SELECTION)} sx={{ position: 'absolute', top: is960 ? 16 : (is1920x1125 ? 28 : 24), left: is960 ? 16 : (is1920x1125 ? 28 : 24), zIndex: 200, width: is960 ? 44 : (is1920x1125 ? 56 : 48), height: is960 ? 44 : (is1920x1125 ? 56 : 48), borderRadius: '50%', bgcolor: 'white', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:active': { transform: 'scale(0.95)' } }}>
          <BackIcon sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
        </ButtonBase>
        <Box sx={{ position: 'absolute', top: is960 ? 16 : (is1920x1125 ? 28 : 24), right: is960 ? 16 : (is1920x1125 ? 28 : 24), zIndex: 200 }}>
          <ButtonBase onClick={() => setScreen(ScreenState.HISTORY_LIST)} sx={{ width: is960 ? 44 : (is1920x1125 ? 56 : 48), height: is960 ? 44 : (is1920x1125 ? 56 : 48), borderRadius: '50%', bgcolor: 'white', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:active': { transform: 'scale(0.95)' } }}>
            <History sx={{ fontSize: is960 ? 22 : (is1920x1125 ? 28 : 26) }} />
          </ButtonBase>
        </Box>
        <Box sx={{ textAlign: 'center', py: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25) }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), color: '#1F2937' }}>{isFreeMode ? 'Free mode' : 'Scenario mode'}</Typography>
        </Box>
        {/* Main content: blue card + white section */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <Box sx={{ width: '100%', maxWidth: is960 ? 640 : (is1920x1125 ? 900 : 800), height: is960 ? 380 : (is1920x1125 ? 520 : 450), bgcolor: 'white', borderRadius: is1920x1125 ? '32px' : '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden' }}>
            {/* Left: Blue Scenario Configuration card */}
            <Box sx={{ width: '35%', p: is960 ? 2.5 : (is1920x1125 ? 4 : 3), background: 'linear-gradient(160deg, #16B77E 0%, #087A58 100%)', color: 'white', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : (is1920x1125 ? '1.5rem' : '1.35rem'), mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75) }}>Scene setup</Typography>
              <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.75, p: 0.5, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.15)', mb: is960 ? 2 : (is1920x1125 ? 2.5 : 2) }}>
                {(['Easy', 'Medium', 'Hard'] as const).map(lv => (
                  <ButtonBase key={lv} onClick={(e) => { e.stopPropagation(); setDifficulty(lv); }} sx={{ flexGrow: 1, py: 1, borderRadius: '12px', fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1rem' : '0.9rem'), fontWeight: 900, color: lv === difficulty ? '#087A58' : 'white', bgcolor: lv === difficulty ? 'white' : 'transparent', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { bgcolor: lv === difficulty ? 'white' : 'rgba(255,255,255,0.15)' }, '&:active': { transform: 'scale(0.95)' } }}>
                    {lv}
                  </ButtonBase>
                ))}
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.1rem' : '1rem'), fontWeight: 900, mb: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25) }}>{difficultyInfo.title}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 0.75 : (is1920x1125 ? 1 : 0.875) }}>
                {difficultyInfo.features.map((feature, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'white', opacity: 0.9, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), opacity: 0.95, lineHeight: 1.4 }}>{feature}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, p: is960 ? 3 : (is1920x1125 ? 5 : 4), display: 'flex', flexDirection: 'column', gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5), justifyContent: 'center', minHeight: 0 }}>
            {/* Role A */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#EAF9F2', color: '#0D9F72', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Person sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>Role A</Typography>
                  {isEditing.userRole ? (
                    <TextField value={userRole} onChange={(e) => setUserRole(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, userRole: false })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing({ ...isEditing, userRole: false }); }} variant="standard" autoFocus InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, userRole: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{userRole}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomRole('user'); }} sx={{ color: '#E6A817', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(230,168,23,0.1)' } }}>
                  <Star sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22) }} />
                </ButtonBase>
              </Box>
            </Box>

            {/* Role B */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#EAF9F2', color: '#0D9F72', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BotIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>Role B</Typography>
                  {isEditing.aiRole ? (
                    <TextField value={aiRole} onChange={(e) => setAiRole(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, aiRole: false })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing({ ...isEditing, aiRole: false }); }} variant="standard" autoFocus InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, aiRole: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{aiRole}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomRole('ai'); }} sx={{ color: '#E6A817', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(230,168,23,0.1)' } }}>
                  <Star sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22) }} />
                </ButtonBase>
              </Box>
            </Box>

            {/* 场景描述 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#EAF9F2', color: '#0D9F72', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Book sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>Scene</Typography>
                  {isEditing.sceneDesc ? (
                    <TextField value={sceneDesc} onChange={(e) => setSceneDesc(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, sceneDesc: false })} variant="standard" autoFocus multiline maxRows={2} InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, sceneDesc: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{sceneDesc}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomScene(); }} sx={{ color: '#E6A817', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(230,168,23,0.1)' } }}>
                  <Star sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22) }} />
                </ButtonBase>
              </Box>
            </Box>

            <ButtonBase 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (userRole && aiRole && sceneDesc) {
                  setScreen(ScreenState.ROLE_SELECTION);
                }
              }}
              disabled={!userRole || !aiRole || !sceneDesc}
              sx={{ 
                mt: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), 
                height: is960 ? 48 : (is1920x1125 ? 60 : 56), 
                background: (userRole && aiRole && sceneDesc) ? 'linear-gradient(135deg, #19BD82 0%, #07966A 100%)' : '#9CA3AF',
                color: 'white', 
                borderRadius: is1920x1125 ? '16px' : '14px', 
                fontWeight: 900,
                fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'),
                cursor: (userRole && aiRole && sceneDesc) ? 'pointer' : 'not-allowed',
                opacity: (userRole && aiRole && sceneDesc) ? 1 : 0.5,
                transition: 'all 0.2s',
                '&:hover': { background: (userRole && aiRole && sceneDesc) ? 'linear-gradient(135deg, #16B77E 0%, #087A58 100%)' : '#9CA3AF' },
                '&:active': { transform: (userRole && aiRole && sceneDesc) ? 'scale(0.98)' : 'none' }
              }}
            >
              Start practice
            </ButtonBase>
          </Box>
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #0D3F32 0%, #062A22 100%)', color: 'white' }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            border: '6px solid rgba(255,255,255,0.1)', 
            borderTopColor: '#19BD82',
            borderRadius: '50%',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            },
            animation: 'spin 1s linear infinite' 
          }} />
          <Typography sx={{ mt: 4, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>AI tutor is getting ready...</Typography>
        </Box>
      );
  }

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is1920 = screenSize === '1920x1125';
  const is960 = screenSize === '960x540';

  return (
      <Box sx={{ height: '100%', width: '100%', background: 'radial-gradient(circle at 50% 45%, #145A46 0%, #0A372C 58%, #06271F 100%)', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        <FloatingBackButton variant="dark" />

        <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: is1920 ? 6 : (is960 ? 2 : 4), boxSizing: 'border-box' }}>
          {/* 标题 - 设计稿：选择您的身份 */}
          <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2.5rem' : (is960 ? '1.5rem' : '2rem'), color: 'white', textAlign: 'center', mb: is1920 ? 1.5 : 1 }}>
            Choose your role
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.25rem' : (is960 ? '0.9rem' : '1.1rem'), textAlign: 'center', mb: is1920 ? 5 : (is960 ? 3 : 4) }}>
            Tap a role. The AI will play the other side.
          </Typography>

          {/* 两个角色卡片 - 设计稿：左右并排，图片在左、文字在右 */}
          <Box sx={{ display: 'flex', gap: is1920 ? 4 : (is960 ? 2 : 3), maxWidth: is1920 ? 1200 : (is960 ? 640 : 900), width: '100%', justifyContent: 'center', flexWrap: 'wrap', mb: is1920 ? 5 : (is960 ? 3 : 4) }}>
            {/* 角色A - 顾客 */}
            <ButtonBase
              onClick={() => setPlayedRole('A')}
              sx={{
                flex: is1920 ? '0 1 480px' : (is960 ? '0 1 300px' : '0 1 420px'),
                minWidth: 0,
                display: 'flex',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: is1920 ? '32px' : '24px',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: selectedRole === 'A' ? '3px solid #43D69C' : '1px solid rgba(255,255,255,0.14)',
                overflow: 'hidden',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: selectedRole === 'A' ? '0 0 32px rgba(67,214,156,0.24)' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              {selectedRole === 'A' && (
                <Box sx={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, bgcolor: '#19BD82', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <CheckCircle sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              )}
              <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#19BD82', color: 'white', px: 2, py: 0.5, borderRadius: '0 32px 0 16px', fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 900, zIndex: 2 }}>
                Role A
              </Box>
              <Box
                component="img"
                src={ROLE_A_AVATAR}
                alt={userRole || 'Role A'}
                sx={{ width: is1920 ? 200 : (is960 ? 120 : 160), height: 'auto', aspectRatio: '1', objectFit: 'cover', borderRadius: is1920 ? '24px 0 0 24px' : '20px 0 0 20px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: is1920 ? 3 : (is960 ? 2 : 2.5), minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2rem' : (is960 ? '1.2rem' : '1.6rem'), color: 'white', mb: 0.5 }}>{userRole || 'You'}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.1rem' : (is960 ? '0.8rem' : '0.95rem') }}>Play as Role A</Typography>
              </Box>
            </ButtonBase>

            {/* 角色B - 咖啡师 */}
            <ButtonBase
              onClick={() => setPlayedRole('B')}
              sx={{
                flex: is1920 ? '0 1 480px' : (is960 ? '0 1 300px' : '0 1 420px'),
                minWidth: 0,
                display: 'flex',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: is1920 ? '32px' : '24px',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: selectedRole === 'B' ? '3px solid #E7B92F' : '1px solid rgba(255,255,255,0.14)',
                overflow: 'hidden',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: selectedRole === 'B' ? '0 0 32px rgba(231,185,47,0.22)' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              {selectedRole === 'B' && (
                <Box sx={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, bgcolor: '#E7B92F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <CheckCircle sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              )}
              <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#E7B92F', color: '#173F35', px: 2, py: 0.5, borderRadius: '0 32px 0 16px', fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 900, zIndex: 2 }}>
                Role B
              </Box>
              <Box
                component="img"
                src={ROLE_B_AVATAR}
                alt={aiRole || 'Role B'}
                sx={{ width: is1920 ? 200 : (is960 ? 120 : 160), height: 'auto', aspectRatio: '1', objectFit: 'cover', borderRadius: is1920 ? '24px 0 0 24px' : '20px 0 0 20px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: is1920 ? 3 : (is960 ? 2 : 2.5), minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2rem' : (is960 ? '1.2rem' : '1.6rem'), color: 'white', mb: 0.5 }}>{aiRole || 'AI partner'}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.1rem' : (is960 ? '0.8rem' : '0.95rem') }}>Play as Role B</Typography>
              </Box>
            </ButtonBase>
          </Box>

          {/* 进入实战对话按钮 - 设计稿：紫色、药丸形、带箭头 */}
          <ButtonBase
            onClick={handleConfirm}
            disabled={!selectedRole}
            sx={{
              px: is1920 ? 10 : (is960 ? 5 : 8),
              py: is1920 ? 2 : (is960 ? 1.25 : 1.5),
              borderRadius: '9999px',
              background: !selectedRole ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #19BD82 0%, #07966A 100%)',
              color: 'white',
              fontWeight: 900,
              fontSize: is1920 ? '1.5rem' : (is960 ? '1rem' : '1.25rem'),
              opacity: !selectedRole ? 0.5 : 1,
              cursor: !selectedRole ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              '&:active': { transform: !selectedRole ? 'none' : 'scale(0.97)' },
            }}
          >
            {!selectedRole ? 'Select a role' : 'Start conversation'}
            {selectedRole && <ArrowForward sx={{ fontSize: is1920 ? 28 : 24 }} />}
          </ButtonBase>
        </Box>
      </Box>
    );
  };

  const ChatScreen = () => {
    const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
    const is1920 = screenSize === '1920x1125';
    const is960 = screenSize === '960x540';
    const [maskedIds, setMaskedIds] = useState<string[]>([]);
    const [showPinyin, setShowPinyin] = useState(true);
    const [slowSpeech, setSlowSpeech] = useState(false);
    const [showPipeline, setShowPipeline] = useState(false);
    const [inputText, setInputText] = useState('');
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
    const headerActionHeight = is1920 ? 52 : 48;
    const [activeDeepLearning, setActiveDeepLearning] = useState<Message | null>(null);
    const [deepDiveCredits, setDeepDiveCredits] = useState<DeepDiveCreditState>(() => getDeepDiveCredits());
    const [deepDiveCreditToast, setDeepDiveCreditToast] = useState(false);
    const [creditChipPulse, setCreditChipPulse] = useState(false);
    const [deepDiveOpenSections, setDeepDiveOpenSections] = useState({
      when: true,
      grammar: false,
      culture: false,
    });
    const [showTranslationIds, setShowTranslationIds] = useState<string[]>([]); // Track which messages show translation
    const [expandedSpeechIds, setExpandedSpeechIds] = useState<string[]>([]); // <60 Speech metrics panel
    
    // 语音录音相关状态
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState<string>(''); // 录音识别的文本（用于显示）
    const [countdown, setCountdown] = useState<number>(0); // 倒计时（秒）
    const recognition = useRef<SpeechRecognition | null>(null);
    const recordedTextRef = useRef<string>(''); // 用于在 onend 中访问最新的文本
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null); // 倒计时定时器
    /** 与 recognition 实际是否在跑同步；避免 stopRecording 读到过期的 isRecording 闭包（快速点按尤其明显） */
    const isRecordingActiveRef = useRef(false);
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
      setActiveDeepLearning(msg);
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

    return (
      <>
      <Box sx={{ height: '100%', minHeight: 0, display: 'flex', bgcolor: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
        {/* Main Chat Area */}
        <Box sx={{ 
          flex: activeDeepLearning ? '0 0 55%' : '1',
          minWidth: 0,
          minHeight: 0,
          display: 'flex', 
          flexDirection: 'column', 
          bgcolor: 'white',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: activeDeepLearning ? '1px solid #E5E7EB' : 'none'
        }}>
          {/* Header - 设计稿：左箭头、AI导师-沉浸模式、拼音(eye)、绿色结束练习 */}
          <Box sx={{ px: is1920 ? 5 : 4, py: is1920 ? 3 : 2.5, bgcolor: 'white', borderBottom: '2px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: is1920 ? 3 : 2.5 }}>
              <ButtonBase onClick={() => setScreen(ScreenState.TOPIC_SELECTION)} sx={{ width: is1920 ? 56 : 48, height: is1920 ? 56 : 48, borderRadius: '50%', bgcolor: '#E5E7EB', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:active': { transform: 'scale(0.95)' } }}>
                <BackIcon sx={{ fontSize: is1920 ? 24 : 20 }} />
              </ButtonBase>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '1.5rem' : '1.1rem', color: '#1F2937' }}>AI Tutor · Immersive</Typography>
                <Typography sx={{ fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 600, color: '#6B7280' }}>Live practice</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: is1920 ? 2 : 1.5 }}>
              <ButtonBase
                onClick={() => setSlowSpeech((prev) => !prev)}
                aria-label={slowSpeech ? 'Slow speech on' : 'Normal speech speed'}
                aria-pressed={slowSpeech}
                sx={{
                  width: headerActionHeight,
                  height: headerActionHeight,
                  minWidth: headerActionHeight,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: slowSpeech ? '#86EFAC' : '#E5E7EB',
                  bgcolor: slowSpeech ? '#F0FDF4' : '#F9FAFB',
                  color: slowSpeech ? '#0D9F72' : '#6B7280',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <SlowMotionVideo sx={{ fontSize: is1920 ? 24 : 22 }} />
              </ButtonBase>
              <ButtonBase
                onClick={() => setShowPinyin(!showPinyin)}
                aria-label={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
                aria-pressed={showPinyin}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  height: headerActionHeight,
                  px: 2,
                  py: 0,
                  borderRadius: '12px',
                  bgcolor: showPinyin ? '#F0FDF4' : '#F9FAFB',
                  color: showPinyin ? '#0D9F72' : '#6B7280',
                  border: '1px solid',
                  borderColor: showPinyin ? '#86EFAC' : '#E5E7EB',
                  flexShrink: 0,
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {showPinyin
                  ? <Visibility sx={{ fontSize: is1920 ? 22 : 20 }} />
                  : <VisibilityOff sx={{ fontSize: is1920 ? 22 : 20 }} />}
                <Typography sx={{ fontWeight: 700, fontSize: is1920 ? '1rem' : '0.9rem', lineHeight: 1 }}>Pinyin</Typography>
              </ButtonBase>
              <ButtonBase
                onClick={() => setScreen(ScreenState.FEEDBACK)}
                sx={{
                  height: headerActionHeight,
                  px: is1920 ? 4 : 3,
                  py: 0,
                  borderRadius: '14px',
                  bgcolor: '#0D9F72',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: is1920 ? '1rem' : '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                End practice
              </ButtonBase>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: is1920 ? 5 : 4, display: 'flex', flexDirection: 'column', gap: is1920 ? 5 : 4, pb: is1920 ? 28 : 24 }}>
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
                  width: msg.sender === 'user' ? (is1920 ? 560 : 460) : 'auto',
                  maxWidth: '82%',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <Avatar
                    src={
                      msg.sender === 'user'
                        ? (playedRole === 'B' ? ROLE_B_AVATAR : ROLE_A_AVATAR)
                        : (playedRole === 'B' ? ROLE_A_AVATAR : ROLE_B_AVATAR)
                    }
                    alt={msg.sender === 'user' ? (userRole || 'You') : (aiRole || 'Partner')}
                    sx={{
                      width: is1920 ? 60 : 48,
                      height: is1920 ? 60 : 48,
                      bgcolor: '#EAF9F2',
                      borderRadius: is1920 ? '20px' : '16px',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '& .MuiAvatar-img': { objectFit: 'cover' },
                    }}
                  />
                  
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {msg.sender === 'user' && msg.score != null ? (
                      (() => {
                        const high = msg.score >= 60;
                        const breakdown = msg.speechBreakdown ?? buildSpeechBreakdown(msg.score);
                        const metricsOpen = expandedSpeechIds.includes(msg.id);
                        const accentBg = high
                          ? 'linear-gradient(90deg, #2DD4BF 0%, #14B8A6 55%, #0D9488 100%)'
                          : 'linear-gradient(90deg, #FB923C 0%, #F97316 50%, #EA580C 100%)';
                        const badgeHeight = is1920 ? 40 : 36;
                        const metricsBarHeight = is1920 ? 40 : 34;
                        const metricItems = [
                          { label: 'Speech', value: breakdown.speech },
                          { label: 'Fluency', value: breakdown.fluency },
                          { label: 'Accuracy', value: breakdown.accuracy },
                          { label: 'Completeness', value: breakdown.completeness },
                        ];
                        return (
                          <Box
                            sx={{
                              position: 'relative',
                              borderRadius: '22px',
                              overflow: 'hidden',
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              boxShadow: '0 8px 22px rgba(15,23,42,0.08)',
                            }}
                          >
                            {metricsOpen && (
                              <Box
                                sx={{
                                  background: accentBg,
                                  px: is1920 ? 2.25 : 1.6,
                                  height: metricsBarHeight,
                                  display: 'flex',
                                  flexWrap: 'nowrap',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: is1920 ? 1.5 : 0.9,
                                }}
                              >
                                {metricItems.map((item) => (
                                  <Typography
                                    key={item.label}
                                    sx={{
                                      fontSize: is1920 ? '0.8rem' : '0.68rem',
                                      fontWeight: 800,
                                      color: '#FFFFFF',
                                      letterSpacing: '0.01em',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {item.label}: {item.value}
                                  </Typography>
                                ))}
                              </Box>
                            )}

                            {/* Speech score toggle — tucked into the card's top-right corner */}
                            <ButtonBase
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedSpeechIds((prev) =>
                                  prev.includes(msg.id) ? prev.filter((id) => id !== msg.id) : [...prev, msg.id],
                                );
                              }}
                              aria-label={metricsOpen ? 'Collapse speech scores' : 'Expand speech scores'}
                              aria-expanded={metricsOpen}
                              sx={{
                                position: 'absolute',
                                top: metricsOpen ? metricsBarHeight : 0,
                                right: 0,
                                zIndex: 3,
                                height: badgeHeight,
                                minHeight: badgeHeight,
                                pl: is1920 ? 1.6 : 1.35,
                                pr: is1920 ? 1.1 : 0.9,
                                borderRadius: metricsOpen ? '0 0 0 16px' : '0 22px 0 16px',
                                background: accentBg,
                                color: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.2,
                                '&:active': { transform: 'scale(0.97)' },
                              }}
                            >
                              <Typography sx={{ fontSize: is1920 ? '0.95rem' : '0.85rem', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1 }}>
                                Speech {msg.score}
                              </Typography>
                              {metricsOpen
                                ? <KeyboardArrowLeft sx={{ fontSize: is1920 ? 20 : 18 }} />
                                : <KeyboardArrowRight sx={{ fontSize: is1920 ? 20 : 18 }} />}
                            </ButtonBase>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: is1920 ? 2.25 : 1.6,
                                pt: `${badgeHeight + (is1920 ? 12 : 10)}px`,
                                pb: is1920 ? 2.25 : 1.75,
                              }}
                            >
                                <ButtonBase
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playTTS(msg.text, msg.id);
                                  }}
                                  aria-label="Play sentence"
                                  sx={{
                                    width: is1920 ? 48 : 44,
                                    height: is1920 ? 48 : 44,
                                    minWidth: 44,
                                    minHeight: 44,
                                    borderRadius: '50%',
                                    bgcolor: '#F97316',
                                    color: '#FFFFFF',
                                    flexShrink: 0,
                                    boxShadow: '0 6px 14px rgba(249,115,22,0.35)',
                                    '&:active': { transform: 'scale(0.94)' },
                                  }}
                                >
                                  <VolumeUp sx={{ fontSize: is1920 ? 24 : 22 }} />
                                </ButtonBase>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <ConversationRubyText
                                    text={msg.text}
                                    pinyin={msg.pinyin}
                                    showPinyin={showPinyin}
                                    align="left"
                                    textColor="#111827"
                                    pinyinColor="#6B7280"
                                    textSize={is1920 ? '1.55rem' : '1.35rem'}
                                    pinyinSize={is1920 ? '0.9rem' : '0.78rem'}
                                    hanziFontFamily={KAI_TI}
                                    columnGap="0.55em"
                                    rowGap={1.1}
                                  />
                                  {showTranslationIds.includes(msg.id) && msg.translation && (
                                    <Typography
                                      sx={{
                                        mt: 1.5,
                                        pt: 1.5,
                                        borderTop: '1px solid #E5E7EB',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        fontStyle: 'italic',
                                        color: '#6B7280',
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {msg.translation}
                                    </Typography>
                                  )}
                                </Box>
                            </Box>
                          </Box>
                        );
                      })()
                    ) : (
                      <>
                    {/* Message Bubble */}
                    <Box 
                      onClick={() => msg.sender === 'ai' && setMaskedIds(prev => prev.includes(msg.id) ? prev.filter(mid => mid !== msg.id) : [...prev, msg.id])}
                      sx={{ 
                        px: msg.sender === 'user' ? 4 : 3,
                        py: msg.sender === 'user' ? 3.5 : 3,
                        minHeight: msg.sender === 'user' ? (is1920 ? 164 : 140) : 'auto',
                        borderRadius: msg.sender === 'user' ? '30px' : '24px',
                        bgcolor: msg.sender === 'user' ? '#0D9F72' : 'white',
                        color: msg.sender === 'user' ? 'white' : '#1F2937', 
                        border: msg.sender === 'ai' ? '2px solid #E5E7EB' : 'none',
                        boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(13,159,114,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        cursor: msg.sender === 'ai' ? 'pointer' : 'default',
                        transition: 'all 0.3s',
                        '&:hover': msg.sender === 'ai' ? { borderColor: '#63CFAA' } : {},
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
                          align={msg.sender === 'user' ? 'center' : 'left'}
                          textColor={msg.sender === 'user' ? '#FFFFFF' : '#1F2937'}
                          pinyinColor={msg.sender === 'user' ? 'rgba(255,255,255,0.78)' : '#5E746D'}
                          textSize={msg.sender === 'user' ? (is1920 ? '2.1rem' : '1.8rem') : (is1920 ? '1.35rem' : '1.15rem')}
                          pinyinSize={msg.sender === 'user' ? (is1920 ? '1.1rem' : '0.95rem') : (is1920 ? '0.85rem' : '0.72rem')}
                          hanziFontFamily={KAI_TI}
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
                            fontSize: 40, 
                            color: '#0D9F72',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                              '50%': { opacity: 0.7, transform: 'scale(1.1)' }
                            }
                          }} />
                          <Typography sx={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 900, 
                            color: '#0D9F72',
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            px: 2,
                            py: 0.5,
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,180,160,0.2)'
                          }}>
                            Playing...
                          </Typography>
                        </Box>
                      )}
                      
                      {/* Translation Display - shows when translation button is clicked */}
                      {showTranslationIds.includes(msg.id) && msg.translation && (
                        <Box sx={{ 
                          mt: 2.5, 
                          pt: 2.5, 
                          borderTop: '2px solid', 
                          borderColor: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)'
                        }}>
                          <Typography sx={{ 
                            fontSize: '0.95rem', 
                            fontWeight: 600, 
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            color: msg.sender === 'user' ? 'rgba(255,255,255,0.85)' : '#6B7280'
                          }}>
                            {msg.translation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                      </>
                    )}

                    {/* Action Buttons — structure from ref, brand green primary */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1, 
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      flexWrap: 'wrap'
                    }}>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          playTTS(msg.text, msg.id);
                        }}
                        sx={{
                          px: 2,
                          py: 0,
                          minHeight: 42,
                          borderRadius: '14px',
                          bgcolor: '#F3F4F6',
                          color: playingAudioId === msg.id ? '#0D9F72' : '#374151',
                          border: '1px solid',
                          borderColor: playingAudioId === msg.id ? '#86EFAC' : '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#EEF2F7',
                            borderColor: '#D1D5DB',
                          },
                          '&:active': { transform: 'scale(0.96)' }
                        }}
                      >
                        <GraphicEq sx={{ fontSize: 18, color: playingAudioId === msg.id ? '#0D9F72' : '#4B5563' }} />
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {playingAudioId === msg.id ? 'Playing' : 'Speak'}
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
                            px: 2,
                            py: 0,
                            minHeight: 42,
                            borderRadius: '14px',
                            bgcolor: showTranslationIds.includes(msg.id) ? '#F0FDF4' : '#F3F4F6',
                            border: '1px solid',
                            borderColor: showTranslationIds.includes(msg.id) ? '#86EFAC' : '#E5E7EB',
                            color: showTranslationIds.includes(msg.id) ? '#0D9F72' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#EEF2F7', borderColor: '#D1D5DB' },
                            '&:active': { transform: 'scale(0.96)' }
                          }}
                        >
                          <GTranslate sx={{ fontSize: 18 }} />
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Translate</Typography>
                        </ButtonBase>
                      )}

                      <ButtonBase 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeepDive(msg);
                        }}
                        sx={{ 
                          pl: 2,
                          pr: 0.85,
                          py: 0,
                          minHeight: 42,
                          borderRadius: '14px',
                          background: deepDiveCredits.remaining > 0
                            ? 'linear-gradient(135deg, #12B981 0%, #0D9F72 55%, #059669 100%)'
                            : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.85,
                          boxShadow: deepDiveCredits.remaining > 0 ? '0 6px 14px rgba(13,159,114,0.28)' : 'none',
                          opacity: deepDiveCredits.remaining > 0 || activeDeepLearning?.id === msg.id ? 1 : 0.72,
                          '&:hover': {
                            background: deepDiveCredits.remaining > 0
                              ? 'linear-gradient(135deg, #10B981 0%, #0B8F66 55%, #047857 100%)'
                              : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                          },
                          '&:active': { transform: 'scale(0.96)' }
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 17 }} />
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                          Deep Dive
                        </Typography>
                        <Box
                          sx={{
                            minWidth: 24,
                            height: 24,
                            px: 0.65,
                            borderRadius: '999px',
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: deepDiveCredits.remaining > 0 ? '#0D9F72' : '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 900,
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
              <Box sx={{ display: 'flex', gap: 2, ml: 7, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#D1D5DB', 
                    borderRadius: '50%',
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'translateY(0)' },
                      '40%': { transform: 'translateY(-8px)' }
                    },
                    animation: 'bounce 1.4s infinite ease-in-out'
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#D1D5DB', 
                    borderRadius: '50%',
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'translateY(0)' },
                      '40%': { transform: 'translateY(-8px)' }
                    },
                    animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#D1D5DB', 
                    borderRadius: '50%',
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'translateY(0)' },
                      '40%': { transform: 'translateY(-8px)' }
                    },
                    animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                  }} />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>AI tutor is thinking...</Typography>
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

          {/* Input Area - 设计稿：底部固定，grid图标+紫色按住说话 */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: is1920 ? 4 : 3, bgcolor: 'white', borderTop: '2px solid #F3F4F6', pb: is1920 ? 5 : 4, zIndex: 20 }}>
            {isRecording ? (
              <Box
                role="status"
                aria-live="polite"
                sx={{
                  minHeight: 82,
                  mb: 1.5,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '18px',
                  bgcolor: '#F3FBF7',
                  border: '1.5px solid #B8E7D3',
                  boxShadow: '0 8px 24px rgba(7,150,106,0.1)',
                  display: 'grid',
                  gridTemplateColumns: '48px minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    bgcolor: '#E5484D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 7px rgba(229,72,77,0.1)',
                    animation: 'recordingPulse 1.4s ease-in-out infinite',
                    '@keyframes recordingPulse': {
                      '0%, 100%': { boxShadow: '0 0 0 7px rgba(229,72,77,0.08)' },
                      '50%': { boxShadow: '0 0 0 11px rgba(229,72,77,0.15)' },
                    },
                  }}
                >
                  <Mic sx={{ fontSize: 25 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.7 }}>
                    <Typography sx={{ color: '#173F35', fontSize: '0.95rem', fontWeight: 900 }}>
                      Listening
                    </Typography>
                    <Box sx={{ height: 22, display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      {[10, 18, 13, 22, 16, 9, 19, 12].map((height, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 3,
                            height,
                            borderRadius: '999px',
                            bgcolor: '#19A976',
                            animation: `recordingWave ${0.55 + i * 0.05}s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.06}s`,
                            '@keyframes recordingWave': {
                              from: { transform: 'scaleY(0.45)', opacity: 0.45 },
                              to: { transform: 'scaleY(1)', opacity: 1 },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Typography noWrap sx={{ color: recordedText ? '#425B53' : '#82938D', fontSize: '0.78rem', fontWeight: 700 }}>
                    {recordedText || 'Speak Chinese, release to send'}
                  </Typography>
                </Box>

                <Box sx={{ minWidth: 66, px: 1.5, py: 0.9, bgcolor: '#FFFFFF', border: '1px solid #DCE9E3', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ color: '#087A58', fontSize: '1rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                    00:{String(countdown).padStart(2, '0')}
                  </Typography>
                </Box>
              </Box>
            ) : (
            <Box sx={{ mb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, flexWrap: 'wrap' }}>
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
                    bgcolor: showPipeline ? '#F0FDF4' : '#F9FAFB',
                    color: showPipeline ? '#087A58' : '#6B7280',
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
                    justifyContent: 'center',
                    gap: 0.75,
                    flexWrap: 'wrap',
                    px: 1,
                    py: 0.75,
                    borderRadius: '12px',
                    bgcolor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
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
                            fontSize: is1920 ? '0.85rem' : '0.75rem',
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
            </Box>
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

            {/* Input Row */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton 
                onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')} 
                sx={{ 
                  width: is1920 ? 60 : 52, 
                  height: is1920 ? 60 : 52, 
                  bgcolor: '#F9FAFB', 
                  border: '2px solid #E5E7EB',
                  borderRadius: '16px',
                  color: '#6B7280',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#F3F4F6', borderColor: '#9CA3AF' }
                }}
              >
                {inputMode === 'voice' ? <Keyboard sx={{ fontSize: is1920 ? 28 : 24 }} /> : <Mic sx={{ fontSize: is1920 ? 28 : 24 }} />}
              </IconButton>
              
              <Box sx={{ flexGrow: 1 }}>
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
                        height: 52, 
                        px: 3, 
                        bgcolor: '#F9FAFB', 
                        borderRadius: '16px', 
                        border: '2px solid #E5E7EB',
                        fontWeight: 700,
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        '&:focus-within': {
                          bgcolor: 'white',
                          borderColor: '#0D9F72',
                          boxShadow: '0 0 0 3px rgba(0,180,160,0.1)'
                        }
                      } 
                    }} 
                  />
                ) : (
                  <ButtonBase 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (pipelineBusy && !isRecordingActiveRef.current) return;
                      if (!isRecordingActiveRef.current) {
                        startRecording();
                      }
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      if (isRecordingActiveRef.current) {
                        stopRecording();
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isRecordingActiveRef.current) {
                        e.preventDefault();
                        stopRecording();
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      if (pipelineBusy && !isRecordingActiveRef.current) return;
                      if (!isRecordingActiveRef.current) {
                        startRecording();
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      if (isRecordingActiveRef.current) {
                        stopRecording();
                      }
                    }}
                    onTouchCancel={(e) => {
                      if (isRecordingActiveRef.current) {
                        e.preventDefault();
                        stopRecording();
                      }
                    }}
                    sx={{ 
                      width: '100%', 
                      height: is1920 ? 60 : 52, 
                      background: isRecording ? '#EF4444' : pipelineBusy ? '#9CA3AF' : 'linear-gradient(135deg, #19BD82 0%, #07966A 100%)',
                      color: 'white', 
                      borderRadius: is1920 ? '20px' : '16px', 
                      fontWeight: 900, 
                      fontSize: is1920 ? '1.15rem' : '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      boxShadow: isRecording ? '0 4px 12px rgba(239,68,68,0.4)' : pipelineBusy ? 'none' : '0 8px 20px rgba(7,150,106,0.24)',
                      transition: 'all 0.2s',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      position: 'relative',
                      cursor: pipelineBusy && !isRecording ? 'not-allowed' : 'pointer',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    {isRecording ? (
                      <>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#FFFFFF', animation: 'recordDot 0.9s ease-in-out infinite alternate', '@keyframes recordDot': { from: { opacity: 0.4 }, to: { opacity: 1 } } }} />
                        Release to send
                        <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.86, fontVariantNumeric: 'tabular-nums' }}>
                          00:{String(countdown).padStart(2, '0')}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Mic sx={{ fontSize: 24 }} />
                        {pipelineBusy ? 'Please wait…' : 'Hold to talk'}
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
                    width: 52, 
                    height: 52, 
                    bgcolor: inputText.trim() ? '#111827' : '#E5E7EB', 
                    color: 'white', 
                    borderRadius: '16px',
                    opacity: inputText.trim() ? 1 : 0.5,
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: inputText.trim() ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': inputText.trim() ? { bgcolor: '#0D9F72' } : {},
                    '&:active': inputText.trim() ? { transform: 'scale(0.95)' } : {}
                  }}
                >
                  <Send sx={{ fontSize: 22 }} />
                </ButtonBase>
              )}
            </Box>
          </Box>
        </Box>

        {/* Deep Learning Split Panel */}
        {activeDeepLearning && (
          <Box sx={{ 
            flex: '0 0 45%',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#FAFAFA',
            overflow: 'hidden',
            animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideInRight': {
              from: { transform: 'translateX(100%)', opacity: 0 },
              to: { transform: 'translateX(0)', opacity: 1 }
            }
          }}>
            {/* Deep Learning Header */}
            <Box sx={{ flexShrink: 0, px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#0D9F72', borderRadius: '50%', flexShrink: 0 }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#1F2937', lineHeight: 1.15 }}>Deep Dive</Typography>
                </Box>
                <Typography sx={{ mt: 0.55, ml: 2.75, fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>
                  −{DEEP_DIVE_COST} credit · {deepDiveCredits.remaining} left today
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setActiveDeepLearning(null)} 
                sx={{ 
                  bgcolor: '#F3F4F6', 
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } 
                }}
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Scrollable body */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.25,
              }}
            >
              {/* Sentence — KaiTi ruby */}
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid #E5E7EB',
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    mb: 1.25,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Sentence
                </Typography>
                <ConversationRubyText
                  text={activeDeepLearning.text}
                  pinyin={activeDeepLearning.pinyin}
                  showPinyin
                  align="left"
                  textColor="#1F2937"
                  pinyinColor="#0D9F72"
                  textSize="1.35rem"
                  pinyinSize="0.72rem"
                  hanziFontFamily={KAI_TI}
                  columnGap="0.45em"
                  rowGap={1.5}
                />
                {activeDeepLearning.translation && (
                  <Typography
                    sx={{
                      mt: 2,
                      pt: 1.75,
                      borderTop: '1px solid #F1F5F9',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      color: '#64748B',
                      lineHeight: 1.55,
                    }}
                  >
                    {activeDeepLearning.translation}
                  </Typography>
                )}
              </Box>

              {/* Keywords — 2–3 core words */}
              {(() => {
                const keywords = pickDeepDiveKeywords(
                  activeDeepLearning.text,
                  activeDeepLearning.pinyin ?? '',
                  3,
                );
                if (!keywords.length) return null;
                return (
                  <Box
                    sx={{
                      bgcolor: 'white',
                      p: 2.25,
                      borderRadius: '20px',
                      border: '1px solid #E5E7EB',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        mb: 1.5,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#94A3B8',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      {keywords.map((kw) => (
                        <Box
                          key={`${kw.chinese}-${kw.pinyin}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.35,
                            borderRadius: '14px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #EEF2F7',
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#0D9F72',
                                lineHeight: 1.1,
                                letterSpacing: '0.02em',
                              }}
                            >
                              {kw.pinyin}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.25,
                                fontFamily: KAI_TI,
                                fontSize: '1.35rem',
                                fontWeight: 700,
                                color: '#0F172A',
                                lineHeight: 1.15,
                              }}
                            >
                              {kw.chinese}
                            </Typography>
                            <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                              <Box
                                sx={{
                                  px: 0.9,
                                  py: 0.25,
                                  borderRadius: '8px',
                                  bgcolor: '#EEF2FF',
                                  color: '#4338CA',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  lineHeight: 1.2,
                                }}
                              >
                                {kw.pos}
                              </Box>
                              {kw.hsk != null && (
                                <Box
                                  sx={{
                                    px: 0.9,
                                    py: 0.25,
                                    borderRadius: '8px',
                                    bgcolor: '#EEFDF9',
                                    color: '#0D9F72',
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  HSK {kw.hsk}
                                </Box>
                              )}
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B', textAlign: 'right' }}>
                            {kw.gloss}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })()}

              {/* Multilingual knowledge — 3 expandable blocks */}
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
                      bgcolor: 'white',
                      borderRadius: '18px',
                      border: '1px solid #E5E7EB',
                      overflow: 'hidden',
                      flexShrink: 0,
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
                        gap: 1.5,
                        px: 2,
                        py: 1.6,
                        textAlign: 'left',
                        '&:active': { bgcolor: '#F8FAFC' },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.2 }}>
                          {section.title}
                        </Typography>
                        <Typography sx={{ mt: 0.35, fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>
                          {section.subtitle}
                        </Typography>
                      </Box>
                      <ExpandMore
                        sx={{
                          color: '#64748B',
                          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 180ms ease',
                          flexShrink: 0,
                        }}
                      />
                    </ButtonBase>
                    {open && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Typography
                          sx={{
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            color: '#475569',
                            lineHeight: 1.65,
                            pt: 0.25,
                            borderTop: '1px solid #F1F5F9',
                          }}
                        >
                          {section.body}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}

              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textAlign: 'center', pb: 1.5, flexShrink: 0 }}>
                Credits refresh daily · {deepDiveCredits.remaining}/{DEEP_DIVE_DAILY_LIMIT} left
              </Typography>
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
    // Calculate session stats
    const sessionDuration = Math.floor((Date.now() - (messages[0]?.timestamp.getTime() || Date.now())) / 1000 / 60) || 5; // in minutes
    const messageCount = messages.filter(m => m.sender === 'user').length || 8;
    
    // Mock feedback data - in production, this would come from AI analysis
    const mockFeedback = {
      score: 88,
      summary: 'Strong session. Your grammar was accurate and your vocabulary covered the scene well. Keep this pace and you will be ready for HSK 3 soon.',
      suggestedFocus: 'Tone and natural phrasing',
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

    const typeLabel = (type: string) =>
      type === 'grammar' ? 'Grammar' : type === 'vocabulary' ? 'Vocabulary' : 'Fluency';

    return (
      <Box sx={{ height: '100%', bgcolor: '#F7F9F8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 1.5, minHeight: 84, bgcolor: '#FFFFFF', borderBottom: '1px solid #E7ECEA', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 2, alignItems: 'center' }}>
          <ButtonBase
            onClick={() => setScreen(ScreenState.CHAT)}
            aria-label="Back to chat"
            sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FFFFFF', border: '1px solid #E1E7E4', color: '#425B53', boxShadow: '0 2px 8px rgba(23,63,53,0.05)' }}
          >
            <BackIcon sx={{ fontSize: 22 }} />
          </ButtonBase>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#173F35', lineHeight: 1.15 }}>Practice report</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#82938D', mt: 0.5 }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FeedbackEntryButton is960={false} context={{ screen: 'ai_tutor_report' }} />
          <ButtonBase 
            onClick={() => {
              // Save history before going home
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
                    corrections: mockFeedback.corrections
                  }
                };
                dispatch(addHistory(historyItem));
              }
              goHome();
            }} 
            sx={{ 
              minHeight: 44,
              px: 3,
              py: 0,
              background: 'linear-gradient(135deg, #19BD82 0%, #07966A 100%)',
              color: 'white', 
              borderRadius: '14px',
              fontWeight: 900, 
              fontSize: '0.95rem',
              boxShadow: '0 8px 18px rgba(7,150,106,0.18)',
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            Done
          </ButtonBase>
          </Box>
        </Box>

        {/* Content - Reference two-column layout */}
        <Box sx={{ flexGrow: 1, minHeight: 0, p: 2.5, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: '100%', display: 'grid', gridTemplateColumns: '38% minmax(0, 1fr)', gap: 2.5 }}>
            
            {/* Top Stats Grid */}
            <Box sx={{ minHeight: 0, display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1.2fr 0.8fr 0.8fr', gap: 2, bgcolor: '#FFFFFF', border: '1px solid #DDE6E2', borderRadius: '22px', overflow: 'hidden', p: 0 }}>
              {/* Score Card */}
              <Box sx={{ 
                background: 'linear-gradient(145deg, #16B77E 0%, #087A58 100%)',
                color: 'white', 
                p: 3,
                borderRadius: '20px 20px 14px 14px',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 26px rgba(7,122,88,0.2)'
              }}>
                <Box
                  component="img"
                  src={
                    mockFeedback.score >= 60
                      ? '/images/clingo-ai-mascot-score.png'
                      : '/images/clingo-ai-mascot-score-low.png'
                  }
                  alt=""
                  sx={{
                    position: 'absolute',
                    right: 8,
                    bottom: -24,
                    height: '108%',
                    objectFit: 'contain',
                    opacity: 0.42,
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em', mb: 1 }}>
                    Overall score
                  </Typography>
                  <Typography sx={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, mb: 1 }}>
                    {mockFeedback.score}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[1,2,3,4,5].map(i => (
                      <Box 
                        key={i} 
                        sx={{ 
                          fontSize: '1rem',
                          color: i <= Math.floor(mockFeedback.score / 20) ? '#F8CF4A' : 'rgba(255,255,255,0.24)'
                        }}
                      >
                        ★
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Study Duration Card */}
              <Box sx={{ 
                bgcolor: '#F0F8F4',
                mx: 2.5,
                p: 2.5,
                borderRadius: '18px',
                textAlign: 'left',
                border: '1px solid #DCEFE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#8A9B95', mb: 0.6 }}>Study time</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#425B53' }}>{messageCount} turns completed</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                  <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: '#0D9F72', lineHeight: 1 }}>
                    {sessionDuration}
                  </Typography>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#5E746D' }}>
                    min
                  </Typography>
                </Box>
              </Box>

              {/* Messages Count Card */}
              <Box sx={{ 
                bgcolor: '#F0F8F4',
                mx: 2.5,
                mb: 2.5,
                p: 2.5,
                borderRadius: '18px',
                textAlign: 'left',
                border: '1px solid #DCEFE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#8A9B95', mb: 0.6 }}>Highlights</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#425B53' }}>Strong lines</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                  <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: '#0D9F72', lineHeight: 1 }}>
                    {Math.max(0, messageCount - mockFeedback.corrections.length)}
                  </Typography>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#5E746D' }}>
                    lines
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Bottom Row: AI Summary + Corrections */}
            <Box sx={{ minHeight: 0, display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'auto minmax(0, 1fr)', gap: 2.5 }}>
              {/* AI Summary Card */}
              <Box sx={{ 
                bgcolor: '#FFFFFF',
                p: 3,
                borderRadius: '22px',
                border: '1px solid #DDE6E2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      component="img"
                      src="/images/clingo-ai-mascot-head.png"
                      alt=""
                      sx={{
                        width: 32,
                        height: 32,
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#173F35' }}>
                      AI Feedback
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: '#4B5563', 
                    lineHeight: 1.55,
                    fontStyle: 'normal',
                    mb: 2
                  }}>
                    "{mockFeedback.summary}"
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: 'rgba(13,159,114,0.06)', borderRadius: '12px', border: '2px solid rgba(13,159,114,0.12)' }}>
                  <TrendingUp sx={{ fontSize: 18, color: '#0D9F72' }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#0D9F72', letterSpacing: '0.02em' }}>
                    Focus next: {mockFeedback.suggestedFocus}
                  </Typography>
                </Box>
              </Box>

              {/* Corrections Summary Card */}
              <Box sx={{ 
                bgcolor: '#FFFFFF',
                p: 3,
                borderRadius: '22px',
                border: '1px solid #DDE6E2',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AlertCircle sx={{ fontSize: 22, color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#173F35' }}>
                      Key Fixes
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 0.65, bgcolor: '#FEF3C7', borderRadius: '10px', border: '2px solid #FDE68A' }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: '#D97706', letterSpacing: '0.04em' }}>
                      {mockFeedback.corrections.length} fixes
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}>
                  {mockFeedback.corrections.map((item, idx) => (
                    <Box key={idx} sx={{ 
                      p: 2.5, 
                      bgcolor: '#F0F8F4',
                      borderRadius: '14px',
                      border: '1px solid #DCEFE6'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          #{idx + 1}
                        </Typography>
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: '6px', 
                          bgcolor: item.type === 'grammar' ? '#FEE2E2' : item.type === 'vocabulary' ? '#DBEAFE' : '#DCFCE7',
                          border: '1px solid',
                          borderColor: item.type === 'grammar' ? '#FCA5A5' : item.type === 'vocabulary' ? '#93C5FD' : '#86EFAC'
                        }}>
                          <Typography sx={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 900, 
                            color: item.type === 'grammar' ? '#DC2626' : item.type === 'vocabulary' ? '#2563EB' : '#16A34A',
                            letterSpacing: '0.03em'
                          }}>
                            {typeLabel(item.type)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#6B7280', textDecoration: 'line-through', mb: 0.75, fontFamily: KAI_TI, lineHeight: 1.45 }}>
                        {item.original}
                      </Typography>
                      <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D9F72', fontFamily: KAI_TI, lineHeight: 1.45 }}>
                        → {item.corrected}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
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
      <Box sx={{ height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 8, py: 3, borderBottom: '2px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ButtonBase
              onClick={() => setScreen(ScreenState.HISTORY_LIST)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              <BackIcon sx={{ fontSize: 20 }} />
            </ButtonBase>
            <Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#1F2937', lineHeight: 1 }}>
                Practice report
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.04em', mt: 0.5 }}>
                {selectedHistory.topic} · {new Date(selectedHistory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content - Same layout as FeedbackScreen */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, overflow: 'hidden' }}>
          <Box sx={{ maxWidth: 920, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Top Stats Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              {/* Score Card */}
              <Box sx={{ 
                bgcolor: '#111827', 
                color: 'white', 
                p: 3, 
                borderRadius: '20px', 
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
              }}>
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,180,160,0.2) 0%, transparent 100%)' }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
                    Overall score
                  </Typography>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, lineHeight: 1, mb: 1 }}>
                    {selectedHistory.score}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {[1,2,3,4,5].map(i => (
                      <Box 
                        key={i} 
                        sx={{ 
                          fontSize: '0.85rem',
                          color: i <= Math.floor(selectedHistory.score / 20) ? '#0D9F72' : 'rgba(255,255,255,0.2)'
                        }}
                      >
                        ★
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Study Duration Card */}
              <Box sx={{ 
                bgcolor: 'white', 
                p: 3, 
                borderRadius: '20px', 
                textAlign: 'center',
                border: '2px solid #F3F4F6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
                  Study time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#0D9F72', lineHeight: 1 }}>
                    {selectedHistory.duration}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    min
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280' }}>
                  {selectedHistory.messageCount} turns completed
                </Typography>
              </Box>

              {/* Messages Count Card */}
              <Box sx={{ 
                bgcolor: 'white', 
                p: 3, 
                borderRadius: '20px', 
                textAlign: 'center',
                border: '2px solid #F3F4F6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
                  Highlights
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#0D9F72', lineHeight: 1 }}>
                    {Math.max(0, selectedHistory.messageCount - selectedHistory.feedback.corrections.length)}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    lines
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280' }}>
                  Strong lines
                </Typography>
              </Box>
            </Box>

            {/* Bottom Row: AI Summary + Corrections */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {/* AI Summary Card */}
              <Box sx={{ 
                bgcolor: '#F3F4F6', 
                p: 4, 
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Target sx={{ fontSize: 20, color: '#0D9F72' }} />
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#1F2937' }}>
                      AI Feedback
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#4B5563', 
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                    mb: 2
                  }}>
                    "{selectedHistory.feedback.summary}"
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: 'rgba(13,159,114,0.06)', borderRadius: '12px', border: '2px solid rgba(13,159,114,0.12)' }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#0D9F72' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#0D9F72', letterSpacing: '0.02em' }}>
                    Focus next: {selectedHistory.feedback.suggestedFocus}
                  </Typography>
                </Box>
              </Box>

              {/* Corrections Summary Card */}
              <Box sx={{ 
                bgcolor: 'white', 
                p: 4, 
                borderRadius: '20px',
                border: '2px solid #F3F4F6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AlertCircle sx={{ fontSize: 20, color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#1F2937' }}>
                      Key Fixes
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#FEF3C7', borderRadius: '10px', border: '2px solid #FDE68A' }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: '#D97706', letterSpacing: '0.04em' }}>
                      {selectedHistory.feedback.corrections.length} fixes
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedHistory.feedback.corrections.slice(0, 2).map((item, idx) => (
                    <Box key={idx} sx={{ 
                      p: 2.5, 
                      bgcolor: '#F9FAFB', 
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          #{idx + 1}
                        </Typography>
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: '6px', 
                          bgcolor: item.type === 'grammar' ? '#FEE2E2' : item.type === 'vocabulary' ? '#DBEAFE' : '#DCFCE7',
                          border: '1px solid',
                          borderColor: item.type === 'grammar' ? '#FCA5A5' : item.type === 'vocabulary' ? '#93C5FD' : '#86EFAC'
                        }}>
                          <Typography sx={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 900, 
                            color: item.type === 'grammar' ? '#DC2626' : item.type === 'vocabulary' ? '#2563EB' : '#16A34A',
                            letterSpacing: '0.03em'
                          }}>
                            {item.type === 'grammar' ? 'Grammar' : item.type === 'vocabulary' ? 'Vocabulary' : 'Fluency'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#6B7280', textDecoration: 'line-through', mb: 0.75, fontFamily: KAI_TI }}>
                        {item.original}
                      </Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#0D9F72', fontFamily: KAI_TI }}>
                        → {item.corrected}
                      </Typography>
                    </Box>
                  ))}
                  {selectedHistory.feedback.corrections.length > 2 && (
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#9CA3AF', textAlign: 'center', mt: 0.5 }}>
                      +{selectedHistory.feedback.corrections.length - 2} more tips
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box id="ai-chat-root" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden', bgcolor: '#FFF8F0' }}>
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
