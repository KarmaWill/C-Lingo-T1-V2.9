export const DIAGNOSTIC_SCORE_KEY = 'hsk-diagnostic-best-score';
export const DIAGNOSTIC_PASS_LINE = 60;

export const SCORE_BADGE_BG = {
  none: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
  pass: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
  fail: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
} as const;

export function loadDiagnosticBestScore(): number | undefined {
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_SCORE_KEY);
    if (!raw) return undefined;
    const score = Number(raw);
    return Number.isFinite(score) ? score : undefined;
  } catch {
    return undefined;
  }
}

export function saveDiagnosticBestScore(score: number) {
  const prev = loadDiagnosticBestScore();
  if (prev === undefined || score > prev) {
    localStorage.setItem(DIAGNOSTIC_SCORE_KEY, String(score));
  }
}

export function scoreBadgeBackground(score: number | undefined, passLine = DIAGNOSTIC_PASS_LINE) {
  if (score === undefined) return SCORE_BADGE_BG.none;
  return score >= passLine ? SCORE_BADGE_BG.pass : SCORE_BADGE_BG.fail;
}
