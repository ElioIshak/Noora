// User profile and contact message service functions.
import { db } from "../db/db";
import type { Database } from "../types/database";

import {
  getUserByEmail,
  getUserById,
  normalizeEmail,
  splitName,
  toPublicUser 
} from "./auth.service";

// Notification preference payload returned to clients.
export type NotificationPreferences = {
  email: boolean;
  dailyReminders: boolean;
  weeklyInsights: boolean;
};

// Ensures a preference row exists and returns it.
async function ensureNotificationPreferenceRow(userId: number) {
  await db
    .insertInto("user_notification_preferences")
    .values({
      user_id: userId,
      email_notifications: true,
      daily_reminders: false,
      weekly_insights: true
    })
    .onConflict((oc) => oc.column("user_id").doNothing())
    .execute();

  const row = await db
    .selectFrom("user_notification_preferences")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!row) {
    throw new Error("Failed to load notification preferences.");
  }

  return row;
}

// Converts DB notification settings to client payload shape.
function mapNotificationPreferences(row: {
  email_notifications: boolean;
  daily_reminders: boolean;
  weekly_insights: boolean;
}): NotificationPreferences {
  return {
    email: Boolean(row.email_notifications),
    dailyReminders: Boolean(row.daily_reminders),
    weeklyInsights: Boolean(row.weekly_insights)
  };
}

// Loads a user profile bundle with active products.
export async function getUserProfile(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  return {
    user: toPublicUser(user),
    notifications: await getUserNotificationPreferences(userId)
  };
}

// Updates profile fields for the authenticated user.
export async function updateUserProfile(userId: number, updates: { name?: string; email?: string }) {
  const existing = await getUserById(userId);

  if (!existing) {
    throw new Error("User profile not found.");
  }

  const normalizedName = typeof updates.name === "string" ? updates.name.trim() : "";
  const normalizedEmail = typeof updates.email === "string" ? normalizeEmail(updates.email) : "";

  if (!normalizedName && !normalizedEmail) {
    throw new Error("At least one of name or email must be provided.");
  }

  const patch: Partial<Pick<Database["users"], "first_name" | "last_name" | "user_name" | "email">> = {};

  if (normalizedName) {
    const { firstName, lastName, userName } = splitName(normalizedName);
    patch.first_name = firstName;
    patch.last_name = lastName;
    patch.user_name = userName;
  }

  if (normalizedEmail) {
    const duplicate = await getUserByEmail(normalizedEmail);
    if (duplicate && Number(duplicate.id) !== userId) {
      throw new Error("A user with this email already exists.");
    }
    patch.email = normalizedEmail;
  }

  const updatedUser = await db
    .updateTable("users")
    .set(patch)
    .where("id", "=", userId)
    .returningAll()
    .executeTakeFirst();

  if (!updatedUser) {
    throw new Error("Failed to update profile.");
  }

  return {
    user: toPublicUser(updatedUser),
    notifications: await getUserNotificationPreferences(userId)
  };
}

// Loads notification preferences for one authenticated user.
export async function getUserNotificationPreferences(userId: number): Promise<NotificationPreferences> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User profile not found.");
  }

  const row = await ensureNotificationPreferenceRow(userId);
  return mapNotificationPreferences(row);
}

// Updates notification preferences for one authenticated user.
export async function updateUserNotificationPreferences(
  userId: number,
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User profile not found.");
  }

  await ensureNotificationPreferenceRow(userId);

  const patch: {
    email_notifications?: boolean;
    daily_reminders?: boolean;
    weekly_insights?: boolean;
    updated_at?: Date;
  } = {};

  if (typeof updates.email === "boolean") {
    patch.email_notifications = updates.email;
  }

  if (typeof updates.dailyReminders === "boolean") {
    patch.daily_reminders = updates.dailyReminders;
  }

  if (typeof updates.weeklyInsights === "boolean") {
    patch.weekly_insights = updates.weeklyInsights;
  }

  if (Object.keys(patch).length > 0) {
    patch.updated_at = new Date();

    await db
      .updateTable("user_notification_preferences")
      .set(patch)
      .where("user_id", "=", userId)
      .execute();
  }

  const row = await ensureNotificationPreferenceRow(userId);
  return mapNotificationPreferences(row);
}

// Returns a full JSON-exportable bundle for one user.
export async function exportUserData(userId: number) {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User profile not found.");
  }

  const conversations = await db
    .selectFrom("conversations")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("updated_at", "desc")
    .orderBy("id", "desc")
    .execute();

  const conversationIds = conversations.map((conversation) => Number(conversation.id));
  const messageRows = conversationIds.length
    ? await db
      .selectFrom("messages")
      .selectAll()
      .where("conversation_id", "in", conversationIds)
      .orderBy("created_at", "asc")
      .orderBy("id", "asc")
      .execute()
    : [];

  const messagesByConversationId = new Map<number, typeof messageRows>();
  for (const row of messageRows) {
    const key = Number(row.conversation_id);
    const existing = messagesByConversationId.get(key) ?? [];
    existing.push(row);
    messagesByConversationId.set(key, existing);
  }

  const contactMessages = await db
    .selectFrom("contact_messages")
    .selectAll()
    .where("email", "=", String(user.email))
    .orderBy("created_at", "desc")
    .orderBy("id", "desc")
    .execute();

  return {
    exportedAt: new Date().toISOString(),
    user: toPublicUser(user),
    notifications: await getUserNotificationPreferences(userId),
    conversations: conversations.map((conversation) => {
      const conversationId = Number(conversation.id);
      const messages = messagesByConversationId.get(conversationId) ?? [];

      return {
        id: conversationId,
        title: conversation.title,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        messages: messages.map((message) => ({
          id: Number(message.id),
          conversation_id: Number(message.conversation_id),
          role: message.role,
          content: message.content,
          emotion: message.emotion,
          created_at: message.created_at
        }))
      };
    }),
    contactMessages: contactMessages.map((entry) => ({
      id: Number(entry.id),
      name: entry.name,
      email: entry.email,
      subject: entry.subject,
      message: entry.message,
      created_at: entry.created_at
    }))
  };
}

// Deletes the authenticated user account and related data.
export async function deleteUserAccount(userId: number) {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User profile not found.");
  }

  await db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("contact_messages")
      .where("email", "=", String(user.email))
      .execute();

    await trx
      .deleteFrom("users")
      .where("id", "=", userId)
      .execute();
  });

  return {
    success: true
  };
}

// Saves one contact form message.
export async function createContactMessage(name: string, email: string, message: string, subject = "Contact Form") {
  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required.");
  }

  return db
    .insertInto("contact_messages")
    .values({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    })
    .returningAll()
    .executeTakeFirst();
}
