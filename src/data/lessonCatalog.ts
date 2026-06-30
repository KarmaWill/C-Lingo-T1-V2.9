import type { Lesson } from '../types/lesson';
import { CURRENT_LESSON } from '../mock/lessonData';
import { HSK_STANDARD_LESSON_HSK1_T1, HSK_STANDARD_COURSE_INTRO } from '../mock/hskStandardLessonData';
import { BUSINESS_CHINESE_LESSON_BCT1_MEETING, BUSINESS_COURSE_INTRO } from '../mock/businessChineseLessonData';

const CLINGO_COURSE_INTRO = {
  title: 'Lesson 1 Overview',
  subtitle: 'How many people in your family?',
  accent: '#00B4A0',
  tipBg: '#FFF8F0',
  tipBorder: 'rgba(255,107,53,0.15)',
  tipTitle: '#C2410C',
  tipBody: '#9A3412',
  highlights: [
    { label: '31 Words', desc: 'Core family and counting vocabulary' },
    { label: '3 Patterns', desc: 'Ask and answer about family size' },
    { label: '15 mins', desc: 'Video, practice, and speaking wrap-up' },
  ],
  sections: [
    {
      title: 'What this lesson covers',
      body: 'You will learn how to ask and answer “How many people are in your family?” in natural, everyday Chinese. The lesson builds from listening to guided speaking.',
    },
    {
      title: 'Key skills',
      body: 'Recognize family-related words, use number + measure word patterns, and respond in short conversational exchanges suitable for HSK 1 learners.',
    },
    {
      title: 'How the session works',
      body: 'Watch the lesson video (skippable), complete bite-sized exercises, then finish with a short speaking check. Your progress updates on the home screen.',
    },
  ],
  tip: 'Complete at least 60% to unlock bonus culture content and extra practice tools for this unit.',
};

const LESSONS: Record<string, Lesson> = {
  '1': CURRENT_LESSON,
  'hsk-1-topic-1': HSK_STANDARD_LESSON_HSK1_T1,
  'business-bct1-meeting': BUSINESS_CHINESE_LESSON_BCT1_MEETING,
};

export function getLessonById(id: string | undefined): Lesson {
  if (!id) return CURRENT_LESSON;
  return LESSONS[id] ?? CURRENT_LESSON;
}

export function getCourseIntroMeta(from?: string, lessonId?: string) {
  if (from === '/business-chinese' || lessonId?.startsWith('business-')) {
    return BUSINESS_COURSE_INTRO;
  }
  if (from === '/hsk-standard' || lessonId?.startsWith('hsk-')) {
    return HSK_STANDARD_COURSE_INTRO;
  }
  return CLINGO_COURSE_INTRO;
}

export function isHskStandardLesson(id: string | undefined, from?: string): boolean {
  return from === '/hsk-standard' || (id?.startsWith('hsk-') ?? false);
}
