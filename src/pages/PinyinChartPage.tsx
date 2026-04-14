import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function PinyinChartPage() {
  const navigate = useNavigate();
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is1920x1125 = screenSize === '1920x1125'

  // Initial Consonants - 19 elements in 5 columns
  const initials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
  const finals = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'ia', 'iao', 'ua', 'uo', 'an', 'en', 'in', 'un', 'ün', 'ian', 'uan', 'üan', 'ang', 'eng', 'ing', 'ong'];
  const tones = [
    { char: 'ā', label: '1st Tone' },
    { char: 'á', label: '2nd Tone' },
    { char: 'ǎ', label: '3rd Tone' },
    { char: 'à', label: '4th Tone' },
  ];

  const [selectedInitial, setSelectedInitial] = useState<string>('b');
  const [selectedFinal, setSelectedFinal] = useState<string>('a');

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'hidden', 
      p: is960 ? 2 : (is1920x1125 ? 4 : 3), 
      bgcolor: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        mb: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
        flexShrink: 0,
      }}>
        {/* Back Button */}
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: 0,
            width: is960 ? 40 : (is1920x1125 ? 56 : 48),
            height: is960 ? 40 : (is1920x1125 ? 56 : 48),
            borderRadius: '50%',
            bgcolor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:active': { transform: 'scale(0.95)' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: is960 ? 20 : (is1920x1125 ? 28 : 24), color: '#1F2937' }} />
        </ButtonBase>
        
        {/* Title */}
        <Typography sx={{ 
          fontWeight: 700, 
          fontSize: is960 ? '1.25rem' : (is1920x1125 ? '2rem' : '1.5rem'),
          color: '#1F2937',
        }}>
          Pinyin Chart
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
        minHeight: 0,
      }}>
        {/* Top Row: Initial Consonants and Finals */}
        <Box sx={{ 
          display: 'flex', 
          gap: is960 ? 2 : (is1920x1125 ? 3 : 2.5),
          flex: 1,
          minHeight: 0,
        }}>
          {/* Initial Consonants Card */}
          <Box sx={{ 
            flex: 1, 
            bgcolor: '#F7F7F7', 
            borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'), 
            p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Title */}
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
              fontWeight: 900,
              color: '#E88B52',
              mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
            }}>
              Initial Consonants
            </Typography>
            
            {/* Buttons Grid */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1),
              flex: 1,
              overflowY: 'auto',
            }}>
              {initials.map(initial => {
                const isSelected = selectedInitial === initial;
                return (
                  <ButtonBase
                    key={initial}
                    onClick={() => setSelectedInitial(initial)}
                    sx={{
                      py: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: isSelected ? '#E88B52' : 'white',
                      color: isSelected ? 'white' : '#E88B52',
                      border: '1px solid',
                      borderColor: isSelected ? '#E88B52' : '#E88B52',
                      fontWeight: 700,
                      fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'),
                      transition: 'all 0.2s',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    {initial}
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>

          {/* Finals Card */}
          <Box sx={{ 
            flex: 1, 
            bgcolor: '#F7F7F7', 
            borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'), 
            p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Title */}
            <Typography sx={{ 
              fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
              fontWeight: 900,
              color: '#008B8B',
              mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
            }}>
              Finals
            </Typography>
            
            {/* Buttons Grid - Scrollable */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: is960 ? 0.75 : (is1920x1125 ? 1.25 : 1),
              flex: 1,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: is960 ? 4 : (is1920x1125 ? 8 : 6),
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: '#E5E5E5',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#C0C0C0',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#A0A0A0',
                },
              },
            }}>
              {finals.map(final => {
                const isSelected = selectedFinal === final;
                return (
                  <ButtonBase
                    key={final}
                    onClick={() => setSelectedFinal(final)}
                    sx={{
                      py: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
                      borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                      bgcolor: isSelected ? '#008B8B' : 'white',
                      color: isSelected ? 'white' : '#008B8B',
                      border: '1px solid',
                      borderColor: isSelected ? '#008B8B' : '#008B8B',
                      fontWeight: 700,
                      fontSize: is960 ? '0.875rem' : (is1920x1125 ? '1.125rem' : '1rem'),
                      transition: 'all 0.2s',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    {final}
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Bottom: Tones Card */}
        <Box sx={{ 
          bgcolor: '#F7F7F7', 
          borderRadius: is960 ? '20px' : (is1920x1125 ? '32px' : '24px'), 
          p: is960 ? 2 : (is1920x1125 ? 3.5 : 3),
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          flexShrink: 0,
        }}>
          {/* Title */}
          <Typography sx={{ 
            fontSize: is960 ? '1rem' : (is1920x1125 ? '1.5rem' : '1.25rem'),
            fontWeight: 900,
            color: '#3D68B3',
            mb: is960 ? 1.5 : (is1920x1125 ? 2 : 1.75),
          }}>
            Tones
          </Typography>
          
          {/* Tones Buttons */}
          <Box sx={{ 
            display: 'flex',
            gap: is960 ? 1 : (is1920x1125 ? 1.5 : 1.25),
          }}>
            {tones.map((tone, idx) => (
              <ButtonBase
                key={idx}
                sx={{
                  flex: 1,
                  py: is960 ? 1.5 : (is1920x1125 ? 2.5 : 2),
                  borderRadius: is960 ? '12px' : (is1920x1125 ? '16px' : '14px'),
                  bgcolor: 'white',
                  color: '#3D68B3',
                  border: '1px solid',
                  borderColor: '#3D68B3',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: is960 ? 0.5 : (is1920x1125 ? 0.75 : 0.625),
                  transition: 'all 0.2s',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Typography sx={{
                  fontSize: is960 ? '1.75rem' : (is1920x1125 ? '2.75rem' : '2.25rem'),
                  fontWeight: 900,
                  color: '#3D68B3',
                  lineHeight: 1,
                }}>
                  {tone.char}
                </Typography>
                <Typography sx={{
                  fontSize: is960 ? '0.65rem' : (is1920x1125 ? '0.875rem' : '0.75rem'),
                  fontWeight: 700,
                  color: '#3D68B3',
                }}>
                  {tone.label}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
