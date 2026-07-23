import { describe, expect, it } from 'vitest';
import {
  clampActiveSubIndex,
  createSectionPartNumberResolver,
  hasCompositeImageOptions,
  runtimeScoredQuestionId,
} from './hskExamBlueprint';

describe('hasCompositeImageOptions', () => {
  it('recognizes image matching when images are stored on child questions', () => {
    expect(hasCompositeImageOptions({
      questions: [{
        options: [
          { image: 'option-a.png' },
          { image: 'option-b.png' },
        ],
      }],
    })).toBe(true);
  });

  it('keeps text-only composite questions out of image matching mode', () => {
    expect(hasCompositeImageOptions({
      questions: [{ options: [{}, {}] }],
    })).toBe(false);
  });
});

describe('runtime exam navigation helpers', () => {
  it('clamps a restored sub-question index when the next group is shorter', () => {
    expect(clampActiveSubIndex(5, 5)).toBe(4);
    expect(clampActiveSubIndex(5, 0)).toBe(0);
  });

  it('numbers parts independently inside each exam section', () => {
    const nextPart = createSectionPartNumberResolver();
    expect(nextPart('listening', 'listening-a')).toBe(1);
    expect(nextPart('listening', 'listening-b')).toBe(2);
    expect(nextPart('reading', 'reading-a')).toBe(1);
    expect(nextPart('writing', 'writing-a')).toBe(1);
  });

  it('uses the delivery question number as the scored answer key', () => {
    expect(runtimeScoredQuestionId(21, 'sub-1')).toBe('21');
    expect(runtimeScoredQuestionId(undefined, 'runtime-21')).toBe('runtime-21');
  });
});
