export const SPEAKING_SCORE_KEY = 'hsk-speaking-latest-score';
export const SPEAKING_PASS_LINE = 60;

export function loadSpeakingLatestScore(): number | undefined {
  try {
    const raw = localStorage.getItem(SPEAKING_SCORE_KEY);
    if (!raw) return undefined;
    const score = Number(raw);
    return Number.isFinite(score) ? score : undefined;
  } catch {
    return undefined;
  }
}

export function saveSpeakingLatestScore(score: number) {
  if (!Number.isFinite(score)) return;
  localStorage.setItem(SPEAKING_SCORE_KEY, String(Math.round(score)));
}
