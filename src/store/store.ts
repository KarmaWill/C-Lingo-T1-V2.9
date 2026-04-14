import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import lessonReducer from './slices/lessonSlice'
import chatHistoryReducer from './slices/chatHistorySlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    lesson: lessonReducer,
    chatHistory: chatHistoryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

