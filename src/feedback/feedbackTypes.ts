export type FeedbackCategory = 'content_error' | 'functional_failure' | 'user_experience' | 'suggestion';

export type FeedbackTagId =
  | 'font_too_small'
  | 'more_interactive_games'
  | 'too_few_rewards'
  | 'parental_controls'
  | 'more_levels'
  | 'other';

export interface FeedbackContext {
  module: string;
  route: string;
  lessonId?: string;
  paperId?: string;
  unitId?: string;
  screen?: string;
}

export interface FeedbackPayload {
  category: FeedbackCategory;
  tags: FeedbackTagId[];
  description: string;
  screenshotDataUrl: string;
  context: FeedbackContext;
}

export interface FeedbackQuota {
  limit: number;
  used: number;
  remaining: number;
}

export type FeedbackToastVariant = 'success' | 'limit' | 'auth';

export interface FeedbackToastState {
  open: boolean;
  variant: FeedbackToastVariant;
  remaining?: number;
}
