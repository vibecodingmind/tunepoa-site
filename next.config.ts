import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-2b016b65-0a9e-4d58-943a-95acccbdc975.space-z.ai",
    ".space-z.ai",
    ".space.chatglm.site",
    ".up.railway.app",
  ],
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
