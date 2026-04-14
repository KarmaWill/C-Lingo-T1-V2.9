import { useState } from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import { PlayCircle, Book, ArrowBack as BackIcon } from '@mui/icons-material';
import CultureVideoStage from '../components/Lesson/CultureVideoStage';
import AudiobookPage from './AudiobookPage';
import { CURRENT_LESSON } from '../mock/lessonData';
import { useNavigate } from 'react-router-dom';

type ContentType = 'selection' | 'video' | 'audiobook';

export default function CultureContentPage() {
  const [contentType, setContentType] = useState<ContentType>('selection');
  const navigate = useNavigate();

  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // 入口选择界面
  const renderSelection = () => (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      bgcolor: '#1F2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <Box sx={{
        width: is960 ? 960 : (is1920x1125 ? 1920 : 1024),
        height: is960 ? 540 : (is1920x1125 ? 1125 : 768),
        bgcolor: '#FFF8F0',
        borderRadius: is960 ? '16px' : (is1920x1125 ? '32px' : '24px'),
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
      {/* 返回按钮 */}
      <ButtonBase 
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: is960 ? 16 : (is1920x1125 ? 32 : 24),
          left: is960 ? 16 : (is1920x1125 ? 32 : 24),
          zIndex: 100,
          width: is960 ? 40 : (is1920x1125 ? 64 : 48),
          height: is960 ? 40 : (is1920x1125 ? 64 : 48),
          borderRadius: is960 ? '12px' : (is1920x1125 ? '18px' : '14px'),
          bgcolor: 'white',
          border: '2px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        <BackIcon sx={{ fontSize: is960 ? 18 : (is1920x1125 ? 28 : 20), color: '#6B7280' }} />
      </ButtonBase>

      {/* 标题 */}
      <Box sx={{ 
        textAlign: 'center', 
        pt: is960 ? 6 : (is1920x1125 ? 16 : 12), 
        pb: is960 ? 4 : (is1920x1125 ? 10 : 8),
        px: is960 ? 2 : (is1920x1125 ? 6 : 4)
      }}>
        <Typography sx={{ 
          fontSize: is960 ? '1.5rem' : (is1920x1125 ? '4rem' : '2.5rem'), 
          fontWeight: 900, 
          color: '#1F2937',
          mb: is960 ? 1 : (is1920x1125 ? 3 : 2),
          letterSpacing: '-0.02em'
        }}>
          🎁 文化奖励已解锁！
        </Typography>
        <Typography sx={{ 
          fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.5rem' : '0.9rem'), 
          fontWeight: 700, 
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Choose Your Learning Format
        </Typography>
      </Box>

      {/* 内容选择卡片 */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: is960 ? 2 : (is1920x1125 ? 6 : 4), 
        px: is960 ? 3 : (is1920x1125 ? 12 : 8), 
        pb: is960 ? 4 : (is1920x1125 ? 12 : 8),
        maxWidth: is1920x1125 ? 1800 : 1200,
        mx: 'auto',
        width: '100%'
      }}>
        {/* 视频入口 */}
        <ButtonBase
          onClick={() => setContentType('video')}
          sx={{
            flex: 1,
            borderRadius: is960 ? '20px' : (is1920x1125 ? '40px' : '32px'),
            bgcolor: 'white',
            border: is960 ? '2px solid' : (is1920x1125 ? '4px solid' : '3px solid'),
            borderColor: '#FEE2E2',
            p: is960 ? 3 : (is1920x1125 ? 8 : 6),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: is960 ? 2 : (is1920x1125 ? 4 : 3),
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: '#EF4444',
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(239,68,68,0.15)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: is960 ? '4px' : (is1920x1125 ? '8px' : '6px'),
              bgcolor: 'linear-gradient(90deg, #EF4444, #F87171)',
              background: 'linear-gradient(90deg, #EF4444, #F87171)'
            }
          }}
        >
          <Box sx={{
            width: is960 ? 80 : (is1920x1125 ? 180 : 120),
            height: is960 ? 80 : (is1920x1125 ? 180 : 120),
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: is960 ? -3 : (is1920x1125 ? -6 : -4),
              borderRadius: '50%',
              border: is960 ? '2px solid' : (is1920x1125 ? '4px solid' : '3px solid'),
              borderColor: '#FCA5A5',
              opacity: 0.3
            }
          }}>
            <PlayCircle sx={{ fontSize: is960 ? 40 : (is1920x1125 ? 100 : 64), color: '#EF4444' }} />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ 
              fontSize: is960 ? '1.2rem' : (is1920x1125 ? '3rem' : '1.8rem'), 
              fontWeight: 900, 
              color: '#1F2937',
              mb: is960 ? 0.5 : (is1920x1125 ? 1.5 : 1)
            }}>
              文化视频
            </Typography>
            <Typography sx={{ 
              fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.5rem' : '1rem'), 
              fontWeight: 700, 
              color: '#EF4444',
              mb: is960 ? 1 : (is1920x1125 ? 2.5 : 2)
            }}>
              Culture Video
            </Typography>
            <Typography sx={{ 
              fontSize: is960 ? '0.65rem' : (is1920x1125 ? '1.25rem' : '0.85rem'), 
              fontWeight: 600, 
              color: '#6B7280',
              lineHeight: 1.6
            }}>
              观看中国家庭礼仪视频
              <br />
              多语言字幕 · 互动学习
            </Typography>
          </Box>

          <Box sx={{
            mt: 'auto',
            px: is960 ? 2 : (is1920x1125 ? 6 : 4),
            py: is960 ? 1 : (is1920x1125 ? 2 : 1.5),
            borderRadius: is960 ? '8px' : (is1920x1125 ? '16px' : '12px'),
            bgcolor: '#FEF2F2',
            border: is960 ? '1px solid' : (is1920x1125 ? '3px solid' : '2px solid'),
            borderColor: '#FEE2E2'
          }}>
            <Typography sx={{ 
              fontSize: is960 ? '0.6rem' : (is1920x1125 ? '1.125rem' : '0.75rem'), 
              fontWeight: 900, 
              color: '#DC2626',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              约 3 分钟
            </Typography>
          </Box>
        </ButtonBase>

        {/* Audiobook入口 */}
        <ButtonBase
          onClick={() => setContentType('audiobook')}
          sx={{
            flex: 1,
            borderRadius: is960 ? '20px' : (is1920x1125 ? '40px' : '32px'),
            bgcolor: 'white',
            border: is960 ? '2px solid' : (is1920x1125 ? '4px solid' : '3px solid'),
            borderColor: '#DBEAFE',
            p: is960 ? 3 : (is1920x1125 ? 8 : 6),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: is960 ? 2 : (is1920x1125 ? 4 : 3),
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: '#3B82F6',
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(59,130,246,0.15)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: is960 ? '4px' : (is1920x1125 ? '8px' : '6px'),
              bgcolor: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
            }
          }}
        >
          <Box sx={{
            width: is960 ? 80 : (is1920x1125 ? 180 : 120),
            height: is960 ? 80 : (is1920x1125 ? 180 : 120),
            borderRadius: '50%',
            bgcolor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: is960 ? -3 : (is1920x1125 ? -6 : -4),
              borderRadius: '50%',
              border: is960 ? '2px solid' : (is1920x1125 ? '4px solid' : '3px solid'),
              borderColor: '#93C5FD',
              opacity: 0.3
            }
          }}>
            <Book sx={{ fontSize: is960 ? 40 : (is1920x1125 ? 100 : 64), color: '#3B82F6' }} />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ 
              fontSize: is960 ? '1.2rem' : (is1920x1125 ? '3rem' : '1.8rem'), 
              fontWeight: 900, 
              color: '#1F2937',
              mb: is960 ? 0.5 : (is1920x1125 ? 1.5 : 1)
            }}>
              有声读物
            </Typography>
            <Typography sx={{ 
              fontSize: is960 ? '0.7rem' : (is1920x1125 ? '1.5rem' : '1rem'), 
              fontWeight: 700, 
              color: '#3B82F6',
              mb: is960 ? 1 : (is1920x1125 ? 2.5 : 2)
            }}>
              Audiobook
            </Typography>
            <Typography sx={{ 
              fontSize: is960 ? '0.65rem' : (is1920x1125 ? '1.25rem' : '0.85rem'), 
              fontWeight: 600, 
              color: '#6B7280',
              lineHeight: 1.6
            }}>
              阅读北京首都故事
              <br />
              点击朗读 · 双语对照
            </Typography>
          </Box>

          <Box sx={{
            mt: 'auto',
            px: is960 ? 2 : (is1920x1125 ? 6 : 4),
            py: is960 ? 1 : (is1920x1125 ? 2 : 1.5),
            borderRadius: is960 ? '8px' : (is1920x1125 ? '16px' : '12px'),
            bgcolor: '#EFF6FF',
            border: is960 ? '1px solid' : (is1920x1125 ? '3px solid' : '2px solid'),
            borderColor: '#DBEAFE'
          }}>
            <Typography sx={{ 
              fontSize: is960 ? '0.6rem' : (is1920x1125 ? '1.125rem' : '0.75rem'), 
              fontWeight: 900, 
              color: '#1D4ED8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              4 个句子
            </Typography>
          </Box>
        </ButtonBase>
      </Box>
      </Box>
    </Box>
  );

  // 根据状态渲染不同内容
  if (contentType === 'video') {
    return (
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        bgcolor: '#1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: is960 ? 960 : (is1920x1125 ? 1920 : 1024),
          height: is960 ? 540 : (is1920x1125 ? 1125 : 768),
          borderRadius: is960 ? '16px' : (is1920x1125 ? '32px' : '24px'),
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          <CultureVideoStage 
            data={CURRENT_LESSON.cultureVideo}
            onBack={() => setContentType('selection')}
          />
        </Box>
      </Box>
    );
  }

  if (contentType === 'audiobook') {
    return (
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        bgcolor: '#1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: is960 ? 960 : (is1920x1125 ? 1920 : 1024),
          height: is960 ? 540 : (is1920x1125 ? 1125 : 768),
          borderRadius: is960 ? '16px' : (is1920x1125 ? '32px' : '24px'),
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          <AudiobookPage 
            onBack={() => setContentType('selection')}
          />
        </Box>
      </Box>
    );
  }

  return renderSelection();
}

