import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, ButtonBase } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { APP_SCREEN_SIZE, figmaPx, FIGMA_FONT } from '../utils/figmaScale'
import { StudioHomeFrame, HubTopBar } from '../components/home/StudioHomeHeader'
import HubLangProfile from '../components/home/HubLangProfile'
import HubContainBoard from '../components/home/HubContainBoard'
import HubPagerDots from '../components/home/HubPagerDots'
import { HUB_CANVAS_CLINGO } from '../components/home/hubChrome'
import { getActiveLibraryBook, isHappyChineseBook } from '../library/libraryActiveBook'

/** Honor LearnHome Phosphor icons（regular / fill currentColor） */
function GameControllerIcon({ size = 40 }: { size?: number }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: 'block', flexShrink: 0, color: '#fff' }}
    >
      <path
        fill="currentColor"
        d="M176,112H152a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16ZM104,96H96V88a8,8,0,0,0-16,0v8H72a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16ZM241.48,200.65a36,36,0,0,1-54.94,4.81c-.12-.12-.24-.24-.35-.37L146.48,160h-37L69.81,205.09l-.35.37A36.08,36.08,0,0,1,44,216,36,36,0,0,1,8.56,173.75a.68.68,0,0,1,0-.14L24.93,89.52A59.88,59.88,0,0,1,83.89,40H172a60.08,60.08,0,0,1,59,49.25c0,.06,0,.12,0,.18l16.37,84.17a.68.68,0,0,1,0,.14A35.74,35.74,0,0,1,241.48,200.65ZM172,144a44,44,0,0,0,0-88H83.89A43.9,43.9,0,0,0,40.68,92.37l0,.13L24.3,176.59A20,20,0,0,0,58,194.3l41.92-47.59a8,8,0,0,1,6-2.71Zm59.7,32.59-8.74-45A60,60,0,0,1,172,160h-4.2L198,194.31a20.09,20.09,0,0,0,17.46,5.39,20,20,0,0,0,16.23-23.11Z"
      />
    </Box>
  )
}

function BankIcon({ size = 40 }: { size?: number }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: 'block', flexShrink: 0, color: '#fff' }}
    >
      <path
        fill="currentColor"
        d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z"
      />
    </Box>
  )
}

function StudentIcon({ size = 40 }: { size?: number }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: 'block', flexShrink: 0, color: '#fff' }}
    >
      <path
        fill="currentColor"
        d="M226.53,56.41l-96-32a8,8,0,0,0-5.06,0l-96,32A8,8,0,0,0,24,64v80a8,8,0,0,0,16,0V75.1L73.59,86.29a64,64,0,0,0,20.65,88.05c-18,7.06-33.56,19.83-44.94,37.29a8,8,0,1,0,13.4,8.74C77.77,197.25,101.57,184,128,184s50.23,13.25,65.3,36.37a8,8,0,0,0,13.4-8.74c-11.38-17.46-27-30.23-44.94-37.29a64,64,0,0,0,20.65-88l44.12-14.7a8,8,0,0,0,0-15.18ZM176,120A48,48,0,1,1,89.35,91.55l36.12,12a8,8,0,0,0,5.06,0l36.12-12A47.89,47.89,0,0,1,176,120ZM128,87.57,57.3,64,128,40.43,198.7,64Z"
      />
    </Box>
  )
}

/**
 * Figma 真源：设计稿 · 主界面1 (2725:331)
 * 底栏 Home Tab · Chinese Textbooks
 * 主区坐标对齐 Honor LearnHome `home-board` / `home-book`（1920 画布）。
 */

const BOARD_W = 1800
const BOARD_H = 774

/** 参考书立面 710×1024；封面 PNG 683×951 */
const BOOK_CARD_W = 511
const BOOK_CARD_H = Math.round((BOOK_CARD_W * 1024) / 710)
const COVER_RATIO = 683 / 951
const COVER_H = 586
const COVER_W = Math.round(COVER_H * COVER_RATIO)
const COVER_TOP = 22
const COVER_LEFT = 26
const PAGE_STEP = 9
const TOOL_ICON = 40

const UNITS = [
  {
    label: 'Unit 1 You and I',
    lessonNo: 'Lesson 1',
    titleZh: '他是谁',
    /** 对齐 Honor LearnHome `home-goals`：分条展示，不是一段正文 */
    objectives: [
      'Ask about someone’s name.',
      'Talk about someone’s hometown and his/her telephone number.',
    ],
  },
  {
    label: 'Unit 2 My Family',
    lessonNo: 'Lesson 2',
    titleZh: '这是我的家',
    objectives: ['Talk about family members.', 'Ask how many people are in a family.'],
  },
  {
    label: 'Unit 3 School Life',
    lessonNo: 'Lesson 3',
    titleZh: '我的学校',
    objectives: ['Talk about classrooms and classmates.', 'Ask where someone studies.'],
  },
]

export default function LibraryPage() {
  const navigate = useNavigate()
  const screenSize = APP_SCREEN_SIZE
  const p = (n: number) => figmaPx(n, screenSize)
  const [unitIndex, setUnitIndex] = useState(0)
  const [activeBook] = useState(() => getActiveLibraryBook())
  const unit = UNITS[unitIndex]
  const happyChinese = isHappyChineseBook(activeBook)

  const goPrev = () => setUnitIndex((i) => (i === 0 ? UNITS.length - 1 : i - 1))
  const goNext = () => setUnitIndex((i) => (i === UNITS.length - 1 ? 0 : i + 1))

  return (
    <StudioHomeFrame screenSize={screenSize} canvas={HUB_CANVAS_CLINGO}>
      <HubTopBar screenSize={screenSize}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(24)}px`, minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 500,
              fontSize: p(48),
              color: '#2D3436',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              fontFamily: FIGMA_FONT,
              fontOpticalSizing: 'auto',
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
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: '#636E72',
                  lineHeight: '34px',
                  fontFamily: FIGMA_FONT,
                  fontOpticalSizing: 'auto',
                }}
              >
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
                  fontFamily: FIGMA_FONT,
                  fontOpticalSizing: 'auto',
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
              top: 300,
              zIndex: 2,
              width: 520,
              fontFamily: FIGMA_FONT,
            }}
          >
            <Typography
              component="h2"
              sx={{
                m: 0,
                color: '#fff',
                fontSize: 42,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                fontFamily: FIGMA_FONT,
                fontOpticalSizing: 'auto',
              }}
            >
              {unit.lessonNo}: {unit.titleZh}
            </Typography>
            <Box
              component="ul"
              sx={{
                mt: '18px',
                mb: 0,
                width: '100%',
                pl: '36px',
                color: '#fff',
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.4,
                listStyle: 'disc',
                fontFamily: FIGMA_FONT,
                fontOpticalSizing: 'auto',
              }}
            >
              {unit.objectives.map((goal) => (
                <Box component="li" key={goal} sx={{ m: 0, pl: 0 }}>
                  {goal}
                </Box>
              ))}
            </Box>
          </Box>

          <ButtonBase
            onClick={() => navigate(`/library/read/${activeBook.id}`, { state: { from: '/Home' } })}
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
                fontFamily: FIGMA_FONT,
                fontOpticalSizing: 'auto',
                letterSpacing: '0.02em',
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
            left: BOARD_W - BOOK_CARD_W,
            width: BOOK_CARD_W,
            height: BOOK_CARD_H,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRadius: '54px',
            boxShadow: '0px 5px 26px rgba(213, 213, 213, 0.6)',
            fontFamily: FIGMA_FONT,
          }}
        >
          {(
            [
              { step: 4, bgcolor: '#00B4C0' },
              { step: 3, bgcolor: '#D7D7D7' },
              { step: 2, bgcolor: '#E6E6E6' },
              { step: 1, bgcolor: '#F4F4F4' },
            ] as const
          ).map((page) => (
            <Box
              key={page.step}
              aria-hidden
              sx={{
                position: 'absolute',
                left: COVER_LEFT + page.step * PAGE_STEP,
                top: COVER_TOP,
                width: COVER_W,
                height: COVER_H,
                bgcolor: page.bgcolor,
                borderRadius: '38px',
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              left: COVER_LEFT,
              top: COVER_TOP,
              width: COVER_W,
              height: COVER_H,
              borderRadius: '38px',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={activeBook.coverUrl}
              alt={activeBook.title}
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                bgcolor: '#F4F4F4',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 139,
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)',
                borderRadius: '0 0 38px 38px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 252,
                left: 0,
                width: 199,
                height: 94,
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
              {activeBook.badge[0]}
              <Box component="span" sx={{ display: 'block' }}>
                {activeBook.badge[1]}
              </Box>
            </Box>
            <Typography
              sx={{
                position: 'absolute',
                top: 533,
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
              {activeBook.currentPage}/{activeBook.totalPages}
            </Typography>
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 616,
              left: COVER_LEFT + 40,
              width: 125,
              height: 5,
              borderRadius: '54px',
              bgcolor: '#00B4A0',
            }}
          />
          <ButtonBase
            onClick={() => navigate('/library/select-books')}
            sx={{
              position: 'absolute',
              top: 641,
              left: '50%',
              width: 457,
              height: 78,
              borderRadius: '54px',
              bgcolor: '#FDB24F',
              color: '#fff',
              fontSize: 36,
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

        {happyChinese ? (
          <>
            <TextbookToolCard
              left={0}
              bgcolor="#00B4A0"
              icon={<GameControllerIcon size={TOOL_ICON} />}
              label="Fun Chinese"
              subtitle="Games and activities"
              onClick={() => navigate('/library/hub/fun-chinese')}
            />
            <TextbookToolCard
              left={638}
              bgcolor="#26D0A0"
              icon={<BankIcon size={TOOL_ICON} />}
              label="Culture"
              subtitle="Explore traditions"
              onClick={() => navigate('/library/hub/culture')}
            />
          </>
        ) : (
          <TextbookToolCard
            left={0}
            width={1239}
            radius={70}
            bgcolor="linear-gradient(90deg, #FF8457 19.23%, #FFB499 100%)"
            icon={<StudentIcon size={TOOL_ICON} />}
            label="HSK Chinese"
            subtitle="Games & Activities"
            onClick={() => navigate('/library/hub/fun-chinese')}
          />
        )}
      </HubContainBoard>
      <HubPagerDots screenSize={screenSize} />
    </StudioHomeFrame>
  )
}

function TextbookToolCard({
  left,
  width = 599,
  radius = 54,
  bgcolor,
  icon,
  label,
  subtitle,
  onClick,
}: {
  left: number
  width?: number
  radius?: number
  bgcolor: string
  icon: ReactNode
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
        width,
        height: 206,
        borderRadius: `${radius}px`,
        background: bgcolor,
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
      {/* 对齐 Honor `.home-tile-copy`：标题行含图标，副文案与图标左缘齐平，不缩进 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            fontSize: 43,
            fontWeight: 500,
            lineHeight: 1,
            color: '#fff',
            fontFamily: FIGMA_FONT,
            fontOpticalSizing: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              width: TOOL_ICON,
              height: TOOL_ICON,
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            component="span"
            sx={{
              color: 'inherit',
              fontWeight: 500,
              fontSize: 43,
              lineHeight: 1,
              fontFamily: FIGMA_FONT,
              fontOpticalSizing: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          component="em"
          sx={{
            display: 'block',
            mt: '8px',
            fontStyle: 'normal',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.2,
            fontFamily: FIGMA_FONT,
            fontOpticalSizing: 'auto',
            whiteSpace: 'nowrap',
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
        <Box
          component="img"
          src="/images/hub/card-arrow.svg"
          alt=""
          sx={{ width: 27, height: 26, transform: 'scaleX(-1)', display: 'block' }}
        />
      </Box>
    </ButtonBase>
  )
}
