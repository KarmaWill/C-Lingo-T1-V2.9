import { Box, Typography } from '@mui/material'

const OPPO_FONT = '"OPPO Sans", "Helvetica Neue", Arial, sans-serif'

function SloganStarIcon({ gradientId }: { gradientId: string }) {
  return (
    <Box
      component="span"
      className="slogan-icon"
      aria-hidden
      sx={{
        display: 'inline-block',
        verticalAlign: '-0.1em',
        width: '0.82em',
        height: '0.82em',
        mx: '0.01em',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradientId} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F6C83A" />
            <stop offset="1" stopColor="#B9FF5A" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          d="M12 2C13.15 8.08 15.92 10.85 22 12C15.92 13.15 13.15 15.92 12 22C10.85 15.92 8.08 13.15 2 12C8.08 10.85 10.85 8.08 12 2Z"
        />
      </svg>
    </Box>
  )
}

function SloganGlobeIcon({ gradientId }: { gradientId: string }) {
  return (
    <Box
      component="span"
      className="slogan-icon"
      aria-hidden
      sx={{
        display: 'inline-block',
        verticalAlign: '-0.1em',
        width: '0.82em',
        height: '0.82em',
        mx: '0.01em',
      }}
    >
      <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradientId} x1="9" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7AE8A8" />
            <stop offset="0.55" stopColor="#B9FF5A" />
            <stop offset="1" stopColor="#F4D554" />
          </linearGradient>
        </defs>
        <g stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="20" />
          <path d="M24 4v40" />
          <path d="M5 24h38" />
          <path d="M13 8.4c5.8 2.7 16.2 2.7 22 0" />
          <path d="M13 39.6c5.8-2.7 16.2-2.7 22 0" />
          <path d="M18.5 5.8c-5.6 10.8-5.6 25.6 0 36.4" />
          <path d="M29.5 5.8c5.6 10.8 5.6 25.6 0 36.4" />
        </g>
      </svg>
    </Box>
  )
}

export default function ShellSloganHeadline() {
  return (
    <Box
      className="about-slogan-banner"
      sx={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '100%',
        textAlign: 'center',
      }}
    >
      <Box
        className="about-slogan-glow"
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(240px, 55vw)',
          height: 'min(240px, 55vw)',
          background:
            'radial-gradient(circle, rgba(185, 255, 90, 0.22) 0%, rgba(185, 255, 90, 0.08) 42%, transparent 72%)',
          filter: 'blur(24px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Typography
        component="p"
        className="about-slogan-headline"
        sx={{
          position: 'relative',
          zIndex: 1,
          m: 0,
          fontFamily: OPPO_FONT,
          fontSize: 'clamp(0.88rem, 1.85vw, 1.32rem)',
          fontWeight: 700,
          color: '#F7FFF6',
          lineHeight: 1.1,
          letterSpacing: '-0.8px',
          whiteSpace: 'nowrap',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
          userSelect: 'none',
          display: 'inline-block',
        }}
      >
        Bey
        <SloganStarIcon gradientId="shell-slogan-star-grad" />
        nd Language. To Bigger W
        <SloganGlobeIcon gradientId="shell-slogan-globe-grad" />
        rlds.
      </Typography>
    </Box>
  )
}
