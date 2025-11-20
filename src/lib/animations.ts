// Animation easing curves
export const EASINGS = {
    smooth: [0.76, 0, 0.24, 1] as const,
    spring: [0.6, 0.01, -0.05, 0.95] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

// Animation durations
export const DURATIONS = {
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    verySlow: 1.5,
} as const;

// Common animation variants
export const fadeInVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const slideUpVariant = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const scaleUpVariant = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};
