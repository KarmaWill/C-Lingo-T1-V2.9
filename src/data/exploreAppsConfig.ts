export type ExploreBuiltinId = 'tutor' | 'ai-fm' | 'pinyin' | 'flashcards' | 'writing'

export interface ExploreBuiltinApp {
  id: ExploreBuiltinId
  label: string
  bg: string
  path: string
}

export const EXPLORE_BUILTIN_APPS: ExploreBuiltinApp[] = [
  { id: 'tutor', label: 'Tutor', bg: '#6961FF', path: '/ai-chat' },
  { id: 'ai-fm', label: 'AI FM', bg: '#00B4A0', path: '/ai-fm' },
  { id: 'pinyin', label: 'Pinyin', bg: '#2768FD', path: '/pinyin-chart' },
  { id: 'flashcards', label: 'FlashCards', bg: '#2563EB', path: '/lingo-flash' },
  { id: 'writing', label: 'Writing', bg: '#FFC72C', path: '/character-writing' },
]

const STORAGE_KEY = 'apps-explore-builtins-v2'
const LEGACY_STORAGE_KEY = 'apps-explore-builtins-v1'
const DEFAULT_IDS: ExploreBuiltinId[] = EXPLORE_BUILTIN_APPS.map((app) => app.id)

function isBuiltinId(id: unknown): id is ExploreBuiltinId {
  return typeof id === 'string' && EXPLORE_BUILTIN_APPS.some((app) => app.id === id)
}

function parseIds(raw: string | null): ExploreBuiltinId[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const next = parsed.filter(isBuiltinId)
    return next.length > 0 ? next : null
  } catch {
    return null
  }
}

export function loadExploreBuiltinIds(): ExploreBuiltinId[] {
  if (typeof window === 'undefined') return [...DEFAULT_IDS]
  const current = parseIds(window.localStorage.getItem(STORAGE_KEY))
  if (current) return current

  const legacy = parseIds(window.localStorage.getItem(LEGACY_STORAGE_KEY))
  if (legacy) {
    const next: ExploreBuiltinId[] = legacy.includes('ai-fm')
      ? legacy
      : (() => {
          const tutorAt = legacy.indexOf('tutor')
          if (tutorAt >= 0) {
            const copy: ExploreBuiltinId[] = [...legacy]
            copy.splice(tutorAt + 1, 0, 'ai-fm')
            return copy
          }
          return ['ai-fm', ...legacy]
        })()
    saveExploreBuiltinIds(next)
    return next
  }

  return [...DEFAULT_IDS]
}

function saveExploreBuiltinIds(ids: ExploreBuiltinId[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }
}

export function removeExploreBuiltin(id: ExploreBuiltinId): ExploreBuiltinId[] {
  const next = loadExploreBuiltinIds().filter((item) => item !== id)
  saveExploreBuiltinIds(next)
  return next
}

export function restoreExploreBuiltin(id: ExploreBuiltinId): ExploreBuiltinId[] {
  const current = loadExploreBuiltinIds()
  if (current.includes(id)) return current
  const next = [...current, id]
  saveExploreBuiltinIds(next)
  return next
}

export function getHiddenExploreBuiltins(): ExploreBuiltinApp[] {
  const visible = new Set(loadExploreBuiltinIds())
  return EXPLORE_BUILTIN_APPS.filter((app) => !visible.has(app.id))
}
