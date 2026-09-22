/**
 * 三阶段练字卡：跟随轮廓描写 → 无提示再写 → 凭记忆默写。
 * 田字格必须保持正方形；每次 pointer down/up 记为一笔。
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import RefreshIcon from '@mui/icons-material/Refresh'
import { APP_FONT_FAMILY } from '../../theme/appFont'
import { APP_SCREEN_SIZE, FIGMA_FONT, figmaPx } from '../../utils/figmaScale'
import { loadHappyChinese2Content } from '../../data/happyChinese2'

type WritingStep = 1 | 2 | 3

interface CharacterInfo {
  strokes: number
  structure: string
  components: string[]
}

const CHARACTER_INFO: Record<string, CharacterInfo> = {
  你: { strokes: 7, structure: '左右结构', components: ['亻', '尔'] },
  姓: { strokes: 8, structure: '左右结构', components: ['女', '生'] },
  好: { strokes: 6, structure: '左右结构', components: ['女', '子'] },
  我: { strokes: 7, structure: '独体字', components: ['我'] },
  很: { strokes: 9, structure: '左右结构', components: ['彳', '艮'] },
  吗: { strokes: 6, structure: '左右结构', components: ['口', '马'] },
  一: { strokes: 1, structure: '独体字', components: ['一'] },
  十: { strokes: 2, structure: '独体字', components: ['十'] },
  人: { strokes: 2, structure: '独体字', components: ['人'] },
  大: { strokes: 3, structure: '独体字', components: ['大'] },
  下: { strokes: 3, structure: '独体字', components: ['下'] },
  地: { strokes: 6, structure: '左右结构', components: ['土', '也'] },
  口: { strokes: 3, structure: '独体字', components: ['口'] },
  小: { strokes: 3, structure: '独体字', components: ['小'] },
  河: { strokes: 8, structure: '左右结构', components: ['氵', '可'] },
  树: { strokes: 9, structure: '左中右结构', components: ['木', '对'] },
  说: { strokes: 9, structure: '左右结构', components: ['讠', '兑'] },
  打: { strokes: 5, structure: '左右结构', components: ['扌', '丁'] },
  字: { strokes: 6, structure: '上下结构', components: ['宀', '子'] },
  国: { strokes: 8, structure: '全包围结构', components: ['囗', '玉'] },
  班: { strokes: 10, structure: '左中右结构', components: ['王', '丿', '王'] },
  水: { strokes: 4, structure: '独体字', components: ['水'] },
  茶: { strokes: 9, structure: '上下结构', components: ['艹', '余'] },
  这: { strokes: 7, structure: '半包围结构', components: ['辶', '文'] },
  是: { strokes: 9, structure: '上下结构', components: ['日', '疋'] },
  不: { strokes: 4, structure: '独体字', components: ['不'] },
  叫: { strokes: 5, structure: '左右结构', components: ['口', '丩'] },
  猫: { strokes: 11, structure: '左右结构', components: ['犭', '苗'] },
  狗: { strokes: 8, structure: '左右结构', components: ['犭', '句'] },
  谁: { strokes: 10, structure: '左右结构', components: ['讠', '隹'] },
  他: { strokes: 5, structure: '左右结构', components: ['亻', '也'] },
  她: { strokes: 6, structure: '左右结构', components: ['女', '也'] },
}

const STEP_COPY: Record<WritingStep, string> = {
  1: 'Trace the gray character outline',
  2: 'Write again without the character hint',
  3: 'Write the character from memory',
}

const CHAR = '#2188FE'
const CHAR_SOFT = '#EEF6FF'
const ORANGE = '#FF6B35'
const INK = '#2D3436'
const HINT = '#A7B3B8'
const LINE = '#E0E0DF'
const PINYIN_FONT = '"FZPinYinHandwriting", "Google Sans Flex Variable", "Google Sans Flex", sans-serif'
const KAI_FONT = '"FZKai-Z03S", "FZNewKai GB18030L2", "KaiTi", "STKaiti", "BiauKai", "DFKai-SB", "TW-Kai", "SimKai", serif'

export type WritingEntry = {
  character: string
  pinyin?: string
  meaning?: string
}

function normalizeQueue(input: Array<string | WritingEntry>): WritingEntry[] {
  const entries = input
    .map((item) => (typeof item === 'string' ? { character: item } : item))
    .filter((item) => item.character.trim())
  return entries.length > 0 ? entries : [{ character: '你' }]
}

export function CharacterWritingPractice({
  characters,
  initialIndex = 0,
  onClose,
  finishLabel = 'Done',
}: {
  characters: Array<string | WritingEntry>
  initialIndex?: number
  onClose: () => void
  finishLabel?: string
}) {
  const queue = useMemo(() => normalizeQueue(characters), [characters])
  const p = (value: number) => figmaPx(value, APP_SCREEN_SIZE)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const drawingRef = useRef(false)
  const movedRef = useRef(false)
  const previousPointRef = useRef<{ x: number; y: number } | null>(null)
  const [charIndex, setCharIndex] = useState(() => Math.min(Math.max(0, initialIndex), queue.length - 1))
  const [step, setStep] = useState<WritingStep>(1)
  const [strokeCount, setStrokeCount] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [packetInfo, setPacketInfo] = useState<CharacterInfo | null>(null)

  const currentEntry = queue[charIndex] || queue[0]
  const character = currentEntry.character
  const isQueue = queue.length > 1

  const charInfo = useMemo<CharacterInfo>(() => {
    return (
      packetInfo ??
      CHARACTER_INFO[character] ?? {
        strokes: 7,
        structure: '单字结构',
        components: [character],
      }
    )
  }, [character, packetInfo])
  const stepComplete = strokeCount >= charInfo.strokes
  const displayedStroke = Math.min(strokeCount + 1, charInfo.strokes)
  const canGoPrevious = step > 1 || charIndex > 0
  const isLastCharacter = charIndex >= queue.length - 1

  useEffect(() => {
    let active = true
    setPacketInfo(null)
    loadHappyChinese2Content()
      .then((content) => {
        if (!active) return
        for (const lesson of Object.values(content)) {
          const item = [...(lesson.chars ?? []), ...(lesson.vocab ?? [])].find(
            (candidate) => candidate.text.zh === character,
          )
          if (item?.strokes) {
            setPacketInfo({
              strokes: item.strokes,
              structure: item.structure?.zh || '单字结构',
              components: item.components?.length ? item.components : [character],
            })
            return
          }
        }
      })
      .catch(() => {
        // 离线包不可用时保留本地兜底，不阻断书写。
      })
    return () => {
      active = false
    }
  }, [character])

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const context = canvas.getContext('2d')
    context?.setTransform(dpr, 0, 0, dpr, 0, 0)
    setStrokeCount(0)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(prepareCanvas)
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(frame)
    }
    const observer = new ResizeObserver(prepareCanvas)
    observer.observe(canvas)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [prepareCanvas])

  useEffect(() => {
    prepareCanvas()
  }, [step, character, prepareCanvas])

  const clearCurrentWriting = useCallback(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) {
      const dpr = window.devicePixelRatio || 1
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    }
    drawingRef.current = false
    movedRef.current = false
    previousPointRef.current = null
    setStrokeCount(0)
  }, [])

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (strokeCount >= charInfo.strokes) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = pointFromEvent(event)
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.strokeStyle = step === 1 ? ORANGE : INK
    context.lineWidth = Math.max(7, event.currentTarget.clientWidth * 0.018)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    drawingRef.current = true
    movedRef.current = false
    previousPointRef.current = point
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    event.preventDefault()
    const point = pointFromEvent(event)
    const previous = previousPointRef.current
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) < 1.5) return
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    context.lineTo(point.x, point.y)
    context.stroke()
    movedRef.current = true
    previousPointRef.current = point
  }

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    event.preventDefault()
    drawingRef.current = false
    previousPointRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (movedRef.current) {
      setStrokeCount((count) => Math.min(count + 1, charInfo.strokes))
    }
    movedRef.current = false
  }

  useEffect(() => {
    if (!listOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setListOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [listOpen])

  const goToCharacter = (nextIndex: number, nextStep: WritingStep = 1) => {
    setShowInfo(false)
    setCharIndex(nextIndex)
    setStep(nextStep)
  }

  const changeStep = (nextStep: WritingStep) => {
    setShowInfo(false)
    setStep(nextStep)
  }

  const handlePrevious = () => {
    if (step > 1) {
      changeStep((step - 1) as WritingStep)
      return
    }
    if (charIndex > 0) goToCharacter(charIndex - 1)
  }

  const handleNext = () => {
    if (!stepComplete) return
    if (step < 3) {
      changeStep((step + 1) as WritingStep)
      return
    }
    if (!isLastCharacter) {
      goToCharacter(charIndex + 1)
      return
    }
    onClose()
  }

  const nextLabel = step < 3 ? 'Next Step' : isLastCharacter ? finishLabel : 'Next Character'

  const controlButtonSx = {
    width: p(80),
    height: p(80),
    minWidth: p(80),
    borderRadius: `${p(16)}px`,
    border: '1.6px solid #E0E0DF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        bgcolor: '#FFFFFF',
        color: INK,
        px: `${p(64)}px`,
        py: `${p(24)}px`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: APP_FONT_FAMILY,
      }}
    >
      <Box
        ref={listRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: p(80),
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: `${p(24)}px`,
          zIndex: 6,
        }}
      >
        {isQueue && (
          <ButtonBase
            onClick={() => {
              setShowInfo(false)
              setListOpen((open) => !open)
            }}
            aria-label="Character list"
            aria-expanded={listOpen}
            aria-pressed={listOpen}
            sx={{
              ...controlButtonSx,
              flexShrink: 0,
              bgcolor: listOpen ? CHAR_SOFT : '#FFFFFF',
              color: CHAR,
              borderColor: listOpen ? CHAR : LINE,
              flexDirection: 'column',
              gap: `${p(2)}px`,
              '&:active': { transform: 'scale(0.97)' },
              '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(3) },
            }}
          >
            <Typography
              sx={{
                fontFamily: KAI_FONT,
                fontSize: p(28),
                lineHeight: 1,
                color: 'inherit',
              }}
            >
              {character}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: p(22),
                color: listOpen ? CHAR : '#636E72',
                transform: listOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 180ms ease',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            />
          </ButtonBase>
        )}

        <Box
          aria-label={isQueue ? `Character ${charIndex + 1} of ${queue.length}, writing step ${step} of 3` : `Writing step ${step} of 3`}
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '557fr 557fr 410fr',
            gap: `${p(16)}px`,
          }}
        >
          {([1, 2, 3] as WritingStep[]).map((item) => (
            <Box
              key={item}
              sx={{
                height: p(12),
                overflow: 'hidden',
                borderRadius: 999,
                bgcolor: 'rgba(226,232,240,0.6)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit',
                  bgcolor: CHAR,
                  boxShadow: '0 1px 3px rgba(33,136,254,0.18)',
                  transform: `scaleX(${item <= step ? 1 : 0})`,
                  transformOrigin: 'left center',
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: `${p(24)}px`, flexShrink: 0 }}>
          <ButtonBase
            onClick={() => {
              setListOpen(false)
              setShowInfo((visible) => !visible)
            }}
            aria-label="Character information"
            aria-pressed={showInfo}
            sx={{
              ...controlButtonSx,
              bgcolor: showInfo ? CHAR_SOFT : '#FFFFFF',
              color: showInfo ? CHAR : '#636E72',
              borderColor: showInfo ? CHAR : LINE,
              '&:active': { transform: 'scale(0.97)' },
              '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(3) },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: p(38) }} />
          </ButtonBase>
          <ButtonBase
            onClick={onClose}
            aria-label="Close writing practice"
            sx={{
              ...controlButtonSx,
              bgcolor: '#FFFFFF',
              color: '#45556C',
              '&:active': { transform: 'scale(0.97)' },
              '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(3) },
            }}
          >
            <CloseIcon sx={{ fontSize: p(38) }} />
          </ButtonBase>
        </Box>

        {isQueue && listOpen && (
          <Box
            role="listbox"
            aria-label="Characters to write"
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `calc(100% + ${p(16)}px)`,
              maxHeight: p(420),
              overflow: 'auto',
              boxSizing: 'border-box',
              p: `${p(24)}px`,
              bgcolor: '#FFFFFF',
              border: `1px solid ${LINE}`,
              borderRadius: `${p(24)}px`,
              boxShadow: '0 8px 24px rgba(45,52,54,0.10)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${p(16)}px`,
              '&::-webkit-scrollbar': { width: p(8) },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#E0E0DF', borderRadius: 999 },
            }}
          >
            {queue.map((entry, index) => {
              const current = index === charIndex
              return (
                <ButtonBase
                  key={`${entry.character}-${index}`}
                  role="option"
                  aria-selected={current}
                  onClick={() => {
                    goToCharacter(index)
                    setListOpen(false)
                  }}
                  sx={{
                    width: p(188),
                    minHeight: p(120),
                    boxSizing: 'border-box',
                    px: `${p(12)}px`,
                    py: `${p(10)}px`,
                    borderRadius: `${p(24)}px`,
                    border: current ? `2px solid ${CHAR}` : `1px solid ${LINE}`,
                    bgcolor: current ? CHAR_SOFT : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:active': { transform: 'scale(0.98)' },
                    '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(3) },
                  }}
                >
                  {entry.pinyin && (
                    <Typography
                      sx={{
                        width: '100%',
                        fontFamily: PINYIN_FONT,
                        fontSize: p(20),
                        lineHeight: 1.4,
                        color: INK,
                        textAlign: 'center',
                      }}
                    >
                      {entry.pinyin}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      width: '100%',
                      fontFamily: KAI_FONT,
                      fontSize: p(40),
                      lineHeight: 1.2,
                      color: INK,
                      textAlign: 'center',
                    }}
                  >
                    {entry.character}
                  </Typography>
                  {entry.meaning && (
                    <Typography
                      sx={{
                        width: '100%',
                        fontFamily: FIGMA_FONT,
                        fontSize: p(20),
                        lineHeight: 1.4,
                        color: HINT,
                        textAlign: 'center',
                      }}
                    >
                      {entry.meaning}
                    </Typography>
                  )}
                </ButtonBase>
              )
            })}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: '100%',
          height: p(144),
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${p(8)}px`,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: FIGMA_FONT,
            fontSize: p(48),
            lineHeight: 1.6,
            fontWeight: 700,
            color: INK,
            textAlign: 'center',
          }}
        >
          {STEP_COPY[step]}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${p(12)}px` }}>
          {isQueue && (
            <Typography
              sx={{
                fontFamily: FIGMA_FONT,
                fontSize: p(24),
                lineHeight: 1.6,
                color: '#A7B3B8',
              }}
            >
              {charIndex + 1}/{queue.length}
            </Typography>
          )}
          <Box
            sx={{
              minWidth: p(102),
              height: p(56),
              px: `${p(20)}px`,
              boxSizing: 'border-box',
              borderRadius: 999,
              bgcolor: CHAR,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: p(24),
              lineHeight: 1,
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayedStroke}/{charInfo.strokes}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: p(600),
            height: p(710),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${p(30)}px`,
          }}
        >
          <Box
            sx={{
              width: p(600),
              maxWidth: '100%',
              aspectRatio: '1 / 1',
              flexShrink: 0,
              position: 'relative',
              boxSizing: 'border-box',
              bgcolor: '#FFFFFF',
              border: '1.6px solid #DBECFF',
              borderRadius: `${p(24)}px`,
              boxShadow: '0 25px 50px -12px rgba(33,136,254,0.10)',
              overflow: 'hidden',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: p(2),
                border: `${Math.max(1, p(2))}px dashed #E2E8F0`,
                boxSizing: 'border-box',
                pointerEvents: 'none',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  zIndex: 0,
                },
                '&::before': {
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  borderLeft: `${Math.max(1, p(2))}px dashed #CBD5E1`,
                },
                '&::after': {
                  top: '50%',
                  left: 0,
                  right: 0,
                  borderTop: `${Math.max(1, p(2))}px dashed #CBD5E1`,
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: '142%',
                    left: '50%',
                    top: '50%',
                    borderTop: `${Math.max(1, p(2))}px dashed #E2E8F0`,
                    transformOrigin: 'center',
                  },
                  '&::before': { transform: 'translate(-50%, -50%) rotate(45deg)' },
                  '&::after': { transform: 'translate(-50%, -50%) rotate(-45deg)' },
                }}
              />
            </Box>

            {step === 1 && (
              <Typography
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: '3.3%',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: KAI_FONT,
                  fontSize: p(500),
                  lineHeight: 1,
                  fontWeight: 400,
                  color: '#A7B3B8',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {character}
              </Typography>
            )}

            <Box
              component="canvas"
              ref={canvasRef}
              role="application"
              tabIndex={0}
              aria-label={`Write ${character}, stroke ${displayedStroke} of ${charInfo.strokes}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                width: '100%',
                height: '100%',
                cursor: strokeCount >= charInfo.strokes ? 'default' : 'crosshair',
                touchAction: 'none',
              }}
            />
          </Box>

          <ButtonBase
            onClick={clearCurrentWriting}
            aria-label="Clear current writing"
            sx={{
              width: p(80),
              height: p(80),
              minWidth: p(80),
              borderRadius: '50%',
              bgcolor: '#FFFFFF',
              border: '1.6px solid #E2E8F0',
              color: '#62748E',
              '&:active': { transform: 'scale(0.96)' },
              '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(4) },
            }}
          >
            <RefreshIcon sx={{ fontSize: p(36) }} />
          </ButtonBase>
        </Box>

        {showInfo && (
          <Box
            sx={{
              position: 'absolute',
              right: p(63),
              top: p(-120),
              zIndex: 5,
              width: p(480),
              height: p(645),
              boxSizing: 'border-box',
              p: `${p(48)}px ${p(32)}px`,
              border: '2px solid #E0E0DF',
              borderRadius: `${p(24)}px`,
              bgcolor: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: `${p(24)}px`,
            }}
          >
            {[
              { label: 'Stroke Count', value: String(charInfo.strokes), large: true },
              { label: 'Structure', value: charInfo.structure },
              { label: 'Components', value: charInfo.components.join('、') },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  flex: item.large ? '193 1 0' : '154 1 0',
                  minHeight: 0,
                  boxSizing: 'border-box',
                  p: `${p(24)}px`,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #E0E0DF',
                  borderRadius: `${p(16)}px`,
                }}
              >
                <Typography sx={{ fontSize: p(28), lineHeight: 1.6, color: '#6A7282' }}>
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    mt: `${p(8)}px`,
                    fontSize: item.large ? p(56) : p(32),
                    lineHeight: 1.6,
                    fontWeight: item.large ? 700 : 400,
                    color: item.large ? CHAR : '#1E2939',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: '100%',
          height: p(101),
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: `${p(570)}px minmax(0, 1fr)`,
          gap: `${p(24)}px`,
        }}
      >
        <ButtonBase
          disabled={!canGoPrevious}
          onClick={handlePrevious}
          sx={{
            height: '100%',
            borderRadius: 999,
            bgcolor: '#FFFFFF',
            border: '2.4px solid',
            borderColor: canGoPrevious ? '#A7B3B8' : '#E2E8F0',
            color: canGoPrevious ? '#636E72' : '#A7B3B8',
            opacity: canGoPrevious ? 1 : 0.5,
            fontFamily: FIGMA_FONT,
            fontSize: p(32),
            lineHeight: 1.6,
            fontWeight: 700,
            '&:active': { transform: canGoPrevious ? 'scale(0.995)' : 'none' },
            '&:focus-visible': { outline: `3px solid ${CHAR}`, outlineOffset: p(4) },
          }}
        >
          Previous
        </ButtonBase>
        <ButtonBase
          disabled={!stepComplete}
          onClick={handleNext}
          sx={{
            height: '100%',
            borderRadius: 999,
            bgcolor: CHAR,
            color: '#FFFFFF',
            opacity: stepComplete ? 1 : 0.3,
            fontFamily: FIGMA_FONT,
            fontSize: p(32),
            lineHeight: 1.6,
            fontWeight: 700,
            transition: 'opacity 180ms ease',
            '&:active': { transform: stepComplete ? 'scale(0.995)' : 'none' },
            '&:focus-visible': { outline: `3px solid ${INK}`, outlineOffset: p(4) },
          }}
        >
          {nextLabel}
        </ButtonBase>
      </Box>
    </Box>
  )
}
