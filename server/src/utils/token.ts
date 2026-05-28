// JWT signing and verification helpers.
import { SignJWT, jwtVerify } from "jose";

import { getConfig } from "../config";
import type { UserJWT } from "../types/auth";

const config = getConfig();
const secret = new TextEncoder().encode(config.jwtSecret);

// Signs a JWT token for an authenticated user.
export async function signAuthToken(payload: UserJWT): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1000h")
    .sign(secret);
}
 
// Verifies and decodes a JWT token.
export async function verifyAuthToken(token: string): Promise<UserJWT | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: Number(payload.id),
      email: String(payload.email)
    };
  } catch {
    return null;
  }
}