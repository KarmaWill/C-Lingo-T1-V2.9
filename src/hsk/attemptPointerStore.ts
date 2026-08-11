export interface AttemptPointerCatalog {
  id: string;
}

export interface ActiveAttemptPointer<TCatalog extends AttemptPointerCatalog> {
  attemptId: string;
  catalog: TCatalog;
  storedAt?: number;
}

export interface AttemptPointerStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RestorableAttempt {
  status: string;
  result?: unknown;
}

export interface AttemptRestoreScan<
  TCatalog extends AttemptPointerCatalog,
  TAttempt extends RestorableAttempt,
> {
  active?: { pointer: ActiveAttemptPointer<TCatalog>; attempt: TAttempt };
  submitted?: { pointer: ActiveAttemptPointer<TCatalog>; attempt: TAttempt };
  discardAttemptIds: string[];
  transientErrors: Array<{ pointer: ActiveAttemptPointer<TCatalog>; error: unknown }>;
}

export const LEGACY_ACTIVE_ATTEMPT_POINTER_KEY = 'clingo-hsk-active-attempt';
export const ACTIVE_ATTEMPT_POINTER_KEY_PREFIX = 'clingo-hsk-active-attempt:';

function parsePointer<TCatalog extends AttemptPointerCatalog>(raw: string | null) {
  if (!raw) return null;
  try {
    const pointer = JSON.parse(raw) as ActiveAttemptPointer<TCatalog> | null;
    return pointer?.attemptId && pointer.catalog?.id ? pointer : null;
  } catch {
    return null;
  }
}

export function listActiveAttemptPointers<TCatalog extends AttemptPointerCatalog>(
  storage: AttemptPointerStorage,
): ActiveAttemptPointer<TCatalog>[] {
  const pointers: ActiveAttemptPointer<TCatalog>[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(ACTIVE_ATTEMPT_POINTER_KEY_PREFIX)) continue;
    const pointer = parsePointer<TCatalog>(storage.getItem(key));
    if (pointer) pointers.push(pointer);
  }

  const legacy = parsePointer<TCatalog>(storage.getItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY));
  if (legacy) pointers.push({ ...legacy, storedAt: legacy.storedAt || 0 });

  pointers.sort((left, right) => (right.storedAt || 0) - (left.storedAt || 0));
  const seen = new Set<string>();
  return pointers.filter((pointer) => {
    if (seen.has(pointer.attemptId)) return false;
    seen.add(pointer.attemptId);
    return true;
  });
}

export function readActiveAttemptPointer<TCatalog extends AttemptPointerCatalog>(
  storage: AttemptPointerStorage,
): ActiveAttemptPointer<TCatalog> | null {
  return listActiveAttemptPointers<TCatalog>(storage)[0] || null;
}

export function hasBlockingAttemptPointer<TCatalog extends AttemptPointerCatalog>(
  pointers: ActiveAttemptPointer<TCatalog>[],
  ignoredAttemptIds: ReadonlySet<string>,
): boolean {
  return pointers.some((pointer) => !ignoredAttemptIds.has(pointer.attemptId));
}

export function writeActiveAttemptPointer<TCatalog extends AttemptPointerCatalog>(
  storage: AttemptPointerStorage,
  pointer: ActiveAttemptPointer<TCatalog>,
): void {
  const storedPointer = { ...pointer, storedAt: Date.now() };
  storage.setItem(
    `${ACTIVE_ATTEMPT_POINTER_KEY_PREFIX}${pointer.attemptId}`,
    JSON.stringify(storedPointer),
  );
}

export function clearActiveAttemptPointerIfMatches(
  storage: AttemptPointerStorage,
  attemptId: string,
): boolean {
  const attemptKey = `${ACTIVE_ATTEMPT_POINTER_KEY_PREFIX}${attemptId}`;
  const matched = storage.getItem(attemptKey) !== null;
  storage.removeItem(attemptKey);

  const legacy = parsePointer(storage.getItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY));
  if (legacy?.attemptId === attemptId) {
    storage.removeItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY);
    return true;
  }
  if (storage.getItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY) && !legacy) {
    storage.removeItem(LEGACY_ACTIVE_ATTEMPT_POINTER_KEY);
  }
  return matched;
}

export async function scanAttemptPointers<
  TCatalog extends AttemptPointerCatalog,
  TAttempt extends RestorableAttempt,
>(
  pointers: ActiveAttemptPointer<TCatalog>[],
  loadAttempt: (attemptId: string) => Promise<TAttempt>,
  isNotFound: (error: unknown) => boolean,
): Promise<AttemptRestoreScan<TCatalog, TAttempt>> {
  const scan: AttemptRestoreScan<TCatalog, TAttempt> = {
    discardAttemptIds: [],
    transientErrors: [],
  };
  for (const pointer of pointers) {
    let attempt: TAttempt;
    try {
      attempt = await loadAttempt(pointer.attemptId);
    } catch (error) {
      if (isNotFound(error)) {
        scan.discardAttemptIds.push(pointer.attemptId);
      } else {
        scan.transientErrors.push({ pointer, error });
      }
      continue;
    }

    if (attempt.status === 'in_progress') {
      if (!scan.active) scan.active = { pointer, attempt };
      continue;
    }
    scan.discardAttemptIds.push(pointer.attemptId);
    if (attempt.status === 'submitted' && attempt.result && !scan.submitted) {
      scan.submitted = { pointer, attempt };
    }
  }
  return scan;
}

export function firstBlockingTransientError<
  TCatalog extends AttemptPointerCatalog,
  TAttempt extends RestorableAttempt,
>(
  scan: AttemptRestoreScan<TCatalog, TAttempt>,
  fallbackSubmittedPointer?: ActiveAttemptPointer<TCatalog> | null,
): unknown {
  const submittedPointer = scan.submitted?.pointer || fallbackSubmittedPointer;
  if (!submittedPointer) return scan.transientErrors[0]?.error;
  const submittedAt = submittedPointer.storedAt || 0;
  return scan.transientErrors.find(
    ({ pointer }) => (pointer.storedAt || 0) >= submittedAt,
  )?.error;
}
