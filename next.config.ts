import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
  // Ensure trailing slashes for cleaner URLs
  trailingSlash: true,
};

export default nextConfig;
