import { Box, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';

export default function FunChineseTeacherGuidePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <ButtonBase
        onClick={() => navigate(-1)}
        aria-label="Back"
        sx={{
          position: 'absolute',
          top: 28,
          left: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          color: '#334155',
          border: '1px solid #E2E8F0',
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: 30 }} />
      </ButtonBase>
    </Box>
  );
}

