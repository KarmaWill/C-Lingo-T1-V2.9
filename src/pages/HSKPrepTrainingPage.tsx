/**
 * HSK Prep Training — HSK 备考训练完整版
 * 从 hsk-mock-exam.zip 还原，适配 iPad 交互
 * HomeScreen → PaperSelectionScreen → ExamIntroScreen → ExamScreen → ResultScreen
 */
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  ButtonBase,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReplayIcon from '@mui/icons-material/Replay';
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
  title: string;
  detail: string;
  duration?: string;
}

interface PaperAttemptRecord {
  score: number;
  completedAt: string;
}

const SCORE_BADGE_BG = {
  none: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
  pass: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
  fail: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
} as const;

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
    brandLabel: source === 'official' ? `Volume ${index + 1}` : 'Custom',
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
    .map((item) => ({
      title: titles[item.module || ''] || item.module || 'Questions',
      detail: `${item.count} questions`,
      duration: Number(item.minutes || 0) > 0 ? `~${item.minutes} min` : undefined,
    }));
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

interface LevelPickerItem {
  id: LevelPickerId;
  title: string;
  desc: string;
  color: string;
  tint: string;
  badgeGradient: string;
  enabled: boolean;
}

const LEVEL_PICKER_ITEMS: LevelPickerItem[] = [
  { id: 1, title: 'HSK 1', desc: '150 words · Beginner', color: '#E8941A', tint: '#FFF8EB', badgeGradient: 'linear-gradient(145deg, #F0A830 0%, #E8941A 100%)', enabled: true },
  { id: 2, title: 'HSK 2', desc: '300 words · Elementary', color: '#1FA396', tint: '#ECFDF9', badgeGradient: 'linear-gradient(145deg, #2DB8A8 0%, #1FA396 100%)', enabled: true },
  { id: 3, title: 'HSK 3', desc: '600 words · Intermediate', color: '#E59B73', tint: '#FFF7F2', badgeGradient: 'linear-gradient(145deg, #F3B18E 0%, #DF8D65 100%)', enabled: false },
  { id: 4, title: 'HSK 4', desc: '1200 words · Upper intermediate', color: '#B78591', tint: '#FFF7F9', badgeGradient: 'linear-gradient(145deg, #C99AA5 0%, #AE7885 100%)', enabled: false },
  { id: 5, title: 'HSK 5', desc: '2500 words · Advanced', color: '#8796AA', tint: '#F7F9FC', badgeGradient: 'linear-gradient(145deg, #A6B2C2 0%, #7D8DA4 100%)', enabled: false },
  { id: 6, title: 'HSK 6', desc: '5000+ words · Proficient', color: '#9B8DB5', tint: '#FAF8FD', badgeGradient: 'linear-gradient(145deg, #B1A5C7 0%, #9080AB 100%)', enabled: false },
  { id: 'hsk7-9', title: 'HSK 7–9', desc: 'Advanced fluency · Coming soon', color: '#8993A3', tint: '#F8FAFC', badgeGradient: 'linear-gradient(145deg, #A6AFBD 0%, #7E899A 100%)', enabled: false },
];

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

const PAPER_SECTIONS: { source: PaperSource; label: string; labelEn: string; accent: string }[] = [
  { source: 'official', label: 'HSK 官方', labelEn: 'Official Mock Papers', accent: '#DC2626' },
  { source: 'clingo', label: 'C-Lingo 自研', labelEn: 'C-Lingo Practice', accent: '#00B4A0' },
];

const PAPER_CARD_THEMES: Record<
  PaperSource,
  {
    headerBg: string;
    headerColor: string;
    volumeColor: string;
    subColor: string;
    borderColor: string;
    lineColor: string;
  }
> = {
  official: {
    headerBg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    headerColor: '#FFFFFF',
    volumeColor: '#DC2626',
    subColor: '#7F1D1D',
    borderColor: '#FECACA',
    lineColor: '#FCA5A5',
  },
  clingo: {
    headerBg: 'linear-gradient(135deg, #2DD4BF 0%, #0891B2 100%)',
    headerColor: '#FFFFFF',
    volumeColor: '#0D9488',
    subColor: '#115E59',
    borderColor: '#99F6E4',
    lineColor: '#5EEAD4',
  },
};

const SECTION_ICONS: Record<ExamSectionKind, typeof HeadphonesIcon> = {
  listening: HeadphonesIcon,
  reading: MenuBookIcon,
  writing: EditNoteIcon,
};

function HeaderStatChip({ label, value, is960 }: { label: string; value: string | number; is960: boolean }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: is960 ? 0.55 : 0.7,
        px: is960 ? 1 : 1.2,
        py: is960 ? 0.45 : 0.55,
        borderRadius: '999px',
        bgcolor: '#F8FAFC',
        border: '1px solid #E2E8F0',
      }}
    >
      <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.7rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#1E293B', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

function SectionDividerTitle({
  label,
  source,
  is960,
}: {
  label: string;
  source: PaperSource;
  is960: boolean;
}) {
  const isOfficial = source === 'official';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, mb: is960 ? 1.25 : 1.5 }}>
      <Box
        sx={{
          px: is960 ? 1.15 : 1.35,
          py: is960 ? 0.45 : 0.55,
          borderRadius: '12px',
          background: isOfficial
            ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
            : 'linear-gradient(135deg, #14B8A6 0%, #0891B2 100%)',
          boxShadow: isOfficial ? '0 4px 14px rgba(185,28,28,0.22)' : '0 4px 14px rgba(8,145,178,0.28)',
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.88rem' : '1rem', color: '#FFFFFF', letterSpacing: '0.01em' }}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          height: 2,
          borderRadius: '999px',
          background: isOfficial
            ? 'linear-gradient(90deg, rgba(239,68,68,0.45), transparent)'
            : 'linear-gradient(90deg, rgba(20,184,166,0.55), transparent)',
        }}
      />
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HomeScreen — HSK 级别选择
   ═══════════════════════════════════════════════════════════════════════════════ */
function levelBadgeLabel(id: LevelPickerId): string {
  return id === 'hsk7-9' ? '7–9' : String(id);
}

function HomeScreen({
  onSelectLevel,
  onBack,
  is960,
  showBack = true,
}: {
  onSelectLevel: (level: HSKLevel) => void;
  onBack: () => void;
  is960: boolean;
  showBack?: boolean;
}) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.5 : 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <ButtonBase
          onClick={onBack}
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.05)',
            color: '#586E75',
            flexShrink: 0,
            visibility: showBack ? 'visible' : 'hidden',
            pointerEvents: showBack ? 'auto' : 'none',
            '&:active': { bgcolor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.2rem' : '1.42rem', color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Mock Exam
          </Typography>
          <Box sx={{ px: is960 ? 1.1 : 1.25, py: is960 ? 0.4 : 0.5, borderRadius: '999px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.95rem', color: '#64748B', fontWeight: 700, lineHeight: 1.2 }}>
              Choose level
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
          gap: is960 ? 1 : 1.25,
        }}
      >
        {LEVEL_PICKER_ITEMS.map((item) => {
          const locked = !item.enabled;

          const cardBody = (
            <>
              <Box
                sx={{
                  width: is960 ? 64 : 72,
                  height: is960 ? 64 : 72,
                  borderRadius: is960 ? '16px' : '18px',
                  background: item.badgeGradient,
                  opacity: locked ? 0.45 : 1,
                  boxShadow: locked ? 'none' : '0 6px 16px rgba(15,23,42,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.55rem', color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {levelBadgeLabel(item.id)}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, mx: is960 ? 1.5 : 1.85 }}>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.12rem' : '1.32rem', color: locked ? '#9CA3AF' : '#111827', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: is960 ? '0.82rem' : '0.95rem',
                    color: locked ? '#B0B7C3' : '#64748B',
                    fontWeight: 600,
                    mt: is960 ? 0.4 : 0.5,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>

              {locked ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: is960 ? 1.35 : 1.6,
                    py: is960 ? 0.75 : 0.9,
                    borderRadius: '999px',
                    bgcolor: '#E2E8F0',
                    border: '1px solid #CBD5E1',
                    flexShrink: 0,
                  }}
                >
                  <LockIcon sx={{ fontSize: is960 ? 20 : 22, color: '#94A3B8' }} />
                  <Typography sx={{ fontSize: is960 ? '0.88rem' : '1rem', fontWeight: 800, color: '#94A3B8' }}>Locked</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: is960 ? 1.5 : 1.75,
                    py: is960 ? 0.8 : 0.95,
                    borderRadius: '999px',
                    background: item.badgeGradient,
                    boxShadow: '0 4px 14px rgba(15,23,42,0.14)',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Enter</Typography>
                  <ChevronRightIcon sx={{ fontSize: is960 ? 22 : 24, color: '#FFFFFF' }} />
                </Box>
              )}
            </>
          );

          const cardSx = {
            display: 'flex',
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            minHeight: is960 ? 84 : 96,
            px: is960 ? 1.75 : 2.25,
            py: is960 ? 1.35 : 1.65,
            borderRadius: is960 ? '18px' : '20px',
            bgcolor: locked ? '#F1F5F9' : '#FFFFFF',
            border: locked ? '1.5px solid #E2E8F0' : `1.5px solid ${item.color}28`,
            boxShadow: locked ? 'none' : '0 6px 20px rgba(15,23,42,0.07)',
            textAlign: 'left' as const,
            opacity: locked ? 0.82 : 1,
            position: 'relative' as const,
            overflow: 'hidden' as const,
            gridColumn: item.id === 'hsk7-9' ? '1 / -1' : undefined,
            ...(locked
              ? {}
              : {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: item.color,
                    borderRadius: '4px 0 0 4px',
                  },
                }),
          };

          if (locked) {
            return (
              <Box key={String(item.id)} sx={cardSx}>
                {cardBody}
              </Box>
            );
          }

          return (
            <ButtonBase
              key={String(item.id)}
              onClick={() => onSelectLevel(item.id as HSKLevel)}
              sx={{
                ...cardSx,
                '&:active': { transform: 'scale(0.99)', bgcolor: item.tint },
              }}
            >
              {cardBody}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PaperSelectionScreen — 官方 / C-Lingo 自研 分区选卷（按级别）
   ═══════════════════════════════════════════════════════════════════════════════ */
function PaperCard({
  paper,
  cardSize,
  fluid,
  is960,
  attempt,
  onSelect,
}: {
  paper: PaperCatalogItem;
  cardSize?: number;
  fluid?: boolean;
  is960: boolean;
  attempt?: PaperAttemptRecord;
  onSelect: (paper: PaperCatalogItem) => void;
}) {
  const theme = PAPER_CARD_THEMES[paper.source];
  const savedScore = attempt?.score;
  const hasScore = savedScore !== undefined;
  const passed = hasScore && savedScore >= paper.passScore;
  const scoreBadgeBg = !hasScore ? SCORE_BADGE_BG.none : passed ? SCORE_BADGE_BG.pass : SCORE_BADGE_BG.fail;
  const dateLabel = attempt ? formatPaperDate(attempt.completedAt) : '--';

  return (
    <ButtonBase
      onClick={() => onSelect(paper)}
      sx={{
        width: fluid ? '100%' : cardSize,
        height: fluid ? 'auto' : cardSize,
        aspectRatio: fluid ? '1 / 1' : undefined,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        borderRadius: is960 ? '14px' : '16px',
        border: `1.5px solid ${theme.borderColor}`,
        boxShadow: '0 6px 18px rgba(15,23,42,0.1)',
        textAlign: 'left',
        overflow: 'hidden',
        flexShrink: fluid ? 1 : 0,
        position: 'relative',
        minWidth: 0,
        '&:active': { bgcolor: '#FAFAFA', transform: 'scale(0.98)' },
      }}
    >
      {/* 顶部细色条 */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, bgcolor: theme.volumeColor, opacity: 0.5 }} />

      {/* 分数徽章 — 左上角：显示历史最高分，未考过显示 -- */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          width: is960 ? 42 : 48,
          height: is960 ? 42 : 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: is960 ? 0.28 : 0.35,
          background: scoreBadgeBg,
          borderBottomRightRadius: is960 ? '12px' : '14px',
          boxShadow: hasScore ? '0 6px 16px rgba(15,23,42,0.18)' : '0 4px 10px rgba(15,23,42,0.08)',
        }}
      >
        <Typography sx={{ fontSize: is960 ? '0.42rem' : '0.46rem', fontWeight: 800, color: hasScore ? 'rgba(255,255,255,0.82)' : '#9CA3AF', letterSpacing: '0.08em', lineHeight: 1, textAlign: 'center', width: '100%' }}>
          SCORE
        </Typography>
        <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.02rem', fontWeight: 900, color: hasScore ? '#FFFFFF' : '#9CA3AF', lineHeight: 1, fontVariantNumeric: 'tabular-nums', textAlign: 'center', width: '100%' }}>
          {hasScore ? savedScore : '--'}
        </Typography>
      </Box>

      {/* 主视觉 — Volume / C-Lingo Test：避开左上角 SCORE，在剩余区域垂直居中 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          px: is960 ? 1.1 : 1.35,
          pb: is960 ? 4 : 4.5,
        }}
      >
        <Box sx={{ flexShrink: 0, height: is960 ? 42 : 48 }} aria-hidden />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pt: is960 ? 0.35 : 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: paper.source === 'official'
                ? (is960 ? '1.28rem' : '1.58rem')
                : (is960 ? '1.05rem' : '1.28rem'),
              color: theme.volumeColor,
              fontWeight: 900,
              lineHeight: paper.source === 'official' ? 1 : 1.08,
              letterSpacing: '-0.02em',
              maxWidth: '100%',
            }}
          >
            {paper.brandLabel}
          </Typography>
          <Box sx={{ width: is960 ? 34 : 42, height: 3, borderRadius: '999px', bgcolor: theme.borderColor, mt: is960 ? 1.1 : 1.25 }} />
        </Box>
      </Box>

      {/* 做卷日期 — 底部 */}
      <Box
        sx={{
          position: 'absolute',
          left: is960 ? 10 : 12,
          right: is960 ? 10 : 12,
          bottom: is960 ? 10 : 12,
          zIndex: 2,
          textAlign: 'center',
          px: is960 ? 0.8 : 1,
          py: is960 ? 0.65 : 0.75,
          borderRadius: is960 ? '10px' : '12px',
          bgcolor: paper.source === 'official' ? '#FFF7F7' : '#F0FDFA',
          border: `1px solid ${theme.borderColor}`,
        }}
      >
        <Typography
          sx={{
            fontSize: is960 ? '0.72rem' : '0.84rem',
            color: attempt ? '#475569' : '#9CA3AF',
            fontWeight: 800,
            lineHeight: 1.3,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.01em',
          }}
        >
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
  is960,
  paperTrack,
}: {
  level: HSKLevel;
  papers: PaperCatalogItem[];
  loading: boolean;
  error: string | null;
  onSelectPaper: (paper: PaperCatalogItem) => void;
  onBack: () => void;
  onRetry: () => void;
  is960: boolean;
  paperTrack?: PaperSource | null;
}) {
  const officialCardSize = is960 ? 156 : 184;
  const visiblePapers = useMemo(
    () => (paperTrack ? papers.filter((paper) => paper.source === paperTrack) : papers),
    [paperTrack, papers],
  );
  const summaryPaper = visiblePapers[0];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      <Box
        sx={{
          flexShrink: 0,
          px: is960 ? 2 : 3,
          py: is960 ? 1.75 : 2.25,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <ButtonBase
          onClick={onBack}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', flexShrink: 0, mt: 0.15, '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: is960 ? 0.85 : 1.1, pt: 0.15 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.12rem' : '1.32rem', color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            HSK {level} Practice Papers
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.65 : 0.85 }}>
            <HeaderStatChip label="Duration" value={summaryPaper ? `${summaryPaper.duration} min` : '--'} is960={is960} />
            <HeaderStatChip label="Questions" value={summaryPaper?.questionCount ?? '--'} is960={is960} />
            <HeaderStatChip label="Full score" value={summaryPaper?.maxScore ?? '--'} is960={is960} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          px: is960 ? 2 : 3,
          py: is960 ? 2 : 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: is960 ? 2.5 : 3,
        }}
      >
        {(loading || error || visiblePapers.length === 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Typography sx={{ color: error ? '#B91C1C' : '#64748B', fontWeight: 700 }}>
              {loading ? 'Loading published papers…' : error || 'No published papers for this level.'}
            </Typography>
            {error && !loading && (
              <ButtonBase
                onClick={onRetry}
                sx={{ minHeight: 44, px: 2, borderRadius: '8px', bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', fontWeight: 800 }}
              >
                Retry
              </ButtonBase>
            )}
          </Box>
        )}
        {PAPER_SECTIONS.filter((section) => !paperTrack || section.source === paperTrack).map((section) => {
          const sectionPapers = visiblePapers.filter((p) => p.source === section.source);
          if (sectionPapers.length === 0) return null;
          return (
            <Box key={section.source}>
              <SectionDividerTitle label={section.labelEn} source={section.source} is960={is960} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, ${officialCardSize}px)`,
                  gap: is960 ? 1.1 : 1.35,
                  width: '100%',
                }}
              >
                {sectionPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    cardSize={officialCardSize}
                    is960={is960}
                    attempt={paper.bestScore === undefined
                      ? undefined
                      : { score: paper.bestScore, completedAt: paper.bestScoreAt || new Date().toISOString() }}
                    onSelect={onSelectPaper}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
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
  const sectionLines = paper.sectionLines;
  const listenLabel = paper.listeningPlays === 1 ? 'once' : 'twice';
  const theme = PAPER_CARD_THEMES[paper.source];
  const isOfficial = paper.source === 'official';
  const accent = theme.volumeColor;
  const examTypeLabel = isOfficial
    ? `HSK ${paper.level} Official Mock Test`
    : `HSK ${paper.level} C-Lingo Practice Test`;

  const card = {
    bgcolor: '#FFFFFF',
    borderRadius: is960 ? '18px' : '22px',
    border: '1px solid rgba(15,23,42,0.06)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
    p: is960 ? 2 : 2.5,
  } as const;

  const sectionTitle = (text: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: is960 ? 1.25 : 1.75 }}>
      <Box sx={{ width: 5, height: is960 ? 18 : 22, borderRadius: '999px', bgcolor: accent }} />
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8F0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, px: is960 ? 2 : 3, py: is960 ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ButtonBase
          onClick={onBack}
          disabled={starting}
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'white', border: '1px solid #E5E7EB', color: '#586E75', flexShrink: 0, '&:active': { bgcolor: '#F3F4F6' } }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1 : 1.25, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.4rem' : '1.85rem', color: '#111827', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Volume {paper.volume}
            </Typography>
            <Box
              sx={{
                px: is960 ? 1.1 : 1.35,
                py: is960 ? 0.45 : 0.55,
                borderRadius: '10px',
                background: theme.headerBg,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.76rem' : '0.92rem', color: '#FFFFFF', letterSpacing: '0.01em', lineHeight: 1.2 }}>
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
          {statItem(<AccessTimeIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.duration, 'Duration · min', accent, isOfficial ? '#FEF2F2' : '#F0FDFA')}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<QuizOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.questionCount, 'Total questions', '#2563EB', '#EFF6FF')}
          <Box sx={{ width: '1px', bgcolor: '#EEF0F3', my: 0.5 }} />
          {statItem(<WorkspacePremiumOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.maxScore, 'Full score', '#CA8A04', '#FEF9C3')}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: is960 ? 1.5 : 2 }}>
          <Box sx={{ ...card, flex: 1.3, minWidth: 0, p: is960 ? 2 : 3 }}>
            {sectionTitle('Exam rules')}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.1 : 1.5 }}>
              {[
                'Stay focused and complete the test independently.',
                <>
                  Listening audio plays <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>{listenLabel}</Box>. Pay close attention.
                </>,
                <>
                  You may submit early. Submit before the <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>grace period ends</Box> to receive a score.
                </>,
                'Manage your time wisely — easier questions first, then harder ones.',
              ].map((rule, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: is960 ? 1.1 : 1.35, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: is960 ? 24 : 30,
                      height: is960 ? 24 : 30,
                      borderRadius: '9px',
                      bgcolor: isOfficial ? '#FEF2F2' : '#F0FDFA',
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.15,
                      fontWeight: 900,
                      fontSize: is960 ? '0.72rem' : '0.88rem',
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
            {sectionTitle('Question types')}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1 : 1.25 }}>
              {sectionLines.map((line, idx) => {
                const Icon = idx === 0 ? HeadphonesIcon : idx === 1 ? MenuBookIcon : EditNoteIcon;
                return (
                  <Box
                    key={line.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.35,
                      px: is960 ? 1.35 : 1.75,
                      py: is960 ? 1.15 : 1.4,
                      borderRadius: is960 ? '12px' : '16px',
                      bgcolor: '#F9FAFB',
                      border: '1px solid #F1F3F5',
                    }}
                  >
                    <Box
                      sx={{
                        width: is960 ? 38 : 48,
                        height: is960 ? 38 : 48,
                        borderRadius: '12px',
                        bgcolor: 'white',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: is960 ? 20 : 26 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#111827', fontWeight: 800, lineHeight: 1.25 }}>
                        {line.title}
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#6B7280', fontWeight: 600, lineHeight: 1.35, mt: 0.2 }}>
                        {line.detail}
                      </Typography>
                    </Box>
                    {line.duration && (
                      <Typography
                        sx={{
                          fontSize: is960 ? '0.82rem' : '0.95rem',
                          color: '#374151',
                          fontWeight: 800,
                          flexShrink: 0,
                          px: 1.15,
                          py: 0.5,
                          borderRadius: '10px',
                          bgcolor: 'white',
                          border: '1px solid #E5E7EB',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {line.duration}
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
          bgcolor: 'rgba(255,248,240,0.92)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(15,23,42,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
        }}
      >
        <ButtonBase
          onClick={() => setRulesAccepted((v) => !v)}
          disabled={starting}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            borderRadius: '10px',
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
            '&:active': { opacity: 0.85 },
          }}
        >
          {rulesAccepted ? (
            <CheckBoxIcon sx={{ fontSize: is960 ? 26 : 30, color: accent }} />
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: is960 ? 26 : 30, color: '#9CA3AF' }} />
          )}
          <Typography sx={{ fontSize: is960 ? '0.88rem' : '1.02rem', color: '#374151', fontWeight: 700, textAlign: 'left', lineHeight: 1.4 }}>
            I have read and understand the exam rules
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={onStart}
          disabled={!rulesAccepted || starting}
          sx={{
            minWidth: is960 ? 180 : 240,
            minHeight: is960 ? 52 : 60,
            px: 3,
            borderRadius: is960 ? '14px' : '16px',
            bgcolor: rulesAccepted && !starting ? accent : '#E5E7EB',
            color: rulesAccepted && !starting ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 900,
            fontSize: is960 ? '1rem' : '1.15rem',
            letterSpacing: '0.02em',
            boxShadow: rulesAccepted && !starting ? `0 8px 20px ${accent}55` : 'none',
            transition: 'all 0.2s',
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
          }}
        >
          {starting ? 'Starting...' : 'Start exam'}
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
      >
        <DialogTitle id="incomplete-submit-title">Submit incomplete exam?</DialogTitle>
        <DialogContent>
          <Typography>
            {paper.questions.filter((question) => !question.isExample && !answers[question.id]).length} questions are unanswered and will receive 0 points.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => setSubmitConfirmOpen(false)} color="inherit">Continue answering</Button>
          <Button disabled={submitting} onClick={confirmIncompleteSubmit} variant="contained" color="primary">
            {submitting ? 'Submitting...' : 'Confirm submit'}
          </Button>
        </DialogActions>
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

function formatExamDuration(seconds?: number): string {
  const total = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(total / 60);
  return `${minutes}m ${total % 60}s`;
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
  const reviewStatusItems: ReviewStatusItem[] = result.reviewSummary?.length
    ? result.reviewSummary
    : review?.items || [];
  const groups = buildReviewGroups(reviewStatusItems);
  const moduleScores = result.moduleScores || [];
  const passed = Boolean(result.passed);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#F4F8F6', p: is960 ? 2 : 3 }}>
      <Box sx={{ maxWidth: 1180, mx: 'auto', display: 'grid', gridTemplateColumns: is960 ? '1fr 0.8fr' : '1.2fr 0.85fr', gap: 2.5 }}>
        <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '8px', p: is960 ? 2.5 : 3 }}>
          <Typography sx={{ fontSize: is960 ? '1.25rem' : '1.5rem', fontWeight: 900, mb: 2 }}>Score details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, Math.min(moduleScores.length, 3))}, minmax(0, 1fr))`, gap: 1.5, mb: 2.5 }}>
            {moduleScores.map((module) => (
              <Box key={module.moduleId} sx={{ bgcolor: '#F0FAF7', borderRadius: '8px', p: 2, textAlign: 'center' }}>
                <Typography sx={{ color: '#0F9F82', fontSize: is960 ? '1.25rem' : '1.6rem', fontWeight: 900 }}>
                  {result.scoringMode === 'equal_ratio'
                    ? `${module.correctCount}/${module.correctCount + module.incorrectCount + module.unansweredCount}`
                    : module.score}
                </Typography>
                <Typography sx={{ color: '#667085', fontWeight: 700 }}>{module.moduleName}</Typography>
              </Box>
            ))}
          </Box>

          <Typography sx={{ fontSize: is960 ? '1.1rem' : '1.3rem', fontWeight: 900, mb: 1.5 }}>Answer review</Typography>
          {reviewError && <Typography sx={{ color: '#B91C1C', mb: 1.5 }}>{reviewError}</Typography>}
          <Box sx={{ display: 'grid', gridTemplateColumns: is960 ? 'repeat(6, 1fr)' : 'repeat(5, 1fr)', gap: 1 }}>
            {groups.map((group) => {
              const color = group.unanswered ? '#667085' : group.correct ? '#0EAD8B' : '#F04452';
              const bg = group.unanswered ? '#F2F4F7' : group.correct ? '#E9F9F4' : '#FFF0F1';
              return (
                <ButtonBase key={group.id} onClick={() => onOpenReview(group.items[0]?.itemUid)} sx={{ minHeight: 62, borderRadius: '8px', bgcolor: bg, color, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {group.unanswered ? <HelpOutlineIcon sx={{ fontSize: 17 }} /> : group.correct ? <CheckCircleIcon sx={{ fontSize: 17 }} /> : <CancelIcon sx={{ fontSize: 17 }} />}
                  <Typography sx={{ fontWeight: 900 }}>{group.label}</Typography>
                </ButtonBase>
              );
            })}
          </Box>
          {!groups.length && reviewLoading && !reviewError && <Typography sx={{ color: '#98A2B3' }}>Loading answer details...</Typography>}
          {!groups.length && !reviewLoading && !reviewError && <Typography sx={{ color: '#98A2B3' }}>No answer details</Typography>}
        </Box>

        <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '8px', p: is960 ? 2.5 : 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: is960 ? 46 : 58, color: passed ? '#F59E0B' : '#98A2B3', mb: 1 }} />
          <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.7rem', fontWeight: 900 }}>{paper.title}</Typography>
          <Typography sx={{ fontSize: is960 ? '3.5rem' : '4.8rem', lineHeight: 1.1, color: passed ? '#12B76A' : '#F04438', fontWeight: 900, mt: 1 }}>
            {result.score || 0}<Typography component="span" sx={{ color: '#667085', fontSize: '1.4rem' }}> / {result.totalScore}</Typography>
          </Typography>
          <Typography sx={{ color: '#667085', fontWeight: 700, mb: 2 }}>Score rate {Math.round(Number(result.scoreRate || 0))}% · {passed ? 'Passed' : 'Not passed'}</Typography>

          <Box sx={{ width: '100%', bgcolor: '#F9FAFB', borderRadius: '8px', p: 2, mb: 2, textAlign: 'left' }}>
            <Typography sx={{ fontWeight: 700, color: '#667085' }}>Correct <Box component="span" sx={{ float: 'right', color: '#12B76A' }}>{result.correctCount || 0}</Box></Typography>
            <Typography sx={{ fontWeight: 700, color: '#667085' }}>Incorrect <Box component="span" sx={{ float: 'right', color: '#F04438' }}>{result.incorrectCount || 0}</Box></Typography>
            <Typography sx={{ fontWeight: 700, color: '#667085' }}>Unanswered <Box component="span" sx={{ float: 'right', color: '#344054' }}>{result.unansweredCount || 0}</Box></Typography>
            <Typography sx={{ fontWeight: 700, color: '#667085' }}>Best score <Box component="span" sx={{ float: 'right', color: '#0EAD8B' }}>{result.bestScore ?? result.score ?? 0}</Box></Typography>
            <Typography sx={{ fontWeight: 700, color: '#667085' }}>Duration <Box component="span" sx={{ float: 'right', color: '#344054' }}>{formatExamDuration(result.durationSeconds)}</Box></Typography>
          </Box>

          <ButtonBase
            onClick={() => onOpenReview()}
            disabled={reviewOpening}
            sx={{ width: '100%', minHeight: 48, bgcolor: '#19C7AA', color: '#FFFFFF', borderRadius: '8px', fontWeight: 900, mb: 1.25, '&.Mui-disabled': { bgcolor: '#98A2B3', color: '#FFFFFF' } }}
          >
            {reviewOpening ? 'Opening details...' : reviewError && !review ? 'Retry details' : 'View details'}
          </ButtonBase>
          <ButtonBase
            onClick={onRestart}
            disabled={retakeAvailable !== true && !retakeError}
            sx={{ width: '100%', minHeight: 46, border: '1px solid #D0D5DD', borderRadius: '8px', fontWeight: 800, mb: 1.25, '&.Mui-disabled': { color: '#98A2B3', bgcolor: '#F2F4F7' } }}
          >
            <ReplayIcon sx={{ mr: 0.75 }} />
            {retakeError ? 'Retry availability' : retakeAvailable === null ? 'Checking availability...' : retakeAvailable ? 'Try again' : 'No longer available'}
          </ButtonBase>
          {retakeError && <Typography sx={{ color: '#B42318', fontSize: '0.82rem', mb: 1.25 }}>{retakeError}</Typography>}
          <ButtonBase onClick={onGoHome} sx={{ color: '#667085', fontWeight: 800 }}>Back</ButtonBase>
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
  const [searchParams] = useSearchParams();
  const isWebsiteEmbed = searchParams.get('mode') === 'website';
  const requestedParentOrigin = searchParams.get('parentOrigin');
  const paperTrackParam = searchParams.get('track');
  const paperTrack: PaperSource | null =
    paperTrackParam === 'clingo' ? 'clingo' : paperTrackParam === 'official' ? 'official' : null;
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

  if (sessionRestoring) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#FFFBF5' }}>
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
    <AnimatePresence mode="wait">
      {currentScreen === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <HomeScreen
            onSelectLevel={handleSelectLevel}
            onBack={handleExitToHub}
            is960={is960}
            showBack={!isWebsiteEmbed}
          />
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
  );
}
