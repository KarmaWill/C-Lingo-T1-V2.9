import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'
import { FM_ALBUMS, type FmAlbum } from '../data/fmCatalog'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AIFMPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [album, setAlbum] = useState<FmAlbum | null>(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [clock, setClock] = useState({ t: 0, d: 0 })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const track = album?.tracks[trackIndex] ?? album?.tracks[0]

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlaying(false)
    setClock({ t: 0, d: 0 })
    setTrackIndex(0)
  }, [album?.id])

  useEffect(() => {
    if (!track) return
    const prev = audioRef.current
    prev?.pause()
    const audio = new Audio(track.audio)
    audioRef.current = audio
    const onTime = () => setClock({ t: audio.currentTime, d: audio.duration || 0 })
    const onEnded = () => {
      if (!album) return
      if (trackIndex < album.tracks.length - 1) {
        setTrackIndex((value) => value + 1)
        setPlaying(true)
      } else {
        setPlaying(false)
      }
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onTime)
    audio.addEventListener('ended', onEnded)
    if (playing) void audio.play().catch(() => setPlaying(false))
    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [track?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) void audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [playing])

  const goBack = () => {
    if (album) {
      audioRef.current?.pause()
      setPlaying(false)
      setAlbum(null)
      return
    }
    navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })
  }

  const playNext = () => {
    if (!album) return
    setTrackIndex((value) => (value + 1) % album.tracks.length)
    setPlaying(true)
  }

  return (
    <Box sx={{ height: '100%', bgcolor: '#F8F9F8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          height: p(160),
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E2E3',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ position: 'absolute', left: p(60), top: '50%', transform: 'translateY(-50%)' }}>
          <HskPrepBackButton
            onClick={goBack}
            sx={{ width: p(80), height: p(80), '& .MuiSvgIcon-root': { fontSize: p(40) } }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: p(40),
            lineHeight: 1.6,
            color: '#2D3436',
          }}
        >
          {album ? album.title : 'AI FM'}
        </Typography>
      </Box>

      {!album ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            px: `${p(60)}px`,
            py: `${p(48)}px`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: `${p(40)}px`,
            alignContent: 'start',
          }}
        >
          {FM_ALBUMS.map((item) => (
            <ButtonBase
              key={item.id}
              onClick={() => setAlbum(item)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: `${p(18)}px`,
                overflow: 'hidden',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                component="img"
                src={item.cover}
                alt=""
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: `${p(18)}px`,
                  display: 'block',
                  bgcolor: '#E8ECEF',
                }}
              />
              <Typography
                sx={{
                  mt: `${p(16)}px`,
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(22),
                  lineHeight: 1.3,
                  color: '#2D3436',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  mt: `${p(4)}px`,
                  fontFamily: FIGMA_FONT,
                  fontWeight: 400,
                  fontSize: p(20),
                  lineHeight: 1.3,
                  color: '#636E72',
                }}
              >
                {item.artist}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
            gap: `${p(40)}px`,
            px: `${p(60)}px`,
            py: `${p(40)}px`,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${p(28)}px`,
            }}
          >
            <Box
              component="img"
              src={track?.cover || album.cover}
              alt=""
              sx={{
                width: '100%',
                maxWidth: p(720),
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: `${p(28)}px`,
                bgcolor: '#E8ECEF',
                boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
              }}
            />
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(32),
                color: '#2D3436',
                textAlign: 'center',
              }}
            >
              {track?.title}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: p(720) }}>
              <Box
                sx={{
                  height: p(8),
                  borderRadius: 99,
                  bgcolor: '#E8ECEF',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${clock.d > 0 ? Math.min(100, (clock.t / clock.d) * 100) : 0}%`,
                    bgcolor: '#00B4A0',
                    borderRadius: 99,
                  }}
                />
              </Box>
              <Box sx={{ mt: `${p(10)}px`, display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(20), color: '#636E72' }}>
                  {formatTime(clock.t)}
                </Typography>
                <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(20), color: '#636E72' }}>
                  {formatTime(clock.d)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(28)}px` }}>
              <ButtonBase
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? 'Pause' : 'Play'}
                sx={{
                  width: p(100),
                  height: p(100),
                  borderRadius: '50%',
                  bgcolor: '#00B4A0',
                  color: '#FFFFFF',
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                {playing ? (
                  <PauseRoundedIcon sx={{ fontSize: p(52) }} />
                ) : (
                  <PlayArrowRoundedIcon sx={{ fontSize: p(52) }} />
                )}
              </ButtonBase>
              <ButtonBase
                onClick={playNext}
                aria-label="Next"
                sx={{
                  width: p(80),
                  height: p(80),
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0DF',
                  color: '#2D3436',
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                <SkipNextRoundedIcon sx={{ fontSize: p(40) }} />
              </ButtonBase>
            </Box>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              borderRadius: `${p(28)}px`,
              p: `${p(28)}px`,
              overflow: 'auto',
            }}
          >
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(28),
                color: '#2D3436',
                mb: `${p(16)}px`,
              }}
            >
              Tracks
            </Typography>
            {album.tracks.map((item, index) => {
              const active = item.id === track?.id
              return (
                <ButtonBase
                  key={item.id}
                  onClick={() => {
                    setTrackIndex(index)
                    setPlaying(true)
                  }}
                  sx={{
                    width: '100%',
                    minHeight: p(72),
                    px: `${p(18)}px`,
                    mb: `${p(10)}px`,
                    borderRadius: `${p(16)}px`,
                    justifyContent: 'flex-start',
                    bgcolor: active ? 'rgba(0,180,160,0.12)' : 'transparent',
                    color: active ? '#00B4A0' : '#2D3436',
                    fontFamily: FIGMA_FONT,
                    fontWeight: active ? 700 : 500,
                    fontSize: p(28),
                    textAlign: 'left',
                    '&:active': { bgcolor: 'rgba(0,180,160,0.18)' },
                  }}
                >
                  {item.title}
                </ButtonBase>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}
