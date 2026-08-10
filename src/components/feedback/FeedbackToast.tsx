import { Snackbar, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import type { FeedbackToastState } from '../../feedback/feedbackTypes';

interface FeedbackToastProps {
  state: FeedbackToastState;
  onClose: () => void;
}

export default function FeedbackToast({ state, onClose }: FeedbackToastProps) {
  const { t } = useTranslation();
  const isSuccess = state.variant === 'success';
  const isAuth = state.variant === 'auth';

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 2, maxWidth: 'min(92vw, 560px)' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 1.35,
          borderRadius: '14px',
          bgcolor: '#1F2937',
          boxShadow: '0 12px 32px rgba(15,23,42,0.28)',
          minWidth: 280,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: isSuccess ? '#22C55E' : '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isSuccess ? (
            <CheckCircleIcon sx={{ fontSize: 18, color: '#111827' }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 18, color: '#111827' }} />
          )}
        </Box>
        <Typography sx={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.45 }}>
          {isSuccess
            ? t('feedback.toast.success', { count: state.remaining ?? 0 })
            : isAuth
              ? t('feedback.toast.authRequired')
              : t('feedback.toast.limitReached')}
        </Typography>
      </Box>
    </Snackbar>
  );
}
