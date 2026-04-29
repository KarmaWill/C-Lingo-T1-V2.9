import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import MainLayout from './components/MainUI/MainLayout'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import AIChatPage from './pages/AIChatPage'
import LibraryPage from './pages/LibraryPage'
import LibraryBookSelectionPage from './pages/LibraryBookSelectionPage'
import SpecializedTracksPage from './pages/SpecializedTracksPage'
import CameraPage from './pages/CameraPage'
import AppsPage from './pages/AppsPage'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import HSKTestPage from './pages/HSKTestPage'
import CultureContentPage from './pages/CultureContentPage'
import PinyinChartPage from './pages/PinyinChartPage'
import BookReaderPage from './pages/BookReaderPage'
import DailyGainsPage from './pages/DailyGainsPage'
import StudyReportPage from './pages/StudyReportPage'
import MistakesReviewPage from './pages/MistakesReviewPage'
import QuestionReviewPage from './pages/QuestionReviewPage'
import HSKMockExamPage from './pages/HSKMockExamPage'
import HSKPrepTestIntroPage from './pages/HSKPrepTestIntroPage'
import HSKPrepTrainingPage from './pages/HSKPrepTrainingPage'
import HSKSkillDrillPage from './pages/HSKSkillDrillPage'
import HSKOralReviewPage from './pages/HSKOralReviewPage'
import FlashcardPage from './pages/FlashcardPage'
import LingoFlashPage from './pages/LingoFlashPage'
import GrammarPuzzlePage from './pages/GrammarPuzzlePage'
import SyntaxSnapPage from './pages/SyntaxSnapPage'
import StartingLearningPage from './pages/StartingLearningPage'
import LibraryHubPlaceholderPage from './pages/LibraryHubPlaceholderPage'
import FunChineseHubPage from './pages/FunChineseHubPage'
import FunChineseCardCollectionPage from './pages/FunChineseCardCollectionPage'
import FunChineseLessonPage from './pages/FunChineseLessonPage'
import FunChineseIntensivePage from './pages/FunChineseIntensivePage'
import CharacterWritingPage from './pages/CharacterWritingPage'
import CultureMapPage from './pages/CultureMapPage'
import HSKGoStudyPlaceholderPage from './pages/HSKGoStudyPlaceholderPage'
import AudioReadingRoutePage from './pages/AudioReadingRoutePage'
import CultureVideoRoutePage from './pages/CultureVideoRoutePage'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00B4A0',
      light: '#4285f4',
      dark: '#1557b0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B35',
      light: '#5cb85c',
      dark: '#2d8e47',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFF8F0',
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Full-screen pages without MainLayout */}
        <Route path="/culture-content" element={<CultureContentPage />} />
        
        {/* Regular pages with MainLayout */}
        <Route path="*" element={
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/AI" replace />} />
              <Route path="/AI" element={<HomePage />} />
              <Route path="/Home" element={<LibraryPage />} />
              <Route path="/library" element={<Navigate to="/Home" replace />} />
              <Route path="/library/select-books" element={<LibraryBookSelectionPage />} />
              <Route path="/starting-learning" element={<StartingLearningPage />} />
              <Route path="/library/hub/fun-chinese" element={<FunChineseHubPage />} />
              <Route path="/library/hub/fun-chinese/card-collection" element={<FunChineseCardCollectionPage />} />
              <Route path="/library/hub/fun-chinese/intensive" element={<FunChineseIntensivePage />} />
              <Route path="/library/hub/fun-chinese/lesson/:lessonId" element={<FunChineseLessonPage />} />
              <Route path="/library/hub/culture" element={<CultureMapPage />} />
              <Route path="/character-writing/:character" element={<CharacterWritingPage />} />
              <Route path="/library/hub/:hubId" element={<LibraryHubPlaceholderPage />} />
              <Route path="/library/read/:bookId" element={<BookReaderPage />} />
              <Route path="/specialized" element={<SpecializedTracksPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/ai-chat" element={<AIChatPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/hsk-test" element={<HSKTestPage />} />
              <Route path="/hsk-go-study" element={<HSKGoStudyPlaceholderPage />} />
              <Route path="/audio-reading" element={<AudioReadingRoutePage />} />
              <Route path="/culture-video" element={<CultureVideoRoutePage />} />
              <Route path="/hsk-prep-test" element={<HSKPrepTestIntroPage />} />
              <Route path="/hsk-prep-training" element={<HSKPrepTrainingPage />} />
              <Route path="/hsk-skill-drill" element={<HSKSkillDrillPage />} />
              <Route path="/hsk-oral-review" element={<HSKOralReviewPage />} />
              <Route path="/flashcards" element={<FlashcardPage />} />
              <Route path="/lingo-flash" element={<LingoFlashPage />} />
              <Route path="/grammar-puzzle" element={<GrammarPuzzlePage />} />
              <Route path="/syntax-snap" element={<SyntaxSnapPage />} />
              <Route path="/pinyin-chart" element={<PinyinChartPage />} />
              <Route path="/daily-gains" element={<DailyGainsPage />} />
              <Route path="/study-report" element={<StudyReportPage />} />
              <Route path="/mistakes-review" element={<MistakesReviewPage />} />
              <Route path="/question-review" element={<QuestionReviewPage />} />
              <Route path="/hsk-mock-exam" element={<HSKMockExamPage />} />
        </Routes>
      </MainLayout>
        } />
      </Routes>
    </ThemeProvider>
  )
}

export default App
