import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
    ],
  },
  experimental: {
    // Required for `unstable_after()` in Next 15.0.x — lets route handlers run
    // background work (the broker scan) after the response is sent.
    after: true,
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.shielded.app"],
    },
  },
};

export default nextConfig;
