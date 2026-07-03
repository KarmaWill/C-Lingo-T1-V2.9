import { useMemo } from 'react';
import {
  buildRubySegments,
  buildRubySegmentsFromText,
  type RubySegment,
} from '../../utils/pinyinRuby';

export interface EbookRubySegment {
  text: string;
  pinyin: string;
  speakable?: boolean;
}

interface EbookRubyLineProps {
  text: string;
  pinyin?: string;
  segments?: EbookRubySegment[];
  showPinyin?: boolean;
  className?: string;
  blankHan?: string;
  blankDisplay?: string;
}

function resolveRubySegments(
  text: string,
  pinyin: string | undefined,
  segments: EbookRubySegment[] | undefined,
): RubySegment[] {
  if (segments?.length) {
    return buildRubySegments(
      text,
      segments.map((s) => ({ chinese: s.text, pinyin: s.pinyin })),
    );
  }
  if (pinyin?.trim()) {
    return buildRubySegmentsFromText(text, pinyin);
  }
  return [{ text, pinyin: '' }];
}

export default function EbookRubyLine({
  text,
  pinyin,
  segments,
  showPinyin = true,
  className = '',
  blankHan,
  blankDisplay,
}: EbookRubyLineProps) {
  const rubySegments = useMemo(
    () => resolveRubySegments(text, pinyin, segments),
    [text, pinyin, segments],
  );

  return (
    <div className={`ebook-ruby-line ${className}`.trim()}>
      {rubySegments.map((segment, index) => {
        const isBlank = blankHan != null && segment.text === blankHan;
        const isPunct = !segment.pinyin && segment.text.trim().length > 0
          && !/[\u4e00-\u9fff]/.test(segment.text);

        if (isBlank) {
          return (
            <span key={`ruby-${index}`} className="ebook-ruby-blank-unit">
              {showPinyin && (
                <span className="ebook-ruby-blank-pinyin">___</span>
              )}
              <span className="ebook-ruby-blank-han">
                {blankDisplay || '____'}
              </span>
            </span>
          );
        }

        if (!segment.pinyin || isPunct) {
          return (
            <span
              key={`ruby-${index}`}
              className="ebook-ruby-punct"
              style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
            >
              {segment.text}
            </span>
          );
        }

        return (
          <span key={`ruby-${index}`} className="ebook-ruby-word">
            <ruby style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
              {segment.text}
              {showPinyin ? (
                <rt style={{ fontFamily: 'OPPO Sans, sans-serif' }}>{segment.pinyin}</rt>
              ) : null}
            </ruby>
          </span>
        );
      })}
    </div>
  );
}
