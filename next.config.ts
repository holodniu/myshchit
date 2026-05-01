import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: false,
  },

  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
