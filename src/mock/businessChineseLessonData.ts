import { ExerciseType, type Lesson } from '../types/lesson';

export const BUSINESS_CHINESE_LESSON_BCT1_MEETING: Lesson = {
  id: 'business-bct1-meeting',
  title: 'Business Chinese · BCT 1',
  subtitle: 'Meeting: Opening & Agenda',
  videoUrl: '/images/library-lesson-cover.png',
  videoDuration: '14:00',
  sessionLabel: 'Module 1 / 6',
  videoCaption: { romanization: 'Wǒmen xiān tǎolùn yīxià yìchéng.', hanzi: '我们先讨论一下议程。' },
  cultureVideo: {
    id: 'biz-cult-01',
    title: 'Meeting Etiquette in China',
    thumbnailUrl: '/images/library-lesson-cover.png',
    videoUrl: 'mock-business-culture-video',
    unlockThreshold: 2,
  },
  units: [
    {
      id: 'biz-u1',
      title: 'Unit 1: Opening a Meeting',
      description: 'Greet participants and state the agenda',
      learnings: [
        { id: 'biz-l1', type: 'vocab', content: '会议', pinyin: 'huìyì', meaning: 'Meeting' },
        { id: 'biz-l2', type: 'vocab', content: '议程', pinyin: 'yìchéng', meaning: 'Agenda' },
        { id: 'biz-l3', type: 'sentence', content: '我们开始吧。', pinyin: 'Wǒmen kāishǐ ba.', meaning: "Let's begin." },
      ],
      questions: [
        {
          id: 'biz-q1',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: 'Choose the correct meaning',
          englishText: 'Agenda',
          options: ['议程', '合同', '报告', '产品'],
          correctAnswer: '议程',
          difficulty: '⭐',
          explanation: '议程 (yìchéng) means agenda.',
        },
      ],
    },
    {
      id: 'biz-u2',
      title: 'Unit 2: Stating Objectives',
      description: 'Explain meeting goals clearly',
      learnings: [
        { id: 'biz-l4', type: 'vocab', content: '目标', pinyin: 'mùbiāo', meaning: 'Goal / objective' },
        { id: 'biz-l5', type: 'sentence', content: '今天的目标是…', pinyin: 'Jīntiān de mùbiāo shì…', meaning: "Today's goal is…" },
      ],
      questions: [
        {
          id: 'biz-q2',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: 'Complete the sentence',
          chineseText: '今天的___是…',
          englishText: "Today's goal is…",
          options: ['目标', '会议', '议程', '合同'],
          correctAnswer: '目标',
          difficulty: '⭐',
          explanation: '目标 (mùbiāo) means goal or objective.',
        },
      ],
    },
  ],
};

export const BUSINESS_COURSE_INTRO = {
  title: 'BCT 1 · Meeting Overview',
  subtitle: 'Opening & Agenda',
  accent: '#D4A853',
  tipBg: 'rgba(212,168,83,0.1)',
  tipBorder: 'rgba(212,168,83,0.25)',
  tipTitle: '#D4A853',
  tipBody: 'rgba(245,240,232,0.75)',
  highlights: [
    { label: '22 Points', desc: 'Key phrases for business meetings' },
    { label: '2 Modules', desc: 'Opening and stating objectives' },
    { label: '14 mins', desc: 'Video, drills, and scenario wrap-up' },
  ],
  sections: [
    {
      title: 'What this module covers',
      body: 'Break down essential meeting language: greetings, agenda items, and stating objectives in professional Chinese.',
    },
    {
      title: 'Key skills',
      body: 'Use formal business tone, introduce agenda points, and keep discussions structured for BCT-level workplace scenarios.',
    },
    {
      title: 'How the session works',
      body: 'Watch the scenario video (skippable), study vocabulary modules, then practice with bite-sized exercises.',
    },
  ],
  tip: 'Complete at least 60% to unlock advanced scenario dialogue and document tools.',
};
