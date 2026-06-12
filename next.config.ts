import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.1.4',
    '192.168.1.8',
    '*.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.ngrok.io',
  ],
};

export default nextConfig;
