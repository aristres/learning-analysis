import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkRateLimit,
  checkLLMRateLimit,
  checkAuthRateLimit,
  rateLimitResponse,
} from '../rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    // テスト間で内部ストアをリセットするためにモジュールリロード
    vi.useFakeTimers()
  })

  it('初回リクエストは成功する', () => {
    const result = checkRateLimit('test-user-1', {
      maxRequests: 3,
      windowMs: 60_000,
    })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('制限内のリクエストは全て成功する', () => {
    const config = { maxRequests: 3, windowMs: 60_000 }
    const key = 'test-user-2'

    const r1 = checkRateLimit(key, config)
    const r2 = checkRateLimit(key, config)
    const r3 = checkRateLimit(key, config)

    expect(r1.success).toBe(true)
    expect(r1.remaining).toBe(2)
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(1)
    expect(r3.success).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('制限を超えたリクエストは拒否される', () => {
    const config = { maxRequests: 2, windowMs: 60_000 }
    const key = 'test-user-3'

    checkRateLimit(key, config)
    checkRateLimit(key, config)
    const r3 = checkRateLimit(key, config)

    expect(r3.success).toBe(false)
    expect(r3.remaining).toBe(0)
  })

  it('ウィンドウリセット後は再び成功する', () => {
    const config = { maxRequests: 1, windowMs: 1_000 }
    const key = 'test-user-4'

    checkRateLimit(key, config)
    const r2 = checkRateLimit(key, config)
    expect(r2.success).toBe(false)

    // 1秒後にリセット
    vi.advanceTimersByTime(1_100)
    const r3 = checkRateLimit(key, config)
    expect(r3.success).toBe(true)
  })

  it('異なるキーは独立してカウントされる', () => {
    const config = { maxRequests: 1, windowMs: 60_000 }

    const r1 = checkRateLimit('user-a', config)
    const r2 = checkRateLimit('user-b', config)

    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
  })
})

describe('checkLLMRateLimit', () => {
  it('5回まで許可する', () => {
    const userId = 'llm-test-user'
    for (let i = 0; i < 5; i++) {
      const result = checkLLMRateLimit(userId)
      expect(result.success).toBe(true)
    }
    const result = checkLLMRateLimit(userId)
    expect(result.success).toBe(false)
  })
})

describe('checkAuthRateLimit', () => {
  it('10回まで許可する', () => {
    const ip = '192.168.1.100'
    for (let i = 0; i < 10; i++) {
      const result = checkAuthRateLimit(ip)
      expect(result.success).toBe(true)
    }
    const result = checkAuthRateLimit(ip)
    expect(result.success).toBe(false)
  })
})

describe('rateLimitResponse', () => {
  it('429ステータスのレスポンスを返す', () => {
    const response = rateLimitResponse({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    })

    expect(response.status).toBe(429)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Retry-After')).toBeDefined()
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })
})
