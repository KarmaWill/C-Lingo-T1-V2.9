import { useState } from 'react'
import { Box, Typography, IconButton, Slider, Menu, MenuItem, ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SettingsIcon from '@mui/icons-material/Settings'
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import { CultureVideo } from '../../types/lesson'

interface Props {
  data: CultureVideo
  onBack: () => void
}

export default function CultureVideoStage({ data, onBack }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(180) // Mock 3分钟
  const [playbackRate, setPlaybackRate] = useState(1)
  const [subtitles, setSubtitles] = useState<('pinyin' | 'zh' | 'en')[]>(['zh']) // 多选字幕
  const [speedMenuAnchor, setSpeedMenuAnchor] = useState<null | HTMLElement>(null)
  const [subtitleMenuAnchor, setSubtitleMenuAnchor] = useState<null | HTMLElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // In real implementation: videoRef.current?.play() or pause()
  }

  const handleSeek = (_: Event, value: number | number[]) => {
    setCurrentTime(value as number)
    // In real implementation: videoRef.current.currentTime = value
  }

  const toggleSubtitle = (type: 'pinyin' | 'zh' | 'en') => {
    setSubtitles(prev => 
      prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type]
    )
  }

  const getSubtitleLines = () => {
    const texts = {
      pinyin: 'zhè shì zhōng wén zì mù shì lì',
      zh: '这是中文字幕示例',
      en: 'This is English subtitle example'
    }
    // 按顺序返回：pinyin, zh, en
    const order: ('pinyin' | 'zh' | 'en')[] = ['pinyin', 'zh', 'en']
    return order.filter(s => subtitles.includes(s)).map(s => texts[s])
  }

  return (
    <Box sx={{ height: '100%', bgcolor: '#000', borderRadius: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Exit Button - 放大并添加玻璃效果 */}
      <ButtonBase
        onClick={onBack}
        sx={{
          position: 'absolute', top: 20, left: 20, zIndex: 20,
          bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px) saturate(180%)', color: 'white',
          px: 3, py: 1.5, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 1,
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', borderColor: 'rgba(255,255,255,0.25)' },
          '&:active': { transform: 'scale(0.96)' }
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: 24 }} />
        <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>退出</Typography>
      </ButtonBase>

      {/* Video Title */}
      <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20, textAlign: 'center' }}>
        <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '1.125rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {data.title}
        </Typography>
      </Box>
      
      {/* Video Area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000', position: 'relative' }}>
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h2" sx={{ fontSize: '4rem', mb: 3 }}>🎁</Typography>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, mb: 1 }}>文化奖励已解锁！</Typography>
          <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>(视频播放器 - 模拟界面)</Typography>
        </Box>

      </Box>

      {/* Subtitle Display - 在进度条上方，叠加显示 */}
      {subtitles.length > 0 && (
        <Box sx={{ px: 4, py: 2, bgcolor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          {getSubtitleLines().map((line, idx) => (
            <Typography key={idx} sx={{ 
              color: 'white', fontWeight: 700, fontSize: '1.25rem', 
              textShadow: '0 2px 8px rgba(0,0,0,0.8)', 
              lineHeight: 1.5,
              mb: idx < getSubtitleLines().length - 1 ? 0.5 : 0
            }}>
              {line}
            </Typography>
          ))}
        </Box>
      )}

      {/* Video Controls */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Progress Bar */}
        <Box sx={{ px: 1, mb: 2 }}>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleSeek}
            sx={{
              color: '#00B4A0',
              '& .MuiSlider-thumb': { width: 16, height: 16 },
              '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
            <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600 }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600 }}>
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          {/* Play/Pause */}
          <IconButton
            onClick={togglePlay}
            sx={{ bgcolor: '#00B4A0', color: 'white', '&:hover': { bgcolor: '#009688' }, width: 48, height: 48, borderRadius: '8px' }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Playback Speed */}
            <ButtonBase
              onClick={(e) => setSpeedMenuAnchor(e.currentTarget)}
              sx={{
                color: 'white', px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, display: 'flex', alignItems: 'center', gap: 1
              }}
            >
              <SettingsIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{playbackRate}x</Typography>
            </ButtonBase>
            <Menu
              anchorEl={speedMenuAnchor}
              open={Boolean(speedMenuAnchor)}
              onClose={() => setSpeedMenuAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <MenuItem
                  key={speed}
                  selected={playbackRate === speed}
                  onClick={() => { setPlaybackRate(speed); setSpeedMenuAnchor(null) }}
                >
                  {speed}x
                </MenuItem>
              ))}
            </Menu>

            {/* Subtitle - 多选 */}
            <ButtonBase
              onClick={(e) => setSubtitleMenuAnchor(e.currentTarget)}
              sx={{
                color: 'white', px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, display: 'flex', alignItems: 'center', gap: 1
              }}
            >
              <SubtitlesIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>字幕</Typography>
            </ButtonBase>
            <Menu
              anchorEl={subtitleMenuAnchor}
              open={Boolean(subtitleMenuAnchor)}
              onClose={() => setSubtitleMenuAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MenuItem selected={subtitles.includes('pinyin')} onClick={() => toggleSubtitle('pinyin')}>拼音</MenuItem>
              <MenuItem selected={subtitles.includes('zh')} onClick={() => toggleSubtitle('zh')}>中文</MenuItem>
              <MenuItem selected={subtitles.includes('en')} onClick={() => toggleSubtitle('en')}>English</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

