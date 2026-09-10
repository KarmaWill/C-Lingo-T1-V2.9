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
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FeedbackEntryButton from '../components/feedback/FeedbackEntryButton';
import HubContainBoard from '../components/home/HubContainBoard';
import SystemStatusBar from '../components/MainUI/SystemStatusBar';
import { FIGMA_FONT } from '../utils/figmaScale';
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

/** Figma Mock Exam 1920×1200。Group 17 与页脚为隐藏层，选级页不画 */
const MOCK_EXAM_BOARD_W = 1920;
const MOCK_EXAM_BOARD_H = 1200;

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

function PaperStatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        height: 50,
        px: '18px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E3E3',
        borderRadius: '21px',
        boxSizing: 'border-box',
      }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: '25px', color: '#98A2B3', fontFamily: FIGMA_FONT }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: '30px', color: '#344054', fontFamily: FIGMA_FONT, fontVariantNumeric: 'tabular-nums' }}>
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

const LEVEL_CARD_LAYOUT: Record<LevelPickerId, { x: number; y: number }> = {
  1: { x: 65, y: 185 },
  2: { x: 988, y: 185 },
  3: { x: 65, y: 417 },
  4: { x: 988, y: 438 },
  5: { x: 65, y: 673 },
  6: { x: 988, y: 693 },
  'hsk7-9': { x: 69, y: 922 },
};

function DifficultyMeter({
  level,
  filled,
  empty,
}: {
  level: number;
  filled: string;
  empty: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: '#B0ACB4',
          lineHeight: '20px',
          fontFamily: FIGMA_FONT,
        }}
      >
        DIFFICULTY
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                width: 24,
                height: 11,
                borderRadius: '5px',
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
}: {
  item: LevelPickerItem;
  onSelect: (level: HSKLevel) => void;
}) {
  const locked = !item.enabled;
  const pos = LEVEL_CARD_LAYOUT[item.id];

  const cardBody = (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: 13,
          top: 10,
          width: 190,
          height: 224,
          borderRadius: '28px 10px 10px 28px',
          background: item.badgeGradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 28,
            height: '100%',
            background: item.badgeGradient,
            filter: 'brightness(0.92)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: -8,
            bottom: 16,
            width: 72,
            height: 88,
            borderRadius: '40px',
            bgcolor: 'rgba(255,255,255,0.11)',
          }}
        />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 66,
            lineHeight: '83px',
            color: '#FFFFFF',
            fontFamily: FIGMA_FONT,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {levelBadgeLabel(item.id)}
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: '25px',
            letterSpacing: '0.05em',
            color: item.levelTint,
            fontFamily: FIGMA_FONT,
            position: 'relative',
            zIndex: 1,
            mt: '-6px',
          }}
        >
          LEVEL
        </Typography>
      </Box>

      <Box sx={{ position: 'absolute', left: 239, top: 34, right: 188 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 36,
            lineHeight: '45px',
            color: '#24242D',
            fontFamily: FIGMA_FONT,
          }}
        >
          {item.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '8px', minWidth: 0 }}>
          <MenuBookIcon sx={{ fontSize: 24, color: locked ? '#A5B0BA' : '#A5B0BA', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: 28,
              lineHeight: '35px',
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
        <Box sx={{ mt: '28px' }}>
          <DifficultyMeter level={item.difficulty} filled={item.barFilled} empty={item.barEmpty} />
        </Box>
      </Box>

      {locked ? (
        <Box
          sx={{
            position: 'absolute',
            right: 40,
            top: 93,
            width: 128,
            height: 58,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            bgcolor: '#F3F4F6',
            borderRadius: '16px',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: '25px', color: '#77747F', fontFamily: FIGMA_FONT }}>
            Locked
          </Typography>
          <LockIcon sx={{ fontSize: 16, color: '#77747F' }} />
        </Box>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            right: 40,
            top: 93,
            width: 128,
            height: 58,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            bgcolor: item.enterColor,
            borderRadius: '16px',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: '25px', color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
            Enter
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
        </Box>
      )}
    </>
  );

  const cardSx = {
    position: 'absolute' as const,
    left: pos.x,
    top: pos.y,
    width: 859,
    height: 245,
    borderRadius: '28px',
    bgcolor: 'rgba(255,255,255,0.94)',
    overflow: 'hidden' as const,
    opacity: locked ? 0.62 : 1,
    textAlign: 'left' as const,
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
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      {cardBody}
    </ButtonBase>
  );
}

function VersionScreen({
  onSelect,
  onBack,
  showBack = true,
}: {
  onSelect: (track: PaperSource) => void;
  onBack: () => void;
  showBack?: boolean;
}) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFF8F0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: '-7%',
          top: '6%',
          width: 520,
          height: 470,
          borderRadius: '50%',
          background: 'rgba(255, 181, 217, 0.17)',
          filter: 'blur(94px)',
          pointerEvents: 'none',
        }}
      />
      <HubContainBoard width={MOCK_EXAM_BOARD_W} height={MOCK_EXAM_BOARD_H}>
        <ButtonBase
          onClick={onBack}
          aria-label="Back"
          sx={{
            position: 'absolute',
            left: 58,
            top: 63,
            width: 80,
            height: 80,
            borderRadius: '100px',
            bgcolor: '#FFFFFF',
            border: '0.8px solid #E0E0DF',
            color: '#2D3436',
            visibility: showBack ? 'visible' : 'hidden',
            pointerEvents: showBack ? 'auto' : 'none',
            '&:active': { bgcolor: '#F9FAFB' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 40 }} />
        </ButtonBase>
        <Typography
          sx={{
            position: 'absolute',
            left: 167,
            top: 69,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#20212A',
            fontFamily: FIGMA_FONT,
          }}
        >
          Mock Exam
        </Typography>

        <Typography
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 214,
            fontWeight: 600,
            fontSize: 49,
            lineHeight: '61px',
            letterSpacing: '-1.3px',
            textAlign: 'center',
            color: '#142033',
            fontFamily: FIGMA_FONT,
          }}
        >
          Choose your HSK version
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            left: 200,
            right: 200,
            top: 286,
            fontWeight: 400,
            fontSize: 29,
            lineHeight: '37px',
            textAlign: 'center',
            color: '#667085',
            fontFamily: FIGMA_FONT,
          }}
        >
          Choose a version, then select a level and start your mock exam.
        </Typography>

        <ButtonBase
          onClick={() => onSelect('official')}
          aria-label="Past Papers, HSK 2.0"
          sx={{
            position: 'absolute',
            left: 84,
            top: 380,
            width: 853,
            height: 487,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            px: '54px',
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            border: '1.3px solid #E6E9EF',
            boxShadow: '0px 38px 96px rgba(15, 23, 42, 0.1)',
            borderRadius: '54px',
            textAlign: 'left',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              width: 118,
              height: 118,
              borderRadius: '40px',
              bgcolor: '#E8FAF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: 42, lineHeight: '56px', color: '#078879', fontFamily: FIGMA_FONT }}>
              2.0
            </Typography>
          </Box>
          <Typography
            sx={{
              mt: '42px',
              fontWeight: 700,
              fontSize: 52,
              lineHeight: '69px',
              color: '#142033',
              fontFamily: FIGMA_FONT,
            }}
          >
            Past Papers
          </Typography>
          <Typography
            sx={{
              mt: '15px',
              fontWeight: 700,
              fontSize: 31,
              lineHeight: '41px',
              color: '#667085',
              fontFamily: FIGMA_FONT,
            }}
          >
            Take an HSK 2.0 mock exam.
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={() => onSelect('clingo')}
          aria-label="C-Test, HSK 3.0"
          sx={{
            position: 'absolute',
            left: 983,
            top: 380,
            width: 853,
            height: 487,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            px: '54px',
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            border: '1.3px solid #E6E9EF',
            boxShadow: '0px 38px 96px rgba(15, 23, 42, 0.1)',
            borderRadius: '54px',
            textAlign: 'left',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              width: 118,
              height: 118,
              borderRadius: '40px',
              bgcolor: '#F1E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: 42, lineHeight: '56px', color: '#7C3AED', fontFamily: FIGMA_FONT }}>
              3.0
            </Typography>
          </Box>
          <Typography
            sx={{
              mt: '42px',
              fontWeight: 700,
              fontSize: 52,
              lineHeight: '69px',
              color: '#142033',
              fontFamily: FIGMA_FONT,
            }}
          >
            C-Test
          </Typography>
          <Typography
            sx={{
              mt: '15px',
              fontWeight: 700,
              fontSize: 31,
              lineHeight: '41px',
              color: '#667085',
              fontFamily: FIGMA_FONT,
            }}
          >
            Choose a level and take an HSK 3.0 mock exam.
          </Typography>
        </ButtonBase>
      </HubContainBoard>
    </Box>
  );
}

function HomeScreen({
  onSelectLevel,
  onBack,
  showBack = true,
}: {
  onSelectLevel: (level: HSKLevel) => void;
  onBack: () => void;
  showBack?: boolean;
}) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFF8F0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: '-7%',
          top: '6%',
          width: 520,
          height: 470,
          borderRadius: '50%',
          background: 'rgba(255, 181, 217, 0.17)',
          filter: 'blur(94px)',
          pointerEvents: 'none',
        }}
      />
      <HubContainBoard width={MOCK_EXAM_BOARD_W} height={MOCK_EXAM_BOARD_H}>
        <ButtonBase
          onClick={onBack}
          aria-label="Back"
          sx={{
            position: 'absolute',
            left: 58,
            top: 63,
            width: 80,
            height: 80,
            borderRadius: '100px',
            bgcolor: '#FFFFFF',
            border: '0.8px solid #E0E0DF',
            color: '#2D3436',
            visibility: showBack ? 'visible' : 'hidden',
            pointerEvents: showBack ? 'auto' : 'none',
            '&:active': { bgcolor: '#F9FAFB' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 40 }} />
        </ButtonBase>
        <Typography
          sx={{
            position: 'absolute',
            left: 167,
            top: 69,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#20212A',
            fontFamily: FIGMA_FONT,
          }}
        >
          Mock Exam
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            left: 507,
            top: 75,
            width: 228,
            height: 56,
            borderRadius: '27px',
            background: 'linear-gradient(92.36deg, #F7910B 0.3%, #FBAE5B 46.18%, #FCC09A 99.7%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: '30px',
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
            }}
          >
            CHOOSE LEVEL
          </Typography>
        </Box>

        {LEVEL_PICKER_ITEMS.map((item) => (
          <LevelPickerCard key={String(item.id)} item={item} onSelect={onSelectLevel} />
        ))}
      </HubContainBoard>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PaperSelectionScreen — 官方 / C-Lingo 自研 分区选卷（按级别）
   ═══════════════════════════════════════════════════════════════════════════════ */
function PaperCard({
  paper,
  attempt,
  onSelect,
}: {
  paper: PaperCatalogItem;
  attempt?: PaperAttemptRecord;
  onSelect: (paper: PaperCatalogItem) => void;
}) {
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
        width: 315,
        height: 296,
        display: 'block',
        p: 0,
        flexShrink: 0,
        position: 'relative',
        overflow: 'visible',
        textAlign: 'left',
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '28px',
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
          top: 12,
          height: 9,
          borderRadius: '13px',
          bgcolor: '#FFFFFF',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 36,
          bottom: 0,
          bgcolor: '#FFFDFB',
          border: official ? '1px solid #FFB4B4' : '1px solid #00B4A0',
          borderRadius: '28px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 27,
          top: 28,
          width: 88,
          height: 104,
          borderRadius: '8px',
          bgcolor: scoreBadgeBg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600, lineHeight: '19px', color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
          SCORE
        </Typography>
        <Typography sx={{ fontSize: 27, fontWeight: 700, lineHeight: '33px', color: '#FFFFFF', fontFamily: FIGMA_FONT, fontVariantNumeric: 'tabular-nums' }}>
          {hasScore ? savedScore : '--'}
        </Typography>
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          left: 18,
          right: 15,
          top: 157,
          fontSize: 36,
          fontWeight: 700,
          lineHeight: '45px',
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
          left: 21,
          right: 21,
          bottom: 15,
          height: 43,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: official ? 'rgba(255, 180, 180, 0.22)' : 'rgba(170, 255, 228, 0.22)',
          border: official ? '1px solid #FFB4B4' : '1px solid #70D4CA',
          borderRadius: '28px',
          zIndex: 2,
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: '25px', color: '#2D3436', fontFamily: FIGMA_FONT }}>
          {dateLabel}
        </Typography>
      </Box>
    </ButtonBase>
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
}: {
  level: HSKLevel;
  papers: PaperCatalogItem[];
  loading: boolean;
  error: string | null;
  onSelectPaper: (paper: PaperCatalogItem) => void;
  onBack: () => void;
  onRetry: () => void;
  is960?: boolean;
  paperTrack?: PaperSource | null;
}) {
  const visiblePapers = useMemo(
    () => (paperTrack ? papers.filter((paper) => paper.source === paperTrack) : papers),
    [paperTrack, papers],
  );
  const summaryPaper = visiblePapers[0];
  const officialPapers = visiblePapers.filter((paper) => paper.source === 'official');
  const practicePapers = visiblePapers.filter((paper) => paper.source === 'clingo');
  const showOfficial = officialPapers.length > 0;
  const showPractice = practicePapers.length > 0;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFCF7',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', right: -80, top: -180, width: 1026, height: 1026, borderRadius: '50%', bgcolor: 'rgba(255, 222, 222, 0.19)', filter: 'blur(91px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', left: -170, bottom: -80, width: 1026, height: 1026, borderRadius: '50%', bgcolor: 'rgba(252, 230, 238, 0.41)', filter: 'blur(91px)', pointerEvents: 'none' }} />
      <HubContainBoard width={MOCK_EXAM_BOARD_W} height={MOCK_EXAM_BOARD_H}>
        <ButtonBase
          onClick={onBack}
          aria-label="Back"
          sx={{
            position: 'absolute',
            left: 60,
            top: 78,
            width: 78,
            height: 80,
            borderRadius: '100px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0DF',
            color: '#2D3436',
            '&:active': { bgcolor: '#F9FAFB' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 40 }} />
        </ButtonBase>
        <Typography
          sx={{
            position: 'absolute',
            left: 157,
            top: 82,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: '70px',
            color: '#182230',
            fontFamily: FIGMA_FONT,
          }}
        >
          HSK {level} Practice Papers
        </Typography>
        <Box sx={{ position: 'absolute', left: 157, top: 157, display: 'flex', gap: '16px' }}>
          <PaperStatPill label="DURATION" value={summaryPaper ? `${summaryPaper.duration} min` : '--'} />
          <PaperStatPill label="QUESTIONS" value={summaryPaper?.questionCount ?? '--'} />
          <PaperStatPill label="FULL SCORE" value={summaryPaper?.maxScore ?? '--'} />
        </Box>

        {(loading || error || visiblePapers.length === 0) && (
          <Box sx={{ position: 'absolute', left: 157, top: 220, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Typography sx={{ color: error ? '#B91C1C' : '#64748B', fontWeight: 700, fontFamily: FIGMA_FONT }}>
              {loading ? 'Loading published papers…' : error || 'No published papers for this level.'}
            </Typography>
            {error && !loading && (
              <ButtonBase
                onClick={onRetry}
                sx={{ minHeight: 44, px: 2, borderRadius: '999px', bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', fontWeight: 800 }}
              >
                Retry
              </ButtonBase>
            )}
          </Box>
        )}

        {showOfficial && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: 61,
                top: 243,
                px: '18px',
                height: 57,
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: '#EF2D32',
                borderRadius: '18px',
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: '29px', color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
                Official
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', left: 61, top: 345, display: 'flex', flexWrap: 'wrap', gap: '55px', width: 1719 }}>
              {officialPapers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  attempt={paper.bestScore === undefined
                    ? undefined
                    : { score: paper.bestScore, completedAt: paper.bestScoreAt || new Date().toISOString() }}
                  onSelect={onSelectPaper}
                />
              ))}
            </Box>
          </>
        )}

        {showOfficial && showPractice && (
          <Box
            sx={{
              position: 'absolute',
              left: 62,
              right: 97,
              top: 672,
              borderTop: '3px dashed #D1DBE6',
            }}
          />
        )}

        {showPractice && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: 60,
                top: showOfficial ? 713 : 243,
                px: '18px',
                height: 57,
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: '#00A99D',
                borderRadius: '18px',
              }}
            >
              <Typography sx={{ fontSize: 23, fontWeight: 700, lineHeight: '28px', color: '#FFFFFF', fontFamily: FIGMA_FONT }}>
                Practice
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                left: 61,
                top: showOfficial ? 815 : 345,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '55px',
                width: 1795,
              }}
            >
              {practicePapers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  attempt={paper.bestScore === undefined
                    ? undefined
                    : { score: paper.bestScore, completedAt: paper.bestScoreAt || new Date().toISOString() }}
                  onSelect={onSelectPaper}
                />
              ))}
            </Box>
          </>
        )}
      </HubContainBoard>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ExamIntroScreen — 考试介绍（开始前）
   ═══════════════════════════════════════════════════════════════════════════════ */
function ExamIntroScreen({
  paper,
  onStart,
  onBack,
  starting,
  is960,
}: {
  paper: ExamPaper;
  onStart: () => void;
  onBack: () => void;
  starting: boolean;
  is960: boolean;
}) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const { t, i18n } = useTranslation();
  const sectionLines = paper.sectionLines;
  const listenLabel = paper.listeningPlays === 1 ? t('hskExamIntro.listenOnce') : t('hskExamIntro.listenTwice');
  const theme = PAPER_CARD_THEMES[paper.source];
  const isOfficial = paper.source === 'official';
  const accent = theme.volumeColor;
  const questionTypesAccent = '#A855F7';
  const examTypeLabel = isOfficial
    ? t('hskExamIntro.mockTest', { level: paper.level })
    : t('hskExamIntro.practiceTest', { level: paper.level });
  const startGradient = isOfficial
    ? 'linear-gradient(90deg, #F43F5E 0%, #FB7185 48%, #FB923C 100%)'
    : 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 48%, #0891B2 100%)';

  const card = {
    bgcolor: '#FFFFFF',
    borderRadius: is960 ? '20px' : '24px',
    border: '1px solid rgba(15,23,42,0.05)',
    boxShadow: '0 10px 32px rgba(15,23,42,0.07)',
    p: is960 ? 2 : 2.5,
  } as const;

  const sectionTitle = (text: string, barColor = accent) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1.25 : 1.75 }}>
      <Box sx={{ width: 5, height: is960 ? 18 : 22, borderRadius: '999px', bgcolor: barColor }} />
      <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#111827' }}>
        {text}
      </Typography>
    </Box>
  );

  const statItem = (icon: ReactNode, value: string | number, label: string, tint: string, tintBg: string) => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 1.2 : 1.6, px: is960 ? 1 : 1.75, py: 0.75 }}>
      <Box
        sx={{
          width: is960 ? 44 : 56,
          height: is960 ? 44 : 56,
          borderRadius: is960 ? '12px' : '16px',
          bgcolor: tintBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: tint,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.55rem' : '2rem', color: '#111827', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.95rem', color: '#4B5563', fontWeight: 700, lineHeight: 1.35, mt: 0.45 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FFF0F5 0%, #FFF5EE 28%, #FFF8F0 100%)',
      }}
    >
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ButtonBase
          onClick={onBack}
          disabled={starting}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'white', border: '1px solid #E5E7EB', color: '#586E75', flexShrink: 0, boxShadow: '0 2px 8px rgba(15,23,42,0.06)', '&:active': { bgcolor: '#F3F4F6' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.4rem' : '1.85rem', color: '#111827', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {t('hskExamIntro.volume', { volume: paper.volume })}
            </Typography>
            <Box
              sx={{
                px: is960 ? 1.15 : 1.4,
                py: is960 ? 0.45 : 0.55,
                borderRadius: '999px',
                background: theme.headerBg,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.55,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.92)', flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.74rem' : '0.9rem', color: '#FFFFFF', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                {examTypeLabel}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 2.5 : 3.5, pt: is960 ? 0.5 : 1, pb: is960 ? 1 : 1.5 }}>
        {/* Stat bar */}
        <Box sx={{ ...card, display: 'flex', alignItems: 'stretch', p: is960 ? 1.75 : 2.5, mb: is960 ? 1.5 : 2 }}>
          {statItem(<AccessTimeIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.duration, t('hskExamIntro.durationMin'), accent, isOfficial ? '#FEF2F2' : '#F0FDFA')}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<QuizOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.questionCount, t('hskExamIntro.totalQuestions'), '#2563EB', '#EFF6FF')}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<WorkspacePremiumOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.maxScore, t('hskExamIntro.fullScore'), '#CA8A04', '#FEF9C3')}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: is960 ? 1.5 : 2 }}>
          <Box sx={{ ...card, flex: 1.3, minWidth: 0, p: is960 ? 2 : 3 }}>
            {sectionTitle(t('hskExamIntro.examRules'))}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.5 }}>
              {[
                t('hskExamIntro.rule1'),
                <>
                  {t('hskExamIntro.rule2Prefix')}{' '}
                  <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>{listenLabel}</Box>
                  {t('hskExamIntro.rule2Suffix')}
                </>,
                <>
                  {t('hskExamIntro.rule3Prefix')}{' '}
                  <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>{t('hskExamIntro.autoSubmit')}</Box>
                  {t('hskExamIntro.rule3Suffix')}
                </>,
                t('hskExamIntro.rule4'),
              ].map((rule, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: is960 ? 1.1 : 1.35, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: is960 ? 26 : 32,
                      height: is960 ? 26 : 32,
                      borderRadius: '50%',
                      bgcolor: isOfficial ? '#FEF2F2' : '#F0FDFA',
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.1,
                      fontWeight: 900,
                      fontSize: is960 ? '0.72rem' : '0.86rem',
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#374151', fontWeight: 600, lineHeight: 1.5 }}>
                    {rule}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ ...card, flex: 1, minWidth: 0, p: is960 ? 2 : 3 }}>
            {sectionTitle(t('hskExamIntro.questionTypes'), questionTypesAccent)}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
              {sectionLines.map((line) => {
                const Icon = SECTION_ICONS[line.kind];
                return (
                  <Box
                    key={line.kind}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.35,
                      px: is960 ? 1.35 : 1.75,
                      py: is960 ? 1.15 : 1.4,
                      borderRadius: is960 ? '14px' : '18px',
                      bgcolor: '#F5F3FF',
                      border: '1px solid #EDE9FE',
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 38 : 48,
                        height: is960 ? 38 : 48,
                        borderRadius: '12px',
                        bgcolor: 'white',
                        border: '1px solid #DDD6FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: questionTypesAccent,
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: is960 ? 20 : 26 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#111827', fontWeight: 800, lineHeight: 1.25 }}>
                        {bilingualSectionLabel(line.kind, t, i18n.language)}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#6B7280', fontWeight: 600, lineHeight: 1.35, mt: 0.2 }}>
                        {t('hskExamIntro.questions', { count: line.questionCount })}
                      </Typography>
                    </Box>
                    {line.durationMinutes != null && line.durationMinutes > 0 && (
                      <Typography
                        sx={{
                          fontSize: is960 ? '0.82rem' : '0.95rem',
                          color: '#374151',
                          fontWeight: 800,
                          flexShrink: 0,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {t('hskExamIntro.minutesApprox', { count: line.durationMinutes })}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Sticky confirm bar */}
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2.5 : 3.5,
          pb: is960 ? 2 : 2.5,
          pt: is960 ? 1.25 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: is960 ? 1.25 : 2,
        }}
      >
        <ButtonBase
          onClick={() => setRulesAccepted((v) => !v)}
          disabled={starting}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            py: 0.5,
            borderRadius: '10px',
            flex: '1 1 auto',
            minWidth: 0,
            justifyContent: 'flex-start',
            '&:active': { opacity: 0.85 },
          }}
        >
          {rulesAccepted ? (
            <CheckBoxIcon sx={{ fontSize: is960 ? 22 : 26, color: accent, flexShrink: 0 }} />
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: is960 ? 22 : 26, color: '#9CA3AF', flexShrink: 0 }} />
          )}
          <Typography
            component="span"
            sx={{
              fontSize: is960 ? '0.8rem' : '0.92rem',
              color: '#374151',
              fontWeight: 700,
              textAlign: 'left',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
          >
            {t('hskExamIntro.rulesAccepted')}
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={onStart}
          disabled={!rulesAccepted || starting}
          sx={{
            flex: '0 0 auto',
            width: is960 ? 168 : 196,
            minHeight: is960 ? 48 : 54,
            px: 2,
            borderRadius: '999px',
            background: rulesAccepted && !starting ? startGradient : '#E5E7EB',
            color: rulesAccepted && !starting ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 900,
            fontSize: is960 ? '0.92rem' : '1.02rem',
            letterSpacing: '0.01em',
            boxShadow: rulesAccepted && !starting ? '0 10px 24px rgba(244,63,94,0.32)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.85,
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
          }}
        >
          {starting ? t('hskExamIntro.starting') : t('hskExamIntro.startExam')}
          {!starting && (
            <Box
              sx={{
                width: is960 ? 24 : 28,
                height: is960 ? 24 : 28,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: is960 ? 14 : 16 }} />
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
  const examTealDark = '#49A995';
  const isLastGroup = currentNavGroupIndex >= examNavGroups.length - 1;
  const groupRangeLabel = isGroupedQuestion
    ? `Questions ${groupQuestions.map(questionLabel).join(' · ')}`
    : currentQuestion.isExample ? 'Example' : `Question ${currentQuestion.number}`;
  const unansweredCount = paper.questions.filter((question) => !question.isExample && !answers[question.id]).length;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F5F6F8', overflow: 'hidden' }}>
      {/* Header — back | centered title + timer | submit */}
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.5,
          display: 'grid',
          gridTemplateColumns: '44px 1fr auto',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #ECEEF2',
        }}
      >
        <ButtonBase
          onClick={() => {
            if (!submitting) onExit();
          }}
          disabled={submitting}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#F3F4F6', color: '#64748B', '&:active': { bgcolor: '#E5E7EB' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>

        <Box sx={{ textAlign: 'center', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.05rem' : '1.22rem', color: '#111827', lineHeight: 1.2 }}>
            {examTitle}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
            <Typography
              sx={{
                fontSize: is960 ? '0.78rem' : '0.88rem',
                color: isCriticalTime && !timeHidden ? '#DC2626' : '#64748B',
                fontWeight: isCriticalTime && !timeHidden ? 800 : 600,
                lineHeight: 1.2,
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
                width: 36,
                height: 36,
                borderRadius: '8px',
                color: '#374151',
                flexShrink: 0,
                '&:active': { bgcolor: '#F3F4F6' },
              }}
            >
              {timeHidden ? (
                <VisibilityOffIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              ) : (
                <VisibilityIcon sx={{ fontSize: is960 ? 18 : 20 }} />
              )}
            </ButtonBase>
          </Box>
        </Box>

        <ButtonBase
          onClick={handleSubmit}
          disabled={isExpired || submitting}
          sx={{
            px: is960 ? 2 : 2.5,
            py: is960 ? 0.85 : 1,
            minHeight: 44,
            bgcolor: examTeal,
            color: '#FFFFFF',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: is960 ? '0.88rem' : '0.98rem',
            boxShadow: '0 4px 12px rgba(91,191,175,0.35)',
            '&:active': { transform: 'scale(0.97)', bgcolor: examTealDark },
            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
          }}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </ButtonBase>
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
            width: '100%',
            maxWidth: is960 ? 400 : 500,
            borderRadius: is960 ? '36px' : '44px',
            background: 'linear-gradient(180deg, #E8FAF4 0%, #F3FDF9 22%, #FFFFFF 48%)',
            boxShadow: '0 28px 56px rgba(15, 23, 42, 0.16)',
            pt: is960 ? 4.75 : 5.75,
            pb: is960 ? 2.25 : 2.75,
            px: is960 ? 2.25 : 3,
            mx: 2,
          },
        }}
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(15, 23, 42, 0.48)' },
          },
        }}
      >
        {/* Left ring decoration */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: is960 ? 10 : 14,
            left: is960 ? 18 : 26,
            width: is960 ? 40 : 48,
            height: is960 ? 40 : 48,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              left: 0,
              width: is960 ? 30 : 36,
              height: is960 ? 30 : 36,
              borderRadius: '50%',
              border: `${is960 ? 5 : 6}px solid ${examTeal}`,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: 'rotate(-24deg)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: is960 ? 10 : 12,
              left: is960 ? 18 : 22,
              width: is960 ? 12 : 14,
              height: is960 ? 12 : 14,
              borderRadius: '50%',
              bgcolor: '#D1D5DB',
            }}
          />
        </Box>

        {/* Right sparkle decoration */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: is960 ? 8 : 12,
            right: is960 ? 20 : 28,
            width: is960 ? 36 : 44,
            height: is960 ? 36 : 44,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,191,175,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '18%',
              left: '22%',
              width: is960 ? 14 : 18,
              height: is960 ? 14 : 18,
              background: examTeal,
              opacity: 0.18,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            },
          }}
        />

        {/* Top-center badge */}
        <Box
          sx={{
            position: 'absolute',
            top: is960 ? -30 : -36,
            left: '50%',
            transform: 'translateX(-50%)',
            width: is960 ? 58 : 68,
            height: is960 ? 58 : 68,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: is960 ? 36 : 42,
              height: is960 ? 36 : 42,
              borderRadius: is960 ? '11px' : '13px',
              bgcolor: '#DDF5EF',
              color: examTeal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EditNoteIcon sx={{ fontSize: is960 ? 22 : 26 }} />
          </Box>
        </Box>

        <Typography
          id="incomplete-submit-title"
          sx={{
            textAlign: 'center',
            fontWeight: 900,
            fontSize: is960 ? '1.15rem' : '1.35rem',
            color: '#111827',
            lineHeight: 1.35,
            px: is960 ? 1 : 2,
            mb: is960 ? 1.25 : 1.5,
          }}
        >
          Submit incomplete exam?
        </Typography>

        <Typography
          sx={{
            textAlign: 'center',
            fontSize: is960 ? '0.88rem' : '0.98rem',
            color: '#667085',
            fontWeight: 600,
            lineHeight: 1.5,
            px: is960 ? 0.5 : 1.5,
            mb: is960 ? 2 : 2.5,
          }}
        >
          {unansweredCount} questions are unanswered and will receive 0 points.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: is960 ? 1 : 1.25,
          }}
        >
          <ButtonBase
            disabled={submitting}
            onClick={() => setSubmitConfirmOpen(false)}
            sx={{
              flex: 1,
              minHeight: is960 ? 44 : 48,
              borderRadius: '999px',
              bgcolor: '#EFEFEF',
              color: '#374151',
              fontWeight: 800,
              fontSize: is960 ? '0.72rem' : '0.8rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              px: is960 ? 1.5 : 2,
              '&.Mui-disabled': { opacity: 0.55 },
              '&:active': { transform: 'scale(0.98)', bgcolor: '#E5E7EB' },
            }}
          >
            Continue answering
          </ButtonBase>
          <ButtonBase
            disabled={submitting}
            onClick={confirmIncompleteSubmit}
            sx={{
              flex: 1,
              minHeight: is960 ? 44 : 48,
              borderRadius: '999px',
              bgcolor: examTeal,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: is960 ? '0.72rem' : '0.8rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              px: is960 ? 1.5 : 2,
              boxShadow: '0 8px 20px rgba(91,191,175,0.35)',
              '&.Mui-disabled': { bgcolor: '#98A2B3', color: '#FFFFFF', boxShadow: 'none' },
              '&:active': { transform: 'scale(0.98)', bgcolor: examTealDark },
            }}
          >
            {submitting ? 'Submitting...' : 'Confirm submit'}
          </ButtonBase>
        </Box>
      </Dialog>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', width: '100%' }}>
        {/* Sidebar — progress grid (collapsible) */}
        <Box
          sx={{
            width: progressOpen ? (is960 ? 220 : 260) : 0,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.22s ease',
            bgcolor: '#FFFFFF',
            borderRight: progressOpen ? '1px solid #ECEEF2' : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: is960 ? 220 : 260,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: is960 ? 1.5 : 2, pt: is960 ? 1.5 : 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: is960 ? '0.88rem' : '0.98rem', fontWeight: 800, color: '#374151' }}>
                Progress
              </Typography>
              <ButtonBase
                onClick={() => setProgressOpen(false)}
                aria-label="Hide progress panel"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  color: '#64748B',
                  '&:active': { bgcolor: '#F1F5F9' },
                }}
              >
                <ViewListIcon sx={{ fontSize: is960 ? 20 : 22 }} />
              </ButtonBase>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 1.5 : 2, pb: 2 }}>
            {sidebarGroups.map((group) => {
              const Icon = SECTION_ICONS[group.section];
              const isActivePart = group.key === currentPartKey;
              return (
                <Box key={group.key} sx={{ mb: is960 ? 1.5 : 1.75 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      mb: 0.85,
                      px: isActivePart ? 0.75 : 0,
                      py: isActivePart ? 0.45 : 0,
                      borderRadius: '8px',
                      bgcolor: isActivePart ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <Icon sx={{ fontSize: is960 ? 15 : 16, color: isActivePart ? '#2563EB' : '#94A3B8' }} />
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.78rem' : '0.86rem',
                        fontWeight: isActivePart ? 800 : 700,
                        color: isActivePart ? '#1D4ED8' : '#64748B',
                        lineHeight: 1.2,
                      }}
                    >
                      {group.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: is960 ? 0.55 : 0.65 }}>
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
                            aspectRatio: slot.kind === 'single' ? '1' : undefined,
                            minHeight: slot.kind === 'range' ? (is960 ? 40 : 44) : undefined,
                            borderRadius: is960 ? '10px' : '12px',
                            bgcolor: isCurrent ? '#3B82F6' : hasAnswer ? '#DBEAFE' : partiallyAnswered ? '#EFF6FF' : '#F1F5F9',
                            color: isCurrent ? '#FFFFFF' : hasAnswer ? '#2563EB' : partiallyAnswered ? '#3B82F6' : '#94A3B8',
                            fontWeight: 800,
                            fontSize: is960 ? '0.72rem' : '0.8rem',
                            border: isCurrent ? 'none' : '1px solid #E2E8F0',
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          {slot.label}
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
            </Box>
          </Box>
        </Box>

        {/* Main question area — expands when sidebar collapsed */}
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFBFC' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: is960 ? 2.5 : 3.5, pt: is960 ? 2 : 2.5, pb: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1 : 1.25 }}>
              {!progressOpen && (
                <ButtonBase
                  onClick={() => setProgressOpen(true)}
                  aria-label="Show progress panel"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
                    '&:active': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <ViewListIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                </ButtonBase>
              )}
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.18rem', fontWeight: 800, color: '#111827' }}>
                {groupRangeLabel}
              </Typography>
              {isGroupedQuestion && isListening && (
                <ButtonBase
                  onClick={playCurrentAudio}
                  disabled={isAnsweringClosed}
                  sx={{
                    width: is960 ? 40 : 44,
                    height: is960 ? 40 : 44,
                    borderRadius: is960 ? '12px' : '14px',
                    bgcolor: '#FB923C',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(251,146,60,0.35)',
                    '&:active': { transform: 'scale(0.95)', bgcolor: '#F97316' },
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: is960 ? 22 : 24 }} />
                </ButtonBase>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: is960 ? 1.25 : 1.5 }}>
              <Box
                sx={{
                  px: is960 ? 0.85 : 1,
                  py: is960 ? 0.35 : 0.45,
                  borderRadius: '8px',
                  bgcolor: '#FFF7ED',
                  border: '1px solid #FDBA74',
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', fontWeight: 900, color: '#EA580C', lineHeight: 1.2, letterSpacing: '0.04em' }}>
                  {currentQuestion.templateCode}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', fontWeight: 600, color: '#64748B', lineHeight: 1.3 }}>
                {currentQuestion.templateLabel}
              </Typography>
              {currentQuestion.isExample && (
                <Box sx={{ px: 1, py: 0.35, borderRadius: '8px', bgcolor: '#E0F2FE', border: '1px solid #7DD3FC' }}>
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', fontWeight: 800, color: '#0369A1', lineHeight: 1.2 }}>
                    Example · not scored
                  </Typography>
                </Box>
              )}
            </Box>

            {isImageMatchGroup ? (
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
                      sx={{
                        width: is960 ? 64 : 72,
                        height: is960 ? 64 : 72,
                        borderRadius: is960 ? '18px' : '20px',
                        bgcolor: '#FB923C',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 20px rgba(251,146,60,0.38)',
                        '&:active': { transform: 'scale(0.95)', bgcolor: '#F97316' },
                      }}
                    >
                      <VolumeUpIcon sx={{ fontSize: is960 ? 32 : 36 }} />
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
                {currentQuestion.question ? (
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: is960 ? 2.5 : 3 }}>
                      <ButtonBase
                        onClick={playCurrentAudio}
                        disabled={isAnsweringClosed}
                      sx={{
                        width: is960 ? 64 : 72,
                        height: is960 ? 64 : 72,
                        borderRadius: is960 ? '18px' : '20px',
                        bgcolor: '#FB923C',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 20px rgba(251,146,60,0.38)',
                        '&:active': { transform: 'scale(0.95)', bgcolor: '#F97316' },
                      }}
                    >
                      <VolumeUpIcon sx={{ fontSize: is960 ? 32 : 36 }} />
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
                    gridTemplateColumns: `repeat(${optionColumns}, minmax(0, 1fr))`,
                    gap: is960 ? 1.25 : 1.75,
                    maxWidth: isImageOptions ? 640 : isPinyinTextOptions ? 560 : optionColumns >= 4 ? '100%' : 720,
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
                          aspectRatio: isPinyinTextOptions ? '1.15 / 1' : '1',
                          minHeight: is960
                            ? (isImageOptions ? 140 : isPinyinTextOptions ? 132 : 120)
                            : (isImageOptions ? 168 : isPinyinTextOptions ? 156 : 148),
                          bgcolor: '#FFFFFF',
                          border: isSelected ? `3px solid ${examTeal}` : '2px solid #E5E7EB',
                          borderRadius: is960 ? '16px' : '20px',
                          boxShadow: isSelected ? '0 8px 24px rgba(91,191,175,0.18)' : '0 2px 8px rgba(15,23,42,0.04)',
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
                              top: is960 ? 10 : 12,
                              left: is960 ? 10 : 12,
                              width: is960 ? 28 : 32,
                              height: is960 ? 28 : 32,
                              borderRadius: '8px',
                              bgcolor: isImageOptions ? '#F1F5F9' : isSelected ? examTeal : '#F1F5F9',
                              color: isImageOptions ? '#64748B' : isSelected ? '#FFFFFF' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: is960 ? '0.82rem' : '0.92rem',
                              zIndex: 1,
                              border: isImageOptions ? '1px solid #E2E8F0' : 'none',
                            }}
                          >
                            {letter}
                          </Box>
                        )}
                        {isImageOptions && imageSrc ? (
                          <Box
                            component="img"
                            src={imageSrc}
                            alt={`Option ${letter}`}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              p: is960 ? 2 : 2.5,
                              boxSizing: 'border-box',
                            }}
                          />
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
              px: is960 ? 2.5 : 3.5,
              py: is960 ? 1.5 : 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #ECEEF2',
              bgcolor: '#FFFFFF',
            }}
          >
            <ButtonBase
              onClick={handlePrevious}
              disabled={currentNavGroupIndex <= 0}
              sx={{
                px: is960 ? 2 : 2.5,
                py: is960 ? 0.85 : 1,
                minHeight: 44,
                bgcolor: currentNavGroupIndex > 0 ? '#FFFFFF' : 'transparent',
                color: currentNavGroupIndex > 0 ? '#64748B' : '#CBD5E1',
                border: currentNavGroupIndex > 0 ? '1.5px solid #E2E8F0' : '1.5px solid transparent',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: is960 ? '0.85rem' : '0.92rem',
              }}
            >
              Previous
            </ButtonBase>

            <ButtonBase
              onClick={isLastGroup ? handleSubmit : handleNext}
              disabled={isLastGroup ? isExpired || submitting : !isCurrentGroupComplete}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: is960 ? 2.25 : 2.75,
                py: is960 ? 0.9 : 1.05,
                minHeight: 44,
                bgcolor: ((isLastGroup && !isExpired) || isCurrentGroupComplete) ? examTeal : '#E5E7EB',
                color: ((isLastGroup && !isExpired) || isCurrentGroupComplete) ? '#FFFFFF' : '#9CA3AF',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: is960 ? '0.92rem' : '1rem',
                boxShadow: ((isLastGroup && !isExpired) || isCurrentGroupComplete)
                  ? '0 4px 14px rgba(91,191,175,0.35)'
                  : 'none',
                '&:active': ((isLastGroup && !isExpired) || isCurrentGroupComplete)
                  ? { transform: 'scale(0.97)', bgcolor: examTealDark }
                  : {},
                '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
              }}
            >
              {isLastGroup ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}
              <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 20 }} />
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

const RESULT_MODULE_THEMES: Record<ExamSectionKind, { tileBg: string; iconBg: string; accent: string }> = {
  listening: { tileBg: '#E8F6FF', iconBg: '#BAE6FD', accent: '#0284C7' },
  reading: { tileBg: '#ECFDF5', iconBg: '#A7F3D0', accent: '#059669' },
  writing: { tileBg: '#F5F3FF', iconBg: '#DDD6FE', accent: '#7C3AED' },
};

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
  is960,
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
  is960: boolean;
}) {
  const { t } = useTranslation();
  const reviewStatusItems: ReviewStatusItem[] = result.reviewSummary?.length
    ? result.reviewSummary
    : review?.items || [];
  const groups = buildReviewGroups(reviewStatusItems);
  const moduleScores = result.moduleScores || [];
  const passed = Boolean(result.passed);
  const scoreRate = Math.round(Number(result.scoreRate || 0));
  const totalQuestions = (result.correctCount ?? 0) + (result.incorrectCount ?? 0) + (result.unansweredCount ?? 0) || paper.questionCount;
  const durationSeconds = Math.max(0, Number(result.durationSeconds || 0));
  const durationMinutes = Math.floor(durationSeconds / 60);
  const durationRemainder = durationSeconds % 60;

  const moduleTiles: ExamSectionKind[] = ['listening', 'reading', 'writing'];
  const moduleByKind = new Map<ExamSectionKind, (typeof moduleScores)[number]>();
  moduleScores.forEach((module) => {
    const kind = resolveModuleKind(module);
    if (kind) moduleByKind.set(kind, module);
  });

  const card = {
    bgcolor: '#FFFFFF',
    borderRadius: is960 ? '14px' : '18px',
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        background: 'linear-gradient(145deg, #F4FAF7 0%, #F8FAFC 55%, #EFF6FF 100%)',
        p: is960 ? 2 : 3,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: is960 ? 1.5 : 2,
          }}
        >
          <ButtonBase
            onClick={onGoHome}
            sx={{
              width: is960 ? 40 : 44,
              height: is960 ? 40 : 44,
              borderRadius: '50%',
              bgcolor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#586E75',
              boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
              '&:active': { bgcolor: '#F3F4F6' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 22 : 24 }} />
          </ButtonBase>
          <FeedbackEntryButton
            is960={is960}
            forceShow
            context={{ screen: 'hsk_exam_result', paperId: paper.id }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: is960 ? '1.15fr 0.85fr' : '1.25fr 0.75fr',
            gap: is960 ? 2 : 2.5,
            alignItems: 'stretch',
          }}
        >
          {/* Left — score breakdown + answer review */}
          <Box sx={{ ...card, p: is960 ? 2 : 2.75, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, color: '#111827', mb: is960 ? 1.5 : 2 }}>
              {t('hskExamResult.scoreDetails')}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: is960 ? 1 : 1.25, mb: is960 ? 2 : 2.5 }}>
              {moduleTiles.map((kind) => {
                const module = moduleByKind.get(kind);
                const theme = RESULT_MODULE_THEMES[kind];
                const Icon = RESULT_SECTION_ICONS[kind];
                return (
                  <Box
                    key={kind}
                    sx={{
                      bgcolor: theme.tileBg,
                      borderRadius: is960 ? '10px' : '12px',
                      p: is960 ? 1.25 : 1.5,
                      textAlign: 'center',
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 30 : 36,
                        height: is960 ? 30 : 36,
                        borderRadius: is960 ? '8px' : '10px',
                        bgcolor: theme.iconBg,
                        color: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 0.75,
                      }}
                    >
                      <Icon sx={{ fontSize: is960 ? 17 : 20 }} />
                    </Box>
                    <Typography sx={{ color: theme.accent, fontSize: is960 ? '1.15rem' : '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>
                      {module ? formatModuleScoreValue(module, result.scoringMode) : '0'}
                    </Typography>
                    <Typography sx={{ color: '#667085', fontWeight: 700, fontSize: is960 ? '0.68rem' : '0.78rem', mt: 0.35, lineHeight: 1.25 }}>
                      {t(`hskExamIntro.sections.${kind}`)}
                    </Typography>
                  </Box>
                );
              })}
              <Box
                sx={{
                  bgcolor: '#FFF7ED',
                  borderRadius: is960 ? '10px' : '12px',
                  p: is960 ? 1.25 : 1.5,
                  textAlign: 'center',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: is960 ? 30 : 36,
                    height: is960 ? 30 : 36,
                    borderRadius: is960 ? '8px' : '10px',
                    bgcolor: '#FED7AA',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 0.75,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: is960 ? 17 : 20 }} />
                </Box>
                <Typography sx={{ color: '#EA580C', fontSize: is960 ? '1.15rem' : '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>
                  {result.correctCount ?? 0}/{totalQuestions}
                </Typography>
                <Typography sx={{ color: '#667085', fontWeight: 700, fontSize: is960 ? '0.68rem' : '0.78rem', mt: 0.35, lineHeight: 1.25 }}>
                  {t('hskExamResult.correctCount')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.2rem', fontWeight: 900, color: '#111827' }}>
                {t('hskExamResult.answerReview')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.25 : 1.75, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#12B76A' }} />
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#667085', fontWeight: 700 }}>
                    {t('hskExamResult.correct')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F04438' }} />
                  <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#667085', fontWeight: 700 }}>
                    {t('hskExamResult.incorrect')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {reviewError && (
              <Typography sx={{ color: '#B91C1C', mb: 1.25, fontSize: is960 ? '0.82rem' : '0.9rem' }}>{reviewError}</Typography>
            )}

            <Box
              sx={{
                flex: 1,
                minHeight: is960 ? 180 : 220,
                maxHeight: is960 ? 260 : 320,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: is960 ? 0.75 : 1 }}>
                {groups.map((group) => {
                  const color = group.unanswered ? '#667085' : group.correct ? '#0F766E' : '#DC2626';
                  const bg = group.unanswered ? '#F2F4F7' : group.correct ? '#E9F9F4' : '#FFF0F1';
                  return (
                    <ButtonBase
                      key={group.id}
                      onClick={() => onOpenReview(group.items[0]?.itemUid)}
                      sx={{
                        minHeight: is960 ? 48 : 54,
                        borderRadius: is960 ? '10px' : '12px',
                        bgcolor: bg,
                        color,
                        fontWeight: 900,
                        fontSize: is960 ? '0.82rem' : '0.92rem',
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      {group.label}
                    </ButtonBase>
                  );
                })}
              </Box>
              {!groups.length && reviewLoading && !reviewError && (
                <Typography sx={{ color: '#98A2B3', mt: 1 }}>{t('hskExamResult.loadingReview')}</Typography>
              )}
              {!groups.length && !reviewLoading && !reviewError && (
                <Typography sx={{ color: '#98A2B3', mt: 1 }}>{t('hskExamResult.noReview')}</Typography>
              )}
            </Box>
          </Box>

          {/* Right — summary + actions (match result card mock) */}
          <Box
            sx={{
              bgcolor: '#F3F5F7',
              borderRadius: is960 ? '22px' : '28px',
              p: is960 ? 2.5 : 3.25,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(226,232,240,0.95)',
              boxShadow: '0 14px 36px rgba(15, 23, 42, 0.07)',
            }}
          >
            {passed && (
              <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {[
                  { top: '10%', left: '14%', color: '#F59E0B', rotate: 18, w: 7, h: 11 },
                  { top: '8%', left: '72%', color: '#EF4444', rotate: -24, w: 6, h: 9 },
                  { top: '16%', left: '58%', color: '#12B76A', rotate: 36, w: 8, h: 6 },
                  { top: '22%', left: '82%', color: '#3B82F6', rotate: -12, w: 7, h: 10 },
                  { top: '28%', left: '20%', color: '#FBBF24', rotate: 48, w: 6, h: 8 },
                  { top: '18%', left: '38%', color: '#FFFFFF', rotate: -32, w: 7, h: 7, border: '1px solid #E5E7EB' },
                  { top: '32%', left: '68%', color: '#06B6D4', rotate: 20, w: 5, h: 9 },
                ].map((piece, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: is960 ? piece.w * 0.85 : piece.w,
                      height: is960 ? piece.h * 0.85 : piece.h,
                      borderRadius: '2px',
                      bgcolor: piece.color,
                      border: piece.border,
                      top: piece.top,
                      left: piece.left,
                      transform: `rotate(${piece.rotate}deg)`,
                      opacity: 0.9,
                    }}
                  />
                ))}
              </Box>
            )}

            <Typography
              sx={{
                fontSize: is960 ? '1.15rem' : '1.35rem',
                fontWeight: 900,
                color: '#1E3A5F',
                mb: is960 ? 1.5 : 2,
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {paper.title}
            </Typography>

            <Box sx={{ position: 'relative', zIndex: 1, mb: is960 ? 1.1 : 1.4, display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <Typography
                component="span"
                sx={{
                  fontSize: is960 ? '3.8rem' : '5rem',
                  lineHeight: 0.95,
                  color: passed ? '#12B76A' : '#F04438',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                }}
              >
                {result.score ?? 0}
              </Typography>
              <Typography
                component="span"
                sx={{ color: '#98A2B3', fontSize: is960 ? '1.25rem' : '1.55rem', fontWeight: 700, ml: 0.75 }}
              >
                /{result.totalScore}
              </Typography>
            </Box>

            <Box sx={{ width: '88%', maxWidth: 260, mb: 0.9, position: 'relative', zIndex: 1 }}>
              <Box sx={{ height: is960 ? 7 : 9, borderRadius: '999px', bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, scoreRate))}%`,
                    borderRadius: '999px',
                    background: passed
                      ? 'linear-gradient(90deg, #14B8A6 0%, #38BDF8 100%)'
                      : 'linear-gradient(90deg, #14B8A6 0%, #38BDF8 100%)',
                    transition: 'width 600ms ease',
                  }}
                />
              </Box>
            </Box>

            <Typography
              sx={{
                color: '#8A94A6',
                fontWeight: 600,
                fontSize: is960 ? '0.82rem' : '0.92rem',
                mb: is960 ? 2 : 2.5,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {t('hskExamResult.overallScoreRate', { rate: scoreRate })}
            </Typography>

            <Box
              sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: is960 ? '16px' : '18px',
                overflow: 'hidden',
                mb: is960 ? 2.25 : 2.75,
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: is960 ? 1.75 : 2.1,
                  py: is960 ? 1.35 : 1.55,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: is960 ? 30 : 34,
                      height: is960 ? 30 : 34,
                      borderRadius: '50%',
                      bgcolor: '#E8F9F0',
                      color: '#12B76A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TaskAltIcon sx={{ fontSize: is960 ? 17 : 19 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#8A94A6', fontSize: is960 ? '0.84rem' : '0.94rem' }}>
                    {t('hskExamResult.bestScore')}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#12B76A', fontSize: is960 ? '0.95rem' : '1.05rem', flexShrink: 0 }}>
                  {t('hskExamResult.scorePoints', { score: result.bestScore ?? result.score ?? 0 })}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: is960 ? 1.75 : 2.1,
                  py: is960 ? 1.35 : 1.55,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: is960 ? 30 : 34,
                      height: is960 ? 30 : 34,
                      borderRadius: '50%',
                      bgcolor: '#E8F1FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: is960 ? 17 : 19 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#8A94A6', fontSize: is960 ? '0.84rem' : '0.94rem' }}>
                    {t('hskExamResult.examDuration')}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#667085', fontSize: is960 ? '0.9rem' : '1rem', flexShrink: 0 }}>
                  {t('hskExamResult.durationFormat', { minutes: durationMinutes, seconds: durationRemainder })}
                </Typography>
              </Box>
            </Box>

            <ButtonBase
              onClick={() => onOpenReview()}
              disabled={reviewOpening}
              sx={{
                width: '100%',
                minHeight: is960 ? 50 : 54,
                borderRadius: is960 ? '16px' : '18px',
                background: 'linear-gradient(90deg, #14B8A6 0%, #22D3EE 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: is960 ? '0.98rem' : '1.08rem',
                mb: 1.35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                px: 2,
                boxShadow: '0 10px 24px rgba(20, 184, 166, 0.28)',
                '&.Mui-disabled': { bgcolor: '#98A2B3', background: '#98A2B3', color: '#FFFFFF' },
              }}
            >
              <Box component="span" sx={{ flex: 1, textAlign: 'center' }}>
                {reviewOpening
                  ? t('hskExamResult.openingDetails')
                  : reviewError && !review
                    ? t('hskExamResult.retryDetails')
                    : t('hskExamResult.viewDetails')}
              </Box>
              {!reviewOpening && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: is960 ? 10 : 12,
                    width: is960 ? 28 : 32,
                    height: is960 ? 28 : 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: is960 ? 16 : 18 }} />
                </Box>
              )}
            </ButtonBase>

            <ButtonBase
              onClick={onRestart}
              disabled={retakeAvailable !== true && !retakeError}
              sx={{
                width: '100%',
                minHeight: is960 ? 48 : 52,
                borderRadius: is960 ? '16px' : '18px',
                bgcolor: '#E8EAED',
                color: '#5B6472',
                fontWeight: 800,
                fontSize: is960 ? '0.95rem' : '1.02rem',
                position: 'relative',
                zIndex: 1,
                '&.Mui-disabled': { color: '#98A2B3', bgcolor: '#F2F4F7' },
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
              <Typography sx={{ color: '#B42318', fontSize: '0.82rem', mt: 1.25, position: 'relative', zIndex: 1 }}>
                {retakeError}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ReviewScreen({ paper, review, scoringMode, initialItemUid, onBack, is960 }: { paper: ExamPaper; review: AttemptReview; scoringMode: AttemptResult['scoringMode']; initialItemUid?: string; onBack: () => void; is960: boolean }) {
  const initialIndex = Math.max(0, review.items.findIndex((item) => item.itemUid === initialItemUid));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = review.items[currentIndex];
  const groups = buildReviewGroups(review.items);

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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Box sx={{ minHeight: is960 ? 58 : 72, px: is960 ? 2 : 3, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', bgcolor: '#FFFFFF', borderBottom: '1px solid #EAECF0' }}>
        <ButtonBase onClick={onBack} sx={{ justifySelf: 'start', width: 42, height: 42, borderRadius: '50%', bgcolor: '#F2F4F7' }}><ChevronLeftIcon /></ButtonBase>
        <Box sx={{ textAlign: 'center' }}><Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.35rem' }}>{paper.title}</Typography><Typography sx={{ color: '#667085', fontSize: '0.8rem' }}>Submitted · review only</Typography></Box>
      </Box>

      <Box sx={{ minHeight: 0, flex: 1, display: 'grid', gridTemplateColumns: is960 ? '220px 1fr' : '280px 1fr' }}>
        <Box sx={{ overflow: 'auto', bgcolor: '#FFFFFF', borderRight: '1px solid #EAECF0', p: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Answer progress</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
            {groups.map((group) => {
              const selected = group.items.some((item) => item.itemUid === current.itemUid);
              return <ButtonBase key={group.id} onClick={() => setCurrentIndex(review.items.findIndex((item) => item.itemUid === group.items[0]?.itemUid))} sx={{ minHeight: 42, borderRadius: '8px', border: selected ? '2px solid #0EAD8B' : '1px solid #D0D5DD', color: group.unanswered ? '#667085' : group.correct ? '#0EAD8B' : '#F04438', fontWeight: 900 }}>{group.label}</ButtonBase>;
            })}
          </Box>
        </Box>

        <Box sx={{ overflow: 'auto', p: is960 ? 2.5 : 4 }}>
          <Box sx={{ maxWidth: 860, mx: 'auto' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.2rem', mb: 1 }}>Question {current.questionNumber || currentIndex + 1}</Typography>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.4rem', fontWeight: 800, mb: 2 }}>{contentText(current.content) || current.questionType}</Typography>
            {current.audioUrl && <ButtonBase onClick={playAudio} sx={{ width: 52, height: 52, bgcolor: '#FF8F3D', color: '#FFFFFF', borderRadius: '8px', mb: 2 }}><VolumeUpIcon /></ButtonBase>}

            {!!current.options?.length && (
              <Box sx={{ display: 'grid', gridTemplateColumns: current.options.length > 3 ? 'repeat(3, 1fr)' : `repeat(${current.options.length}, 1fr)`, gap: 1.25, mb: 2 }}>
                {current.options.map((option, index) => {
                  const value = optionValue(option, index);
                  const selected = answerContains(current.submittedAnswer, value);
                  const correct = answerContains(current.correctAnswer, value);
                  const borderColor = correct ? '#0EAD8B' : selected ? '#F04438' : '#D0D5DD';
                  return (
                    <Box key={`${value}-${index}`} sx={{ minHeight: 90, border: `2px solid ${borderColor}`, borderRadius: '8px', p: 1.5, bgcolor: correct ? '#ECFDF3' : selected ? '#FFF1F3' : '#FFFFFF' }}>
                      <Typography sx={{ fontWeight: 900, mb: 0.75 }}>{value}</Typography>
                      {option.image && <Box component="img" src={option.image} alt={option.text || value} sx={{ display: 'block', width: '100%', maxHeight: 150, objectFit: 'contain', mb: option.text ? 0.75 : 0 }} />}
                      {option.text && <Typography sx={{ fontWeight: 700 }}>{option.text}</Typography>}
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box sx={{ borderRadius: '8px', p: 2, bgcolor: current.unanswered ? '#F2F4F7' : current.correct ? '#ECFDF3' : '#FFF1F3', border: `1px solid ${current.unanswered ? '#D0D5DD' : current.correct ? '#ABEFC6' : '#FECDD6'}` }}>
              <Typography sx={{ fontWeight: 900, color: current.unanswered ? '#344054' : current.correct ? '#067647' : '#C01048' }}>{current.unanswered ? 'Unanswered' : current.correct ? 'Correct' : 'Incorrect'}</Typography>
              {scoringMode === 'per_item' && (
                <Typography sx={{ mt: 0.75, fontWeight: 800 }}>Score: {current.score} / {current.maxScore}</Typography>
              )}
              <Typography sx={{ mt: 0.75 }}>Your answer: {submittedAnswer}</Typography>
              {correctAnswer && <Typography>Correct answer: {correctAnswer}</Typography>}
              {explanation && <Typography sx={{ mt: 1, color: '#475467' }}>{explanation}</Typography>}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 1.25, display: 'flex', justifyContent: 'space-between', bgcolor: '#FFFFFF', borderTop: '1px solid #EAECF0' }}>
        <ButtonBase disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))} sx={{ px: 2, py: 1, border: '1px solid #D0D5DD', borderRadius: '8px', '&.Mui-disabled': { opacity: 0.35 } }}>Previous</ButtonBase>
        <Typography sx={{ alignSelf: 'center', color: '#667085', fontWeight: 700 }}>{currentIndex + 1} / {review.items.length}</Typography>
        <ButtonBase disabled={currentIndex === review.items.length - 1} onClick={() => setCurrentIndex((value) => Math.min(review.items.length - 1, value + 1))} sx={{ px: 2, py: 1, border: '1px solid #D0D5DD', borderRadius: '8px', '&.Mui-disabled': { opacity: 0.35 } }}>Next</ButtonBase>
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
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
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
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#FFFBF5', p: 3 }}>
        <Box sx={{ maxWidth: 520, textAlign: 'center' }}>
          <Typography sx={{ color: '#B42318', fontWeight: 800, mb: 2 }}>{sessionRestoreError}</Typography>
          <ButtonBase
            onClick={() => setSessionRestoreNonce((value) => value + 1)}
            sx={{ px: 3, py: 1.25, borderRadius: '8px', bgcolor: '#0EAD8B', color: '#FFFFFF', fontWeight: 900 }}
          >
            Retry
          </ButtonBase>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {currentScreen !== 'home' && currentScreen !== 'papers' && !isWebsiteEmbed && <SystemStatusBar variant="inline" />}
      <Box sx={{ flex: 1, minHeight: 0 }}>
    <AnimatePresence mode="wait">
      {currentScreen === 'home' && (
        <motion.div key={paperTrack ? 'levels' : 'version'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          {paperTrack ? (
            <HomeScreen
              onSelectLevel={handleSelectLevel}
              onBack={handleBackFromLevels}
              showBack={!isWebsiteEmbed}
            />
          ) : (
            <VersionScreen
              onSelect={handleSelectTrack}
              onBack={handleExitToHub}
              showBack={!isWebsiteEmbed}
            />
          )}
        </motion.div>
      )}

      {currentScreen === 'papers' && selectedLevel && (
        <motion.div key="papers" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <PaperSelectionScreen
            level={selectedLevel}
            papers={catalogPapers}
            loading={catalogLoading}
            error={flowError}
            onSelectPaper={handleSelectPaper}
            onBack={handleBackToHome}
            onRetry={() => void loadCatalogPapers(selectedLevel)}
            is960={is960}
            paperTrack={paperTrack}
          />
        </motion.div>
      )}

      {currentScreen === 'intro' && activePaper && (
        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%' }}>
          <>
            {flowError && <Typography sx={{ color: '#B91C1C', px: 3, pt: 1 }}>{flowError}</Typography>}
            <ExamIntroScreen paper={activePaper} onStart={handleStartExam} onBack={handleBackToPapers} starting={startLoading} is960={is960} />
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
          <ResultScreen paper={activePaper} result={examResult} review={attemptReview} reviewError={reviewError} reviewLoading={reviewLoading} reviewOpening={reviewOpening} retakeAvailable={retakeAvailable} retakeError={retakeError} onOpenReview={handleOpenReview} onRestart={handleRestart} onGoHome={handleExitToHub} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'review' && attemptReview && activePaper && examResult && (
        <motion.div key="review" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <ReviewScreen paper={activePaper} review={attemptReview} scoringMode={examResult.scoringMode} initialItemUid={reviewStartItemUid} onBack={() => setCurrentScreen('result')} is960={is960} />
        </motion.div>
      )}
    </AnimatePresence>
      </Box>
    </Box>
  );
}
