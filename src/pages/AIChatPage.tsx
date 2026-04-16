import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Avatar, ButtonBase, TextField, Grid, Tab, Tabs, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, Paper, Divider, Snackbar, Alert } from '@mui/material';

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
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addHistory, deleteHistory, ChatHistoryItem } from '../store/slices/chatHistorySlice';
import { aiService } from '../services/aiService';
import { AiRequestTimeoutError } from '../utils/requestWrapper';
import { AiConversationPipeline, type PipelineStage } from '../services/aiConversationPipeline';

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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  pinyin?: string;
  translation?: string;
  timestamp: Date;
  score?: number;
  isVoiceInput?: boolean; // 标识是否为语音输入
}

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
  '简单': {
    title: '初级水平',
    features: ['基础词汇和句型', '慢速对话', '简单场景', 'HSK 1-2 级水平']
  },
  '中等': {
    title: '中级水平',
    features: ['常用词汇和表达', '正常语速', '日常场景', 'HSK 3-4 级水平']
  },
  '困难': {
    title: '高级水平',
    features: ['复杂词汇和语法', '快速对话', '专业场景', 'HSK 5-6 级水平']
  }
};

// Random role generators
const RANDOM_USER_ROLES = [
  '学生', '顾客', '游客', '求职者', '朋友', '同事', '邻居', '访客'
];

const RANDOM_AI_ROLES = [
  '同学', '咖啡师', '导游', '面试官', '朋友', '同事', '邻居', '服务员'
];

const RANDOM_SCENE_DESCS = [
  '在咖啡店点餐，练习日常对话',
  '邀请朋友看电影，学习社交表达',
  '在市场购物，掌握购物词汇',
  '旅行时问路，练习方向表达',
  '面试工作，学习职场用语',
  '和朋友聊天，练习日常交流',
  '在餐厅用餐，学习点餐用语',
  '询问时间地点，练习基础对话'
];

export default function AIChatPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { histories } = useSelector((state: RootState) => state.chatHistory);
  const [screen, setScreen] = useState<ScreenState>(ScreenState.HOME);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMagicGenerating, setIsMagicGenerating] = useState(false);
  const [deepLearningSentence, setDeepLearningSentence] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ChatHistoryItem | null>(null);
  
  // Dictionary & Tools State
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictTab, setDictTab] = useState(0);
  const [showAITranslation, setShowAITranslation] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [aiRequestTimeoutOpen, setAiRequestTimeoutOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  const pipelineRef = useRef<AiConversationPipeline | null>(null);
  const getPipeline = () => {
    if (!pipelineRef.current) {
      pipelineRef.current = new AiConversationPipeline();
    }
    return pipelineRef.current;
  };

  // Config Screen State
  const [difficulty, setDifficulty] = useState<'简单' | '中等' | '困难'>('中等');
  const [userRole, setUserRole] = useState<string>('');
  const [aiRole, setAiRole] = useState<string>('');
  const [sceneDesc, setSceneDesc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<{ userRole?: boolean; aiRole?: boolean; sceneDesc?: boolean }>({});

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
    setScreen(ScreenState.HOME);
    setSelectedTopic(null);
    setMessages([]);
  };

  const handleStartChat = (topic: Topic) => {
    setSelectedTopic(topic);
    // Initialize config values based on topic
    if (topic.id === 'free') {
      // Free mode: preset default names and places
      setUserRole('李明');
      setAiRole('王老师');
      setSceneDesc('在咖啡店，李明想点一杯拿铁，王老师是咖啡师');
    } else if (topic.id === 'ordering') {
      setUserRole('顾客');
      setAiRole('咖啡师');
      setSceneDesc(topic.desc);
    } else {
      setUserRole('学生');
      setAiRole('同学');
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

  const speakUtterance = useCallback((text: string, messageId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();
      setPlayingAudioId(messageId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => {
        setPlayingAudioId(null);
        resolve();
      };
      utterance.onerror = () => {
        setPlayingAudioId(null);
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const runFullTurn = useCallback(async (textToSend: string, isVoiceInput: boolean): Promise<{ id: string; text: string } | null> => {
    if (!textToSend.trim()) return null;

    // 为语音输入生成拼音和翻译（模拟）
    const generatePinyin = (text: string): string => {
      // 更完善的拼音映射
      const pinyinMap: { [key: string]: string } = {
        '你好': 'Nǐ hǎo',
        '您好': 'Nín hǎo',
        '咖啡': 'kāfēi',
        '我想': 'Wǒ xiǎng',
        '我想要': 'Wǒ xiǎng yào',
        '想要': 'xiǎng yào',
        '一杯': 'yì bēi',
        '拿铁': 'ná tiě',
        '美式': 'měi shì',
        '卡布奇诺': 'kǎ bù qí nuò',
        '谢谢': 'Xièxiè',
        '请问': 'Qǐng wèn',
        '多少钱': 'duō shǎo qián',
        '可以': 'kěyǐ',
        '不要': 'bù yào',
        '要': 'yào',
        '有': 'yǒu',
        '没有': 'méi yǒu',
        '是': 'shì',
        '不是': 'bú shì',
        '好的': 'hǎo de',
        '好': 'hǎo',
        '不好': 'bù hǎo'
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

    const userMsg: Message = { 
      id: Date.now().toString(),
      text: textToSend, 
      sender: 'user',
      timestamp: new Date(),
      isVoiceInput: isVoiceInput,
      // 只有语音输入才设置评分，但所有消息都有拼音和翻译
      score: isVoiceInput ? Math.floor(Math.random() * 15) + 85 : undefined,
      pinyin: generatePinyin(textToSend),
      translation: generateTranslation(textToSend)
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setShowAITranslation(false);
    setIsTyping(true);

    await new Promise<void>((r) => setTimeout(r, 1200));
    try {
      const response = await aiService.chat(textToSend);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        pinyin: "Zhè shì nǐ de kāfēi, qǐng màn yòng.",
        translation: "Here is your coffee, please enjoy."
      };
      setMessages((prev) => [...prev, aiMsg]);
      return { id: aiMsg.id, text: aiMsg.text };
    } catch (e) {
      if (e instanceof AiRequestTimeoutError) {
        setAiRequestTimeoutOpen(true);
      }
      return null;
    } finally {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    getPipeline().setHandlers({
      runFullTurn,
      speakUtterance,
      onStage: setPipelineStage,
    });
  }, [runFullTurn, speakUtterance]);

  const handleSend = () => {
    const t = inputText.trim();
    if (!t) return;
    getPipeline().enqueueKeyboardTurn(t);
  };

  const handleSendLine = (line: string) => {
    const t = line.trim();
    if (!t) return;
    getPipeline().enqueueKeyboardTurn(t);
  };

  const FloatingBackButton = () => (
    <ButtonBase 
      onClick={() => {
        if (screen === ScreenState.HOME) navigate('/');
        else if (screen === ScreenState.DEEP_LEARNING) setScreen(ScreenState.CHAT);
        else if (screen === ScreenState.HISTORY_LIST) setScreen(ScreenState.TOPIC_SELECTION);
        else if (screen === ScreenState.CONFIG) setScreen(ScreenState.TOPIC_SELECTION);
        else setScreen(ScreenState.HOME);
      }}
        sx={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 200,
        width: 48,
        height: 48,
        borderRadius: '16px',
        bgcolor: 'rgba(0,0,0,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.1)',
        color: '#1F2937',
        '&:active': { transform: 'scale(0.9)' }
      }}
    >
      <BackIcon sx={{ fontSize: 20 }} />
    </ButtonBase>
  );

  const HomeScreen = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 4, bgcolor: '#FFF8F0', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <FloatingBackButton />
      <Box sx={{ position: 'absolute', top: 32, right: 40, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(79,70,229,0.05)', px: 2, py: 0.5, borderRadius: '30px', border: '1px solid rgba(79,70,229,0.1)' }}>
        <Typography sx={{ fontSize: '1rem' }}>✨</Typography>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#4F46E5' }}>AI 智能导师已就绪</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 850 }}>
        <Box sx={{ position: 'relative', width: 260, height: 260, flexShrink: 0 }}>
          <Box component="img" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '48px', border: '8px solid white', boxShadow: '0 20px 50px rgba(0,0,0,0.12)', rotate: '-2deg' }} />
        </Box>
        <Box sx={{ textAlign: 'left', maxWidth: 420 }}>
          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '2.5rem', mb: 1.5, color: '#1F2937' }}>AI 陪练<br /><Box component="span" sx={{ color: '#4F46E5' }}>自然开口说</Box></Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 500, mb: 3 }}>实时纠错，地道表达，自信开口。</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ButtonBase onClick={() => setScreen(ScreenState.TOPIC_SELECTION)} sx={{ height: 52, px: 3.5, bgcolor: '#4F46E5', color: 'white', borderRadius: '16px', fontWeight: 900, fontSize: '1rem' }}>开启对话</ButtonBase>
          </Box>
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
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.25rem' : '2rem'), color: '#1F2937' }}>选择练习模式</Typography>
      </Box>
      {/* Two cards side by side */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', px: is960 ? 1 : (is1920x1125 ? 2 : 1.5) }}>
        <Box sx={{ display: 'flex', gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5), maxWidth: is960 ? 700 : (is1920x1125 ? 1100 : 900), width: '100%', height: is960 ? '85%' : '90%', alignItems: 'stretch' }}>
          {/* Left card: Mode 1 - Free Dialogue (same height as right) */}
          <Box
            onClick={() => { setSelectedTopic({ id: 'free', title: '自由练习', emoji: '🎙️', desc: 'DIY 自由对话模式' }); setScreen(ScreenState.CONFIG); }}
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
            <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.9rem'), fontWeight: 900, color: '#DC2626', mb: is960 ? 2 : (is1920x1125 ? 2.5 : 2) }}>模式1: 自由对话</Typography>
            <Box sx={{ width: is960 ? 72 : (is1920x1125 ? 100 : 88), height: is960 ? 72 : (is1920x1125 ? 100 : 88), borderRadius: is1920x1125 ? '20px' : '16px', bgcolor: '#EA580C', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: is960 ? '2rem' : (is1920x1125 ? '3rem' : '2.5rem') }}>💬</Box>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : (is1920x1125 ? '1.5rem' : '1.35rem'), color: '#1F2937' }}>DIY: 自由练习</Typography>
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
            <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.9rem'), fontWeight: 900, color: '#2563EB', mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75), textAlign: 'center' }}>模式2: 场景模拟</Typography>
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
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), color: '#1F2937' }}>{isFreeMode ? '自由模式' : '场景模式'}</Typography>
        </Box>
        {/* Main content: blue card + white section */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <Box sx={{ width: '100%', maxWidth: is960 ? 640 : (is1920x1125 ? 900 : 800), height: is960 ? 380 : (is1920x1125 ? 520 : 450), bgcolor: 'white', borderRadius: is1920x1125 ? '32px' : '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden' }}>
            {/* Left: Blue Scenario Configuration card */}
            <Box sx={{ width: '35%', p: is960 ? 2.5 : (is1920x1125 ? 4 : 3), bgcolor: '#4F46E5', color: 'white', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : (is1920x1125 ? '1.5rem' : '1.35rem'), mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75) }}>场景配置</Typography>
              <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.75, p: 0.5, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.15)', mb: is960 ? 2 : (is1920x1125 ? 2.5 : 2) }}>
                {(['简单', '中等', '困难'] as const).map(lv => (
                  <ButtonBase key={lv} onClick={(e) => { e.stopPropagation(); setDifficulty(lv); }} sx={{ flexGrow: 1, py: 1, borderRadius: '12px', fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1rem' : '0.9rem'), fontWeight: 900, color: lv === difficulty ? '#1E3A8A' : 'white', bgcolor: lv === difficulty ? 'white' : 'transparent', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { bgcolor: lv === difficulty ? 'white' : 'rgba(255,255,255,0.15)' }, '&:active': { transform: 'scale(0.95)' } }}>
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
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Person sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>角色A</Typography>
                  {isEditing.userRole ? (
                    <TextField value={userRole} onChange={(e) => setUserRole(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, userRole: false })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing({ ...isEditing, userRole: false }); }} variant="standard" autoFocus InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, userRole: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{userRole}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomRole('user'); }} sx={{ color: '#4F46E5', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(79,70,229,0.08)' } }}>
                  <Star sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22) }} />
                </ButtonBase>
              </Box>
            </Box>

            {/* Role B */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BotIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>角色B</Typography>
                  {isEditing.aiRole ? (
                    <TextField value={aiRole} onChange={(e) => setAiRole(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, aiRole: false })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing({ ...isEditing, aiRole: false }); }} variant="standard" autoFocus InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, aiRole: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{aiRole}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomRole('ai'); }} sx={{ color: '#4F46E5', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(79,70,229,0.08)' } }}>
                  <Star sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 24 : 22) }} />
                </ButtonBase>
              </Box>
            </Box>

            {/* 场景描述 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 56 : 48), height: is960 ? 40 : (is1920x1125 ? 56 : 48), borderRadius: is1920x1125 ? '16px' : '14px', bgcolor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Book sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24) }} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : (is1920x1125 ? '0.95rem' : '0.85rem'), fontWeight: 700, color: '#6B7280', mb: 0.25 }}>场景描述</Typography>
                  {isEditing.sceneDesc ? (
                    <TextField value={sceneDesc} onChange={(e) => setSceneDesc(e.target.value)} onBlur={() => setIsEditing({ ...isEditing, sceneDesc: false })} variant="standard" autoFocus multiline maxRows={2} InputProps={{ disableUnderline: true, sx: { fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937' } }} sx={{ width: '100%' }} />
                  ) : (
                    <Typography onClick={() => isFreeMode && setIsEditing({ ...isEditing, sceneDesc: true })} sx={{ fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'), fontWeight: 900, color: '#1F2937', cursor: isFreeMode ? 'text' : 'default' }}>{sceneDesc}</Typography>
                  )}
                </Box>
                <ButtonBase onClick={(e) => { e.stopPropagation(); generateRandomScene(); }} sx={{ color: '#4F46E5', p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(79,70,229,0.08)' } }}>
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
                bgcolor: (userRole && aiRole && sceneDesc) ? '#4F46E5' : '#9CA3AF', 
                color: 'white', 
                borderRadius: is1920x1125 ? '16px' : '14px', 
                fontWeight: 900,
                fontSize: is960 ? '0.9rem' : (is1920x1125 ? '1.15rem' : '1rem'),
                cursor: (userRole && aiRole && sceneDesc) ? 'pointer' : 'not-allowed',
                opacity: (userRole && aiRole && sceneDesc) ? 1 : 0.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: (userRole && aiRole && sceneDesc) ? '#4338CA' : '#9CA3AF' },
                '&:active': { transform: (userRole && aiRole && sceneDesc) ? 'scale(0.98)' : 'none' }
              }}
            >
              开始实战确认
            </ButtonBase>
          </Box>
        </Box>
      </Box>
      </Box>
    );
  };

  const RoleSelectionScreen = () => {
    const [selectedRole, setSelectedRole] = useState<'A' | 'B' | null>(null);
    const [isStarting, setIsStarting] = useState(false);

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
          pinyin: 'Nǐ hǎo! Huānyíng lái dào wǒmen de kāfēi diàn. Jīntiān xiǎng hē diǎn shénme?',
          translation: 'Hello! Welcome to our coffee shop. What would you like to drink today?'
        };
        setMessages([aiGreeting]);
        setScreen(ScreenState.CHAT);
        getPipeline().enqueueAudioOnly(aiGreeting.text, aiGreeting.id);
      }, 1500);
    };

    if (isStarting) {
  return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#111', color: 'white' }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            border: '6px solid rgba(255,255,255,0.1)', 
            borderTopColor: '#00B4A0', 
            borderRadius: '50%',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            },
            animation: 'spin 1s linear infinite' 
          }} />
          <Typography sx={{ mt: 4, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>AI 导师正在准备...</Typography>
        </Box>
      );
  }

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is1920 = screenSize === '1920x1125';
  const is960 = screenSize === '960x540';

  return (
      <Box sx={{ height: '100%', width: '100%', bgcolor: '#1E1E22', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        <FloatingBackButton />

        <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: is1920 ? 6 : (is960 ? 2 : 4), boxSizing: 'border-box' }}>
          {/* 标题 - 设计稿：选择您的身份 */}
          <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2.5rem' : (is960 ? '1.5rem' : '2rem'), color: 'white', textAlign: 'center', mb: is1920 ? 1.5 : 1 }}>
            选择您的身份
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.25rem' : (is960 ? '0.9rem' : '1.1rem'), textAlign: 'center', mb: is1920 ? 5 : (is960 ? 3 : 4) }}>
            点击选择您的角色,AI将根据您的选择开始对话
          </Typography>

          {/* 两个角色卡片 - 设计稿：左右并排，图片在左、文字在右 */}
          <Box sx={{ display: 'flex', gap: is1920 ? 4 : (is960 ? 2 : 3), maxWidth: is1920 ? 1200 : (is960 ? 640 : 900), width: '100%', justifyContent: 'center', flexWrap: 'wrap', mb: is1920 ? 5 : (is960 ? 3 : 4) }}>
            {/* 角色A - 顾客 */}
            <ButtonBase
              onClick={() => setSelectedRole('A')}
              sx={{
                flex: is1920 ? '0 1 480px' : (is960 ? '0 1 300px' : '0 1 420px'),
                minWidth: 0,
                display: 'flex',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: is1920 ? '32px' : '24px',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: selectedRole === 'A' ? '3px solid #2DE0A2' : '1px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: selectedRole === 'A' ? '0 0 32px rgba(45,224,162,0.25)' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              {selectedRole === 'A' && (
                <Box sx={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, bgcolor: '#2DE0A2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <CheckCircle sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              )}
              <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#2DE0A2', color: 'white', px: 2, py: 0.5, borderRadius: '0 32px 0 16px', fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 900, zIndex: 2 }}>
                角色A
              </Box>
              <Box
                component="img"
                src="https://picsum.photos/seed/customer/400/400"
                alt="顾客"
                sx={{ width: is1920 ? 200 : (is960 ? 120 : 160), height: 'auto', aspectRatio: '1', objectFit: 'cover', borderRadius: is1920 ? '24px 0 0 24px' : '20px 0 0 20px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: is1920 ? 3 : (is960 ? 2 : 2.5), minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2rem' : (is960 ? '1.2rem' : '1.6rem'), color: 'white', mb: 0.5 }}>顾客</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.1rem' : (is960 ? '0.8rem' : '0.95rem') }}>一位想要点咖啡的顾客</Typography>
              </Box>
            </ButtonBase>

            {/* 角色B - 咖啡师 */}
            <ButtonBase
              onClick={() => setSelectedRole('B')}
              sx={{
                flex: is1920 ? '0 1 480px' : (is960 ? '0 1 300px' : '0 1 420px'),
                minWidth: 0,
                display: 'flex',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: is1920 ? '32px' : '24px',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: selectedRole === 'B' ? '3px solid #6B4FF6' : '1px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: selectedRole === 'B' ? '0 0 32px rgba(107,79,246,0.25)' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              {selectedRole === 'B' && (
                <Box sx={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, bgcolor: '#6B4FF6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <CheckCircle sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              )}
              <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#6B4FF6', color: 'white', px: 2, py: 0.5, borderRadius: '0 32px 0 16px', fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 900, zIndex: 2 }}>
                角色B
              </Box>
              <Box
                component="img"
                src="https://picsum.photos/seed/barista/400/400"
                alt="咖啡师"
                sx={{ width: is1920 ? 200 : (is960 ? 120 : 160), height: 'auto', aspectRatio: '1', objectFit: 'cover', borderRadius: is1920 ? '24px 0 0 24px' : '20px 0 0 20px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: is1920 ? 3 : (is960 ? 2 : 2.5), minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '2rem' : (is960 ? '1.2rem' : '1.6rem'), color: 'white', mb: 0.5 }}>咖啡师</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: is1920 ? '1.1rem' : (is960 ? '0.8rem' : '0.95rem') }}>一位友好的咖啡店服务员</Typography>
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
              bgcolor: !selectedRole ? 'rgba(255,255,255,0.1)' : '#6B4FF6',
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
            {!selectedRole ? '请选择角色' : '进入实战对话'}
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
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
    const [activeDeepLearning, setActiveDeepLearning] = useState<Message | null>(null);
    const [showTranslationIds, setShowTranslationIds] = useState<string[]>([]); // Track which messages show translation
    
    // 语音录音相关状态
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState<string>(''); // 录音识别的文本（用于显示）
    const [countdown, setCountdown] = useState<number>(0); // 倒计时（秒）
    const recognition = useRef<SpeechRecognition | null>(null);
    const recordedTextRef = useRef<string>(''); // 用于在 onend 中访问最新的文本
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null); // 倒计时定时器
    
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
      if (recognition.current && !isRecording) {
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
          setIsRecording(false);
          setCountdown(0);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
        }
      }
    };
    
    // 停止录音
    const stopRecording = () => {
      if (recognition.current && isRecording) {
        try {
          // 停止倒计时
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          recognition.current.stop();
          // onend 回调会自动处理发送
        } catch (e) {
          console.error('Failed to stop recording:', e);
          setIsRecording(false);
          setCountdown(0);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
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
      <Box sx={{ height: '100%', display: 'flex', bgcolor: '#F3F4F6', position: 'relative' }}>
        {/* Main Chat Area */}
        <Box sx={{ 
          flex: activeDeepLearning ? '0 0 55%' : '1', 
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
                <Typography sx={{ fontWeight: 900, fontSize: is1920 ? '1.5rem' : '1.1rem', color: '#1F2937' }}>AI导师-沉浸模式</Typography>
                <Typography sx={{ fontSize: is1920 ? '0.95rem' : '0.8rem', fontWeight: 600, color: '#6B7280' }}>实时对话练习中</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: is1920 ? 2 : 1.5 }}>
              <ButtonBase onClick={() => setShowPinyin(!showPinyin)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 1, borderRadius: '12px', bgcolor: showPinyin ? '#F0FDF4' : '#F9FAFB', color: showPinyin ? '#16A34A' : '#6B7280', border: '1px solid', borderColor: showPinyin ? '#86EFAC' : '#E5E7EB', '&:active': { transform: 'scale(0.98)' } }}>
                {showPinyin ? <Visibility sx={{ fontSize: is1920 ? 22 : 20 }} /> : <VisibilityOff sx={{ fontSize: is1920 ? 22 : 20 }} />}
                <Typography sx={{ fontWeight: 700, fontSize: is1920 ? '1rem' : '0.9rem' }}>拼音</Typography>
              </ButtonBase>
              <ButtonBase onClick={() => setScreen(ScreenState.FEEDBACK)} sx={{ height: is1920 ? 52 : 48, px: is1920 ? 4 : 3, py: 0, borderRadius: '14px', bgcolor: '#16A34A', color: 'white', fontWeight: 900, fontSize: is1920 ? '1rem' : '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:active': { transform: 'scale(0.98)' } }}>
                结束练习
              </ButtonBase>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: is1920 ? 5 : 4, display: 'flex', flexDirection: 'column', gap: is1920 ? 5 : 4, pb: is1920 ? 28 : 24 }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      width: is1920 ? 56 : 44, 
                      height: is1920 ? 56 : 44, 
                      bgcolor: msg.sender === 'user' ? '#00B4A0' : '#4F46E5',
                      borderRadius: is1920 ? '20px' : '16px',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {msg.sender === 'user' ? <Person fontSize="small" /> : <BotIcon fontSize="small" />}
                </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Score Badge - only for user messages */}
                    {msg.sender === 'user' && msg.score && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Box sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 0.75,
                          px: 2, 
                          py: 0.75, 
                          borderRadius: '12px', 
                          bgcolor: msg.score >= 90 ? '#DCFCE7' : msg.score >= 80 ? '#FEF3C7' : '#FEE2E2',
                          border: '2px solid',
                          borderColor: msg.score >= 90 ? '#86EFAC' : msg.score >= 80 ? '#FDE047' : '#FCA5A5'
                        }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: msg.score >= 90 ? '#16A34A' : msg.score >= 80 ? '#D97706' : '#DC2626' }}>
                            发音
                          </Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: msg.score >= 90 ? '#16A34A' : msg.score >= 80 ? '#D97706' : '#DC2626' }}>
                            {msg.score}
                          </Typography>
              </Box>
                      </Box>
                    )}

                    {/* Message Bubble */}
                    <Box 
                      onClick={() => msg.sender === 'ai' && setMaskedIds(prev => prev.includes(msg.id) ? prev.filter(mid => mid !== msg.id) : [...prev, msg.id])}
                      sx={{ 
                        p: 3, 
                        borderRadius: '24px', 
                        bgcolor: msg.sender === 'user' ? '#4F46E5' : 'white', 
                        color: msg.sender === 'user' ? 'white' : '#1F2937', 
                        border: msg.sender === 'ai' ? '2px solid #E5E7EB' : 'none',
                        boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(79,70,229,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        cursor: msg.sender === 'ai' ? 'pointer' : 'default',
                        transition: 'all 0.3s',
                        '&:hover': msg.sender === 'ai' ? { borderColor: '#4F46E5' } : {},
                        position: 'relative'
                      }}
                    >
                      {showPinyin && msg.pinyin && (
                        <Typography sx={{ 
                          fontSize: '0.7rem', 
                          opacity: 0.7, 
                          mb: 0.75, 
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          filter: playingAudioId === msg.id ? 'blur(4px)' : 'none',
                          transition: 'filter 0.5s'
                        }}>
                          {msg.pinyin}
              </Typography>
                      )}
                      <Typography sx={{ 
                        fontWeight: 700, 
                        fontSize: '1.15rem', 
                        lineHeight: 1.6,
                        filter: (msg.sender === 'ai' && maskedIds.includes(msg.id)) || playingAudioId === msg.id ? 'blur(6px)' : 'none',
                        transition: 'filter 0.5s'
                      }}>
                        {msg.text}
                      </Typography>
                      
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
                            color: '#00B4A0',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                              '50%': { opacity: 0.7, transform: 'scale(1.1)' }
                            }
                          }} />
                          <Typography sx={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 900, 
                            color: '#00B4A0', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            px: 2,
                            py: 0.5,
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,180,160,0.2)'
                          }}>
                            播放中...
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

                    {/* Action Buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1, 
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      flexWrap: 'wrap'
                    }}>
                      {/* TTS Button - 所有消息都显示朗读按钮 */}
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          playTTS(msg.text, msg.id);
                        }}
                        sx={{
                          px: 2,
                          py: 0.75,
                          borderRadius: '12px',
                          bgcolor: playingAudioId === msg.id ? 'white' : msg.sender === 'user' ? 'white' : 'white',
                          color: playingAudioId === msg.id ? '#16A34A' : msg.sender === 'user' ? '#4F46E5' : '#6B7280',
                          border: '2px solid',
                          borderColor: playingAudioId === msg.id ? '#16A34A' : msg.sender === 'user' ? '#E5E7EB' : '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: playingAudioId === msg.id ? '#16A34A' : '#16A34A',
                            color: playingAudioId === msg.id ? '#16A34A' : '#16A34A',
                          },
                          '&:active': { transform: 'scale(0.95)' }
                        }}
                      >
                        <VolumeUp sx={{ fontSize: 16, color: playingAudioId === msg.id ? '#16A34A' : 'inherit' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {playingAudioId === msg.id ? '播放中' : '朗读'}
                        </Typography>
                      </ButtonBase>

                      {/* Translation Button - 所有有翻译的消息都显示 */}
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
                            py: 0.75, 
                            borderRadius: '12px', 
                            bgcolor: 'white', 
                            border: '2px solid #E5E7EB',
                            fontWeight: 700, 
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
                            '&:active': { transform: 'scale(0.95)' }
                          }}
                        >
                          <Abc sx={{ fontSize: 14 }} />
                          <Typography sx={{ fontSize: '0.75rem' }}>译文</Typography>
                        </ButtonBase>
                      )}

                      {/* Deep Learning Button - 所有消息都显示 */}
                      <ButtonBase 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDeepLearning(msg);
                        }}
                        sx={{ 
                          px: 2, 
                          py: 0.75, 
                          borderRadius: '12px', 
                          bgcolor: '#374151', 
                          color: 'white',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          '&:hover': { bgcolor: '#4B5563' },
                          '&:active': { transform: 'scale(0.95)' }
                        }}
                      >
                        <Typography sx={{ fontSize: '0.75rem' }}>深度剖析</Typography>
                        <ArrowForward sx={{ fontSize: 14 }} />
                      </ButtonBase>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
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
                <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>AI 导师正在思考...</Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* AI Translation Popup */}
          {showAITranslation && (
            <Box sx={{ position: 'absolute', bottom: 110, left: 24, right: 24, bgcolor: 'white', p: 3, borderRadius: '20px', border: '2px solid #4F46E5', zIndex: 50, boxShadow: '0 10px 40px rgba(79,70,229,0.2)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Translate sx={{ fontSize: 18, color: '#4F46E5' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#4F46E5' }}>AI 翻译建议</Typography>
                </Box>
                <IconButton size="small" onClick={() => setShowAITranslation(false)}><Close sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 2, color: '#1F2937' }}>我想点一杯热拿铁。</Typography>
              <ButtonBase onClick={() => handleSendLine("我想点一杯热拿铁。")} sx={{ width: '100%', py: 2, bgcolor: '#4F46E5', color: 'white', borderRadius: '14px', fontWeight: 900, fontSize: '0.95rem', '&:active': { transform: 'scale(0.98)' } }}>
                发送此句
              </ButtonBase>
            </Box>
          )}

          {/* Input Area - 设计稿：底部固定，grid图标+紫色按住说话 */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: is1920 ? 4 : 3, bgcolor: 'white', borderTop: '2px solid #F3F4F6', pb: is1920 ? 5 : 4, zIndex: 20 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                flexWrap: 'wrap',
                mb: 1.5,
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
                      bgcolor: step.on ? 'rgba(79,70,229,0.12)' : 'transparent',
                      border: '1px solid',
                      borderColor: step.on ? '#4F46E5' : 'transparent',
                      minHeight: 36,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: is1920 ? '0.85rem' : '0.75rem',
                        fontWeight: 800,
                        color: step.on ? '#4338CA' : '#9CA3AF',
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
                  <Search sx={{ fontSize: 16 }} /> AI 查词
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
                    color: (inputText.trim() && hasNonChineseContent(inputText)) ? '#4F46E5' : '#9CA3AF', 
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
                  AI 翻译
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
                    placeholder="输入中文或英文..." 
                    variant="standard"
                    autoFocus
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
                          borderColor: '#00B4A0',
                          boxShadow: '0 0 0 3px rgba(0,180,160,0.1)'
                        }
                      } 
                    }} 
                  />
                ) : (
                  <ButtonBase 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (pipelineBusy && !isRecording) return;
                      if (!isRecording) {
                        startRecording();
                      }
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      if (isRecording) {
                        stopRecording();
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isRecording) {
                        e.preventDefault();
                        stopRecording();
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      if (pipelineBusy && !isRecording) return;
                      if (!isRecording) {
                        startRecording();
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      if (isRecording) {
                        stopRecording();
                      }
                    }}
                    sx={{ 
                      width: '100%', 
                      height: is1920 ? 60 : 52, 
                      bgcolor: isRecording ? '#EF4444' : pipelineBusy ? '#9CA3AF' : '#6B4FF6', 
                      color: 'white', 
                      borderRadius: is1920 ? '20px' : '16px', 
                      fontWeight: 900, 
                      fontSize: is1920 ? '1.15rem' : '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      boxShadow: isRecording ? '0 4px 12px rgba(239,68,68,0.4)' : pipelineBusy ? 'none' : '0 4px 12px rgba(107,79,246,0.3)',
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
                        {/* 声波动画 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 3,
                                height: 20,
                                bgcolor: 'white',
                                borderRadius: '2px',
                                animation: `soundwave ${0.6 + i * 0.1}s infinite`,
                                '@keyframes soundwave': {
                                  '0%, 100%': { 
                                    height: 8,
                                    opacity: 0.4
                                  },
                                  '50%': { 
                                    height: 24,
                                    opacity: 1
                                  }
                                },
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </Box>
                        {/* 倒计时显示 */}
                        <Box sx={{ 
                          ml: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          px: 2,
                          py: 0.5,
                          borderRadius: '12px'
                        }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            正在录音
                          </Typography>
                          <Box sx={{
                            minWidth: 32,
                            textAlign: 'center',
                            bgcolor: 'rgba(255,255,255,0.3)',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '8px',
                            border: '1.5px solid rgba(255,255,255,0.5)'
                          }}>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>
                              {countdown}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            秒
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Mic sx={{ fontSize: 24 }} />
                        {pipelineBusy ? 'Please wait…' : '按住说话'}
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
                    '&:hover': inputText.trim() ? { bgcolor: '#00B4A0' } : {},
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
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#FAFAFA', 
            animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideInRight': {
              from: { transform: 'translateX(100%)', opacity: 0 },
              to: { transform: 'translateX(0)', opacity: 1 }
            }
          }}>
            {/* Deep Learning Header */}
            <Box sx={{ px: 4, py: 3, borderBottom: '2px solid #E5E7EB', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: '#00B4A0', borderRadius: '50%' }} />
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#1F2937' }}>句子深度剖析</Typography>
              </Box>
              <IconButton 
                onClick={() => setActiveDeepLearning(null)} 
                sx={{ 
                  bgcolor: '#F3F4F6', 
                  '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } 
                }}
              >
                <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

            {/* Deep Learning Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Main Sentence Display */}
              <Box sx={{ 
                bgcolor: 'white', 
                p: 5, 
                borderRadius: '24px', 
                border: '2px solid #E5E7EB',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 60 }} />
    </Box>
                {activeDeepLearning.pinyin && (
                  <Typography sx={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 900, 
                    color: '#00B4A0', 
                    fontFamily: 'monospace',
                    letterSpacing: '0.15em',
                    mb: 2
                  }}>
                    {activeDeepLearning.pinyin}
                  </Typography>
                )}
                <Typography sx={{ 
                  fontSize: '2rem', 
                  fontWeight: 900, 
                  color: '#1F2937', 
                  lineHeight: 1.6,
                  mb: 3
                }}>
                  {activeDeepLearning.text}
                </Typography>
                {activeDeepLearning.translation && (
                  <Box sx={{ 
                    display: 'inline-block',
                    px: 4, 
                    py: 2, 
                    bgcolor: '#F9FAFB', 
                    borderRadius: '16px',
                    border: '2px solid #E5E7EB'
                  }}>
                    <Typography sx={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: '#6B7280',
                      fontStyle: 'italic'
                    }}>
                      {activeDeepLearning.translation}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Word Breakdown */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: '#00B4A0', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    词法单元拆解
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['咖', '啡'].map((word, idx) => (
                    <Box 
                      key={idx}
                      sx={{ 
                        bgcolor: 'white', 
                        p: 3, 
                        borderRadius: '20px', 
                        border: '2px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#00B4A0',
                          boxShadow: '0 4px 12px rgba(0,180,160,0.1)'
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#1F2937' }}>
                        {word}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#00B4A0', fontFamily: 'monospace', mb: 0.5 }}>
                          kā{idx === 1 ? 'fēi' : ''}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#6B7280' }}>
                          Coffee {idx === 0 ? '(part 1)' : '(part 2)'}
                        </Typography>
                      </Box>
                      <IconButton 
                        sx={{ 
                          bgcolor: '#F9FAFB', 
                          '&:hover': { bgcolor: '#00B4A010', color: '#00B4A0' } 
                        }}
                      >
                        <VolumeUp sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Grammar Points */}
              <Box sx={{ pb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: '#4F46E5', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    关键语法逻辑
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'white', 
                  p: 4, 
                  borderRadius: '24px',
                  border: '2px solid #C7D2FE',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: '#4F46E5', opacity: 0.05, borderRadius: '50%' }} />
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#4F46E5', mb: 2, position: 'relative' }}>
                    外来词音译
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, color: '#6B7280', lineHeight: 1.7, position: 'relative' }}>
                    "咖啡"是一个音译词，来自英语 "coffee" 的发音，这是中文中常见的处理外来词汇的方式。
                  </Typography>
                </Box>
              </Box>
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
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>AI 词典助手</Typography>
              <IconButton onClick={() => setShowDictionary(false)} sx={{ '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}>
                <Close />
              </IconButton>
            </Box>
            <Tabs value={dictTab} onChange={(_, v) => setDictTab(v)} centered sx={{ borderBottom: '2px solid #F3F4F6' }}>
              <Tab label="释义" icon={<Book fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
              <Tab label="词汇网" icon={<BubbleChart fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
              <Tab label="字源" icon={<Timeline fontSize="small" />} iconPosition="start" sx={{ fontWeight: 900, fontSize: '0.9rem' }} />
            </Tabs>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
              {dictTab === 0 && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#4F46E5', mb: 1 }}>咖啡 (kāfēi)</Typography>
                  <Typography sx={{ color: '#6B7280', mb: 3, fontSize: '1rem', fontWeight: 600 }}>Coffee - 来自外来语的音译词。</Typography>
                  <Typography sx={{ fontWeight: 900, mb: 2, fontSize: '0.9rem', color: '#6B7280' }}>例句：</Typography>
                  <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: '16px', border: '2px solid #E5E7EB' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 1 }}>我想喝一杯热咖啡。</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#9CA3AF', fontStyle: 'italic' }}>I want to drink a cup of hot coffee.</Typography>
                  </Box>
                </Box>
              )}
              {dictTab === 1 && <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>词汇关联图谱生成中...</Typography></Box>}
              {dictTab === 2 && <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>字形演变历史加载中...</Typography></Box>}
            </Box>
          </Box>
        )}
      </Box>
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
          <Grid item xs={12}><Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#F9FAFB' }}><Typography sx={{ fontWeight: 900, mb: 2 }}>单词拆解</Typography><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'white', borderRadius: '16px' }}><Box><Typography sx={{ fontWeight: 900 }}>咖啡 (kāfēi)</Typography><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Coffee</Typography></Box><IconButton size="small"><VolumeUp fontSize="small" /></IconButton></Box></Box></Grid>
        </Grid>
      </Box>
      <ButtonBase onClick={() => setScreen(ScreenState.CHAT)} sx={{ mt: 'auto', py: 2, bgcolor: '#111827', color: 'white', borderRadius: '18px', fontWeight: 900 }}>返回对话</ButtonBase>
    </Box>
  );

  const FeedbackScreen = () => {
    // Calculate session stats
    const sessionDuration = Math.floor((Date.now() - (messages[0]?.timestamp.getTime() || Date.now())) / 1000 / 60) || 5; // in minutes
    const messageCount = messages.filter(m => m.sender === 'user').length || 8;
    
    // Mock feedback data - in production, this would come from AI analysis
    const mockFeedback = {
      score: 88,
      summary: "今天的对话练习表现出色！你的语法使用准确，词汇量也比较丰富。继续保持这样的学习状态，很快就能达到HSK 3级水平。",
      suggestedFocus: "语调和自然度",
      corrections: [
        {
          original: "我想要一个咖啡",
          corrected: "我想要一杯咖啡",
          explanation: '在中文里，咖啡要用量词"杯"，而不是"个"。不同的名词需要搭配不同的量词。',
          type: "vocabulary" as const
        },
        {
          original: "多少钱这个？",
          corrected: "这个多少钱？",
          explanation: '疑问词"多少钱"应该放在句末，符合中文的语序习惯。正确的语序是：主语 + 谓语 + 宾语。',
          type: "grammar" as const
        },
        {
          original: "可以我坐在这里吗？",
          corrected: "我可以坐在这里吗？",
          explanation: '在疑问句中，"可以"应该放在主语"我"之后。中文语序：主语 + 助动词 + 动词。',
          type: "grammar" as const
        }
      ]
    };

    return (
      <Box sx={{ height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header - Compact */}
        <Box sx={{ px: 8, py: 3, borderBottom: '2px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, bgcolor: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
              <CheckCircle sx={{ fontSize: 24, color: '#16A34A' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#1F2937', lineHeight: 1 }}>实战学习报告</Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em', mt: 0.5 }}>
                SESSION REPORT · {new Date().toLocaleDateString('zh-CN')}
              </Typography>
            </Box>
          </Box>
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
              px: 6, 
              py: 2, 
              bgcolor: '#111827', 
              color: 'white', 
              borderRadius: '16px', 
              fontWeight: 900, 
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: '#00B4A0' },
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            完成练习
          </ButtonBase>
        </Box>

        {/* Content - Single Screen Layout */}
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
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                    综合评分
                  </Typography>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, lineHeight: 1, mb: 1 }}>
                    {mockFeedback.score}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {[1,2,3,4,5].map(i => (
                      <Box 
                        key={i} 
                        sx={{ 
                          fontSize: '0.85rem',
                          color: i <= Math.floor(mockFeedback.score / 20) ? '#00B4A0' : 'rgba(255,255,255,0.2)'
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
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                  学习时长
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                    {sessionDuration}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    分钟
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7280' }}>
                  完成 {messageCount} 轮对话
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
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                  表现亮点
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#00B4A0', lineHeight: 1 }}>
                    {Math.max(0, messageCount - mockFeedback.corrections.length)}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    句
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7280' }}>
                  完美表达
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
                    <Target sx={{ fontSize: 20, color: '#00B4A0' }} />
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#1F2937' }}>
                      AI 导师总结
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: '#4B5563', 
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    mb: 2
                  }}>
                    "{mockFeedback.summary}"
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: '#00B4A010', borderRadius: '12px', border: '2px solid #00B4A020' }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#00B4A0' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#00B4A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    建议关注: {mockFeedback.suggestedFocus}
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
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#1F2937' }}>
                      核心纠错
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#FEF3C7', borderRadius: '10px', border: '2px solid #FDE68A' }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {mockFeedback.corrections.length} 处改进
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {mockFeedback.corrections.slice(0, 2).map((item, idx) => (
                    <Box key={idx} sx={{ 
                      p: 2.5, 
                      bgcolor: '#F9FAFB', 
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                            fontSize: '0.55rem', 
                            fontWeight: 900, 
                            color: item.type === 'grammar' ? '#DC2626' : item.type === 'vocabulary' ? '#2563EB' : '#16A34A',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {item.type === 'grammar' ? '语法' : item.type === 'vocabulary' ? '词汇' : '自然度'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textDecoration: 'line-through', mb: 0.75 }}>
                        {item.original}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#00B4A0' }}>
                        → {item.corrected}
                      </Typography>
                    </Box>
                  ))}
                  {mockFeedback.corrections.length > 2 && (
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#9CA3AF', textAlign: 'center', mt: 0.5 }}>
                      还有 {mockFeedback.corrections.length - 2} 处建议
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

  const HistoryListScreen = () => (
    <Box sx={{ height: '100%', bgcolor: '#FFF8F0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingBackButton />
      
      {/* Header */}
      <Box sx={{ px: 4, py: 3, borderBottom: '2px solid #E5E7EB', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 8 }}>
          <History sx={{ fontSize: 28, color: '#4F46E5' }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937' }}>历史记录</Typography>
        </Box>
        {histories.length > 0 && (
          <ButtonBase
            onClick={() => {
              if (window.confirm('确定要清空所有历史记录吗？')) {
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
            清空全部
          </ButtonBase>
        )}
      </Box>

      {/* History List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
        {histories.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <History sx={{ fontSize: 64, color: '#D1D5DB' }} />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#9CA3AF' }}>暂无历史记录</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#D1D5DB' }}>完成对话练习后，记录会自动保存</Typography>
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
                    borderColor: '#4F46E5',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.15)',
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
                        {history.score} 分
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                      {new Date(history.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                      {history.duration} 分钟 · {history.messageCount} 轮对话
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
                      bgcolor: '#4F46E5',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      '&:hover': { bgcolor: '#4338CA' },
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <Assessment sx={{ fontSize: 16, mr: 0.5 }} />
                    查看报告
                  </ButtonBase>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('确定要删除这条记录吗？')) {
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
                学习反馈报告
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em', mt: 0.5 }}>
                {selectedHistory.topic} · {new Date(selectedHistory.date).toLocaleDateString('zh-CN')}
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
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                    综合评分
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
                          color: i <= Math.floor(selectedHistory.score / 20) ? '#00B4A0' : 'rgba(255,255,255,0.2)'
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
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                  学习时长
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                    {selectedHistory.duration}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    分钟
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7280' }}>
                  完成 {selectedHistory.messageCount} 轮对话
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
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em', mb: 1 }}>
                  表现亮点
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: '#00B4A0', lineHeight: 1 }}>
                    {Math.max(0, selectedHistory.messageCount - selectedHistory.feedback.corrections.length)}
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#9CA3AF' }}>
                    句
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7280' }}>
                  完美表达
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
                    <Target sx={{ fontSize: 20, color: '#00B4A0' }} />
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#1F2937' }}>
                      AI 导师总结
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: '#4B5563', 
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    mb: 2
                  }}>
                    "{selectedHistory.feedback.summary}"
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: '#00B4A010', borderRadius: '12px', border: '2px solid #00B4A020' }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#00B4A0' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#00B4A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    建议关注: {selectedHistory.feedback.suggestedFocus}
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
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#1F2937' }}>
                      核心纠错
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#FEF3C7', borderRadius: '10px', border: '2px solid #FDE68A' }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {selectedHistory.feedback.corrections.length} 处改进
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
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                            fontSize: '0.55rem', 
                            fontWeight: 900, 
                            color: item.type === 'grammar' ? '#DC2626' : item.type === 'vocabulary' ? '#2563EB' : '#16A34A',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {item.type === 'grammar' ? '语法' : item.type === 'vocabulary' ? '词汇' : '自然度'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textDecoration: 'line-through', mb: 0.75 }}>
                        {item.original}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#00B4A0' }}>
                        → {item.corrected}
                      </Typography>
                    </Box>
                  ))}
                  {selectedHistory.feedback.corrections.length > 2 && (
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#9CA3AF', textAlign: 'center', mt: 0.5 }}>
                      还有 {selectedHistory.feedback.corrections.length - 2} 处建议
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
        open={aiRequestTimeoutOpen}
        autoHideDuration={6000}
        onClose={() => setAiRequestTimeoutOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ maxWidth: 'min(92vw, 560px)' }}
      >
        <Alert
          onClose={() => setAiRequestTimeoutOpen(false)}
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
        >
          Request timed out. Check your connection and try again.
        </Alert>
      </Snackbar>
    </Box>
  );
}
