"use strict";
try {
  require("dotenv").config();
} catch (e) {
  // Ignore missing dotenv in production
}
const path = require("path");
const express = require("express");
const catalyst = require("zcatalyst-sdk-node");
const compression = require("compression");
const fs = require("fs");
const cors = require("cors");

// Import middlewares
const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorMiddleware");

// Import routes
const junkyardRoutes = require("./routes/junkyardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

// Configuration: Point to your frontend build directory
// In Catalyst deployment, structure is: build/backend/index.js + build/frontend/
// Locally, structure is: backend/index.js + frontend/out/
const appDir = (() => {
  // Check Catalyst structure first (../frontend exists)
  const catalystPath = path.join(__dirname, "../frontend");
  if (fs.existsSync(catalystPath) && fs.existsSync(path.join(catalystPath, "index.html"))) {
    console.log("📂 Serving from Catalyst structure:", catalystPath);
    return catalystPath;
  }
  // Check local dev structure (frontend/out)
  const localPath = path.join(__dirname, "../frontend/out");
  if (fs.existsSync(localPath)) {
    console.log("📂 Serving from local build:", localPath);
    return localPath;
  }
  // Fallback
  console.warn("⚠️ No valid frontend path found, using fallback");
  return path.join(__dirname, "../frontend");
})();

// --- App Setup ---

app.use(cors());
app.use(requestLogger);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the frontend build
app.use(
  express.static(appDir, {
    maxAge: process.env.NODE_ENV === 'production' ? "1h" : 0, // Reduced caching
    etag: true,
    lastModified: true,
    extensions: ['html'],
  })
);

// --- API Routes ---

// Simple hello endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Catalyst backend!" });
});

// Mount route modules
app.use("/api/junkyard", junkyardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/teams", teamRoutes);

// --- Static Export Page & SPA Serving ---

const servePage = (req, res) => {
  let reqPath = req.path || "/";

  // 1. Check if exact file exists on disk (e.g. static assets, __next._tree.txt, etc.)
  const exactPath = path.join(appDir, reqPath);
  if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
    return res.sendFile(exactPath);
  }

  const isRscRequest = req.headers['rsc'] === '1' || req.query._rsc;

  if (reqPath.endsWith('.txt')) {
    const base = reqPath.slice(0, -4);
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const dirTxtPath = path.join(appDir, cleanBase, "index.txt");
    if (fs.existsSync(dirTxtPath)) {
      res.setHeader('Content-Type', 'text/x-component');
      return res.sendFile(dirTxtPath);
    }
    return res.status(404).send("RSC payload not found");
  }

  // 2. If path doesn't have an extension, try subfolder index.html or .html
  if (!reqPath.includes(".")) {
    const cleanPath = reqPath.endsWith("/") ? reqPath.slice(0, -1) : reqPath;
    
    if (isRscRequest) {
      res.setHeader('Content-Type', 'text/x-component');
      const dirTxtPath = path.join(appDir, cleanPath, "index.txt");
      if (fs.existsSync(dirTxtPath)) return res.sendFile(dirTxtPath);
      
      const rootTxtPath = path.join(appDir, (cleanPath || "index") + ".txt");
      if (fs.existsSync(rootTxtPath)) return res.sendFile(rootTxtPath);
      
      return res.status(404).send("RSC payload not found");
    }

    const dirIndexPath = path.join(appDir, cleanPath, "index.html");
    if (fs.existsSync(dirIndexPath)) {
      return res.sendFile(dirIndexPath);
    }
    const htmlPath = path.join(appDir, cleanPath + ".html");
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }

  // 3. Fallback to root index.html
  const indexPath = path.join(appDir, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send("Frontend build not found. Please run 'npm run build' in the frontend directory.");
};

// Explicit route for favicon.ico
app.get("/favicon.ico", (req, res) => {
  const brandFavicon = path.join(appDir, "brand", "favicon_mark.png");
  if (fs.existsSync(brandFavicon)) {
    return res.sendFile(brandFavicon);
  }
  const favPath = path.join(appDir, "favicon.ico");
  if (fs.existsSync(favPath)) {
    return res.sendFile(favPath);
  }
  res.status(404).send();
});

// Explicit route for root path
app.get("/", servePage);

// Fallback for sub-routes & RSC payloads
app.use((req, res, next) => {
  servePage(req, res);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});
