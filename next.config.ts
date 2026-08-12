import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Discord のアバター画像（profiles.avatar_url に入る）
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/avatars/**" },
    ],
  },
};

export default nextConfig;
