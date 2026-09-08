import React, { useMemo } from 'react';
import { buildRubySegments, type PinyinWordSegment } from '../utils/pinyinRuby';
import { APP_FONT_FAMILY } from '../theme/appFont';

interface PinyinRubyTextProps {
  original: string;
  words: PinyinWordSegment[];
  className?: string;
  hanziClassName?: string;
  pinyinClassName?: string;
}

const PinyinRubyText: React.FC<PinyinRubyTextProps> = ({
  original,
  words,
  className = '',
  hanziClassName = 'text-[2rem] font-bold text-white leading-none',
  pinyinClassName = 'text-sm font-medium text-emerald-400 tracking-wide leading-none mb-1.5 whitespace-nowrap',
}) => {
  const segments = useMemo(() => buildRubySegments(original, words), [original, words]);

  return (
    <div className={`flex flex-wrap items-end gap-x-3 gap-y-4 ${className}`}>
      {segments.map((segment, index) => {
        if (!segment.pinyin) {
          return (
            <span
              key={`${segment.text}-${index}`}
              className={hanziClassName}
              style={{ fontFamily: 'KaiTi, STKaiti, SimKai, serif' }}
            >
              {segment.text}
            </span>
          );
        }

        return (
          <span
            key={`${segment.text}-${index}`}
            className="inline-flex flex-col items-center justify-end text-center"
          >
            <span
              className={pinyinClassName}
              style={{ fontFamily: APP_FONT_FAMILY }}
            >
              {segment.pinyin}
            </span>
            <span
              className={hanziClassName}
              style={{ fontFamily: 'KaiTi, STKaiti, SimKai, serif' }}
            >
              {segment.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export default PinyinRubyText;
