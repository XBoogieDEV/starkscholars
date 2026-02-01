import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
  trailingSlash: true,
  
  // Proxy configuration for protected routes
  // Replaces the deprecated middleware.ts convention
  async redirects() {
    return [
      {
        source: "/apply/:path*",
        destination: "/login?redirect=/apply/:path*",
        permanent: false,
        missing: [
          {
            type: "cookie",
            key: "better-auth.session_token",
          },
        ],
      },
      {
        source: "/admin/:path*",
        destination: "/unauthorized",
        permanent: false,
        missing: [
          {
            type: "cookie",
            key: "better-auth.session_token",
          },
        ],
      },
      {
        source: "/committee/:path*",
        destination: "/unauthorized",
        permanent: false,
        missing: [
          {
            type: "cookie",
            key: "better-auth.session_token",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
