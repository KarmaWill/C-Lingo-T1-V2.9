/**
 * Library Book Selection Page（书籍选择页面）
 * 从图书馆书架点击"Choose a Book"进入
 * 显示所有可选书籍供用户选择
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, InputBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';

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

type Category = 'All' | 'Happy Chinese' | 'HSK' | 'Culture' | 'Exercises';

const MOCK_BOOKS: Book[] = [
  {
    id: 'hc-1',
    title: 'Happy Chinese',
    subtitle: 'Volume 1',
    author: 'Li Xiaolin',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
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
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=400',
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
    coverUrl: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f67?auto=format&fit=crop&q=80&w=400',
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
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
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
    coverUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400',
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
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400',
    progress: 15,
    totalPages: 80,
    currentPage: 12,
    category: 'Exercises',
    hskLevel: 1,
    isDownloaded: true,
  },
];

export default function LibraryBookSelectionPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';
  const is1920x1125 = screenSize === '1920x1125';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: Category[] = ['All', 'Happy Chinese', 'HSK', 'Culture', 'Exercises'];

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const continueReadingBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => book.progress > 0 && book.progress < 100);
  }, []);

  const teal = '#14B8A6';
  const pageBg = '#FDF6E9';

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Header with Back Button and Search */}
      <Box
        sx={{
          p: is960 ? 2 : 3,
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1.5 : 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'white',
          flexShrink: 0,
        }}
      >
        <ButtonBase
          onClick={() => navigate('/library')}
          sx={{
            width: is960 ? 44 : 52,
            height: is960 ? 44 : 52,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.04)',
            color: '#374151',
            flexShrink: 0,
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
        </ButtonBase>

        <Box sx={{ flex: 1, maxWidth: is960 ? 400 : 520, position: 'relative' }}>
          <SearchIcon
            sx={{
              position: 'absolute',
              left: is960 ? 14 : 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              fontSize: is960 ? 20 : 22,
              pointerEvents: 'none',
            }}
          />
          <InputBase
            placeholder="搜索书籍、课程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              height: is960 ? 44 : 52,
              bgcolor: '#F5F5F0',
              borderRadius: is960 ? '16px' : '20px',
              pl: is960 ? 5 : 5.5,
              pr: 2,
              fontSize: is960 ? '0.88rem' : '1rem',
              fontWeight: 500,
              '&:focus-within': {
                boxShadow: `0 0 0 2px ${teal}40`,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F5F5F0', p: 0.5, borderRadius: is960 ? '14px' : '16px', flexShrink: 0 }}>
          <ButtonBase
            onClick={() => setViewMode('grid')}
            sx={{
              width: is960 ? 36 : 42,
              height: is960 ? 36 : 42,
              borderRadius: is960 ? '12px' : '14px',
              bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? teal : '#9CA3AF',
              boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <GridViewIcon sx={{ fontSize: is960 ? 20 : 24 }} />
          </ButtonBase>
          <ButtonBase
            onClick={() => setViewMode('list')}
            sx={{
              width: is960 ? 36 : 42,
              height: is960 ? 36 : 42,
              borderRadius: is960 ? '12px' : '14px',
              bgcolor: viewMode === 'list' ? 'white' : 'transparent',
              color: viewMode === 'list' ? teal : '#9CA3AF',
              boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <ViewListIcon sx={{ fontSize: is960 ? 20 : 24 }} />
          </ButtonBase>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: is960 ? 2 : 3,
          minHeight: 0,
        }}
      >
        {/* Continue Reading Section */}
        {!searchQuery && activeCategory === 'All' && continueReadingBooks.length > 0 && (
          <Box sx={{ mb: is960 ? 3 : 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1.05rem' : '1.25rem', color: '#1E293B', mb: is960 ? 1.5 : 2 }}>
              继续阅读
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
                    width: is960 ? 280 : 340,
                    bgcolor: 'white',
                    borderRadius: is960 ? '20px' : '24px',
                    p: is960 ? 1.5 : 2,
                    display: 'flex',
                    gap: is960 ? 1.5 : 2,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box
                    sx={{
                      width: is960 ? 68 : 80,
                      height: is960 ? 92 : 108,
                      borderRadius: is960 ? '12px' : '14px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: '#E5E7EB',
                    }}
                  >
                    <Box component="img" src={book.coverUrl} alt={book.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.88rem' : '1rem', color: '#1E293B', lineHeight: 1.3 }}>
                        {book.title}
                      </Typography>
                      {book.subtitle && (
                        <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#64748B', fontWeight: 600 }}>
                          {book.subtitle}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.72rem', color: '#9CA3AF', fontWeight: 700 }}>
                          {book.currentPage} / {book.totalPages} Pages
                        </Typography>
                        <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.72rem', color: teal, fontWeight: 800 }}>
                          {book.progress}%
                        </Typography>
                      </Box>
                      <Box sx={{ height: 4, bgcolor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', bgcolor: teal, width: `${book.progress}%` }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Category Tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: is960 ? 2 : 3, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {categories.map((cat) => (
            <ButtonBase
              key={cat}
              onClick={() => setActiveCategory(cat)}
              sx={{
                px: is960 ? 2 : 2.5,
                py: is960 ? 0.85 : 1,
                borderRadius: is960 ? '16px' : '20px',
                fontSize: is960 ? '0.82rem' : '0.92rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                bgcolor: activeCategory === cat ? teal : '#F5F5F0',
                color: activeCategory === cat ? 'white' : '#64748B',
                boxShadow: activeCategory === cat ? `0 6px 16px ${teal}40` : 'none',
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              {cat}
            </ButtonBase>
          ))}
        </Box>

        {/* Books Grid/List */}
        {viewMode === 'grid' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                sm: 'repeat(auto-fill, minmax(160px, 1fr))',
                md: is960 ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))',
              },
              gap: is960 ? 2 : 3,
            }}
          >
            {filteredBooks.map((book) => (
              <Box
                key={book.id}
                sx={{
                  cursor: 'pointer',
                  '&:active .book-cover': { transform: 'scale(0.98)' },
                }}
              >
                <Box
                  className="book-cover"
                  sx={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    borderRadius: is960 ? '18px' : '22px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '3px solid white',
                    bgcolor: '#E5E7EB',
                    mb: 1,
                    transition: 'all 0.2s',
                    '&:hover .overlay': {
                      opacity: 1,
                    },
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                    },
                  }}
                >
                  <Box component="img" src={book.coverUrl} alt={book.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Hover Overlay with Actions */}
                  <Box
                    className="overlay"
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: is960 ? 1.2 : 1.5,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {/* Main Open Button */}
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/library/read/${book.id}`);
                      }}
                      sx={{
                        width: is960 ? 48 : 56,
                        height: is960 ? 48 : 56,
                        borderRadius: is960 ? '16px' : '18px',
                        bgcolor: teal,
                        color: 'white',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                      }}
                    >
                      <MenuBookIcon sx={{ fontSize: is960 ? 24 : 28 }} />
                    </ButtonBase>

                    {/* Secondary Actions */}
                    <Box sx={{ display: 'flex', gap: is960 ? 0.8 : 1 }}>
                      {book.isDownloaded ? (
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                          sx={{
                            width: is960 ? 40 : 46,
                            height: is960 ? 40 : 46,
                            borderRadius: is960 ? '12px' : '14px',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#EF4444',
                            },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                        </ButtonBase>
                      ) : (
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                          sx={{
                            width: is960 ? 40 : 46,
                            height: is960 ? 40 : 46,
                            borderRadius: is960 ? '12px' : '14px',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: teal,
                            },
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: is960 ? 20 : 22 }} />
                        </ButtonBase>
                      )}
                    </Box>
                  </Box>

                  {/* HSK Level Badge */}
                  {book.hskLevel && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        width: is960 ? 28 : 32,
                        height: is960 ? 28 : 32,
                        bgcolor: 'white',
                        borderRadius: is960 ? '8px' : '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: is960 ? '0.72rem' : '0.82rem',
                        color: teal,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1,
                      }}
                    >
                      {book.hskLevel}
                    </Box>
                  )}

                  {/* Download Progress */}
                  {!book.isDownloaded && book.downloadProgress !== undefined && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: is960 ? 32 : 36,
                        height: is960 ? 32 : 36,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: is960 ? '0.62rem' : '0.68rem',
                        fontWeight: 800,
                        color: 'white',
                        zIndex: 1,
                      }}
                    >
                      {book.downloadProgress}%
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.82rem' : '0.92rem', color: '#1E293B', mb: 0.25, lineHeight: 1.3 }}>
                  {book.title}
                </Typography>
                {book.subtitle && (
                  <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    {book.subtitle}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.5 : 2 }}>
            {filteredBooks.map((book) => (
              <Box
                key={book.id}
                onClick={() => navigate(`/library/read/${book.id}`)}
                sx={{
                  display: 'flex',
                  gap: is960 ? 1.5 : 2,
                  p: is960 ? 1.5 : 2,
                  bgcolor: 'white',
                  borderRadius: is960 ? '20px' : '24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Box
                  sx={{
                    width: is960 ? 68 : 80,
                    height: is960 ? 92 : 108,
                    borderRadius: is960 ? '12px' : '14px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    bgcolor: '#E5E7EB',
                  }}
                >
                  <Box component="img" src={book.coverUrl} alt={book.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.1rem', color: '#1E293B' }}>
                      {book.title}
                    </Typography>
                    {book.subtitle && (
                      <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#64748B', fontWeight: 600 }}>
                        {book.subtitle}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.82rem', color: '#9CA3AF', mt: 0.5 }}>
                      {book.author}
                    </Typography>
                  </Box>
                  <Box sx={{ maxWidth: 280 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>
                        Progress
                      </Typography>
                      <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: teal, fontWeight: 800 }}>
                        {book.progress}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 4, bgcolor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', bgcolor: teal, width: `${book.progress}%` }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                  {book.isDownloaded ? (
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        width: is960 ? 40 : 46,
                        height: is960 ? 40 : 46,
                        borderRadius: is960 ? '12px' : '14px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        color: '#EF4444',
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: is960 ? 20 : 24 }} />
                    </ButtonBase>
                  ) : (
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        width: is960 ? 40 : 46,
                        height: is960 ? 40 : 46,
                        borderRadius: is960 ? '12px' : '14px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        color: teal,
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: is960 ? 20 : 24 }} />
                    </ButtonBase>
                  )}
                  <ButtonBase
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/library/read/${book.id}`);
                    }}
                    sx={{
                      px: is960 ? 2.5 : 3,
                      py: is960 ? 0.85 : 1,
                      borderRadius: is960 ? '14px' : '16px',
                      bgcolor: teal,
                      color: 'white',
                      fontSize: is960 ? '0.78rem' : '0.88rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Open
                  </ButtonBase>
                </Box>
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
                width: is960 ? 72 : 88,
                height: is960 ? 72 : 88,
                borderRadius: '50%',
                bgcolor: '#F5F5F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <MenuBookIcon sx={{ fontSize: is960 ? 36 : 44, color: '#9CA3AF' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1.05rem' : '1.2rem', color: '#64748B', mb: 0.5 }}>
              没有找到书籍
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#9CA3AF' }}>
              试试搜索其他关键词
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
