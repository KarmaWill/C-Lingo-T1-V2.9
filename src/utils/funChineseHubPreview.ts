/**
 * 壳外预览：Fun Chinese Hub 在「全锁」和「三课做完」之间切换。
 * 只写 sessionStorage，不碰 `funChinese.hub.unit1.completedIds`。
 */
import { UNIT_LESSON_META } from './funChineseUnitProgress'

export const HUB_PREVIEW_KEY = 'funChinese.hub.preview'
export const HUB_PREVIEW_EVENT = 'funChinese-hub-preview'

export type HubPreviewMode = 'locked' | 'complete'

export function allUnitLessonIds(): Set<number> {
  return new Set(UNIT_LESSON_META.map((meta) => meta.id))
}

export function readHubPreview(): HubPreviewMode | null {
  if (typeof window === 'undefined') return null
  const value = window.sessionStorage.getItem(HUB_PREVIEW_KEY)
  return value === 'locked' || value === 'complete' ? value : null
}

export function writeHubPreview(mode: HubPreviewMode): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(HUB_PREVIEW_KEY, mode)
  window.dispatchEvent(new Event(HUB_PREVIEW_EVENT))
}

export function subscribeHubPreview(onChange: () => void): () => void {
  window.addEventListener(HUB_PREVIEW_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(HUB_PREVIEW_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
