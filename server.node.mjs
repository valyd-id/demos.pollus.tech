// Node production launcher for the demos SSR app.
//
// The Vite/Nitro build (via @lovable.dev/vite-tanstack-config) targets Cloudflare
// and emits a Web `fetch` handler at dist/server/server.js (default export
// `{ fetch(request, env, ctx) }`) rather than a Node server that binds a port.
// This wraps that handler with srvx so it runs as a normal Node HTTP server
// behind nginx. Server functions read config from process.env (e.g.
// VERIFY_API_URL), so we pass process.env through as the Worker `env` arg.
//
// On Cloudflare, static build output (/assets/*, favicon, images…) is served by
// the platform, NOT by the fetch handler. Running under plain Node there is no
// such platform, so we must serve dist/client ourselves — otherwise every
// /assets/* request 404s and the page loads with no CSS/JS (blank/broken UI).
import { serve } from "srvx";
import app from "./dist/server/server.js";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "127.0.0.1";

const CLIENT_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "dist", "client");

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".wasm": "application/wasm",
};

// Serve a real file from dist/client, or return null so the request falls through
// to the SSR handler. Read-only, GET/HEAD only, and path-traversal safe.
async function serveStatic(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const { pathname } = new URL(request.url);
  if (pathname === "/") return null; // index is SSR-rendered

  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  // Collapse any traversal and keep it inside CLIENT_DIR.
  const filePath = normalize(join(CLIENT_DIR, rel));
  if (filePath !== CLIENT_DIR && !filePath.startsWith(CLIENT_DIR + "/")) return null;

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    const body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    // Hashed build assets are immutable; everything else gets a short cache.
    const cacheControl = pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600";
    return new Response(request.method === "HEAD" ? null : body, {
      headers: { "content-type": type, "cache-control": cacheControl },
    });
  } catch {
    return null; // not a static file → let SSR handle it
  }
}

serve({
  port,
  hostname,
  fetch: async (request) => (await serveStatic(request)) ?? app.fetch(request, process.env, {}),
});

console.log(`demos SSR listening on http://${hostname}:${port}`);
