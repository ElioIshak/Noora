// Password hashing helpers for auth flows.
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Hashes a plaintext password.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verifies a plaintext password against a hash.
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 