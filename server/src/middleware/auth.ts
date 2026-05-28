// Authentication middleware for Express routes.
import type { RequestHandler } from "express";

import { verifyAuthToken } from "../utils/token";

// Parses and verifies an Authorization bearer token if provided.
export const verifyJWT: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    next();
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next();
    return;
  }

  const payload = await verifyAuthToken(token);
  if (payload) {
    req.userJWT = payload;
  }

  next();
};

// Enforces authentication for protected routes.
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.userJWT) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  next();
};