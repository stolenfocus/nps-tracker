import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH || "/nps-tracker",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
