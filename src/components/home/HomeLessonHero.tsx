import { Box, Typography, ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { figmaPx, FIGMA_FONT } from '../../utils/figmaScale'

/** 主界面7 主课卡：稿上 Source Han Sans CN。Flex 会截走拉丁，标题对不上板。 */
const HERO_HAN_FONT =
  '"Source Han Sans CN", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'

function ClockIcon({ size }: { size: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4.4l2.8 1.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Box>
  )
}

interface HomeLessonHeroProps {
  screenSize: string
  from: string
  lessonId?: string
  imageSrc?: string
  imagePosition?: string
  eyebrow?: string
  title?: string
  wordCount?: number
  patternCount?: number
  wordLabel?: string
  patternLabel?: string
  durationLabel?: string
  masteryLabel?: string
  masteryValue?: number
  progressColor?: string
}

/** 三轨共用主课卡内部尺度；HSK / Business / C-Lingo 同一套比例 */
export default function HomeLessonHero({
  screenSize,
  from,
  lessonId = '1',
  imageSrc = '/images/c-lingo-hero.png',
  imagePosition = '42% center',
  eyebrow = 'CURRENT LEARNING',
  title = 'Lesson 1 | How many people in your family?',
  wordCount = 31,
  patternCount = 3,
  wordLabel = 'Words',
  patternLabel = 'Patterns',
  durationLabel = '15 MINS',
  masteryLabel = 'Unit Mastery',
  masteryValue = 65,
  progressColor = '#00B4A0',
}: HomeLessonHeroProps) {
  const navigate = useNavigate()
  const p = (n: number) => figmaPx(n, screenSize)

  const onStartLesson = () => {
    navigate(`/lesson/${lessonId}`, { state: { from } })
  }

  const pillSx = {
    display: 'flex',
    alignItems: 'center',
    height: p(64),
    px: `${p(28)}px`,
    borderRadius: `${p(24)}px`,
    bgcolor: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
    backdropFilter: 'blur(2px)',
    width: 'fit-content',
    color: '#fff',
    fontFamily: FIGMA_FONT,
  } as const

  return (
    <Box sx={{ minWidth: 0, minHeight: 0, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          borderRadius: `${p(61)}px`,
          overflow: 'hidden',
          isolation: 'isolate',
          bgcolor: '#D9D9D9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt=""
          width={1250}
          height={710}
          fetchPriority="high"
          sx={{
            position: 'absolute',
            left: '-0.3%',
            top: '-4%',
            width: '100.6%',
            height: '105.6%',
            objectFit: 'cover',
            objectPosition: imagePosition,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)',
            opacity: 0.6,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            px: `${p(50)}px`,
            pt: `${p(40)}px`,
            pb: `${p(32)}px`,
            fontFamily: HERO_HAN_FONT,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: `${p(14)}px`,
              flexShrink: 0,
            }}
          >
            <Box sx={{ ...pillSx, gap: `${p(20)}px` }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '0.2em' }}>
                <Typography
                  component="span"
                  sx={{ fontSize: p(28), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                >
                  {wordCount}
                </Typography>
                <Typography component="span" sx={{ fontSize: p(20), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                  {wordLabel}
                </Typography>
              </Box>
              <Box sx={{ width: p(3), height: p(22), bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 61 }} />
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '0.2em' }}>
                <Typography
                  component="span"
                  sx={{ fontSize: p(28), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                >
                  {patternCount}
                </Typography>
                <Typography component="span" sx={{ fontSize: p(20), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                  {patternLabel}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ ...pillSx, gap: `${p(8)}px` }}>
              <ClockIcon size={p(28)} />
              <Typography component="span" sx={{ fontSize: p(22), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                {durationLabel}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: p(16) }} />

          <Box sx={{ flexShrink: 0, minWidth: 0 }}>
            <Typography
              component="p"
              sx={{
                color: '#FDD83B',
                fontWeight: 500,
                fontSize: p(26),
                lineHeight: `${p(38)}px`,
                letterSpacing: '0.16em',
                mb: `${p(6)}px`,
                width: 'fit-content',
                fontFamily: 'inherit',
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: '#fff',
                fontSize: p(48),
                fontWeight: 700,
                lineHeight: `${p(62)}px`,
                mb: `${p(16)}px`,
                maxWidth: p(1130),
                minWidth: 0,
                fontFamily: 'inherit',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textWrap: 'balance',
              }}
            >
              {title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${p(28)}px`, minWidth: 0 }}>
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation()
                  onStartLesson()
                }}
                sx={{
                  width: p(320),
                  height: p(88),
                  borderRadius: `${p(24)}px`,
                  bgcolor: '#fff',
                  color: '#000',
                  fontSize: p(28),
                  fontWeight: 700,
                  lineHeight: `${p(42)}px`,
                  fontFamily: 'inherit',
                  flexShrink: 0,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 120ms ease-out',
                  '&:active': { transform: 'scale(0.97)' },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:active': { transform: 'none' },
                  },
                  '&:focus-visible': {
                    outline: '3px solid #FDD83B',
                    outlineOffset: 4,
                  },
                }}
              >
                Start Session
              </ButtonBase>

              <Box sx={{ flex: 1, minWidth: 0, pb: `${p(6)}px` }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#fff',
                    fontSize: p(24),
                    lineHeight: `${p(36)}px`,
                    fontWeight: 500,
                    mb: `${p(10)}px`,
                    fontFamily: 'inherit',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span>{masteryLabel}</span>
                  <span>{masteryValue}%</span>
                </Box>
                <Box
                  sx={{
                    height: p(12),
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: `${p(68)}px`,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${masteryValue}%`,
                      bgcolor: progressColor,
                      borderRadius: `${p(68)}px`,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
