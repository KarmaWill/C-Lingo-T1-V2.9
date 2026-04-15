/**
 * HSK mock blueprint — doc §第二步 听力/阅读题型归类 + §题库 listening_image / listening_choice / reading_*.
 * Six entrances = Type A–F in the design doc (listening_judge = 录音判断, not in admin JSON sample but in product spec).
 */
export type HskSkillDrillId =
  | 'listening_image'
  | 'listening_dialogue'
  | 'listening_judge'
  | 'reading_cloze'
  | 'reading_order'
  | 'reading_comprehension';

export type HskSkillSection = 'listening' | 'reading';

export interface HskSkillDrillMeta {
  id: HskSkillDrillId;
  section: HskSkillSection;
  /** Short label for hub grid cells */
  label: string;
  /** Full title on drill page */
  title: string;
  /** Typical HSK levels for this format (product copy) */
  levelsHint: string;
  /** One-line description (English UI) */
  description: string;
}

export const HSK_SKILL_DRILLS: readonly HskSkillDrillMeta[] = [
  {
    id: 'listening_image',
    section: 'listening',
    label: 'Picture choice',
    title: 'Listening · picture choice',
    levelsHint: 'HSK 1–3',
    description: 'Play audio, then pick the matching image (words, Q&A, or short dialogues).',
  },
  {
    id: 'listening_dialogue',
    section: 'listening',
    label: 'Dialogue',
    title: 'Listening · dialogue',
    levelsHint: 'HSK 1–6',
    description: 'Listen to conversations or longer passages, then choose the best answer (images or text options).',
  },
  {
    id: 'listening_judge',
    section: 'listening',
    label: 'Listen & judge',
    title: 'Listening · true / false',
    levelsHint: 'HSK 1–2',
    description: 'Decide whether the recording matches the picture or statement (true / false style).',
  },
  {
    id: 'reading_cloze',
    section: 'reading',
    label: 'Word cloze',
    title: 'Reading · word choice / cloze',
    levelsHint: 'HSK 1–6',
    description: 'Fill gaps in sentences or paragraphs by choosing the right word from several options.',
  },
  {
    id: 'reading_order',
    section: 'reading',
    label: 'Sentence order',
    title: 'Reading · sentence ordering',
    levelsHint: 'HSK 5–6',
    description: 'Put scrambled sentences or paragraphs in the correct logical order.',
  },
  {
    id: 'reading_comprehension',
    section: 'reading',
    label: 'Passages',
    title: 'Reading · comprehension',
    levelsHint: 'HSK 3–6',
    description: 'Read short or long texts and answer multiple-choice questions on main ideas and details.',
  },
] as const;

export function getSkillDrillMeta(id: string | null | undefined): HskSkillDrillMeta | undefined {
  if (!id) return undefined;
  return HSK_SKILL_DRILLS.find((d) => d.id === id);
}
