/**
 * Word-ruby line for reading surfaces (audiobook / podcast).
 * Aligns Chinese ↔ pinyin via GB/T 16159 helpers in pinyinRuby.ts.
 */
import { useMemo } from 'react';
import { Box } from '@mui/material';
import { buildRubySegmentsFromText } from '../utils/pinyinRuby';
import { APP_FONT_FAMILY } from '../theme/appFont';

const KAI_TI = '"KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif';

interface ReadingRubyLineProps {
  chinese: string;
  pinyin?: string;
  showPinyin?: boolean;
  active?: boolean;
  hanziSize?: string | number;
  pinyinSize?: string | number;
}

export default function ReadingRubyLine({
  chinese,
  pinyin = '',
  showPinyin = true,
  active = false,
  hanziSize = '1.8rem',
  pinyinSize = '0.8rem',
}: ReadingRubyLineProps) {
  const segments = useMemo(
    () => buildRubySegmentsFromText(chinese, showPinyin ? pinyin : ''),
    [chinese, pinyin, showPinyin],
  );

  const hanziColor = active ? '#1F2937' : '#6B7280';
  const pinyinColor = active ? '#636E72' : '#9CA3AF';

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        columnGap: '0.42em',
        rowGap: 1.1,
      }}
    >
      {segments.map((segment, index) => {
        const isPunct =
          !segment.pinyin &&
          segment.text.trim().length > 0 &&
          !/[\u4e00-\u9fff]/.test(segment.text);

        if (!segment.pinyin || isPunct) {
          return (
            <Box
              component="span"
              key={`${segment.text}-${index}`}
              sx={{
                color: hanziColor,
                fontFamily: KAI_TI,
                fontSize: hanziSize,
                fontWeight: 600,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {segment.text}
            </Box>
          );
        }

        return (
          <Box
            component="span"
            key={`${segment.text}-${index}`}
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {showPinyin && (
              <Box
                component="span"
                sx={{
                  mb: 0.35,
                  color: pinyinColor,
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: pinyinSize,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {segment.pinyin}
              </Box>
            )}
            <Box
              component="span"
              sx={{
                color: hanziColor,
                fontFamily: KAI_TI,
                fontSize: hanziSize,
                fontWeight: 600,
                lineHeight: 1.45,
                whiteSpace: 'nowrap',
              }}
            >
              {segment.text}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
