import { ExerciseType, type Lesson } from '../types/lesson';

/** HSK Standard track — HSK 1 · Topic 1 (same flow as C-Lingo, different content). */
export const HSK_STANDARD_LESSON_HSK1_T1: Lesson = {
  id: 'hsk-1-topic-1',
  title: 'HSK Standard · Level 1',
  subtitle: 'Topic 1: Greetings & Self Introduction',
  videoUrl: '/images/lesson-1-who-is-he.jpg',
  videoDuration: '12:00',
  hskLevel: 1,
  sessionLabel: 'Topic 1 / 8',
  videoCaption: { romanization: 'Nǐ hǎo!', hanzi: '你好！' },
  cultureVideo: {
    id: 'hsk-cult-01',
    title: 'Greeting Etiquette in China',
    thumbnailUrl: '/images/library-lesson-cover.png',
    videoUrl: 'mock-hsk-culture-video',
    unlockThreshold: 2,
  },
  units: [
    {
      id: 'hsk-u1',
      title: 'Unit 1: Basic Greetings',
      description: 'Learn hello, thank you, and goodbye for HSK 1',
      learnings: [
        {
          id: 'hsk-l1',
          type: 'vocab',
          content: '你好',
          pinyin: 'nǐ hǎo',
          meaning: 'Hello',
        },
        {
          id: 'hsk-l2',
          type: 'vocab',
          content: '谢谢',
          pinyin: 'xièxie',
          meaning: 'Thank you',
        },
        {
          id: 'hsk-l3',
          type: 'sentence',
          content: '你好吗？',
          pinyin: 'Nǐ hǎo ma?',
          meaning: 'How are you?',
        },
      ],
      questions: [
        {
          id: 'hsk-q1',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: 'Choose the correct meaning',
          englishText: 'Hello',
          options: ['你好', '谢谢', '再见', '对不起'],
          correctAnswer: '你好',
          difficulty: '⭐',
          explanation: '你好 (nǐ hǎo) is the standard greeting.',
        },
        {
          id: 'hsk-q2',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: 'Complete the greeting',
          chineseText: '___ 吗？',
          englishText: 'How are you?',
          options: ['你好', '谢谢', '再见', '请'],
          correctAnswer: '你好',
          difficulty: '⭐',
          explanation: '你好吗？ asks “How are you?”',
        },
      ],
    },
    {
      id: 'hsk-u2',
      title: 'Unit 2: Self Introduction',
      description: 'Introduce your name and nationality',
      learnings: [
        {
          id: 'hsk-l4',
          type: 'vocab',
          content: '我叫',
          pinyin: 'wǒ jiào',
          meaning: 'My name is…',
        },
        {
          id: 'hsk-l5',
          type: 'vocab',
          content: '学生',
          pinyin: 'xuésheng',
          meaning: 'Student',
        },
        {
          id: 'hsk-l6',
          type: 'sentence',
          content: '我是学生。',
          pinyin: 'Wǒ shì xuésheng.',
          meaning: 'I am a student.',
        },
      ],
      questions: [
        {
          id: 'hsk-q3',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: 'Choose the correct meaning',
          englishText: 'Student',
          options: ['学生', '老师', '医生', '朋友'],
          correctAnswer: '学生',
          difficulty: '⭐',
          explanation: '学生 (xuésheng) means student.',
        },
      ],
    },
  ],
};

export const HSK_STANDARD_COURSE_INTRO = {
  title: 'HSK 1 · Topic 1 Overview',
  subtitle: 'Greetings & Self Introduction',
  accent: '#C0392B',
  tipBg: '#FEF2F2',
  tipBorder: 'rgba(192, 57, 43, 0.15)',
  tipTitle: '#991B1B',
  tipBody: '#7F1D1D',
  highlights: [
    { label: '18 Words', desc: 'Core HSK 1 greeting vocabulary' },
    { label: '2 Patterns', desc: 'Hello and self-introduction phrases' },
    { label: '12 mins', desc: 'Video, drills, and topic wrap-up' },
  ],
  sections: [
    {
      title: 'What this topic covers',
      body: 'You will learn essential greetings and short self-introductions aligned with HSK 1 exam goals.',
    },
    {
      title: 'Key skills',
      body: 'Recognize common greeting words, respond to 你好吗, and introduce yourself with name and role.',
    },
    {
      title: 'How the session works',
      body: 'Watch the topic video (skippable), complete bite-sized exercises, then review your topic progress on the HSK Standard home screen.',
    },
  ],
  tip: 'Complete at least 60% of this topic to unlock bonus culture content and extra HSK practice tools.',
};
