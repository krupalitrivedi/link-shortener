import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up past the project.
  turbopack: { root: path.resolve(process.cwd()) },
};

export default nextConfig;
