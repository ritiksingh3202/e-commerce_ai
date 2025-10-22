import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@pinecone-database/pinecone", "@huggingface/inference"],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.amazon.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.myntassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.boat-lifestyle.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jiomart.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thehouseofrare.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.campusshoes.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.flipkart.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.myntra.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ajio.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;