/**
 * Serializes AI chat voice / text flow:
 * Mic → ASR finalize queue → LLM (single chain) → TTS / speech playback (same work chain).
 * Manual “朗读” also joins the same work tail so audio never overlaps.
 */

export const ASR_FINALIZE_DELAY_MS = 220

export type PipelineStage = 'idle' | 'asr_finalize' | 'llm' | 'playback'

export type PipelineHandlers = {
  runFullTurn: (text: string, isVoiceInput: boolean) => Promise<{ id: string; text: string } | null>
  speakUtterance: (text: string, messageId: string) => Promise<void>
  onStage?: (stage: PipelineStage) => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class AiConversationPipeline {
  private handlers: PipelineHandlers | null = null
  private workTail: Promise<void> = Promise.resolve()
  private asrBuffer: Array<{ text: string; isVoiceInput: boolean }> = []

  setHandlers(h: PipelineHandlers) {
    this.handlers = h
  }

  private emit(stage: PipelineStage) {
    this.handlers?.onStage?.(stage)
  }

  private chainWork(task: () => Promise<void>): void {
    this.workTail = this.workTail
      .then(task)
      .catch((err) => console.error('[AI pipeline]', err))
  }

  /** After mic release: text enters ASR buffer, then finalize delay, then LLM + playback. */
  enqueueVoiceAsrFinal(text: string): void {
    const t = text.trim()
    if (!t) return
    this.asrBuffer.push({ text: t, isVoiceInput: true })
    this.chainWork(async () => {
      await this.flushAsrBuffer()
    })
  }

  /** Text send: skip ASR stage, go straight to LLM + playback. */
  enqueueKeyboardTurn(text: string): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      await this.runLlmAndSpeak({ text: t, isVoiceInput: false })
    })
  }

  /** TTS only (e.g. first AI greeting when entering chat). */
  enqueueAudioOnly(text: string, messageId: string): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      const h = this.handlers
      if (!h) return
      this.emit('playback')
      await h.speakUtterance(t, messageId)
      this.emit('idle')
    })
  }

  /** User tapped 朗读 — queued after any in-flight work. */
  enqueuePlayback(text: string, messageId: string): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      const h = this.handlers
      if (!h) return
      this.emit('playback')
      await h.speakUtterance(t, messageId)
      this.emit('idle')
    })
  }

  private async flushAsrBuffer(): Promise<void> {
    while (this.asrBuffer.length > 0) {
      const job = this.asrBuffer.shift()!
      this.emit('asr_finalize')
      await sleep(ASR_FINALIZE_DELAY_MS)
      await this.runLlmAndSpeak(job)
    }
    this.emit('idle')
  }

  private async runLlmAndSpeak(job: { text: string; isVoiceInput: boolean }): Promise<void> {
    const h = this.handlers
    if (!h) return
    this.emit('llm')
    const ai = await h.runFullTurn(job.text, job.isVoiceInput)
    if (ai) {
      this.emit('playback')
      await h.speakUtterance(ai.text, ai.id)
    }
    this.emit('idle')
  }
}
