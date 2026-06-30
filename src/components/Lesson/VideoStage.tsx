import { useState, useEffect } from 'react'
import { Box, Typography, Button, IconButton } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Lesson } from '../../types/lesson'
import { getDeviceScreenInset } from '../../constants/deviceSafeArea'

interface VideoStageProps {
  lesson: Lesson
  onComplete: () => void
}

export default function VideoStage({ lesson, onComplete }: VideoStageProps) {
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const screenInset = getDeviceScreenInset()
  const sessionLabel = lesson.sessionLabel ?? 'Lesson 1 / 4'
  const videoCaption = lesson.videoCaption ?? {
    romanization: 'Nà shì nǐ de nǚ péngyǒu ma?',
    hanzi: '那是你的女朋友吗？',
  }
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
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
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  return (
    <Box
      sx={{
        height: '100%',
        boxSizing: 'border-box',
        p: `${screenInset}px`,
        bgcolor: '#000',
      }}
    >
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        bgcolor: 'black',
        borderRadius: is960 ? '12px' : '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: is960 ? 16 : 24,
          left: is960 ? 16 : 24,
          zIndex: 10,
          bgcolor: 'rgba(0,0,0,0.5)',
          px: is960 ? 1.5 : 2,
          py: 0.5,
          borderRadius: 10,
        }}
      >
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: is960 ? '0.68rem' : undefined }}>
          {sessionLabel}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="img"
          src={lesson.videoUrl}
          alt=""
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />

        <IconButton
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{
            zIndex: 10,
            width: is960 ? 64 : 80,
            height: is960 ? 64 : 80,
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: is960 ? 32 : 40, color: 'white' }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: is960 ? 32 : 40, color: 'white', ml: 0.5 }} />
          )}
        </IconButton>

        <Box sx={{ position: 'absolute', bottom: is960 ? 40 : 64, width: '100%', textAlign: 'center', px: is960 ? 2 : 4 }}>
          <Typography sx={{ color: 'white', fontSize: is960 ? '1rem' : '1.25rem', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {videoCaption.romanization}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: is960 ? '0.78rem' : '0.875rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {videoCaption.hanzi}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, height: 4, bgcolor: 'grey.800', width: '100%' }}>
        <Box sx={{ height: '100%', bgcolor: 'primary.main', width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </Box>

      <Box sx={{ flexShrink: 0, p: is960 ? 2.5 : 4, bgcolor: 'grey.900' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: is960 ? 2 : 3 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'white', fontWeight: 900, fontSize: is960 ? '0.95rem' : '1.125rem', lineHeight: 1.3 }}>
              {lesson.title}
            </Typography>
            <Typography sx={{ color: 'grey.500', fontSize: is960 ? '0.78rem' : '0.875rem' }}>{lesson.subtitle}</Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={onComplete}
          endIcon={<ChevronRightIcon />}
          sx={{
            py: is960 ? 1.5 : 2,
            minHeight: 44,
            borderRadius: 4,
            fontWeight: 900,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          开始练习
        </Button>
      </Box>
    </Box>
    </Box>
  )
}
