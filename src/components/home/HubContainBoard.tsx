import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@mui/material'

/**
 * Honor LearnHome `home-board` 同款：按 Figma 像素排版，再 contain 进剩余 flex 区。
 * 不要用 grid fr 分别拉宽/拉高，否则封面和主图会扁掉。
 */
export default function HubContainBoard({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: ReactNode
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const fit = () => {
      // clientWidth 是平板内部布局像素；getBoundingClientRect 会把外壳 scale 再乘一次。
      const w = host.clientWidth
      const h = host.clientHeight
      if (w <= 0 || h <= 0) return
      setScale(Math.min(w / width, h / height))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(host)
    return () => observer.disconnect()
  }, [width, height])

  return (
    <Box
      ref={hostRef}
      sx={{
        flex: 1,
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
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
