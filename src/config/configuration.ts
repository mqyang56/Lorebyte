import * as vscode from "vscode";

export interface LorebyteConfig {
  provider: string;
  model: string;
  apiKey: string;
  apiBaseUrl: string;
  language: string;
}

export function getConfig(): LorebyteConfig {
  const cfg = vscode.workspace.getConfiguration("lorebyte");
  return {
    provider: cfg.get<string>("provider", "opencode-zen"),
    model: cfg.get<string>("model", "minimax-m2.5-free"),
    apiKey: cfg.get<string>("apiKey", ""),
    apiBaseUrl: cfg.get<string>(
      "apiBaseUrl",
      "https://opencode.ai/zen/v1/chat/completions"
    ),
    language: cfg.get<string>("language", "English"),
  };
}
