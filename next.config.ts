import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.AERIS_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90, 100],
  },
  devIndicators: false,
  poweredByHeader: false,
};
export default nextConfig;
