import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StyleIcon from '@mui/icons-material/Style';

export default function FlashcardPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
        bgcolor: '#FFF8F0',
        p: is960 ? 2 : 4,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <ButtonBase
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: is960 ? 12 : 20,
          left: is960 ? 12 : 20,
          width: is960 ? 44 : 52,
          height: is960 ? 44 : 52,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.06)',
          color: '#374151',
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
      </ButtonBase>

      <Box
        sx={{
          maxWidth: 720,
          mx: 'auto',
          mt: is960 ? 8 : 10,
          textAlign: 'center',
        }}
      >
        <StyleIcon sx={{ fontSize: is960 ? 56 : 72, color: '#00B4A0', mb: 2 }} />
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.5rem' : '2rem', color: '#1F2937', mb: 1 }}>
          Flashcards
        </Typography>
        <Typography sx={{ color: '#6B7280', fontSize: is960 ? '0.9rem' : '1.05rem', lineHeight: 1.5 }}>
          Review vocabulary with spaced repetition. Decks and sync will connect here in a later build.
        </Typography>
      </Box>
    </Box>
  );
}
