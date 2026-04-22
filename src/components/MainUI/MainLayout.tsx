import { ReactNode, useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import BottomNavigator from './BottomNavigator'
import TopBanner from './TopBanner'
import SystemStatusBar from './SystemStatusBar'

interface MainLayoutProps {
  children: ReactNode
}

const DESIGN_1920 = 1920
const DESIGN_1125 = 1125

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const [screenWidth, screenHeight] = screenSize.split('x').map(Number)
  const is2000x1200 = screenSize === '2000x1200'
  const is1920x1125 = screenSize === '1920x1125'

  // Viewport size for 1920x1125 scale-to-fit (see full page on screen)
  const [viewport, setViewport] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : DESIGN_1920, h: typeof window !== 'undefined' ? window.innerHeight : DESIGN_1125 })
  useEffect(() => {
    if (!is1920x1125) return
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [is1920x1125])

  const scale1920 = is1920x1125
    ? Math.min(1, viewport.w / DESIGN_1920, viewport.h / DESIGN_1125)
    : 1
  
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
  const isLibraryBookSelectionPage = location.pathname === '/library/select-books'
  const isStartingLearningPage = location.pathname === '/starting-learning'
  const isFunChineseHubPage = location.pathname === '/library/hub/fun-chinese'
  const isFunChineseIntensivePage = location.pathname === '/library/hub/fun-chinese/intensive'
  const isFunChineseLessonPage = location.pathname.startsWith('/library/hub/fun-chinese/lesson')
  const isCultureMapPage = location.pathname === '/library/hub/culture'
  const isCharacterWritingPage = location.pathname.startsWith('/character-writing')
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
    isHSKSkillDrillPage ||
    isHSKOralReviewPage
  const hideChromeNav = isCoveringMain || isLingoFlashPage || isGrammarPuzzlePage || isSyntaxSnapPage || isHSKPrepTrainingPage || isLibraryBookSelectionPage || isStartingLearningPage || isFunChineseHubPage || isFunChineseIntensivePage || isFunChineseLessonPage || isCultureMapPage || isCharacterWritingPage

  // 主四 tab + LingoFlash + GrammarPuzzle + SyntaxSnap + HSKPrepTraining + LibraryBookSelection + FunChineseHub + FunChineseLesson + CultureMap + CharacterWriting：显示系统状态栏；其它全屏页不显示
  const showSystemBar =
    ['/', '/AI', '/Home', '/library', '/specialized', '/apps', '/hsk-test'].includes(location.pathname) || 
    isLingoFlashPage || 
    isGrammarPuzzlePage || 
    isSyntaxSnapPage ||
    isHSKPrepTrainingPage ||
    isHSKSkillDrillPage ||
    isHSKOralReviewPage ||
    isLibraryBookSelectionPage ||
    isFunChineseHubPage ||
    isFunChineseIntensivePage ||
    isFunChineseLessonPage ||
    isCultureMapPage ||
    isCharacterWritingPage

  const showTopBanner = !hideChromeNav
  const showBottomNav = !hideChromeNav
  
  // Calculate scaled heights based on screen size
  const is960 = screenSize === '960x540'
  const systemBarHeight = is960 ? 24 : (is2000x1200 ? 44 : (is1920x1125 ? 40 : 32))
  const topBannerHeight = is960 ? 56 : (is2000x1200 ? 110 : (is1920x1125 ? 100 : 80))
  // Reserve space for BottomNavigator: 4-dot tab indicator + dock + camera (absolute bottom)
  const bottomNavHeight = is960 ? 96 : (is2000x1200 ? 158 : (is1920x1125 ? 146 : 124))
  const totalTopHeight = (showSystemBar ? systemBarHeight : 0) + (showTopBanner ? topBannerHeight : 0)

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a', 
      overflow: 'hidden'
    }}>
      {/* 1920x1125: wrapper with scaled size so layout fits viewport and no scroll */}
      {is1920x1125 ? (
        <Box
          sx={{
            width: DESIGN_1920 * scale1920,
            height: DESIGN_1125 * scale1920,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }}
        >
          <Box
            id="ipad-container"
            sx={{
              width: DESIGN_1920,
              height: DESIGN_1125,
              flexShrink: 0,
              transform: `scale(${scale1920})`,
              transformOrigin: 'top left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFF8F0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 100px rgba(0,0,0,0.5)',
              borderRadius: '32px',
              border: '16px solid #333',
              boxSizing: 'border-box'
            }}
          >
            {showSystemBar && <SystemStatusBar />}
            {showTopBanner && <TopBanner />}
            <Box
              component="main"
              id="main-content-area"
              sx={{
                flexGrow: 1,
                position: isCoveringMain ? 'absolute' : 'relative',
                inset: isCoveringMain ? 0 : 'auto',
                zIndex: isCoveringMain ? 1200 : 1,
                width: '100%',
                height: isCoveringMain
                  ? '100%'
                  : `calc(100% - ${totalTopHeight + (showBottomNav ? bottomNavHeight : 0)}px)`,
                mt: isCoveringMain ? 0 : `${totalTopHeight}px`,
                mb: showBottomNav ? `${bottomNavHeight}px` : 0,
                overflowY: 'hidden',
                backgroundColor: '#FFF8F0',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {children}
            </Box>
            {showBottomNav && <BottomNavigator />}
          </Box>
        </Box>
      ) : (
      <>
      {/* iPad/Tablet Container: non-1920x1125（含 2000x1200 原比例） */}
      <Box 
        id="ipad-container"
        sx={{
          width: screenWidth,
          height: screenHeight,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFF8F0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,0,0,0.5)', 
          borderRadius: is960 ? '18px' : (is2000x1200 ? '28px' : '24px'), 
          border: is960 ? '10px solid #333' : (is2000x1200 ? '14px solid #333' : '12px solid #333'),
          boxSizing: 'border-box',
          transform: { xs: 'scale(0.35)', sm: 'scale(0.6)', md: 'scale(0.85)', lg: 'scale(1)' },
          transformOrigin: 'center center'
        }}>
        {showSystemBar && <SystemStatusBar />}
        {showTopBanner && <TopBanner />}
        <Box
        component="main"
          id="main-content-area"
        sx={{
          flexGrow: 1,
            position: isCoveringMain ? 'absolute' : 'relative',
            inset: isCoveringMain ? 0 : 'auto',
            zIndex: isCoveringMain ? 1200 : 1,
            width: '100%',
            height: isCoveringMain
              ? '100%'
              : `calc(100% - ${totalTopHeight + (showBottomNav ? bottomNavHeight : 0)}px)`,
            mt: isCoveringMain ? 0 : `${totalTopHeight}px`,
            mb: showBottomNav ? `${bottomNavHeight}px` : 0,
            overflowY: 'hidden',
            backgroundColor: '#FFF8F0',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
        </Box>
        {showBottomNav && <BottomNavigator />}
      </Box>
      </>
      )}
    </Box>
  )
}
