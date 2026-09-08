import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import HomeLessonHero from '../components/home/HomeLessonHero'
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
} from '../components/home/HomeSideCard'
import StudioHomeHeader, { StudioHomeFrame } from '../components/home/StudioHomeHeader'
import HubPagerDots from '../components/home/HubPagerDots'
import { APP_SCREEN_SIZE } from '../utils/figmaScale'

const HSK_LEVELS = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6']
const HSK_TOPICS = Array.from({ length: 8 }, (_, index) => `Topic ${index + 1}`)

export default function HSKStandardHomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentLevel, setCurrentLevel] = useState('HSK 1')
  const [currentTopic, setCurrentTopic] = useState('Topic 1')
  const screenSize = APP_SCREEN_SIZE

  return (
    <StudioHomeFrame screenSize={screenSize}>
      <StudioHomeHeader
        screenSize={screenSize}
        trackId="hsk-standard"
        levelSelect={{
          label: currentLevel,
          ariaLabel: 'HSK level',
          options: HSK_LEVELS.map((level) => ({ value: level, label: level })),
          onSelect: (level) => {
            setCurrentLevel(level)
            setCurrentTopic('Topic 1')
          },
        }}
        unitSelect={{
          label: currentTopic,
          ariaLabel: 'Topic',
          options: HSK_TOPICS.map((topic) => ({ value: topic, label: topic })),
          onSelect: setCurrentTopic,
        }}
      />

      <HomePageShell screenSize={screenSize}>
        <HomeLessonHero
          screenSize={screenSize}
          from="/hsk-standard"
          lessonId="hsk-1-topic-1"
          imageSrc="/images/hsk-standard-hero.png"
          imagePosition="48% center"
          eyebrow={t('hsk.eyebrow')}
          title={t('hsk.heroTitle')}
          wordCount={18}
          patternCount={2}
          durationLabel={`12 ${t('business.mins')}`}
          masteryLabel={t('hsk.topicMastery')}
          masteryValue={42}
          progressColor="#C0392B"
        />

        <HomeSideCardStack screenSize={screenSize}>
          <HomeSideCard
            variant="spotlight"
            screenSize={screenSize}
            label={`${t('hsk.speakingPro1')} ${t('hsk.speakingPro2')}`}
            bgcolor="linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)"
            spotlightArrowColor="#C0392B"
            onClick={() => navigate('/hsk-standard/speaking-pro', { state: { from: '/hsk-standard' } })}
            spotlightVisual={
              <Box
                component="img"
                src="/images/clingo-ai-mascot-tutor.png?v=star-eyes"
                alt=""
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  display: 'block',
                }}
              />
            }
          />
          <HomeSideCard
            variant="tool"
            screenSize={screenSize}
            label={`${t('hsk.writingTraining1')} ${t('hsk.writingTraining2')}`}
            bgcolor="#C0392B"
            onClick={() => navigate('/hsk-standard/writing-training', { state: { from: '/hsk-standard' } })}
          />
          <HomeSideCard
            variant="tool"
            screenSize={screenSize}
            label={`${t('hsk.studyWork1')} ${t('hsk.studyWork2')}`}
            bgcolor="#E07A5F"
            onClick={() => navigate('/hsk-standard/study-work-china', { state: { from: '/hsk-standard' } })}
          />
        </HomeSideCardStack>
      </HomePageShell>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}
