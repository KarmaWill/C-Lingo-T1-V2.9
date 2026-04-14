/**
 * Character Writing Practice Page - 汉字书写训练页面
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';

// 汉字笔画信息（示例数据）
const CHARACTER_INFO: Record<string, {
  strokes: number;
  structure: string;
  components: string[];
  tip: string;
}> = {
  '你': { strokes: 7, structure: '左右结构', components: ['亻', '尔'], tip: '左窄右宽，撇捺要舒展' },
  '好': { strokes: 6, structure: '左右结构', components: ['女', '子'], tip: '左右等宽，女字旁要紧凑' },
  '我': { strokes: 7, structure: '独体字', components: ['我'], tip: '斜钩要有力，撇捺要舒展' },
  '很': { strokes: 9, structure: '左右结构', components: ['彳', '艮'], tip: '左窄右宽，右侧要紧凑' },
  '吗': { strokes: 6, structure: '左右结构', components: ['口', '马'], tip: '左小右大，马字要舒展' },
};

export default function CharacterWritingPage() {
  const navigate = useNavigate();
  const { character } = useParams<{ character: string }>();
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const orange = '#FF7A45';
  const teal = '#14B8A6';
  
  const charInfo = CHARACTER_INFO[character || '你'] || CHARACTER_INFO['你'];

  const handleNextStep = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      // 完成第3步后返回生词学习页面
      navigate(-1);
    }
  };

  const handleClearCanvas = () => {
    // 只清空当前步骤的画布，不改变step
    setIsDrawing(false);
    // TODO: 清空 canvas 内容
  };

  const handleResetToStart = () => {
    // 回到第一步，重新开始整个书写训练
    setStep(1);
    setIsDrawing(false);
    setShowInfo(true);
    // TODO: 清空 canvas 内容
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return '跟着描一遍';
      case 2:
        return '再描一遍（无提示）';
      case 3:
        return '自己默写';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FDF6E9',
        p: is960 ? 2.5 : 3.5,
        gap: is960 ? 2 : 2.5,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: is960 ? 44 : 52,
              height: is960 ? 44 : 52,
              borderRadius: is960 ? '14px' : '16px',
              bgcolor: teal,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: is960 ? '1.5rem' : '1.85rem',
              fontWeight: 900,
            }}
          >
            {character || '你'}
          </Box>
          <Box>
            <Typography sx={{ fontSize: is960 ? '1.2rem' : '1.45rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
              汉字书写训练
            </Typography>
            <Typography sx={{ fontSize: is960 ? '0.78rem' : '0.88rem', color: '#64748B', fontWeight: 600 }}>
              {getStepTitle()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ButtonBase
            onClick={() => setShowInfo(!showInfo)}
            sx={{
              width: is960 ? 36 : 40,
              height: is960 ? 36 : 40,
              borderRadius: '50%',
              bgcolor: showInfo ? `${teal}20` : 'rgba(0,0,0,0.04)',
              color: showInfo ? teal : '#64748B',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <InfoIcon sx={{ fontSize: is960 ? 20 : 22 }} />
          </ButtonBase>
          <ButtonBase
            onClick={handleResetToStart}
            sx={{
              width: is960 ? 36 : 40,
              height: is960 ? 36 : 40,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#64748B',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <RefreshIcon sx={{ fontSize: is960 ? 20 : 22 }} />
          </ButtonBase>
          <ButtonBase
            onClick={() => navigate(-1)}
            sx={{
              width: is960 ? 36 : 40,
              height: is960 ? 36 : 40,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#64748B',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <CloseIcon sx={{ fontSize: is960 ? 20 : 22 }} />
          </ButtonBase>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          gap: is960 ? 2 : 2.5,
          minHeight: 0,
        }}
      >
        {/* Character Info Panel */}
        {showInfo && (
          <Box
            sx={{
              width: is960 ? 220 : 280,
              flexShrink: 0,
              bgcolor: 'white',
              borderRadius: is960 ? '20px' : '26px',
              p: is960 ? 2 : 2.5,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '2px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: is960 ? 1.5 : 2,
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon sx={{ fontSize: is960 ? 20 : 24, color: teal }} />
              <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#1E293B' }}>
                书写指南
              </Typography>
            </Box>

            <Box
              sx={{
                p: is960 ? 1.5 : 2,
                bgcolor: `${teal}08`,
                borderRadius: is960 ? '14px' : '18px',
                border: `2px solid ${teal}30`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: teal, fontWeight: 800 }}>
                  笔画数
                </Typography>
                <Typography sx={{ fontSize: is960 ? '1.8rem' : '2.2rem', fontWeight: 900, color: teal, lineHeight: 1 }}>
                  {charInfo.strokes}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: is960 ? '0.68rem' : '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {charInfo.strokes} strokes
              </Typography>
            </Box>

            <Box
              sx={{
                p: is960 ? 1.5 : 2,
                bgcolor: '#F8FAFC',
                borderRadius: is960 ? '14px' : '18px',
                border: '2px solid #E2E8F0',
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#94A3B8', fontWeight: 800, mb: 0.75 }}>
                字形结构
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.95rem' : '1.08rem', fontWeight: 700, color: '#1E293B' }}>
                {charInfo.structure}
              </Typography>
            </Box>

            <Box
              sx={{
                p: is960 ? 1.5 : 2,
                bgcolor: '#F8FAFC',
                borderRadius: is960 ? '14px' : '18px',
                border: '2px solid #E2E8F0',
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: '#94A3B8', fontWeight: 800, mb: 0.75 }}>
                部件组成
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {charInfo.components.map((comp, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: is960 ? 1.2 : 1.5,
                      py: is960 ? 0.5 : 0.6,
                      bgcolor: 'white',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: is960 ? '1rem' : '1.2rem',
                      fontWeight: 800,
                      color: '#1E293B',
                    }}
                  >
                    {comp}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                p: is960 ? 1.5 : 2,
                bgcolor: `${orange}08`,
                borderRadius: is960 ? '14px' : '18px',
                border: `2px solid ${orange}30`,
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.72rem' : '0.8rem', color: orange, fontWeight: 800, mb: 0.75 }}>
                书写要点
              </Typography>
              <Typography sx={{ fontSize: is960 ? '0.85rem' : '0.95rem', color: '#64748B', fontWeight: 600, lineHeight: 1.5 }}>
                {charInfo.tip}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Writing Canvas Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: is960 ? 1.5 : 2,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          {/* Step Progress */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: is960 ? 420 : 560, flexShrink: 0 }}>
            {[1, 2, 3].map((s) => (
              <Box
                key={s}
                sx={{
                  flex: 1,
                  height: is960 ? 7 : 8,
                  borderRadius: '999px',
                  bgcolor: s <= step ? teal : '#E2E8F0',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s < step && <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />}
              </Box>
            ))}
          </Box>

          {/* Square Canvas Container */}
          <Box
            sx={{
              width: '100%',
              maxWidth: is960 ? 420 : 560,
              aspectRatio: '1',
              bgcolor: 'white',
              borderRadius: is960 ? '24px' : '30px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              border: '2px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: is960 ? 2 : 3,
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Tian Zi Ge (田字格) Background */}
            <Box
              sx={{
                position: 'absolute',
                inset: is960 ? 20 : 28,
                pointerEvents: 'none',
              }}
            >
              {/* Outer Border */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid #94A3B8',
                  borderRadius: '4px',
                }}
              />
              
              {/* Vertical Center Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '1.5px',
                  bgcolor: '#CBD5E1',
                  transform: 'translateX(-50%)',
                }}
              />
              
              {/* Horizontal Center Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1.5px',
                  bgcolor: '#CBD5E1',
                  transform: 'translateY(-50%)',
                }}
              />
              
              {/* Diagonal Lines */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: '141.42%',
                    height: '1px',
                    bgcolor: '#E2E8F0',
                    top: '50%',
                    left: '50%',
                  },
                  '&::before': {
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                  },
                  '&::after': {
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                  },
                }}
              />
            </Box>

            {/* Character Guide (only for step 1) */}
            {step === 1 && (
              <Typography
                sx={{
                  position: 'absolute',
                  fontSize: is960 ? '20rem' : '28rem',
                  fontWeight: 300,
                  color: '#E2E8F0',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {character || '你'}
              </Typography>
            )}

            {/* Stroke Order Hints with Count */}
            {step <= 2 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: is960 ? 12 : 16,
                  left: is960 ? 12 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    px: is960 ? 1.2 : 1.5,
                    py: is960 ? 0.5 : 0.6,
                    bgcolor: `${orange}`,
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: is960 ? '0.68rem' : '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {charInfo.strokes}笔
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: Math.min(charInfo.strokes, 8) }, (_, i) => i + 1).map((num) => (
                    <Box
                      key={num}
                      sx={{
                        width: is960 ? 24 : 28,
                        height: is960 ? 24 : 28,
                        borderRadius: '50%',
                        bgcolor: num === 1 ? orange : '#F8FAFC',
                        color: num === 1 ? 'white' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: is960 ? '0.65rem' : '0.72rem',
                        fontWeight: 800,
                        border: num === 1 ? 'none' : '2px solid #E2E8F0',
                      }}
                    >
                      {num}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Canvas Placeholder */}
            <Box
              sx={{
                position: 'absolute',
                inset: is960 ? 20 : 28,
                cursor: 'crosshair',
                zIndex: 1,
              }}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
            >
              {/* TODO: 实际的 Canvas 绘图实现 */}
            </Box>

            {/* Instructions */}
            <Box
              sx={{
                position: 'absolute',
                bottom: is960 ? 12 : 16,
                left: is960 ? 12 : 16,
                right: is960 ? 12 : 16,
                px: is960 ? 2 : 2.5,
                py: is960 ? 1 : 1.25,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: is960 ? '12px' : '16px',
                border: '2px solid #E2E8F0',
              }}
            >
              <Typography
                sx={{
                  fontSize: is960 ? '0.78rem' : '0.88rem',
                  color: '#64748B',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {step === 1 ? '👆 跟着灰色轮廓描写汉字' : step === 2 ? '✍️ 不看提示再写一遍' : '📝 凭记忆默写汉字'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <ButtonBase
          onClick={handleClearCanvas}
          sx={{
            flex: 1,
            py: is960 ? 1.25 : 1.5,
            borderRadius: is960 ? '16px' : '20px',
            bgcolor: 'white',
            color: '#64748B',
            fontSize: is960 ? '0.95rem' : '1.08rem',
            fontWeight: 800,
            border: '2px solid #E2E8F0',
            '&:hover': {
              borderColor: '#CBD5E1',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          清空重写
        </ButtonBase>
        <ButtonBase
          onClick={handleNextStep}
          sx={{
            flex: 2,
            py: is960 ? 1.25 : 1.5,
            borderRadius: is960 ? '16px' : '20px',
            bgcolor: teal,
            color: 'white',
            fontSize: is960 ? '0.95rem' : '1.08rem',
            fontWeight: 800,
            boxShadow: `0 8px 20px ${teal}40`,
            '&:hover': {
              bgcolor: '#0F9D8E',
            },
          }}
        >
          {step === 3 ? '完成' : '下一步'}
        </ButtonBase>
      </Box>
    </Box>
  );
}
