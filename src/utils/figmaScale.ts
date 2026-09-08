import { APP_FONT_FAMILY } from '../theme/appFont'

/** 与 MainLayout / 底栏同一套；未设 VITE_SCREEN_SIZE 时不要回落到 1024。 */
export const APP_SCREEN_SIZE = import.meta.env.VITE_SCREEN_SIZE || '2000x1200'

/** Figma 画布 1920 基准 → 各 VITE_SCREEN_SIZE 等比 */
export function figmaScale(screenSize: string): number {
  if (screenSize === '960x540') return 960 / 1920
  if (screenSize === '2000x1200') return 2000 / 1920
  if (screenSize === '1920x1125') return 1
  return 1024 / 1920
}

export function figmaPx(n: number, screenSize: string): number {
  return Math.max(1, Math.round(n * figmaScale(screenSize)))
}

export const FIGMA_FONT = APP_FONT_FAMILY
