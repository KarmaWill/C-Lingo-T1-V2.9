import { useNavigate } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
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
  const { sideCardSx, sideArrowSx, sideNextSx } = useHomeSideStyles(is960);

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
          lines={['Speaking', 'Tutor']}
          bgcolor="#F97316"
          icon={<SmartToyIcon sx={{ fontSize: is960 ? 24 : 28, opacity: 0.96 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/ai-chat')}
        />
        <HomeSideCard
          lines={['Reading', 'Buddy']}
          bgcolor="#2563EB"
          icon={<MenuBookRoundedIcon sx={{ fontSize: is960 ? 25 : 29, opacity: 0.96 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/reading-buddy')}
        />
        <HomeSideCard
          label="Class Generator"
          bgcolor="#791F87"
          icon={<AutoAwesomeRoundedIcon sx={{ fontSize: is960 ? 26 : 30, opacity: 0.98 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/grammar-puzzle')}
        />
      </HomeSideCardStack>
    </HomePageShell>
  );
}
