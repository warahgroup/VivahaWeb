import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

// Create Express app instance
const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
let initialized = false;

const initializeApp = async () => {
  if (initialized) return;
  
  // Register all API routes
  await registerRoutes(app);
  
  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  initialized = true;
};

// Wrap Express app as serverless function
const handler = serverless(app);

// Netlify function wrapper
export const main: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Initialize the app if not already done
  await initializeApp();
  
  // Call the serverless handler
  return await handler(event, context);
};



