import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { LessonStage, Unit, Stage } from '../types/lesson'
import { CURRENT_LESSON } from '../mock/lessonData'

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
  
  // 核心状态管理
  const [stage, setStage] = useState<LessonStage | Stage>(LessonStage.HOME)
  const [currentUnit, setCurrentUnit] = useState<Unit>(CURRENT_LESSON.units[0])
  const [completedUnits, setCompletedUnits] = useState<string[]>([])

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

  const renderContent = () => {
    switch (stage) {
      case LessonStage.VIDEO:
        return (
          <VideoStage 
            lesson={CURRENT_LESSON} 
            onComplete={() => setStage(LessonStage.UNIT_SELECTION)} 
          />
        )

      case LessonStage.UNIT_SELECTION: // Hub
        return (
          <UnitSelectionStage 
            lesson={CURRENT_LESSON}
            completedUnitIds={completedUnits}
            onSelectUnit={(unit) => {
              setCurrentUnit(unit)
              setStage(LessonStage.UNIT_LEARNING)
            }}
            onSelectCulture={() => navigate('/culture-content')}
            onSelectUpsell={() => navigate('/ai-chat')}
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
            data={CURRENT_LESSON.cultureVideo}
            onBack={() => setStage(LessonStage.UNIT_SELECTION)}
          />
        )

      case LessonStage.HSK_UPSELL: // Deep Learning Hub
        return (
          <HSKUpsellStage 
            onBack={() => setStage(LessonStage.UNIT_SELECTION)}
            onSelectFeature={(feature) => {
              if (feature === Stage.PREMIUM_AI) {
                navigate('/ai-chat')
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
