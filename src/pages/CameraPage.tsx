import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PinyinRubyText from '../components/PinyinRubyText';
import { figmaPx, FIGMA_FONT } from '../utils/figmaScale';
import { APP_FONT_FAMILY } from '../theme/appFont';

/** 与壳层 VITE_SCREEN_SIZE 同源，禁止用 vw 定稿尺寸（壳有 scale，vw 会塌） */
const CAMERA_SCREEN = (import.meta.env.VITE_SCREEN_SIZE as string) || '2000x1200';
const camPx = (n: number) => figmaPx(n, CAMERA_SCREEN);

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

const BackIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

/** Group 1410141318 箭头：稿上 52.27 @2508 → 40 @1920 */
const PointReadArrow = ({ size }: { size: number }) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    aria-hidden
    fill="none"
  >
    <path
      d="M6 24h26M24 12l14 12-14 12"
      stroke="#fff"
      strokeWidth="3.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const HistoryIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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

const FrameResizeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const VIEWFINDER_ROUND_BTN = camPx(80);
const VIEWFINDER_ROUND_ICON = camPx(32);
const VIEWFINDER_ROUND_INSET = camPx(28);

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
      
      ctx.font = '28px "Google Sans Flex Variable", "Noto Sans SC", sans-serif';
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

      {/* Focus button — 与返回同一套 80 圆钮，禁止 % 高宽（会拉扁） */}
      {isReady && (
        <button
          type="button"
          onClick={() => setIsFocusAdjusting((prev) => !prev)}
          title="Adjust focus frame size"
          aria-label="Adjust focus frame size"
          className={`absolute z-50 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isFocusAdjusting
              ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-lg shadow-emerald-500/15'
              : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 hover:bg-black/60'
          } shadow-2xl`}
          style={{
            top: VIEWFINDER_ROUND_INSET,
            right: VIEWFINDER_ROUND_INSET,
            width: VIEWFINDER_ROUND_BTN,
            height: VIEWFINDER_ROUND_BTN,
          }}
        >
          <FrameResizeIcon size={VIEWFINDER_ROUND_ICON} />
        </button>
      )}

      {/* Shutter — Figma 130×130；高度禁止用 %（含 clamp 中间值），否则会塌成 0 */}
      {isReady && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30"
          style={{ bottom: 28 }}
        >
          <button
            type="button"
            onClick={captureFrame}
            disabled={isScanning}
            aria-label="Capture"
            className={`relative flex items-center justify-center rounded-full transition-transform duration-200 ${
              isScanning ? 'scale-95 opacity-90' : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              width: 'min(130px, 18vw)',
              height: 'min(130px, 18vw)',
              aspectRatio: '1 / 1',
            }}
          >
            <span
              className="absolute inset-0 rounded-full border-2 border-white/90 pointer-events-none"
              aria-hidden
            />
            <span
              className={`rounded-full transition-colors pointer-events-none ${
                isScanning ? 'bg-emerald-400' : 'bg-white'
              }`}
              style={{ width: '78%', height: '78%' }}
            />
            {isScanning && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              </span>
            )}
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
  // Figma 拍摄有结果：原文（拼音注音+汉字）· 翻译
  const hasWords = Array.isArray(result.words) && result.words.length > 0;

  return (
    <div className="space-y-8 animate-fadeIn" style={{ fontFamily: APP_FONT_FAMILY }}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00B4A0]" />
          <span
            className="font-medium text-white/90"
            style={{ fontSize: 'clamp(16px, 1.8vw, 28px)' }}
          >
            原文
          </span>
        </div>
        {hasWords ? (
          <PinyinRubyText
            original={result.original}
            words={result.words}
            hanziClassName="font-medium text-white leading-none"
            pinyinClassName="text-[#00B4A0] font-medium tracking-wide leading-none mb-1.5 whitespace-nowrap"
          />
        ) : (
          <>
            {result.pinyin ? (
              <p
                className="text-[#00B4A0] font-medium mb-2 leading-relaxed"
                style={{ fontSize: 'clamp(16px, 1.8vw, 28px)' }}
              >
                {result.pinyin}
              </p>
            ) : null}
            <p
              className="text-white font-medium leading-relaxed"
              style={{ fontSize: 'clamp(18px, 2vw, 32px)' }}
            >
              {result.original}
            </p>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00B4A0]" />
          <span
            className="font-medium text-white/90"
            style={{ fontSize: 'clamp(16px, 1.8vw, 28px)' }}
          >
            翻译
          </span>
        </div>
        <p
          className="text-white/90 font-medium leading-relaxed"
          style={{ fontSize: 'clamp(16px, 1.8vw, 28px)' }}
        >
          {result.translation}
        </p>
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
  const [waveHeights, setWaveHeights] = useState(Array(36).fill(10));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let animationInterval: ReturnType<typeof setInterval>;
    if (isRecording) {
      animationInterval = setInterval(() => {
        setWaveHeights(Array(36).fill(0).map(() => Math.random() * 36 + 8));
      }, 120);
    } else {
      setWaveHeights(Array(36).fill(0).map((_, i) => 8 + Math.sin(i * 0.35) * 4));
    }
    return () => clearInterval(animationInterval);
  }, [isRecording]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleRecord = async () => {
    if (loading) return;
    if (isRecording) {
      setIsRecording(false);
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 1200));
        const mockResult = await mockTranslate('你好，今天天气很好');
        setResult(mockResult);
        addToHistory({
          type: 'voice',
          original: mockResult.original,
          pinyin: mockResult.pinyin,
          translation: mockResult.translation,
          words: mockResult.words,
        });
        onResult?.(mockResult);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setResult(null);
      setIsRecording(true);
    }
  };

  // Figma 翻译2语音1：计时 80 · 转写框 · Tap to Speak 36 · 麦键 168
  return (
    <div
      className="flex flex-col h-full min-h-0 animate-fadeIn box-border"
      style={{
        paddingLeft: camPx(60),
        paddingRight: camPx(60),
        paddingTop: camPx(40),
        paddingBottom: camPx(40),
        fontFamily: FIGMA_FONT,
      }}
    >
      <div className="flex flex-col items-center shrink-0">
        <p
          className="font-bold tracking-wide"
          style={{
            fontSize: camPx(80),
            lineHeight: 1,
            color: isRecording ? '#F87171' : loading ? '#00B4A0' : '#BBBBBB',
          }}
        >
          {formatTime(timer)}
        </p>
        <div
          className="flex items-end justify-center"
          style={{ height: camPx(80), marginTop: camPx(16), width: camPx(411), gap: camPx(3) }}
        >
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-white/70"
              style={{
                maxWidth: camPx(6),
                height: Math.max(camPx(8), height * (camPx(48) / 48)),
                opacity: isRecording ? 1 : 0.55,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
        style={{
          marginTop: camPx(24),
          marginBottom: camPx(24),
          borderRadius: camPx(50),
          background: 'rgba(255,255,255,0.1)',
          padding: `${camPx(28)} ${camPx(40)}`,
          maxHeight: camPx(476),
        }}
      >
        {loading ? (
          <p className="text-white/50 text-center" style={{ fontSize: camPx(28), paddingTop: camPx(40) }}>
            Translating...
          </p>
        ) : result ? (
          <OCRResultView result={result} />
        ) : null}
      </div>

      <div className="shrink-0 flex flex-col items-center" style={{ gap: camPx(20) }}>
        <p className="text-white text-center" style={{ fontSize: camPx(36) }}>
          {loading ? 'Please wait…' : isRecording ? 'Tap to Stop' : 'Tap to Speak'}
        </p>
        <button
          type="button"
          onClick={toggleRecord}
          disabled={loading}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className={`relative flex items-center justify-center rounded-full transition-transform active:scale-95 ${
            isRecording ? 'bg-red-400' : 'bg-[#D9D9D9]'
          } ${loading ? 'opacity-50' : ''}`}
          style={{ width: camPx(168), height: camPx(168) }}
        >
          <svg
            className={isRecording ? 'text-white' : 'text-slate-900'}
            style={{ width: camPx(70), height: camPx(70) }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isRecording ? (
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            ) : (
              <>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" stroke="none" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </>
            )}
          </svg>
        </button>
      </div>
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
  const MAX = 500;
  const canTranslate = Boolean(input.trim()) && !loading;

  const handleTranslate = async () => {
    if (!canTranslate) return;
    setLoading(true);
    try {
      const res = await mockTranslate(input.slice(0, MAX));
      setResult(res);
      addToHistory({
        type: 'text',
        original: res.original,
        pinyin: res.pinyin,
        translation: res.translation,
        words: res.words,
      });
      onResult?.(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Figma 翻译3文本1：双栏 880×840 · gap 40 · inset 60 · 标签钮 300×90 @ y1050
  const paneR = camPx(50);
  const tagW = camPx(170);
  const tagH = camPx(60);
  const bodyFs = camPx(32);
  const noteFs = camPx(24);
  const panePadX = camPx(40);
  const panePadTop = camPx(70);

  const langTag = (label: string) => (
    <div
      className="absolute top-0 right-0 z-10 flex items-center justify-center text-white font-medium"
      style={{
        width: tagW,
        height: tagH,
        background: '#00B4A0',
        borderBottomLeftRadius: camPx(28),
        fontSize: bodyFs,
        fontFamily: FIGMA_FONT,
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      className="flex flex-col h-full min-h-0 animate-fadeIn box-border"
      style={{
        paddingLeft: camPx(60),
        paddingRight: camPx(60),
        paddingTop: camPx(40),
        paddingBottom: camPx(60),
        fontFamily: FIGMA_FONT,
      }}
    >
      <div
        className="flex min-h-0 flex-1"
        style={{ gap: camPx(40), maxHeight: camPx(840) }}
      >
        {/* English / input */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: paneR,
          }}
        >
          {langTag('English')}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX))}
            placeholder="Enter Chinese or English..."
            className="flex-1 w-full bg-transparent text-white placeholder:text-[#636E72] resize-none focus:outline-none"
            style={{
              fontSize: bodyFs,
              lineHeight: 1.6,
              paddingLeft: panePadX,
              paddingRight: panePadX,
              paddingTop: panePadTop,
              paddingBottom: camPx(56),
            }}
          />
          <span
            className="absolute text-[#636E72]"
            style={{
              right: camPx(34),
              bottom: camPx(40),
              fontSize: noteFs,
              lineHeight: 1.6,
            }}
          >
            {input.length}/{MAX}
          </span>
        </div>

        {/* 中文 / result */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: paneR,
          }}
        >
          {langTag('中文')}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{
              paddingLeft: panePadX,
              paddingRight: panePadX,
              paddingTop: panePadTop,
              paddingBottom: camPx(40),
            }}
          >
            {loading ? (
              <p className="text-white/40" style={{ fontSize: bodyFs, lineHeight: 1.6 }}>
                Translating...
              </p>
            ) : result ? (
              <div className="space-y-3">
                {result.pinyin ? (
                  <p className="text-[#00B4A0]" style={{ fontSize: noteFs, lineHeight: 1.6 }}>
                    {result.pinyin}
                  </p>
                ) : null}
                <p className="text-white" style={{ fontSize: bodyFs, lineHeight: 1.6 }}>
                  {/[\u4e00-\u9fa5]/.test(input) ? result.translation : result.original}
                </p>
                {/[\u4e00-\u9fa5]/.test(input) ? null : (
                  <p className="text-white/70" style={{ fontSize: bodyFs, lineHeight: 1.6 }}>
                    {result.translation}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="shrink-0 flex justify-center"
        style={{ paddingTop: camPx(50) }}
      >
        <button
          type="button"
          onClick={handleTranslate}
          disabled={!canTranslate}
          className="font-bold text-white transition-opacity active:scale-95"
          style={{
            width: camPx(300),
            height: camPx(90),
            fontSize: camPx(36),
            lineHeight: `${camPx(54)}px`,
            background: '#00B4A0',
            opacity: canTranslate ? 1 : 0.4,
            borderRadius: camPx(100),
            fontFamily: FIGMA_FONT,
          }}
        >
          {loading ? '…' : 'Translate'}
        </button>
      </div>
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

  // Guide Screen — 铺满取景区，不用 lg/vw（壳 scale 后会缩成半屏）
  if (showGuide) {
    return (
      <div
        className="absolute inset-0 z-[60] bg-[#07111f] flex items-center justify-center overflow-hidden"
        style={{ padding: camPx(36), fontFamily: FIGMA_FONT }}
      >
        <div className="absolute -top-32 -right-20 w-[520px] h-[520px] bg-emerald-400/15 rounded-full blur-[110px]" />
        <div className="absolute -bottom-40 -left-24 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div
          className="w-full h-full grid items-center animate-fadeIn min-h-0"
          style={{
            gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)',
            gap: camPx(40),
          }}
        >
          <div
            className="relative h-full min-h-0 border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-2xl flex flex-col justify-center"
            style={{
              borderRadius: camPx(40),
              padding: camPx(40),
            }}
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
            <div>
              <div
                className="inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 font-black uppercase text-emerald-300"
                style={{
                  gap: camPx(10),
                  padding: `${camPx(10)}px ${camPx(18)}px`,
                  fontSize: camPx(16),
                  letterSpacing: '0.18em',
                }}
              >
                <span className="rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" style={{ width: camPx(10), height: camPx(10) }} />
                Hardware Tutorial
              </div>
              <h1
                className="font-black text-white"
                style={{
                  marginTop: camPx(20),
                  fontSize: camPx(64),
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}
              >
                Fingertap
                <br />
                Reading
              </h1>
              <p
                className="text-slate-300"
                style={{
                  marginTop: camPx(18),
                  fontSize: camPx(26),
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                Use the 45° mirror to let the camera read the desktop area, then point at words in a book to hear pronunciation and see instant translation.
              </p>
            </div>

            <div style={{ marginTop: camPx(28), display: 'flex', flexDirection: 'column', gap: camPx(14) }}>
              <div
                className="flex items-center border border-white/10 bg-slate-950/45"
                style={{ gap: camPx(18), borderRadius: camPx(22), padding: camPx(18) }}
              >
                <div
                  className="shrink-0 flex items-center justify-center bg-emerald-400 font-black text-slate-950 shadow-lg shadow-emerald-500/20"
                  style={{ width: camPx(56), height: camPx(56), borderRadius: camPx(16), fontSize: camPx(26) }}
                >
                  1
                </div>
                <div>
                  <p className="font-black text-white" style={{ fontSize: camPx(24), lineHeight: 1.25 }}>Position the mirror</p>
                  <p className="text-slate-400" style={{ marginTop: camPx(4), fontSize: camPx(18), lineHeight: 1.35 }}>
                    Place the FingerTap mirror in front of the camera at the marked angle.
                  </p>
                </div>
              </div>
              <div
                className="flex items-center border border-white/10 bg-slate-950/45"
                style={{ gap: camPx(18), borderRadius: camPx(22), padding: camPx(18) }}
              >
                <div
                  className="shrink-0 flex items-center justify-center bg-cyan-300 font-black text-slate-950 shadow-lg shadow-cyan-500/20"
                  style={{ width: camPx(56), height: camPx(56), borderRadius: camPx(16), fontSize: camPx(26) }}
                >
                  2
                </div>
                <div>
                  <p className="font-black text-white" style={{ fontSize: camPx(24), lineHeight: 1.25 }}>Tap to read</p>
                  <p className="text-slate-400" style={{ marginTop: camPx(4), fontSize: camPx(18), lineHeight: 1.35 }}>
                    Point at any word on the page to trigger AR reading support.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto]" style={{ marginTop: camPx(28), gap: camPx(14) }}>
              <button
                onClick={() => setShowGuide(false)}
                className="bg-white font-black text-slate-950 shadow-2xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  borderRadius: camPx(22),
                  padding: `${camPx(22)}px ${camPx(28)}px`,
                  fontSize: camPx(24),
                  minHeight: camPx(72),
                }}
              >
                Start Fingertap Reading
              </button>
              <button
                onClick={onExit}
                className="border border-white/10 font-black text-slate-400 transition-colors hover:text-white"
                style={{
                  borderRadius: camPx(22),
                  padding: `${camPx(22)}px ${camPx(28)}px`,
                  fontSize: camPx(24),
                  minHeight: camPx(72),
                }}
              >
                Exit
              </button>
            </div>
          </div>

          <div className="relative h-full min-h-0 flex flex-col">
            <div
              className="relative flex-1 min-h-0 overflow-hidden border border-white/10 bg-slate-900 shadow-2xl shadow-emerald-950/30"
              style={{ borderRadius: camPx(40) }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.28),transparent_34%),linear-gradient(135deg,#111827_0%,#0f172a_55%,#042f2e_100%)]" />
              <div
                className="absolute flex items-center rounded-full bg-black/35 font-black uppercase text-emerald-200 backdrop-blur-md"
                style={{
                  left: camPx(24),
                  top: camPx(20),
                  gap: camPx(10),
                  padding: `${camPx(10)}px ${camPx(16)}px`,
                  fontSize: camPx(16),
                  letterSpacing: '0.16em',
                }}
              >
                <span className="rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" style={{ width: camPx(10), height: camPx(10) }} />
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
              <div
                className={`absolute left-[45%] top-[51%] rounded-xl border font-black text-white shadow-xl backdrop-blur transition-all ${
                  demoStep === 'reading'
                    ? 'border-violet-300/70 bg-violet-950/85 scale-110'
                    : 'border-emerald-300/50 bg-slate-950/75'
                }`}
                style={{ padding: `${camPx(12)}px ${camPx(16)}px`, fontSize: camPx(22) }}
              >
                你好 · nǐ hǎo
                <p className="font-semibold text-emerald-300" style={{ marginTop: camPx(4), fontSize: camPx(16) }}>hello</p>
              </div>

              <div
                className="absolute rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md"
                style={{ left: camPx(24), right: camPx(24), bottom: camPx(20), padding: camPx(18) }}
              >
                <p className="font-black text-white" style={{ fontSize: camPx(24) }}>{activeDemo.title}</p>
                <p className="leading-snug text-slate-300" style={{ marginTop: camPx(6), fontSize: camPx(18) }}>{activeDemo.subtitle}</p>
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)] bg-[length:100%_8px] opacity-40" />
              <button
                onClick={() => setShowGuide(false)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                style={{ width: camPx(96), height: camPx(96) }}
                aria-label="Play demo and start"
              >
                <svg style={{ marginLeft: camPx(6), width: camPx(40), height: camPx(40) }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 text-center" style={{ marginTop: camPx(16), gap: camPx(12) }}>
              {demoClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => setDemoStep(clip.id)}
                  className={`border font-bold uppercase transition-all active:scale-95 ${
                    demoStep === clip.id
                      ? 'border-emerald-300/55 bg-emerald-300/15 text-white shadow-lg shadow-emerald-950/30'
                      : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                  style={{
                    borderRadius: camPx(18),
                    padding: `${camPx(14)}px ${camPx(12)}px`,
                    fontSize: camPx(16),
                    letterSpacing: '0.06em',
                    minHeight: camPx(56),
                  }}
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
// Figma 拍摄空态：淡相机图标 + AR Smart Pointer Mode
const CameraRailEmpty: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center flex-1 min-h-[40%] animate-fadeIn"
    style={{ fontFamily: FIGMA_FONT, paddingTop: camPx(40), paddingBottom: camPx(40) }}
  >
    <div
      className="opacity-[0.18] text-white"
      style={{ width: camPx(120), height: camPx(120), marginBottom: camPx(20) }}
    >
      <CameraIcon className="w-full h-full" />
    </div>
    <p
      className="text-white/45 font-medium text-center"
      style={{ fontSize: camPx(32), lineHeight: `${camPx(44)}px`, paddingLeft: camPx(24), paddingRight: camPx(24) }}
    >
      AR Smart Pointer Mode
    </p>
  </div>
);

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
const ManageIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="4" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <rect x="4" y="16" width="16" height="4" rx="1" />
  </svg>
);

interface HistoryManagementViewProps {
  onSelectHistory?: (history: TranslationHistory) => void;
  onBack?: () => void;
  manageMode?: boolean;
  onToggleManage?: () => void;
}

const HistoryManagementView: React.FC<HistoryManagementViewProps> = ({
  onSelectHistory,
  manageMode = false,
  onToggleManage,
}) => {
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'ocr' | 'voice' | 'text'>('all');

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshKey]);

  useEffect(() => {
    const handleStorageChange = () => setRefreshKey((prev) => prev + 1);
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
      case 'ocr':
        return 'Capture';
      case 'voice':
        return 'Voice';
      case 'text':
        return 'Text';
      default:
        return type;
    }
  };

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'ocr' as const, label: 'Capture' },
    { id: 'voice' as const, label: 'Voice' },
    { id: 'text' as const, label: 'Text' },
  ];

  const filteredHistory =
    filterType === 'all' ? history : history.filter((item) => item.type === filterType);

  // Figma 翻译4历史记录：筛选 + 空态 No Content / 列表
  return (
    <div className="flex flex-col h-full min-h-0 animate-fadeIn">
      <div className="shrink-0 flex justify-center px-[3%]">
        <div
          className="flex items-center bg-white/[0.06] border-2 border-white/40"
          style={{
            height: 'clamp(52px, 4.7vw, 90px)',
            borderRadius: 'clamp(16px, 1.6vw, 30px)',
            padding: 'clamp(4px, 0.5vw, 10px)',
            width: 'min(740px, 72%)',
          }}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`flex-1 h-full rounded-[clamp(12px,1.4vw,26px)] transition-all ${
                filterType === f.id ? 'bg-white text-[#2d3436]' : 'text-white hover:bg-white/10'
              }`}
              style={{ fontSize: 'clamp(14px, 1.45vw, 28px)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 || filteredHistory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-8">
          <img
            src="/shell/camera-history-empty.png"
            alt=""
            className="object-contain opacity-90"
            style={{ width: 'min(280px, 36vw)', height: 'auto' }}
          />
          <p
            className="mt-4 font-bold text-white/60"
            style={{ fontSize: 'clamp(20px, 2.1vw, 40px)' }}
          >
            No Content
          </p>
          {manageMode && history.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all history items?')) {
                  clearHistory();
                  setHistory([]);
                  onToggleManage?.();
                }
              }}
              className="mt-6 text-red-400 underline"
              style={{ fontSize: 'clamp(14px, 1.4vw, 22px)' }}
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[8%] pt-6 pb-8 space-y-3">
          {manageMode ? (
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all history items?')) {
                    clearHistory();
                    setHistory([]);
                    onToggleManage?.();
                  }
                }}
                className="text-red-400"
                style={{ fontSize: 'clamp(14px, 1.3vw, 20px)' }}
              >
                Clear all
              </button>
            </div>
          ) : null}
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="relative rounded-[clamp(16px,1.6vw,28px)] bg-white/10 border border-white/10 p-4"
            >
              {manageMode ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteHistoryItem(item.id);
                    setRefreshKey((p) => p + 1);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500/25 text-red-300 flex items-center justify-center"
                  aria-label="Delete"
                >
                  ×
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onSelectHistory?.(item)}
                className="w-full text-left pr-10 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[#00B4A0] font-medium" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}>
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-white/40" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}>
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-white font-medium line-clamp-2" style={{ fontSize: 'clamp(16px, 1.6vw, 28px)' }}>
                  {item.original}
                </p>
                <p className="text-white/50 line-clamp-1 mt-1" style={{ fontSize: 'clamp(13px, 1.3vw, 22px)' }}>
                  {item.translation}
                </p>
              </button>
            </div>
          ))}
        </div>
      )}
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
  const [historyManage, setHistoryManage] = useState(false);
  const iconPx = isFullScreen ? camPx(60) : camPx(40);
  const modes = [
    { id: 'ocr', label: 'Camera', icon: <CameraIcon className="" /> },
    { id: 'voice', label: 'Voice', icon: <MicIcon className="" /> },
    { id: 'text', label: 'Text', icon: <TextIcon className="" /> },
  ];
  const isHistory = activeMode === 'history';
  const showVoiceTextChrome = isFullScreen && !isHistory;
  // Figma 全屏顶栏：返回/History 80 · 三 Tab 1128×90 · 左右 inset 60 · 顶区高 ~120
  const chromeH = camPx(120);
  const roundBtn = camPx(80);
  const sideInset = camPx(60);
  const tabW = camPx(1128);
  const tabH = camPx(90);
  const tabPad = camPx(10);
  const tabRadius = camPx(120);
  const segRadius = camPx(40);

  const modeTabs = (
    <div
      className="flex items-center"
      style={{
        height: tabH,
        borderRadius: tabRadius,
        padding: tabPad,
        gap: camPx(8),
        width: isFullScreen ? tabW : '100%',
        maxWidth: isFullScreen ? '100%' : undefined,
        boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.06)',
        border: `${camPx(2)}px solid rgba(255,255,255,0.4)`,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onModeChange(m.id)}
          aria-label={m.label}
          className={`flex-1 h-full flex items-center justify-center transition-all ${
            activeMode === m.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          style={{ borderRadius: segRadius }}
        >
          <span style={{ width: iconPx, height: iconPx, display: 'inline-flex' }}>
            {React.cloneElement(m.icon as React.ReactElement<{ className?: string }>, {
              className: 'w-full h-full',
            })}
          </span>
        </button>
      ))}
    </div>
  );

  const historyBtn = (
    <button
      type="button"
      onClick={() => onModeChange('history')}
      aria-label="History"
      className={`rounded-full border flex items-center justify-center transition-all shrink-0 ${
        activeMode === 'history'
          ? 'bg-white text-slate-900 border-white'
          : 'bg-white/10 text-white/85 border-white/15 hover:bg-white/20'
      }`}
      style={{ width: roundBtn, height: roundBtn }}
    >
      <HistoryIcon size={camPx(46)} />
    </button>
  );

  const backBtn = (onClick: () => void, title: string) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full flex items-center justify-center text-white transition-all z-50 shrink-0"
      style={{
        width: roundBtn,
        height: roundBtn,
        background: 'rgba(255,255,255,0.1)',
      }}
      title={title}
    >
      <BackIcon size={camPx(22)} />
    </button>
  );

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{ fontFamily: FIGMA_FONT }}
    >
      {/* Camera 分栏：History 右上 + Point-Read + 三 Tab */}
      {!isFullScreen && (
        <>
          <div
            className="absolute z-20"
            style={{ top: camPx(30), right: camPx(30) }}
          >
            {historyBtn}
          </div>
          <div style={{ padding: `${camPx(160)}px ${camPx(60)}px ${camPx(30)}px` }}>
            <button
              type="button"
              onClick={() => onModeChange('fingertap')}
              className="w-full relative overflow-hidden text-left transition-all active:scale-[0.98]"
              style={{
                height: camPx(192),
                borderRadius: camPx(54),
                padding: `${camPx(22)}px ${camPx(40)}px`,
                boxSizing: 'border-box',
              }}
            >
              {/* Group 1410141318：色块水平翻转，文案和图标不翻 */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  borderRadius: 'inherit',
                  background:
                    'linear-gradient(148.83deg, #9858FF 7.44%, #33007D 53.27%, #230050 92.56%)',
                  transform: 'scaleX(-1)',
                  pointerEvents: 'none',
                }}
              />
              <div
                aria-hidden
                className="absolute"
                style={{
                  width: camPx(777),
                  height: camPx(164),
                  left: camPx(263),
                  top: camPx(-123),
                  background: 'rgba(254, 220, 94, 0.85)',
                  filter: `blur(${camPx(80)}px)`,
                  borderRadius: camPx(116),
                  transform: 'scaleX(-1)',
                  pointerEvents: 'none',
                }}
              />
              <div
                aria-hidden
                className="absolute"
                style={{
                  width: camPx(828),
                  height: camPx(174),
                  left: camPx(-268),
                  top: camPx(174),
                  background: 'rgba(149, 92, 218, 0.7)',
                  filter: `blur(${camPx(78)}px)`,
                  borderRadius: camPx(116),
                  transform: 'scaleX(-1)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10 flex items-center justify-between h-full">
                <div className="min-w-0 flex flex-col items-start p-0">
                  <p
                    style={{
                      margin: 0,
                      width: '100%',
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: camPx(24),
                      lineHeight: `${camPx(38)}px`,
                      color: '#FFFFFF',
                      opacity: 0.6,
                    }}
                  >
                    NEW FEATURE
                  </p>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: camPx(40),
                      lineHeight: `${camPx(64)}px`,
                      color: '#FFFFFF',
                    }}
                  >
                    AI Point-Read
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 500,
                      fontSize: camPx(28),
                      lineHeight: `${camPx(41)}px`,
                      color: '#FFFFFF',
                      opacity: 0.6,
                    }}
                  >
                    AR Smart Pointer Mode
                  </p>
                </div>
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: camPx(80),
                    height: camPx(80),
                    borderRadius: camPx(20),
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(2.6px)',
                    WebkitBackdropFilter: 'blur(2.6px)',
                  }}
                >
                  <PointReadArrow size={camPx(40)} />
                </div>
              </div>
            </button>
          </div>
          <div style={{ padding: `0 ${camPx(60)}px ${camPx(24)}px` }}>{modeTabs}</div>
        </>
      )}

      {/* Voice / Text 全屏顶栏：返回 / Tab / History 同一行垂直居中 */}
      {showVoiceTextChrome && (
        <div
          className="shrink-0 flex items-center"
          style={{
            height: chromeH,
            paddingLeft: sideInset,
            paddingRight: sideInset,
            gap: camPx(24),
          }}
        >
          <div className="shrink-0" style={{ width: roundBtn, height: roundBtn }}>
            {onExit ? backBtn(onExit, 'Back to home') : null}
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-center">
            {modeTabs}
          </div>
          <div className="shrink-0">{historyBtn}</div>
        </div>
      )}

      {/* History 全屏顶栏 */}
      {isHistory && (
        <div
          className="shrink-0 relative flex items-center justify-center"
          style={{ height: chromeH, paddingLeft: sideInset, paddingRight: sideInset }}
        >
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: sideInset }}>
            {backBtn(() => {
              setHistoryManage(false);
              onModeChange('ocr');
            }, 'Back to Camera')}
          </div>
          <h2 className="font-bold text-white" style={{ fontSize: camPx(40) }}>
            History
          </h2>
          <button
            type="button"
            onClick={() => setHistoryManage((v) => !v)}
            className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full bg-white/10 text-white ${
              historyManage ? 'ring-2 ring-[#00B4A0]' : ''
            }`}
            style={{
              right: sideInset,
              height: camPx(72),
              paddingLeft: camPx(30),
              paddingRight: camPx(30),
              fontSize: camPx(30),
              borderRadius: camPx(82),
            }}
          >
            <ManageIcon />
            Manage
          </button>
        </div>
      )}

      <div
        className={`flex-1 min-h-0 flex flex-col ${
          isFullScreen ? '' : 'overflow-y-auto custom-scrollbar'
        }`}
        style={isFullScreen ? undefined : { padding: `0 ${camPx(60)}px ${camPx(48)}px` }}
      >
        {error && !isFullScreen && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-4 animate-fadeIn flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {activeMode === 'ocr' &&
          (ocrResult ? <OCRResultView result={ocrResult} /> : <CameraRailEmpty />)}
        {activeMode === 'voice' && (
          <VoiceTranslation onResult={onHistorySelect ? () => {} : undefined} />
        )}
        {activeMode === 'text' && (
          <TextTranslation onResult={onHistorySelect ? () => {} : undefined} />
        )}
        {activeMode === 'history' && (
          <HistoryManagementView
            onSelectHistory={onHistorySelect}
            manageMode={historyManage}
            onToggleManage={() => setHistoryManage(false)}
          />
        )}
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
    // Voice / Text / History = 全屏；Camera = 分栏
    if (newMode === 'text' || newMode === 'voice' || newMode === 'history') {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  };

  const handleHistorySelect = (history: TranslationHistory) => {
    const historyResult = {
      original: history.original,
      pinyin: history.pinyin || '',
      translation: history.translation,
      words: history.words || [],
    };
    setResult(historyResult);
    setMode(history.type);
    setIsFullScreen(history.type === 'voice' || history.type === 'text');
    setError(null);
  };

  // Figma 拍摄「翻译1拍摄2」：左取景区 1240 / 右侧栏 680（1920 画布）
  const LEFT_PCT = `${(1240 / 1920) * 100}%`
  const RIGHT_PCT = `${(680 / 1920) * 100}%`

  return (
    <div className="flex flex-row h-full w-full bg-[#0B1220] overflow-hidden font-sans">
      {showFlash && <div className="absolute inset-0 bg-white z-[100] animate-pulse pointer-events-none" />}

      <div className={`flex transition-all duration-700 ease-in-out h-full w-full ${mode === 'fingertap' ? 'translate-x-0' : ''}`}>
        
        {/* Left viewfinder — Figma 1240/1920 */}
        <div
          className={`h-full relative transition-all duration-700 ${
            mode === 'fingertap' ? 'w-full' :
            isFullScreen ? 'w-0 opacity-0 overflow-hidden pointer-events-none' :
            ''
          }`}
          aria-hidden={isFullScreen && mode !== 'fingertap'}
          style={
            mode === 'fingertap' || isFullScreen
              ? undefined
              : { width: LEFT_PCT, flexShrink: 0 }
          }
        >
          {mode === 'fingertap' ? (
            <FingerTapMode onExit={() => setMode('ocr')} />
          ) : (
            <>
              <VisionCore isScanning={isScanning} onScan={handleScan} />

              <button
                onClick={handleExitToHome}
                className="absolute z-50 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-black/60 transition-all shadow-2xl"
                style={{
                  top: VIEWFINDER_ROUND_INSET,
                  left: VIEWFINDER_ROUND_INSET,
                  width: VIEWFINDER_ROUND_BTN,
                  height: VIEWFINDER_ROUND_BTN,
                }}
                title="Back to home"
              >
                <BackIcon size={VIEWFINDER_ROUND_ICON} />
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

        {/* Right rail — Figma 680/1920 满高实底 */}
        <div
          className={`h-full flex flex-col transition-all duration-700 ${
            mode === 'fingertap' ? 'w-0 opacity-0 overflow-hidden' :
            isFullScreen ? 'w-full' :
            ''
          }`}
          style={
            mode === 'fingertap'
              ? undefined
              : isFullScreen
                ? { background: '#050810' }
                : {
                    width: RIGHT_PCT,
                    flexShrink: 0,
                    background: '#0E1A2B',
                  }
          }
        >
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
