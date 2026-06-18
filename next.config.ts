import type { NextConfig } from "next";
import { version } from './package.json';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
    // ...
  },
  env: {
    version
  },
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://neto.mcinnes.design",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
