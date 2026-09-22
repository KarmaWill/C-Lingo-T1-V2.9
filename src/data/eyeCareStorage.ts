/**
 * Eye protection (护眼) · Web 层状态
 * PRD CLA-3.0 / 05 · 2.6 · localStorage `system-eye-care-v1`
 */

export const EYE_CARE_STORAGE_KEY = 'system-eye-care-v1'
export const EYE_CARE_CHANGE_EVENT = 'clingo-eye-care-change'

export type EyeCareIntensity = 'low' | 'medium' | 'high'
export type EyeCareScope = 'app' | 'device'

export type EyeCareState = {
  schemaVersion: 1
  enabled: boolean
  scope: EyeCareScope
  intensity: EyeCareIntensity
  schedule: {
    mode: 'off' | 'fixed' | 'sunset'
    startTime: string
    endTime: string
  }
  reminder202020: {
    enabled: boolean
    intervalMinutes: number
  }
  updatedAt: string
}

/** PRD: low / medium / high → α 0.08 / 0.16 / 0.26，色 `#FFB36B` */
export const EYE_CARE_TINT = '#FFB36B'
export const EYE_CARE_ALPHA: Record<EyeCareIntensity, number> = {
  low: 0.08,
  medium: 0.16,
  high: 0.26,
}

export const DEFAULT_EYE_CARE: EyeCareState = {
  schemaVersion: 1,
  enabled: false,
  scope: 'app',
  intensity: 'medium',
  schedule: {
    mode: 'off',
    startTime: '20:00',
    endTime: '07:00',
  },
  reminder202020: {
    enabled: true,
    intervalMinutes: 20,
  },
  updatedAt: new Date(0).toISOString(),
}

function isIntensity(value: unknown): value is EyeCareIntensity {
  return value === 'low' || value === 'medium' || value === 'high'
}

function isScope(value: unknown): value is EyeCareScope {
  return value === 'app' || value === 'device'
}

export function loadEyeCare(): EyeCareState {
  try {
    const raw = window.localStorage.getItem(EYE_CARE_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_EYE_CARE }
    const parsed = JSON.parse(raw) as Partial<EyeCareState>
    if (parsed.schemaVersion !== 1) return { ...DEFAULT_EYE_CARE }
    return {
      ...DEFAULT_EYE_CARE,
      ...parsed,
      schemaVersion: 1,
      enabled: Boolean(parsed.enabled),
      scope: isScope(parsed.scope) ? parsed.scope : 'app',
      intensity: isIntensity(parsed.intensity) ? parsed.intensity : 'medium',
      schedule: {
        ...DEFAULT_EYE_CARE.schedule,
        ...(parsed.schedule ?? {}),
      },
      reminder202020: {
        ...DEFAULT_EYE_CARE.reminder202020,
        ...(parsed.reminder202020 ?? {}),
      },
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : DEFAULT_EYE_CARE.updatedAt,
    }
  } catch {
    return { ...DEFAULT_EYE_CARE }
  }
}

export function saveEyeCare(next: EyeCareState): void {
  const payload: EyeCareState = {
    ...next,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(EYE_CARE_STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent(EYE_CARE_CHANGE_EVENT, { detail: payload }))
}

export function setEyeCareEnabled(enabled: boolean): EyeCareState {
  const next = { ...loadEyeCare(), enabled }
  saveEyeCare(next)
  return next
}

export function getEyeCareOverlayAlpha(state: EyeCareState = loadEyeCare()): number {
  return EYE_CARE_ALPHA[state.intensity] ?? EYE_CARE_ALPHA.medium
}

export function subscribeEyeCare(listener: (state: EyeCareState) => void): () => void {
  const onChange = (event: Event) => {
    const detail = (event as CustomEvent<EyeCareState>).detail
    listener(detail ?? loadEyeCare())
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === EYE_CARE_STORAGE_KEY) listener(loadEyeCare())
  }
  window.addEventListener(EYE_CARE_CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EYE_CARE_CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** 首帧前同步挂遮罩，避免刷新闪白（GWT-E-02） */
export function applyEyeCareBootOverlay(): void {
  const state = loadEyeCare()
  const existing = document.getElementById('eye-care-overlay')
  if (!state.enabled) {
    existing?.remove()
    return
  }
  const alpha = getEyeCareOverlayAlpha(state)
  const el = existing ?? document.createElement('div')
  el.id = 'eye-care-overlay'
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483646',
    'pointer-events:none',
    'mix-blend-mode:multiply',
    `background:rgba(255,179,107,${alpha})`,
  ].join(';')
  if (!existing) document.body.appendChild(el)
}
