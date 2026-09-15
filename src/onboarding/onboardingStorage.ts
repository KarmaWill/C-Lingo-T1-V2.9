export const ONBOARD_DONE_KEY = 'clingo-onboarded-v1'
export const ONBOARD_PROFILE_KEY = 'clingo-onboard-profile-v1'

export type OnboardPath = 'clingo' | 'hsk' | 'placement'
export type OnboardHskLevel = 1 | 2 | null

export type OnboardProfile = {
  path: OnboardPath
  localeId: string
  email: string
  nickname: string
  dob: string
  gender: string
  avatar: string
  wifiId: string | null
  hskLevel: OnboardHskLevel
}

export function readOnboarded(): boolean {
  try {
    return window.localStorage.getItem(ONBOARD_DONE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeOnboarded(profile: OnboardProfile) {
  window.localStorage.setItem(ONBOARD_DONE_KEY, '1')
  window.localStorage.setItem(ONBOARD_PROFILE_KEY, JSON.stringify(profile))
}

export function clearOnboarded() {
  window.localStorage.removeItem(ONBOARD_DONE_KEY)
  window.localStorage.removeItem(ONBOARD_PROFILE_KEY)
}
