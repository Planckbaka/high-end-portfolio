/**
 * Film-grain overlay.
 *
 * Opacity comes from `--grain-opacity` rather than a fixed value: identical
 * grain reads roughly twice as strong over bone-white as it does over near-black,
 * so the light theme needs a lower amount to avoid looking dirty.
 *
 * Server component — nothing here is interactive.
 */
export function Noise() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[100] h-full w-full animate-grain motion-reduce:animate-none"
            style={{
                opacity: "var(--grain-opacity)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "128px",
            }}
            aria-hidden="true"
        />
    );
}
