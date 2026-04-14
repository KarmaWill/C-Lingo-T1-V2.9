import { useState } from 'react'
import { Box, Typography, Button, ButtonBase, Grid, Paper, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SchoolIcon from '@mui/icons-material/School'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'

interface Props {
  onBack: () => void
}

export function HSKDrillStage({ onBack }: Props) {
  const [showScore, setShowScore] = useState(false);

  if (showScore) {
    return (
      <Box sx={{ height: '100%', bgcolor: '#F7F9F8', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper sx={{ maxWidth: 600, width: '100%', p: 6, textAlign: 'center', borderRadius: 1, border: '2px solid #E5E7EB', boxShadow: 'none' }}>
          <Box sx={{ width: 120, height: 120, bgcolor: '#00B4A01A', color: '#00B4A0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
            <StarIcon sx={{ fontSize: 64 }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#1F2937' }}>85 / 100</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00B4A0', mb: 4 }}>成绩：优秀 Excellent!</Typography>
          
          <Grid container spacing={2} sx={{ mb: 6 }}>
            {[
              { label: '听力理解', score: '38/40' },
              { label: '阅读理解', score: '47/60' }
            ].map(part => (
              <Grid item xs={6} key={part.label}>
                <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 1, border: '1px solid #E5E7EB' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#6B7280', textTransform: 'uppercase' }}>{part.label}</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#1F2937' }}>{part.score}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button fullWidth variant="contained" onClick={onBack} sx={{ py: 2, borderRadius: 1, fontWeight: 900, fontSize: '1.125rem', bgcolor: '#00B4A0', boxShadow: 'none', '&:hover': { bgcolor: '#009688' } }}>
            回到深度学习中心
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F7F9F8', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonBase onClick={onBack} sx={{ px: 2, py: 1, borderRadius: 1, border: '1px solid #E5E7EB', fontWeight: 900, color: '#6B7280', display: 'flex', gap: 1 }}>
          <ChevronLeftIcon /> 退出考试
        </ButtonBase>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, color: '#1F2937', fontSize: '1.1rem' }}>
            <SchoolIcon sx={{ color: '#00B4A0' }} /> HSK 1级 标准模拟考
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 800 }}>剩余时间: 34:50</Typography>
        </Box>
        <Button variant="contained" onClick={() => setShowScore(true)} sx={{ fontWeight: 900, borderRadius: 1, px: 3, py: 1, bgcolor: '#00B4A0', boxShadow: 'none' }}>
          提交试卷
        </Button>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ width: 280, bgcolor: 'white', borderRight: '2px solid #E5E7EB', p: 2, display: { xs: 'none', lg: 'block' } }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: '#6B7280', textTransform: 'uppercase', mb: 2, display: 'block' }}>题目板 QUESTION BOARD</Typography>
          <Grid container spacing={1}>
            {Array.from({ length: 20 }).map((_, i) => (
              <Grid item xs={3} key={i}>
                <Box sx={{ 
                  aspectRatio: '1/1', 
                  bgcolor: i === 0 ? '#00B4A0' : '#F3F4F6', 
                  color: i === 0 ? 'white' : '#6B7280', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 1, 
                  fontWeight: 900, 
                  border: '1px solid #E5E7EB'
                }}>
                  {i + 1}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ flex: 1, p: 3, bgcolor: '#F7F9F8', overflow: 'auto' }}>
          <Paper sx={{ maxWidth: 800, mx: 'auto', p: 4, borderRadius: 1, border: '2px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#00B4A0', mb: 1, display: 'block' }}>阅读部分 • 任务 1</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#1F2937' }}>请为以下短语选择对应的图片：</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#00B4A0', mb: 4, bgcolor: '#00B4A00A', p: 2, borderRadius: 1, textAlign: 'center', border: '1px dashed #00B4A0' }}>
              "Tā de mèimei" (她的妹妹)
            </Typography>
            
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map(i => (
                <Grid item xs={6} key={i}>
                  <Box sx={{ 
                    position: 'relative', 
                    aspectRatio: '16/9', 
                    bgcolor: 'white', 
                    borderRadius: 1, 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    border: '3px solid #E5E7EB', 
                    transition: '0.2s',
                    '&:active': { transform: 'scale(0.98)' }
                  }}>
                    <Box component="img" src={`https://picsum.photos/seed/${i+10}/800/450`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, bgcolor: 'white', border: '2px solid #E5E7EB', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1F2937' }}>{String.fromCharCode(64 + i)}</Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '2px solid #F1F3F4' }}>
              <Button sx={{ fontWeight: 900, color: '#6B7280', borderRadius: 1 }}>上一题</Button>
              <Button variant="contained" sx={{ px: 4, py: 1.5, fontWeight: 900, borderRadius: 1, bgcolor: '#00B4A0', boxShadow: 'none' }}>下一题</Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export function DigitalHumanStage({ onBack }: Props) {
  return (
    <Box sx={{ height: '100%', bgcolor: 'black', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <Box component="img" src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2000" sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
      </Box>

      <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
        <ButtonBase onClick={onBack} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', p: 1.5, borderRadius: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
          <ChevronLeftIcon />
        </ButtonBase>
      </Box>

      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 6, color: 'white' }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ width: 72, height: 72, bgcolor: '#FFD93D', borderRadius: 1, border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '2.5rem' }}>🧑‍🏫</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#FFD93D', textTransform: 'uppercase', letterSpacing: 2 }}>AI 老师 Lin</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>语境细微差别</Typography>
            </Box>
          </Box>

          <Paper sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', p: 4, borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.95)' }}>
              "当介绍年幼的兄弟姐妹时，我们用 <span style={{ color: '#FFD93D', textDecoration: 'underline', fontWeight: 900 }}>妹妹</span>。注意第二个字是轻声。"
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button fullWidth variant="contained" sx={{ py: 2, borderRadius: 1, fontWeight: 900, fontSize: '1.1rem', bgcolor: '#FFD93D', color: '#1F2937', boxShadow: 'none' }}>开始强化训练</Button>
            <Button fullWidth sx={{ py: 2, borderRadius: 1, fontWeight: 900, fontSize: '1.1rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>查看总结</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function HanziStage({ onBack }: Props) {
  return (
    <Box sx={{ height: '100%', bgcolor: '#F7F9F8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonBase onClick={onBack} sx={{ px: 2, py: 1, borderRadius: 1, border: '1px solid #E5E7EB', fontWeight: 900, color: '#6B7280', display: 'flex', gap: 1 }}>
          <ChevronLeftIcon /> 返回
        </ButtonBase>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: '#6B7280', textTransform: 'uppercase' }}>ORIGIN & CALLIGRAPHY</Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1F2937' }}>汉字精练室</Typography>
        </Box>
        <Box sx={{ width: 80 }} />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 450, aspectRatio: '1/1', bgcolor: 'white', borderRadius: 1, border: '3px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Box sx={{ position: 'absolute', inset: 0, p: 2 }}>
            <Box sx={{ 
              width: '100%', height: '100%', border: '2px solid #F1F3F4', position: 'relative',
              '&::before': { content: '""', position: 'absolute', top: '50%', left: 0, right: 0, height: 2, bgcolor: '#F1F3F4', borderStyle: 'dashed' },
              '&::after': { content: '""', position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, bgcolor: '#F1F3F4', borderStyle: 'dashed' }
            }} />
          </Box>
          <Typography sx={{ fontSize: '15rem', fontWeight: 400, color: '#1F2937', zIndex: 1, fontFamily: '"Noto Sans SC", sans-serif' }}>女</Typography>
        </Box>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#00B4A0' }}>Nǚ</Typography>
          <Box sx={{ px: 3, py: 1, bgcolor: '#00B4A01A', borderRadius: 1, display: 'inline-block', border: '1px solid #00B4A020' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#00B4A0', textTransform: 'uppercase' }}>女性 / 部首</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 4, bgcolor: 'white', borderTop: '2px solid #E5E7EB', textAlign: 'center' }}>
        <Button variant="contained" sx={{ py: 2, px: 8, borderRadius: 1, fontWeight: 900, fontSize: '1.25rem', bgcolor: '#FFD93D', color: '#1F2937', boxShadow: 'none' }}>
          练习精准书写
        </Button>
      </Box>
    </Box>
  )
}

