import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Remote images for BMKG weather icons
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-apps.bmkg.go.id",
        pathname: "/storage/icon/cuaca/**",
      },
    ],
  },

  // Server-side fetch caching
};

export default nextConfig;
