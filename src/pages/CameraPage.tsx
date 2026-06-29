import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PinyinRubyText from '../components/PinyinRubyText';

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
  original: "我爱学中文",
  pinyin: "wǒ ài xué zhōng wén",
  translation: "I love learning Chinese",
  words: [
    { chinese: "我", pinyin: "wǒ", meaning: "I / me", partOfSpeech: "pronoun" },
    { chinese: "爱", pinyin: "ài", meaning: "love", partOfSpeech: "verb" },
    { chinese: "学", pinyin: "xué", meaning: "learn / study", partOfSpeech: "verb" },
    { chinese: "中文", pinyin: "zhōng wén", meaning: "Chinese language", partOfSpeech: "noun" },
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

const FingerTapFeatureIcon = () => (
  <div className="relative w-8 h-8">
    <svg className="absolute inset-0 w-8 h-8 text-white drop-shadow-lg" viewBox="0 0 32 32" fill="none">
      <path
        d="M13.8 25.2 11.2 9.6c-.18-1.1.98-1.93 1.95-1.4l13.3 7.3c1 .55.93 2.02-.12 2.48l-5.08 2.2-2.3 5.04c-.48 1.04-1.98.96-2.48-.07l-1.05-2.16-1.62 2.2Z"
        fill="url(#fingerTapGradient)"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M20.5 20.5 27 27" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="8" cy="7" r="1.7" fill="white" opacity="0.92" />
      <path d="M5 15h4M15 4l-2.5 3M3.5 10l3 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <defs>
        <linearGradient id="fingerTapGradient" x1="10.8" y1="7.9" x2="24.6" y2="25.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#A7F3D0" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute -right-1 -top-1 rounded-md bg-white/90 px-1 text-[8px] font-black tracking-[-0.04em] text-emerald-700 shadow-lg">
      AR
    </div>
    <div className="absolute -bottom-1 left-0 h-1 w-7 rounded-full bg-emerald-200/70 blur-[2px]" />
  </div>
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

const FrameResizeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

interface FrameRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

const FRAME_LIMITS = {
  minWidth: 140,
  minHeight: 120,
  maxWidth: 440,
  maxHeight: 430,
};

const DEFAULT_FRAME: FrameRect = {
  width: FRAME_LIMITS.maxWidth,
  height: FRAME_LIMITS.maxHeight,
  x: 0,
  y: 0,
};

type FrameDragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

const clampFrame = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const VisionCore: React.FC<VisionCoreProps> = ({ isScanning, onScan }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [frame, setFrame] = useState<FrameRect>(DEFAULT_FRAME);
  const [isFocusAdjusting, setIsFocusAdjusting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    mode: FrameDragMode;
    startX: number;
    startY: number;
    startFrame: FrameRect;
  } | null>(null);

  useEffect(() => {
    // Simulate camera initialization
    const timer = setTimeout(() => {
      setIsReady(true);
      drawMockCamera();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const start = drag.startFrame;
      let { width, height, x, y } = start;

      switch (drag.mode) {
        case 'move':
          setFrame({ ...start, x: start.x + dx, y: start.y + dy });
          return;
        case 'se':
          width = clampFrame(start.width + dx, FRAME_LIMITS.minWidth, FRAME_LIMITS.maxWidth);
          height = clampFrame(start.height + dy, FRAME_LIMITS.minHeight, FRAME_LIMITS.maxHeight);
          break;
        case 'sw':
          width = clampFrame(start.width - dx, FRAME_LIMITS.minWidth, FRAME_LIMITS.maxWidth);
          height = clampFrame(start.height + dy, FRAME_LIMITS.minHeight, FRAME_LIMITS.maxHeight);
          x = start.x + dx / 2;
          break;
        case 'ne':
          width = clampFrame(start.width + dx, FRAME_LIMITS.minWidth, FRAME_LIMITS.maxWidth);
          height = clampFrame(start.height - dy, FRAME_LIMITS.minHeight, FRAME_LIMITS.maxHeight);
          y = start.y + dy / 2;
          break;
        case 'nw':
          width = clampFrame(start.width - dx, FRAME_LIMITS.minWidth, FRAME_LIMITS.maxWidth);
          height = clampFrame(start.height - dy, FRAME_LIMITS.minHeight, FRAME_LIMITS.maxHeight);
          x = start.x + dx / 2;
          y = start.y + dy / 2;
          break;
        default:
          return;
      }

      setFrame({ width, height, x, y });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const startFrameDrag = (event: React.PointerEvent, mode: FrameDragMode) => {
    if (!isFocusAdjusting || isScanning) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startFrame: { ...frame },
    };
    setIsDragging(true);
  };

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

      // Draw a clean book page: white paper, black Kai-style Chinese text.
      const pageX = 250;
      const pageY = 170;
      const pageW = 780;
      const pageH = 390;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(pageX, pageY, pageW, pageH);
      ctx.restore();

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.lineWidth = 3;
      ctx.strokeRect(pageX, pageY, pageW, pageH);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(pageX + 88, pageY + 112 + i * 48, pageW - 176, 1.5);
      }

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 92px "KaiTi", "STKaiti", "SimKai", "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('我爱学中文', canvas.width / 2, canvas.height / 2 - 18);
      
      ctx.font = '28px "Google Sans", "Roboto", sans-serif';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
      ctx.fillText('wǒ ài xué zhōng wén', canvas.width / 2, canvas.height / 2 + 54);

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
          <div className="absolute inset-0">
            <div
              className={`absolute ${isDragging ? '' : 'transition-all duration-300'} ${isScanning ? 'scale-105' : 'scale-100'}`}
              style={{
                left: `calc(50% + ${frame.x}px)`,
                top: `calc(50% + ${frame.y}px)`,
                width: frame.width,
                height: frame.height,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Draggable border + move area */}
              <div
                className={`absolute inset-0 rounded-xl ${isFocusAdjusting ? 'pointer-events-auto cursor-move touch-none' : 'pointer-events-none'} ${
                  isFocusAdjusting ? 'border-2 border-emerald-400/55 shadow-[0_0_24px_rgba(16,185,129,0.18)]' : ''
                }`}
                onPointerDown={(event) => startFrameDrag(event, 'move')}
              />

              {/* Corner Brackets */}
              <div className={`absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 rounded-tl-xl pointer-events-none transition-all duration-300 ${isScanning || isFocusAdjusting ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{ borderWidth: '3px' }} />
              <div className={`absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 rounded-tr-xl pointer-events-none transition-all duration-300 ${isScanning || isFocusAdjusting ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{ borderWidth: '3px' }} />
              <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 rounded-bl-xl pointer-events-none transition-all duration-300 ${isScanning || isFocusAdjusting ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{ borderWidth: '3px' }} />
              <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 rounded-br-xl pointer-events-none transition-all duration-300 ${isScanning || isFocusAdjusting ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'border-white/30'}`} style={{ borderWidth: '3px' }} />

              {/* Corner drag handles */}
              {isFocusAdjusting && !isScanning && (
                <>
                  {([
                    { mode: 'nw' as const, className: '-top-5 -left-5 cursor-nwse-resize' },
                    { mode: 'ne' as const, className: '-top-5 -right-5 cursor-nesw-resize' },
                    { mode: 'sw' as const, className: '-bottom-5 -left-5 cursor-nesw-resize' },
                    { mode: 'se' as const, className: '-bottom-5 -right-5 cursor-nwse-resize' },
                  ]).map(({ mode, className }) => (
                    <div
                      key={mode}
                      role="presentation"
                      onPointerDown={(event) => startFrameDrag(event, mode)}
                      className={`absolute w-11 h-11 rounded-full bg-emerald-400/90 border-2 border-white shadow-lg shadow-emerald-500/30 pointer-events-auto touch-none ${className}`}
                    />
                  ))}
                </>
              )}
              
              {/* Scanning Line */}
              {isScanning && <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan shadow-[0_0_10px_rgba(52,211,153,1)]" />}
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-xs tracking-wider font-medium transition-all ${isScanning ? 'text-emerald-400' : 'text-white/40'}`}>
                  {isScanning
                    ? 'Scanning Data...'
                    : isFocusAdjusting
                      ? 'Drag corners to resize · Drag frame to move'
                      : 'Align text inside the frame'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus button — top-right, same level as back button */}
      {isReady && (
        <button
          type="button"
          onClick={() => setIsFocusAdjusting((prev) => !prev)}
          title="Adjust focus frame size"
          aria-label="Adjust focus frame size"
          className={`absolute top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isFocusAdjusting
              ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-lg shadow-emerald-500/15'
              : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 hover:bg-black/60 hover:scale-110'
          } shadow-2xl`}
        >
          <FrameResizeIcon className="w-5 h-5" />
        </button>
      )}

      {/* Shutter button — horizontally centered on canvas */}
      {isReady && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={captureFrame} 
            disabled={isScanning} 
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isScanning 
                ? 'bg-emerald-500/85 scale-95' 
                : 'bg-white/95 hover:bg-white hover:scale-105 active:scale-95'
            } shadow-2xl shadow-black/35`}
          >
            <div className={`absolute inset-0 rounded-full border-4 border-white/20 ${isScanning ? 'animate-ping opacity-20' : ''}`} />
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
              isScanning ? 'border-white/55' : 'border-slate-900'
            }`}>
              {isScanning ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-900">
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
      {/* Original + ruby pinyin (GB/T 16159 word segmentation) */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500"/>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Original</span>
        </div>
        <PinyinRubyText
          original={result.original}
          words={result.words}
        />
      </div>

      {/* Translation Display - 显示用户母语 */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Translation</span>
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
          {loading ? 'Translating...' : isRecording ? 'Recording. Tap again to stop.' : 'Tap to start voice input'}
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
          placeholder="Enter Chinese or English to translate..."
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
            Translate
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
  const [demoStep, setDemoStep] = useState<'mirror' | 'finger' | 'reading'>('mirror');
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

  const demoClips = [
    {
      id: 'mirror' as const,
      label: 'Mirror setup',
      title: 'Mirror aligned',
      subtitle: 'Position the 45° mirror so the camera can see the desk.',
      accent: 'emerald',
    },
    {
      id: 'finger' as const,
      label: 'Finger tracking',
      title: 'Finger detected',
      subtitle: 'The camera tracks where the fingertip lands on the page.',
      accent: 'cyan',
    },
    {
      id: 'reading' as const,
      label: 'AR reading',
      title: 'Instant reading',
      subtitle: 'Tap a word to hear pronunciation and see meaning instantly.',
      accent: 'violet',
    },
  ];
  const activeDemo = demoClips.find((clip) => clip.id === demoStep) ?? demoClips[0];

  // Guide Screen
  if (showGuide) {
    return (
      <div className="absolute inset-0 z-[60] bg-[#07111f] flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute -top-32 -right-20 w-[520px] h-[520px] bg-emerald-400/15 rounded-full blur-[110px]" />
        <div className="absolute -bottom-40 -left-24 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-8 items-center animate-fadeIn">
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
                Hardware Tutorial
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-[0.98] tracking-[-0.04em]">
                  Fingertap<br />Reading
                </h1>
                <p className="mt-4 text-base text-slate-300 leading-relaxed">
                  Use the 45° mirror to let the camera read the desktop area, then point at words in a book to hear pronunciation and see instant translation.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-slate-950 shadow-lg shadow-emerald-500/20">1</div>
                <div>
                  <p className="text-sm font-black text-white">Position the mirror</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-400">Place the FingerTap mirror in front of the camera at the marked angle.</p>
                </div>
              </div>
              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">2</div>
                <div>
                  <p className="text-sm font-black text-white">Tap to read</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-400">Point at any word on the page to trigger AR reading support.</p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-[1fr_auto] gap-3">
              <button onClick={() => setShowGuide(false)} className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-95">
                Start Fingertap Reading
              </button>
              <button onClick={onExit} className="rounded-2xl border border-white/10 px-4 py-4 text-sm font-black text-slate-400 transition-colors hover:text-white">
                Exit
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-emerald-950/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.28),transparent_34%),linear-gradient(135deg,#111827_0%,#0f172a_55%,#042f2e_100%)]" />
              <div className="absolute left-6 top-5 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
                Demo Video · {activeDemo.label}
              </div>

              <div className="absolute inset-x-10 bottom-8 h-36 rounded-2xl border border-white/15 bg-white/12 shadow-2xl shadow-black/25 backdrop-blur-sm rotate-[-2deg]" />
              <div className={`absolute left-[24%] top-[32%] h-24 w-40 rounded-xl border rotate-[18deg] shadow-[0_0_30px_rgba(52,211,153,0.18)] transition-all ${
                demoStep === 'mirror'
                  ? 'border-emerald-300/70 bg-emerald-300/20 scale-105'
                  : 'border-emerald-300/25 bg-emerald-300/10'
              }`}>
                <div className="absolute inset-x-4 top-7 h-1 rounded-full bg-white/35" />
                <div className="absolute inset-x-5 top-12 h-1 rounded-full bg-white/25" />
                <div className="absolute inset-x-7 top-17 h-1 rounded-full bg-white/20" />
              </div>
              <div className={`absolute right-[19%] top-[38%] h-28 w-9 origin-bottom rotate-[-30deg] rounded-full bg-gradient-to-b from-orange-100 to-orange-300 shadow-2xl shadow-black/25 transition-all ${
                demoStep === 'finger' ? 'scale-110 shadow-cyan-300/30' : ''
              }`}>
                <div className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-orange-100" />
              </div>
              <div className={`absolute left-[48%] top-[53%] h-12 w-32 rounded-full border blur-[1px] transition-all ${
                demoStep === 'finger'
                  ? 'border-cyan-300/70 bg-cyan-300/20 scale-110'
                  : 'border-emerald-300/50 bg-emerald-300/15'
              }`} />
              <div className={`absolute left-[45%] top-[51%] rounded-xl border px-3 py-2 text-xs font-black text-white shadow-xl backdrop-blur transition-all ${
                demoStep === 'reading'
                  ? 'border-violet-300/70 bg-violet-950/85 scale-110'
                  : 'border-emerald-300/50 bg-slate-950/75'
              }`}>
                你好 · nǐ hǎo
                <p className="mt-0.5 text-[10px] font-semibold text-emerald-300">hello</p>
              </div>

              <div className="absolute bottom-5 left-6 right-6 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                <p className="text-sm font-black text-white">{activeDemo.title}</p>
                <p className="mt-1 text-xs leading-snug text-slate-300">{activeDemo.subtitle}</p>
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)] bg-[length:100%_8px] opacity-40" />
              <button onClick={() => setShowGuide(false)} className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95" aria-label="Play demo and start">
                <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {demoClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => setDemoStep(clip.id)}
                  className={`rounded-2xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-all active:scale-95 ${
                    demoStep === clip.id
                      ? 'border-emerald-300/55 bg-emerald-300/15 text-white shadow-lg shadow-emerald-950/30'
                      : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {clip.title}
                </button>
              ))}
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
        Exit Fingertap Reading
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

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ocr': return 'Camera';
      case 'voice': return 'Voice';
      case 'text': return 'Text';
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
    if (window.confirm('Clear all history items?')) {
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
        <p className="text-sm font-medium tracking-wide text-center px-4 text-slate-500">No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header with Filter and Clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-300">History ({filteredHistory.length})</h3>
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
                {type === 'all' ? 'All' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No {filterType === 'all' ? '' : getTypeLabel(filterType).toLowerCase()} history
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
                  if (window.confirm('Delete this history item?')) {
                    deleteHistoryItem(item.id);
                    setRefreshKey(prev => prev + 1);
                  }
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* 点击区域 */}
              <button
                onClick={() => onSelectHistory && onSelectHistory(item)}
                className="w-full text-left pr-8 active:scale-[0.98] transition-transform"
                title="View full result"
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
    { id: 'ocr', label: 'Camera', icon: <CameraIcon /> },
    { id: 'voice', label: 'Voice', icon: <MicIcon /> },
    { id: 'text', label: 'Text', icon: <TextIcon /> },
    { id: 'history', label: 'History', icon: <HistoryIcon /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Exit Button - 全屏模式下显示（语音和文本模式） */}
      {isFullScreen && onExit && (
        <button
          onClick={onExit}
          className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-black/60 hover:scale-110 transition-all shadow-2xl"
          title="Back to home"
        >
          <BackIcon />
        </button>
      )}

      {/* Top Special Entry: FingerTap Reading (只在非全屏时显示) */}
      {!isFullScreen && (
        <div className="p-6 pb-3">
          <button
            onClick={() => onModeChange('fingertap')}
            className="w-full relative group overflow-hidden rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(5,150,105,0.95),rgba(13,148,136,0.92)_48%,rgba(15,23,42,0.95))] p-4 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/12 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner shadow-white/10 group-hover:bg-white/15 group-hover:border-white/30 transition-all shrink-0">
                <FingerTapFeatureIcon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/25 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.85)]" />
                  Hardware Tutorial
                </div>
                <h3 className="mt-1.5 text-lg font-black text-white italic leading-tight">Fingertap Reading</h3>
                <p className="text-emerald-50/75 text-xs leading-snug">Mirror setup · AR guided fingertip reading</p>
              </div>
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[10px] font-black text-white/85 sm:flex">
                AR
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
              <span className="sr-only">{m.label}</span>
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
              <WelcomeState icon={<CameraIcon className="w-14 h-14"/>} text="Scan a book or document to begin" />
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
      setError("Recognition failed. Make sure the text is clear and well lit.");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleExitToHome = () => {
    navigate('/');
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
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

              <button
                onClick={handleExitToHome}
                className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-black/60 hover:scale-110 transition-all shadow-2xl"
                title="Back to home"
              >
                <BackIcon />
              </button>

              {isScanning && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex flex-col items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-16 h-16 border-3 border-emerald-500/20 rounded-full" style={{ borderWidth: '3px' }} />
                    <div className="absolute inset-0 w-16 h-16 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
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
