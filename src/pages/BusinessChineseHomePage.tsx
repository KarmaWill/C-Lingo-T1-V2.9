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

        <HomeSideCardStack screenSize={screenSize}>
          <HomeSideCard
            variant="spotlight"
            screenSize={screenSize}
            label={`${t('business.scenarioDialogue1')} ${t('business.scenarioDialogue2')}`}
            bgcolor="linear-gradient(135deg, #C9A227 0%, #D4A853 100%)"
            spotlightArrowColor="#C9A227"
            onClick={() =>
              navigate('/business-chinese/scenario-dialogue', { state: { from: '/business-chinese' } })
            }
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
            label={`${t('business.documentTools1')} ${t('business.documentTools2')}`}
            bgcolor="#00B4A0"
            onClick={() =>
              navigate('/business-chinese/document-tools', { state: { from: '/business-chinese' } })
            }
          />
          <HomeSideCard
            variant="tool"
            screenSize={screenSize}
            label={`${t('business.enterprisePlatform1')} ${t('business.enterprisePlatform2')}`}
            bgcolor="#FF6B35"
            onClick={() =>
              navigate('/business-chinese/enterprise-platform', { state: { from: '/business-chinese' } })
            }
          />
        </HomeSideCardStack>
      </HomePageShell>
    </StudioHomeFrame>
  )
}
