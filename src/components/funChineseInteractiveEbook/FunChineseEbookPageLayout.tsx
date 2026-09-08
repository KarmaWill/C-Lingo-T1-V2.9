import { Box } from '@mui/material';
import FunChineseInteractiveEbook from './FunChineseInteractiveEbook';
import { figmaPx } from '../../utils/figmaScale';

/** Full-area shell — Figma「书本选中时」底色 #F3F4F6 */
export default function FunChineseEbookPageLayout() {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const p = (n: number) => figmaPx(n, screenSize);

  return (
    <Box
      id="fun-chinese-ebook-shell"
      sx={{
        height: '100%',
        minHeight: 0,
        bgcolor: '#F3F4F6',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 0,
        boxSizing: 'border-box',
        fontFamily: 'var(--app-font-family)',
        '&[data-focus-mode="true"]': {
          p: `${p(16)}px`,
          bgcolor: '#F3F4F6',
        },
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <FunChineseInteractiveEbook />
      </Box>
    </Box>
  );
}
