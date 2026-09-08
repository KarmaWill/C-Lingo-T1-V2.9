import { Box, Typography, ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { figmaPx, FIGMA_FONT } from '../../utils/figmaScale'

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

/** Figma 主界面7 · 主课卡 1250×710 · radius 61 · 底渐变 0.6 */
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
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt=""
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

        {/* Badges — Figma 36/24 · 28 */}
        <Box
          sx={{
            position: 'absolute',
            top: p(50),
            left: p(50),
            display: 'flex',
            flexDirection: 'column',
            gap: `${p(35)}px`,
            zIndex: 3,
            fontFamily: FIGMA_FONT,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: `${p(28)}px`,
              height: p(84),
              px: `${p(40)}px`,
              borderRadius: `${p(30)}px`,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(2px)',
              width: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', color: '#fff' }}>
              <Typography sx={{ fontSize: p(36), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                {wordCount}
              </Typography>
              <Typography sx={{ fontSize: p(24), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                {wordLabel}
              </Typography>
            </Box>
            <Box sx={{ width: p(4), height: p(30), bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 61 }} />
            <Box sx={{ display: 'flex', alignItems: 'baseline', color: '#fff' }}>
              <Typography sx={{ fontSize: p(36), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                {patternCount}
              </Typography>
              <Typography sx={{ fontSize: p(24), fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>
                {patternLabel}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: `${p(9)}px`,
              height: p(84),
              px: `${p(36)}px`,
              borderRadius: `${p(30)}px`,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(2px)',
              width: 'fit-content',
              color: '#fff',
            }}
          >
            <Typography sx={{ fontSize: p(28), fontWeight: 700, fontFamily: 'inherit' }}>⏱</Typography>
            <Typography sx={{ fontSize: p(28), fontWeight: 700, fontFamily: 'inherit' }}>{durationLabel}</Typography>
          </Box>
        </Box>

        {/* Bottom copy + CTA */}
        <Box
          sx={{
            position: 'absolute',
            left: p(50),
            right: p(50),
            bottom: p(40),
            zIndex: 3,
            fontFamily: FIGMA_FONT,
          }}
        >
          <Typography
            sx={{
              color: '#FDD83B',
              fontWeight: 500,
              fontSize: p(28),
              letterSpacing: `${p(4.48)}px`,
              mb: `${p(12)}px`,
              fontFamily: 'inherit',
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              fontSize: p(60),
              fontWeight: 500,
              lineHeight: `${p(80)}px`,
              mb: `${p(24)}px`,
              maxWidth: p(1130),
              fontFamily: 'inherit',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${p(40)}px` }}>
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation()
                onStartLesson()
              }}
              sx={{
                width: p(400),
                height: p(120),
                borderRadius: `${p(30)}px`,
                bgcolor: '#fff',
                color: '#000',
                fontSize: p(36),
                fontWeight: 700,
                fontFamily: FIGMA_FONT,
                flexShrink: 0,
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              Start Session
            </ButtonBase>

            <Box sx={{ flex: 1, minWidth: 0, pb: `${p(8)}px` }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#fff',
                  fontSize: p(32),
                  fontWeight: 500,
                  mb: `${p(16)}px`,
                  fontFamily: FIGMA_FONT,
                }}
              >
                <span>{masteryLabel}</span>
                <span>{masteryValue}%</span>
              </Box>
              <Box
                sx={{
                  height: p(16),
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
  )
}
