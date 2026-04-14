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
    name: '北京',
    nameEn: 'Beijing',
    province: '北京市',
    category: '首都',
    description: '中华人民共和国首都，世界著名古都和现代化国际城市',
    position: { top: '32%', left: '58%' },
  },
  {
    id: 'forbidden-city',
    name: '故宫',
    nameEn: 'Forbidden City',
    province: '北京',
    category: '古建筑',
    description: '明清两代的皇家宫殿，世界最大的古代宫殿建筑群',
    position: { top: '34%', left: '60%' },
  },
  {
    id: 'great-wall',
    name: '长城',
    nameEn: 'Great Wall',
    province: '北京',
    category: '历史遗迹',
    description: '世界七大奇迹之一，中国古代的军事防御工程',
    position: { top: '28%', left: '62%' },
  },
  {
    id: 'terracotta',
    name: '兵马俑',
    nameEn: 'Terracotta Army',
    province: '陕西',
    category: '历史遗迹',
    description: '秦始皇陵的陪葬品，世界第八大奇迹',
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
              中国文化地图
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.75rem' : '0.85rem', color: '#64748B', fontWeight: 600 }}>
              Explore Chinese Culture
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
                中国
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
                    {spot.category === '首都' ? '★' : '●'}
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
                首都
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
                文化景点
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
                中国概况
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
                  人口
                </Typography>
                <Typography sx={{ fontSize: is960 ? '1.15rem' : '1.35rem', fontWeight: 900, color: '#1E293B' }}>
                  14亿+
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
                  民族
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                  56个民族
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
                  首都
                </Typography>
                <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                  北京
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
                  所在地区
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
                了解更多
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
                探索中国文化
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.82rem' : '0.92rem', color: '#94A3B8', fontWeight: 600, maxWidth: 240 }}>
                点击地图上的标记点，了解中国的文化景点
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
