const CHROME_BOOKMARK_KEY = 'apps-chrome-clingo-bookmarked-v1'
const YOUTUBE_SUBSCRIBE_KEY = 'apps-youtube-clingo-subscribed-v1'

function readFlag(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string, value: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value ? '1' : '0')
}

/** Chrome：收藏官网后才可浏览其他网页 */
export function isClingoBookmarked(): boolean {
  return readFlag(CHROME_BOOKMARK_KEY)
}

export function setClingoBookmarked(value: boolean) {
  writeFlag(CHROME_BOOKMARK_KEY, value)
}

/** YouTube：订阅官方频道后才可看其他频道 */
export function isClingoYoutubeSubscribed(): boolean {
  return readFlag(YOUTUBE_SUBSCRIBE_KEY)
}

export function setClingoYoutubeSubscribed(value: boolean) {
  writeFlag(YOUTUBE_SUBSCRIBE_KEY, value)
}
