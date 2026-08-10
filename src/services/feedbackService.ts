import { getApiBase, getToken } from './apiClient';
import type { FeedbackPayload, FeedbackQuota } from '../feedback/feedbackTypes';

const PRODUCT_CODE = 'tablet_app';

export class FeedbackLimitError extends Error {
  remaining = 0;
  limit = 5;

  constructor(message = 'Daily feedback limit reached') {
    super(message);
    this.name = 'FeedbackLimitError';
  }
}

export class FeedbackAuthError extends Error {
  constructor(message = 'Login required') {
    super(message);
    this.name = 'FeedbackAuthError';
  }
}

export async function fetchFeedbackQuota(): Promise<FeedbackQuota> {
  if (!getToken()) {
    return { limit: 5, used: 0, remaining: 5 };
  }
  try {
    const res = await fetch(`${getApiBase()}/api/feedback/quota`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: 'include',
    });
    if (res.status === 401) {
      return { limit: 5, used: 0, remaining: 5 };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    }
    return data as FeedbackQuota;
  } catch {
    return { limit: 5, used: 0, remaining: 5 };
  }
}

export async function submitStructuredFeedback(payload: FeedbackPayload): Promise<FeedbackQuota> {
  if (!getToken()) {
    throw new FeedbackAuthError();
  }

  const res = await fetch(`${getApiBase()}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    credentials: 'include',
    body: JSON.stringify({
      productCode: PRODUCT_CODE,
      content: JSON.stringify(payload),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    throw new FeedbackLimitError();
  }
  if (res.status === 401) {
    throw new FeedbackAuthError();
  }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }

  return {
    limit: (data as { limit: number }).limit,
    used: (data as { limit: number }).limit - (data as { remaining: number }).remaining,
    remaining: (data as { remaining: number }).remaining,
  };
}
