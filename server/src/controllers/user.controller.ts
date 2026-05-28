// Auth and user HTTP controllers.
import type { RequestHandler } from "express";

import {
  login, 
  logout,
  requestPasswordReset,
  resetPassword,
  signup
} from "../services/auth.service";

import {
  createContactMessage,
  deleteUserAccount,
  exportUserData,
  getUserNotificationPreferences,
  getUserProfile,
  updateUserNotificationPreferences,
  updateUserProfile
} from "../services/user.service";

// Handles user signup requests.
export const signupController: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, firstName, lastName } = req.body ?? {};
    const fullName = String(name ?? `${firstName ?? ""} ${lastName ?? ""}`.trim());

    if (!email || !password || !fullName) {
      res.status(400).json({ error: "email, password, and name are required." });
      return;
    }

    const result = await signup(String(email), String(password), fullName);
    res.status(201).json(result);
  } catch (error) {
    res.status(409).json({ error: error instanceof Error ? error.message : "Signup failed." });
  }
};

// Handles user login requests.
export const loginController: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required." });
      return;
    }

    const result = await login(String(email), String(password));
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "Login failed." });
  }
};

// Handles forgot-password requests.
export const forgotPasswordController: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      res.status(400).json({ error: "email is required." });
      return;
    }

    const result = await requestPasswordReset(String(email));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to start reset flow."
    });
  }
};

// Handles password reset submissions.
export const resetPasswordController: RequestHandler = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body ?? {};

    if (!email || !resetToken || !newPassword) {
      res.status(400).json({ error: "email, resetToken, and newPassword are required." });
      return;
    }

    const result = await resetPassword(String(email), String(resetToken), String(newPassword));
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password.";
    const lowered = message.toLowerCase();
    const statusCode = lowered.includes("expired") || lowered.includes("invalid") ? 400 : 500;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Handles user logout requests.
export const logoutController: RequestHandler = async (req, res) => {
  try {
    const tokenUserId = req.userJWT?.id;
    const bodyUserId = req.body?.userId;
    const userId = Number(tokenUserId ?? bodyUserId);

    if (!userId) {
      res.status(400).json({ error: "userId is required." });
      return;
    }

    const result = await logout(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Logout failed.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Handles contact form message submissions.
export const sendContactMessageController: RequestHandler = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body ?? {};

    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email, and message are required." });
      return;
    }

    const result = await createContactMessage(
      String(name),
      String(email),
      String(message),
      subject ? String(subject) : undefined
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to save contact message.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Loads profile for the authenticated user.
export const getMyProfileController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      res.status(404).json({ error: "User profile not found." });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load profile.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Updates profile fields for the authenticated user.
export const updateMyProfileController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const { name, email } = req.body ?? {};

    if (name !== undefined && typeof name !== "string") {
      res.status(400).json({ error: "name must be a string." });
      return;
    }

    if (email !== undefined && typeof email !== "string") {
      res.status(400).json({ error: "email must be a string." });
      return;
    }

    const profile = await updateUserProfile(userId, {
      name,
      email
    });

    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile.";
    const statusCode = message.toLowerCase().includes("already exists") ? 409 : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Loads notification settings for the authenticated user.
export const getMyNotificationsController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const notifications = await getUserNotificationPreferences(userId);
    res.status(200).json(notifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notifications.";
    const statusCode = message.toLowerCase().includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Updates notification settings for the authenticated user.
export const updateMyNotificationsController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const { email, dailyReminders, weeklyInsights } = req.body ?? {};

    const invalid =
      (email !== undefined && typeof email !== "boolean") ||
      (dailyReminders !== undefined && typeof dailyReminders !== "boolean") ||
      (weeklyInsights !== undefined && typeof weeklyInsights !== "boolean");

    if (invalid) {
      res.status(400).json({
        error: "email, dailyReminders, and weeklyInsights must be booleans when provided."
      });
      return;
    }

    const notifications = await updateUserNotificationPreferences(userId, {
      email,
      dailyReminders,
      weeklyInsights
    });

    res.status(200).json(notifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notifications.";
    const statusCode = message.toLowerCase().includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Exports a full personal-data JSON payload for the authenticated user.
export const exportMyDataController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const payload = await exportUserData(userId);
    res.status(200).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export user data.";
    const statusCode = message.toLowerCase().includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};

// Deletes the authenticated user account.
export const deleteMyAccountController: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.userJWT?.id);

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const result = await deleteUserAccount(userId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account.";
    const statusCode = message.toLowerCase().includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      error: message
    });
  }
};
