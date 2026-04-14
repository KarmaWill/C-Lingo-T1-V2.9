import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CultureVideoStage from '../components/Lesson/CultureVideoStage'
import { CURRENT_LESSON } from '../mock/lessonData'

/** Full-screen culture video mock from unit hub — no MainLayout chrome. */
export default function CultureVideoRoutePage() {
  const navigate = useNavigate()
  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#000' }}>
      <CultureVideoStage data={CURRENT_LESSON.cultureVideo} onBack={() => navigate(-1)} />
    </Box>
  )
}
