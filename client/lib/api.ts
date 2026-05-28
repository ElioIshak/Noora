// API types and helpers shared by frontend pages.
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  emotionTags?: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ChatTurnResult {
  conversation: Conversation;
  messages: Message[];
  assistantMessage?: Message;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NotificationPreferences {
  email: boolean;
  dailyReminders: boolean;
  weeklyInsights: boolean;
}

export interface UserDataExportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotionTags?: string[];
  createdAt: string;
}

export interface UserDataExportConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: UserDataExportMessage[];
}

export interface UserDataExportContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface UserDataExport {
  exportedAt: string;
  user: User;
  products: string[];
  conversations: UserDataExportConversation[];
  contactMessages: UserDataExportContactMessage[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const TOKEN_STORAGE_KEY = 'noora_token';

type ServerUser = {
  id: string | number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  user_name?: string;
  createdAt?: string;
  created_at?: string;
};

type ServerConversation = {
  id: string | number;
  title?: string | null;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
  last_message?: string | null;
};

type ServerMessage = {
  id: string | number;
  conversation_id?: string | number;
  sender?: 'user' | 'noora';
  role?: 'user' | 'noora';
  content: string;
  emotion?: string | string[] | null;
  created_at?: string;
};

type ServerProfileResponse = {
  user?: ServerUser;
  notifications?: NotificationPreferences;
};

type ServerAuthResponse = {
  token: string;
  user: ServerUser | string | number;
};

type ServerForgotPasswordResponse = {
  success?: boolean;
  message?: string;
  resetToken?: string;
};

type ServerChatTurnResponse = {
  conversationId?: string | number;
  conversation?: ServerConversation;
  chat?: ServerMessage[];
  messages?: ServerMessage[];
};

type ServerUserDataExport = {
  exportedAt?: string;
  user: ServerUser;
  products?: string[];
  conversations?: Array<{
    id: string | number;
    title?: string | null;
    created_at?: string;
    updated_at?: string;
    messages?: ServerMessage[];
  }>;
  contactMessages?: Array<{
    id: string | number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at?: string;
  }>;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

function toIsoString(value?: string): string {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function buildDisplayName(user: ServerUser): string {
  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }

  const first = typeof user.first_name === 'string' ? user.first_name.trim() : '';
  const last = typeof user.last_name === 'string' ? user.last_name.trim() : '';

  if (first || last) {
    return `${first} ${last}`.trim();
  }

  if (typeof user.user_name === 'string' && user.user_name.trim()) {
    return user.user_name.replace(/_/g, ' ').trim();
  }

  return 'User';
}

function mapUser(raw: ServerUser): User {
  return {
    id: String(raw.id),
    email: String(raw.email ?? ''),
    name: buildDisplayName(raw),
    createdAt: toIsoString(raw.createdAt ?? raw.created_at),
  };
}

function parseEmotionTags(emotion: ServerMessage['emotion']): string[] | undefined {
  if (!emotion) {
    return undefined;
  }

  if (Array.isArray(emotion)) {
    const tags = emotion.map((tag) => String(tag).trim()).filter(Boolean);
    return tags.length > 0 ? tags : undefined;
  }

  const tags = emotion
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length > 0 ? tags : undefined;
}

function mapMessage(raw: ServerMessage, fallbackConversationId: string): Message {
  const sender = raw.sender ?? raw.role ?? 'noora';

  return {
    id: String(raw.id),
    conversationId: String(raw.conversation_id ?? fallbackConversationId),
    role: sender === 'user' ? 'user' : 'assistant',
    content: String(raw.content ?? ''),
    emotionTags: parseEmotionTags(raw.emotion),
    createdAt: toIsoString(raw.created_at),
  };
}

function mapExportMessage(raw: ServerMessage): UserDataExportMessage {
  const sender = raw.sender ?? raw.role ?? 'noora';

  return {
    id: String(raw.id),
    role: sender === 'user' ? 'user' : 'assistant',
    content: String(raw.content ?? ''),
    emotionTags: parseEmotionTags(raw.emotion),
    createdAt: toIsoString(raw.created_at),
  };
}

function mapConversation(raw: ServerConversation): Conversation {
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'New Conversation';
  const preview = typeof raw.last_message === 'string' && raw.last_message.trim()
    ? raw.last_message.trim()
    : 'Start typing to begin...';

  return {
    id: String(raw.id),
    title,
    preview,
    createdAt: toIsoString(raw.created_at),
    updatedAt: toIsoString(raw.updated_at ?? raw.created_at),
    messageCount: Number(raw.message_count ?? 0),
  };
}

function normalizeProfileUser(response: ServerProfileResponse | ServerUser): ServerUser {
  if ('user' in response && response.user) {
    return response.user;
  }

  return response as ServerUser;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload?.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to HTTP fallback message.
  }

  return `HTTP error ${response.status}`;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export const authAPI = {
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const result = await fetchAPI<ServerAuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    const user = typeof result.user === 'object' && result.user !== null
      ? mapUser(result.user as ServerUser)
      : {
          id: String(result.user),
          email,
          name,
          createdAt: new Date().toISOString(),
        };

    return {
      token: result.token,
      user,
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const result = await fetchAPI<ServerAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = typeof result.user === 'object' && result.user !== null
      ? mapUser(result.user as ServerUser)
      : {
          id: String(result.user),
          email,
          name: email,
          createdAt: new Date().toISOString(),
        };

    return {
      token: result.token,
      user,
    };
  },

  logout: async (): Promise<void> => {
    await fetchAPI<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    const result = await fetchAPI<ServerForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return {
      message: result.message ?? 'If an account exists for this email, a reset token has been generated.',
      resetToken: result.resetToken,
    };
  },

  resetPassword: async (email: string, resetToken: string, newPassword: string): Promise<void> => {
    await fetchAPI<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
  },
};

export const chatAPI = {
  sendMessage: async (conversationId: string | null, message: string): Promise<ChatTurnResult> => {
    const payload: { message: string; conversationId?: number } = {
      message,
    };

    if (conversationId) {
      const normalizedConversationId = Number(conversationId);
      if (Number.isFinite(normalizedConversationId) && normalizedConversationId > 0) {
        payload.conversationId = normalizedConversationId;
      }
    }

    const result = await fetchAPI<ServerChatTurnResponse>('/noora/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const fallbackConversation: ServerConversation = {
      id: result.conversationId ?? conversationId ?? Date.now(),
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
    };

    const conversation = mapConversation(result.conversation ?? fallbackConversation);
    const rawMessages = Array.isArray(result.messages)
      ? result.messages
      : Array.isArray(result.chat)
        ? result.chat
        : [];
    const messages = rawMessages.map((rawMessage) => mapMessage(rawMessage, conversation.id));
    const assistantMessage = [...messages].reverse().find((entry) => entry.role === 'assistant');

    return {
      conversation,
      messages,
      assistantMessage,
    };
  },

  createConversation: async (title?: string): Promise<Conversation> => {
    const body = title ? JSON.stringify({ title }) : undefined;

    const result = await fetchAPI<ServerConversation>('/noora/conversation', {
      method: 'POST',
      body,
    });

    return mapConversation(result);
  },

  deleteConversation: async (id: string): Promise<void> => {
    await fetchAPI<{ success: boolean }>(`/noora/conversation/${id}`, {
      method: 'DELETE',
    });
  },

  deleteAllConversations: async (): Promise<number> => {
    const result = await fetchAPI<{ success: boolean; deletedCount?: number }>('/noora/conversations', {
      method: 'DELETE',
    });

    return Number(result.deletedCount ?? 0);
  },

  getConversations: async (): Promise<Conversation[]> => {
    const result = await fetchAPI<ServerConversation[]>('/noora/conversations');
    return result.map((conversation) => mapConversation(conversation));
  },

  getConversation: async (id: string): Promise<{ conversation: Conversation; messages: Message[] }> => {
    const result = await fetchAPI<{
      conversation: ServerConversation;
      messages?: ServerMessage[];
      chat?: ServerMessage[];
    }>(`/noora/conversation/${id}`);

    const conversation = mapConversation(result.conversation);
    const rawMessages = Array.isArray(result.messages)
      ? result.messages
      : Array.isArray(result.chat)
        ? result.chat
        : [];
    const mappedMessages = rawMessages.map((rawMessage) => mapMessage(rawMessage, conversation.id));
    const latestMessage = mappedMessages[mappedMessages.length - 1];

    return {
      conversation: {
        ...conversation,
        preview: latestMessage?.content || conversation.preview,
        messageCount: mappedMessages.length,
        updatedAt: latestMessage?.createdAt || conversation.updatedAt,
      },
      messages: mappedMessages,
    };
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const result = await fetchAPI<ServerProfileResponse | ServerUser>('/user/profile');
    return mapUser(normalizeProfileUser(result));
  },

  updateProfile: async (updates: { name?: string; email?: string }): Promise<User> => {
    const result = await fetchAPI<ServerProfileResponse | ServerUser>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return mapUser(normalizeProfileUser(result));
  },

  getNotifications: async (): Promise<NotificationPreferences> => {
    return fetchAPI<NotificationPreferences>('/user/notifications');
  },

  updateNotifications: async (updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    return fetchAPI<NotificationPreferences>('/user/notifications', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  exportMyData: async (): Promise<UserDataExport> => {
    const result = await fetchAPI<ServerUserDataExport>('/user/export');

    return {
      exportedAt: toIsoString(result.exportedAt),
      user: mapUser(result.user),
      products: Array.isArray(result.products) ? result.products.map((product) => String(product)) : [],
      conversations: Array.isArray(result.conversations)
        ? result.conversations.map((conversation) => ({
            id: String(conversation.id),
            title: conversation.title?.trim() || 'Untitled Conversation',
            createdAt: toIsoString(conversation.created_at),
            updatedAt: toIsoString(conversation.updated_at),
            messages: Array.isArray(conversation.messages)
              ? conversation.messages.map((message) => mapExportMessage(message))
              : [],
          }))
        : [],
      contactMessages: Array.isArray(result.contactMessages)
        ? result.contactMessages.map((entry) => ({
            id: String(entry.id),
            name: String(entry.name),
            email: String(entry.email),
            subject: String(entry.subject),
            message: String(entry.message),
            createdAt: toIsoString(entry.created_at),
          }))
        : [],
    };
  },

  deleteAccount: async (): Promise<void> => {
    await fetchAPI<{ success: boolean }>('/user/account', {
      method: 'DELETE',
    });
  },
};

export const contactAPI = {
  submit: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    const result = await fetchAPI<{
      success?: boolean;
      message?: string;
    }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: result.success ?? true,
      message: result.message ?? 'Message sent successfully.',
    };
  },
};
