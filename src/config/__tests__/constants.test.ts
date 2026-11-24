import {
  VALIDATION_LIMITS,
  HTTP_STATUS,
  RATE_LIMIT,
  REGEX,
  ERROR_MESSAGES,
} from '../constants'

describe('Config Constants', () => {
  describe('VALIDATION_LIMITS', () => {
    it('should have reasonable name length limit', () => {
      expect(VALIDATION_LIMITS.NAME_MAX_LENGTH).toBe(100)
    })

    it('should have standard email length limit', () => {
      // RFC 5321 specifies max 254 chars for email
      expect(VALIDATION_LIMITS.EMAIL_MAX_LENGTH).toBe(254)
    })

    it('should have reasonable message length limit', () => {
      expect(VALIDATION_LIMITS.MESSAGE_MAX_LENGTH).toBe(5000)
    })
  })

  describe('HTTP_STATUS', () => {
    it('should have correct success status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200)
    })

    it('should have correct client error status codes', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429)
    })

    it('should have correct server error status codes', () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
      expect(HTTP_STATUS.GATEWAY_TIMEOUT).toBe(504)
    })
  })

  describe('RATE_LIMIT', () => {
    it('should have contact form rate limit config', () => {
      expect(RATE_LIMIT.CONTACT_FORM.MAX_REQUESTS).toBeGreaterThan(0)
      expect(RATE_LIMIT.CONTACT_FORM.WINDOW_MS).toBeGreaterThan(0)
    })
  })

  describe('REGEX', () => {
    it('should validate valid emails', () => {
      expect(REGEX.EMAIL.test('test@example.com')).toBe(true)
      expect(REGEX.EMAIL.test('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(REGEX.EMAIL.test('invalid')).toBe(false)
      expect(REGEX.EMAIL.test('@nodomain.com')).toBe(false)
      expect(REGEX.EMAIL.test('spaces in@email.com')).toBe(false)
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have required error messages', () => {
      expect(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).toBeTruthy()
    })
  })
})
