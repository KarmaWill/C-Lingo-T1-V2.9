import { Box, ButtonBase } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useFeedback } from './FeedbackProvider';

const HSK_EXAM_FLOW_PATHS = new Set(['/hsk-prep-training', '/hsk-prep-test', '/hsk-mock-exam']);
const MASCOT_HEAD = '/images/clingo-ai-mascot-head.png';

interface FeedbackEntryButtonProps {
  is960?: boolean;
  /** Bypass HSK exam-flow hide (e.g. result screen on the same route). */
  forceShow?: boolean;
  context?: { screen?: string; lessonId?: string; paperId?: string; unitId?: string };
}

export default function FeedbackEntryButton({ is960 = false, forceShow = false, context }: FeedbackEntryButtonProps) {
  const { openFeedback, isDialogOpen } = useFeedback();
  const { pathname } = useLocation();

  if ((!forceShow && HSK_EXAM_FLOW_PATHS.has(pathname)) || isDialogOpen) {
    return null;
  }

  const size = is960 ? 40 : 44;

  return (
    <ButtonBase
      onClick={() => openFeedback(forceShow ? { ...context, force: true } : context)}
      aria-label="Feedback"
      title="Feedback"
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        p: 0,
        boxSizing: 'border-box',
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #C8E8D8',
        boxShadow: '0 4px 14px rgba(7,150,106,0.12)',
        overflow: 'hidden',
        transition: 'all 180ms ease',
        '&:hover': {
          borderColor: '#7ED4AE',
          boxShadow: '0 6px 18px rgba(7,150,106,0.2)',
          bgcolor: '#F3FBF7',
        },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <Box
        component="img"
        src={MASCOT_HEAD}
        alt=""
        sx={{
          width: '82%',
          height: '82%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </ButtonBase>
  );
}
