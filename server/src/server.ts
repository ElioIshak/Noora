// Express server entrypoint.
import express from "express";

import api from "./api";
import { getConfig } from "./config";
import { startWeeklyNotificationScheduler } from "./services/notification.service";

const config = getConfig();

// Starts the HTTP server.
async function startServer() {
  const app = express();

  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN?.trim() || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use("/api", api);

  app.listen(config.port, () => {
    startWeeklyNotificationScheduler();

    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${config.port} at ${config.appUrl}`);
  });
}

void startServer();
