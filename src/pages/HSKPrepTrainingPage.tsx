/**
 * HSK Prep Training — HSK 备考训练完整版
 * 从 hsk-mock-exam.zip 还原，适配 iPad 交互
 * HomeScreen → PaperSelectionScreen → ExamIntroScreen → ExamScreen → ResultScreen
 */
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import {
  type PaperSource,
  type HSKLevel,
  type ExamSectionKind,
  getExamBlueprint,
  formatSectionSummary,
  formatSectionSummaryLines,
  generateQuestionsFromBlueprint,
  getPartTitle,
  getIntroSectionLines,
  type GeneratedExamQuestion,
  TEMPLATE_LABELS,
} from '../hsk/hskExamBlueprint';

type Screen = 'home' | 'papers' | 'intro' | 'exam' | 'result';

type Question = GeneratedExamQuestion;

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
  questions: Question[];
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
  sectionLines: string[];
  maxScore: number;
  passScore: number;
}

const ALL_LEVELS: HSKLevel[] = [1, 2, 3, 4, 5, 6];

const HSK_PAPER_SCORES_KEY = 'hsk-prep-paper-scores';

interface PaperAttemptRecord {
  score: number;
  completedAt: string;
}

function loadPaperRecords(): Record<string, PaperAttemptRecord> {
  try {
    const raw = localStorage.getItem(HSK_PAPER_SCORES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PaperAttemptRecord | number>;
    const records: Record<string, PaperAttemptRecord> = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (typeof val === 'number') {
        records[id] = { score: val, completedAt: new Date().toISOString() };
      } else if (val && typeof val.score === 'number') {
        records[id] = val;
      }
    }
    return records;
  } catch {
    return {};
  }
}

const CLINGO_VOLUMES_PER_LEVEL = 5;

/** 演示用记录 — 展示分数 + 做卷日期（真实记录优先） */
const DEMO_PAPER_RECORDS: Record<string, PaperAttemptRecord> = {
  'hsk1-official-v1': { score: 168, completedAt: '2026-02-14T09:30:00.000Z' },
  'hsk1-official-v2': { score: 98, completedAt: '2026-01-08T14:15:00.000Z' },
  'clingo-test-1-v1': { score: 132, completedAt: '2026-03-02T11:00:00.000Z' },
  'clingo-test-1-v2': { score: 105, completedAt: '2026-02-20T16:45:00.000Z' },
  'clingo-test-1-v4': { score: 88, completedAt: '2026-01-15T10:20:00.000Z' },
  'hsk2-official-v1': { score: 145, completedAt: '2026-03-10T08:50:00.000Z' },
  'hsk2-official-v2': { score: 108, completedAt: '2026-02-28T13:30:00.000Z' },
};

const SCORE_PASS_LINE = 120;

const SCORE_BADGE_BG = {
  none: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
  pass: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
  fail: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
} as const;

function formatPaperDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function resolvePaperRecord(paperId: string, savedRecords: Record<string, PaperAttemptRecord>): PaperAttemptRecord | undefined {
  if (savedRecords[paperId]) return savedRecords[paperId];
  return DEMO_PAPER_RECORDS[paperId];
}

function savePaperAttempt(paperId: string, score: number, completedAt: string) {
  const records = loadPaperRecords();
  const prev = records[paperId];
  if (prev === undefined || score > prev.score) {
    records[paperId] = { score, completedAt };
    localStorage.setItem(HSK_PAPER_SCORES_KEY, JSON.stringify(records));
  }
}

interface ExamResult {
  paperId: string;
  score: number;
  answers: Record<string, string>;
  completedAt: string;
}


function getOfficialPapers(): PaperCatalogItem[] {
  return ALL_LEVELS.flatMap((level) => {
    const blueprint = getExamBlueprint(level, 'official');
    return [1, 2].map((volume) => ({
      id: `hsk${level}-official-v${volume}`,
      source: 'official' as const,
      level,
      volume,
      brandLabel: `Volume ${volume}`,
      title: blueprint.label,
      subtitle: `Volume ${volume}`,
      questionCount: blueprint.totalQuestions,
      duration: blueprint.totalMinutes,
      sectionSummary: formatSectionSummary(blueprint),
      sectionLines: formatSectionSummaryLines(blueprint),
      maxScore: blueprint.maxScore,
      passScore: blueprint.passScore,
    }));
  });
}

function getClingoPapers(): PaperCatalogItem[] {
  return ALL_LEVELS.flatMap((level) => {
    const blueprint = getExamBlueprint(level, 'clingo');
    return Array.from({ length: CLINGO_VOLUMES_PER_LEVEL }, (_, i) => {
      const volume = i + 1;
      return {
        id: `clingo-test-${level}-v${volume}`,
        source: 'clingo' as const,
        level,
        volume,
        brandLabel: `C-Lingo Test ${volume}`,
        title: blueprint.label,
        subtitle: `Test ${volume}`,
        questionCount: blueprint.totalQuestions,
        duration: blueprint.totalMinutes,
        sectionSummary: formatSectionSummary(blueprint),
        sectionLines: formatSectionSummaryLines(blueprint),
        maxScore: blueprint.maxScore,
        passScore: blueprint.passScore,
      };
    });
  });
}

function getAllPaperCatalog(): PaperCatalogItem[] {
  return [...getOfficialPapers(), ...getClingoPapers()];
}

function getPaperCatalogForLevel(level: HSKLevel): PaperCatalogItem[] {
  return getAllPaperCatalog().filter((paper) => paper.level === level);
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
  { id: 3, title: 'HSK 3', desc: '600 words · Intermediate', color: '#E06518', tint: '#FFF4EB', badgeGradient: 'linear-gradient(145deg, #F07828 0%, #E06518 100%)', enabled: false },
  { id: 4, title: 'HSK 4', desc: '1200 words · Upper intermediate', color: '#7A2430', tint: '#FDF2F3', badgeGradient: 'linear-gradient(145deg, #9B3040 0%, #7A2430 100%)', enabled: false },
  { id: 5, title: 'HSK 5', desc: '2500 words · Advanced', color: '#1E3355', tint: '#EEF2F8', badgeGradient: 'linear-gradient(145deg, #2C4770 0%, #1E3355 100%)', enabled: false },
  { id: 6, title: 'HSK 6', desc: '5000+ words · Proficient', color: '#543878', tint: '#F3EFF8', badgeGradient: 'linear-gradient(145deg, #6B4898 0%, #543878 100%)', enabled: false },
  { id: 'hsk7-9', title: 'HSK 7–9', desc: 'Advanced fluency · Coming soon', color: '#64748B', tint: '#F1F5F9', badgeGradient: 'linear-gradient(145deg, #64748B 0%, #475569 100%)', enabled: false },
];

function buildPaperFromCatalog(item: PaperCatalogItem): ExamPaper {
  const blueprint = getExamBlueprint(item.level, item.source);
  return {
    id: item.id,
    level: item.level,
    volume: item.volume,
    source: item.source,
    title: `${item.title} · ${item.subtitle}`,
    duration: blueprint.totalMinutes,
    maxScore: blueprint.maxScore,
    passScore: blueprint.passScore,
    listeningPlays: blueprint.listeningPlays,
    sectionSummary: formatSectionSummary(blueprint),
    questions: generateQuestionsFromBlueprint(item.id, blueprint),
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
}: {
  onSelectLevel: (level: HSKLevel) => void;
  onBack: () => void;
  is960: boolean;
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
          sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', color: '#586E75', flexShrink: 0, '&:active': { bgcolor: 'rgba(0,0,0,0.1)' } }}
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
        {LEVEL_PICKER_ITEMS.map((item, index) => {
          const locked = !item.enabled;
          const isLast = index === LEVEL_PICKER_ITEMS.length - 1;

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
            gridColumn: isLast ? '1 / -1' : undefined,
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
  const passed = hasScore && savedScore >= SCORE_PASS_LINE;
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
  onSelectPaper,
  onBack,
  is960,
  scoreRefreshKey,
}: {
  level: HSKLevel;
  onSelectPaper: (paper: PaperCatalogItem) => void;
  onBack: () => void;
  is960: boolean;
  scoreRefreshKey: number;
}) {
  const papers = getPaperCatalogForLevel(level);
  const officialCardSize = is960 ? 156 : 184;
  const savedRecords = useMemo(() => loadPaperRecords(), [scoreRefreshKey]);
  const blueprint = getExamBlueprint(level, 'official');
  const clingoCount = papers.filter((p) => p.source === 'clingo').length;
  const clingoColumns = clingoCount >= 5 ? 5 : Math.min(4, clingoCount);

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
            <HeaderStatChip label="Duration" value={`${blueprint.totalMinutes} min`} is960={is960} />
            <HeaderStatChip label="Questions" value={blueprint.totalQuestions} is960={is960} />
            <HeaderStatChip label="Full score" value={blueprint.maxScore} is960={is960} />
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
        {PAPER_SECTIONS.map((section) => {
          const sectionPapers = papers.filter((p) => p.source === section.source);
          return (
            <Box key={section.source}>
              <SectionDividerTitle label={section.labelEn} source={section.source} is960={is960} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    section.source === 'clingo'
                      ? `repeat(${clingoColumns}, minmax(0, 1fr))`
                      : `repeat(${Math.min(sectionPapers.length, 2)}, minmax(0, 1fr))`,
                  gap: is960 ? 1.1 : 1.35,
                  width: '100%',
                  maxWidth: section.source === 'official' ? officialCardSize * 2 + (is960 ? 18 : 22) : '100%',
                }}
              >
                {sectionPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    cardSize={section.source === 'official' ? officialCardSize : undefined}
                    fluid={section.source === 'clingo'}
                    is960={is960}
                    attempt={resolvePaperRecord(paper.id, savedRecords)}
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
  is960,
}: {
  paper: ExamPaper;
  onStart: () => void;
  onBack: () => void;
  is960: boolean;
}) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const blueprint = getExamBlueprint(paper.level, paper.source);
  const sectionLines = getIntroSectionLines(blueprint);
  const listenLabel = blueprint.listeningPlays === 1 ? 'once' : 'twice';
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
          {statItem(<QuizOutlinedIcon sx={{ fontSize: is960 ? 24 : 30 }} />, paper.questions.length, 'Total questions', '#2563EB', '#EFF6FF')}
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
                  You may submit early. When time is up, the system will <Box component="span" sx={{ color: '#DC2626', fontWeight: 800 }}>auto-submit</Box>.
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
          disabled={!rulesAccepted}
          sx={{
            minWidth: is960 ? 180 : 240,
            minHeight: is960 ? 52 : 60,
            px: 3,
            borderRadius: is960 ? '14px' : '16px',
            bgcolor: rulesAccepted ? accent : '#E5E7EB',
            color: rulesAccepted ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 900,
            fontSize: is960 ? '1rem' : '1.15rem',
            letterSpacing: '0.02em',
            boxShadow: rulesAccepted ? `0 8px 20px ${accent}55` : 'none',
            transition: 'all 0.2s',
            '&:active': rulesAccepted ? { transform: 'scale(0.98)' } : {},
          }}
        >
          Start exam
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

function buildExamNavGroups(questions: Question[]): ExamNavGroup[] {
  const groups: ExamNavGroup[] = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    if (isGroupedDisplayMode(q.displayMode)) {
      const partKey = `${q.section}-${q.partNumber}`;
      const groupKind = q.displayMode;
      const indices: number[] = [];
      while (
        i < questions.length
        && questions[i].displayMode === groupKind
        && `${questions[i].section}-${questions[i].partNumber}` === partKey
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
  const groupAnswers = group.indices
    .map((idx) => answers[questions[idx].id])
    .filter((value) => Boolean(value));
  if (groupAnswers.length !== group.indices.length) return false;
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
      const partKey = `${q.section}-${q.partNumber}`;
      const groupMode = q.displayMode;
      const slotIndices: number[] = [];
      while (
        i < indices.length
        && questions[indices[i]].displayMode === groupMode
        && `${questions[indices[i]].section}-${questions[indices[i]].partNumber}` === partKey
      ) {
        slotIndices.push(indices[i]);
        i += 1;
      }
      const numbers = slotIndices.map((idx) => questions[idx].number);
      slots.push({
        kind: 'range',
        indices: slotIndices,
        label: `${numbers[0]}–${numbers[numbers.length - 1]}`,
      });
    } else {
      slots.push({ kind: 'single', indices: [indices[i]], label: String(questions[indices[i]].number) });
      i += 1;
    }
  }
  return slots;
}

function ExamScreen({ paper, onFinish, onExit, is960 }: { paper: ExamPaper; onFinish: (answers: Record<string, string>) => void; onExit: () => void; is960: boolean }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(paper.duration * 60);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [progressOpen, setProgressOpen] = useState(true);
  const [timeHidden, setTimeHidden] = useState(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const CRITICAL_TIME_SECONDS = 5 * 60;
  const isCriticalTime = timeRemaining <= CRITICAL_TIME_SECONDS;

  const examNavGroups = useMemo(() => buildExamNavGroups(paper.questions), [paper.questions]);
  const currentNavGroupIndex = examNavGroups.findIndex((g) => g.indices.includes(currentQuestionIndex));
  const currentNavGroup = examNavGroups[Math.max(0, currentNavGroupIndex)];
  const isImageMatchGroup = currentNavGroup?.groupKind === 'image-match';
  const isTextCompositeGroup = currentNavGroup?.groupKind === 'text-composite';
  const isGroupedQuestion = isImageMatchGroup || isTextCompositeGroup;
  const groupQuestions = isGroupedQuestion
    ? currentNavGroup.indices.map((idx) => paper.questions[idx])
    : [paper.questions[currentQuestionIndex]];

  const currentQuestion = isTextCompositeGroup
    ? groupQuestions[activeSubIndex]
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
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

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
    setActiveSubIndex(0);
  }, [currentNavGroupIndex]);

  const handleSelectAnswer = (answer: string, questionId = currentQuestion.id) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (isTextCompositeGroup) {
      const groupLen = groupQuestions.length;
      if (activeSubIndex < groupLen - 1) {
        setActiveSubIndex((prev) => prev + 1);
      }
    }
  };

  const handleAssignMatchLetter = (letter: string) => {
    if (!isImageMatchGroup) return;
    const qIdx = currentNavGroup.indices[activeSubIndex];
    const q = paper.questions[qIdx];

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
      let nextSub = activeSubIndex;
      for (let i = activeSubIndex + 1; i < groupLen; i += 1) {
        const idx = currentNavGroup.indices[i];
        if (!next[paper.questions[idx].id]) {
          nextSub = i;
          break;
        }
      }
      if (nextSub === activeSubIndex && activeSubIndex < groupLen - 1) {
        nextSub = activeSubIndex + 1;
      }
      setActiveSubIndex(nextSub);

      return next;
    });
  };

  const handleNext = () => {
    if (currentNavGroupIndex < examNavGroups.length - 1) {
      setCurrentQuestionIndex(examNavGroups[currentNavGroupIndex + 1].indices[0]);
    }
  };

  const handlePrevious = () => {
    if (currentNavGroupIndex > 0) {
      const prevGroup = examNavGroups[currentNavGroupIndex - 1];
      setCurrentQuestionIndex(prevGroup.indices[0]);
    }
  };

  const handleSubmit = () => {
    onFinish(answers);
  };

  const allQuestionsAnswered = examNavGroups.every((group) =>
    isNavGroupComplete(group, paper.questions, answers),
  );
  const isCurrentGroupComplete = isNavGroupComplete(currentNavGroup, paper.questions, answers);
  const isListening = currentQuestion.section === 'listening';
  const isImageOptions = !isGroupedQuestion && currentQuestion.displayMode === 'image';
  const currentPartKey = `${currentQuestion.section}-${currentQuestion.partNumber}`;
  const timeLabel = `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`;
  const examTitle = paper.source === 'official'
    ? `HSK ${paper.level} Official Mock`
    : `HSK ${paper.level} Practice Test`;
  const optionColumns = isImageOptions ? 3 : Math.min(currentQuestion.options.length, 4);
  const examTeal = '#5BBFAF';
  const examTealDark = '#49A995';
  const isLastGroup = currentNavGroupIndex >= examNavGroups.length - 1;
  const groupRangeLabel = isGroupedQuestion
    ? `Questions ${groupQuestions[0].number}–${groupQuestions[groupQuestions.length - 1].number}`
    : `Question ${currentQuestion.number}`;

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
          onClick={onExit}
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
              Time left: {timeHidden ? '--:--' : timeLabel}
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
          disabled={!allQuestionsAnswered}
          sx={{
            px: is960 ? 2 : 2.5,
            py: is960 ? 0.85 : 1,
            minHeight: 44,
            bgcolor: allQuestionsAnswered ? examTeal : '#E5E7EB',
            color: allQuestionsAnswered ? '#FFFFFF' : '#9CA3AF',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: is960 ? '0.88rem' : '0.98rem',
            boxShadow: allQuestionsAnswered ? '0 4px 12px rgba(91,191,175,0.35)' : 'none',
            '&:active': allQuestionsAnswered ? { transform: 'scale(0.97)', bgcolor: examTealDark } : {},
            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
          }}
        >
          Submit
        </ButtonBase>
      </Box>

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
                      const hasAnswer = slot.indices.every((idx) => !!answers[paper.questions[idx].id]);
                      const partiallyAnswered = !hasAnswer && slot.indices.some((idx) => !!answers[paper.questions[idx].id]);
                      return (
                        <ButtonBase
                          key={slot.label}
                          onClick={() => setCurrentQuestionIndex(slot.indices[0])}
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
                {TEMPLATE_LABELS[currentQuestion.templateCode]}
              </Typography>
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
                        sx={{
                          position: 'relative',
                          aspectRatio: '1',
                          bgcolor: '#FFFFFF',
                          border: isAssigned ? `2px solid ${examTeal}` : '2px solid #E5E7EB',
                          borderRadius: is960 ? '14px' : '18px',
                          overflow: 'hidden',
                          boxShadow: isAssigned ? '0 4px 14px rgba(91,191,175,0.2)' : '0 2px 8px rgba(15,23,42,0.04)',
                          opacity: isAssigned && answers[groupQuestions[activeSubIndex]?.id] !== letter ? 0.88 : 1,
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

                <Box sx={{ flex: 0.85, minWidth: is960 ? 180 : 220, display: 'flex', flexDirection: 'column', gap: is960 ? 0.85 : 1 }}>
                  {groupQuestions.map((q, subIdx) => {
                    const subAnswer = answers[q.id];
                    const isActive = activeSubIndex === subIdx;
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
                          {q.number}.
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
                            justifyContent: 'center',
                            px: 2,
                            boxShadow: isActive ? '0 4px 12px rgba(91,191,175,0.15)' : 'none',
                          }}
                        >
                          <Typography sx={{ fontSize: is960 ? '1rem' : '1.12rem', fontWeight: 900, color: subAnswer ? '#111827' : '#CBD5E1' }}>
                            {subAnswer || ' '}
                          </Typography>
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

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ButtonBase
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: is960 ? 0.75 : 1 }}>
                  {groupQuestions.map((q, subIdx) => {
                    const isActive = activeSubIndex === subIdx;
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
                        {q.number}
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
                  {currentQuestion.number}. {currentQuestion.question}
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
                          {option}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <>
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

                {isListening && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: is960 ? 2.5 : 3 }}>
                    <ButtonBase
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

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${optionColumns}, minmax(0, 1fr))`,
                    gap: is960 ? 1.25 : 1.75,
                    maxWidth: isImageOptions ? 640 : optionColumns >= 4 ? '100%' : 720,
                    mx: isImageOptions ? 'auto' : 0,
                  }}
                >
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const letter = String.fromCharCode(65 + idx);
                    const imageSrc = currentQuestion.optionImages?.[idx];
                    return (
                      <ButtonBase
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        sx={{
                          position: 'relative',
                          aspectRatio: '1',
                          minHeight: is960 ? (isImageOptions ? 140 : 120) : (isImageOptions ? 168 : 148),
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
                            {option}
                          </Typography>
                        )}
                      </ButtonBase>
                    );
                  })}
                </Box>
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
              disabled={isLastGroup ? !allQuestionsAnswered : !isCurrentGroupComplete}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: is960 ? 2.25 : 2.75,
                py: is960 ? 0.9 : 1.05,
                minHeight: 44,
                bgcolor: (isLastGroup ? allQuestionsAnswered : isCurrentGroupComplete) ? examTeal : '#E5E7EB',
                color: (isLastGroup ? allQuestionsAnswered : isCurrentGroupComplete) ? '#FFFFFF' : '#9CA3AF',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: is960 ? '0.92rem' : '1rem',
                boxShadow: (isLastGroup ? allQuestionsAnswered : isCurrentGroupComplete)
                  ? '0 4px 14px rgba(91,191,175,0.35)'
                  : 'none',
                '&:active': (isLastGroup ? allQuestionsAnswered : isCurrentGroupComplete)
                  ? { transform: 'scale(0.97)', bgcolor: examTealDark }
                  : {},
                '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
              }}
            >
              {isLastGroup ? 'Submit' : 'Next'}
              <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 20 }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ResultScreen — 考试结果
   ═══════════════════════════════════════════════════════════════════════════════ */
function ResultScreen({ paper, result, onRestart, onGoHome, is960 }: { paper: ExamPaper; result: ExamResult; onRestart: () => void; onGoHome: () => void; is960: boolean }) {
  const correctCount = paper.questions.filter((q) => result.answers[q.id] === q.correctAnswer).length;
  const totalCount = paper.questions.length;
  const score = Math.round((correctCount / totalCount) * paper.maxScore);
  const passed = score >= paper.passScore;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF8F0', p: is960 ? 3 : 4 }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}>
        <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: '32px', p: is960 ? 4 : 6, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', width: '100%', maxWidth: is960 ? 500 : 720 }}>
          <EmojiEventsIcon sx={{ fontSize: is960 ? 64 : 80, color: passed ? '#F59E0B' : '#9CA3AF', mb: 2 }} />

          <Typography sx={{ fontSize: is960 ? '2rem' : '3rem', fontWeight: 900, color: '#111827', mb: 0.5 }}>
            {score} / {paper.maxScore}
          </Typography>

          <Typography sx={{ fontSize: is960 ? '0.85rem' : '1rem', fontWeight: 800, color: passed ? '#059669' : '#DC2626', mb: 1 }}>
            {passed ? 'Passed' : 'Not passed'} · Pass line {paper.passScore}
          </Typography>

          <Typography sx={{ fontSize: is960 ? '1rem' : '1.25rem', fontWeight: 700, color: '#6B7280', mb: 4 }}>
            {paper.title} complete
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
            <Box sx={{ bgcolor: '#D1FAE5', borderRadius: '16px', p: 2.5 }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
              <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#10B981' }}>
                {correctCount}
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#065F46', fontWeight: 700 }}>
                答对
              </Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#FEE2E2', borderRadius: '16px', p: 2.5 }}>
              <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#EF4444', mb: 1 }}>
                {totalCount - correctCount}
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#991B1B', fontWeight: 700 }}>
                答错
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <ButtonBase
              onClick={onRestart}
              sx={{
                width: '100%',
                py: 2,
                bgcolor: '#2563EB',
                color: 'white',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.15rem',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              再做一次
            </ButtonBase>

            <ButtonBase
              onClick={onGoHome}
              sx={{
                width: '100%',
                py: 2,
                bgcolor: 'white',
                color: '#374151',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: is960 ? '1rem' : '1.15rem',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              返回首页
            </ButtonBase>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Container
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HSKPrepTrainingPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [scoreRefreshKey, setScoreRefreshKey] = useState(0);

  const activePaper = selectedPaper;

  const handleSelectLevel = (level: HSKLevel) => {
    setSelectedLevel(level);
    setSelectedPaper(null);
    setExamResult(null);
    setCurrentScreen('papers');
  };

  const handleBackToHome = () => {
    setSelectedLevel(null);
    setSelectedPaper(null);
    setExamResult(null);
    setCurrentScreen('home');
  };

  const handleSelectPaper = (paper: PaperCatalogItem) => {
    setSelectedPaper(buildPaperFromCatalog(paper));
    setExamResult(null);
    setCurrentScreen('intro');
  };

  const handleStartExam = () => {
    setCurrentScreen('exam');
  };

  const handleBackToPapers = () => {
    setSelectedPaper(null);
    setExamResult(null);
    setCurrentScreen('papers');
  };

  const handleBackToIntro = () => {
    setExamResult(null);
    setCurrentScreen('intro');
  };

  const handleFinishExam = (answers: Record<string, string>) => {
    if (!activePaper) return;
    const correctCount = activePaper.questions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;

    const result: ExamResult = {
      paperId: activePaper.id,
      score: Math.round((correctCount / activePaper.questions.length) * activePaper.maxScore),
      answers,
      completedAt: new Date().toISOString(),
    };

    savePaperAttempt(activePaper.id, result.score, result.completedAt);
    setScoreRefreshKey((k) => k + 1);
    setExamResult(result);
    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setExamResult(null);
    setCurrentScreen('exam');
  };

  /** Leave prep training entirely — back to HSK Preparation hub (same as mock grid entry). */
  const handleExitToHub = () => {
    navigate('/hsk-test');
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <HomeScreen onSelectLevel={handleSelectLevel} onBack={handleExitToHub} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'papers' && selectedLevel && (
        <motion.div key="papers" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ height: '100%' }}>
          <PaperSelectionScreen
            level={selectedLevel}
            onSelectPaper={handleSelectPaper}
            onBack={handleBackToHome}
            is960={is960}
            scoreRefreshKey={scoreRefreshKey}
          />
        </motion.div>
      )}

      {currentScreen === 'intro' && activePaper && (
        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%' }}>
          <ExamIntroScreen paper={activePaper} onStart={handleStartExam} onBack={handleBackToPapers} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'exam' && activePaper && (
        <motion.div key="exam" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} style={{ height: '100%' }}>
          <ExamScreen paper={activePaper} onFinish={handleFinishExam} onExit={handleBackToIntro} is960={is960} />
        </motion.div>
      )}

      {currentScreen === 'result' && examResult && activePaper && (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
          <ResultScreen paper={activePaper} result={examResult} onRestart={handleRestart} onGoHome={handleExitToHub} is960={is960} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
