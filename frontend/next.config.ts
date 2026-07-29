import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.166.237.222",
    "therapist-becoming-stage-hear.trycloudflare.com",
    "lh3.googleusercontent.com",
    "https://health-copilot-029n.onrender.com",
    "https://health-copilot-rouge.vercel.app"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;