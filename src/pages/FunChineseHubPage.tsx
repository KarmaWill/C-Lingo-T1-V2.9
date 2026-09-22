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
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';
import { uploadFunChineseOfflineData } from '../utils/funChineseOfflineSync';
import { buildHubLessons, loadCompletedLessonIds, type HubLessonStatus } from '../utils/funChineseUnitProgress';
import {
  allUnitLessonIds,
  readHubPreview,
  subscribeHubPreview,
  type HubPreviewMode,
} from '../utils/funChineseHubPreview';
import {
  FUN_CHINESE_UNIT1_COLLECTION_CARDS,
  groupFunChineseSavedCards,
  loadFunChineseSavedCards,
  removeFunChineseSavedCard,
  type FunChineseCardType,
  type FunChineseSavedCard,
} from '../utils/funChineseCardCollection';
import { APP_FONT_FAMILY } from '../theme/appFont';
import { getDemoUnitTitles } from '../data/happyChinese2/mapToLessonUi';

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
  /** Frame 1410141912 hero GO card */
  hero?: boolean;
  goLabel?: string;
  artRotateDeg?: number;
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
  const screenSize = APP_SCREEN_SIZE;
  const is960 = screenSize === '960x540';
  const p = (n: number) => figmaPx(n, screenSize);

  const unitTitles = useMemo(() => getDemoUnitTitles('en'), []);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [lessons, setLessons] = useState<HubLessonStatus[]>(() => buildHubLessons(loadCompletedLessonIds()));
  const [hubPreview, setHubPreview] = useState<HubPreviewMode | null>(readHubPreview);
  const [savedCards, setSavedCards] = useState<FunChineseSavedCard[]>([]);
  const [uploading, setUploading] = useState(false);

  const refreshLessons = useCallback(() => {
    setLessons(buildHubLessons(loadCompletedLessonIds()));
  }, []);

  useEffect(() => subscribeHubPreview(() => setHubPreview(readHubPreview())), []);

  const displayLessons = useMemo(() => {
    if (hubPreview === 'complete') return buildHubLessons(allUnitLessonIds())
    if (hubPreview === 'locked') return buildHubLessons(new Set())
    return lessons
  }, [hubPreview, lessons]);

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

  const unitComplete = useMemo(() => displayLessons.every((l) => l.status === 'completed'), [displayLessons]);

  /** Frame 1410141912：右侧仅双色 GO 卡（Flashcards / Card Collection）。 */
  const tools: ToolboxItem[] = [
    {
      id: 'flashcard',
      title: 'Flashcards',
      iconSrc: '/images/flashcards-toolbox-icon.png',
      accent: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #F6682F 0%, #FABD64 100%)',
      iconGlow: '0 10px 28px rgba(246,104,47,0.28)',
      badge: '20',
      hero: true,
      goLabel: 'GO',
      artRotateDeg: 6.05,
    },
    {
      id: 'saved',
      title: 'Card Collection',
      iconSrc: '/images/card-collection-toolbox-icon.png',
      accent: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #0F80F6 0%, #87D6FF 100%)',
      iconGlow: '0 10px 28px rgba(15,128,246,0.28)',
      hero: true,
      goLabel: 'GO',
      artRotateDeg: 22.37,
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
  const heroTools = tools.filter((t) => t.hero);

  /** Knowledge Toolbox：须本单元三课全部完成（与 `unitComplete` 一致）。 */
  const showUnitGateHint = () => {
    setSnackbar({
      open: true,
      message: 'Complete all 3 in this unit to unlock the Knowledge Toolbox.',
    });
  };

  const handleToolClick = (tool: ToolboxItem) => {
    if (!unitComplete && hubPreview == null) {
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
              {unitTitles.titleZh}
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
              {unitTitles.titleEn}
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
                  fontSize: p(15),
                  lineHeight: `${p(19)}px`,
                  letterSpacing: '0.11em',
                  color: TEAL,
                  fontFamily: FIGMA_FONT,
                  whiteSpace: 'nowrap',
                }}
              >
                Studied
              </Typography>
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
        </Box>
      </Box>

      {/* Frame 1410141912 · Course panel + C-Toolbox GO cards */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: `${p(64)}px`,
          pt: `${p(24)}px`,
          pb: `${p(40)}px`,
          display: 'grid',
          gridTemplateColumns: `minmax(0, ${p(1126)}fr) minmax(0, ${p(635)}fr)`,
          gap: `${p(32)}px`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            bgcolor: '#FFFFFF',
            border: '1px solid #E7ECEB',
            borderRadius: `${p(32)}px`,
            px: `${p(41)}px`,
            pt: `${p(48)}px`,
            pb: `${p(36)}px`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${p(36)}px` }}>
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
              {displayLessons.map((lesson) => {
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

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(37)}px` }}>
            {displayLessons.map((lesson) => {
              const isLocked = lesson.status === 'locked'
              return (
                <Box
                  key={lesson.id}
                  onClick={() => {
                    if (isLocked) return
                    handleStartLesson(lesson.id, lesson.status)
                  }}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    px: `${p(28)}px`,
                    borderRadius: `${p(18)}px`,
                    bgcolor: isLocked ? '#F8FAFC' : '#F4FFFA',
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
                        fontOpticalSizing: 'auto',
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
                        fontOpticalSizing: 'auto',
                      }}
                    >
                      {lesson.titleEn}
                    </Typography>
                  </Box>
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
                      width: p(77),
                      height: p(77),
                      minWidth: p(77),
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
                </Box>
              )
            })}
          </Box>
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
            pb: `${p(40)}px`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ mb: `${p(28)}px` }}>
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

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: `${p(43)}px` }}>
            {heroTools.map((tool) => {
              const unlocked = unitComplete
              const isFlash = tool.id === 'flashcard'
              return (
                <ButtonBase
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: `${p(24)}px`,
                    border: '1px solid #EEF1F3',
                    background: unlocked ? tool.gradient : 'linear-gradient(90deg, #CBD5E1 0%, #E2E8F0 100%)',
                    display: 'block',
                    textAlign: 'left',
                    opacity: unlocked ? 1 : 0.72,
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                    '&:active': unlocked ? { transform: 'scale(0.99)' } : {},
                  }}
                >
                  {/* Title · top-left */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      left: p(55),
                      top: p(26),
                      fontWeight: 700,
                      fontSize: p(43),
                      lineHeight: `${p(62)}px`,
                      color: '#FFFFFF',
                      fontFamily: FIGMA_FONT,
                      zIndex: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tool.title}
                  </Typography>

                  {/* Count badge · Flashcards top-right only */}
                  {tool.badge && (
                    <Box
                      aria-label={`${tool.badge} cards to review`}
                      sx={{
                        position: 'absolute',
                        right: p(28),
                        top: p(28),
                        zIndex: 3,
                        minWidth: p(72),
                        height: p(44),
                        px: `${p(14)}px`,
                        borderRadius: 999,
                        bgcolor: '#F46E5B',
                        color: '#FFFFFF',
                        border: '2.5px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: p(26),
                        fontWeight: 700,
                        fontFamily: FIGMA_FONT,
                        lineHeight: 1,
                        boxSizing: 'border-box',
                        boxShadow: '0 4px 12px rgba(244, 110, 91, 0.35)',
                      }}
                    >
                      {tool.badge}
                    </Box>
                  )}

                  {/* Art · right half, vertically centered */}
                  {tool.iconSrc && (
                    <Box
                      component="img"
                      src={tool.iconSrc}
                      alt=""
                      sx={{
                        position: 'absolute',
                        right: isFlash ? p(-8) : p(4),
                        top: '50%',
                        width: isFlash ? '58%' : '52%',
                        maxWidth: p(280),
                        aspectRatio: '1',
                        objectFit: 'contain',
                        transform: `translateY(-46%) rotate(${tool.artRotateDeg ?? 0}deg)`,
                        opacity: unlocked ? 1 : 0.55,
                        filter: unlocked ? 'none' : 'grayscale(0.35)',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* GO pill · bottom-left */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: p(55),
                      bottom: p(32),
                      zIndex: 2,
                      height: p(80),
                      pl: `${p(39)}px`,
                      pr: `${p(18)}px`,
                      borderRadius: 999,
                      bgcolor: 'rgba(255, 255, 255, 0.34)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(14)}px`,
                      boxSizing: 'border-box',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: p(37),
                        lineHeight: 1,
                        color: '#FFFFFF',
                        fontFamily: FIGMA_FONT,
                      }}
                    >
                      {tool.goLabel ?? 'GO'}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: p(48), color: '#FFFFFF' }} />
                  </Box>
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
