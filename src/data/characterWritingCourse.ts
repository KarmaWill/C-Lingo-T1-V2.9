export type WritingModuleId = 'strokes' | 'radicals' | 'structure';

export interface WritingModule {
  id: WritingModuleId;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  gradient: string;
  itemCount: number;
}

export interface StrokeLesson {
  id: string;
  stroke: string;
  name: string;
  pinyin: string;
  tip: string;
  practiceChar: string;
}

export interface RadicalLesson {
  id: string;
  radical: string;
  name: string;
  meaning: string;
  examples: string[];
  practiceChar: string;
}

export interface StructureLesson {
  id: string;
  name: string;
  pattern: string;
  description: string;
  examples: string[];
  practiceChar: string;
}

export const WRITING_MODULES: WritingModule[] = [
  {
    id: 'strokes',
    title: 'Stroke Basics',
    subtitle: '笔画学习',
    description: 'Learn the core strokes and stroke order rules.',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    itemCount: 8,
  },
  {
    id: 'radicals',
    title: 'Radicals',
    subtitle: '偏旁学习',
    description: 'Recognize common radicals and how they hint at meaning.',
    color: '#0D9488',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    itemCount: 8,
  },
  {
    id: 'structure',
    title: 'Structure',
    subtitle: '结构学习',
    description: 'Understand how characters are built from parts.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    itemCount: 5,
  },
];

export const STROKE_LESSONS: StrokeLesson[] = [
  { id: 'heng', stroke: '一', name: 'Horizontal', pinyin: 'héng', tip: 'Left to right, steady and level.', practiceChar: '一' },
  { id: 'shu', stroke: '丨', name: 'Vertical', pinyin: 'shù', tip: 'Top to bottom, keep the line upright.', practiceChar: '十' },
  { id: 'pie', stroke: '丿', name: 'Left-falling', pinyin: 'piě', tip: 'Top-right to bottom-left, light and quick.', practiceChar: '人' },
  { id: 'na', stroke: '㇏', name: 'Right-falling', pinyin: 'nà', tip: 'Top-left to bottom-right, fuller than piě.', practiceChar: '大' },
  { id: 'dian', stroke: '丶', name: 'Dot', pinyin: 'diǎn', tip: 'Short and precise; direction varies by position.', practiceChar: '下' },
  { id: 'ti', stroke: '㇀', name: 'Rising', pinyin: 'tí', tip: 'Bottom-left to top-right, sharp and upward.', practiceChar: '地' },
  { id: 'zhe', stroke: '𠃍', name: 'Turn', pinyin: 'zhé', tip: 'Change direction cleanly at the corner.', practiceChar: '口' },
  { id: 'gou', stroke: '亅', name: 'Hook', pinyin: 'gōu', tip: 'Finish with a small hook; do not overshoot.', practiceChar: '小' },
];

export const RADICAL_LESSONS: RadicalLesson[] = [
  { id: 'ren', radical: '亻', name: 'Person', meaning: 'People and human actions', examples: ['你', '他', '们'], practiceChar: '你' },
  { id: 'shui', radical: '氵', name: 'Water', meaning: 'Water, liquids, and flow', examples: ['河', '洗', '海'], practiceChar: '河' },
  { id: 'mu', radical: '木', name: 'Wood', meaning: 'Trees, wood, and plants', examples: ['树', '林', '校'], practiceChar: '树' },
  { id: 'kou', radical: '口', name: 'Mouth', meaning: 'Speech, eating, and openings', examples: ['叫', '吃', '吗'], practiceChar: '吗' },
  { id: 'xin', radical: '忄', name: 'Heart', meaning: 'Feelings and mental states', examples: ['想', '快', '忙'], practiceChar: '想' },
  { id: 'shou', radical: '扌', name: 'Hand', meaning: 'Actions done with hands', examples: ['打', '把', '找'], practiceChar: '打' },
  { id: 'yan', radical: '讠', name: 'Speech', meaning: 'Language and communication', examples: ['说', '话', '语'], practiceChar: '说' },
  { id: 'nv', radical: '女', name: 'Female', meaning: 'Women and related concepts', examples: ['好', '妈', '姐'], practiceChar: '好' },
];

export const STRUCTURE_LESSONS: StructureLesson[] = [
  {
    id: 'left-right',
    name: 'Left-Right',
    pattern: '左右结构',
    description: 'One part on the left, one on the right.',
    examples: ['好', '们', '吗'],
    practiceChar: '好',
  },
  {
    id: 'top-bottom',
    name: 'Top-Bottom',
    pattern: '上下结构',
    description: 'One part stacked above another.',
    examples: ['字', '思', '花'],
    practiceChar: '字',
  },
  {
    id: 'enclosure',
    name: 'Enclosure',
    pattern: '包围结构',
    description: 'An outer frame wraps an inner component.',
    examples: ['国', '园', '问'],
    practiceChar: '国',
  },
  {
    id: 'left-center-right',
    name: 'Left-Center-Right',
    pattern: '左中右结构',
    description: 'Three blocks arranged in a row.',
    examples: ['班', '街', '辩'],
    practiceChar: '班',
  },
  {
    id: 'single',
    name: 'Single Component',
    pattern: '独体字',
    description: 'One unified form without clear split parts.',
    examples: ['我', '书', '电'],
    practiceChar: '我',
  },
];

export function getWritingModule(id: string): WritingModule | undefined {
  return WRITING_MODULES.find((module) => module.id === id);
}
