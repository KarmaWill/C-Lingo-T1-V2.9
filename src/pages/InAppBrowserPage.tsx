import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, ButtonBase, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { CatalogAppGlyph } from '../components/apps/catalogAppIcons'
import {
  EXPLORE_PROMO_POSTER,
  EXPLORE_PROMO_TITLE,
  EXPLORE_PROMO_YOUTUBE_ID,
  EXPLORE_PROMO_YOUTUBE_URL,
} from '../components/home/hubChrome'
import { EXTERNAL_APP_URLS, getInAppBrowserTarget, type InAppBrowserTarget } from '../data/appsCatalog'
import {
  isClingoBookmarked,
  isClingoYoutubeSubscribed,
  setClingoBookmarked,
  setClingoYoutubeSubscribed,
} from '../data/inAppBrowserGate'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'
import { resolveBackPath } from '../utils/navigateBack'

type BrowserState = {
  appId?: string
  from?: string
}

const CLINGO_HOME = EXTERNAL_APP_URLS.chrome
const CLINGO_CHANNEL = EXTERNAL_APP_URLS.youtube

const OTHER_CHANNELS: { id: string; label: string; handle: string; videoId: string }[] = [
  { id: 'duolingo', label: 'Duolingo', handle: '@duolingo', videoId: 'fB8TyLTD7EE' },
  { id: 'google', label: 'Google', handle: '@Google', videoId: 'nOw_ENn5vW0' },
  { id: 'ted-ed', label: 'TED-Ed', handle: '@TEDEd', videoId: 'RLykC1VLBz8' },
]

function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function normalizeBrowseUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
}

function GateBanner({
  p,
  message,
}: {
  p: (n: number) => number
  message: string
}) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        px: `${p(28)}px`,
        py: `${p(14)}px`,
        bgcolor: '#FFF7EC',
        borderBottom: '1px solid #F3D9B8',
        display: 'flex',
        alignItems: 'center',
        gap: `${p(12)}px`,
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: p(28), color: '#C27803' }} />
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontWeight: 600,
          fontSize: p(22),
          lineHeight: 1.35,
          color: '#8A5A12',
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}

function YoutubeChannelPane({
  p,
  subscribed,
  onSubscribe,
}: {
  p: (n: number) => number
  subscribed: boolean
  onSubscribe: () => void
}) {
  const [activeId, setActiveId] = useState<'clingo' | string>('clingo')
  const active =
    activeId === 'clingo'
      ? {
          label: 'C-Lingo AIOS',
          handle: '@C-LingoAIOS',
          videoId: EXPLORE_PROMO_YOUTUBE_ID,
          title: EXPLORE_PROMO_TITLE,
          poster: EXPLORE_PROMO_POSTER,
        }
      : (() => {
          const hit = OTHER_CHANNELS.find((c) => c.id === activeId) ?? OTHER_CHANNELS[0]
          return {
            label: hit.label,
            handle: hit.handle,
            videoId: hit.videoId,
            title: `${hit.label} · Featured`,
            poster: `https://i.ytimg.com/vi/${hit.videoId}/hqdefault.jpg`,
          }
        })()

  const embedSrc = `https://www.youtube.com/embed/${active.videoId}?rel=0&modestbranding=1&playsinline=1`

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
        bgcolor: '#0F0F0F',
        color: '#FFFFFF',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        sx={{
          px: `${p(36)}px`,
          pt: `${p(28)}px`,
          pb: `${p(20)}px`,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: `${p(20)}px`,
        }}
      >
        <Box
          sx={{
            width: p(88),
            height: p(88),
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            bgcolor: '#212121',
            border: '2px solid rgba(255,255,255,0.12)',
          }}
        >
          <Box
            component="img"
            src={active.poster}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: p(32), lineHeight: 1.2 }}>{active.label}</Typography>
          <Typography sx={{ mt: `${p(6)}px`, fontSize: p(20), color: 'rgba(255,255,255,0.62)' }}>
            {active.handle} · {activeId === 'clingo' ? 'Official channel' : 'Unlocked channel'}
          </Typography>
        </Box>
        {activeId === 'clingo' ? (
          <ButtonBase
            onClick={onSubscribe}
            disabled={subscribed}
            sx={{
              flexShrink: 0,
              px: `${p(28)}px`,
              height: p(56),
              borderRadius: 999,
              bgcolor: subscribed ? 'rgba(255,255,255,0.14)' : '#FFFFFF',
              color: subscribed ? 'rgba(255,255,255,0.82)' : '#0F0F0F',
              fontWeight: 700,
              fontSize: p(22),
              fontFamily: FIGMA_FONT,
              '&:disabled': { opacity: 1 },
            }}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </ButtonBase>
        ) : null}
      </Box>

      <Box sx={{ px: `${p(36)}px`, pt: `${p(22)}px`, display: 'flex', gap: `${p(12)}px`, flexWrap: 'wrap' }}>
        <ButtonBase
          onClick={() => setActiveId('clingo')}
          sx={{
            px: `${p(20)}px`,
            height: p(48),
            borderRadius: 999,
            bgcolor: activeId === 'clingo' ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
            color: activeId === 'clingo' ? '#0F0F0F' : '#FFFFFF',
            fontWeight: 700,
            fontSize: p(18),
            fontFamily: FIGMA_FONT,
          }}
        >
          C-Lingo AIOS
        </ButtonBase>
        {OTHER_CHANNELS.map((channel) => {
          const locked = !subscribed
          return (
            <ButtonBase
              key={channel.id}
              onClick={() => {
                if (locked) return
                setActiveId(channel.id)
              }}
              sx={{
                px: `${p(20)}px`,
                height: p(48),
                borderRadius: 999,
                bgcolor: activeId === channel.id ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                color: activeId === channel.id ? '#0F0F0F' : locked ? 'rgba(255,255,255,0.38)' : '#FFFFFF',
                fontWeight: 700,
                fontSize: p(18),
                fontFamily: FIGMA_FONT,
                gap: `${p(8)}px`,
                opacity: locked ? 0.72 : 1,
              }}
            >
              {locked ? <LockOutlinedIcon sx={{ fontSize: p(20) }} /> : null}
              {channel.label}
            </ButtonBase>
          )
        })}
      </Box>

      <Box sx={{ px: `${p(36)}px`, py: `${p(28)}px` }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: `${p(18)}px`,
            overflow: 'hidden',
            bgcolor: '#000',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
          }}
        >
          <Box
            component="iframe"
            title={active.title}
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
            }}
          />
        </Box>
        <Typography sx={{ mt: `${p(22)}px`, fontWeight: 700, fontSize: p(28), lineHeight: 1.3 }}>
          {active.title}
        </Typography>
        <Typography sx={{ mt: `${p(10)}px`, fontSize: p(20), color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>
          {activeId === 'clingo'
            ? `Watching inside C-LingoAIOS · Channel ${EXPLORE_PROMO_YOUTUBE_URL}`
            : `Unlocked after Subscribe · ${CLINGO_CHANNEL}`}
        </Typography>
      </Box>
    </Box>
  )
}

export default function InAppBrowserPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const state = (location.state || {}) as BrowserState

  const target: InAppBrowserTarget | null = useMemo(() => {
    if (state.appId) return getInAppBrowserTarget(state.appId)
    return null
  }, [state.appId])

  const [bookmarked, setBookmarked] = useState(() => isClingoBookmarked())
  const [subscribed, setSubscribed] = useState(() => isClingoYoutubeSubscribed())
  const [browseUrl, setBrowseUrl] = useState(CLINGO_HOME)
  const [addressDraft, setAddressDraft] = useState(CLINGO_HOME)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    if (!target || target.appId !== 'chrome') return
    setBrowseUrl(CLINGO_HOME)
    setAddressDraft(CLINGO_HOME)
    setAddressError(null)
  }, [target])

  if (!target) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', bgcolor: '#F8F9F8' }}>
        <ButtonBase
          onClick={() => navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })}
          sx={{ px: 3, py: 1.5, borderRadius: 999, bgcolor: '#111827', color: '#fff', fontWeight: 700 }}
        >
          Back to Explore
        </ButtonBase>
      </Box>
    )
  }

  const isChrome = target.appId === 'chrome'
  const isYoutube = target.appId === 'youtube'
  const chromeLocked = isChrome && !bookmarked
  const youtubeLocked = isYoutube && !subscribed
  const showingClingoHome = isChrome && browseUrl === CLINGO_HOME

  const commitAddress = (raw: string) => {
    if (chromeLocked) {
      setAddressDraft(CLINGO_HOME)
      setAddressError('Bookmark C-Lingo first to browse other sites.')
      return
    }
    const next = normalizeBrowseUrl(raw)
    if (!next) {
      setAddressError('Enter a valid https URL.')
      return
    }
    setAddressError(null)
    setBrowseUrl(next)
    setAddressDraft(next)
  }

  const onAddressSubmit = (event: FormEvent) => {
    event.preventDefault()
    commitAddress(addressDraft)
  }

  const onAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitAddress(addressDraft)
    }
  }

  const handleBookmark = () => {
    setClingoBookmarked(true)
    setBookmarked(true)
    setAddressError(null)
  }

  const handleSubscribe = () => {
    setClingoYoutubeSubscribed(true)
    setSubscribed(true)
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F1F3F4',
        fontFamily: FIGMA_FONT,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: p(120),
          px: `${p(28)}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(16)}px`,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E0E0DF',
          boxSizing: 'border-box',
        }}
      >
        <HskPrepBackButton
          onClick={() => navigate(resolveBackPath(location, { defaultPath: '/apps' }), { replace: true })}
          sx={{
            width: p(72),
            height: p(72),
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: p(36) },
          }}
        />

        <Box
          component={isChrome ? 'form' : 'div'}
          onSubmit={isChrome ? onAddressSubmit : undefined}
          sx={{
            flex: 1,
            minWidth: 0,
            height: p(64),
            borderRadius: 999,
            bgcolor: '#F1F3F4',
            border: addressError ? '1px solid #E57373' : '1px solid #E0E0DF',
            display: 'flex',
            alignItems: 'center',
            gap: `${p(12)}px`,
            px: `${p(20)}px`,
          }}
        >
          <Box
            sx={{
              width: p(36),
              height: p(36),
              borderRadius: `${p(10)}px`,
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(213,213,213,0.7)',
            }}
          >
            <CatalogAppGlyph id={target.appId} />
          </Box>
          <LockOutlinedIcon
            sx={{
              fontSize: p(22),
              color: chromeLocked || youtubeLocked ? '#C27803' : '#5F6368',
              flexShrink: 0,
            }}
          />
          {isChrome ? (
            <Box
              component="input"
              value={addressDraft}
              onChange={(event) => {
                setAddressDraft(event.target.value)
                setAddressError(null)
              }}
              onKeyDown={onAddressKeyDown}
              readOnly={chromeLocked}
              aria-label="Address bar"
              sx={{
                flex: 1,
                minWidth: 0,
                border: 0,
                outline: 'none',
                bgcolor: 'transparent',
                fontWeight: 600,
                fontSize: p(22),
                color: '#202124',
                fontFamily: FIGMA_FONT,
                cursor: chromeLocked ? 'default' : 'text',
              }}
            />
          ) : (
            <Typography
              noWrap
              sx={{
                flex: 1,
                minWidth: 0,
                fontWeight: 600,
                fontSize: p(22),
                color: '#202124',
                fontFamily: FIGMA_FONT,
              }}
            >
              {displayHost(target.url)}
            </Typography>
          )}
          {isChrome ? (
            <ButtonBase
              type="button"
              onClick={handleBookmark}
              disabled={bookmarked}
              aria-label={bookmarked ? 'C-Lingo bookmarked' : 'Bookmark C-Lingo'}
              sx={{
                flexShrink: 0,
                width: p(48),
                height: p(48),
                borderRadius: '50%',
                color: bookmarked ? '#F4B400' : showingClingoHome ? '#5F6368' : '#B0B3B8',
                '&:disabled': { opacity: 1 },
              }}
            >
              {bookmarked ? (
                <StarRoundedIcon sx={{ fontSize: p(32) }} />
              ) : (
                <StarBorderRoundedIcon sx={{ fontSize: p(32) }} />
              )}
            </ButtonBase>
          ) : (
            <Typography
              sx={{
                flexShrink: 0,
                fontSize: p(18),
                fontWeight: 700,
                color: '#5F6368',
              }}
            >
              {target.title}
            </Typography>
          )}
        </Box>
      </Box>

      {chromeLocked ? (
        <GateBanner p={p} message="Bookmark C-Lingo first — then you can browse other websites." />
      ) : null}
      {youtubeLocked ? (
        <GateBanner p={p} message="Subscribe to C-Lingo AIOS first — then you can watch other channels." />
      ) : null}
      {addressError ? (
        <Box sx={{ px: `${p(28)}px`, py: `${p(10)}px`, bgcolor: '#FDECEA', color: '#B71C1C', fontSize: p(20), fontWeight: 600 }}>
          {addressError}
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative', bgcolor: '#FFFFFF' }}>
        {target.mode === 'youtube-channel' ? (
          <YoutubeChannelPane p={p} subscribed={subscribed} onSubscribe={handleSubscribe} />
        ) : (
          <Box
            component="iframe"
            title={target.title}
            src={browseUrl}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
              bgcolor: '#FFFFFF',
            }}
          />
        )}
      </Box>
    </Box>
  )
}
