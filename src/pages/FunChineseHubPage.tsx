/**
 * Fun Chinese Hub - 螺旋式上升学习系统
 * 基于脚手架理论与螺旋式课程设计
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import MessageIcon from '@mui/icons-material/ChatBubbleOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';

interface Lesson {
  id: number;
  title: string;
  titleEn: string;
  status: 'completed' | 'current' | 'locked';
  xp: number;
}

interface Tool {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ReactNode;
  color: string;
}

const LESSONS: Lesson[] = [
  { id: 1, title: '你好', titleEn: 'Hello', status: 'completed', xp: 100 },
  { id: 2, title: '你叫什么', titleEn: 'What is your name', status: 'current', xp: 0 },
  { id: 3, title: '你家在哪儿', titleEn: 'Where is your home', status: 'locked', xp: 0 },
];

export default function FunChineseHubPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const [activeTool, setActiveTool] = useState<string | null>(null);

  const teal = '#14B8A6';
  const orange = '#FF7A45';
  const pageBg = '#FDF6E9';
  const googleSansFamily = '"Google Sans","Product Sans","Roboto","Arial",sans-serif';

  const tools: Tool[] = [
    {
      id: 'dialogue',
      title: 'Dialogue Cards',
      titleEn: 'Dialogue Cards',
      icon: <MessageIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: orange,
    },
    {
      id: 'grammar',
      title: 'Grammar Cards',
      titleEn: 'Grammar Cards',
      icon: <BoltIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: '#3B82F6',
    },
    {
      id: 'pattern',
      title: 'Pattern Cards',
      titleEn: 'Pattern Cards',
      icon: <ViewModuleIcon sx={{ fontSize: is960 ? 22 : 26 }} />,
      color: teal,
    },
  ];

  const handleStartLesson = (lessonId: number, status: string) => {
    if (status === 'locked') return;
    navigate(`/library/hub/fun-chinese/lesson/${lessonId}`);
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
            onClick={() => navigate(-1)}
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
            {/* Lessons Section */}
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
                {LESSONS.map((lesson) => (
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
                    fontSize: is960 ? '0.6rem' : '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.95)',
                    fontFamily: googleSansFamily,
                    lineHeight: 1.1,
                  }}
                >
                  Online only
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
                      AI Intensive Practice
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.66rem' : '0.75rem', color: 'rgba(255,255,255,0.76)', fontWeight: 600, mt: 0.25, fontFamily: googleSansFamily }}>
                      Internet connection required
                    </Typography>
                  </Box>
                </Box>
                <ButtonBase
                  onClick={(e) => {
                    e.preventDefault();
                  }}
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
                    cursor: 'not-allowed',
                    opacity: 0.78,
                    '&:hover': {
                      bgcolor: 'white',
                    },
                  }}
                >
                  Coming soon
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
              {tools.map((tool) => (
                <ButtonBase
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  sx={{
                    p: is960 ? 2 : 2.5,
                    borderRadius: is960 ? '18px' : '22px',
                    border: '2px solid #F1F5F9',
                    bgcolor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 1.5 : 2,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'white',
                      borderColor: `${orange}30`,
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: is960 ? 48 : 56,
                      height: is960 ? 48 : 56,
                      borderRadius: is960 ? '14px' : '16px',
                      bgcolor: tool.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 6px 16px ${tool.color}40`,
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.08rem', color: '#1E293B', lineHeight: 1.2, fontFamily: googleSansFamily }}>
                      {tool.title}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ fontSize: is960 ? 20 : 22, color: '#CBD5E1' }} />
                </ButtonBase>
              ))}
            </Box>

            {/* Study Time */}
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
      {activeTool && (
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
            {/* Modal Header */}
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
                    bgcolor: tools.find((t) => t.id === activeTool)?.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tools.find((t) => t.id === activeTool)?.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#1E293B' }}>
                  {tools.find((t) => t.id === activeTool)?.title}
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

            {/* Modal Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: is960 ? 3 : 4,
              }}
            >
              <Box
                sx={{
                  p: is960 ? 3 : 4,
                  bgcolor: '#F8FAFC',
                  borderRadius: is960 ? '20px' : '24px',
                  border: '2px dashed #E2E8F0',
                  textAlign: 'center',
                  mb: is960 ? 2 : 3,
                }}
              >
                <Typography sx={{ color: '#94A3B8', fontSize: is960 ? '0.88rem' : '1rem', fontWeight: 600 }}>
                  正在加载 Unit 1 的{tools.find((t) => t.id === activeTool)?.title.replace('卡', '')}知识点...
                </Typography>
              </Box>

              {/* Example Content */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: is960 ? 1.5 : 2,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      p: is960 ? 2 : 2.5,
                      bgcolor: 'white',
                      borderRadius: is960 ? '16px' : '18px',
                      border: '1px solid #F1F5F9',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', fontWeight: 800, color: '#94A3B8', mb: 0.5 }}>
                      知识点 {i}
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.2rem', fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                      你好{i > 1 ? '吗' : ''}！
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#64748B', fontWeight: 600 }}>
                      Hello{i > 1 ? '?' : '!'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Modal Footer */}
            <Box
              sx={{
                p: is960 ? 2.5 : 3,
                bgcolor: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ButtonBase
                onClick={() => {
                  setActiveTool(null);
                  handleStartLesson(1, 'current');
                }}
                sx={{
                  px: is960 ? 4 : 5,
                  py: is960 ? 1.25 : 1.5,
                  bgcolor: '#0F172A',
                  color: 'white',
                  borderRadius: is960 ? '16px' : '20px',
                  fontSize: is960 ? '0.95rem' : '1.08rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: '#1E293B',
                  },
                }}
              >
                看完啦，去训练一下
                <PsychologyIcon sx={{ fontSize: is960 ? 22 : 26 }} />
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
