export type LessonPhase = 'warmup' | 'learn' | 'cards' | 'practice' | 'complete';

export type StepKind =
  | 'review'
  | 'objectives'
  | 'listen'
  | 'speak'
  | 'practice'
  | 'extension'
  | 'read'
  | 'write'
  | 'assessment';

export interface LessonPackageStep {
  kind: StepKind;
  label: string;
  skills?: Array<'听' | '说' | '读' | '写'>;
}

export interface PeriodFlow {
  phases: LessonPhase[];
  vocabRange?: [number, number];
  cardIndices?: number[];
  exerciseIndices?: number[];
}

export interface LessonPackagePeriod {
  period: number;
  title: string;
  titleEn?: string;
  goal: string;
  durationMinutes: number;
  steps: LessonPackageStep[];
  flow: PeriodFlow;
}

export interface LessonPackage {
  schemaVersion: 1;
  bookId: string;
  unitId: number;
  lessonId: number;
  lessonTitle: string;
  lessonTitleEn?: string;
  hskLevel?: number;
  sourcePages?: string;
  periods: LessonPackagePeriod[];
  unitAssessment?: {
    vocab?: string[];
    patterns?: string[];
    extension?: string[];
  };
  meta?: {
    generatedBy?: string;
    generatedAt?: string;
    reviewedBy?: string;
  };
}
