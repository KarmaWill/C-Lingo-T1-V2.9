/**
 * Fun Chinese Hub - 螺旋式上升学习系统
 * 基于脚手架理论与螺旋式课程设计
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import QuizIcon from '@mui/icons-material/Quiz';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { buildHubLessons, loadCompletedLessonIds, type HubLessonStatus } from '../utils/funChineseUnitProgress';
import {
  FUN_CHINESE_UNIT1_PODCAST_BADGE,
  FUN_CHINESE_UNIT1_PODCAST_TAGLINE,
  FUN_CHINESE_UNIT1_PODCAST_TITLE,
} from '../utils/funChineseUnitPodcastCopy';

interface Tool {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ReactNode;
  color: string;
}

export default function FunChineseHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [lessons, setLessons] = useState<HubLessonStatus[]>(() => buildHubLessons(loadCompletedLessonIds()));

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

  const teal = '#14B8A6';
  const orange = '#FF7A45';
  const pageBg = '#FDF6E9';
  const googleSansFamily = '"Google Sans","Product Sans","Roboto","Arial",sans-serif';

  const unitComplete = useMemo(() => lessons.every((l) => l.status === 'completed'), [lessons]);

  const tools: Tool[] = [
    {
      id: 'flashcard',
      title: 'Flashcards',
      titleEn: 'Flashcards',
      icon: <StyleIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: orange,
    },
    {
      id: 'saved',
      title: 'Card Collection',
      titleEn: 'Card Collection',
      icon: <BookmarkBorderIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: '#3B82F6',
    },
    {
      id: 'unit_test',
      title: 'Unit Test',
      titleEn: 'Unit Test',
      icon: <QuizIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: teal,
    },
  ];

  /** Knowledge Toolbox 与 Unit 1 播客：须本单元三课全部完成（与 `unitComplete` 一致）。 */
  const showUnitGateHint = () => {
    setSnackbar({
      open: true,
      message: `Complete all lessons in this unit to unlock the Knowledge Toolbox and ${FUN_CHINESE_UNIT1_PODCAST_TITLE}.`,
    });
  };

  const handleToolClick = (tool: Tool) => {
    if (!unitComplete) {
      showUnitGateHint();
      return;
    }
    if (tool.id === 'flashcard') {
      navigate('/lingo-flash?from=fun-chinese');
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

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: is960 ? 2 : 3,
          py: is960 ? 1.5 : 2,
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonBase
            onClick={() => navigate('/Home')}
            aria-label="Back to Library home"
            sx={{
              minHeight: is960 ? 44 : 52,
              minWidth: is960 ? 44 : 52,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#374151',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
          </ButtonBase>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <MenuBookIcon sx={{ fontSize: is960 ? 16 : 18, color: orange }} />
              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', fontWeight: 800, color: orange, letterSpacing: '0.05em' }}>
                UNIT 1
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : '1.55rem', color: '#1E293B', letterSpacing: '-0.02em' }}>
              我和你 <Box component="span" sx={{ fontSize: is960 ? '0.88rem' : '1.05rem', fontWeight: 600, color: '#94A3B8', ml: 1 }}>You and I</Box>
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            px: is960 ? 2.5 : 3,
            py: is960 ? 1 : 1.25,
            bgcolor: 'white',
            borderRadius: is960 ? '16px' : '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <StarIcon sx={{ fontSize: is960 ? 18 : 22, color: '#FDB022' }} />
          <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1rem', color: '#1E293B' }}>
            1,240 XP
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: is960 ? 2 : 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.8fr 1fr' },
            gap: is960 ? 2 : 3,
            height: '100%',
          }}
        >
          {/* Left: Lesson Progress */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 3, minHeight: 0, overflowY: 'auto' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: is960 ? '0.68rem' : '0.75rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  letterSpacing: '0.1em',
                  mb: is960 ? 1.5 : 2,
                }}
              >
                Unit Progress
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
                {lessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    onClick={() => handleStartLesson(lesson.id, lesson.status)}
                    sx={{
                      p: is960 ? 2 : 2.5,
                      borderRadius: is960 ? '20px' : '26px',
                      border: '2px solid',
                      borderColor:
                        lesson.status === 'current'
                          ? `${orange}50`
                          : lesson.status === 'completed'
                            ? 'rgba(0,0,0,0.06)'
                            : 'rgba(0,0,0,0.06)',
                      bgcolor:
                        lesson.status === 'current'
                          ? `${orange}08`
                          : lesson.status === 'completed'
                            ? 'white'
                            : '#F8FAFC',
                      boxShadow: lesson.status === 'current' ? `0 8px 20px ${orange}20` : '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: lesson.status === 'locked' ? 'not-allowed' : 'pointer',
                      opacity: lesson.status === 'locked' ? 0.5 : 1,
                      transition: 'all 0.2s',
                      '&:hover': lesson.status !== 'locked' ? { transform: 'translateX(4px)' } : {},
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.5 : 2 }}>
                      <Box
                        sx={{
                          width: is960 ? 44 : 52,
                          height: is960 ? 44 : 52,
                          borderRadius: is960 ? '14px' : '16px',
                          bgcolor: lesson.status === 'current' ? orange : '#E2E8F0',
                          color: lesson.status === 'current' ? 'white' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: is960 ? '1.1rem' : '1.35rem',
                        }}
                      >
                        {lesson.id}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1rem' : '1.2rem', color: '#1E293B', lineHeight: 1.2 }}>
                          {lesson.title}
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#64748B', fontWeight: 600 }}>
                          {lesson.titleEn}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        flexShrink: 0,
                        minWidth: is960 ? 140 : 156,
                      }}
                    >
                      <Box
                        sx={{
                          width: is960 ? 26 : 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        aria-hidden={lesson.status !== 'completed'}
                      >
                        {lesson.status === 'completed' ? (
                          <TrophyIcon sx={{ fontSize: is960 ? 22 : 26, color: '#FDB022' }} />
                        ) : null}
                      </Box>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartLesson(lesson.id, lesson.status);
                        }}
                        sx={{
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: is960 ? 100 : 112,
                          px: is960 ? 2 : 2.25,
                          py: is960 ? 0.85 : 1,
                          borderRadius: is960 ? '12px' : '14px',
                          bgcolor: lesson.status === 'current' ? orange : '#E2E8F0',
                          color: lesson.status === 'current' ? 'white' : '#64748B',
                          fontSize: is960 ? '0.82rem' : '0.92rem',
                          fontWeight: 800,
                          boxShadow: lesson.status === 'current' ? `0 4px 12px ${orange}40` : 'none',
                          '&:hover': {
                            bgcolor: lesson.status === 'current' ? '#FF6B3D' : '#CBD5E1',
                          },
                        }}
                      >
                        {lesson.status === 'completed' ? 'Review' : lesson.status === 'current' ? 'Start' : 'Locked'}
                      </ButtonBase>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* AI Training Section */}
            <Box
              sx={{
                mt: is960 ? 1 : 2,
                borderRadius: is960 ? '24px' : '30px',
                p: is960 ? 2.5 : 3.5,
                bgcolor: '#0F172A',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {!unitComplete && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 4,
                    bgcolor: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    px: 3,
                    textAlign: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.85)' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '0.95rem', color: 'rgba(255,255,255,0.92)', maxWidth: 280 }}>
                    Complete all lessons to unlock
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: is960 ? 12 : 14,
                  right: is960 ? 12 : 14,
                  zIndex: 2,
                  px: is960 ? 1 : 1.25,
                  py: 0.5,
                  borderRadius: '999px',
                  bgcolor: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#34D399',
                    boxShadow: '0 0 10px rgba(52,211,153,0.85)',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: is960 ? '0.55rem' : '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'none',
                    color: 'rgba(255,255,255,0.95)',
                    fontFamily: googleSansFamily,
                    lineHeight: 1.15,
                  }}
                >
                  {FUN_CHINESE_UNIT1_PODCAST_BADGE}
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 200,
                  height: 200,
                  bgcolor: `${orange}20`,
                  borderRadius: '50%',
                  filter: 'blur(60px)',
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: is960 ? 1.5 : 2 }}>
                  <Box
                    sx={{
                      width: is960 ? 44 : 52,
                      height: is960 ? 44 : 52,
                      borderRadius: is960 ? '14px' : '16px',
                      bgcolor: orange,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem', lineHeight: 1.2, fontFamily: googleSansFamily }}>
                      {FUN_CHINESE_UNIT1_PODCAST_TITLE}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.66rem' : '0.75rem', color: 'rgba(255,255,255,0.76)', fontWeight: 600, mt: 0.25, fontFamily: googleSansFamily }}>
                      {FUN_CHINESE_UNIT1_PODCAST_TAGLINE}
                    </Typography>
                  </Box>
                </Box>
                <ButtonBase
                  onClick={handleIntensiveClick}
                  sx={{
                    width: '100%',
                    py: is960 ? 1.25 : 1.5,
                    bgcolor: 'white',
                    color: '#0F172A',
                    borderRadius: is960 ? '16px' : '20px',
                    fontSize: is960 ? '0.95rem' : '1.08rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: unitComplete ? 'pointer' : 'default',
                    opacity: unitComplete ? 1 : 0.78,
                    '&:hover': {
                      bgcolor: unitComplete ? '#F1F5F9' : 'white',
                    },
                  }}
                >
                  {unitComplete ? (
                    <>
                      <HeadphonesIcon sx={{ fontSize: is960 ? 24 : 26 }} />
                      Listen
                    </>
                  ) : (
                    'Locked'
                  )}
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          {/* Right: Knowledge Tools */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: is960 ? '24px' : '30px',
              border: '1px solid rgba(0,0,0,0.06)',
              p: is960 ? 2.5 : 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '0.68rem' : '0.75rem',
                fontWeight: 800,
                color: '#94A3B8',
                letterSpacing: '0.1em',
                mb: is960 ? 2 : 2.5,
              }}
            >
              Knowledge Toolbox
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
              {tools.map((tool) => {
                const unlocked = unitComplete;
                return (
                  <ButtonBase
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    sx={{
                      p: is960 ? 2 : 2.5,
                      borderRadius: is960 ? '18px' : '22px',
                      border: '2px solid #F1F5F9',
                      bgcolor: unlocked ? '#F8FAFC' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: is960 ? 1.5 : 2,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      opacity: unlocked ? 1 : 0.72,
                      '&:hover': {
                        bgcolor: unlocked ? 'white' : '#F1F5F9',
                        borderColor: unlocked ? `${orange}30` : '#E2E8F0',
                        transform: unlocked ? 'scale(1.02)' : 'none',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 48 : 56,
                        height: is960 ? 48 : 56,
                        borderRadius: is960 ? '14px' : '16px',
                        bgcolor: unlocked ? tool.color : '#94A3B8',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: unlocked ? `0 6px 16px ${tool.color}40` : 'none',
                        position: 'relative',
                      }}
                    >
                      {tool.icon}
                      {!unlocked && (
                        <LockIcon
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            fontSize: 18,
                            color: '#0F172A',
                            bgcolor: 'white',
                            borderRadius: '50%',
                            p: 0.25,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.08rem', color: '#1E293B', lineHeight: 1.2, fontFamily: googleSansFamily }}>
                        {tool.title}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.75rem', color: '#94A3B8', fontWeight: 600, mt: 0.35 }}>
                        {unlocked ? tool.titleEn : 'Complete all lessons in this unit'}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ fontSize: is960 ? 20 : 22, color: unlocked ? '#CBD5E1' : '#E2E8F0' }} />
                  </ButtonBase>
                );
              })}
            </Box>

            <Box
              sx={{
                mt: 'auto',
                pt: is960 ? 2 : 2.5,
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <Box
                sx={{
                  p: is960 ? 2 : 2.5,
                  bgcolor: `${teal}08`,
                  borderRadius: is960 ? '18px' : '22px',
                  border: `1px solid ${teal}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: is960 ? 22 : 26, color: teal }} />
                <Box>
                  <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: teal, fontWeight: 800, fontFamily: googleSansFamily }}>
                    Today&apos;s study time
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.65rem', color: teal, fontWeight: 900, lineHeight: 1, fontFamily: googleSansFamily }}>
                    24 <Box component="span" sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', fontWeight: 800, fontFamily: googleSansFamily }}>min</Box>
                  </Typography>
                </Box>
              </Box>
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
              maxWidth: is960 ? 580 : 720,
              maxHeight: '90%',
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
                bgcolor: '#F8FAFC',
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
                    bgcolor: activeToolMeta.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeToolMeta.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#1E293B' }}>
                  {activeToolMeta.title}
                </Typography>
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
                p: is960 ? 3 : 4,
              }}
            >
              {activeTool === 'saved' && (
                <Box
                  sx={{
                    py: is960 ? 6 : 8,
                    px: 2,
                    textAlign: 'center',
                    bgcolor: '#F8FAFC',
                    borderRadius: is960 ? '20px' : '24px',
                    border: '2px dashed #E2E8F0',
                  }}
                >
                  <BookmarkBorderIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1.05rem' : '1.15rem', color: '#475569', mb: 1 }}>
                    No cards in your collection yet
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.92rem', color: '#94A3B8', fontWeight: 600, maxWidth: 360, mx: 'auto' }}>
                    Save cards from a lesson to see them here.
                  </Typography>
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
                <ButtonBase
                  onClick={() => setActiveTool(null)}
                  sx={{
                    px: is960 ? 4 : 5,
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
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
