import { useState, useEffect, useCallback, type ReactNode } from 'react';
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
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import RadioIcon from '@mui/icons-material/Radio';
import type { SvgIconComponent } from '@mui/icons-material';
import { getInstalledExtraApps, removeInstalledExtraApp, MAX_EXTRA_APPS, type CatalogApp } from '../data/appsCatalog';
import { CatalogAppGlyph, catalogAppUsesFullBleedIcon } from '../components/apps/catalogAppIcons';
import { getPendingAppUpdatesCount } from '../data/appUpdatesCatalog';
import {
  GOOGLE_SYSTEM_TOOLS,
  getDaysUntil,
  loadCountdownTarget,
  loadInstalledUtilityToolIds,
  removeInstalledUtilityTool,
  saveCountdownTarget,
  saveInstalledUtilityToolIds,
  toggleInstalledUtilityTool,
  type SystemTool,
} from '../data/systemToolsCatalog';
import {
  BUILTIN_UTILITY_ITEMS,
  loadBuiltinUtilityIds,
  MAX_UTILITY_BAR_SLOTS,
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
import HubLangProfile from '../components/home/HubLangProfile';
import { StudioHomeFrame } from '../components/home/StudioHomeHeader';
import HubPagerDots from '../components/home/HubPagerDots';
import HubContainBoard from '../components/home/HubContainBoard';
import {
  EXPLORE_MAIN1,
  EXPLORE_PROMO_POSTER,
  EXPLORE_PROMO_POSTER_MAX,
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
    <Box sx={{ position: 'relative', flexShrink: 0, width: 'fit-content' }}>
      <ButtonBase
        {...longPress}
        onContextMenu={(e) => {
          e.preventDefault();
          onEnterEditMode();
        }}
        onClick={() => {
          if (longPress.consumeLongPress()) return;
          if (showDelete) return;
          onClick();
        }}
        aria-label={label}
        sx={{
          ...iconSx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(showDelete ? { opacity: 0.88, transform: 'scale(0.96)' } : {}),
        }}
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
            top: -4,
            right: -4,
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
      <Icon sx={{ fontSize: is960 ? 22 : 28 }} />
    </UtilityBarIconButton>
  );
}

const EXPLORE_APP_ICONS: Record<ExploreBuiltinId, SvgIconComponent> = {
  tutor: SmartToyIcon,
  'ai-fm': RadioIcon,
  pinyin: HeadphonesIcon,
  flashcards: StyleIcon,
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
  const fullBleed = catalogAppUsesFullBleedIcon(app.id);
  return (
    <ExploreAppIcon
      screenSize={screenSize}
      label={app.label}
      bg={fullBleed ? '#FFFFFF' : app.bg}
      glyph={<CatalogAppGlyph id={app.id} />}
      iconFlush={fullBleed}
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
  glyph,
  onClick,
  addSlot,
  showDelete = false,
  onEnterEditMode,
  onRemove,
  iconFlush = false,
}: {
  screenSize: string;
  label?: string;
  bg?: string;
  icon?: SvgIconComponent;
  glyph?: ReactNode;
  onClick: () => void;
  addSlot?: boolean;
  showDelete?: boolean;
  onEnterEditMode?: () => void;
  onRemove?: () => void;
  /** 整图 PNG（Gmail / YouTube 弥散标）铺满圆角方格 */
  iconFlush?: boolean;
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
            border: iconFlush ? '1px solid rgba(213,213,213,0.55)' : '2px solid #E0E0DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
            opacity: showDelete ? 0.88 : 1,
            transform: showDelete ? 'scale(0.96)' : 'none',
            boxShadow: iconFlush ? '0 6px 18px rgba(213,213,213,0.45)' : 'none',
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
          ) : glyph ? (
            glyph
          ) : Icon ? (
            <Icon sx={{ fontSize: '50%', color: '#FFFFFF', width: '52%', height: '52%' }} />
          ) : (
            <Box
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 800,
                fontSize: '42%',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {(label || '?').charAt(0)}
            </Box>
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
  const [utilityToolIds, setUtilityToolIds] = useState(() => {
    const builtins = loadBuiltinUtilityIds();
    const customs = loadInstalledUtilityToolIds();
    const room = Math.max(0, MAX_UTILITY_BAR_SLOTS - builtins.length);
    const trimmed = customs.slice(0, room);
    if (trimmed.length !== customs.length) saveInstalledUtilityToolIds(trimmed);
    return trimmed;
  });
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

  const utilitySlotCount = builtinUtilityIds.length + utilityToolIds.length;
  const canAddUtilitySlot = utilitySlotCount < MAX_UTILITY_BAR_SLOTS;

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
    const result = toggleInstalledUtilityTool(toolId, utilitySlotCount);
    if (!result.ok) {
      setToastMessage(`Utility bar supports up to ${MAX_UTILITY_BAR_SLOTS} tools. Remove one first.`);
      setShowToast(true);
      return;
    }
    setUtilityToolIds(result.ids);
  };

  const handleRemoveUtilityTool = (toolId: string) => {
    setUtilityToolIds(removeInstalledUtilityTool(toolId));
  };

  const handleRemoveBuiltinUtility = (id: BuiltinUtilityId) => {
    setBuiltinUtilityIds(removeBuiltinUtility(id));
  };

  const handleToggleBuiltinUtility = (id: BuiltinUtilityId) => {
    const result = toggleBuiltinUtility(id, utilitySlotCount);
    if (!result.ok) {
      setToastMessage(`Utility bar supports up to ${MAX_UTILITY_BAR_SLOTS} tools. Remove one first.`);
      setShowToast(true);
      return;
    }
    setBuiltinUtilityIds(result.ids);
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
  /** 时钟卡 / 视频位 / System settings 同宽 */
  const sideRailW = p(EXPLORE_MAIN1.settingsW);
  /** 稿上时钟卡约 704 宽；落入 settingsW 栏时等比缩放出数 */
  const clockScale = EXPLORE_MAIN1.settingsW / EXPLORE_MAIN1.clockFigmaW;
  const cp = (n: number) => p(n * clockScale);
  const toolSize = cp(EXPLORE_MAIN1.clockTool);

  const utilityIconSx = {
    width: toolSize,
    height: toolSize,
    borderRadius: `${cp(22)}px`,
    bgcolor: '#EBEBEB',
    color: '#263244',
    '&:active': { bgcolor: '#E0E0DF' },
    transition: 'background 0.15s',
  } as const;

  const utilityAddSx = {
    width: toolSize,
    height: toolSize,
    borderRadius: `${cp(22)}px`,
    border: '3px dashed #D9E1EA',
    bgcolor: '#FFFFFF',
    color: '#91A4BE',
    '&:active': { bgcolor: '#F8F8F8' },
    transition: 'background 0.15s',
  } as const;

  const utilitySlotNodes: ReactNode[] = [];
  if (builtinUtilityIds.includes('alarm')) {
    utilitySlotNodes.push(
      <UtilityBarIconButton
        key="alarm"
        label="Alarm"
        iconSx={utilityIconSx}
        is960={is960}
        showDelete={utilityEditMode}
        onEnterEditMode={() => setUtilityEditMode(true)}
        onRemove={() => handleRemoveBuiltinUtility('alarm')}
        onClick={() => handleUtilityTool('alarm')}
      >
        <AccessAlarmOutlinedIcon sx={{ fontSize: toolSize * 0.42 }} />
      </UtilityBarIconButton>,
    );
  }
  if (builtinUtilityIds.includes('calendar')) {
    utilitySlotNodes.push(
      <UtilityBarIconButton
        key="calendar"
        label="Calendar"
        iconSx={utilityIconSx}
        is960={is960}
        showDelete={utilityEditMode}
        onEnterEditMode={() => setUtilityEditMode(true)}
        onRemove={() => handleRemoveBuiltinUtility('calendar')}
        onClick={() => handleUtilityTool('calendar')}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: toolSize * 0.42 }} />
      </UtilityBarIconButton>,
    );
  }
  if (builtinUtilityIds.includes('daycountdown')) {
    utilitySlotNodes.push(
      <UtilityBarIconButton
        key="daycountdown"
        label="Day countdown"
        iconSx={utilityIconSx}
        is960={is960}
        showDelete={utilityEditMode}
        onEnterEditMode={() => setUtilityEditMode(true)}
        onRemove={() => handleRemoveBuiltinUtility('daycountdown')}
        onClick={() => handleUtilityTool('daycountdown')}
      >
        <TodayOutlinedIcon sx={{ fontSize: toolSize * 0.42 }} />
      </UtilityBarIconButton>,
    );
  }
  if (builtinUtilityIds.includes('pomodoro')) {
    utilitySlotNodes.push(
      <UtilityBarIconButton
        key="pomodoro"
        label="Pomodoro"
        iconSx={{ ...utilityIconSx, color: '#EF4444' }}
        is960={is960}
        showDelete={utilityEditMode}
        onEnterEditMode={() => setUtilityEditMode(true)}
        onRemove={() => handleRemoveBuiltinUtility('pomodoro')}
        onClick={() => handleUtilityTool('pomodoro')}
      >
        <HourglassEmptyOutlinedIcon sx={{ fontSize: toolSize * 0.42 }} />
      </UtilityBarIconButton>,
    );
  }
  installedUtilityTools.forEach((tool) => {
    utilitySlotNodes.push(
      <UtilityToolButton
        key={tool.id}
        tool={tool}
        iconSx={utilityIconSx}
        is960={is960}
        showDelete={utilityEditMode}
        onEnterEditMode={() => setUtilityEditMode(true)}
        onRemove={() => handleRemoveUtilityTool(tool.id)}
        onLaunch={() => handleUtilityToolLaunch(tool)}
      />,
    );
  });
  if (canAddUtilitySlot) {
    utilitySlotNodes.push(
      <ButtonBase
        key="add-utility"
        onClick={() => {
          setUtilityEditMode(false);
          setShowUtilityToolsCatalog(true);
        }}
        aria-label="Add system tools"
        sx={utilityAddSx}
      >
        <AddIcon sx={{ fontSize: toolSize * 0.48 }} />
      </ButtonBase>,
    );
  }

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
          gridTemplateColumns: `minmax(0, 1fr) ${sideRailW}px`,
          gap: `${p(EXPLORE_MAIN1.gap)}px`,
          alignItems: 'stretch',
        }}
      >
              <Box
                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: `${sideRailW}px minmax(0, 1fr)`,
                  /* 时钟卡与视频位等高，圆角共用 clockRadius */
                  gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: `${p(20)}px`,
                  overflow: 'hidden',
                }}
              >
                {/* 左上 · Rectangle 34629571 时钟卡（Figma 出数等比缩进 sideRail） */}
                <Box
                  sx={{
                    gridColumn: 1,
                    gridRow: 1,
                    position: 'relative',
                    minWidth: 0,
                    minHeight: 0,
                    bgcolor: '#F8F8F8',
                    borderRadius: `${p(EXPLORE_MAIN1.clockRadius)}px`,
                    boxShadow: HUB_SURFACE_SHADOW,
                    px: `${cp(40)}px`,
                    pt: `${cp(36)}px`,
                    pb: `${cp(32)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: cp(EXPLORE_MAIN1.clockTime),
                          fontWeight: 700,
                          color: '#263244',
                          fontFamily: FIGMA_FONT,
                          lineHeight: `${cp(EXPLORE_MAIN1.clockTimeLh)}px`,
                          letterSpacing: '-0.03em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {timeString}
                      </Typography>
                      <Box
                        sx={{
                          mt: `${cp(12)}px`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: `${p(20)}px`,
                          py: `${p(10)}px`,
                          borderRadius: 999,
                          bgcolor: '#EBEBEB',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: p(EXPLORE_MAIN1.clockDate),
                            fontWeight: 700,
                            color: '#263244',
                            fontFamily: FIGMA_FONT,
                            lineHeight: `${p(EXPLORE_MAIN1.clockDateLh)}px`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dateInfo.month} {dateInfo.day} · {dateInfo.weekday}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, minHeight: cp(20) }} />

                  <Box
                    sx={{
                      position: 'relative',
                      flexShrink: 0,
                      display: 'flex',
                      flexWrap: 'nowrap',
                      gap: `${cp(EXPLORE_MAIN1.clockToolGap)}px`,
                      alignItems: 'center',
                      overflow: 'visible',
                    }}
                  >
                    {utilityEditMode && (
                      <ButtonBase
                        onClick={() => setUtilityEditMode(false)}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: cp(-36),
                          minHeight: cp(30),
                          px: `${cp(12)}px`,
                          borderRadius: `${cp(10)}px`,
                          bgcolor: '#111827',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: cp(12),
                          fontFamily: FIGMA_FONT,
                          zIndex: 2,
                        }}
                      >
                        Done
                      </ButtonBase>
                    )}
                    {utilitySlotNodes}
                  </Box>
                </Box>

                {/* 右上 · App 格一行四枚，行距略松 */}
                <Box
                  sx={{
                    gridColumn: 2,
                    gridRow: '1 / 3',
                    minWidth: 0,
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    alignContent: 'start',
                    columnGap: `${p(12)}px`,
                    rowGap: `${p(28)}px`,
                    overflow: 'auto',
                    pt: `${p(8)}px`,
                    pr: `${p(4)}px`,
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

                {/* 左下 · YouTube promo 封面位 → /culture-video 全屏播放 */}
                <ButtonBase
                  onClick={() => navigate('/culture-video', { state: { from: '/apps' } })}
                  aria-label="Open culture video"
                  sx={{
                    gridColumn: 1,
                    gridRow: 2,
                    position: 'relative',
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    borderRadius: `${p(EXPLORE_MAIN1.clockRadius)}px`,
                    bgcolor: '#2C3136',
                    overflow: 'hidden',
                    display: 'block',
                    boxShadow: HUB_SURFACE_SHADOW,
                    '&:active': { opacity: 0.96 },
                  }}
                >
                  <Box
                    component="img"
                    src={EXPLORE_PROMO_POSTER_MAX}
                    alt=""
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src !== EXPLORE_PROMO_POSTER) img.src = EXPLORE_PROMO_POSTER;
                    }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(20,24,28,0.08) 0%, rgba(20,24,28,0.42) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: p(72),
                      height: p(72),
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.22)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <PlayArrowRoundedIcon sx={{ fontSize: p(44), color: '#FFFFFF', ml: '2px' }} />
                  </Box>
                </ButtonBase>
              </Box>
              <Box
                sx={{
                  width: sideRailW,
                  minWidth: sideRailW,
                  maxWidth: sideRailW,
                  minHeight: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <HubContainBoard
                  width={EXPLORE_MAIN1.settingsBoardW}
                  height={EXPLORE_MAIN1.settingsBoardH}
                  fillHost
                >
                  <Box
                    sx={{
                      width: EXPLORE_MAIN1.settingsBoardW,
                      height: EXPLORE_MAIN1.settingsBoardH,
                      bgcolor: HUB_SURFACE,
                      borderRadius: `${EXPLORE_MAIN1.settingsRadius}px`,
                      boxShadow: '0px 5px 26px rgba(213, 213, 213, 0.6)',
                      px: `${EXPLORE_MAIN1.settingsPadX}px`,
                      pt: `${EXPLORE_MAIN1.settingsPadTop}px`,
                      pb: `${EXPLORE_MAIN1.settingsPadBottom}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      fontFamily: FIGMA_FONT,
                    }}
                  >
                    <Typography
                      sx={{
                        flexShrink: 0,
                        width: EXPLORE_MAIN1.settingsContentW,
                        fontWeight: 700,
                        fontSize: EXPLORE_MAIN1.settingsTitle,
                        lineHeight: `${EXPLORE_MAIN1.settingsTitleLh}px`,
                        color: '#2D3436',
                        fontFamily: FIGMA_FONT,
                        mb: `${EXPLORE_MAIN1.settingsTitleMb}px`,
                      }}
                    >
                      System settings
                    </Typography>

                    <Box
                      sx={{
                        width: EXPLORE_MAIN1.settingsContentW,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: `${EXPLORE_MAIN1.settingsGap}px`,
                        flexShrink: 0,
                      }}
                    >
                      <ButtonBase
                        onClick={handleLanguagePackUpdate}
                        sx={{
                          display: 'flex',
                          width: '100%',
                          height: EXPLORE_MAIN1.settingsRowLh,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '3px',
                          borderBottom: '2px solid #E0E0DF',
                          borderRadius: 0,
                          textAlign: 'left',
                          '&:active': { bgcolor: 'rgba(99,110,114,0.06)' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: EXPLORE_MAIN1.settingsRow,
                            lineHeight: `${EXPLORE_MAIN1.settingsRowLh}px`,
                            color: '#636E72',
                            fontWeight: 700,
                            fontFamily: FIGMA_FONT,
                          }}
                        >
                          Language Packs
                        </Typography>
                        <SettingsChevron size={40} />
                      </ButtonBase>

                      <ButtonBase
                        onClick={handleContentManagement}
                        sx={{
                          display: 'flex',
                          width: '100%',
                          height: EXPLORE_MAIN1.settingsRowLh,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '3px',
                          borderBottom: '2px solid #E0E0DF',
                          borderRadius: 0,
                          textAlign: 'left',
                          '&:active': { bgcolor: 'rgba(99,110,114,0.06)' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: EXPLORE_MAIN1.settingsRow,
                            lineHeight: `${EXPLORE_MAIN1.settingsRowLh}px`,
                            color: '#636E72',
                            fontWeight: 700,
                            fontFamily: FIGMA_FONT,
                          }}
                        >
                          Content Management
                        </Typography>
                        <SettingsChevron size={40} />
                      </ButtonBase>

                      <Box
                        sx={{
                          width: '100%',
                          minHeight: EXPLORE_MAIN1.settingsEyeH,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '3px',
                          borderBottom: '2px solid #E0E0DF',
                          boxSizing: 'border-box',
                          py: '4px',
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: '6px',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: EXPLORE_MAIN1.settingsRow,
                              lineHeight: `${EXPLORE_MAIN1.settingsRowLh}px`,
                              color: '#636E72',
                              fontWeight: 700,
                              fontFamily: FIGMA_FONT,
                            }}
                          >
                            Eye Protection
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: EXPLORE_MAIN1.settingsSub,
                              lineHeight: `${EXPLORE_MAIN1.settingsSubLh}px`,
                              color: '#A7B3B8',
                              fontWeight: 400,
                              fontFamily: FIGMA_FONT,
                            }}
                          >
                            Warm tint - 20-20-20 reminder
                          </Typography>
                        </Box>
                        <ButtonBase
                          onClick={() => setBlueLightFilter((on) => !on)}
                          aria-label={
                            blueLightFilter
                              ? 'Eye protection on, tap to turn off'
                              : 'Eye protection off, tap to turn on'
                          }
                          sx={{
                            flexShrink: 0,
                            width: EXPLORE_MAIN1.settingsToggleW,
                            height: EXPLORE_MAIN1.settingsToggleH,
                            borderRadius: EXPLORE_MAIN1.settingsToggleH / 2,
                            bgcolor: blueLightFilter ? '#00B4A0' : '#E0E0DF',
                            position: 'relative',
                            overflow: 'visible',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              ...(blueLightFilter ? { right: -3 } : { left: -3 }),
                              transform: 'translateY(-50%)',
                              width: EXPLORE_MAIN1.settingsToggleThumb,
                              height: EXPLORE_MAIN1.settingsToggleThumb,
                              borderRadius: '50%',
                              bgcolor: '#FFFFFF',
                              boxShadow:
                                '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
                            }}
                          />
                        </ButtonBase>
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          height: EXPLORE_MAIN1.settingsUpdatesH,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          gap: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: '4px',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: EXPLORE_MAIN1.settingsRow,
                              lineHeight: `${EXPLORE_MAIN1.settingsRowLh}px`,
                              color: '#636E72',
                              fontWeight: 700,
                              fontFamily: FIGMA_FONT,
                            }}
                          >
                            App Updates
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: EXPLORE_MAIN1.settingsSub,
                              lineHeight: `${EXPLORE_MAIN1.settingsSubLh}px`,
                              color: '#A7B3B8',
                              fontWeight: 400,
                              fontFamily: FIGMA_FONT,
                            }}
                          >
                            {pendingUpdates > 0
                              ? `${pendingUpdates} update${pendingUpdates === 1 ? '' : 's'} available`
                              : 'No current updates'}
                          </Typography>
                        </Box>
                        <ButtonBase
                          onClick={handleOpenNskStore}
                          sx={{
                            width: '100%',
                            height: EXPLORE_MAIN1.settingsBtnH,
                            px: '54px',
                            borderRadius: 100,
                            bgcolor: '#F3F4F6',
                            color: '#2D3436',
                            fontWeight: 700,
                            fontSize: EXPLORE_MAIN1.settingsBtnFont,
                            lineHeight: `${Math.round(EXPLORE_MAIN1.settingsBtnFont * 1.6)}px`,
                            fontFamily: FIGMA_FONT,
                            textAlign: 'center',
                            '&:active': { bgcolor: '#E8EAED' },
                          }}
                        >
                          CHECK FOR UPDATES
                        </ButtonBase>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 24 }} />

                    <ButtonBase
                      onClick={() => navigate('/android/settings', { state: { from: '/apps' } })}
                      sx={{
                        flexShrink: 0,
                        position: 'relative',
                        width: EXPLORE_MAIN1.goBarW,
                        height: EXPLORE_MAIN1.goBar,
                        borderRadius: `${EXPLORE_MAIN1.goBarRadius}px`,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        pl: '27px',
                        pr: '24px',
                        gap: '24px',
                        isolation: 'isolate',
                        background:
                          'linear-gradient(118deg, #1A1040 0%, #2A2F8F 38%, #3D5BDB 72%, #6B8CFF 100%)',
                        boxShadow:
                          '0 12px 28px rgba(46, 49, 146, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
                        '&:active': { opacity: 0.94 },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: '-30%',
                          background: [
                            'radial-gradient(42% 58% at 18% 30%, rgba(180,210,255,0.75) 0%, rgba(180,210,255,0) 70%)',
                            'radial-gradient(48% 62% at 78% 22%, rgba(120,90,255,0.55) 0%, rgba(120,90,255,0) 72%)',
                            'radial-gradient(55% 70% at 62% 88%, rgba(40,20,120,0.65) 0%, rgba(40,20,120,0) 75%)',
                            'radial-gradient(36% 48% at 40% 55%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 68%)',
                          ].join(', '),
                          filter: 'blur(18px)',
                          transform: 'scale(1.05)',
                          pointerEvents: 'none',
                          zIndex: 0,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 42%, rgba(0,0,0,0.18) 100%)',
                          pointerEvents: 'none',
                          zIndex: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          width: EXPLORE_MAIN1.goThumb,
                          height: EXPLORE_MAIN1.goThumb,
                          flexShrink: 0,
                          borderRadius: `${EXPLORE_MAIN1.goThumbRadius}px`,
                          overflow: 'hidden',
                          boxShadow:
                            '0 0 28px rgba(140,170,255,0.55), 0 8px 18px rgba(20,24,80,0.35)',
                        }}
                      >
                        <Box
                          component="img"
                          src="/images/android-12-icon.png"
                          alt=""
                          aria-hidden
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            filter: 'saturate(1.08) contrast(1.04)',
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          width: EXPLORE_MAIN1.goPillW,
                          height: EXPLORE_MAIN1.goPill,
                          borderRadius: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: '24px',
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.08) 100%)',
                          backdropFilter: 'blur(22px) saturate(1.45)',
                          WebkitBackdropFilter: 'blur(22px) saturate(1.45)',
                          border: '1px solid rgba(255,255,255,0.42)',
                          boxShadow:
                            'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.12), 0 8px 22px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: EXPLORE_MAIN1.goFont,
                            lineHeight: `${EXPLORE_MAIN1.settingsRowLh}px`,
                            color: '#FFFFFF',
                            fontFamily: FIGMA_FONT,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            textShadow: '0 1px 3px rgba(0,0,0,0.28)',
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
              Pin up to {MAX_UTILITY_BAR_SLOTS} tools · {utilitySlotCount}/{MAX_UTILITY_BAR_SLOTS} used · remove one to add more
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
                const atLimit = !installed && !canAddUtilitySlot;
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
                      opacity: atLimit ? 0.45 : 1,
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
                const atLimit = !installed && !canAddUtilitySlot;
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
