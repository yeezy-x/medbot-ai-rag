import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/login", destination: "/sign-in", permanent: false },
      { source: "/register", destination: "/sign-up", permanent: false },
    ];
  },
};

export default nextConfig;
