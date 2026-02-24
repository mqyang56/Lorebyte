import * as vscode from "vscode";

export const DEFAULT_MODEL = "minimax-m2.5-free";

// Built-in fallback key — allows zero-config usage with the default model.
// Split to avoid plain-text exposure in the bundle.
const _bk = [
  "sk-fCVRgReDWw38yQ",
  "OirUZdOzLQmRfOzSCHKeW3vfl5a",
  "6IJa7EWfTsJK0KRVcuCzMhA",
].join("");

export interface LorebyteConfig {
  provider: string;
  model: string;
  apiKey: string;
  apiBaseUrl: string;
  language: string;
  /** True when the built-in fallback key is in use (no user-configured key). */
  isUsingDefaultKey: boolean;
}

export function getConfig(): LorebyteConfig {
  const cfg = vscode.workspace.getConfiguration("lorebyte");
  const userKey = cfg.get<string>("apiKey", "").trim();
  const isUsingDefaultKey = !userKey;
  return {
    provider: cfg.get<string>("provider", "opencode-zen"),
    model: cfg.get<string>("model", DEFAULT_MODEL),
    apiKey: userKey || _bk,
    apiBaseUrl: cfg.get<string>(
      "apiBaseUrl",
      "https://opencode.ai/zen/v1/chat/completions"
    ),
    language: cfg.get<string>("language", "English"),
    isUsingDefaultKey,
  };
}
