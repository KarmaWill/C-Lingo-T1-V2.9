import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@mui/material'

type BoardLayout = { width: number; height: number }

/**
 * Honor LearnHome `home-board` 同款：按 Figma 像素排版，再 contain 进剩余 flex 区。
 * 不要用 grid fr 分别拉宽/拉高，否则封面和主图会扁掉。
 *
 * `fillHost`：按槽位高度铺满，画布加宽吃掉左右 letterbox（给 HSK Prep 两栏共用，避免中间缝）。
 */
export default function HubContainBoard({
  width,
  height,
  fillHost = false,
  children,
}: {
  width: number
  height: number
  fillHost?: boolean
  children: ReactNode | ((layout: BoardLayout) => ReactNode)
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [canvasWidth, setCanvasWidth] = useState(width)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const fit = () => {
      // clientWidth 是平板内部布局像素；getBoundingClientRect 会把外壳 scale 再乘一次。
      const w = host.clientWidth
      const h = host.clientHeight
      if (w <= 0 || h <= 0) return
      if (fillHost) {
        const heightScale = h / height
        const filledWidth = w / heightScale
        if (filledWidth >= width) {
          setScale(heightScale)
          setCanvasWidth(filledWidth)
          return
        }
      }
      setScale(Math.min(w / width, h / height))
      setCanvasWidth(width)
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(host)
    return () => observer.disconnect()
  }, [width, height, fillHost])

  return (
    <Box
      ref={hostRef}
      sx={{
        flex: 1,
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: canvasWidth,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {typeof children === 'function' ? children({ width: canvasWidth, height }) : children}
      </Box>
    </Box>
  )
}
