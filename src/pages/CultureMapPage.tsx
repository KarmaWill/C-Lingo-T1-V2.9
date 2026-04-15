/**
 * Culture Map Page - 中国文化地图
 * 交互式地图展示中国文化知识
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import InfoIcon from '@mui/icons-material/InfoOutlined';

interface CultureSpot {
  id: string;
  name: string;
  nameEn: string;
  province: string;
  category: string;
  description: string;
  image?: string;
  position: { top: string; left: string };
}

const CULTURE_SPOTS: CultureSpot[] = [
  {
    id: 'beijing',
    name: 'Beijing',
    nameEn: 'Capital of China',
    province: 'Beijing Municipality',
    category: 'Capital',
    description: 'National capital of China—a major historic city and modern global hub.',
    position: { top: '32%', left: '58%' },
  },
  {
    id: 'forbidden-city',
    name: 'Forbidden City',
    nameEn: 'Imperial Palace',
    province: 'Beijing',
    category: 'Historic architecture',
    description: 'Former imperial palace of the Ming and Qing dynasties; one of the world’s largest palace complexes.',
    position: { top: '34%', left: '60%' },
  },
  {
    id: 'great-wall',
    name: 'Great Wall',
    nameEn: 'World Heritage',
    province: 'Beijing',
    category: 'Historic site',
    description: 'Ancient defensive fortifications and a UNESCO World Heritage Site.',
    position: { top: '28%', left: '62%' },
  },
  {
    id: 'terracotta',
    name: 'Terracotta Army',
    nameEn: 'Qin Mausoleum',
    province: 'Shaanxi',
    category: 'Historic site',
    description: 'Life-size clay warriors guarding the tomb of China’s first emperor—a major archaeological discovery.',
    position: { top: '45%', left: '48%' },
  },
];

export default function CultureMapPage() {
  const navigate = useNavigate();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [selectedSpot, setSelectedSpot] = useState<CultureSpot | null>(null);

  const teal = '#14B8A6';
  const orange = '#FF7A45';
  const pageBg = '#FDF6E9';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: pageBg,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: is960 ? 2 : 3,
          py: is960 ? 1.5 : 2,
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonBase
            onClick={() => navigate(-1)}
            sx={{
              minHeight: is960 ? 44 : 52,
              minWidth: is960 ? 44 : 52,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#374151',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: is960 ? 26 : 30 }} />
          </ButtonBase>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.25rem' : '1.55rem', color: '#1E293B', letterSpacing: '-0.02em' }}>
              Chinese Culture Map
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#64748B', fontWeight: 600 }}>
              Explore Chinese culture
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          gap: is960 ? 2 : 2.5,
          p: is960 ? 2 : 3,
          minHeight: 0,
        }}
      >
        {/* Map Area */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'white',
            borderRadius: is960 ? '24px' : '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '2px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* China Map Background */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: is960 ? 3 : 4,
            }}
          >
            <Box
              sx={{
                width: '70%',
                height: '70%',
                position: 'relative',
                backgroundImage: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #CBD5E1',
              }}
            >
              <Typography
                sx={{
                  fontSize: is960 ? '3rem' : '4rem',
                  fontWeight: 900,
                  color: '#94A3B8',
                  letterSpacing: '0.05em',
                }}
              >
                China
              </Typography>

              {/* Culture Spots */}
              {CULTURE_SPOTS.map((spot) => (
                <ButtonBase
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  sx={{
                    position: 'absolute',
                    top: spot.position.top,
                    left: spot.position.left,
                    width: is960 ? 36 : 44,
                    height: is960 ? 36 : 44,
                    borderRadius: '50%',
                    bgcolor: selectedSpot?.id === spot.id ? orange : teal,
                    color: 'white',
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transform: selectedSpot?.id === spot.id ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.3s',
                    zIndex: selectedSpot?.id === spot.id ? 10 : 1,
                    '&:hover': {
                      transform: 'scale(1.3)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      bgcolor: selectedSpot?.id === spot.id ? orange : teal,
                      opacity: 0.3,
                      animation: 'pulse 2s infinite',
                    },
                  }}
                >
                  <Box
                    sx={{
                      fontSize: is960 ? '1rem' : '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {spot.category === 'Capital' ? '★' : '●'}
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              position: 'absolute',
              top: is960 ? 16 : 20,
              left: is960 ? 16 : 20,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                px: is960 ? 1.5 : 2,
                py: is960 ? 0.75 : 1,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: is960 ? '12px' : '16px',
                border: '2px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: orange, border: '2px solid white' }} />
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', fontWeight: 700, color: '#64748B' }}>
                Capital
              </Typography>
            </Box>
            <Box
              sx={{
                px: is960 ? 1.5 : 2,
                py: is960 ? 0.75 : 1,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: is960 ? '12px' : '16px',
                border: '2px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: teal, border: '2px solid white' }} />
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', fontWeight: 700, color: '#64748B' }}>
                Cultural sites
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Info Panel */}
        <Box
          sx={{
            width: is960 ? 280 : 360,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: is960 ? 2 : 2.5,
          }}
        >
          {/* Overview Card */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: is960 ? '20px' : '26px',
              p: is960 ? 2 : 2.5,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '2px solid rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <InfoIcon sx={{ fontSize: is960 ? 20 : 24, color: teal }} />
              <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                China at a glance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  p: is960 ? 1.2 : 1.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: is960 ? '12px' : '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 700, mb: 0.3 }}>
                  Population
                </Typography>
                <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, color: '#1E293B' }}>
                  1.4B+
                </Typography>
              </Box>
              <Box
                sx={{
                  p: is960 ? 1.2 : 1.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: is960 ? '12px' : '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 700, mb: 0.3 }}>
                  Ethnic groups
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                  56 groups
                </Typography>
              </Box>
              <Box
                sx={{
                  p: is960 ? 1.2 : 1.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: is960 ? '12px' : '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 700, mb: 0.3 }}>
                  Capital
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                  Beijing
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Selected Spot Details */}
          {selectedSpot ? (
            <Box
              sx={{
                flex: 1,
                bgcolor: 'white',
                borderRadius: is960 ? '20px' : '26px',
                p: is960 ? 2 : 2.5,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                border: `2px solid ${orange}30`,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <Box
                sx={{
                  px: is960 ? 1.5 : 2,
                  py: is960 ? 0.6 : 0.75,
                  bgcolor: `${orange}15`,
                  color: orange,
                  borderRadius: '999px',
                  fontSize: is960 ? '0.65rem' : '0.72rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  mb: 1.5,
                }}
              >
                {selectedSpot.category}
              </Box>

              <Typography sx={{ fontSize: is960 ? '1.35rem' : '1.65rem', fontWeight: 900, color: '#1E293B', mb: 0.5 }}>
                {selectedSpot.name}
              </Typography>

              <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: orange, fontWeight: 700, mb: 2 }}>
                {selectedSpot.nameEn}
              </Typography>

              <Box
                sx={{
                  p: is960 ? 1.5 : 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: is960 ? '14px' : '18px',
                  border: '1px solid #E2E8F0',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#94A3B8', fontWeight: 700, mb: 0.5 }}>
                  Region
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                  {selectedSpot.province}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: is960 ? '0.85rem' : '0.95rem',
                  color: '#64748B',
                  fontWeight: 600,
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {selectedSpot.description}
              </Typography>

              {selectedSpot.image && (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: is960 ? '14px' : '18px',
                    overflow: 'hidden',
                    bgcolor: '#F1F5F9',
                    aspectRatio: '16/9',
                  }}
                >
                  <Box
                    component="img"
                    src={selectedSpot.image}
                    alt={selectedSpot.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}

              <ButtonBase
                sx={{
                  mt: 2,
                  py: is960 ? 1.25 : 1.5,
                  bgcolor: orange,
                  color: 'white',
                  borderRadius: is960 ? '14px' : '18px',
                  fontSize: is960 ? '0.88rem' : '1rem',
                  fontWeight: 800,
                  boxShadow: `0 6px 16px ${orange}40`,
                  '&:hover': {
                    bgcolor: '#FF6B3D',
                  },
                }}
              >
                Learn more
              </ButtonBase>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                bgcolor: 'white',
                borderRadius: is960 ? '20px' : '26px',
                p: is960 ? 2 : 2.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '2px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: is960 ? 64 : 80,
                  height: is960 ? 64 : 80,
                  borderRadius: '50%',
                  bgcolor: `${teal}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: is960 ? '1.8rem' : '2.2rem' }}>🗺️</Typography>
              </Box>
              <Typography sx={{ fontSize: is960 ? '1.05rem' : '1.2rem', fontWeight: 800, color: '#1E293B', mb: 1 }}>
                Explore Chinese culture
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#94A3B8', fontWeight: 600, maxWidth: 240 }}>
                Tap a marker on the map to learn about a place.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
}
