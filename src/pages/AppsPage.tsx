import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Snackbar, Alert } from '@mui/material';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AndroidIcon from '@mui/icons-material/Android';
import type { SvgIconComponent } from '@mui/icons-material';
import { getInstalledExtraApps, removeInstalledExtraApp, MAX_EXTRA_APPS, type CatalogApp } from '../data/appsCatalog';
import { getPendingAppUpdatesCount } from '../data/appUpdatesCatalog';
import {
  GOOGLE_SYSTEM_TOOLS,
  getDaysUntil,
  loadCountdownTarget,
  loadInstalledUtilityToolIds,
  MAX_UTILITY_TOOLS,
  removeInstalledUtilityTool,
  saveCountdownTarget,
  toggleInstalledUtilityTool,
  type SystemTool,
} from '../data/systemToolsCatalog';
import {
  BUILTIN_UTILITY_ITEMS,
  loadBuiltinUtilityIds,
  removeBuiltinUtility,
  toggleBuiltinUtility,
  type BuiltinUtilityId,
} from '../data/utilityBarConfig';
import { useLongPress } from '../utils/useLongPress';
import type { ReactNode } from 'react';

const POMODORO_SECONDS = 25 * 60;

const UTILITY_TOOL_ICONS: Record<string, SvgIconComponent> = {
  calculator: CalculateOutlinedIcon,
  notes: StickyNote2OutlinedIcon,
  weather: WbSunnyOutlinedIcon,
  compass: ExploreOutlinedIcon,
  recorder: MicOutlinedIcon,
  files: FolderOutlinedIcon,
  settings: SettingsOutlinedIcon,
  translate: TranslateIcon,
};

const BUILTIN_ICONS: Record<BuiltinUtilityId, SvgIconComponent> = {
  alarm: AccessAlarmOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  daycountdown: TodayOutlinedIcon,
  pomodoro: HourglassEmptyOutlinedIcon,
};

function UtilityBarIconButton({
  label,
  iconSx,
  is960,
  showDelete,
  onEnterEditMode,
  onRemove,
  onClick,
  children,
}: {
  label: string;
  iconSx: object;
  is960: boolean;
  showDelete: boolean;
  onEnterEditMode: () => void;
  onRemove: () => void;
  onClick: () => void;
  children: ReactNode;
}) {
  const longPress = useLongPress(onEnterEditMode);

  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <ButtonBase
        {...longPress}
        onClick={() => {
          if (longPress.consumeLongPress()) return;
          if (showDelete) return;
          onClick();
        }}
        aria-label={label}
        sx={{ ...iconSx, ...(showDelete ? { opacity: 0.88, transform: 'scale(0.96)' } : {}) }}
      >
        {children}
      </ButtonBase>
      {showDelete && (
        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 22,
            height: 22,
            minWidth: 22,
            minHeight: 22,
            borderRadius: '50%',
            bgcolor: '#EF4444',
            color: 'white',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(239,68,68,0.45)',
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </ButtonBase>
      )}
    </Box>
  );
}

function UtilityToolButton({
  tool,
  iconSx,
  is960,
  showDelete,
  onEnterEditMode,
  onRemove,
  onLaunch,
}: {
  tool: SystemTool;
  iconSx: object;
  is960: boolean;
  showDelete: boolean;
  onEnterEditMode: () => void;
  onRemove: () => void;
  onLaunch: () => void;
}) {
  const Icon = UTILITY_TOOL_ICONS[tool.id] ?? SettingsOutlinedIcon;

  return (
    <UtilityBarIconButton
      label={tool.label}
      iconSx={{ ...iconSx, color: tool.color }}
      is960={is960}
      showDelete={showDelete}
      onEnterEditMode={onEnterEditMode}
      onRemove={onRemove}
      onClick={onLaunch}
    >
      <Icon sx={{ fontSize: is960 ? 22 : 24 }} />
    </UtilityBarIconButton>
  );
}

function ExtraAppTile({
  app,
  is960,
  tileRadius,
  tilePadX,
  tilePadY,
  tileIconBox,
  tileIconSize,
  tileLabelSize,
  isDeleteMode,
  onEnterEditMode,
  onRemove,
  onLaunch,
}: {
  app: CatalogApp;
  is960: boolean;
  tileRadius: string;
  tilePadX: number;
  tilePadY: number;
  tileIconBox: number;
  tileIconSize: number;
  tileLabelSize: string;
  isDeleteMode: boolean;
  onEnterEditMode: () => void;
  onRemove: () => void;
  onLaunch: () => void;
}) {
  const longPress = useLongPress(onEnterEditMode);

  return (
    <Box sx={{ position: 'relative', minHeight: 0, height: '100%' }}>
      <ButtonBase
        {...longPress}
        onClick={() => {
          if (longPress.consumeLongPress()) return;
          if (isDeleteMode) return;
          onLaunch();
        }}
        sx={{
          width: '100%',
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
          ...(isDeleteMode ? { transform: 'scale(0.97)', boxShadow: '0 0 0 2px rgba(239,68,68,0.5)' } : {}),
          '&:active': { transform: 'scale(0.97)' },
        }}
      >
        <Box sx={{ width: tileIconBox, height: tileIconBox, borderRadius: is960 ? '10px' : '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: tileIconSize * 0.7 }}>
          {app.label.charAt(0)}
        </Box>
        <Typography sx={{ fontWeight: 850, fontSize: tileLabelSize, textAlign: 'left', lineHeight: 1.25 }}>
          {app.label}
        </Typography>
      </ButtonBase>
      {isDeleteMode && (
        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${app.label}`}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            minWidth: 28,
            minHeight: 28,
            borderRadius: '50%',
            bgcolor: '#EF4444',
            color: 'white',
            zIndex: 2,
            boxShadow: '0 4px 12px rgba(239,68,68,0.45)',
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </ButtonBase>
      )}
    </Box>
  );
}

function SettingsNavRow({
  label,
  onClick,
  badgeCount,
  is960,
}: {
  label: string;
  onClick: () => void;
  badgeCount?: number;
  is960: boolean;
}) {
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;
  const rowInsetX = is960 ? 1.35 : 1.65;

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        minHeight: is960 ? 50 : 54,
        py: is960 ? 0.85 : 1,
        pl: rowInsetX,
        pr: rowInsetX,
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        flexShrink: 0,
        borderRadius: 0,
        textAlign: 'left',
        '&:last-child': { borderBottom: 'none' },
        '&:active': { bgcolor: 'rgba(0,180,160,0.06)' },
      }}
    >
      <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.98rem', color: '#374151', fontWeight: 700 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 0.65 : 0.75, flexShrink: 0 }}>
        {showBadge && (
          <Box
            aria-label={`${badgeCount} updates available`}
            sx={{
              minWidth: is960 ? 28 : 32,
              height: is960 ? 24 : 28,
              px: is960 ? 0.65 : 0.75,
              borderRadius: '999px',
              bgcolor: '#F94B4B',
              color: 'white',
              border: '2px solid #FFFFFF',
              boxShadow: '0 4px 12px rgba(239,68,68,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: is960 ? '0.72rem' : '0.82rem',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {badgeCount}
          </Box>
        )}
        <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', color: '#9CA3AF', fontWeight: 600 }} aria-hidden>
          ›
        </Typography>
      </Box>
    </ButtonBase>
  );
}

/** Six user-pinnable system app slots (cols 2–3, rows 2–4). */
const DYNAMIC_APP_SLOTS = [
  { col: 2, row: 2 },
  { col: 3, row: 2 },
  { col: 2, row: 3 },
  { col: 3, row: 3 },
  { col: 2, row: 4 },
  { col: 3, row: 4 },
] as const;

function AppGridTile({
  label,
  path,
  bg,
  icon: Icon,
  gridColumn,
  gridRow,
  is960,
  tileRadius,
  tilePadX,
  tilePadY,
  tileIconBox,
  tileIconSize,
  tileLabelSize,
  onNavigate,
}: {
  label: string;
  path: string;
  bg: string;
  icon: SvgIconComponent;
  gridColumn?: number;
  gridRow?: number;
  is960: boolean;
  tileRadius: string;
  tilePadX: number;
  tilePadY: number;
  tileIconBox: number;
  tileIconSize: number;
  tileLabelSize: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <ButtonBase
      onClick={() => onNavigate(path)}
      sx={{
        gridColumn,
        gridRow,
        borderRadius: tileRadius,
        px: tilePadX,
        py: tilePadY,
        bgcolor: bg,
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
        {label}
      </Typography>
    </ButtonBase>
  );
}

export default function AppsPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [blueLightFilter, setBlueLightFilter] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDayCountdown, setShowDayCountdown] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showUtilityToolsCatalog, setShowUtilityToolsCatalog] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(() => loadCountdownTarget());
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(POMODORO_SECONDS);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [utilityToolIds, setUtilityToolIds] = useState(() => loadInstalledUtilityToolIds());
  const [builtinUtilityIds, setBuiltinUtilityIds] = useState(() => loadBuiltinUtilityIds());
  const [extraApps, setExtraApps] = useState(() => getInstalledExtraApps());
  const [utilityEditMode, setUtilityEditMode] = useState(false);
  const [appEditMode, setAppEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const pendingUpdates = getPendingAppUpdatesCount();

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pomodoroRunning || pomodoroSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setPomodoroSecondsLeft((s) => {
        if (s <= 1) {
          setPomodoroRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [pomodoroRunning, pomodoroSecondsLeft]);

  const refreshExtraApps = useCallback(() => setExtraApps(getInstalledExtraApps()), []);
  const refreshUtilityTools = useCallback(() => setUtilityToolIds(loadInstalledUtilityToolIds()), []);

  useEffect(() => {
    refreshExtraApps();
    refreshUtilityTools();
    const onFocus = () => {
      refreshExtraApps();
      refreshUtilityTools();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshExtraApps, refreshUtilityTools]);

  const installedUtilityTools = utilityToolIds
    .map((id) => GOOGLE_SYSTEM_TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is SystemTool => Boolean(tool));

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return { month, day, weekday };
  };

  const handleUtilityTool = (type: 'alarm' | 'calendar' | 'daycountdown' | 'pomodoro') => {
    if (type === 'alarm') setShowClock(true);
    else if (type === 'calendar') setShowCalendar(true);
    else if (type === 'daycountdown') setShowDayCountdown(true);
    else {
      if (pomodoroSecondsLeft === 0) setPomodoroSecondsLeft(POMODORO_SECONDS);
      setShowPomodoro(true);
    }
  };

  const handleUtilityToolLaunch = (tool: SystemTool) => {
    setToastMessage(`${tool.label} is ready on this device.`);
    setShowToast(true);
  };

  const handleToggleUtilityTool = (toolId: string) => {
    const result = toggleInstalledUtilityTool(toolId);
    setUtilityToolIds(result.ids);
    if (!result.ok) {
      setToastMessage(`Utility bar supports up to ${MAX_UTILITY_TOOLS} custom tools. Remove one first.`);
      setShowToast(true);
    }
  };

  const handleRemoveUtilityTool = (toolId: string) => {
    setUtilityToolIds(removeInstalledUtilityTool(toolId));
  };

  const handleRemoveBuiltinUtility = (id: BuiltinUtilityId) => {
    setBuiltinUtilityIds(removeBuiltinUtility(id));
  };

  const handleToggleBuiltinUtility = (id: BuiltinUtilityId) => {
    setBuiltinUtilityIds(toggleBuiltinUtility(id).ids);
  };

  const handleRemoveExtraApp = (appId: string) => {
    removeInstalledExtraApp(appId);
    setExtraApps(getInstalledExtraApps());
  };

  const handleCountdownTargetChange = (value: string) => {
    setCountdownTarget(value);
    saveCountdownTarget(value);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const daysUntilTarget = getDaysUntil(countdownTarget, currentTime);

  const handleLanguagePackUpdate = () => {
    navigate('/system/language-packs', { state: { from: '/apps' } });
  };

  const handleContentManagement = () => {
    navigate('/system/content-cache', { state: { from: '/apps' } });
  };

  const handleOpenNskStore = () => {
    navigate('/nsk-app-store', { state: { from: '/apps' } });
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

  const utilityIconSx = {
    width: 44,
    height: 44,
    borderRadius: barRadius,
    bgcolor: '#E2E8F0',
    color: '#334155',
    '&:active': { bgcolor: '#CBD5E1' },
    transition: 'background 0.15s',
  } as const;

  const utilityAddSx = {
    width: 44,
    height: 44,
    borderRadius: barRadius,
    border: '1px dashed #CBD5E1',
    bgcolor: '#FFFFFF',
    color: '#94A3B8',
    '&:active': { bgcolor: '#F1F5F9' },
    transition: 'background 0.15s',
  } as const;

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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.65 : 0.85, flexShrink: 0, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                    {utilityEditMode && (
                      <ButtonBase
                        onClick={() => setUtilityEditMode(false)}
                        sx={{ minHeight: 32, px: 1.25, borderRadius: '10px', bgcolor: '#111827', color: 'white', fontWeight: 800, fontSize: '0.72rem' }}
                      >
                        Done
                      </ButtonBase>
                    )}
                    {builtinUtilityIds.includes('alarm') && (
                      <UtilityBarIconButton
                        label="Alarm"
                        iconSx={utilityIconSx}
                        is960={is960}
                        showDelete={utilityEditMode}
                        onEnterEditMode={() => setUtilityEditMode(true)}
                        onRemove={() => handleRemoveBuiltinUtility('alarm')}
                        onClick={() => handleUtilityTool('alarm')}
                      >
                        <AccessAlarmOutlinedIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                      </UtilityBarIconButton>
                    )}
                    {builtinUtilityIds.includes('calendar') && (
                      <UtilityBarIconButton
                        label="Calendar"
                        iconSx={utilityIconSx}
                        is960={is960}
                        showDelete={utilityEditMode}
                        onEnterEditMode={() => setUtilityEditMode(true)}
                        onRemove={() => handleRemoveBuiltinUtility('calendar')}
                        onClick={() => handleUtilityTool('calendar')}
                      >
                        <CalendarMonthOutlinedIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                      </UtilityBarIconButton>
                    )}
                    {builtinUtilityIds.includes('daycountdown') && (
                      <UtilityBarIconButton
                        label="Day countdown"
                        iconSx={utilityIconSx}
                        is960={is960}
                        showDelete={utilityEditMode}
                        onEnterEditMode={() => setUtilityEditMode(true)}
                        onRemove={() => handleRemoveBuiltinUtility('daycountdown')}
                        onClick={() => handleUtilityTool('daycountdown')}
                      >
                        <TodayOutlinedIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                      </UtilityBarIconButton>
                    )}
                    {builtinUtilityIds.includes('pomodoro') && (
                      <UtilityBarIconButton
                        label="Pomodoro"
                        iconSx={{ ...utilityIconSx, color: '#EF4444' }}
                        is960={is960}
                        showDelete={utilityEditMode}
                        onEnterEditMode={() => setUtilityEditMode(true)}
                        onRemove={() => handleRemoveBuiltinUtility('pomodoro')}
                        onClick={() => handleUtilityTool('pomodoro')}
                      >
                        <HourglassEmptyOutlinedIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                      </UtilityBarIconButton>
                    )}
                    {installedUtilityTools.map((tool) => (
                      <UtilityToolButton
                        key={tool.id}
                        tool={tool}
                        iconSx={utilityIconSx}
                        is960={is960}
                        showDelete={utilityEditMode}
                        onEnterEditMode={() => setUtilityEditMode(true)}
                        onRemove={() => handleRemoveUtilityTool(tool.id)}
                        onLaunch={() => handleUtilityToolLaunch(tool)}
                      />
                    ))}
                    {utilityToolIds.length < MAX_UTILITY_TOOLS && (
                    <ButtonBase
                      onClick={() => {
                        setUtilityEditMode(false);
                        setShowUtilityToolsCatalog(true);
                      }}
                      aria-label="Add system tools"
                      sx={utilityAddSx}
                    >
                      <AddIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                    </ButtonBase>
                    )}
                  </Box>
                </Box>

                {/* App grid — fills remaining panel height */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: is960 ? 280 : 320,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
                    gap: is960 ? 0.9 : 1.1,
                    alignItems: 'stretch',
                  }}
                >
                  <ButtonBase
                    onClick={() => navigate('/pinyin-chart', { state: { from: '/apps' } })}
                    sx={{
                      gridColumn: '1 / 2',
                      gridRow: '1 / 3',
                      borderRadius: tileRadius,
                      p: is960 ? 1.35 : 1.65,
                      bgcolor: '#FF6B35',
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
                      Pinyin<br />Chart
                    </Typography>
                    <TranslateIcon
                      sx={{
                        position: 'absolute',
                        right: is960 ? 10 : 14,
                        bottom: is960 ? 6 : 10,
                        fontSize: is960 ? 92 : 118,
                        color: 'rgba(255,255,255,0.82)',
                        transform: 'rotate(-8deg)',
                      }}
                    />
                  </ButtonBase>
                  <AppGridTile
                    label="FlashCards"
                    path="/lingo-flash"
                    bg="#2563EB"
                    icon={StyleIcon}
                    gridColumn={2}
                    gridRow={1}
                    is960={is960}
                    tileRadius={tileRadius}
                    tilePadX={tilePadX}
                    tilePadY={tilePadY}
                    tileIconBox={tileIconBox}
                    tileIconSize={tileIconSize}
                    tileLabelSize={tileLabelSize}
                    onNavigate={(path) => navigate(path, { state: { from: '/apps' } })}
                  />
                  <AppGridTile
                    label="Favorites"
                    path="/favorites"
                    bg="#F59E0B"
                    icon={BookmarkIcon}
                    gridColumn={3}
                    gridRow={1}
                    is960={is960}
                    tileRadius={tileRadius}
                    tilePadX={tilePadX}
                    tilePadY={tilePadY}
                    tileIconBox={tileIconBox}
                    tileIconSize={tileIconSize}
                    tileLabelSize={tileLabelSize}
                    onNavigate={(path) => navigate(path, { state: { from: '/apps' } })}
                  />

                  <ButtonBase
                    onClick={() => navigate('/character-writing', { state: { from: '/apps' } })}
                    sx={{
                      gridColumn: '1 / 2',
                      gridRow: '3 / 5',
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

                  {extraApps.map((app, index) => (
                    <Box
                      key={app.id}
                      sx={{
                        gridColumn: DYNAMIC_APP_SLOTS[index].col,
                        gridRow: DYNAMIC_APP_SLOTS[index].row,
                        minHeight: 0,
                        height: '100%',
                      }}
                    >
                      <ExtraAppTile
                        app={app}
                        is960={is960}
                        tileRadius={tileRadius}
                        tilePadX={tilePadX}
                        tilePadY={tilePadY}
                        tileIconBox={tileIconBox}
                        tileIconSize={tileIconSize}
                        tileLabelSize={tileLabelSize}
                        isDeleteMode={appEditMode}
                        onEnterEditMode={() => setAppEditMode(true)}
                        onRemove={() => handleRemoveExtraApp(app.id)}
                        onLaunch={() => {
                          setToastMessage(`${app.label} is installed on this device.`);
                          setShowToast(true);
                        }}
                      />
                    </Box>
                  ))}

                  {extraApps.length < MAX_EXTRA_APPS && (
                    <ButtonBase
                      key="add-app-slot"
                      onClick={() => {
                        setAppEditMode(false);
                        navigate('/apps-catalog', { state: { from: '/apps' } });
                      }}
                      sx={{
                        gridColumn: DYNAMIC_APP_SLOTS[extraApps.length].col,
                        gridRow: DYNAMIC_APP_SLOTS[extraApps.length].row,
                        minHeight: 0,
                        height: '100%',
                        borderRadius: tileRadius,
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
                  )}
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
                  gap: is960 ? 1 : 1.25,
                  overflow: 'hidden',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : (is1920x1125 ? '1.35rem' : '1.15rem'), color: '#1F2937', flexShrink: 0, mb: is960 ? 0.15 : 0.25 }}>
                  System settings
                </Typography>
                <Box
                  sx={{
                    flexShrink: 0,
                    borderRadius: is960 ? '12px' : '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)',
                    bgcolor: '#FAFBFC',
                  }}
                >
                  <SettingsNavRow label="Language Packs" onClick={handleLanguagePackUpdate} is960={is960} />
                  <SettingsNavRow label="Content Management" onClick={handleContentManagement} is960={is960} />
                  <SettingsNavRow
                    label="APK Upgrade"
                    onClick={handleOpenNskStore}
                    badgeCount={pendingUpdates}
                    is960={is960}
                  />
                  <SettingsNavRow
                    label="Parental Controls"
                    onClick={() => navigate('/parental-controls', { state: { from: '/apps' } })}
                    is960={is960}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    minHeight: is960 ? 62 : 68,
                    py: is960 ? 1 : 1.15,
                    pl: is960 ? 1.35 : 1.65,
                    pr: is960 ? 1.15 : 1.35,
                    flexShrink: 0,
                    borderRadius: is960 ? '12px' : '14px',
                    border: '1px solid',
                    borderColor: blueLightFilter ? 'rgba(251, 191, 36, 0.45)' : 'rgba(0,0,0,0.06)',
                    transition: 'background 0.25s ease, box-shadow 0.25s ease',
                    ...(blueLightFilter
                      ? {
                          background:
                            'linear-gradient(105deg, rgba(255,251,235,0.98) 0%, rgba(254,243,199,0.95) 45%, rgba(255,247,237,0.98) 100%)',
                          boxShadow: '0 2px 12px rgba(245, 158, 11, 0.12)',
                        }
                      : { bgcolor: '#FAFBFC' }),
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.98rem', color: '#374151', fontWeight: 700 }}>
                      Eye Protection
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.72rem' : '0.82rem',
                        color: blueLightFilter ? '#B45309' : '#9CA3AF',
                        fontWeight: blueLightFilter ? 600 : 500,
                        mt: 0.35,
                        lineHeight: 1.35,
                      }}
                    >
                      {blueLightFilter ? 'Warm tint · eye care' : 'Warm tint · 20-20-20'}
                    </Typography>
                  </Box>
                  <ButtonBase
                    onClick={() => setBlueLightFilter((on) => !on)}
                    aria-label={blueLightFilter ? 'Eye protection on, tap to turn off' : 'Eye protection off, tap to turn on'}
                    sx={{
                      flexShrink: 0,
                      minWidth: is960 ? 48 : 54,
                      minHeight: is960 ? 32 : 36,
                      px: is960 ? 1.15 : 1.35,
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      fontSize: is960 ? '0.68rem' : '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                      ...(blueLightFilter
                        ? {
                            color: '#B45309',
                            bgcolor: 'rgba(255, 255, 255, 0.92)',
                            border: '1px solid rgba(251, 191, 36, 0.85)',
                            boxShadow: '0 1px 4px rgba(245, 158, 11, 0.25)',
                          }
                        : {
                            color: '#64748B',
                            bgcolor: '#EEF2F7',
                            border: '1px solid rgba(0,0,0,0.08)',
                          }),
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    {blueLightFilter ? 'ON' : 'OFF'}
                  </ButtonBase>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                    mt: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: is960 ? 1 : 1.25,
                    minHeight: is960 ? 64 : 72,
                    p: is960 ? 1.1 : 1.35,
                    borderRadius: is960 ? '12px' : '14px',
                    bgcolor: '#FAFBFC',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <ButtonBase
                    onClick={() => navigate('/android/home', { state: { from: '/apps' } })}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: is960 ? 1.1 : 1.25,
                      borderRadius: is960 ? '10px' : '12px',
                      textAlign: 'left',
                      py: is960 ? 0.25 : 0.35,
                      pl: is960 ? 0.35 : 0.5,
                      '&:active': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 46 : 52,
                        height: is960 ? 46 : 52,
                        borderRadius: is960 ? '13px' : '14px',
                        bgcolor: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(17,24,39,0.18)',
                      }}
                    >
                      <AndroidIcon sx={{ fontSize: is960 ? 26 : 28, color: '#3DDC84' }} />
                    </Box>
                    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.98rem', color: '#374151', fontWeight: 700, lineHeight: 1.25 }}>
                        Android Platform
                      </Typography>
                    </Box>
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => navigate('/android/settings', { state: { from: '/apps' } })}
                    sx={{
                      width: is960 ? 44 : 46,
                      height: is960 ? 44 : 46,
                      minWidth: is960 ? 44 : 46,
                      minHeight: is960 ? 44 : 46,
                      borderRadius: '50%',
                      bgcolor: '#EEF2F7',
                      color: '#475569',
                      flexShrink: 0,
                      '&:active': { bgcolor: '#E2E8F0', transform: 'scale(0.96)' },
                    }}
                    aria-label="Android settings"
                  >
                    <SettingsOutlinedIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                  </ButtonBase>
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

      {/* Day Countdown Modal */}
      {showDayCountdown && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowDayCountdown(false)}>
          <Box sx={{ bgcolor: 'white', borderRadius: is960 ? '24px' : '32px', p: is960 ? 4 : 6, maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <TodayOutlinedIcon sx={{ fontSize: is960 ? 48 : 56, color: '#2563EB', mb: 1.5 }} />
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#6B7280', mb: 1 }}>
              Days until target
            </Typography>
            <Typography sx={{ fontSize: is960 ? '3.5rem' : '4rem', fontWeight: 900, color: '#111827', lineHeight: 1, mb: 0.5 }}>
              {daysUntilTarget}
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', color: '#9CA3AF', mb: 2.5 }}>
              days left
            </Typography>
            <Box sx={{ mb: 2.5, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', mb: 0.75 }}>Target date</Typography>
              <Box
                component="input"
                type="date"
                value={countdownTarget}
                onChange={(e) => handleCountdownTargetChange(e.target.value)}
                sx={{
                  width: '100%',
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#111827',
                  boxSizing: 'border-box',
                }}
              />
            </Box>
            <ButtonBase onClick={() => setShowDayCountdown(false)} sx={{ width: '100%', py: 1.75, borderRadius: '16px', bgcolor: '#00B4A0', color: 'white', fontWeight: 900 }}>
              Close
            </ButtonBase>
          </Box>
        </Box>
      )}

      {/* Pomodoro Modal */}
      {showPomodoro && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowPomodoro(false)}>
          <Box sx={{ bgcolor: 'white', borderRadius: is960 ? '24px' : '32px', p: is960 ? 4 : 6, maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <HourglassEmptyOutlinedIcon sx={{ fontSize: is960 ? 48 : 56, color: '#EF4444', mb: 1.5 }} />
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.15rem', color: '#111827', mb: 0.5 }}>
              Pomodoro
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#9CA3AF', mb: 2 }}>
              Focus session · default 25:00
            </Typography>
            <Typography sx={{ fontSize: is960 ? '2.75rem' : '3.25rem', fontWeight: 900, color: '#EF4444', fontFamily: 'monospace', mb: 2 }}>
              {formatCountdown(pomodoroSecondsLeft)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
              {[
                { label: '25m', seconds: 25 * 60 },
                { label: '15m', seconds: 15 * 60 },
                { label: '5m', seconds: 5 * 60 },
              ].map((preset) => (
                <ButtonBase
                  key={preset.label}
                  onClick={() => { setPomodoroSecondsLeft(preset.seconds); setPomodoroRunning(false); }}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    px: 1.5,
                    borderRadius: '12px',
                    bgcolor: pomodoroSecondsLeft === preset.seconds ? '#EF4444' : '#FEF2F2',
                    color: pomodoroSecondsLeft === preset.seconds ? 'white' : '#EF4444',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  {preset.label}
                </ButtonBase>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center', mb: 2 }}>
              <ButtonBase onClick={() => setPomodoroRunning((r) => !r)} sx={{ minHeight: 44, px: 2.5, borderRadius: '14px', bgcolor: '#EF4444', color: 'white', fontWeight: 800 }}>
                {pomodoroRunning ? 'Pause' : 'Start'}
              </ButtonBase>
              <ButtonBase onClick={() => { setPomodoroRunning(false); setPomodoroSecondsLeft(POMODORO_SECONDS); }} sx={{ minHeight: 44, px: 2.5, borderRadius: '14px', bgcolor: '#F3F4F6', color: '#374151', fontWeight: 800 }}>
                Reset
              </ButtonBase>
            </Box>
            <ButtonBase onClick={() => setShowPomodoro(false)} sx={{ width: '100%', py: 1.75, borderRadius: '16px', bgcolor: '#00B4A0', color: 'white', fontWeight: 900 }}>
              Close
            </ButtonBase>
          </Box>
        </Box>
      )}

      {/* Utility Tools Catalog Modal — portaled above iPad shell */}
      {showUtilityToolsCatalog && createPortal(
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 15000, pt: '6vh', px: 2 }} onClick={() => setShowUtilityToolsCatalog(false)}>
          <Box sx={{ bgcolor: 'white', borderRadius: is960 ? '24px' : '28px', p: is960 ? 2.5 : 3, maxWidth: 520, width: '92%', maxHeight: '84vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#111827', mb: 0.5 }}>
              Add System Tools
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#9CA3AF', mb: 2 }}>
              Pin up to {MAX_UTILITY_TOOLS} custom tools · {utilityToolIds.length}/{MAX_UTILITY_TOOLS} used · long-press toolbar to remove
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B7280', letterSpacing: '0.04em', px: 0.5 }}>BUILT-IN TOOLS</Typography>
              {BUILTIN_UTILITY_ITEMS.map((item) => {
                const installed = builtinUtilityIds.includes(item.id);
                const Icon = BUILTIN_ICONS[item.id];
                return (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '16px', border: '1px solid #F1F3F5' }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${item.color}18`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#9CA3AF' }}>{item.description}</Typography>
                    </Box>
                    <ButtonBase
                      onClick={() => handleToggleBuiltinUtility(item.id)}
                      sx={{ minWidth: 44, minHeight: 44, px: 1.25, borderRadius: '12px', bgcolor: installed ? '#ECFDF5' : '#EFF6FF', color: installed ? '#059669' : '#2563EB', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {installed ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                      {installed ? 'Added' : 'Add'}
                    </ButtonBase>
                  </Box>
                );
              })}
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B7280', letterSpacing: '0.04em', px: 0.5, mt: 0.5 }}>GOOGLE TOOLS</Typography>
              {GOOGLE_SYSTEM_TOOLS.map((tool) => {
                const installed = utilityToolIds.includes(tool.id);
                const atLimit = !installed && utilityToolIds.length >= MAX_UTILITY_TOOLS;
                const Icon = UTILITY_TOOL_ICONS[tool.id] ?? SettingsOutlinedIcon;
                return (
                  <Box key={tool.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '16px', border: '1px solid #F1F3F5', opacity: atLimit ? 0.55 : 1 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${tool.color}18`, color: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>{tool.label}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#9CA3AF' }}>{tool.description}</Typography>
                    </Box>
                    <ButtonBase
                      onClick={() => handleToggleUtilityTool(tool.id)}
                      disabled={atLimit}
                      sx={{ minWidth: 44, minHeight: 44, px: 1.25, borderRadius: '12px', bgcolor: installed ? '#ECFDF5' : '#EFF6FF', color: installed ? '#059669' : '#2563EB', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {installed ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                      {installed ? 'Added' : 'Add'}
                    </ButtonBase>
                  </Box>
                );
              })}
            </Box>
            <ButtonBase onClick={() => setShowUtilityToolsCatalog(false)} sx={{ mt: 2, width: '100%', py: 1.5, borderRadius: '14px', bgcolor: '#00B4A0', color: 'white', fontWeight: 900 }}>
              Done
            </ButtonBase>
          </Box>
        </Box>,
        document.body
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
