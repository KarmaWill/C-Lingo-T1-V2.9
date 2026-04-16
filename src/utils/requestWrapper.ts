/**
 * Centralized wrapper for AI-related async operations:
 * 8s timeout with abort, up to 2 retries, exponential backoff (1s, 2s), lifecycle logging.
 */

export const AI_REQUEST_TIMEOUT_MS = 8000
export const AI_REQUEST_MAX_RETRIES = 2
/** Total attempts = 1 initial + AI_REQUEST_MAX_RETRIES */
export const AI_REQUEST_MAX_ATTEMPTS = 1 + AI_REQUEST_MAX_RETRIES

const logPrefix = '[AI Request]'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error instanceof Error && error.name === 'AbortError') return true
  return false
}

export class AiRequestTimeoutError extends Error {
  readonly attempts: number
  readonly label: string

  constructor(message: string, label: string, attempts: number) {
    super(message)
    this.name = 'AiRequestTimeoutError'
    this.label = label
    this.attempts = attempts
  }
}

export type AiRequestOptions = {
  /** Log / error context, e.g. ai.chat */
  label?: string
  /** Invoked on each timeout before a retry, and on final failure if needed */
  onTimeout?: (info: { attempt: number; willRetry: boolean; label: string }) => void
}

/**
 * Runs `operation` with a per-attempt timeout. Retries only after a timeout/abort, not on other errors.
 * Uses Promise.race so the timeout applies even if `operation` ignores `signal`.
 */
export async function withAiRequest<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: AiRequestOptions = {},
): Promise<T> {
  const label = options.label ?? 'ai.request'
  let lastTimeoutAttempt = 0

  for (let attemptIndex = 0; attemptIndex < AI_REQUEST_MAX_ATTEMPTS; attemptIndex++) {
    const attemptNumber = attemptIndex + 1
    const startedAt = performance.now()
    const startIso = new Date().toISOString()
    console.log(
      `${logPrefix} ${label} start attempt=${attemptNumber}/${AI_REQUEST_MAX_ATTEMPTS} at=${startIso}`,
    )

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS)

    const abortPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener(
        'abort',
        () => {
          reject(new DOMException('The operation timed out', 'AbortError'))
        },
        { once: true },
      )
    })

    try {
      const result = await Promise.race([operation(controller.signal), abortPromise])
      window.clearTimeout(timeoutId)
      const responseTimeMs = Math.round(performance.now() - startedAt)
      console.log(
        `${logPrefix} ${label} success attempt=${attemptNumber} responseTime=${responseTimeMs}ms retryCount=${attemptIndex}`,
      )
      return result
    } catch (error) {
      window.clearTimeout(timeoutId)
      const responseTimeMs = Math.round(performance.now() - startedAt)

      if (controller.signal.aborted && isAbortError(error)) {
        lastTimeoutAttempt = attemptNumber
        const willRetry = attemptIndex < AI_REQUEST_MAX_RETRIES
        console.warn(
          `${logPrefix} ${label} timeout attempt=${attemptNumber} duration=${responseTimeMs}ms retryCount=${attemptIndex} willRetry=${willRetry}`,
        )
        options.onTimeout?.({ attempt: attemptNumber, willRetry, label })

        if (willRetry) {
          const backoffMs = 1000 * attemptNumber
          console.log(`${logPrefix} ${label} backoff wait=${backoffMs}ms before next attempt`)
          await sleep(backoffMs)
          continue
        }

        console.error(
          `${logPrefix} ${label} failed after ${AI_REQUEST_MAX_ATTEMPTS} attempts (all timeouts)`,
        )
        throw new AiRequestTimeoutError(
          `Request timed out after ${AI_REQUEST_MAX_ATTEMPTS} attempts (${AI_REQUEST_TIMEOUT_MS}ms each).`,
          label,
          AI_REQUEST_MAX_ATTEMPTS,
        )
      }

      console.error(
        `${logPrefix} ${label} error attempt=${attemptNumber} duration=${responseTimeMs}ms`,
        error,
      )
      throw error
    }
  }

  throw new AiRequestTimeoutError(
    `Request timed out after ${lastTimeoutAttempt} attempt(s).`,
    label,
    lastTimeoutAttempt,
  )
}
