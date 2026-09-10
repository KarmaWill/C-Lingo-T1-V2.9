export type ExploreBuiltinId = 'tutor' | 'pinyin' | 'flashcards' | 'favorites' | 'writing'

export interface ExploreBuiltinApp {
  id: ExploreBuiltinId
  label: string
  bg: string
  path: string
}

export const EXPLORE_BUILTIN_APPS: ExploreBuiltinApp[] = [
  { id: 'tutor', label: 'Tutor', bg: '#6961FF', path: '/ai-chat' },
  { id: 'pinyin', label: 'Pinyin', bg: '#2768FD', path: '/pinyin-chart' },
  { id: 'flashcards', label: 'FlashCards', bg: '#2563EB', path: '/lingo-flash' },
  { id: 'favorites', label: 'Favorites', bg: '#F59E0B', path: '/favorites' },
  { id: 'writing', label: 'Writing', bg: '#FFC72C', path: '/character-writing' },
]

const STORAGE_KEY = 'apps-explore-builtins-v1'
const DEFAULT_IDS: ExploreBuiltinId[] = EXPLORE_BUILTIN_APPS.map((app) => app.id)

function isBuiltinId(id: unknown): id is ExploreBuiltinId {
  return typeof id === 'string' && EXPLORE_BUILTIN_APPS.some((app) => app.id === id)
}

export function loadExploreBuiltinIds(): ExploreBuiltinId[] {
  if (typeof window === 'undefined') return [...DEFAULT_IDS]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_IDS]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [...DEFAULT_IDS]
    const next = parsed.filter(isBuiltinId)
    return next.length > 0 ? next : [...DEFAULT_IDS]
  } catch {
    return [...DEFAULT_IDS]
  }
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
