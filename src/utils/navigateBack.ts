import type { Location } from 'react-router-dom';

type BackState = {
  from?: string;
};

export type LessonRestoreState = {
  phase: 'warmup' | 'learn' | 'cards' | 'practice' | 'complete';
  vocabIndex: number;
};

type WritingPracticeNavState = BackState & {
  restore?: LessonRestoreState;
};

export function resolveBackPath(
  location: Location,
  options?: { defaultPath?: string; funChinesePath?: string },
): string {
  const { defaultPath = '/apps', funChinesePath = '/library/hub/fun-chinese' } = options ?? {};

  if (new URLSearchParams(location.search).get('from') === 'fun-chinese') {
    return funChinesePath;
  }

  const from = (location.state as BackState | null)?.from;
  if (from) return from;

  return defaultPath;
}

export function buildWritingPracticeHref(
  character: string,
  options: { lessonPath: string; vocabIndex: number; phase?: LessonRestoreState['phase'] },
): string {
  const params = new URLSearchParams({
    fromLesson: options.lessonPath,
    vocab: String(options.vocabIndex),
    phase: options.phase ?? 'learn',
  });
  return `/character-writing/practice/${encodeURIComponent(character)}?${params.toString()}`;
}

export function buildWritingPracticeState(options: {
  lessonPath: string;
  vocabIndex: number;
  phase?: LessonRestoreState['phase'];
}): WritingPracticeNavState {
  return {
    from: options.lessonPath,
    restore: {
      phase: options.phase ?? 'learn',
      vocabIndex: options.vocabIndex,
    },
  };
}

export function resolveWritingPracticeExit(
  location: Location,
  options?: { defaultPath?: string },
): { path: string; restore?: LessonRestoreState } {
  const defaultPath = options?.defaultPath ?? '/character-writing';
  const state = location.state as WritingPracticeNavState | null;
  const params = new URLSearchParams(location.search);

  const fromLesson = params.get('fromLesson');
  const vocabRaw = params.get('vocab');
  const phaseRaw = params.get('phase');
  const vocabFromQuery = Number.parseInt(vocabRaw || '0', 10);
  const queryRestore: LessonRestoreState | undefined = fromLesson
    ? {
        phase:
          phaseRaw === 'warmup' ||
          phaseRaw === 'learn' ||
          phaseRaw === 'cards' ||
          phaseRaw === 'practice' ||
          phaseRaw === 'complete'
            ? phaseRaw
            : 'learn',
        vocabIndex: Number.isFinite(vocabFromQuery) ? Math.max(0, vocabFromQuery) : 0,
      }
    : undefined;

  if (state?.from) {
    return {
      path: state.from,
      restore: state.restore ?? queryRestore,
    };
  }

  if (fromLesson) {
    return {
      path: fromLesson,
      restore: queryRestore,
    };
  }

  return { path: defaultPath };
}

export function readLessonRestoreState(
  location: Location,
): LessonRestoreState | undefined {
  return (location.state as WritingPracticeNavState | null)?.restore;
}
