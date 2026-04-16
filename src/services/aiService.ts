import { withAiRequest } from '../utils/requestWrapper'

// AI服务接口
class AIService {
  // API配置（保留用于未来扩展）
  // private apiKey: string
  // private baseURL: string

  constructor() {
    // 未来可在此初始化API配置
    // this.apiKey = (import.meta.env?.VITE_AI_API_KEY as string) || ''
    // this.baseURL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000'
  }

  async chat(message: string): Promise<string> {
    return withAiRequest(
      async (_signal) => {
        // 模拟AI回复（实际应该调用真实的AI API）
        // 这里可以集成OpenAI、本地AI模型等

        // 简单的规则回复示例
        if (message.includes('你好')) {
          return '你好！很高兴和你对话。让我们用中文继续交流吧！'
        }
        if (message.includes('谢谢')) {
          return '不客气！继续加油学习中文！'
        }

        // 默认回复
        return `我理解你说的"${message}"。让我们继续用中文练习吧！如果你有任何问题，随时问我。`
      },
      { label: 'ai.chat' },
    )
  }

  async correctGrammar(text: string): Promise<{ corrected: string; suggestions: string[] }> {
    return withAiRequest(
      async (_signal) => ({
        corrected: text,
        suggestions: [],
      }),
      { label: 'ai.correctGrammar' },
    )
  }

  async evaluatePronunciation(_audio: Blob): Promise<{ score: number; feedback: string }> {
    return withAiRequest(
      async (_signal) => ({
        score: 85,
        feedback: '发音不错，继续练习！',
      }),
      { label: 'ai.evaluatePronunciation' },
    )
  }

  async generateLesson(_userId: string, _performance: any): Promise<any> {
    return withAiRequest(
      async (_signal) => ({
        lessonId: 'lesson-1',
        content: '根据你的表现，我为你生成了专属课程...',
      }),
      { label: 'ai.generateLesson' },
    )
  }
}

export const aiService = new AIService()

