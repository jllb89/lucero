import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import webpack from 'webpack';

dotenv.config();

const nextConfig: NextConfig = {
  /* ─── ESLint ─── */
  eslint: { ignoreDuringBuilds: true },

  /* ─── Public runtime vars ─── */
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET:   process.env.JWT_SECRET,
  },

  /* ─── Webpack tweaks ─── */
  webpack(config) {
    /* 1.  Node-core polyfill (`require("url")`)  */
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      url: require.resolve('url/'),
    };

    /* 2.  Runtime shim: if window.URL.parse is missing, define it        */
    const shim =
      'if(typeof URL!=="undefined"&&typeof URL.parse!=="function"){' +
      'URL.parse=(v,b)=>new URL(v,b);' +
      '}';

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: shim,
        raw: true,
        entryOnly: false,   // inject into every chunk
      })
    );

    return config;
  },
};

export default nextConfig;
