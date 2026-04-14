import { Box, Typography, ButtonBase } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  variant?: 'full' | 'compact';
  is960: boolean;
  is1920x1125: boolean;
  onSelectBooks: () => void;
  /** Shown above 我的书架 when variant is compact (e.g. C-Reader) */
  productTitle?: string;
};

export default function LibraryEmptyShelf({
  variant = 'full',
  is960,
  is1920x1125,
  onSelectBooks,
  productTitle,
}: Props) {
  const compact = variant === 'compact';

  return (
    <Box
      sx={{
        width: '100%',
        height: compact ? '100%' : 'auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: compact ? 'flex-start' : 'center',
        py: compact ? (is960 ? 0.5 : 1) : 0,
        px: compact ? 0.5 : 0,
        boxSizing: 'border-box',
        minHeight: compact ? 0 : undefined,
      }}
    >
      {productTitle && (
        <Typography
          sx={{
            fontWeight: 900,
            color: 'white',
            fontSize: is960 ? '0.75rem' : '0.9rem',
            mb: compact ? 0.75 : 0,
            letterSpacing: '0.02em',
          }}
        >
          {productTitle}
        </Typography>
      )}
      <Box
        sx={{
          width: compact ? (is960 ? 36 : 44) : is960 ? 80 : is1920x1125 ? 160 : 120,
          height: compact ? (is960 ? 36 : 44) : is960 ? 80 : is1920x1125 ? 160 : 120,
          borderRadius: compact ? '12px' : is960 ? '24px' : is1920x1125 ? '48px' : '32px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: compact ? (is960 ? 0.75 : 1) : is960 ? 3 : is1920x1125 ? 6 : 4,
          border: compact ? '1px solid' : is960 ? '2px solid' : is1920x1125 ? '3px solid' : '2px solid',
          borderColor: '#10B98120',
          boxShadow: compact ? 'none' : '0 10px 30px rgba(16, 185, 129, 0.1)',
        }}
      >
        <AddIcon
          sx={{
            fontSize: compact ? (is960 ? 20 : 24) : is960 ? 40 : is1920x1125 ? 96 : 64,
            color: '#10B981',
          }}
        />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: compact ? 'white' : '#1F2937',
          fontSize: compact
            ? is960
              ? '0.65rem'
              : '0.75rem'
            : is960
              ? '1.5rem'
              : is1920x1125
                ? '3rem'
                : '2rem',
          mb: compact ? 0.5 : is960 ? 1.5 : is1920x1125 ? 3 : 2,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        我的书架
      </Typography>
      <Typography
        sx={{
          fontSize: compact
            ? is960
              ? '0.55rem'
              : '0.65rem'
            : is960
              ? '0.8rem'
              : is1920x1125
                ? '1.5rem'
                : '1rem',
          color: compact ? 'rgba(255,255,255,0.9)' : '#6B7280',
          mb: compact ? 0.75 : is960 ? 3 : is1920x1125 ? 6 : 4,
          fontWeight: 500,
          lineHeight: 1.35,
          px: compact ? 0.25 : 0,
        }}
      >
        书架是空的，从书库中选择书籍开始阅读吧
      </Typography>
      <ButtonBase
        onClick={(e) => {
          e.stopPropagation();
          onSelectBooks();
        }}
        sx={{
          px: compact ? 1.5 : is960 ? 4 : is1920x1125 ? 8 : 6,
          py: compact ? 0.5 : is960 ? 1.5 : is1920x1125 ? 3 : 2,
          borderRadius: compact ? '10px' : is960 ? '16px' : is1920x1125 ? '28px' : '20px',
          bgcolor: compact ? 'rgba(255,255,255,0.95)' : '#00B4A0',
          color: compact ? '#047857' : 'white',
          fontWeight: 900,
          fontSize: compact ? (is960 ? '0.55rem' : '0.65rem') : is960 ? '0.875rem' : is1920x1125 ? '1.5rem' : '1rem',
          boxShadow: compact ? 'none' : '0 8px 24px rgba(0,180,160,0.3)',
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        选择书籍
      </ButtonBase>
    </Box>
  );
}
