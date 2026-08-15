import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network devices (e.g. mobile testing on local Wi-Fi IP)
  allowedDevOrigins: [
    "192.168.29.164",
    "192.168.29.164:3000",
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ],
  // Allow importing images from the assets directory
  images: {
    unoptimized: false,
  },
  // Transpile packages that use ESM-only exports
  transpilePackages: ["motion"],
};

export default nextConfig;

