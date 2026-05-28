// Noora HTTP controllers for conversation flows.
import type { RequestHandler } from "express";

import {
  chat,
  createConversation,
  deleteAllConversations,
  deleteConversation,
  getConversationById, 
  getMessages,
  getUserConversations
} from "../services/noora.service";

// Extracts an HTTP status from known service errors.
function getErrorStatus(error: unknown, fallbackStatus: number): number {
  if (error instanceof Error && "statusCode" in error) {
    const statusCode = Number(error.statusCode);
    if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
      return statusCode;
    }
  }

  return fallbackStatus;
}

// Extracts a client-safe error message.
function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

// Resolves authenticated user id from request context.
function getAuthenticatedUserId(req: Parameters<RequestHandler>[0]): number {
  const userId = Number(req.userJWT?.id ?? req.body?.userId);

  if (!userId) {
    throw new Error("A valid authenticated user is required.");
  }

  return userId;
}

// Creates a new Noora conversation.
export const createConversationController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const title = typeof req.body?.title === "string" ? req.body.title : undefined;
    const result = await createConversation(userId, title);
    res.status(201).json(result);
  } catch (error) {
    res.status(getErrorStatus(error, 400)).json({
      error: getErrorMessage(error, "Failed to create conversation.")
    });
  }
};

// Handles one chat turn for a conversation.
export const chatController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { message, conversationId } = req.body ?? {};

    if (!message) {
      res.status(400).json({ error: "message is required." });
      return;
    }

    const result = await chat(userId, String(message), conversationId ? Number(conversationId) : undefined);

    const conversation = await getConversationById(Number(result.conversationId));
    const conversationChat = await getMessages(Number(result.conversationId));

    res.status(200).json({
      ...result,
      conversation,
      chat: conversationChat
    });
  } catch (error) {
    res.status(getErrorStatus(error, 400)).json({
      error: getErrorMessage(error, "Failed to process chat.")
    });
  }
};

// Lists user conversations.
export const getUserConversationsController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await getUserConversations(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(getErrorStatus(error, 400)).json({
      error: getErrorMessage(error, "Failed to fetch conversations.")
    });
  }
};

// Lists all messages for one conversation.
export const getMessagesController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const conversationId = Number(req.params.id);

    if (!conversationId) {
      res.status(400).json({ error: "conversation id is required." });
      return;
    }

    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }

    if (Number(conversation.user_id) !== userId) {
      res.status(403).json({ error: "Conversation does not belong to authenticated user." });
      return;
    }

    const messages = await getMessages(conversationId);

    res.status(200).json({
      conversation,
      chat: messages,
      messages
    });
  } catch (error) {
    res.status(getErrorStatus(error, 400)).json({
      error: getErrorMessage(error, "Failed to fetch messages.")
    });
  }
};

// Deletes one conversation and its messages.
export const deleteConversationController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const conversationId = Number(req.params.id);

    if (!conversationId) {
      res.status(400).json({ error: "conversation id is required." });
      return;
    }

    const result = await deleteConversation(userId, conversationId);

    res.status(200).json(result);
  } catch (error) {
    const message = getErrorMessage(error, "Failed to delete conversation.");
    const statusCode = message.toLowerCase().includes("not found")
      ? 404
      : message.toLowerCase().includes("does not belong")
        ? 403
        : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Deletes all conversations for the authenticated user.
export const deleteAllConversationsController: RequestHandler = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await deleteAllConversations(userId);

    res.status(200).json(result);
  } catch (error) {
    res.status(getErrorStatus(error, 400)).json({
      error: getErrorMessage(error, "Failed to delete conversations.")
    });
  }
};
