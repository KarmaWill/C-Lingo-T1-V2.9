/**
 * Serializes AI chat voice / text flow:
 * Mic → ASR finalize queue → LLM (single chain) → TTS / speech playback (same work chain).
 * Manual “朗读” also joins the same work tail so audio never overlaps.
 */

export const ASR_FINALIZE_DELAY_MS = 220

export type PipelineStage = 'idle' | 'asr_finalize' | 'llm' | 'playback'

export type RunFullTurnOptions = {
  /** When true, do not append another user bubble (LLM retry after failure). */
  skipUserMessage?: boolean
}

export type RunFullTurnOk = { ok: true; id: string; text: string }
export type RunFullTurnFail = { ok: false; error?: unknown; isTimeout?: boolean }
export type RunFullTurnResult = RunFullTurnOk | RunFullTurnFail

export type LlmFailedInfo = {
  text: string
  isVoiceInput: boolean
  error?: unknown
  isTimeout?: boolean
}

export type PlaybackFailedInfo = {
  text: string
  messageId: string
  error?: unknown
}

export type PipelineHandlers = {
  runFullTurn: (
    text: string,
    isVoiceInput: boolean,
    opts?: RunFullTurnOptions,
  ) => Promise<RunFullTurnResult>
  /** Returns true if playback finished normally; false on error / unsupported. */
  speakUtterance: (text: string, messageId: string) => Promise<boolean>
  onStage?: (stage: PipelineStage) => void
  onLlmFailed?: (info: LlmFailedInfo) => void
  onPlaybackFailed?: (info: PlaybackFailedInfo) => void
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
    this.workTail = this.workTail.then(task).catch((err) => {
      console.error('[AI pipeline]', err)
      this.emit('idle')
    })
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

  /** Retry LLM + TTS for an existing user line (no new user bubble). */
  enqueueLlmRetry(text: string, isVoiceInput: boolean): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      await this.runLlmAndSpeak({ text: t, isVoiceInput, skipUserMessage: true })
    })
  }

  /** TTS only (e.g. first AI greeting when entering chat). */
  enqueueAudioOnly(text: string, messageId: string): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      const h = this.handlers
      if (!h) {
        this.emit('idle')
        return
      }
      try {
        this.emit('playback')
        const ok = await h.speakUtterance(t, messageId)
        if (!ok) {
          h.onPlaybackFailed?.({ text: t, messageId })
        }
      } finally {
        this.emit('idle')
      }
    })
  }

  /** User tapped 朗读 — queued after any in-flight work. */
  enqueuePlayback(text: string, messageId: string): void {
    const t = text.trim()
    if (!t) return
    this.chainWork(async () => {
      const h = this.handlers
      if (!h) {
        this.emit('idle')
        return
      }
      try {
        this.emit('playback')
        const ok = await h.speakUtterance(t, messageId)
        if (!ok) {
          h.onPlaybackFailed?.({ text: t, messageId })
        }
      } finally {
        this.emit('idle')
      }
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

  private async runLlmAndSpeak(job: {
    text: string
    isVoiceInput: boolean
    skipUserMessage?: boolean
  }): Promise<void> {
    const h = this.handlers
    if (!h) {
      this.emit('idle')
      return
    }
    try {
      this.emit('llm')
      let result: RunFullTurnResult
      try {
        result = await h.runFullTurn(job.text, job.isVoiceInput, {
          skipUserMessage: job.skipUserMessage,
        })
      } catch (err) {
        console.error('[AI pipeline] runFullTurn threw', err)
        h.onLlmFailed?.({ text: job.text, isVoiceInput: job.isVoiceInput, error: err, isTimeout: false })
        return
      }

      if (!result.ok) {
        h.onLlmFailed?.({
          text: job.text,
          isVoiceInput: job.isVoiceInput,
          error: result.error,
          isTimeout: result.isTimeout,
        })
        return
      }

      this.emit('playback')
      const spokenOk = await h.speakUtterance(result.text, result.id)
      if (!spokenOk) {
        h.onPlaybackFailed?.({ text: result.text, messageId: result.id })
      }
    } finally {
      this.emit('idle')
    }
  }
}
