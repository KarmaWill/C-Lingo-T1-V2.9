import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PaletteIcon from '@mui/icons-material/Palette';

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

// 初始状态：没有选中的书籍
const BOOKS: Book[] = [
  {
    id: 'happy-cn',
    title: 'Happy Chinese',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    hsk: 1,
    progress: 0,
    category: 'Textbook',
    pages: ['L1: Hello', 'L2: Family', 'L3: Food'],
    selected: false,
  },
  { 
    id: 'hsk1', 
    title: 'HSK 1 Standard Course', 
    cover: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f67?auto=format&fit=crop&q=80&w=400', 
    hsk: 1, 
    progress: 85, 
    category: 'Textbook',
    pages: ['L1: Hello', 'L2: Thank you', 'L3: What is your name?'],
    selected: false  // 初始状态：未选中
  },
  { 
    id: 'biz-cn', 
    title: 'Business Chinese for Traders', 
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400', 
    hsk: 3, 
    progress: 12, 
    category: 'Textbook',
    pages: ['L1: Meeting Partners', 'L2: Negotiation', 'L3: Logistics'],
    selected: false  // 初始状态：未选中
  },
  { 
    id: 'hsk2', 
    title: 'HSK 2 Standard Course', 
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400', 
    hsk: 2, 
    progress: 0, 
    category: 'Textbook',
    pages: ['L1: Weather', 'L2: Shopping', 'L3: Health'],
    selected: false
  },
  { 
    id: 'daily', 
    title: 'Daily Life in Beijing', 
    cover: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400', 
    hsk: 2, 
    progress: 45, 
    category: 'Textbook',
    pages: ['L1: Hutongs', 'L2: Tea Culture', 'L3: Markets'],
    selected: false
  }
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>(BOOKS);

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
    const lessonCoverImage =
      '/images/library-lesson-cover.png';
    const bookshelfCoverImage =
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

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
              onClick={() => navigate('/lesson/1')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/lesson/1');
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
                boxShadow: '0 12px 40px rgba(45, 51, 54, 0.12)',
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
                alt=""
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: [
                    'linear-gradient(180deg, rgba(15,23,42,0.16) 0%, transparent 34%)',
                    'linear-gradient(0deg, rgba(15,23,42,0.42) 0%, rgba(15,23,42,0.08) 45%, transparent 70%)',
                  ].join(','),
                }}
              />

              {/* 顶部左侧：Current Unit 切换条 */}
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  top: is960 ? 12 : 18,
                  left: is960 ? 12 : 18,
                  zIndex: 2,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '999px',
                  px: is960 ? 1.4 : 1.9,
                  py: is960 ? 0.62 : 0.78,
                  maxWidth: 'min(90%, 340px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: is960 ? '0.52rem' : '0.62rem',
                    fontWeight: 800,
                    color: '#64748B',
                    letterSpacing: '0.02em',
                    textAlign: 'left',
                    mb: 0.28,
                  }}
                >
                  CURRENT UNIT
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.35, minWidth: 0 }}>
                  <ChevronLeftIcon sx={{ fontSize: is960 ? 19 : 21, color: '#94A3B8', flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: is960 ? '0.9rem' : '1.04rem',
                      color: '#1E293B',
                      lineHeight: 1.25,
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    第一单元 我和你
                  </Typography>
                  <ChevronRightIcon sx={{ fontSize: is960 ? 19 : 21, color: '#475569', flexShrink: 0 }} />
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
                  maxWidth: { xs: 'calc(100% - 180px)', md: 'min(52%, 380px)' },
                  zIndex: 2,
                  bgcolor: 'rgba(17,24,39,0.48)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: is960 ? '12px' : '14px',
                  p: is960 ? 1.1 : 1.4,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.02rem' : is1920x1125 ? '1.44rem' : '1.22rem',
                    color: 'white',
                    mb: is960 ? 0.6 : 0.75,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                  }}
                >
                  Lesson 1: 他是谁
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    pl: is960 ? 1.4 : 1.65,
                    color: 'rgba(255,255,255,0.92)',
                    fontSize: is960 ? '0.74rem' : '0.88rem',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    '& li': { mb: 0.2 },
                  }}
                >
                  <li>Ask about someone&apos;s name</li>
                  <li>Talk about someone&apos;s hometown and telephone number</li>
                </Box>
              </Box>

              {/* 右下：Starting Learning 按钮 */}
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/starting-learning');
                }}
                sx={{
                  position: 'absolute',
                  right: is960 ? 12 : 18,
                  bottom: is960 ? 14 : 20,
                  left: { xs: '50%', md: 'auto' },
                  transform: { xs: 'translateX(-50%)', md: 'none' },
                  zIndex: 3,
                  bgcolor: 'white',
                  color: '#0F172A',
                  px: is960 ? 3.3 : 5.2,
                  py: is960 ? 1.15 : 1.45,
                  minHeight: is960 ? 50 : 58,
                  borderRadius: '999px',
                  fontSize: is960 ? '0.98rem' : '1.15rem',
                  fontWeight: 800,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.26)',
                  whiteSpace: 'nowrap',
                  justifyContent: 'center',
                  '&:active': { transform: { xs: 'translateX(-50%) scale(0.98)', md: 'scale(0.98)' } },
                }}
              >
                Starting Learning
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
                    borderRadius: is960 ? '20px' : '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'stretch',
                    boxShadow: '0 10px 28px rgba(255,122,69,0.28)',
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: funOrange,
                      px: is960 ? 1.35 : 1.85,
                      py: is960 ? 1 : 1.15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      width: '100%',
                      minHeight: { md: 92 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.1 : 1.35, flex: 1, minWidth: 0 }}>
                      <SportsEsportsIcon sx={{ fontSize: is960 ? 32 : 38, color: 'white', opacity: 0.98, flexShrink: 0 }} />
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: 'white', mb: 0.2, lineHeight: 1.2 }}>
                          Fun Chinese
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.74rem', color: 'rgba(255,255,255,0.94)', fontWeight: 600, lineHeight: 1.2 }}>
                          Games & Activities
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: is960 ? 44 : 48,
                        height: is960 ? 44 : 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
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
                    borderRadius: is960 ? '20px' : '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'stretch',
                    boxShadow: '0 10px 28px rgba(20,184,166,0.25)',
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: teal,
                      px: is960 ? 1.35 : 1.85,
                      py: is960 ? 1 : 1.15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      width: '100%',
                      minHeight: { md: 92 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: is960 ? 1.1 : 1.35, flex: 1, minWidth: 0 }}>
                      <PaletteIcon sx={{ fontSize: is960 ? 32 : 38, color: 'white', opacity: 0.98, flexShrink: 0 }} />
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: is960 ? '0.92rem' : '1.05rem', color: 'white', mb: 0.2, lineHeight: 1.2 }}>
                          Culture
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.62rem' : '0.74rem', color: 'rgba(255,255,255,0.96)', fontWeight: 600, lineHeight: 1.2 }}>
                          Explore Traditions
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: is960 ? 44 : 48,
                        height: is960 ? 44 : 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
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
                      left: is960 ? 10 : 14,
                      right: is960 ? 68 : 84,
                      bottom: is960 ? 112 : 132,
                      bgcolor: 'rgba(36, 58, 74, 0.58)',
                      backdropFilter: 'blur(3px)',
                      borderRadius: is960 ? '10px' : '12px',
                      px: is960 ? 1 : 1.25,
                      py: is960 ? 0.7 : 0.9,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1.02rem', color: 'white', lineHeight: 1.3 }}>
                      Happy Chinese
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: is960 ? '0.72rem' : '0.82rem', color: 'rgba(255,255,255,0.95)' }}>
                      Volume 1
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      right: is960 ? 10 : 14,
                      top: is960 ? 124 : 148,
                      bgcolor: '#1787D9',
                      color: 'white',
                      borderRadius: is960 ? '12px' : '14px',
                      px: is960 ? 0.95 : 1.15,
                      py: is960 ? 0.45 : 0.58,
                      fontSize: is960 ? '0.58rem' : '0.68rem',
                      fontWeight: 800,
                      boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
                    }}
                  >
                    Book 1
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
