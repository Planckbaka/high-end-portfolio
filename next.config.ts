import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  /*
   * Images ship byte-identical to public/ (Workers assets have no on-the-fly
   * optimizer; the `sizes` hints on next/image are therefore inert). Source
   * art is pre-sized and WebP-compressed instead. Switching this on requires
   * wiring an OpenNext image loader — a deliberate tradeoff, not an oversight.
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
