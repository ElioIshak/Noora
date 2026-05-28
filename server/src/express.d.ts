// Extends Express request with JWT user claims.
import type { UserJWT } from "./types/auth";

declare global {
  namespace Express {
    interface Request {
      userJWT?: UserJWT;
    }
  }
}

export {};