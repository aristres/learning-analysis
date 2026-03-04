/**
 * シンプルなインメモリ・レート制限
 * Vercel Serverless Functions 向け（インスタンス間で共有されない点に注意）
 * 本番でより厳密な制限が必要な場合は Upstash Redis 等を検討
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// 古いエントリを定期的にクリーンアップ（メモリリーク防止）
const CLEANUP_INTERVAL = 60_000 // 1分
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}

interface RateLimitConfig {
  /** ウィンドウあたりの最大リクエスト数 */
  maxRequests: number
  /** ウィンドウサイズ（ミリ秒） */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * レート制限チェック
 * @param key 一意のキー（ユーザーID、IPアドレスなど）
 * @param config レート制限設定
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  // 新規 or ウィンドウがリセット済み
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    store.set(key, newEntry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // ウィンドウ内
  if (entry.count < config.maxRequests) {
    entry.count++
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  // レート制限超過
  return {
    success: false,
    remaining: 0,
    resetAt: entry.resetAt,
  }
}

/**
 * LLMルート向け: 5req/min/user
 */
export function checkLLMRateLimit(userId: string): RateLimitResult {
  return checkRateLimit(`llm:${userId}`, {
    maxRequests: 5,
    windowMs: 60_000,
  })
}

/**
 * 認証ルート向け: 10req/min/IP
 */
export function checkAuthRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`auth:${ip}`, {
    maxRequests: 10,
    windowMs: 60_000,
  })
}

/**
 * レート制限超過時の NextResponse ヘルパー
 */
export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({
      error: 'リクエストが多すぎます。しばらくしてからお試しください。',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  )
}
