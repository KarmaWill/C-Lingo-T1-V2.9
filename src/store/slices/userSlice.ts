import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: string
  name: string
  level: number
  progress: number
  streakDays: number
}

const initialState: UserState = {
  id: '1',
  name: '学习者',
  level: 1,
  progress: 25,
  streakDays: 5,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.streakDays = action.payload
    },
  },
})

export const { updateProgress, updateStreak } = userSlice.actions
export default userSlice.reducer

