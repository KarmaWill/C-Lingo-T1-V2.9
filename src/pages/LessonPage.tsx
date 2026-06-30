import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { LessonStage, Unit, Stage } from '../types/lesson'
import { getLessonById } from '../data/lessonCatalog'

// 子组件
import VideoStage from '../components/Lesson/VideoStage'
import UnitSelectionStage from '../components/Lesson/UnitSelectionStage'
import UnitLearningStage from '../components/Lesson/UnitLearningStage'
import ExerciseStage from '../components/Lesson/ExerciseStage'
import CultureVideoStage from '../components/Lesson/CultureVideoStage'
import HSKUpsellStage from '../components/Lesson/HSKUpsellStage'
import { HSKDrillStage, DigitalHumanStage, HanziStage } from '../components/Lesson/PremiumFeatures'

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const lesson = useMemo(() => getLessonById(id), [id])

  // 核心状态管理
  const [stage, setStage] = useState<LessonStage | Stage>(LessonStage.HOME)
  const [currentUnit, setCurrentUnit] = useState<Unit>(lesson.units[0])
  const [completedUnits, setCompletedUnits] = useState<string[]>([])

  useEffect(() => {
    setCurrentUnit(lesson.units[0])
    setCompletedUnits([])
    setStage(LessonStage.HOME)
  }, [lesson])

  // 模拟进入逻辑：检查是否已经看过视频
  useEffect(() => {
    const hasSeenVideo = localStorage.getItem(`lesson_${id}_seen_video`)
    if (!hasSeenVideo) {
      setStage(LessonStage.VIDEO)
      localStorage.setItem(`lesson_${id}_seen_video`, 'true')
    } else {
      setStage(LessonStage.UNIT_SELECTION)
    }
  }, [id])

  const handleUnitComplete = (unitId: string) => {
    const newCompleted = [...new Set([...completedUnits, unitId])];
    setCompletedUnits(newCompleted);
    setStage(LessonStage.UNIT_SELECTION);
  };

  const backFrom = (location.state as { from?: string } | null)?.from

  const renderContent = () => {
    switch (stage) {
      case LessonStage.VIDEO:
        return (
          <VideoStage 
            lesson={lesson} 
            onComplete={() => setStage(LessonStage.UNIT_SELECTION)} 
          />
        )

      case LessonStage.UNIT_SELECTION: // Hub
        return (
          <UnitSelectionStage 
            lesson={lesson}
            completedUnitIds={completedUnits}
            onSelectUnit={(unit) => {
              setCurrentUnit(unit)
              setStage(LessonStage.UNIT_LEARNING)
            }}
            onSelectCulture={() => navigate('/culture-content', { state: { from: backFrom, lessonId: id } })}
            onSelectUpsell={() => navigate('/ai-chat', { state: { from: backFrom } })}
          />
        )

      case LessonStage.UNIT_LEARNING: // Study Card
        return (
          <UnitLearningStage 
            unit={currentUnit} 
            onComplete={() => setStage(LessonStage.EXERCISE)} 
            onExit={() => setStage(LessonStage.UNIT_SELECTION)} 
          />
        )

      case LessonStage.EXERCISE: // Practice
        return (
          <ExerciseStage 
            unit={currentUnit} 
            onComplete={() => handleUnitComplete(currentUnit.id)} 
            onExit={() => setStage(LessonStage.UNIT_SELECTION)} 
          />
        )

      case LessonStage.CULTURE_VIDEO: // Bonus Class
        return (
          <CultureVideoStage 
            data={lesson.cultureVideo}
            onBack={() => setStage(LessonStage.UNIT_SELECTION)}
          />
        )

      case LessonStage.HSK_UPSELL: // Deep Learning Hub
        return (
          <HSKUpsellStage 
            onBack={() => setStage(LessonStage.UNIT_SELECTION)}
            onSelectFeature={(feature) => {
              if (feature === Stage.PREMIUM_AI) {
                navigate('/ai-chat', { state: { from: backFrom } })
              } else {
                setStage(feature as any)
              }
            }}
          />
        )

      // 深度学习子模块
      case Stage.PREMIUM_HSK:
        return <HSKDrillStage onBack={() => setStage(LessonStage.HSK_UPSELL)} />
      
      case Stage.PREMIUM_DIGITAL_HUMAN:
        return <DigitalHumanStage onBack={() => setStage(LessonStage.HSK_UPSELL)} />
      
      case Stage.PREMIUM_HANZI:
        return <HanziStage onBack={() => setStage(LessonStage.HSK_UPSELL)} />

      default:
        return null
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {renderContent()}
    </Box>
  )
}
