/**
 * LingoFlash — 完整版（对齐 NewBuild/lingoflash.zip 交互）
 * Dashboard → LearningSession → SessionComplete
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlightIcon from '@mui/icons-material/Flight';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/* ─────────────────────────────────── types ─────────────────────────────────── */
interface Word {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  exampleEn: string;
  exampleCn: string;
  memoryAid?: string;
}

/* ─────────────────────────────────── data ──────────────────────────────────── */
const DECK: Word[] = [
  {
    id: '1',
    word: '你好',
    phonetic: 'nǐ hǎo',
    translation: 'Hello · 你好',
    definition: 'A common greeting used when meeting people.',
    exampleEn: 'She smiled and said "nǐ hǎo" to everyone.',
    exampleCn: '她对每个人微笑着说"你好"。',
    memoryAid: 'nǐ = you, hǎo = good → "You good?" → Hello!',
  },
  {
    id: '2',
    word: '谢谢',
    phonetic: 'xiè xie',
    translation: 'Thank you · 谢谢',
    definition: 'Expression of gratitude, used universally.',
    exampleEn: '"Xièxie" — he bowed after receiving the gift.',
    exampleCn: '他收到礼物后鞠躬说"谢谢"。',
    memoryAid: 'xiè + xiè — the syllable repeats, doubling the thanks.',
  },
  {
    id: '3',
    word: '名字',
    phonetic: 'míng zi',
    translation: 'Name · 名字',
    definition: 'The word or words by which a person is known.',
    exampleEn: 'What is your míng zi?',
    exampleCn: '你的名字是什么？',
    memoryAid: 'míng (明 bright) + zi (字 character) → a bright character = your name.',
  },
  {
    id: '4',
    word: '电话',
    phonetic: 'diàn huà',
    translation: 'Phone · 电话',
    definition: 'A telephone or phone call.',
    exampleEn: 'Can I have your diàn huà number?',
    exampleCn: '我可以有你的电话号码吗？',
    memoryAid: 'diàn (电 electricity) + huà (话 speech) → electric speech = phone.',
  },
  {
    id: '5',
    word: '家',
    phonetic: 'jiā',
    translation: 'Home · 家',
    definition: 'The place where one lives; family.',
    exampleEn: 'Wǒ de jiā shì zài Shànghǎi.',
    exampleCn: '我的家在上海。',
    memoryAid: 'jiā looks like a roof over a pig — ancient symbol for household.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Flashcard
   ═══════════════════════════════════════════════════════════════════════════════ */
function Flashcard({
  word,
  isFlipped,
  setIsFlipped,
  onAssess,
  is960,
}: {
  word: Word;
  isFlipped: boolean;
  setIsFlipped: (v: boolean) => void;
  onAssess: (a: 'know' | 'uncertain' | 'unknown') => void;
  is960: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const cardOpacity = useTransform(x, [-200, -140, 0, 140, 200], [0, 1, 1, 1, 0]);

  const rightOpacity = useTransform(x, [40, 130], [0, 1]);
  const leftOpacity = useTransform(x, [-130, -40], [1, 0]);
  const upOpacity = useTransform(y, [-130, -40], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    const th = 90;
    if (info.offset.x > th) onAssess('know');
    else if (info.offset.x < -th) onAssess('unknown');
    else if (info.offset.y < -th) onAssess('uncertain');
    else {
      x.set(0);
      y.set(0);
    }
  };

  const cardW = is960 ? 320 : 380;
  const cardAspect = is960 ? '10 / 14' : '10 / 15';

  return (
    <Box sx={{ position: 'relative', width: cardW, aspectRatio: cardAspect, perspective: '1200px' }}>
      <motion.div
        drag={isFlipped}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, opacity: cardOpacity, position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', cursor: isFlipped ? 'grab' : 'default' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        whileTap={isFlipped ? { cursor: 'grabbing' } : {}}
      >
        {/* ── Front ── */}
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            bgcolor: 'white',
            borderRadius: is960 ? '24px' : '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            p: is960 ? 3 : 4,
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <ButtonBase sx={{ p: 1, borderRadius: '50%', color: '#9CA3AF', '&:active': { color: '#FBBF24' } }}>
              <StarOutlineIcon sx={{ fontSize: 22 }} />
            </ButtonBase>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: is960 ? 2 : 3, textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Source Han Sans CN","Noto Sans SC","PingFang SC",sans-serif',
                fontWeight: 900,
                fontSize: is960 ? '2.8rem' : '3.6rem',
                color: '#111827',
                lineHeight: 1.1,
              }}
            >
              {word.word}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#6B7280' }}>
              <Typography sx={{ fontSize: is960 ? '1rem' : '1.15rem', fontFamily: 'monospace', fontWeight: 600 }}>
                {word.phonetic}
              </Typography>
              <ButtonBase sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '50%', color: '#3B82F6', '&:active': { bgcolor: '#DBEAFE' } }}>
                <VolumeUpIcon sx={{ fontSize: 20 }} />
              </ButtonBase>
            </Box>
            <Typography
              component={motion.p}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#9CA3AF', fontWeight: 500 }}
            >
              点击卡片查看释义
            </Typography>
          </Box>

          <ButtonBase onClick={() => setIsFlipped(true)} sx={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} aria-label="Flip card" />
        </Box>

        {/* ── Back ── */}
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            bgcolor: 'white',
            borderRadius: is960 ? '24px' : '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column',
            p: is960 ? 2.5 : 3.5,
            overflow: 'hidden',
          }}
        >
          {/* Swipe overlays */}
          <motion.div style={{ opacity: rightOpacity, position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(34,197,94,0.12)', pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ bgcolor: '#22C55E', borderRadius: '50%', p: 1.5, boxShadow: '0 8px 24px rgba(34,197,94,0.4)' }}>
              <CheckIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </motion.div>
          <motion.div style={{ opacity: leftOpacity, position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(239,68,68,0.12)', pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ bgcolor: '#EF4444', borderRadius: '50%', p: 1.5, boxShadow: '0 8px 24px rgba(239,68,68,0.4)' }}>
              <CloseIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </motion.div>
          <motion.div style={{ opacity: upOpacity, position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(245,158,11,0.12)', pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ bgcolor: '#F59E0B', borderRadius: '50%', p: 1.5, boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>
              <HelpOutlineIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </motion.div>

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: is960 ? 1.5 : 2, flexShrink: 0 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.6rem', color: '#111827' }}>{word.word}</Typography>
              <Typography sx={{ color: '#6B7280', fontSize: is960 ? '0.75rem' : '0.85rem', fontFamily: 'monospace' }}>{word.phonetic}</Typography>
            </Box>
            <ButtonBase sx={{ p: 1, borderRadius: '50%', color: '#9CA3AF', '&:active': { color: '#FBBF24' } }}>
              <StarOutlineIcon sx={{ fontSize: 22 }} />
            </ButtonBase>
          </Box>

          {/* Sections */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.75, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {/* 释义 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>释义</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: is960 ? '0.88rem' : '1rem', color: '#1F2937' }}>{word.translation}</Typography>
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#6B7280', fontStyle: 'italic', mt: 0.35 }}>{word.definition}</Typography>
            </Box>

            {/* 例句 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <VolumeUpIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>例句</Typography>
              </Box>
              <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '14px', p: is960 ? 1.25 : 1.5 }}>
                <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#374151', lineHeight: 1.6 }}>{word.exampleEn}</Typography>
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', color: '#9CA3AF', mt: 0.5 }}>{word.exampleCn}</Typography>
              </Box>
            </Box>

            {/* 助记 */}
            {word.memoryAid && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>助记</Typography>
                </Box>
                <Box sx={{ bgcolor: '#FFFBEB', borderRadius: '14px', p: is960 ? 1.25 : 1.5, border: '1px solid rgba(245,158,11,0.18)' }}>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#78350F' }}>{word.memoryAid}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Swipe hint */}
          <Box sx={{ mt: 1.25, textAlign: 'center', flexShrink: 0 }}>
            <Typography
              component={motion.p}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              sx={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 500 }}
            >
              ← 左滑不认识 · 上滑模糊 · 右滑认识 →
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SessionComplete
   ═══════════════════════════════════════════════════════════════════════════════ */
function SessionComplete({
  stats,
  onReturn,
  is960,
}: {
  stats: { total: number; known: number; uncertain: number; unknown: number };
  onReturn: () => void;
  is960: boolean;
}) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', p: is960 ? 3 : 5, textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
        <Box sx={{ width: is960 ? 80 : 96, height: is960 ? 80 : 96, bgcolor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: is960 ? 2.5 : 3.5, mx: 'auto' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: is960 ? 44 : 52, color: '#16A34A' }} />
        </Box>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '2rem', color: '#111827', mb: 0.5 }}>学习完成！</Typography>
        <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#6B7280', mb: is960 ? 3 : 4 }}>
          你今天学习了 {stats.total} 个单词，继续保持！
        </Typography>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
        <Box sx={{ display: 'flex', gap: is960 ? 3 : 5, mb: is960 ? 3 : 4, justifyContent: 'center' }}>
          {[
            { label: '认识', value: stats.known, color: '#16A34A' },
            { label: '模糊', value: stats.uncertain, color: '#D97706' },
            { label: '不认识', value: stats.unknown, color: '#DC2626' },
          ].map((s, i, arr) => (
            <Box key={s.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: is960 ? 2 : 3, ...(i < arr.length - 1 ? { borderRight: '1px solid #E5E7EB' } : {}) }}>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '1.75rem', color: s.color }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} style={{ width: '100%', maxWidth: 360 }}>
        <Box sx={{ bgcolor: '#EFF6FF', borderRadius: '24px', p: is960 ? 1.75 : 2.25, display: 'flex', alignItems: 'center', gap: 2, mb: is960 ? 3 : 4 }}>
          <Box sx={{ width: is960 ? 44 : 52, height: is960 ? 44 : 52, bgcolor: '#2563EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EmojiEventsIcon sx={{ color: 'white', fontSize: is960 ? 22 : 26 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1rem', color: '#1E3A8A' }}>获得勋章</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#3B82F6' }}>连续学习第 15 天</Typography>
          </Box>
        </Box>

        <ButtonBase
          onClick={onReturn}
          sx={{
            width: '100%',
            py: is960 ? 1.5 : 1.75,
            bgcolor: '#111827',
            color: 'white',
            borderRadius: '18px',
            fontWeight: 900,
            fontSize: is960 ? '0.9rem' : '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            '&:active': { bgcolor: '#1F2937' },
          }}
        >
          返回首页
          <ArrowForwardIcon sx={{ fontSize: 20 }} />
        </ButtonBase>
      </motion.div>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LearningSession
   ═══════════════════════════════════════════════════════════════════════════════ */
function LearningSession({
  words,
  onFinish,
  is960,
}: {
  words: Word[];
  onFinish: () => void;
  is960: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stats, setStats] = useState({ total: words.length, known: 0, uncertain: 0, unknown: 0 });

  const progress = ((idx + 1) / words.length) * 100;

  const handleAssess = useCallback((a: 'know' | 'uncertain' | 'unknown') => {
    setStats(p => ({
      ...p,
      known: a === 'know' ? p.known + 1 : p.known,
      uncertain: a === 'uncertain' ? p.uncertain + 1 : p.uncertain,
      unknown: a === 'unknown' ? p.unknown + 1 : p.unknown,
    }));
    if (idx < words.length - 1) {
      setDirection(1);
      setFlipped(false);
      setTimeout(() => {
        setIdx(i => i + 1);
        setDirection(0);
      }, 280);
    } else {
      setComplete(true);
    }
  }, [idx, words.length]);

  if (complete) return <SessionComplete stats={stats} onReturn={onFinish} is960={is960} />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.25 : 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', borderBottom: '1px solid #F1F3F5' }}>
        <ButtonBase onClick={onFinish} sx={{ p: 1, borderRadius: '50%', color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' }, minWidth: 44, minHeight: 44 }}>
          <CloseIcon sx={{ fontSize: 24 }} />
        </ButtonBase>

        <Box sx={{ flex: 1, mx: is960 ? 2 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {idx + 1} / {words.length}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#3B82F6' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <Box sx={{ height: 6, bgcolor: '#F1F3F5', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: '#3B82F6', borderRadius: 99 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </Box>
        </Box>

        <Box sx={{ width: 44, height: 44 }} />
      </Box>

      {/* Card area */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', px: 2 }}>
        {/* Background preview cards */}
        {idx + 1 < words.length && (
          <Box sx={{ position: 'absolute', opacity: 0.18, transform: 'translateX(52px) scale(0.9)', zIndex: 0, width: is960 ? 320 : 380, aspectRatio: '10/15', bgcolor: 'white', borderRadius: is960 ? '24px' : '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
        )}
        {idx > 0 && (
          <Box sx={{ position: 'absolute', opacity: 0.18, transform: 'translateX(-52px) scale(0.9)', zIndex: 0, width: is960 ? 320 : 380, aspectRatio: '10/15', bgcolor: 'white', borderRadius: is960 ? '24px' : '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: direction > 0 ? 260 : 0, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction > 0 ? -260 : 0, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 130 }}
            style={{ zIndex: 1 }}
          >
            <Flashcard
              word={words[idx]}
              isFlipped={flipped}
              setIsFlipped={setFlipped}
              onAssess={handleAssess}
              is960={is960}
            />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Footer: hint or assessment buttons */}
      <AnimatePresence>
        {!flipped ? (
          <motion.div key="hint" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 22, stiffness: 200 }}>
            <Box sx={{ bgcolor: 'white', borderTop: '1px solid #F1F3F5', px: 2, py: is960 ? 2 : 2.5, display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#9CA3AF', fontWeight: 500 }}>
                点击卡片翻转，查看详细释义与例句
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div key="buttons" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 22, stiffness: 200 }}>
            <Box sx={{ bgcolor: 'white', borderTop: '1px solid #F1F3F5', px: is960 ? 2 : 3, py: is960 ? 1.75 : 2.5, display: 'flex', gap: is960 ? 1.25 : 2, justifyContent: 'center' }}>
              <ButtonBase
                onClick={() => handleAssess('unknown')}
                sx={{ flex: 1, maxWidth: is960 ? 140 : 180, py: is960 ? 1.2 : 1.5, borderRadius: '16px', bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, border: '1.5px solid #FECACA', '&:active': { bgcolor: '#FEE2E2' } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} /> 不认识
              </ButtonBase>
              <ButtonBase
                onClick={() => handleAssess('uncertain')}
                sx={{ flex: 1, maxWidth: is960 ? 140 : 180, py: is960 ? 1.2 : 1.5, borderRadius: '16px', bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, border: '1.5px solid #FDE68A', '&:active': { bgcolor: '#FEF3C7' } }}
              >
                <HelpOutlineIcon sx={{ fontSize: 18 }} /> 模糊
              </ButtonBase>
              <ButtonBase
                onClick={() => handleAssess('know')}
                sx={{ flex: 1, maxWidth: is960 ? 140 : 180, py: is960 ? 1.2 : 1.5, borderRadius: '16px', bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, border: '1.5px solid #BBF7D0', '&:active': { bgcolor: '#DCFCE7' } }}
              >
                <CheckIcon sx={{ fontSize: 18 }} /> 认识
              </ButtonBase>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
const DAILY_GOAL = { target: 50, current: 32, newWords: 15, reviewWords: 17 };
const WEEKLY = [40, 70, 45, 90, 65, 80, 50];
const BOOKS = [
  { title: '快乐中文 Vocab', count: 1200, gradient: 'linear-gradient(135deg,#3B82F6,#6366F1)', active: true },
  { title: 'HSK 1 核心词', count: 500, gradient: 'linear-gradient(135deg,#10B981,#0D9488)' },
  { title: 'HSK 2 进阶词', count: 800, gradient: 'linear-gradient(135deg,#F59E0B,#EA580C)' },
  { title: 'HSK 3 高频词', count: 1200, gradient: 'linear-gradient(135deg,#EC4899,#DB2777)' },
];

// 词书库：预设词书
const VOCAB_LIBRARY = [
  { id: 'hsk1', title: 'HSK 1 标准词汇', count: 150, level: 'HSK 1', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#10B981,#0D9488)', desc: '基础日常用语' },
  { id: 'hsk2', title: 'HSK 2 标准词汇', count: 300, level: 'HSK 2', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#3B82F6,#6366F1)', desc: '初级交流词汇' },
  { id: 'hsk3', title: 'HSK 3 标准词汇', count: 600, level: 'HSK 3', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#F59E0B,#EA580C)', desc: '日常生活场景' },
  { id: 'hsk4', title: 'HSK 4 标准词汇', count: 1200, level: 'HSK 4', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#EC4899,#DB2777)', desc: '流利交流词汇' },
  { id: 'hsk5', title: 'HSK 5 标准词汇', count: 2500, level: 'HSK 5', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', desc: '报刊阅读水平' },
  { id: 'hsk6', title: 'HSK 6 标准词汇', count: 5000, level: 'HSK 6', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg,#EF4444,#DC2626)', desc: '高级汉语应用' },
  { id: 'business', title: '商务汉语', count: 800, level: '专业', icon: <BusinessIcon />, gradient: 'linear-gradient(135deg,#64748B,#475569)', desc: '职场商务场景' },
  { id: 'travel', title: '旅游汉语', count: 500, level: '实用', icon: <FlightIcon />, gradient: 'linear-gradient(135deg,#14B8A6,#0D9488)', desc: '旅行必备用语' },
  { id: 'food', title: '美食汉语', count: 400, level: '实用', icon: <RestaurantIcon />, gradient: 'linear-gradient(135deg,#F97316,#EA580C)', desc: '餐饮点餐词汇' },
  { id: 'culture', title: '中国文化', count: 600, level: '文化', icon: <PublicIcon />, gradient: 'linear-gradient(135deg,#D946EF,#C026D3)', desc: '传统文化词汇' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   EbbinghausSettingsModal — 艾宾浩斯学习配置
   ═══════════════════════════════════════════════════════════════════════════════ */
function EbbinghausSettingsModal({ onClose, is960 }: { onClose: () => void; is960: boolean }) {
  const [dailyNewWords, setDailyNewWords] = useState(20);
  const [reviewStrategy, setReviewStrategy] = useState<'standard' | 'intensive' | 'relaxed'>('standard');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const strategies = [
    { id: 'relaxed', label: '轻松模式', desc: '复习间隔较长，适合时间有限的学习者', intervals: '20分钟 → 1小时 → 12小时 → 2天 → 7天', color: '#10B981' },
    { id: 'standard', label: '标准模式', desc: '经典艾宾浩斯曲线，适合大多数学习者', intervals: '20分钟 → 1小时 → 9小时 → 1天 → 3天 → 7天', color: '#3B82F6' },
    { id: 'intensive', label: '强化模式', desc: '复习更频繁，适合备考或密集学习', intervals: '10分钟 → 30分钟 → 3小时 → 12小时 → 1天 → 3天', color: '#F59E0B' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: is960 ? '90%' : '75%', maxWidth: 750, maxHeight: '85%', backgroundColor: 'white', borderRadius: is960 ? '24px' : '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        >
          {/* Header */}
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, py: is960 ? 2 : 2.5, borderBottom: '1px solid #F1F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem', color: '#111827' }}>学习计划配置</Typography>
              <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.8rem', color: '#9CA3AF', mt: 0.25 }}>优化你的艾宾浩斯遗忘曲线</Typography>
            </Box>
            <ButtonBase onClick={onClose} sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#F3F4F6', color: '#6B7280', '&:active': { bgcolor: '#E5E7EB' } }}>
              <CloseIcon sx={{ fontSize: 22 }} />
            </ButtonBase>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2.5 : 3.5, display: 'flex', flexDirection: 'column', gap: is960 ? 2.5 : 3 }}>
            {/* 每日新词数量 */}
            <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '20px', p: is960 ? 2.5 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <CalendarTodayIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827' }}>每日新词数量</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={dailyNewWords}
                    onChange={(e) => setDailyNewWords(parseInt(e.target.value))}
                    style={{ width: '100%', height: 8, borderRadius: 999, appearance: 'none', background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((dailyNewWords - 5) / 45) * 100}%, #E5E7EB ${((dailyNewWords - 5) / 45) * 100}%, #E5E7EB 100%)`, outline: 'none', cursor: 'pointer' }}
                  />
                </Box>
                <Box sx={{ minWidth: 80, px: 2.5, py: 1.5, bgcolor: 'white', borderRadius: '12px', border: '2px solid #3B82F6' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : '1.5rem', color: '#3B82F6', textAlign: 'center' }}>{dailyNewWords}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                {[5, 10, 20, 30, 50].map((n) => (
                  <ButtonBase
                    key={n}
                    onClick={() => setDailyNewWords(n)}
                    sx={{ px: 1.75, py: 0.75, borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', color: dailyNewWords === n ? '#3B82F6' : '#9CA3AF', bgcolor: dailyNewWords === n ? '#EFF6FF' : 'transparent', '&:active': { bgcolor: '#EFF6FF' } }}
                  >
                    {n}
                  </ButtonBase>
                ))}
              </Box>
              <Typography sx={{ mt: 2, fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.5 }}>
                每日新词数量会影响未来的复习负担。建议初学者从 <span style={{ fontWeight: 800, color: '#3B82F6' }}>10-20</span> 个开始。
              </Typography>
            </Box>

            {/* 复习策略 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <TuneIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827' }}>复习策略</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {strategies.map((strategy) => {
                  const isSelected = reviewStrategy === strategy.id;
                  return (
                    <ButtonBase
                      key={strategy.id}
                      onClick={() => setReviewStrategy(strategy.id as any)}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        bgcolor: isSelected ? `${strategy.color}08` : 'white',
                        border: `2px solid ${isSelected ? strategy.color : '#E5E7EB'}`,
                        borderRadius: '18px',
                        p: is960 ? 2 : 2.5,
                        transition: 'all 0.2s',
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827' }}>{strategy.label}</Typography>
                        {isSelected && (
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: strategy.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon sx={{ fontSize: 18, color: 'white' }} />
                          </Box>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.78rem', color: '#6B7280', mb: 1, lineHeight: 1.5 }}>{strategy.desc}</Typography>
                      <Box sx={{ px: 1.75, py: 0.75, bgcolor: isSelected ? strategy.color : '#F3F4F6', borderRadius: '10px' }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: isSelected ? 'white' : '#6B7280' }}>{strategy.intervals}</Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            {/* 提醒设置 */}
            <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '20px', p: is960 ? 2.5 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <NotificationsIcon sx={{ fontSize: 20, color: reminderEnabled ? '#3B82F6' : '#9CA3AF' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#111827' }}>复习提醒</Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mt: 0.25 }}>到达复习时间时通知你</Typography>
                  </Box>
                </Box>
                <ButtonBase
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  sx={{
                    width: 54,
                    height: 30,
                    borderRadius: '999px',
                    bgcolor: reminderEnabled ? '#3B82F6' : '#E5E7EB',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: reminderEnabled ? 'flex-end' : 'flex-start',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </ButtonBase>
              </Box>
            </Box>

            {/* 预测效果 */}
            <Box sx={{ bgcolor: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '2px solid #BFDBFE', borderRadius: '20px', p: is960 ? 2.5 : 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#1E40AF', mb: 1.5 }}>预测未来学习负担</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', mb: 0.5 }}>3 天后</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#1E40AF' }}>~{dailyNewWords + Math.floor(dailyNewWords * 0.6)}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#6B7280' }}>词/天</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', mb: 0.5 }}>7 天后</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#1E40AF' }}>~{dailyNewWords + Math.floor(dailyNewWords * 1.2)}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#6B7280' }}>词/天</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', mb: 0.5 }}>30 天后</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#1E40AF' }}>~{dailyNewWords + Math.floor(dailyNewWords * 0.8)}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#6B7280' }}>词/天</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, py: is960 ? 2 : 2.5, borderTop: '1px solid #F1F3F5', display: 'flex', gap: 1.5 }}>
            <ButtonBase
              onClick={onClose}
              sx={{ flex: 1, py: 1.75, borderRadius: '16px', fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#6B7280', bgcolor: '#F9FAFB', border: '2px solid #E5E7EB', '&:active': { bgcolor: '#F3F4F6' } }}
            >
              取消
            </ButtonBase>
            <ButtonBase
              onClick={() => {
                // TODO: 保存配置
                onClose();
              }}
              sx={{ flex: 1, py: 1.75, borderRadius: '16px', fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: 'white', bgcolor: '#2563EB', '&:active': { bgcolor: '#1D4ED8' } }}
            >
              保存配置
            </ButtonBase>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   VocabLibraryModal — 词书库配置界面
   ═══════════════════════════════════════════════════════════════════════════════ */
function VocabLibraryModal({ onClose, is960 }: { onClose: () => void; is960: boolean }) {
  const [view, setView] = useState<'library' | 'custom'>('library');
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [customRange, setCustomRange] = useState({ from: 1, to: 500 });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: is960 ? '90%' : '85%', maxWidth: 900, maxHeight: '85%', backgroundColor: 'white', borderRadius: is960 ? '24px' : '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        >
          {/* Header */}
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, py: is960 ? 2 : 2.5, borderBottom: '1px solid #F1F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem', color: '#111827' }}>词书库</Typography>
              <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.8rem', color: '#9CA3AF', mt: 0.25 }}>选择预设词书或自定义学习范围</Typography>
            </Box>
            <ButtonBase onClick={onClose} sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#F3F4F6', color: '#6B7280', '&:active': { bgcolor: '#E5E7EB' } }}>
              <CloseIcon sx={{ fontSize: 22 }} />
            </ButtonBase>
          </Box>

          {/* Tab Selector */}
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, pt: is960 ? 1.5 : 2, pb: is960 ? 1 : 1.5, display: 'flex', gap: 1, borderBottom: '1px solid #F1F3F5' }}>
            <ButtonBase
              onClick={() => setView('library')}
              sx={{ flex: 1, py: 1.25, borderRadius: '14px', fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.9rem', color: view === 'library' ? '#2563EB' : '#6B7280', bgcolor: view === 'library' ? '#EFF6FF' : 'transparent', '&:active': { bgcolor: view === 'library' ? '#DBEAFE' : '#F3F4F6' } }}
            >
              预设词书
            </ButtonBase>
            <ButtonBase
              onClick={() => setView('custom')}
              sx={{ flex: 1, py: 1.25, borderRadius: '14px', fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.9rem', color: view === 'custom' ? '#2563EB' : '#6B7280', bgcolor: view === 'custom' ? '#EFF6FF' : 'transparent', '&:active': { bgcolor: view === 'custom' ? '#DBEAFE' : '#F3F4F6' } }}
            >
              自定义配置
            </ButtonBase>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2.5 : 3.5 }}>
            {view === 'library' ? (
              // 预设词书列表
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: is960 ? 1.5 : 2 }}>
                {VOCAB_LIBRARY.map((book, i) => (
                  <motion.div key={book.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ButtonBase
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        bgcolor: 'white',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '20px',
                        p: is960 ? 2 : 2.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#3B82F6', boxShadow: '0 4px 16px rgba(59,130,246,0.1)' },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25, width: '100%' }}>
                        <Box sx={{ width: is960 ? 44 : 52, height: is960 ? 44 : 52, background: book.gradient, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                          {book.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827', lineHeight: 1.2 }}>{book.title}</Typography>
                          <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.72rem', color: '#9CA3AF', mt: 0.25 }}>{book.count} 词</Typography>
                        </Box>
                        <Box sx={{ px: 1.25, py: 0.5, bgcolor: '#F3F4F6', borderRadius: '8px' }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280' }}>{book.level}</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{book.desc}</Typography>
                    </ButtonBase>
                  </motion.div>
                ))}
              </Box>
            ) : (
              // 自定义配置
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2.5 : 3 }}>
                {/* HSK 等级选择 */}
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827', mb: 1.5 }}>选择 HSK 等级范围</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
                    {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((level) => {
                      const isSelected = selectedLevel.includes(level);
                      return (
                        <ButtonBase
                          key={level}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLevel(selectedLevel.filter((l) => l !== level));
                            } else {
                              setSelectedLevel([...selectedLevel, level]);
                            }
                          }}
                          sx={{
                            py: 1.75,
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: is960 ? '0.8rem' : '0.9rem',
                            color: isSelected ? 'white' : '#6B7280',
                            bgcolor: isSelected ? '#2563EB' : '#F9FAFB',
                            border: isSelected ? '2px solid #2563EB' : '2px solid #E5E7EB',
                            transition: 'all 0.2s',
                            '&:active': { transform: 'scale(0.97)' },
                          }}
                        >
                          {level}
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>

                {/* 词汇数量范围 */}
                <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '20px', p: is960 ? 2.5 : 3 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827', mb: 2 }}>词汇数量范围</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', mb: 0.75, textTransform: 'uppercase' }}>起始</Typography>
                      <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '2px solid #E5E7EB', px: 2, py: 1.25 }}>
                        <input
                          type="number"
                          value={customRange.from}
                          onChange={(e) => setCustomRange({ ...customRange, from: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', border: 'none', outline: 'none', fontSize: is960 ? '1rem' : '1.1rem', fontWeight: 800, color: '#111827' }}
                        />
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#D1D5DB', mt: 2 }}>—</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', mb: 0.75, textTransform: 'uppercase' }}>结束</Typography>
                      <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '2px solid #E5E7EB', px: 2, py: 1.25 }}>
                        <input
                          type="number"
                          value={customRange.to}
                          onChange={(e) => setCustomRange({ ...customRange, to: parseInt(e.target.value) || 500 })}
                          style={{ width: '100%', border: 'none', outline: 'none', fontSize: is960 ? '1rem' : '1.1rem', fontWeight: 800, color: '#111827' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                      将学习 <span style={{ color: '#2563EB', fontWeight: 800 }}>{customRange.to - customRange.from + 1}</span> 个词汇
                    </Typography>
                  </Box>
                </Box>

                {/* 主题分类 */}
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.9rem' : '1rem', color: '#111827', mb: 1.5 }}>选择主题分类（可选）</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.25 }}>
                    {['日常生活', '工作商务', '旅游出行', '美食餐饮', '文化娱乐', '学习教育'].map((topic) => (
                      <ButtonBase
                        key={topic}
                        sx={{
                          py: 1.5,
                          borderRadius: '14px',
                          fontWeight: 800,
                          fontSize: is960 ? '0.75rem' : '0.85rem',
                          color: '#6B7280',
                          bgcolor: '#F9FAFB',
                          border: '2px solid #E5E7EB',
                          '&:active': { bgcolor: '#EFF6FF', borderColor: '#3B82F6', color: '#2563EB' },
                        }}
                      >
                        {topic}
                      </ButtonBase>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3.5, py: is960 ? 2 : 2.5, borderTop: '1px solid #F1F3F5', display: 'flex', gap: 1.5 }}>
            <ButtonBase
              onClick={onClose}
              sx={{ flex: 1, py: 1.75, borderRadius: '16px', fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#6B7280', bgcolor: '#F9FAFB', border: '2px solid #E5E7EB', '&:active': { bgcolor: '#F3F4F6' } }}
            >
              取消
            </ButtonBase>
            <ButtonBase
              onClick={() => {
                // TODO: 保存配置并关闭
                onClose();
              }}
              sx={{ flex: 1, py: 1.75, borderRadius: '16px', fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: 'white', bgcolor: '#2563EB', '&:active': { bgcolor: '#1D4ED8' } }}
            >
              {view === 'library' ? '添加词书' : '创建词书'}
            </ButtonBase>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Dashboard({ onStart, onStartReview, is960 }: { onStart: () => void; onStartReview: () => void; is960: boolean }) {
  const [tab, setTab] = useState<'study' | 'library' | 'stats'>('study');
  const [showVocabLibrary, setShowVocabLibrary] = useState(false);
  const [showEbbinghausSettings, setShowEbbinghausSettings] = useState(false);
  const progress = (DAILY_GOAL.current / DAILY_GOAL.target) * 100;

  const TABS = [
    { id: 'study', label: '学习', icon: <PlayArrowIcon sx={{ fontSize: 16 }} /> },
    { id: 'library', label: '词库', icon: <LocalLibraryIcon sx={{ fontSize: 16 }} /> },
    { id: 'stats', label: '数据', icon: <BarChartIcon sx={{ fontSize: 16 }} /> },
  ] as const;

  return (
    <>
      {showVocabLibrary && <VocabLibraryModal onClose={() => setShowVocabLibrary(false)} is960={is960} />}
      {showEbbinghausSettings && <EbbinghausSettingsModal onClose={() => setShowEbbinghausSettings(false)} is960={is960} />}
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA', overflow: 'hidden' }}>
        {/* Header：仅保留分段切换（系统状态栏由 MainLayout 提供） */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, height: is960 ? 56 : 68, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderBottom: '1px solid #F1F3F5' }}>
        <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F3F4F6', borderRadius: '18px', p: '4px' }}>
          {TABS.map(t => (
            <ButtonBase
              key={t.id}
              onClick={() => setTab(t.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                px: is960 ? 1.5 : 2, py: 0.75,
                minHeight: 44,
                borderRadius: '14px',
                fontWeight: 800, fontSize: is960 ? '0.7rem' : '0.8rem',
                color: tab === t.id ? '#2563EB' : '#6B7280',
                bgcolor: tab === t.id ? 'white' : 'transparent',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </ButtonBase>
          ))}
        </Box>
      </Box>

      {/* Content：铺满标题栏下方剩余区域 */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: is960 ? 2 : 3 }}>
        {/* ── Study Tab ── */}
        {tab === 'study' && (
          <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,2fr) minmax(0,1fr)' }, gap: is960 ? 2 : 2.5, alignItems: 'stretch' }}>
            {/* Left */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5, minHeight: 0, height: '100%' }}>
              {/* 今日进度 */}
              <Box sx={{ flex: 1, minHeight: 0, bgcolor: 'white', borderRadius: '28px', p: is960 ? 2.5 : 3.5, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.75 }}>今日进度</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '2.25rem' : '2.75rem', color: '#111827', lineHeight: 1 }}>{DAILY_GOAL.current}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: is960 ? '1.1rem' : '1.35rem', color: '#E5E7EB' }}>/ {DAILY_GOAL.target}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.75rem' : '2.25rem', color: '#2563EB' }}>{Math.round(progress)}%</Typography>
                </Box>

                <Box sx={{ height: is960 ? 12 : 14, bgcolor: '#F3F4F6', borderRadius: 99, overflow: 'hidden', mb: is960 ? 2 : 3 }}>
                  <motion.div style={{ height: '100%', background: '#2563EB', borderRadius: 99 }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                  {[
                    { label: '新学', val: DAILY_GOAL.newWords, bg: '#EFF6FF', color: '#1D4ED8' },
                    { label: '复习', val: DAILY_GOAL.reviewWords, bg: '#FFFBEB', color: '#B45309' },
                    { label: '剩余', val: DAILY_GOAL.target - DAILY_GOAL.current, bg: '#F9FAFB', color: '#374151' },
                  ].map(s => (
                    <Box key={s.label} sx={{ bgcolor: s.bg, borderRadius: '18px', p: is960 ? 1.5 : 2 }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: s.color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{s.label}</Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: s.color }}>{s.val}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: is960 ? 1.5 : 2 }}>
                <ButtonBase
                  onClick={onStart}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 2.5,
                    p: is960 ? 2 : 3, textAlign: 'left',
                    bgcolor: '#2563EB', borderRadius: '28px',
                    boxShadow: '0 12px 32px rgba(37,99,235,0.35)',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ width: is960 ? 48 : 60, height: is960 ? 48 : 60, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlayArrowIcon sx={{ color: 'white', fontSize: is960 ? 26 : 34 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.1rem', color: 'white', lineHeight: 1.2 }}>开始学习</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', color: 'rgba(255,255,255,0.72)', mt: 0.35 }}>12个新词 + 3个未完成</Typography>
                  </Box>
                </ButtonBase>

                <ButtonBase
                  onClick={onStartReview}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 2.5,
                    p: is960 ? 2 : 3, textAlign: 'left',
                    bgcolor: 'white', borderRadius: '28px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ width: is960 ? 48 : 60, height: is960 ? 48 : 60, bgcolor: '#FFFBEB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AutorenewIcon sx={{ color: '#D97706', fontSize: is960 ? 26 : 34 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.1rem', color: '#111827', lineHeight: 1.2 }}>待复习</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', color: '#9CA3AF', mt: 0.35 }}>17个艾宾浩斯复习 + 6个待巩固</Typography>
                  </Box>
                </ButtonBase>
              </Box>
            </Box>

            {/* Right sidebar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5, minHeight: 0, height: '100%' }}>
              {/* 学习趋势 → 点击进入「数据」详情（艾宾浩斯等） */}
              <ButtonBase
                onClick={() => setTab('stats')}
                sx={{
                  flex: 1,
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  bgcolor: 'white',
                  borderRadius: '28px',
                  p: is960 ? 2 : 2.5,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:active': { transform: 'scale(0.995)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, width: '100%' }}>
                  <TrendingUpIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#111827' }}>学习趋势</Typography>
                  <Typography sx={{ ml: 'auto', fontSize: '0.65rem', fontWeight: 800, color: '#2563EB' }}>数据 ›</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 0.75, flex: 1, minHeight: is960 ? 80 : 100 }}>
                  {WEEKLY.map((h, i) => (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%', justifyContent: 'flex-end' }}>
                      <motion.div
                        style={{ width: '100%', background: i === 6 ? '#2563EB' : 'rgba(59,130,246,0.15)', borderRadius: '6px 6px 0 0' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                      />
                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#9CA3AF' }}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ButtonBase>

              {/* 词书信息 */}
              <Box sx={{ flexShrink: 0, background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)', borderRadius: '28px', p: is960 ? 2 : 2.5, color: 'white', boxShadow: '0 12px 28px rgba(79,70,229,0.28)' }}>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1.05rem', mb: 0.75 }}>快乐中文核心词汇</Typography>
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', opacity: 0.75, mb: 2, lineHeight: 1.5 }}>当前正在攻克快乐中文词库，已完成 35%</Typography>
                <ButtonBase
                  onClick={() => setTab('library')}
                  sx={{ width: '100%', py: is960 ? 1.25 : 1.35, minHeight: 44, bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: is960 ? '0.72rem' : '0.8rem', '&:active': { bgcolor: 'rgba(255,255,255,0.28)' } }}
                >
                  查看词书详情
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Library Tab ── */}
        {tab === 'library' && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: is960 ? 1.5 : 2, alignContent: 'start' }}>
            {BOOKS.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <ButtonBase sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', bgcolor: 'white', borderRadius: '28px', p: is960 ? 2 : 2.5, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', '&:active': { bgcolor: '#F9FAFB' } }}>
                  <Box sx={{ width: is960 ? 52 : 60, height: is960 ? 66 : 76, background: b.gradient, borderRadius: '14px', mb: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                    <MenuBookIcon sx={{ color: 'white', fontSize: is960 ? 26 : 32 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.82rem' : '0.95rem', color: '#111827', mb: 0.35, textAlign: 'left' }}>{b.title}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mb: 1 }}>{b.count} 词</Typography>
                  {b.active ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 7, height: 7, bgcolor: '#2563EB', borderRadius: '50%' }} component={motion.div} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB' }}>当前正在学习</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF' }}>选择此书</Typography>
                  )}
                </ButtonBase>
              </motion.div>
            ))}
            <ButtonBase
              onClick={() => setShowVocabLibrary(true)}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: is960 ? 2.5 : 3.5, border: '2px dashed #E5E7EB', borderRadius: '28px', color: '#9CA3AF', transition: 'all 0.2s', '&:active': { borderColor: '#3B82F6', color: '#3B82F6', transform: 'scale(0.98)' }, minHeight: 140 }}
            >
              <AddIcon sx={{ fontSize: is960 ? 28 : 34, mb: 0.75 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.8rem' }}>导入自定义词书</Typography>
            </ButtonBase>
          </Box>
        )}

        {/* ── Stats Tab ── */}
        {tab === 'stats' && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5 }}>
            {/* 遗忘曲线 */}
            <Box sx={{ flex: 1, minHeight: 320, bgcolor: 'white', borderRadius: '28px', p: is960 ? 2.5 : 3.5, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#111827' }}>艾宾浩斯遗忘曲线</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.35 }}>基于你过去 30 天的学习数据预测</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[{ color: '#3B82F6', label: '记忆保留率' }, { color: '#E5E7EB', label: '预测遗忘点' }].map(l => (
                    <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: l.color }} />
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280' }}>{l.label}</Typography>
                    </Box>
                  ))}
                </Box>
                  <ButtonBase
                    onClick={() => setShowEbbinghausSettings(true)}
                    sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#3B82F6', '&:active': { bgcolor: '#DBEAFE' } }}
                  >
                    <SettingsIcon sx={{ fontSize: 18 }} />
                  </ButtonBase>
              </Box>
              </Box>
              <Box sx={{ flex: 1, minHeight: 200, position: 'relative', pl: 4 }}>
                <svg width="100%" height="100%" viewBox="0 0 800 280" preserveAspectRatio="none" overflow="visible">
                  {[0, 25, 50, 75, 100].map(v => (
                    <g key={v}>
                      <line x1="0" y1={280 - v * 2.8} x2="800" y2={280 - v * 2.8} stroke="#F1F3F5" strokeWidth="1" />
                      <text x="-30" y={280 - v * 2.8 + 4} fontSize="10" fill="#D1D5DB" fontWeight="700">{v}%</text>
                    </g>
                  ))}
                  <defs>
                    <linearGradient id="lf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <motion.path d="M0,56 Q200,80 400,168 T800,280" fill="none" stroke="url(#lf-grad)" strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
                  {[
                    { x: 0, y: 56, label: '立即' },
                    { x: 100, y: 98, label: '20min' },
                    { x: 250, y: 140, label: '1h' },
                    { x: 450, y: 196, label: '9h' },
                    { x: 700, y: 252, label: '1d' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <motion.circle cx={pt.x} cy={pt.y} r="5" fill="#3B82F6" stroke="white" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} />
                      <text x={pt.x} y="300" fontSize="9" fill="#9CA3AF" fontWeight="700" textAnchor="middle">{pt.label}</text>
                    </g>
                  ))}
                </svg>
              </Box>
            </Box>

            {/* Stats grid */}
            <Box sx={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: is960 ? 1.25 : 1.75 }}>
              {[
                { label: '记忆持久度', val: '12.4 天', sub: '较上周提升 15%', subColor: '#16A34A' },
                { label: '掌握单词', val: '1,234', sub: '快乐中文完成 35%', subColor: '#2563EB' },
                { label: '复习准确率', val: '87.5%', sub: '近期状态稳定', subColor: '#D97706' },
              ].map(s => (
                <Box key={s.label} sx={{ bgcolor: 'white', borderRadius: '22px', p: is960 ? 2 : 2.5, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.75 }}>{s.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : '1.5rem', color: '#111827', mb: 0.25 }}>{s.val}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: s.subColor }}>{s.sub}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function LingoFlashPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [view, setView] = useState<'dashboard' | 'learning' | 'review'>('dashboard');

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Back button — only on dashboard */}
      {view === 'dashboard' && (
        <Box sx={{ position: 'absolute', top: is960 ? 11 : 14, left: is960 ? 10 : 14, zIndex: 20 }}>
          <ButtonBase
            onClick={() => navigate(-1)}
            sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#374151', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
          >
            <ChevronLeftIcon sx={{ fontSize: 26 }} />
          </ButtonBase>
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {view === 'dashboard' ? (
          <Dashboard
            onStart={() => setView('learning')}
            onStartReview={() => setView('review')}
            is960={is960}
          />
        ) : (
          <LearningSession words={DECK} onFinish={() => setView('dashboard')} is960={is960} />
        )}
      </Box>
    </Box>
  );
}
