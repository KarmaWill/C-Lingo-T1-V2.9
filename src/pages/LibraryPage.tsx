import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';

interface Book {
  id: string;
  title: string;
  cover: string;
  hsk: number;
  progress: number;
  category: string;
  pages: string[];
  selected?: boolean;
}

const CATEGORIES = [
  { key: 'All', label: '全部', enLabel: 'ALL TEXTBOOK' },
  { key: 'Textbook', label: '教学图书', enLabel: 'TEACHING BOOKS' }
];

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

// 初始状态：没有选中的书籍
const BOOKS: Book[] = [
  {
    id: 'happy-cn',
    title: 'Happy Chinese',
    cover: '/images/happy-chinese-vol1-cover.png',
    hsk: 1,
    progress: 0,
    category: 'Textbook',
    pages: ['L1: Hello', 'L2: Family', 'L3: Food'],
    selected: false,
  },
  { 
    id: 'hsk1', 
    title: 'HSK 1 Standard Course', 
    cover: buildCourseCover('HSK 1', 'Textbook', '#F97316', '#F59E0B'), 
    hsk: 1, 
    progress: 85, 
    category: 'Textbook',
    pages: ['L1: Hello', 'L2: Thank you', 'L3: What is your name?'],
    selected: false  // 初始状态：未选中
  },
  { 
    id: 'biz-cn', 
    title: 'Business Chinese for Traders', 
    cover: buildSeriesCover('PRACTICE', 'Business', 'Trading Chinese', '#334155', '#0F172A'), 
    hsk: 3, 
    progress: 12, 
    category: 'Textbook',
    pages: ['L1: Meeting Partners', 'L2: Negotiation', 'L3: Logistics'],
    selected: false  // 初始状态：未选中
  },
  { 
    id: 'hsk2', 
    title: 'HSK 2 Standard Course', 
    cover: buildCourseCover('HSK 2', 'Textbook', '#2563EB', '#06B6D4'), 
    hsk: 2, 
    progress: 0, 
    category: 'Textbook',
    pages: ['L1: Weather', 'L2: Shopping', 'L3: Health'],
    selected: false
  },
  { 
    id: 'daily', 
    title: 'Daily Life in Beijing', 
    cover: buildSeriesCover('CULTURE', 'Beijing', 'Daily Life', '#DC2626', '#F97316'), 
    hsk: 2, 
    progress: 45, 
    category: 'Textbook',
    pages: ['L1: Hutongs', 'L2: Tea Culture', 'L3: Markets'],
    selected: false
  }
];

/** Units on the hero card; order matches curriculum progression */
const CURRICULUM_UNITS = [
  'Unit 1 · You and I',
  'Unit 2 · My Family',
  'Unit 3 · Numbers & Colors',
  'Unit 4 · Daily Activities',
  'Unit 5 · Food & Drinks',
  'Unit 6 · Time & Dates',
  'Unit 7 · Weather & Seasons',
  'Unit 8 · Basic Questions',
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>(BOOKS);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  const filteredBooks = books.filter(book => {
    const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
    return matchesCategory && book.selected;
  });

  const availableBooks = books.filter(book => {
    const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
    return matchesCategory && !book.selected;
  });

  const currentCategory = CATEGORIES.find(cat => cat.key === activeCategory) || CATEGORIES[0];


  const handleOpenBook = (book: Book) => {
    navigate(`/library/read/${book.id}`);
  };


  const handleRemoveBook = (book: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(b => b.id === book.id ? { ...b, selected: false } : b)
    );
  };

  // Hub layout (no books on shelf yet): only "Choose a book" opens selection
  if (filteredBooks.length === 0) {
    const textbookPagesRead = 59;
    const textbookPagesTotal = 198;
    const pageBg = '#FDF6E9';
    const funOrange = '#FF7A45';
    const teal = '#14B8A6';
    const lessonCoverImage = '/images/library-hero-greeting.png';
    const bookshelfCoverImage = '/images/happy-chinese-vol1-cover.png';

    return (
      <Box
        sx={{
          p: is960 ? 2 : is1920x1125 ? 4 : 4,
          height: '100%',
          minHeight: 0,
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          bgcolor: pageBg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            flex: 1,
            minHeight: 0,
            height: '100%',
            gap: is960 ? 1.5 : 2,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2.45fr) minmax(0, 1fr)' },
            gridTemplateRows: { xs: 'none', md: 'minmax(0, 1fr)' },
            gridTemplateAreas: {
              xs: `
                "left"
                "shelf"
              `,
              md: `
                "left shelf"
              `,
            },
            alignItems: 'stretch',
          }}
        >
          {/* 左栏：主横幅 + Fun/Culture，与右侧书架同高，底边对齐 */}
          <Box
            sx={{
              gridArea: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: is960 ? 1.5 : 2,
              minWidth: 0,
              minHeight: 0,
              height: '100%',
            }}
          >
            <Box
              onClick={() => navigate('/starting-learning')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/starting-learning');
                }
              }}
              role="button"
              tabIndex={0}
              sx={{
                flex: 1,
                minHeight: { xs: is960 ? 240 : 260, md: 0 },
                position: 'relative',
                borderRadius: is960 ? '24px' : '28px',
                overflow: 'hidden',
                bgcolor: '#0F172A',
                boxShadow: '0 18px 48px rgba(15,23,42,0.18)',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                '&:active': { transform: 'scale(0.995)' },
                outline: 'none',
                '&:focus-visible': { boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.45)' },
              }}
            >
              <Box
                component="img"
                src={lessonCoverImage}
                alt="Lesson 1 cover"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 38%',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: [
                    'radial-gradient(circle at 82% 16%, rgba(20,184,166,0.34) 0, rgba(20,184,166,0) 28%)',
                    'radial-gradient(circle at 80% 82%, rgba(255,122,69,0.24) 0, rgba(255,122,69,0) 26%)',
                    'linear-gradient(90deg, rgba(15,23,42,0.56) 0%, rgba(15,23,42,0.24) 48%, rgba(15,23,42,0.38) 100%)',
                    'linear-gradient(180deg, rgba(15,23,42,0.16) 0%, rgba(15,23,42,0.42) 100%)',
                  ].join(','),
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 26%)',
                }}
              />

              {/* 左上：Current Unit 切换条 */}
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  top: is960 ? 14 : 20,
                  left: is960 ? 14 : 20,
                  zIndex: 2,
                  bgcolor: 'rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: is960 ? '18px' : '22px',
                  px: is960 ? 1.2 : 1.5,
                  py: is960 ? 0.85 : 1.05,
                  width: is960 ? 240 : 292,
                  minWidth: 0,
                  boxShadow: '0 12px 28px rgba(15,23,42,0.16)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
              >
                <Typography
                  sx={{
                    fontSize: is960 ? '0.52rem' : '0.62rem',
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.68)',
                    letterSpacing: '0.12em',
                    textAlign: 'left',
                    width: '100%',
                    mb: 0.28,
                  }}
                >
                  CURRENT UNIT
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, minWidth: 0 }}>
                  <ButtonBase
                    type="button"
                    aria-label="Previous unit"
                    disabled={currentUnitIndex <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentUnitIndex((i) => Math.max(0, i - 1));
                    }}
                    sx={{
                      minWidth: is960 ? 32 : 36,
                      minHeight: is960 ? 32 : 36,
                      borderRadius: '50%',
                      color: currentUnitIndex <= 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.76)',
                      flexShrink: 0,
                      '&:disabled': { opacity: 0.45 },
                      '&:active': { transform: currentUnitIndex <= 0 ? 'none' : 'scale(0.92)' },
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: is960 ? 19 : 21 }} />
                  </ButtonBase>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '0.9rem' : '1.04rem',
                      color: 'white',
                      lineHeight: 1.25,
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {CURRICULUM_UNITS[currentUnitIndex]}
                  </Typography>
                  <ButtonBase
                    type="button"
                    aria-label="Next unit"
                    disabled={currentUnitIndex >= CURRICULUM_UNITS.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentUnitIndex((i) => Math.min(CURRICULUM_UNITS.length - 1, i + 1));
                    }}
                    sx={{
                      minWidth: is960 ? 32 : 36,
                      minHeight: is960 ? 32 : 36,
                      borderRadius: '50%',
                      color: currentUnitIndex >= CURRICULUM_UNITS.length - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.86)',
                      flexShrink: 0,
                      '&:disabled': { opacity: 0.45 },
                      '&:active': {
                        transform: currentUnitIndex >= CURRICULUM_UNITS.length - 1 ? 'none' : 'scale(0.92)',
                      },
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: is960 ? 19 : 21 }} />
                  </ButtonBase>
                </Box>
              </Box>

              {/* 左下：课程目标卡片 */}
              <Box
                component="section"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  left: is960 ? 12 : 18,
                  bottom: is960 ? 22 : 30,
                  maxWidth: { xs: 'calc(100% - 180px)', md: 'min(54%, 420px)' },
                  zIndex: 2,
                  bgcolor: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: is960 ? '18px' : '22px',
                  p: is960 ? 1.35 : 1.75,
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.02rem' : is1920x1125 ? '1.44rem' : '1.22rem',
                    color: 'white',
                    mb: is960 ? 0.72 : 0.9,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                  }}
                >
                  Greeting
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    pl: is960 ? 1.55 : 1.8,
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: is960 ? '0.74rem' : '0.88rem',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    listStyleType: 'disc',
                    listStylePosition: 'outside',
                    '& li': {
                      mb: 0.2,
                      display: 'list-item',
                      paddingInlineStart: 0,
                    },
                    '& li::marker': {
                      color: 'rgba(255,255,255,0.88)',
                    },
                  }}
                >
                  <li>Say hello and introduce yourself</li>
                </Box>
              </Box>

              {/* 右下：Start — premium glass CTA */}
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/starting-learning');
                }}
                sx={{
                  position: 'absolute',
                  right: is960 ? 16 : 24,
                  bottom: is960 ? 22 : 30,
                  left: { xs: '50%', md: 'auto' },
                  transform: { xs: 'translateX(-50%)', md: 'none' },
                  zIndex: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: is960 ? 1.1 : 1.25,
                  pl: is960 ? 1.85 : 2.15,
                  pr: is960 ? 0.7 : 0.8,
                  py: is960 ? 0.7 : 0.8,
                  minHeight: is960 ? 52 : 58,
                  borderRadius: '999px',
                  color: '#FFFFFF',
                  bgcolor: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  boxShadow: [
                    '0 16px 36px rgba(15,23,42,0.34)',
                    'inset 0 1px 0 rgba(255,255,255,0.22)',
                  ].join(', '),
                  whiteSpace: 'nowrap',
                  transition: 'transform 160ms ease, background 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(15, 23, 42, 0.68)',
                    boxShadow: [
                      '0 18px 40px rgba(15,23,42,0.4)',
                      'inset 0 1px 0 rgba(255,255,255,0.28)',
                    ].join(', '),
                  },
                  '&:active': {
                    transform: { xs: 'translateX(-50%) scale(0.97)', md: 'scale(0.97)' },
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: is960 ? '0.95rem' : '1.05rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}
                >
                  Start
                </Box>
                <Box
                  aria-hidden
                  sx={{
                    width: is960 ? 34 : 38,
                    height: is960 ? 34 : 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #2DD4BF 0%, #14B8A6 48%, #0D9488 100%)',
                    boxShadow: '0 6px 16px rgba(20,184,166,0.4)',
                    color: '#FFFFFF',
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: is960 ? 18 : 20 }} />
                </Box>
              </ButtonBase>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: is960 ? 1.5 : 2,
                width: '100%',
                alignItems: 'stretch',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
                <ButtonBase
                  onClick={() => navigate('/library/hub/fun-chinese')}
                  sx={{
                    width: '100%',
                    minHeight: { xs: 56, md: 92 },
                    borderRadius: is960 ? '22px' : '28px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'stretch',
                    boxShadow: '0 14px 34px rgba(255,122,69,0.2)',
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 18px 40px rgba(255,122,69,0.28)',
                    },
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: funOrange,
                      background: 'linear-gradient(135deg, #C2410C 0%, #FF7A45 64%, #FDBA74 100%)',
                      px: is960 ? 1.55 : 2,
                      py: is960 ? 1.15 : 1.35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      width: '100%',
                      minHeight: { md: 92 },
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.1 : 1.35, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: is960 ? 48 : 54,
                          height: is960 ? 48 : 54,
                          borderRadius: is960 ? '16px' : '18px',
                          bgcolor: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: is960 ? 28 : 32, color: 'white', opacity: 0.98 }} />
                      </Box>
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.14rem', color: 'white', mb: 0.2, lineHeight: 1.2 }}>
                          Fun Chinese
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 700, lineHeight: 1.2 }}>
                          Practice through challenges
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: is960 ? 44 : 48,
                        height: is960 ? 44 : 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: is960 ? 22 : 24, color: 'white' }} />
                    </Box>
                  </Box>
                </ButtonBase>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
                <ButtonBase
                  onClick={() => navigate('/library/hub/culture')}
                  sx={{
                    width: '100%',
                    minHeight: { xs: 56, md: 92 },
                    borderRadius: is960 ? '22px' : '28px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'stretch',
                    boxShadow: '0 14px 34px rgba(20,184,166,0.18)',
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 18px 40px rgba(20,184,166,0.26)',
                    },
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: teal,
                      background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 60%, #99F6E4 100%)',
                      px: is960 ? 1.55 : 2,
                      py: is960 ? 1.15 : 1.35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      width: '100%',
                      minHeight: { md: 92 },
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.1 : 1.35, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: is960 ? 48 : 54,
                          height: is960 ? 48 : 54,
                          borderRadius: is960 ? '16px' : '18px',
                          bgcolor: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        <PublicIcon sx={{ fontSize: is960 ? 28 : 32, color: 'white', opacity: 0.98 }} />
                      </Box>
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.14rem', color: 'white', mb: 0.2, lineHeight: 1.2 }}>
                          Culture
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.78rem', color: 'rgba(255,255,255,0.92)', fontWeight: 700, lineHeight: 1.2 }}>
                          Podcast · Mindmap · Video
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: is960 ? 44 : 48,
                        height: is960 ? 44 : 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: is960 ? 22 : 24, color: 'white' }} />
                    </Box>
                  </Box>
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          {/* 书架：按参考图重构为封面主视觉 + 独立底部按钮 */}
          <Box sx={{ gridArea: 'shelf', display: 'flex', alignItems: 'stretch', minWidth: 0, minHeight: 0 }}>
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: is960 ? '26px' : '34px',
                p: is960 ? 1.6 : 2.2,
                boxShadow: '0 10px 34px rgba(45,51,54,0.12)',
                border: '1px solid rgba(0,0,0,0.05)',
                minHeight: { xs: is960 ? 300 : 360, md: 0 },
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: { md: '100%' },
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  position: 'relative',
                  borderRadius: is960 ? '24px' : '30px',
                  overflow: 'hidden',
                  minHeight: is960 ? 220 : 280,
                  mb: 1.5,
                  p: is960 ? 1 : 1.2,
                  bgcolor: '#00BEC9',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: is960 ? '18px' : '24px',
                    overflow: 'hidden',
                    background: '#B4E8F5',
                  }}
                >
                  <Box
                    component="img"
                    src={bookshelfCoverImage}
                    alt="Happy Chinese Volume 1"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.46) 2%, rgba(0,0,0,0.06) 44%, transparent 66%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      bottom: is960 ? 112 : 132,
                      bgcolor: 'rgba(36, 58, 74, 0.58)',
                      backdropFilter: 'blur(3px)',
                      borderRadius: is960 ? '0 10px 10px 0' : '0 12px 12px 0',
                      px: is960 ? 1 : 1.25,
                      py: is960 ? 0.7 : 0.9,
                      width: 'fit-content',
                      maxWidth: '72%',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1.02rem', color: 'white', lineHeight: 1.3 }}>
                      Happy Chinese
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: is960 ? '0.72rem' : '0.82rem', color: 'rgba(255,255,255,0.95)' }}>
                      Volume 1
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: is960 ? 14 : 20,
                      transform: 'translateX(-50%)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: is960 ? '0.92rem' : '1.24rem',
                      textShadow: '0 4px 16px rgba(0,0,0,0.45)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {textbookPagesRead}/{textbookPagesTotal} Pages
                  </Typography>
                </Box>
              </Box>
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/library/select-books');
                }}
                sx={{
                  alignSelf: 'center',
                  width: is960 ? '78%' : '82%',
                  minHeight: is960 ? 50 : 58,
                  flexShrink: 0,
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #00C6CF 0%, #00B7C2 100%)',
                  color: '#FFFFFF',
                  fontSize: is960 ? '0.95rem' : '1.08rem',
                  fontWeight: 800,
                  letterSpacing: '0.01em',
                  boxShadow: '0 12px 22px rgba(0, 190, 201, 0.28)',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                Choose a Book
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // 正常显示：有选中的书籍
  return (
    <Box sx={{ p: is960 ? 2 : (is1920x1125 ? 6 : 4), height: '100%', overflowY: 'hidden', boxSizing: 'border-box', bgcolor: '#FDFCF8' }}>
      <Box sx={{ maxWidth: is960 ? 900 : (is1920x1125 ? 1800 : 960), mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box component="header" sx={{ mb: is960 ? 2 : (is1920x1125 ? 4 : 3), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              color: '#1F2937', 
              fontSize: is960 ? '1.5rem' : (is1920x1125 ? '2.5rem' : '2rem'), 
              letterSpacing: '-0.02em' 
            }}>
              书架
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            bgcolor: 'white', 
            p: is960 ? 0.5 : (is1920x1125 ? 1 : 0.75), 
            borderRadius: is960 ? '30px' : (is1920x1125 ? '50px' : '40px'), 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            border: is960 ? '1px solid' : (is1920x1125 ? '3px solid' : '2px solid'),
            borderColor: '#E5E7EB',
            gap: is960 ? 0.25 : (is1920x1125 ? 0.5 : 0.25)
          }}>
             {CATEGORIES.map(cat => (
               <ButtonBase 
                 key={cat.key}
                 onClick={() => setActiveCategory(cat.key)}
                 sx={{ 
                   px: is960 ? 2 : (is1920x1125 ? 4 : 3), 
                   py: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1), 
                   borderRadius: is960 ? '25px' : (is1920x1125 ? '40px' : '30px'), 
                   fontWeight: 900, 
                   fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.125rem' : '0.875rem'), 
                   textTransform: 'uppercase', 
                   letterSpacing: '0.05em', 
                   bgcolor: activeCategory === cat.key ? '#00B4A0' : 'transparent', 
                   color: activeCategory === cat.key ? 'white' : '#1F2937', 
                   '&:active': { scale: 0.95 }, 
                   transition: '0.3s' 
                 }}
               >
                 {cat.label}
               </ButtonBase>
             ))}
          </Box>
        </Box>

        {/* 横向滚动书籍列表 */}
        <Box sx={{ 
          flex: 1, 
          overflowX: 'auto', 
          overflowY: 'hidden',
          display: 'flex',
          gap: is960 ? 2 : (is1920x1125 ? 4 : 3),
          pb: 2,
          '&::-webkit-scrollbar': {
            height: is960 ? 4 : (is1920x1125 ? 8 : 6),
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: '#F3F4F6',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#D1D5DB',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: '#9CA3AF',
            },
          },
        }}>
          {/* 添加书籍卡片 */}
          <Box 
            onClick={() => navigate('/library/select-books')}
            sx={{ 
              flexShrink: 0,
              width: is960 ? 180 : (is1920x1125 ? 320 : 240),
              minHeight: is960 ? 240 : (is1920x1125 ? 400 : 320),
              background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', 
              borderRadius: is960 ? '24px' : (is1920x1125 ? '40px' : '32px'), 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              p: is960 ? 2 : (is1920x1125 ? 4 : 3), 
              textAlign: 'center',
              border: is960 ? '2px solid' : (is1920x1125 ? '3px solid' : '2px solid'),
              borderColor: '#10B98120',
              cursor: 'pointer', 
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            <Box sx={{ 
              width: is960 ? 56 : (is1920x1125 ? 96 : 64), 
              height: is960 ? 56 : (is1920x1125 ? 96 : 64), 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10B981, #059669)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: is960 ? 1.5 : (is1920x1125 ? 3 : 2), 
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' 
            }}>
              <AddIcon sx={{ fontSize: is960 ? 28 : (is1920x1125 ? 48 : 32), color: 'white' }} />
            </Box>
            <Typography sx={{ 
              fontWeight: 900, 
              color: '#047857', 
              fontSize: is960 ? '0.75rem' : (is1920x1125 ? '1.25rem' : '0.875rem'),
              lineHeight: 1.4
            }}>
              从书架里选书
            </Typography>
          </Box>

          {/* 书籍封面横向滚动 */}
          {filteredBooks.map((book) => (
            <Box 
              key={book.id}
              onClick={() => handleOpenBook(book)}
              sx={{ 
                flexShrink: 0,
                width: is960 ? 180 : (is1920x1125 ? 320 : 240),
                cursor: 'pointer', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                display: 'flex', 
                flexDirection: 'column', 
                '&:active': { transform: 'scale(0.98)' } 
              }}
            >
              <Box 
                className="cover" 
                sx={{ 
                  position: 'relative', 
                  aspectRatio: '3/4', 
                  borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'), 
                  overflow: 'hidden', 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)', 
                  mb: is960 ? 1 : (is1920x1125 ? 2 : 1.5), 
                  border: is960 ? '2px solid' : (is1920x1125 ? '4px solid' : '3px solid'),
                  borderColor: 'white', 
                  bgcolor: '#E5E7EB' 
                }}
              >
                <Box 
                  component="img" 
                  src={book.cover} 
                  alt={book.title}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))' }} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: is960 ? 8 : (is1920x1125 ? 16 : 12), 
                  left: is960 ? 8 : (is1920x1125 ? 16 : 12), 
                  width: is960 ? 28 : (is1920x1125 ? 48 : 36), 
                  height: is960 ? 28 : (is1920x1125 ? 48 : 36), 
                  bgcolor: 'white', 
                  borderRadius: is960 ? '8px' : (is1920x1125 ? '12px' : '10px'), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)', 
                  border: '2px solid #F3F4F6', 
                  zIndex: 1 
                }}>
                  <Typography sx={{ 
                    fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.125rem' : '0.875rem'), 
                    fontWeight: 900, 
                    color: '#00B4A0' 
                  }}>
                    {book.hsk}
                  </Typography>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: is960 ? 8 : (is1920x1125 ? 16 : 12), 
                  left: is960 ? 8 : (is1920x1125 ? 16 : 12), 
                  right: is960 ? 8 : (is1920x1125 ? 16 : 12), 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  borderRadius: is960 ? '8px' : (is1920x1125 ? '16px' : '12px'), 
                  p: is960 ? 0.75 : (is1920x1125 ? 1.5 : 1), 
                  backdropFilter: 'blur(10px)', 
                  zIndex: 1 
                }}>
                   <Box sx={{ 
                     height: is960 ? 3 : (is1920x1125 ? 6 : 4), 
                     bgcolor: '#F3F4F6', 
                     borderRadius: is960 ? '3px' : (is1920x1125 ? '6px' : '4px'), 
                     overflow: 'hidden' 
                   }}>
                      <Box sx={{ 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #00B4A0, #00D4BD)', 
                        width: `${book.progress}%` 
                      }} />
                   </Box>
                </Box>
              </Box>
              <Typography sx={{ 
                fontWeight: 900, 
                color: '#1F2937', 
                fontSize: is960 ? '0.8rem' : (is1920x1125 ? '1.25rem' : '0.9375rem'), 
                mb: 0.5, 
                lineClamp: 2, 
                display: '-webkit-box', 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                lineHeight: 1.4
              }}>
                {book.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
