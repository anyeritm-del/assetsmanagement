import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // An unrelated package-lock.json in the parent (home) directory makes Next.js guess the
  // wrong workspace root; pin it explicitly to this project.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
