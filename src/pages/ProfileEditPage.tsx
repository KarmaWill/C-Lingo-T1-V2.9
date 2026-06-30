import { useState, type ChangeEvent } from 'react'
import { Box, Typography, ButtonBase, Avatar, ToggleButton, ToggleButtonGroup } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import TabletMacIcon from '@mui/icons-material/TabletMac'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useNavigate } from 'react-router-dom'

const TEAL = '#0D9488'
const TEAL_NAV_ACTIVE = 'rgba(0,0,0,0.12)'
const hardRadius = '10px'

type Gender = 'male' | 'female' | 'unspecified'

/**
 * Full-screen profile edit layout (reference: sidebar + account form).
 */
export default function ProfileEditPage() {
  const navigate = useNavigate()
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'

  const [nickname, setNickname] = useState('Nora')
  const [dob] = useState('2024-3-12')
  const [gender, setGender] = useState<Gender>('female')
  const [email] = useState('1234567891@qq.com')
  const levelProgress = 42

  const handleSave = () => {
    navigate(-1)
  }

  return (
    <Box
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
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left — teal sidebar */}
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
            onClick={() => navigate(-1)}
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
            aria-label="Back"
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
              <Typography sx={{ fontSize: is960 ? '1rem' : '1.15rem', fontWeight: 800, color: 'white' }}>{nickname}</Typography>
              <Box sx={{ p: 0.25, color: 'rgba(255,255,255,0.95)' }} aria-hidden>
                <EditIcon sx={{ fontSize: is960 ? 16 : 18 }} />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.35,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 800,
                fontSize: is960 ? '0.7rem' : '0.78rem',
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: is960 ? 14 : 16 }} />
              <span>16</span>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mb: 2 }}>
            <ButtonBase
              onClick={() => navigate('/profile', { state: { profileTab: 'report' as const } })}
              sx={{
                width: '100%',
                py: is960 ? 1 : 1.15,
                px: 1.25,
                borderRadius: hardRadius,
                bgcolor: TEAL_NAV_ACTIVE,
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
                }}
              >
                <PersonIcon sx={{ fontSize: 20, color: TEAL }} />
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'white' }}>
                Study Report
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/profile', { state: { profileTab: 'device' as const } })}
              sx={{
                width: '100%',
                py: is960 ? 1 : 1.15,
                px: 1.25,
                borderRadius: hardRadius,
                bgcolor: 'transparent',
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
              borderRadius: hardRadius,
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

        {/* Right — profile form */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            p: is960 ? 2.5 : 3.5,
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ maxWidth: 720, mx: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.35rem' : '1.75rem', color: '#0F172A' }}>Profile</Typography>
                <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#64748B', mt: 0.5 }}>
                  Manage your profile and account details
                </Typography>
              </Box>
              <ButtonBase
                onClick={handleSave}
                sx={{
                  px: is960 ? 2.5 : 3,
                  py: is960 ? 1 : 1.125,
                  minHeight: 48,
                  borderRadius: '999px',
                  bgcolor: TEAL,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: is960 ? '0.85rem' : '0.95rem',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                  '&:active': { bgcolor: '#0f766e' },
                }}
              >
                Save
              </ButtonBase>
            </Box>

            <ButtonBase
              sx={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                bgcolor: 'white',
                borderRadius: hardRadius,
                p: is960 ? 1.75 : 2,
                mb: 2,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                '&:active': { bgcolor: '#F8FAFC' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Avatar
                  src="/images/nora-avatar.png"
                  alt="Nora"
                  sx={{
                    width: is960 ? 56 : 64,
                    height: is960 ? 56 : 64,
                    bgcolor: 'white',
                    border: '2px solid #E2E8F0',
                    '& img': { objectFit: 'cover' },
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.05rem', color: '#0F172A' }}>
                    Profile Picture
                  </Typography>
                  <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.82rem', color: '#64748B', mt: 0.25 }}>
                    Update your avatar to personalize your experience.
                  </Typography>
                </Box>
              </Box>
              <ChevronRightIcon sx={{ color: '#94A3B8', flexShrink: 0 }} />
            </ButtonBase>

            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: hardRadius,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                p: is960 ? 2 : 2.5,
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', mb: 1 }}>
                NICKNAME
              </Typography>
              <Box
                component="input"
                value={nickname}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                sx={{
                  width: '100%',
                  fontSize: is960 ? '0.95rem' : '1.05rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  border: 'none',
                  borderBottom: '1px solid #E2E8F0',
                  py: 1,
                  mb: 3,
                  outline: 'none',
                  bgcolor: 'transparent',
                  borderRadius: 0,
                  '&:focus': { borderBottomColor: TEAL },
                }}
              />

              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', mb: 1 }}>
                DATE OF BIRTH
              </Typography>
              <ButtonBase
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  mb: 3,
                  borderBottom: '1px solid #E2E8F0',
                  borderRadius: 0,
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.05rem', fontWeight: 600, color: '#0F172A' }}>{dob}</Typography>
                <ChevronRightIcon sx={{ color: '#94A3B8' }} />
              </ButtonBase>

              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', mb: 1.25 }}>
                GENDER
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={gender}
                onChange={(_, v: Gender | null) => v && setGender(v)}
                sx={{
                  width: '100%',
                  gap: 1,
                  mb: 3,
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    minWidth: 100,
                    border: `1px solid #E2E8F0 !important`,
                    borderRadius: `${hardRadius} !important`,
                    py: 1.25,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: is960 ? '0.85rem' : '0.92rem',
                    color: '#64748B',
                  },
                  '& .Mui-selected': {
                    borderColor: `${TEAL} !important`,
                    color: `${TEAL} !important`,
                    bgcolor: 'rgba(13,148,136,0.06) !important',
                  },
                }}
              >
                <ToggleButton value="male">Male</ToggleButton>
                <ToggleButton value="female">Female</ToggleButton>
                <ToggleButton value="unspecified">Prefer not to say</ToggleButton>
              </ToggleButtonGroup>

              <Typography sx={{ fontSize: is960 ? '0.65rem' : '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', mb: 1 }}>
                EMAIL
              </Typography>
              <ButtonBase
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: '1px solid #E2E8F0',
                  borderRadius: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: is960 ? '0.95rem' : '1.05rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    textAlign: 'left',
                    wordBreak: 'break-all',
                  }}
                >
                  {email}
                </Typography>
                <ChevronRightIcon sx={{ color: '#94A3B8', flexShrink: 0, ml: 1 }} />
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
