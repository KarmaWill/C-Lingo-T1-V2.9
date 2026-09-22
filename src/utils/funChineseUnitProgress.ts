/**
 * Unit hub progress: completed lesson IDs drive toolbox unlocks and podcast.
 * Lesson titles / count come from happy_chinese2 catalog (DEMO Unit 1).
 */
import { listDemoUnitLessonMeta } from '../data/happyChinese2/mapToLessonUi'

const STORAGE_KEY = 'funChinese.hub.unit1.completedIds'

export type HubLessonMeta = {
  id: number
  title: string
  titleEn: string
  resourceId?: string
}

export const UNIT_LESSON_META: HubLessonMeta[] = listDemoUnitLessonMeta().map((m) => ({
  id: m.id,
  title: m.title,
  titleEn: m.titleEn,
  resourceId: m.resourceId,
}))

export const UNIT_LESSON_COUNT = UNIT_LESSON_META.length || 3

export type HubLessonStatus = {
  id: number
  title: string
  titleEn: string
  status: 'completed' | 'current' | 'locked'
  xp: number
}

function parseStoredIds(raw: string | null): Set<number> {
  if (!raw) return new Set()
  try {
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(
      arr.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= UNIT_LESSON_COUNT),
    )
  } catch {
    return new Set()
  }
}

export function loadCompletedLessonIds(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  return parseStoredIds(window.localStorage.getItem(STORAGE_KEY))
}

export function saveCompletedLessonIds(ids: Set<number>): void {
  if (typeof window === 'undefined') return
  const sorted = [...ids].filter((n) => n >= 1 && n <= UNIT_LESSON_COUNT).sort((a, b) => a - b)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
}

/** Mark one lesson finished (idempotent). */
export function markLessonCompleted(lessonId: number): void {
  if (lessonId < 1 || lessonId > UNIT_LESSON_COUNT) return
  const ids = loadCompletedLessonIds()
  ids.add(lessonId)
  saveCompletedLessonIds(ids)
}

export function buildHubLessons(completed: Set<number>): HubLessonStatus[] {
  return UNIT_LESSON_META.map((meta) => {
    if (completed.has(meta.id)) {
      return { ...meta, status: 'completed' as const, xp: 100 }
    }
    const unlocked = meta.id === 1 || completed.has(meta.id - 1)
    if (unlocked) {
      return { ...meta, status: 'current' as const, xp: 0 }
    }
    return { ...meta, status: 'locked' as const, xp: 0 }
  })
}

export function getLessonResourceId(lessonOrder: number): string | undefined {
  return UNIT_LESSON_META.find((m) => m.id === lessonOrder)?.resourceId
}
