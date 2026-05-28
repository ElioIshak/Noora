// Auth-related shared type definitions.
export type UserJWT = {
  id: number;
  email: string;
};

// Supported Noora conversation message roles.
export type NooraRole = "user" | "noora";