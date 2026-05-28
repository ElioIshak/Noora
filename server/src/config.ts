// Centralized server configuration helpers.
import { ensureEnvLoaded } from "./utils/env";

ensureEnvLoaded();

// Parses a number from env with a fallback value.
function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value?.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Reads and validates required environment variables.
function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Returns static server settings for runtime usage.
export function getConfig() {
  return {
    port: toNumber(process.env.PORT, 4000),
    databaseUrl: readRequired("DATABASE_URL"),
    jwtSecret: readRequired("JWT_SECRET"),
    nooraMlBaseUrl: process.env.NOORA_ML_BASE_URL?.trim() || "http://127.0.0.1:8000",
    nooraMlRunAppPath: process.env.NOORA_ML_RUN_APP_PATH?.trim() || "/run_app",
    nooraTimeoutMs: toNumber(process.env.NOORA_TIMEOUT_MS, 20000),
    historyLimit: toNumber(process.env.NOORA_HISTORY_LIMIT, 20),
    titleGeneratorApiKey: process.env.TITLE_GENERATOR_API_KEY,
    weeklySummaryGeminiApiKey: process.env.WEEKLY_SUMMARY_GEMINI_API_KEY?.trim(),
    weeklySummaryGeminiModel: process.env.WEEKLY_SUMMARY_GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    appUrl: process.env.APP_URL?.trim() || process.env.CORS_ORIGIN?.trim() || "http://localhost:3000",
    resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
    resendFromEmail: process.env.RESEND_FROM_EMAIL?.trim() || "",
    emailNotificationsEnabled: process.env.EMAIL_NOTIFICATIONS_ENABLED?.trim().toLowerCase() !== "false",
    weeklyEmailsEnabled: process.env.WEEKLY_EMAILS_ENABLED?.trim().toLowerCase() !== "false",
    weeklyEmailCheckIntervalMs: toNumber(process.env.WEEKLY_EMAIL_CHECK_INTERVAL_MS, 1000 * 60 * 60),
    weeklyEmailLookbackDays: toNumber(process.env.WEEKLY_EMAIL_LOOKBACK_DAYS, 7)
  };
}
