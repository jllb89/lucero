import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config();

const nextConfig: NextConfig = {
  /*  Skip Next.js ESLint step in CI / prod builds  */
  eslint: { ignoreDuringBuilds: true },

  /*  Public runtime env variables  */
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  /*  Polyfill Node-core modules that some browser code (pdfjs) expects  */
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      url: require.resolve("url/"), // adds URL.parse et al.
    };
    return config;
  },
};

export default nextConfig;
