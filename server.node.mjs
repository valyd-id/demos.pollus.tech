// Node production launcher for the demos SSR app.
//
// The Vite/Nitro build (via @lovable.dev/vite-tanstack-config) targets Cloudflare
// and emits a Web `fetch` handler at dist/server/server.js (default export
// `{ fetch(request, env, ctx) }`) rather than a Node server that binds a port.
// This wraps that handler with srvx so it runs as a normal Node HTTP server
// behind nginx. Server functions read config from process.env (e.g.
// VERIFY_API_URL), so we pass process.env through as the Worker `env` arg.
import { serve } from "srvx";
import app from "./dist/server/server.js";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "127.0.0.1";

serve({
  port,
  hostname,
  fetch: (request) => app.fetch(request, process.env, {}),
});

console.log(`demos SSR listening on http://${hostname}:${port}`);
