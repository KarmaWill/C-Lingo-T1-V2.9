import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import { clearOnboarded, readOnboarded, writeOnboarded } from './onboardingStorage'
import './onboarding.css'

interface OnboardingContextValue {
  onboarded: boolean
  active: boolean
  markDone: () => void
  skipToHome: () => void
  restartOnboarding: () => void
  toggleStudioOnboard: () => void
}

const OnboardingCtx = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { locale } = useLocale()
  const reset = new URLSearchParams(location.search).get('onboard') === 'reset'
  const [onboarded, setOnboarded] = useState(() => (reset ? false : readOnboarded()))

  useEffect(() => {
    if (!reset) return
    clearOnboarded()
    setOnboarded(false)
  }, [reset])

  const onHome = location.pathname === '/Home' || location.pathname === '/library'
  const skipToHome = () => {
    writeOnboarded({
      path: 'clingo',
      localeId: locale.id,
      email: '',
      nickname: '',
      dob: '',
      gender: '',
      avatar: 'clingo',
      wifiId: null,
      hskLevel: null,
    })
    setOnboarded(true)
    navigate('/Home', { replace: true })
  }
  const restartOnboarding = () => {
    clearOnboarded()
    setOnboarded(false)
    navigate('/Home', { replace: true })
  }
  const value = useMemo(
    () => ({
      onboarded,
      active: onHome && !onboarded,
      markDone: () => setOnboarded(true),
      skipToHome,
      restartOnboarding,
      toggleStudioOnboard: () => (onboarded ? restartOnboarding() : skipToHome()),
    }),
    [onboarded, onHome, locale.id, navigate],
  )

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingCtx)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
