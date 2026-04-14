import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function DailyGainsPage() {
  const navigate = useNavigate();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#F7F9F8',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: is960 ? 2 : 3,
        borderBottom: '2px solid #E0E0E0'
      }}>
        <ButtonBase
          onClick={() => navigate('/')}
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
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>退出</Typography>
        </ButtonBase>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436', fontSize: is960 ? '1.25rem' : '1.75rem' }}>
          Daily Gains
        </Typography>

        <Box sx={{ width: 100 }} />
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: is960 ? 2 : 4
      }}>
        <Grid container spacing={is960 ? 2 : 3}>
          {/* Words Card */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              bgcolor: 'white', 
              p: is960 ? 2 : 3, 
              borderRadius: is960 ? '20px' : '32px', 
              border: '2px solid #E0E0E0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'center'
            }}>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : '1rem', 
                fontWeight: 900, 
                color: '#9CA3AF', 
                textTransform: 'uppercase', 
                mb: 2 
              }}>
                Words Learned
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '2.5rem' : '4rem', 
                fontWeight: 900, 
                color: '#00B4A0',
                mb: 1
              }}>
                1,240
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '0.7rem' : '0.875rem', 
                color: '#636E72',
                fontWeight: 600
              }}>
                累计学习词汇
              </Typography>
            </Box>
          </Grid>

          {/* Patterns Card */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              bgcolor: 'white', 
              p: is960 ? 2 : 3, 
              borderRadius: is960 ? '20px' : '32px', 
              border: '2px solid #E0E0E0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'center'
            }}>
              <Typography sx={{ 
                fontSize: is960 ? '0.75rem' : '1rem', 
                fontWeight: 900, 
                color: '#9CA3AF', 
                textTransform: 'uppercase', 
                mb: 2 
              }}>
                Patterns Mastered
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '2.5rem' : '4rem', 
                fontWeight: 900, 
                color: '#FF6B35',
                mb: 1
              }}>
                256
              </Typography>
              <Typography sx={{ 
                fontSize: is960 ? '0.7rem' : '0.875rem', 
                color: '#636E72',
                fontWeight: 600
              }}>
                累计掌握句型
              </Typography>
            </Box>
          </Grid>

          {/* Additional Stats */}
          <Grid item xs={12}>
            <Box sx={{ 
              bgcolor: 'white', 
              p: is960 ? 2 : 3, 
              borderRadius: is960 ? '20px' : '32px', 
              border: '2px solid #E0E0E0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <Typography sx={{ 
                fontSize: is960 ? '1rem' : '1.5rem', 
                fontWeight: 900, 
                color: '#2D3436',
                mb: 2
              }}>
                学习统计
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F7F9F8', borderRadius: 2 }}>
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#00B4A0' }}>
                      12
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.875rem', color: '#636E72', mt: 0.5 }}>
                      连续学习天数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F7F9F8', borderRadius: 2 }}>
                    <Typography sx={{ fontSize: is960 ? '1.5rem' : '2rem', fontWeight: 900, color: '#FF6B35' }}>
                      45
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.7rem' : '0.875rem', color: '#636E72', mt: 0.5 }}>
                      总学习时长（小时）
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

