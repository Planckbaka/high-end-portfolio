import {
  VALIDATION_LIMITS,
  HTTP_STATUS,
  ANIMATION_DURATION,
  ANIMATION_EASING,
  BREAKPOINTS,
  RATE_LIMIT,
  CACHE_DURATION,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
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
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.NO_CONTENT).toBe(204)
    })

    it('should have correct client error status codes', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429)
    })

    it('should have correct server error status codes', () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503)
    })
  })

  describe('ANIMATION_DURATION', () => {
    it('should have durations in ascending order', () => {
      expect(ANIMATION_DURATION.FAST).toBeLessThan(ANIMATION_DURATION.NORMAL)
      expect(ANIMATION_DURATION.NORMAL).toBeLessThan(ANIMATION_DURATION.SLOW)
      expect(ANIMATION_DURATION.SLOW).toBeLessThan(ANIMATION_DURATION.VERY_SLOW)
    })
  })

  describe('ANIMATION_EASING', () => {
    it('should have 4-value cubic bezier arrays', () => {
      expect(ANIMATION_EASING.EASE_IN_OUT).toHaveLength(4)
      expect(ANIMATION_EASING.EASE_OUT).toHaveLength(4)
      expect(ANIMATION_EASING.EASE_IN).toHaveLength(4)
    })
  })

  describe('BREAKPOINTS', () => {
    it('should have breakpoints in ascending order', () => {
      expect(BREAKPOINTS.SM).toBeLessThan(BREAKPOINTS.MD)
      expect(BREAKPOINTS.MD).toBeLessThan(BREAKPOINTS.LG)
      expect(BREAKPOINTS.LG).toBeLessThan(BREAKPOINTS.XL)
      expect(BREAKPOINTS.XL).toBeLessThan(BREAKPOINTS['2XL'])
    })
  })

  describe('RATE_LIMIT', () => {
    it('should have contact form rate limit config', () => {
      expect(RATE_LIMIT.CONTACT_FORM.MAX_REQUESTS).toBeGreaterThan(0)
      expect(RATE_LIMIT.CONTACT_FORM.WINDOW_MS).toBeGreaterThan(0)
    })
  })

  describe('CACHE_DURATION', () => {
    it('should have static assets cached longest', () => {
      expect(CACHE_DURATION.STATIC_ASSETS).toBeGreaterThan(CACHE_DURATION.ARTICLES)
      expect(CACHE_DURATION.ARTICLES).toBeGreaterThan(CACHE_DURATION.API_RESPONSES)
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

    it('should validate URLs', () => {
      expect(REGEX.URL.test('https://example.com')).toBe(true)
      expect(REGEX.URL.test('http://localhost:3000')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(REGEX.URL.test('not-a-url')).toBe(false)
      expect(REGEX.URL.test('ftp://example.com')).toBe(false)
    })

    it('should validate slugs', () => {
      expect(REGEX.SLUG.test('my-article-slug')).toBe(true)
      expect(REGEX.SLUG.test('article123')).toBe(true)
    })

    it('should reject invalid slugs', () => {
      expect(REGEX.SLUG.test('Invalid-Slug')).toBe(false)
      expect(REGEX.SLUG.test('has spaces')).toBe(false)
      expect(REGEX.SLUG.test('--double-dash')).toBe(false)
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have required error messages', () => {
      expect(ERROR_MESSAGES.REQUIRED_FIELD).toBeTruthy()
      expect(ERROR_MESSAGES.INVALID_EMAIL).toBeTruthy()
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBeTruthy()
    })

    it('should generate dynamic TOO_LONG message', () => {
      const message = ERROR_MESSAGES.TOO_LONG(100)
      expect(message).toContain('100')
      expect(message).toContain('characters')
    })
  })

  describe('SUCCESS_MESSAGES', () => {
    it('should have success messages', () => {
      expect(SUCCESS_MESSAGES.EMAIL_SENT).toBeTruthy()
      expect(SUCCESS_MESSAGES.FORM_SUBMITTED).toBeTruthy()
    })
  })
})
