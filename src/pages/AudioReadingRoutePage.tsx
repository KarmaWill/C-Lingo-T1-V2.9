import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AudiobookPage from './AudiobookPage'

/** Full-screen audio reading (Beijing / bilingual) from unit hub — no MainLayout chrome. */
export default function AudioReadingRoutePage() {
  const navigate = useNavigate()
  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <AudiobookPage onBack={() => navigate(-1)} />
    </Box>
  )
}
