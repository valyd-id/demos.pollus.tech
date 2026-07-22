// pm2 process definition for the demos.valyd.work SSR server.
//   pm2 start ecosystem.config.cjs
//   pm2 save
module.exports = {
  apps: [
    {
      name: "demos",
      cwd: "/var/www/pollus_main_servers/demos.valyd.work",
      script: "server.node.mjs",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3100",
        // Demo server functions call the public Verify API.
        VERIFY_API_URL: "http://127.0.0.1:8003",
      },
      max_memory_restart: "300M",
      autorestart: true,
    },
  ],
};
