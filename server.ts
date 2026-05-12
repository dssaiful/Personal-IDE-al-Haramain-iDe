import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(cors());
  app.use(express.json());

  // --- Desktop Core File System API (Fix for Network Errors) ---
  
  app.get("/api/files", async (req, res) => {
    try {
      const dirPath = (req.query.path as string) || ".";
      const absPath = path.resolve(dirPath);
      const entries = await fs.readdir(absPath, { withFileTypes: true });
      
      const items = entries.map(entry => ({
        name: entry.name,
        is_dir: entry.isDirectory(),
        path: path.relative(process.cwd(), path.join(absPath, entry.name)),
        size: 0 // Simplified for preview
      }));
      
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.get("/api/file-content", async (req, res) => {
    try {
      const filePath = req.query.path as string;
      if (!filePath) return res.status(400).json({ error: "Missing path" });
      
      const content = await fs.readFile(path.resolve(filePath), "utf-8");
      res.json({ content });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.post("/api/save-file", async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath) return res.status(400).json({ error: "Missing path" });
      
      const absPath = path.resolve(filePath);
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, content, "utf-8");
      
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // --- Terminal Management ---
  io.on("connection", (socket) => {
    console.log("Terminal client connected");

    // In a real Electron app with node-pty:
    // const ptyProcess = pty.spawn(shell, [], { ... });
    
    // Fallback using standard spawn for preview environment
    const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
    const terminal = spawn(shell, [], {
      env: process.env,
      cwd: process.cwd(),
    });

    terminal.stdout.on("data", (data) => {
      socket.emit("data", data.toString());
    });

    terminal.stderr.on("data", (data) => {
      socket.emit("data", data.toString());
    });

    socket.on("input", (data) => {
      terminal.stdin.write(data);
    });

    socket.on("resize", (dims) => {
      // In node-pty: ptyProcess.resize(dims.cols, dims.rows);
    });

    socket.on("disconnect", () => {
      terminal.kill();
      console.log("Terminal client disconnected");
    });
  });

  // Proxy to Python Backend if needed, or handle FS here
  app.get("/api/status", (req, res) => {
    res.json({ status: "Core Engine Active", environment: "Desktop Ready" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Desktop Core Engine running at http://localhost:3000");
    console.log("Local Disk Access Bridge enabled via Python @ port 8000");
  });
}

startServer();
