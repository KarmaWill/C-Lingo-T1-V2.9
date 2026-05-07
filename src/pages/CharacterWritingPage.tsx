/**
 * Character Writing Practice Page - 汉字书写训练页面
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/InfoOutlined';

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
  const [, setIsDrawing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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

  const handleResetToStart = () => {
    // 回到第一步，重新开始整个书写训练
    setStep(1);
    setIsDrawing(false);
    // TODO: 清空 canvas 内容
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Trace Once';
      case 2:
        return 'Trace Again (No Hints)';
      case 3:
        return 'Write on Your Own';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#F7F7F7',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: is960 ? 5 : 6.5,
        py: is960 ? 2.2 : 2.8,
      }}
    >
      {/* Step Progress */}
      <Box sx={{ display: 'flex', gap: is960 ? 1.2 : 1.5, width: is960 ? 520 : 650, flexShrink: 0, mb: is960 ? 1.8 : 2.4 }}>
        {[1, 2, 3].map((s) => (
          <Box
            key={s}
            sx={{
              flex: 1,
              height: is960 ? 8 : 10,
              borderRadius: '999px',
              bgcolor: s <= step ? teal : '#DADADA',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>

      <ButtonBase
        onClick={() => navigate(-1)}
        aria-label="Close writing practice"
        sx={{
          position: 'absolute',
          top: is960 ? 24 : 31,
          right: is960 ? 22 : 30,
          width: is960 ? 42 : 50,
          height: is960 ? 42 : 50,
          borderRadius: '50%',
          bgcolor: '#E5E7EB',
          color: '#6B7280',
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        <CloseIcon sx={{ fontSize: is960 ? 22 : 26 }} />
      </ButtonBase>

      <ButtonBase
        onClick={() => setShowInfo(!showInfo)}
        aria-label="Writing tips"
        sx={{
          position: 'absolute',
          top: is960 ? 86 : 108,
          right: is960 ? 22 : 30,
          width: is960 ? 42 : 50,
          height: is960 ? 42 : 50,
          borderRadius: '50%',
          color: teal,
          bgcolor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        <InfoIcon sx={{ fontSize: is960 ? 22 : 26 }} />
      </ButtonBase>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: is960 ? 500 : 620,
            height: is960 ? 432 : 528,
            bgcolor: '#FFFFFF',
            borderRadius: is960 ? '24px' : '32px',
            boxShadow: '0 18px 46px rgba(15,23,42,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            px: is960 ? 4 : 5,
            py: is960 ? 1.8 : 2.2,
            overflow: 'visible',
          }}
        >
          <Typography sx={{ fontSize: is960 ? '0.92rem' : '1.08rem', color: '#6B7280', fontWeight: 600, mb: is960 ? 1.3 : 1.8, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
            {getStepTitle() === 'Trace Once' ? 'Trace the gray character outline' : getStepTitle()}
          </Typography>
          <Box
            sx={{
              px: is960 ? 1.6 : 1.95,
              py: is960 ? 0.32 : 0.4,
              mb: is960 ? 0.8 : 1.1,
              borderRadius: '999px',
              bgcolor: '#F94B4B',
              color: '#FFFFFF',
              fontSize: is960 ? '0.88rem' : '1rem',
              fontWeight: 900,
              lineHeight: 1,
              boxShadow: '0 4px 10px rgba(249,75,75,0.18)',
            }}
          >
            1/{charInfo.strokes}
          </Box>

          <Box
            sx={{
              width: is960 ? 300 : 350,
              height: is960 ? 300 : 350,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {/* Outer Border */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid #C9C9C9',
                }}
              />
              
              {/* Vertical Center Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  transform: 'translateX(-50%)',
                  borderLeft: '2px dashed #D0D0D0',
                  bgcolor: 'transparent',
                }}
              />
              
              {/* Horizontal Center Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  transform: 'translateY(-50%)',
                  borderTop: '2px dashed #D0D0D0',
                  bgcolor: 'transparent',
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
                    height: '2px',
                    borderTop: '2px dashed #D0D0D0',
                    bgcolor: 'transparent',
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
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: is960 ? '11.6rem' : '14.2rem',
                  fontWeight: 400,
                  fontFamily: '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif',
                  color: '#9AA8AF',
                  opacity: 0.82,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {character || '你'}
              </Typography>
            )}

            {/* Stroke Direction Hint (for step 1 and 2) */}
            {(step === 1 || step === 2) && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '18%',
                    top: '18%',
                    width: '28%',
                    height: 3,
                    bgcolor: orange,
                    opacity: 0.85,
                    transform: 'rotate(122deg)',
                    transformOrigin: 'left center',
                    borderRadius: '999px',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '16.5%',
                    top: '46%',
                    width: 0,
                    height: 0,
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    borderRight: `13px solid ${orange}`,
                    transform: 'rotate(-32deg)',
                  }}
                />
              </>
            )}

            {/* Canvas Placeholder */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                cursor: 'crosshair',
                zIndex: 1,
              }}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
            >
              {/* TODO: 实际的 Canvas 绘图实现 */}
            </Box>
          </Box>

          <ButtonBase
            onClick={handleResetToStart}
            aria-label="Reset writing"
            sx={{
              width: is960 ? 42 : 50,
              height: is960 ? 42 : 50,
              mt: is960 ? 1.8 : 2.2,
              borderRadius: '50%',
              bgcolor: '#F3F4F6',
              color: '#6B7280',
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            <RefreshIcon sx={{ fontSize: is960 ? 21 : 25 }} />
          </ButtonBase>
        </Box>
      </Box>

      {showInfo && (
        <Box
          sx={{
            position: 'absolute',
            right: is960 ? 92 : 120,
            top: is960 ? 180 : 230,
            width: is960 ? 260 : 320,
            bgcolor: 'rgba(221, 229, 226, 0.98)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${teal}`,
            borderRadius: is960 ? '18px' : '24px',
            p: is960 ? 2 : 2.8,
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(15,23,42,0.18)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.2 : 1.5 }}>
            <Box
              sx={{
                bgcolor: '#F5F5F6',
                borderRadius: is960 ? '14px' : '16px',
                border: '1px solid #D8D8DB',
                px: is960 ? 1.8 : 2.2,
                py: is960 ? 1.4 : 1.8,
              }}
            >
              <Typography sx={{ color: '#A6AEB4', fontSize: is960 ? '0.78rem' : '0.88rem', fontWeight: 500, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                Stroke Count
              </Typography>
              <Typography sx={{ color: orange, fontSize: is960 ? '1.8rem' : '2.2rem', fontWeight: 700, mt: is960 ? 0.4 : 0.5 }}>
                {charInfo.strokes}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: '#F5F5F6',
                borderRadius: is960 ? '14px' : '16px',
                border: '1px solid #D8D8DB',
                px: is960 ? 1.8 : 2.2,
                py: is960 ? 1.4 : 1.8,
              }}
            >
              <Typography sx={{ color: '#A6AEB4', fontSize: is960 ? '0.78rem' : '0.88rem', fontWeight: 500, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                Structure
              </Typography>
              <Typography sx={{ color: '#202428', fontSize: is960 ? '1.1rem' : '1.3rem', fontWeight: 500, lineHeight: 1.2, mt: is960 ? 0.4 : 0.5 }}>
                {charInfo.structure}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: '#F5F5F6',
                borderRadius: is960 ? '14px' : '16px',
                border: '1px solid #D8D8DB',
                px: is960 ? 1.8 : 2.2,
                py: is960 ? 1.4 : 1.8,
              }}
            >
              <Typography sx={{ color: '#A6AEB4', fontSize: is960 ? '0.78rem' : '0.88rem', fontWeight: 500, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                Components
              </Typography>
              <Typography sx={{ color: '#202428', fontSize: is960 ? '1.1rem' : '1.3rem', fontWeight: 500, lineHeight: 1.2, mt: is960 ? 0.4 : 0.5 }}>
                {charInfo.components.join('、')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr', gap: is960 ? 4.5 : 5.6, width: '100%', flexShrink: 0 }}>
        <ButtonBase
          onClick={() => {
            if (step > 1) {
              setStep((step - 1) as 1 | 2 | 3);
            }
          }}
          sx={{
            height: is960 ? 50 : 62,
            borderRadius: is960 ? '16px' : '20px',
            bgcolor: '#FFFFFF',
            color: '#6B7280',
            fontSize: is960 ? '1rem' : '1.18rem',
            fontWeight: 800,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            border: '1px solid #DADADA',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          Previous
        </ButtonBase>
        <ButtonBase
          onClick={handleNextStep}
          sx={{
            height: is960 ? 50 : 62,
            borderRadius: is960 ? '16px' : '20px',
            bgcolor: teal,
            color: 'white',
            fontSize: is960 ? '1rem' : '1.18rem',
            fontWeight: 800,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            boxShadow: `0 8px 20px ${teal}22`,
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          {step === 3 ? 'Complete' : 'Next Step'}
        </ButtonBase>
      </Box>
    </Box>
  );
}
