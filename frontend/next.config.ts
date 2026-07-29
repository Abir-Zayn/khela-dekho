import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'khela-dekho-uploads-buck.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
