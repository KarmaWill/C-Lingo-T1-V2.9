/**
 * HSK / 快乐中文 exam structure — from 试卷模板.docx
 * Template codes: L01–L06 (listening), R01–R09 / R07 (reading), W01–W04 (writing)
 */

export type HSKLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type PaperSource = 'official' | 'clingo';
export type ExamSectionKind = 'listening' | 'reading' | 'writing';

export type HskTemplateCode =
  | 'L01' | 'L02' | 'L03' | 'L04' | 'L05' | 'L06'
  | 'R01' | 'R02' | 'R03' | 'R05' | 'R06' | 'R07' | 'R08' | 'R09'
  | 'W01' | 'W02' | 'W03' | 'W04';

export interface HskExamPartDef {
  section: ExamSectionKind;
  partNumber: number;
  templateCode: HskTemplateCode;
  questionStart: number;
  questionEnd: number;
  isComposite: boolean;
}

export interface HskLevelBlueprint {
  level: HSKLevel;
  source: PaperSource;
  label: string;
  totalMinutes: number;
  listeningMinutes: number;
  readingMinutes: number;
  writingMinutes: number;
  listeningCount: number;
  readingCount: number;
  writingCount: number;
  totalQuestions: number;
  maxScore: number;
  passScore: number;
  /** 1 = play once (HSK 4+), 2 = play twice (HSK 1–3) */
  listeningPlays: 1 | 2;
  parts: HskExamPartDef[];
}

export const TEMPLATE_LABELS: Record<HskTemplateCode, string> = {
  L01: 'Listening · picture / word choice',
  L02: 'Listening · dialogue (composite)',
  L03: 'Listening · short passage choice',
  L04: 'Listening · long passage choice',
  L05: 'Listening · interview / lecture (composite)',
  L06: 'Listening · Happy Chinese intro',
  R01: 'Reading · fill in words (composite)',
  R02: 'Reading · sentence arrangement (composite)',
  R03: 'Reading · gap filling (composite)',
  R05: 'Reading · passage matching (composite)',
  R06: 'Reading · long passage (composite)',
  R07: 'Reading · comprehension',
  R08: 'Reading · picture / statement match',
  R09: 'Reading · extended composite',
  W01: 'Writing · character / word (composite)',
  W02: 'Writing · sentence building (composite)',
  W03: 'Writing · sentence assembly',
  W04: 'Writing · composition',
};

function part(
  section: ExamSectionKind,
  partNumber: number,
  templateCode: HskTemplateCode,
  questionStart: number,
  questionEnd: number,
  isComposite = false,
): HskExamPartDef {
  return { section, partNumber, templateCode, questionStart, questionEnd, isComposite };
}

function countRange(start: number, end: number) {
  return end - start + 1;
}

function sumParts(parts: HskExamPartDef[], section: ExamSectionKind) {
  return parts
    .filter((p) => p.section === section)
    .reduce((sum, p) => sum + countRange(p.questionStart, p.questionEnd), 0);
}

/** HSK 一级样卷 — 听力 20 + 阅读 20，约 40 分钟，满分 200 */
const HSK1_OFFICIAL_PARTS: HskExamPartDef[] = [
  part('listening', 1, 'L01', 1, 5),
  part('listening', 2, 'L03', 6, 10),
  part('listening', 3, 'L02', 11, 15, true),
  part('listening', 4, 'L03', 16, 20),
  part('reading', 1, 'R01', 21, 25, true),
  part('reading', 2, 'R02', 26, 30, true),
  part('reading', 3, 'R03', 31, 35, true),
  part('reading', 4, 'R07', 36, 40),
];

/** 快乐中文 期中 — C-Lingo 自研卷结构 */
const HAPPY_CHINESE_MIDTERM_PARTS: HskExamPartDef[] = [
  part('listening', 1, 'L06', 1, 5),
  part('listening', 2, 'L01', 6, 10),
  part('listening', 3, 'L02', 11, 15, true),
  part('listening', 4, 'L03', 16, 20),
  part('reading', 1, 'R08', 21, 25),
  part('reading', 2, 'R01', 26, 30, true),
  part('reading', 3, 'R02', 31, 35, true),
  part('reading', 4, 'R03', 36, 40, true),
];

const HSK2_OFFICIAL_PARTS: HskExamPartDef[] = [
  part('listening', 1, 'L01', 1, 5),
  part('listening', 2, 'L02', 6, 10, true),
  part('listening', 2, 'L02', 11, 15, true),
  part('listening', 3, 'L03', 16, 25),
  part('reading', 1, 'R01', 26, 30, true),
  part('reading', 2, 'R03', 31, 35, true),
  part('reading', 3, 'R02', 36, 40, true),
  part('reading', 3, 'R02', 41, 45, true),
  part('reading', 4, 'R07', 46, 50),
  part('writing', 1, 'W01', 51, 55, true),
  part('writing', 2, 'W02', 56, 60, true),
];

const HSK3_OFFICIAL_PARTS: HskExamPartDef[] = [
  part('listening', 1, 'L02', 1, 10, true),
  part('listening', 2, 'L03', 11, 20),
  part('listening', 3, 'L03', 21, 30),
  part('reading', 1, 'R02', 31, 40, true),
  part('reading', 2, 'R03', 41, 45, true),
  part('reading', 2, 'R03', 46, 50, true),
  part('reading', 3, 'R07', 51, 55),
  part('reading', 3, 'R07', 57, 58, true),
  part('reading', 3, 'R07', 59, 60, true),
  part('writing', 1, 'W02', 61, 65, true),
  part('writing', 2, 'W03', 66, 70),
];

function buildOfficialBlueprint(level: HSKLevel): HskLevelBlueprint {
  const partsByLevel: Record<HSKLevel, HskExamPartDef[]> = {
    1: HSK1_OFFICIAL_PARTS,
    2: HSK2_OFFICIAL_PARTS,
    3: HSK3_OFFICIAL_PARTS,
    4: HSK2_OFFICIAL_PARTS, // simplified placeholder until full L4 parts wired
    5: HSK3_OFFICIAL_PARTS,
    6: HSK3_OFFICIAL_PARTS,
  };

  const metaByLevel: Record<HSKLevel, Omit<HskLevelBlueprint, 'level' | 'source' | 'parts' | 'listeningCount' | 'readingCount' | 'writingCount' | 'totalQuestions'>> = {
    1: { label: 'HSK 1 Official Mock', totalMinutes: 40, listeningMinutes: 12, readingMinutes: 20, writingMinutes: 0, maxScore: 200, passScore: 120, listeningPlays: 2 },
    2: { label: 'HSK 2 Official Mock', totalMinutes: 60, listeningMinutes: 17, readingMinutes: 25, writingMinutes: 10, maxScore: 200, passScore: 120, listeningPlays: 2 },
    3: { label: 'HSK 3 Official Mock', totalMinutes: 83, listeningMinutes: 23, readingMinutes: 30, writingMinutes: 20, maxScore: 200, passScore: 120, listeningPlays: 2 },
    4: { label: 'HSK 4 Official Mock', totalMinutes: 85, listeningMinutes: 20, readingMinutes: 30, writingMinutes: 25, maxScore: 200, passScore: 120, listeningPlays: 1 },
    5: { label: 'HSK 5 Official Mock', totalMinutes: 110, listeningMinutes: 25, readingMinutes: 35, writingMinutes: 40, maxScore: 200, passScore: 120, listeningPlays: 1 },
    6: { label: 'HSK 6 Official Mock', totalMinutes: 125, listeningMinutes: 30, readingMinutes: 40, writingMinutes: 45, maxScore: 200, passScore: 120, listeningPlays: 1 },
  };

  const parts = partsByLevel[level];
  const meta = metaByLevel[level];
  const listeningCount = sumParts(parts, 'listening');
  const readingCount = sumParts(parts, 'reading');
  const writingCount = sumParts(parts, 'writing');

  return {
    level,
    source: 'official',
    ...meta,
    parts,
    listeningCount,
    readingCount,
    writingCount,
    totalQuestions: listeningCount + readingCount + writingCount,
  };
}

function buildClingoBlueprint(level: HSKLevel): HskLevelBlueprint {
  const parts = HAPPY_CHINESE_MIDTERM_PARTS;
  const listeningCount = sumParts(parts, 'listening');
  const readingCount = sumParts(parts, 'reading');

  return {
    level,
    source: 'clingo',
    label: `C-Lingo HSK ${level} Practice`,
    totalMinutes: 40,
    listeningMinutes: 15,
    readingMinutes: 17,
    writingMinutes: 0,
    parts,
    listeningCount,
    readingCount,
    writingCount: 0,
    totalQuestions: listeningCount + readingCount,
    maxScore: 200,
    passScore: 120,
    listeningPlays: 2,
  };
}

export function getExamBlueprint(level: HSKLevel, source: PaperSource): HskLevelBlueprint {
  return source === 'official' ? buildOfficialBlueprint(level) : buildClingoBlueprint(level);
}

export function formatSectionSummary(blueprint: HskLevelBlueprint): string {
  return formatSectionSummaryLines(blueprint).join(' · ');
}

export function formatSectionSummaryLines(blueprint: HskLevelBlueprint): string[] {
  const lines: string[] = [];
  if (blueprint.listeningCount > 0) lines.push(`Listening ${blueprint.listeningCount}`);
  if (blueprint.readingCount > 0) lines.push(`Reading ${blueprint.readingCount}`);
  if (blueprint.writingCount > 0) lines.push(`Writing ${blueprint.writingCount}`);
  return lines;
}

export interface IntroSectionLine {
  title: string;
  detail: string;
  duration?: string;
}

export function getIntroSectionLines(blueprint: HskLevelBlueprint): IntroSectionLine[] {
  const lines: IntroSectionLine[] = [];
  if (blueprint.listeningCount > 0) {
    lines.push({
      title: 'Listening',
      detail: `${blueprint.listeningCount} questions`,
      duration: blueprint.listeningMinutes > 0 ? `~${blueprint.listeningMinutes} min` : undefined,
    });
  }
  if (blueprint.readingCount > 0) {
    lines.push({
      title: 'Reading',
      detail: `${blueprint.readingCount} questions`,
      duration: blueprint.readingMinutes > 0 ? `~${blueprint.readingMinutes} min` : undefined,
    });
  }
  if (blueprint.writingCount > 0) {
    lines.push({
      title: 'Writing',
      detail: `${blueprint.writingCount} questions`,
      duration: blueprint.writingMinutes > 0 ? `~${blueprint.writingMinutes} min` : undefined,
    });
  }
  return lines;
}

export interface GeneratedExamQuestion {
  id: string;
  number: number;
  section: ExamSectionKind;
  partNumber: number;
  templateCode: HskTemplateCode;
  templateLabel: string;
  isComposite: boolean;
  question: string;
  options: string[];
  correctAnswer: string;
  /** text = 文字四选一；image = 图片三选一；image-match = 图片库 + 多题匹配 */
  displayMode: 'text' | 'image' | 'image-match';
  optionImages?: string[];
}

const IMAGE_TEMPLATE_CODES = new Set<HskTemplateCode>(['L01', 'R08']);
const IMAGE_MATCH_TEMPLATE_CODES = new Set<HskTemplateCode>(['L03']);

/** L03 等题型：共享 A–E 图片库 */
export const MOCK_IMAGE_MATCH_BANK = [
  '/hsk-mock/option-a.svg',
  '/hsk-mock/option-b.svg',
  '/hsk-mock/option-c.svg',
  '/hsk-mock/option-a.svg',
  '/hsk-mock/option-b.svg',
];

const MOCK_IMAGE_MATCH_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

const MOCK_IMAGE_MATCH_SUB_ITEMS: { question: string; correctAnswer: string }[] = [
  { question: '你好！', correctAnswer: 'A' },
  { question: '谢谢！', correctAnswer: 'C' },
  { question: '再见！', correctAnswer: 'B' },
  { question: '对不起。', correctAnswer: 'E' },
  { question: '我爱你。', correctAnswer: 'D' },
];

const MOCK_IMAGE_OPTION_SETS: Omit<
  GeneratedExamQuestion,
  'id' | 'number' | 'section' | 'partNumber' | 'templateCode' | 'templateLabel' | 'isComposite' | 'displayMode'
>[] = [
  {
    question: '你好吗？',
    options: ['Hello', 'Goodbye', 'Thank you'],
    optionImages: ['/hsk-mock/option-a.svg', '/hsk-mock/option-b.svg', '/hsk-mock/option-c.svg'],
    correctAnswer: 'Hello',
  },
  {
    question: '谢谢',
    options: ['Please', 'Thank you', 'Sorry'],
    optionImages: ['/hsk-mock/option-b.svg', '/hsk-mock/option-a.svg', '/hsk-mock/option-c.svg'],
    correctAnswer: 'Thank you',
  },
  {
    question: '我爱你',
    options: ['I love you', 'I hate you', 'I miss you'],
    optionImages: ['/hsk-mock/option-c.svg', '/hsk-mock/option-a.svg', '/hsk-mock/option-b.svg'],
    correctAnswer: 'I love you',
  },
];

const MOCK_OPTION_SETS: Omit<
  GeneratedExamQuestion,
  'id' | 'number' | 'section' | 'partNumber' | 'templateCode' | 'templateLabel' | 'isComposite' | 'displayMode' | 'optionImages'
>[] = [
  { question: '你好吗？', options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], correctAnswer: 'Hello' },
  { question: '谢谢', options: ['Please', 'Thank you', 'Sorry', 'Excuse me'], correctAnswer: 'Thank you' },
  { question: '我爱你', options: ['I love you', 'I hate you', 'I miss you', 'I like you'], correctAnswer: 'I love you' },
  { question: '再见', options: ['Hello', 'Goodbye', 'See you', 'Welcome'], correctAnswer: 'Goodbye' },
  { question: '对不起', options: ['Thank you', 'Sorry', 'Please', 'Excuse me'], correctAnswer: 'Sorry' },
];

export function generateQuestionsFromBlueprint(
  paperId: string,
  blueprint: HskLevelBlueprint,
): GeneratedExamQuestion[] {
  const questions: GeneratedExamQuestion[] = [];

  for (const p of blueprint.parts) {
    for (let n = p.questionStart; n <= p.questionEnd; n += 1) {
      const useImageMatch = IMAGE_MATCH_TEMPLATE_CODES.has(p.templateCode);
      const useImages = !useImageMatch && IMAGE_TEMPLATE_CODES.has(p.templateCode);

      if (useImageMatch) {
        const subIdx = (n - p.questionStart) % MOCK_IMAGE_MATCH_SUB_ITEMS.length;
        const sub = MOCK_IMAGE_MATCH_SUB_ITEMS[subIdx];
        questions.push({
          id: `${paperId}-q${n}`,
          number: n,
          section: p.section,
          partNumber: p.partNumber,
          templateCode: p.templateCode,
          templateLabel: TEMPLATE_LABELS[p.templateCode],
          isComposite: true,
          question: sub.question,
          options: [...MOCK_IMAGE_MATCH_LETTERS],
          correctAnswer: sub.correctAnswer,
          displayMode: 'image-match',
          optionImages: MOCK_IMAGE_MATCH_BANK,
        });
      } else if (useImages) {
        const mock = MOCK_IMAGE_OPTION_SETS[(n - 1) % MOCK_IMAGE_OPTION_SETS.length];
        questions.push({
          id: `${paperId}-q${n}`,
          number: n,
          section: p.section,
          partNumber: p.partNumber,
          templateCode: p.templateCode,
          templateLabel: TEMPLATE_LABELS[p.templateCode],
          isComposite: p.isComposite,
          question: mock.question,
          options: mock.options,
          correctAnswer: mock.correctAnswer,
          displayMode: 'image',
          optionImages: mock.optionImages,
        });
      } else {
        const mock = MOCK_OPTION_SETS[(n - 1) % MOCK_OPTION_SETS.length];
        questions.push({
          id: `${paperId}-q${n}`,
          number: n,
          section: p.section,
          partNumber: p.partNumber,
          templateCode: p.templateCode,
          templateLabel: TEMPLATE_LABELS[p.templateCode],
          isComposite: p.isComposite,
          question: mock.question,
          options: mock.options,
          correctAnswer: mock.correctAnswer,
          displayMode: 'text',
        });
      }
    }
  }

  return questions;
}

export function getPartTitle(section: ExamSectionKind, partNumber: number): string {
  const name = section === 'listening' ? 'Listening' : section === 'reading' ? 'Reading' : 'Writing';
  return `${name} Part ${partNumber}`;
}
