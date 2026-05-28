// Kysely database table type definitions.
import type { Generated } from "kysely";

// User table row shape.
export interface UserTable {
  id: Generated<number>;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  hashed_password: string;
  subscription: number;
  created_at: Generated<Date>;
}

// User notification preference row shape.
export interface UserNotificationPreferenceTable {
  user_id: number;
  email_notifications: boolean;
  daily_reminders: boolean;
  weekly_insights: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Subscription table row shape.
export interface SubscriptionTable {
  id: Generated<number>;
  user_id: number;
  status: string;
  created_at: Generated<Date>;
}

// Conversation thread table row shape.
export interface ConversationTable {
  id: Generated<number>;
  user_id: number;
  title: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Conversation message row shape.
export interface MessageTable {
  id: Generated<number>;
  conversation_id: number;
  role: "user" | "noora";
  content: string;
  emotion: string | null;
  created_at: Generated<Date>;
}

// Contact form row shape.
export interface ContactMessageTable {
  id: Generated<number>;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: Generated<Date>;
}

// Password reset token row shape.
export interface PasswordResetTokenTable {
  id: Generated<number>;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Generated<Date>;
}

// Email notification delivery log row shape.
export interface NotificationEmailLogTable {
  id: Generated<number>;
  user_id: number;
  email_type: string;
  period_start: Date | null;
  period_end: Date | null;
  resend_email_id: string | null;
  created_at: Generated<Date>;
}

// Full server database schema mapping.
export interface Database {
  users: UserTable;
  user_notification_preferences: UserNotificationPreferenceTable;
  subscriptions: SubscriptionTable;
  conversations: ConversationTable;
  messages: MessageTable;
  contact_messages: ContactMessageTable;
  password_reset_tokens: PasswordResetTokenTable;
  notification_email_logs: NotificationEmailLogTable;
}
