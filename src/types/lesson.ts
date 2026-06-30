export enum Stage {
  HOME = 'HOME',
  PREMIUM_HSK = 'PREMIUM_HSK',
  PREMIUM_AI = 'PREMIUM_AI',
  PREMIUM_DIGITAL_HUMAN = 'PREMIUM_DIGITAL_HUMAN',
  PREMIUM_HANZI = 'PREMIUM_HANZI'
}

export enum LessonStage {
  HOME = 'HOME',
  VIDEO = 'VIDEO',
  UNIT_SELECTION = 'UNIT_SELECTION', // 这就是 Hub
  UNIT_LEARNING = 'UNIT_LEARNING',    // 这就是 Study Card
  EXERCISE = 'EXERCISE',             // 这就是 Practice
  CULTURE_VIDEO = 'CULTURE_VIDEO',    // 这就是 Bonus Class
  HSK_UPSELL = 'HSK_UPSELL',         // 这就是 Deep Learning Hub
  COMPLETED = 'COMPLETED'
}

export enum ExerciseType {
  // ⭐ 一星题型
  T00_LISTEN_SELECT_IMAGE = 'T00',      // 听音选图 - W_C-PW_M-C
  T01_PICTURE_FILL_IN = 'T01',          // 图片填空 - 需要输入文字
  // ⭐⭐ 二星题型
  T02_PICTURE_SELECT_TEXT = 'T02',      // 图片选择汉字 - PS_C-W_C-C
  T03_LISTEN_SELECT_SENTENCE = 'T03',   // 听力选择句子 - V_C-W_C-C
  T04_WORD_MEANING_SELECT = 'T04',      // 词意选择 - PW_C-W_M-C
  T05_GRAMMAR_SELECT = 'T05',           // 语法选择 - S_M-S_C-C
  // 保留原有题型（向后兼容）
  L01_LISTEN_SELECT = 'L01',
  L02_LISTEN_TEXT = 'L02',
  R04_SENTENCE_ORDER = 'R04',
  R02_CLOZE = 'R02',
  S01_SPEAKING = 'S01'
}

export interface LearningCard {
  id: string;
  type: 'vocab' | 'sentence' | 'hanzi';
  content: string;
  pinyin: string;
  meaning: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface Question {
  id: string;
  type: ExerciseType;
  prompt: string;
  subPrompt?: string;
  options?: string[];
  correctAnswer: string | string[];
  imageUrls?: string[];
  imageEmoji?: string;        // 图片emoji（用于T01图片填空）
  pinyin?: string;
  explanation?: string;
  audioUrl?: string;          // 音频URL（用于T00、T03）
  englishText?: string;       // 英文文本（用于T04、T05）
  chineseText?: string;       // 中文文本（用于T04、T05）
  difficulty?: '⭐' | '⭐⭐';  // 难度标识
  partOfSpeech?: string;      // 词性（用于T04显示）
}

export interface CultureVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  unlockThreshold: number;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  learnings: LearningCard[];
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  videoDuration?: string;
  hskLevel?: number;
  /** e.g. "Topic 1 / 8" on video stage */
  sessionLabel?: string;
  videoCaption?: { romanization: string; hanzi: string };
  cultureVideo: CultureVideo;
  units: Unit[];
}

