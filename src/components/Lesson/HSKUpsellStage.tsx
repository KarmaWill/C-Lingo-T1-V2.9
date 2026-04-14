import { Box, Typography, Grid, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SchoolIcon from '@mui/icons-material/School'
import ChatIcon from '@mui/icons-material/Chat'
import PersonIcon from '@mui/icons-material/Person'
import GestureIcon from '@mui/icons-material/Gesture'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import { Stage } from '../../types/lesson'

interface Props {
  onSelectFeature: (feature: Stage) => void
  onBack: () => void
}

export default function HSKUpsellStage({ onSelectFeature, onBack }: Props) {
  const features = [
    {
      id: Stage.PREMIUM_AI,
      title: 'AI 场景练习',
      subtitle: '原生对话',
      description: '与我们最先进的 AI 进行自由流动或基于任务的对话。',
      icon: <ChatIcon sx={{ fontSize: 32 }} />,
      color: '#FFD93D',
      lightColor: 'rgba(255, 217, 61, 0.1)',
      badge: '实时 AI'
    },
    {
      id: Stage.PREMIUM_HANZI,
      title: '汉字精通',
      subtitle: '精准书写',
      description: '深入研究每个 HSK 单词的历史、笔顺和字源。',
      icon: <GestureIcon sx={{ fontSize: 32 }} />,
      color: '#4CAF50',
      lightColor: 'rgba(76, 175, 80, 0.1)',
      badge: '互动式'
    },
    {
      id: Stage.PREMIUM_HSK,
      title: 'HSK 模拟考',
      subtitle: '标准化测评',
      description: '通过包含听力和阅读部分的模拟演练，测试你的实际水平。',
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      color: '#00B4A0',
      lightColor: 'rgba(0, 180, 160, 0.1)',
      badge: '严格模式'
    },
    {
      id: Stage.PREMIUM_DIGITAL_HUMAN,
      title: '数字人讲解',
      subtitle: 'AI 视频洞察',
      description: '向栩栩如生的数字人学习语法细微差别和文化背景。',
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      color: '#1A237E',
      lightColor: 'rgba(26, 35, 126, 0.1)',
      badge: '视频讲座'
    }
  ]

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F7F9F8', overflow: 'hidden', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: 'white', color: '#636E72', borderRadius: '16px', p: 1.5, border: '1px solid #E0E0E0', '&:active': { transform: 'scale(0.95)', bgcolor: '#F3F4F6' } }}>
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <StarIcon sx={{ color: '#FFD93D', fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#636E72', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>解锁卓越</Typography>
            <StarIcon sx={{ color: '#FFD93D', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#2D3436' }}>深度学习中心</Typography>
        </Box>

        <Box sx={{ width: 56 }} />
      </Box>

      {/* Feature Grid */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Grid container spacing={2.5}>
          {features.map((f) => (
            <Grid item xs={12} md={6} key={f.id}>
              <Box
                component="button"
                onClick={() => onSelectFeature(f.id)}
                sx={{
                  width: '100%', textAlign: 'left', border: '2px solid #E0E0E0', cursor: 'pointer', bgcolor: 'white', p: 3, borderRadius: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 280, transition: 'all 0.2s ease',
                  '&:active': { transform: 'scale(0.98)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ width: 64, height: 64, bgcolor: f.lightColor, color: f.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${f.color}` }}>
                    {f.icon}
                  </Box>
                  <Box sx={{ px: 1.5, py: 0.5, bgcolor: f.lightColor, color: f.color, borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${f.color}` }}>
                    {f.badge}
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ color: '#636E72', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', mb: 0.5, letterSpacing: '0.05em' }}>{f.subtitle}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#2D3436', mb: 1.5, fontSize: '1.25rem' }}>{f.title}</Typography>
                  <Typography sx={{ color: '#636E72', fontWeight: 500, lineHeight: 1.5, fontSize: '0.95rem', mb: 2 }}>{f.description}</Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mt: 2,
                    py: 1.5,
                    px: 2,
                    bgcolor: f.color,
                    color: 'white',
                    borderRadius: '10px',
                    boxShadow: `0 4px 12px ${f.color}40`
                  }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                      开始模块 <ArrowForwardIcon sx={{ fontSize: 24 }} />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

