import type { AppLocaleId } from '../data/localeConfig';
import { localeRecord } from '../data/localeConfig';
import type { ReadingBuddyDocument, ReadingBuddyParagraph, ReadingBuddyWord } from '../data/readingBuddyStorage';

type DictEntry = {
  pinyin: string;
  partOfSpeech?: string;
  meanings: Parameters<typeof localeRecord>[0];
};

const DICT: Record<string, DictEntry> = {
  我: { pinyin: 'wǒ', partOfSpeech: 'pronoun', meanings: { en: 'I / me', zh: '第一人称', vi: 'tôi', ms: 'saya' } },
  你: { pinyin: 'nǐ', partOfSpeech: 'pronoun', meanings: { en: 'you', zh: '第二人称', vi: 'bạn', ms: 'awak' } },
  他: { pinyin: 'tā', partOfSpeech: 'pronoun', meanings: { en: 'he / him', zh: '第三人称（男）', vi: 'anh ấy', ms: 'dia (lelaki)' } },
  她: { pinyin: 'tā', partOfSpeech: 'pronoun', meanings: { en: 'she / her', zh: '第三人称（女）', vi: 'cô ấy', ms: 'dia (perempuan)' } },
  我们: { pinyin: 'wǒmen', partOfSpeech: 'pronoun', meanings: { en: 'we / us', zh: '第一人称复数', vi: 'chúng tôi', ms: 'kami' } },
  你们: { pinyin: 'nǐmen', partOfSpeech: 'pronoun', meanings: { en: 'you (plural)', zh: '第二人称复数', vi: 'các bạn', ms: 'kamu semua' } },
  他们: { pinyin: 'tāmen', partOfSpeech: 'pronoun', meanings: { en: 'they / them', zh: '第三人称复数', vi: 'họ', ms: 'mereka' } },
  爱: { pinyin: 'ài', partOfSpeech: 'verb', meanings: { en: 'to love', zh: '喜爱', vi: 'yêu', ms: 'sayang' } },
  喜欢: { pinyin: 'xǐhuan', partOfSpeech: 'verb', meanings: { en: 'to like', zh: '喜欢', vi: 'thích', ms: 'suka' } },
  学: { pinyin: 'xué', partOfSpeech: 'verb', meanings: { en: 'to learn / study', zh: '学习', vi: 'học', ms: 'belajar' } },
  学习: { pinyin: 'xuéxí', partOfSpeech: 'verb', meanings: { en: 'to study', zh: '学习', vi: 'học tập', ms: 'belajar' } },
  中文: { pinyin: 'Zhōngwén', partOfSpeech: 'noun', meanings: { en: 'Chinese language', zh: '中文', vi: 'tiếng Trung', ms: 'bahasa Cina' } },
  汉语: { pinyin: 'Hànyǔ', partOfSpeech: 'noun', meanings: { en: 'Chinese language', zh: '汉语', vi: 'tiếng Hán', ms: 'bahasa Han' } },
  汉字: { pinyin: 'Hànzì', partOfSpeech: 'noun', meanings: { en: 'Chinese characters', zh: '汉字', vi: 'chữ Hán', ms: 'aksara Cina' } },
  你好: { pinyin: 'nǐ hǎo', partOfSpeech: 'phrase', meanings: { en: 'hello', zh: '你好', vi: 'xin chào', ms: 'hello' } },
  谢谢: { pinyin: 'xièxie', partOfSpeech: 'phrase', meanings: { en: 'thank you', zh: '谢谢', vi: 'cảm ơn', ms: 'terima kasih' } },
  再见: { pinyin: 'zàijiàn', partOfSpeech: 'phrase', meanings: { en: 'goodbye', zh: '再见', vi: 'tạm biệt', ms: 'selamat tinggal' } },
  名字: { pinyin: 'míngzi', partOfSpeech: 'noun', meanings: { en: 'name', zh: '名字', vi: 'tên', ms: 'nama' } },
  什么: { pinyin: 'shénme', partOfSpeech: 'pronoun', meanings: { en: 'what', zh: '什么', vi: 'gì', ms: 'apa' } },
  叫: { pinyin: 'jiào', partOfSpeech: 'verb', meanings: { en: 'to be called', zh: '叫做', vi: 'gọi là', ms: 'dinamakan' } },
  是: { pinyin: 'shì', partOfSpeech: 'verb', meanings: { en: 'to be', zh: '是', vi: 'là', ms: 'ialah' } },
  的: { pinyin: 'de', partOfSpeech: 'particle', meanings: { en: 'possessive particle', zh: '的（结构助词）', vi: 'của', ms: 'partikel milik' } },
  了: { pinyin: 'le', partOfSpeech: 'particle', meanings: { en: 'aspect particle', zh: '了（助词）', vi: 'đã', ms: 'partikel aspek' } },
  吗: { pinyin: 'ma', partOfSpeech: 'particle', meanings: { en: 'question particle', zh: '吗（疑问）', vi: 'không', ms: 'partikel soalan' } },
  呢: { pinyin: 'ne', partOfSpeech: 'particle', meanings: { en: 'question particle', zh: '呢', vi: 'nhỉ', ms: 'partikel soalan' } },
  吧: { pinyin: 'ba', partOfSpeech: 'particle', meanings: { en: 'suggestion particle', zh: '吧', vi: 'nhé', ms: 'partikel cadangan' } },
  很: { pinyin: 'hěn', partOfSpeech: 'adverb', meanings: { en: 'very', zh: '很', vi: 'rất', ms: 'sangat' } },
  高兴: { pinyin: 'gāoxìng', partOfSpeech: 'adj', meanings: { en: 'happy / glad', zh: '高兴', vi: 'vui', ms: 'gembira' } },
  认识: { pinyin: 'rènshi', partOfSpeech: 'verb', meanings: { en: 'to know (someone)', zh: '认识', vi: 'quen biết', ms: 'kenal' } },
  一起: { pinyin: 'yīqǐ', partOfSpeech: 'adv', meanings: { en: 'together', zh: '一起', vi: 'cùng nhau', ms: 'bersama' } },
  今天: { pinyin: 'jīntiān', partOfSpeech: 'noun', meanings: { en: 'today', zh: '今天', vi: 'hôm nay', ms: 'hari ini' } },
  明天: { pinyin: 'míngtiān', partOfSpeech: 'noun', meanings: { en: 'tomorrow', zh: '明天', vi: 'ngày mai', ms: 'esok' } },
  朋友: { pinyin: 'péngyou', partOfSpeech: 'noun', meanings: { en: 'friend', zh: '朋友', vi: 'bạn bè', ms: 'kawan' } },
  老师: { pinyin: 'lǎoshī', partOfSpeech: 'noun', meanings: { en: 'teacher', zh: '老师', vi: 'giáo viên', ms: 'cikgu' } },
  学生: { pinyin: 'xuésheng', partOfSpeech: 'noun', meanings: { en: 'student', zh: '学生', vi: 'học sinh', ms: 'pelajar' } },
  学校: { pinyin: 'xuéxiào', partOfSpeech: 'noun', meanings: { en: 'school', zh: '学校', vi: 'trường học', ms: 'sekolah' } },
  书: { pinyin: 'shū', partOfSpeech: 'noun', meanings: { en: 'book', zh: '书', vi: 'sách', ms: 'buku' } },
  阅读: { pinyin: 'yuèdú', partOfSpeech: 'verb', meanings: { en: 'to read', zh: '阅读', vi: 'đọc', ms: 'membaca' } },
  读: { pinyin: 'dú', partOfSpeech: 'verb', meanings: { en: 'to read', zh: '读', vi: 'đọc', ms: 'baca' } },
  写: { pinyin: 'xiě', partOfSpeech: 'verb', meanings: { en: 'to write', zh: '写', vi: 'viết', ms: 'tulis' } },
  说: { pinyin: 'shuō', partOfSpeech: 'verb', meanings: { en: 'to speak', zh: '说', vi: 'nói', ms: 'cakap' } },
  听: { pinyin: 'tīng', partOfSpeech: 'verb', meanings: { en: 'to listen', zh: '听', vi: 'nghe', ms: 'dengar' } },
  看: { pinyin: 'kàn', partOfSpeech: 'verb', meanings: { en: 'to look / watch', zh: '看', vi: 'xem', ms: 'tengok' } },
  去: { pinyin: 'qù', partOfSpeech: 'verb', meanings: { en: 'to go', zh: '去', vi: 'đi', ms: 'pergi' } },
  来: { pinyin: 'lái', partOfSpeech: 'verb', meanings: { en: 'to come', zh: '来', vi: 'đến', ms: 'datang' } },
  在: { pinyin: 'zài', partOfSpeech: 'preposition', meanings: { en: 'at / in', zh: '在', vi: 'ở', ms: 'di' } },
  有: { pinyin: 'yǒu', partOfSpeech: 'verb', meanings: { en: 'to have', zh: '有', vi: 'có', ms: 'ada' } },
  没有: { pinyin: 'méiyǒu', partOfSpeech: 'verb', meanings: { en: 'to not have', zh: '没有', vi: 'không có', ms: 'tiada' } },
  可以: { pinyin: 'kěyǐ', partOfSpeech: 'verb', meanings: { en: 'can / may', zh: '可以', vi: 'có thể', ms: 'boleh' } },
  会: { pinyin: 'huì', partOfSpeech: 'verb', meanings: { en: 'can / will', zh: '会', vi: 'sẽ / biết', ms: 'boleh / akan' } },
  想: { pinyin: 'xiǎng', partOfSpeech: 'verb', meanings: { en: 'to want / think', zh: '想', vi: 'muốn', ms: 'mahu' } },
  知道: { pinyin: 'zhīdào', partOfSpeech: 'verb', meanings: { en: 'to know', zh: '知道', vi: 'biết', ms: 'tahu' } },
  帮助: { pinyin: 'bāngzhù', partOfSpeech: 'verb', meanings: { en: 'to help', zh: '帮助', vi: 'giúp đỡ', ms: 'bantu' } },
  助手: { pinyin: 'zhùshǒu', partOfSpeech: 'noun', meanings: { en: 'assistant', zh: '助手', vi: 'trợ lý', ms: 'pembantu' } },
  语言: { pinyin: 'yǔyán', partOfSpeech: 'noun', meanings: { en: 'language', zh: '语言', vi: 'ngôn ngữ', ms: 'bahasa' } },
  文化: { pinyin: 'wénhuà', partOfSpeech: 'noun', meanings: { en: 'culture', zh: '文化', vi: 'văn hóa', ms: 'budaya' } },
  中国: { pinyin: 'Zhōngguó', partOfSpeech: 'noun', meanings: { en: 'China', zh: '中国', vi: 'Trung Quốc', ms: 'China' } },
  北京: { pinyin: 'Běijīng', partOfSpeech: 'noun', meanings: { en: 'Beijing', zh: '北京', vi: 'Bắc Kinh', ms: 'Beijing' } },
  上海: { pinyin: 'Shànghǎi', partOfSpeech: 'noun', meanings: { en: 'Shanghai', zh: '上海', vi: 'Thượng Hải', ms: 'Shanghai' } },
  每天: { pinyin: 'měitiān', partOfSpeech: 'noun', meanings: { en: 'every day', zh: '每天', vi: 'mỗi ngày', ms: 'setiap hari' } },
  练习: { pinyin: 'liànxí', partOfSpeech: 'verb', meanings: { en: 'to practice', zh: '练习', vi: 'luyện tập', ms: 'berlatih' } },
  进步: { pinyin: 'jìnbù', partOfSpeech: 'verb', meanings: { en: 'to improve', zh: '进步', vi: 'tiến bộ', ms: 'berkembang' } },
  故事: { pinyin: 'gùshi', partOfSpeech: 'noun', meanings: { en: 'story', zh: '故事', vi: 'câu chuyện', ms: 'cerita' } },
  文章: { pinyin: 'wénzhāng', partOfSpeech: 'noun', meanings: { en: 'article / essay', zh: '文章', vi: 'bài văn', ms: 'artikel' } },
  段落: { pinyin: 'duànluò', partOfSpeech: 'noun', meanings: { en: 'paragraph', zh: '段落', vi: 'đoạn văn', ms: 'perenggan' } },
  词汇: { pinyin: 'cíhuì', partOfSpeech: 'noun', meanings: { en: 'vocabulary', zh: '词汇', vi: 'từ vựng', ms: 'kosa kata' } },
  拼音: { pinyin: 'pīnyīn', partOfSpeech: 'noun', meanings: { en: 'pinyin', zh: '拼音', vi: 'bính âm', ms: 'pinyin' } },
  小明: { pinyin: 'Xiǎomíng', partOfSpeech: 'name', meanings: { en: 'Xiaoming (name)', zh: '小明（名字）', vi: 'Tiểu Minh', ms: 'Xiaoming' } },
  美林: { pinyin: 'Měilín', partOfSpeech: 'name', meanings: { en: 'Meilin (name)', zh: '美林（名字）', vi: 'Mỹ Linh', ms: 'Meilin' } },
};

const DICT_KEYS = Object.keys(DICT).sort((a, b) => b.length - a.length);
const CJK_RE = /[\u4e00-\u9fff]/;

function isChineseChar(char: string): boolean {
  return CJK_RE.test(char);
}

function lookupWord(text: string): ReadingBuddyWord {
  const entry = DICT[text];
  if (entry) {
    return {
      text,
      pinyin: entry.pinyin,
      meanings: localeRecord(entry.meanings),
      partOfSpeech: entry.partOfSpeech,
    };
  }

  const fallbackMeaning = (en: string): Record<AppLocaleId, string> =>
    localeRecord({
      en,
      zh: `词条：${text}`,
      vi: en,
      ms: en,
    });

  return {
    text,
    pinyin: isChineseChar(text) ? '—' : '',
    meanings: fallbackMeaning(isChineseChar(text) ? 'Tap for AI lookup' : text),
    partOfSpeech: isChineseChar(text) ? 'unknown' : 'text',
  };
}

export function segmentChineseLine(line: string): ReadingBuddyWord[] {
  const words: ReadingBuddyWord[] = [];
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    if (!isChineseChar(char)) {
      let j = i + 1;
      while (j < line.length && !isChineseChar(line[j])) j += 1;
      words.push(lookupWord(line.slice(i, j)));
      i = j;
      continue;
    }

    let matched = '';
    for (const key of DICT_KEYS) {
      if (line.startsWith(key, i)) {
        matched = key;
        break;
      }
    }

    if (matched) {
      words.push(lookupWord(matched));
      i += matched.length;
    } else {
      words.push(lookupWord(char));
      i += 1;
    }
  }

  return words;
}

function splitParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function buildAiSummary(raw: string): Record<AppLocaleId, string> {
  const preview = raw.length > 48 ? `${raw.slice(0, 48)}…` : raw;
  return localeRecord({
    en: `This paragraph introduces: "${preview}". Focus on key vocabulary and read aloud to build fluency.`,
    zh: `本段内容：「${preview}」。建议先分词理解，再跟读练习。`,
    vi: `Đoạn này nói về: "${preview}". Hãy đọc từng từ và luyện đọc to.`,
    ms: `Perenggan ini membincangkan: "${preview}". Fokus pada kosa kata dan baca dengan lantang.`,
  });
}

export function processTextContent(fileName: string, content: string): ReadingBuddyDocument {
  const title = fileName.replace(/\.(txt|md|text|doc|docx)$/i, '') || 'Untitled';
  const paragraphs = splitParagraphs(content).map((raw, index) => ({
    id: `p-${index + 1}`,
    raw,
    words: segmentChineseLine(raw),
    aiSummary: buildAiSummary(raw),
  }));

  if (!paragraphs.length) {
    paragraphs.push({
      id: 'p-1',
      raw: content.trim() || '（空文档）',
      words: segmentChineseLine(content.trim() || '（空文档）'),
      aiSummary: buildAiSummary(content.trim() || 'empty'),
    });
  }

  return {
    id: `rb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    fileName,
    createdAt: Date.now(),
    paragraphs,
  };
}

export async function processUploadedFile(
  file: File,
  onProgress?: (message: string) => void,
): Promise<ReadingBuddyDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  onProgress?.('Reading file…');

  if (ext === 'doc' || ext === 'docx') {
    throw new Error('DOC/DOCX preview is not supported yet. Please upload a .txt file for now.');
  }

  if (!['txt', 'md', 'text'].includes(ext)) {
    throw new Error('Unsupported format. Please upload .txt or .md');
  }

  onProgress?.('AI is segmenting words…');
  await new Promise((resolve) => setTimeout(resolve, 900));

  const content = await file.text();
  onProgress?.('Building your reading buddy…');
  await new Promise((resolve) => setTimeout(resolve, 700));

  return processTextContent(file.name, content);
}

export const SAMPLE_DOCUMENT_CONTENT = `你好！我叫小明。

我喜欢学习中文。今天我和朋友一起读了一本书。阅读可以帮助我进步，也可以让我更好地了解中国文化。

我们一起练习词汇和拼音。如果你也想学中文，我们可以一起读这篇文章。`;

export function createSampleDocument(): ReadingBuddyDocument {
  return processTextContent('Sample — Learning Chinese.txt', SAMPLE_DOCUMENT_CONTENT);
}

export function readParagraphAloud(text: string, lang = 'zh-CN'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

export function lookupWordWithAi(word: ReadingBuddyWord, locale: AppLocaleId): ReadingBuddyWord {
  if (word.partOfSpeech !== 'unknown') return word;

  const aiMeanings = localeRecord({
    en: `AI: "${word.text}" — common character in reading texts. Context helps determine meaning.`,
    zh: `AI 查词：「${word.text}」— 建议结合上下文理解。`,
    vi: `AI: "${word.text}" — ký tự thường gặp, cần xem ngữ cảnh.`,
    ms: `AI: "${word.text}" — aksara biasa, lihat konteks ayat.`,
  });

  return {
    ...word,
    meanings: aiMeanings,
    partOfSpeech: 'char',
  };
}
