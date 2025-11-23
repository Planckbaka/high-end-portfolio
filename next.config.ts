import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Cloudflare Pages 优化配置
  images: {
    unoptimized: true, // 使用 Cloudflare 的图片优化服务
  },

  // 启用静态导出（推荐用于 Cloudflare Pages）
  output: 'export',
};

export default nextConfig;
