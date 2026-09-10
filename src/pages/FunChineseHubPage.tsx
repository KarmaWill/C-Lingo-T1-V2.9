/**
 * Fun Chinese Hub - 螺旋式上升学习系统
 * 基于脚手架理论与螺旋式课程设计
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import LayersIcon from '@mui/icons-material/Layers';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';
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
import {
  listLessonPeriods,
  loadCompletedPeriods,
} from '../utils/lessonPackageLoader';
import { APP_FONT_FAMILY } from '../theme/appFont';

interface ToolboxItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconSrc?: string;
  accent: string;
  gradient: string;
  iconGlow: string;
  badge?: string;
  dotted?: boolean;
}

const googleSansFamily = APP_FONT_FAMILY
const PAGE_BG = '#F8F9F8'
const TEAL = '#00B4A0'
const CHECK_TEAL = '#10B7A4'

function LessonStatusTile({
  lesson,
  size,
}: {
  lesson: HubLessonStatus
  size: number
}) {
  const isCompleted = lesson.status === 'completed'
  const isCurrent = lesson.status === 'current'
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${Math.round(size * 20 / 78)}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isCompleted || isCurrent ? '#E4FAF5' : '#F3F4F6',
        border: '1.2px solid',
        borderColor: isCompleted || isCurrent ? '#A8F1E4' : '#E7ECEB',
        color: isCompleted || isCurrent ? CHECK_TEAL : '#94A3B8',
      }}
    >
      {isCompleted ? (
        <CheckIcon sx={{ fontSize: size * 0.42, color: CHECK_TEAL }} />
      ) : isCurrent ? (
        <PlayArrowIcon sx={{ fontSize: size * 0.42, color: TEAL }} />
      ) : (
        <LockIcon sx={{ fontSize: size * 0.36, color: '#94A3B8' }} />
      )}
    </Box>
  )
}
export default function FunChineseHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openFeedback } = useFeedback();
  const screenSize = APP_SCREEN_SIZE;
  const is960 = screenSize === '960x540';
  const p = (n: number) => figmaPx(n, screenSize);

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

  const teal = TEAL;

  const unitComplete = useMemo(() => lessons.every((l) => l.status === 'completed'), [lessons]);

  const tools: ToolboxItem[] = [
    {
      id: 'flashcard',
      title: 'Flashcards',
      iconSrc: '/images/flashcards-toolbox-icon.png',
      accent: '#FF6B35',
      gradient: 'linear-gradient(90deg, #FFF3EE 0%, #FFF7F4 100%)',
      iconGlow: '0 10px 28px rgba(255,107,53,0.28)',
      badge: '20',
    },
    {
      id: 'saved',
      title: 'Card Collection',
      iconSrc: '/images/card-collection-toolbox-icon.png',
      accent: '#2188FE',
      gradient: 'linear-gradient(90deg, #F0F6FF 0%, #FBFFFF 100%)',
      iconGlow: '0 10px 28px rgba(33,136,254,0.28)',
    },
    {
      id: 'unit_test',
      title: 'Unit Test',
      subtitle: 'Mixed drill',
      iconSrc: '/images/unit-test-toolbox-icon.png',
      accent: TEAL,
      gradient: 'linear-gradient(90deg, #EAFBF7 0%, #F4FFFC 100%)',
      iconGlow: '0 10px 28px rgba(0,180,160,0.24)',
    },
    {
      id: 'teacher_guide',
      title: 'Lesson Resources',
      subtitle: "Teacher's Guide",
      iconSrc: '/images/lesson-resources-toolbox-icon.png',
      accent: '#6359E8',
      gradient: 'linear-gradient(90deg, #F3F1FF 0%, #F8F6FF 100%)',
      iconGlow: '0 10px 28px rgba(99,89,232,0.24)',
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

  const handleStartPeriod = (lessonId: number, period: number, status: string) => {
    if (status === 'locked') return;
    navigate(`/library/hub/fun-chinese/lesson/${lessonId}?period=${period}`);
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

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: PAGE_BG,
        fontFamily: FIGMA_FONT,
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

      {/* Figma 课程学习列表1 · 1920 quiet learning shell */}
      <Box
        sx={{
          height: p(160),
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid rgba(224, 224, 223, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: `${p(60)}px`,
          gap: `${p(24)}px`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(32)}px`, minWidth: 0 }}>
          <ButtonBase
            onClick={() => navigate('/Home')}
            aria-label="Back to Library home"
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: p(40),
                lineHeight: `${p(64)}px`,
                color: '#2D3436',
                fontFamily: FIGMA_FONT,
                whiteSpace: 'nowrap',
              }}
            >
              我和你
            </Typography>
            <Box sx={{ width: '1px', height: p(40), bgcolor: '#EEF1F3', flexShrink: 0 }} />
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: p(34),
                lineHeight: `${p(54)}px`,
                color: '#636E72',
                fontFamily: FIGMA_FONT,
                whiteSpace: 'nowrap',
              }}
            >
              You and I
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(32)}px`, flexShrink: 0 }}>
          <Box
            sx={{
              width: p(241),
              height: p(76),
              borderRadius: `${p(30)}px`,
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(224, 224, 223, 0.82)',
              display: 'flex',
              alignItems: 'center',
              px: `${p(20)}px`,
              gap: `${p(14)}px`,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: p(22),
                  lineHeight: `${p(32)}px`,
                  color: '#2D3436',
                  fontFamily: FIGMA_FONT,
                  whiteSpace: 'nowrap',
                }}
              >
                24 min
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: p(40), bgcolor: '#EEF1F3', flexShrink: 0 }} />
            <ButtonBase
              onClick={handleUploadData}
              disabled={uploading}
              aria-label="Upload learning data"
              sx={{
                width: p(60),
                height: p(60),
                minWidth: p(60),
                borderRadius: `${p(18)}px`,
                bgcolor: '#EAFBF7',
                border: '1px solid rgba(0, 180, 160, 0.27)',
                color: uploading ? '#94A3B8' : TEAL,
                flexShrink: 0,
                '&:active': { transform: uploading ? 'none' : 'scale(0.94)' },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: p(32) }} />
            </ButtonBase>
          </Box>
          <ButtonBase
            onClick={() => openFeedback({ screen: 'fun_chinese_hub' })}
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
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: `${p(64)}px`,
          pt: `${p(24)}px`,
          pb: `${p(20)}px`,
          display: 'grid',
          gridTemplateColumns: `minmax(0, ${p(1126)}fr) minmax(0, ${p(635)}fr)`,
          gap: `${p(32)}px`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(18)}px` }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid #E7ECEB',
              borderRadius: `${p(32)}px`,
              px: `${p(41)}px`,
              pt: `${p(28)}px`,
              pb: `${p(28)}px`,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${p(24)}px` }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: p(40),
                  lineHeight: `${p(64)}px`,
                  letterSpacing: '0.06em',
                  color: '#2D3436',
                  fontFamily: FIGMA_FONT,
                }}
              >
                Lessons
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(8)}px` }}>
                {lessons.map((lesson) => {
                  const completed = lesson.status === 'completed'
                  return (
                    <Box
                      key={lesson.id}
                      component="img"
                      src="/images/lesson-trophy-icon.png"
                      alt={completed ? `Lesson ${lesson.id} completed` : `Lesson ${lesson.id} not completed`}
                      sx={{
                        width: p(50),
                        height: p(50),
                        objectFit: 'contain',
                        opacity: completed ? 1 : 0.28,
                        filter: completed ? 'none' : 'grayscale(1)',
                      }}
                    />
                  )
                })}
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(24)}px` }}>
              {lessons.map((lesson) => {
                const lessonPeriods = listLessonPeriods(1, lesson.id)
                const completedPeriods = loadCompletedPeriods(1, lesson.id)
                const hasPeriods = lessonPeriods.length > 0
                const isLocked = lesson.status === 'locked'
                return (
                  <Box
                    key={lesson.id}
                    onClick={() => {
                      if (isLocked || hasPeriods) return
                      handleStartLesson(lesson.id, lesson.status)
                    }}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      px: `${p(28)}px`,
                      borderRadius: `${p(18)}px`,
                      bgcolor: isLocked ? '#F8FAFC' : '#FAFFFD',
                      border: '1.35px solid',
                      borderColor: isLocked ? '#E7ECEB' : '#B7F4E8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(34)}px`,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.7 : 1,
                      boxSizing: 'border-box',
                    }}
                  >
                    <LessonStatusTile lesson={lesson} size={p(78)} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: p(32),
                          lineHeight: `${p(46)}px`,
                          color: '#2D3436',
                          fontFamily: FIGMA_FONT,
                        }}
                      >
                        {lesson.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          fontSize: p(28),
                          lineHeight: `${p(35)}px`,
                          color: '#636E72',
                          fontFamily: FIGMA_FONT,
                        }}
                      >
                        {lesson.titleEn}
                      </Typography>
                      {hasPeriods && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${p(8)}px`, mt: `${p(8)}px` }}>
                          {lessonPeriods.map((period) => {
                            const periodDone = completedPeriods.has(period.period)
                            return (
                              <ButtonBase
                                key={period.period}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartPeriod(lesson.id, period.period, lesson.status)
                                }}
                                disabled={isLocked}
                                aria-label={`Start period ${period.period}: ${period.titleEn || period.title}`}
                                sx={{
                                  px: `${p(14)}px`,
                                  height: p(36),
                                  borderRadius: '999px',
                                  border: '1px solid',
                                  borderColor: periodDone ? '#A8F1E4' : '#E7ECEB',
                                  bgcolor: periodDone ? '#E4FAF5' : '#FFFFFF',
                                  minHeight: p(36),
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: p(16),
                                    fontWeight: 700,
                                    color: periodDone ? TEAL : '#636E72',
                                    fontFamily: FIGMA_FONT,
                                    lineHeight: 1,
                                  }}
                                >
                                  P{period.period} · {period.titleEn || period.title}
                                </Typography>
                              </ButtonBase>
                            )
                          })}
                        </Box>
                      )}
                    </Box>
                    {!hasPeriods && (
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartLesson(lesson.id, lesson.status)
                        }}
                        disabled={isLocked}
                        aria-label={
                          lesson.status === 'completed'
                            ? `Review lesson ${lesson.id}`
                            : lesson.status === 'current'
                              ? `Start lesson ${lesson.id}`
                              : `Lesson ${lesson.id} locked`
                        }
                        sx={{
                          width: p(60),
                          height: p(60),
                          minWidth: p(60),
                          borderRadius: '50%',
                          bgcolor: isLocked ? '#E7ECEB' : '#E4FAF5',
                          color: isLocked ? '#94A3B8' : TEAL,
                          flexShrink: 0,
                        }}
                      >
                        {lesson.status === 'completed' ? (
                          <ReplayIcon sx={{ fontSize: p(36) }} />
                        ) : lesson.status === 'current' ? (
                          <PlayArrowIcon sx={{ fontSize: p(36) }} />
                        ) : (
                          <LockIcon sx={{ fontSize: p(28) }} />
                        )}
                      </ButtonBase>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Box>

          <ButtonBase
            onClick={handleIntensiveClick}
            disabled={!unitComplete}
            sx={{
              width: '100%',
              flexShrink: 0,
              aspectRatio: '1126 / 311',
              borderRadius: `${p(54)}px`,
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              border: '1px solid #E7ECEB',
              display: 'block',
              textAlign: 'left',
              position: 'relative',
              cursor: unitComplete ? 'pointer' : 'default',
            }}
          >
            {/* 红签在紫卡下面：白壳缺口托住，紫卡圆角压住签的下沿 */}
            <Box
              sx={{
                position: 'absolute',
                left: '3.55%',
                top: '6.11%',
                width: '20.6%',
                height: '26.05%',
                bgcolor: '#F34D47',
                borderRadius: `${p(10)}px ${p(10)}px 0 0`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: p(22),
                  lineHeight: 1.2,
                  color: '#FFFFFF',
                  fontFamily: FIGMA_FONT,
                  letterSpacing: '0.06em',
                }}
              >
                {FUN_CHINESE_UNIT1_PODCAST_STATUS}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                left: '3.55%',
                top: '19.94%',
                width: '93.0%',
                height: '74.6%',
                borderRadius: `${p(32)}px`,
                overflow: 'hidden',
                zIndex: 2,
                background: 'linear-gradient(90deg, #4F7CFF 0%, rgba(108, 99, 255, 0.55) 42%, rgba(95, 115, 255, 0.85) 100%)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  filter: 'blur(7.6px)',
                  transform: 'scale(1.04)',
                }}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    left: '10%',
                    top: '16%',
                    fontWeight: 700,
                    fontSize: p(40),
                    lineHeight: 1.2,
                    color: '#FFFFFF',
                    fontFamily: FIGMA_FONT,
                  }}
                >
                  {FUN_CHINESE_UNIT1_PODCAST_TITLE}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '5.9%',
                    top: '48%',
                    width: p(13),
                    height: p(13),
                    borderRadius: '50%',
                    bgcolor: '#F34D47',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '10%',
                    top: '44%',
                    height: p(48),
                    px: `${p(16)}px`,
                    borderRadius: `${p(35)}px`,
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: p(22),
                      color: '#5F73FF',
                      fontFamily: FIGMA_FONT,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {FUN_CHINESE_UNIT1_PODCAST_TAGLINE}
                  </Typography>
                </Box>
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    right: '6%',
                    top: '50%',
                    width: '28%',
                    height: '92%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.88)',
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 160 140"
                    sx={{ width: '100%', height: '100%', display: 'block' }}
                  >
                    <path
                      d="M28 78c0-36 24-58 52-58s52 22 52 58"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <rect x="14" y="70" width="28" height="48" rx="14" fill="currentColor" />
                    <rect x="118" y="70" width="28" height="48" rx="14" fill="currentColor" />
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    right: '4.6%',
                    bottom: '17%',
                    width: p(72),
                    height: p(48),
                    borderRadius: 999,
                    bgcolor: '#5F73FF',
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  background:
                    'radial-gradient(62% 140% at 52% 136%, rgba(82, 125, 255, 0.42) 0%, rgba(30, 32, 44, 0.58) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${p(12)}px`,
                }}
              >
                <Box
                  sx={{
                    width: p(48),
                    height: p(48),
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: p(26), color: '#FFFFFF' }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: p(24),
                    lineHeight: `${p(26)}px`,
                    color: '#FFFFFF',
                    fontFamily: FIGMA_FONT,
                  }}
                >
                  敬请期待...
                </Typography>
              </Box>
            </Box>
          </ButtonBase>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            bgcolor: '#FFFFFF',
            border: '1px solid #E7ECEB',
            borderRadius: `${p(32)}px`,
            px: `${p(35)}px`,
            pt: `${p(46)}px`,
            pb: `${p(28)}px`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ mb: `${p(22)}px` }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: `${p(12)}px` }}>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: p(32),
                    lineHeight: `${p(46)}px`,
                    color: '#2D3436',
                    fontFamily: FIGMA_FONT,
                  }}
                >
                  C-Toolbox
                </Typography>
                <Box sx={{ mt: `${p(6)}px`, width: p(80), height: p(8), borderRadius: `${p(8)}px`, bgcolor: TEAL }} />
              </Box>
              {!unitComplete && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${p(6)}px`,
                    px: `${p(12)}px`,
                    height: p(36),
                    borderRadius: '999px',
                    bgcolor: '#F3F4F6',
                    color: '#636E72',
                  }}
                >
                  <LockIcon sx={{ fontSize: p(16) }} />
                  <Typography sx={{ fontSize: p(14), fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Finish All 3
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(20)}px` }}>
            {tools.map((tool) => {
              const unlocked = unitComplete
              const isFeatured = tool.id === 'teacher_guide'
              const cardH = isFeatured ? 234 : 173
              const icon = isFeatured ? 132 : 141
              return (
                <ButtonBase
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  sx={{
                    flex: `${cardH} 1 0`,
                    minHeight: 0,
                    aspectRatio: `573 / ${cardH}`,
                    px: '4.2%',
                    borderRadius: isFeatured ? `${p(28)}px` : `${p(24)}px`,
                    border: '1px solid #EEF1F3',
                    background: unlocked ? tool.gradient : '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4.8%',
                    textAlign: 'left',
                    opacity: unlocked ? 1 : 0.72,
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                    '&:active': unlocked ? { transform: 'scale(0.99)' } : {},
                  }}
                >
                  <Box
                    sx={{
                      width: `${(icon / 573) * 100}%`,
                      aspectRatio: '1',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {tool.iconSrc ? (
                      <Box
                        component="img"
                        src={tool.iconSrc}
                        alt=""
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
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
                          top: p(8),
                          right: p(-4),
                          minWidth: p(67),
                          height: p(37),
                          px: `${p(6)}px`,
                          borderRadius: `${p(18)}px`,
                          bgcolor: '#FF9484',
                          color: '#FFFFFF',
                          border: '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: p(25),
                          fontWeight: 700,
                          fontFamily: FIGMA_FONT,
                          lineHeight: 1,
                        }}
                      >
                        {tool.badge}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: p(32),
                        lineHeight: `${p(46)}px`,
                        color: unlocked ? tool.accent : '#94A3B8',
                        fontFamily: FIGMA_FONT,
                      }}
                    >
                      {tool.title}
                    </Typography>
                    {tool.subtitle && (
                      <Typography
                        sx={{
                          mt: `${p(5)}px`,
                          fontWeight: 500,
                          fontSize: p(22),
                          lineHeight: `${p(24)}px`,
                          color: unlocked ? '#8A94A6' : '#CBD5E1',
                          fontFamily: FIGMA_FONT,
                        }}
                      >
                        {tool.subtitle}
                      </Typography>
                    )}
                  </Box>
                  {!isFeatured && tool.id !== 'unit_test' && (
                    <Box
                      sx={{
                        width: p(55),
                        height: p(55),
                        borderRadius: '50%',
                        bgcolor: unlocked ? tool.accent : '#CBD5E1',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ChevronRightIcon sx={{ fontSize: p(28) }} />
                    </Box>
                  )}
                </ButtonBase>
              )
            })}
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
