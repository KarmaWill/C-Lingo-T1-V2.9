import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Grid, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Mock data - in real app, this would come from props or API
const BOOKS: any = {
  'hsk1': { 
    id: 'hsk1', 
    title: 'HSK 1 Standard Course', 
    pages: ['L1: Hello', 'L2: Thank you', 'L3: What is your name?']
  },
  'biz-cn': { 
    id: 'biz-cn', 
    title: 'Business Chinese for Traders', 
    pages: ['L1: Meeting Partners', 'L2: Negotiation', 'L3: Logistics']
  },
  'hsk2': { 
    id: 'hsk2', 
    title: 'HSK 2 Standard Course', 
    pages: ['L1: Weather', 'L2: Shopping', 'L3: Health']
  },
  'daily': { 
    id: 'daily', 
    title: 'Daily Life in Beijing', 
    pages: ['L1: Hutongs', 'L2: Tea Culture', 'L3: Markets']
  }
};

export default function BookReaderPage() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const [isPointReadActive, setIsPointReadActive] = useState(false);
  const [activePageIdx, setActivePageIdx] = useState(0);

  const book = bookId ? BOOKS[bookId] : null;

  if (!book) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F7F9F8',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1, flexShrink: 0 }}>
          <ButtonBase
            onClick={() => navigate('/library')}
            sx={{
              minHeight: 48,
              px: 2,
              py: 1,
              borderRadius: '12px',
              bgcolor: 'white',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB',
              fontWeight: 800,
              fontSize: '0.95rem',
              '&:active': { bgcolor: '#F3F4F6', transform: 'scale(0.98)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 26 }} />
            Back to Library
          </ButtonBase>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            pb: 4,
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#1F2937' }}>Book not found</Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '0.9rem', textAlign: 'center', maxWidth: 360 }}>
            This book is unavailable or the link is invalid.
          </Typography>
          <ButtonBase
            onClick={() => navigate('/library')}
            sx={{
              minHeight: 48,
              px: 3,
              py: 1.25,
              borderRadius: '14px',
              bgcolor: '#00B4A0',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.95rem',
              '&:active': { bgcolor: '#009688', transform: 'scale(0.98)' },
            }}
          >
            Go to Library
          </ButtonBase>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: '#F7F9F8', zIndex: 2000, p: 3, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Header with Exit Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ButtonBase
          onClick={() => navigate('/library')}
          sx={{
            bgcolor: 'white',
            color: '#636E72',
            px: 2.5,
            py: 1.2,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '2px solid #E0E0E0',
            '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' }
          }}
        >
          <Typography sx={{ fontSize: 24 }}>←</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>退出</Typography>
        </ButtonBase>
        
        <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436' }}>{book.title}</Typography>
        </Box>
        
        <Box sx={{ position: 'absolute', right: 24, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ButtonBase 
            onClick={() => setIsPointReadActive(!isPointReadActive)} 
            sx={{ 
              px: 2.5, 
              py: 1.2, 
              borderRadius: 1, 
              fontWeight: 900, 
              fontSize: '0.875rem', 
              bgcolor: isPointReadActive ? '#FF6B35' : 'white', 
              color: isPointReadActive ? 'white' : '#FF6B35', 
              border: '2px solid',
              borderColor: isPointReadActive ? '#FF6B35' : '#E0E0E0',
              '&:active': { transform: 'scale(0.95)' }, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              boxShadow: isPointReadActive ? '0 4px 12px rgba(255,107,53,0.2)' : '0 4px 12px rgba(0,0,0,0.05)' 
            }}
          >
            <span style={{ fontSize: '1.125rem' }}>🖱️</span> 
            {isPointReadActive ? '点读已开启' : '点读已关闭'}
          </ButtonBase>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, minHeight: 0 }}>
        {/* Sidebar */}
        <Box component="aside" sx={{ width: 240, bgcolor: 'white', borderRadius: 2, border: '2px solid #E5E7EB', p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', mb: 2, textAlign: 'center', letterSpacing: '0.05em' }}>课程目录</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {book.pages.map((p: string, i: number) => (
              <ButtonBase 
                key={i} 
                onClick={() => setActivePageIdx(i)} 
                sx={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  p: 1.5, 
                  borderRadius: 1.5, 
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  bgcolor: activePageIdx === i ? '#00B4A0' : 'transparent', 
                  color: activePageIdx === i ? 'white' : '#6B7280', 
                  boxShadow: activePageIdx === i ? '0 4px 12px rgba(0,180,160,0.2)' : 'none', 
                  justifyContent: 'flex-start', 
                  '&:active': { transform: 'scale(0.98)' } 
                }}
              >
                {p}
              </ButtonBase>
            ))}
          </Box>
        </Box>
        
        {/* Main Reading Area */}
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'white', borderRadius: 2, border: '2px solid #E5E7EB', p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#2D3436', mb: 1, fontSize: '1.75rem' }}>{book.pages[activePageIdx]}</Typography>
            <Box sx={{ width: 60, height: 4, bgcolor: '#00B4A0', borderRadius: 1 }} />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Reading Text */}
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>📖 课文内容</Typography>
              <Typography sx={{ 
                fontSize: '2rem', 
                fontWeight: 900, 
                color: '#2D3436', 
                lineHeight: 1.8, 
                cursor: isPointReadActive ? 'pointer' : 'default',
                p: 3,
                bgcolor: '#F7F9F8',
                borderRadius: 2,
                border: '2px solid #E5E7EB'
              }}>
                你好，我的名字是<Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, transition: '0.2s', bgcolor: isPointReadActive ? '#FFD93D50' : 'transparent', '&:active': { bgcolor: isPointReadActive ? '#FFD93D' : 'transparent' }, cursor: isPointReadActive ? 'pointer' : 'inherit' }}>梅梅</Box>。
              </Typography>
            </Box>
            
            {/* Vocabulary */}
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#00B4A015', border: '2px solid #00B4A030' }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: '#00B4A0', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>✍️ 词汇练习</Typography>
              <Grid container spacing={2}>
                {['你好 (Hello)', '名字 (Name)'].map(w => (
                  <Grid item xs={6} key={w}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1.5, border: '2px solid #E5E7EB', fontWeight: 900, color: '#2D3436', textAlign: 'center', fontSize: '1rem' }}>{w}</Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

