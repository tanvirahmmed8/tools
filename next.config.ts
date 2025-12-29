import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow larger base64 payloads from PDF/image uploads during extraction.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
