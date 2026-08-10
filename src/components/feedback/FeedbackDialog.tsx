import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { useTranslation } from 'react-i18next';
import type { FeedbackCategory, FeedbackContext, FeedbackQuota, FeedbackTagId } from '../../feedback/feedbackTypes';

const CATEGORIES: FeedbackCategory[] = ['content_error', 'functional_failure', 'user_experience', 'suggestion'];
const TAGS: FeedbackTagId[] = [
  'font_too_small',
  'more_interactive_games',
  'too_few_rewards',
  'parental_controls',
  'more_levels',
  'other',
];
const CATEGORY_LETTERS = ['A', 'B', 'C', 'D'] as const;
const MAX_DESCRIPTION = 400;

function feedbackDialogContainer(): HTMLElement {
  return document.getElementById('main-content-area') ?? document.body;
}

interface FeedbackDialogProps {
  open: boolean;
  quota: FeedbackQuota;
  context: FeedbackContext;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: {
    category: FeedbackCategory;
    tags: FeedbackTagId[];
    description: string;
    screenshotDataUrl: string;
  }) => void;
}

export default function FeedbackDialog({
  open,
  quota,
  context: _context,
  submitting,
  onClose,
  onSubmit,
}: FeedbackDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [tags, setTags] = useState<FeedbackTagId[]>([]);
  const [description, setDescription] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('');
  const [screenshotError, setScreenshotError] = useState('');

  const canSubmit = useMemo(
    () => Boolean(category && description.trim() && screenshotDataUrl),
    [category, description, screenshotDataUrl],
  );

  useEffect(() => {
    if (!open) {
      setCategory('suggestion');
      setTags([]);
      setDescription('');
      setScreenshotDataUrl('');
      setScreenshotError('');
    }
  }, [open]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const toggleTag = (tag: FeedbackTagId) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const handlePickScreenshot = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setScreenshotError(t('feedback.errors.imageType'));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setScreenshotError(t('feedback.errors.imageSize'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotDataUrl(String(reader.result || ''));
      setScreenshotError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit({
      category,
      tags,
      description: description.trim(),
      screenshotDataUrl,
    });
  };

  const shellMaxWidth = is960 ? 'min(520px, calc(100% - 20px))' : 'min(680px, calc(100% - 28px))';
  const shellMaxHeight = is960 ? 'min(460px, calc(100% - 20px))' : 'min(540px, calc(100% - 28px))';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      container={feedbackDialogContainer}
      aria-labelledby="feedback-dialog-title"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1400,
        '& .MuiBackdrop-root': {
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(15, 23, 42, 0.58)',
        },
      }}
      PaperProps={{
        sx: {
          position: 'absolute',
          m: 0,
          width: '100%',
          maxWidth: shellMaxWidth,
          maxHeight: shellMaxHeight,
          borderRadius: is960 ? '18px' : '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 1.75 : 2.25,
          pt: is960 ? 1.5 : 1.75,
          pb: is960 ? 1 : 1.25,
          position: 'relative',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label={t('feedback.cancel')}
          sx={{
            position: 'absolute',
            top: is960 ? 8 : 10,
            right: is960 ? 8 : 10,
            bgcolor: '#F3F4F6',
            width: is960 ? 30 : 34,
            height: is960 ? 30 : 34,
            '&:hover': { bgcolor: '#E5E7EB' },
          }}
        >
          <CloseIcon sx={{ fontSize: is960 ? 16 : 18, color: '#6B7280' }} />
        </IconButton>

        <Typography
          id="feedback-dialog-title"
          sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.15rem', color: '#111827', pr: 4.5, lineHeight: 1.2 }}
        >
          {t('feedback.title')}
        </Typography>
        <Typography sx={{ mt: 0.35, color: '#6B7280', fontWeight: 600, fontSize: is960 ? '0.72rem' : '0.78rem', lineHeight: 1.4 }}>
          {t('feedback.subtitle')}
        </Typography>
      </Box>

      {/* Scrollable body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: is960 ? 1.75 : 2.25,
          py: is960 ? 1.25 : 1.5,
        }}
      >
        <Typography sx={{ mb: 0.75, fontWeight: 800, fontSize: is960 ? '0.78rem' : '0.82rem', color: '#111827' }}>
          {t('feedback.typeLabel')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: is960 ? 0.75 : 0.9 }}>
          {CATEGORIES.map((item, index) => {
            const selected = category === item;
            return (
              <ButtonBase
                key={item}
                onClick={() => setCategory(item)}
                sx={{
                  textAlign: 'left',
                  alignItems: 'flex-start',
                  p: is960 ? 0.9 : 1.1,
                  borderRadius: '12px',
                  border: selected ? '2px solid #14B8A6' : '1.5px solid #E5E7EB',
                  bgcolor: selected ? 'rgba(20,184,166,0.06)' : '#FFFFFF',
                  boxShadow: selected ? '0 4px 12px rgba(20,184,166,0.1)' : 'none',
                }}
              >
                <Typography sx={{ fontWeight: 900, color: '#14B8A6', fontSize: is960 ? '0.76rem' : '0.82rem', mb: 0.2, lineHeight: 1.25 }}>
                  {CATEGORY_LETTERS[index]}. {t(`feedback.categories.${item}.title`)}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontWeight: 600, fontSize: is960 ? '0.66rem' : '0.7rem', lineHeight: 1.35 }}>
                  {t(`feedback.categories.${item}.desc`)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>

        <Typography sx={{ mt: is960 ? 1.1 : 1.35, mb: 0.75, fontWeight: 800, fontSize: is960 ? '0.78rem' : '0.82rem', color: '#111827' }}>
          {t('feedback.tagsLabel')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
          {TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <ButtonBase
                key={tag}
                onClick={() => toggleTag(tag)}
                sx={{
                  px: is960 ? 1 : 1.15,
                  py: is960 ? 0.45 : 0.55,
                  borderRadius: '999px',
                  border: selected ? '1.5px solid #14B8A6' : '1.5px solid #E5E7EB',
                  bgcolor: selected ? 'rgba(20,184,166,0.1)' : '#FFFFFF',
                  color: selected ? '#0F766E' : '#374151',
                  fontWeight: 700,
                  fontSize: is960 ? '0.68rem' : '0.74rem',
                }}
              >
                {t(`feedback.tags.${tag}`)}
              </ButtonBase>
            );
          })}
        </Box>

        <Typography sx={{ mt: is960 ? 1.1 : 1.35, mb: 0.75, fontWeight: 800, fontSize: is960 ? '0.78rem' : '0.82rem', color: '#111827' }}>
          {t('feedback.detailsLabel')}
        </Typography>
        <Box sx={{ display: 'flex', gap: is960 ? 0.85 : 1, alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <Box
              component="textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION))}
              placeholder={t('feedback.detailsPlaceholder')}
              sx={{
                width: '100%',
                minHeight: is960 ? 76 : 92,
                maxHeight: is960 ? 100 : 120,
                resize: 'none',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                p: is960 ? 1 : 1.15,
                fontFamily: 'inherit',
                fontSize: is960 ? '0.78rem' : '0.82rem',
                lineHeight: 1.45,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                '&:focus': { borderColor: '#14B8A6' },
              }}
            />
            <Typography sx={{ position: 'absolute', right: 10, bottom: 8, fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 700 }}>
              {description.length}/{MAX_DESCRIPTION}
            </Typography>
          </Box>

          <ButtonBase
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: is960 ? 96 : 112,
              flexShrink: 0,
              minHeight: is960 ? 76 : 92,
              borderRadius: '12px',
              border: screenshotDataUrl ? '1.5px solid #14B8A6' : '1.5px dashed #FCA5A5',
              bgcolor: screenshotDataUrl ? 'rgba(20,184,166,0.06)' : '#FFF7F7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.45,
              p: 0.75,
              overflow: 'hidden',
            }}
          >
            {screenshotDataUrl ? (
              <Box
                component="img"
                src={screenshotDataUrl}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <>
                <PhotoCameraOutlinedIcon sx={{ fontSize: is960 ? 22 : 24, color: '#EF4444' }} />
                <Typography sx={{ fontSize: is960 ? '0.58rem' : '0.62rem', color: '#EF4444', fontWeight: 700, textAlign: 'center', lineHeight: 1.3, px: 0.25 }}>
                  {t('feedback.screenshotHint')}
                </Typography>
              </>
            )}
          </ButtonBase>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              void handlePickScreenshot(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </Box>
        {screenshotError && (
          <Typography sx={{ mt: 0.5, color: '#DC2626', fontSize: '0.68rem', fontWeight: 700 }}>
            {screenshotError}
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 1.75 : 2.25,
          py: is960 ? 1.1 : 1.35,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: '#FAFAFA',
        }}
      >
        <Box
          sx={{
            px: is960 ? 1 : 1.15,
            py: is960 ? 0.45 : 0.55,
            borderRadius: '10px',
            bgcolor: 'rgba(20,184,166,0.1)',
            border: '1px solid rgba(20,184,166,0.18)',
          }}
        >
          <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.74rem', color: '#0F766E', fontWeight: 800, whiteSpace: 'nowrap' }}>
            {t('feedback.remainingToday', { count: quota.remaining })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{
              borderRadius: '999px',
              px: is960 ? 1.75 : 2.25,
              py: is960 ? 0.55 : 0.65,
              minWidth: 0,
              fontWeight: 800,
              fontSize: is960 ? '0.78rem' : '0.82rem',
              color: '#6B7280',
              bgcolor: '#F3F4F6',
            }}
          >
            {t('feedback.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            sx={{
              borderRadius: '999px',
              px: is960 ? 2 : 2.35,
              py: is960 ? 0.55 : 0.65,
              minWidth: 0,
              fontWeight: 900,
              fontSize: is960 ? '0.78rem' : '0.82rem',
              color: '#FFFFFF',
              bgcolor: canSubmit && !submitting ? '#14B8A6' : '#CBD5E1',
              boxShadow: canSubmit && !submitting ? '0 6px 16px rgba(20,184,166,0.24)' : 'none',
            }}
          >
            {submitting ? t('feedback.submitting') : t('feedback.submit')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
