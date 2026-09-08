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
import HubPagerDots from '../components/home/HubPagerDots'
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
 * Figma 真源：设计稿 1.0 · 主界面2 (2959:21)
 * 三轨共用 Studio 壳；C-Lingo 右卡 AI Tutor / Flashcards / Sentence Snap
 */
export default function HomePage() {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState('Level 1')
  const [currentUnit, setCurrentUnit] = useState('Unit 1: Hello & Greetings')
  const screenSize = APP_SCREEN_SIZE

  return (
    <StudioHomeFrame screenSize={screenSize}>
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

      <HomePageShell screenSize={screenSize}>
        <HomeLessonHero
          screenSize={screenSize}
          from="/AI"
          imageSrc="/images/c-lingo-hero.png"
          imagePosition="42% center"
          wordCount={3}
          patternCount={3}
        />

        <HomeSideCardStack screenSize={screenSize}>
          <HomeSideCard
            variant="spotlight"
            screenSize={screenSize}
            label="AI Tutor"
            bgcolor="linear-gradient(107.33deg, #A052FF -7.16%, #4F46E5 53.05%, #3528FF 100%)"
            onClick={() => navigate('/ai-chat', { state: { from: '/AI' } })}
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
            label="Flashcards"
            bgcolor="#00B4A0"
            onClick={() => navigate('/lingo-flash', { state: { from: '/AI' } })}
          />
          <HomeSideCard
            variant="tool"
            screenSize={screenSize}
            label="Sentence Snap"
            bgcolor="#FF6B35"
            onClick={() => navigate('/syntax-snap', { state: { from: '/AI' } })}
          />
        </HomeSideCardStack>
      </HomePageShell>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}
