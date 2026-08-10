import { describe, expect, it } from 'vitest';
import type { Location } from 'react-router-dom';
import {
  buildWritingPracticeHref,
  buildWritingPracticeState,
  readLessonRestoreState,
  resolveWritingPracticeExit,
} from './navigateBack';

function fakeLocation(partial: Partial<Location> & Pick<Location, 'pathname'>): Location {
  return {
    hash: '',
    key: 'test',
    search: '',
    state: null,
    ...partial,
  };
}

describe('writing practice return path', () => {
  it('builds practice href with lesson query fallback', () => {
    expect(
      buildWritingPracticeHref('你', {
        lessonPath: '/library/hub/fun-chinese/lesson/1',
        vocabIndex: 2,
        phase: 'learn',
      }),
    ).toBe(
      '/character-writing/practice/%E4%BD%A0?fromLesson=%2Flibrary%2Fhub%2Ffun-chinese%2Flesson%2F1&vocab=2&phase=learn',
    );
  });

  it('prefers location.state when exiting writing practice', () => {
    const exit = resolveWritingPracticeExit(
      fakeLocation({
        pathname: '/character-writing/practice/%E4%BD%A0',
        search: '?fromLesson=%2Flibrary%2Fhub%2Ffun-chinese%2Flesson%2F1&vocab=0&phase=learn',
        state: buildWritingPracticeState({
          lessonPath: '/library/hub/fun-chinese/lesson/1?from=collection',
          vocabIndex: 3,
          phase: 'learn',
        }),
      }),
    );

    expect(exit).toEqual({
      path: '/library/hub/fun-chinese/lesson/1?from=collection',
      restore: { phase: 'learn', vocabIndex: 3 },
    });
  });

  it('falls back to fromLesson query when state is missing', () => {
    const exit = resolveWritingPracticeExit(
      fakeLocation({
        pathname: '/character-writing/practice/%E4%BD%A0',
        search: '?fromLesson=%2Flibrary%2Fhub%2Ffun-chinese%2Flesson%2F1&vocab=4&phase=learn',
      }),
    );

    expect(exit).toEqual({
      path: '/library/hub/fun-chinese/lesson/1',
      restore: { phase: 'learn', vocabIndex: 4 },
    });
  });

  it('defaults to character-writing hub without lesson clues', () => {
    expect(
      resolveWritingPracticeExit(
        fakeLocation({ pathname: '/character-writing/practice/%E4%BD%A0' }),
      ),
    ).toEqual({ path: '/character-writing' });
  });

  it('reads restore payload for lesson remount', () => {
    expect(
      readLessonRestoreState(
        fakeLocation({
          pathname: '/library/hub/fun-chinese/lesson/1',
          state: { restore: { phase: 'learn', vocabIndex: 2 } },
        }),
      ),
    ).toEqual({ phase: 'learn', vocabIndex: 2 });
  });
});
