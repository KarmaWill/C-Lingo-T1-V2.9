import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AndroidIcon from '@mui/icons-material/Android';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resolveBackPath } from '../utils/navigateBack';
import {
  GOOGLE_CATALOG_APPS,
  loadInstalledExtraAppIds,
  MAX_EXTRA_APPS,
  toggleInstalledExtraApp,
} from '../data/appsCatalog';
import {
  EXPLORE_MAIN1,
  HUB_CANVAS_CLINGO,
  HUB_FRAME_PAD_X,
  HUB_SURFACE,
  HUB_SURFACE_SHADOW,
} from '../components/home/hubChrome';
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale';

export default function AppsCatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenSize = APP_SCREEN_SIZE;
  const p = (n: number) => figmaPx(n, screenSize);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => setInstalledIds(loadInstalledExtraAppIds()), []);
  useEffect(() => { refresh(); }, [refresh, location.key]);

  const handleToggle = (appId: string) => {
    const result = toggleInstalledExtraApp(appId);
    setInstalledIds(result.ids);
    if (!result.ok) {
      setToast(`Home screen supports up to ${MAX_EXTRA_APPS} extra apps. Remove one first.`);
    } else {
      setToast('');
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: HUB_CANVAS_CLINGO,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: `${p(HUB_FRAME_PAD_X)}px`,
          py: `${p(18)}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(20)}px`,
          bgcolor: HUB_SURFACE,
        }}
      >
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location), { replace: true })}
          aria-label="Back"
          sx={{
            width: p(64),
            height: p(64),
            minWidth: p(64),
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            color: '#2D3436',
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: p(32) }} />
        </ButtonBase>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: `${p(52)}px`,
              color: '#2D3436',
              fontFamily: FIGMA_FONT,
            }}
          >
            Add Apps
          </Typography>
          <Typography
            sx={{
              fontSize: p(21),
              lineHeight: `${p(34)}px`,
              color: '#A7B3B8',
              fontFamily: FIGMA_FONT,
            }}
          >
            Pin up to {MAX_EXTRA_APPS} extra apps · {installedIds.length}/{MAX_EXTRA_APPS} used
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(HUB_FRAME_PAD_X)}px`,
          py: `${p(24)}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${p(20)}px`,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/android-app-picker', { state: { from: '/apps-catalog', ...(location.state as object) } })}
          sx={{
            width: '100%',
            minHeight: p(100),
            px: `${p(24)}px`,
            borderRadius: `${p(24)}px`,
            bgcolor: '#2D3436',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: `${p(18)}px`,
            boxShadow: HUB_SURFACE_SHADOW,
            flexShrink: 0,
            '&:active': { opacity: 0.92 },
          }}
        >
          <Box
            sx={{
              width: p(72),
              height: p(72),
              borderRadius: `${p(16)}px`,
              bgcolor: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AndroidIcon sx={{ fontSize: p(40), color: '#3DDC84' }} />
          </Box>
          <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: p(28), fontFamily: FIGMA_FONT, lineHeight: 1.25 }}>
              Browse Android Apps
            </Typography>
            <Typography sx={{ fontSize: p(18), color: 'rgba(255,255,255,0.65)', fontFamily: FIGMA_FONT, lineHeight: 1.4 }}>
              Open the system app drawer to choose apps
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: p(120),
              height: p(52),
              px: `${p(20)}px`,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: p(22),
              fontFamily: FIGMA_FONT,
              flexShrink: 0,
            }}
          >
            Open
          </Box>
        </ButtonBase>

        {toast && (
          <Typography sx={{ fontSize: p(18), color: '#DC2626', fontWeight: 700, fontFamily: FIGMA_FONT }}>
            {toast}
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: `${p(16)}px`,
            alignContent: 'start',
          }}
        >
          {GOOGLE_CATALOG_APPS.map((app) => {
            const installed = installedIds.includes(app.id);
            const atLimit = !installed && installedIds.length >= MAX_EXTRA_APPS;
            return (
              <Box
                key={app.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${p(16)}px`,
                  p: `${p(18)}px`,
                  borderRadius: `${p(EXPLORE_MAIN1.iconRadius)}px`,
                  bgcolor: HUB_SURFACE,
                  border: '2px solid #E0E0DF',
                  boxShadow: HUB_SURFACE_SHADOW,
                  opacity: atLimit ? 0.45 : 1,
                }}
              >
                <Box
                  sx={{
                    width: p(72),
                    height: p(72),
                    borderRadius: `${p(20)}px`,
                    bgcolor: app.bg,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: p(28),
                    fontFamily: FIGMA_FONT,
                    flexShrink: 0,
                  }}
                >
                  {app.label.charAt(0)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: p(24),
                      color: '#2D3436',
                      fontFamily: FIGMA_FONT,
                      lineHeight: 1.25,
                    }}
                  >
                    {app.label}
                  </Typography>
                  <Typography sx={{ fontSize: p(16), color: '#A7B3B8', fontFamily: FIGMA_FONT, lineHeight: 1.4 }}>
                    {app.publisher}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: p(16),
                      color: '#636E72',
                      fontFamily: FIGMA_FONT,
                      mt: `${p(4)}px`,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {app.description}
                  </Typography>
                </Box>
                <ButtonBase
                  onClick={() => handleToggle(app.id)}
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
                    flexShrink: 0,
                  }}
                >
                  {installed ? <CheckCircleIcon sx={{ fontSize: p(20) }} /> : <AddCircleOutlineIcon sx={{ fontSize: p(20) }} />}
                  {installed ? 'Added' : 'Add'}
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
