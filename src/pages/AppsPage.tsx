import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert, Switch } from '@mui/material';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import AddIcon from '@mui/icons-material/Add';
export default function AppsPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [blueLightFilter, setBlueLightFilter] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState(0);

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return { month, day, weekday };
  };

  const handleClockButton = (type: string) => {
    if (type === 'Alarm') {
      setShowClock(true);
    } else if (type === 'Calendar') {
      setShowCalendar(true);
    }
  };

  const handleLanguagePackUpdate = () => {
    setToastMessage('正在更新语言包...');
    setShowToast(true);
  };

  const handleContentManagement = () => {
    // 内容管理功能
  };

  const dateInfo = formatDate(currentTime);
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const cardRadius = is960 ? '16px' : is1920x1125 ? '22px' : '20px';
  const barRadius = is960 ? '10px' : '12px';
  const tileRadius = is960 ? '10px' : '12px';
  const tileMinH = is960 ? 76 : 92;

  // 略小于 1 的缩放避免裁切；top center 让缩放后相对主区域水平居中（避免仅靠左上原点导致整体偏左）
  const SCALE = is960 ? 0.92 : is1920x1125 ? 0.96 : 0.96;

  return (
    <Box sx={{ 
      height: '100%', 
      minHeight: 0,
      overflow: 'hidden', 
      boxSizing: 'border-box', 
      bgcolor: is1920x1125 ? '#FBF9F6' : '#FFF8F0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      width: '100%',
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        flexShrink: 0,
        transform: `scale(${SCALE})`,
        transformOrigin: 'top center',
        boxSizing: 'border-box',
      }}>
        <Box sx={{ 
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
          px: { xs: is960 ? 2 : (is1920x1125 ? 4 : 3), md: 0 },
          py: is960 ? 2 : (is1920x1125 ? 4 : 3),
          boxSizing: 'border-box', 
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ 
            flex: '1 1 0',
            minHeight: 0,
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
            px: { xs: is960 ? 1 : (is1920x1125 ? 2 : 1.5), md: 0 },
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Explore Apps + Settings：左侧铺满，右侧靠右；工具卡片集中在右侧 Settings 内 */}
            <Box
              sx={{
                flex: '1 1 0',
                minHeight: 0,
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: is960 ? 1.5 : 2,
                alignItems: 'stretch',
                justifyContent: { xs: 'stretch', md: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  flex: { md: '1 1 0' },
                  minWidth: 0,
                  minHeight: { md: 360 },
                  bgcolor: 'white',
                  borderRadius: cardRadius,
                  p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 1.25 : 1.75,
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : (is1920x1125 ? '1.4rem' : '1.2rem'), color: '#111827' }}>
                  Explore Apps
                </Typography>

                {/* Utility bar — light gray strip, time left / Alarm & Calendar right */}
                <Box
                  sx={{
                    bgcolor: '#EEF2F4',
                    borderRadius: barRadius,
                    px: is960 ? 1.25 : 1.75,
                    py: is960 ? 1 : 1.25,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: is960 ? 1 : 1.25,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, minWidth: 0 }}>
                    <AccessAlarmOutlinedIcon sx={{ fontSize: is960 ? 28 : 32, color: '#64748B', flexShrink: 0 }} />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: is960 ? '1.35rem' : (is1920x1125 ? '1.75rem' : '1.55rem'),
                          fontWeight: 900,
                          color: '#111827',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          lineHeight: 1.05,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {timeString}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: is960 ? '0.62rem' : '0.74rem',
                          fontWeight: 600,
                          color: '#64748B',
                          mt: 0.35,
                        }}
                      >
                        {dateInfo.month} {dateInfo.day} · {dateInfo.weekday}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.65 : 0.85, flexShrink: 0, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <ButtonBase
                      onClick={() => handleClockButton('Alarm')}
                      sx={{
                        py: is960 ? 0.55 : 0.65,
                        px: is960 ? 1.35 : 1.85,
                        borderRadius: barRadius,
                        bgcolor: '#E2E8F0',
                        color: '#334155',
                        fontWeight: 800,
                        fontSize: is960 ? '0.68rem' : '0.78rem',
                        minHeight: 42,
                        '&:active': { bgcolor: '#CBD5E1' },
                        transition: 'background 0.15s',
                      }}
                    >
                      Alarm
                    </ButtonBase>
                    <ButtonBase
                      onClick={() => handleClockButton('Calendar')}
                      sx={{
                        py: is960 ? 0.55 : 0.65,
                        px: is960 ? 1.35 : 1.85,
                        borderRadius: barRadius,
                        bgcolor: '#E2E8F0',
                        color: '#334155',
                        fontWeight: 800,
                        fontSize: is960 ? '0.68rem' : '0.78rem',
                        minHeight: 42,
                        '&:active': { bgcolor: '#CBD5E1' },
                        transition: 'background 0.15s',
                      }}
                    >
                      Calendar
                    </ButtonBase>
                  </Box>
                </Box>

                {/* App grid — 3×3: row3 = Downloads | Add | empty */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: is960 ? 0.85 : 1.15,
                    alignItems: 'stretch',
                  }}
                >
                  {[
                    { label: 'Pinyin Chart', path: '/pinyin-chart', bg: '#FF6B35' as const },
                    { label: 'Dictionary', path: '/library', bg: '#3B82F6' as const },
                    {
                      label: 'C-Reader',
                      path: '/library',
                      bg: '#10B981' as const,
                      state: { openBookSelection: true } as const,
                    },
                    { label: 'Character Writing', path: '/flashcards', bg: '#7C3AED' as const },
                    { label: 'Culture', path: '/specialized', bg: '#14B8A6' as const },
                    { label: 'Parental controls', path: '/profile', bg: '#EC4899' as const },
                  ].map((app) => (
                    <ButtonBase
                      key={app.label}
                      onClick={() =>
                        'state' in app && app.state
                          ? navigate(app.path, { state: app.state })
                          : navigate(app.path)
                      }
                      sx={{
                        borderRadius: tileRadius,
                        px: is960 ? 0.75 : 1,
                        py: is960 ? 1.1 : 1.35,
                        bgcolor: app.bg,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: tileMinH,
                        transition: 'transform 0.15s',
                        '&:active': { transform: 'scale(0.97)' },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: is960 ? '0.68rem' : '0.8rem',
                          textAlign: 'center',
                          lineHeight: 1.25,
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                        }}
                      >
                        {app.label}
                      </Typography>
                    </ButtonBase>
                  ))}

                  <ButtonBase
                    onClick={() => {
                      setToastMessage('Download center — use Language Packs in Settings for offline content.');
                      setShowToast(true);
                    }}
                    sx={{
                      borderRadius: tileRadius,
                      px: is960 ? 0.75 : 1,
                      py: is960 ? 1.1 : 1.35,
                      bgcolor: '#3F3F46',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: tileMinH,
                      transition: 'transform 0.15s',
                      '&:active': { transform: 'scale(0.97)' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.68rem' : '0.8rem', textAlign: 'center', lineHeight: 1.25 }}>
                      Downloads
                    </Typography>
                  </ButtonBase>

                  <ButtonBase
                    onClick={() => {
                      setToastMessage('More apps coming soon.');
                      setShowToast(true);
                    }}
                    sx={{
                      borderRadius: tileRadius,
                      minHeight: tileMinH,
                      border: '2px dashed #CBD5E1',
                      bgcolor: '#F8FAFC',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:active': { bgcolor: '#F1F5F9' },
                    }}
                    aria-label="Add more apps"
                  >
                    <AddIcon sx={{ fontSize: is960 ? 30 : 34 }} />
                  </ButtonBase>

                  <Box sx={{ minHeight: tileMinH }} aria-hidden />
                </Box>
              </Box>
              <Box
                sx={{
                  flex: { xs: '1 1 auto', md: '0 0 min(440px, 42%)' },
                  width: { xs: '100%', md: 'auto' },
                  minWidth: { md: 280 },
                  maxWidth: { md: 440 },
                  ml: { md: 'auto' },
                  alignSelf: 'stretch',
                  bgcolor: 'white',
                  borderRadius: is960 ? '20px' : (is1920x1125 ? '28px' : '24px'),
                  p: is960 ? 1.5 : (is1920x1125 ? 3 : 2.5),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 1 : 1.5,
                  minHeight: 0,
                  maxHeight: { md: '100%' },
                  overflow: 'hidden',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : (is1920x1125 ? '1.35rem' : '1.15rem'), color: '#1F2937', flexShrink: 0 }}>
                  System settings
                </Typography>
                <ButtonBase
                  onClick={handleLanguagePackUpdate}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: is960 ? 0.75 : 1,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    borderRadius: 0,
                    textAlign: 'left',
                    '&:active': { bgcolor: 'rgba(0,180,160,0.06)' },
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.9rem', color: '#374151', fontWeight: 700 }}>
                    Language Packs
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', color: '#9CA3AF', fontWeight: 600 }} aria-hidden>
                    ›
                  </Typography>
                </ButtonBase>
                <ButtonBase
                  onClick={handleContentManagement}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: is960 ? 0.75 : 1,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    borderRadius: 0,
                    textAlign: 'left',
                    '&:active': { bgcolor: 'rgba(0,180,160,0.06)' },
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.9rem', color: '#374151', fontWeight: 700 }}>
                    Content Management
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', color: '#9CA3AF', fontWeight: 600 }} aria-hidden>
                    ›
                  </Typography>
                </ButtonBase>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    py: is960 ? 0.85 : 1.1,
                    px: is960 ? 1 : 1.25,
                    mx: is960 ? -1 : -1.25,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    borderRadius: is960 ? '10px' : '12px',
                    transition: 'background 0.25s ease, box-shadow 0.25s ease',
                    ...(blueLightFilter
                      ? {
                          background:
                            'linear-gradient(105deg, rgba(255,251,235,0.98) 0%, rgba(254,243,199,0.95) 45%, rgba(255,247,237,0.98) 100%)',
                          boxShadow: 'inset 0 0 0 1px rgba(251, 191, 36, 0.45), 0 2px 12px rgba(245, 158, 11, 0.18)',
                        }
                      : {}),
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.9rem', color: '#374151', fontWeight: 700 }}>
                        Eye Protection
                      </Typography>
                      {blueLightFilter && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: is960 ? '0.55rem' : '0.62rem',
                            fontWeight: 900,
                            letterSpacing: '0.06em',
                            color: '#B45309',
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            px: 0.85,
                            py: 0.2,
                            borderRadius: '6px',
                            border: '1px solid rgba(251, 191, 36, 0.8)',
                            boxShadow: '0 1px 4px rgba(245, 158, 11, 0.25)',
                          }}
                        >
                          ON
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.6rem' : '0.7rem',
                        color: blueLightFilter ? '#B45309' : '#9CA3AF',
                        fontWeight: blueLightFilter ? 600 : 500,
                        mt: 0.25,
                        lineHeight: 1.3,
                      }}
                    >
                      {blueLightFilter ? 'Warm screen — easier on your eyes' : 'Warm tint · 20-20-20 reminder'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={blueLightFilter}
                    onChange={(_, v) => setBlueLightFilter(v)}
                    inputProps={{ 'aria-label': 'Eye protection mode' }}
                    sx={{
                      flexShrink: 0,
                      '& .MuiSwitch-switchBase': {
                        transition: 'transform 0.2s',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#FBBF24',
                        '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.12)' },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        bgcolor: '#FDE68A',
                        opacity: 1,
                        boxShadow: '0 0 0 2px rgba(251, 191, 36, 0.55), inset 0 1px 0 rgba(255,255,255,0.6)',
                      },
                      '& .MuiSwitch-track': {
                        bgcolor: '#E5E7EB',
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    py: is960 ? 0.75 : 1,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.9rem', color: '#374151', fontWeight: 700, mb: 0.75 }}>
                    App Updates
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', color: '#6B7280', fontWeight: 500, mb: 1 }}>
                    {pendingUpdates === 0 ? 'No current updates' : `${pendingUpdates} update(s) pending`}
                  </Typography>
                  <ButtonBase
                    onClick={() => {
                      const randomUpdates = Math.floor(Math.random() * 4);
                      setPendingUpdates(randomUpdates);
                    }}
                    sx={{
                      width: '100%',
                      py: is960 ? 0.625 : 0.75,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      color: '#1F2937',
                      fontWeight: 800,
                      fontSize: is960 ? '0.6rem' : '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      '&:active': { bgcolor: '#00B4A0', color: 'white' },
                      transition: 'all 0.2s',
                    }}
                  >
                    Check for Updates
                  </ButtonBase>
                </Box>

                <Box
                  sx={{
                    flex: '1 1 0',
                    minHeight: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
          {/* Dark panel — shortcuts only (no duplicate title vs column header) */}
          <Box sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: '#1F2937',
            borderRadius: is960 ? '14px' : (is1920x1125 ? '20px' : '16px'),
            p: is960 ? 1.25 : (is1920x1125 ? 2 : 1.5),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            color: 'white',
            minWidth: 0,
            overflow: 'hidden',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is1920x1125 ? 0.5 : (is960 ? 0.5 : 0.625), flexShrink: 0 }}>
              <ButtonBase
                sx={{
                  width: '100%',
                  py: is960 ? 0.625 : (is1920x1125 ? 0.75 : 0.875),
                  borderRadius: is960 ? '10px' : (is1920x1125 ? '14px' : '14px'),
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: is960 ? '0.6rem' : (is1920x1125 ? '0.75rem' : '0.7rem'),
                  '&:active': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'scale(0.98)' },
                  transition: 'all 0.2s',
                }}
              >
                Android Platform
              </ButtonBase>
              <ButtonBase
                sx={{
                  width: '100%',
                  py: is960 ? 0.625 : (is1920x1125 ? 0.75 : 0.875),
                  borderRadius: is960 ? '10px' : (is1920x1125 ? '14px' : '14px'),
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: is960 ? '0.6rem' : (is1920x1125 ? '0.75rem' : '0.7rem'),
                  '&:active': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'scale(0.98)' },
                  transition: 'all 0.2s',
                }}
              >
                Go to Settings
              </ButtonBase>
            </Box>
          </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

      {/* Clock Modal */}
      {showClock && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowClock(false)}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: is960 ? '24px' : (is1920x1125 ? '40px' : '32px'),
              p: is960 ? 4 : (is1920x1125 ? 8 : 6),
              maxWidth: is960 ? 400 : (is1920x1125 ? 600 : 500),
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ fontSize: is960 ? '4rem' : (is1920x1125 ? '6rem' : '6rem'), mb: 2 }}>🕒</Box>
            <Box sx={{ 
              fontSize: is960 ? '3rem' : (is1920x1125 ? '4rem' : '4rem'), 
              fontWeight: 900, 
              color: '#1F2937', 
              mb: 2, 
              fontFamily: 'monospace' 
            }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Box>
            <Box sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), 
              fontWeight: 700, 
              color: '#6B7280', 
              mb: is960 ? 3 : (is1920x1125 ? 6 : 4) 
            }}>
              {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </Box>
            <ButtonBase
              onClick={() => setShowClock(false)}
              sx={{
                width: '100%',
                py: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '20px'),
                bgcolor: '#00B4A0',
                color: 'white',
                fontWeight: 900,
                fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'),
                '&:active': { transform: 'scale(0.95)' },
                transition: 'all 0.2s',
              }}
            >
              Close
            </ButtonBase>
          </Box>
        </Box>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowCalendar(false)}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: is960 ? '24px' : (is1920x1125 ? '40px' : '32px'),
              p: is960 ? 4 : (is1920x1125 ? 8 : 6),
              maxWidth: is960 ? 400 : (is1920x1125 ? 600 : 500),
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ fontSize: is960 ? '4rem' : (is1920x1125 ? '6rem' : '6rem'), mb: 2 }}>📅</Box>
            <Box sx={{ 
              fontSize: is960 ? '2rem' : (is1920x1125 ? '3rem' : '3rem'), 
              fontWeight: 900, 
              color: '#1F2937', 
              mb: 2 
            }}>
              {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Box>
            <Box sx={{ 
              fontSize: is960 ? '1.125rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
              fontWeight: 700, 
              color: '#6B7280', 
              mb: is960 ? 3 : (is1920x1125 ? 6 : 4) 
            }}>
              {currentTime.toLocaleDateString('zh-CN', { weekday: 'long' })}
            </Box>
            <Box sx={{ 
              fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'), 
              color: '#9CA3AF', 
              mb: is960 ? 3 : (is1920x1125 ? 6 : 4) 
            }}>
              Day {Math.ceil((currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24))}
            </Box>
            <ButtonBase
              onClick={() => setShowCalendar(false)}
              sx={{
                width: '100%',
                py: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
                borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '20px'),
                bgcolor: '#00B4A0',
                color: 'white',
                fontWeight: 900,
                fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.25rem' : '1rem'),
                '&:active': { transform: 'scale(0.95)' },
                transition: 'all 0.2s',
              }}
            >
              Close
            </ButtonBase>
          </Box>
        </Box>
      )}

      </Box>
      </Box>

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity="info" 
          sx={{ 
            width: '100%',
            bgcolor: '#00B4A0',
            color: 'white',
            fontWeight: 700,
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
