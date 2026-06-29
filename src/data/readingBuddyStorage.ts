import type { AppLocaleId } from './localeConfig';

export interface ReadingBuddyWord {
  text: string;
  pinyin: string;
  meanings: Record<AppLocaleId, string>;
  partOfSpeech?: string;
}

export interface ReadingBuddyParagraph {
  id: string;
  raw: string;
  words: ReadingBuddyWord[];
  aiSummary?: Record<AppLocaleId, string>;
}

export interface ReadingBuddyDocument {
  id: string;
  title: string;
  fileName: string;
  createdAt: number;
  lastOpenedAt?: number;
  paragraphs: ReadingBuddyParagraph[];
}

const STORAGE_KEY = 'c-lingo-reading-buddy-docs-v1';

export function loadReadingBuddyDocuments(): ReadingBuddyDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadingBuddyDocument[]) : [];
  } catch {
    return [];
  }
}

export function saveReadingBuddyDocuments(docs: ReadingBuddyDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save reading buddy documents:', err);
  }
}

export function getReadingBuddyDocument(id: string): ReadingBuddyDocument | undefined {
  return loadReadingBuddyDocuments().find((doc) => doc.id === id);
}

export function upsertReadingBuddyDocument(doc: ReadingBuddyDocument): void {
  const docs = loadReadingBuddyDocuments();
  const index = docs.findIndex((item) => item.id === doc.id);
  if (index === -1) {
    docs.unshift(doc);
  } else {
    docs[index] = doc;
  }
  saveReadingBuddyDocuments(docs);
}

export function deleteReadingBuddyDocument(id: string): void {
  saveReadingBuddyDocuments(loadReadingBuddyDocuments().filter((doc) => doc.id !== id));
}

export function touchReadingBuddyDocument(id: string): void {
  const docs = loadReadingBuddyDocuments();
  const index = docs.findIndex((doc) => doc.id === id);
  if (index === -1) return;
  docs[index] = { ...docs[index], lastOpenedAt: Date.now() };
  saveReadingBuddyDocuments(docs);
}
