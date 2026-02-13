import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
                   "img-src 'self' data: https: https://images.unsplash.com; " +
                   "font-src 'self' data: https://fonts.gstatic.com; " +
                   "connect-src 'self' http://localhost:8000 https://*.onrender.com wss://localhost:8000 wss://*.onrender.com https://cdn.jsdelivr.net; " +
                   "worker-src 'self' blob:; " +
                   "child-src 'self' blob:; " +
                   "frame-src 'self';"
          },
          { key: "Permissions-Policy", value: "camera=*, microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
        ],
      },
    ];
  },
};

export default nextConfig;
