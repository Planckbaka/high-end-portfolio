import { cn, formatDate } from '../utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    // tailwind-merge should handle conflicting classes
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle mixed inputs', () => {
    expect(
      cn('base', { active: true, disabled: false }, ['extra', 'classes'])
    ).toBe('base active extra classes')
  })
})

describe('formatDate utility function', () => {
  it('formats an ISO frontmatter date for UTC regardless of local timezone', () => {
    expect(formatDate('2026-09-09')).toBe('09 Sept 2026')
  })

  it('never shifts the calendar day across timezones (UTC pinned)', () => {
    // Midnight UTC + local offsets must not roll the date backward/forward.
    expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
    expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
  })
})
