import { Box } from '@mui/material';
import FunChineseInteractiveEbook from './FunChineseInteractiveEbook';

/** Full-area shell for Happy Chinese interactive e-book. */
export default function FunChineseEbookPageLayout() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        bgcolor: '#F6F2E9',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: is960 ? 1 : 1.5,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FunChineseInteractiveEbook />
      </Box>
    </Box>
  );
}
