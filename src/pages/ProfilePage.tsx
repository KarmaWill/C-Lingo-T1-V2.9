import React, { useState, useEffect } from 'react'
import { Box, Typography, Avatar, ButtonBase, ToggleButton, ToggleButtonGroup } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TabletMacIcon from '@mui/icons-material/TabletMac'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { useNavigate, useLocation } from 'react-router-dom'

type TabType = 'report' | 'device'

const TEAL = '#0D9488'
const TEAL_DEEP = '#0F766E'
const TEAL_LIGHT = '#14B8A6'
const CARD_RADIUS = '20px'
const hardRadius = '14px'

function LevelRing({ progress, size, is960 }: { progress: number; size: number; is960: boolean }) {
  const stroke = is960 ? 6 : 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(100, Math.max(0, progress)) / 100)

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ display: 'block', transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#5EEAD4"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
          {progress}%
        </Typography>
      </Box>
    </Box>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('report')

  useEffect(() => {
    const tab = (location.state as { profileTab?: TabType } | null)?.profileTab
    if (tab === 'report' || tab === 'device') {
      setActiveTab(tab)
    }
  }, [location.state])
  const [username] = useState('Lumi')
  const [gender] = useState<'female'>('female')
  const [age] = useState(16)
  const [chartMetric, setChartMetric] = useState<'time' | 'vocab'>('time')

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const levelProgress = 42
  const weekDays = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']
  const barHeightsPx = [32, 26, 38, 22, 18, 48, 92]
  const highlightIndex = 6

  const navBtnSx = (active: boolean) => ({
    width: '100%',
    minHeight: 48,
    py: is960 ? 1 : 1.15,
    px: 1.25,
    borderRadius: hardRadius,
    bgcolor: active ? 'rgba(255,255,255,0.16)' : 'transparent',
    border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
    backdropFilter: active ? 'blur(10px)' : 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    justifyContent: 'flex-start',
    transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
    '&:active': { transform: 'scale(0.98)' },
  })

  const iconBoxSx = (active: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: '12px',
    bgcolor: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 0.2s, background 0.2s',
    transform: active ? 'scale(1.04)' : 'scale(1)',
    boxShadow: active ? '0 4px 12px rgba(15,23,42,0.12)' : 'none',
  })

  const surfaceCardSx = {
    bgcolor: 'white',
    borderRadius: CARD_RADIUS,
    border: '1px solid rgba(15,23,42,0.06)',
    boxShadow: '0 8px 28px rgba(15, 23, 42, 0.06)',
  }

  return (
    <Box
      id="profile-root"
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #F0F7F6 0%, #EEF2F3 48%, #F5F7F8 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        id="profile-container"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left — brand sidebar */}
        <Box
          sx={{
            width: is960 ? 200 : 240,
            flexShrink: 0,
            background: `
              radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22) 0%, transparent 55%),
              linear-gradient(180deg, ${TEAL_DEEP} 0%, ${TEAL} 52%, ${TEAL_LIGHT} 100%)
            `,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            py: is960 ? 1.75 : 2.25,
            px: is960 ? 1.5 : 2,
            borderRadius: { md: '0 22px 22px 0' },
            boxShadow: '6px 0 28px rgba(15,118,110,0.22)',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <ButtonBase
            onClick={() => navigate('/')}
            aria-label="Back"
            sx={{
              alignSelf: 'flex-start',
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.95)',
              color: '#64748B',
              mb: 2,
              boxShadow: '0 4px 14px rgba(15,23,42,0.12)',
              zIndex: 1,
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : 22 }} />
          </ButtonBase>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.25, zIndex: 1 }}>
            <Box
              sx={{
                p: '3px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 100%)',
                mb: 1.5,
                boxShadow: '0 10px 28px rgba(15,23,42,0.18)',
              }}
            >
              <Avatar
                src="/images/nora-avatar.png"
                alt="Lumi"
                sx={{
                  width: is960 ? 88 : 104,
                  height: is960 ? 88 : 104,
                  bgcolor: '#EAF9F2',
                  border: '3px solid rgba(255,255,255,0.55)',
                  '& img': { objectFit: 'contain', bgcolor: '#EAF9F2' },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: is960 ? '1rem' : '1.15rem', fontWeight: 800, color: 'white' }}>
                {username}
              </Typography>
              <ButtonBase
                onClick={() => navigate('/profile/edit')}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  color: 'rgba(255,255,255,0.95)',
                  '&:active': { transform: 'scale(0.94)' },
                }}
                aria-label="Edit profile"
              >
                <EditIcon sx={{ fontSize: is960 ? 16 : 18 }} />
              </ButtonBase>
            </Box>

            {gender === 'female' && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.4,
                  minHeight: 28,
                  borderRadius: '999px',
                  bgcolor: 'rgba(244,114,182,0.92)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: is960 ? '0.7rem' : '0.78rem',
                  boxShadow: '0 4px 12px rgba(190,24,93,0.25)',
                }}
              >
                <span aria-hidden>♀</span>
                <span>{age}</span>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mb: 2, zIndex: 1 }}>
            <ButtonBase onClick={() => setActiveTab('report')} sx={navBtnSx(activeTab === 'report')}>
              <Box sx={iconBoxSx(activeTab === 'report')}>
                <PersonIcon sx={{ fontSize: 20, color: activeTab === 'report' ? TEAL : 'white' }} />
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'white' }}>
                Study Report
              </Typography>
            </ButtonBase>

            <ButtonBase onClick={() => setActiveTab('device')} sx={navBtnSx(activeTab === 'device')}>
              <Box sx={iconBoxSx(activeTab === 'device')}>
                <TabletMacIcon sx={{ fontSize: 20, color: activeTab === 'device' ? TEAL : 'white' }} />
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'white' }}>
                About Device
              </Typography>
            </ButtonBase>
          </Box>

          <Box sx={{ flex: 1, minHeight: 8 }} />

          {/* Level badge */}
          <Box
            sx={{
              width: '100%',
              borderRadius: '18px',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.24)',
              p: is960 ? 1.25 : 1.5,
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: is960 ? 1.25 : 1.5,
            }}
          >
            <LevelRing progress={levelProgress} size={is960 ? 56 : 64} is960={is960} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: is960 ? '0.55rem' : '0.6rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.72)',
                  letterSpacing: '0.12em',
                  mb: 0.35,
                }}
              >
                CURRENT LEVEL
              </Typography>
              <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
                HSK 2
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: is960 ? '0.65rem' : '0.72rem', fontWeight: 650, color: 'rgba(255,255,255,0.78)' }}>
                to HSK 3
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right — main */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            p: is960 ? 2.5 : 3.5,
            boxSizing: 'border-box',
          }}
        >
          {activeTab === 'report' ? (
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, mb: is960 ? 2.25 : 3 }}>
                <Box
                  sx={{
                    width: 4,
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${TEAL_LIGHT} 0%, ${TEAL_DEEP} 100%)`,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.62rem' : '0.68rem',
                      fontWeight: 800,
                      color: TEAL,
                      letterSpacing: '0.14em',
                      mb: 0.35,
                    }}
                  >
                    OVERVIEW
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Study Report
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    ...surfaceCardSx,
                    p: is960 ? 1.75 : 2.1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F5FF 100%)',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      background: 'linear-gradient(145deg, #EDE9FE 0%, #DDD6FE 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.15rem' : '1.3rem', color: '#0F172A', lineHeight: 1.15 }}>
                      12h 30m
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600, mt: 0.25 }}>
                      total time
                    </Typography>
                    <Typography sx={{ mt: 0.65, fontSize: is960 ? '0.68rem' : '0.74rem', fontWeight: 750, color: TEAL }}>
                      +1.2h this week
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    ...surfaceCardSx,
                    p: is960 ? 1.75 : 2.1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      background: 'linear-gradient(145deg, #FFEDD5 0%, #FED7AA 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MenuBookIcon sx={{ color: '#EA580C', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.15rem' : '1.3rem', color: '#0F172A', lineHeight: 1.15 }}>
                      328
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600, mt: 0.25 }}>
                      words learned
                    </Typography>
                    <Typography sx={{ mt: 0.65, fontSize: is960 ? '0.68rem' : '0.74rem', fontWeight: 750, color: '#EA580C' }}>
                      +24 words
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  ...surfaceCardSx,
                  p: is960 ? 2 : 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.25 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1rem' : '1.15rem', color: '#0F172A' }}>
                      Weekly Progress
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', mt: 0.5 }}>
                      Your learning activity over the last 7 days
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    value={chartMetric}
                    exclusive
                    onChange={(_, v) => v && setChartMetric(v)}
                    sx={{
                      bgcolor: '#E8F5F2',
                      p: 0.5,
                      borderRadius: '999px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '999px !important',
                        px: 1.5,
                        py: 0.65,
                        minHeight: 40,
                        fontSize: is960 ? '0.7rem' : '0.78rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        color: '#64748B',
                        gap: 0.5,
                      },
                      '& .Mui-selected': {
                        bgcolor: 'white !important',
                        color: `${TEAL} !important`,
                        boxShadow: '0 2px 8px rgba(13,148,136,0.14)',
                      },
                    }}
                  >
                    <ToggleButton value="time">
                      <ScheduleIcon sx={{ fontSize: 18 }} />
                      Learning Time
                    </ToggleButton>
                    <ToggleButton value="vocab">
                      <AutoStoriesIcon sx={{ fontSize: 18 }} />
                      Vocabularies
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 0.75,
                    height: 148,
                    pt: 1,
                    borderTop: '1px solid rgba(15,23,42,0.05)',
                    '@keyframes barGrow': {
                      from: { transform: 'scaleY(0)', opacity: 0.35 },
                      to: { transform: 'scaleY(1)', opacity: 1 },
                    },
                  }}
                >
                  {weekDays.map((day, i) => {
                    const isHi = i === highlightIndex
                    const h = barHeightsPx[i]
                    return (
                      <Box key={day} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        <Box sx={{ minHeight: 26, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          {isHi && (
                            <Box
                              sx={{
                                px: 0.85,
                                py: 0.3,
                                borderRadius: '999px',
                                bgcolor: 'rgba(13,148,136,0.12)',
                                border: '1px solid rgba(13,148,136,0.22)',
                              }}
                            >
                              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.72rem', fontWeight: 800, color: TEAL, lineHeight: 1.2 }}>
                                {chartMetric === 'time' ? '2h 40m' : '48'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 40,
                            height: h,
                            mx: 'auto',
                            borderRadius: '10px 10px 5px 5px',
                            transformOrigin: 'bottom',
                            animation: 'barGrow 0.55s ease forwards',
                            animationDelay: `${i * 55}ms`,
                            background: isHi
                              ? `linear-gradient(180deg, ${TEAL_LIGHT} 0%, ${TEAL_DEEP} 100%)`
                              : 'linear-gradient(180deg, #D5E8E4 0%, #C5D9D5 100%)',
                            boxShadow: isHi ? '0 8px 18px rgba(13,148,136,0.28)' : 'none',
                          }}
                        />
                        <Typography sx={{ fontSize: is960 ? '0.6rem' : '0.68rem', color: isHi ? TEAL : '#94A3B8', fontWeight: isHi ? 800 : 600 }}>
                          {day}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 640 }}>
              <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, mb: is960 ? 2.25 : 3 }}>
                <Box
                  sx={{
                    width: 4,
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${TEAL_LIGHT} 0%, ${TEAL_DEEP} 100%)`,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: is960 ? '0.62rem' : '0.68rem',
                      fontWeight: 800,
                      color: TEAL,
                      letterSpacing: '0.14em',
                      mb: 0.35,
                    }}
                  >
                    DEVICE
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    About Device
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ...surfaceCardSx, overflow: 'hidden' }}>
                {[
                  ['Model', 'G60'],
                  ['Version', 'G60_ZX_V1.42_2023.03.08'],
                  ['Build', '20240308.14(zngbzdv6)'],
                  ['Registration', 'c933341673'],
                ].map(([label, value], idx, arr) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 2.1,
                      px: 2.25,
                      minHeight: 56,
                      borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(15,23,42,0.05)',
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', fontWeight: 700, color: '#334155' }}>{label}</Typography>
                    <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 500, color: '#64748B', textAlign: 'right' }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
