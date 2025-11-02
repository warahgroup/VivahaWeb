import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      log(`Error: ${message} (Status: ${status})`);
    });

    // Setup Vite in development mode
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use a simple server.listen call
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, '127.0.0.1', () => {
      log(`Server running on http://127.0.0.1:${port}`);
    });

    // Add error handling for the server
    server.on('error', (error: NodeJS.ErrnoException) => {
      log(`Server error: ${error.message} (Code: ${error.code})`);
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is in use. Try a different port.`);
      } else if (error.code === 'ENOTSUP') {
        log(`Socket operation not supported. Try a different host or port.`);
      }
      throw error;
    });
  } catch (error) {
    log(`Failed to start server: ${error.message}`);
    throw error;
  }
})();

export default app;
export { app };