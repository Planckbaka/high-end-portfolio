// Jest setup file
import '@testing-library/jest-dom'
import * as React from 'react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-themes — components read resolvedTheme to decide the active option.
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: jest.fn(),
    themes: ['light', 'dark'],
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

/*
 * Mock framer-motion.
 *
 * A Proxy covers every `motion.<tag>` without having to enumerate them, and
 * each stand-in strips the animation-only props so React does not warn about
 * unknown DOM attributes. Hooks return inert values.
 */
jest.mock('framer-motion', () => {
  const MOTION_PROPS = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'whileHover',
    'whileTap',
    'whileInView',
    'whileFocus',
    'whileDrag',
    'viewport',
    'layout',
    'layoutId',
    'drag',
    'onViewportEnter',
    'onViewportLeave',
    'custom',
  ])

  const strip = (props: Record<string, unknown>) => {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      if (!MOTION_PROPS.has(key)) out[key] = value
    }
    return out
  }

  const motion: Record<string, unknown> = new Proxy(
    {},
    {
      get(cache: Record<string, unknown>, tag: string) {
        if (!cache[tag]) {
          const Component = React.forwardRef(
            (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
              React.createElement(tag, { ...strip(props), ref })
          )
          Component.displayName = `motion.${tag}`
          cache[tag] = Component
        }
        return cache[tag]
      },
    }
  )

  const motionValue = (initial: unknown) => ({
    get: () => initial,
    set: jest.fn(),
    on: jest.fn(() => jest.fn()),
    destroy: jest.fn(),
  })

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    MotionConfig: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (initial: unknown) => motionValue(initial),
    useSpring: (initial: unknown) => motionValue(initial),
    useTransform: () => motionValue(0),
    useMotionTemplate: () => motionValue(''),
    useScroll: () => ({
      scrollY: motionValue(0),
      scrollYProgress: motionValue(0),
      scrollX: motionValue(0),
      scrollXProgress: motionValue(0),
    }),
    useReducedMotion: () => false,
    useInView: () => true,
  }
})

// Mock Lenis — it touches rAF and scroll APIs jsdom does not implement.
jest.mock('lenis', () =>
  jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    destroy: jest.fn(),
    scrollTo: jest.fn(),
    on: jest.fn(),
  }))
)

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
