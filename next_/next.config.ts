import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Silence workspace root inference warning by explicitly setting the project root
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: '/customer/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
