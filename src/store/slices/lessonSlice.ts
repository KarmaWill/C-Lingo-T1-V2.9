import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Lesson {
  id: string
  title: string
  progress: number
  completed: boolean
}

interface LessonState {
  lessons: Lesson[]
  currentLesson: string | null
}

const initialState: LessonState = {
  lessons: [
    { id: '1', title: '第一课：你好', progress: 25, completed: false },
    { id: '2', title: '第二课：谢谢', progress: 0, completed: false },
    { id: '3', title: '第三课：再见', progress: 0, completed: false },
  ],
  currentLesson: null,
}

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<string>) => {
      state.currentLesson = action.payload
    },
    updateLessonProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const lesson = state.lessons.find((l) => l.id === action.payload.id)
      if (lesson) {
        lesson.progress = action.payload.progress
        lesson.completed = lesson.progress >= 100
      }
    },
  },
})

export const { setCurrentLesson, updateLessonProgress } = lessonSlice.actions
export default lessonSlice.reducer

