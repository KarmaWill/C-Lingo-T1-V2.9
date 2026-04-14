import { Box, Typography, Grid } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'

const regions = [
  {
    id: 1,
    name: '新手村',
    emoji: '🏡',
    description: '从这里开始你的中文学习之旅',
    progress: 100,
    locked: false,
    completed: true,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    name: '语言森林',
    emoji: '🌲',
    description: '探索词汇的奥秘',
    progress: 60,
    locked: false,
    completed: false,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    name: '语法山脉',
    emoji: '⛰️',
    description: '征服语法的挑战',
    progress: 0,
    locked: true,
    completed: false,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 4,
    name: '对话湖泊',
    emoji: '🌊',
    description: '流畅的对话练习',
    progress: 0,
    locked: true,
    completed: false,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 5,
    name: '文化古城',
    emoji: '🏯',
    description: '了解中国文化',
    progress: 0,
    locked: true,
    completed: false,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 6,
    name: '巴别塔',
    emoji: '🗼',
    description: '终极挑战',
    progress: 0,
    locked: true,
    completed: false,
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
]

export default function GameMapPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: { xs: '32px', lg: '48px' },
          p: { xs: 3, lg: 5 },
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            fontSize: '200px',
            opacity: 0.05,
          }}
        >
          🗺️
        </Box>
        <Typography
          sx={{
            fontSize: { xs: '1.75rem', lg: '2.5rem' },
            fontWeight: 900,
            color: 'text.primary',
            mb: 1,
            position: 'relative',
          }}
        >
          字灵大陆探险地图
      </Typography>
        <Typography
          sx={{
            fontSize: { xs: '1rem', lg: '1.125rem' },
            color: 'text.secondary',
            position: 'relative',
          }}
        >
          探索不同区域，收集字灵，最终重建巴别塔
      </Typography>
      </Box>

      {/* Map Regions */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={{ xs: 2, lg: 3 }}>
          {regions.map((region) => (
            <Grid item xs={12} sm={6} key={region.id}>
              <Box
                onClick={() => !region.locked && {}}
                sx={{
                  position: 'relative',
                  height: { xs: 200, lg: 240 },
                  borderRadius: { xs: '32px', lg: '40px' },
                  overflow: 'hidden',
                  cursor: region.locked ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': !region.locked ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  } : {},
                }}
              >
                {/* Background */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: region.gradient,
                    opacity: region.locked ? 0.4 : 1,
                  }}
                />
                
                {/* Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))',
                  }}
                />

                {/* Content */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    p: { xs: 3, lg: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography sx={{ fontSize: { xs: '3rem', lg: '4rem' } }}>
                      {region.emoji}
                    </Typography>
                    {region.completed && (
                      <Box
              sx={{
                          bgcolor: 'rgba(52, 168, 83, 0.9)',
                          px: 2,
                          py: 0.75,
                          borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                          gap: 0.5,
              }}
            >
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          完成
              </Typography>
                      </Box>
                    )}
                    {region.locked && (
                      <Box
              sx={{
                          bgcolor: 'rgba(0,0,0,0.5)',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
                        <LockIcon sx={{ fontSize: 20 }} />
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.25rem', lg: '1.5rem' },
                        fontWeight: 900,
                        mb: 0.5,
                      }}
                    >
                      {region.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.875rem', lg: '1rem' },
                        opacity: 0.9,
                        mb: 2,
                      }}
                    >
                      {region.description}
                    </Typography>

                    {!region.locked && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            区域进度
              </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {region.progress}%
              </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 6,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${region.progress}%`,
                              bgcolor: 'white',
                              borderRadius: '10px',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Action Button */}
                {!region.locked && !region.completed && (
                  <Box
              sx={{
                      position: 'absolute',
                      bottom: { xs: 16, lg: 20 },
                      right: { xs: 16, lg: 20 },
                      width: { xs: 48, lg: 56 },
                      height: { xs: 48, lg: 56 },
                      borderRadius: '50%',
                      bgcolor: 'white',
                      color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
                    <PlayArrowIcon sx={{ fontSize: { xs: 28, lg: 32 } }} />
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Card */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: { xs: '32px', lg: '40px' },
          p: { xs: 3, lg: 4 },
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: 4,
          justifyContent: 'space-around',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
            2/6
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 600 }}>
            已解锁区域
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
            <StarIcon sx={{ color: '#fbc02d', fontSize: { xs: '2rem', lg: '2.5rem' } }} />
            <Typography sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, fontWeight: 900, color: 'text.primary' }}>
              42
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 600 }}>
            收集字灵
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, fontWeight: 900, color: 'secondary.main', mb: 0.5 }}>
            65%
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 600 }}>
            总体进度
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
