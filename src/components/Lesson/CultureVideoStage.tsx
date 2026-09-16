/**
 * Culture Video Player — Figma culture-video-player (2508) + 菜单截图
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption'
import CheckIcon from '@mui/icons-material/Check'
import { HskPrepBackButton } from '../hsk/HskPrepBackButton'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../../utils/figmaScale'
import type { CultureVideo } from '../../types/lesson'

const FIGMA_W = 2508
const px = (n: number) => figmaPx((n * 1920) / FIGMA_W, APP_SCREEN_SIZE)

const POSTER = '/images/chinese-festivals-cover.jpg'
const DURATION = 22 * 60 + 45 // 22:45

const CHAPTERS = [
  { id: 'c1', label: '01 园林与城市', at: 0 },
  { id: 'c2', label: '02 借景与框景', at: 5 * 60 + 20 },
  { id: 'c3', label: '03 水系与日常生活', at: 11 * 60 + 45 },
  { id: 'c4', label: '04 今日苏州园林', at: 17 * 60 + 10 },
]

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]
const QUALITIES = ['720p', '1080p', '2k'] as const
const LANGS = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'th', label: 'ไทย' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'ar', label: 'العربية' },
] as const

type Panel = 'none' | 'chapters' | 'speed' | 'quality' | 'langs'

const CAPTIONS: Record<string, { zh: string; en: string }> = {
  default: {
    zh: '苏州园林把自然与生活融为一体。',
    en: 'Suzhou gardens bring nature and daily life together.',
  },
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`
}

function Pill({
  active,
  children,
  onClick,
  minWidth,
}: {
  active?: boolean
  children: ReactNode
  onClick: () => void
  minWidth?: number
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        height: px(62),
        minWidth: minWidth ? px(minWidth) : undefined,
        px: `${px(28)}px`,
        borderRadius: `${px(15)}px`,
        bgcolor: active ? 'rgba(0, 180, 160, 0.18)' : 'rgba(255, 255, 255, 0.12)',
        border: active ? '3px solid #00B4A0' : '3px solid transparent',
        color: active ? '#00B4A0' : '#FFFFFF',
        fontFamily: FIGMA_FONT,
        fontWeight: active ? 700 : 400,
        fontSize: px(24),
        lineHeight: `${px(30)}px`,
        gap: `${px(10)}px`,
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {children}
    </ButtonBase>
  )
}

function MenuShell({
  title,
  children,
  width,
}: {
  title?: string
  children: ReactNode
  width: number
}) {
  return (
    <Box
      sx={{
        width: px(width),
        bgcolor: 'rgba(12, 16, 20, 0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: `${px(20)}px`,
        p: `${px(20)}px`,
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {title ? (
        <Typography
          sx={{
            fontFamily: FIGMA_FONT,
            fontWeight: 700,
            fontSize: px(28),
            color: '#FFFFFF',
            mb: `${px(16)}px`,
            px: `${px(8)}px`,
          }}
        >
          {title}
        </Typography>
      ) : null}
      {children}
    </Box>
  )
}

interface Props {
  data: CultureVideo
  onBack: () => void
}

function parseYoutubeId(videoUrl: string): string | null {
  const raw = videoUrl.trim()
  if (/^[\w-]{11}$/.test(raw)) return raw
  const match = raw.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return match?.[1] ?? null
}

export default function CultureVideoStage({ data, onBack }: Props) {
  const youtubeId = parseYoutubeId(data.videoUrl)
  if (youtubeId) {
    return <YoutubeCulturePlayer youtubeId={youtubeId} title={data.title} onBack={onBack} />
  }
  return <MockCulturePlayer data={data} onBack={onBack} />
}

function YoutubeCulturePlayer({
  youtubeId,
  title,
  onBack,
}: {
  youtubeId: string
  title: string
  onBack: () => void
}) {
  const embedSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#000',
        userSelect: 'none',
      }}
    >
      <Box
        component="iframe"
        key={youtubeId}
        title={title}
        src={embedSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: px(78),
          top: px(52),
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          gap: `${px(27)}px`,
          pointerEvents: 'none',
        }}
      >
        <HskPrepBackButton
          onClick={onBack}
          sx={{
            pointerEvents: 'auto',
            width: px(104),
            height: px(104),
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '1.3px solid #E0E0DF',
            color: '#FFFFFF',
            '& .MuiSvgIcon-root': { fontSize: px(52), color: '#FFFFFF' },
            '&:active': { bgcolor: 'rgba(255,255,255,0.28)' },
          }}
        />
        <Box sx={{ pointerEvents: 'none' }}>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: px(40),
              lineHeight: `${px(52)}px`,
              color: '#FFFFFF',
              textShadow: '0 2px 12px rgba(0,0,0,0.55)',
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: px(28),
              lineHeight: `${px(36)}px`,
              color: '#F8F8FA',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Culture Video
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

function MockCulturePlayer({ data, onBack }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(8 * 60 + 12)
  const [speed, setSpeed] = useState(1)
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>('1080p')
  const [ccOn, setCcOn] = useState(true)
  const [langs, setLangs] = useState<string[]>(['zh', 'en'])
  const [panel, setPanel] = useState<Panel>('none')
  const [chapterId, setChapterId] = useState(CHAPTERS[1].id)
  const scrubRef = useRef<HTMLDivElement | null>(null)

  const title = data.title || 'Chinese Garden & Everyday Life'
  const episode = 'Culture Video · Episode 01'
  const caption = CAPTIONS.default

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setCurrentTime((t) => {
        const next = t + speed
        if (next >= DURATION) {
          setPlaying(false)
          return DURATION
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, speed])

  const progress = Math.min(1, currentTime / DURATION)
  const activeChapter =
    [...CHAPTERS].reverse().find((c) => currentTime >= c.at)?.id ?? CHAPTERS[0].id

  const toggleLang = (id: string) => {
    setLangs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const seekFromClientX = (clientX: number) => {
    const el = scrubRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setCurrentTime(ratio * DURATION)
  }

  const closePanels = () => setPanel('none')
  const openPanel = (next: Panel) => setPanel((cur) => (cur === next ? 'none' : next))

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#000',
        userSelect: 'none',
      }}
      onClick={() => {
        if (panel !== 'none') closePanels()
      }}
    >
      {/* Poster / frame */}
      <Box
        component="img"
        src={data.thumbnailUrl || POSTER}
        alt=""
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).src = POSTER
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 62%, rgba(3,7,11,0.94) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: px(232),
          background: 'linear-gradient(180deg, #262626 0%, rgba(102,102,102,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: 'absolute',
          left: px(78),
          top: px(52),
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          gap: `${px(27)}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <HskPrepBackButton
          onClick={onBack}
          sx={{
            width: px(104),
            height: px(104),
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '1.3px solid #E0E0DF',
            color: '#FFFFFF',
            '& .MuiSvgIcon-root': { fontSize: px(52), color: '#FFFFFF' },
            '&:active': { bgcolor: 'rgba(255,255,255,0.28)' },
          }}
        />
        <Box>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 700,
              fontSize: px(48),
              lineHeight: `${px(60)}px`,
              color: '#FFFFFF',
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: px(32),
              lineHeight: `${px(40)}px`,
              color: '#F8F8FA',
            }}
          >
            {episode}
          </Typography>
        </Box>
      </Box>

      {/* Center play */}
      {!playing && (
        <ButtonBase
          onClick={(e) => {
            e.stopPropagation()
            setPlaying(true)
            closePanels()
          }}
          aria-label="Play"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '44%',
            transform: 'translate(-50%, -50%)',
            width: px(170),
            height: px(170),
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.92)',
            zIndex: 4,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            '&:active': { transform: 'translate(-50%, -50%) scale(0.96)' },
          }}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: px(96), color: '#00B4A0', ml: `${px(6)}px` }} />
        </ButtonBase>
      )}

      {/* Captions */}
      {ccOn && langs.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: px(280),
            transform: 'translateX(-50%)',
            zIndex: 4,
            minWidth: px(720),
            maxWidth: '70%',
            px: `${px(36)}px`,
            py: `${px(18)}px`,
            bgcolor: 'rgba(5, 9, 12, 0.82)',
            borderRadius: `${px(16)}px`,
            textAlign: 'center',
          }}
        >
          {langs.includes('zh') && (
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: px(34),
                lineHeight: `${px(43)}px`,
                color: '#FFFFFF',
              }}
            >
              {caption.zh}
            </Typography>
          )}
          {langs.includes('en') && (
            <Typography
              sx={{
                mt: langs.includes('zh') ? `${px(6)}px` : 0,
                fontFamily: FIGMA_FONT,
                fontWeight: 400,
                fontSize: px(27),
                lineHeight: `${px(34)}px`,
                color: '#E7EDF0',
              }}
            >
              {caption.en}
            </Typography>
          )}
        </Box>
      )}

      {/* Bottom dock */}
      <Box
        sx={{
          position: 'absolute',
          left: px(48),
          right: px(48),
          bottom: px(48),
          zIndex: 6,
          bgcolor: 'rgba(7, 12, 16, 0.76)',
          borderRadius: `${px(28)}px`,
          px: `${px(34)}px`,
          pt: `${px(28)}px`,
          pb: `${px(24)}px`,
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber */}
        <Box
          ref={scrubRef}
          onClick={(e) => seekFromClientX(e.clientX)}
          sx={{
            position: 'relative',
            height: px(28),
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mb: `${px(18)}px`,
            touchAction: 'none',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: px(10),
              borderRadius: 99,
              bgcolor: 'rgba(111, 122, 126, 0.5)',
              overflow: 'visible',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress * 100}%`,
                bgcolor: '#00B4A0',
                borderRadius: 99,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: `${progress * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: px(28),
                height: px(28),
                borderRadius: '50%',
                bgcolor: '#20D6C8',
                boxShadow: '0 0 0 6px rgba(32,214,200,0.25)',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${px(24)}px` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${px(18)}px` }}>
            <ButtonBase
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? 'Pause' : 'Play'}
              sx={{
                width: px(66),
                height: px(66),
                borderRadius: '50%',
                bgcolor: '#00B4A0',
                color: '#FFFFFF',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              {playing ? (
                <PauseRoundedIcon sx={{ fontSize: px(36) }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: px(36), ml: `${px(2)}px` }} />
              )}
            </ButtonBase>
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: px(25),
                lineHeight: `${px(31)}px`,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              {`${formatTime(currentTime)} / ${formatTime(DURATION)}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${px(18)}px`, position: 'relative' }}>
            <Pill active={panel === 'chapters'} onClick={() => openPanel('chapters')} minWidth={62}>
              <FormatListBulletedIcon sx={{ fontSize: px(40) }} />
            </Pill>
            <Pill active={panel === 'speed'} onClick={() => openPanel('speed')} minWidth={152}>
              {speed === 1 ? '1×' : `${speed}x`}
            </Pill>
            <Pill active={panel === 'quality'} onClick={() => openPanel('quality')} minWidth={190}>
              {quality}
            </Pill>
            <Pill active={panel === 'langs'} onClick={() => openPanel('langs')} minWidth={128}>
              <ClosedCaptionIcon sx={{ fontSize: px(30) }} />
              <Box component="span">{langs.length}</Box>
            </Pill>
            <Pill
              active={ccOn}
              onClick={() => setCcOn((v) => !v)}
              minWidth={196}
            >
              {ccOn ? 'CC On' : 'CC Off'}
            </Pill>

            {/* Floating menus anchored above pills */}
            {panel === 'chapters' && (
              <Box sx={{ position: 'absolute', right: 0, bottom: `calc(100% + ${px(16)}px)` }}>
                <MenuShell title="视频目录" width={520}>
                  {CHAPTERS.map((ch) => {
                    const selected = (chapterId || activeChapter) === ch.id
                    return (
                      <ButtonBase
                        key={ch.id}
                        onClick={() => {
                          setChapterId(ch.id)
                          setCurrentTime(ch.at)
                          setPlaying(true)
                          closePanels()
                        }}
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          px: `${px(20)}px`,
                          py: `${px(18)}px`,
                          mb: `${px(8)}px`,
                          borderRadius: `${px(14)}px`,
                          bgcolor: selected ? 'rgba(0,180,160,0.22)' : 'transparent',
                          color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
                          fontFamily: FIGMA_FONT,
                          fontWeight: 600,
                          fontSize: px(26),
                          textAlign: 'left',
                        }}
                      >
                        {`${ch.label} · ${formatTime(ch.at)}`}
                      </ButtonBase>
                    )
                  })}
                </MenuShell>
              </Box>
            )}

            {panel === 'speed' && (
              <Box sx={{ position: 'absolute', right: px(220), bottom: `calc(100% + ${px(16)}px)` }}>
                <MenuShell width={220}>
                  {SPEEDS.map((s) => (
                    <ButtonBase
                      key={s}
                      onClick={() => {
                        setSpeed(s)
                        closePanels()
                      }}
                      sx={{
                        width: '100%',
                        height: px(64),
                        mb: `${px(10)}px`,
                        borderRadius: `${px(16)}px`,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: speed === s ? '2px solid #00B4A0' : '2px solid transparent',
                        color: speed === s ? '#00B4A0' : '#FFFFFF',
                        fontFamily: FIGMA_FONT,
                        fontWeight: 600,
                        fontSize: px(26),
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      {s === 1 ? '1x' : `${s}x`}
                    </ButtonBase>
                  ))}
                </MenuShell>
              </Box>
            )}

            {panel === 'quality' && (
              <Box sx={{ position: 'absolute', right: px(120), bottom: `calc(100% + ${px(16)}px)` }}>
                <MenuShell width={220}>
                  {QUALITIES.map((q) => (
                    <ButtonBase
                      key={q}
                      onClick={() => {
                        setQuality(q)
                        closePanels()
                      }}
                      sx={{
                        width: '100%',
                        height: px(64),
                        mb: `${px(10)}px`,
                        borderRadius: `${px(16)}px`,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: quality === q ? '2px solid #00B4A0' : '2px solid transparent',
                        color: quality === q ? '#00B4A0' : '#FFFFFF',
                        fontFamily: FIGMA_FONT,
                        fontWeight: 600,
                        fontSize: px(26),
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      {q}
                    </ButtonBase>
                  ))}
                </MenuShell>
              </Box>
            )}

            {panel === 'langs' && (
              <Box sx={{ position: 'absolute', right: 0, bottom: `calc(100% + ${px(16)}px)` }}>
                <MenuShell width={560}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: `${px(12)}px ${px(16)}px`,
                    }}
                  >
                    {LANGS.map((lang) => {
                      const on = langs.includes(lang.id)
                      return (
                        <ButtonBase
                          key={lang.id}
                          onClick={() => toggleLang(lang.id)}
                          sx={{
                            justifyContent: 'flex-start',
                            gap: `${px(14)}px`,
                            px: `${px(12)}px`,
                            py: `${px(12)}px`,
                            borderRadius: `${px(12)}px`,
                            color: '#FFFFFF',
                            fontFamily: FIGMA_FONT,
                            fontWeight: 500,
                            fontSize: px(24),
                          }}
                        >
                          <Box
                            sx={{
                              width: px(32),
                              height: px(32),
                              borderRadius: `${px(6)}px`,
                              border: on ? 'none' : '2px solid rgba(255,255,255,0.45)',
                              bgcolor: on ? '#00B4A0' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {on ? <CheckIcon sx={{ fontSize: px(22), color: '#FFFFFF' }} /> : null}
                          </Box>
                          {lang.label}
                        </ButtonBase>
                      )
                    })}
                  </Box>
                </MenuShell>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
