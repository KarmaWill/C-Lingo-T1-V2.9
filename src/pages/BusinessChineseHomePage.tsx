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
import { BUSINESS_DIALOGUE_GLOW, BUSINESS_DIALOGUE_SURFACE } from '../components/home/hubChrome'
import { APP_SCREEN_SIZE } from '../utils/figmaScale'
import { BUSINESS_TOPIC_KEYS } from '../data/businessTopics'

const BCT_LEVELS = ['BCT 1', 'BCT 2', 'BCT 3', 'BCT 4', 'BCT 5']

export default function BusinessChineseHomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentLevel, setCurrentLevel] = useState('BCT 1')
  const [currentTopic, setCurrentTopic] = useState<(typeof BUSINESS_TOPIC_KEYS)[number]>('meeting')
  const screenSize = APP_SCREEN_SIZE

  return (
    <StudioHomeFrame screenSize={screenSize}>
      <StudioHomeHeader
        screenSize={screenSize}
        trackId="business-chinese"
        levelSelect={{
          label: currentLevel,
          ariaLabel: 'BCT level',
          options: BCT_LEVELS.map((level) => ({ value: level, label: level })),
          onSelect: (level) => {
            setCurrentLevel(level)
            setCurrentTopic('meeting')
          },
        }}
        unitSelect={{
          label: t(`business.topics.${currentTopic}`),
          ariaLabel: 'Business topic',
          options: BUSINESS_TOPIC_KEYS.map((topic) => ({
            value: topic,
            label: t(`business.topics.${topic}`),
          })),
          onSelect: (value) => setCurrentTopic(value as (typeof BUSINESS_TOPIC_KEYS)[number]),
        }}
      />

      <HomePageShell screenSize={screenSize}>
        <HomeLessonHero
          screenSize={screenSize}
          from="/business-chinese"
          lessonId="business-bct1-meeting"
          imageSrc="/images/business-chinese-hero.png"
          imagePosition="38% center"
          eyebrow={t('business.eyebrow')}
          title={t('business.heroTitle')}
          wordCount={22}
          patternCount={2}
          wordLabel={t('business.points')}
          patternLabel={t('business.modules')}
          durationLabel={`14 ${t('business.mins')}`}
          masteryLabel={t('business.moduleMastery')}
          masteryValue={38}
          progressColor="#D4A853"
        />

        <HomeSideCardStack screenSize={screenSize} fill>
          <HomeSideCard
            variant="spotlight"
            fill
            screenSize={screenSize}
            label={t('business.businessDialogue')}
            subtitle={t('business.businessDialogueHint')}
            bgcolor={BUSINESS_DIALOGUE_SURFACE}
            glow={BUSINESS_DIALOGUE_GLOW}
            onClick={() =>
              navigate('/business-chinese/scenario-dialogue', { state: { from: '/business-chinese' } })
            }
            spotlightVisual={
              <Box
                component="img"
                src="/images/clingo-ai-mascot-tutor.png?v=star-eyes"
                alt={t('business.businessDialogue')}
                draggable={false}
                width={260}
                height={320}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  display: 'block',
                  pointerEvents: 'auto',
                  userSelect: 'none',
                }}
              />
            }
          />
        </HomeSideCardStack>
      </HomePageShell>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}
