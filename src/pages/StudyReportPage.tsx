import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CURRENT_LESSON } from '../mock/lessonData';
import { LearningCard } from '../types/lesson';
import FeedbackEntryButton from '../components/feedback/FeedbackEntryButton';

const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';

/** Prefer English-only gloss; strip leading "中文 / " if mock still has it. */
function englishMeaning(meaning: string): string {
  const parts = meaning.split(/\s*\/\s*/);
  return (parts[parts.length - 1] || meaning).trim();
}

function ReportItemCard({
  item,
  is960,
  is1920x1125,
  wide,
}: {
  item: LearningCard;
  is960: boolean;
  is1920x1125: boolean;
  wide?: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        px: is960 ? 1.5 : is1920x1125 ? 2.25 : 2,
        py: is960 ? 1.35 : is1920x1125 ? 1.85 : 1.65,
        borderRadius: is960 ? '14px' : '18px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
        border: '1px solid #EEF2F0',
        textAlign: 'center',
        boxSizing: 'border-box',
        minWidth: wide ? (is960 ? 140 : 168) : is960 ? 88 : 104,
        flex: wide ? '1 1 168px' : '0 0 auto',
      }}
    >
      <Typography
        sx={{
          fontSize: is960 ? '0.72rem' : is1920x1125 ? '0.9rem' : '0.8rem',
          color: '#9CA3AF',
          fontWeight: 600,
          letterSpacing: '0.01em',
          mb: 0.45,
          lineHeight: 1.2,
        }}
      >
        {item.pinyin}
      </Typography>
      <Typography
        sx={{
          fontSize: wide
            ? is960
              ? '1.35rem'
              : is1920x1125
                ? '1.85rem'
                : '1.55rem'
            : is960
              ? '1.85rem'
              : is1920x1125
                ? '2.4rem'
                : '2.1rem',
          fontWeight: 700,
          color: '#1F2937',
          fontFamily: KAI_TI,
          lineHeight: 1.25,
          mb: 0.45,
        }}
      >
        {item.content}
      </Typography>
      <Typography
        sx={{
          fontSize: is960 ? '0.68rem' : is1920x1125 ? '0.85rem' : '0.75rem',
          color: '#9CA3AF',
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {englishMeaning(item.meaning)}
      </Typography>
    </Box>
  );
}

function SentenceCard({
  item,
  is960,
  is1920x1125,
}: {
  item: LearningCard;
  is960: boolean;
  is1920x1125: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        px: is960 ? 2 : is1920x1125 ? 3 : 2.5,
        py: is960 ? 1.5 : is1920x1125 ? 2.25 : 1.85,
        borderRadius: is960 ? '14px' : '18px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
        border: '1px solid #EEF2F0',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        sx={{
          fontSize: is960 ? '0.72rem' : is1920x1125 ? '0.95rem' : '0.82rem',
          color: '#9CA3AF',
          fontWeight: 600,
          mb: 0.65,
          lineHeight: 1.35,
        }}
      >
        {item.pinyin}
      </Typography>
      <Typography
        sx={{
          fontSize: is960 ? '1.15rem' : is1920x1125 ? '1.55rem' : '1.35rem',
          fontWeight: 700,
          color: '#1F2937',
          fontFamily: KAI_TI,
          mb: 0.65,
          lineHeight: 1.4,
        }}
      >
        {item.content}
      </Typography>
      <Typography
        sx={{
          fontSize: is960 ? '0.78rem' : is1920x1125 ? '1rem' : '0.88rem',
          color: '#9CA3AF',
          fontWeight: 500,
          lineHeight: 1.35,
        }}
      >
        {englishMeaning(item.meaning)}
      </Typography>
    </Box>
  );
}

function SectionTitle({
  label,
  is960,
  is1920x1125,
}: {
  label: string;
  is960: boolean;
  is1920x1125: boolean;
}) {
  return (
    <Typography
      sx={{
        fontSize: is960 ? '1.05rem' : is1920x1125 ? '1.55rem' : '1.35rem',
        fontWeight: 900,
        color: '#2D3436',
        mb: is1920x1125 ? 2 : 1.5,
        letterSpacing: '-0.01em',
      }}
    >
      {label}
    </Typography>
  );
}

export default function StudyReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hskLevelRaw = searchParams.get('hskLevel');
  const hskReportLevel =
    hskLevelRaw != null && /^[1-6]$/.test(hskLevelRaw) ? (Number(hskLevelRaw) as 1 | 2 | 3 | 4 | 5 | 6) : null;

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const lesson = (location.state as { lesson?: typeof CURRENT_LESSON } | null)?.lesson || CURRENT_LESSON;

  const allVocab: LearningCard[] = [];
  const allSentences: LearningCard[] = [];
  const allHanzi: LearningCard[] = [];

  lesson.units.forEach((unit) => {
    unit.learnings.forEach((learning) => {
      if (learning.type === 'vocab') allVocab.push(learning);
      else if (learning.type === 'sentence') allSentences.push(learning);
      else if (learning.type === 'hanzi') allHanzi.push(learning);
    });
  });

  const handleBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from) {
      navigate(from);
      return;
    }
    navigate(`/lesson/${lesson.id}`);
  };

  const summaryCards = [
    {
      key: 'hanzi',
      label: 'Chinese Characters',
      value: allHanzi.length,
      gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      labelColor: '#1976D2',
      valueColor: '#1976D2',
      iconBg: '#2196F3',
      shadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
      icon: (
        <Typography sx={{ fontSize: is960 ? '1.25rem' : is1920x1125 ? '1.75rem' : '1.5rem', fontWeight: 900, color: 'white', fontFamily: KAI_TI }}>
          汉
        </Typography>
      ),
    },
    {
      key: 'vocab',
      label: 'Vocabularies',
      value: allVocab.length,
      gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      labelColor: '#388E3C',
      valueColor: '#388E3C',
      iconBg: '#4CAF50',
      shadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
      icon: (
        <Typography sx={{ fontSize: is960 ? '1.25rem' : is1920x1125 ? '1.75rem' : '1.5rem', fontWeight: 900, color: 'white', fontFamily: 'monospace' }}>
          W
        </Typography>
      ),
    },
    {
      key: 'sentence',
      label: 'Sentences',
      value: allSentences.length,
      gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
      labelColor: '#F57C00',
      valueColor: '#F57C00',
      iconBg: '#FF9800',
      shadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
      icon: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Box sx={{ width: is960 ? 16 : is1920x1125 ? 24 : 20, height: is960 ? 2 : is1920x1125 ? 3 : 2.5, bgcolor: 'white', borderRadius: '1px' }} />
          <Box sx={{ width: is960 ? 16 : is1920x1125 ? 24 : 20, height: is960 ? 2 : is1920x1125 ? 3 : 2.5, bgcolor: 'white', borderRadius: '1px' }} />
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F7F9F8',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: is960 ? 2 : 3,
          borderBottom: is1920x1125 ? 'none' : '2px solid #E0E0E0',
          flexShrink: 0,
        }}
      >
        <ButtonBase
          onClick={handleBack}
          sx={{
            bgcolor: 'white',
            color: '#1F2937',
            width: is960 ? 40 : 48,
            height: is960 ? 40 : 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : 24 }} />
        </ButtonBase>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436', fontSize: is960 ? '1.25rem' : is1920x1125 ? '2rem' : '1.75rem' }}>
          {hskReportLevel != null ? `HSK ${hskReportLevel} · Study Report` : 'Study Report'}
        </Typography>

        <FeedbackEntryButton is960={is960} context={{ screen: 'study_report' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: is960 ? 2 : is1920x1125 ? 4 : 3.5,
          boxSizing: 'border-box',
        }}
      >
        <Grid container spacing={is960 ? 1.5 : 2.5} sx={{ mb: is1920x1125 ? 4 : 3 }}>
          {summaryCards.map((card) => (
            <Grid item xs={4} key={card.key}>
              <Box
                sx={{
                  background: card.gradient,
                  p: is960 ? 1.5 : is1920x1125 ? 2.5 : 2,
                  borderRadius: is960 ? '16px' : '24px',
                  boxShadow: card.shadow,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: is960 ? 8 : 12,
                    right: is960 ? 8 : 12,
                    width: is960 ? 40 : is1920x1125 ? 56 : 48,
                    height: is960 ? 40 : is1920x1125 ? 56 : 48,
                    bgcolor: card.iconBg,
                    borderRadius: is960 ? '8px' : '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.75rem' : is1920x1125 ? '1rem' : '0.875rem',
                    color: card.labelColor,
                    fontWeight: 700,
                    mb: is960 ? 0.5 : 0.75,
                    pr: is960 ? 5 : 6,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '1.75rem' : is1920x1125 ? '3rem' : '2.5rem',
                    fontWeight: 900,
                    color: card.valueColor,
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {allHanzi.length > 0 && (
          <Box sx={{ mb: is1920x1125 ? 4 : 3 }}>
            <SectionTitle label="Character List" is960={is960} is1920x1125={is1920x1125} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 1.25 : 1.5 }}>
              {allHanzi.map((hanzi) => (
                <ReportItemCard key={hanzi.id} item={hanzi} is960={is960} is1920x1125={is1920x1125} />
              ))}
            </Box>
          </Box>
        )}

        {allVocab.length > 0 && (
          <Box sx={{ mb: is1920x1125 ? 4 : 3 }}>
            <SectionTitle label="Vocabulary List" is960={is960} is1920x1125={is1920x1125} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 1.25 : 1.5 }}>
              {allVocab.map((vocab) => (
                <ReportItemCard
                  key={vocab.id}
                  item={vocab}
                  is960={is960}
                  is1920x1125={is1920x1125}
                  wide={vocab.content.length > 2}
                />
              ))}
            </Box>
          </Box>
        )}

        {allSentences.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <SectionTitle label="Key Sentences" is960={is960} is1920x1125={is1920x1125} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5 }}>
              {allSentences.map((sentence) => (
                <SentenceCard key={sentence.id} item={sentence} is960={is960} is1920x1125={is1920x1125} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
