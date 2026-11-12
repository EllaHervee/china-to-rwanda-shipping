/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack scoped to this workspace so it can resolve shared dependencies.
  turbopack: {
    root: require("path").resolve(__dirname, ".."),
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      { source: "/api/health", destination: `${backend}/api/health` },
      { source: "/api/quote", destination: `${backend}/api/quote` },
    ];
  },
};

module.exports = nextConfig;
