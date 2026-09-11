import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import HomeLessonHero from '../components/home/HomeLessonHero'
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
} from '../components/home/HomeSideCard'
import StudioHomeHeader, { StudioHomeFrame } from '../components/home/StudioHomeHeader'
import HubPagerDots from '../components/home/HubPagerDots'
import { AI_TUTOR_GLOW, BHS, HUB_CANVAS_BHS, STUDIO_MAIN1 } from '../components/home/hubChrome'
import { APP_SCREEN_SIZE, figmaPx } from '../utils/figmaScale'

const TOPIC_COUNT = 8
const ACTIVITY_COUNT = 8

export default function HSKStandardHomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentTopic, setCurrentTopic] = useState('1')
  const [currentActivity, setCurrentActivity] = useState('1')
  const screenSize = APP_SCREEN_SIZE
  const iconSize = figmaPx(168, screenSize)

  const topicOptions = useMemo(
    () =>
      Array.from({ length: TOPIC_COUNT }, (_, index) => {
        const n = String(index + 1)
        return { value: n, label: t('hsk.topicN', { n }) }
      }),
    [t],
  )
  const activityOptions = useMemo(
    () =>
      Array.from({ length: ACTIVITY_COUNT }, (_, index) => {
        const n = String(index + 1)
        return { value: n, label: t('hsk.activityN', { n }) }
      }),
    [t],
  )

  const topicLabel = t('hsk.topicN', { n: currentTopic })
  const activityLabel = t('hsk.activityN', { n: currentActivity })
  const heroTitle =
    currentTopic === '1' && currentActivity === '1'
      ? t('hsk.heroTitle')
      : `${topicLabel} | ${activityLabel}`

  return (
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_BHS}>
      <StudioHomeHeader
        screenSize={screenSize}
        trackId="hsk-standard"
        tone="burnside"
        levelSelect={{
          label: topicLabel,
          ariaLabel: 'Topic',
          options: topicOptions,
          onSelect: (topic) => {
            setCurrentTopic(topic)
            setCurrentActivity('1')
          },
        }}
        unitSelect={{
          label: activityLabel,
          ariaLabel: 'Activity',
          options: activityOptions,
          onSelect: setCurrentActivity,
        }}
      />

      <HomePageShell screenSize={screenSize}>
        <HomeLessonHero
          screenSize={screenSize}
          from="/hsk-standard"
          lessonId="hsk-1-topic-1"
          imageSrc="/images/burnside/values-hero.png?v=band"
          imagePosition="center center"
          eyebrow={t('hsk.eyebrow')}
          title={heroTitle}
          wordCount={18}
          patternCount={2}
          durationLabel={`12 ${t('business.mins')}`}
          masteryLabel={t('hsk.topicMastery')}
          masteryValue={42}
          progressColor={BHS.gold}
          eyebrowColor={BHS.gold}
          scrimOpacity={0.42}
        />

        <HomeSideCardStack screenSize={screenSize} pair>
          <HomeSideCard
            variant="spotlight"
            pair
            screenSize={screenSize}
            label="AI Tutor"
            bgcolor={STUDIO_MAIN1.tutor}
            glow={AI_TUTOR_GLOW}
            onClick={() => navigate('/ai-chat', { state: { from: '/hsk-standard' } })}
            spotlightVisual={
              <Box
                component="img"
                src="/images/clingo-ai-mascot-tutor.png?v=star-eyes"
                alt="AI Tutor"
                draggable={false}
                width={228}
                height={228}
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
          <HomeSideCard
            variant="tool"
            pair
            screenSize={screenSize}
            label={t('hsk.seminar')}
            bgcolor={BHS.teal}
            glow="rgba(0, 176, 144, 0.5)"
            onClick={() =>
              navigate('/hsk-standard/seminar', { state: { from: '/hsk-standard' } })
            }
            spotlightVisual={
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  pr: '6%',
                  pb: '8%',
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                <GroupsOutlined
                  sx={{ width: iconSize, height: iconSize, display: 'block' }}
                  aria-hidden
                />
              </Box>
            }
          />
        </HomeSideCardStack>
      </HomePageShell>
      <HubPagerDots screenSize={screenSize} onDark />
    </StudioHomeFrame>
  )
}
