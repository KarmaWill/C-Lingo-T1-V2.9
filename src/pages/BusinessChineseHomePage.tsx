import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import { getProgramTrackFromPath } from '../data/programTracks';
import BusinessLessonHero from '../components/home/BusinessLessonHero';
import {
  HomePageShell,
  HomeSideCard,
  HomeSideCardStack,
  useHomeSideStyles,
} from '../components/home/HomeSideCard';

export default function BusinessChineseHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const track = getProgramTrackFromPath('/business-chinese');
  const { sideCardSx, sideArrowSx, sideNextSx } = useHomeSideStyles(is960);

  const goldSideArrowSx = {
    ...sideArrowSx,
    bgcolor: 'rgba(212,168,83,0.22)',
    border: '1px solid rgba(212,168,83,0.35)',
    boxShadow: 'none',
  };

  const goldSideNextSx = {
    ...sideNextSx,
    color: 'rgba(212,168,83,0.8)',
  };

  const cardSx = { ...sideCardSx, color: '#F5F0E8' };

  return (
    <HomePageShell is960={is960} pageBg={track.pageBg}>
      <BusinessLessonHero
        is960={is960}
        from="/business-chinese"
        lessonId="business-bct1-meeting"
        imageSrc="/images/business-chinese-hero.png"
        imagePosition="38% center"
        eyebrow={t('business.eyebrow')}
        title={t('business.heroTitle')}
        wordCount={22}
        patternCount={2}
        durationLabel={`14 ${t('business.mins')}`}
        pointsLabel={t('business.points')}
        modulesLabel={t('business.modules')}
        masteryLabel={t('business.moduleMastery')}
        startSessionLabel={t('business.startSession')}
        aboutLabel={t('business.about')}
        masteryValue={38}
      />

      <HomeSideCardStack is960={is960}>
        <HomeSideCard
          lines={[t('business.scenarioDialogue1'), t('business.scenarioDialogue2')]}
          bgcolor="#1A1A1A"
          icon={<WorkOutlineIcon sx={{ fontSize: is960 ? 24 : 31, color: '#D4A853' }} />}
          is960={is960}
          sideCardSx={{ ...cardSx, border: '1px solid rgba(212,168,83,0.2)' }}
          sideArrowSx={goldSideArrowSx}
          sideNextSx={goldSideNextSx}
          onClick={() => navigate('/business-chinese/scenario-dialogue', { state: { from: '/business-chinese' } })}
        />
        <HomeSideCard
          lines={[t('business.documentTools1'), t('business.documentTools2')]}
          bgcolor="#141414"
          icon={<DescriptionOutlinedIcon sx={{ fontSize: is960 ? 24 : 31, color: '#D4A853' }} />}
          is960={is960}
          sideCardSx={{ ...cardSx, border: '1px solid rgba(212,168,83,0.15)' }}
          sideArrowSx={goldSideArrowSx}
          sideNextSx={goldSideNextSx}
          onClick={() => navigate('/business-chinese/document-tools', { state: { from: '/business-chinese' } })}
        />
        <HomeSideCard
          lines={[t('business.enterprisePlatform1'), t('business.enterprisePlatform2')]}
          bgcolor="#111111"
          icon={<BusinessCenterOutlinedIcon sx={{ fontSize: is960 ? 24 : 31, color: '#D4A853' }} />}
          is960={is960}
          sideCardSx={{ ...cardSx, border: '1px solid rgba(212,168,83,0.12)' }}
          sideArrowSx={goldSideArrowSx}
          sideNextSx={goldSideNextSx}
          onClick={() => navigate('/business-chinese/enterprise-platform', { state: { from: '/business-chinese' } })}
        />
      </HomeSideCardStack>
    </HomePageShell>
  );
}
