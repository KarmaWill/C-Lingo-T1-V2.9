import { useState, type ChangeEvent } from 'react'
import { Avatar, Box, ButtonBase, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useNavigate } from 'react-router-dom'
import { HskPrepBackButton } from '../components/hsk/HskPrepBackButton'
import { APP_FONT_FAMILY } from '../theme/appFont'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../utils/figmaScale'

const TEAL = '#00B4A0'
const INK = '#2D3436'
const MUTED = '#636E72'
const HINT = '#A7B3B8'
const LINE = '#E0E0DF'
const PAGE_BG = '#F8F9F8'
const FIELD_BG = '#F8F9F8'

type Gender = 'male' | 'female' | 'unspecified'

function ReportIcon() {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  return (
    <Box
      sx={{
        width: p(54),
        height: p(54),
        borderRadius: `${p(16)}px`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
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
          background: 'linear-gradient(152.45deg, #1BE0CA 15.65%, #00B4A0 104.32%)',
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
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
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

function FieldLabel({ children }: { children: string }) {
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  return (
    <Typography
      sx={{
        fontFamily: FIGMA_FONT,
        fontWeight: 700,
        fontSize: p(24),
        lineHeight: '36px',
        color: HINT,
        mb: `${p(20)}px`,
      }}
    >
      {children}
    </Typography>
  )
}

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)
  const [nickname, setNickname] = useState('Nora')
  const [dob] = useState('2024-3-12')
  const [gender, setGender] = useState<Gender>('female')
  const [email] = useState('1234567891@qq.com')
  const username = nickname || 'Nora'
  const age = 16
  const levelProgress = 83 / 400

  const handleSave = () => {
    navigate('/profile')
  }

  return (
    <Box
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
        <HskPrepBackButton
          onClick={() => navigate('/profile')}
          sx={{
            position: 'absolute',
            left: p(60),
            top: p(40),
            width: p(80),
            height: p(80),
            zIndex: 2,
          }}
        />

        <Box sx={{ mt: `${p(80)}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <Box sx={{ width: p(40), height: p(40), display: 'grid', placeItems: 'center', color: '#FFFFFF' }}>
              <EditOutlinedIcon sx={{ fontSize: p(26) }} />
            </Box>
          </Box>
          <Box
            sx={{
              mt: `${p(20)}px`,
              width: p(100),
              height: p(50),
              borderRadius: `${p(10)}px`,
              bgcolor: '#E9EBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${p(9)}px`,
            }}
          >
            <Box
              sx={{
                width: p(28),
                height: p(28),
                borderRadius: '50%',
                border: '2px solid #636E72',
              }}
            />
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontWeight: 700,
                fontSize: p(28),
                lineHeight: 1.6,
                color: MUTED,
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
            onClick={() => navigate('/profile', { state: { profileTab: 'report' as const } })}
            sx={{
              width: p(480),
              height: p(100),
              borderRadius: `${p(20)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: `${p(28)}px`,
              px: `${p(24)}px`,
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            <ReportIcon />
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(32), lineHeight: 1.6, color: '#FFFFFF' }}>
              Study Report
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={() => navigate('/profile', { state: { profileTab: 'device' as const } })}
            sx={{
              width: p(480),
              height: p(100),
              borderRadius: `${p(20)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: `${p(28)}px`,
              px: `${p(24)}px`,
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            <DeviceIcon />
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(32), lineHeight: 1.6, color: '#FFFFFF' }}>
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
            <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(24), lineHeight: 1.6, color: '#ADE4DC' }}>
              CURRENT LEVEL
            </Typography>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: '#FFFFFF' }}>
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
            <Box sx={{ width: `${levelProgress * 100}%`, height: '100%', borderRadius: `${p(5)}px`, bgcolor: '#FFFFFF' }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          pt: `${p(100)}px`,
          pb: `${p(80)}px`,
          px: `${p(80)}px`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: `${p(24)}px` }}>
          <Box>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(48), lineHeight: 1.6, color: INK }}>
              Profile
            </Typography>
            <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(32), lineHeight: 1.6, color: MUTED }}>
              Manage your profile and account details
            </Typography>
          </Box>
          <ButtonBase
            onClick={handleSave}
            sx={{
              width: p(199),
              height: p(80),
              borderRadius: `${p(38)}px`,
              bgcolor: TEAL,
              color: '#FFFFFF',
              fontFamily: FIGMA_FONT,
              fontWeight: 400,
              fontSize: p(32),
              flexShrink: 0,
              '&:active': { bgcolor: '#009688' },
            }}
          >
            Save
          </ButtonBase>
        </Box>

        <ButtonBase
          sx={{
            mt: `${p(30)}px`,
            width: '100%',
            minHeight: p(200),
            px: `${p(50)}px`,
            py: `${p(32)}px`,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            border: `1.5px solid ${LINE}`,
            borderRadius: `${p(40)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${p(28)}px`,
            textAlign: 'left',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(28)}px`, minWidth: 0 }}>
            <Avatar
              src="/images/nora-avatar.png"
              alt={username}
              sx={{
                width: p(130),
                height: p(130),
                bgcolor: '#FFF6E7',
                border: `2px solid #F3F4F6`,
                flexShrink: 0,
                '& img': { objectFit: 'cover', bgcolor: '#FFF6E7' },
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 700, fontSize: p(32), lineHeight: 1.6, color: INK }}>
                Profile Picture
              </Typography>
              <Typography sx={{ fontFamily: FIGMA_FONT, fontWeight: 400, fontSize: p(24), lineHeight: '36px', color: HINT }}>
                Update your avatar to personalize your experience
              </Typography>
            </Box>
          </Box>
          <ChevronRightIcon sx={{ fontSize: p(40), color: HINT, flexShrink: 0 }} />
        </ButtonBase>

        <Box
          sx={{
            mt: `${p(28)}px`,
            flex: 1,
            minHeight: 0,
            bgcolor: '#FFFFFF',
            border: `1.5px solid ${LINE}`,
            borderRadius: `${p(40)}px`,
            px: `${p(50)}px`,
            py: `${p(40)}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: `${p(40)}px`,
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', gap: `${p(60)}px` }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FieldLabel>NICKNAME</FieldLabel>
              <Box
                component="input"
                value={nickname}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                sx={{
                  width: '100%',
                  height: p(80),
                  px: `${p(20)}px`,
                  boxSizing: 'border-box',
                  border: 'none',
                  outline: 'none',
                  bgcolor: FIELD_BG,
                  borderRadius: `${p(12)}px`,
                  fontFamily: FIGMA_FONT,
                  fontSize: p(32),
                  lineHeight: 1.6,
                  color: INK,
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FieldLabel>Date of Birth</FieldLabel>
              <ButtonBase
                sx={{
                  width: '100%',
                  height: p(80),
                  px: `${p(20)}px`,
                  boxSizing: 'border-box',
                  bgcolor: FIELD_BG,
                  borderRadius: `${p(12)}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(32), lineHeight: 1.6, color: '#000000' }}>
                  {dob}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: p(40), color: HINT }} />
              </ButtonBase>
            </Box>
          </Box>

          <Box>
            <FieldLabel>GENDER</FieldLabel>
            <Box
              sx={{
                width: '100%',
                height: p(80),
                bgcolor: FIELD_BG,
                borderRadius: `${p(12)}px`,
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              {([
                ['male', 'Male'],
                ['female', 'Female'],
                ['unspecified', 'Prefer not to say'],
              ] as const).map(([value, label]) => {
                const selected = gender === value
                return (
                  <ButtonBase
                    key={value}
                    onClick={() => setGender(value)}
                    sx={{
                      flex: 1,
                      height: '100%',
                      borderRadius: `${p(12)}px`,
                      border: selected ? `2px solid ${TEAL}` : '2px solid transparent',
                      bgcolor: selected ? '#F6FCFB' : 'transparent',
                      color: selected ? TEAL : HINT,
                      fontFamily: FIGMA_FONT,
                      fontWeight: 400,
                      fontSize: p(28),
                    }}
                  >
                    {label}
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>

          <Box>
            <FieldLabel>EMAIL</FieldLabel>
            <ButtonBase
              sx={{
                width: '100%',
                height: p(80),
                px: `${p(20)}px`,
                boxSizing: 'border-box',
                bgcolor: FIELD_BG,
                borderRadius: `${p(12)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography sx={{ fontFamily: FIGMA_FONT, fontSize: p(32), lineHeight: 1.6, color: INK }}>
                {email}
              </Typography>
              <ChevronRightIcon sx={{ fontSize: p(40), color: HINT }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
