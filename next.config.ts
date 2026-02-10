import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve("./"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uqqfkyjilyjoxkryuxrw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
