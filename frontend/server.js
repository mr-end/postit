const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:8080";
const ENV = (process.env.ENV || "local").toLowerCase();

// pathFilter keeps the full path (/api/..., /q/...) — mounting on "/api"
// would strip the prefix and the Quarkus routes would 404.
app.use(
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathFilter: (pathname) => pathname.startsWith("/api") || pathname.startsWith("/q"),
  })
);

app.get("/config", (_req, res) => {
  res.json({ env: ENV });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Post-it frontend on http://localhost:${PORT} [${ENV}]`);
  console.log(`Proxying /api and /q -> ${API_URL}`);
});
