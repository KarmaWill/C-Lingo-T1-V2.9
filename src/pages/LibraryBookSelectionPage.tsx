/**
 * Library Book Selection Page
 * Entered from LibraryPage via "Choose a Book" button.
 * Displays all available books with search, category filter, and view toggle.
 *
 * Edit mode: header Edit button → batch download all / delete all downloaded.
 * Individual grid: download/delete/checkmark badge always visible top-right;
 *                  long-press opens single-book management overlay.
 */
import { useState, useMemo, useRef, useEffect, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, InputBase, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { figmaPx, FIGMA_FONT } from '../utils/figmaScale';

interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  coverUrl: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  category: string;
  hskLevel?: number;
  isDownloaded: boolean;
  downloadProgress?: number;
}

type Category = 'All' | 'Happy Chinese' | 'HSK' | 'Culture' | 'Practice';

const buildCourseCover = (level: string, title: string, startColor: string, endColor: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="20%" r="65%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="400" height="560" rx="28" fill="url(#bg)"/>
      <rect width="400" height="560" rx="28" fill="url(#glow)"/>
      <circle cx="316" cy="78" r="52" fill="rgba(255,255,255,0.22)"/>
      <circle cx="84" cy="456" r="72" fill="rgba(15,23,42,0.12)"/>
      <rect x="36" y="44" width="328" height="472" rx="24" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
      <text x="56" y="112" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="white" letter-spacing="2">CHINESE</text>
      <text x="56" y="174" font-family="Arial, sans-serif" font-size="70" font-weight="900" fill="white">${level}</text>
      <text x="56" y="224" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="rgba(255,255,255,0.92)">${title}</text>
      <text x="56" y="266" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="rgba(255,255,255,0.78)">Standard Course</text>
      <path d="M82 358 C128 322, 176 320, 222 356 S310 392, 344 346" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="14" stroke-linecap="round"/>
      <path d="M86 410 H314" stroke="rgba(255,255,255,0.45)" stroke-width="4" stroke-linecap="round"/>
      <path d="M112 438 H288" stroke="rgba(255,255,255,0.32)" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  )}`;

const buildSeriesCover = (label: string, title: string, subtitle: string, startColor: string, endColor: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" rx="28" fill="url(#bg)"/>
      <circle cx="318" cy="94" r="70" fill="rgba(255,255,255,0.18)"/>
      <circle cx="70" cy="432" r="92" fill="rgba(15,23,42,0.12)"/>
      <rect x="38" y="42" width="324" height="476" rx="24" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.34)" stroke-width="2"/>
      <text x="58" y="108" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="rgba(255,255,255,0.78)" letter-spacing="2">${label}</text>
      <text x="58" y="184" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="white">${title}</text>
      <text x="58" y="226" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="rgba(255,255,255,0.88)">${subtitle}</text>
      <rect x="58" y="286" width="116" height="116" rx="26" fill="rgba(255,255,255,0.88)"/>
      <text x="116" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="900" fill="${endColor}">中</text>
      <path d="M210 310 C244 286, 282 286, 316 310" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="10" stroke-linecap="round"/>
      <path d="M202 356 H326" stroke="rgba(255,255,255,0.48)" stroke-width="5" stroke-linecap="round"/>
      <path d="M202 386 H286" stroke="rgba(255,255,255,0.34)" stroke-width="5" stroke-linecap="round"/>
    </svg>`
  )}`;

const INITIAL_BOOKS: Book[] = [
  {
    id: 'hc-1',
    title: 'Happy Chinese',
    subtitle: 'Volume 1',
    author: 'Li Xiaolin',
    coverUrl: '/images/happy-chinese-vol1-cover.png',
    progress: 25,
    totalPages: 198,
    currentPage: 59,
    category: 'Happy Chinese',
    hskLevel: 1,
    isDownloaded: true,
  },
  {
    id: 'hc-2',
    title: 'Happy Chinese',
    subtitle: 'Volume 2',
    author: 'Li Xiaolin',
    coverUrl: '/images/happy-chinese-vol2-cover.png',
    progress: 0,
    totalPages: 210,
    currentPage: 0,
    category: 'Happy Chinese',
    hskLevel: 2,
    isDownloaded: false,
  },
  {
    id: 'hsk1',
    title: 'HSK 1 Standard Course',
    subtitle: 'Textbook',
    author: 'Confucius Institute',
    coverUrl: buildCourseCover('HSK 1', 'Textbook', '#F97316', '#F59E0B'),
    progress: 85,
    totalPages: 150,
    currentPage: 128,
    category: 'HSK',
    hskLevel: 1,
    isDownloaded: true,
  },
  {
    id: 'hsk2',
    title: 'HSK 2 Standard Course',
    subtitle: 'Textbook',
    author: 'Confucius Institute',
    coverUrl: buildCourseCover('HSK 2', 'Textbook', '#2563EB', '#06B6D4'),
    progress: 0,
    totalPages: 180,
    currentPage: 0,
    category: 'HSK',
    hskLevel: 2,
    isDownloaded: false,
    downloadProgress: 45,
  },
  {
    id: 'culture-1',
    title: 'Chinese Festivals',
    subtitle: 'Culture Series',
    author: 'Wang Ming',
    coverUrl: buildSeriesCover('CULTURE', 'Festivals', 'Culture Series', '#DC2626', '#F97316'),
    progress: 50,
    totalPages: 100,
    currentPage: 50,
    category: 'Culture',
    isDownloaded: false,
  },
  {
    id: 'exercise-1',
    title: 'Grammar Master',
    subtitle: 'HSK 1-2',
    author: 'Zhang San',
    coverUrl: buildSeriesCover('PRACTICE', 'Grammar', 'HSK 1-2', '#334155', '#0F172A'),
    progress: 15,
    totalPages: 80,
    currentPage: 12,
    category: 'Practice',
    hskLevel: 1,
    isDownloaded: true,
  },
];

const buildFallbackCover = (title: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E0F2FE"/>
          <stop offset="100%" stop-color="#DBEAFE"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="26" y="26" width="348" height="508" rx="16" fill="none" stroke="#93C5FD" stroke-width="3"/>
      <text x="50%" y="46%" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#1E3A8A">Chinese Textbook</text>
      <text x="50%" y="54%" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="600" fill="#1D4ED8">
        ${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>`
  )}`;

export default function LibraryBookSelectionPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const p = (n: number) => figmaPx(n, screenSize);

  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditMode, setIsEditMode] = useState(false);
  const [managedBookId, setManagedBookId] = useState<string | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmMode, setDeleteConfirmMode] = useState<'all' | 'selected'>('all');
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadTimersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const categories: Category[] = ['All', 'Happy Chinese', 'HSK', 'Culture', 'Practice'];
  const categoryLabel = (cat: Category) => (cat === 'Practice' ? 'Exercises' : cat);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, activeCategory]);

  const continueReadingBooks = useMemo(
    () => books.filter((b) => b.progress > 0 && b.progress < 100),
    [books],
  );

  const clearDownloadTimer = (id: string) => {
    const timer = downloadTimersRef.current[id];
    if (timer) {
      clearInterval(timer);
      delete downloadTimersRef.current[id];
    }
  };

  const startDownload = (id: string) => {
    clearDownloadTimer(id);
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.isDownloaded) return b;
        return { ...b, downloadProgress: b.downloadProgress ?? 0 };
      }),
    );
    downloadTimersRef.current[id] = setInterval(() => {
      let completed = false;
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          if (b.isDownloaded) {
            completed = true;
            return b;
          }
          const current = b.downloadProgress ?? 0;
          const next = Math.min(100, current + 12);
          if (next >= 100) {
            completed = true;
            return { ...b, isDownloaded: true, downloadProgress: undefined };
          }
          return { ...b, downloadProgress: next };
        }),
      );
      if (completed) clearDownloadTimer(id);
    }, 160);
  };

  const downloadBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    if (!target || target.isDownloaded) return;
    startDownload(id);
  };

  const deleteBook = (id: string) => {
    clearDownloadTimer(id);
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isDownloaded: false, downloadProgress: undefined } : b)),
    );
  };

  const deleteAllDownloaded = () => {
    Object.keys(downloadTimersRef.current).forEach(clearDownloadTimer);
    setBooks((prev) => prev.map((b) => ({ ...b, isDownloaded: false, downloadProgress: undefined })));
  };

  const toggleSelectBook = (id: string) => {
    setSelectedBookIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedBookIds.length === filteredBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredBooks.map((b) => b.id));
    }
  };

  const deleteSelectedBooks = () => {
    if (selectedBookIds.length === 0) return;
    selectedBookIds.forEach(clearDownloadTimer);
    setBooks((prev) =>
      prev.map((b) =>
        selectedBookIds.includes(b.id)
          ? { ...b, isDownloaded: false, downloadProgress: undefined }
          : b,
      ),
    );
    setSelectedBookIds([]);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmMode(selectedBookIds.length > 0 ? 'selected' : 'all');
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => setIsDeleteConfirmOpen(false);

  const confirmDelete = () => {
    if (deleteConfirmMode === 'selected') deleteSelectedBooks();
    else deleteAllDownloaded();
    setIsDeleteConfirmOpen(false);
  };

  const handleLongPressStart = (bookId: string) => {
    longPressTimer.current = setTimeout(() => {
      setManagedBookId(bookId);
      navigator.vibrate?.(50);
    }, 500);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setManagedBookId(null);
    setSelectedBookIds([]);
  };

  useEffect(() => {
    return () => {
      Object.values(downloadTimersRef.current).forEach((timer) => clearInterval(timer));
      downloadTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (isEditMode) setManagedBookId(null);
  }, [isEditMode]);

  /** Figma 书架1 tokens */
  const teal = '#00B4A0';
  const ink = '#2D3436';
  const mute = '#636E72';
  const place = '#A7B3B8';
  const line = '#E0E0DF';
  const soft = '#F3F4F6';
  const pageBg = '#F8F9F8';
  const downloadedCount = books.filter((b) => b.isDownloaded).length;

  const coverImg = (book: Book, sx: Record<string, unknown> = {}) => (
    <Box
      component="img"
      src={book.coverUrl}
      alt={book.title}
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = buildFallbackCover(book.title);
      }}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...sx }}
    />
  );

  const renderGridCta = (book: Book) => {
    const downloading = book.downloadProgress !== undefined && !book.isDownloaded;
    if (book.isDownloaded) {
      return (
        <ButtonBase
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/library/read/${book.id}`);
          }}
          sx={{
            width: p(270),
            height: p(80),
            borderRadius: `${p(84)}px`,
            bgcolor: teal,
            color: '#FFF',
            fontFamily: FIGMA_FONT,
            fontWeight: 400,
            fontSize: p(28),
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          Open
        </ButtonBase>
      );
    }
    if (downloading) {
      const pct = book.downloadProgress ?? 0;
      return (
        <Box
          sx={{
            position: 'relative',
            width: p(270),
            height: p(80),
            borderRadius: `${p(84)}px`,
            bgcolor: 'rgba(0,0,0,0.4)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              bgcolor: teal,
              borderRadius: `${p(60)}px 0 0 ${p(60)}px`,
            }}
          />
          <Typography
            sx={{
              position: 'relative',
              zIndex: 1,
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(28),
              color: '#FFF',
            }}
          >
            {pct}%
          </Typography>
        </Box>
      );
    }
    return (
      <ButtonBase
        onClick={(e) => {
          e.stopPropagation();
          downloadBook(book.id);
        }}
        sx={{
          width: p(270),
          height: p(80),
          borderRadius: `${p(84)}px`,
          bgcolor: '#2188FE',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(16)}px`,
          fontFamily: FIGMA_FONT,
          fontWeight: 400,
          fontSize: p(28),
          '&:active': { transform: 'scale(0.97)' },
        }}
      >
        <DownloadIcon sx={{ fontSize: p(26), color: '#FFF' }} />
        Download
      </ButtonBase>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        fontFamily: FIGMA_FONT,
        boxSizing: 'border-box',
      }}
    >
      {/* Header — Figma 160 */}
      <Box
        sx={{
          height: p(160),
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderBottom: `1px solid #E2E2E3`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          px: `${p(60)}px`,
          gap: `${p(30)}px`,
        }}
      >
        <ButtonBase
          onClick={isEditMode ? exitEditMode : () => navigate('/library')}
          aria-label={isEditMode ? 'Done' : 'Back'}
          sx={{
            width: isEditMode ? 'auto' : p(80),
            minWidth: p(80),
            height: p(80),
            px: isEditMode ? `${p(28)}px` : 0,
            borderRadius: `${p(100)}px`,
            bgcolor: '#FFFFFF',
            border: `1px solid ${line}`,
            color: ink,
            flexShrink: 0,
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(28),
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          {isEditMode ? 'Done' : <ChevronLeftIcon sx={{ fontSize: p(40) }} />}
        </ButtonBase>

        {!isEditMode ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: p(80),
              bgcolor: soft,
              border: `1px solid ${line}`,
              borderRadius: `${p(28)}px`,
              display: 'flex',
              alignItems: 'center',
              px: `${p(30)}px`,
              gap: `${p(16)}px`,
              backdropFilter: 'blur(2px)',
            }}
          >
            <SearchIcon sx={{ fontSize: p(32), color: place, flexShrink: 0 }} />
            <InputBase
              placeholder="Search for books, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                fontFamily: FIGMA_FONT,
                fontSize: p(28),
                fontWeight: 400,
                color: ink,
                '& input::placeholder': { color: place, opacity: 1 },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {!isEditMode ? (
          <ButtonBase
            onClick={() => setIsEditMode(true)}
            sx={{
              width: p(233),
              height: p(80),
              flexShrink: 0,
              bgcolor: soft,
              border: `1px solid ${line}`,
              borderRadius: `${p(50)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(12)}px`,
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(32),
              color: ink,
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <FormatListBulletedIcon sx={{ fontSize: p(38), color: ink }} />
            Manage
          </ButtonBase>
        ) : (
          <Box sx={{ display: 'flex', gap: `${p(16)}px`, flexShrink: 0 }}>
            <ButtonBase
              onClick={toggleSelectAll}
              sx={{
                height: p(80),
                px: `${p(28)}px`,
                borderRadius: `${p(28)}px`,
                bgcolor: soft,
                border: `1px solid ${line}`,
                color: ink,
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(28),
                gap: `${p(10)}px`,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: p(32) }} />
              {selectedBookIds.length === filteredBooks.length && filteredBooks.length > 0
                ? 'Clear'
                : 'Select All'}
            </ButtonBase>
            {(downloadedCount > 0 || selectedBookIds.length > 0) && (
              <ButtonBase
                onClick={openDeleteConfirm}
                sx={{
                  height: p(80),
                  px: `${p(28)}px`,
                  borderRadius: `${p(28)}px`,
                  bgcolor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#EF4444',
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(28),
                  gap: `${p(10)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: p(32) }} />
                {selectedBookIds.length > 0
                  ? `Delete (${selectedBookIds.length})`
                  : 'Delete All'}
              </ButtonBase>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${p(60)}px`,
          pt: `${p(40)}px`,
          pb: `${p(40)}px`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 3 },
        }}
      >
        {/* Continue reading */}
        {!isEditMode && !searchQuery && activeCategory === 'All' && continueReadingBooks.length > 0 && (
          <Box sx={{ mb: `${p(40)}px` }}>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                lineHeight: `${p(51)}px`,
                color: ink,
                mb: `${p(24)}px`,
              }}
            >
              Continue reading
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: `${p(40)}px`,
                overflowX: 'auto',
                pb: `${p(8)}px`,
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {continueReadingBooks.map((book) => (
                <ButtonBase
                  key={book.id}
                  onClick={() => navigate(`/library/read/${book.id}`)}
                  sx={{
                    flexShrink: 0,
                    width: p(600),
                    height: p(300),
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${line}`,
                    borderRadius: `${p(40)}px`,
                    display: 'flex',
                    alignItems: 'stretch',
                    textAlign: 'left',
                    p: `${p(30)}px`,
                    gap: `${p(30)}px`,
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box
                    sx={{
                      width: p(172),
                      height: p(240),
                      borderRadius: `${p(26)}px`,
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: soft,
                    }}
                  >
                    {coverImg(book)}
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      py: `${p(0)}px`,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 700,
                          fontSize: p(32),
                          lineHeight: `${p(51)}px`,
                          color: ink,
                        }}
                      >
                        {book.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 400,
                          fontSize: p(24),
                          lineHeight: `${p(38)}px`,
                          color: mute,
                          mt: `${p(8)}px`,
                        }}
                      >
                        {[book.subtitle, book.author].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: `${p(10)}px`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontSize: p(24),
                            color: mute,
                            fontWeight: 400,
                          }}
                        >
                          {book.currentPage} / {book.totalPages} Pages
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FIGMA_FONT,
                            fontSize: p(24),
                            color: teal,
                            fontWeight: 400,
                          }}
                        >
                          {book.progress}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: p(8),
                          bgcolor: 'rgba(0,0,0,0.1)',
                          borderRadius: `${p(68)}px`,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${book.progress}%`,
                            bgcolor: teal,
                            borderRadius: `${p(68)}px`,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        )}

        {/* Filters + view toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${p(24)}px`,
            mb: `${p(40)}px`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: p(90),
              bgcolor: soft,
              border: `1px solid ${line}`,
              borderRadius: `${p(28)}px`,
              px: `${p(10)}px`,
              gap: 0,
              overflowX: 'auto',
              maxWidth: '100%',
              backdropFilter: 'blur(2px)',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <ButtonBase
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    height: p(70),
                    px: `${p(48)}px`,
                    borderRadius: `${p(26)}px`,
                    bgcolor: active ? '#FFFFFF' : 'transparent',
                    color: active ? ink : mute,
                    fontFamily: FIGMA_FONT,
                    fontWeight: active ? 700 : 400,
                    fontSize: p(28),
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    backdropFilter: 'blur(2px)',
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  {categoryLabel(cat)}
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            sx={{
              height: p(90),
              width: p(180),
              flexShrink: 0,
              bgcolor: soft,
              border: `1px solid ${line}`,
              borderRadius: `${p(28)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(20)}px`,
              px: `${p(10)}px`,
            }}
          >
            {(['grid', 'list'] as const).map((mode) => {
              const active = viewMode === mode;
              return (
                <ButtonBase
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  sx={{
                    width: p(70),
                    height: p(70),
                    borderRadius: `${p(23)}px`,
                    bgcolor: active ? '#FFFFFF' : 'transparent',
                    color: active ? teal : place,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mode === 'grid' ? (
                    <GridViewIcon sx={{ fontSize: p(35) }} />
                  ) : (
                    <ViewListIcon sx={{ fontSize: p(35) }} />
                  )}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        {/* Grid */}
        {viewMode === 'grid' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${p(314)}px, 1fr))`,
              gap: `${p(58)}px ${p(57)}px`,
            }}
          >
            {filteredBooks.map((book) => {
              const isManaged = managedBookId === book.id;
              const isSelected = selectedBookIds.includes(book.id);
              return (
                <Box key={book.id} sx={{ width: '100%', maxWidth: p(314) }}>
                  <Box
                    onClick={isEditMode ? () => toggleSelectBook(book.id) : undefined}
                    onTouchStart={!isEditMode ? () => handleLongPressStart(book.id) : undefined}
                    onTouchEnd={!isEditMode ? handleLongPressEnd : undefined}
                    onTouchMove={!isEditMode ? handleLongPressEnd : undefined}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '314 / 440',
                      borderRadius: `${p(30)}px`,
                      overflow: 'hidden',
                      bgcolor: '#FFFFFF',
                      border: `1px solid ${line}`,
                      outline: isEditMode && isSelected ? `2px solid ${teal}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {coverImg(book)}

                    {!isManaged && !isEditMode && book.progress > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: p(26),
                          right: 0,
                          width: p(80),
                          height: p(40),
                          bgcolor: 'rgba(0,0,0,0.4)',
                          borderRadius: `${p(16)}px 0 0 ${p(16)}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: FIGMA_FONT,
                          fontSize: p(24),
                          color: '#FFF',
                          fontWeight: 400,
                        }}
                      >
                        {book.progress}%
                      </Box>
                    )}

                    {!isManaged && !isEditMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: p(146),
                          background:
                            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          pb: `${p(24)}px`,
                        }}
                      >
                        {renderGridCta(book)}
                      </Box>
                    )}

                    {isEditMode && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: p(16),
                            right: p(16),
                            width: p(44),
                            height: p(44),
                            borderRadius: '50%',
                            bgcolor: isSelected ? teal : 'rgba(255,255,255,0.92)',
                            border: isSelected ? 'none' : `1px solid ${line}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >
                          {isSelected && (
                            <CheckCircleIcon sx={{ fontSize: p(32), color: '#FFF' }} />
                          )}
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            right: p(16),
                            bottom: p(16),
                            px: `${p(16)}px`,
                            height: p(40),
                            borderRadius: `${p(20)}px`,
                            bgcolor: book.isDownloaded ? teal : 'rgba(0,0,0,0.55)',
                            color: '#FFF',
                            fontFamily: FIGMA_FONT,
                            fontSize: p(22),
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 2,
                          }}
                        >
                          {book.isDownloaded ? 'Downloaded' : 'Not downloaded'}
                        </Box>
                      </>
                    )}

                    {isManaged && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: `${p(20)}px`,
                          zIndex: 3,
                        }}
                      >
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagedBookId(null);
                            navigate(`/library/read/${book.id}`);
                          }}
                          sx={{
                            width: p(80),
                            height: p(80),
                            borderRadius: `${p(20)}px`,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: ink,
                          }}
                        >
                          <MenuBookIcon sx={{ fontSize: p(36) }} />
                        </ButtonBase>
                        {book.isDownloaded ? (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBook(book.id);
                              setManagedBookId(null);
                            }}
                            sx={{
                              width: p(80),
                              height: p(80),
                              borderRadius: `${p(20)}px`,
                              bgcolor: 'rgba(239,68,68,0.9)',
                              color: '#FFF',
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: p(36) }} />
                          </ButtonBase>
                        ) : (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadBook(book.id);
                              setManagedBookId(null);
                            }}
                            sx={{
                              width: p(80),
                              height: p(80),
                              borderRadius: `${p(20)}px`,
                              bgcolor: teal,
                              color: '#FFF',
                            }}
                          >
                            <DownloadIcon sx={{ fontSize: p(36) }} />
                          </ButtonBase>
                        )}
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagedBookId(null);
                          }}
                          sx={{
                            width: p(56),
                            height: p(56),
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#FFF',
                          }}
                        >
                          <CloseIcon sx={{ fontSize: p(28) }} />
                        </ButtonBase>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: `${p(20)}px` }}>
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 700,
                        fontSize: p(32),
                        lineHeight: `${p(51)}px`,
                        color: ink,
                      }}
                    >
                      {book.title}
                    </Typography>
                    {(book.subtitle || book.author) && (
                      <Typography
                        sx={{
                          fontFamily: FIGMA_FONT,
                          fontWeight: 400,
                          fontSize: p(24),
                          lineHeight: `${p(38)}px`,
                          color: mute,
                          mt: `${p(8)}px`,
                        }}
                      >
                        {[book.subtitle, book.author].filter(Boolean).join(' ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* List */}
        {viewMode === 'list' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(24)}px` }}>
            {filteredBooks.map((book) => (
              <Box
                key={book.id}
                onClick={() => {
                  if (isEditMode) {
                    toggleSelectBook(book.id);
                    return;
                  }
                  navigate(`/library/read/${book.id}`);
                }}
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${p(30)}px`,
                  p: `${p(30)}px`,
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${line}`,
                  borderRadius: `${p(40)}px`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline:
                    isEditMode && selectedBookIds.includes(book.id) ? `2px solid ${teal}` : 'none',
                  '&:active': { transform: 'scale(0.995)' },
                }}
              >
                <Box
                  sx={{
                    width: p(172),
                    height: p(240),
                    borderRadius: `${p(26)}px`,
                    overflow: 'hidden',
                    flexShrink: 0,
                    bgcolor: soft,
                  }}
                >
                  {coverImg(book)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(32),
                      color: ink,
                    }}
                  >
                    {book.title}
                  </Typography>
                  {book.subtitle && (
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontSize: p(24),
                        color: mute,
                        mt: `${p(4)}px`,
                      }}
                    >
                      {book.subtitle}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontSize: p(24),
                      color: place,
                      mt: `${p(8)}px`,
                    }}
                  >
                    {book.author}
                  </Typography>
                  <Box sx={{ maxWidth: p(400), mt: `${p(24)}px` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: `${p(10)}px` }}>
                      <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), color: mute }}>
                        {book.currentPage} / {book.totalPages} Pages
                      </Typography>
                      <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), color: teal }}>
                        {book.progress}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: p(8),
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: `${p(68)}px`,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${book.progress}%`,
                          bgcolor: teal,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                {!isEditMode && (
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{ flexShrink: 0 }}
                  >
                    {renderGridCta(book)}
                  </Box>
                )}
                {isEditMode && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: p(24),
                      right: p(24),
                      width: p(44),
                      height: p(44),
                      borderRadius: '50%',
                      bgcolor: selectedBookIds.includes(book.id) ? teal : '#FFF',
                      border: selectedBookIds.includes(book.id) ? 'none' : `1px solid ${line}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedBookIds.includes(book.id) && (
                      <CheckCircleIcon sx={{ fontSize: p(32), color: '#FFF' }} />
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {filteredBooks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: `${p(120)}px`,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: p(120),
                height: p(120),
                borderRadius: '50%',
                bgcolor: soft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: `${p(24)}px`,
              }}
            >
              <MenuBookIcon sx={{ fontSize: p(56), color: place }} />
            </Box>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                color: mute,
                mb: `${p(8)}px`,
              }}
            >
              No books found
            </Typography>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), color: place }}>
              Try different keywords
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        PaperProps={{
          sx: {
            borderRadius: `${p(28)}px`,
            width: p(560),
            fontFamily: FIGMA_FONT,
          },
        }}
      >
        <DialogTitle
          sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), color: ink }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography sx={{ fontFamily: FIGMA_FONT, color: mute, fontSize: p(28) }}>
            {deleteConfirmMode === 'selected'
              ? `Delete ${selectedBookIds.length} selected book${selectedBookIds.length > 1 ? 's' : ''} from downloads?`
              : 'Delete all downloaded books?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <ButtonBase
            onClick={closeDeleteConfirm}
            sx={{
              height: p(72),
              px: `${p(28)}px`,
              borderRadius: `${p(20)}px`,
              bgcolor: soft,
              color: mute,
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(28),
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            onClick={confirmDelete}
            sx={{
              height: p(72),
              px: `${p(28)}px`,
              borderRadius: `${p(20)}px`,
              bgcolor: '#EF4444',
              color: '#FFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: p(28),
            }}
          >
            Delete
          </ButtonBase>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

