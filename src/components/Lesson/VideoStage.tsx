import { useState, useEffect } from 'react'
import { Box, Typography, Button, IconButton } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Lesson } from '../../types/lesson'

interface VideoStageProps {
  lesson: Lesson
  onComplete: () => void
}

export default function VideoStage({ lesson, onComplete }: VideoStageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 2
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <Box sx={{ height: '100%', bgcolor: 'black', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', px: 2, py: 0.5, borderRadius: 10 }}>
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
          第一课 / 共 4 课
        </Typography>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="img"
          src={lesson.videoUrl}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
        
        <IconButton 
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{ 
            zIndex: 10, 
            width: 80, 
            height: 80, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 40, color: 'white' }} /> : <PlayArrowIcon sx={{ fontSize: 40, color: 'white', ml: 0.5 }} />}
        </IconButton>

        <Box sx={{ position: 'absolute', bottom: 64, width: '100%', textAlign: 'center', px: 4 }}>
          <Typography sx={{ color: 'white', fontSize: '1.25rem', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Nà shì nǐ de nǚ péngyǒu ma?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            那是你的女朋友吗？
          </Typography>
        </Box>
      </Box>

      <Box sx={{ h: 4, bgcolor: 'grey.800', w: '100%' }}>
        <Box sx={{ h: '100%', bgcolor: 'primary.main', width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </Box>

      <Box sx={{ p: 4, bgcolor: 'grey.900' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '1.125rem' }}>{lesson.title}</Typography>
            <Typography sx={{ color: 'grey.500', fontSize: '0.875rem' }}>{lesson.subtitle}</Typography>
          </Box>
        </Box>
        
        <Button 
          fullWidth
          variant="contained"
          onClick={onComplete}
          endIcon={<ChevronRightIcon />}
          sx={{ py: 2, borderRadius: 4, fontWeight: 900, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          开始练习
        </Button>
      </Box>
    </Box>
  )
}

