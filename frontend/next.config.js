const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // npm workspaces hoist `next` to repo root (`../node_modules/next`). Turbopack must use that root to resolve the Next package.
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

module.exports = nextConfig;
