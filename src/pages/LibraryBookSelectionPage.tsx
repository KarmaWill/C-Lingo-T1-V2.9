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
  const is960 = screenSize === '960x540';

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

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, activeCategory]);

  const continueReadingBooks = useMemo(
    () => books.filter(b => b.progress > 0 && b.progress < 100),
    [books]
  );

  // ── Book actions ──
  const clearDownloadTimer = (id: string) => {
    const timer = downloadTimersRef.current[id];
    if (timer) {
      clearInterval(timer);
      delete downloadTimersRef.current[id];
    }
  };

  const startDownload = (id: string) => {
    clearDownloadTimer(id);

    setBooks(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        if (b.isDownloaded) return b;
        return { ...b, downloadProgress: b.downloadProgress ?? 0 };
      })
    );

    downloadTimersRef.current[id] = setInterval(() => {
      let completed = false;
      setBooks(prev =>
        prev.map(b => {
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
        })
      );
      if (completed) {
        clearDownloadTimer(id);
      }
    }, 160);
  };

  const downloadBook = (id: string) => {
    const target = books.find(b => b.id === id);
    if (!target || target.isDownloaded) return;
    startDownload(id);
  };

  const deleteBook = (id: string) => {
    clearDownloadTimer(id);
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, isDownloaded: false, downloadProgress: undefined } : b))
    );
  };

  const deleteAllDownloaded = () => {
    Object.keys(downloadTimersRef.current).forEach(clearDownloadTimer);
    setBooks(prev => prev.map(b => ({ ...b, isDownloaded: false, downloadProgress: undefined })));
  };

  const toggleSelectBook = (id: string) => {
    setSelectedBookIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedBookIds.length === filteredBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredBooks.map(b => b.id));
    }
  };

  const deleteSelectedBooks = () => {
    if (selectedBookIds.length === 0) return;
    selectedBookIds.forEach(clearDownloadTimer);
    setBooks(prev =>
      prev.map(b =>
        selectedBookIds.includes(b.id)
          ? { ...b, isDownloaded: false, downloadProgress: undefined }
          : b
      )
    );
    setSelectedBookIds([]);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmMode(selectedBookIds.length > 0 ? 'selected' : 'all');
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirmMode === 'selected') {
      deleteSelectedBooks();
    } else {
      deleteAllDownloaded();
    }
    setIsDeleteConfirmOpen(false);
  };

  // ── Long-press (grid, non-edit) ──
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
    if (isEditMode) {
      // Avoid carrying over any long-press management overlay into edit mode.
      setManagedBookId(null);
    }
  }, [isEditMode]);

  // ── Design tokens ──
  const teal = '#14B8A6';
  const pageBg = '#FDF6E9';
  const sz = {
    iconBtn: is960 ? 44 : 46,
    tabH: is960 ? 40 : 44,
    tabPx: is960 ? 16 : 20,
    cardRadius: is960 ? '14px' : '16px',
    coverRadius: is960 ? '12px' : '14px',
  };

  const downloadedCount = books.filter(b => b.isDownloaded).length;

  const renderViewToggle = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        bgcolor: '#F5F5F0',
        p: 0.5,
        borderRadius: is960 ? '13px' : '14px',
      }}
    >
      {(['grid', 'list'] as const).map((mode) => (
        <ButtonBase
          key={mode}
          onClick={() => setViewMode(mode)}
          sx={{
            width: sz.iconBtn,
            height: sz.iconBtn,
            borderRadius: is960 ? '11px' : '12px',
            bgcolor: viewMode === mode ? 'white' : 'transparent',
            color: viewMode === mode ? teal : '#9CA3AF',
            boxShadow: viewMode === mode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.18s',
          }}
        >
          {mode === 'grid'
            ? <GridViewIcon sx={{ fontSize: is960 ? 20 : 22 }} />
            : <ViewListIcon sx={{ fontSize: is960 ? 20 : 22 }} />}
        </ButtonBase>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: is960 ? 2 : 3,
          py: is960 ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'white',
          flexShrink: 0,
        }}
      >
        {/* Back / Done */}
        <ButtonBase
          onClick={isEditMode ? exitEditMode : () => navigate('/library')}
          sx={{
            height: sz.iconBtn,
            px: isEditMode ? 1.5 : 0,
            minWidth: sz.iconBtn,
            borderRadius: isEditMode ? '12px' : '50%',
            bgcolor: isEditMode ? `${teal}18` : 'rgba(0,0,0,0.04)',
            color: isEditMode ? teal : '#374151',
            flexShrink: 0,
            fontWeight: 800,
            fontSize: is960 ? '0.82rem' : '0.88rem',
            gap: 0.5,
            '&:active': { transform: 'scale(0.94)' },
          }}
        >
          {isEditMode ? (
            'Done'
          ) : (
            <ChevronLeftIcon sx={{ fontSize: is960 ? 24 : 26 }} />
          )}
        </ButtonBase>

        {/* Search (hidden in edit mode) */}
        {!isEditMode ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            <Box sx={{ width: '100%', maxWidth: is960 ? 380 : 500, position: 'relative' }}>
              <SearchIcon
                sx={{
                  position: 'absolute',
                  left: is960 ? 14 : 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  fontSize: is960 ? 18 : 20,
                  pointerEvents: 'none',
                }}
              />
              <InputBase
                placeholder="Search books, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: '100%',
                  height: is960 ? 44 : 48,
                  bgcolor: '#F5F5F0',
                  borderRadius: is960 ? '14px' : '16px',
                  pl: is960 ? 5 : 5.5,
                  pr: 2,
                  fontSize: is960 ? '0.88rem' : '0.95rem',
                  fontWeight: 500,
                  color: '#1E293B',
                  '& input::placeholder': { color: '#9CA3AF' },
                  '&:focus-within': { boxShadow: `0 0 0 2px ${teal}38` },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* Controls back to header right */}
        {!isEditMode ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <ButtonBase
              onClick={() => setIsEditMode(true)}
              sx={{
                height: sz.iconBtn,
                px: is960 ? 1.5 : 2,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: '#F5F5F0',
                color: '#374151',
                fontSize: is960 ? '0.82rem' : '0.88rem',
                fontWeight: 800,
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              Edit
            </ButtonBase>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <ButtonBase
              onClick={toggleSelectAll}
              sx={{
                height: sz.iconBtn,
                px: is960 ? 1.5 : 2,
                borderRadius: is960 ? '12px' : '14px',
                bgcolor: selectedBookIds.length > 0 ? `${teal}20` : '#F5F5F0',
                color: selectedBookIds.length > 0 ? teal : '#374151',
                fontSize: is960 ? '0.78rem' : '0.84rem',
                fontWeight: 800,
                gap: 0.75,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: is960 ? 16 : 18 }} />
              {selectedBookIds.length === filteredBooks.length && filteredBooks.length > 0
                ? 'Clear'
                : 'Select All'}
            </ButtonBase>
            {(downloadedCount > 0 || selectedBookIds.length > 0) && (
              <ButtonBase
                onClick={openDeleteConfirm}
                sx={{
                  height: sz.iconBtn,
                  px: is960 ? 1.5 : 2,
                  borderRadius: is960 ? '12px' : '14px',
                  bgcolor: '#FEF2F2',
                  color: '#EF4444',
                  fontSize: is960 ? '0.78rem' : '0.84rem',
                  fontWeight: 800,
                  gap: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: is960 ? 16 : 18 }} />
                {selectedBookIds.length > 0 ? `Delete Selected (${selectedBookIds.length})` : 'Delete All'}
              </ButtonBase>
            )}
          </Box>
        )}

      </Box>

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: is960 ? 2 : 3, minHeight: 0 }}>

        {/* Continue Reading (hidden in edit mode) */}
        {!isEditMode && !searchQuery && activeCategory === 'All' && continueReadingBooks.length > 0 && (
          <Box sx={{ mb: is960 ? 3 : 4 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: is960 ? '1rem' : '1.15rem',
                color: '#1E293B',
                mb: is960 ? 1.5 : 2,
                letterSpacing: '-0.01em',
              }}
            >
              Continue Reading
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: is960 ? 1.5 : 2,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {continueReadingBooks.map((book) => (
                <Box
                  key={book.id}
                  onClick={() => navigate(`/library/read/${book.id}`)}
                  sx={{
                    flexShrink: 0,
                    width: is960 ? 270 : 320,
                    bgcolor: 'white',
                    borderRadius: is960 ? '16px' : '18px',
                    p: is960 ? 1.5 : 2,
                    display: 'flex',
                    gap: is960 ? 1.5 : 2,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    '&:active': { transform: 'scale(0.98)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
                  }}
                >
                  <Box
                    sx={{
                      width: is960 ? 64 : 76,
                      height: is960 ? 88 : 104,
                      borderRadius: sz.coverRadius,
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: '#E5E7EB',
                    }}
                  >
                    <Box
                      component="img"
                      src={book.coverUrl}
                      alt={book.title}
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = buildFallbackCover(book.title);
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}
                  >
                    <Box>
                      <Typography
                        sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '0.95rem', color: '#1E293B', lineHeight: 1.3 }}
                      >
                        {book.title}
                      </Typography>
                      {book.subtitle && (
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600 }}>
                          {book.subtitle}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.7rem', color: '#9CA3AF', fontWeight: 700 }}>
                          {book.currentPage} / {book.totalPages} Pages
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.64rem' : '0.7rem', color: teal, fontWeight: 800 }}>
                          {book.progress}%
                        </Typography>
                      </Box>
                      <Box sx={{ height: 3, bgcolor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', bgcolor: teal, width: `${book.progress}%` }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Category row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: is960 ? 2 : 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flex: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {categories.map((cat) => (
              <ButtonBase
                key={cat}
                onClick={() => setActiveCategory(cat)}
                sx={{
                  px: `${sz.tabPx}px`,
                  height: `${sz.tabH}px`,
                  minHeight: `${sz.tabH}px`,
                  borderRadius: is960 ? '14px' : '16px',
                  fontSize: is960 ? '0.8rem' : '0.88rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  bgcolor: activeCategory === cat ? teal : '#F0F0EB',
                  color: activeCategory === cat ? 'white' : '#64748B',
                  boxShadow: activeCategory === cat ? `0 4px 12px ${teal}35` : 'none',
                  transition: 'all 0.18s',
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                {cat}
              </ButtonBase>
            ))}
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            {renderViewToggle()}
          </Box>
        </Box>

        {/* ── Grid View ── */}
        {viewMode === 'grid' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: is960
                ? 'repeat(auto-fill, minmax(130px, 1fr))'
                : 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: is960 ? 2 : 2.5,
            }}
          >
            {filteredBooks.map((book) => {
              const isManaged = managedBookId === book.id;
              const showMgmtOverlay = isManaged;
              const isSelected = selectedBookIds.includes(book.id);

              return (
                <Box
                  key={book.id}
                  onClick={isEditMode ? () => toggleSelectBook(book.id) : undefined}
                  onTouchStart={!isEditMode ? () => handleLongPressStart(book.id) : undefined}
                  onTouchEnd={!isEditMode ? handleLongPressEnd : undefined}
                  onTouchMove={!isEditMode ? handleLongPressEnd : undefined}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      borderRadius: is960 ? '14px' : '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                      border: '2px solid white',
                      bgcolor: '#E5E7EB',
                      mb: 1,
                      transition: 'box-shadow 0.18s',
                      outline: isEditMode && isSelected ? `2px solid ${teal}` : 'none',
                      '&:active': { boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={book.coverUrl}
                      alt={book.title}
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = buildFallbackCover(book.title);
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* HSK badge — top-left */}
                    {book.hskLevel && !showMgmtOverlay && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          px: 1,
                          height: is960 ? 22 : 24,
                          bgcolor: 'white',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 900,
                          fontSize: is960 ? '0.65rem' : '0.72rem',
                          color: teal,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          zIndex: 1,
                        }}
                      >
                        HSK {book.hskLevel}
                      </Box>
                    )}

                    {/* Top-right: reading progress only */}
                    {!showMgmtOverlay && !isEditMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          px: 1,
                          height: is960 ? 22 : 24,
                          bgcolor: 'rgba(0,0,0,0.55)',
                          backdropFilter: 'blur(6px)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: is960 ? '0.62rem' : '0.68rem',
                          fontWeight: 800,
                          color: 'white',
                          zIndex: 1,
                        }}
                      >
                        {book.progress}%
                      </Box>
                    )}

                    {/* Bottom CTA: download OR open (mutually exclusive) */}
                    {!showMgmtOverlay && !isEditMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: is960 ? 1 : 1.25,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 100%)',
                          display: 'flex',
                        }}
                      >
                        {book.isDownloaded ? (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/library/read/${book.id}`);
                            }}
                            sx={{
                              flex: 1,
                              height: is960 ? 34 : 38,
                              borderRadius: is960 ? '10px' : '12px',
                              bgcolor: 'rgba(255,255,255,0.90)',
                              color: '#1E293B',
                              fontSize: is960 ? '0.75rem' : '0.82rem',
                              fontWeight: 800,
                              backdropFilter: 'blur(8px)',
                              '&:active': { bgcolor: 'white', transform: 'scale(0.97)' },
                            }}
                          >
                            Open
                          </ButtonBase>
                        ) : (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              if (book.downloadProgress === undefined) {
                                downloadBook(book.id);
                              }
                            }}
                            sx={{
                              flex: 1,
                              height: is960 ? 34 : 38,
                              borderRadius: is960 ? '10px' : '12px',
                              bgcolor: 'rgba(20,184,166,0.92)',
                              color: 'white',
                              fontSize: is960 ? '0.72rem' : '0.8rem',
                              fontWeight: 800,
                              letterSpacing: '0.01em',
                              backdropFilter: 'blur(8px)',
                              opacity: book.downloadProgress !== undefined ? 0.9 : 1,
                              '&:active': { transform: 'scale(0.97)' },
                            }}
                          >
                            {book.downloadProgress !== undefined
                              ? `Downloading ${book.downloadProgress}%`
                              : 'Download'}
                          </ButtonBase>
                        )}
                      </Box>
                    )}

                    {/* Edit mode: selection checkmark only */}
                    {isEditMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: is960 ? 28 : 32,
                          height: is960 ? 28 : 32,
                          borderRadius: '50%',
                          bgcolor: isSelected ? teal : 'rgba(255,255,255,0.92)',
                          border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.14)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 12,
                        }}
                      >
                        {isSelected && (
                          <CheckCircleIcon sx={{ fontSize: is960 ? 20 : 22, color: 'white' }} />
                        )}
                      </Box>
                    )}

                    {/* Edit mode: download status tag (bottom-right) */}
                    {isEditMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 8,
                          bottom: 8,
                          px: 1,
                          height: is960 ? 20 : 22,
                          borderRadius: '999px',
                          bgcolor: book.isDownloaded ? 'rgba(20,184,166,0.92)' : 'rgba(71,85,105,0.88)',
                          color: 'white',
                          fontSize: is960 ? '0.58rem' : '0.62rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          letterSpacing: '0.01em',
                          zIndex: 12,
                        }}
                      >
                        {book.isDownloaded ? 'Downloaded' : 'Not downloaded'}
                      </Box>
                    )}

                    {/* Management overlay (long-press only) */}
                    {showMgmtOverlay && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0.60)',
                          backdropFilter: 'blur(3px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1.5,
                          zIndex: 10,
                        }}
                      >
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditMode) setManagedBookId(null);
                            navigate(`/library/read/${book.id}`);
                          }}
                          sx={{
                            width: sz.iconBtn,
                            height: sz.iconBtn,
                            borderRadius: sz.cardRadius,
                            bgcolor: 'rgba(255,255,255,0.88)',
                            color: '#1E293B',
                            '&:active': { transform: 'scale(0.93)' },
                          }}
                        >
                          <MenuBookIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                        </ButtonBase>

                        {book.isDownloaded ? (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBook(book.id);
                              setManagedBookId(null);
                            }}
                            sx={{
                              width: sz.iconBtn,
                              height: sz.iconBtn,
                              borderRadius: sz.cardRadius,
                              bgcolor: 'rgba(239,68,68,0.88)',
                              color: 'white',
                              '&:active': { transform: 'scale(0.93)' },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                          </ButtonBase>
                        ) : (
                          <ButtonBase
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadBook(book.id);
                              setManagedBookId(null);
                            }}
                            sx={{
                              width: sz.iconBtn,
                              height: sz.iconBtn,
                              borderRadius: sz.cardRadius,
                              bgcolor: `${teal}DD`,
                              color: 'white',
                              '&:active': { transform: 'scale(0.93)' },
                            }}
                          >
                            <DownloadIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                          </ButtonBase>
                        )}

                        <ButtonBase
                          onClick={(e) => { e.stopPropagation(); setManagedBookId(null); }}
                          sx={{
                            width: is960 ? 30 : 34,
                            height: is960 ? 30 : 34,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.16)',
                            color: 'white',
                            '&:active': { transform: 'scale(0.93)' },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: is960 ? 15 : 17 }} />
                        </ButtonBase>
                      </Box>
                    )}
                  </Box>

                  <Typography
                    sx={{ fontWeight: 800, fontSize: is960 ? '0.8rem' : '0.88rem', color: '#1E293B', mb: 0.25, lineHeight: 1.3 }}
                  >
                    {book.title}
                  </Typography>
                  {book.subtitle && (
                    <Typography sx={{ fontSize: is960 ? '0.66rem' : '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      {book.subtitle}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: is960 ? 1.5 : 2,
                  p: is960 ? 1.5 : 2,
                  bgcolor: 'white',
                  borderRadius: is960 ? '16px' : '18px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  outline: isEditMode && selectedBookIds.includes(book.id) ? `2px solid ${teal}` : 'none',
                  '&:active': { transform: 'scale(0.99)', boxShadow: 'none' },
                }}
              >
                {/* Cover */}
                <Box
                  sx={{
                    width: is960 ? 64 : 76,
                    height: is960 ? 88 : 104,
                    borderRadius: sz.coverRadius,
                    overflow: 'hidden',
                    flexShrink: 0,
                    bgcolor: '#E5E7EB',
                  }}
                >
                  <Box
                    component="img"
                    src={book.coverUrl}
                    alt={book.title}
                    onError={(e: SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = buildFallbackCover(book.title);
                    }}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.92rem' : '1rem', color: '#1E293B' }}>
                      {book.title}
                    </Typography>
                    {book.subtitle && (
                      <Typography sx={{ fontSize: is960 ? '0.76rem' : '0.84rem', color: '#64748B', fontWeight: 600 }}>
                        {book.subtitle}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.78rem', color: '#9CA3AF', mt: 0.5 }}>
                      {book.author}
                    </Typography>
                  </Box>
                  <Box sx={{ maxWidth: 260, mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', color: '#9CA3AF', fontWeight: 700 }}>
                        {book.currentPage} / {book.totalPages} Pages
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', color: teal, fontWeight: 800 }}>
                        {book.progress}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 3, bgcolor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', bgcolor: teal, width: `${book.progress}%` }} />
                    </Box>
                  </Box>
                </Box>

                {/* Actions — list normal mode only */}
                {!isEditMode && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                        if (book.isDownloaded) {
                          navigate(`/library/read/${book.id}`);
                          return;
                        }
                        if (book.downloadProgress === undefined) {
                          downloadBook(book.id);
                        }
                      }}
                      sx={{
                        width: is960 ? 132 : 149,
                        height: is960 ? 38 : 42,
                        borderRadius: is960 ? '12px' : '14px',
                        bgcolor: book.isDownloaded ? teal : 'rgba(20,184,166,0.92)',
                        color: 'white',
                        fontSize: is960 ? '0.72rem' : '0.82rem',
                        fontWeight: 800,
                        letterSpacing: '0.01em',
                        opacity: !book.isDownloaded && book.downloadProgress !== undefined ? 0.9 : 1,
                        '&:active': { transform: 'scale(0.95)' },
                      }}
                    >
                      {book.isDownloaded
                        ? 'Open'
                        : book.downloadProgress !== undefined
                          ? `Downloading ${book.downloadProgress}%`
                          : 'Download'}
                    </ButtonBase>
                  </Box>
                )}

                {/* Edit mode selection indicator: top-right 32x32 circle */}
                {isEditMode && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: is960 ? 28 : 32,
                      height: is960 ? 28 : 32,
                      borderRadius: '50%',
                      bgcolor: selectedBookIds.includes(book.id) ? teal : 'rgba(255,255,255,0.92)',
                      border: selectedBookIds.includes(book.id) ? 'none' : '1px solid rgba(0,0,0,0.14)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedBookIds.includes(book.id) && (
                      <CheckCircleIcon sx={{ fontSize: is960 ? 20 : 22, color: 'white' }} />
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: is960 ? 6 : 8,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: is960 ? 68 : 80,
                height: is960 ? 68 : 80,
                borderRadius: '50%',
                bgcolor: '#F0F0EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <MenuBookIcon sx={{ fontSize: is960 ? 32 : 38, color: '#9CA3AF' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1rem' : '1.1rem', color: '#64748B', mb: 0.5 }}>
              No books found
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.88rem', color: '#9CA3AF' }}>
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
            borderRadius: is960 ? '16px' : '18px',
            width: is960 ? 320 : 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: is960 ? '1rem' : '1.1rem', color: '#1E293B' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.82rem' : '0.9rem' }}>
            {deleteConfirmMode === 'selected'
              ? `Delete ${selectedBookIds.length} selected book${selectedBookIds.length > 1 ? 's' : ''} from downloads?`
              : 'Delete all downloaded books?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <ButtonBase
            onClick={closeDeleteConfirm}
            sx={{
              height: is960 ? 40 : 42,
              px: 2,
              borderRadius: '12px',
              bgcolor: '#F1F5F9',
              color: '#475569',
              fontWeight: 700,
              fontSize: is960 ? '0.8rem' : '0.86rem',
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            onClick={confirmDelete}
            sx={{
              height: is960 ? 40 : 42,
              px: 2,
              borderRadius: '12px',
              bgcolor: '#EF4444',
              color: 'white',
              fontWeight: 700,
              fontSize: is960 ? '0.8rem' : '0.86rem',
            }}
          >
            Delete
          </ButtonBase>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
