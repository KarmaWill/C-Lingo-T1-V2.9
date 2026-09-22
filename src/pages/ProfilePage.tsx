import { useState } from 'react'
import { Avatar, Box, ButtonBase, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_FONT_FAMILY } from '../theme/appFont'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

type TabType = 'report' | 'device'

const TEAL = '#00B4A0'
const INK = '#2D3436'
const BLUE = '#2188FE'
const ORANGE = '#FF6B35'
const PAGE_BG = '#F8F9F8'

const WEEK_DAYS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'] as const
const BAR_HEIGHTS = [113, 167, 211, 0, 220, 266, 311]

function MaleIcon({ size }: { size: number }) {
  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-hidden
      sx={{ display: 'block' }}
    >
      <circle cx="11" cy="17" r="5.2" fill="none" stroke={BLUE} strokeWidth="2.4" />
      <path
        d="M15.2 12.6 L21.2 6.6"
        fill="none"
        stroke={BLUE}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M16.4 6.6 H21.2 V11.4"
        fill="none"
        stroke={BLUE}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  )
}

function ReportIcon({ active }: { active: boolean }) {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        width: p(54),
        height: p(54),
        borderRadius: `${p(16)}px`,
        background: active
          ? 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)'
          : '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: p(22),
          height: p(26),
          borderRadius: `${p(8)}px ${p(8)}px ${p(4)}px ${p(4)}px`,
          background: active
            ? 'linear-gradient(152.45deg, #1BE0CA 15.65%, #00B4A0 104.32%)'
            : 'linear-gradient(137.92deg, #FF936C 15.82%, #FF6B35 94.99%)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: p(10),
            height: p(10),
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            left: '50%',
            top: p(4),
            transform: 'translateX(-50%)',
          }}
        />
      </Box>
    </Box>
  )
}

function DeviceIcon() {
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        width: p(54),
        height: p(54),
        borderRadius: `${p(16)}px`,
        bgcolor: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{ position: 'relative', width: p(34), height: p(30) }}>
        <Box
          sx={{
            position: 'absolute',
            left: p(3),
            bottom: 0,
            width: p(28),
            height: p(13),
            bgcolor: 'rgba(255,110,58,0.4)',
            borderRadius: `${p(1.5)}px`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: p(4),
            width: p(34),
            height: p(24),
            borderRadius: `${p(5)}px`,
            background: 'linear-gradient(137.92deg, #FF936C 15.82%, #FF6B35 94.99%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: p(2),
            width: p(8),
            height: p(2),
            borderRadius: `${p(4)}px`,
            bgcolor: '#FFFFFF',
            transform: 'translateX(-50%)',
          }}
        />
      </Box>
    </Box>
  )
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string
  label: string
  color: string
}) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: p(250),
        borderRadius: `${p(40)}px`,
        bgcolor: color,
        border: color === BLUE ? '1.5px solid #E0E0DF' : 'none',
        px: `${p(60)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontWeight: 700,
          fontSize: p(56),
          lineHeight: 1.6,
          color: '#FFFFFF',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily: FIGMA_FONT,
          fontSize: p(28),
          lineHeight: 1.6,
          color: '#FFFFFF',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const initialTab = (location.state as { profileTab?: TabType } | null)?.profileTab
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab === 'device' ? 'device' : 'report',
  )
  const [chartMetric, setChartMetric] = useState<'time' | 'vocab'>('time')
  const username = 'Nora'
  const age = 16
  const levelProgress = 83 / 400

  return (
    <Box
      id="profile-root"
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: PAGE_BG,
        display: 'flex',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        id="profile-container"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: p(680),
            flexShrink: 0,
            height: '100%',
            bgcolor: TEAL,
            borderRadius: `0 ${p(80)}px ${p(80)}px 0`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            pt: `${p(40)}px`,
            pb: `${p(80)}px`,
            px: `${p(100)}px`,
          }}
        >
          <ButtonBase
            onClick={() => navigate('/')}
            aria-label="Back"
            sx={{
              position: 'absolute',
              left: p(60),
              top: p(40),
              width: p(80),
              height: p(80),
              minWidth: p(80),
              borderRadius: '100px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0DF',
              color: INK,
              zIndex: 2,
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: p(40) }} />
          </ButtonBase>

          <Box
            sx={{
              mt: `${p(80)}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar
              src="/images/nora-avatar.png"
              alt={username}
              sx={{
                width: p(300),
                height: p(300),
                bgcolor: '#FFF6E7',
                border: `${p(4)}px solid #FFFFFF`,
                boxSizing: 'border-box',
                '& img': { objectFit: 'cover', bgcolor: '#FFF6E7' },
              }}
            />

            <Box
              sx={{
                mt: `${p(10)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(10)}px`,
                height: p(64),
              }}
            >
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(40),
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                }}
              >
                {username}
              </Typography>
              <ButtonBase
                onClick={() => navigate('/profile/edit')}
                aria-label="Edit profile"
                sx={{
                  width: p(40),
                  height: p(40),
                  minWidth: p(40),
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  '&:active': { transform: 'scale(0.94)' },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: p(26) }} />
              </ButtonBase>
            </Box>

            <Box
              sx={{
                mt: `${p(20)}px`,
                width: p(100),
                height: p(50),
                borderRadius: `${p(10)}px`,
                bgcolor: '#E3F0FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${p(9)}px`,
              }}
            >
              <MaleIcon size={p(28)} />
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(28),
                  lineHeight: 1.6,
                  color: BLUE,
                }}
              >
                {age}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mt: `${p(60)}px`,
              width: p(480),
              display: 'flex',
              flexDirection: 'column',
              gap: `${p(30)}px`,
            }}
          >
            <ButtonBase
              onClick={() => setActiveTab('report')}
              aria-pressed={activeTab === 'report'}
              sx={{
                width: p(480),
                height: p(100),
                borderRadius: `${p(20)}px`,
                bgcolor: activeTab === 'report' ? 'rgba(255,255,255,0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: `${p(28)}px`,
                px: `${p(24)}px`,
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <ReportIcon active={activeTab === 'report'} />
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                }}
              >
                Study Report
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => setActiveTab('device')}
              aria-pressed={activeTab === 'device'}
              sx={{
                width: p(480),
                height: p(100),
                borderRadius: `${p(20)}px`,
                bgcolor: activeTab === 'device' ? 'rgba(255,255,255,0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: `${p(28)}px`,
                px: `${p(24)}px`,
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <DeviceIcon />
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                }}
              >
                About Device
              </Typography>
            </ButtonBase>
          </Box>

          <Box sx={{ flex: 1, minHeight: p(24) }} />

          <Box
            sx={{
              width: p(480),
              height: p(186),
              borderRadius: `${p(24)}px`,
              bgcolor: '#33C3B3',
              px: `${p(40)}px`,
              py: `${p(30)}px`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontSize: p(24),
                  lineHeight: 1.6,
                  color: '#ADE4DC',
                }}
              >
                CURRENT LEVEL
              </Typography>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                }}
              >
                HSK 2
              </Typography>
            </Box>
            <Box
              sx={{
                width: p(400),
                height: p(8),
                borderRadius: `${p(5)}px`,
                bgcolor: '#84E5D8',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: `${p(5)}px`,
                  bgcolor: '#FFFFFF',
                  transform: `scaleX(${levelProgress})`,
                  transformOrigin: 'left center',
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            pt: `${p(100)}px`,
            px: `${p(80)}px`,
            pb: `${p(60)}px`,
            boxSizing: 'border-box',
          }}
        >
          {activeTab === 'report' ? (
            <>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(48),
                  lineHeight: `${p(70)}px`,
                  color: INK,
                  mb: `${p(40)}px`,
                }}
              >
                Study Report
              </Typography>

              <Box sx={{ display: 'flex', gap: `${p(40)}px`, flexShrink: 0 }}>
                <StatCard value="120h" label="total time" color={BLUE} />
                <StatCard value="328" label="words learned" color={ORANGE} />
              </Box>

              <Box
                sx={{
                  mt: `${p(40)}px`,
                  flex: 1,
                  minHeight: 0,
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #E0E0DF',
                  borderRadius: `${p(40)}px`,
                  px: `${p(50)}px`,
                  pt: `${p(30)}px`,
                  pb: `${p(40)}px`,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: `${p(24)}px`,
                    flexShrink: 0,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontWeight: 700,
                        fontSize: p(32),
                        lineHeight: `${p(48)}px`,
                        color: '#000000',
                      }}
                    >
                      Weekly Progress
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: FIGMA_FONT,
                        fontSize: p(24),
                        lineHeight: `${p(35)}px`,
                        color: '#A7B3B8',
                      }}
                    >
                      Your learning activity over the last 7 days
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: p(440),
                      height: p(80),
                      borderRadius: `${p(16)}px`,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      p: `${p(8)}px`,
                      boxSizing: 'border-box',
                      flexShrink: 0,
                    }}
                  >
                    {([
                      ['time', 'Learning Time'],
                      ['vocab', 'Vocabularies'],
                    ] as const).map(([key, label]) => {
                      const selected = chartMetric === key
                      return (
                        <ButtonBase
                          key={key}
                          onClick={() => setChartMetric(key)}
                          sx={{
                            flex: 1,
                            height: p(64),
                            borderRadius: `${p(12)}px`,
                            bgcolor: selected ? '#FFFFFF' : 'transparent',
                            border: selected ? '1px solid #E2E3E3' : '1px solid transparent',
                            color: selected ? TEAL : '#636E72',
                            fontFamily: FIGMA_FONT,
                            fontWeight: 500,
                            fontSize: p(20),
                            lineHeight: `${p(29)}px`,
                          }}
                        >
                          {label}
                        </ButtonBase>
                      )
                    })}
                  </Box>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    mt: `${p(24)}px`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: `${p(46)}px`,
                    px: `${p(10)}px`,
                    borderBottom: '1px solid #E0E0DF',
                    pb: `${p(8)}px`,
                  }}
                >
                  {WEEK_DAYS.map((day, index) => {
                    const highlighted = index === 6
                    const barH = BAR_HEIGHTS[index]
                    return (
                      <Box
                        key={day}
                        sx={{
                          width: p(100),
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: `${p(16)}px`,
                        }}
                      >
                        {highlighted && (
                          <Typography
                            sx={{
                              fontFamily: FIGMA_FONT,
                              fontSize: p(32),
                              lineHeight: `${p(46)}px`,
                              color: TEAL,
                            }}
                          >
                            {chartMetric === 'time' ? '2h' : '48'}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            width: p(36),
                            height: barH ? p(barH) : 0,
                            borderRadius: `${p(6)}px ${p(6)}px 0 0`,
                            background: highlighted
                              ? 'linear-gradient(180deg, #57DACC 0%, #00B4A0 100%)'
                              : '#D9D9D9',
                            transformOrigin: 'bottom',
                          }}
                        />
                        <Typography
                          sx={{
                            width: p(100),
                            fontFamily: FIGMA_FONT,
                            fontSize: p(28),
                            lineHeight: `${p(42)}px`,
                            textAlign: 'center',
                            color: '#636E72',
                          }}
                        >
                          {day}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography
                sx={{
                  fontFamily: FIGMA_FONT,
                  fontWeight: 700,
                  fontSize: p(48),
                  lineHeight: `${p(70)}px`,
                  color: INK,
                  mb: `${p(40)}px`,
                }}
              >
                About Device
              </Typography>
              <Box
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #E0E0DF',
                  borderRadius: `${p(40)}px`,
                  overflow: 'hidden',
                }}
              >
                {(
                  [
                    ['Model', 'G60'],
                    ['Version', 'G60_ZX_V1.42_2023.03.08'],
                    ['Build', '20240308.14(zngbzdv6)'],
                    ['Registration', 'c933341673'],
                  ] as const
                ).map(([label, value], index, rows) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: `${p(24)}px`,
                      minHeight: p(88),
                      px: `${p(40)}px`,
                      borderBottom: index === rows.length - 1 ? 'none' : '1px solid #E0E0DF',
                    }}
                  >
                    <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(28), color: INK }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), color: '#636E72' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
