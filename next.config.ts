import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Utile quando si caricano immagini articolo dal client
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
