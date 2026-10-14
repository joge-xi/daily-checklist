import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 部署在子路径 /daily-checklist/ 下，必须配 basePath，
  // 否则 /_next 等资源会指向站点根路径而 404。
  basePath: "/daily-checklist",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
