/**
 * HSK Prep Training — HSK 备考训练完整版
 * 从 hsk-mock-exam.zip 还原，适配 iPad 交互
 * HomeScreen → PaperSelectionScreen → ExamIntroScreen → ExamScreen → ResultScreen
 */
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  ButtonBase,
  TextField,
  Dialog,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { HskPrepBackButton, HSK_PREP_BACK } from '../components/hsk/HskPrepBackButton';
import { useFeedback } from '../components/feedback/FeedbackProvider';
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale';
import {
  type PaperSource,
  type HSKLevel,
  type ExamSectionKind,
  getPartTitle,
  type GeneratedExamQuestion,
  type HskTemplateCode,
  TEMPLATE_LABELS,
  hasCompositeImageOptions,
  clampActiveSubIndex,
  createSectionPartNumberResolver,
  runtimeScoredQuestionId,
} from '../hsk/hskExamBlueprint';
import {
  listPublishedPapers,
  getAttempt,
  getAttemptResultDetail,
  startAttempt,
  submitAttempt,
  type AttemptResult,
  type AttemptReview,
  type AttemptReviewItem,
  type AttemptReviewSummaryItem,
  type ExamAttempt,
  isAttemptNotFoundError,
  type PublishedPaper,
  type RuntimeOption,
} from '../services/hskExamService';
import { ExclusiveAudioPlayer } from '../hsk/exclusiveAudioPlayer';
import {
  ACTIVE_ATTEMPT_POINTER_KEY_PREFIX,
  LEGACY_ACTIVE_ATTEMPT_POINTER_KEY,
  clearActiveAttemptPointerIfMatches as clearStoredActiveAttemptPointer,
  firstBlockingTransientError,
  hasBlockingAttemptPointer,
  listActiveAttemptPointers as listStoredActiveAttemptPointers,
  readActiveAttemptPointer as readStoredActiveAttemptPointer,
  scanAttemptPointers,
  writeActiveAttemptPointer as writeStoredActiveAttemptPointer,
  type ActiveAttemptPointer as StoredActiveAttemptPointer,
} from '../hsk/attemptPointerStore';

type Screen = 'home' | 'papers' | 'intro' | 'exam' | 'result' | 'review';

type Question = GeneratedExamQuestion & { isExample?: boolean };

interface ExamPaper {
  id: string;
  level: HSKLevel;
  volume: number;
  source: PaperSource;
  title: string;
  duration: number;
  maxScore: number;
  passScore: number;
  listeningPlays: 1 | 2;
  sectionSummary: string;
  sectionLines: ExamSectionLine[];
  questions: Question[];
  questionCount: number;
  attemptId?: string;
  expiresAt?: string;
}

interface PaperCatalogItem {
  id: string;
  source: PaperSource;
  level: HSKLevel;
  volume: number;
  brandLabel: string;
  title: string;
  subtitle: string;
  questionCount: number;
  duration: number;
  sectionSummary: string;
  sectionLines: ExamSectionLine[];
  maxScore: number;
  passScore: number;
  maxPlayCount: number;
  activeAttemptId?: string;
  bestScore?: number;
  bestScoreAt?: string;
}

type ActiveAttemptPointer = StoredActiveAttemptPointer<PaperCatalogItem>;
const LATEST_RESULT_POINTER_KEY = 'clingo-hsk-latest-result';

function readActiveAttemptPointers(): ActiveAttemptPointer[] {
  return listStoredActiveAttemptPointers<PaperCatalogItem>(localStorage);
}

function readActiveAttemptPointer(): ActiveAttemptPointer | null {
  return readStoredActiveAttemptPointer<PaperCatalogItem>(localStorage);
}

function writeActiveAttemptPointer(pointer: ActiveAttemptPointer): void {
  writeStoredActiveAttemptPointer(localStorage, pointer);
}

function clearActiveAttemptPointerIfMatches(attemptId: string): boolean {
  return clearStoredActiveAttemptPointer(localStorage, attemptId);
}

function readLatestResultPointer(): ActiveAttemptPointer | null {
  try {
    const value = JSON.parse(localStorage.getItem(LATEST_RESULT_POINTER_KEY) || 'null') as ActiveAttemptPointer | null;
    return value?.attemptId && value.catalog?.id ? value : null;
  } catch {
    return null;
  }
}

function writeLatestResultPointer(pointer: ActiveAttemptPointer | null) {
  if (pointer) {
    localStorage.setItem(LATEST_RESULT_POINTER_KEY, JSON.stringify(pointer));
  } else {
    localStorage.removeItem(LATEST_RESULT_POINTER_KEY);
  }
}

interface ExamSectionLine {
  kind: ExamSectionKind;
  title: string;
  detail: string;
  questionCount: number;
  durationMinutes?: number;
  duration?: string;
}

const SECTION_ZH: Record<ExamSectionKind, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '书写',
};

function bilingualSectionLabel(kind: ExamSectionKind, t: (key: string, options?: { lng?: string }) => string, lng: string): string {
  const zh = SECTION_ZH[kind];
  const localized = t(`hskExamIntro.sections.${kind}`);
  if (lng.startsWith('zh')) {
    return `${zh} · ${t(`hskExamIntro.sections.${kind}`, { lng: 'en' })}`;
  }
  return `${localized} · ${zh}`;
}

interface PaperAttemptRecord {
  score: number;
  completedAt: string;
}

function formatPaperDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function levelNumber(level: string): HSKLevel {
  const parsed = Number(level.replace(/[^0-9]/g, ''));
  return (parsed === 2 ? 2 : 1) as HSKLevel;
}

function apiPaperToCatalog(paper: PublishedPaper, index: number): PaperCatalogItem {
  const level = levelNumber(paper.level);
  const source: PaperSource = paper.category === 'official' ? 'official' : 'clingo';
  const sectionLines = sectionLinesFromSummary(paper.sectionSummary);
  return {
    id: paper.id,
    source,
    level,
    volume: index + 1,
    brandLabel: source === 'official' ? `Volume ${index + 1}` : `C-Lingo Test ${index + 1}`,
    title: paper.name,
    subtitle: source === 'official' ? `Volume ${index + 1}` : 'Custom paper',
    questionCount: paper.questionCount,
    duration: paper.durationMinutes,
    sectionSummary: sectionLines.map((line) => line.detail).join(' · ') || `${paper.questionCount} questions`,
    sectionLines,
    maxScore: paper.totalScore,
    passScore: paper.passScore,
    maxPlayCount: paper.maxPlayCount || 2,
    activeAttemptId: paper.activeAttemptId,
    bestScore: paper.bestScore,
    bestScoreAt: paper.bestScoreAt,
  };
}

function sectionLinesFromSummary(
  summary: Array<{ module?: string; count?: number; minutes?: number }> | undefined,
): ExamSectionLine[] {
  const titles: Record<string, string> = {
    listening: 'Listening',
    reading: 'Reading',
    writing: 'Writing',
  };
  return (summary || [])
    .filter((item) => Number(item.count || 0) > 0)
    .map((item) => {
      const moduleKindMap: Record<string, ExamSectionKind> = {
        listening: 'listening',
        reading: 'reading',
        writing: 'writing',
        听力: 'listening',
        阅读: 'reading',
        书写: 'writing',
      };
      const kind = moduleKindMap[item.module || ''] || 'reading';
      return {
        kind,
        title: titles[item.module || ''] || item.module || 'Questions',
        detail: `${item.count} questions`,
        questionCount: Number(item.count || 0),
        durationMinutes: Number(item.minutes || 0) > 0 ? Number(item.minutes) : undefined,
        duration: Number(item.minutes || 0) > 0 ? `~${item.minutes} min` : undefined,
      };
    });
}

function contentText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  for (const key of ['stem', 'phrase', 'question', 'text', 'title', 'prompt', 'content']) {
    const text = contentText(record[key]);
    if (text) return text;
  }
  return '';
}

function optionValue(option: RuntimeOption, index: number): string {
  return option.key || option.text || String.fromCharCode(65 + index);
}

function attemptToPaper(catalog: PaperCatalogItem, attempt: ExamAttempt): ExamPaper {
  const questions: Question[] = [];
  const nextPart = createSectionPartNumberResolver();
  for (const runtime of attempt.delivery.questions || []) {
    const templateCode = runtime.type.replace(/_group$/, '') as HskTemplateCode;
    const section = (runtime.category === 'listening'
      ? 'listening'
      : runtime.category === 'writing'
        ? 'writing'
        : 'reading') as ExamSectionKind;
    const sectionId = runtime.sectionId || `${section}-${runtime.type}-${runtime.groupId || runtime.questionNumber}`;
    const partNumber = nextPart(section, sectionId);
    const children = runtime.questions || [];
    const rootOptions = runtime.options || [];
    const imageMatch = children.length > 0 && hasCompositeImageOptions(runtime);
    const rootText = contentText(runtime.content);
    const rows = children.length > 0
      ? children.map((child) => ({
        id: child.sourceSubId || child.id,
        number: child.questionNumber || 0,
        isExample: Boolean(child.isExample),
        question: contentText(child.question) || rootText,
        options: child.options?.length ? child.options : rootOptions,
      }))
      : [{
        id: runtime.id,
        number: runtime.questionNumber || runtime.id || 0,
        isExample: Boolean(runtime.isExample),
        question: rootText,
        options: rootOptions,
      }];
    for (const row of rows) {
      const options = row.options || [];
      const values = options.map(optionValue);
      const optionTextByValue = Object.fromEntries(
        options.map((option, index) => [optionValue(option, index), option.text || option.key || '']),
      );
      const isWriting = templateCode === 'W02';
      questions.push({
        id: row.isExample
          ? `example-${row.id || runtime.id || questions.length}`
          : runtimeScoredQuestionId(row.number, row.id || runtime.id || questions.length),
        number: row.number,
        isExample: row.isExample,
        section,
        partNumber,
        templateCode,
        templateLabel: runtime.typeName || TEMPLATE_LABELS[templateCode] || templateCode,
        isComposite: children.length > 0,
        question: row.question,
        options: values,
        correctAnswer: '',
        displayMode: isWriting ? 'writing' : imageMatch ? 'image-match' : children.length > 0 ? 'text-composite' : options.some((option) => option.image) ? 'image' : 'text',
        optionImages: options.map((option) => option.image || ''),
        optionTextByValue,
        sharedPrompt: rootText,
        audioUrl: runtime.audioUrl,
        audioGroupId: runtime.groupId || `${runtime.type}-${runtime.questionNumber}`,
        maxPlayCount: runtime.maxPlayCount || attempt.delivery.maxPlayCount || 2,
      });
    }
  }
  return {
    id: catalog.id,
    level: catalog.level,
    volume: catalog.volume,
    source: catalog.source,
    title: attempt.delivery.title,
    duration: attempt.delivery.durationMinutes,
    maxScore: attempt.delivery.totalScore,
    passScore: attempt.delivery.passScore,
    listeningPlays: (attempt.delivery.maxPlayCount === 1 ? 1 : 2),
    sectionSummary: catalog.sectionSummary,
    sectionLines: sectionLinesFromSummary(attempt.delivery.sectionSummary),
    questions,
    questionCount: catalog.questionCount,
    attemptId: attempt.attemptId,
    expiresAt: attempt.expiresAt,
  };
}


type LevelPickerId = HSKLevel | 'hsk7-9';

/** Warm cream page background — matches HSK prep design reference */
const HSK_PREP_PAGE_BG = '#FFF9F3';

interface LevelPickerItem {
  id: LevelPickerId;
  title: string;
  desc: string;
  difficulty: number;
  badgeGradient: string;
  enterColor: string;
  barFilled: string;
  barEmpty: string;
  levelTint: string;
  enabled: boolean;
}

/** Figma Mock Exam 选级卡：仅 HSK1 / HSK2 可进，其余锁定占位 */
const LEVEL_PICKER_ITEMS: LevelPickerItem[] = [
  { id: 1, title: 'HSK 1', desc: '300 words Beginner', difficulty: 1, badgeGradient: 'linear-gradient(135deg, #FFD76B 0%, #F4A51C 100%)', enterColor: '#F5A91F', barFilled: '#F1AB24', barEmpty: '#F5E7CB', levelTint: '#FFF7E2', enabled: true },
  { id: 2, title: 'HSK 2', desc: '500 words Elementary', difficulty: 1.5, badgeGradient: 'linear-gradient(135deg, #53D8C8 0%, #18A99A 100%)', enterColor: '#19B2A3', barFilled: '#22B7A8', barEmpty: '#D3EFEC', levelTint: '#E6FFFB', enabled: true },
  { id: 3, title: 'HSK 3', desc: '1000 words Intermediate', difficulty: 2, badgeGradient: 'linear-gradient(135deg, #F3C7BD 0%, #DFA99E 100%)', enterColor: '#F5A91F', barFilled: '#CA9587', barEmpty: '#E9C2BA', levelTint: '#FFFFFF', enabled: false },
  { id: 4, title: 'HSK 4', desc: '2000 words Upper Intermediate', difficulty: 2.5, badgeGradient: 'linear-gradient(135deg, #DDBCC9 0%, #C69AAA 100%)', enterColor: '#F5A91F', barFilled: '#AC7F90', barEmpty: '#D2ACBA', levelTint: '#FFFFFF', enabled: false },
  { id: 5, title: 'HSK 5', desc: '3600 words Advanced', difficulty: 3, badgeGradient: 'linear-gradient(135deg, #C5D7EB 0%, #9CAFCB 100%)', enterColor: '#F5A91F', barFilled: '#8399B5', barEmpty: '#B6C8DF', levelTint: '#FFFFFF', enabled: false },
  { id: 6, title: 'HSK 6', desc: '5400 words Proficient', difficulty: 4, badgeGradient: 'linear-gradient(135deg, #D6CDF2 0%, #A99BCF 100%)', enterColor: '#F5A91F', barFilled: '#A397CB', barEmpty: '#CCC2EB', levelTint: '#FFFFFF', enabled: false },
  { id: 'hsk7-9', title: 'HSK 7-9', desc: '11000 words Coming soon', difficulty: 5, badgeGradient: 'linear-gradient(135deg, #C8DEE8 0%, #96B1C0 100%)', enterColor: '#F5A91F', barFilled: '#97A1AE', barEmpty: '#97A1AE', levelTint: '#FFFFFF', enabled: false },
];

const PHASE_ONE_LEVELS = new Set<HSKLevel>([1, 2]);

function buildPaperFromCatalog(item: PaperCatalogItem): ExamPaper {
  return {
    id: item.id,
    level: item.level,
    volume: item.volume,
    source: item.source,
    title: item.title,
    duration: item.duration,
    maxScore: item.maxScore,
    passScore: item.passScore,
    listeningPlays: item.maxPlayCount === 1 ? 1 : 2,
    sectionSummary: item.sectionSummary,
    sectionLines: item.sectionLines,
    questions: [],
    questionCount: item.questionCount,
  };
}

const PAPER_CARD_THEMES: Record<
  PaperSource,
  {
    headerBg: string;
    headerTint: string;
    headerColor: string;
    volumeColor: string;
    subColor: string;
    borderColor: string;
    lineColor: string;
    footerBg: string;
    shellBg: string;
  }
> = {
  official: {
    headerBg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    headerTint: '#FFEDEF',
    headerColor: '#FFFFFF',
    volumeColor: '#DC2626',
    subColor: '#7F1D1D',
    borderColor: '#F5B0BC',
    lineColor: '#FCA5A5',
    footerBg: '#FFF0F3',
    shellBg: '#FFD6DE',
  },
  clingo: {
    headerBg: 'linear-gradient(135deg, #2DD4BF 0%, #0891B2 100%)',
    headerTint: '#E6FAF7',
    headerColor: '#FFFFFF',
    volumeColor: '#0D9488',
    subColor: '#115E59',
    borderColor: '#8EDFD4',
    lineColor: '#5EEAD4',
    footerBg: '#E8FAF7',
    shellBg: '#B8EBE3',
  },
};

const SECTION_ICONS: Record<ExamSectionKind, typeof HeadphonesIcon> = {
  listening: HeadphonesIcon,
  reading: MenuBookIcon,
  writing: EditNoteIcon,
};

function PaperStatPill({
  label,
  value,
  screenSize,
}: {
  label: string;
  value: string | number;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${p(12)}px`,
        height: p(50),
        px: `${p(18)}px`,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E3E3',
        borderRadius: `${p(21)}px`,
        boxSizing: 'border-box',
      }}
    >
      <Typography sx={{ fontSize: p(20), fontWeight: 700, lineHeight: 1.25, color: '#667085', fontFamily: FIGMA_FONT }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: p(24), fontWeight: 700, lineHeight: 1.25, color: '#344054', fontFamily: FIGMA_FONT, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HomeScreen — HSK 级别选择（Figma Mock Exam 1920×1200）
   ═══════════════════════════════════════════════════════════════════════════════ */
function levelBadgeLabel(id: LevelPickerId): string {
  return id === 'hsk7-9' ? '7-9' : String(id);
}

function DifficultyMeter({
  level,
  filled,
  empty,
  screenSize,
}: {
  level: number;
  filled: string;
  empty: string;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
      <Typography
        sx={{
          fontSize: p(16),
          fontWeight: 700,
          color: '#8A8690',
          lineHeight: 1.2,
          fontFamily: FIGMA_FONT,
        }}
      >
        DIFFICULTY
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(6)}px` }}>
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, level - index));
          const background =
            fill >= 1
              ? filled
              : fill >= 0.5
                ? `linear-gradient(90deg, ${filled} 0%, ${filled} 50%, ${empty} 50%, ${empty} 100%)`
                : empty;
          return (
            <Box
              key={index}
              sx={{
                width: p(24),
                height: p(11),
                borderRadius: `${p(5)}px`,
                background,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

function LevelPickerCard({
  item,
  onSelect,
  screenSize,
}: {
  item: LevelPickerItem;
  onSelect: (level: HSKLevel) => void;
  screenSize: string;
}) {
  const locked = !item.enabled;
  const p = (n: number) => figmaPx(n, screenSize);

  const cardBody = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        height: '100%',
        minHeight: 0,
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: '24%',
          minWidth: p(100),
          maxWidth: p(176),
          m: `${p(10)}px`,
          borderRadius: `${p(22)}px ${p(10)}px ${p(10)}px ${p(22)}px`,
          background: item.badgeGradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: item.id === 'hsk7-9' ? p(36) : p(48),
            lineHeight: 1.1,
            color: '#FFFFFF',
            fontFamily: FIGMA_FONT,
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {levelBadgeLabel(item.id)}
        </Typography>
        <Typography
          sx={{
            fontSize: p(16),
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: item.levelTint,
            fontFamily: FIGMA_FONT,
            position: 'relative',
            zIndex: 1,
            mt: `${p(4)}px`,
          }}
        >
          LEVEL
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: `${p(16)}px`,
          pr: `${p(12)}px`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: p(28),
            lineHeight: 1.2,
            color: '#24242D',
            fontFamily: FIGMA_FONT,
          }}
        >
          {item.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(8)}px`, mt: `${p(6)}px`, minWidth: 0 }}>
          <MenuBookIcon sx={{ fontSize: p(20), color: '#A5B0BA', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: p(20),
              lineHeight: 1.25,
              color: locked ? '#77747F' : '#62606B',
              fontWeight: locked ? 400 : 700,
              fontFamily: FIGMA_FONT,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.desc}
          </Typography>
        </Box>
        <Box sx={{ mt: `${p(12)}px` }}>
          <DifficultyMeter
            level={item.difficulty}
            filled={item.barFilled}
            empty={item.barEmpty}
            screenSize={screenSize}
          />
        </Box>
      </Box>

      <Box
        sx={{
          alignSelf: 'center',
          flexShrink: 0,
          mr: `${p(20)}px`,
          width: p(120),
          height: p(52),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(6)}px`,
          bgcolor: locked ? '#F3F4F6' : item.enterColor,
          borderRadius: `${p(16)}px`,
        }}
      >
        <Typography
          sx={{
            fontSize: p(18),
            fontWeight: 700,
            color: locked ? '#77747F' : '#FFFFFF',
            fontFamily: FIGMA_FONT,
          }}
        >
          {locked ? 'Locked' : 'Enter'}
        </Typography>
        {locked ? (
          <LockIcon sx={{ fontSize: p(16), color: '#77747F' }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: p(18), color: '#FFFFFF' }} />
        )}
      </Box>
    </Box>
  );

  const cardSx = {
    height: '100%',
    minHeight: 0,
    width: '100%',
    borderRadius: `${p(24)}px`,
    bgcolor: 'rgba(255,255,255,0.94)',
    overflow: 'hidden' as const,
    opacity: locked ? 0.62 : 1,
    textAlign: 'left' as const,
    boxShadow: '0px 8px 24px rgba(36, 36, 45, 0.06)',
  };

  if (locked) {
    return (
      <Box sx={cardSx} aria-disabled>
        {cardBody}
      </Box>
    );
  }

  return (
    <ButtonBase
      onClick={() => onSelect(item.id as HSKLevel)}
      sx={{
        ...cardSx,
        display: 'block',
        '&:active': { transform: 'scale(0.99)' },
        '@media (prefers-reduced-motion: reduce)': {
          '&:active': { transform: 'none' },
        },
        '&:focus-visible': {
          outline: `3px solid ${item.enterColor}`,
          outlineOffset: 3,
        },
      }}
    >
      {cardBody}
    </ButtonBase>
  );
}

function MockExamPageChrome({
  title,
  onBack,
  showBack,
  screenSize,
  children,
}: {
  title: string;
  onBack: () => void;
  showBack: boolean;
  screenSize: string;
  children: ReactNode;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFF8F0',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(20)}px`,
          pl: `${HSK_PREP_BACK.left}px`,
          pr: `${p(40)}px`,
          pt: `${HSK_PREP_BACK.top}px`,
          pb: `${p(8)}px`,
        }}
      >
        <HskPrepBackButton
          onClick={onBack}
          sx={{
            visibility: showBack ? 'visible' : 'hidden',
            pointerEvents: showBack ? 'auto' : 'none',
          }}
        />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: 1.2,
            color: '#20212A',
            fontFamily: FIGMA_FONT,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, px: `${p(40)}px`, pb: `${p(28)}px` }}>{children}</Box>
    </Box>
  );
}

/** Figma 选版本页画板 2508 宽，映射到当前 VITE_SCREEN_SIZE */
const VERSION_ARTBOARD_W = 2508;

function versionPx(n: number, screenSize: string): number {
  const width = Number(String(screenSize).split('x')[0]) || 2000;
  return Math.round((n * width) / VERSION_ARTBOARD_W);
}

function VersionTrackCard({
  badge,
  badgeBg,
  badgeColor,
  title,
  description,
  ariaLabel,
  onSelect,
  screenSize,
}: {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  description: string;
  ariaLabel: string;
  onSelect: () => void;
  screenSize: string;
}) {
  const v = (n: number) => versionPx(n, screenSize);
  return (
    <ButtonBase
      onClick={onSelect}
      aria-label={ariaLabel}
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        boxSizing: 'border-box',
        px: `${v(70)}px`,
        py: `${v(56)}px`,
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E6E9EF',
        boxShadow: `0px ${v(50)}px ${v(125)}px rgba(15, 23, 42, 0.1)`,
        borderRadius: `${v(70)}px`,
        textAlign: 'left',
        '&:active': { transform: 'scale(0.99)' },
        '&:focus-visible': {
          outline: `3px solid ${badgeColor}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        sx={{
          width: v(155),
          height: v(155),
          borderRadius: `${v(52)}px`,
          bgcolor: badgeBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: v(55),
            lineHeight: 1,
            fontWeight: 400,
            color: badgeColor,
            fontFamily: FIGMA_FONT,
          }}
        >
          {badge}
        </Typography>
      </Box>
      <Typography
        sx={{
          mt: `${v(55)}px`,
          fontWeight: 700,
          fontSize: v(67),
          lineHeight: 1.2,
          color: '#142033',
          fontFamily: FIGMA_FONT,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          mt: `${v(20)}px`,
          fontWeight: 700,
          fontSize: v(40),
          lineHeight: 1.35,
          color: '#667085',
          fontFamily: FIGMA_FONT,
        }}
      >
        {description}
      </Typography>
    </ButtonBase>
  );
}

function VersionScreen({
  onSelect,
  onBack,
  showBack = true,
  screenSize,
}: {
  onSelect: (track: PaperSource) => void;
  onBack: () => void;
  showBack?: boolean;
  screenSize: string;
}) {
  const v = (n: number) => versionPx(n, screenSize);
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFF8F0',
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '82.45%',
          right: '-7%',
          top: '5.83%',
          bottom: '55%',
          bgcolor: 'rgba(255, 181, 217, 0.17)',
          filter: `blur(${v(123)}px)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: `${v(28)}px`,
          pl: `${HSK_PREP_BACK.left}px`,
          pr: `${v(83)}px`,
          pt: `${HSK_PREP_BACK.top}px`,
          pb: `${v(8)}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <HskPrepBackButton
          onClick={onBack}
          sx={{
            visibility: showBack ? 'visible' : 'hidden',
            pointerEvents: showBack ? 'auto' : 'none',
          }}
        />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: v(75),
            lineHeight: `${v(94)}px`,
            color: '#20212A',
            fontFamily: FIGMA_FONT,
          }}
        >
          Mock Exam
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: `${v(110)}px`,
          pb: `${v(80)}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: `${v(70)}px`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: v(64),
              lineHeight: `${v(80)}px`,
              letterSpacing: '-0.027em',
              textAlign: 'center',
              color: '#142033',
              fontFamily: FIGMA_FONT,
            }}
          >
            Choose your HSK version
          </Typography>
          <Typography
            sx={{
              mt: `${v(22)}px`,
              fontWeight: 400,
              fontSize: v(38),
              lineHeight: `${v(48)}px`,
              textAlign: 'center',
              color: '#667085',
              fontFamily: FIGMA_FONT,
              maxWidth: v(1074),
            }}
          >
            Choose a version, then select a level and start your mock exam.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: `${v(60)}px`,
            maxHeight: v(636),
          }}
        >
          <VersionTrackCard
            badge="2.0"
            badgeBg="#E8FAF6"
            badgeColor="#078879"
            title="Past Papers"
            description="Take an HSK 2.0 mock exam."
            ariaLabel="Past Papers, HSK 2.0"
            onSelect={() => onSelect('official')}
            screenSize={screenSize}
          />
          <VersionTrackCard
            badge="3.0"
            badgeBg="#F1E8FF"
            badgeColor="#7C3AED"
            title="C-Test"
            description="Choose a level and take an HSK 3.0 mock exam."
            ariaLabel="C-Test, HSK 3.0"
            onSelect={() => onSelect('clingo')}
            screenSize={screenSize}
          />
        </Box>
      </Box>
    </Box>
  );
}

function HomeScreen({
  onSelectLevel,
  onBack,
  showBack = true,
  screenSize,
}: {
  onSelectLevel: (level: HSKLevel) => void;
  onBack: () => void;
  showBack?: boolean;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <MockExamPageChrome title="Mock Exam" onBack={onBack} showBack={showBack} screenSize={screenSize}>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
          gap: `${p(16)}px`,
        }}
      >
        {LEVEL_PICKER_ITEMS.map((item) => (
          <LevelPickerCard
            key={String(item.id)}
            item={item}
            onSelect={onSelectLevel}
            screenSize={screenSize}
          />
        ))}
      </Box>
    </MockExamPageChrome>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PaperSelectionScreen — 官方 / C-Lingo 自研 分区选卷（按级别）
   ═══════════════════════════════════════════════════════════════════════════════ */
function PaperCard({
  paper,
  attempt,
  onSelect,
  screenSize,
}: {
  paper: PaperCatalogItem;
  attempt?: PaperAttemptRecord;
  onSelect: (paper: PaperCatalogItem) => void;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  const official = paper.source === 'official';
  const savedScore = attempt?.score;
  const hasScore = savedScore !== undefined;
  const passed = hasScore && savedScore >= paper.passScore;
  const scoreBadgeBg = !hasScore ? '#DDE3EA' : passed ? '#13C377' : '#F34D47';
  const dateLabel = attempt ? formatPaperDate(attempt.completedAt) : '--';

  return (
    <ButtonBase
      onClick={() => onSelect(paper)}
      sx={{
        width: p(300),
        height: p(280),
        display: 'block',
        p: 0,
        flexShrink: 0,
        position: 'relative',
        overflow: 'visible',
        textAlign: 'left',
        '&:active': { transform: 'scale(0.99)' },
        '&:focus-visible': {
          outline: `3px solid ${official ? '#E9292D' : '#00A99D'}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${p(28)}px`,
          background: official
            ? 'linear-gradient(180deg, #FFB4B4 0%, #E58C8C 72.12%)'
            : 'linear-gradient(180deg, #4AE6B6 0%, #7ECCB3 87.02%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '36.5%',
          right: '36.5%',
          top: p(12),
          height: p(9),
          borderRadius: `${p(13)}px`,
          bgcolor: '#FFFFFF',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: p(36),
          bottom: 0,
          bgcolor: '#FFFDFB',
          border: official ? '1px solid #FFB4B4' : '1px solid #00B4A0',
          borderRadius: `${p(28)}px`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: p(27),
          top: p(28),
          width: p(88),
          height: p(104),
          borderRadius: `${p(8)}px`,
          bgcolor: scoreBadgeBg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Typography sx={{ fontSize: p(15), fontWeight: 600, lineHeight: 1.25, color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
          SCORE
        </Typography>
        <Typography sx={{ fontSize: p(27), fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF', fontFamily: FIGMA_FONT, fontVariantNumeric: 'tabular-nums' }}>
          {hasScore ? savedScore : '--'}
        </Typography>
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          left: p(18),
          right: p(15),
          top: p(148),
          fontSize: p(32),
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: 'center',
          color: official ? '#E9292D' : '#00A99D',
          fontFamily: FIGMA_FONT,
          zIndex: 2,
        }}
      >
        {paper.brandLabel}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          left: p(21),
          right: p(21),
          bottom: p(15),
          height: p(43),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: official ? 'rgba(255, 180, 180, 0.22)' : 'rgba(170, 255, 228, 0.22)',
          border: official ? '1px solid #FFB4B4' : '1px solid #70D4CA',
          borderRadius: `${p(28)}px`,
          zIndex: 2,
        }}
      >
        <Typography sx={{ fontSize: p(20), fontWeight: 700, lineHeight: 1.25, color: '#2D3436', fontFamily: FIGMA_FONT }}>
          {dateLabel}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function PaperSectionLabel({
  label,
  color,
  screenSize,
}: {
  label: string;
  color: string;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: `${p(18)}px`,
        height: p(44),
        bgcolor: color,
        borderRadius: `${p(16)}px`,
        mb: `${p(16)}px`,
      }}
    >
      <Typography sx={{ fontSize: p(22), fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
        {label}
      </Typography>
    </Box>
  );
}

function PaperSelectionScreen({
  level,
  papers,
  loading,
  error,
  onSelectPaper,
  onBack,
  onRetry,
  paperTrack,
  screenSize,
}: {
  level: HSKLevel;
  papers: PaperCatalogItem[];
  loading: boolean;
  error: string | null;
  onSelectPaper: (paper: PaperCatalogItem) => void;
  onBack: () => void;
  onRetry: () => void;
  paperTrack?: PaperSource | null;
  screenSize: string;
}) {
  const p = (n: number) => figmaPx(n, screenSize);
  const visiblePapers = useMemo(
    () => (paperTrack ? papers.filter((paper) => paper.source === paperTrack) : papers),
    [paperTrack, papers],
  );
  const summaryPaper = visiblePapers[0];
  const officialPapers = visiblePapers.filter((paper) => paper.source === 'official');
  const practicePapers = visiblePapers.filter((paper) => paper.source === 'clingo');
  const showOfficial = officialPapers.length > 0;
  const showPractice = practicePapers.length > 0;

  const renderCards = (items: PaperCatalogItem[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${p(28)}px` }}>
      {items.map((paper) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          attempt={paper.bestScore === undefined
            ? undefined
            : { score: paper.bestScore, completedAt: paper.bestScoreAt || new Date().toISOString() }}
          onSelect={onSelectPaper}
          screenSize={screenSize}
        />
      ))}
    </Box>
  );

  return (
    <MockExamPageChrome
      title={`HSK ${level} Practice Papers`}
      onBack={onBack}
      showBack
      screenSize={screenSize}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${p(12)}px`, flexShrink: 0, mb: `${p(16)}px` }}>
          <PaperStatPill label="DURATION" value={summaryPaper ? `${summaryPaper.duration} min` : '--'} screenSize={screenSize} />
          <PaperStatPill label="QUESTIONS" value={summaryPaper?.questionCount ?? '--'} screenSize={screenSize} />
          <PaperStatPill label="FULL SCORE" value={summaryPaper?.maxScore ?? '--'} screenSize={screenSize} />
        </Box>

        {(loading || error || visiblePapers.length === 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, flexShrink: 0, mb: `${p(16)}px` }}>
            <Typography sx={{ color: error ? '#B91C1C' : '#667085', fontWeight: 700, fontFamily: FIGMA_FONT, fontSize: p(22) }}>
              {loading ? 'Loading published papers…' : error || 'No published papers for this level.'}
            </Typography>
            {error && !loading && (
              <ButtonBase
                onClick={onRetry}
                sx={{
                  minHeight: p(44),
                  px: `${p(18)}px`,
                  borderRadius: '999px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontWeight: 800,
                  fontFamily: FIGMA_FONT,
                }}
              >
                Retry
              </ButtonBase>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {showOfficial && (
            <Box sx={{ mb: showPractice ? `${p(28)}px` : 0 }}>
              <PaperSectionLabel label="Official" color="#EF2D32" screenSize={screenSize} />
              {renderCards(officialPapers)}
            </Box>
          )}
          {showOfficial && showPractice && (
            <Box sx={{ borderTop: '2px dashed #D1DBE6', mb: `${p(24)}px` }} />
          )}
          {showPractice && (
            <Box>
              <PaperSectionLabel label="Practice" color="#00A99D" screenSize={screenSize} />
              {renderCards(practicePapers)}
            </Box>
          )}
        </Box>
      </Box>
    </MockExamPageChrome>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ExamIntroScreen — 考试介绍（开始前）
   ═══════════════════════════════════════════════════════════════════════════════ */
function ExamIntroStat({
  kind,
  value,
  label,
}: {
  kind: 'time' | 'questions' | 'score';
  value: string | number;
  label: string;
}) {
  const iconBg = kind === 'time' ? '#FFF0F5' : kind === 'questions' ? '#EEF5FF' : '#FFF6DB';
  const icon = kind === 'time'
    ? (
      <Box component="svg" viewBox="0 0 48 48" sx={{ width: 40, height: 40, display: 'block' }}>
        <circle cx="24" cy="24" r="16" fill="none" stroke="#F15B85" strokeWidth="5" />
        <path d="M24 16v9l7 4" fill="none" stroke="#F15B85" strokeWidth="5" strokeLinecap="round" />
      </Box>
    )
    : kind === 'questions'
      ? (
        <Box component="svg" viewBox="0 0 48 48" sx={{ width: 40, height: 40, display: 'block' }}>
          <rect x="10" y="12" width="6" height="24" rx="1.5" fill="#668BFF" />
          <path d="M22 16h16M22 24h16M22 32h12" fill="none" stroke="#668BFF" strokeWidth="3.6" strokeLinecap="round" />
        </Box>
      )
      : (
        <Box component="svg" viewBox="0 0 48 48" sx={{ width: 40, height: 40, display: 'block' }}>
          <path d="M16 18h16v8c0 6-3.4 10-8 12-4.6-2-8-6-8-12V18Z" fill="none" stroke="#F3B93F" strokeWidth="3.6" />
          <path d="M18 38h12l-2 4h-8l-2-4Z" fill="#F3B93F" />
        </Box>
      );

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '22px', minWidth: 0 }}>
      <Box
        sx={{
          width: 71,
          height: 71,
          borderRadius: '18px',
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 50,
            lineHeight: '57px',
            color: '#172033',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 400,
            fontSize: 28,
            lineHeight: '35px',
            color: '#687289',
            mt: '4px',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function ExamIntroScreen({
  paper,
  onStart,
  onBack,
  starting,
}: {
  paper: ExamPaper;
  onStart: () => void;
  onBack: () => void;
  starting: boolean;
}) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const { t, i18n } = useTranslation();
  const sectionLines = paper.sectionLines;
  const listenLabel = paper.listeningPlays === 1 ? t('hskExamIntro.listenOnce') : t('hskExamIntro.listenTwice');
  const isOfficial = paper.source === 'official';
  const examTypeLabel = isOfficial
    ? t('hskExamIntro.mockTest', { level: paper.level })
    : t('hskExamIntro.practiceTest', { level: paper.level });
  const startGradient = isOfficial
    ? 'linear-gradient(90deg, #F55BC8 0%, #F27A8D 52%, #FF9B68 100%)'
    : 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 48%, #0891B2 100%)';
  const badgeBg = isOfficial ? '#DF171C' : '#00A99D';
  const introBg = 'linear-gradient(135deg, #F7FAFF 0%, #FFF6EE 48%, #F7F4FF 100%)';
  const rules = [
    t('hskExamIntro.rule1'),
    <>
      {t('hskExamIntro.rule2Prefix')}{' '}
      <Box component="span" sx={{ color: '#E94E77', fontWeight: 700 }}>{listenLabel}</Box>
      {t('hskExamIntro.rule2Suffix')}
    </>,
    <>
      {t('hskExamIntro.rule3Prefix')}{' '}
      <Box component="span" sx={{ color: '#E94E77', fontWeight: 700 }}>{t('hskExamIntro.autoSubmit')}</Box>
      {t('hskExamIntro.rule3Suffix')}
    </>,
    t('hskExamIntro.rule4'),
  ];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: introBg,
        position: 'relative',
        minHeight: 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 520,
          height: 420,
          left: -40,
          top: 180,
          bgcolor: 'rgba(255, 181, 217, 0.27)',
          filter: 'blur(94px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          right: 40,
          top: 380,
          bgcolor: 'rgba(185, 201, 255, 0.33)',
          filter: 'blur(94px)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '21px',
          pl: `${HSK_PREP_BACK.left}px`,
          pr: '60px',
          pt: `${HSK_PREP_BACK.top}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <HskPrepBackButton onClick={onBack} disabled={starting} />
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#172033',
            whiteSpace: 'nowrap',
          }}
        >
          {t('hskExamIntro.volume', { volume: paper.volume })}
        </Typography>
        <Box
          sx={{
            height: 49,
            px: '22px',
            bgcolor: badgeBg,
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFFFFF', flexShrink: 0 }} />
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '30px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            {examTypeLabel}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          px: '152px',
          pt: '48px',
          pb: '28px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ExamIntroStat kind="time" value={paper.duration} label={t('hskExamIntro.durationMin')} />
        <ExamIntroStat kind="questions" value={paper.questionCount} label={t('hskExamIntro.totalQuestions')} />
        <ExamIntroStat kind="score" value={paper.maxScore} label={t('hskExamIntro.fullScore')} />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1.06fr 1fr',
          gap: '46px',
          px: '152px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            bgcolor: 'rgba(255,255,255,0.66)',
            border: '2px solid rgba(255,255,255,0.82)',
            borderRadius: '36px',
            px: '42px',
            pt: '36px',
            pb: '28px',
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', mb: '28px' }}>
            <Box
              sx={{
                width: 10,
                height: 50,
                borderRadius: '8px',
                background: isOfficial
                  ? 'linear-gradient(90deg, #F55BC8 0%, #F27A8D 52%, #FF9B68 100%)'
                  : 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 100%)',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 34, lineHeight: '39px', color: '#172033' }}>
              {t('hskExamIntro.examRules')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {rules.map((rule, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '14px',
                    bgcolor: isOfficial ? '#FFF0F4' : '#E8FAF6',
                    color: isOfficial ? '#E94E77' : '#078879',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: 24,
                    lineHeight: '28px',
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: 28,
                    lineHeight: '35px',
                    color: '#172033',
                    pt: '8px',
                  }}
                >
                  {rule}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            minHeight: 0,
            bgcolor: 'rgba(255,255,255,0.66)',
            border: '2px solid rgba(255,255,255,0.82)',
            borderRadius: '36px',
            px: '42px',
            pt: '36px',
            pb: '28px',
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', mb: '28px' }}>
            <Box
              sx={{
                width: 10,
                height: 50,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6395FF 0%, #8F73FF 100%)',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 34, lineHeight: '39px', color: '#172033' }}>
              {t('hskExamIntro.questionTypes')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {sectionLines.map((line) => (
              <Box
                key={line.kind}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 110,
                  px: '28px',
                  bgcolor: 'rgba(217, 222, 248, 0.2)',
                  border: '2px solid rgba(255,255,255,0.82)',
                  borderRadius: '24px',
                  boxSizing: 'border-box',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 32, lineHeight: '40px', color: '#172033' }}>
                    {bilingualSectionLabel(line.kind, t, i18n.language)}
                  </Typography>
                  <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: 24, lineHeight: '30px', color: '#687289', mt: '4px' }}>
                    {t('hskExamIntro.questions', { count: line.questionCount })}
                  </Typography>
                </Box>
                {line.durationMinutes != null && line.durationMinutes > 0 && (
                  <Box
                    sx={{
                      minWidth: 132,
                      height: 46,
                      px: '16px',
                      borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.72)',
                      border: '2px solid rgba(255,255,255,0.82)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 24, lineHeight: '30px', color: '#687289', whiteSpace: 'nowrap' }}>
                      {t('hskExamIntro.minutesApprox', { count: line.durationMinutes })}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          px: '152px',
          pt: '28px',
          pb: '36px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ButtonBase
          onClick={() => setRulesAccepted((v) => !v)}
          disabled={starting}
          aria-pressed={rulesAccepted}
          sx={{
            minHeight: 72,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: rulesAccepted ? badgeBg : 'rgba(255,255,255,0.55)',
              border: rulesAccepted ? `2px solid ${badgeBg}` : '2px solid #AAB6C9',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {rulesAccepted && (
              <Box component="svg" viewBox="0 0 16 16" sx={{ width: 16, height: 16, display: 'block' }}>
                <path d="M3 8.2 6.4 12 13 4" fill="none" stroke="#fff" strokeWidth="2.2" />
              </Box>
            )}
          </Box>
          <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 24, lineHeight: '30px', color: '#172033', textAlign: 'left' }}>
            {t('hskExamIntro.rulesAccepted')}
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={onStart}
          disabled={!rulesAccepted || starting}
          aria-label="Start exam"
          sx={{
            minWidth: 376,
            height: 94,
            px: '28px',
            borderRadius: '28px',
            background: rulesAccepted && !starting ? startGradient : '#D5D9E2',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.72)' },
          }}
        >
          <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: 40, lineHeight: '50px' }}>
            {starting ? t('hskExamIntro.starting') : t('hskExamIntro.startExam')}
          </Typography>
          {!starting && (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 22 }} />
            </Box>
          )}
        </ButtonBase>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ExamScreen — 考试进行中
   ═══════════════════════════════════════════════════════════════════════════════ */

interface ExamNavGroup {
  indices: number[];
  groupKind: 'single' | 'image-match' | 'text-composite';
}

interface SidebarSlot {
  kind: 'single' | 'range';
  indices: number[];
  label: string;
}

function isGroupedDisplayMode(mode: Question['displayMode']): mode is 'image-match' | 'text-composite' {
  return mode === 'image-match' || mode === 'text-composite';
}

function groupedQuestionKey(question: Question): string {
  return `${question.section}-${question.partNumber}-${question.audioGroupId || question.id}`;
}

function questionLabel(question: Question): string {
  return question.isExample ? 'Example' : String(question.number);
}

function buildExamNavGroups(questions: Question[]): ExamNavGroup[] {
  const groups: ExamNavGroup[] = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    if (isGroupedDisplayMode(q.displayMode)) {
      const groupKey = groupedQuestionKey(q);
      const groupKind = q.displayMode;
      const indices: number[] = [];
      while (
        i < questions.length
        && questions[i].displayMode === groupKind
        && groupedQuestionKey(questions[i]) === groupKey
      ) {
        indices.push(i);
        i += 1;
      }
      groups.push({ indices, groupKind });
    } else {
      groups.push({ indices: [i], groupKind: 'single' });
      i += 1;
    }
  }
  return groups;
}

function isNavGroupComplete(
  group: ExamNavGroup,
  questions: Question[],
  answers: Record<string, string>,
): boolean {
  const scoredIndices = group.indices.filter((idx) => !questions[idx].isExample);
  const groupAnswers = scoredIndices
    .map((idx) => answers[questions[idx].id])
    .filter((value) => Boolean(value));
  if (groupAnswers.length !== scoredIndices.length) return false;
  if (group.groupKind === 'image-match') {
    return new Set(groupAnswers).size === groupAnswers.length;
  }
  return true;
}

function buildSidebarSlots(indices: number[], questions: Question[]): SidebarSlot[] {
  const slots: SidebarSlot[] = [];
  let i = 0;
  while (i < indices.length) {
    const q = questions[indices[i]];
    if (isGroupedDisplayMode(q.displayMode)) {
      const groupKey = groupedQuestionKey(q);
      const groupMode = q.displayMode;
      const slotIndices: number[] = [];
      while (
        i < indices.length
        && questions[indices[i]].displayMode === groupMode
        && groupedQuestionKey(questions[indices[i]]) === groupKey
      ) {
        slotIndices.push(indices[i]);
        i += 1;
      }
      const scoredNumbers = slotIndices
        .map((idx) => questions[idx])
        .filter((question) => !question.isExample)
        .map((question) => question.number);
      const includesExample = slotIndices.some((idx) => questions[idx].isExample);
      const numberLabel = scoredNumbers.length > 1
        ? `${scoredNumbers[0]}–${scoredNumbers[scoredNumbers.length - 1]}`
        : scoredNumbers.length === 1 ? String(scoredNumbers[0]) : '';
      slots.push({
        kind: 'range',
        indices: slotIndices,
        label: includesExample ? `Example${numberLabel ? ` · ${numberLabel}` : ''}` : numberLabel,
      });
    } else {
      slots.push({ kind: 'single', indices: [indices[i]], label: questionLabel(questions[indices[i]]) });
      i += 1;
    }
  }
  return slots;
}

function ExamScreen({ paper, onFinish, onExit, error, is960 }: { paper: ExamPaper; onFinish: (answers: Record<string, string>) => Promise<boolean>; onExit: () => void; error: string | null; is960: boolean }) {
  const { openFeedback } = useFeedback();
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE);
  const GRACE_PERIOD_SECONDS = 60;
  const attemptStorageKey = `hsk-attempt-${paper.attemptId || paper.id}`;
  const storedAttempt = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(attemptStorageKey) || '{}') as {
        answers?: Record<string, string>;
        currentQuestionIndex?: number;
        activeSubIndex?: number;
        playCounts?: Record<string, number>;
      };
    } catch {
      return {};
    }
  }, [attemptStorageKey]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const restored = storedAttempt.currentQuestionIndex;
    return Number.isInteger(restored) && restored !== undefined && restored >= 0 && restored < paper.questions.length
      ? restored
      : 0;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(storedAttempt.answers || {});
  const [examDeadlineMs] = useState(() => {
    const parsed = paper.expiresAt ? Date.parse(paper.expiresAt) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : Date.now() + paper.duration * 60 * 1000;
  });
  const [clockNow, setClockNow] = useState(Date.now);
  const [activeSubIndex, setActiveSubIndex] = useState(() => (
    Number.isInteger(storedAttempt.activeSubIndex) && Number(storedAttempt.activeSubIndex) >= 0
      ? Number(storedAttempt.activeSubIndex)
      : 0
  ));
  const subIndexRestoredRef = useRef(false);
  const [progressOpen, setProgressOpen] = useState(true);
  const [timeHidden, setTimeHidden] = useState(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPlayerRef = useRef<ExclusiveAudioPlayer | null>(null);
  if (!audioPlayerRef.current) {
    audioPlayerRef.current = new ExclusiveAudioPlayer((url) => new Audio(url));
  }
  const submittedRef = useRef(false);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(storedAttempt.playCounts || {});
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const CRITICAL_TIME_SECONDS = 5 * 60;
  const timeRemaining = Math.max(0, Math.ceil((examDeadlineMs - clockNow) / 1000));
  const graceRemaining = Math.max(0, Math.ceil((examDeadlineMs + GRACE_PERIOD_SECONDS * 1000 - clockNow) / 1000));
  const isGracePeriod = timeRemaining === 0 && graceRemaining > 0;
  const isExpired = graceRemaining <= 0;
  const isAnsweringClosed = timeRemaining <= 0;
  const isCriticalTime = timeRemaining > 0 && timeRemaining <= CRITICAL_TIME_SECONDS;

  const examNavGroups = useMemo(() => buildExamNavGroups(paper.questions), [paper.questions]);
  const currentNavGroupIndex = examNavGroups.findIndex((g) => g.indices.includes(currentQuestionIndex));
  const currentNavGroup = examNavGroups[Math.max(0, currentNavGroupIndex)];
  const isImageMatchGroup = currentNavGroup?.groupKind === 'image-match';
  const isTextCompositeGroup = currentNavGroup?.groupKind === 'text-composite';
  const isGroupedQuestion = isImageMatchGroup || isTextCompositeGroup;
  const groupQuestions = isGroupedQuestion
    ? currentNavGroup.indices.map((idx) => paper.questions[idx])
    : [paper.questions[currentQuestionIndex]];

  const currentSubIndex = clampActiveSubIndex(activeSubIndex, groupQuestions.length);
  const currentQuestion = isTextCompositeGroup
    ? groupQuestions[currentSubIndex]
    : paper.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const matchImages = groupQuestions[0]?.optionImages ?? [];

  const sidebarGroups = useMemo(() => {
    const groups: { key: string; title: string; section: ExamSectionKind; indices: number[] }[] = [];
    paper.questions.forEach((q, idx) => {
      const key = `${q.section}-${q.partNumber}`;
      const existing = groups.find((g) => g.key === key);
      if (existing) {
        existing.indices.push(idx);
      } else {
        groups.push({ key, title: getPartTitle(q.section, q.partNumber), section: q.section, indices: [idx] });
      }
    });
    return groups;
  }, [paper.questions]);

  const sidebarSections = useMemo(() => {
    const order: ExamSectionKind[] = [];
    const bySection = new Map<ExamSectionKind, typeof sidebarGroups>();
    sidebarGroups.forEach((group) => {
      if (!bySection.has(group.section)) {
        bySection.set(group.section, []);
        order.push(group.section);
      }
      bySection.get(group.section)?.push(group);
    });
    return order.map((section) => ({ section, parts: bySection.get(section) || [] }));
  }, [sidebarGroups]);

  useEffect(() => {
    if (isExpired) return;
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isExpired]);

  useEffect(() => {
    localStorage.setItem(attemptStorageKey, JSON.stringify({
      answers,
      currentQuestionIndex,
      activeSubIndex,
      playCounts,
    }));
  }, [activeSubIndex, answers, attemptStorageKey, currentQuestionIndex, playCounts]);

  useEffect(() => () => {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
  }, []);

  const clearRevealTimeout = () => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  };

  const handleToggleTimeVisibility = () => {
    if (timeHidden) {
      setTimeHidden(false);
      if (isCriticalTime) {
        clearRevealTimeout();
        revealTimeoutRef.current = setTimeout(() => {
          setTimeHidden(true);
          revealTimeoutRef.current = null;
        }, 5000);
      }
    } else {
      clearRevealTimeout();
      setTimeHidden(true);
    }
  };

  useEffect(() => {
    if (!subIndexRestoredRef.current) {
      subIndexRestoredRef.current = true;
      return;
    }
    setActiveSubIndex(0);
  }, [currentNavGroupIndex]);

  const handleSelectAnswer = (answer: string, questionId = currentQuestion.id) => {
    const question = paper.questions.find((item) => item.id === questionId);
    if (isAnsweringClosed || question?.isExample) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (isTextCompositeGroup) {
      const groupLen = groupQuestions.length;
      if (currentSubIndex < groupLen - 1) {
        setActiveSubIndex((prev) => prev + 1);
      }
    }
  };

  const handleAssignMatchLetter = (letter: string) => {
    if (!isImageMatchGroup || isAnsweringClosed) return;
    const qIdx = currentNavGroup.indices[currentSubIndex];
    const q = paper.questions[qIdx];
    if (q.isExample) return;

    setAnswers((prev) => {
      const next = { ...prev };
      // 同一组内选项互斥：每个字母只能对应一题
      for (const idx of currentNavGroup.indices) {
        const questionId = paper.questions[idx].id;
        if (questionId !== q.id && next[questionId] === letter) {
          delete next[questionId];
        }
      }
      next[q.id] = letter;

      const groupLen = currentNavGroup.indices.length;
      let nextSub = currentSubIndex;
      for (let i = currentSubIndex + 1; i < groupLen; i += 1) {
        const idx = currentNavGroup.indices[i];
        if (!next[paper.questions[idx].id]) {
          nextSub = i;
          break;
        }
      }
      if (nextSub === currentSubIndex && currentSubIndex < groupLen - 1) {
        nextSub = currentSubIndex + 1;
      }
      setActiveSubIndex(nextSub);

      return next;
    });
  };

  const handleNext = () => {
    if (currentNavGroupIndex < examNavGroups.length - 1) {
      setActiveSubIndex(0);
      setCurrentQuestionIndex(examNavGroups[currentNavGroupIndex + 1].indices[0]);
    }
  };

  const handlePrevious = () => {
    if (currentNavGroupIndex > 0) {
      const prevGroup = examNavGroups[currentNavGroupIndex - 1];
      setActiveSubIndex(0);
      setCurrentQuestionIndex(prevGroup.indices[0]);
    }
  };

  const submitAnswers = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    void onFinish(answers)
      .then((submitted) => {
        if (!submitted) submittedRef.current = false;
      })
      .catch(() => {
        submittedRef.current = false;
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleSubmit = () => {
    if (isExpired) return;
    const unanswered = paper.questions.filter((question) => !question.isExample && !answers[question.id]).length;
    if (unanswered > 0) {
      setSubmitConfirmOpen(true);
      return;
    }
    submitAnswers();
  };

  const confirmIncompleteSubmit = () => {
    setSubmitConfirmOpen(false);
    submitAnswers();
  };

  const playCurrentAudio = async () => {
    const audioUrl = currentQuestion.audioUrl;
    const groupId = currentQuestion.audioGroupId || currentQuestion.id;
    const maxPlayCount = currentQuestion.maxPlayCount || paper.listeningPlays;
    const audioPlayer = audioPlayerRef.current;
    if (isAnsweringClosed || !audioUrl || !audioPlayer || audioPlayer.isActive || (playCounts[groupId] || 0) >= maxPlayCount) return;
    await audioPlayer.play(audioUrl, () => {
      setPlayCounts((counts) => ({ ...counts, [groupId]: (counts[groupId] || 0) + 1 }));
    });
  };

  useEffect(() => {
    if (!isAnsweringClosed && currentQuestion.audioUrl && (playCounts[currentQuestion.audioGroupId || currentQuestion.id] || 0) === 0) {
      void playCurrentAudio();
    }
    return () => {
      audioPlayerRef.current?.stop();
    };
  }, [currentNavGroupIndex, isAnsweringClosed]);

  useEffect(() => {
    if (!isAnsweringClosed) return;
    audioPlayerRef.current?.stop();
  }, [isAnsweringClosed]);

  const isCurrentGroupComplete = isNavGroupComplete(currentNavGroup, paper.questions, answers);
  const isListening = currentQuestion.section === 'listening';
  const isPinyinTextOptions = currentQuestion.displayMode === 'pinyin-text';
  const isImageOptions = !isGroupedQuestion && currentQuestion.displayMode === 'image';
  const currentPartKey = `${currentQuestion.section}-${currentQuestion.partNumber}`;
  const displayedSeconds = isGracePeriod ? graceRemaining : timeRemaining;
  const timeLabel = `${Math.floor(displayedSeconds / 60)}:${(displayedSeconds % 60).toString().padStart(2, '0')}`;
  const examTitle = paper.source === 'official'
    ? `HSK ${paper.level} Official Mock`
    : `HSK ${paper.level} Practice Test`;
  const optionColumns = isImageOptions ? 3 : isPinyinTextOptions ? 2 : Math.min(currentQuestion.options.length, 4);
  const examTeal = '#5BBFAF';
  const isLastGroup = currentNavGroupIndex >= examNavGroups.length - 1;
  const questionHeading = isGroupedQuestion
    ? `${questionLabel(groupQuestions[0])}–${questionLabel(groupQuestions[groupQuestions.length - 1])}`
    : currentQuestion.isExample ? 'Example' : String(currentQuestion.number);
  const unansweredCount = paper.questions.filter((question) => !question.isExample && !answers[question.id]).length;
  const speakerButtonSx = {
    width: p(120),
    height: p(80),
    borderRadius: `${p(50)}px`,
    background: 'linear-gradient(122.84deg, #FF6B35 9.46%, #FF926A 67.15%, #FFB99F 90.54%)',
    color: '#FFFFFF',
    '&:active': { transform: 'scale(0.96)', filter: 'brightness(0.96)' },
    '&.Mui-disabled': { opacity: 0.45 },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F6F7F9', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          height: p(160),
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ position: 'absolute', left: p(47), top: '50%', transform: 'translateY(-50%)' }}>
          <HskPrepBackButton
            onClick={() => {
              if (!submitting) onExit();
            }}
            disabled={submitting}
            sx={{ width: p(80), height: p(80), '& .MuiSvgIcon-root': { fontSize: p(40) } }}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: `${p(58)}px`,
              color: '#292E2E',
            }}
          >
            {examTitle}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: `${p(8)}px`, pointerEvents: 'auto' }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontSize: p(24),
                lineHeight: `${p(24)}px`,
                color: isCriticalTime && !timeHidden ? '#DC2626' : '#6E6E73',
                fontWeight: isCriticalTime && !timeHidden ? 700 : 400,
              }}
            >
              {isExpired
                ? 'Time expired'
                : `${isGracePeriod ? 'Grace period' : 'Time left'}: ${timeHidden ? '--:--' : timeLabel}`}
            </Typography>
            <ButtonBase
              onClick={handleToggleTimeVisibility}
              aria-label={timeHidden ? 'Show time remaining' : 'Hide time remaining'}
              sx={{
                width: p(44),
                height: p(44),
                borderRadius: `${p(12)}px`,
                color: '#6E6E73',
                '&:active': { bgcolor: '#F3F4F6' },
              }}
            >
              {timeHidden ? (
                <VisibilityOffIcon sx={{ fontSize: p(22) }} />
              ) : (
                <VisibilityIcon sx={{ fontSize: p(22) }} />
              )}
            </ButtonBase>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            right: p(59),
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: `${p(37)}px`,
          }}
        >
          <ButtonBase
            onClick={() => openFeedback({ screen: 'hsk_exam', force: true })}
            aria-label="Feedback"
            sx={{
              width: p(80),
              height: p(80),
              borderRadius: `${p(18)}px`,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              color: '#636E72',
              '&:active': { bgcolor: '#F9FAFB' },
            }}
          >
            <Box component="svg" viewBox="0 0 37 40" sx={{ width: p(37), height: p(40), display: 'block' }}>
              <rect x="1.5" y="3" width="32" height="34" rx="7" fill="none" stroke="#636E72" strokeWidth="5" />
              <rect x="8" y="16" width="12" height="4" rx="2" fill="#636E72" />
              <rect x="8" y="23" width="16" height="4" rx="2" fill="#636E72" />
              <rect x="20" y="0" width="22" height="5" rx="2.5" fill="#636E72" transform="rotate(-53.47 22 2)" />
            </Box>
          </ButtonBase>
          <ButtonBase
            onClick={handleSubmit}
            disabled={isExpired || submitting}
            sx={{
              width: p(186),
              height: p(90),
              bgcolor: '#F3F4F6',
              color: '#636E72',
              borderRadius: `${p(50)}px`,
              fontFamily: FIGMA_FONT,
              fontWeight: 600,
              fontSize: p(32),
              '&:active': { bgcolor: '#E8EAED' },
              '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#C5C9CE' },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </ButtonBase>
        </Box>
      </Box>

      {error && (
        <Box role="alert" sx={{ flexShrink: 0, px: 3, py: 1, bgcolor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
          <Typography sx={{ color: '#B91C1C', fontWeight: 700 }}>{error}</Typography>
        </Box>
      )}

      <Dialog
        open={submitConfirmOpen}
        onClose={() => {
          if (!submitting) setSubmitConfirmOpen(false);
        }}
        aria-labelledby="incomplete-submit-title"
        PaperProps={{
          sx: {
            position: 'relative',
            overflow: 'visible',
            width: p(687),
            maxWidth: p(687),
            height: p(428),
            m: 0,
            borderRadius: `${p(64)}px`,
            bgcolor: '#FFFFFF',
            border: '2px solid #E0E0DF',
            boxShadow: '0px 0px 5.8px rgba(0, 180, 160, 0.6)',
            boxSizing: 'border-box',
          },
        }}
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(15, 23, 42, 0.45)' },
          },
        }}
      >
        {/* Soft green glows */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: p(215),
              height: p(215),
              left: p(-7),
              top: p(-35),
              borderRadius: '50%',
              bgcolor: 'rgba(205, 254, 150, 0.39)',
              filter: 'blur(70px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: p(215),
              height: p(215),
              right: p(-20),
              top: p(-70),
              borderRadius: '50%',
              bgcolor: '#C1FFDE',
              filter: 'blur(70px)',
            },
          }}
        />

        {/* Teal ring décor (left) */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: p(-20),
            top: p(40),
            width: p(93),
            height: p(61),
            borderRadius: '50%',
            border: `${p(15)}px solid #24D3B6`,
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            transform: 'matrix(0.9, -0.44, 0.53, 0.85, 0, 0)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Top mascot badge */}
        <Box
          sx={{
            position: 'absolute',
            top: p(-56),
            left: '50%',
            transform: 'translateX(-50%)',
            width: p(149),
            height: p(149),
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 4px 5.3px 1px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src="/images/clingo-ai-mascot-think.png"
            alt=""
            sx={{ width: '88%', height: '88%', objectFit: 'contain' }}
          />
        </Box>

        <ButtonBase
          disabled={submitting}
          onClick={() => setSubmitConfirmOpen(false)}
          aria-label="Close"
          sx={{
            position: 'absolute',
            top: p(28),
            right: p(28),
            width: p(56),
            height: p(56),
            borderRadius: '50%',
            color: '#98A2B3',
            zIndex: 3,
            '&:active': { bgcolor: '#F3F4F6' },
          }}
        >
          <CloseIcon sx={{ fontSize: p(32) }} />
        </ButtonBase>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: `${p(120)}px`,
            px: `${p(48)}px`,
            pb: `${p(40)}px`,
            boxSizing: 'border-box',
          }}
        >
          <Typography
            id="incomplete-submit-title"
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 500,
              fontSize: p(36),
              lineHeight: `${p(52)}px`,
              textAlign: 'center',
              color: '#000000',
              mb: `${p(14)}px`,
            }}
          >
            Submit incomplete exam?
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 500,
              fontSize: p(24),
              lineHeight: `${p(35)}px`,
              textAlign: 'center',
              color: '#636E72',
              mb: 'auto',
              maxWidth: p(471),
            }}
          >
            {unansweredCount} questions are unanswered and will receive 0 points.
          </Typography>

          <Box sx={{ display: 'flex', gap: `${p(43)}px`, width: '100%', justifyContent: 'center', mt: `${p(28)}px` }}>
            <ButtonBase
              disabled={submitting}
              onClick={() => setSubmitConfirmOpen(false)}
              sx={{
                width: p(275),
                height: p(68),
                borderRadius: `${p(50)}px`,
                bgcolor: '#EFEFEF',
                color: '#666666',
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: `${p(50)}px`,
                '&.Mui-disabled': { opacity: 0.55 },
                '&:active': { transform: 'scale(0.98)', bgcolor: '#E5E7EB' },
              }}
            >
              Cancel
            </ButtonBase>
            <ButtonBase
              disabled={submitting}
              onClick={confirmIncompleteSubmit}
              sx={{
                width: p(275),
                height: p(68),
                borderRadius: `${p(100)}px`,
                background: 'linear-gradient(143.15deg, #25CCA8 31.97%, #61E2D4 94.64%)',
                color: '#FFFFFF',
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: p(32),
                lineHeight: `${p(50)}px`,
                '&.Mui-disabled': { opacity: 0.55 },
                '&:active': { transform: 'scale(0.98)', filter: 'brightness(0.96)' },
              }}
            >
              {submitting ? 'Submitting…' : 'Confirm'}
            </ButtonBase>
          </Box>
        </Box>
      </Dialog>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', width: '100%' }}>
        {/* Sidebar — progress grid (collapsible) */}
        <Box
          sx={{
            width: progressOpen ? p(420) : 0,
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            borderRight: progressOpen ? '1px solid #E6EBF0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: p(420),
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              px: `${p(36)}px`,
              pt: `${p(28)}px`,
              pb: `${p(24)}px`,
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: `${p(20)}px` }}>
              <ButtonBase
                onClick={() => setProgressOpen(false)}
                aria-label="Hide progress panel"
                sx={{
                  width: p(80),
                  height: p(80),
                  borderRadius: `${p(16)}px`,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0DF',
                  color: '#636E72',
                  '&:active': { bgcolor: '#F9FAFB' },
                }}
              >
                <ViewListIcon sx={{ fontSize: p(46) }} />
              </ButtonBase>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {sidebarSections.map(({ section, parts }) => {
                const Icon = SECTION_ICONS[section];
                const sectionActive = parts.some((part) => part.key === currentPartKey);
                return (
                  <Box key={section} sx={{ mb: `${p(28)}px` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(18)}px` }}>
                      <Box
                        sx={{
                          width: p(10),
                          height: p(50),
                          borderRadius: `${p(5)}px`,
                          background: sectionActive
                            ? 'linear-gradient(180deg, #00B8A6 0%, #19DAC7 100%)'
                            : '#D1DBE6',
                          flexShrink: 0,
                        }}
                      />
                      <Icon sx={{ fontSize: p(28), color: sectionActive ? '#00B4A0' : '#A5B0BA' }} />
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 700,
                          fontSize: p(30),
                          lineHeight: `${p(43)}px`,
                          color: sectionActive ? '#00B8A6' : '#636E72',
                        }}
                      >
                        {SECTION_ZH[section]}
                      </Typography>
                    </Box>
                    {parts.map((group) => (
                      <Box key={group.key} sx={{ mb: `${p(18)}px` }}>
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontWeight: 600,
                            fontSize: p(24),
                            lineHeight: `${p(29)}px`,
                            color: '#A5B0BA',
                            mb: `${p(14)}px`,
                          }}
                        >
                          {`Part ${group.title.match(/\d+/)?.[0] ?? group.section}`}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: `${p(12)}px` }}>
                          {buildSidebarSlots(group.indices, paper.questions).map((slot) => {
                            const isCurrent = slot.indices.includes(currentQuestionIndex);
                            const scoredIndices = slot.indices.filter((idx) => !paper.questions[idx].isExample);
                            const hasAnswer = scoredIndices.length === 0 || scoredIndices.every((idx) => !!answers[paper.questions[idx].id]);
                            const partiallyAnswered = !hasAnswer && scoredIndices.some((idx) => !!answers[paper.questions[idx].id]);
                            return (
                              <ButtonBase
                                key={slot.label}
                                onClick={() => {
                                  setActiveSubIndex(0);
                                  setCurrentQuestionIndex(slot.indices[0]);
                                }}
                                sx={{
                                  gridColumn: slot.kind === 'range' ? '1 / -1' : undefined,
                                  width: slot.kind === 'range' ? '100%' : p(71),
                                  height: slot.kind === 'range' ? p(70) : p(69),
                                  borderRadius: slot.kind === 'range' ? `${p(35)}px` : `${p(15)}px`,
                                  background: isCurrent
                                    ? 'linear-gradient(140.83deg, #1CCFBD 62.39%, #37E7D4 94.83%)'
                                    : hasAnswer
                                      ? '#D8F6F1'
                                      : partiallyAnswered
                                        ? '#EEF8F6'
                                        : '#F5F7FA',
                                  color: isCurrent ? '#FFFFFF' : hasAnswer || partiallyAnswered ? '#0F766E' : '#99ABBF',
                                  border: isCurrent ? 'none' : '1px solid #D1DBE6',
                                  fontFamily: FIGMA_FONT,
                                  fontWeight: 400,
                                  fontSize: p(32),
                                  '&:active': { transform: 'scale(0.98)' },
                                }}
                              >
                                {slot.label}
                              </ButtonBase>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Main question area — expands when sidebar collapsed */}
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: `${p(56)}px`, pt: `${p(32)}px`, pb: `${p(24)}px`, width: '100%', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(28)}px` }}>
              {!progressOpen && (
                <ButtonBase
                  onClick={() => setProgressOpen(true)}
                  aria-label="Show progress panel"
                  sx={{
                    width: p(80),
                    height: p(80),
                    borderRadius: `${p(16)}px`,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E0E0DF',
                    color: '#636E72',
                    flexShrink: 0,
                    '&:active': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <ViewListIcon sx={{ fontSize: p(46) }} />
                </ButtonBase>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px`, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(28),
                    lineHeight: `${p(38)}px`,
                    color: '#1D1D1F',
                    flexShrink: 0,
                  }}
                >
                  {questionHeading}
                </Typography>
                {isImageOptions && currentQuestion.question ? (
                  <>
                    <Box sx={{ width: p(7), height: p(7), borderRadius: '50%', bgcolor: '#636E72', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 700,
                        fontSize: p(28),
                        lineHeight: `${p(38)}px`,
                        color: '#1D1D1F',
                      }}
                    >
                      {currentQuestion.question}
                    </Typography>
                  </>
                ) : null}
                {currentQuestion.isExample && (
                  <Box sx={{ px: `${p(12)}px`, py: `${p(4)}px`, borderRadius: `${p(8)}px`, bgcolor: '#E0F2FE', border: '1px solid #7DD3FC' }}>
                    <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(18), fontWeight: 700, color: '#0369A1', lineHeight: 1.2 }}>
                      Example · not scored
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {isImageMatchGroup ? (
              <Box>
                {isListening && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: `${p(40)}px` }}>
                    <ButtonBase
                      onClick={playCurrentAudio}
                      disabled={isAnsweringClosed}
                      sx={speakerButtonSx}
                    >
                      <VolumeUpIcon sx={{ fontSize: p(44) }} />
                    </ButtonBase>
                  </Box>
                )}
              <Box sx={{ display: 'flex', gap: is960 ? 2 : 2.5, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box
                  sx={{
                    flex: 1.15,
                    minWidth: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: is960 ? 1 : 1.25,
                  }}
                >
                  {matchImages.map((imageSrc, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const assignedQuestion = groupQuestions.find((gq) => answers[gq.id] === letter);
                    const isAssigned = !!assignedQuestion;
                    return (
                      <ButtonBase
                        key={letter}
                        onClick={() => handleAssignMatchLetter(letter)}
                        disabled={isAnsweringClosed || currentQuestion.isExample}
                        sx={{
                          position: 'relative',
                          aspectRatio: '1',
                          bgcolor: '#FFFFFF',
                          border: isAssigned ? `2px solid ${examTeal}` : '2px solid #E5E7EB',
                          borderRadius: is960 ? '14px' : '18px',
                          overflow: 'hidden',
                          boxShadow: isAssigned ? '0 4px 14px rgba(91,191,175,0.2)' : '0 2px 8px rgba(15,23,42,0.04)',
                          opacity: isAssigned && answers[groupQuestions[currentSubIndex]?.id] !== letter ? 0.88 : 1,
                          '&:active': { transform: 'scale(0.98)', borderColor: examTeal },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: is960 ? 8 : 10,
                            left: is960 ? 8 : 10,
                            width: is960 ? 26 : 30,
                            height: is960 ? 26 : 30,
                            borderRadius: '7px',
                            bgcolor: '#F1F5F9',
                            color: '#64748B',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: is960 ? '0.78rem' : '0.88rem',
                            zIndex: 1,
                          }}
                        >
                          {letter}
                        </Box>
                        <Box
                          component="img"
                          src={imageSrc}
                          alt={`Option ${letter}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: is960 ? 1.75 : 2,
                            boxSizing: 'border-box',
                          }}
                        />
                      </ButtonBase>
                    );
                  })}
                </Box>

                <Box sx={{ flex: 1, minWidth: is960 ? 260 : 320, display: 'flex', flexDirection: 'column', gap: is960 ? 0.85 : 1 }}>
                  {groupQuestions.map((q, subIdx) => {
                    const subAnswer = answers[q.id];
                    const isActive = currentSubIndex === subIdx;
                    return (
                      <ButtonBase
                        key={q.id}
                        onClick={() => setActiveSubIndex(subIdx)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: 'flex-start',
                          width: '100%',
                          textAlign: 'left',
                        }}
                      >
                          <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.05rem', fontWeight: 800, color: '#374151', minWidth: 28 }}>
                          {questionLabel(q)}{q.isExample ? '' : '.'}
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            minHeight: is960 ? 44 : 48,
                            borderRadius: '999px',
                            bgcolor: isActive ? '#FFFFFF' : '#F1F5F9',
                            border: isActive ? `2px solid ${examTeal}` : '2px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: is960 ? 1 : 1.25,
                            px: is960 ? 1.25 : 1.5,
                            boxShadow: isActive ? '0 4px 12px rgba(91,191,175,0.15)' : 'none',
                          }}
                        >
                          <Typography
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: is960 ? '0.82rem' : '0.92rem',
                              fontWeight: 700,
                              color: '#374151',
                              lineHeight: 1.35,
                              textAlign: 'left',
                              wordBreak: 'break-word',
                            }}
                          >
                            {q.question || '—'}
                          </Typography>
                          <Box
                            sx={{
                              flexShrink: 0,
                              minWidth: is960 ? 30 : 34,
                              height: is960 ? 28 : 30,
                              px: 0.75,
                              borderRadius: '999px',
                              bgcolor: subAnswer ? '#CCFBF1' : '#F8FAFC',
                              border: subAnswer ? '1px solid #5EEAD4' : '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.9rem', fontWeight: 900, color: subAnswer ? '#0F766E' : '#CBD5E1' }}>
                              {subAnswer || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
              </Box>
            ) : isTextCompositeGroup ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 2 : 2.5, maxWidth: 900 }}>
                {groupQuestions[0]?.sharedPrompt && (
                  <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.02rem', fontWeight: 600, color: '#64748B', lineHeight: 1.45 }}>
                    {groupQuestions[0].sharedPrompt}
                  </Typography>
                )}

                {isListening && currentQuestion.audioUrl && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ButtonBase
                      onClick={playCurrentAudio}
                      disabled={isAnsweringClosed}
                      sx={speakerButtonSx}
                    >
                      <VolumeUpIcon sx={{ fontSize: p(44) }} />
                    </ButtonBase>
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.75 : 1 }}>
                  {groupQuestions.map((q, subIdx) => {
                    const isActive = currentSubIndex === subIdx;
                    const answered = !!answers[q.id];
                    return (
                      <ButtonBase
                        key={q.id}
                        onClick={() => setActiveSubIndex(subIdx)}
                        sx={{
                          minWidth: is960 ? 44 : 48,
                          minHeight: is960 ? 44 : 48,
                          px: 1.25,
                          borderRadius: '12px',
                          bgcolor: isActive ? '#3B82F6' : answered ? '#DBEAFE' : '#F1F5F9',
                          color: isActive ? '#FFFFFF' : answered ? '#2563EB' : '#64748B',
                          fontWeight: 800,
                          fontSize: is960 ? '0.85rem' : '0.95rem',
                          border: isActive ? 'none' : '1px solid #E2E8F0',
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        {questionLabel(q)}
                      </ButtonBase>
                    );
                  })}
                </Box>

                <Typography
                  sx={{
                    fontSize: is960 ? '1.15rem' : '1.35rem',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.45,
                  }}
                >
                  {currentQuestion.isExample ? 'Example' : `${currentQuestion.number}.`} {currentQuestion.question}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(currentQuestion.options.length, 4)}, minmax(0, 1fr))`,
                    gap: is960 ? 1.25 : 1.75,
                  }}
                >
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <ButtonBase
                        key={idx}
                        onClick={() => handleSelectAnswer(option, currentQuestion.id)}
                        disabled={isAnsweringClosed || currentQuestion.isExample}
                        sx={{
                          position: 'relative',
                          minHeight: is960 ? 120 : 148,
                          bgcolor: '#FFFFFF',
                          border: isSelected ? `3px solid ${examTeal}` : '2px solid #E5E7EB',
                          borderRadius: is960 ? '16px' : '20px',
                          boxShadow: isSelected ? '0 8px 24px rgba(91,191,175,0.18)' : '0 2px 8px rgba(15,23,42,0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: is960 ? 1.5 : 2,
                          textAlign: 'center',
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: is960 ? 10 : 12,
                            left: is960 ? 10 : 12,
                            width: is960 ? 28 : 32,
                            height: is960 ? 28 : 32,
                            borderRadius: '8px',
                            bgcolor: isSelected ? examTeal : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: is960 ? '0.82rem' : '0.92rem',
                          }}
                        >
                          {letter}
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: is960 ? '0.95rem' : '1.08rem',
                            color: isSelected ? '#0F766E' : '#374151',
                            lineHeight: 1.35,
                            px: 1,
                          }}
                        >
                          {currentQuestion.optionTextByValue?.[option] || option}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <>
                {currentQuestion.question && !isImageOptions ? (
                  <Typography
                    sx={{
                      fontSize: is960 ? '1.15rem' : '1.35rem',
                      fontWeight: 800,
                      color: '#111827',
                      mb: isListening ? (is960 ? 1.5 : 2) : (is960 ? 2.5 : 3),
                      lineHeight: 1.45,
                      maxWidth: 900,
                    }}
                  >
                    {currentQuestion.question}
                  </Typography>
                ) : null}

                {isListening && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: `${p(40)}px` }}>
                    <ButtonBase
                      onClick={playCurrentAudio}
                      disabled={isAnsweringClosed}
                      sx={speakerButtonSx}
                    >
                      <VolumeUpIcon sx={{ fontSize: p(44) }} />
                    </ButtonBase>
                  </Box>
                )}

                {currentQuestion.displayMode === 'writing' ? (
                  <TextField
                    value={selectedAnswer || ''}
                    onChange={(event) => handleSelectAnswer(event.target.value)}
                    disabled={isAnsweringClosed || currentQuestion.isExample}
                    placeholder="请输入答案"
                    multiline
                    minRows={3}
                    fullWidth
                    inputProps={{ 'aria-label': `Answer question ${currentQuestion.number}` }}
                  />
                ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: isImageOptions
                      ? `repeat(${currentQuestion.options.length}, ${p(360)}px)`
                      : `repeat(${optionColumns}, minmax(0, 1fr))`,
                    gap: isImageOptions ? `${p(64)}px` : (is960 ? 1.25 : 1.75),
                    justifyContent: isImageOptions ? 'center' : 'stretch',
                    maxWidth: isImageOptions ? 'none' : isPinyinTextOptions ? 560 : optionColumns >= 4 ? '100%' : 720,
                    mx: isImageOptions || isPinyinTextOptions ? 'auto' : 0,
                  }}
                >
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const letter = String.fromCharCode(65 + idx);
                    const imageSrc = currentQuestion.optionImages?.[idx];
                    const pinyinLabel = currentQuestion.optionLabels?.[idx];
                    return (
                      <ButtonBase
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={isAnsweringClosed || currentQuestion.isExample}
                        sx={{
                          position: 'relative',
                          width: isImageOptions ? p(360) : '100%',
                          height: isImageOptions ? p(360) : undefined,
                          aspectRatio: isImageOptions ? undefined : isPinyinTextOptions ? '1.15 / 1' : '1',
                          minHeight: isImageOptions
                            ? undefined
                            : is960
                              ? (isPinyinTextOptions ? 132 : 120)
                              : (isPinyinTextOptions ? 156 : 148),
                          bgcolor: '#FFFFFF',
                          border: isImageOptions
                            ? (isSelected ? '1.5px solid transparent' : '1.5px solid #DDE4EA')
                            : isSelected ? `3px solid ${examTeal}` : '2px solid #E5E7EB',
                          borderRadius: isImageOptions ? `${p(48)}px` : (is960 ? '16px' : '20px'),
                          boxShadow: isSelected
                            ? (isImageOptions ? '0px 0px 24px #BBD8D5' : '0 8px 24px rgba(91,191,175,0.18)')
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          p: isImageOptions ? 0 : (is960 ? 1.5 : 2),
                          textAlign: 'center',
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        {!isPinyinTextOptions && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: isImageOptions ? p(28) : (is960 ? 10 : 12),
                              left: isImageOptions ? p(31) : (is960 ? 10 : 12),
                              width: isImageOptions ? p(60) : (is960 ? 28 : 32),
                              height: isImageOptions ? p(60) : (is960 ? 28 : 32),
                              borderRadius: isImageOptions ? `${p(36)}px` : '8px',
                              background: isSelected
                                ? (isImageOptions
                                  ? 'linear-gradient(143.15deg, #25CCA8 31.97%, #61E2D4 94.64%)'
                                  : examTeal)
                                : '#F3F4F6',
                              color: isSelected ? '#FFFFFF' : '#2D3436',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: FIGMA_FONT,
                              fontWeight: 600,
                              fontSize: isImageOptions ? p(32) : (is960 ? '0.82rem' : '0.92rem'),
                              zIndex: 1,
                              border: isSelected ? 'none' : '1px solid #E0E0DF',
                            }}
                          >
                            {letter}
                          </Box>
                        )}
                        {isImageOptions && imageSrc ? (
                          <Box
                            sx={{
                              width: p(279),
                              height: p(236),
                              borderRadius: `${p(26)}px`,
                              overflow: 'hidden',
                              bgcolor: '#FFFFFF',
                              mt: `${p(36)}px`,
                            }}
                          >
                            <Box
                              component="img"
                              src={imageSrc}
                              alt={`Option ${letter}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </Box>
                        ) : isPinyinTextOptions && pinyinLabel ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: is960 ? 0.75 : 1, px: 1 }}>
                            <Typography
                              sx={{
                                fontSize: is960 ? '0.88rem' : '1rem',
                                fontWeight: 600,
                                color: '#64748B',
                                lineHeight: 1.3,
                              }}
                            >
                              {pinyinLabel.pinyin}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: is960 ? '1.2rem' : '1.42rem',
                                fontWeight: 800,
                                color: isSelected ? '#0F766E' : '#111827',
                                lineHeight: 1.25,
                              }}
                            >
                              {pinyinLabel.text}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: is960 ? '0.95rem' : '1.08rem',
                              color: isSelected ? '#0F766E' : '#374151',
                              lineHeight: 1.35,
                              px: 1,
                            }}
                          >
                          {currentQuestion.optionTextByValue?.[option] || option}
                          </Typography>
                        )}
                      </ButtonBase>
                    );
                  })}
                </Box>
                )}
              </>
            )}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              width: '100%',
              height: p(180),
              px: `${p(56)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #E8ECEF',
              bgcolor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
          >
            <ButtonBase
              onClick={handlePrevious}
              disabled={currentNavGroupIndex <= 0}
              sx={{
                width: p(250),
                height: p(76),
                bgcolor: '#FFFFFF',
                color: currentNavGroupIndex > 0 ? '#6E6E73' : '#C5C9CE',
                border: '1px solid #E5E7EB',
                borderRadius: `${p(38)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(8)}px`,
                '&.Mui-disabled': { color: '#C5C9CE', borderColor: '#E5E7EB' },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: p(22) }} />
              Previous
            </ButtonBase>

            <ButtonBase
              onClick={isLastGroup ? handleSubmit : handleNext}
              disabled={isLastGroup ? isExpired || submitting : !isCurrentGroupComplete}
              sx={{
                width: p(250),
                height: p(76),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(8)}px`,
                background: ((isLastGroup && !isExpired) || isCurrentGroupComplete)
                  ? 'linear-gradient(97.48deg, #00B4A0 9.75%, #26D6C3 89.59%, #37E7D4 97.62%)'
                  : '#E5E7EB',
                color: ((isLastGroup && !isExpired) || isCurrentGroupComplete) ? '#FFFFFF' : '#9CA3AF',
                borderRadius: `${p(38)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                '&:active': ((isLastGroup && !isExpired) || isCurrentGroupComplete)
                  ? { transform: 'scale(0.97)', filter: 'brightness(0.96)' }
                  : {},
                '&.Mui-disabled': { background: '#E5E7EB', color: '#9CA3AF' },
              }}
            >
              {isLastGroup ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}
              <ChevronRightIcon sx={{ fontSize: p(22) }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function readableReviewValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(readableReviewValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['zh', 'zh-CN', 'en', 'text', 'answer', 'value', 'content']) {
      const text = readableReviewValue(record[key]);
      if (text) return text;
    }
    return Object.values(record).map(readableReviewValue).filter(Boolean).join(', ');
  }
  return '';
}

function answerContains(answer: unknown, value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (Array.isArray(answer)) return answer.some((item) => answerContains(item, value));
  if (answer && typeof answer === 'object') {
    return Object.values(answer as Record<string, unknown>).some((item) => answerContains(item, value));
  }
  return String(answer ?? '').trim().toLowerCase() === normalized;
}

const RESULT_SECTION_ICONS: Record<ExamSectionKind, typeof HeadphonesIcon> = {
  ...SECTION_ICONS,
  writing: BorderColorOutlinedIcon,
};

/** Figma「成绩反馈」分数卡色（2508 稿） */
const RESULT_MODULE_THEMES: Record<ExamSectionKind, { tileBg: string; iconBg: string; accent: string }> = {
  listening: { tileBg: '#E4FFFE', iconBg: 'rgba(26,162,203,0.12)', accent: '#1AA2CB' },
  reading: { tileBg: '#E6FFF6', iconBg: 'rgba(0,180,160,0.12)', accent: '#00B4A0' },
  writing: { tileBg: '#F5F3FF', iconBg: 'rgba(117,133,216,0.12)', accent: '#7585D8' },
};

const RESULT_FIGMA_W = 2508;
/** 成绩页稿宽 2508 → 产品 1920 再经 figmaPx */
const resultPx = (n: number, screenSize: string) => figmaPx((n * 1920) / RESULT_FIGMA_W, screenSize);

function resolveModuleKind(module: { moduleId: string; moduleName: string }): ExamSectionKind | null {
  const id = module.moduleId.toLowerCase();
  const name = module.moduleName.toLowerCase();
  if (id.includes('listen') || name.includes('listen') || name.includes('听力')) return 'listening';
  if (id.includes('read') || name.includes('read') || name.includes('阅读')) return 'reading';
  if (id.includes('writ') || name.includes('writ') || name.includes('书写')) return 'writing';
  return null;
}

function formatModuleScoreValue(
  module: { score?: number | null; correctCount: number; incorrectCount: number; unansweredCount: number },
  scoringMode: AttemptResult['scoringMode'],
): string {
  if (scoringMode === 'equal_ratio') {
    const total = module.correctCount + module.incorrectCount + module.unansweredCount;
    return `${module.correctCount}/${total}`;
  }
  return String(module.score ?? 0);
}

type ReviewStatusItem = AttemptReviewItem | AttemptReviewSummaryItem;

interface ReviewGroup<T extends ReviewStatusItem> {
  id: string;
  label: string;
  items: T[];
  correct: boolean;
  unanswered: boolean;
}

function buildReviewGroups<T extends ReviewStatusItem>(items: T[]): ReviewGroup<T>[] {
  const grouped = new Map<string, T[]>();
  items.forEach((item) => {
    const key = item.parentUid || item.itemUid;
    grouped.set(key, [...(grouped.get(key) || []), item]);
  });
  return Array.from(grouped.entries()).map(([id, groupItems]) => {
    const numbers = groupItems.map((item) => item.questionNumber).filter((value): value is number => typeof value === 'number');
    const first = numbers.length ? Math.min(...numbers) : undefined;
    const last = numbers.length ? Math.max(...numbers) : undefined;
    return {
      id,
      label: first === undefined ? id : first === last ? String(first) : `${first}-${last}`,
      items: groupItems,
      correct: groupItems.length > 0 && groupItems.every((item) => item.correct === true),
      unanswered: groupItems.every((item) => item.unanswered),
    };
  });
}

function ResultScreen({
  paper,
  result,
  review,
  reviewError,
  reviewLoading,
  reviewOpening,
  retakeAvailable,
  retakeError,
  onOpenReview,
  onRestart,
  onGoHome,
  screenSize,
}: {
  paper: ExamPaper;
  result: AttemptResult;
  review: AttemptReview | null;
  reviewError: string | null;
  reviewLoading: boolean;
  reviewOpening: boolean;
  retakeAvailable: boolean | null;
  retakeError: string | null;
  onOpenReview: (itemUid?: string) => void;
  onRestart: () => void;
  onGoHome: () => void;
  screenSize: string;
}) {
  const { t } = useTranslation();
  const { openFeedback } = useFeedback();
  const p = (n: number) => resultPx(n, screenSize);
  /** 顶栏控件跟 AI Chat / 考试壳同用 1920 稿，不用成绩页 2508→1920 换算 */
  const chrome = (n: number) => figmaPx(n, APP_SCREEN_SIZE);
  const reviewStatusItems: ReviewStatusItem[] = result.reviewSummary?.length
    ? result.reviewSummary
    : review?.items || [];
  const groups = buildReviewGroups(reviewStatusItems);
  const moduleScores = result.moduleScores || [];
  const passed = Boolean(result.passed);
  const scoreRate = Math.round(Number(result.scoreRate || 0));
  const totalQuestions =
    (result.correctCount ?? 0) + (result.incorrectCount ?? 0) + (result.unansweredCount ?? 0) ||
    paper.questionCount;
  const durationSeconds = Math.max(0, Number(result.durationSeconds || 0));
  const durationMinutes = Math.floor(durationSeconds / 60);
  const durationRemainder = durationSeconds % 60;
  const scoreColor = passed ? '#13C377' : '#F34D47';

  const moduleByKind = new Map<ExamSectionKind, (typeof moduleScores)[number]>();
  moduleScores.forEach((module) => {
    const kind = resolveModuleKind(module);
    if (kind) moduleByKind.set(kind, module);
  });

  const writingModule = moduleByKind.get('writing');
  const showWriting =
    Boolean(writingModule) &&
    writingModule!.correctCount + writingModule!.incorrectCount + writingModule!.unansweredCount > 0;

  const moduleOrder: ExamSectionKind[] = showWriting
    ? ['listening', 'reading', 'writing']
    : ['listening', 'reading'];

  const glassCard = {
    bgcolor: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: `${p(40)}px`,
    boxSizing: 'border-box' as const,
  };

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#F0F4F2',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', pointerEvents: 'none', inset: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            left: '-8%',
            bottom: '-2%',
            width: '28%',
            height: '42%',
            bgcolor: 'rgba(205,254,150,0.48)',
            filter: `blur(${p(112)}px)`,
            borderRadius: '50%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: '12%',
            bottom: '-13%',
            width: '28%',
            height: '42%',
            bgcolor: '#DDF8E9',
            filter: `blur(${p(112)}px)`,
            borderRadius: '50%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: '-4%',
            top: '-5%',
            width: '26%',
            height: '40%',
            bgcolor: 'rgba(213,247,223,0.85)',
            filter: `blur(${p(112)}px)`,
            borderRadius: '50%',
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: `${p(74)}px`,
          pt: `${p(56)}px`,
          pb: `${p(40)}px`,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <HskPrepBackButton
            onClick={onGoHome}
            sx={{
              width: chrome(80),
              height: chrome(80),
              bgcolor: 'rgba(255,255,255,0.66)',
              border: '2px solid rgba(255,255,255,0.9)',
              boxShadow: 'none',
            }}
          />
          <ButtonBase
            onClick={() => openFeedback({ screen: 'hsk_exam_result', paperId: paper.id, force: true })}
            aria-label="Feedback"
            title="Feedback"
            sx={{
              width: chrome(80),
              height: chrome(80),
              minWidth: chrome(80),
              minHeight: chrome(80),
              p: 0,
              borderRadius: `${chrome(18)}px`,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              overflow: 'hidden',
              flexShrink: 0,
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <Box
              component="img"
              src="/images/clingo-ai-mascot-think.png"
              alt=""
              sx={{
                width: '88%',
                height: '88%',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </ButtonBase>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            mt: `${p(28)}px`,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.49fr) minmax(0, 1fr)',
            gap: `${p(84)}px`,
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              ...glassCard,
              p: `${p(48)}px`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                m: 0,
                fontSize: p(47),
                lineHeight: `${p(68)}px`,
                fontWeight: 500,
                color: '#172033',
                fontFamily: FIGMA_FONT,
                flexShrink: 0,
              }}
            >
              {t('hskExamResult.scoreDetails')}
            </Typography>

            <Box
              sx={{
                mt: `${p(28)}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${moduleOrder.length + 1}, minmax(0, 1fr))`,
                gap: `${p(24)}px`,
                flexShrink: 0,
              }}
            >
              {moduleOrder.map((kind) => {
                const module = moduleByKind.get(kind);
                const theme = RESULT_MODULE_THEMES[kind];
                const Icon = RESULT_SECTION_ICONS[kind];
                return (
                  <Box
                    key={kind}
                    sx={{
                      bgcolor: theme.tileBg,
                      border: '1px solid #FFFFFF',
                      borderRadius: `${p(28)}px`,
                      px: `${p(16)}px`,
                      py: `${p(24)}px`,
                      textAlign: 'center',
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: p(52),
                        height: p(52),
                        mx: 'auto',
                        mb: `${p(10)}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.accent,
                      }}
                    >
                      <Icon sx={{ fontSize: p(36) }} />
                    </Box>
                    <Typography
                      sx={{
                        color: theme.accent,
                        fontSize: p(48),
                        fontWeight: 700,
                        lineHeight: `${p(60)}px`,
                        fontFamily: FIGMA_FONT,
                      }}
                    >
                      {module ? formatModuleScoreValue(module, result.scoringMode) : '0'}
                    </Typography>
                    <Typography
                      sx={{
                        mt: `${p(6)}px`,
                        color: '#6B7486',
                        fontSize: p(28),
                        lineHeight: `${p(40)}px`,
                        fontWeight: 400,
                        fontFamily: FIGMA_FONT,
                      }}
                    >
                      {t(`hskExamIntro.sections.${kind}`)}
                    </Typography>
                  </Box>
                );
              })}
              <Box
                sx={{
                  bgcolor: '#FFF6F3',
                  border: '1px solid #FFFFFF',
                  borderRadius: `${p(28)}px`,
                  px: `${p(16)}px`,
                  py: `${p(24)}px`,
                  textAlign: 'center',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: p(52),
                    height: p(52),
                    mx: 'auto',
                    mb: `${p(10)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF6E4D',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: p(36) }} />
                </Box>
                <Typography
                  sx={{
                    color: '#FF6E4D',
                    fontSize: p(48),
                    fontWeight: 700,
                    lineHeight: `${p(60)}px`,
                    fontFamily: FIGMA_FONT,
                  }}
                >
                  {result.correctCount ?? 0}/{totalQuestions}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(6)}px`,
                    color: '#6B7486',
                    fontSize: p(28),
                    lineHeight: `${p(40)}px`,
                    fontWeight: 400,
                    fontFamily: FIGMA_FONT,
                  }}
                >
                  {t('hskExamResult.correctCount')}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: `${p(36)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: `${p(16)}px`,
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  m: 0,
                  fontSize: p(47),
                  lineHeight: `${p(68)}px`,
                  fontWeight: 500,
                  color: '#172033',
                  fontFamily: FIGMA_FONT,
                }}
              >
                {t('hskExamResult.answerReview')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(28)}px`, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(10)}px` }}>
                  <Box sx={{ width: p(18), height: p(18), borderRadius: '50%', bgcolor: '#22C993' }} />
                  <Typography sx={{ fontSize: p(31), lineHeight: `${p(45)}px`, color: '#6B7486', fontFamily: FIGMA_FONT }}>
                    {t('hskExamResult.correct')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(10)}px` }}>
                  <Box sx={{ width: p(18), height: p(18), borderRadius: '50%', bgcolor: '#FF7580' }} />
                  <Typography sx={{ fontSize: p(31), lineHeight: `${p(45)}px`, color: '#6B7486', fontFamily: FIGMA_FONT }}>
                    {t('hskExamResult.incorrect')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {reviewError && (
              <Typography sx={{ color: '#B91C1C', mt: `${p(12)}px`, fontSize: p(28), fontFamily: FIGMA_FONT }}>
                {reviewError}
              </Typography>
            )}

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                mt: `${p(20)}px`,
                overflowY: 'auto',
                border: '2px solid #D8F2E7',
                borderRadius: `${p(32)}px`,
                bgcolor: 'rgba(216,242,231,0.13)',
                p: `${p(24)}px`,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: `${p(18)}px`,
                }}
              >
                {groups.map((group) => {
                  const color = group.unanswered ? '#6B7486' : group.correct ? '#13B67E' : '#F34D47';
                  const bg = group.unanswered ? '#F2F4F7' : group.correct ? '#E8FAF2' : '#FEF1F1';
                  return (
                    <ButtonBase
                      key={group.id}
                      onClick={() => onOpenReview(group.items[0]?.itemUid)}
                      sx={{
                        minHeight: p(120),
                        borderRadius: `${p(24)}px`,
                        bgcolor: bg,
                        color,
                        fontWeight: 600,
                        fontSize: p(40),
                        fontFamily: FIGMA_FONT,
                        touchAction: 'manipulation',
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      {group.label}
                    </ButtonBase>
                  );
                })}
              </Box>
              {!groups.length && reviewLoading && !reviewError && (
                <Typography sx={{ color: '#98A2B3', mt: `${p(12)}px`, fontSize: p(28), fontFamily: FIGMA_FONT }}>
                  {t('hskExamResult.loadingReview')}
                </Typography>
              )}
              {!groups.length && !reviewLoading && !reviewError && (
                <Typography sx={{ color: '#98A2B3', mt: `${p(12)}px`, fontSize: p(28), fontFamily: FIGMA_FONT }}>
                  {t('hskExamResult.noReview')}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              ...glassCard,
              bgcolor: 'rgba(255,255,255,0.8)',
              px: `${p(52)}px`,
              py: `${p(40)}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            <Typography
              sx={{
                m: 0,
                width: '100%',
                textAlign: 'center',
                fontSize: p(48),
                lineHeight: `${p(64)}px`,
                fontWeight: 700,
                color: '#172033',
                fontFamily: FIGMA_FONT,
              }}
            >
              {paper.title}
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: `${p(4)}px`,
                fontSize: p(36),
                lineHeight: `${p(52)}px`,
                fontWeight: 500,
                color: '#172033',
                fontFamily: FIGMA_FONT,
              }}
            >
              Exam score
            </Typography>

            <Box
              sx={{
                mt: `${p(20)}px`,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: `${p(6)}px`,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: p(180),
                  lineHeight: 1,
                  fontWeight: 600,
                  color: scoreColor,
                  fontFamily: FIGMA_FONT,
                  letterSpacing: '-0.03em',
                }}
              >
                {result.score ?? 0}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: p(52),
                  lineHeight: 1,
                  fontWeight: 400,
                  color: '#6B7486',
                  fontFamily: FIGMA_FONT,
                  alignSelf: 'flex-end',
                  pb: `${p(12)}px`,
                }}
              >
                /{result.totalScore}
              </Typography>
            </Box>

            <Box sx={{ width: '78%', maxWidth: p(420), mt: `${p(16)}px` }}>
              <Box sx={{ height: p(12), borderRadius: '999px', bgcolor: '#E7EAF2', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, scoreRate))}%`,
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #19C98E 0%, #26C6B5 55%, #A4B5FF 100%)',
                    transition: 'width 600ms ease',
                  }}
                />
              </Box>
              <Typography
                sx={{
                  mt: `${p(14)}px`,
                  textAlign: 'center',
                  color: '#6B7486',
                  fontSize: p(32),
                  lineHeight: `${p(40)}px`,
                  fontFamily: FIGMA_FONT,
                }}
              >
                {t('hskExamResult.overallScoreRate', { rate: scoreRate })}
              </Typography>
            </Box>

            <Box
              sx={{
                width: '100%',
                mt: `${p(36)}px`,
                px: `${p(40)}px`,
                py: `${p(20)}px`,
                borderRadius: `${p(28)}px`,
                bgcolor: 'rgba(245,246,245,0.82)',
                border: '1px solid #E0E0DF',
                display: 'flex',
                flexDirection: 'column',
                gap: `${p(28)}px`,
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${p(16)}px` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: p(60),
                      height: p(60),
                      borderRadius: `${p(16)}px`,
                      bgcolor: '#E6FAF5',
                      color: '#18BA90',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TaskAltIcon sx={{ fontSize: p(28) }} />
                  </Box>
                  <Typography sx={{ fontSize: p(32), color: '#6B7486', fontFamily: FIGMA_FONT }}>
                    {t('hskExamResult.bestScore')}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: p(36), color: '#12B89E', fontFamily: FIGMA_FONT, flexShrink: 0 }}>
                  {t('hskExamResult.scorePoints', { score: result.bestScore ?? result.score ?? 0 })}
                </Typography>
              </Box>
              <Box sx={{ height: '1px', bgcolor: 'rgba(216,221,234,0.7)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${p(16)}px` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: p(60),
                      height: p(60),
                      borderRadius: `${p(16)}px`,
                      bgcolor: '#F0F2FF',
                      color: '#7585D8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: p(28) }} />
                  </Box>
                  <Typography sx={{ fontSize: p(32), color: '#6B7486', fontFamily: FIGMA_FONT }}>
                    {t('hskExamResult.examDuration')}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: p(36), color: '#6B7486', fontFamily: FIGMA_FONT, flexShrink: 0 }}>
                  {t('hskExamResult.durationFormat', { minutes: durationMinutes, seconds: durationRemainder })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: p(20) }} />

            <ButtonBase
              onClick={() => onOpenReview()}
              disabled={reviewOpening}
              sx={{
                width: '100%',
                height: p(99),
                borderRadius: `${p(50)}px`,
                background: 'linear-gradient(124.11deg, #17CDAE 24.48%, #36E2C0 66.76%, #4FF6E4 94.82%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: p(40),
                fontFamily: FIGMA_FONT,
                position: 'relative',
                '&.Mui-disabled': { opacity: 0.55 },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {reviewOpening
                ? t('hskExamResult.openingDetails')
                : reviewError && !review
                  ? t('hskExamResult.retryDetails')
                  : t('hskExamResult.viewDetails')}
              {!reviewOpening && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: p(36),
                    width: p(48),
                    height: p(48),
                    borderRadius: '50%',
                    bgcolor: 'rgba(73,217,190,0.61)',
                    border: '3px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: p(24), color: '#FFFFFF' }} />
                </Box>
              )}
            </ButtonBase>

            <ButtonBase
              onClick={onRestart}
              disabled={retakeAvailable !== true && !retakeError}
              sx={{
                width: '100%',
                height: p(99),
                mt: `${p(36)}px`,
                borderRadius: `${p(50)}px`,
                bgcolor: 'rgba(238,238,238,0.48)',
                border: '2px solid #E2E3E3',
                color: '#6B7486',
                fontWeight: 700,
                fontSize: p(40),
                fontFamily: FIGMA_FONT,
                '&.Mui-disabled': { color: '#98A2B3' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {retakeError
                ? t('hskExamResult.retryAvailability')
                : retakeAvailable === null
                  ? t('hskExamResult.checkingAvailability')
                  : retakeAvailable
                    ? t('hskExamResult.tryAgain')
                    : t('hskExamResult.noLongerAvailable')}
            </ButtonBase>

            {retakeError && (
              <Typography sx={{ color: '#B42318', fontSize: p(26), mt: `${p(16)}px`, fontFamily: FIGMA_FONT }}>
                {retakeError}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function reviewItemSection(item: AttemptReviewItem): ExamSectionKind {
  const type = (item.questionType || '').toUpperCase();
  if (type.startsWith('L') || type.includes('LISTEN')) return 'listening';
  if (type.startsWith('W') || type.includes('WRIT')) return 'writing';
  const moduleHint = `${item.moduleId || ''} ${item.moduleName || ''} ${item.sectionName || ''}`.toLowerCase();
  if (moduleHint.includes('listen') || moduleHint.includes('听力')) return 'listening';
  if (moduleHint.includes('writ') || moduleHint.includes('书写')) return 'writing';
  return 'reading';
}

function ReviewScreen({
  paper,
  review,
  scoringMode,
  initialItemUid,
  onBack,
}: {
  paper: ExamPaper;
  review: AttemptReview;
  scoringMode: AttemptResult['scoringMode'];
  initialItemUid?: string;
  onBack: () => void;
}) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE);
  const initialIndex = Math.max(0, review.items.findIndex((item) => item.itemUid === initialItemUid));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progressOpen, setProgressOpen] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = review.items[currentIndex];

  const reviewByNumber = useMemo(() => {
    const map = new Map<number, AttemptReviewItem>();
    review.items.forEach((item) => {
      if (typeof item.questionNumber === 'number') map.set(item.questionNumber, item);
    });
    return map;
  }, [review.items]);

  const sidebarGroups = useMemo(() => {
    const groups: Array<{ key: string; title: string; section: ExamSectionKind; indices: number[] }> = [];
    paper.questions.forEach((q, idx) => {
      const key = `${q.section}-${q.partNumber}`;
      const existing = groups.find((g) => g.key === key);
      if (existing) existing.indices.push(idx);
      else groups.push({ key, title: getPartTitle(q.section, q.partNumber), section: q.section, indices: [idx] });
    });
    return groups;
  }, [paper.questions]);

  const sidebarSections = useMemo(() => {
    const order: ExamSectionKind[] = [];
    const bySection = new Map<ExamSectionKind, typeof sidebarGroups>();
    sidebarGroups.forEach((group) => {
      if (!bySection.has(group.section)) {
        bySection.set(group.section, []);
        order.push(group.section);
      }
      bySection.get(group.section)?.push(group);
    });
    return order.map((section) => ({ section, parts: bySection.get(section) || [] }));
  }, [sidebarGroups]);

  const goToQuestionNumber = (questionNumber: number) => {
    const idx = review.items.findIndex((item) => item.questionNumber === questionNumber);
    if (idx >= 0) setCurrentIndex(idx);
  };

  useEffect(() => {
    const nextIndex = review.items.findIndex((item) => item.itemUid === initialItemUid);
    if (nextIndex >= 0) setCurrentIndex(nextIndex);
  }, [initialItemUid, review.items]);

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, [currentIndex]);

  if (!current) return null;

  const playAudio = () => {
    if (!current.audioUrl) return;
    audioRef.current?.pause();
    const audio = new Audio(current.audioUrl);
    audioRef.current = audio;
    void audio.play();
  };

  const explanation = readableReviewValue(current.explanationByLang) || readableReviewValue(current.explanation);
  const submittedAnswer = readableReviewValue(current.submittedAnswer) || 'Unanswered';
  const correctAnswer = readableReviewValue(current.correctAnswer);
  const stem = contentText(current.content) || current.questionType;
  const currentSection = reviewItemSection(current);
  const currentPartKey = (() => {
    const q = paper.questions.find((item) => !item.isExample && item.number === current.questionNumber);
    return q ? `${q.section}-${q.partNumber}` : `${currentSection}-1`;
  })();
  const examTitle = paper.source === 'official'
    ? `HSK ${paper.level} Official Mock`
    : `HSK ${paper.level} Practice Test`;
  const statusLabel = current.unanswered ? 'Unanswered' : current.correct ? 'Correct' : 'Incorrect';
  const statusColor = current.unanswered ? '#636E72' : current.correct ? '#13C377' : '#F34D47';
  const feedbackBg = current.unanswered
    ? 'rgba(99, 110, 114, 0.08)'
    : current.correct
      ? 'rgba(19, 195, 119, 0.08)'
      : 'rgba(243, 77, 71, 0.08)';
  const hasImageOptions = Boolean(current.options?.some((option) => option.image));

  const chipStyleFor = (item: AttemptReviewItem | undefined, isCurrent: boolean) => {
    if (isCurrent) {
      return {
        background: 'linear-gradient(140.83deg, #1CCFBD 62.39%, #37E7D4 94.83%)',
        color: '#FFFFFF',
        border: 'none',
      };
    }
    if (!item || item.unanswered) {
      return { background: '#F5F7FA', color: '#99ABBF', border: '1px solid #D1DBE6' };
    }
    if (item.correct) {
      return { background: '#E8FAF2', color: '#13C377', border: '1px solid #13C377' };
    }
    return { background: 'rgba(243, 77, 71, 0.08)', color: '#F34D47', border: '1px solid #F34D47' };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          height: p(160),
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ position: 'absolute', left: p(47), top: '50%', transform: 'translateY(-50%)' }}>
          <HskPrepBackButton
            onClick={onBack}
            sx={{ width: p(80), height: p(80), '& .MuiSvgIcon-root': { fontSize: p(40) } }}
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(40),
              lineHeight: `${p(58)}px`,
              color: '#292E2E',
            }}
          >
            {examTitle}
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontSize: p(24),
              lineHeight: `${p(24)}px`,
              color: '#6E6E73',
              fontWeight: 400,
            }}
          >
            Submitted · review only
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', width: '100%' }}>
        <Box
          sx={{
            width: progressOpen ? p(420) : 0,
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            borderRight: progressOpen ? '1px solid #E6EBF0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: p(420),
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              px: `${p(36)}px`,
              pt: `${p(28)}px`,
              pb: `${p(24)}px`,
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: `${p(20)}px` }}>
              <ButtonBase
                onClick={() => setProgressOpen(false)}
                aria-label="Hide progress panel"
                sx={{
                  width: p(80),
                  height: p(80),
                  borderRadius: `${p(16)}px`,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0DF',
                  color: '#636E72',
                  '&:active': { bgcolor: '#F9FAFB' },
                }}
              >
                <ViewListIcon sx={{ fontSize: p(46) }} />
              </ButtonBase>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {sidebarSections.map(({ section, parts }) => {
                const Icon = SECTION_ICONS[section];
                const sectionActive = parts.some((part) => part.key === currentPartKey);
                return (
                  <Box key={section} sx={{ mb: `${p(28)}px` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(18)}px` }}>
                      <Box
                        sx={{
                          width: p(10),
                          height: p(50),
                          borderRadius: `${p(5)}px`,
                          background: sectionActive
                            ? 'linear-gradient(180deg, #00B8A6 0%, #19DAC7 100%)'
                            : '#D1DBE6',
                          flexShrink: 0,
                        }}
                      />
                      <Icon sx={{ fontSize: p(28), color: sectionActive ? '#00B4A0' : '#A5B0BA' }} />
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 700,
                          fontSize: p(30),
                          lineHeight: `${p(43)}px`,
                          color: sectionActive ? '#00B8A6' : '#636E72',
                        }}
                      >
                        {SECTION_ZH[section]}
                      </Typography>
                    </Box>
                    {parts.map((group) => (
                      <Box key={group.key} sx={{ mb: `${p(18)}px` }}>
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontWeight: 600,
                            fontSize: p(24),
                            lineHeight: `${p(29)}px`,
                            color: '#A5B0BA',
                            mb: `${p(14)}px`,
                          }}
                        >
                          {`Part ${group.title.match(/\d+/)?.[0] ?? group.section}`}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: `${p(12)}px` }}>
                          {buildSidebarSlots(group.indices, paper.questions).map((slot) => {
                            const firstQ = paper.questions[slot.indices[0]];
                            const scored = slot.indices
                              .map((idx) => paper.questions[idx])
                              .filter((q) => q && !q.isExample);
                            const numbers = scored.map((q) => q.number);
                            const reviewItems = numbers
                              .map((n) => reviewByNumber.get(n))
                              .filter((item): item is AttemptReviewItem => Boolean(item));
                            const isCurrent = reviewItems.some((item) => item.itemUid === current.itemUid)
                              || (firstQ && firstQ.number === current.questionNumber);
                            const aggregate: AttemptReviewItem | undefined = (() => {
                              if (reviewItems.length === 0) return undefined;
                              if (reviewItems.every((item) => item.unanswered)) return reviewItems[0];
                              if (reviewItems.every((item) => item.correct === true)) return reviewItems[0];
                              if (reviewItems.some((item) => item.correct === false && !item.unanswered)) {
                                return { ...reviewItems[0], correct: false, unanswered: false };
                              }
                              return reviewItems[0];
                            })();
                            const chip = chipStyleFor(aggregate, Boolean(isCurrent));
                            return (
                              <ButtonBase
                                key={slot.label}
                                onClick={() => {
                                  const target = numbers[0] ?? firstQ?.number;
                                  if (typeof target === 'number') goToQuestionNumber(target);
                                }}
                                sx={{
                                  gridColumn: slot.kind === 'range' ? '1 / -1' : undefined,
                                  width: slot.kind === 'range' ? '100%' : p(71),
                                  height: slot.kind === 'range' ? p(70) : p(69),
                                  borderRadius: slot.kind === 'range' ? `${p(35)}px` : `${p(15)}px`,
                                  fontFamily: FIGMA_FONT,
                                  fontWeight: 400,
                                  fontSize: p(32),
                                  ...chip,
                                  '&:active': { transform: 'scale(0.98)' },
                                }}
                              >
                                {slot.label}
                              </ButtonBase>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: `${p(56)}px`, pt: `${p(32)}px`, pb: `${p(24)}px`, width: '100%', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, mb: `${p(28)}px` }}>
              {!progressOpen && (
                <ButtonBase
                  onClick={() => setProgressOpen(true)}
                  aria-label="Show progress panel"
                  sx={{
                    width: p(80),
                    height: p(80),
                    borderRadius: `${p(16)}px`,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E0E0DF',
                    color: '#636E72',
                    flexShrink: 0,
                    '&:active': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <ViewListIcon sx={{ fontSize: p(46) }} />
                </ButtonBase>
              )}
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(28),
                  lineHeight: `${p(38)}px`,
                  color: '#1D1D1F',
                }}
              >
                {`Question ${current.questionNumber || currentIndex + 1}`}
              </Typography>
            </Box>

            {current.audioUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: `${p(32)}px` }}>
                <ButtonBase
                  onClick={playAudio}
                  sx={{
                    width: p(120),
                    height: p(80),
                    borderRadius: `${p(50)}px`,
                    background: 'linear-gradient(122.84deg, #FF6B35 9.46%, #FF926A 67.15%, #FFB99F 90.54%)',
                    color: '#FFFFFF',
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: p(44) }} />
                </ButtonBase>
              </Box>
            )}

            {stem && (
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: '100%',
                  maxWidth: p(1281),
                  mx: 'auto',
                  mb: `${p(24)}px`,
                  px: `${p(36)}px`,
                  py: `${p(28)}px`,
                  bgcolor: '#F8F8FA',
                  border: '3px solid #E2E3E3',
                  borderRadius: `${p(12)}px`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(40),
                    lineHeight: `${p(40)}px`,
                    color: '#31363D',
                  }}
                >
                  {stem}
                </Typography>
              </Box>
            )}

            {!!current.options?.length && (
              <Box
                sx={{
                  maxWidth: p(1281),
                  mx: 'auto',
                  width: '100%',
                  display: hasImageOptions ? 'grid' : 'flex',
                  flexDirection: hasImageOptions ? undefined : 'column',
                  gridTemplateColumns: hasImageOptions
                    ? `repeat(${Math.min(current.options.length, 3)}, minmax(0, 1fr))`
                    : undefined,
                  gap: `${p(18)}px`,
                }}
              >
                {current.options.map((option, index) => {
                  const value = optionValue(option, index);
                  const selected = answerContains(current.submittedAnswer, value);
                  const correct = answerContains(current.correctAnswer, value);
                  const isRight = correct;
                  const isWrongPick = selected && !correct;
                  const border = isRight
                    ? '3px solid #13C377'
                    : isWrongPick
                      ? '2px solid #F34D47'
                      : '2px solid #DDE5EE';
                  const bg = isRight
                    ? '#E8FAF2'
                    : isWrongPick
                      ? 'rgba(243, 77, 71, 0.08)'
                      : '#FFFFFF';
                  const badgeBg = isRight ? '#13C377' : isWrongPick ? '#F34D47' : '#F3F4F6';
                  const badgeColor = isRight || isWrongPick ? '#FFFFFF' : '#2D3436';
                  return (
                    <Box
                      key={`${value}-${index}`}
                      sx={{
                        position: 'relative',
                        boxSizing: 'border-box',
                        width: '100%',
                        minHeight: hasImageOptions ? p(180) : p(112),
                        bgcolor: bg,
                        border,
                        borderRadius: `${p(12)}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${p(24)}px`,
                        px: `${p(30)}px`,
                        py: `${p(20)}px`,
                      }}
                    >
                      <Box
                        sx={{
                          width: p(64),
                          height: p(64),
                          borderRadius: '50%',
                          bgcolor: badgeBg,
                          border: isRight || isWrongPick ? 'none' : '1px solid #E0E0DF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontWeight: 500,
                            fontSize: p(24),
                            lineHeight: `${p(24)}px`,
                            color: badgeColor,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {option.pinyin && (
                          <Typography sx={{ fontSize: p(20), lineHeight: `${p(17)}px`, color: '#8F99A5', mb: `${p(4)}px` }}>
                            {option.pinyin}
                          </Typography>
                        )}
                        {option.image && (
                          <Box
                            component="img"
                            src={option.image}
                            alt={option.text || value}
                            sx={{ display: 'block', maxWidth: '100%', maxHeight: p(140), objectFit: 'contain', mb: option.text ? `${p(8)}px` : 0 }}
                          />
                        )}
                        {option.text && (
                          <Typography
                            sx={{
                              fontFamily: FIGMA_FONT,
                              fontWeight: 400,
                              fontSize: p(32),
                              lineHeight: `${p(35)}px`,
                              color: '#31363D',
                            }}
                          >
                            {option.text}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              minHeight: p(180),
              px: `${p(40)}px`,
              py: `${p(28)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${p(24)}px`,
              bgcolor: feedbackBg,
              borderTop: `1px solid ${statusColor}`,
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${p(18)}px`, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: p(45),
                  height: p(45),
                  borderRadius: '50%',
                  bgcolor: statusColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: `${p(2)}px`,
                }}
              >
                {current.unanswered ? (
                  <HelpOutlineIcon sx={{ fontSize: p(26), color: '#FFFFFF' }} />
                ) : current.correct ? (
                  <CheckCircleIcon sx={{ fontSize: p(26), color: '#FFFFFF' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: p(26), color: '#FFFFFF' }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(32),
                    lineHeight: 1.6,
                    color: statusColor,
                  }}
                >
                  {statusLabel}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(24),
                    lineHeight: 1.6,
                    color: '#636E72',
                  }}
                >
                  {explanation
                    || (current.unanswered
                      ? `Correct answer: ${correctAnswer || '—'}`
                      : current.correct
                        ? `Your answer: ${submittedAnswer}`
                        : `Your answer: ${submittedAnswer}${correctAnswer ? ` · Correct: ${correctAnswer}` : ''}`)}
                </Typography>
                {scoringMode === 'per_item' && (
                  <Typography sx={{ mt: `${p(4)}px`, fontFamily: FIGMA_FONT, fontSize: p(20), color: '#98A2B3' }}>
                    Score: {current.score} / {current.maxScore}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(16)}px`, flexShrink: 0 }}>
              <ButtonBase
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                aria-label="Previous question"
                sx={{
                  width: p(100),
                  height: p(100),
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0DF',
                  color: '#636E72',
                  '&.Mui-disabled': { opacity: 0.35 },
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: p(40) }} />
              </ButtonBase>
              <ButtonBase
                disabled={currentIndex >= review.items.length - 1}
                onClick={() => setCurrentIndex((value) => Math.min(review.items.length - 1, value + 1))}
                aria-label="Next question"
                sx={{
                  width: p(100),
                  height: p(100),
                  borderRadius: '50%',
                  bgcolor: statusColor,
                  color: '#FFFFFF',
                  '&.Mui-disabled': { opacity: 0.35 },
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: p(40) }} />
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Container
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HSKPrepTrainingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWebsiteEmbed = searchParams.get('mode') === 'website';
  const requestedParentOrigin = searchParams.get('parentOrigin');
  const paperTrackParam = searchParams.get('track');
  const paperTrack: PaperSource | null =
    paperTrackParam === 'clingo' ? 'clingo' : paperTrackParam === 'official' ? 'official' : null;
  const levelParam = Number(searchParams.get('level'));
  const requestedLevel: HSKLevel | null =
    levelParam === 1 || levelParam === 2 ? (levelParam as HSKLevel) : null;
  const screenSize = APP_SCREEN_SIZE;
  const is960 = screenSize === '960x540';

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [examResult, setExamResult] = useState<AttemptResult | null>(null);
  const [attemptReview, setAttemptReview] = useState<AttemptReview | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewStartItemUid, setReviewStartItemUid] = useState<string | undefined>();
  const [catalogPapers, setCatalogPapers] = useState<PaperCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [retakeAvailable, setRetakeAvailable] = useState<boolean | null>(true);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [attemptInProgress, setAttemptInProgress] = useState(() => Boolean(readActiveAttemptPointer()));
  const [sessionRestoring, setSessionRestoring] = useState(true);
  const [sessionRestoreError, setSessionRestoreError] = useState<string | null>(null);
  const [sessionRestoreNonce, setSessionRestoreNonce] = useState(0);
  const [startLoading, setStartLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewOpening, setReviewOpening] = useState(false);
  const reviewRequestTokenRef = useRef(0);
  const reviewRequestRef = useRef<{ attemptId: string; promise: Promise<AttemptReview> } | null>(null);
  const retakeRequestTokenRef = useRef(0);
  const catalogRequestTokenRef = useRef(0);
  const startRequestTokenRef = useRef(0);
  const appliedRequestedLevelRef = useRef(false);

  const activePaper = selectedPaper;

  const getReviewRequest = (attemptId: string): Promise<AttemptReview> => {
    const activeRequest = reviewRequestRef.current;
    if (activeRequest?.attemptId === attemptId) return activeRequest.promise;
    const promise = getAttemptResultDetail(attemptId);
    const request = { attemptId, promise };
    reviewRequestRef.current = request;
    void promise.then(
      () => {
        if (reviewRequestRef.current === request) reviewRequestRef.current = null;
      },
      () => {
        if (reviewRequestRef.current === request) reviewRequestRef.current = null;
      },
    );
    return promise;
  };

  useEffect(() => {
    const syncAttemptState = (event: StorageEvent) => {
      if (event.key === LEGACY_ACTIVE_ATTEMPT_POINTER_KEY
        || event.key?.startsWith(ACTIVE_ATTEMPT_POINTER_KEY_PREFIX)) {
        setAttemptInProgress(Boolean(readActiveAttemptPointer()));
      }
    };
    window.addEventListener('storage', syncAttemptState);
    return () => window.removeEventListener('storage', syncAttemptState);
  }, []);

  useEffect(() => {
    if (!isWebsiteEmbed || window.parent === window) return;
    let parentOrigin = '';
    try {
      if (requestedParentOrigin) {
        const parsed = new URL(requestedParentOrigin);
        if (parsed.origin === requestedParentOrigin) parentOrigin = parsed.origin;
      }
      if (!parentOrigin && document.referrer) parentOrigin = new URL(document.referrer).origin;
    } catch {
      parentOrigin = '';
    }
    if (!parentOrigin) return;
    window.parent.postMessage({
      type: 'clingo:hsk-state',
      screen: currentScreen,
      inProgress: attemptInProgress,
    }, parentOrigin);
  }, [currentScreen, attemptInProgress, isWebsiteEmbed, requestedParentOrigin]);

  useEffect(() => {
    let active = true;
    setSessionRestoring(true);
    setSessionRestoreError(null);
    const restoreSubmittedAttempt = async (
      pointer: ActiveAttemptPointer,
      attempt: ExamAttempt,
      source: 'active' | 'result',
      ignoredActiveAttemptIds: ReadonlySet<string> = new Set<string>(),
    ): Promise<boolean> => {
      if (attempt.status !== 'submitted' || !attempt.result) return false;
      if (source === 'active') {
        clearActiveAttemptPointerIfMatches(pointer.attemptId);
        writeLatestResultPointer(pointer);
        if (hasBlockingAttemptPointer(readActiveAttemptPointers(), ignoredActiveAttemptIds)) {
          setAttemptInProgress(true);
          return false;
        }
      } else if (hasBlockingAttemptPointer(readActiveAttemptPointers(), ignoredActiveAttemptIds)) {
        return false;
      } else {
        writeLatestResultPointer(pointer);
      }
      setAttemptInProgress(false);
      setSelectedLevel(pointer.catalog.level);
      setCatalogPapers([pointer.catalog]);
      setSelectedPaper(attemptToPaper(pointer.catalog, attempt));
      setExamResult(attempt.result);
      setAttemptReview(null);
      setReviewError(null);
      setRetakeAvailable(true);
      setRetakeError(null);
      setCurrentScreen('result');
      const reviewRequestToken = ++reviewRequestTokenRef.current;
      setReviewLoading(true);
      window.setTimeout(() => {
        if (!active || reviewRequestToken !== reviewRequestTokenRef.current) return;
        void getReviewRequest(attempt.attemptId)
          .then((detail) => {
            if (!active || reviewRequestToken !== reviewRequestTokenRef.current) return;
            setAttemptReview(detail);
          })
          .catch((reviewFailure) => {
            if (!active || reviewRequestToken !== reviewRequestTokenRef.current) return;
            setReviewError(reviewFailure instanceof Error ? reviewFailure.message : 'Failed to load answer details');
          })
          .finally(() => {
            if (active && reviewRequestToken === reviewRequestTokenRef.current) setReviewLoading(false);
          });
      }, 0);
      return true;
    };

    const restoreActiveAttempt = async () => {
      try {
        const pointers = readActiveAttemptPointers();
        const scan = await scanAttemptPointers(pointers, getAttempt, isAttemptNotFoundError);
        if (!active) return;
        scan.discardAttemptIds.forEach(clearActiveAttemptPointerIfMatches);
        if (scan.submitted) writeLatestResultPointer(scan.submitted.pointer);
        if (scan.active) {
          const { pointer, attempt } = scan.active;
          setAttemptInProgress(true);
          setSelectedLevel(pointer.catalog.level);
          setCatalogPapers([pointer.catalog]);
          setSelectedPaper(attemptToPaper(pointer.catalog, attempt));
          setCurrentScreen('exam');
          return;
        }
        const resultPointer = readLatestResultPointer();
        const blockingRestoreError = firstBlockingTransientError(scan, resultPointer);
        if (blockingRestoreError) throw blockingRestoreError;
        const ignorableTransientAttemptIds = new Set(
          scan.transientErrors.map(({ pointer }) => pointer.attemptId),
        );
        if (scan.submitted
          && await restoreSubmittedAttempt(
            scan.submitted.pointer,
            scan.submitted.attempt,
            'active',
            ignorableTransientAttemptIds,
          )) return;
        setAttemptInProgress(Boolean(readActiveAttemptPointer()));
        const publishedPapers = await listPublishedPapers();
        if (!active) return;
        for (const level of [1, 2] as HSKLevel[]) {
          const catalog = publishedPapers
            .filter((paper) => paper.level === `HSK${level}`)
            .map(apiPaperToCatalog);
          const activeCatalog = catalog.find(
            (paper) => paper.activeAttemptId
              && !ignorableTransientAttemptIds.has(paper.activeAttemptId),
          );
          if (!activeCatalog?.activeAttemptId) continue;
          const attempt = await getAttempt(activeCatalog.activeAttemptId);
          if (!active) return;
          if (attempt.status !== 'in_progress') continue;
          await writeActiveAttemptPointer({ attemptId: attempt.attemptId, catalog: activeCatalog });
          setAttemptInProgress(true);
          setSelectedLevel(level);
          setCatalogPapers(catalog);
          setSelectedPaper(attemptToPaper(activeCatalog, attempt));
          setCurrentScreen('exam');
          return;
        }
        setAttemptInProgress(false);
        if (resultPointer) {
          try {
            const attempt = await getAttempt(resultPointer.attemptId);
            if (!active) return;
            if (await restoreSubmittedAttempt(
              resultPointer,
              attempt,
              'result',
              ignorableTransientAttemptIds,
            )) return;
          } catch (error) {
            if (!isAttemptNotFoundError(error)) throw error;
            console.warn('Discarding missing HSK result pointer', error);
          }
          if (!readActiveAttemptPointer()) writeLatestResultPointer(null);
        }
      } catch (error) {
        if (active) {
          console.warn('Failed to restore active HSK attempt', error);
          setSessionRestoreError(error instanceof Error ? error.message : 'Failed to restore exam session');
        }
      } finally {
        if (active) setSessionRestoring(false);
      }
    };
    void restoreActiveAttempt();
    return () => {
      active = false;
    };
  }, [sessionRestoreNonce]);

  const loadCatalogPapers = async (level: HSKLevel) => {
    if (!PHASE_ONE_LEVELS.has(level)) return;
    const requestToken = ++catalogRequestTokenRef.current;
    setCatalogLoading(true);
    setFlowError(null);
    try {
      const published = await listPublishedPapers(level);
      if (catalogRequestTokenRef.current !== requestToken) return;
      setCatalogPapers(published.map(apiPaperToCatalog));
    } catch (error) {
      if (catalogRequestTokenRef.current !== requestToken) return;
      setCatalogPapers([]);
      setFlowError(error instanceof Error ? error.message : 'Failed to load papers');
    } finally {
      if (catalogRequestTokenRef.current === requestToken) setCatalogLoading(false);
    }
  };

  const handleSelectLevel = async (level: HSKLevel) => {
    if (!PHASE_ONE_LEVELS.has(level)) return;
    reviewRequestTokenRef.current += 1;
    setReviewLoading(false);
    setReviewOpening(false);
    setSelectedLevel(level);
    setCatalogPapers([]);
    setSelectedPaper(null);
    setExamResult(null);
    setAttemptReview(null);
    setReviewError(null);
    setRetakeAvailable(true);
    setRetakeError(null);
    setCurrentScreen('papers');
    await loadCatalogPapers(level);
  };

  useEffect(() => {
    if (appliedRequestedLevelRef.current) return;
    if (sessionRestoring || sessionRestoreError || !requestedLevel) return;
    if (currentScreen !== 'home') return;
    appliedRequestedLevelRef.current = true;
    void handleSelectLevel(requestedLevel);
  }, [sessionRestoring, sessionRestoreError, requestedLevel, currentScreen]);

  const handleBackToHome = () => {
    catalogRequestTokenRef.current += 1;
    reviewRequestTokenRef.current += 1;
    setCatalogLoading(false);
    setReviewLoading(false);
    setReviewOpening(false);
    setFlowError(null);
    setSelectedLevel(null);
    setSelectedPaper(null);
    setExamResult(null);
    setAttemptReview(null);
    setReviewError(null);
    setRetakeAvailable(true);
    setRetakeError(null);
    setCurrentScreen('home');
  };

  const handleSelectPaper = (paper: PaperCatalogItem) => {
    reviewRequestTokenRef.current += 1;
    setReviewLoading(false);
    setReviewOpening(false);
    setSelectedPaper(buildPaperFromCatalog(paper));
    setExamResult(null);
    setAttemptReview(null);
    setReviewError(null);
    setRetakeAvailable(true);
    setRetakeError(null);
    setCurrentScreen('intro');
  };

  const handleStartExam = async () => {
    if (!selectedPaper || startLoading) return;
    const requestToken = ++startRequestTokenRef.current;
    const paperId = selectedPaper.id;
    setStartLoading(true);
    setFlowError(null);
    try {
      const attempt = await startAttempt(paperId);
      if (startRequestTokenRef.current !== requestToken) return;
      const catalog = catalogPapers.find((paper) => paper.id === paperId);
      if (!catalog) throw new Error('Paper catalog entry is missing');
      if (attempt.status !== 'in_progress') throw new Error('This attempt is no longer available');
      await writeActiveAttemptPointer({ attemptId: attempt.attemptId, catalog });
      if (startRequestTokenRef.current !== requestToken) return;
      setAttemptInProgress(true);
      setSelectedPaper(attemptToPaper(catalog, attempt));
      setCurrentScreen('exam');
    } catch (error) {
      if (startRequestTokenRef.current !== requestToken) return;
      setFlowError(error instanceof Error ? error.message : 'Failed to start exam');
    } finally {
      if (startRequestTokenRef.current === requestToken) setStartLoading(false);
    }
  };

  const handleBackToPapers = () => {
    startRequestTokenRef.current += 1;
    reviewRequestTokenRef.current += 1;
    setStartLoading(false);
    setReviewLoading(false);
    setReviewOpening(false);
    setSelectedPaper(null);
    setExamResult(null);
    setAttemptReview(null);
    setReviewError(null);
    setCurrentScreen('papers');
    if (selectedLevel) void loadCatalogPapers(selectedLevel);
  };

  const handleBackToIntro = () => {
    reviewRequestTokenRef.current += 1;
    setReviewLoading(false);
    setReviewOpening(false);
    setExamResult(null);
    setAttemptReview(null);
    setReviewError(null);
    setCurrentScreen('intro');
  };

  const handleFinishExam = async (answers: Record<string, string>): Promise<boolean> => {
    if (!activePaper?.attemptId) return false;
    const attemptId = activePaper.attemptId;
    setFlowError(null);
    try {
      const serverResult: AttemptResult = await submitAttempt(attemptId, answers);

      localStorage.removeItem(`hsk-attempt-${attemptId}`);
      await clearActiveAttemptPointerIfMatches(attemptId);
      setAttemptInProgress(Boolean(readActiveAttemptPointer()));
      const catalog = catalogPapers.find((paper) => paper.id === activePaper.id);
      if (catalog) writeLatestResultPointer({ attemptId, catalog });
      setExamResult(serverResult);
      setAttemptReview(null);
      setReviewError(null);
      setRetakeAvailable(true);
      setRetakeError(null);
      setCurrentScreen('result');
      const reviewRequestToken = ++reviewRequestTokenRef.current;
      setReviewLoading(true);
      window.setTimeout(() => {
        if (reviewRequestToken !== reviewRequestTokenRef.current) return;
        void getReviewRequest(attemptId)
          .then((detail) => {
            if (reviewRequestToken !== reviewRequestTokenRef.current) return;
            setAttemptReview(detail);
          })
          .catch((reviewFailure) => {
            if (reviewRequestToken !== reviewRequestTokenRef.current) return;
            setReviewError(reviewFailure instanceof Error ? reviewFailure.message : 'Failed to load answer details');
          })
          .finally(() => {
            if (reviewRequestToken === reviewRequestTokenRef.current) setReviewLoading(false);
          });
      }, 0);
      return true;
    } catch (error) {
      setFlowError(error instanceof Error ? error.message : 'Failed to submit exam');
      return false;
    }
  };

  const handleRestart = async () => {
    if (!selectedPaper) return;
    const requestToken = ++retakeRequestTokenRef.current;
    setRetakeAvailable(null);
    setRetakeError(null);
    try {
      const published = (await listPublishedPapers(selectedPaper.level)).map(apiPaperToCatalog);
      if (retakeRequestTokenRef.current !== requestToken) return;
      const catalog = published.find((paper) => paper.id === selectedPaper.id);
      if (!catalog) {
        setRetakeAvailable(false);
        return;
      }
      setCatalogPapers(published);
      setSelectedPaper(buildPaperFromCatalog(catalog));
      writeLatestResultPointer(null);
      setExamResult(null);
      setAttemptReview(null);
      setReviewError(null);
      reviewRequestTokenRef.current += 1;
      setReviewLoading(false);
      setReviewOpening(false);
      setRetakeAvailable(true);
      setCurrentScreen('intro');
    } catch (error) {
      if (retakeRequestTokenRef.current !== requestToken) return;
      setRetakeAvailable(null);
      setRetakeError(error instanceof Error ? error.message : 'Unable to verify paper availability');
    }
  };

  const handleOpenReview = async (itemUid?: string) => {
    if (!activePaper?.attemptId || reviewOpening) return;
    setReviewStartItemUid(itemUid);
    if (attemptReview) {
      setCurrentScreen('review');
      return;
    }
    const requestToken = ++reviewRequestTokenRef.current;
    const attemptId = activePaper.attemptId;
    setReviewLoading(true);
    setReviewOpening(true);
    setReviewError(null);
    try {
      const detail = await getReviewRequest(attemptId);
      if (reviewRequestTokenRef.current !== requestToken) return;
      setAttemptReview(detail);
      setCurrentScreen('review');
    } catch (error) {
      if (reviewRequestTokenRef.current !== requestToken) return;
      setReviewError(error instanceof Error ? error.message : 'Failed to load answer details');
    } finally {
      if (reviewRequestTokenRef.current === requestToken) {
        setReviewLoading(false);
        setReviewOpening(false);
      }
    }
  };

  /** Leave prep training entirely — back to HSK Preparation hub (same as mock grid entry). */
  const handleExitToHub = () => {
    reviewRequestTokenRef.current += 1;
    retakeRequestTokenRef.current += 1;
    startRequestTokenRef.current += 1;
    setReviewLoading(false);
    setReviewOpening(false);
    setStartLoading(false);
    if (currentScreen === 'result' || currentScreen === 'review') {
      writeLatestResultPointer(null);
    }
    if (isWebsiteEmbed) {
      handleBackToHome();
      return;
    }
    navigate('/hsk-test');
  };

  const writeTrackParam = (track: PaperSource | null) => {
    const next = new URLSearchParams(searchParams);
    if (track) next.set('track', track);
    else next.delete('track');
    setSearchParams(next, { replace: true });
  };

  const handleSelectTrack = (track: PaperSource) => {
    writeTrackParam(track);
  };

  const handleBackFromLevels = () => {
    if (paperTrack) {
      writeTrackParam(null);
      return;
    }
    handleExitToHub();
  };

  if (sessionRestoring) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#FFF8F0' }}>
        <Typography sx={{ color: '#667085', fontWeight: 700 }}>Loading exam...</Typography>
      </Box>
    );
  }

  if (sessionRestoreError) {
    return (
      <Box sx={{ height: '100%', position: 'relative', bgcolor: '#FFFBF5', p: 3, boxSizing: 'border-box' }}>
        <HskPrepBackButton
          onClick={() => {
            setSessionRestoreError(null);
            setSessionRestoring(false);
            handleExitToHub();
          }}
          sx={{
            position: 'absolute',
            left: HSK_PREP_BACK.left,
            top: HSK_PREP_BACK.top,
            zIndex: 2,
          }}
        />
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
          <Box sx={{ maxWidth: 520, textAlign: 'center' }}>
            <Typography sx={{ color: '#B42318', fontWeight: 800, mb: 2, fontFamily: FIGMA_FONT }}>
              {sessionRestoreError}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <ButtonBase
                onClick={() => {
                  setSessionRestoreError(null);
                  setSessionRestoring(false);
                  handleExitToHub();
                }}
                sx={{
                  minWidth: 120,
                  minHeight: 56,
                  px: 3,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontWeight: 800,
                  fontFamily: FIGMA_FONT,
                }}
              >
                Back
              </ButtonBase>
              <ButtonBase
                onClick={() => setSessionRestoreNonce((value) => value + 1)}
                sx={{
                  minHeight: 48,
                  px: 3,
                  borderRadius: '8px',
                  bgcolor: '#0EAD8B',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontFamily: FIGMA_FONT,
                }}
              >
                Retry
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
    <AnimatePresence>
      {currentScreen === 'home' && (
        <motion.div key={paperTrack ? 'levels' : 'version'} initial={false} animate={{ opacity: 1 }} style={{ height: '100%' }}>
          {paperTrack ? (
            <HomeScreen
              onSelectLevel={handleSelectLevel}
              onBack={handleBackFromLevels}
              showBack={!isWebsiteEmbed}
              screenSize={screenSize}
            />
          ) : (
            <VersionScreen
              onSelect={handleSelectTrack}
              onBack={handleExitToHub}
              showBack={!isWebsiteEmbed}
              screenSize={screenSize}
            />
          )}
        </motion.div>
      )}

      {currentScreen === 'papers' && selectedLevel && (
        <motion.div key="papers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
          <PaperSelectionScreen
            level={selectedLevel}
            papers={catalogPapers}
            loading={catalogLoading}
            error={flowError}
            onSelectPaper={handleSelectPaper}
            onBack={handleBackToHome}
            onRetry={() => void loadCatalogPapers(selectedLevel)}
            paperTrack={paperTrack}
            screenSize={screenSize}
          />
        </motion.div>
      )}

      {currentScreen === 'intro' && activePaper && (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
          <>
            {flowError && <Typography sx={{ color: '#B91C1C', px: 3, pt: 1 }}>{flowError}</Typography>}
            <ExamIntroScreen paper={activePaper} onStart={handleStartExam} onBack={handleBackToPapers} starting={startLoading} />
          </>
        </motion.div>
      )}

      {currentScreen === 'exam' && activePaper && (
        <motion.div key="exam" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} style={{ height: '100%' }}>
          <ExamScreen paper={activePaper} onFinish={handleFinishExam} onExit={handleBackToIntro} error={flowError} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'result' && examResult && activePaper && (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <ResultScreen paper={activePaper} result={examResult} review={attemptReview} reviewError={reviewError} reviewLoading={reviewLoading} reviewOpening={reviewOpening} retakeAvailable={retakeAvailable} retakeError={retakeError} onOpenReview={handleOpenReview} onRestart={handleRestart} onGoHome={handleExitToHub} screenSize={screenSize} />
        </motion.div>
      )}

      {currentScreen === 'review' && attemptReview && activePaper && examResult && (
        <motion.div key="review" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <ReviewScreen paper={activePaper} review={attemptReview} scoringMode={examResult.scoringMode} initialItemUid={reviewStartItemUid} onBack={() => setCurrentScreen('result')} />
        </motion.div>
      )}
    </AnimatePresence>
      </Box>
    </Box>
  );
}
