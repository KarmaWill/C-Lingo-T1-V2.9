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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HeadphonesIcon from '@mui/icons-material/Headphones';
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
import {
  EXPLORE_BUILTIN_APPS,
  loadExploreBuiltinIds,
  removeExploreBuiltin,
  type ExploreBuiltinId,
} from '../data/exploreAppsConfig';
import { useLongPress } from '../utils/useLongPress';
import type { ReactNode } from 'react';
import HubLangProfile from '../components/home/HubLangProfile';
import HubContainBoard from '../components/home/HubContainBoard';
import { StudioHomeFrame } from '../components/home/StudioHomeHeader';
import HubPagerDots from '../components/home/HubPagerDots';
import {
  EXPLORE_MAIN1,
  HUB_CANVAS_CLINGO,
  HUB_FRAME_PAD_TOP,
  HUB_FRAME_PAD_X,
  HUB_SURFACE,
  HUB_SURFACE_SHADOW,
} from '../components/home/hubChrome';
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';

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

const EXPLORE_APP_ICONS: Record<ExploreBuiltinId, SvgIconComponent> = {
  tutor: SmartToyIcon,
  pinyin: HeadphonesIcon,
  flashcards: StyleIcon,
  favorites: BookmarkIcon,
  writing: EditNoteIcon,
};

function ExtraAppTile({
  app,
  screenSize,
  isDeleteMode,
  onEnterEditMode,
  onRemove,
  onLaunch,
}: {
  app: CatalogApp;
  screenSize: string;
  isDeleteMode: boolean;
  onEnterEditMode: () => void;
  onRemove: () => void;
  onLaunch: () => void;
}) {
  return (
    <ExploreAppIcon
      screenSize={screenSize}
      label={app.label}
      bg={app.bg}
      showDelete={isDeleteMode}
      onEnterEditMode={onEnterEditMode}
      onRemove={onRemove}
      onClick={onLaunch}
    />
  );
}

function SettingsChevron({ size }: { size: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.38,
          height: size * 0.38,
          borderRight: '3px solid #A7B3B8',
          borderBottom: '3px solid #A7B3B8',
          transform: 'translate(-70%, -50%) rotate(-45deg)',
        }}
      />
    </Box>
  );
}

function SettingsNavRow({
  label,
  onClick,
  badgeCount,
  screenSize,
}: {
  label: string;
  onClick: () => void;
  badgeCount?: number;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: `${p(10)}px`,
        minHeight: 0,
        py: `${p(10)}px`,
        borderBottom: '2px solid #E0E0DF',
        borderRadius: 0,
        textAlign: 'left',
        '&:last-child': { borderBottom: 'none' },
        '&:active': { bgcolor: 'rgba(99,110,114,0.06)' },
      }}
    >
      <Typography
        sx={{
          fontSize: p(22),
          lineHeight: `${p(28)}px`,
          color: '#636E72',
          fontWeight: 700,
          fontFamily: FIGMA_FONT,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(8)}px`, flexShrink: 0 }}>
        {showBadge && (
          <Box
            aria-label={`${badgeCount} updates available`}
            sx={{
              minWidth: p(22),
              height: p(22),
              px: `${p(6)}px`,
              borderRadius: '999px',
              bgcolor: '#F94B4B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: p(13),
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: FIGMA_FONT,
            }}
          >
            {badgeCount}
          </Box>
        )}
        <SettingsChevron size={p(28)} />
      </Box>
    </ButtonBase>
  );
}

function ExploreHeader({ screenSize }: { screenSize: string }) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <Box
      sx={{
        flexShrink: 0,
        mx: `-${p(HUB_FRAME_PAD_X)}px`,
        mt: `-${p(HUB_FRAME_PAD_TOP)}px`,
        mb: `${p(20)}px`,
        px: `${p(HUB_FRAME_PAD_X)}px`,
        pt: `${p(16)}px`,
        pb: `${p(16)}px`,
        bgcolor: HUB_SURFACE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: p(90),
        gap: `${p(24)}px`,
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: p(48),
          lineHeight: `${p(70)}px`,
          color: '#2D3436',
          fontFamily: FIGMA_FONT,
          whiteSpace: 'nowrap',
        }}
      >
        Explore
      </Typography>
      <HubLangProfile screenSize={screenSize} />
    </Box>
  );
}

function ExploreAppIcon({
  screenSize,
  label,
  bg,
  icon: Icon,
  onClick,
  addSlot,
  showDelete = false,
  onEnterEditMode,
  onRemove,
}: {
  screenSize: string;
  label?: string;
  bg?: string;
  icon?: SvgIconComponent;
  onClick: () => void;
  addSlot?: boolean;
  showDelete?: boolean;
  onEnterEditMode?: () => void;
  onRemove?: () => void;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  const longPress = useLongPress(() => {
    onEnterEditMode?.();
  });
  const badge = p(32);

  return (
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0, overflow: 'visible' }}>
      <ButtonBase
        {...(onEnterEditMode ? longPress : {})}
        onContextMenu={(e) => {
          if (!onEnterEditMode) return;
          e.preventDefault();
          onEnterEditMode();
        }}
        onClick={() => {
          if (onEnterEditMode && longPress.consumeLongPress()) return;
          if (showDelete) return;
          onClick();
        }}
        aria-label={label || 'Add more apps'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          minWidth: 0,
          bgcolor: 'transparent',
          WebkitTapHighlightColor: 'transparent',
          '&:active': { transform: showDelete ? 'none' : 'scale(0.96)' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            maxWidth: p(EXPLORE_MAIN1.icon),
            borderRadius: `${p(EXPLORE_MAIN1.iconRadius)}px`,
            bgcolor: addSlot ? '#FFFFFF' : bg,
            border: '2px solid #E0E0DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
            opacity: showDelete ? 0.88 : 1,
            transform: showDelete ? 'scale(0.96)' : 'none',
          }}
        >
          {addSlot ? (
            <Box
              sx={{
                width: '28%',
                height: '28%',
                position: 'relative',
              }}
            >
              <Box sx={{ position: 'absolute', left: 0, right: 0, top: '46%', height: '12%', bgcolor: '#A7B3B8', borderRadius: 49 }} />
              <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '46%', width: '12%', bgcolor: '#A7B3B8', borderRadius: 49 }} />
            </Box>
          ) : (
            Icon && <Icon sx={{ fontSize: '50%', color: '#FFFFFF', width: '52%', height: '52%' }} />
          )}
        </Box>
        <Typography
          aria-hidden={!label}
          sx={{
            mt: `${p(4)}px`,
            fontSize: p(18),
            lineHeight: 1.2,
            fontWeight: 700,
            color: '#000000',
            fontFamily: FIGMA_FONT,
            textAlign: 'center',
            width: '100%',
            visibility: label ? 'visible' : 'hidden',
          }}
        >
          {label || 'Add'}
        </Typography>
      </ButtonBase>
      {showDelete && onRemove && (
        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          sx={{
            position: 'absolute',
            top: -p(6),
            right: `calc((100% - min(100%, ${p(EXPLORE_MAIN1.icon)}px)) / 2 - ${p(8)}px)`,
            width: badge,
            height: badge,
            minWidth: badge,
            minHeight: badge,
            borderRadius: '50%',
            bgcolor: '#EF4444',
            color: 'white',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(239,68,68,0.45)',
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <CloseIcon sx={{ fontSize: p(18) }} />
        </ButtonBase>
      )}
    </Box>
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
  const [exploreBuiltinIds, setExploreBuiltinIds] = useState(() => loadExploreBuiltinIds());
  const [utilityEditMode, setUtilityEditMode] = useState(false);
  const [appEditMode, setAppEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const pendingUpdates = getPendingAppUpdatesCount();

  const screenSize = APP_SCREEN_SIZE
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'
  const p = (n: number) => figmaPx(n, screenSize)

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

  const utilityIconSx = {
    width: p(78),
    height: p(78),
    borderRadius: `${p(24)}px`,
    bgcolor: '#EBEBEB',
    color: '#334155',
    '&:active': { bgcolor: '#E0E0DF' },
    transition: 'background 0.15s',
  } as const;

  const utilityAddSx = {
    width: p(78),
    height: p(78),
    borderRadius: `${p(24)}px`,
    border: '3px dashed #D9E1EA',
    bgcolor: '#FFFFFF',
    color: '#91A4BE',
    '&:active': { bgcolor: '#F8F8F8' },
    transition: 'background 0.15s',
  } as const;

  return (
    <>
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_CLINGO}>
      <ExploreHeader screenSize={screenSize} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: `${p(EXPLORE_MAIN1.left)}fr ${p(EXPLORE_MAIN1.right)}fr`,
          gap: `${p(EXPLORE_MAIN1.gap)}px`,
          alignItems: 'stretch',
        }}
      >
              <Box
                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  bgcolor: HUB_SURFACE,
                  borderRadius: `${p(EXPLORE_MAIN1.cardRadius)}px`,
                  p: `${p(28)}px`,
                  boxShadow: HUB_SURFACE_SHADOW,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 0.72fr) minmax(0, 1fr)',
                  gap: `${p(24)}px`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    bgcolor: '#F8F8F8',
                    borderRadius: `${p(EXPLORE_MAIN1.clockRadius)}px`,
                    px: `${p(28)}px`,
                    pt: `${p(22)}px`,
                    pb: `${p(22)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: p(100),
                      fontWeight: 700,
                      color: '#263244',
                      fontFamily: FIGMA_FONT,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {timeString}
                  </Typography>
                  <Typography
                    sx={{
                      mt: `${p(10)}px`,
                      fontSize: p(36),
                      fontWeight: 700,
                      color: '#263244',
                      fontFamily: FIGMA_FONT,
                      lineHeight: `${p(46)}px`,
                      flexShrink: 0,
                    }}
                  >
                    {dateInfo.month} {dateInfo.day} · {dateInfo.weekday}
                  </Typography>
                  <Box
                    sx={{
                      mt: `${p(28)}px`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: `${p(14)}px`,
                      alignItems: 'center',
                      minHeight: 0,
                      overflow: 'auto',
                    }}
                  >
                    {utilityEditMode && (
                      <ButtonBase
                        onClick={() => setUtilityEditMode(false)}
                        sx={{
                          minHeight: p(36),
                          px: `${p(14)}px`,
                          borderRadius: `${p(12)}px`,
                          bgcolor: '#111827',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: p(14),
                          fontFamily: FIGMA_FONT,
                        }}
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
                        <AccessAlarmOutlinedIcon sx={{ fontSize: p(32) }} />
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
                        <CalendarMonthOutlinedIcon sx={{ fontSize: p(32) }} />
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
                        <TodayOutlinedIcon sx={{ fontSize: p(32) }} />
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
                        <HourglassEmptyOutlinedIcon sx={{ fontSize: p(32) }} />
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
                      <AddIcon sx={{ fontSize: p(36) }} />
                    </ButtonBase>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    alignContent: 'start',
                    gap: `${p(16)}px ${p(18)}px`,
                    overflow: 'auto',
                    pt: `${p(16)}px`,
                  }}
                >
                  {exploreBuiltinIds.map((id) => {
                    const app = EXPLORE_BUILTIN_APPS.find((item) => item.id === id);
                    if (!app) return null;
                    const Icon = EXPLORE_APP_ICONS[app.id];
                    return (
                      <ExploreAppIcon
                        key={app.id}
                        screenSize={screenSize}
                        label={app.label}
                        bg={app.bg}
                        icon={Icon}
                        showDelete={appEditMode}
                        onEnterEditMode={() => setAppEditMode(true)}
                        onRemove={() => setExploreBuiltinIds(removeExploreBuiltin(app.id))}
                        onClick={() => navigate(app.path, { state: { from: '/apps' } })}
                      />
                    );
                  })}
                  {extraApps.map((app) => (
                    <ExtraAppTile
                      key={app.id}
                      app={app}
                      screenSize={screenSize}
                      isDeleteMode={appEditMode}
                      onEnterEditMode={() => setAppEditMode(true)}
                      onRemove={() => handleRemoveExtraApp(app.id)}
                      onLaunch={() => {
                        setToastMessage(`${app.label} is installed on this device.`);
                        setShowToast(true);
                      }}
                    />
                  ))}
                  {extraApps.length < MAX_EXTRA_APPS && (
                    <ExploreAppIcon
                      screenSize={screenSize}
                      addSlot
                      onEnterEditMode={() => setAppEditMode(true)}
                      onClick={() => {
                        setAppEditMode(false);
                        navigate('/apps-catalog', { state: { from: '/apps' } });
                      }}
                    />
                  )}
                  {appEditMode && (
                    <ButtonBase
                      onClick={() => setAppEditMode(false)}
                      sx={{
                        alignSelf: 'flex-start',
                        minHeight: p(36),
                        px: `${p(14)}px`,
                        borderRadius: `${p(12)}px`,
                        bgcolor: '#111827',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: p(14),
                        fontFamily: FIGMA_FONT,
                      }}
                    >
                      Done
                    </ButtonBase>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <HubContainBoard width={EXPLORE_MAIN1.settingsW} height={EXPLORE_MAIN1.settingsH}>
                  <Box
                    sx={{
                      width: EXPLORE_MAIN1.settingsW,
                      height: EXPLORE_MAIN1.settingsH,
                      bgcolor: HUB_SURFACE,
                      borderRadius: `${EXPLORE_MAIN1.settingsRadius}px`,
                      boxShadow: '0px 4px 20px rgba(213, 213, 213, 0.6)',
                      px: '32px',
                      pt: '36px',
                      pb: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      fontFamily: FIGMA_FONT,
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        mb: '20px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 36,
                          lineHeight: '46px',
                          color: '#2D3436',
                          fontFamily: FIGMA_FONT,
                        }}
                      >
                        System settings
                      </Typography>
                      <ButtonBase
                        onClick={handleContentManagement}
                        aria-label="Content Management"
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '2px solid #E0E0DF',
                          color: '#C5C9CE',
                          flexShrink: 0,
                        }}
                      >
                        <AddIcon sx={{ fontSize: 26 }} />
                      </ButtonBase>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                      <ButtonBase
                        onClick={handleLanguagePackUpdate}
                        sx={{
                          display: 'flex',
                          width: '100%',
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: 0,
                          py: '16px',
                          borderBottom: '2px solid #E0E0DF',
                          borderRadius: 0,
                          textAlign: 'left',
                          '&:active': { bgcolor: 'rgba(99,110,114,0.06)' },
                        }}
                      >
                        <Typography sx={{ fontSize: 28, lineHeight: '36px', color: '#636E72', fontWeight: 700, fontFamily: FIGMA_FONT }}>
                          Language Packs
                        </Typography>
                        <SettingsChevron size={28} />
                      </ButtonBase>
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          minHeight: 0,
                          py: '16px',
                          borderBottom: '2px solid #E0E0DF',
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontSize: 28, lineHeight: '36px', color: '#636E72', fontWeight: 700, fontFamily: FIGMA_FONT }}>
                            Eye Protection
                          </Typography>
                          <Typography sx={{ fontSize: 20, lineHeight: '28px', color: '#A7B3B8', fontWeight: 400, fontFamily: FIGMA_FONT }}>
                            Warm tint - 20-20-20 reminder
                          </Typography>
                        </Box>
                        <ButtonBase
                          onClick={() => setBlueLightFilter((on) => !on)}
                          aria-label={blueLightFilter ? 'Eye protection on, tap to turn off' : 'Eye protection off, tap to turn on'}
                          sx={{
                            flexShrink: 0,
                            width: 64,
                            height: 32,
                            borderRadius: 999,
                            bgcolor: blueLightFilter ? '#00B4A0' : '#E0E0DF',
                            position: 'relative',
                            overflow: 'visible',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              ...(blueLightFilter ? { right: -4 } : { left: -4 }),
                              transform: 'translateY(-50%)',
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: '#FFFFFF',
                              boxShadow: '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
                            }}
                          />
                        </ButtonBase>
                      </Box>
                      <Box
                        sx={{
                          flex: 1.15,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '14px',
                          py: '18px',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 28, lineHeight: '36px', color: '#636E72', fontWeight: 700, fontFamily: FIGMA_FONT }}>
                            App Updates
                          </Typography>
                          <Typography sx={{ fontSize: 20, lineHeight: '28px', color: '#A7B3B8', fontWeight: 400, fontFamily: FIGMA_FONT }}>
                            {pendingUpdates > 0 ? `${pendingUpdates} update${pendingUpdates === 1 ? '' : 's'} available` : 'No current updates'}
                          </Typography>
                        </Box>
                        <ButtonBase
                          onClick={handleOpenNskStore}
                          sx={{
                            width: '100%',
                            height: 56,
                            borderRadius: 999,
                            bgcolor: '#F3F4F6',
                            color: '#2D3436',
                            fontWeight: 700,
                            fontSize: 20,
                            fontFamily: FIGMA_FONT,
                            letterSpacing: '0.04em',
                            '&:active': { bgcolor: '#E8EAED' },
                          }}
                        >
                          CHECK FOR UPDATES
                        </ButtonBase>
                      </Box>
                    </Box>
                    <ButtonBase
                      onClick={() => navigate('/android/settings', { state: { from: '/apps' } })}
                      sx={{
                        flexShrink: 0,
                        mt: '20px',
                        width: '100%',
                        height: EXPLORE_MAIN1.goBar,
                        px: '16px',
                        borderRadius: `${EXPLORE_MAIN1.goBarRadius}px`,
                        bgcolor: '#2D3436',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        overflow: 'hidden',
                        '&:active': { opacity: 0.92 },
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/android-12-icon.png"
                        alt=""
                        aria-hidden
                        sx={{
                          width: EXPLORE_MAIN1.goThumb,
                          height: EXPLORE_MAIN1.goThumb,
                          borderRadius: `${EXPLORE_MAIN1.goThumbRadius}px`,
                          flexShrink: 0,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          height: EXPLORE_MAIN1.goPill,
                          borderRadius: 999,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: EXPLORE_MAIN1.goFont,
                            lineHeight: 1.2,
                            color: '#FFFFFF',
                            fontFamily: FIGMA_FONT,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Go to Settings
                        </Typography>
                      </Box>
                    </ButtonBase>
                  </Box>
                </HubContainBoard>
              </Box>
      </Box>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>


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

      {/* Utility Tools Catalog — tablet sheet, same chrome as Explore */}
      {showUtilityToolsCatalog && createPortal(
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(45, 52, 54, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 15000,
            px: `${p(40)}px`,
            py: `${p(28)}px`,
            boxSizing: 'border-box',
          }}
          onClick={() => setShowUtilityToolsCatalog(false)}
        >
          <Box
            sx={{
              bgcolor: HUB_SURFACE,
              borderRadius: `${p(EXPLORE_MAIN1.cardRadius)}px`,
              p: `${p(32)}px`,
              width: '100%',
              maxWidth: p(1280),
              maxHeight: '100%',
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: HUB_SURFACE_SHADOW,
              boxSizing: 'border-box',
              fontFamily: FIGMA_FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: p(37),
                lineHeight: `${p(50)}px`,
                color: '#2D3436',
                fontFamily: FIGMA_FONT,
                flexShrink: 0,
              }}
            >
              Add System Tools
            </Typography>
            <Typography
              sx={{
                fontSize: p(21),
                lineHeight: `${p(34)}px`,
                color: '#A7B3B8',
                fontFamily: FIGMA_FONT,
                mb: `${p(20)}px`,
                flexShrink: 0,
              }}
            >
              Pin up to {MAX_UTILITY_TOOLS} tools · {utilityToolIds.length}/{MAX_UTILITY_TOOLS} used · long-press to remove
            </Typography>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: `${p(14)}px ${p(20)}px`,
                alignContent: 'start',
              }}
            >
              <Typography
                sx={{
                  gridColumn: '1 / -1',
                  fontSize: p(18),
                  fontWeight: 700,
                  color: '#636E72',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: FIGMA_FONT,
                }}
              >
                Built-in tools
              </Typography>
              {BUILTIN_UTILITY_ITEMS.map((item) => {
                const installed = builtinUtilityIds.includes(item.id);
                const Icon = BUILTIN_ICONS[item.id];
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(16)}px`,
                      p: `${p(16)}px`,
                      borderRadius: `${p(24)}px`,
                      border: '2px solid #E0E0DF',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Box
                      sx={{
                        width: p(64),
                        height: p(64),
                        borderRadius: `${p(18)}px`,
                        bgcolor: '#F3F4F6',
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: p(30) }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: p(24), color: '#2D3436', fontFamily: FIGMA_FONT, lineHeight: 1.25 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: p(18), color: '#A7B3B8', fontFamily: FIGMA_FONT, lineHeight: 1.4 }}>
                        {item.description}
                      </Typography>
                    </Box>
                    <ButtonBase
                      onClick={() => handleToggleBuiltinUtility(item.id)}
                      sx={{
                        minWidth: p(96),
                        minHeight: p(48),
                        px: `${p(16)}px`,
                        borderRadius: 999,
                        bgcolor: installed ? '#E8F8F5' : '#F3F4F6',
                        color: installed ? '#00B4A0' : '#2D3436',
                        fontWeight: 700,
                        fontSize: p(18),
                        fontFamily: FIGMA_FONT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${p(6)}px`,
                      }}
                    >
                      {installed ? <CheckCircleIcon sx={{ fontSize: p(20) }} /> : <AddCircleOutlineIcon sx={{ fontSize: p(20) }} />}
                      {installed ? 'Added' : 'Add'}
                    </ButtonBase>
                  </Box>
                );
              })}
              <Typography
                sx={{
                  gridColumn: '1 / -1',
                  mt: `${p(8)}px`,
                  fontSize: p(18),
                  fontWeight: 700,
                  color: '#636E72',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: FIGMA_FONT,
                }}
              >
                Extra tools
              </Typography>
              {GOOGLE_SYSTEM_TOOLS.map((tool) => {
                const installed = utilityToolIds.includes(tool.id);
                const atLimit = !installed && utilityToolIds.length >= MAX_UTILITY_TOOLS;
                const Icon = UTILITY_TOOL_ICONS[tool.id] ?? SettingsOutlinedIcon;
                return (
                  <Box
                    key={tool.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(16)}px`,
                      p: `${p(16)}px`,
                      borderRadius: `${p(24)}px`,
                      border: '2px solid #E0E0DF',
                      bgcolor: '#FFFFFF',
                      opacity: atLimit ? 0.45 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: p(64),
                        height: p(64),
                        borderRadius: `${p(18)}px`,
                        bgcolor: '#F3F4F6',
                        color: tool.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: p(30) }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: p(24), color: '#2D3436', fontFamily: FIGMA_FONT, lineHeight: 1.25 }}>
                        {tool.label}
                      </Typography>
                      <Typography sx={{ fontSize: p(18), color: '#A7B3B8', fontFamily: FIGMA_FONT, lineHeight: 1.4 }}>
                        {tool.description}
                      </Typography>
                    </Box>
                    <ButtonBase
                      onClick={() => handleToggleUtilityTool(tool.id)}
                      disabled={atLimit}
                      sx={{
                        minWidth: p(96),
                        minHeight: p(48),
                        px: `${p(16)}px`,
                        borderRadius: 999,
                        bgcolor: installed ? '#E8F8F5' : '#F3F4F6',
                        color: installed ? '#00B4A0' : '#2D3436',
                        fontWeight: 700,
                        fontSize: p(18),
                        fontFamily: FIGMA_FONT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${p(6)}px`,
                      }}
                    >
                      {installed ? <CheckCircleIcon sx={{ fontSize: p(20) }} /> : <AddCircleOutlineIcon sx={{ fontSize: p(20) }} />}
                      {installed ? 'Added' : 'Add'}
                    </ButtonBase>
                  </Box>
                );
              })}
            </Box>
            <ButtonBase
              onClick={() => setShowUtilityToolsCatalog(false)}
              sx={{
                mt: `${p(20)}px`,
                width: '100%',
                height: p(65),
                borderRadius: 999,
                bgcolor: '#2D3436',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: p(24),
                fontFamily: FIGMA_FONT,
                flexShrink: 0,
                '&:active': { opacity: 0.92 },
              }}
            >
              Done
            </ButtonBase>
          </Box>
        </Box>,
        document.getElementById('main-content-area') ?? document.getElementById('ipad-container') ?? document.body
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
