// Security utilities for rate limiting and validation

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory rate limiting (for production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  // Clean up expired entries
  for (const [k, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(k)
    }
  }
  
  const entry = rateLimitStore.get(key)
  
  if (!entry) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }
  
  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }
  
  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      resetTime: entry.resetTime 
    }
  }
  
  // Increment counter
  entry.count++
  return { allowed: true }
}

export function generateSecureVerificationCode(): string {
  // Generate cryptographically secure 6-digit code
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = (array[0] % 900000 + 100000).toString()
  return code
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateName(name: string): boolean {
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/
  return nameRegex.test(name.trim())
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000) // Limit length and trim
}

export function isDisposableEmail(email: string): boolean {
  // Common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'throwaway.email'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return disposableDomains.includes(domain)
}

export function detectSuspiciousPatterns(data: {
  applicantName: string
  applicantEmail: string
  sponsorEmail: string
  professionalQualification: string
  interest: string
}): string[] {
  const warnings: string[] = []
  
  // Check for disposable emails
  if (isDisposableEmail(data.applicantEmail)) {
    warnings.push('Applicant using disposable email')
  }
  
  // Check for same domain (could be legitimate but worth noting)
  const applicantDomain = data.applicantEmail.split('@')[1]
  const sponsorDomain = data.sponsorEmail.split('@')[1]
  if (applicantDomain === sponsorDomain) {
    warnings.push('Applicant and sponsor share email domain')
  }
  
  // Check for very short or generic responses
  if (data.professionalQualification.length < 10) {
    warnings.push('Very short professional qualification')
  }
  
  if (data.interest.length < 10) {
    warnings.push('Very short interest statement')
  }
  
  // Check for repeated characters (spam indicator)
  const hasRepeatedChars = /(.)\1{4,}/.test(
    data.professionalQualification + data.interest
  )
  if (hasRepeatedChars) {
    warnings.push('Suspicious repeated characters in responses')
  }
  
  return warnings
}

export function logSecurityEvent(event: {
  type: 'application_submitted' | 'approval_attempt' | 'rate_limit_exceeded' | 'suspicious_activity'
  ip?: string
  userAgent?: string
  details: Record<string, unknown>
}) {
  // In production, send to security monitoring service
  console.log(`[SECURITY] ${event.type}:`, {
    timestamp: new Date().toISOString(),
    ...event
  })
}
