import { useEffect } from 'react'
import { applyEyeCareBootOverlay, subscribeEyeCare } from '../../data/eyeCareStorage'

/**
 * Web 层护眼暖色遮罩（PRD 2.6）：
 * 同步读写 `#eye-care-overlay`（fixed / multiply / pointer-events:none）。
 * 实际 DOM 由 `applyEyeCareBootOverlay` 维护，避免双层叠罩。
 */
export default function EyeCareOverlay() {
  useEffect(() => {
    applyEyeCareBootOverlay()
    return subscribeEyeCare(() => {
      applyEyeCareBootOverlay()
    })
  }, [])

  return null
}
