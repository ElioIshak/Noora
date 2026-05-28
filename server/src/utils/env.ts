// Loads environment variables for the server process.
import { config as loadDotEnv } from "dotenv";

let loaded = false;

// Ensure environment variables are loaded only once.
export function ensureEnvLoaded(): void {
  if (loaded) {
    return;
  }

  loadDotEnv();
  loaded = true;
}