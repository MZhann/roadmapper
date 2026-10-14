// Local production-bundle preview with Expo Router SPA fallbacks.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.argv[2] || "dist");
const types = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
http
  .createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      let file = path.resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
        file = path.join(root, "index.html");
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(400).end("Invalid request");
    }
  })
  .listen(8082, "127.0.0.1", () =>
    console.log("Production preview: http://127.0.0.1:8082"),
  );
