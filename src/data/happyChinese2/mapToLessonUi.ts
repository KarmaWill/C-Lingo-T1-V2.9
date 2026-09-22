/**
 * Map happy_chinese2 catalog + content → Hub / Lesson UI shapes.
 */
import {
  getCatalogLessonByOrder,
  getCatalogUnit,
  parseHskLevel,
  pickLocale,
  stripLessonOrderPrefix,
  shortUnitTitle,
  type CatalogLesson,
  type HappyChineseLang,
  type LessonContent,
} from './index'

export type HubUnitTitles = {
  titleZh: string
  titleEn: string
}

export function getDemoUnitTitles(lang: HappyChineseLang = 'en'): HubUnitTitles {
  const unit = getCatalogUnit()
  if (!unit) {
    return { titleZh: '我和朋友', titleEn: 'Me and My Friends' }
  }
  return {
    titleZh: shortUnitTitle(pickLocale(unit.title, 'zh'), 'zh'),
    titleEn: shortUnitTitle(pickLocale(unit.title, 'en'), 'en'),
  }
}

export type LessonUiMeta = {
  id: number
  resourceId: string
  title: string
  titleEn: string
  goalsEn: string[]
  goalsZh: string[]
}

export function catalogLessonToUiMeta(lesson: CatalogLesson): LessonUiMeta {
  return {
    id: lesson.order,
    resourceId: lesson.id,
    title: stripLessonOrderPrefix(pickLocale(lesson.title, 'zh')),
    titleEn: stripLessonOrderPrefix(pickLocale(lesson.title, 'en')),
    goalsEn: lesson.goals.map((g) => pickLocale(g.text, 'en')),
    goalsZh: lesson.goals.map((g) => pickLocale(g.text, 'zh')),
  }
}

export function listDemoUnitLessonMeta(): LessonUiMeta[] {
  const unit = getCatalogUnit()
  if (!unit) return []
  return [...unit.lessons]
    .sort((a, b) => a.order - b.order)
    .map(catalogLessonToUiMeta)
}

export type UiVocabItem = {
  id: string
  chinese: string
  pinyin: string
  translations: { en: string; vi: string; th?: string; id?: string }
  tones: number[]
  hskLevel: number
  partOfSpeech: string
  partOfSpeechTranslations: { en: string; vi: string }
}

export function mapContentVocab(content: LessonContent | null): UiVocabItem[] {
  const rows = content?.vocab?.length ? content.vocab : content?.chars || []
  return [...rows]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const zh = pickLocale(item.text, 'zh')
      const en = pickLocale(item.text, 'en')
      const vi = pickLocale(item.text, 'vi') || en
      const posZh = pickLocale(item.pos, 'zh')
      const posEn = pickLocale(item.pos, 'en') || posZh
      return {
        id: item.id,
        chinese: zh,
        pinyin: item.pinyin || '',
        translations: {
          en: en || zh,
          vi,
          th: pickLocale(item.text, 'th') || undefined,
          id: pickLocale(item.text, 'id') || undefined,
        },
        tones: [],
        hskLevel: parseHskLevel(item.hsk),
        partOfSpeech: posZh || '词',
        partOfSpeechTranslations: {
          en: posEn || 'word',
          vi: pickLocale(item.pos, 'vi') || posEn || 'word',
        },
      }
    })
}

export function buildLessonDemoBundle(lessonOrder: number, content: LessonContent | null) {
  const catalogLesson = getCatalogLessonByOrder(lessonOrder)
  const meta = catalogLesson
    ? catalogLessonToUiMeta(catalogLesson)
    : {
        id: lessonOrder,
        resourceId: '',
        title: `Lesson ${lessonOrder}`,
        titleEn: `Lesson ${lessonOrder}`,
        goalsEn: [],
        goalsZh: [],
      }

  return {
    meta,
    vocabulary: mapContentVocab(content),
    content,
  }
}
