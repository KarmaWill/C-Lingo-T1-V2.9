const STORAGE_KEY = 'clingo.library.activeBook.v1'

export type LibraryActiveBook = {
  id: string
  title: string
  badge: [string, string]
  coverUrl: string
  currentPage: number
  totalPages: number
}

/** Hub 默认快乐中文第一册，伴学卡走 Fun Chinese + Culture 双卡 */
export const DEFAULT_LIBRARY_BOOK: LibraryActiveBook = {
  id: 'hc-1',
  title: 'Happy Chinese',
  badge: ['Happy Chinese', 'Volume 1'],
  coverUrl: '/images/happy-chinese-vol1-cover.png',
  currentPage: 59,
  totalPages: 198,
}

export type LibraryBookInput = {
  id: string
  title: string
  subtitle?: string
  category: string
  coverUrl: string
  currentPage: number
  totalPages: number
}

export function toActiveLibraryBook(book: LibraryBookInput): LibraryActiveBook {
  let badge: [string, string]
  if (book.id === 'hsk1') badge = ['HSK1', 'Volume 1']
  else if (book.id === 'hsk2') badge = ['HSK2', 'Volume 1']
  else if (book.category === 'Happy Chinese') badge = ['Happy Chinese', book.subtitle || 'Volume 1']
  else if (book.category === 'HSK 3.0') badge = ['HSK 3.0', book.subtitle || 'Volume 1']
  else badge = [book.title, book.subtitle || '']
  return {
    id: book.id,
    title: book.title,
    badge,
    coverUrl: book.coverUrl,
    currentPage: book.currentPage,
    totalPages: book.totalPages,
  }
}

export function getActiveLibraryBook(): LibraryActiveBook {
  if (typeof window === 'undefined') return DEFAULT_LIBRARY_BOOK
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LIBRARY_BOOK
    const parsed = JSON.parse(raw) as Partial<LibraryActiveBook>
    if (!parsed.id || !parsed.coverUrl || !parsed.title) return DEFAULT_LIBRARY_BOOK
    return {
      id: parsed.id,
      title: parsed.title,
      badge: Array.isArray(parsed.badge) && parsed.badge.length === 2 ? parsed.badge : DEFAULT_LIBRARY_BOOK.badge,
      coverUrl: parsed.coverUrl,
      currentPage: Number(parsed.currentPage) || 0,
      totalPages: Number(parsed.totalPages) || 1,
    }
  } catch {
    return DEFAULT_LIBRARY_BOOK
  }
}

export function setActiveLibraryBook(book: LibraryActiveBook): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
}

export function isHappyChineseBook(book: LibraryActiveBook): boolean {
  return book.id.startsWith('hc-') || book.badge[0] === 'Happy Chinese'
}
