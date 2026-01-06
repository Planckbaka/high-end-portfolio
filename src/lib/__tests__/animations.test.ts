import {
  EASINGS,
  DURATIONS,
  fadeInVariant,
  slideUpVariant,
  scaleUpVariant,
} from '../animations'

describe('Animation Exports', () => {
  describe('EASINGS', () => {
    it('should have smooth easing curve', () => {
      expect(EASINGS.smooth).toHaveLength(4)
      expect(EASINGS.smooth).toEqual([0.76, 0, 0.24, 1])
    })

    it('should have spring easing curve', () => {
      expect(EASINGS.spring).toHaveLength(4)
    })

    it('should have bounce easing curve', () => {
      expect(EASINGS.bounce).toHaveLength(4)
    })
  })

  describe('DURATIONS', () => {
    it('should have fast duration less than normal', () => {
      expect(DURATIONS.fast).toBeLessThan(DURATIONS.normal)
    })

    it('should have normal duration less than slow', () => {
      expect(DURATIONS.normal).toBeLessThan(DURATIONS.slow)
    })

    it('should have slow duration less than verySlow', () => {
      expect(DURATIONS.slow).toBeLessThan(DURATIONS.verySlow)
    })

    it('should have positive durations', () => {
      expect(DURATIONS.fast).toBeGreaterThan(0)
      expect(DURATIONS.normal).toBeGreaterThan(0)
      expect(DURATIONS.slow).toBeGreaterThan(0)
      expect(DURATIONS.verySlow).toBeGreaterThan(0)
    })
  })

  describe('fadeInVariant', () => {
    it('should have initial opacity 0', () => {
      expect(fadeInVariant.initial.opacity).toBe(0)
    })

    it('should have animate opacity 1', () => {
      expect(fadeInVariant.animate.opacity).toBe(1)
    })

    it('should have exit opacity 0', () => {
      expect(fadeInVariant.exit.opacity).toBe(0)
    })
  })

  describe('slideUpVariant', () => {
    it('should start with opacity 0 and y offset', () => {
      expect(slideUpVariant.initial.opacity).toBe(0)
      expect(slideUpVariant.initial.y).toBeGreaterThan(0)
    })

    it('should animate to opacity 1 and y 0', () => {
      expect(slideUpVariant.animate.opacity).toBe(1)
      expect(slideUpVariant.animate.y).toBe(0)
    })

    it('should exit with opacity 0 and negative y', () => {
      expect(slideUpVariant.exit.opacity).toBe(0)
      expect(slideUpVariant.exit.y).toBeLessThan(0)
    })
  })

  describe('scaleUpVariant', () => {
    it('should start with reduced scale', () => {
      expect(scaleUpVariant.initial.scale).toBeLessThan(1)
      expect(scaleUpVariant.initial.opacity).toBe(0)
    })

    it('should animate to full scale', () => {
      expect(scaleUpVariant.animate.scale).toBe(1)
      expect(scaleUpVariant.animate.opacity).toBe(1)
    })

    it('should exit with reduced scale', () => {
      expect(scaleUpVariant.exit.scale).toBeLessThan(1)
      expect(scaleUpVariant.exit.opacity).toBe(0)
    })
  })
})
