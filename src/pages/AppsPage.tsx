import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert, Switch } from '@mui/material';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import AddIcon from '@mui/icons-material/Add';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PublicIcon from '@mui/icons-material/Public';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
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

  const cardRadius = is960 ? '18px' : is1920x1125 ? '28px' : '24px';
  const barRadius = is960 ? '12px' : '14px';
  const tileRadius = is960 ? '16px' : '20px';
  const tileLabelSize = is960 ? '0.82rem' : '0.96rem';
  const tileIconBox = is960 ? 34 : 40;
  const tileIconSize = is960 ? 20 : 24;
  const tilePadX = is960 ? 1.15 : 1.4;
  const tilePadY = is960 ? 1.05 : 1.25;

  return (
    <>
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: is1920x1125 ? '#FBF9F6' : '#FFF8F0',
        p: is960 ? 2 : (is1920x1125 ? 4 : 3),
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2.45fr) minmax(0, 1fr)' },
        gridTemplateRows: { xs: 'auto auto', md: 'minmax(0, 1fr)' },
        gap: is960 ? 1.25 : 1.5,
        alignItems: 'stretch',
      }}
    >
              <Box
                sx={{
                  minWidth: 0,
                  minHeight: { xs: 360, md: 0 },
                  height: { md: '100%' },
                  bgcolor: 'white',
                  borderRadius: cardRadius,
                  p: is960 ? 1.35 : (is1920x1125 ? 2.25 : 1.85),
                  boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 0.9 : 1.1,
                  overflow: 'hidden',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.08rem' : (is1920x1125 ? '1.45rem' : '1.28rem'), color: '#111827', flexShrink: 0 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, minWidth: 0, flex: 1 }}>
                    <AccessAlarmOutlinedIcon sx={{ fontSize: is960 ? 28 : 32, color: '#64748B', flexShrink: 0 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.85 : 1.15, flexWrap: 'wrap', minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: is960 ? '1.35rem' : (is1920x1125 ? '1.75rem' : '1.55rem'),
                          fontWeight: 900,
                          color: '#111827',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          lineHeight: 1.1,
                          letterSpacing: '-0.02em',
                          flexShrink: 0,
                        }}
                      >
                        {timeString}
                      </Typography>
                      <Box
                        sx={{
                          px: is960 ? 1 : 1.25,
                          py: is960 ? 0.4 : 0.5,
                          borderRadius: barRadius,
                          bgcolor: '#E2E8F0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: is960 ? '0.68rem' : '0.78rem',
                            fontWeight: 800,
                            color: '#334155',
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dateInfo.month} {dateInfo.day} · {dateInfo.weekday}
                        </Typography>
                      </Box>
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

                {/* App grid — fills remaining panel height */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: is960 ? 280 : 320,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                    gap: is960 ? 0.9 : 1.1,
                    alignItems: 'stretch',
                  }}
                >
                  {[
                    { label: 'Pinyin Chart', path: '/pinyin-chart', bg: '#FF6B35' as const, icon: TranslateIcon },
                    { label: 'Dictionary', path: '/library', bg: '#2F6DF6' as const, icon: MenuBookIcon },
                    {
                      label: 'C-Reader',
                      path: '/library',
                      bg: '#10B3A3' as const,
                      icon: AutoStoriesIcon,
                      state: { openBookSelection: true } as const,
                    },
                  ].map((app) => {
                    const Icon = app.icon;
                    return (
                      <ButtonBase
                        key={app.label}
                        onClick={() =>
                          'state' in app && app.state
                            ? navigate(app.path, { state: app.state })
                            : navigate(app.path)
                        }
                        sx={{
                          borderRadius: tileRadius,
                          px: tilePadX,
                          py: tilePadY,
                          bgcolor: app.bg,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: is960 ? 0.85 : 1,
                          minHeight: 0,
                          height: '100%',
                          transition: 'transform 0.15s',
                          '&:active': { transform: 'scale(0.97)' },
                        }}
                      >
                        <Box
                          sx={{
                            width: tileIconBox,
                            height: tileIconBox,
                            borderRadius: is960 ? '10px' : '12px',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: tileIconSize }} />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 850,
                            fontSize: tileLabelSize,
                            textAlign: 'left',
                            lineHeight: 1.25,
                            wordBreak: 'break-word',
                          }}
                        >
                          {app.label}
                        </Typography>
                      </ButtonBase>
                    );
                  })}

                  <ButtonBase
                    onClick={() => navigate('/flashcards')}
                    sx={{
                      gridColumn: '1 / 2',
                      gridRow: '2 / 4',
                      borderRadius: tileRadius,
                      p: is960 ? 1.35 : 1.65,
                      bgcolor: '#FFC72C',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      minHeight: 0,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.15s',
                      '&:active': { transform: 'scale(0.97)' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.12rem' : '1.32rem', lineHeight: 1.18, textAlign: 'left', zIndex: 1 }}>
                      Character<br />Writing
                    </Typography>
                    <EditNoteIcon
                      sx={{
                        position: 'absolute',
                        right: is960 ? 10 : 14,
                        bottom: is960 ? 6 : 10,
                        fontSize: is960 ? 92 : 118,
                        color: 'rgba(255,255,255,0.82)',
                        transform: 'rotate(-10deg)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: is960 ? 34 : 42,
                        top: is960 ? 28 : 34,
                        color: 'rgba(255,255,255,0.88)',
                        fontSize: is960 ? '1.35rem' : '1.6rem',
                        fontWeight: 900,
                      }}
                    >
                      ✦
                    </Box>
                  </ButtonBase>

                  {[
                    { label: 'Culture', path: '/specialized', bg: '#09B96E' as const, icon: PublicIcon },
                    { label: 'Parental controls', path: '/profile', bg: '#F65068' as const, icon: AdminPanelSettingsIcon },
                  ].map((app) => {
                    const Icon = app.icon;
                    return (
                      <ButtonBase
                        key={app.label}
                        onClick={() => navigate(app.path)}
                        sx={{
                          borderRadius: tileRadius,
                          px: tilePadX,
                          py: tilePadY,
                          bgcolor: app.bg,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: is960 ? 0.85 : 1,
                          minHeight: 0,
                          height: '100%',
                          transition: 'transform 0.15s',
                          '&:active': { transform: 'scale(0.97)' },
                        }}
                      >
                        <Box sx={{ width: tileIconBox, height: tileIconBox, borderRadius: is960 ? '10px' : '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon sx={{ fontSize: tileIconSize }} />
                        </Box>
                        <Typography sx={{ fontWeight: 850, fontSize: tileLabelSize, textAlign: 'left', lineHeight: 1.25 }}>
                          {app.label}
                        </Typography>
                      </ButtonBase>
                    );
                  })}

                  <ButtonBase
                    onClick={() => {
                      setToastMessage('Download center — use Language Packs in Settings for offline content.');
                      setShowToast(true);
                    }}
                    sx={{
                      borderRadius: tileRadius,
                      px: tilePadX,
                      py: tilePadY,
                      bgcolor: '#263238',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: is960 ? 0.85 : 1,
                      minHeight: 0,
                      height: '100%',
                      transition: 'transform 0.15s',
                      '&:active': { transform: 'scale(0.97)' },
                    }}
                  >
                    <Box sx={{ width: tileIconBox, height: tileIconBox, borderRadius: is960 ? '10px' : '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CloudDownloadIcon sx={{ fontSize: tileIconSize }} />
                    </Box>
                    <Typography sx={{ fontWeight: 850, fontSize: tileLabelSize, textAlign: 'left', lineHeight: 1.25 }}>
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
                      minHeight: 0,
                      height: '100%',
                      border: '1px solid #E5E7EB',
                      bgcolor: '#FFFFFF',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:active': { bgcolor: '#F1F5F9' },
                    }}
                    aria-label="Add more apps"
                  >
                    <AddIcon sx={{ fontSize: is960 ? 36 : 42 }} />
                  </ButtonBase>
                </Box>
              </Box>
              <Box
                sx={{
                  minWidth: 0,
                  minHeight: { xs: 320, md: 0 },
                  height: { md: '100%' },
                  bgcolor: 'white',
                  borderRadius: is960 ? '20px' : (is1920x1125 ? '28px' : '24px'),
                  p: is960 ? 1.35 : (is1920x1125 ? 2.5 : 2),
                  boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: is960 ? 0.85 : 1.15,
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
                      {blueLightFilter ? 'Warm tint · eye care' : 'Warm tint · 20-20-20'}
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
    </>
  );
}
