import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// TYPES
// ============================================================
// AppMode: 'ocr' | 'voice' | 'text' | 'fingertap'
// TranslationResult: { original, pinyin, translation, words[] }
// WordBreakdown: { chinese, pinyin, meaning, partOfSpeech }

interface TranslationHistory {
  id: string;
  type: 'ocr' | 'voice' | 'text';
  timestamp: number;
  original: string;
  pinyin?: string;
  translation: string;
  words?: Array<{
    chinese: string;
    pinyin: string;
    meaning: string;
    partOfSpeech: string;
  }>;
}

// ============================================================
// HISTORY STORAGE UTILITIES
// ============================================================
const HISTORY_STORAGE_KEY = 'camera_translation_history';
const MAX_HISTORY_ITEMS = 50;

const getHistory = (): TranslationHistory[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history: TranslationHistory[]): void => {
  try {
    // 只保留最新的MAX_HISTORY_ITEMS条
    const limited = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limited));
    // 触发自定义事件以刷新历史记录视图
    window.dispatchEvent(new Event('historyUpdated'));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
};

/**
 * 添加历史记录
 * 
 * 设计说明：
 * - 操作完成后立即保存到历史记录是合理的，因为：
 *   1. 用户可以回顾所有操作历史，包括查看之前的翻译结果
 *   2. 如果用户不需要某条记录，可以使用删除功能移除
 *   3. 符合大多数应用的逻辑（如浏览器历史、聊天记录等）
 * - 用户可以通过以下方式管理历史记录：
 *   1. 单个删除：悬停历史记录项，点击右上角的删除按钮
 *   2. 批量清空：点击"清空"按钮，清空当前类型的所有历史记录
 */
const addToHistory = (item: Omit<TranslationHistory, 'id' | 'timestamp'>): void => {
  const history = getHistory();
  const newItem: TranslationHistory = {
    ...item,
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  // 将新项添加到最前面
  history.unshift(newItem);
  saveHistory(history);
};

const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.dispatchEvent(new Event('historyUpdated'));
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
};

const deleteHistoryItem = (id: string): void => {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    saveHistory(filtered);
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
};

// ============================================================
// MOCK DATA & SERVICES
// ============================================================
const mockOCRResult = {
  original: "今天天气很好",
  pinyin: "jīn tiān tiān qì hěn hǎo",
  translation: "The weather is very nice today",
  words: [
    { chinese: "今天", pinyin: "jīn tiān", meaning: "today", partOfSpeech: "noun" },
    { chinese: "天气", pinyin: "tiān qì", meaning: "weather", partOfSpeech: "noun" },
    { chinese: "很", pinyin: "hěn", meaning: "very", partOfSpeech: "adverb" },
    { chinese: "好", pinyin: "hǎo", meaning: "good/nice", partOfSpeech: "adjective" },
  ]
};

const mockTranslate = async (text: string) => {
  await new Promise(r => setTimeout(r, 1500));
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  return {
    original: text,
    pinyin: isChinese ? "pīn yīn shì lì" : "This is English",
    translation: isChinese ? "Sample English translation" : "中文翻译示例",
    words: [
      { chinese: isChinese ? text.slice(0, 2) : "示例", pinyin: "shì lì", meaning: "example", partOfSpeech: "noun" }
    ]
  };
};

// ============================================================
// ICONS
// ============================================================
const CameraIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const MicIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  </svg>
);

const TextIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

const SpeakerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const TranslateIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
  </svg>
);

const FingerIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================
// MOCK VISION CORE COMPONENT (Simulated Camera)
// ============================================================
interface VisionCoreProps {
  isScanning: boolean;
  onScan: (imageData: string) => void;
}

const VisionCore: React.FC<VisionCoreProps> = ({ isScanning, onScan }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate camera initialization
    const timer = setTimeout(() => {
      setIsReady(true);
      drawMockCamera();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Draw a mock camera view with animated elements
  const drawMockCamera = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    // Animated gradient background
    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const time = Date.now() / 3000;
      gradient.addColorStop(0, `hsl(${200 + Math.sin(time) * 20}, 70%, 20%)`);
      gradient.addColorStop(0.5, `hsl(${220 + Math.cos(time) * 20}, 60%, 15%)`);
      gradient.addColorStop(1, `hsl(${180 + Math.sin(time * 0.7) * 30}, 65%, 18%)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mock "book page" with Chinese text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(240, 180, 800, 360);
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(240, 180, 800, 360);

      // Mock Chinese characters
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 80px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('你好世界', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '32px "Noto Sans SC", sans-serif';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.fillText('Nǐ hǎo shì jiè', canvas.width / 2, canvas.height / 2 + 40);

      // Subtle scan lines effect
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillStyle = `rgba(16, 185, 129, ${0.02 * Math.sin(time + i * 0.1)})`;
        ctx.fillRect(0, i, canvas.width, 2);
      }

      if (!isScanning) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScanning) return;
    
    const data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    if (data) onScan(data);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-950">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 border-3 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-emerald-500/60 text-xs font-bold tracking-widest uppercase animate-pulse">Initializing Vision Hub...</p>
        </div>
      )}

      {/* Camera Frame & Scan Area */}
      {isReady && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`relative w-[70%] max-w-[420px] h-[280px] transition-all duration-500 ${isScanning ? 'scale-105' : 'scale-100'}`}>
              {/* Corner Brackets - Smaller and more elegant */}
              <div className={`absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 rounded-tl-xl transition-all duration-300 ${isScanning ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{borderWidth: '3px'}} />
              <div className={`absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 rounded-tr-xl transition-all duration-300 ${isScanning ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{borderWidth: '3px'}} />
              <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 rounded-bl-xl transition-all duration-300 ${isScanning ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{borderWidth: '3px'}} />
              <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 rounded-br-xl transition-all duration-300 ${isScanning ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{borderWidth: '3px'}} />
              
              {/* Scanning Line */}
              {isScanning && <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan shadow-[0_0_10px_rgba(52,211,153,1)]" />}
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs tracking-wider font-medium transition-all ${isScanning ? 'text-emerald-400' : 'text-white/40'}`}>
                  {isScanning ? 'Scanning Data...' : '将文字对准此处'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capture Button - Camera shutter style */}
      {isReady && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={captureFrame} 
            disabled={isScanning} 
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isScanning 
                ? 'bg-emerald-500/80 scale-95' 
                : 'bg-white/90 hover:bg-white hover:scale-105 active:scale-95'
            } shadow-2xl shadow-black/30`}
          >
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
              isScanning ? 'border-white/50' : 'border-slate-800'
            }`}>
              {isScanning ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// OCR RESULT VIEW COMPONENT
// ============================================================
interface OCRResultViewProps {
  result: {
    original: string;
    pinyin: string;
    translation: string;
    words: Array<{
      chinese: string;
      pinyin: string;
      meaning: string;
      partOfSpeech: string;
    }>;
  };
}

const OCRResultView: React.FC<OCRResultViewProps> = ({ result }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Original Text - 显示中文 */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"/>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">原文</span>
        </div>
        <p className="text-2xl font-bold text-white leading-relaxed tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {result.original}
        </p>
      </div>

      {/* Pinyin Display - 显示拼音 */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">拼音</span>
        </div>
        <p className="text-lg text-emerald-400 font-mono tracking-widest">{result.pinyin}</p>
      </div>

      {/* Translation Display - 显示用户母语 */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">翻译</span>
        </div>
        <p className="text-base text-slate-200">{result.translation}</p>
      </div>
    </div>
  );
};

// ============================================================
// VOICE TRANSLATION COMPONENT
// ============================================================
interface VoiceTranslationProps {
  onResult?: (result: any) => void;
}

const VoiceTranslation: React.FC<VoiceTranslationProps> = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(16));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let animationInterval: ReturnType<typeof setInterval>;
    if (isRecording) {
      animationInterval = setInterval(() => {
        setWaveHeights(Array(20).fill(0).map(() => Math.random() * 48 + 16));
      }, 150);
    } else {
      setWaveHeights(Array(20).fill(16));
    }
    return () => clearInterval(animationInterval);
  }, [isRecording]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fadeIn">
      {/* Waveform visualization */}
      <div className="flex items-center gap-1 h-14">
        {waveHeights.map((height, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              isRecording ? 'bg-emerald-400' : 'bg-slate-700'
            }`}
            style={{
              height: `${height}px`,
              animationDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-1.5">
        <p className={`text-xl font-mono transition-colors ${isRecording ? 'text-red-400' : loading ? 'text-emerald-400' : 'text-slate-500'}`}>
          {formatTime(timer)}
        </p>
        <p className="text-slate-500 text-sm">
          {loading ? '正在翻译...' : isRecording ? '正在录音，再次点击停止...' : '点击开始语音输入'}
        </p>
      </div>

      {result && (
        <div className="pt-4 w-full animate-fadeIn">
          <OCRResultView result={result} />
        </div>
      )}

      <button
        onClick={async () => {
          if (isRecording) {
            // 停止录音，模拟翻译
            setIsRecording(false);
            setLoading(true);
            try {
              // 模拟语音识别和翻译
              await new Promise(r => setTimeout(r, 1500));
              const mockResult = await mockTranslate("你好，今天天气很好");
              setResult(mockResult);
              // 保存到历史记录
              addToHistory({
                type: 'voice',
                original: mockResult.original,
                pinyin: mockResult.pinyin,
                translation: mockResult.translation,
                words: mockResult.words,
              });
              if (onResult) onResult(mockResult);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          } else {
            setIsRecording(true);
          }
        }}
        disabled={loading}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          isRecording 
            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-105 animate-pulse' 
            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 hover:scale-105 shadow-lg shadow-emerald-500/30'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`absolute inset-0 rounded-full border-4 border-white/20 ${isRecording ? 'animate-ping opacity-20' : ''}`} />
        <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isRecording ? (
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          ) : (
            <>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </>
          )}
        </svg>
      </button>
    </div>
  );
};

// ============================================================
// TEXT TRANSLATION COMPONENT
// ============================================================
interface TextTranslationProps {
  onResult?: (result: any) => void;
}

const TextTranslation: React.FC<TextTranslationProps> = ({ onResult }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTranslate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await mockTranslate(input);
      setResult(res);
      // 保存到历史记录
      addToHistory({
        type: 'text',
        original: res.original,
        pinyin: res.pinyin,
        translation: res.translation,
        words: res.words,
      });
      if (onResult) onResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要翻译的中文或英文..."
          className="w-full h-32 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-base"
        />
        <span className="absolute bottom-3 right-3 text-xs text-slate-600">
          {input.length}/500
        </span>
      </div>

      <button
        onClick={handleTranslate}
        disabled={!input.trim() || loading}
        className={`w-full py-3 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 ${
          input.trim() && !loading
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 active:scale-98'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <TranslateIcon />
            翻译
          </>
        )}
      </button>

      {result && (
        <div className="pt-3 animate-fadeIn">
          <OCRResultView result={result} />
        </div>
      )}
    </div>
  );
};

// ============================================================
// FINGERTAP MODE COMPONENT (Mock AR)
// ============================================================
interface FingerTapModeProps {
  onExit: () => void;
}

const FingerTapMode: React.FC<FingerTapModeProps> = ({ onExit }) => {
  const [showGuide, setShowGuide] = useState(true);
  const [detectedItems, setDetectedItems] = useState<Array<{ x: number; y: number; text: string; pinyin: string; trans: string }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!showGuide) {
      // Simulate AR detection after guide
      const timer = setTimeout(() => {
        setDetectedItems([
          { x: 45, y: 40, text: '学习', pinyin: 'xué xí', trans: 'To Study' },
          { x: 55, y: 55, text: '书本', pinyin: 'shū běn', trans: 'Book' },
        ]);
      }, 2000);

      // Draw mock AR camera view
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 1920;
          canvas.height = 1080;
          
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#0f172a');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw mock book page
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(400, 300, 1120, 480);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = 'bold 120px "Noto Sans SC", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('学习汉语', canvas.width / 2, canvas.height / 2);
        }
      }

      return () => clearTimeout(timer);
    }
  }, [showGuide]);

  // Guide Screen
  if (showGuide) {
    return (
      <div className="absolute inset-0 z-[60] bg-slate-950 flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-fadeIn">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full">Hardware Setup Required</span>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">指读模式引导</h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                进入 AR 指读模式前，请在摄像头前方安装 <span className="text-emerald-400 font-bold">FingerTap 45° 倒相镜</span> 硬件。它能帮助摄像头"看见"桌面上您的手指所指向的内容。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">1</div>
                <span className="text-sm text-slate-300 font-medium">吸附底座</span>
              </div>
              <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">2</div>
                <span className="text-sm text-slate-300 font-medium">安装反光镜</span>
              </div>
            </div>
            <button onClick={() => setShowGuide(false)} className="w-full py-5 bg-white text-slate-950 font-black text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
              已安装，开启 AR 视界
            </button>
            <button onClick={onExit} className="w-full text-slate-500 font-bold hover:text-white transition-colors">
              返回普通模式
            </button>
          </div>
          <div className="relative hidden lg:block">
            <div className="aspect-square bg-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center relative group overflow-hidden">
              <div className="w-32 h-48 bg-slate-800 rounded-lg transform rotate-45 skew-x-12 animate-float border border-white/20 shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AR Mode View
  return (
    <div className="relative w-full h-full bg-black overflow-hidden animate-fadeIn">
      <canvas ref={canvasRef} className="w-full h-full object-cover opacity-70 grayscale-[0.2]" />
      
      {/* AR Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Tracking</span>
          </div>
        </div>
        {detectedItems.map((item, i) => (
          <div key={i} className="absolute animate-fadeIn" style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -120%)' }}>
            <div className="bg-white/95 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl min-w-[180px] border border-emerald-500/30">
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{item.text}</h4>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{item.pinyin}</p>
              <div className="h-px bg-slate-200/60 my-2" />
              <p className="text-sm font-black text-slate-700 leading-tight">{item.trans}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onExit} className="absolute bottom-12 left-1/2 -translate-x-1/2 px-12 py-5 bg-white/10 backdrop-blur-3xl border border-white/20 text-white font-black text-xl rounded-full hover:bg-white/20 hover:scale-105 transition-all active:scale-95 shadow-2xl">
        退出指读模式
      </button>
    </div>
  );
};

// ============================================================
// WELCOME STATE COMPONENT
// ============================================================
interface WelcomeStateProps {
  icon: React.ReactNode;
  text: string;
}

const WelcomeState: React.FC<WelcomeStateProps> = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center text-slate-600 py-16 space-y-3 animate-fadeIn">
    <div className="opacity-20 scale-75">{icon}</div>
    <p className="text-sm font-medium tracking-wide text-center px-4">{text}</p>
  </div>
);

// ============================================================
// HISTORY MANAGEMENT VIEW COMPONENT (历史记录管理页面)
// ============================================================
interface HistoryManagementViewProps {
  onSelectHistory?: (history: TranslationHistory) => void;
}

const HistoryManagementView: React.FC<HistoryManagementViewProps> = ({ onSelectHistory }) => {
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'ocr' | 'voice' | 'text'>('all');

  useEffect(() => {
    const allHistory = getHistory();
    setHistory(allHistory);
  }, [refreshKey]);

  // 监听storage变化以刷新历史记录
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('historyUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('historyUpdated', handleStorageChange);
    };
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ocr': return '拍摄';
      case 'voice': return '语音';
      case 'text': return '文本';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ocr': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'voice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'text': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleClear = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
      setRefreshKey(prev => prev + 1);
    }
  };

  const filteredHistory = filterType === 'all' 
    ? history 
    : history.filter(item => item.type === filterType);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 animate-fadeIn">
        <div className="opacity-20 scale-75">
          <HistoryIcon />
        </div>
        <p className="text-sm font-medium tracking-wide text-center px-4 text-slate-500">暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header with Filter and Clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-300">历史记录 ({filteredHistory.length})</h3>
          {/* Filter Buttons */}
          <div className="flex gap-1 bg-slate-800/40 p-1 rounded-lg">
            {(['all', 'ocr', 'voice', 'text'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  filterType === type
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? '全部' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
        >
          清空
        </button>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            没有{filterType === 'all' ? '' : getTypeLabel(filterType)}历史记录
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 rounded-xl p-3 border border-slate-700/30 transition-all hover:border-slate-600/50"
            >
              {/* 删除按钮 - 悬停时显示 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('确定要删除这条历史记录吗？')) {
                    deleteHistoryItem(item.id);
                    setRefreshKey(prev => prev + 1);
                  }
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                title="删除"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* 点击区域 */}
              <button
                onClick={() => onSelectHistory && onSelectHistory(item)}
                className="w-full text-left pr-8 active:scale-[0.98] transition-transform"
                title="点击查看完整结果"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{formatTime(item.timestamp)}</span>
                </div>
                <p className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-emerald-400 transition-colors">{item.original}</p>
                {item.pinyin && (
                  <p className="text-xs text-emerald-400 font-mono mb-1">{item.pinyin}</p>
                )}
                <p className="text-xs text-slate-400 line-clamp-1">{item.translation}</p>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================
// TRANSLATION HUB COMPONENT
// ============================================================
interface TranslationHubProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
  ocrResult: any;
  error: string | null;
  isFullScreen?: boolean;
  onHistorySelect?: (history: TranslationHistory) => void;
  onExit?: () => void;
}

const TranslationHub: React.FC<TranslationHubProps> = ({ activeMode, onModeChange, ocrResult, error, isFullScreen = false, onHistorySelect, onExit }) => {
  const modes = [
    { id: 'ocr', label: '相机', icon: <CameraIcon /> },
    { id: 'voice', label: '语音', icon: <MicIcon /> },
    { id: 'text', label: '文本', icon: <TextIcon /> },
    { id: 'history', label: '历史', icon: <HistoryIcon /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Exit Button - 全屏模式下显示（语音和文本模式） */}
      {isFullScreen && onExit && (
        <button
          onClick={onExit}
          className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-black/60 hover:scale-110 transition-all shadow-2xl"
          title="返回首页"
        >
          <BackIcon />
        </button>
      )}

      {/* Top Special Entry: FingerTap Reading (只在非全屏时显示) */}
      {!isFullScreen && (
        <div className="p-6 pb-3">
          <button
            onClick={() => onModeChange('fingertap')}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">New Feature</span>
                <h3 className="text-lg font-black text-white italic">Fingertap Reading</h3>
                <p className="text-emerald-100/70 text-xs">AR 智慧指读模式</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <FingerIcon />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <div className={`px-6 ${isFullScreen ? 'pt-6' : 'pb-3'}`}>
        <div className="flex gap-2 bg-slate-800/40 p-1.5 rounded-2xl border border-white/5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMode === m.id
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-4 animate-fadeIn flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-6">
          {activeMode === 'ocr' && (
            ocrResult ? (
              <OCRResultView result={ocrResult} />
            ) : (
              <WelcomeState icon={<CameraIcon className="w-14 h-14"/>} text="请扫描书籍或文档内容" />
            )
          )}
          {activeMode === 'voice' && (
            <VoiceTranslation onResult={onHistorySelect ? (result) => {
              // 语音翻译结果已保存，这里可以触发刷新历史记录
            } : undefined} />
          )}
          {activeMode === 'text' && (
            <TextTranslation onResult={onHistorySelect ? (result) => {
              // 文本翻译结果已保存，这里可以触发刷新历史记录
            } : undefined} />
          )}
          {activeMode === 'history' && (
            <HistoryManagementView onSelectHistory={onHistorySelect} />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN CAMERA PAGE COMPONENT
// ============================================================
export default function CameraPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('ocr'); // 初始状态：相机模式
  const [isFullScreen, setIsFullScreen] = useState(false); // 全屏模式（文本/语音）
  const [isScanning, setIsScanning] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (imageData: string) => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    
    setIsScanning(true);
    setError(null);
    try {
      // Simulate OCR processing
      await new Promise(r => setTimeout(r, 2000));
      const ocrResult = mockOCRResult;
      setResult(ocrResult);
      setMode('ocr');
      // 保存到历史记录
      addToHistory({
        type: 'ocr',
        original: ocrResult.original,
        pinyin: ocrResult.pinyin,
        translation: ocrResult.translation,
        words: ocrResult.words,
      });
    } catch (err) {
      console.error("OCR Error:", err);
      setError("识别失败，请确保文字清晰且光线充足。");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleExitToHome = () => {
    navigate('/');
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    // 文本和语音模式时，进入全屏
    if (newMode === 'text' || newMode === 'voice') {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  };

  const handleHistorySelect = (history: TranslationHistory) => {
    // 将历史记录转换为结果格式并显示
    const historyResult = {
      original: history.original,
      pinyin: history.pinyin || '',
      translation: history.translation,
      words: history.words || [],
    };
    setResult(historyResult);
    // 切换到对应的模式
    setMode(history.type);
    setIsFullScreen(false);
    // 清除错误信息
    setError(null);
    // 滚动到顶部以显示结果
    setTimeout(() => {
      const contentArea = document.querySelector('.custom-scrollbar');
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="flex flex-row h-full w-full bg-slate-950 overflow-hidden font-sans">
      {/* Flash Effect */}
      {showFlash && <div className="absolute inset-0 bg-white z-[100] animate-pulse pointer-events-none" />}

      {/* Main Layout Container */}
      <div className={`flex transition-all duration-700 ease-in-out h-full w-full ${mode === 'fingertap' ? 'translate-x-0' : ''}`}>
        
        {/* Left/Main Area - Camera (隐藏在全屏模式) */}
        <div className={`h-full relative transition-all duration-700 ${
          mode === 'fingertap' ? 'w-full' : 
          isFullScreen ? 'w-0 opacity-0 overflow-hidden' : 
          'w-[60%] border-r border-white/5'
        }`}>
          {mode === 'fingertap' ? (
            <FingerTapMode onExit={() => setMode('ocr')} />
          ) : (
            <>
              <VisionCore isScanning={isScanning} onScan={handleScan} />
              
              {/* Exit Button - Always visible to return to home */}
              <button
                onClick={handleExitToHome}
                className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-black/60 hover:scale-110 transition-all shadow-2xl"
              >
                <BackIcon />
              </button>

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-3 border-emerald-500/20 rounded-full" style={{borderWidth: '3px'}} />
                    <div className="absolute inset-0 w-16 h-16 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" style={{borderWidth: '3px'}} />
                  </div>
                  <p className="mt-4 text-emerald-400 font-bold text-sm tracking-widest uppercase animate-pulse">Scanning Data...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Translation Hub (全屏模式时占满整个屏幕) */}
        <div className={`h-full flex flex-col bg-slate-900/50 backdrop-blur-lg transition-all duration-700 ${
          mode === 'fingertap' ? 'w-0 opacity-0 overflow-hidden' : 
          isFullScreen ? 'w-full' : 
          'w-[40%]'
        }`}>
          <TranslationHub 
            activeMode={mode} 
            onModeChange={handleModeChange} 
            ocrResult={result}
            error={error}
            isFullScreen={isFullScreen}
            onHistorySelect={handleHistorySelect}
            onExit={handleExitToHome}
          />
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
        }
        
        @keyframes scan { 
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(45deg) skewX(12deg); } 
          50% { transform: translateY(-20px) rotate(42deg) skewX(10deg); } 
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
