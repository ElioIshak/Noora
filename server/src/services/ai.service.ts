// Client for sending requests to the Python ML service.
import { getConfig } from "../config";

// Options that can be supplied when calling the ML API.
type NooraRequestOptions = {
  userId?: number | string;
  conversationHistory?: string;
  authToken?: string; 
};

// Normalized Noora response payload used by server services.
export type NooraAIResult = {
  response: string;
  emotion: string | string[];
  provider: "Noora";
};

const config = getConfig();

// Error type used to preserve HTTP intent across the service/controller boundary.
export class NooraAIServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "NooraAIServiceError";
    this.statusCode = statusCode;
  }
}

// Builds a valid endpoint URL from base URL and path.
function buildEndpoint(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

// Extracts text output from potential ML response structures.
function extractNooraResponseText(payload: any): string | null {
  const candidates = [
    payload?.Response,
    payload?.response,
    payload?.result?.response,
    payload?.data?.response,
    payload?.output?.response,
    payload?.message
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === "object") {
      if (typeof candidate.response === "string" && candidate.response.trim()) {
        return candidate.response.trim();
      }
      if (typeof candidate.text === "string" && candidate.text.trim()) {
        return candidate.text.trim();
      }
      if (typeof candidate.content === "string" && candidate.content.trim()) {
        return candidate.content.trim();
      }
    }
  }

  return null;
}

// Sends one request to the Python ML service.
async function callNooraProduct(message: string, options?: NooraRequestOptions): Promise<NooraAIResult> {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available in this Node runtime.");
  }

  const endpoint = buildEndpoint(config.nooraMlBaseUrl, config.nooraMlRunAppPath);
  const userId = String(options?.userId ?? "anonymous");

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const token = options?.authToken || process.env.NOORA_AUTH_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), config.nooraTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: message,
        UserID: userId,
        conversation_history: options?.conversationHistory
      }),
      signal: controller.signal
    });

    const raw = await response.text();
    let parsed: any = {};

    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = { response: raw };
    }

    if (!response.ok) {
      const details = parsed?.detail || parsed?.error || parsed?.message || `HTTP ${response.status}`;
      throw new NooraAIServiceError(`Noora AI service rejected the request: ${details}`, 502);
    }

    const responseText = extractNooraResponseText(parsed);
    if (!responseText) {
      throw new NooraAIServiceError("Noora AI service returned no response text.", 502);
    }

    return {
      response: responseText,
      emotion: parsed?.emotions || "Unknown",
      provider: "Noora"
    };
  } catch (error) {
    if (error instanceof NooraAIServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new NooraAIServiceError("Noora AI service timed out.", 504);
    }

    throw new NooraAIServiceError("Noora AI service is unavailable. Please make sure the ML service is running.", 503);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

// Public helper for sending user text to Noora ML.
export async function sendToNooraAI(message: string, options?: NooraRequestOptions): Promise<NooraAIResult> {
  if (!message?.trim()) {
    throw new Error("Message is required for Noora AI.");
  }

  return callNooraProduct(message, options);
}
