import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded'
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded'
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'
import {
  FM_ALBUMS,
  FM_SHELVES,
  activeLyricIndex,
  albumTotalSec,
  getFmAlbum,
  type FmAlbum,
} from '../data/fmCatalog'

const BG = '#000000'
const INK = '#FFFFFF'
const MUTE = 'rgba(235,235,245,0.55)'
const LINE = 'rgba(255,255,255,0.12)'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatRemain(elapsed: number, duration: number) {
  if (!duration || !Number.isFinite(duration)) return '-0:00'
  const left = Math.max(0, duration - elapsed)
  return `-${formatTime(left)}`
}

export default function AIFMPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [album, setAlbum] = useState<FmAlbum | null>(null)
  const [phase, setPhase] = useState<'browse' | 'album' | 'player'>('browse')
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [clock, setClock] = useState({ t: 0, d: 0 })
  const [volume, setVolume] = useState(0.78)
  const [showZh, setShowZh] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [rightPane, setRightPane] = useState<'lyrics' | 'queue'>('lyrics')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const seekRef = useRef<HTMLDivElement | null>(null)
  const volRef = useRef<HTMLDivElement | null>(null)
  const lyricListRef = useRef<HTMLDivElement | null>(null)

  const track = album?.tracks[trackIndex] ?? null
  const lyrics = track?.lyrics ?? []
  const lyricIdx = useMemo(() => activeLyricIndex(lyrics, clock.t), [lyrics, clock.t])
  const inPlayer = phase === 'player' && Boolean(album && track)

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
    if (!inPlayer || !track || !album) return
    const prev = audioRef.current
    prev?.pause()
    const audio = new Audio(track.audio)
    audio.volume = volume
    audioRef.current = audio
    const onTime = () => setClock({ t: audio.currentTime, d: audio.duration || 0 })
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0
        void audio.play().catch(() => setPlaying(false))
        return
      }
      if (trackIndex < album.tracks.length - 1) {
        setTrackIndex((value) => value + 1)
        setPlaying(true)
      } else if (shuffle && album.tracks.length > 1) {
        setTrackIndex(Math.floor(Math.random() * album.tracks.length))
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
  }, [inPlayer, track?.id])

  useEffect(() => {
    if (!inPlayer) return
    const audio = audioRef.current
    if (!audio) return
    if (playing) void audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [playing, inPlayer])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (!inPlayer || lyricIdx < 0) return
    const root = lyricListRef.current
    if (!root) return
    const el = root.querySelector<HTMLElement>(`[data-lyric="${lyricIdx}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [lyricIdx, inPlayer])

  const goBack = () => {
    if (phase === 'player') {
      audioRef.current?.pause()
      setPlaying(false)
      setPhase('album')
      setRightPane('lyrics')
      return
    }
    if (phase === 'album') {
      audioRef.current?.pause()
      setPlaying(false)
      setAlbum(null)
      setPhase('browse')
      return
    }
    navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })
  }

  const openAlbum = (next: FmAlbum) => {
    setAlbum(next)
    setTrackIndex(0)
    setPlaying(false)
    setPhase('album')
    setRightPane('lyrics')
  }

  const startTrack = (index: number) => {
    if (!album) return
    setTrackIndex(index)
    setPhase('player')
    setPlaying(true)
    setRightPane('lyrics')
  }

  const playAlbumFromStart = () => {
    if (!album) return
    startTrack(shuffle ? Math.floor(Math.random() * album.tracks.length) : 0)
  }

  const playPrev = () => {
    if (!album) return
    if (clock.t > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0
      setClock((c) => ({ ...c, t: 0 }))
      return
    }
    setTrackIndex((value) => (value - 1 + album.tracks.length) % album.tracks.length)
    setPlaying(true)
  }

  const playNext = () => {
    if (!album) return
    if (shuffle && album.tracks.length > 1) {
      let next = Math.floor(Math.random() * album.tracks.length)
      if (next === trackIndex) next = (next + 1) % album.tracks.length
      setTrackIndex(next)
    } else {
      setTrackIndex((value) => (value + 1) % album.tracks.length)
    }
    setPlaying(true)
  }

  const seekFromEvent = (clientX: number) => {
    const el = seekRef.current
    const audio = audioRef.current
    if (!el || !audio || !clock.d) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * clock.d
    setClock({ t: audio.currentTime, d: clock.d })
  }

  const volumeFromEvent = (clientX: number) => {
    const el = volRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setVolume(ratio)
  }

  const cardW = p(280)
  const cardGap = p(28)
  const progress = clock.d > 0 ? Math.min(100, (clock.t / clock.d) * 100) : 0
  const cover = track?.cover || album?.cover || ''

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: INK,
        position: 'relative',
      }}
    >
      {phase === 'browse' || !album ? (
        <>
          <Box
            sx={{
              height: p(160),
              flexShrink: 0,
              bgcolor: 'rgba(0,0,0,0.92)',
              borderBottom: `1px solid ${LINE}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ position: 'absolute', left: p(60), top: '50%', transform: 'translateY(-50%)' }}>
              <HskPrepBackButton
                onClick={goBack}
                sx={{
                  width: p(80),
                  height: p(80),
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${LINE}`,
                  color: INK,
                  '&:active': { bgcolor: 'rgba(255,255,255,0.16)' },
                  '&:focus-visible': { outline: '3px solid #00B4A0', outlineOffset: 3 },
                  '& .MuiSvgIcon-root': { fontSize: p(40) },
                }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 800,
                fontSize: p(48),
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: INK,
              }}
            >
              AI FM
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              px: `${p(60)}px`,
              pt: `${p(28)}px`,
              pb: `${p(48)}px`,
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {FM_SHELVES.map((shelf) => (
              <Box key={shelf.id} sx={{ mb: `${p(52)}px` }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 800,
                    fontSize: p(44),
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    color: INK,
                    mb: `${p(22)}px`,
                  }}
                >
                  {shelf.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: `${cardGap}px`,
                    overflowX: 'auto',
                    mx: `-${p(60)}px`,
                    px: `${p(60)}px`,
                    pb: `${p(8)}px`,
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {shelf.albumIds.map((id) => {
                    const item = getFmAlbum(id)
                    if (!item) return null
                    return (
                      <ButtonBase
                        key={`${shelf.id}-${item.id}`}
                        onClick={() => openAlbum(item)}
                        sx={{
                          width: cardW,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          textAlign: 'left',
                          borderRadius: `${p(14)}px`,
                          WebkitTapHighlightColor: 'transparent',
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
                            borderRadius: `${p(14)}px`,
                            display: 'block',
                            bgcolor: '#1C1C1E',
                            boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
                          }}
                        />
                        <Typography
                          sx={{
                            mt: `${p(14)}px`,
                            fontFamily: FIGMA_FONT,
                            fontWeight: 600,
                            fontSize: p(24),
                            lineHeight: 1.25,
                            color: INK,
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
                            lineHeight: 1.25,
                            color: MUTE,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.artist}
                        </Typography>
                      </ButtonBase>
                    )
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      ) : phase === 'album' ? (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box
            sx={{
              height: p(120),
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              px: `${p(40)}px`,
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            <HskPrepBackButton
              onClick={goBack}
              sx={{
                width: p(72),
                height: p(72),
                bgcolor: 'rgba(255,255,255,0.1)',
                border: `1px solid ${LINE}`,
                color: INK,
                '&:active': { bgcolor: 'rgba(255,255,255,0.16)' },
                '& .MuiSvgIcon-root': { fontSize: p(36) },
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              px: `${p(60)}px`,
              pt: `${p(36)}px`,
              pb: `${p(48)}px`,
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `${p(420)}px minmax(0, 1fr)`,
                gap: `${p(40)}px`,
                alignItems: 'start',
                mb: `${p(40)}px`,
              }}
            >
              <Box
                component="img"
                src={album.cover}
                alt=""
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: `${p(18)}px`,
                  bgcolor: '#1C1C1E',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
                }}
              />
              <Box sx={{ minWidth: 0, pt: `${p(12)}px` }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 800,
                    fontSize: p(56),
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: INK,
                  }}
                >
                  {album.title}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(10)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 600,
                    fontSize: p(28),
                    color: INK,
                  }}
                >
                  {album.artist}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(8)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(22),
                    color: MUTE,
                  }}
                >
                  {album.genre} · {album.year}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(20)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(24),
                    lineHeight: 1.45,
                    color: 'rgba(235,235,245,0.72)',
                    maxWidth: p(720),
                  }}
                >
                  {album.blurb}
                </Typography>

                <Box
                  sx={{
                    mt: `${p(32)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${p(18)}px`,
                  }}
                >
                  <ButtonBase
                    onClick={() => {
                      setShuffle(true)
                      playAlbumFromStart()
                    }}
                    aria-label="Shuffle"
                    sx={{
                      width: p(72),
                      height: p(72),
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      border: `1px solid ${LINE}`,
                      color: INK,
                    }}
                  >
                    <ShuffleRoundedIcon sx={{ fontSize: p(32) }} />
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => {
                      setShuffle(false)
                      playAlbumFromStart()
                    }}
                    sx={{
                      height: p(72),
                      px: `${p(40)}px`,
                      borderRadius: 999,
                      bgcolor: INK,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${p(10)}px`,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 700,
                      fontSize: p(28),
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    <PlayArrowRoundedIcon sx={{ fontSize: p(36) }} />
                    Play
                  </ButtonBase>
                </Box>
              </Box>
            </Box>

            <Box sx={{ borderTop: `1px solid ${LINE}`, pt: `${p(12)}px` }}>
              {album.tracks.map((item, index) => (
                <ButtonBase
                  key={item.id}
                  onClick={() => startTrack(index)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${p(20)}px`,
                    px: `${p(12)}px`,
                    py: `${p(16)}px`,
                    borderRadius: `${p(14)}px`,
                    textAlign: 'left',
                    '&:active': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <Typography
                    sx={{
                      width: p(40),
                      fontFamily: FIGMA_FONT,
                      fontSize: p(24),
                      color: MUTE,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 600,
                        fontSize: p(28),
                        color: INK,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: `${p(2)}px`,
                        fontFamily: FIGMA_FONT,
                        fontSize: p(20),
                        color: MUTE,
                      }}
                    >
                      {album.artist}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontSize: p(22),
                      color: MUTE,
                      flexShrink: 0,
                      mr: `${p(8)}px`,
                    }}
                  >
                    {formatTime(item.durationSec)}
                  </Typography>
                  <MoreHorizIcon sx={{ fontSize: p(28), color: MUTE }} />
                </ButtonBase>
              ))}
            </Box>

            <Typography
              sx={{
                mt: `${p(36)}px`,
                fontFamily: FIGMA_FONT,
                fontSize: p(22),
                color: MUTE,
                lineHeight: 1.5,
              }}
            >
              {album.year}
              <br />
              {album.tracks.length} songs, {formatTime(albumTotalSec(album))}
              <br />
              ℗ {album.year} C-Lingo
            </Typography>

            <Typography
              sx={{
                mt: `${p(40)}px`,
                mb: `${p(18)}px`,
                fontFamily: FIGMA_FONT,
                fontWeight: 800,
                fontSize: p(32),
                color: INK,
              }}
            >
              More to Explore
            </Typography>
            <Box sx={{ display: 'flex', gap: `${p(20)}px`, overflowX: 'auto' }}>
              {FM_ALBUMS.filter((item) => item.id !== album.id).map((item) => (
                <ButtonBase
                  key={item.id}
                  onClick={() => openAlbum(item)}
                  sx={{
                    width: p(200),
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    textAlign: 'left',
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
                      borderRadius: `${p(12)}px`,
                      bgcolor: '#1C1C1E',
                    }}
                  />
                  <Typography
                    sx={{
                      mt: `${p(12)}px`,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 600,
                      fontSize: p(22),
                      color: INK,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Cover-driven ambient backdrop */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: '-12%',
              backgroundImage: `url(${cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(72px) saturate(1.35) brightness(0.55)',
              transform: 'scale(1.18)',
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 46%, rgba(0,0,0,0.42) 100%)',
            }}
          />

          <Box sx={{ position: 'absolute', left: p(40), top: p(36), zIndex: 5 }}>
            <HskPrepBackButton
              onClick={goBack}
              sx={{
                width: p(72),
                height: p(72),
                bgcolor: 'rgba(255,255,255,0.12)',
                border: `1px solid ${LINE}`,
                color: INK,
                backdropFilter: 'blur(16px)',
                '&:active': { bgcolor: 'rgba(255,255,255,0.18)' },
                '& .MuiSvgIcon-root': { fontSize: p(36) },
              }}
            />
          </Box>

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)',
              gap: `${p(40)}px`,
              px: `${p(72)}px`,
              pt: `${p(56)}px`,
              pb: `${p(40)}px`,
              boxSizing: 'border-box',
            }}
          >
            {/* Left: art + transport */}
            <Box
              sx={{
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(22)}px`,
                px: `${p(24)}px`,
              }}
            >
              <Box
                component="img"
                src={cover}
                alt=""
                sx={{
                  width: '100%',
                  maxWidth: p(620),
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: `${p(16)}px`,
                  bgcolor: '#1C1C1E',
                  boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
                }}
              />

              <Box sx={{ width: '100%', maxWidth: p(620) }}>
                <Typography
                  sx={{
                    fontFamily: FIGMA_FONT,
                    fontWeight: 700,
                    fontSize: p(34),
                    lineHeight: 1.2,
                    color: INK,
                  }}
                >
                  {track?.title}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(6)}px`,
                    fontFamily: FIGMA_FONT,
                    fontWeight: 400,
                    fontSize: p(24),
                    color: MUTE,
                  }}
                >
                  {album.artist}
                </Typography>
              </Box>

              <Box sx={{ width: '100%', maxWidth: p(620) }}>
                <Box
                  ref={seekRef}
                  onClick={(e) => seekFromEvent(e.clientX)}
                  onTouchStart={(e) => seekFromEvent(e.touches[0].clientX)}
                  sx={{
                    height: p(28),
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    touchAction: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: p(5),
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.22)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${progress}%`,
                        bgcolor: INK,
                        borderRadius: 99,
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: `${p(4)}px` }}>
                  <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(18), color: MUTE }}>
                    {formatTime(clock.t)}
                  </Typography>
                  <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(18), color: MUTE }}>
                    {formatRemain(clock.t, clock.d)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  maxWidth: p(620),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${p(18)}px`,
                }}
              >
                <ButtonBase
                  onClick={() => setShuffle((v) => !v)}
                  aria-label="Shuffle"
                  sx={{
                    width: p(56),
                    height: p(56),
                    borderRadius: '50%',
                    color: shuffle ? '#00B4A0' : INK,
                    opacity: shuffle ? 1 : 0.85,
                  }}
                >
                  <ShuffleRoundedIcon sx={{ fontSize: p(30) }} />
                </ButtonBase>
                <ButtonBase
                  onClick={playPrev}
                  aria-label="Previous"
                  sx={{ width: p(64), height: p(64), borderRadius: '50%', color: INK }}
                >
                  <SkipPreviousRoundedIcon sx={{ fontSize: p(48) }} />
                </ButtonBase>
                <ButtonBase
                  onClick={() => setPlaying((value) => !value)}
                  aria-label={playing ? 'Pause' : 'Play'}
                  sx={{
                    width: p(92),
                    height: p(92),
                    borderRadius: '50%',
                    color: INK,
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  {playing ? (
                    <PauseRoundedIcon sx={{ fontSize: p(72) }} />
                  ) : (
                    <PlayArrowRoundedIcon sx={{ fontSize: p(72) }} />
                  )}
                </ButtonBase>
                <ButtonBase
                  onClick={playNext}
                  aria-label="Next"
                  sx={{ width: p(64), height: p(64), borderRadius: '50%', color: INK }}
                >
                  <SkipNextRoundedIcon sx={{ fontSize: p(48) }} />
                </ButtonBase>
                <ButtonBase
                  onClick={() => setRepeat((v) => !v)}
                  aria-label="Repeat"
                  sx={{
                    width: p(56),
                    height: p(56),
                    borderRadius: '50%',
                    color: repeat ? '#00B4A0' : INK,
                    opacity: repeat ? 1 : 0.85,
                  }}
                >
                  <RepeatRoundedIcon sx={{ fontSize: p(30) }} />
                </ButtonBase>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  maxWidth: p(620),
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${p(14)}px`,
                }}
              >
                <VolumeDownRoundedIcon sx={{ fontSize: p(28), color: MUTE }} />
                <Box
                  ref={volRef}
                  onClick={(e) => volumeFromEvent(e.clientX)}
                  onTouchStart={(e) => volumeFromEvent(e.touches[0].clientX)}
                  sx={{
                    flex: 1,
                    height: p(28),
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    touchAction: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: p(5),
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.22)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.round(volume * 100)}%`,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        borderRadius: 99,
                      }}
                    />
                  </Box>
                </Box>
                <VolumeUpRoundedIcon sx={{ fontSize: p(28), color: MUTE }} />
              </Box>
            </Box>

            {/* Right: lyrics or queue */}
            <Box
              sx={{
                minWidth: 0,
                minHeight: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                pt: `${p(48)}px`,
                pb: `${p(24)}px`,
              }}
            >
              {rightPane === 'lyrics' ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: p(12),
                    right: p(8),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${p(14)}px`,
                    zIndex: 3,
                  }}
                >
                  <ButtonBase
                    aria-label="Sing along"
                    sx={{
                      width: p(64),
                      height: p(64),
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      border: `1px solid ${LINE}`,
                      color: INK,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <MicNoneRoundedIcon sx={{ fontSize: p(30) }} />
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => setShowZh((v) => !v)}
                    aria-label={showZh ? 'Hide Chinese' : 'Show Chinese'}
                    sx={{
                      width: p(64),
                      height: p(64),
                      borderRadius: '50%',
                      bgcolor: showZh ? 'rgba(0,180,160,0.28)' : 'rgba(255,255,255,0.12)',
                      border: `1px solid ${LINE}`,
                      color: INK,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <TranslateRoundedIcon sx={{ fontSize: p(30) }} />
                  </ButtonBase>
                </Box>
              ) : null}

              {rightPane === 'lyrics' ? (
                <Box
                  ref={lyricListRef}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    pr: `${p(88)}px`,
                    WebkitOverflowScrolling: 'touch',
                    maskImage:
                      'linear-gradient(180deg, transparent 0%, #000 10%, #000 86%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(180deg, transparent 0%, #000 10%, #000 86%, transparent 100%)',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  <Box sx={{ py: `${p(160)}px` }}>
                    {lyrics.map((line, index) => {
                      const active = index === lyricIdx
                      const dist = Math.abs(index - lyricIdx)
                      const opacity = active ? 1 : dist === 1 ? 0.42 : dist === 2 ? 0.24 : 0.14
                      const blur = active ? 0 : dist === 1 ? 0.6 : dist === 2 ? 1.4 : 2.2
                      return (
                        <Box
                          key={`${line.t}-${index}`}
                          data-lyric={index}
                          onClick={() => {
                            if (!audioRef.current) return
                            audioRef.current.currentTime = line.t
                            setClock((c) => ({ ...c, t: line.t }))
                            setPlaying(true)
                          }}
                          sx={{
                            mb: `${p(28)}px`,
                            cursor: 'pointer',
                            filter: blur ? `blur(${blur}px)` : 'none',
                            opacity,
                            transition: 'opacity 220ms ease, filter 220ms ease, transform 220ms ease',
                            transform: active ? 'scale(1)' : 'scale(0.98)',
                            transformOrigin: 'left center',
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: FIGMA_FONT,
                              fontWeight: active ? 800 : 600,
                              fontSize: active ? p(48) : p(40),
                              lineHeight: 1.25,
                              letterSpacing: '-0.02em',
                              color: INK,
                            }}
                          >
                            {line.text}
                          </Typography>
                          {showZh && line.textZh ? (
                            <Typography
                              sx={{
                                mt: `${p(8)}px`,
                                fontFamily: FIGMA_FONT,
                                fontWeight: 500,
                                fontSize: active ? p(28) : p(24),
                                lineHeight: 1.35,
                                color: MUTE,
                              }}
                            >
                              {line.textZh}
                            </Typography>
                          ) : null}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    pr: `${p(12)}px`,
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 800,
                      fontSize: p(40),
                      letterSpacing: '-0.02em',
                      color: INK,
                      mb: `${p(6)}px`,
                    }}
                  >
                    Playing Next
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(22),
                      color: MUTE,
                      mb: `${p(24)}px`,
                    }}
                  >
                    From {album.title}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${p(6)}px` }}>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: `${p(18)}px`,
                            px: `${p(14)}px`,
                            py: `${p(12)}px`,
                            borderRadius: `${p(16)}px`,
                            bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                            textAlign: 'left',
                            '&:active': { bgcolor: 'rgba(255,255,255,0.16)' },
                          }}
                        >
                          <Box
                            component="img"
                            src={item.cover}
                            alt=""
                            sx={{
                              width: p(64),
                              height: p(64),
                              borderRadius: `${p(8)}px`,
                              objectFit: 'cover',
                              flexShrink: 0,
                              bgcolor: '#1C1C1E',
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: FIGMA_FONT,
                                fontWeight: active ? 700 : 600,
                                fontSize: p(26),
                                color: INK,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              sx={{
                                mt: `${p(2)}px`,
                                fontFamily: FIGMA_FONT,
                                fontWeight: 400,
                                fontSize: p(20),
                                color: MUTE,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {album.artist}
                            </Typography>
                          </Box>
                          {active ? (
                            <Box
                              aria-hidden
                              sx={{
                                width: p(10),
                                height: p(10),
                                borderRadius: '50%',
                                bgcolor: '#00B4A0',
                                flexShrink: 0,
                              }}
                            />
                          ) : null}
                        </ButtonBase>
                      )
                    })}
                  </Box>

                  <Typography
                    sx={{
                      mt: `${p(40)}px`,
                      mb: `${p(18)}px`,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 800,
                      fontSize: p(32),
                      letterSpacing: '-0.02em',
                      color: INK,
                    }}
                  >
                    Recommended Albums
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: `${p(20)}px`,
                      overflowX: 'auto',
                      pb: `${p(8)}px`,
                      WebkitOverflowScrolling: 'touch',
                      '&::-webkit-scrollbar': { display: 'none' },
                    }}
                  >
                    {FM_ALBUMS.filter((item) => item.id !== album.id).map((item) => (
                      <ButtonBase
                        key={item.id}
                        onClick={() => openAlbum(item)}
                        sx={{
                          width: p(200),
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          textAlign: 'left',
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
                            borderRadius: `${p(12)}px`,
                            bgcolor: '#1C1C1E',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                          }}
                        />
                        <Typography
                          sx={{
                            mt: `${p(12)}px`,
                            fontFamily: FIGMA_FONT,
                            fontWeight: 600,
                            fontSize: p(22),
                            color: INK,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          sx={{
                            mt: `${p(2)}px`,
                            fontFamily: FIGMA_FONT,
                            fontWeight: 400,
                            fontSize: p(18),
                            color: MUTE,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.artist}
                        </Typography>
                      </ButtonBase>
                    ))}
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: `${p(18)}px`,
                  pt: `${p(8)}px`,
                }}
              >
                <ButtonBase
                  aria-label="Lyrics"
                  onClick={() => setRightPane('lyrics')}
                  sx={{
                    width: p(56),
                    height: p(56),
                    borderRadius: '50%',
                    color: rightPane === 'lyrics' ? INK : MUTE,
                  }}
                >
                  <FormatQuoteRoundedIcon sx={{ fontSize: p(32) }} />
                </ButtonBase>
                <ButtonBase
                  aria-label="Queue"
                  onClick={() => setRightPane('queue')}
                  sx={{
                    width: p(56),
                    height: p(56),
                    borderRadius: '50%',
                    color: rightPane === 'queue' ? INK : MUTE,
                  }}
                >
                  <QueueMusicRoundedIcon sx={{ fontSize: p(32) }} />
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
