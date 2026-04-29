import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Отключаем ESLint при production-build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⚠️ TypeScript-ошибки оставляем
  typescript: {
    ignoreBuildErrors: false,
  },

  // Отключаем девтулс индикаторы (правильный формат для Next.js 15)
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
