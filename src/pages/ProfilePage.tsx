import React, { useState, useEffect } from 'react'
import { Box, Typography, Avatar, ButtonBase, ToggleButton, ToggleButtonGroup } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TabletMacIcon from '@mui/icons-material/TabletMac'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { useNavigate, useLocation } from 'react-router-dom'

type TabType = 'report' | 'device'

const TEAL = '#0D9488'
const TEAL_NAV_ACTIVE = 'rgba(0,0,0,0.12)'
const hardRadius = '10px'

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
  const [username] = useState('Nora')
  const [gender] = useState<'female'>('female')
  const [age] = useState(16)
  const [chartMetric, setChartMetric] = useState<'time' | 'vocab'>('time')

  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const levelProgress = 42
  const weekDays = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']
  const barHeightsPx = [32, 26, 38, 22, 18, 48, 92]
  const highlightIndex = 6

  return (
    <Box
      id="profile-root"
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#EEF2F3',
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
        {/* Left — teal sidebar (reference) */}
        <Box
          sx={{
            width: is960 ? 200 : 240,
            flexShrink: 0,
            bgcolor: TEAL,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            py: is960 ? 1.75 : 2.25,
            px: is960 ? 1.5 : 2,
            borderRadius: { md: '0 20px 20px 0' },
            boxShadow: '4px 0 24px rgba(13,148,136,0.15)',
            boxSizing: 'border-box',
          }}
        >
          <ButtonBase
            onClick={() => navigate('/')}
            sx={{
              alignSelf: 'flex-start',
              width: is960 ? 36 : 40,
              height: is960 ? 36 : 40,
              borderRadius: '50%',
              bgcolor: 'white',
              color: '#64748B',
              mb: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : 22 }} />
          </ButtonBase>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar
              src="/images/nora-avatar.png"
              alt="Nora"
              sx={{
                width: is960 ? 88 : 104,
                height: is960 ? 88 : 104,
                bgcolor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '4px solid rgba(255,255,255,0.45)',
                mb: 1.5,
                '& img': { objectFit: 'cover' },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: is960 ? '1rem' : '1.15rem', fontWeight: 800, color: 'white' }}>
                {username}
              </Typography>
              <ButtonBase
                onClick={() => navigate('/profile/edit')}
                sx={{ p: 0.25, color: 'rgba(255,255,255,0.95)' }}
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
                  py: 0.35,
                  borderRadius: '999px',
                  bgcolor: '#F472B6',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: is960 ? '0.7rem' : '0.78rem',
                }}
              >
                <span aria-hidden>♀</span>
                <span>{age}</span>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mb: 2 }}>
            <ButtonBase
              onClick={() => setActiveTab('report')}
              sx={{
                width: '100%',
                py: is960 ? 1 : 1.15,
                px: 1.25,
                borderRadius: hardRadius,
                bgcolor: activeTab === 'report' ? TEAL_NAV_ACTIVE : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                justifyContent: 'flex-start',
                transition: 'background 0.2s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: hardRadius,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PersonIcon sx={{ fontSize: 20, color: TEAL }} />
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'white' }}>
                Study Report
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => setActiveTab('device')}
              sx={{
                width: '100%',
                py: is960 ? 1 : 1.15,
                px: 1.25,
                borderRadius: hardRadius,
                bgcolor: activeTab === 'device' ? TEAL_NAV_ACTIVE : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                justifyContent: 'flex-start',
                transition: 'background 0.2s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: hardRadius,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TabletMacIcon sx={{ fontSize: 20, color: TEAL }} />
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'white' }}>
                About Device
              </Typography>
            </ButtonBase>
          </Box>

          <Box sx={{ flex: 1, minHeight: 8 }} />

          <Box
            sx={{
              width: '100%',
              borderRadius: '14px',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              p: is960 ? 1.25 : 1.5,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography
              sx={{
                fontSize: is960 ? '0.55rem' : '0.6rem',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.12em',
                mb: 0.5,
              }}
            >
              CURRENT LEVEL
            </Typography>
            <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, color: 'white', mb: 1 }}>
              HSK 2
            </Typography>
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <Box sx={{ width: `${levelProgress}%`, height: '100%', bgcolor: '#5EEAD4', borderRadius: 3 }} />
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <DashboardCustomizeIcon sx={{ fontSize: is960 ? 28 : 36, color: TEAL }} />
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: '#1E293B' }}>
                  Study Report
                </Typography>
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
                    bgcolor: 'white',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      bgcolor: '#EDE9FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccessTimeIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#0F172A' }}>
                      12h 30m
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600 }}>
                      total time
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      bgcolor: '#FFEDD5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MenuBookIcon sx={{ color: '#EA580C', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.1rem' : '1.25rem', color: '#0F172A' }}>
                      328
                    </Typography>
                    <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#64748B', fontWeight: 600 }}>
                      words learned
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: '18px',
                  p: is960 ? 2 : 2.5,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 24px rgba(15,23,42,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
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
                      bgcolor: '#F1F5F9',
                      p: 0.5,
                      borderRadius: '999px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '999px !important',
                        px: 1.5,
                        py: 0.5,
                        fontSize: is960 ? '0.7rem' : '0.78rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        color: '#64748B',
                        gap: 0.5,
                      },
                      '& .Mui-selected': {
                        bgcolor: 'white !important',
                        color: `${TEAL} !important`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
                    height: 140,
                    pt: 1,
                  }}
                >
                  {weekDays.map((day, i) => {
                    const isHi = i === highlightIndex
                    const h = barHeightsPx[i]
                    return (
                      <Box key={day} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        <Box sx={{ minHeight: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          {isHi && (
                            <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.75rem', fontWeight: 800, color: TEAL }}>
                              {chartMetric === 'time' ? '2h 40m' : '48'}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 40,
                            height: h,
                            bgcolor: isHi ? TEAL : '#E2E8F0',
                            borderRadius: '8px 8px 4px 4px',
                            mx: 'auto',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TabletMacIcon sx={{ fontSize: is960 ? 28 : 36, color: TEAL }} />
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: '#1E293B' }}>
                  About Device
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {[
                  ['Model', 'G60'],
                  ['Version', 'G60_ZX_V1.42_2023.03.08'],
                  ['Build', '20240308.14(zngbzdv6)'],
                  ['Registration', 'c933341673'],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 2,
                      px: 2,
                      borderBottom: '1px solid #F1F5F9',
                      '&:last-of-type': { borderBottom: 'none' },
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
