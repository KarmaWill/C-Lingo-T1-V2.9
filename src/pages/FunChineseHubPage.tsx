/**
 * Fun Chinese Hub - 螺旋式上升学习系统
 * 基于脚手架理论与螺旋式课程设计
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import LayersIcon from '@mui/icons-material/Layers';
import CheckIcon from '@mui/icons-material/Check';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { uploadFunChineseOfflineData } from '../utils/funChineseOfflineSync';
import { buildHubLessons, loadCompletedLessonIds, type HubLessonStatus } from '../utils/funChineseUnitProgress';
import {
  FUN_CHINESE_UNIT1_PODCAST_STATUS,
  FUN_CHINESE_UNIT1_PODCAST_TAGLINE,
  FUN_CHINESE_UNIT1_PODCAST_TITLE,
} from '../utils/funChineseUnitPodcastCopy';
import {
  FUN_CHINESE_UNIT1_COLLECTION_CARDS,
  groupFunChineseSavedCards,
  loadFunChineseSavedCards,
  removeFunChineseSavedCard,
  type FunChineseCardType,
  type FunChineseSavedCard,
} from '../utils/funChineseCardCollection';

interface ToolboxItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  accent: string;
  gradient: string;
  iconGlow: string;
  badge?: string;
  dotted?: boolean;
}

const googleSansFamily = '"Google Sans","Product Sans","Roboto","Arial",sans-serif';

function OnAirStatusBadge({ is960, label }: { is960: boolean; label: string }) {
  return (
    <Box
      role="status"
      aria-label={label}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: is960 ? 22 : 26,
        minWidth: is960 ? 62 : 70,
        px: is960 ? 1 : 1.15,
        borderRadius: '999px',
        flexShrink: 0,
        bgcolor: '#E53935',
      }}
    >
      <Typography
        sx={{
          fontSize: is960 ? '0.58rem' : '0.66rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          fontFamily: googleSansFamily,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function LessonStatusBadge({
  lesson,
  is960,
  orange,
  teal,
}: {
  lesson: HubLessonStatus;
  is960: boolean;
  orange: string;
  teal: string;
}) {
  const badgeSize = is960 ? 52 : 58;
  const isCurrent = lesson.status === 'current';
  const isCompleted = lesson.status === 'completed';
  const isLocked = lesson.status === 'locked';
  const accent = isCurrent ? orange : isCompleted ? teal : '#94A3B8';

  return (
    <Box
      sx={{
        width: badgeSize,
        height: badgeSize,
        borderRadius: is960 ? '18px' : '20px',
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: isCurrent ? '#FFF7ED' : isCompleted ? '#ECFDF5' : '#F8FAFC',
        border: '1px solid',
        borderColor: isCurrent ? '#FDBA74' : isCompleted ? '#99F6E4' : '#E2E8F0',
        color: accent,
        boxShadow: isCurrent
          ? `0 10px 22px ${orange}28`
          : isCompleted
            ? '0 8px 18px rgba(20,184,166,0.14)'
            : 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: isCurrent
            ? 'linear-gradient(135deg, rgba(255,122,69,0.14), rgba(255,255,255,0))'
            : isCompleted
              ? 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(255,255,255,0))'
              : 'none',
        },
      }}
    >
      {isCompleted ? (
        <CheckIcon sx={{ position: 'relative', fontSize: is960 ? 24 : 26, color: teal }} />
      ) : (
        <>
          <Typography
            sx={{
              position: 'relative',
              fontSize: is960 ? '0.5rem' : '0.54rem',
              fontWeight: 850,
              color: isLocked ? '#94A3B8' : accent,
              letterSpacing: '0.12em',
              lineHeight: 1,
            }}
          >
            LESSON
          </Typography>
          <Typography
            sx={{
              position: 'relative',
              fontSize: is960 ? '1.15rem' : '1.28rem',
              fontWeight: 950,
              color: isLocked ? '#64748B' : '#0F172A',
              lineHeight: 1,
              letterSpacing: '-0.05em',
              fontVariantNumeric: 'tabular-nums',
              mt: 0.28,
            }}
          >
            {String(lesson.id).padStart(2, '0')}
          </Typography>
        </>
      )}
    </Box>
  );
}
export default function FunChineseHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const headerActionSize = is960 ? 44 : 48;

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [lessons, setLessons] = useState<HubLessonStatus[]>(() => buildHubLessons(loadCompletedLessonIds()));
  const [savedCards, setSavedCards] = useState<FunChineseSavedCard[]>([]);
  const [uploading, setUploading] = useState(false);

  const refreshLessons = useCallback(() => {
    setLessons(buildHubLessons(loadCompletedLessonIds()));
  }, []);

  useEffect(() => {
    refreshLessons();
  }, [location.pathname, location.key, refreshLessons]);

  useEffect(() => {
    const onFocus = () => refreshLessons();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshLessons]);

  useEffect(() => {
    if (activeTool !== 'saved') return;
    setSavedCards(loadFunChineseSavedCards());
  }, [activeTool, location.pathname, location.key]);

  const teal = '#14B8A6';
  const orange = '#FF7A45';
  const pageBg = '#FDF6E9';

  const unitComplete = useMemo(() => lessons.every((l) => l.status === 'completed'), [lessons]);

  const tools: ToolboxItem[] = [
    {
      id: 'flashcard',
      title: 'Flashcards',
      iconSrc: '/images/flashcards-toolbox-icon.png',
      accent: '#FF8A4C',
      gradient: 'linear-gradient(90deg, #FFF0E6 0%, #FFFBF7 52%, #FFFFFF 100%)',
      iconGlow: '0 10px 28px rgba(255,138,76,0.38)',
      badge: '20',
    },
    {
      id: 'saved',
      title: 'Card Collection',
      iconSrc: '/images/card-collection-toolbox-icon.png',
      accent: '#4F8EF7',
      gradient: 'linear-gradient(90deg, #EAF2FF 0%, #F5F9FF 52%, #FFFFFF 100%)',
      iconGlow: '0 10px 28px rgba(79,142,247,0.32)',
    },
    {
      id: 'unit_test',
      title: 'Unit Test',
      iconSrc: '/images/unit-test-toolbox-icon.png',
      accent: '#2EC4B6',
      gradient: 'linear-gradient(90deg, #E6FAF7 0%, #F2FDFB 52%, #FFFFFF 100%)',
      iconGlow: '0 10px 28px rgba(46,196,182,0.32)',
    },
    {
      id: 'teacher_guide',
      title: 'Lesson Resources',
      subtitle: "· Teacher's Guide",
      iconSrc: '/images/lesson-resources-toolbox-icon.png',
      accent: '#9B7FEA',
      gradient: 'linear-gradient(90deg, #F3EEFF 0%, #FAF8FF 52%, #FFFFFF 100%)',
      iconGlow: '0 10px 28px rgba(155,127,234,0.32)',
      dotted: true,
    },
  ];

  /** Knowledge Toolbox 与 Unit 1 播客：须本单元三课全部完成（与 `unitComplete` 一致）。 */
  const showUnitGateHint = () => {
    setSnackbar({
      open: true,
      message: `Complete all 3 in this unit to unlock the Knowledge Toolbox and ${FUN_CHINESE_UNIT1_PODCAST_TITLE}.`,
    });
  };

  const handleToolClick = (tool: ToolboxItem) => {
    if (!unitComplete) {
      showUnitGateHint();
      return;
    }
    if (tool.id === 'flashcard') {
      navigate('/lingo-flash?from=fun-chinese');
      return;
    }
    if (tool.id === 'saved') {
      navigate('/library/hub/fun-chinese/card-collection');
      return;
    }
    if (tool.id === 'teacher_guide') {
      navigate('/library/hub/fun-chinese/teacher-guide');
      return;
    }
    setActiveTool(tool.id);
  };

  const handleStartLesson = (lessonId: number, status: string) => {
    if (status === 'locked') return;
    navigate(`/library/hub/fun-chinese/lesson/${lessonId}`);
  };

  const handleIntensiveClick = () => {
    if (!unitComplete) {
      showUnitGateHint();
      return;
    }
    navigate('/library/hub/fun-chinese/intensive');
  };

  const activeToolMeta = tools.find((t) => t.id === activeTool);
  const savedCardIds = useMemo(() => new Set(savedCards.map((card) => card.id)), [savedCards]);
  const collectionCards = savedCards.length > 0 ? savedCards : FUN_CHINESE_UNIT1_COLLECTION_CARDS;
  const collectionSections = useMemo(() => groupFunChineseSavedCards(collectionCards), [collectionCards]);

  const cardTypeMeta: Record<FunChineseCardType, { label: string; color: string }> = {
    grammar: { label: 'Grammar', color: '#3B82F6' },
    pattern: { label: 'Patterns', color: '#14B8A6' },
    dialogue: { label: 'Dialogue', color: '#FF7A45' },
  };

  const handleRemoveSavedCard = (cardId: string) => {
    setSavedCards(removeFunChineseSavedCard(cardId));
  };

  const handleOpenSavedCard = (card: FunChineseSavedCard) => {
    navigate(`/library/hub/fun-chinese/lesson/${card.lessonId}?phase=cards&card=${card.cardIndex}&from=collection`);
    setActiveTool(null);
  };

  const handleStudySavedCards = () => {
    if (collectionCards.length === 0) return;
    const first = collectionCards[0];
    handleOpenSavedCard(first);
  };

  const handleUploadData = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      await uploadFunChineseOfflineData(1);
      setSnackbar({ open: true, message: 'Learning data uploaded. Progress synced for this device.' });
    } catch {
      setSnackbar({ open: true, message: 'Upload failed. Check your connection and try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleFeedback = () => {
    setSnackbar({ open: true, message: 'Thanks! Unit feedback will open here in a later build.' });
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ maxWidth: 'min(92vw, 520px)' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity="info"
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Unit Hero */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: is960 ? 2 : 3,
          mx: is960 ? 2 : 3,
          mt: is960 ? 2 : 3,
          px: is960 ? 2.2 : 3,
          py: is960 ? 1.25 : 1.55,
          flexShrink: 0,
          borderRadius: is960 ? '24px' : '30px',
          color: '#1E293B',
          bgcolor: 'white',
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.25 : 1.5, minWidth: 0, flex: 1 }}>
          <ButtonBase
            onClick={() => navigate('/Home')}
            aria-label="Back to Library home"
            sx={{
              minHeight: is960 ? 44 : 52,
              minWidth: is960 ? 44 : 52,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(15,23,42,0.08)',
              color: '#475569',
              flexShrink: 0,
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
          </ButtonBase>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 1 : 1.35,
              minWidth: 0,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              rowGap: is960 ? 0.65 : 0.75,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.7,
                px: is960 ? 1.25 : 1.45,
                py: is960 ? 0.5 : 0.62,
                borderRadius: '999px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FED7AA',
                flexShrink: 0,
              }}
            >
              <MenuBookIcon sx={{ fontSize: is960 ? 16 : 19, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.84rem', fontWeight: 900, color: '#B45309', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                UNIT 1
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: is960 ? '1.28rem' : '1.55rem',
                color: '#1E293B',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              我和你
            </Typography>
            <Box sx={{ width: '1px', height: is960 ? 18 : 22, bgcolor: '#E2E8F0', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
            <Typography
              sx={{
                fontSize: is960 ? '0.88rem' : '1.02rem',
                fontWeight: 700,
                color: '#94A3B8',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              You and I
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: is960 ? 0.75 : 0.9,
            flexShrink: 0,
            height: is960 ? 48 : 54,
            px: is960 ? 0.6 : 0.75,
            py: 0.5,
            borderRadius: is960 ? '18px' : '22px',
            bgcolor: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(226,232,240,0.88)',
            boxShadow: '0 18px 44px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.88)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Box
            sx={{
              height: is960 ? 38 : 44,
              boxSizing: 'border-box',
              px: is960 ? 1.35 : 1.55,
              bgcolor: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(99,102,241,0.08))',
              borderRadius: is960 ? '14px' : '16px',
              border: '1px solid rgba(20,184,166,0.14)',
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 0.85 : 1,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: is960 ? 68 : 78 }}>
              <Typography sx={{ mb: 0.35, fontWeight: 900, fontSize: is960 ? '0.5rem' : '0.56rem', color: '#0F766E', lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Studied
              </Typography>
              <Typography sx={{ fontWeight: 950, fontSize: is960 ? '0.86rem' : '0.98rem', color: '#0F172A', lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
                24 min
              </Typography>
            </Box>
            <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: '#E2E8F0', my: 0.15 }} />
            <ButtonBase
              onClick={handleUploadData}
              disabled={uploading}
              aria-label="Upload learning data"
              sx={{
                width: is960 ? 34 : 38,
                height: is960 ? 34 : 38,
                minWidth: is960 ? 34 : 38,
                minHeight: is960 ? 34 : 38,
                borderRadius: is960 ? '12px' : '14px',
                color: uploading ? '#94A3B8' : '#0F766E',
                bgcolor: uploading ? '#F1F5F9' : 'rgba(20,184,166,0.13)',
                flexShrink: 0,
                transition: 'all 180ms ease',
                '&:hover': { bgcolor: uploading ? '#F1F5F9' : 'rgba(20,184,166,0.18)' },
                '&:active': { transform: uploading ? 'none' : 'scale(0.94)' },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: is960 ? 18 : 20 }} />
            </ButtonBase>
          </Box>
          <ButtonBase
            onClick={handleFeedback}
            aria-label="Feedback"
            sx={{
              width: is960 ? 38 : 44,
              height: is960 ? 38 : 44,
              minWidth: is960 ? 38 : 44,
              minHeight: is960 ? 38 : 44,
              p: 0,
              boxSizing: 'border-box',
              flexShrink: 0,
              borderRadius: is960 ? '14px' : '16px',
              border: '1.5px solid #FDBA74',
              boxShadow: '0 8px 20px rgba(249,115,22,0.2)',
              overflow: 'hidden',
              transition: 'all 180ms ease',
              '&:hover': {
                boxShadow: '0 10px 24px rgba(249,115,22,0.28)',
                '& .feedback-icon-wrap': {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 55%, #EA580C 100%)',
                },
              },
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <Box
              className="feedback-icon-wrap"
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FDBA74 0%, #F97316 52%, #EA580C 100%)',
                transition: 'background 180ms ease',
              }}
            >
              <RateReviewOutlinedIcon sx={{ fontSize: is960 ? 20 : 23, color: '#FFFFFF' }} />
            </Box>
          </ButtonBase>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          p: is960 ? 2 : 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.65fr 1fr' },
            gap: is960 ? 1.8 : 2.4,
            height: '100%',
            minHeight: 0,
          }}
        >
          {/* Left: Lesson Progress */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.8 : 2.4, minHeight: 0 }}>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                bgcolor: 'white',
                borderRadius: is960 ? '24px' : '30px',
                p: is960 ? 2 : 2.5,
                boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
                border: '1px solid rgba(15,23,42,0.06)',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: is960 ? 1.4 : 1.8 }}>
                <Typography sx={{ fontSize: is960 ? '1.12rem' : '1.35rem', color: '#0F172A', fontWeight: 900, letterSpacing: '-0.03em' }}>
                  Lessons
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.35 : 0.45 }}>
                  {lessons.map((lesson) => {
                    const completed = lesson.status === 'completed';
                    return (
                      <Box
                        key={lesson.id}
                        component="img"
                        src="/images/lesson-trophy-icon.png"
                        alt={completed ? `Lesson ${lesson.id} completed` : `Lesson ${lesson.id} not completed`}
                        sx={{
                          width: is960 ? 22 : 26,
                          height: is960 ? 22 : 26,
                          objectFit: 'contain',
                          flexShrink: 0,
                          opacity: completed ? 1 : 0.38,
                          filter: completed
                            ? 'drop-shadow(0 1px 2px rgba(245,158,11,0.35))'
                            : 'grayscale(1) saturate(0)',
                          transition: 'opacity 0.2s ease, filter 0.2s ease',
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.2 : 1.45 }}>
                {lessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    onClick={() => handleStartLesson(lesson.id, lesson.status)}
                    sx={{
                      p: is960 ? 1.35 : 1.65,
                      borderRadius: is960 ? '20px' : '24px',
                      border: '1.5px solid',
                      borderColor:
                        lesson.status === 'current'
                          ? '#FDBA74'
                          : lesson.status === 'completed'
                            ? '#CCFBF1'
                            : '#E2E8F0',
                      background:
                        lesson.status === 'current'
                          ? 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 72%)'
                          : lesson.status === 'completed'
                            ? 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 74%)'
                            : '#F8FAFC',
                      boxShadow:
                        lesson.status === 'current'
                          ? `0 12px 28px ${orange}1F`
                          : lesson.status === 'completed'
                            ? '0 8px 20px rgba(20,184,166,0.1)'
                            : '0 2px 8px rgba(15,23,42,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: is960 ? 1.2 : 1.45,
                      cursor: lesson.status === 'locked' ? 'not-allowed' : 'pointer',
                      opacity: lesson.status === 'locked' ? 0.62 : 1,
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      '&:hover': lesson.status !== 'locked' ? { transform: 'translateX(3px)', boxShadow: `0 14px 30px ${orange}22` } : {},
                    }}
                  >
                    <LessonStatusBadge
                      lesson={lesson}
                      is960={is960}
                      orange={orange}
                      teal={teal}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: is960 ? '1rem' : '1.16rem',
                          color: '#0F172A',
                          lineHeight: 1.15,
                          letterSpacing: '-0.02em',
                          mb: 0.45,
                        }}
                      >
                        {lesson.title}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#64748B', fontWeight: 650, lineHeight: 1.35 }}>
                        {lesson.titleEn}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        flexShrink: 0,
                      }}
                    >
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartLesson(lesson.id, lesson.status);
                        }}
                        disabled={lesson.status === 'locked'}
                        aria-label={
                          lesson.status === 'completed'
                            ? `Review lesson ${lesson.id}`
                            : lesson.status === 'current'
                              ? `Start lesson ${lesson.id}`
                              : `Lesson ${lesson.id} locked`
                        }
                        sx={{
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: is960 ? 38 : 44,
                          height: is960 ? 38 : 44,
                          minWidth: is960 ? 38 : 44,
                          borderRadius: '50%',
                          bgcolor:
                            lesson.status === 'completed'
                              ? 'rgba(20,184,166,0.12)'
                              : lesson.status === 'current'
                                ? orange
                                : '#E2E8F0',
                          color:
                            lesson.status === 'completed'
                              ? '#0F766E'
                              : lesson.status === 'current'
                                ? 'white'
                                : '#64748B',
                          boxShadow:
                            lesson.status === 'current'
                              ? `0 8px 18px ${orange}42`
                              : lesson.status === 'completed'
                                ? '0 4px 12px rgba(20,184,166,0.16)'
                                : 'none',
                          '&:hover': {
                            bgcolor:
                              lesson.status === 'completed'
                                ? 'rgba(20,184,166,0.18)'
                                : lesson.status === 'current'
                                  ? '#FF6B3D'
                                  : '#E2E8F0',
                          },
                        }}
                      >
                        {lesson.status === 'completed' ? (
                          <ReplayIcon sx={{ fontSize: is960 ? 19 : 21 }} />
                        ) : lesson.status === 'current' ? (
                          <PlayArrowIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                        ) : (
                          <LockIcon sx={{ fontSize: is960 ? 18 : 20 }} />
                        )}
                      </ButtonBase>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* AI Podcast banner */}
            <ButtonBase
              onClick={handleIntensiveClick}
              disabled={!unitComplete}
              sx={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                borderRadius: is960 ? '22px' : '26px',
                overflow: 'hidden',
                position: 'relative',
                minHeight: is960 ? 118 : 131,
                flexShrink: 0,
                cursor: unitComplete ? 'pointer' : 'default',
                bgcolor: '#4A76FD',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                boxShadow: '0 8px 28px rgba(74,118,253,0.22)',
                '&:hover': unitComplete
                  ? {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 12px 32px rgba(74,118,253,0.28)',
                    }
                  : {},
                '&:active': unitComplete ? { transform: 'translateY(0)' } : {},
              }}
            >
              {!unitComplete && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 4,
                    bgcolor: 'rgba(15, 23, 42, 0.58)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.25,
                    px: 3,
                    textAlign: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 34, color: 'rgba(255,255,255,0.9)' }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '0.86rem' : '0.94rem',
                      color: 'rgba(255,255,255,0.94)',
                      maxWidth: 300,
                      fontFamily: googleSansFamily,
                    }}
                  >
                    Complete all 3 to unlock the AI podcast
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: is960 ? 118 : 131,
                  px: is960 ? 2.4 : 3,
                  py: is960 ? 2 : 2.4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: is960 ? 1 : 1.25 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '1.35rem' : '1.55rem',
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      color: '#FFFFFF',
                      fontFamily: googleSansFamily,
                    }}
                  >
                    {FUN_CHINESE_UNIT1_PODCAST_TITLE}
                  </Typography>
                  <OnAirStatusBadge is960={is960} label={FUN_CHINESE_UNIT1_PODCAST_STATUS} />
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    mt: is960 ? 0.85 : 1,
                    alignSelf: 'flex-start',
                    maxWidth: '100%',
                    bgcolor: '#FFFFFF',
                    borderRadius: is960 ? '14px' : '16px',
                    px: is960 ? 1.35 : 1.55,
                    py: is960 ? 0.65 : 0.75,
                    boxShadow: '0 4px 14px rgba(15,23,42,0.12)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: is960 ? -5 : -6,
                      left: is960 ? 18 : 22,
                      width: is960 ? 10 : 12,
                      height: is960 ? 10 : 12,
                      bgcolor: '#FFFFFF',
                      transform: 'rotate(45deg)',
                      boxShadow: '-2px -2px 4px rgba(15,23,42,0.04)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: is960 ? '0.84rem' : '0.94rem',
                      fontWeight: 700,
                      color: '#4A76FD',
                      fontFamily: googleSansFamily,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.35,
                    }}
                  >
                    {FUN_CHINESE_UNIT1_PODCAST_TAGLINE}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    left: is960 ? 22 : 26,
                    bottom: is960 ? 14 : 16,
                    width: is960 ? 18 : 22,
                    height: is960 ? 18 : 22,
                    borderLeft: '2px solid rgba(255,255,255,0.55)',
                    borderBottom: '2px solid rgba(255,255,255,0.55)',
                    borderBottomLeftRadius: '2px',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </ButtonBase>
          </Box>

          {/* Right: Knowledge Toolbox */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: is960 ? '24px' : '30px',
              border: '1px solid rgba(0,0,0,0.05)',
              p: is960 ? 2.25 : 2.75,
              boxShadow: '0 8px 28px rgba(15,23,42,0.06)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%',
            }}
          >
            <Box sx={{ mb: is960 ? 1.75 : 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: is960 ? '1.05rem' : '1.22rem',
                      fontWeight: 900,
                      color: '#1E293B',
                      letterSpacing: '-0.02em',
                      fontFamily: googleSansFamily,
                      lineHeight: 1.2,
                    }}
                  >
                    C-Toolbox
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.75,
                      width: is960 ? 26 : 32,
                      height: is960 ? 3 : 4,
                      borderRadius: '999px',
                      bgcolor: teal,
                    }}
                  />
                </Box>
                {!unitComplete && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.65,
                      px: is960 ? 1 : 1.15,
                      py: is960 ? 0.45 : 0.55,
                      borderRadius: '999px',
                      bgcolor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      flexShrink: 0,
                    }}
                  >
                    <LockIcon sx={{ fontSize: is960 ? 13 : 15 }} />
                    <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.66rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Finish All 3
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: is960 ? 1.15 : 1.35, minHeight: 0 }}>
              {tools.map((tool) => {
                const unlocked = unitComplete;
                const isFeatured = tool.id === 'teacher_guide';
                const isCustomIcon = Boolean(tool.iconSrc);
                const iconSize = isCustomIcon
                  ? (isFeatured ? (is960 ? 68 : 78) : (is960 ? 58 : 68))
                  : (isFeatured ? (is960 ? 62 : 72) : (is960 ? 50 : 58));
                return (
                  <ButtonBase
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    sx={{
                      p: isFeatured ? (is960 ? 1.75 : 2.1) : (is960 ? 1.35 : 1.6),
                      pl: isFeatured ? (is960 ? 1.5 : 1.75) : (is960 ? 1.25 : 1.45),
                      pr: isFeatured ? (is960 ? 1.35 : 1.6) : (is960 ? 1.15 : 1.35),
                      borderRadius: isFeatured ? (is960 ? '20px' : '24px') : (is960 ? '18px' : '22px'),
                      background: unlocked ? tool.gradient : 'linear-gradient(90deg, #F1F5F9 0%, #F8FAFC 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCustomIcon
                        ? (is960 ? 1.65 : 2)
                        : isFeatured
                          ? (is960 ? 1.35 : 1.6)
                          : (is960 ? 1.15 : 1.35),
                      textAlign: 'left',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      opacity: unlocked ? 1 : 0.72,
                      position: 'relative',
                      overflow: tool.dotted ? 'hidden' : 'visible',
                      flex: isFeatured ? 1 : '0 0 auto',
                      minHeight: isFeatured ? (is960 ? 112 : 132) : (is960 ? 68 : 78),
                      alignSelf: 'stretch',
                      '&:hover': unlocked
                        ? {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
                          }
                        : {},
                      '&:active': unlocked ? { transform: 'scale(0.985)' } : {},
                      ...(tool.dotted && unlocked
                        ? {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)',
                              backgroundSize: '10px 10px',
                              opacity: 0.45,
                              pointerEvents: 'none',
                            },
                          }
                        : {}),
                    }}
                  >
                    <Box
                      sx={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: tool.iconSrc ? 0 : isFeatured ? (is960 ? '16px' : '18px') : (is960 ? '14px' : '16px'),
                        bgcolor: tool.iconSrc ? 'transparent' : 'rgba(255,255,255,0.92)',
                        color: unlocked ? tool.accent : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: tool.iconSrc ? 'none' : unlocked ? tool.iconGlow : '0 2px 8px rgba(15,23,42,0.06)',
                        position: 'relative',
                        zIndex: 1,
                        overflow: tool.iconSrc ? 'visible' : 'hidden',
                        '& .MuiSvgIcon-root': {
                          fontSize: isFeatured ? (is960 ? 32 : 36) : (is960 ? 26 : 30),
                        },
                      }}
                    >
                      {tool.iconSrc ? (
                        <Box
                          component="img"
                          src={tool.iconSrc}
                          alt=""
                          sx={{
                            width: isCustomIcon
                              ? (is960 ? '132%' : '138%')
                              : isFeatured
                                ? (is960 ? '112%' : '115%')
                                : (is960 ? '108%' : '110%'),
                            height: isCustomIcon
                              ? (is960 ? '132%' : '138%')
                              : isFeatured
                                ? (is960 ? '112%' : '115%')
                                : (is960 ? '108%' : '110%'),
                            objectFit: 'contain',
                            display: 'block',
                            opacity: unlocked ? 1 : 0.55,
                            filter: unlocked ? 'none' : 'grayscale(0.35)',
                          }}
                        />
                      ) : (
                        tool.icon
                      )}
                      {tool.badge && (
                        <Box
                          aria-label={`${tool.badge} cards to review`}
                          sx={{
                            position: 'absolute',
                            top: is960 ? -10 : -12,
                            right: is960 ? -18 : -20,
                            minWidth: is960 ? 42 : 48,
                            height: is960 ? 26 : 30,
                            px: is960 ? 0.9 : 1.05,
                            borderRadius: '999px',
                            bgcolor: '#F94B4B',
                            color: 'white',
                            border: '2.5px solid white',
                            boxShadow: '0 6px 14px rgba(249,75,75,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: is960 ? '0.82rem' : '0.92rem',
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: '-0.03em',
                            fontFamily: googleSansFamily,
                          }}
                        >
                          {tool.badge}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0, zIndex: 1, pl: isCustomIcon ? (is960 ? 0.35 : 0.5) : 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: isFeatured ? (is960 ? '1.05rem' : '1.2rem') : (is960 ? '0.92rem' : '1.05rem'),
                          color: unlocked ? tool.accent : '#94A3B8',
                          lineHeight: 1.2,
                          fontFamily: googleSansFamily,
                        }}
                      >
                        {tool.title}
                      </Typography>
                      {tool.subtitle && (
                        <Typography
                          sx={{
                            fontSize: isFeatured ? (is960 ? '0.82rem' : '0.9rem') : (is960 ? '0.72rem' : '0.78rem'),
                            color: unlocked ? '#94A3B8' : '#CBD5E1',
                            fontWeight: 600,
                            mt: isFeatured ? 0.45 : 0.25,
                            fontFamily: googleSansFamily,
                          }}
                        >
                          {tool.subtitle}
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        width: isFeatured ? (is960 ? 34 : 38) : (is960 ? 28 : 32),
                        height: isFeatured ? (is960 ? 34 : 38) : (is960 ? 28 : 32),
                        borderRadius: '50%',
                        bgcolor: unlocked ? tool.accent : '#CBD5E1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: unlocked ? `0 6px 16px ${tool.accent}40` : 'none',
                        zIndex: 1,
                      }}
                    >
                      <ChevronRightIcon sx={{ fontSize: isFeatured ? (is960 ? 20 : 22) : (is960 ? 18 : 20) }} />
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tool Overlay */}
      {activeTool && activeToolMeta && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: is960 ? 3 : 4,
            zIndex: 50,
          }}
          onClick={() => setActiveTool(null)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: 'white',
              width: '100%',
              maxWidth: is960 ? 760 : 980,
              maxHeight: '92%',
              borderRadius: is960 ? '28px' : '36px',
              boxShadow: '0 24px 56px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: is960 ? 2 : 2.5,
                borderBottom: '1px solid #F1F5F9',
                bgcolor: activeTool === 'saved' ? '#FFFFFF' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: is960 ? 40 : 44,
                    height: is960 ? 40 : 44,
                    borderRadius: is960 ? '12px' : '14px',
                    bgcolor: activeToolMeta.accent,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeToolMeta.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.22rem', color: '#1E293B', lineHeight: 1.15 }}>
                    {activeToolMeta.title}
                  </Typography>
                  {activeTool === 'saved' && (
                    <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.76rem', color: '#94A3B8', fontWeight: 700, mt: 0.35 }}>
                      Browse knowledge cards by type
                    </Typography>
                  )}
                </Box>
              </Box>
              <ButtonBase
                onClick={() => setActiveTool(null)}
                sx={{
                  width: is960 ? 36 : 40,
                  height: is960 ? 36 : 40,
                  borderRadius: '50%',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                }}
              >
                <CloseIcon sx={{ fontSize: is960 ? 22 : 24, color: '#94A3B8' }} />
              </ButtonBase>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: activeTool === 'saved' ? 0 : is960 ? 3 : 4,
                bgcolor: activeTool === 'saved' ? '#F8F9FA' : 'transparent',
              }}
            >
              {activeTool === 'saved' && (
                <Box sx={{ px: is960 ? 3 : 4, py: is960 ? 2.5 : 3.5 }}>
                  <Box
                    sx={{
                      mb: is960 ? 3 : 4,
                      p: is960 ? 2.4 : 3,
                      borderRadius: is960 ? '24px' : '30px',
                      bgcolor: '#0F172A',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -60,
                        right: -40,
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        bgcolor: 'rgba(59,130,246,0.32)',
                        filter: 'blur(36px)',
                      }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
                      <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', fontWeight: 900, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.62)', mb: 0.8 }}>
                        KNOWLEDGE CARD LIBRARY
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.7rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Review grammar, patterns, and dialogues in one place.
                      </Typography>
                      <Typography sx={{ mt: 1, fontSize: is960 ? '0.78rem' : '0.9rem', color: 'rgba(255,255,255,0.68)', fontWeight: 650 }}>
                        {savedCards.length > 0 ? `${savedCards.length} saved cards in your collection.` : 'Start browsing. Save cards inside lessons to build your personal set.'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 3 : 4 }}>
                    {collectionSections.map((section) => (
                      <Box key={section.type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: is960 ? 1.4 : 1.8 }}>
                          <Box sx={{ width: 6, height: 34, borderRadius: '999px', bgcolor: cardTypeMeta[section.type].color }} />
                          <Typography
                            sx={{
                              fontSize: is960 ? '1.05rem' : '1.22rem',
                              fontWeight: 900,
                              letterSpacing: '-0.03em',
                              color: '#111827',
                            }}
                          >
                            {cardTypeMeta[section.type].label} Cards
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: is960 ? 1.6 : 2,
                            overflowX: 'auto',
                            pb: 1,
                            mx: -0.5,
                            px: 0.5,
                            '&::-webkit-scrollbar': { height: 6 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 999 },
                          }}
                        >
                          {section.cards.map((card) => (
                            <ButtonBase
                              key={card.id}
                              onClick={() => handleOpenSavedCard(card)}
                              sx={{
                                width: is960 ? 260 : 310,
                                minWidth: is960 ? 260 : 310,
                                minHeight: is960 ? 164 : 196,
                                border: '1px solid rgba(0,0,0,0.04)',
                                borderRadius: is960 ? '22px' : '28px',
                                p: is960 ? 2 : 2.4,
                                bgcolor: '#FFFFFF',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                                textAlign: 'left',
                                boxShadow: '0 8px 30px rgba(15,23,42,0.05)',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                                '&:hover': {
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 18px 42px ${cardTypeMeta[section.type].color}18`,
                                },
                                '&:active': { transform: 'scale(0.99)' },
                              }}
                            >
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: is960 ? 1.6 : 2 }}>
                                  <Box
                                    sx={{
                                      px: 1.2,
                                      py: 0.45,
                                      borderRadius: '999px',
                                      bgcolor: `${cardTypeMeta[section.type].color}12`,
                                      color: cardTypeMeta[section.type].color,
                                      fontSize: is960 ? '0.62rem' : '0.68rem',
                                      fontWeight: 900,
                                    }}
                                  >
                                    Lesson {card.lessonId}
                                  </Box>
                                  {savedCardIds.has(card.id) && (
                                    <Box sx={{ px: 1, py: 0.45, borderRadius: '999px', bgcolor: '#FEF3C7', color: '#D97706', fontSize: is960 ? '0.62rem' : '0.68rem', fontWeight: 900 }}>
                                      Saved
                                    </Box>
                                  )}
                                </Box>
                                <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.38rem', color: '#111827', fontWeight: 900, mb: 0.45, lineHeight: 1.08, letterSpacing: '-0.04em' }}>
                                  {card.cardTitle}
                                </Typography>
                                <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.84rem', color: '#9CA3AF', fontWeight: 700, mb: is960 ? 1.2 : 1.5 }}>
                                  {card.cardSubtitle}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: is960 ? '0.82rem' : '0.92rem',
                                    color: '#4B5563',
                                    fontWeight: 650,
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {card.preview}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: is960 ? 1.8 : 2.4, pt: is960 ? 1.2 : 1.5, borderTop: '1px solid #F3F4F6' }}>
                                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.76rem', color: cardTypeMeta[section.type].color, fontWeight: 900, letterSpacing: '0.12em' }}>
                                  ENTER CARD
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.7 }}>
                                  {savedCardIds.has(card.id) && (
                                    <ButtonBase
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSavedCard(card.id);
                                      }}
                                      sx={{
                                        width: is960 ? 32 : 36,
                                        height: is960 ? 32 : 36,
                                        borderRadius: '50%',
                                        color: '#94A3B8',
                                        '&:hover': { bgcolor: '#F1F5F9', color: '#64748B' },
                                      }}
                                    >
                                      <DeleteOutlineIcon sx={{ fontSize: is960 ? 16 : 18 }} />
                                    </ButtonBase>
                                  )}
                                <ButtonBase
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSavedCard(card);
                                  }}
                                  sx={{
                                    width: is960 ? 34 : 38,
                                    height: is960 ? 34 : 38,
                                    borderRadius: '50%',
                                    bgcolor: `${cardTypeMeta[card.cardType].color}18`,
                                    color: cardTypeMeta[card.cardType].color,
                                    '&:hover': { bgcolor: `${cardTypeMeta[card.cardType].color}24` },
                                  }}
                                >
                                  <PlayArrowIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                                </ButtonBase>
                                </Box>
                              </Box>
                            </ButtonBase>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {activeTool === 'unit_test' && (
                <Box>
                  <Box
                    sx={{
                      p: is960 ? 2.5 : 3,
                      bgcolor: `${teal}10`,
                      borderRadius: is960 ? '18px' : '22px',
                      border: `1px solid ${teal}35`,
                      mb: is960 ? 2 : 3,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.02rem', color: '#0F766E', mb: 1 }}>
                      Unit Test (preview)
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.84rem' : '0.9rem', color: '#475569', fontWeight: 600 }}>
                      A short mixed drill will land here (about 10 items). For now this is a placeholder after you finish all lessons in this unit.
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.88rem', color: '#64748B', fontWeight: 600 }}>
                    Wire to your exercise engine when ready.
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                p: is960 ? 2.5 : 3,
                bgcolor: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {(activeTool === 'saved' || activeTool === 'unit_test') && (
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <ButtonBase
                    onClick={() => setActiveTool(null)}
                    sx={{
                      px: is960 ? 3.2 : 4.2,
                      py: is960 ? 1.25 : 1.5,
                      bgcolor: '#E2E8F0',
                      color: '#1E293B',
                      borderRadius: is960 ? '16px' : '20px',
                      fontSize: is960 ? '0.95rem' : '1.08rem',
                      fontWeight: 800,
                      '&:hover': { bgcolor: '#CBD5E1' },
                    }}
                  >
                    Close
                  </ButtonBase>
                  {activeTool === 'saved' && (
                    <ButtonBase
                      onClick={handleStudySavedCards}
                      disabled={savedCards.length === 0}
                      sx={{
                        px: is960 ? 3.2 : 4.2,
                        py: is960 ? 1.25 : 1.5,
                        bgcolor: '#3B82F6',
                        color: 'white',
                        borderRadius: is960 ? '16px' : '20px',
                        fontSize: is960 ? '0.95rem' : '1.08rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        '&:hover': { bgcolor: '#2563EB' },
                      }}
                    >
                      <LayersIcon sx={{ fontSize: is960 ? 18 : 20 }} />
                      {savedCards.length === 0 ? 'Start browsing' : 'Study saved'}
                    </ButtonBase>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
