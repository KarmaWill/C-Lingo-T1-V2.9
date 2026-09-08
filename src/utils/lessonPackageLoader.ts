import type { LessonPackage, LessonPackagePeriod, LessonPhase, PeriodFlow } from '../types/lessonPackage';
import unit1Lesson1 from '../data/lessonPackages/unit1-lesson1.json';

/** Registry: `${unitId}-${lessonId}` → package */
const PACKAGE_INDEX: Record<string, LessonPackage> = {
  '1-1': unit1Lesson1 as LessonPackage,
};

function packageKey(unitId: number, lessonId: number): string {
  return `${unitId}-${lessonId}`;
}

export function getLessonPackage(unitId: number, lessonId: number): LessonPackage | null {
  return PACKAGE_INDEX[packageKey(unitId, lessonId)] ?? null;
}

export function getLessonPeriod(
  unitId: number,
  lessonId: number,
  period: number,
): LessonPackagePeriod | null {
  const pkg = getLessonPackage(unitId, lessonId);
  if (!pkg) return null;
  return pkg.periods.find((p) => p.period === period) ?? null;
}

export function listLessonPeriods(unitId: number, lessonId: number): LessonPackagePeriod[] {
  return getLessonPackage(unitId, lessonId)?.periods ?? [];
}

export function phaseAllowed(phase: LessonPhase, flow: PeriodFlow): boolean {
  return flow.phases.includes(phase);
}

export function getNextPhaseInFlow(current: LessonPhase, flow: PeriodFlow): LessonPhase | null {
  const idx = flow.phases.indexOf(current);
  if (idx === -1 || idx >= flow.phases.length - 1) return null;
  return flow.phases[idx + 1] ?? null;
}

export function getInitialPhase(flow: PeriodFlow): LessonPhase {
  return flow.phases[0] ?? 'warmup';
}

export function isFinalLessonPeriod(unitId: number, lessonId: number, period: number): boolean {
  const periods = listLessonPeriods(unitId, lessonId);
  if (periods.length === 0) return true;
  const max = Math.max(...periods.map((p) => p.period));
  return period >= max;
}

export function filterExerciseIndex(index: number, flow: PeriodFlow | null): boolean {
  if (!flow?.exerciseIndices?.length) return true;
  return flow.exerciseIndices.includes(index);
}

export function getVocabEndIndex(flow: PeriodFlow | null, vocabLength: number): number {
  if (!flow?.vocabRange) return vocabLength - 1;
  return Math.min(flow.vocabRange[1], vocabLength - 1);
}

export function getVocabStartIndex(flow: PeriodFlow | null): number {
  return flow?.vocabRange?.[0] ?? 0;
}

const PERIOD_DONE_KEY = 'funChinese.hub.periodDone';

export function loadCompletedPeriods(unitId: number, lessonId: number): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(PERIOD_DONE_KEY);
    if (!raw) return new Set();
    const map = JSON.parse(raw) as Record<string, number[]>;
    const key = packageKey(unitId, lessonId);
    return new Set(map[key] ?? []);
  } catch {
    return new Set();
  }
}

export function markPeriodCompleted(unitId: number, lessonId: number, period: number): void {
  if (typeof window === 'undefined') return;
  const done = loadCompletedPeriods(unitId, lessonId);
  done.add(period);
  let map: Record<string, number[]> = {};
  try {
    map = JSON.parse(window.localStorage.getItem(PERIOD_DONE_KEY) || '{}') as Record<string, number[]>;
  } catch {
    map = {};
  }
  map[packageKey(unitId, lessonId)] = [...done].sort((a, b) => a - b);
  window.localStorage.setItem(PERIOD_DONE_KEY, JSON.stringify(map));
}
