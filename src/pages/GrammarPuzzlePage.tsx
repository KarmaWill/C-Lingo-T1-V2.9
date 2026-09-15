/**
 * Grammar Puzzle (Syntax Snap) — 拖词成句游戏
 * 通过拼图方式学习中文语法和句子结构
 * Hub → LevelSelection → Game → Gallery
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import { APP_FONT_FAMILY } from '../theme/appFont';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CollectionsIcon from '@mui/icons-material/Collections';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';

interface WordBlock {
  id: string;
  text: string;
  pinyin?: string;
}

interface Level {
  id: number;
  sentence: string;
  pinyin: string;
  translation: string;
  words: WordBlock[];
  correctOrder: string[];
  imageUrl: string;
  theme: string;
}

// 示例关卡数据（简化版，包含6个基础关卡）
const DEMO_LEVELS: Level[] = [
  {
    id: 1,
    theme: 'Daily Life',
    sentence: '我每天早上喝一杯咖啡。',
    pinyin: 'Wǒ měitiān zǎoshang hē yī bēi kāfēi.',
    translation: 'I drink a cup of coffee every morning.',
    words: [
      { id: '1-1', text: '我', pinyin: 'Wǒ' },
      { id: '1-2', text: '每天早上', pinyin: 'měitiān zǎoshang' },
      { id: '1-3', text: '喝', pinyin: 'hē' },
      { id: '1-4', text: '一杯咖啡', pinyin: 'yī bēi kāfēi' },
    ],
    correctOrder: ['1-1', '1-2', '1-3', '1-4'],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  },
  {
    id: 2,
    theme: 'Daily Life',
    sentence: '周末我喜欢在家里看书。',
    pinyin: 'Zhōumò wǒ xǐhuān zài jiālǐ kànshū.',
    translation: 'I like to read at home on weekends.',
    words: [
      { id: '2-1', text: '周末', pinyin: 'Zhōumò' },
      { id: '2-2', text: '我', pinyin: 'wǒ' },
      { id: '2-3', text: '喜欢', pinyin: 'xǐhuān' },
      { id: '2-4', text: '在家里', pinyin: 'zài jiālǐ' },
      { id: '2-5', text: '看书', pinyin: 'kànshū' },
    ],
    correctOrder: ['2-1', '2-2', '2-3', '2-4', '2-5'],
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
  },
  {
    id: 3,
    theme: 'Daily Life',
    sentence: '妈妈正在厨房里做晚饭。',
    pinyin: 'Māma zhèngzài chúfáng lǐ zuò wǎnfàn.',
    translation: 'Mom is cooking dinner in the kitchen.',
    words: [
      { id: '3-1', text: '妈妈', pinyin: 'Māma' },
      { id: '3-2', text: '正在', pinyin: 'zhèngzài' },
      { id: '3-3', text: '厨房里', pinyin: 'chúfáng lǐ' },
      { id: '3-4', text: '做晚饭', pinyin: 'zuò wǎnfàn' },
    ],
    correctOrder: ['3-1', '3-2', '3-3', '3-4'],
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
  },
  {
    id: 4,
    theme: 'Pets',
    sentence: '我有一只可爱的橘猫。',
    pinyin: 'Wǒ yǒu yī zhī kě\'ài de júmāo.',
    translation: 'I have a cute orange cat.',
    words: [
      { id: '4-1', text: '我', pinyin: 'Wǒ' },
      { id: '4-2', text: '有', pinyin: 'yǒu' },
      { id: '4-3', text: '一只', pinyin: 'yī zhī' },
      { id: '4-4', text: '可爱的', pinyin: 'kě\'ài de' },
      { id: '4-5', text: '橘猫', pinyin: 'júmāo' },
    ],
    correctOrder: ['4-1', '4-2', '4-3', '4-4', '4-5'],
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
  },
  {
    id: 5,
    theme: 'Food',
    sentence: '这家餐厅的烤鸭非常好吃。',
    pinyin: 'Zhè jiā cāntīng de kǎoyā fēicháng hǎochī.',
    translation: 'This restaurant\'s roast duck is very delicious.',
    words: [
      { id: '5-1', text: '这家', pinyin: 'Zhè jiā' },
      { id: '5-2', text: '餐厅的', pinyin: 'cāntīng de' },
      { id: '5-3', text: '烤鸭', pinyin: 'kǎoyā' },
      { id: '5-4', text: '非常', pinyin: 'fēicháng' },
      { id: '5-5', text: '好吃', pinyin: 'hǎochī' },
    ],
    correctOrder: ['5-1', '5-2', '5-3', '5-4', '5-5'],
    imageUrl: 'https://images.unsplash.com/photo-1600555379765-f82335a05ba5?w=800',
  },
  {
    id: 6,
    theme: 'Travel',
    sentence: '我们明天一起去看电影。',
    pinyin: 'Wǒmen míngtiān yīqǐ qù kàn diànyǐng.',
    translation: 'We will go watch a movie together tomorrow.',
    words: [
      { id: '6-1', text: '我们', pinyin: 'Wǒmen' },
      { id: '6-2', text: '明天', pinyin: 'míngtiān' },
      { id: '6-3', text: '一起', pinyin: 'yīqǐ' },
      { id: '6-4', text: '去', pinyin: 'qù' },
      { id: '6-5', text: '看电影', pinyin: 'kàn diànyǐng' },
    ],
    correctOrder: ['6-1', '6-2', '6-3', '6-4', '6-5'],
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   HubView — 首页
   ═══════════════════════════════════════════════════════════════════════════════ */
function HubView({ onNavigate, onBack, completedCount, points, is960 }: { onNavigate: (view: 'level-selection' | 'gallery') => void; onBack: () => void; completedCount: number; points: number; is960: boolean }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF8F0', p: is960 ? 3 : 4, textAlign: 'center', position: 'relative', fontFamily: APP_FONT_FAMILY }}>
      {/* Back Button */}
      <Box sx={{ position: 'absolute', top: is960 ? 12 : 16, left: is960 ? 12 : 16 }}>
        <ButtonBase
          onClick={onBack}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
      </Box>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
          <Typography sx={{ fontSize: is960 ? '2.35rem' : '3.1rem', fontWeight: 900, color: '#791F87', mb: 1, letterSpacing: '-0.01em' }}>
            Class Generator
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              right: is960 ? -8 : -12,
              top: is960 ? -14 : -18,
              bgcolor: '#D33682',
              color: 'white',
              fontSize: is960 ? '0.6rem' : '0.7rem',
              px: is960 ? 1.25 : 1.6,
              py: is960 ? 0.5 : 0.55,
              borderRadius: '999px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow: '0 6px 16px rgba(211,54,130,0.28)',
              transform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Global Debut
          </Box>
        </Box>
        <Typography sx={{ fontSize: is960 ? '1rem' : '1.2rem', fontWeight: 700, color: '#859900', mb: 4 }}>
          Sentence puzzle made intuitive.
        </Typography>
      </motion.div>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: is960 ? 2 : 2.5,
          width: '100%',
          maxWidth: is960 ? 640 : 700,
          mb: 5,
          p: is960 ? 1.5 : 2,
          borderRadius: '28px',
          bgcolor: 'rgba(255,255,255,0.68)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 10px 28px rgba(7,54,66,0.08)',
        }}
      >
        <ButtonBase
          onClick={() => onNavigate('level-selection')}
          sx={{
            position: 'relative',
            bgcolor: '#2AA198',
            color: 'white',
            p: is960 ? 2.5 : 3.25,
            minHeight: is960 ? 132 : 148,
            borderRadius: '22px',
            boxShadow: '0 8px 0 rgb(7,54,66)',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#268BD2' },
            '&:active': { transform: 'translateY(8px)', boxShadow: 'none' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlayArrowIcon sx={{ fontSize: is960 ? 40 : 50, mb: 1.2 }} />
          <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, mb: 0.4, lineHeight: 1.2 }}>Start Practice</Typography>
          <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.9rem', opacity: 0.88 }}>Completed {completedCount} levels</Typography>
        </ButtonBase>

        <ButtonBase
          onClick={() => onNavigate('gallery')}
          sx={{
            position: 'relative',
            bgcolor: '#B58900',
            color: 'white',
            p: is960 ? 2.5 : 3.25,
            minHeight: is960 ? 132 : 148,
            borderRadius: '22px',
            boxShadow: '0 8px 0 rgb(7,54,66)',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#CB4B16' },
            '&:active': { transform: 'translateY(8px)', boxShadow: 'none' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CollectionsIcon sx={{ fontSize: is960 ? 38 : 48, mb: 1.2 }} />
          <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, mb: 0.4, lineHeight: 1.2 }}>My Gallery</Typography>
          <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.9rem', opacity: 0.88 }}>Unlocked {completedCount} images</Typography>
        </ButtonBase>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', px: 3, py: 1.5, borderRadius: '99px', border: '1px solid rgba(0,0,0,0.06)' }}>
        <EmojiEventsIcon sx={{ fontSize: 22, color: '#B58900' }} />
        <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#111827' }}>{points} 分</Typography>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LevelSelectionView — 关卡选择
   ═══════════════════════════════════════════════════════════════════════════════ */
function LevelSelectionView({ onBack, onSelectLevel, completedIds, is960 }: { onBack: () => void; onSelectLevel: (level: Level) => void; completedIds: number[]; is960: boolean }) {
  const groupedLevels = DEMO_LEVELS.reduce((acc, level) => {
    const theme = level.theme;
    if (!acc[theme]) acc[theme] = [];
    acc[theme].push(level);
    return acc;
  }, {} as Record<string, Level[]>);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 2 : 2.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <ButtonBase
          onClick={onBack}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'white', color: '#586E75', border: '1px solid rgba(0,0,0,0.06)', '&:active': { bgcolor: '#F3F4F6' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '2rem', color: '#073642', fontFamily: APP_FONT_FAMILY }}>Choose Level</Typography>
      </Box>

      {/* Level Grid */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3 }}>
        {Object.entries(groupedLevels).map(([theme, levels]) => (
          <Box key={theme} sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', fontWeight: 800, color: '#2AA198', mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: APP_FONT_FAMILY }}>
              {theme}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: is960 ? 1.5 : 2 }}>
              {levels.map((level) => {
                const isCompleted = completedIds.includes(level.id);
                const isLocked = level.id > 1 && !completedIds.includes(level.id - 1);

                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: level.id * 0.05 }}
                  >
                    <ButtonBase
                      onClick={() => !isLocked && onSelectLevel(level)}
                      disabled={isLocked}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        bgcolor: isLocked ? 'rgba(147,161,161,0.1)' : 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: isCompleted ? '3px solid #859900' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: isLocked ? 'none' : '0 4px 16px rgba(0,0,0,0.08)',
                        opacity: isLocked ? 0.5 : 1,
                        transition: 'all 0.2s',
                        '&:active': !isLocked ? { transform: 'scale(0.98)' } : {},
                      }}
                    >
                      {/* Image */}
                      <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
                        <img
                          src={level.imageUrl}
                          alt={level.theme}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: isLocked ? 'blur(8px) grayscale(1)' : 'none',
                          }}
                        />
                        {isLocked && (
                          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.4)' }}>
                            <Box sx={{ bgcolor: 'rgba(7,54,66,0.4)', backdropFilter: 'blur(10px)', p: 2, borderRadius: '50%' }}>
                              <LockIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                          </Box>
                        )}
                        {isCompleted && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#859900', color: 'white', px: 1.5, py: 0.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900 }}>已完成</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Info */}
                      <Box sx={{ p: is960 ? 1.5 : 2, textAlign: 'left' }}>
                        <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', fontWeight: 800, color: '#2AA198', textTransform: 'uppercase', mb: 0.5 }}>
                          关卡 {level.id}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.1rem', fontWeight: 900, color: isLocked ? '#93A1A1' : '#073642', lineHeight: 1.3 }}>
                          {isLocked ? '??? ???' : level.sentence.slice(0, 12) + '...'}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  </motion.div>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   GalleryView — 图鉴
   ═══════════════════════════════════════════════════════════════════════════════ */
function GalleryView({ onBack, completedIds, onPlayLevel, is960 }: { onBack: () => void; completedIds: number[]; onPlayLevel: (level: Level) => void; is960: boolean }) {
  const [filterTheme, setFilterTheme] = useState<string>('All');
  const themes = ['All', ...Array.from(new Set(DEMO_LEVELS.map(l => l.theme)))];
  const filteredLevels = filterTheme === 'All' ? DEMO_LEVELS : DEMO_LEVELS.filter(l => l.theme === filterTheme);

  const speakSentence = (sentence: string) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 2 : 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ButtonBase
            onClick={onBack}
            sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'white', color: '#586E75', border: '1px solid rgba(0,0,0,0.06)', '&:active': { bgcolor: '#F3F4F6' } }}
          >
            <ChevronLeftIcon sx={{ fontSize: 24 }} />
          </ButtonBase>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '2rem', color: '#073642', fontFamily: APP_FONT_FAMILY }}>My Gallery</Typography>
        </Box>

        {/* Theme Filter */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {themes.map((theme) => (
            <ButtonBase
              key={theme}
              onClick={() => setFilterTheme(theme)}
              sx={{
                px: is960 ? 1.5 : 2,
                py: 0.75,
                minHeight: 38,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: is960 ? '0.7rem' : '0.8rem',
                color: filterTheme === theme ? 'white' : '#586E75',
                bgcolor: filterTheme === theme ? '#2AA198' : 'white',
                border: filterTheme === theme ? '2px solid #2AA198' : '1px solid rgba(0,0,0,0.06)',
                '&:active': { transform: 'scale(0.95)' },
                fontFamily: APP_FONT_FAMILY,
              }}
            >
              {theme}
            </ButtonBase>
          ))}
        </Box>
      </Box>

      {/* Gallery Grid */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 2 : 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: is960 ? 2 : 3 }}>
          {filteredLevels.map((level) => {
            const isUnlocked = completedIds.includes(level.id);

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: level.id * 0.03 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: isUnlocked ? 'white' : 'rgba(147,161,161,0.1)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: isUnlocked ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.03)',
                    boxShadow: isUnlocked ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', bgcolor: '#F3F4F6' }}>
                    <img
                      src={level.imageUrl}
                      alt={level.theme}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isUnlocked ? 'none' : 'blur(8px)',
                      }}
                    />

                    {!isUnlocked && (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
                        <Box sx={{ bgcolor: 'rgba(7,54,66,0.4)', backdropFilter: 'blur(10px)', p: 2.5, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}>
                          <LockIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                      </Box>
                    )}

                    {isUnlocked && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: '#859900',
                          color: 'white',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          px: 1.3,
                          py: 0.45,
                          borderRadius: '10px',
                          letterSpacing: '0.04em',
                          border: '1px solid rgba(255,255,255,0.45)',
                          boxShadow: '0 4px 12px rgba(133,153,0,0.3)',
                          fontFamily: APP_FONT_FAMILY,
                        }}
                      >
                        UNLOCKED
                      </Box>
                    )}

                    {isUnlocked && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(42,161,152,0.6)', opacity: 0, transition: 'opacity 0.3s', '&:hover': { opacity: 1 }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <ButtonBase
                          onClick={() => onPlayLevel(level)}
                          sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'white', color: '#2AA198', '&:active': { transform: 'scale(0.9)' } }}
                        >
                          <PlayArrowIcon sx={{ fontSize: 32 }} />
                        </ButtonBase>
                        <ButtonBase
                          onClick={() => speakSentence(level.sentence)}
                          sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'white', color: '#B58900', '&:active': { transform: 'scale(0.9)' } }}
                        >
                          <VolumeUpIcon sx={{ fontSize: 28 }} />
                        </ButtonBase>
                      </Box>
                    )}
                  </Box>

                  {/* Info */}
                  <Box sx={{ p: is960 ? 2 : 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#2AA198', textTransform: 'uppercase', bgcolor: 'rgba(42,161,152,0.1)', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                        关卡 {level.id} • {level.theme}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: is960 ? '1rem' : '1.15rem', fontWeight: 900, color: isUnlocked ? '#073642' : '#93A1A1', lineHeight: 1.3, mb: 0.5 }}>
                      {isUnlocked ? level.sentence : '??? ???'}
                    </Typography>
                    {isUnlocked && (
                      <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#586E75', fontStyle: 'italic', opacity: 0.8 }}>
                        {level.translation}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   GameView — 游戏进行中
   ═══════════════════════════════════════════════════════════════════════════════ */
function GameView({ level, onComplete, onBack, is960 }: { level: Level; onComplete: () => void; onBack: () => void; is960: boolean }) {
  const [placedWords, setPlacedWords] = useState<(WordBlock | null)[]>([]);
  const [availableWords, setAvailableWords] = useState<WordBlock[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [wrongWordId, setWrongWordId] = useState<string | null>(null);

  const wordCount = level.words.length;

  // 初始化关卡
  useEffect(() => {
    if (!level) return;
    const shuffled = [...level.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords(new Array(level.words.length).fill(null));
    setIsCorrect(false);
  }, [level]);

  const handleWordClick = (word: WordBlock) => {
    if (isCorrect) return;

    // 找到下一个空槽位
    const nextIndex = placedWords.findIndex(w => w === null);
    if (nextIndex === -1) return;

    // 检查是否是正确的词
    if (word.id === level.correctOrder[nextIndex]) {
      // 正确
      const newPlaced = [...placedWords];
      newPlaced[nextIndex] = word;
      setPlacedWords(newPlaced);
      setAvailableWords(prev => prev.filter(w => w.id !== word.id));

      // 检查是否完成
      if (newPlaced.every(w => w !== null)) {
        setIsCorrect(true);
      }
    } else {
      // 错误
      setWrongWordId(word.id);
      setTimeout(() => setWrongWordId(null), 500);
    }
  };

  const handleRemoveWord = (index: number) => {
    if (isCorrect) return;

    const word = placedWords[index];
    if (word) {
      const newPlaced = [...placedWords];
      newPlaced[index] = null;
      setPlacedWords(newPlaced);
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleReset = () => {
    const shuffled = [...level.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords(new Array(level.words.length).fill(null));
    setIsCorrect(false);
  };

  const speakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(level.sentence);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const correctCount = placedWords.filter(w => w !== null).length;
  const progress = (correctCount / wordCount) * 100;
  const INITIAL_BLUR = 30;
  const currentBlur = isCorrect ? 0 : INITIAL_BLUR - (correctCount * (INITIAL_BLUR / wordCount));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FFF8F0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <ButtonBase
          onClick={onBack}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>

        {/* Progress Bar */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: is960 ? '0.9rem' : '1rem', fontWeight: 800, color: '#2AA198', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: APP_FONT_FAMILY }}>
              Level {level.id}/{DEMO_LEVELS.length}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.9rem' : '1rem', fontWeight: 800, color: '#2AA198', fontFamily: APP_FONT_FAMILY }}>{Math.round(progress)}%</Typography>
          </Box>
          <Box sx={{ height: 12, bgcolor: 'rgba(45,52,54,0.08)', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(to right, #2AA198, #268BD2)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </Box>
        </Box>

        {/* Controls */}
        <ButtonBase
          onClick={() => setShowPinyin(!showPinyin)}
          sx={{
            width: is960 ? 86 : 96,
            height: 44,
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: is960 ? '0.82rem' : '0.9rem',
            color: showPinyin ? 'white' : '#586E75',
            bgcolor: showPinyin ? '#2AA198' : 'white',
            border: showPinyin ? '2px solid #2AA198' : '2px solid transparent',
            '&:active': { transform: 'scale(0.95)' },
            fontFamily: APP_FONT_FAMILY,
          }}
        >
          {showPinyin ? 'Pinyin' : 'Text'}
        </ButtonBase>

      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: is960 ? 1.5 : 2, display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2, justifyContent: 'center', bgcolor: '#FFF8F0' }}>
        {/* Picture Area */}
        <Box
          sx={{
            position: 'relative',
            width: '92%',
            maxWidth: 960,
            mx: 'auto',
            aspectRatio: '16 / 9',
            minHeight: is960 ? '240px' : '320px',
            bgcolor: 'white',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            border: '6px solid white',
          }}
        >
            <motion.img
            src={level.imageUrl}
            alt="Scene"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            animate={{
              filter: `blur(${currentBlur}px) grayscale(${isCorrect ? 0 : 0.5})`,
              scale: isCorrect ? 1 : 1.1,
              opacity: isCorrect ? 1 : 0.6,
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Success Overlay */}
          {isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: is960 ? 24 : 32,
              }}
            >
              <Box sx={{ color: 'white', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  {showPinyin && (
                    <Typography sx={{ fontSize: is960 ? '0.9rem' : '1.1rem', fontWeight: 700, color: '#2AA198', mb: 0.5 }}>{level.pinyin}</Typography>
                  )}
                  <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, mb: 1.5, lineHeight: 1.2 }}>{level.sentence}</Typography>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', fontWeight: 600, opacity: 0.85, fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.2)', px: 2, py: 0.75, borderRadius: '12px', display: 'inline-block' }}>
                    {level.translation}
                  </Typography>
                </Box>

                <ButtonBase
                  onClick={speakSentence}
                  sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.4)' } }}
                >
                  <VolumeUpIcon sx={{ fontSize: 28 }} />
                </ButtonBase>

                <ButtonBase
                  onClick={onComplete}
                  sx={{
                    px: 4,
                    py: 2.5,
                    borderRadius: '18px',
                    bgcolor: '#2AA198',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: is960 ? '1.1rem' : '1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    boxShadow: '0 8px 24px rgba(42,161,152,0.4)',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  继续 <ArrowForwardIcon sx={{ fontSize: 28 }} />
                </ButtonBase>
              </Box>
            </motion.div>
          )}
        </Box>

        {/* Slots Area */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 1.25, minHeight: is960 ? 96 : 110 }}>
          {placedWords.map((word, i) => (
            <ButtonBase
              key={i}
              onClick={() => handleRemoveWord(i)}
              sx={{
                minWidth: is960 ? 85 : 100,
                height: is960 ? 56 : 64,
                borderRadius: '16px',
                border: word ? '3px solid #2AA198' : '3px dashed rgba(147,161,161,0.3)',
                bgcolor: word ? 'white' : 'rgba(0,0,0,0.04)',
                boxShadow: word ? '0 4px 12px rgba(42,161,152,0.2)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: word ? 'pointer' : 'default',
                '&:active': word ? { transform: 'scale(0.95)' } : {},
              }}
              disabled={!word}
            >
              <AnimatePresence mode="wait">
                {word ? (
                  <motion.div
                    key={word.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    {showPinyin && word.pinyin && (
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,161,152,0.6)', mb: 0.25 }}>{word.pinyin}</Typography>
                    )}
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : '1.75rem', fontWeight: 900, color: '#2AA198' }}>{word.text}</Typography>
                  </motion.div>
                ) : (
                  <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.5rem', fontWeight: 900, color: 'rgba(147,161,161,0.4)' }}>{i + 1}</Typography>
                )}
              </AnimatePresence>
            </ButtonBase>
          ))}
        </Box>

        {/* Available Words Area */}
        <Box sx={{ bgcolor: '#FFF8F0', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', p: is960 ? 2 : 2.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', minHeight: is960 ? 96 : 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: is960 ? 1.25 : 1.5, width: '100%' }}>
            <AnimatePresence>
              {availableWords.map((word) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    wrongWordId === word.id
                      ? { x: [-5, 5, -5, 5, 0], backgroundColor: ['#ffffff', '#ff000022', '#ffffff'] }
                      : { opacity: 1, y: 0 }
                  }
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ButtonBase
                    onClick={() => handleWordClick(word)}
                    sx={{
                      px: is960 ? 2 : 2.5,
                      py: is960 ? 1.5 : 1.75,
                      borderRadius: '16px',
                      bgcolor: 'white',
                      color: '#2AA198',
                      fontWeight: 900,
                      fontSize: is960 ? '1.25rem' : '1.5rem',
                      boxShadow: '0 4px 0 rgba(147,161,161,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: '#2AA198', color: 'white', boxShadow: '0 4px 0 #073642' },
                      '&:active': { transform: 'translateY(4px)', boxShadow: 'none' },
                    }}
                  >
                    {showPinyin && word.pinyin && (
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6, mb: 0.2 }}>{word.pinyin}</Typography>
                    )}
                    <span>{word.text}</span>
                  </ButtonBase>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Page Container
   ═══════════════════════════════════════════════════════════════════════════════ */
type ViewType = 'hub' | 'level-selection' | 'game' | 'gallery';

export default function GrammarPuzzlePage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [view, setView] = useState<ViewType>('hub');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('syntax-snap-completed');
    return saved ? JSON.parse(saved) : [];
  });
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('syntax-snap-points');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('syntax-snap-completed', JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem('syntax-snap-points', points.toString());
  }, [points]);

  const handleLevelComplete = () => {
    if (!currentLevel) return;

    const isNewCompletion = !completedIds.includes(currentLevel.id);
    if (isNewCompletion) {
      setCompletedIds(prev => [...prev, currentLevel.id]);
      setPoints(prev => prev + 100);
    }

    // 自动进入下一关
    const nextLevel = DEMO_LEVELS.find(l => l.id === currentLevel.id + 1);
    if (nextLevel) {
      setCurrentLevel(nextLevel);
    } else {
      // 完成所有关卡，返回关卡选择
      setView('level-selection');
    }
  };

  const handleSelectLevel = (level: Level) => {
    setCurrentLevel(level);
    setView('game');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'hub' && (
        <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <HubView onNavigate={setView} onBack={() => navigate(-1)} completedCount={completedIds.length} points={points} is960={is960} />
        </motion.div>
      )}

      {view === 'level-selection' && (
        <motion.div key="level-selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <LevelSelectionView onBack={() => setView('hub')} onSelectLevel={handleSelectLevel} completedIds={completedIds} is960={is960} />
        </motion.div>
      )}

      {view === 'game' && currentLevel && (
        <motion.div key="game" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} style={{ height: '100%' }}>
          <GameView level={currentLevel} onComplete={handleLevelComplete} onBack={() => setView('level-selection')} is960={is960} />
        </motion.div>
      )}

      {view === 'gallery' && (
        <motion.div key="gallery" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} style={{ height: '100%' }}>
          <GalleryView onBack={() => setView('hub')} completedIds={completedIds} onPlayLevel={handleSelectLevel} is960={is960} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
