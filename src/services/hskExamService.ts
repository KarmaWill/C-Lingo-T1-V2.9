const EXAM_API_BASE = (
  import.meta.env.VITE_CLINGO_EXAM_API_BASE_URL as string | undefined
  || 'http://localhost:8082'
).replace(/\/$/, '');

const DEVICE_ID_KEY = 'clingo-hsk-device-id';

interface ApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

interface RequestOptions {
  method?: string;
  body?: string;
}

export class ExamApiError extends Error {
  readonly status?: number;
  readonly code?: number;

  constructor(message: string, status?: number, code?: number) {
    super(message);
    this.name = 'ExamApiError';
    this.status = status;
    this.code = code;
  }
}

export function isAttemptNotFoundError(error: unknown): boolean {
  return error instanceof ExamApiError && (error.code === 404 || error.status === 404);
}

export interface PublishedPaper {
  id: string;
  examId: string;
  name: string;
  level: string;
  category?: string;
  durationMinutes: number;
  questionCount: number;
  maxPlayCount?: number;
  sectionSummary?: Array<{ module?: string; count?: number; minutes?: number }>;
  totalScore: number;
  passScore: number;
  publishedAt?: string;
  bestScore?: number;
  bestScoreAt?: string;
  activeAttemptId?: string;
  activeAttemptExpiresAt?: string;
}

export interface RuntimeOption {
  key?: string;
  text?: string;
  pinyin?: string;
  image?: string;
}

export interface RuntimeSubQuestion {
  id: number;
  questionNumber: number;
  sourceSubId?: string;
  isExample?: boolean;
  question?: unknown;
  options?: RuntimeOption[];
  score: number;
}

export interface RuntimeQuestion {
  id?: number;
  questionNumber?: number;
  type: string;
  typeName?: string;
  category?: string;
  section?: string;
  sectionId?: string;
  groupId?: string;
  content?: unknown;
  options?: RuntimeOption[];
  isExample?: boolean;
  score?: number;
  audioUrl?: string;
  maxPlayCount?: number;
  questions?: RuntimeSubQuestion[];
}

export interface ExamDelivery {
  examId: string;
  level: number;
  title: string;
  durationMinutes: number;
  totalScore: number;
  passScore: number;
  maxPlayCount?: number;
  noticeRules?: string[];
  sectionSummary?: Array<{ module?: string; count?: number; minutes?: number }>;
  questions: RuntimeQuestion[];
}

export interface AttemptResult {
  attemptId: string;
  paperId: string;
  status: 'submitted' | 'timed_out';
  score?: number;
  totalScore: number;
  passScore: number;
  scoreRate?: number;
  passed?: boolean;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  durationSeconds?: number;
  bestScore?: number;
  bestScoreAt?: string;
  moduleScores?: AttemptModuleScore[];
  submittedAt?: string;
}

export interface AttemptModuleScore {
  moduleId: string;
  moduleName: string;
  score: number;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

export interface AttemptReviewItem {
  itemUid: string;
  parentUid?: string;
  questionNumber?: number;
  questionType: string;
  moduleId?: string;
  moduleName?: string;
  sectionId?: string;
  sectionName?: string;
  content?: unknown;
  options?: RuntimeOption[];
  audioUrl?: string;
  submittedAnswer?: unknown;
  correctAnswer?: unknown;
  score: number;
  maxScore: number;
  correct?: boolean;
  unanswered: boolean;
  explanation?: unknown;
  explanationByLang?: unknown;
  explanationPinyin?: string;
}

export interface AttemptReview {
  result: AttemptResult;
  items: AttemptReviewItem[];
}

export interface ExamAttempt {
  attemptId: string;
  paperId: string;
  examId: string;
  status: 'in_progress' | 'submitted' | 'timed_out';
  startedAt: string;
  expiresAt: string;
  delivery: ExamDelivery;
  result?: AttemptResult;
}

export function getExamDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = globalThis.crypto?.randomUUID?.()
    || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set('X-Clingo-Device-Id', getExamDeviceId());
  if (options.body) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${EXAM_API_BASE}${path}`, { ...options, headers });
  } catch (error) {
    throw new ExamApiError(error instanceof Error ? error.message : 'Network request failed');
  }
  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope || envelope.code !== 0) {
    throw new ExamApiError(
      envelope?.msg || `Request failed (${response.status})`,
      response.status,
      envelope?.code,
    );
  }
  return envelope.data;
}

export function listPublishedPapers(level?: number): Promise<PublishedPaper[]> {
  const query = level === undefined ? '' : `?level=HSK${level}`;
  return request(`/api/papers${query}`);
}

export function startAttempt(paperId: string): Promise<ExamAttempt> {
  return request(`/api/papers/${encodeURIComponent(paperId)}/attempts`, { method: 'POST' });
}

export function getAttempt(attemptId: string): Promise<ExamAttempt> {
  return request(`/api/attempts/${encodeURIComponent(attemptId)}`);
}

export function submitAttempt(
  attemptId: string,
  answers: Record<string, string>,
): Promise<AttemptResult> {
  return request(`/api/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export function getAttemptResultDetail(attemptId: string): Promise<AttemptReview> {
  return request(`/api/attempts/${encodeURIComponent(attemptId)}/result/detail`);
}
