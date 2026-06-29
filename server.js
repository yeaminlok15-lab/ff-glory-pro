import express from "express";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Guild API proxy — avoids browser CORS issues
app.get("/api/guild", (req, res) => {
  const { guild_id, region } = req.query;
  if (!guild_id || !region) {
    return res.status(400).json({ status: "error", message: "guild_id and region are required" });
  }
  const apiUrl = new URL("https://danger-guild-management-web.vercel.app/guild");
  apiUrl.searchParams.set("guild_id", guild_id);
  apiUrl.searchParams.set("region", region);

  const client = apiUrl.protocol === "https:" ? https : http;
  const options = {
    hostname: apiUrl.hostname,
    path: apiUrl.pathname + apiUrl.search,
    method: "GET",
    headers: { "Accept": "application/json", "User-Agent": "AGGlory/1.0" }
  };

  const proxyReq = client.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 200);
    res.setHeader("Content-Type", "application/json");
    let data = "";
    proxyRes.on("data", chunk => { data += chunk; });
    proxyRes.on("end", () => {
      try {
        res.send(data);
      } catch {
        res.status(500).json({ status: "error", message: "Invalid API response" });
      }
    });
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err.message);
    res.status(500).json({ status: "error", message: "Could not reach guild API" });
  });

  proxyReq.end();
});

// Serve static Vite build
const distPath = path.join(__dirname, "dist", "public");
app.use(express.static(distPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`AGGlory server running on port ${PORT}`);
});
