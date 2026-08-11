import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import HomeLessonHero from '../components/home/HomeLessonHero';
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
  useHomeSideStyles,
} from '../components/home/HomeSideCard';

export default function HomePage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const { sideCardSx, sideArrowSx } = useHomeSideStyles(is960);

  return (
    <HomePageShell is960={is960}>
      <HomeLessonHero
        is960={is960}
        from="/AI"
        imageSrc="/images/c-lingo-hero.png"
        imagePosition="42% center"
      />

      <HomeSideCardStack is960={is960}>
        <HomeSideCard
          variant="spotlight"
          label="AI Tutor"
          bgcolor="linear-gradient(90deg, #43B05C 0%, #8FCF4A 52%, #D4E157 100%)"
          accentColor="#43B05C"
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          spotlightVisual={
            <Box
              component="img"
              src="/images/clingo-ai-mascot-tutor.png?v=star-eyes"
              alt=""
              sx={{
                width: '118%',
                height: '108%',
                maxWidth: 'none',
                objectFit: 'contain',
                objectPosition: 'left bottom',
                display: 'block',
                pointerEvents: 'none',
                transform: 'translateX(-18%) translateY(4%)',
                filter: 'drop-shadow(0 8px 14px rgba(15,23,42,0.14))',
              }}
            />
          }
          onClick={() => navigate('/ai-chat')}
        />
        <HomeSideCard
          variant="tool"
          lines={['Reading', 'Buddy']}
          subtitle="Improve your reading"
          bgcolor="#3761E2"
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          onClick={() => navigate('/reading-buddy')}
        />
        <HomeSideCard
          variant="tool"
          label="Class Generator"
          subtitle="Build custom lessons"
          bgcolor="#6F2682"
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          onClick={() => navigate('/grammar-puzzle')}
        />
      </HomeSideCardStack>
    </HomePageShell>
  );
}
