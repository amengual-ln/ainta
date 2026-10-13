/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.lumacdn.com", port: "" }],
  },
};

export default nextConfig;
