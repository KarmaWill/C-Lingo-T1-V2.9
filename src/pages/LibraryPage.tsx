import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale'
import { StudioHomeFrame, HubTopBar } from '../components/home/StudioHomeHeader'
import HubPagerDots from '../components/home/HubPagerDots'
import HubLangProfile from '../components/home/HubLangProfile'
import HubContainBoard from '../components/home/HubContainBoard'

/**
 * Figma 真源：设计稿 · 主界面1 (2725:331)
 * 底栏 Home Tab · 四圆点第 1 页 · Chinese Textbooks
 * 主区坐标对齐 Honor LearnHome `home-board` / `home-book`（1920 画布）。
 */

const BOARD_W = 1800
const BOARD_H = 770

const UNITS = [
  {
    label: 'Unit 1 You and I',
    lessonNo: 'Lesson 1',
    titleZh: '他是谁',
    objectives: ['Ask about someone’s name', 'Talk about hometown and phone number'],
  },
  {
    label: 'Unit 2 My Family',
    lessonNo: 'Lesson 2',
    titleZh: '这是我的家',
    objectives: ['Talk about family members', 'Ask how many people are in a family'],
  },
  {
    label: 'Unit 3 School Life',
    lessonNo: 'Lesson 3',
    titleZh: '我的学校',
    objectives: ['Talk about classrooms and classmates', 'Ask where someone studies'],
  },
]

export default function LibraryPage() {
  const navigate = useNavigate()
  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const [unitIndex, setUnitIndex] = useState(0)
  const unit = UNITS[unitIndex]

  const goPrev = () => setUnitIndex((i) => (i === 0 ? UNITS.length - 1 : i - 1))
  const goNext = () => setUnitIndex((i) => (i === UNITS.length - 1 ? 0 : i + 1))

  return (
    <StudioHomeFrame screenSize={screenSize}>
      <HubTopBar screenSize={screenSize}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: p(48),
              color: '#2D3436',
              lineHeight: `${p(72)}px`,
              fontFamily: FIGMA_FONT,
              whiteSpace: 'nowrap',
            }}
          >
            Chinese Textbooks
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${p(10)}px`,
              height: p(46),
              px: `${p(20)}px`,
              borderRadius: '101px',
              bgcolor: 'rgba(79, 70, 229, 0.06)',
              border: '1px solid #4F46E5',
              flexShrink: 0,
            }}
          >
            <Box sx={{ width: p(12), height: p(12), borderRadius: '50%', bgcolor: '#4F46E5' }} />
            <Typography
              sx={{
                fontSize: p(24),
                fontWeight: 400,
                lineHeight: 1.6,
                color: '#4F46E5',
                fontFamily: FIGMA_FONT,
              }}
            >
              OFFLINE
            </Typography>
          </Box>
        </Box>
        <HubLangProfile screenSize={screenSize} />
      </HubTopBar>

      <HubContainBoard width={BOARD_W} height={BOARD_H}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 6,
            width: 1270,
            height: 544,
            borderRadius: '50px',
            overflow: 'hidden',
            bgcolor: '#2D3436',
          }}
        >
          <Box
            component="img"
            src="/images/library-hero-greeting.png"
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 38%',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: [
                'linear-gradient(90deg, rgba(15,23,42,0.56) 0%, rgba(15,23,42,0.24) 48%, rgba(15,23,42,0.38) 100%)',
                'linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.42) 100%)',
              ].join(', '),
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              top: 44,
              left: 42,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              height: 110,
              width: 400,
              px: '16px',
              borderRadius: '30px',
              bgcolor: 'rgba(255,255,255,0.8)',
            }}
          >
            <ButtonBase
              onClick={goPrev}
              aria-label="Previous unit"
              sx={{ width: 60, height: 60, borderRadius: '50%', opacity: 0.4 }}
            >
              <Box
                component="img"
                src="/images/hub/unit-arrow-left.svg"
                alt=""
                sx={{ width: 30, height: 30 }}
              />
            </ButtonBase>
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center', fontFamily: FIGMA_FONT }}>
              <Typography sx={{ fontSize: 24, fontWeight: 400, color: '#636E72', lineHeight: '32px' }}>
                Current Unit
              </Typography>
              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 500,
                  color: '#2D3436',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {unit.label}
              </Typography>
            </Box>
            <ButtonBase
              onClick={goNext}
              aria-label="Next unit"
              sx={{ width: 60, height: 60, borderRadius: '50%' }}
            >
              <Box
                component="img"
                src="/images/hub/unit-arrow-right.svg"
                alt=""
                sx={{ width: 30, height: 30 }}
              />
            </ButtonBase>
          </Box>

          <Typography
            component="h2"
            sx={{
              position: 'absolute',
              top: 264,
              left: 72,
              zIndex: 2,
              m: 0,
              maxWidth: 720,
              color: '#fff',
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.2,
              fontFamily: FIGMA_FONT,
            }}
          >
            {unit.lessonNo}: {unit.titleZh}
          </Typography>
          <Box
            component="ul"
            sx={{
              position: 'absolute',
              top: 330,
              left: 72,
              zIndex: 2,
              m: 0,
              width: 430,
              pl: '36px',
              color: '#fff',
              fontSize: 24,
              lineHeight: 1.35,
              fontFamily: FIGMA_FONT,
            }}
          >
            {unit.objectives.map((line) => (
              <Box component="li" key={line} sx={{ mb: '4px' }}>
                {line}
              </Box>
            ))}
          </Box>

          <ButtonBase
            onClick={() => navigate('/starting-learning', { state: { from: '/Home' } })}
            aria-label="Starting Learning"
            sx={{
              position: 'absolute',
              top: 358,
              left: 936,
              zIndex: 3,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 388,
              height: 100,
              pl: '40px',
              pr: '14px',
              borderRadius: '71px',
              color: '#fff',
              bgcolor: 'rgba(15, 23, 42, 0.62)',
              border: '1px solid rgba(255,255,255,0.32)',
              backdropFilter: 'blur(22px) saturate(160%)',
              WebkitBackdropFilter: 'blur(22px) saturate(160%)',
              boxShadow: '0 18px 40px rgba(15,23,42,0.36), inset 0 1px 0 rgba(255,255,255,0.28)',
              fontFamily: FIGMA_FONT,
              transform: 'translateX(-50%)',
              '&:active': { transform: 'translateX(-50%) scale(0.97)' },
              '&:focus-visible': {
                outline: '3px solid #2DD4BF',
                outlineOffset: 4,
              },
              '@media (prefers-reduced-transparency: reduce)': {
                bgcolor: '#1F2937',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              Start
            </Box>
            <Box
              aria-hidden
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(145deg, #2DD4BF 0%, #14B8A6 48%, #0D9488 100%)',
                boxShadow: '0 8px 20px rgba(20,184,166,0.42)',
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
          </ButtonBase>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 1310,
            width: 490,
            height: 770,
            p: '20px',
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRadius: '60px',
            boxShadow: '0px 4px 20px rgba(213,213,213,0.6)',
            fontFamily: FIGMA_FONT,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 450,
              height: 626,
              overflow: 'hidden',
              borderRadius: '40px',
            }}
          >
            <Box
              component="img"
              src="/images/happy-chinese-vol1-cover.png"
              alt="Happy Chinese Volume 1"
              sx={{
                display: 'block',
                width: 450,
                height: 626,
                objectFit: 'cover',
                borderRadius: '40px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                left: 0,
                height: 146,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6))',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 286,
                left: 0,
                width: 168,
                py: '12px',
                pl: '16px',
                pr: '12px',
                borderRadius: '0 16px 16px 0',
                bgcolor: 'rgba(0,0,0,0.4)',
                color: '#fff',
                fontSize: 24,
                lineHeight: 1.35,
                fontFamily: FIGMA_FONT,
              }}
            >
              Happy Chinese
              <Box component="span" sx={{ display: 'block' }}>
                Volume 1
              </Box>
            </Box>
            <Typography
              sx={{
                position: 'absolute',
                bottom: 76,
                left: 0,
                width: '100%',
                m: 0,
                color: '#fff',
                fontSize: 28,
                fontWeight: 400,
                textAlign: 'center',
                fontFamily: FIGMA_FONT,
              }}
            >
              59/198 Pages
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                bottom: 52,
                left: 36,
                width: 378,
                height: 6,
                borderRadius: '68px',
                bgcolor: 'rgba(255,255,255,0.28)',
              }}
            >
              <Box sx={{ width: 115, height: 6, borderRadius: '68px', bgcolor: '#00B4A0' }} />
            </Box>
          </Box>
          <ButtonBase
            onClick={() => navigate('/library/select-books')}
            sx={{
              position: 'absolute',
              top: 668,
              left: '50%',
              height: 80,
              px: '40px',
              borderRadius: '100px',
              bgcolor: '#00B4A0',
              color: '#fff',
              fontSize: 32,
              fontWeight: 500,
              fontFamily: FIGMA_FONT,
              whiteSpace: 'nowrap',
              transform: 'translateX(-50%)',
              '&:active': { transform: 'translateX(-50%) scale(0.97)' },
            }}
          >
            Choose a Book
          </ButtonBase>
        </Box>

        <TextbookToolCard
          left={0}
          bgcolor="#FF6B35"
          iconSrc="/images/hub/fun-chinese.svg"
          iconSize={48}
          label="Fun Chinese"
          subtitle="Games & Activities"
          onClick={() => navigate('/library/hub/fun-chinese')}
        />
        <TextbookToolCard
          left={656}
          bgcolor="#00B4A0"
          iconSrc="/images/hub/culture.svg"
          iconSize={55}
          label="Culture"
          subtitle="Explore Traditions"
          onClick={() => navigate('/library/hub/culture')}
        />
      </HubContainBoard>

      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}

function TextbookToolCard({
  left,
  bgcolor,
  iconSrc,
  iconSize,
  label,
  subtitle,
  onClick,
}: {
  left: number
  bgcolor: string
  iconSrc: string
  iconSize: number
  label: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: 580,
        left,
        width: 614,
        height: 190,
        borderRadius: '50px',
        bgcolor,
        px: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontFamily: FIGMA_FONT,
        textAlign: 'left',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box
            component="img"
            src={iconSrc}
            alt=""
            sx={{ width: iconSize, height: iconSize, flexShrink: 0 }}
          />
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 44,
              lineHeight: '66px',
              fontFamily: FIGMA_FONT,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 500,
            fontSize: 28,
            lineHeight: '42px',
            fontFamily: FIGMA_FONT,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '40px',
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ArrowForwardRoundedIcon sx={{ fontSize: 40, color: '#fff' }} />
      </Box>
    </ButtonBase>
  )
}
