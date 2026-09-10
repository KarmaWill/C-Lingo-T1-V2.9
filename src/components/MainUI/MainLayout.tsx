import { ReactNode, useState, useEffect } from 'react'
import { Box, ButtonBase } from '@mui/material'
import { useLocation } from 'react-router-dom'
import BottomNavigator, { getBottomNavReserve } from './BottomNavigator'
import TopBanner from './TopBanner'
import SystemStatusBar, { getSystemBarMetrics } from './SystemStatusBar'
import ShellSloganHeadline from './ShellSloganHeadline'
import ShellTopBarProductLinks from './ShellTopBarProductLinks'
import IpadDeviceShell, { getDeviceShellBezelForSize } from './IpadDeviceShell'
import { getChromeThemeFromPath } from '../../data/programTracks'

interface MainLayoutProps {
  children: ReactNode
}

const DESIGN_1920 = 1920
const DESIGN_1125 = 1125
/** Top + bottom chrome bars (px) — air band around the centered tablet */
const SHELL_BAR_RESERVE = 88
const SHELL_CHROME_RESERVE = SHELL_BAR_RESERVE * 2

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const isWebsiteEmbed = new URLSearchParams(location.search).get('mode') === 'website'

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '2000x1200'
  const [screenWidth, screenHeight] = screenSize.split('x').map(Number)
  const is2000x1200 = screenSize === '2000x1200'
  const is1920x1125 = screenSize === '1920x1125'

  // Viewport size for scale-to-fit (iPad + bottom logo)
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : screenWidth,
    h: typeof window !== 'undefined' ? window.innerHeight : screenHeight,
  })
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scale1920 = is1920x1125
    ? Math.min(
        1,
        viewport.w / DESIGN_1920,
        (viewport.h - (isWebsiteEmbed ? 0 : SHELL_CHROME_RESERVE)) / DESIGN_1125,
      )
    : 1

  const shellBezel = getDeviceShellBezelForSize(screenSize)
  const shellOuterW = screenWidth + shellBezel * 2
  const shellOuterH = screenHeight + shellBezel * 2
  const fitDeviceScale = Math.min(
    (viewport.h - (isWebsiteEmbed ? 0 : SHELL_CHROME_RESERVE) - 8) / (shellOuterH + 12),
    (viewport.w - 8) / shellOuterW,
  )
  const deviceScale = Math.max(0.28, Math.min(1, fitDeviceScale))
  
  const isCameraPage = location.pathname === '/camera'
  const isAIPage = location.pathname === '/ai-chat'
  const isLessonPage = location.pathname.startsWith('/lesson')
  const isHSKPrepTestIntroPage = location.pathname === '/hsk-prep-test'
  const isPinyinChartPage = location.pathname === '/pinyin-chart'
  const isProfilePage = location.pathname === '/profile'
  const isProfileEditPage = location.pathname === '/profile/edit'
  const isAudioReadingPage = location.pathname === '/audio-reading'
  const isCultureVideoRoutePage = location.pathname === '/culture-video'
  const isBookReaderPage = location.pathname.startsWith('/library/read')
  const isStudyReportPage = location.pathname === '/study-report'
  const isMistakesReviewPage = location.pathname === '/mistakes-review'
  const isQuestionReviewPage = location.pathname === '/question-review'
  const isHSKMockExamPage = location.pathname === '/hsk-mock-exam'
  const isLingoFlashPage = location.pathname === '/lingo-flash'
  const isGrammarPuzzlePage = location.pathname === '/grammar-puzzle'
  const isSyntaxSnapPage = location.pathname === '/syntax-snap'
  const isHSKPrepTrainingPage = location.pathname === '/hsk-prep-training'
  const isHSKSkillDrillPage = location.pathname === '/hsk-skill-drill'
  const isHSKOralReviewPage = location.pathname === '/hsk-oral-review'
  const isGrammarSnapPage =
    location.pathname === '/hsk-go-study' || location.pathname.startsWith('/hsk-go-study/')
  const isLibraryBookSelectionPage = location.pathname === '/library/select-books'
  const isStartingLearningPage = location.pathname === '/starting-learning'
  const isFunChineseTeacherGuidePage = location.pathname === '/library/hub/fun-chinese/teacher-guide'
  const isFunChineseHubPage = location.pathname === '/library/hub/fun-chinese'
  const isFunChineseCardCollectionPage = location.pathname === '/library/hub/fun-chinese/card-collection'
  const isFunChineseIntensivePage = location.pathname === '/library/hub/fun-chinese/intensive'
  const isFunChineseLessonPage = location.pathname.startsWith('/library/hub/fun-chinese/lesson')
  const isCultureMapPage = location.pathname === '/library/hub/culture'
  const isCharacterWritingPage = location.pathname.startsWith('/character-writing')
  const isFavoritesPage = location.pathname === '/favorites'
  const isParentalControlsPage = location.pathname === '/parental-controls'
  const isNskAppStorePage = location.pathname === '/nsk-app-store'
  const isJxwAppStorePage = location.pathname === '/jxw-app-store'
  const isAppsCatalogPage = location.pathname === '/apps-catalog'
  const isAndroidAppPickerPage = location.pathname === '/android-app-picker'
  const isAndroidHomePage = location.pathname === '/android/home'
  const isAndroidSettingsPage = location.pathname === '/android/settings'
  const isLanguagePacksPage = location.pathname === '/system/language-packs'
  const isContentCachePage = location.pathname === '/system/content-cache'
  const isAppUpdatesPage = location.pathname === '/system/app-updates'
  const isCourseIntroPage = location.pathname === '/course-intro'
  const isReadingBuddyPage = location.pathname === '/reading-buddy' || location.pathname.startsWith('/reading-buddy/')
  const isHSKStandardSubPage = location.pathname.startsWith('/hsk-standard/')
  const isBusinessChineseSubPage = location.pathname.startsWith('/business-chinese/')
  /** 全屏覆盖主区域（无顶栏留白）；LingoFlash/GrammarPuzzle/HSKPrepTraining/LibraryBookSelection 单独：保留系统状态栏高度，主内容在其下方 */
  const isCoveringMain =
    isCameraPage ||
    isAIPage ||
    isLessonPage ||
    isHSKPrepTestIntroPage ||
    isPinyinChartPage ||
    isProfilePage ||
    isProfileEditPage ||
    isBookReaderPage ||
    isStudyReportPage ||
    isMistakesReviewPage ||
    isQuestionReviewPage ||
    isHSKMockExamPage ||
    isAudioReadingPage ||
    isCultureVideoRoutePage ||
    isFavoritesPage ||
    isParentalControlsPage ||
    isNskAppStorePage ||
    isJxwAppStorePage ||
    isAppsCatalogPage ||
    isAndroidAppPickerPage ||
    isAndroidHomePage ||
    isAndroidSettingsPage ||
    isLanguagePacksPage ||
    isContentCachePage ||
    isAppUpdatesPage ||
    isCourseIntroPage ||
    isHSKOralReviewPage ||
    isReadingBuddyPage
  const hideChromeNav =
    isCoveringMain ||
    isLingoFlashPage ||
    isGrammarPuzzlePage ||
    isSyntaxSnapPage ||
    isHSKPrepTrainingPage ||
    isHSKSkillDrillPage ||
    isGrammarSnapPage ||
    isLibraryBookSelectionPage || isStartingLearningPage || isFunChineseTeacherGuidePage || isFunChineseHubPage || isFunChineseCardCollectionPage || isFunChineseIntensivePage || isFunChineseLessonPage || isCultureMapPage || isCharacterWritingPage || isHSKStandardSubPage || isBusinessChineseSubPage

  // 主四 tab + LingoFlash 等：壳层状态栏。/hsk-prep-training 由页面自己画 Group 17，不在这里铺。
  const showSystemBar =
    ['/', '/AI', '/Home', '/library', '/specialized', '/apps', '/hsk-test', '/hsk-standard', '/business-chinese'].includes(location.pathname) || 
    isGrammarPuzzlePage || 
    isSyntaxSnapPage ||
    isHSKSkillDrillPage ||
    isHSKOralReviewPage ||
    isGrammarSnapPage ||
    isLibraryBookSelectionPage ||
    isFunChineseCardCollectionPage ||
    isFunChineseIntensivePage ||
    isFunChineseLessonPage ||
    isCultureMapPage ||
    isCharacterWritingPage ||
    isHSKStandardSubPage ||
    isBusinessChineseSubPage

  const isLibraryHomePage =
    location.pathname === '/Home' || location.pathname === '/library'
  const isStudioHomePage =
    location.pathname === '/AI' ||
    location.pathname === '/' ||
    location.pathname === '/hsk-standard' ||
    location.pathname === '/business-chinese'
  const isHskPrepHub = location.pathname === '/hsk-test'
  const isExploreHub = location.pathname === '/apps'

  // Figma 主界面1/2：Studio、HSK Preparation、Explore 页内自带顶栏，隐藏全局 TopBanner
  const showTopBanner =
    !hideChromeNav && !isLibraryHomePage && !isStudioHomePage && !isHskPrepHub && !isExploreHub
  const showBottomNav = !hideChromeNav
  
  // Calculate scaled heights based on screen size
  const is960 = screenSize === '960x540'
  const hardwareProtrusion = is960 ? 10 : 12
  const websiteEmbedScale = isWebsiteEmbed
    ? Math.min(
        (viewport.w - 4) / shellOuterW,
        (viewport.h - 4) / (shellOuterH + hardwareProtrusion),
      ) * 0.9
    : null
  const effectiveDeviceScale = Math.max(0.28, websiteEmbedScale ?? deviceScale)
  // Figma 主界面2：dock 130 + 底边 40；Library 自带顶栏故无 TopBanner
  const systemBarHeight = getSystemBarMetrics(screenSize).height
  const topBannerHeight = is960 ? 56 : (is2000x1200 ? 110 : (is1920x1125 ? 100 : 80))
  const bottomNavHeight = getBottomNavReserve(screenSize)
  const totalTopHeight = (showSystemBar ? systemBarHeight : 0) + (showTopBanner ? topBannerHeight : 0)
  const mainChromeBottom = showBottomNav ? bottomNavHeight : 0
  /** SystemStatusBar is absolute; immersive pages must start below it. */
  const coverTopOffset = isCoveringMain && showSystemBar ? systemBarHeight : 0
  /** Status bar only (no TopBanner): pad main content — margin-top is unreliable in flex + absolute overlay. */
  const statusBarOnlyLayout = showSystemBar && !showTopBanner && !isCoveringMain

  const chromeTheme = getChromeThemeFromPath(location.pathname)

  const mainContentAreaSx = {
    flexGrow: 1,
    position: isCoveringMain ? ('absolute' as const) : ('relative' as const),
    zIndex: isCoveringMain ? 1200 : 1,
    width: '100%',
    minHeight: 0,
    overflowX: 'hidden' as const,
    overflowY: 'hidden' as const,
    backgroundColor: chromeTheme.mainBg,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box' as const,
    ...(isCoveringMain
      ? {
          top: coverTopOffset,
          left: 0,
          right: 0,
          bottom: 0,
          height: coverTopOffset ? `calc(100% - ${coverTopOffset}px)` : '100%',
          mt: 0,
          mb: 0,
          pt: 0,
        }
      : statusBarOnlyLayout
        ? {
            inset: 'auto',
            mt: 0,
            pt: `${systemBarHeight}px`,
            // border-box：pt 吃在 height 内。height 必须先扣掉底栏，否则 100% + mb 会压进 dock。
            height: `calc(100% - ${mainChromeBottom}px)`,
            mb: mainChromeBottom ? `${mainChromeBottom}px` : 0,
          }
        : {
            inset: 'auto',
            pt: 0,
            height: `calc(100% - ${totalTopHeight + mainChromeBottom}px)`,
            mt: `${totalTopHeight}px`,
            mb: mainChromeBottom ? `${mainChromeBottom}px` : 0,
          }),
  }

  const shellBackdropSx = {
    position: 'relative' as const,
    background: `
      radial-gradient(ellipse 48% 70% at 50% 0%, rgba(185, 255, 90, 0.2) 0%, transparent 72%),
      linear-gradient(135deg, #004735, #006D50)
    `,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(246, 200, 58, 0.16) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  }

  const shellBarBaseSx = {
    flexShrink: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    px: 2,
    minHeight: SHELL_BAR_RESERVE,
    boxSizing: 'border-box' as const,
    backgroundColor: 'transparent',
  }

  const shellTopBarSx = {
    ...shellBarBaseSx,
    position: 'relative' as const,
    alignItems: 'center',
    py: 0,
  }

  const shellBottomBarSx = {
    ...shellBarBaseSx,
    alignItems: 'center',
    py: 0,
  }

  const shellTopBar = (
    <Box id="shell-top-bar" sx={shellTopBarSx}>
      <ShellSloganHeadline />
      <ShellTopBarProductLinks
        onOpenScanPen={() => openExternal('https://c-lingo-scan-pen.vercel.app/')}
      />
    </Box>
  )

  const shellBrand = (
    <Box id="shell-bottom-bar" sx={shellBottomBarSx}>
      <ButtonBase
        onClick={() => openExternal('https://www.clingoaios.com/')}
        aria-label="C-Lingo AIOS — Visit clingoaios.com"
        sx={{
          display: 'block',
          borderRadius: 0,
          py: 0,
          px: '8px',
          m: 0,
          minWidth: 44,
          minHeight: 0,
          lineHeight: 0,
          cursor: 'pointer',
          flexShrink: 0,
          bgcolor: 'transparent',
          '&:hover': { opacity: 0.92 },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Box
          component="img"
          className="footer-brand-logo"
          src="/branding/c-lingo-logo-footer-shell.png"
          alt="C-Lingo AIOS"
          draggable={false}
          sx={{
            height: '56px',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </ButtonBase>
    </Box>
  )

  return (
    <Box sx={{ 
      ...(isWebsiteEmbed
        ? {
            background: '#F4FFF5',
            '&::before': { display: 'none' },
          }
        : shellBackdropSx),
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden'
    }}>
      {!isWebsiteEmbed && shellTopBar}
      <Box
        id="shell-stage"
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      <Box
        sx={{
          flexShrink: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
      {/* 1920x1125: wrapper with scaled size so layout fits viewport and no scroll */}
      {is1920x1125 ? (
        <Box
          sx={{
            width: (DESIGN_1920 + getDeviceShellBezelForSize('1920x1125') * 2) * scale1920,
            height: (DESIGN_1125 + getDeviceShellBezelForSize('1920x1125') * 2) * scale1920 + hardwareProtrusion * scale1920,
            flexShrink: 0,
            overflow: 'visible',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            pt: `${hardwareProtrusion * scale1920}px`,
          }}
        >
          <IpadDeviceShell
            width={DESIGN_1920}
            height={DESIGN_1125}
            sizeTier="1920"
            screenBg={chromeTheme.screenBg}
            transform={`scale(${scale1920})`}
            transformOrigin="top left"
          >
            {showSystemBar && <SystemStatusBar />}
            {showTopBanner && <TopBanner />}
            <Box
              component="main"
              id="main-content-area"
              sx={mainContentAreaSx}
            >
              {children}
            </Box>
            {showBottomNav && <BottomNavigator />}
          </IpadDeviceShell>
        </Box>
      ) : (
      <>
      {/* iPad/Tablet Container: non-1920x1125（含 2000x1200 原比例） */}
      <Box
        sx={{
          width: shellOuterW * effectiveDeviceScale,
          height: (shellOuterH + hardwareProtrusion) * effectiveDeviceScale,
          position: 'relative',
          flexShrink: 0,
          overflow: 'visible',
          pt: `${hardwareProtrusion * effectiveDeviceScale}px`,
        }}
      >
      <IpadDeviceShell
        width={screenWidth}
        height={screenHeight}
        sizeTier={is960 ? '960' : is2000x1200 ? '2000' : 'default'}
        screenBg={chromeTheme.screenBg}
        transform={`scale(${effectiveDeviceScale})`}
        transformOrigin="top left"
        position="absolute"
      >
        {showSystemBar && <SystemStatusBar />}
        {showTopBanner && <TopBanner />}
        <Box
          component="main"
          id="main-content-area"
          sx={mainContentAreaSx}
        >
          {children}
        </Box>
        {showBottomNav && <BottomNavigator />}
      </IpadDeviceShell>
      </Box>
      </>
      )}
      </Box>
      </Box>
      {!isWebsiteEmbed && shellBrand}
    </Box>
  )
}
