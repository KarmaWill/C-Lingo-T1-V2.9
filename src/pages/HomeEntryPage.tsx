import LibraryPage from './LibraryPage'
import { OnboardingFlow } from '../onboarding/OnboardingFlow'
import { useOnboarding } from '../onboarding/OnboardingContext'

export default function HomeEntryPage() {
  const { active } = useOnboarding()
  if (active) return <OnboardingFlow />
  return <LibraryPage />
}
