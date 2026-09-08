import { describe, expect, it } from 'vitest';
import {
  getInitialPhase,
  getLessonPackage,
  getLessonPeriod,
  getNextPhaseInFlow,
  getVocabEndIndex,
  listLessonPeriods,
  phaseAllowed,
} from './lessonPackageLoader';

describe('lessonPackageLoader', () => {
  it('loads unit1 lesson1 package with three periods', () => {
    const pkg = getLessonPackage(1, 1);
    expect(pkg?.lessonTitle).toBe('你好');
    expect(listLessonPeriods(1, 1)).toHaveLength(3);
  });

  it('maps period 1 flow to warmup and learn', () => {
    const period = getLessonPeriod(1, 1, 1);
    expect(period?.flow.phases).toEqual(['warmup', 'learn']);
    expect(getInitialPhase(period!.flow)).toBe('warmup');
    expect(getNextPhaseInFlow('warmup', period!.flow)).toBe('learn');
    expect(getNextPhaseInFlow('learn', period!.flow)).toBeNull();
  });

  it('restricts vocab range for period 1', () => {
    const period = getLessonPeriod(1, 1, 1);
    expect(getVocabEndIndex(period!.flow, 10)).toBe(3);
  });

  it('returns null for unknown lesson', () => {
    expect(getLessonPackage(9, 9)).toBeNull();
  });

  it('checks phase allowance', () => {
    const flow = getLessonPeriod(1, 1, 2)!.flow;
    expect(phaseAllowed('cards', flow)).toBe(true);
    expect(phaseAllowed('warmup', flow)).toBe(false);
  });
});
