import { useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CharacterWritingPractice } from '../components/Lesson/CharacterWritingPractice'
import { resolveWritingPracticeExit } from '../utils/navigateBack'

export default function CharacterWritingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { character: routeCharacter } = useParams<{ character: string }>()
  const character = routeCharacter || '你'

  const exitWritingPractice = useCallback(() => {
    const exit = resolveWritingPracticeExit(location, { defaultPath: '/character-writing' })
    navigate(exit.path, {
      replace: true,
      state: exit.restore ? { restore: exit.restore } : undefined,
    })
  }, [location, navigate])

  return (
    <CharacterWritingPractice
      characters={[character]}
      onClose={exitWritingPractice}
      finishLabel="Return to lesson"
    />
  )
}
