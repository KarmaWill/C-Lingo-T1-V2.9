/**
 * Happy Chinese Volume 2 packet helpers.
 * Packet root: `local-agent-app/data/happy_chinese2` (served at `/data/happy_chinese2`).
 */
import catalogJson from './catalog.json'

export const HAPPY_CHINESE2_PUBLIC_BASE = '/data/happy_chinese2'

/** DEMO：Hub / 课流默认读第二册 Unit 1；第 2 课 = L20063。 */
export const HAPPY_CHINESE2_DEMO_UNIT_ORDER = 1

export type HappyChineseLang =
  | 'zh'
  | 'en'
  | 'ja'
  | 'ko'
  | 'es'
  | 'fr'
  | 'vi'
  | 'id'
  | 'th'

export type LocalizedText = Partial<Record<HappyChineseLang, string>> & { zh?: string }

export type CatalogGoal = {
  id: string
  text: LocalizedText
}

export type CatalogLesson = {
  id: string
  order: number
  title: LocalizedText
  goals: CatalogGoal[]
}

export type CatalogUnit = {
  id: string
  order: number
  title: LocalizedText
  lessons: CatalogLesson[]
}

export type HappyChinese2Catalog = {
  units: CatalogUnit[]
}

export type ContentItem = {
  id: string
  order: number
  text: LocalizedText
  pinyin?: string
  hsk?: string
  pos?: LocalizedText
  strokes?: number
  structure?: LocalizedText
  components?: string[]
  formula?: string
  slots?: { id: string; text: LocalizedText }[]
  function?: LocalizedText
  name?: LocalizedText
  pattern?: string
  examplePattern?: string
  exampleSlots?: { id: string; text: LocalizedText }[]
  examples?: {
    id: string
    text: LocalizedText
    formula?: string
    pinyin?: string
  }[]
  usage?: LocalizedText
  example?: { id: string; text: LocalizedText }
}

export type DialogueBlock = {
  order: number
  scene?: { id: string; text: LocalizedText }
  lines: {
    id: string
    speaker: string
    text: LocalizedText
    pinyin?: string
    pattern?: string
    slots?: { id: string; text: LocalizedText }[]
  }[]
}

export type LessonContent = {
  chars?: ContentItem[]
  vocab?: ContentItem[]
  sentences?: ContentItem[]
  patterns?: ContentItem[]
  dialogues?: DialogueBlock[]
  grammar?: ContentItem[]
  flashcards?: ContentItem[]
}

export type HappyChinese2ContentFile = Record<string, LessonContent>

export type QuizContent = {
  kind: 'text' | 'audio' | 'image'
  text?: LocalizedText
  id?: LocalizedText
  pinyin?: string
  image?: string
  audio?: string
  key?: string
}

export type ChoiceQuizOption = QuizContent & { correct: boolean }

export type HappyChinese2Quiz = {
  id: string
  type: string
  mode: 'choice' | 'match'
  title: LocalizedText
  unit?: string
  lesson?: string
  lessonNo?: number
  lessonId: string
  stem?: QuizContent
  stems?: QuizContent[]
  options: ChoiceQuizOption[] | QuizContent[]
}

export type HappyChinese2QuizFile = Record<string, HappyChinese2Quiz[]>

export const happyChinese2Catalog = catalogJson as HappyChinese2Catalog

export function pickLocale(
  text: LocalizedText | undefined,
  lang: HappyChineseLang = 'en',
  fallback: HappyChineseLang = 'zh',
): string {
  if (!text) return ''
  const primary = text[lang]
  if (primary && primary.trim()) return primary.trim()
  const fb = text[fallback]
  if (fb && fb.trim()) return fb.trim()
  return Object.values(text).find((v) => typeof v === 'string' && v.trim())?.trim() || ''
}

/** 「2 她比我高」/「1. Who is he?」→ 去课序号 */
export function stripLessonOrderPrefix(title: string): string {
  return title.replace(/^\d+\.?\s*/, '').trim()
}

/** 「第一单元 我和朋友」→「我和朋友」；「Unit 1: Me and My Friends」→「Me and My Friends」 */
export function shortUnitTitle(title: string, lang: HappyChineseLang): string {
  if (lang === 'zh') return title.replace(/^第.+?单元\s*/, '').trim() || title
  return title.replace(/^Unit\s*\d+\s*:\s*/i, '').trim() || title
}

export function getCatalogUnit(unitOrder = HAPPY_CHINESE2_DEMO_UNIT_ORDER): CatalogUnit | undefined {
  return happyChinese2Catalog.units.find((u) => u.order === unitOrder)
}

export function getCatalogLessonByOrder(
  lessonOrder: number,
  unitOrder = HAPPY_CHINESE2_DEMO_UNIT_ORDER,
): CatalogLesson | undefined {
  const unit = getCatalogUnit(unitOrder)
  return unit?.lessons.find((l) => l.order === lessonOrder)
}

export function parseHskLevel(hsk?: string): number {
  if (!hsk) return 1
  const m = hsk.match(/(\d+)/)
  return m ? Number(m[1]) : 1
}

let contentPromise: Promise<HappyChinese2ContentFile> | null = null
let quizPromise: Promise<HappyChinese2QuizFile> | null = null

export function loadHappyChinese2Content(): Promise<HappyChinese2ContentFile> {
  if (!contentPromise) {
    contentPromise = fetch(`${HAPPY_CHINESE2_PUBLIC_BASE}/content.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load happy_chinese2 content: ${res.status}`)
        return res.json() as Promise<HappyChinese2ContentFile>
      })
      .catch((err) => {
        contentPromise = null
        throw err
      })
  }
  return contentPromise
}

export async function loadLessonContent(lessonResourceId: string): Promise<LessonContent | null> {
  const all = await loadHappyChinese2Content()
  return all[lessonResourceId] ?? null
}

export function loadHappyChinese2Quizzes(): Promise<HappyChinese2QuizFile> {
  if (!quizPromise) {
    quizPromise = fetch(`${HAPPY_CHINESE2_PUBLIC_BASE}/quizzes.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load happy_chinese2 quizzes: ${res.status}`)
        return res.json() as Promise<HappyChinese2QuizFile>
      })
      .catch((err) => {
        quizPromise = null
        throw err
      })
  }
  return quizPromise
}

export async function loadLessonQuizzes(lessonResourceId: string): Promise<HappyChinese2Quiz[]> {
  const all = await loadHappyChinese2Quizzes()
  return all[lessonResourceId] ?? []
}

export function quizImageUrl(relativePath: string): string {
  return `${HAPPY_CHINESE2_PUBLIC_BASE}/happy_chinese_images/${relativePath.replace(/^\//, '')}`
}
