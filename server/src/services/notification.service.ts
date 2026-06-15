// Simple Resend + Gemini notification email service.
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

import { getConfig } from "../config";
import { db } from "../db/db";

import type { PublicUser } from "./auth.service";

const config = getConfig();
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
const gemini = config.weeklySummaryGeminiApiKey
  ? new GoogleGenAI({ apiKey: config.weeklySummaryGeminiApiKey })
  : null;

let scheduler: ReturnType<typeof setInterval> | null = null;

type EmailResult = {
  sent: boolean;
  resendEmailId?: string;
  skippedReason?: string;
};

type SendEmailOptions = {
  requireNotificationOptIn?: boolean;
};

type WeeklyPeriod = {
  start: Date;
  end: Date;
};

type WeeklySummary = {
  subjectLine: string;
  intro: string;
  emotionalSummary: string;
  bodySummary: string;
  reflectionPrompt: string;
};

const EMAIL_TYPES = {
  weeklyCheckup: "weekly_checkup",
  weeklyEmotionSummary: "weekly_emotion_summary"
} as const;

const fallbackSummary: WeeklySummary = {
  subjectLine: "Your weekly emotion summary",
  intro: "Here is a gentle look back at your week with Noora.",
  emotionalSummary: "Your conversations carried emotional signals worth noticing with care.",
  bodySummary: "Notice how your body has been responding this week: energy, tension, rest, appetite, sleep, and breathing can all hold useful clues.",
  reflectionPrompt: "What is one feeling your body has been asking you to listen to this week?"
};

function toEmailUser(user: {
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function buildEmailHtml(title: string, body: string, footer?: string): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    '<body style="margin:0;background:#f6f7fb;color:#18202f;font-family:Arial,sans-serif;">',
    '<main style="max-width:620px;margin:0 auto;padding:32px 20px;">',
    '<section style="background:#ffffff;border:1px solid #e6e9f0;border-radius:8px;padding:28px;">',
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>`,
    body,
    footer ? `<p style="margin:28px 0 0;color:#697386;font-size:13px;line-height:1.5;">${escapeHtml(footer)}</p>` : "",
    "</section>",
    "</main>",
    "</body>",
    "</html>"
  ].join("");
}

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  options: SendEmailOptions = {}
): Promise<EmailResult> {
  if (options.requireNotificationOptIn !== false && !config.emailNotificationsEnabled) {
    return { sent: false, skippedReason: "Email notifications are disabled." };
  }

  if (!resend) {
    return { sent: false, skippedReason: "RESEND_API_KEY is not configured." };
  }

  const response = await resend.emails.send({
    from: config.resendFromEmail,
    to,
    subject,
    text,
    html
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return {
    sent: true,
    resendEmailId: response.data?.id
  };
}

export async function sendWelcomeEmail(user: PublicUser): Promise<EmailResult> {
  const name = user.name || "there";
  const subject = "Welcome to Noora";
  const text = [
    `Hi ${name},`,
    "",
    "Welcome to Noora. Your account is ready, and your space is here whenever you want to check in.",
    "",
    `Open Noora: ${config.appUrl}`
  ].join("\n");
  const html = buildEmailHtml("Welcome to Noora", [
    `<p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(name)},</p>`,
    '<p style="font-size:16px;line-height:1.6;">Your account is ready, and your space is here whenever you want to check in.</p>',
    `<p style="margin:24px 0 0;"><a href="${escapeHtml(config.appUrl)}" style="display:inline-block;background:#18202f;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;">Open Noora</a></p>`
  ].join(""), "You are receiving this because email notifications are enabled in your Noora account.");

  return sendEmail(user.email, subject, text, html);
}

export async function sendSignInEmail(user: PublicUser): Promise<EmailResult> {
  const name = user.name || "there";
  const subject = "New sign-in to your Noora account";
  const text = [
    `Hi ${name},`,
    "",
    "Your Noora account was just signed in.",
    "If this was you, no action is needed. If this was not you, reset your password as soon as possible.",
    "",
    `Open Noora: ${config.appUrl}`
  ].join("\n");
  const html = buildEmailHtml(subject, [
    `<p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(name)},</p>`,
    '<p style="font-size:16px;line-height:1.6;">Your Noora account was just signed in.</p>',
    '<p style="font-size:16px;line-height:1.6;">If this was you, no action is needed. If this was not you, reset your password as soon as possible.</p>',
    `<p style="margin:24px 0 0;"><a href="${escapeHtml(config.appUrl)}" style="display:inline-block;background:#18202f;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;">Open Noora</a></p>`
  ].join(""), "You are receiving this because email notifications are enabled in your Noora account.");

  return sendEmail(user.email, subject, text, html);
}

export async function sendPasswordResetEmail(user: PublicUser, resetToken: string, expiresAt: Date): Promise<EmailResult> {
  const name = user.name || "there";
  const subject = "Reset your Noora password";
  const resetUrl = `${config.appUrl}/auth/forgot-password`;
  const expiresText = formatDate(expiresAt);
  const text = [
    `Hi ${name},`,
    "",
    "Use this reset token to set a new Noora password:",
    resetToken,
    "",
    `Reset password: ${resetUrl}`,
    "",
    `This token expires on ${expiresText}. If you did not request this, you can ignore this email.`
  ].join("\n");
  const html = buildEmailHtml(subject, [
    `<p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(name)},</p>`,
    '<p style="font-size:16px;line-height:1.6;">Use this reset token to set a new Noora password:</p>',
    `<p style="font-size:18px;line-height:1.6;font-family:monospace;background:#f6f7fb;border:1px solid #e6e9f0;border-radius:6px;padding:12px;word-break:break-all;">${escapeHtml(resetToken)}</p>`,
    `<p style="margin:24px 0 0;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#18202f;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;">Reset password</a></p>`,
    `<p style="font-size:14px;line-height:1.6;color:#697386;">This token expires on ${escapeHtml(expiresText)}. If you did not request this, you can ignore this email.</p>`
  ].join(""), "You are receiving this account-security email because a password reset was requested for your Noora account.");

  return sendEmail(user.email, subject, text, html, { requireNotificationOptIn: false });
}

function getPreviousWeekPeriod(now = new Date()): WeeklyPeriod {
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);

  const day = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - (day === 0 ? 6 : day - 1));

  const end = new Date(currentWeekStart);
  const start = new Date(end);
  start.setDate(start.getDate() - config.weeklyEmailLookbackDays);

  return { start, end };
}

function splitEmotionTags(emotion: string | null): string[] {
  return String(emotion ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function parseGeminiJson(text: string): unknown {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  const value = fenced?.[1]?.trim() || text.trim();
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Gemini response did not include JSON.");
  }

  return JSON.parse(value.slice(start, end + 1));
}

function cleanGeminiText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const clean = value.replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, maxLength) : fallback;
}

async function generateWeeklySummary(
  transcript: string,
  topEmotions: Array<{ emotion: string; count: number }>
): Promise<WeeklySummary> {
  if (!gemini || !transcript.trim()) {
    return fallbackSummary;
  }

  const prompt = [
    "Write a weekly emotional wellbeing email summary for a Noora user.",
    "Use the transcript and emotion labels to synthesize themes.",
    "Do not diagnose, prescribe treatment, or quote private details verbatim.",
    "Include emotional themes and a body check-in. Mention body signals only when supported; otherwise keep it general.",
    "Return only JSON with string fields: subjectLine, intro, emotionalSummary, bodySummary, reflectionPrompt.",
    "",
    `Top emotion labels: ${topEmotions.map((item) => `${item.emotion} (${item.count})`).join(", ") || "none"}`,
    "",
    "Transcript:",
    transcript.slice(0, 30000)
  ].join("\n");

  const response = await gemini.models.generateContent({
    model: config.weeklySummaryGeminiModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const raw = parseGeminiJson(String(response.text ?? ""));
  const record = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};

  return {
    subjectLine: cleanGeminiText(record.subjectLine, fallbackSummary.subjectLine, 90),
    intro: cleanGeminiText(record.intro, fallbackSummary.intro, 220),
    emotionalSummary: cleanGeminiText(record.emotionalSummary, fallbackSummary.emotionalSummary, 900),
    bodySummary: cleanGeminiText(record.bodySummary, fallbackSummary.bodySummary, 700),
    reflectionPrompt: cleanGeminiText(record.reflectionPrompt, fallbackSummary.reflectionPrompt, 220)
  };
}

async function hasEmailLog(userId: number, emailType: string, period: WeeklyPeriod): Promise<boolean> {
  const row = await db
    .selectFrom("notification_email_logs")
    .select("id")
    .where("user_id", "=", userId)
    .where("email_type", "=", emailType)
    .where("period_start", "=", period.start)
    .where("period_end", "=", period.end)
    .executeTakeFirst();

  return Boolean(row);
}

async function recordEmailLog(userId: number, emailType: string, period: WeeklyPeriod, resendEmailId?: string) {
  await db
    .insertInto("notification_email_logs")
    .values({
      user_id: userId,
      email_type: emailType,
      period_start: period.start,
      period_end: period.end,
      resend_email_id: resendEmailId ?? null
    })
    .onConflict((oc) => oc.columns(["user_id", "email_type", "period_start", "period_end"]).doNothing())
    .execute();
}

async function sendWeeklyCheckupEmail(user: PublicUser): Promise<EmailResult> {
  const subject = "Your weekly Noora check-in";
  const text = [
    `Hi ${user.name || "there"},`,
    "",
    "A gentle weekly check-in: how have you been feeling lately?",
    "If you have a few minutes, Noora is ready to help you reflect on what has been heavy, hopeful, or simply present.",
    "",
    `Check in with Noora: ${config.appUrl}`
  ].join("\n");
  const html = buildEmailHtml(subject, [
    `<p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(user.name || "there")},</p>`,
    '<p style="font-size:16px;line-height:1.6;">A gentle weekly check-in: how have you been feeling lately?</p>',
    '<p style="font-size:16px;line-height:1.6;">If you have a few minutes, Noora is ready to help you reflect on what has been heavy, hopeful, or simply present.</p>',
    `<p style="margin:24px 0 0;"><a href="${escapeHtml(config.appUrl)}" style="display:inline-block;background:#18202f;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;">Check in</a></p>`
  ].join(""), "You are receiving this because email notifications are enabled in your Noora account.");

  return sendEmail(user.email, subject, text, html);
}

async function buildWeeklyConversationData(userId: number, period: WeeklyPeriod) {
  const rows = await db
    .selectFrom("messages")
    .innerJoin("conversations", "conversations.id", "messages.conversation_id")
    .select([
      "conversations.title",
      "messages.conversation_id",
      "messages.role",
      "messages.content",
      "messages.emotion",
      "messages.created_at"
    ])
    .where("conversations.user_id", "=", userId)
    .where("messages.created_at", ">=", period.start)
    .where("messages.created_at", "<=", period.end)
    .orderBy("messages.created_at", "asc")
    .orderBy("messages.id", "asc")
    .execute();

  const emotionCounts = new Map<string, number>();
  const conversationIds = new Set<number>();
  const transcriptLines: string[] = [];

  for (const row of rows) {
    conversationIds.add(Number(row.conversation_id));

    for (const emotion of splitEmotionTags(row.emotion)) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1);
    }

    const emotion = row.emotion ? ` | emotion: ${row.emotion}` : "";
    transcriptLines.push([
      `[${row.created_at.toISOString()}] ${row.title || "Untitled conversation"}`,
      `${row.role === "user" ? "User" : "Noora"}${emotion}: ${row.content}`
    ].join("\n"));
  }

  return {
    conversationCount: conversationIds.size,
    messageCount: rows.length,
    transcript: transcriptLines.join("\n\n"),
    topEmotions: [...emotionCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }))
  };
}

async function sendWeeklyEmotionSummaryEmail(user: PublicUser, userId: number, period: WeeklyPeriod): Promise<EmailResult> {
  const data = await buildWeeklyConversationData(userId, period);
  let summary = fallbackSummary;

  try {
    summary = await generateWeeklySummary(data.transcript, data.topEmotions);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to generate Gemini weekly summary.", error instanceof Error ? error.message : error);
  }

  const range = `${formatDate(period.start)} to ${formatDate(period.end)}`;
  const emotionText = data.topEmotions.length
    ? data.topEmotions.map((item) => `- ${item.emotion}: ${item.count}`).join("\n")
    : "No emotion tags were recorded this week.";
  const emotionHtml = data.topEmotions.length
    ? `<ul style="padding-left:20px;font-size:16px;line-height:1.6;">${data.topEmotions.map((item) => `<li><strong>${escapeHtml(item.emotion)}</strong>: ${item.count}</li>`).join("")}</ul>`
    : '<p style="font-size:16px;line-height:1.6;">No emotion tags were recorded this week.</p>';

  const text = [
    `Hi ${user.name || "there"},`,
    "",
    `Here is your Noora emotion summary for ${range}.`,
    `Conversations touched: ${data.conversationCount}`,
    `Messages reviewed: ${data.messageCount}`,
    "",
    summary.intro,
    "",
    summary.emotionalSummary,
    "",
    summary.bodySummary,
    "",
    "Most present emotions:",
    emotionText,
    "",
    `Reflection prompt: ${summary.reflectionPrompt}`,
    "",
    "This is a reflection aid, not a clinical assessment."
  ].join("\n");

  const html = buildEmailHtml(summary.subjectLine, [
    `<p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(user.name || "there")},</p>`,
    `<p style="font-size:16px;line-height:1.6;">Here is your Noora emotion summary for ${escapeHtml(range)}.</p>`,
    `<p style="font-size:16px;line-height:1.6;">Conversations touched: <strong>${data.conversationCount}</strong><br>Messages reviewed: <strong>${data.messageCount}</strong></p>`,
    `<p style="font-size:16px;line-height:1.6;">${escapeHtml(summary.intro)}</p>`,
    '<h2 style="font-size:18px;margin:24px 0 8px;">Emotional themes</h2>',
    `<p style="font-size:16px;line-height:1.6;">${escapeHtml(summary.emotionalSummary)}</p>`,
    '<h2 style="font-size:18px;margin:24px 0 8px;">Body check-in</h2>',
    `<p style="font-size:16px;line-height:1.6;">${escapeHtml(summary.bodySummary)}</p>`,
    '<h2 style="font-size:18px;margin:24px 0 8px;">Most present emotions</h2>',
    emotionHtml,
    '<h2 style="font-size:18px;margin:24px 0 8px;">A question for the week</h2>',
    `<p style="font-size:16px;line-height:1.6;">${escapeHtml(summary.reflectionPrompt)}</p>`,
    '<p style="font-size:14px;line-height:1.6;color:#697386;">This is a reflection aid, not a clinical assessment.</p>'
  ].join(""), "You are receiving this because email notifications are enabled in your Noora account.");

  return sendEmail(user.email, summary.subjectLine, text, html);
}

async function getEligibleWeeklyUsers() {
  return db
    .selectFrom("users")
    .innerJoin("user_notification_preferences", "user_notification_preferences.user_id", "users.id")
    .select(["users.id", "users.email", "users.first_name", "users.last_name", "users.user_name", "users.created_at"])
    .where("user_notification_preferences.email_notifications", "=", true)
    .where("user_notification_preferences.weekly_insights", "=", true)
    .execute();
}

async function sendWeeklyEmailsForUser(userRow: Awaited<ReturnType<typeof getEligibleWeeklyUsers>>[number], period: WeeklyPeriod) {
  const userId = Number(userRow.id);
  const user = toEmailUser(userRow);

  if (!(await hasEmailLog(userId, EMAIL_TYPES.weeklyCheckup, period))) {
    const result = await sendWeeklyCheckupEmail(user);
    if (result.sent) {
      await recordEmailLog(userId, EMAIL_TYPES.weeklyCheckup, period, result.resendEmailId);
    }
  }

  if (!(await hasEmailLog(userId, EMAIL_TYPES.weeklyEmotionSummary, period))) {
    const result = await sendWeeklyEmotionSummaryEmail(user, userId, period);
    if (result.sent) {
      await recordEmailLog(userId, EMAIL_TYPES.weeklyEmotionSummary, period, result.resendEmailId);
    }
  }
}

export async function runWeeklyNotificationPass(now = new Date()): Promise<void> {
  if (!config.weeklyEmailsEnabled || !config.emailNotificationsEnabled) {
    return;
  }

  const period = getPreviousWeekPeriod(now);
  const users = await getEligibleWeeklyUsers();

  for (const user of users) {
    try {
      await sendWeeklyEmailsForUser(user, period);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to send weekly notification emails.", {
        userId: Number(user.id),
        error: error instanceof Error ? error.message : error
      });
    }
  }
}

export function startWeeklyNotificationScheduler(): void {
  if (scheduler || !config.weeklyEmailsEnabled) {
    return;
  }

  void runWeeklyNotificationPass();

  scheduler = setInterval(() => {
    void runWeeklyNotificationPass();
  }, config.weeklyEmailCheckIntervalMs);
}
