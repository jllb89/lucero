
import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import webpack from 'webpack';
import path from 'path';

dotenv.config();

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizeCss: false,
  },
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

    // 3. Disable CSS/JS minimization entirely for debugging to avoid
    //    CssMinimizerPlugin and any PostCSS SCSS parser usage
    config.optimization = config.optimization || {};
    config.optimization.minimize = false;

    // 4. Remove CssMinimizerPlugin (uses PostCSS SCSS parser) to avoid
    //    "Unknown word" errors on escaped class names (e.g., placeholder\:...)
    if (config.optimization && Array.isArray(config.optimization.minimizer)) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        // Some minimizers are functions or have no constructor; keep those.
        (minimizer: any) => {
          const name = minimizer?.constructor?.name || '';
          return name !== 'CssMinimizerPlugin';
        }
      );
    }

    return config;
  },
};

export default nextConfig;
