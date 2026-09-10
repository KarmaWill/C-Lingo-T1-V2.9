import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale'
import { StudioHomeFrame, HubTopBar } from '../components/home/StudioHomeHeader'
import HubLangProfile from '../components/home/HubLangProfile'
import HubContainBoard from '../components/home/HubContainBoard'
import { HUB_CANVAS_CLINGO } from '../components/home/hubChrome'

/**
 * Figma 真源：设计稿 · 主界面1 (2725:331)
 * 底栏 Home Tab · Chinese Textbooks
 * 主区坐标对齐 Honor LearnHome `home-board` / `home-book`（1920 画布）。
 */

const BOARD_W = 1800
const BOARD_H = 774

const UNITS = [
  {
    label: 'Unit 1 You and I',
    lessonNo: 'Lesson 1',
    titleZh: '他是谁',
    objectives: [
      'Ask about someone’s name. Talk about someone’s hometown and his/her telephone number.',
    ],
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
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_CLINGO}>
      <HubTopBar screenSize={screenSize}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: p(47),
              color: '#2D3436',
              lineHeight: `${p(60)}px`,
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
              height: p(47),
              px: `${p(20)}px`,
              borderRadius: '999px',
              bgcolor: 'rgba(0, 180, 160, 0.1)',
              border: '1px solid #00B4A0',
              flexShrink: 0,
            }}
          >
            <Box sx={{ width: p(12), height: p(12), borderRadius: '50%', bgcolor: '#00B4A0' }} />
            <Typography
              sx={{
                fontSize: p(24),
                fontWeight: 400,
                lineHeight: 1.6,
                color: '#00B4A0',
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
            top: 0,
            width: 1239,
            height: 530,
            borderRadius: '54px',
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
              left: 0,
              top: '-8%',
              width: '100%',
              height: '111%',
              objectFit: 'cover',
              objectPosition: '46% 32%',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(270deg, rgba(0, 0, 0, 0) 34.25%, rgba(0, 0, 0, 0.9) 100%)',
              opacity: 0.8,
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
              px: '14px',
              gap: '24px',
              borderRadius: '31px',
              bgcolor: 'rgba(255,255,255,0.74)',
              border: '1px solid #FFFFFF',
              boxSizing: 'border-box',
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
              <Typography sx={{ fontSize: 28, fontWeight: 400, color: '#636E72', lineHeight: '34px' }}>
                Current Unit
              </Typography>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#2D3436',
                  lineHeight: '34px',
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

          <Box
            sx={{
              position: 'absolute',
              left: 46,
              top: 315,
              zIndex: 2,
              width: 430,
              fontFamily: FIGMA_FONT,
            }}
          >
            <Typography
              component="h2"
              sx={{
                m: 0,
                color: '#fff',
                fontSize: 32,
                fontWeight: 700,
                lineHeight: '47px',
                fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif',
              }}
            >
              {unit.lessonNo}:{unit.titleZh}
            </Typography>
            <Typography
              sx={{
                mt: '12px',
                color: '#fff',
                fontSize: 24,
                fontWeight: 400,
                lineHeight: '30px',
                textAlign: 'justify',
                fontFamily: FIGMA_FONT,
              }}
            >
              {unit.objectives.join(' ')}
            </Typography>
          </Box>

          <ButtonBase
            onClick={() => navigate('/starting-learning', { state: { from: '/Home' } })}
            aria-label="Starting Learning"
            sx={{
              position: 'absolute',
              top: 385,
              left: 960,
              zIndex: 3,
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: 231,
              height: 100,
              pl: '40px',
              pr: '12px',
              borderRadius: '71px',
              color: '#fff',
              bgcolor: 'rgba(100, 100, 100, 0.4)',
              border: '2px solid #00B1FF',
              fontFamily: FIGMA_FONT,
              '&:active': { transform: 'scale(0.97)' },
              '&:focus-visible': {
                outline: '3px solid #00B1FF',
                outlineOffset: 4,
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 37,
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif',
              }}
            >
              Start
            </Box>
            <Box
              aria-hidden
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(148.83deg, rgba(123, 255, 242, 0.9) 7.44%, rgba(62, 216, 248, 0.9) 40.08%, rgba(0, 177, 255, 0.9) 92.56%)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
          </ButtonBase>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 1289,
            width: 511,
            height: 758,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRadius: '54px',
            boxShadow: '0px 5px 26px rgba(213, 213, 213, 0.6)',
            fontFamily: FIGMA_FONT,
          }}
        >
          {/* Mask group 2508→1920：右错开书页 + 封面 */}
          {(
            [
              { left: 57, bgcolor: '#00B4C0' },
              { left: 46, bgcolor: '#D7D7D7' },
              { left: 37, bgcolor: '#E6E6E6' },
              { left: 28, bgcolor: '#F4F4F4' },
              { left: 18, bgcolor: '#FFFFFF' },
            ] as const
          ).map((page) => (
            <Box
              key={page.left}
              aria-hidden
              sx={{
                position: 'absolute',
                left: page.left,
                top: 23,
                width: 433,
                height: 603,
                bgcolor: page.bgcolor,
                borderRadius: '38px',
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              left: 9,
              top: 23,
              width: 433,
              height: 603,
              borderRadius: '38px',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src="/images/happy-chinese-vol1-cover.png"
              alt="Happy Chinese Volume 1"
              sx={{
                display: 'block',
                width: 433,
                height: 603,
                objectFit: 'cover',
                borderRadius: '38px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 143,
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)',
                borderRadius: '0 0 38px 38px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 259,
                left: 0,
                width: 205,
                height: 97,
                borderRadius: '0 54px 54px 0',
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pl: '13px',
                boxSizing: 'border-box',
                fontSize: 24,
                fontWeight: 400,
                lineHeight: 1.6,
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
                top: 549,
                left: 0,
                width: '100%',
                m: 0,
                color: '#fff',
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.6,
                textAlign: 'center',
                fontFamily: FIGMA_FONT,
              }}
            >
              59/198
            </Typography>
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 625,
              left: 58,
              width: 129,
              height: 5,
              borderRadius: '54px',
              bgcolor: '#00B4A0',
            }}
          />
          <ButtonBase
            onClick={() => navigate('/library/select-books')}
            sx={{
              position: 'absolute',
              top: 660,
              left: '50%',
              width: 470,
              height: 80,
              borderRadius: '54px',
              bgcolor: '#00B4C0',
              color: '#fff',
              fontSize: 37,
              fontWeight: 600,
              lineHeight: '46px',
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
          left={638}
          bgcolor="#26D0A0"
          iconSrc="/images/hub/culture.svg"
          iconSize={42}
          label="Culture"
          subtitle="Explore traditions"
          onClick={() => navigate('/library/hub/culture')}
        />
      </HubContainBoard>
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
        top: 568,
        left,
        width: 599,
        height: 206,
        borderRadius: '54px',
        bgcolor,
        px: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontFamily: FIGMA_FONT,
        textAlign: 'left',
        filter: 'drop-shadow(0px 4px 20px rgba(213, 213, 213, 0.6))',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box
            component="img"
            src={iconSrc}
            alt=""
            sx={{ width: iconSize, height: iconSize, flexShrink: 0 }}
          />
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 43,
              lineHeight: '54px',
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
            lineHeight: '34px',
            fontFamily: FIGMA_FONT,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 92,
          height: 92,
          borderRadius: '31px',
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ArrowForwardRoundedIcon sx={{ fontSize: 32, color: '#fff' }} />
      </Box>
    </ButtonBase>
  )
}
