import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ChatHistoryItem {
  id: string
  topic: string
  topicEmoji: string
  date: string
  duration: number // in minutes
  messageCount: number
  score: number
  feedback: {
    summary: string
    suggestedFocus: string
    corrections: Array<{
      original: string
      corrected: string
      explanation: string
      type: 'grammar' | 'vocabulary' | 'pronunciation'
    }>
  }
}

interface ChatHistoryState {
  histories: ChatHistoryItem[]
}

const initialState: ChatHistoryState = {
  histories: [
    // Mock data for demo
    {
      id: '1',
      topic: 'Coffee Shop',
      topicEmoji: '☕',
      date: new Date(Date.now() - 86400000).toISOString(), // yesterday
      duration: 8,
      messageCount: 12,
      score: 88,
      feedback: {
        summary: '今天的对话练习表现出色！你的语法使用准确，词汇量也比较丰富。继续保持这样的学习状态，很快就能达到HSK 3级水平。',
        suggestedFocus: '语调和自然度',
        corrections: [
          {
            original: '我想要一个咖啡',
            corrected: '我想要一杯咖啡',
            explanation: '在中文里，咖啡要用量词"杯"，而不是"个"。不同的名词需要搭配不同的量词。',
            type: 'vocabulary'
          }
        ]
      }
    },
    {
      id: '2',
      topic: 'At the Market',
      topicEmoji: '🍎',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      duration: 12,
      messageCount: 18,
      score: 92,
      feedback: {
        summary: '你在市场购物场景中表现优秀，能够熟练使用购物相关词汇。建议继续练习数字和价格的表达。',
        suggestedFocus: '数字表达',
        corrections: []
      }
    }
  ]
}

const chatHistorySlice = createSlice({
  name: 'chatHistory',
  initialState,
  reducers: {
    addHistory: (state, action: PayloadAction<ChatHistoryItem>) => {
      state.histories.unshift(action.payload) // Add to beginning
      // Keep only last 50 histories
      if (state.histories.length > 50) {
        state.histories = state.histories.slice(0, 50)
      }
    },
    deleteHistory: (state, action: PayloadAction<string>) => {
      state.histories = state.histories.filter(h => h.id !== action.payload)
    },
    clearAllHistory: (state) => {
      state.histories = []
    }
  }
})

export const { addHistory, deleteHistory, clearAllHistory } = chatHistorySlice.actions
export default chatHistorySlice.reducer

