import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import HomeLessonHero from '../components/home/HomeLessonHero'
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
} from '../components/home/HomeSideCard'
import StudioHomeHeader, { StudioHomeFrame } from '../components/home/StudioHomeHeader'
import { AI_TUTOR_GLOW, HUB_CANVAS_CLINGO, STUDIO_MAIN1 } from '../components/home/hubChrome'
import { APP_SCREEN_SIZE } from '../utils/figmaScale'

const LEVELS = ['Level 1', 'Level 2', 'Level 3']

const UNITS_BY_LEVEL: Record<string, string[]> = {
  'Level 1': [
    'Unit 1: Hello & Greetings',
    'Unit 2: My Family',
    'Unit 3: Numbers & Colors',
    'Unit 4: Daily Activities',
    'Unit 5: Food & Drinks',
    'Unit 6: Time & Dates',
    'Unit 7: Weather & Seasons',
    'Unit 8: Basic Questions',
  ],
  'Level 2': [
    'Unit 1: Shopping & Money',
    'Unit 2: Transportation',
    'Unit 3: Health & Body',
    'Unit 4: School & Study',
    'Unit 5: Hobbies & Sports',
    'Unit 6: Travel & Places',
    'Unit 7: Emotions & Feelings',
    'Unit 8: Descriptions',
  ],
  'Level 3': [
    'Unit 1: Work & Career',
    'Unit 2: Technology',
    'Unit 3: Culture & Traditions',
    'Unit 4: Environment',
    'Unit 5: Social Media',
    'Unit 6: Future Plans',
    'Unit 7: Opinions & Advice',
    'Unit 8: Complex Conversations',
  ],
}

/**
 * Figma 真源：主界面1 Frame 1410141884（2508 → 1920）
 * 三轨共用 Studio 壳；C-Lingo 右卡 AI Tutor / Pinyin Chart
 */
export default function HomePage() {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState('Level 1')
  const [currentUnit, setCurrentUnit] = useState('Unit 1: Hello & Greetings')
  const screenSize = APP_SCREEN_SIZE

  return (
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_CLINGO}>
      <StudioHomeHeader
        screenSize={screenSize}
        trackId="c-lingo"
        levelSelect={{
          label: currentLevel,
          ariaLabel: 'Level',
          options: LEVELS.map((level) => ({ value: level, label: level })),
          onSelect: (level) => {
            setCurrentLevel(level)
            setCurrentUnit(UNITS_BY_LEVEL[level][0])
          },
        }}
        unitSelect={{
          label: currentUnit,
          ariaLabel: 'Unit',
          options: UNITS_BY_LEVEL[currentLevel].map((unit) => ({ value: unit, label: unit })),
          onSelect: setCurrentUnit,
        }}
      />

      <HomePageShell
        screenSize={screenSize}
        hero={STUDIO_MAIN1.hero}
        rail={STUDIO_MAIN1.rail}
        gap={STUDIO_MAIN1.gap}
      >
        <HomeLessonHero
          screenSize={screenSize}
          from="/AI"
          imageSrc="/images/c-lingo-hero.png"
          imagePosition="42% center"
          wordCount={3}
          patternCount={3}
        />

        <HomeSideCardStack screenSize={screenSize} pair>
          <HomeSideCard
            variant="spotlight"
            pair
            screenSize={screenSize}
            label="AI Tutor"
            bgcolor={STUDIO_MAIN1.tutor}
            glow={AI_TUTOR_GLOW}
            onClick={() => navigate('/ai-chat', { state: { from: '/AI' } })}
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
            label="Pinyin Chart"
            bgcolor={STUDIO_MAIN1.pinyin}
            glow="rgba(44, 219, 200, 0.55)"
            onClick={() => navigate('/pinyin-chart', { state: { from: '/AI' } })}
            spotlightVisual={
              <Box
                component="img"
                src="/images/pinyin-chart-tile.png"
                alt="Pinyin Chart"
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
        </HomeSideCardStack>
      </HomePageShell>
    </StudioHomeFrame>
  )
}
