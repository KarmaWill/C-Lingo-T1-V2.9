import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CURRENT_LESSON } from '../mock/lessonData';
import { LearningCard } from '../types/lesson';

export default function StudyReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hskLevelRaw = searchParams.get('hskLevel');
  const hskReportLevel =
    hskLevelRaw != null && /^[1-6]$/.test(hskLevelRaw) ? (Number(hskLevelRaw) as 1 | 2 | 3 | 4 | 5 | 6) : null;
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // Get lesson data from location state or use CURRENT_LESSON as fallback
  const lesson = (location.state as any)?.lesson || CURRENT_LESSON;
  
  // Collect all vocab, sentences, and hanzi from all units
  const allVocab: LearningCard[] = [];
  const allSentences: LearningCard[] = [];
  const allHanzi: LearningCard[] = [];
  
  lesson.units.forEach(unit => {
    unit.learnings.forEach(learning => {
      if (learning.type === 'vocab') {
        allVocab.push(learning);
      } else if (learning.type === 'sentence') {
        allSentences.push(learning);
      } else if (learning.type === 'hanzi') {
        allHanzi.push(learning);
      }
    });
  });

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#F7F9F8',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: is960 ? 2 : (is1920x1125 ? 3 : 3),
        borderBottom: is1920x1125 ? 'none' : '2px solid #E0E0E0',
        flexShrink: 0
      }}>
        <ButtonBase
          onClick={handleBack}
          sx={{
            bgcolor: 'white', 
            color: '#1F2937', 
            width: is960 ? 40 : (is1920x1125 ? 48 : 48), 
            height: is960 ? 40 : (is1920x1125 ? 48 : 48), 
            borderRadius: '50%',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 24 : 24) }} />
        </ButtonBase>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436', fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.75rem') }}>
          {hskReportLevel != null ? `HSK ${hskReportLevel} · Study Report` : 'Study Report'}
        </Typography>

        <Box sx={{ width: is960 ? 40 : (is1920x1125 ? 48 : 48) }} />
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: is960 ? 2 : (is1920x1125 ? 4 : 4),
        boxSizing: 'border-box'
      }}>
        {/* Summary Stats */}
        <Grid container spacing={is960 ? 2 : (is1920x1125 ? 3 : 3)} sx={{ mb: is1920x1125 ? 4 : 3 }}>
          {/* Chinese Characters Card */}
          <Grid item xs={4}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), 
              borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '24px'), 
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: is960 ? 8 : (is1920x1125 ? 12 : 12),
                right: is960 ? 8 : (is1920x1125 ? 12 : 12),
                width: is960 ? 40 : (is1920x1125 ? 56 : 48),
                height: is960 ? 40 : (is1920x1125 ? 56 : 48),
                bgcolor: '#2196F3',
                borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <Typography sx={{ 
                  fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
                  fontWeight: 900, 
                  color: 'white' 
                }}>
                  汉
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                color: '#1976D2', 
                fontWeight: 700,
                mb: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75)
              }}>
                Chinese Characters
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '1.75rem' : (is1920x1125 ? '3rem' : '2.5rem'), 
                fontWeight: 900, 
                color: '#1976D2'
              }}>
                {allHanzi.length}
              </Typography>
            </Box>
          </Grid>
          
          {/* Vocabularies Card */}
          <Grid item xs={4}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), 
              borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '24px'), 
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: is960 ? 8 : (is1920x1125 ? 12 : 12),
                right: is960 ? 8 : (is1920x1125 ? 12 : 12),
                width: is960 ? 40 : (is1920x1125 ? 56 : 48),
                height: is960 ? 40 : (is1920x1125 ? 56 : 48),
                bgcolor: '#4CAF50',
                borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <Typography sx={{ 
                  fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
                  fontWeight: 900, 
                  color: 'white',
                  fontFamily: 'monospace'
                }}>
                  W
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                color: '#388E3C', 
                fontWeight: 700,
                mb: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75)
              }}>
                Vocabularies
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '1.75rem' : (is1920x1125 ? '3rem' : '2.5rem'), 
                fontWeight: 900, 
                color: '#388E3C'
              }}>
                {allVocab.length}
              </Typography>
            </Box>
          </Grid>
          
          {/* Sentences Card */}
          <Grid item xs={4}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2), 
              borderRadius: is960 ? '16px' : (is1920x1125 ? '24px' : '24px'), 
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: is960 ? 8 : (is1920x1125 ? 12 : 12),
                right: is960 ? 8 : (is1920x1125 ? 12 : 12),
                width: is960 ? 40 : (is1920x1125 ? 56 : 48),
                height: is960 ? 40 : (is1920x1125 ? 56 : 48),
                bgcolor: '#FF9800',
                borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Box sx={{ width: is960 ? 16 : (is1920x1125 ? 24 : 20), height: is960 ? 2 : (is1920x1125 ? 3 : 2.5), bgcolor: 'white', borderRadius: '1px' }} />
                  <Box sx={{ width: is960 ? 16 : (is1920x1125 ? 24 : 20), height: is960 ? 2 : (is1920x1125 ? 3 : 2.5), bgcolor: 'white', borderRadius: '1px' }} />
                </Box>
              </Box>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                color: '#F57C00', 
                fontWeight: 700,
                mb: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75)
              }}>
                Sentences
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '1.75rem' : (is1920x1125 ? '3rem' : '2.5rem'), 
                fontWeight: 900, 
                color: '#F57C00'
              }}>
                {allSentences.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Vocabulary List */}
        {allVocab.length > 0 && (
          <Box sx={{ mb: is1920x1125 ? 4 : 3 }}>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
              fontWeight: 900, 
              color: '#2D3436',
              mb: is1920x1125 ? 2.5 : 2
            }}>
              Vocabulary List
            </Typography>
            <Grid container spacing={is960 ? 1.5 : (is1920x1125 ? 2.5 : 2)}>
              {allVocab.map((vocab, idx) => (
                <Grid item xs={4} key={vocab.id}>
                  <Box sx={{ 
                    bgcolor: 'white', 
                    p: is960 ? 1.5 : (is1920x1125 ? 2 : 2), 
                    borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'), 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.7rem' : (is1920x1125 ? '0.95rem' : '0.875rem'), 
                      color: '#00B4A0',
                      fontFamily: 'monospace',
                      mb: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5)
                    }}>
                      {vocab.pinyin}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '1.25rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
                      fontWeight: 900, 
                      color: '#2D3436',
                      mb: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5)
                    }}>
                      {vocab.content}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.875rem' : '0.75rem'), 
                      color: '#636E72',
                      fontWeight: 500
                    }}>
                      {vocab.meaning}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Key Sentences */}
        {allSentences.length > 0 && (
          <Box>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
              fontWeight: 900, 
              color: '#2D3436',
              mb: is1920x1125 ? 2.5 : 2
            }}>
              Key Sentences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2) }}>
              {allSentences.map((sentence) => (
                <Box key={sentence.id} sx={{ 
                  bgcolor: 'white', 
                  p: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2.5), 
                  borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'), 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  boxSizing: 'border-box'
                }}>
                  <Typography sx={{ 
                    fontSize: is960 ? '0.7rem' : (is1920x1125 ? '0.95rem' : '0.875rem'), 
                    color: '#00B4A0',
                    fontFamily: 'monospace',
                    mb: is960 ? 0.75 : (is1920x1125 ? 1 : 1)
                  }}>
                    {sentence.pinyin}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'), 
                    fontWeight: 700, 
                    color: '#2D3436',
                    mb: is960 ? 0.75 : (is1920x1125 ? 1 : 1)
                  }}>
                    {sentence.content}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1rem' : '0.875rem'), 
                    color: '#636E72',
                    fontWeight: 500
                  }}>
                    {sentence.meaning}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Character List */}
        {allHanzi.length > 0 && (
          <Box sx={{ mb: is1920x1125 ? 4 : 3 }}>
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.75rem' : '1.5rem'), 
              fontWeight: 900, 
              color: '#2D3436',
              mb: is1920x1125 ? 2.5 : 2
            }}>
              Character List
            </Typography>
            <Grid container spacing={is960 ? 1.5 : (is1920x1125 ? 2.5 : 2)}>
              {allHanzi.map((hanzi) => (
                <Grid item xs={4} key={hanzi.id}>
                  <Box sx={{ 
                    bgcolor: 'white', 
                    p: is960 ? 1.5 : (is1920x1125 ? 2 : 2), 
                    borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '16px'), 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.7rem' : (is1920x1125 ? '0.95rem' : '0.875rem'), 
                      color: '#00B4A0',
                      fontFamily: 'monospace',
                      mb: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5)
                    }}>
                      {hanzi.pinyin}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '1.75rem' : (is1920x1125 ? '2.5rem' : '2rem'), 
                      fontWeight: 900, 
                      color: '#2D3436',
                      mb: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.5)
                    }}>
                      {hanzi.content}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.875rem' : '0.75rem'), 
                      color: '#636E72',
                      fontWeight: 500
                    }}>
                      {hanzi.meaning}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

