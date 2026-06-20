import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // LiveKit hooks disconnect on React's dev double-mount; official meet app disables this.
  reactStrictMode: false,
};

export default nextConfig;
