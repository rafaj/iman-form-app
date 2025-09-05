// Simple in-memory cache to reduce database calls
// This reduces compute usage significantly for frequently accessed data

const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

export function getCached<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key)
    return null
  }
  
  return item.data as T
}

export function setCached<T>(key: string, data: T, ttlMinutes = 5): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000
  })
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Cache keys
export const CACHE_KEYS = {
  SPONSORS: 'sponsors',
  RECENT_MEMBERS: 'recent_members',
  FORUM_POSTS: 'forum_posts',
  MEMBER_CHECK: (email: string) => `member_${email}`,
  EVENTS: 'events'
} as const