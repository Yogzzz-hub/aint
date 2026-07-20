const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devServer: {
    allowedHosts: "all",
    client: {
      webSocketURL: {
        hostname: "0.0.0.0",
        port: 443,
        protocol: "wss",
      },
    },
  },
};
