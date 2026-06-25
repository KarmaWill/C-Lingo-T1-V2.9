import { loadCompletedLessonIds } from './funChineseUnitProgress';
import { loadFunChineseSavedCards } from './funChineseCardCollection';

export type FunChineseOfflinePayload = {
  unitId: number;
  completedLessonIds: number[];
  savedCardCount: number;
  uploadedAt: string;
};

export function collectFunChineseOfflinePayload(unitId = 1): FunChineseOfflinePayload {
  return {
    unitId,
    completedLessonIds: [...loadCompletedLessonIds()].sort((a, b) => a - b),
    savedCardCount: loadFunChineseSavedCards().length,
    uploadedAt: new Date().toISOString(),
  };
}

/** Placeholder sync — replace with API when backend is ready. */
export async function uploadFunChineseOfflineData(unitId = 1): Promise<FunChineseOfflinePayload> {
  const payload = collectFunChineseOfflinePayload(unitId);
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (import.meta.env.DEV) {
    console.info('[FunChinese] Offline upload payload', payload);
  }
  return payload;
}
