/**
 * LingoFlash — 完整版（对齐 NewBuild/lingoflash.zip 交互）
 * Dashboard → LearningSession → SessionComplete
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Box, Typography, ButtonBase, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { APP_FONT_FAMILY } from '../theme/appFont';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
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
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlightIcon from '@mui/icons-material/Flight';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { getFunChineseFlashWordsForHub } from '../utils/funChineseUnitVocab';
import { resolveBackPath } from '../utils/navigateBack';
import { LINGOFLASH_SAVED_IDS_KEY } from '../utils/favoritesHub';
import { LINGO_FLASH_DECK, type LingoFlashWord } from '../data/lingoFlashDeck';
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';

type Word = LingoFlashWord;
const DECK: Word[] = LINGO_FLASH_DECK;
const FLASH_BLUE = '#2188FE'

function splitHanPinyin(word: string, phonetic: string) {
  const hans = [...word].filter((ch) => /[\u4e00-\u9fff]/.test(ch))
  const pys = !phonetic || phonetic === '—' ? [] : phonetic.trim().split(/\s+/)
  if (hans.length === 0) return [{ han: word, py: phonetic === '—' ? '' : phonetic }]
  return hans.map((han, i) => ({ han, py: pys[i] || '' }))
}

function speakWord(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  window.speechSynthesis.speak(utter)
}

function Flashcard({
  word,
  onAssess,
  screenSize,
  onFlipChange,
}: {
  word: Word;
  onAssess: (a: 'know' | 'uncertain' | 'unknown') => void;
  screenSize: string;
  onFlipChange?: (flipped: boolean) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const cardOpacity = useTransform(x, [-200, -140, 0, 140, 200], [0, 1, 1, 1, 0]);

  const rightOpacity = useTransform(x, [40, 130], [0, 1]);
  const leftOpacity = useTransform(x, [-130, -40], [1, 0]);
  const upOpacity = useTransform(y, [-130, -40], [1, 0]);

  const setFlipped = (next: boolean) => {
    setIsFlipped(next);
    onFlipChange?.(next);
  };

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

  const p = (n: number) => figmaPx(n, screenSize)
  const glyphs = splitHanPinyin(word.word, word.phonetic)
  const cardRadius = `${p(60)}px`
  const glyphScale = glyphs.length <= 2 ? 1 : Math.min(1, 2 / glyphs.length)
  const glyphW = Math.round(250 * glyphScale)
  const glyphH = Math.round(300 * glyphScale)
  const hanSize = Math.round(180 * glyphScale)
  const pySize = Math.round(72 * glyphScale)

  return (
    <Box
      sx={{
        position: 'relative',
        height: `min(100%, ${p(819)}px)`,
        aspectRatio: '783 / 819',
        maxWidth: `min(100%, ${p(783)}px)`,
        width: 'auto',
        perspective: '1200px',
      }}
    >
      {/* Drag layer: 2D translate/tilt only — keep separate from rotateY to avoid mirror glitches */}
      <motion.div
        drag={isFlipped}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{
          x,
          y,
          rotate,
          opacity: cardOpacity,
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: isFlipped ? 'grab' : 'default',
        }}
        whileTap={isFlipped ? { cursor: 'grabbing' } : {}}
      >
        {/* Flip layer: rotateY only */}
        <motion.div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
        {/* ── Front ── */}
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            bgcolor: '#FFFFFF',
            borderRadius: cardRadius,
            boxShadow: '0px 16px 16px -8px rgba(12, 12, 13, 0.1), 0px 4px 4px -4px rgba(12, 12, 13, 0.05)',
            border: '0.8px solid #2188FE',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pt: `${p(glyphs.length <= 2 ? 140 : 80)}px`,
              px: `${p(40)}px`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {glyphs.map((g) => (
                <Box
                  key={`${g.han}-${g.py}`}
                  sx={{
                    width: p(glyphW),
                    height: p(glyphH),
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {g.py ? (
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: `-${p(Math.round(72 * glyphScale))}px`,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        fontSize: p(pySize),
                        lineHeight: 1.2,
                        color: '#2D3436',
                        fontFamily: FIGMA_FONT,
                        fontWeight: 400,
                      }}
                    >
                      {g.py}
                    </Typography>
                  ) : null}
                  <Typography
                    sx={{
                      fontSize: p(hanSize),
                      lineHeight: 1,
                      color: '#2D3436',
                      fontFamily: '"FZNewKai GB18030L2", "Kaiti SC", "STKaiti", "KaiTi", serif',
                      fontWeight: 400,
                    }}
                  >
                    {g.han}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography
              sx={{
                mt: `${p(16)}px`,
                fontSize: p(28),
                lineHeight: `${p(41)}px`,
                color: '#A7B3B8',
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
              }}
            >
              点击卡片查看释义
            </Typography>
          </Box>
          <Box
            sx={{
              height: p(132),
              flexShrink: 0,
              bgcolor: 'rgba(33, 136, 254, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation()
                speakWord(word.word)
              }}
              aria-label="Play pronunciation"
              sx={{
                width: p(80),
                height: p(80),
                borderRadius: '50%',
                color: FLASH_BLUE,
              }}
            >
              <VolumeUpIcon sx={{ fontSize: p(48) }} />
            </ButtonBase>
          </Box>

          <ButtonBase
            onClick={() => setFlipped(true)}
            aria-label="Flip card"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: p(132),
              zIndex: 1,
              borderRadius: `${cardRadius} ${cardRadius} 0 0`,
            }}
          />
        </Box>

        {/* ── Back ── */}
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            bgcolor: '#FFFFFF',
            borderRadius: cardRadius,
            boxShadow: '0px 16px 16px -8px rgba(12, 12, 13, 0.1), 0px 4px 4px -4px rgba(12, 12, 13, 0.05)',
            border: '0.8px solid #2188FE',
            display: 'flex',
            flexDirection: 'column',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: `${p(48)}px`, pt: `${p(48)}px`, mb: `${p(20)}px`, flexShrink: 0 }}>
            <Box>
              <Typography sx={{ fontWeight: 400, fontSize: p(48), lineHeight: 1.2, color: '#2D3436', fontFamily: FIGMA_FONT }}>{word.word}</Typography>
              {word.phonetic && word.phonetic !== '—' ? (
                <Typography sx={{ color: '#A7B3B8', fontSize: p(24), fontFamily: FIGMA_FONT, mt: `${p(4)}px` }}>{word.phonetic}</Typography>
              ) : null}
            </Box>
          </Box>

          {/* Sections */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(20)}px`, flex: 1, minHeight: 0, overflowY: 'auto', px: `${p(48)}px` }}>
            {/* 释义 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>释义</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: p(28), color: '#2D3436', fontFamily: FIGMA_FONT }}>{word.translation}</Typography>
              <Typography sx={{ fontSize: p(22), color: '#636E72', fontFamily: FIGMA_FONT, mt: `${p(6)}px` }}>{word.definition}</Typography>
            </Box>

            {/* 例句 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <VolumeUpIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>例句</Typography>
              </Box>
              <Box sx={{ bgcolor: '#F8F9F8', borderRadius: `${p(20)}px`, p: `${p(20)}px` }}>
                <Typography sx={{ fontSize: p(24), color: '#2D3436', fontFamily: FIGMA_FONT, lineHeight: 1.6 }}>{word.exampleEn}</Typography>
                <Typography sx={{ fontSize: p(22), color: '#A7B3B8', fontFamily: FIGMA_FONT, mt: `${p(8)}px` }}>{word.exampleCn}</Typography>
              </Box>
            </Box>

            {/* 助记 */}
            {word.memoryAid && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>助记</Typography>
                </Box>
                <Box sx={{ bgcolor: '#FFFBEB', borderRadius: `${p(20)}px`, p: `${p(20)}px`, border: '1px solid rgba(245,158,11,0.18)' }}>
                  <Typography sx={{ fontSize: p(22), color: '#78350F', fontFamily: FIGMA_FONT }}>{word.memoryAid}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Swipe hint */}
          <Box sx={{ mt: `${p(16)}px`, mb: `${p(24)}px`, textAlign: 'center', flexShrink: 0 }}>
            <Typography
              component={motion.p}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              sx={{ fontSize: p(22), color: '#A7B3B8', fontFamily: FIGMA_FONT, fontWeight: 400 }}
            >
              ← 左滑不认识 · 上滑模糊 · 右滑认识 →
            </Typography>
          </Box>
        </Box>
        </motion.div>
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
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '2rem', color: '#111827', mb: 0.5 }}>Session complete</Typography>
        <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#6B7280', mb: is960 ? 3 : 4 }}>
          You studied {stats.total} cards today — keep it up!
        </Typography>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
        <Box sx={{ display: 'flex', gap: is960 ? 3 : 5, mb: is960 ? 3 : 4, justifyContent: 'center' }}>
          {[
            { label: 'Known', value: stats.known, color: '#16A34A' },
            { label: 'Uncertain', value: stats.uncertain, color: '#D97706' },
            { label: 'Unknown', value: stats.unknown, color: '#DC2626' },
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
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1rem', color: '#1E3A8A' }}>Badge earned</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#3B82F6' }}>15-day learning streak</Typography>
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
          Back to hub
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
  is960,
  screenSize,
  onExitToDashboard,
}: {
  words: Word[];
  is960: boolean;
  screenSize: string;
  onExitToDashboard: () => void;
}) {
  const { openFeedback } = useFeedback();
  const p = (n: number) => figmaPx(n, screenSize)
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stats, setStats] = useState({ total: words.length, known: 0, uncertain: 0, unknown: 0 });

  const progress = ((idx + 1) / words.length) * 100;
  const lessonTitle = `Lesson1 ${words[0]?.word ?? ''}`;

  const handleAssess = useCallback((a: 'know' | 'uncertain' | 'unknown') => {
    setStats(p => ({
      ...p,
      known: a === 'know' ? p.known + 1 : p.known,
      uncertain: a === 'uncertain' ? p.uncertain + 1 : p.uncertain,
      unknown: a === 'unknown' ? p.unknown + 1 : p.unknown,
    }));
    if (idx < words.length - 1) {
      setDirection(1);
      // Keep exiting card flipped; reset footer only after the next card mounts.
      setTimeout(() => {
        setIdx(i => i + 1);
        setFlipped(false);
        setDirection(0);
      }, 280);
    } else {
      setComplete(true);
    }
  }, [idx, words.length]);

  if (complete) return <SessionComplete stats={stats} onReturn={onExitToDashboard} is960={is960} />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      <Box
        sx={{
          flexShrink: 0,
          height: p(160),
          px: `${p(60)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${p(100)}px`,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          boxSizing: 'border-box',
        }}
      >
        <ButtonBase
          onClick={onExitToDashboard}
          aria-label="Back"
          sx={{
            width: p(80),
            height: p(80),
            minWidth: p(80),
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            color: '#2D3436',
            flexShrink: 0,
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: p(50), color: '#2D3436' }} />
        </ButtonBase>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${p(16)}px` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              sx={{
                fontSize: p(32),
                lineHeight: `${p(51)}px`,
                fontWeight: 400,
                color: '#2D3436',
                fontFamily: FIGMA_FONT,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lessonTitle}
            </Typography>
            <Typography
              sx={{
                fontSize: p(32),
                lineHeight: `${p(51)}px`,
                fontWeight: 400,
                color: '#2D3436',
                fontFamily: FIGMA_FONT,
                flexShrink: 0,
              }}
            >
              {idx + 1}/{words.length}
            </Typography>
          </Box>
          <Box sx={{ height: p(10), bgcolor: '#E8E8E8', borderRadius: `${p(20)}px`, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: FLASH_BLUE, borderRadius: 20 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </Box>
        </Box>

        <ButtonBase
          onClick={() => openFeedback({ screen: 'flashcard_session', lessonId: words[idx]?.id })}
          aria-label="Feedback"
          sx={{
            width: p(60),
            height: p(60),
            minWidth: p(60),
            borderRadius: `${p(18)}px`,
            background: 'linear-gradient(161.57deg, #FF7B4B 5.42%, #FD632C 86.67%)',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0px 4px 7px rgba(255, 168, 136, 0.5)',
            '&:active': { transform: 'scale(0.94)' },
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 40 40"
            aria-hidden
            sx={{ width: p(40), height: p(40), display: 'block' }}
          >
            <path
              d="M8 10h18a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H16l-6 5v-5H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
            />
            <rect x="12" y="15" width="11" height="7" rx="1.5" fill="#fff" />
            <path d="M22 22l6 6" fill="none" stroke="#fff" strokeWidth="3" />
          </Box>
        </ButtonBase>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          px: `${p(60)}px`,
          pt: `${p(40)}px`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: direction > 0 ? 260 : 0, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction > 0 ? -260 : 0, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 130 }}
            style={{ zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Flashcard
              word={words[idx]}
              onAssess={handleAssess}
              onFlipChange={setFlipped}
              screenSize={screenSize}
            />
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          height: p(141),
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E0E0DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: `${p(60)}px`,
          boxSizing: 'border-box',
        }}
      >
        {flipped ? (
          <Box sx={{ width: '100%', display: 'flex', gap: `${p(24)}px`, justifyContent: 'center' }}>
            <ButtonBase
              onClick={() => handleAssess('unknown')}
              sx={{
                flex: 1,
                maxWidth: p(280),
                height: p(72),
                borderRadius: `${p(24)}px`,
                bgcolor: '#FEF2F2',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: p(24),
                fontFamily: FIGMA_FONT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(8)}px`,
                border: '1.5px solid #FECACA',
                '&:active': { bgcolor: '#FEE2E2' },
              }}
            >
              <CloseIcon sx={{ fontSize: p(28) }} /> 不认识
            </ButtonBase>
            <ButtonBase
              onClick={() => handleAssess('uncertain')}
              sx={{
                flex: 1,
                maxWidth: p(280),
                height: p(72),
                borderRadius: `${p(24)}px`,
                bgcolor: '#FFFBEB',
                color: '#D97706',
                fontWeight: 700,
                fontSize: p(24),
                fontFamily: FIGMA_FONT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(8)}px`,
                border: '1.5px solid #FDE68A',
                '&:active': { bgcolor: '#FEF3C7' },
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: p(28) }} /> 模糊
            </ButtonBase>
            <ButtonBase
              onClick={() => handleAssess('know')}
              sx={{
                flex: 1,
                maxWidth: p(280),
                height: p(72),
                borderRadius: `${p(24)}px`,
                bgcolor: '#F0FDF4',
                color: '#16A34A',
                fontWeight: 700,
                fontSize: p(24),
                fontFamily: FIGMA_FONT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(8)}px`,
                border: '1.5px solid #BBF7D0',
                '&:active': { bgcolor: '#DCFCE7' },
              }}
            >
              <CheckIcon sx={{ fontSize: p(28) }} /> 认识
            </ButtonBase>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
const DAILY_GOAL = { target: 50, current: 32, newWords: 15, reviewWords: 17 };
const WEEKLY = [40, 70, 45, 90, 65, 80, 50];
const BOOKS = [
  { title: 'Happy Chinese Vocab', count: 1200, gradient: 'linear-gradient(135deg,#3B82F6,#6366F1)', active: true },
  { title: 'HSK 1 Core', count: 500, gradient: 'linear-gradient(135deg,#10B981,#0D9488)' },
  { title: 'HSK 2 Plus', count: 800, gradient: 'linear-gradient(135deg,#F59E0B,#EA580C)' },
  { title: 'HSK 3 High-Frequency', count: 1200, gradient: 'linear-gradient(135deg,#EC4899,#DB2777)' },
];

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

function Dashboard({
  onStart,
  onStartReview,
  onBack,
  is960,
  savedCount,
  onOpenSaved,
}: {
  onStart: () => void;
  onStartReview: () => void;
  onBack: () => void;
  is960: boolean;
  savedCount: number;
  onOpenSaved: () => void;
}) {
  const [showVocabLibrary, setShowVocabLibrary] = useState(false);
  const [tab, setTab] = useState<'study' | 'library' | 'stats'>('study');
  const [showEbbinghausSettings, setShowEbbinghausSettings] = useState(false);
  const [selectedBookIndex, setSelectedBookIndex] = useState(() => BOOKS.findIndex((book) => book.active));
  const progress = (DAILY_GOAL.current / DAILY_GOAL.target) * 100;

  const TABS = [
    { id: 'study', label: 'Study', icon: <PlayArrowIcon sx={{ fontSize: 16 }} /> },
    { id: 'library', label: 'Vocabulary', icon: <LocalLibraryIcon sx={{ fontSize: 16 }} /> },
    { id: 'stats', label: 'Stats', icon: <BarChartIcon sx={{ fontSize: 16 }} /> },
  ] as const;

  const selectedBook = BOOKS[selectedBookIndex >= 0 ? selectedBookIndex : 0];
  const selectedBookProgress = 35;
  const masteredWords = Math.round(selectedBook.count * (selectedBookProgress / 100));

  return (
    <>
      {showVocabLibrary && <VocabLibraryModal onClose={() => setShowVocabLibrary(false)} is960={is960} />}
      {showEbbinghausSettings && <EbbinghausSettingsModal onClose={() => setShowEbbinghausSettings(false)} is960={is960} />}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA', overflow: 'hidden', position: 'relative' }}>
        {/* Back button */}
        <Box sx={{ position: 'absolute', top: is960 ? 11 : 14, left: is960 ? 10 : 14, zIndex: 30 }}>
          <ButtonBase
            type="button"
            onClick={onBack}
            sx={{ minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#374151', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
          >
            <ChevronLeftIcon sx={{ fontSize: 26 }} />
          </ButtonBase>
        </Box>

        {/* Tab switcher */}
        <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, height: is960 ? 56 : 68, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderBottom: '1px solid #F1F3F5' }}>
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F3F4F6', borderRadius: '18px', p: '4px' }}>
            {TABS.map((t) => (
              <ButtonBase
                key={t.id}
                onClick={() => setTab(t.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: is960 ? 1.5 : 2,
                  py: 0.75,
                  minHeight: 44,
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: is960 ? '0.7rem' : '0.8rem',
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

        {/* Tab content */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: is960 ? 2 : 3 }}>
          {tab === 'study' && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0,2fr) minmax(0,1fr)' },
              gridTemplateRows: { xs: 'auto auto auto auto', md: 'minmax(0, auto) auto' },
              gap: is960 ? 2 : 2.5,
              alignItems: 'stretch',
            }}
          >
            {/* Daily + Saved: md 上与 Learning Trend 同列等高，底边对齐 */}
            <Box
              sx={{
                gridColumn: { xs: 1, md: 1 },
                gridRow: { xs: 1, md: 1 },
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: is960 ? 2 : 2.5, md: 0 },
                justifyContent: { md: 'space-between' },
                minHeight: { md: is960 ? 246 : 383 },
                minWidth: 0,
              }}
            >
              <Box sx={{ width: '100%', aspectRatio: '16 / 7', bgcolor: 'white', borderRadius: '28px', p: is960 ? 2.5 : 3.5, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.75 }}>Daily Progress</Typography>
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
                    { label: 'New', val: DAILY_GOAL.newWords, bg: '#EFF6FF', color: '#1D4ED8' },
                    { label: 'Review', val: DAILY_GOAL.reviewWords, bg: '#FFFBEB', color: '#B45309' },
                    { label: 'Left', val: DAILY_GOAL.target - DAILY_GOAL.current, bg: '#F9FAFB', color: '#374151' },
                  ].map((s) => (
                    <Box key={s.label} sx={{ bgcolor: s.bg, borderRadius: '18px', p: is960 ? 1.5 : 2 }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: s.color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{s.label}</Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: s.color }}>{s.val}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <ButtonBase
                type="button"
                onClick={onOpenSaved}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: is960 ? 2 : 2.5,
                  textAlign: 'left',
                  bgcolor: 'white',
                  borderRadius: '28px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  minHeight: 52,
                  '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.995)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 2 }}>
                  <Box sx={{ width: is960 ? 44 : 48, height: is960 ? 44 : 48, bgcolor: '#FEF3C7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StarOutlineIcon sx={{ color: '#D97706', fontSize: is960 ? 24 : 26 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '1rem', color: '#111827', lineHeight: 1.2 }}>Saved words</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.74rem' : '0.82rem', color: '#9CA3AF', mt: 0.35 }}>Review cards you starred during sessions</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#2563EB', flexShrink: 0 }}>{savedCount}</Typography>
              </ButtonBase>
            </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: is960 ? 1.5 : 2, gridColumn: { xs: 1, md: 1 }, gridRow: { xs: 2, md: 2 }, minWidth: 0 }}>
                <ButtonBase
                  onClick={onStart}
                  sx={{
                    aspectRatio: '5 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 1.5 : 2.5,
                    p: is960 ? 2 : 3,
                    textAlign: 'left',
                    bgcolor: '#2563EB',
                    borderRadius: '28px',
                    boxShadow: '0 12px 32px rgba(37,99,235,0.35)',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ width: is960 ? 48 : 60, height: is960 ? 48 : 60, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlayArrowIcon sx={{ color: 'white', fontSize: is960 ? 26 : 34 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.1rem', color: 'white', lineHeight: 1.2 }}>Start Learning</Typography>
                    <Box sx={{ mt: 0.45, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#FFFFFF', lineHeight: 1 }}>12</Typography>
                        <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.86rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}>New words</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.98rem' : '1.18rem', color: '#BFDBFE', lineHeight: 1 }}>3</Typography>
                        <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.86rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.2 }}>Unfinished words</Typography>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>

                <ButtonBase
                  onClick={onStartReview}
                  sx={{
                    aspectRatio: '5 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 1.5 : 2.5,
                    p: is960 ? 2 : 3,
                    textAlign: 'left',
                    bgcolor: 'white',
                    borderRadius: '28px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    '&:active': { bgcolor: '#F9FAFB', transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ width: is960 ? 48 : 60, height: is960 ? 48 : 60, bgcolor: '#FFFBEB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AutorenewIcon sx={{ color: '#D97706', fontSize: is960 ? 26 : 34 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.1rem', color: '#111827', lineHeight: 1.2 }}>Review Queue</Typography>
                    <Box sx={{ mt: 0.45, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#B45309', lineHeight: 1 }}>17</Typography>
                        <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.86rem', color: '#6B7280', lineHeight: 1.2 }}>Due reviews</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.98rem' : '1.18rem', color: '#2563EB', lineHeight: 1 }}>6</Typography>
                        <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.86rem', color: '#6B7280', lineHeight: 1.2 }}>To reinforce</Typography>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              </Box>

              <ButtonBase
                type="button"
                onClick={() => setShowEbbinghausSettings(true)}
                sx={{
                  gridColumn: { xs: 1, md: 2 },
                  gridRow: { xs: 3, md: 1 },
                  width: '100%',
                  minHeight: is960 ? 246 : 383,
                  height: { md: '100%' },
                  alignSelf: 'stretch',
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
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#111827' }}>Learning Trend</Typography>
                  <Typography sx={{ ml: 'auto', fontSize: is960 ? '0.76rem' : '0.86rem', fontWeight: 800, color: '#2563EB' }}>Plan ›</Typography>
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

              {/* Selected vocabulary book */}
              <ButtonBase
                onClick={() => setTab('library')}
                sx={{
                  gridColumn: { xs: 1, md: 2 },
                  gridRow: { xs: 4, md: 2 },
                  width: '100%',
                  mt: { xs: 0, md: 0 },
                  height: is960 ? 109 : 182,
                  minHeight: is960 ? 109 : 182,
                  maxHeight: is960 ? 109 : 182,
                  display: 'flex',
                  alignItems: 'center',
                  gap: is960 ? 1.5 : 2.5,
                  p: is960 ? 2 : 3,
                  textAlign: 'left',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                  borderRadius: '28px',
                  color: 'white',
                  boxShadow: '0 12px 28px rgba(79,70,229,0.28)',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <Box
                  sx={{
                    width: is960 ? 52 : 60,
                    height: is960 ? 66 : 76,
                    background: selectedBook.gradient,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    flexShrink: 0,
                  }}
                >
                  <MenuBookIcon sx={{ color: 'white', fontSize: is960 ? 26 : 34 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.1rem', color: 'white', lineHeight: 1.2 }}>
                    {selectedBook.title}
                  </Typography>
                  <Box sx={{ mt: 0.6 }}>
                    <Box sx={{ height: is960 ? 5 : 6, bgcolor: 'rgba(255,255,255,0.24)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: '#BFDBFE', borderRadius: 99 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBookProgress}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </Box>
                    <Box sx={{ mt: 0.45, display: 'flex', alignItems: 'baseline', gap: 0.45 }}>
                      <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.74rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>
                        {selectedBookProgress}% ·
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.72rem' : '0.82rem', color: '#FFFFFF', lineHeight: 1.1 }}>
                        {masteredWords}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.74rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.2 }}>/</Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.72rem' : '0.82rem', color: '#BFDBFE', lineHeight: 1.1 }}>
                        {selectedBook.count}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.74rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.2 }}>
                        words
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ButtonBase>
          </Box>
        )}

        {/* Library Tab */}
        {tab === 'library' && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: is960 ? 1.5 : 2, alignContent: 'start' }}>
            {BOOKS.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <ButtonBase
                  onClick={() => setSelectedBookIndex(i)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    bgcolor: selectedBookIndex === i ? '#F8FAFF' : 'white',
                    borderRadius: '28px',
                    p: is960 ? 2 : 2.5,
                    border: selectedBookIndex === i ? '1px solid #BFDBFE' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: selectedBookIndex === i ? '0 6px 18px rgba(37,99,235,0.12)' : '0 2px 10px rgba(0,0,0,0.05)',
                    '&:active': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Box sx={{ width: is960 ? 52 : 60, height: is960 ? 66 : 76, background: b.gradient, borderRadius: '14px', mb: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                    <MenuBookIcon sx={{ color: 'white', fontSize: is960 ? 26 : 32 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.82rem' : '0.95rem', color: '#111827', mb: 0.35, textAlign: 'left' }}>{b.title}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mb: 1 }}>{b.count} words</Typography>
                  {selectedBookIndex === i ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 7, height: 7, bgcolor: '#2563EB', borderRadius: '50%' }} component={motion.div} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB' }}>Currently learning</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF' }}>Select this book</Typography>
                  )}
                </ButtonBase>
              </motion.div>
            ))}
            <ButtonBase
              onClick={() => setShowVocabLibrary(true)}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: is960 ? 2.5 : 3.5, border: '2px dashed #E5E7EB', borderRadius: '28px', color: '#9CA3AF', transition: 'all 0.2s', '&:active': { borderColor: '#3B82F6', color: '#3B82F6', transform: 'scale(0.98)' }, minHeight: 140 }}
            >
              <AddIcon sx={{ fontSize: is960 ? 28 : 34, mb: 0.75 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Import custom word list</Typography>
            </ButtonBase>
          </Box>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5 }}>
            <Box sx={{ flex: 1, minHeight: 320, bgcolor: 'white', borderRadius: '28px', p: is960 ? 2.5 : 3.5, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#111827' }}>Ebbinghaus Forgetting Curve</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.35 }}>Forecast from your study data over the last 30 days</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[
                      { color: '#3B82F6', label: 'Retention' },
                      { color: '#E5E7EB', label: 'Forgetting risk' },
                    ].map((l) => (
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
                  {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                      <line x1="0" y1={280 - v * 2.8} x2="800" y2={280 - v * 2.8} stroke="#F1F3F5" strokeWidth="1" />
                      <text x="-30" y={280 - v * 2.8 + 4} fontSize="10" fill="#D1D5DB" fontWeight="700">
                        {v}%
                      </text>
                    </g>
                  ))}
                  <defs>
                    <linearGradient id="lf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,56 Q200,80 400,168 T800,280"
                    fill="none"
                    stroke="url(#lf-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                  />
                  {[
                    { x: 0, y: 56, label: 'Now' },
                    { x: 100, y: 98, label: '20min' },
                    { x: 250, y: 140, label: '1h' },
                    { x: 450, y: 196, label: '9h' },
                    { x: 700, y: 252, label: '1d' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                      />
                      <text x={pt.x} y="300" fontSize="9" fill="#9CA3AF" fontWeight="700" textAnchor="middle">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </Box>
            </Box>

            <Box sx={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: is960 ? 1.25 : 1.75 }}>
              {[
                { label: 'Memory span', val: '12.4 days', sub: 'Up 15% vs last week', subColor: '#16A34A' },
                { label: 'Words mastered', val: '1,234', sub: 'Happy Chinese 35% complete', subColor: '#2563EB' },
                { label: 'Review accuracy', val: '87.5%', sub: 'Stable lately', subColor: '#D97706' },
              ].map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    width: '100%',
                    aspectRatio: '3 / 2',
                    boxSizing: 'border-box',
                    bgcolor: 'white',
                    borderRadius: '22px',
                    p: is960 ? 1.75 : 2.25,
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 0,
                    overflow: 'hidden',
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.66rem' : '0.74rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.55, lineHeight: 1.2 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.24rem' : '1.52rem', color: '#111827', mb: 0.25, lineHeight: 1.15 }}>{s.val}</Typography>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.72rem' : '0.8rem',
                      color: s.subColor,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {s.sub}
                  </Typography>
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
   SavedWordsDialog
   ═══════════════════════════════════════════════════════════════════════════════ */
function SavedWordsDialog({
  open,
  onClose,
  savedWordIds,
  allWords,
  onRemove,
  onStartStudySaved,
  is960,
}: {
  open: boolean;
  onClose: () => void;
  savedWordIds: string[];
  allWords: Word[];
  onRemove: (id: string) => void;
  onStartStudySaved: () => void;
  is960: boolean;
}) {
  const savedWords = allWords.filter((w) => savedWordIds.includes(w.id));

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: is960 ? '92%' : '80%',
            maxWidth: 520,
            maxHeight: '82%',
            backgroundColor: 'white',
            borderRadius: is960 ? '24px' : '28px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3, py: is960 ? 2 : 2.5, borderBottom: '1px solid #F1F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#111827' }}>Saved words</Typography>
            <ButtonBase onClick={onClose} sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#F3F4F6', color: '#6B7280', '&:active': { bgcolor: '#E5E7EB' } }}>
              <CloseIcon sx={{ fontSize: 22 }} />
            </ButtonBase>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 2.5 }}>
            {savedWords.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#9CA3AF', fontSize: is960 ? '0.85rem' : '0.95rem', py: 4 }}>No saved words yet. Star cards while you study.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedWords.map((w) => (
                  <Box
                    key={w.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: is960 ? 1.5 : 2,
                      borderRadius: '18px',
                      border: '1px solid #E5E7EB',
                      bgcolor: '#FAFAFA',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.1rem', color: '#111827' }}>{w.word}</Typography>
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#6B7280', mt: 0.25 }} noWrap>
                        {w.translation}
                      </Typography>
                    </Box>
                    <ButtonBase
                      type="button"
                      onClick={() => onRemove(w.id)}
                      sx={{
                        flexShrink: 0,
                        px: 1.5,
                        py: 1,
                        borderRadius: '12px',
                        bgcolor: '#FEF2F2',
                        color: '#DC2626',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        '&:active': { bgcolor: '#FEE2E2' },
                      }}
                    >
                      Remove
                    </ButtonBase>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ flexShrink: 0, px: is960 ? 2.5 : 3, py: is960 ? 2 : 2.5, borderTop: '1px solid #F1F3F5', display: 'flex', gap: 1.5 }}>
            <ButtonBase
              onClick={onClose}
              sx={{ flex: 1, py: 1.75, borderRadius: '16px', fontWeight: 800, fontSize: is960 ? '0.85rem' : '0.95rem', color: '#6B7280', bgcolor: '#F9FAFB', border: '2px solid #E5E7EB', '&:active': { bgcolor: '#F3F4F6' } }}
            >
              Close
            </ButtonBase>
            <ButtonBase
              disabled={savedWords.length === 0}
              onClick={onStartStudySaved}
              sx={{
                flex: 1,
                py: 1.75,
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: is960 ? '0.85rem' : '0.95rem',
                color: 'white',
                bgcolor: savedWords.length === 0 ? '#D1D5DB' : '#2563EB',
                '&:active': { bgcolor: savedWords.length === 0 ? '#D1D5DB' : '#1D4ED8' },
              }}
            >
              Study saved
            </ButtonBase>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function LingoFlashPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const screenSize = APP_SCREEN_SIZE;
  const is960 = screenSize === '960x540';

  const [view, setView] = useState<'dashboard' | 'learning' | 'review'>('dashboard');
  const [learningWords, setLearningWords] = useState<Word[]>(DECK);
  const [savedWordIds, setSavedWordIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LINGOFLASH_SAVED_IDS_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      /* ignore */
    }
    return [];
  });
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LINGOFLASH_SAVED_IDS_KEY, JSON.stringify(savedWordIds));
    } catch {
      /* ignore */
    }
  }, [savedWordIds]);

  const embedFromFunChinese = searchParams.get('from') === 'fun-chinese';

  useEffect(() => {
    if (!embedFromFunChinese) return;
    const words = getFunChineseFlashWordsForHub();
    if (words.length === 0) {
      navigate('/library/hub/fun-chinese', { replace: true });
      return;
    }
    setLearningWords(words as Word[]);
    setView('learning');
  }, [embedFromFunChinese, navigate]);

  const handleExitFromSession = useCallback(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'fun-chinese') {
      navigate('/library/hub/fun-chinese');
      return;
    }
    setView('dashboard');
  }, [navigate]);

  const handleBackFromDashboard = useCallback(() => {
    navigate(resolveBackPath(location), { replace: true });
  }, [location, navigate]);

  const handleStartLearning = useCallback(() => {
    setLearningWords(DECK);
    setView('learning');
  }, []);

  const handleStartReview = useCallback(() => {
    setLearningWords(DECK);
    setView('review');
  }, []);

  const handleStartStudySaved = useCallback(() => {
    const next = DECK.filter((w) => savedWordIds.includes(w.id));
    if (next.length === 0) return;
    setLearningWords(next);
    setSavedDialogOpen(false);
    setView('learning');
  }, [savedWordIds]);

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {view === 'dashboard' ? (
          <Dashboard
            onStart={handleStartLearning}
            onStartReview={handleStartReview}
            onBack={handleBackFromDashboard}
            is960={is960}
            savedCount={savedWordIds.length}
            onOpenSaved={() => setSavedDialogOpen(true)}
          />
        ) : (
          <LearningSession
            words={learningWords}
            is960={is960}
            screenSize={screenSize}
            onExitToDashboard={handleExitFromSession}
          />
        )}
      </Box>

      <SavedWordsDialog
        open={savedDialogOpen}
        onClose={() => setSavedDialogOpen(false)}
        savedWordIds={savedWordIds}
        allWords={DECK}
        onRemove={(id) => setSavedWordIds((prev) => prev.filter((x) => x !== id))}
        onStartStudySaved={handleStartStudySaved}
        is960={is960}
      />
    </Box>
  );
}
