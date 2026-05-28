// Noora conversation and message orchestration service.
import { db } from "../db/db";
import { getConfig } from "../config";

import { sendToNooraAI } from "./ai.service";

import { GoogleGenAI } from "@google/genai";

const config = getConfig();

const googleGenAI = new GoogleGenAI({
  apiKey: config.titleGeneratorApiKey
});

// Public message shape returned by Noora mess age endpoints.
export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender: "user" | "noora";
  content: string;
  emotion?: string;
  created_at?: Date;
};

// Converts DB role-based rows into API sender-based rows.
function mapMessageRow(row: {
  id: number;
  conversation_id: number;
  role: "user" | "noora";
  content: string;
  emotion: string | null;
  created_at: Date;
}): ChatMessage {
  return {
    id: Number(row.id),
    conversation_id: Number(row.conversation_id),
    sender: row.role,
    content: row.content,
    emotion: row.emotion ?? undefined,
    created_at: row.created_at
  };
}

// Creates a title for new conversation threads.
async function createConversationTitle(message: string): Promise<string> {
  const fallbackTitle = message.replace(/\s+/g, " ").trim().slice(0, 60) || "New Conversation";
  const response = await googleGenAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Create a concise conversation title from this starting user message.",
              "Rules:",
              "- Return only the title.",
              "- Do not answer the user's message.",
              "- Do not add quotes, labels, or explanations.",
              "- Use 3 to 7 words.",
              "- Keep it under 60 characters.",
              "",
              `Starting message: ${message.trim()}`
            ].join("\n")
          }
        ]
      }
    ]
  });

  const title = String(response.text ?? "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return title ? title.slice(0, 60) : fallbackTitle;
}

// Builds a plain-text history transcript for the ML service.
function buildConversationHistory(messages: ChatMessage[]): string {
  const lines: string[] = [];

  for (const message of messages) {
    const prefix = message.sender === "user" ? "User" : "Noora";
    lines.push(`${prefix}: ${message.content}`);
  }

  return lines.join("\n");
}

// Creates a new conversation thread for one user.
export async function createConversation(userId: number, title?: string) {
  const conversation = await db
    .insertInto("conversations")
    .values({
      user_id: userId,
      title: title?.trim() || null
    })
    .returningAll()
    .executeTakeFirst();

  if (!conversation) {
    throw new Error("Failed to create conversation.");
  }

  return conversation;
}

// Deletes one conversation that belongs to the authenticated user.
export async function deleteConversation(userId: number, conversationId: number) {
  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (Number(conversation.user_id) !== userId) {
    throw new Error("Conversation does not belong to user.");
  }

  await db
    .deleteFrom("conversations")
    .where("id", "=", conversationId)
    .execute();

  return {
    success: true,
    conversationId
  };
}

// Deletes all conversations for one authenticated user.
export async function deleteAllConversations(userId: number) {
  const result = await db
    .deleteFrom("conversations")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return {
    success: true,
    deletedCount: Number(result?.numDeletedRows ?? 0)
  };
}

// Fetches one conversation by id.
export async function getConversationById(conversationId: number) {
  return db.selectFrom("conversations").selectAll().where("id", "=", conversationId).executeTakeFirst();
}

// Lists all messages for a conversation.
export async function getMessages(conversationId: number): Promise<ChatMessage[]> {
  const rows = await db
    .selectFrom("messages")
    .selectAll()
    .where("conversation_id", "=", conversationId)
    .orderBy("created_at", "asc")
    .orderBy("id", "asc")
    .execute();

  return rows.map((row) => mapMessageRow({
    id: Number(row.id),
    conversation_id: Number(row.conversation_id),
    role: row.role,
    content: row.content,
    emotion: row.emotion,
    created_at: row.created_at
  }));
}

// Lists all user conversations with latest-message metadata.
export async function getUserConversations(userId: number) {
  const conversations = await db
    .selectFrom("conversations")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("updated_at", "desc")
    .orderBy("id", "desc")
    .execute();

  const enriched = [];

  for (const conversation of conversations) {
    const conversationId = Number(conversation.id);
    const messages = await getMessages(conversationId);
    const lastMessage = messages[messages.length - 1] ?? null;

    enriched.push({
      ...conversation,
      message_count: messages.length,
      last_message: lastMessage?.content ?? null,
      last_sender: lastMessage?.sender ?? null
    });
  }

  return enriched;
}

// Saves one user or assistant message to the DB.
export async function saveMessage(
  conversationId: number,
  sender: "user" | "noora",
  content: string,
  emotion?: string
): Promise<ChatMessage> {
  const inserted = await db
    .insertInto("messages")
    .values({
      conversation_id: conversationId,
      role: sender,
      content,
      emotion: emotion ?? null
    })
    .returningAll()
    .executeTakeFirst();

  if (!inserted) {
    throw new Error("Failed to save message.");
  }

  return mapMessageRow({
    id: Number(inserted.id),
    conversation_id: Number(inserted.conversation_id),
    role: inserted.role,
    content: inserted.content,
    emotion: inserted.emotion,
    created_at: inserted.created_at
  });
}

// Calls ML to generate a Noora response.
export async function generateAIResponse(message: string, userId: number, conversationHistory: string) {
  return sendToNooraAI(message, {
    userId,
    conversationHistory
  });
}

// Runs one chat turn with persistence + history-aware ML response.
export async function chat(userId: number, message: string, conversationId?: number) {
  if (!message?.trim()) {
    throw new Error("Message is required.");
  }

  let conversation = null;

  if (conversationId) {
    conversation = await getConversationById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found.");
    }

    if (Number(conversation.user_id) !== userId) {
      throw new Error("Conversation does not belong to user.");
    }

    if (!String(conversation.title ?? "").trim()) {
      const generatedTitle = await createConversationTitle(message);
      const updatedConversation = await db
        .updateTable("conversations")
        .set({
          title: generatedTitle
        })
        .where("id", "=", conversationId)
        .returningAll()
        .executeTakeFirst();

      conversation = updatedConversation ?? conversation;
    }
  } else {
    conversation = await createConversation(userId, await createConversationTitle(message));
  }

  const activeConversationId = Number(conversation.id);

  const previousMessages = await getMessages(activeConversationId);

  await saveMessage(activeConversationId, "user", message.trim());

  const historyMessages = previousMessages.slice(-config.historyLimit);
  const conversationHistory = buildConversationHistory(historyMessages);

  const ai = await generateAIResponse(message, userId, conversationHistory);
  const normalizedEmotion = Array.isArray(ai.emotion) ? ai.emotion.join(", ") : ai.emotion;

  await saveMessage(activeConversationId, "noora", ai.response, normalizedEmotion || undefined);

  await db
    .updateTable("conversations")
    .set({
      updated_at: new Date()
    })
    .where("id", "=", activeConversationId)
    .execute();

  return {
    conversationId: activeConversationId,
    response: ai.response,
    emotion: ai.emotion
  };
}

// Placeholder speech-to-text method for future implementation.
export async function speechToText(_audioFile: unknown) {
  return {
    text: "",
    note: "speechToText is not implemented yet."
  };
}
