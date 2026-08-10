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
          bgcolor="#0D9F72"
          accentColor="#0D9F72"
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          spotlightVisual={
            <Box
              component="img"
              src="/images/clingo-ai-mascot-head.png?v=3d"
              alt=""
              sx={{
                width: '118%',
                height: '118%',
                maxWidth: 'none',
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'block',
                pointerEvents: 'none',
                transform: 'translateX(-12%)',
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
