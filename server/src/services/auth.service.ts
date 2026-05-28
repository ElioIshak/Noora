// Authentication and user persistence service functions.
import { createHash, randomBytes } from "node:crypto";

import { db } from "../db/db";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAuthToken } from "../utils/token";

import {
  sendSignInEmail,
  sendWelcomeEmail
} from "./notification.service";

// Public user payload returned to clients.
export type PublicUser = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}; 

const RESET_TOKEN_HASH_ALGORITHM = process.env.RESET_TOKEN_HASH_ALGORITHM || "sha256";
const PASSWORD_RESET_TOKEN_BYTES = process.env.PASSWORD_RESET_TOKEN_BYTES ? parseInt(process.env.PASSWORD_RESET_TOKEN_BYTES) : 32;
const PASSWORD_RESET_TOKEN_TTL_MS = process.env.PASSWORD_RESET_TOKEN_TTL_MS ? parseInt(process.env.PASSWORD_RESET_TOKEN_TTL_MS) : 1000 * 60 * 30;

function queueNotificationEmail(label: string, send: () => Promise<unknown>): void {
  void send().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`Failed to send ${label} email.`, error instanceof Error ? error.message : error);
  });
}

// Creates a SHA-256 hash for a reset token.
function hashResetToken(token: string): string {
  return createHash(RESET_TOKEN_HASH_ALGORITHM).update(token).digest("hex");
}

// Normalizes user emails for consistent lookups.
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Splits a full name into first, last, and username fields.
export function splitName(name: string): { firstName: string; lastName: string; userName: string } {
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);

  const firstName = parts[0] ?? "User";
  const lastName = parts.slice(1).join(" ");
  const userName = cleanName ? cleanName.replace(/\s+/g, "_").toLowerCase() : `user_${Date.now()}`;

  return { firstName, lastName, userName };
}

// Returns a safe public representation of one user row.
export function toPublicUser(user: {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  user_name: string;
  created_at: Date | string;
}): PublicUser {
  const firstName = String(user.first_name ?? "").trim();
  const lastName = String(user.last_name ?? "").trim();
  const fallbackName = String(user.user_name ?? "").replace(/_/g, " ").trim();
  const name = `${firstName} ${lastName}`.trim() || fallbackName || "User";

  return {
    id: Number(user.id),
    email: String(user.email),
    name,
    createdAt: new Date(user.created_at).toISOString()
  };
}

// Creates a new user account.
export async function signup(email: string, password: string, name: string) {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await hashPassword(password);
  const { firstName, lastName, userName } = splitName(name);

  const insertedUser = await db
    .insertInto("users")
    .values({
      user_name: userName,
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      hashed_password: hashedPassword,
      subscription: 0
    })
    .returning(["id", "email", "first_name", "last_name", "user_name", "created_at"])
    .executeTakeFirst();

  if (!insertedUser) {
    throw new Error("Failed to create user.");
  }

  await db
    .insertInto("user_notification_preferences")
    .values({
      user_id: Number(insertedUser.id),
      email_notifications: true,
      daily_reminders: false,
      weekly_insights: true
    })
    .onConflict((oc) => oc.column("user_id").doNothing())
    .execute();

  const token = await signAuthToken({
    id: Number(insertedUser.id),
    email: normalizedEmail
  });

  const publicUser = toPublicUser(insertedUser);
  queueNotificationEmail("welcome", () => sendWelcomeEmail(publicUser));

  return {
    token,
    user: publicUser
  };
}

// Authenticates an existing user.
export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const verified = await verifyPassword(password, String(user.hashed_password));
  if (!verified) {
    throw new Error("Invalid credentials.");
  }

  const token = await signAuthToken({
    id: Number(user.id),
    email: normalizedEmail
  });

  const publicUser = toPublicUser(user);
  queueNotificationEmail("sign-in", () => sendSignInEmail(publicUser));

  return {
    token,
    user: publicUser
  };
}

// Logs out a user account.
export async function logout(_userId: number) {
  return { success: true };
}

// Starts a password-reset flow for one email address.
export async function requestPasswordReset(email: string) {
  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  const resetToken = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");

  if (!user) {
    return {
      success: true,
      message: "A reset token has been generated."
    };
  }

  const now = new Date(); 
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS);

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("password_reset_tokens")
      .set({
        used_at: now
      })
      .where("user_id", "=", Number(user.id))
      .where("used_at", "is", null)
      .execute();

    await trx
      .insertInto("password_reset_tokens")
      .values({
        user_id: Number(user.id),
        token_hash: hashResetToken(resetToken),
        expires_at: expiresAt,
        used_at: null
      })
      .execute();
  });

  return {
    success: true,
    message: "A reset token has been generated.",
    resetToken
  };
}

// Resets a password using a valid one-time token.
export async function resetPassword(email: string, resetToken: string, newPassword: string) {
  const normalizedToken = resetToken.trim();
  const normalizedPassword = newPassword.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedToken || !normalizedPassword || !normalizedEmail) {
    throw new Error("resetToken, newPassword, and email are required.");
  }

  if (normalizedPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const tokenHash = hashResetToken(normalizedToken);
  const now = new Date();

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", normalizedEmail)
    .executeTakeFirst();

  if (!user) {
    throw new Error("Invalid email or reset token.");
  }

  await db.transaction().execute(async (trx) => {
    const tokenRecord = await trx
      .selectFrom("password_reset_tokens")
      .selectAll()
      .where("user_id", "=", Number(user.id))
      .where("token_hash", "=", tokenHash)
      .where("used_at", "is", null)
      .where("expires_at", ">", now)
      .executeTakeFirst();

    if (!tokenRecord) {
      throw new Error("Reset token is invalid or expired.");
    }

    const hashedPassword = await hashPassword(normalizedPassword);

    await trx
      .updateTable("users")
      .set({
        hashed_password: hashedPassword
      })
      .where("id", "=", Number(tokenRecord.user_id))
      .execute();

    await trx
      .updateTable("password_reset_tokens")
      .set({
        used_at: now
      })
      .where("id", "=", Number(tokenRecord.id))
      .execute();
  });

  return {
    success: true
  };
}

// Loads a user by id.
export async function getUserById(userId: number) {
  return db
    .selectFrom("users")
    .selectAll().where("id", "=", userId)
    .executeTakeFirst();
}

// Loads a user by email.
export async function getUserByEmail(email: string) {
  return db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", normalizeEmail(email))
    .executeTakeFirst();
}
