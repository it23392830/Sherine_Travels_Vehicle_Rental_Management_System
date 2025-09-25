/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
 
// Proxy API requests to Azure API App when running in Production or Preview
export async function rewrites() {
  const apiTarget = process.env.NEXT_PUBLIC_API_PROXY_TARGET;
  if (!apiTarget) return [];
  return [
    {
      source: "/api/:path*",
      destination: `${apiTarget}/api/:path*`,
    },
  ];
}