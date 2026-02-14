import type { NextConfig } from "next";

// @ts-ignore
const nextConfig: NextConfig = {
  // Enable static export for Amplify
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.jsdelivr.net; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: https: https://images.unsplash.com https://vercel.live; " +
              "font-src 'self' data: https: https://fonts.gstatic.com https://vercel.live; " +
              "connect-src 'self' http://localhost:8000 https://*.onrender.com wss://localhost:8000 wss://*.onrender.com https://cdn.jsdelivr.net https://storage.googleapis.com https://vercel.live wss://ws-us3.pusher.com https://sockjs-us3.pusher.com https://*.awsapprunner.com wss://*.awsapprunner.com; " +
              "worker-src 'self' blob:; " +
              "child-src 'self' blob:; " +
              "frame-src 'self' https://vercel.live;"
          },
          { key: "Permissions-Policy", value: "camera=*, microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
        ],
      },
    ];
  },
};

export default nextConfig;
