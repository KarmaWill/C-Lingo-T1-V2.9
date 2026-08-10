import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackDialog from './FeedbackDialog';
import FeedbackToast from './FeedbackToast';
import { inferFeedbackContext } from '../../feedback/inferFeedbackContext';
import type {
  FeedbackContext,
  FeedbackPayload,
  FeedbackQuota,
  FeedbackToastState,
} from '../../feedback/feedbackTypes';
import {
  FeedbackAuthError,
  FeedbackLimitError,
  fetchFeedbackQuota,
  submitStructuredFeedback,
} from '../../services/feedbackService';

interface FeedbackOpenContext {
  screen?: string;
  lessonId?: string;
  paperId?: string;
  unitId?: string;
  /** Allow opening on HSK exam-flow routes (e.g. result screen). */
  force?: boolean;
}

interface FeedbackContextValue {
  openFeedback: (override?: FeedbackOpenContext) => void;
  quota: FeedbackQuota;
  refreshQuota: () => Promise<FeedbackQuota>;
  isDialogOpen: boolean;
}

const FeedbackCtx = createContext<FeedbackContextValue | null>(null);

const DEFAULT_QUOTA: FeedbackQuota = { limit: 5, used: 0, remaining: 5 };
const HSK_EXAM_FLOW_PATHS = new Set(['/hsk-prep-training', '/hsk-prep-test', '/hsk-mock-exam']);

export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackCtx);
  if (!value) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return value;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [quota, setQuota] = useState<FeedbackQuota>(DEFAULT_QUOTA);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogContext, setDialogContext] = useState<FeedbackContext>(() =>
    inferFeedbackContext(location.pathname, location.search),
  );
  const [toast, setToast] = useState<FeedbackToastState>({ open: false, variant: 'success' });

  const refreshQuota = useCallback(async () => {
    try {
      const next = await fetchFeedbackQuota();
      setQuota(next);
      return next;
    } catch {
      return quota;
    }
  }, [quota]);

  useEffect(() => {
    if (HSK_EXAM_FLOW_PATHS.has(location.pathname)) {
      setDialogOpen(false);
    }
  }, [location.pathname]);

  const openFeedback = useCallback(async (override?: FeedbackOpenContext) => {
    if (HSK_EXAM_FLOW_PATHS.has(location.pathname) && !override?.force) {
      return;
    }
    const { force: _force, ...overrideRest } = override ?? {};
    const base = inferFeedbackContext(location.pathname, location.search);
    const merged: FeedbackContext = {
      ...base,
      ...overrideRest,
      route: `${location.pathname}${location.search}`,
    };

    let nextQuota = quota;
    try {
      nextQuota = await fetchFeedbackQuota();
      setQuota(nextQuota);
    } catch {
      nextQuota = quota;
    }

    if (nextQuota.remaining <= 0) {
      setToast({ open: true, variant: 'limit' });
      return;
    }

    setDialogContext(merged);
    setDialogOpen(true);
  }, [location.pathname, location.search, quota]);

  const handleSubmit = useCallback(async (input: Omit<FeedbackPayload, 'context'>) => {
    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        ...input,
        context: dialogContext,
      };
      const nextQuota = await submitStructuredFeedback(payload);
      setQuota(nextQuota);
      setDialogOpen(false);
      setToast({ open: true, variant: 'success', remaining: nextQuota.remaining });
    } catch (error) {
      if (error instanceof FeedbackLimitError) {
        setQuota((prev) => ({ ...prev, remaining: 0, used: prev.limit }));
        setDialogOpen(false);
        setToast({ open: true, variant: 'limit' });
        return;
      }
      if (error instanceof FeedbackAuthError) {
        setDialogOpen(false);
        setToast({ open: true, variant: 'auth' });
        return;
      }
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [dialogContext]);

  const value = useMemo(
    () => ({ openFeedback, quota, refreshQuota, isDialogOpen: dialogOpen }),
    [openFeedback, quota, refreshQuota, dialogOpen],
  );

  return (
    <FeedbackCtx.Provider value={value}>
      {children}
      <FeedbackDialog
        open={dialogOpen}
        quota={quota}
        context={dialogContext}
        submitting={submitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <FeedbackToast state={toast} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </FeedbackCtx.Provider>
  );
}
