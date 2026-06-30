import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { getProgramTrackFromPath } from '../data/programTracks';
import HomeLessonHero from '../components/home/HomeLessonHero';
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
  useHomeSideStyles,
} from '../components/home/HomeSideCard';

export default function HSKStandardHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const track = getProgramTrackFromPath('/hsk-standard');
  const { sideCardSx, sideArrowSx, sideNextSx } = useHomeSideStyles(is960);

  return (
    <HomePageShell is960={is960} pageBg={track.pageBg}>
      <HomeLessonHero
        is960={is960}
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

      <HomeSideCardStack is960={is960}>
        <HomeSideCard
          lines={[t('hsk.speakingPro1'), t('hsk.speakingPro2')]}
          bgcolor="#C0392B"
          icon={<MicOutlinedIcon sx={{ fontSize: is960 ? 24 : 31, opacity: 0.96 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/hsk-standard/speaking-pro', { state: { from: '/hsk-standard' } })}
        />
        <HomeSideCard
          lines={[t('hsk.writingTraining1'), t('hsk.writingTraining2')]}
          bgcolor="#922B21"
          icon={<EditNoteIcon sx={{ fontSize: is960 ? 24 : 31, opacity: 0.96 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/hsk-standard/writing-training', { state: { from: '/hsk-standard' } })}
        />
        <HomeSideCard
          lines={[t('hsk.studyWork1'), t('hsk.studyWork2')]}
          bgcolor="#641E16"
          icon={<SchoolOutlinedIcon sx={{ fontSize: is960 ? 24 : 31, opacity: 0.96 }} />}
          is960={is960}
          sideCardSx={sideCardSx}
          sideArrowSx={sideArrowSx}
          sideNextSx={sideNextSx}
          onClick={() => navigate('/hsk-standard/study-work-china', { state: { from: '/hsk-standard' } })}
        />
      </HomeSideCardStack>
    </HomePageShell>
  );
}
