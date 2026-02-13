import * as https from "node:https";
import * as http from "node:http";
import {
  LLMProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
} from "./types";

function httpRequest(
  url: URL,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<string> {
  const transport = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          ...headers,
          ...(body && { "Content-Length": String(Buffer.byteLength(body)) }),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString();
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            reject(
              new Error(
                `OpenCode Zen API error ${res.statusCode}: ${text || res.statusMessage}`
              )
            );
            return;
          }
          resolve(text);
        });
      }
    );
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

export class OpenCodeZenProvider implements LLMProvider {
  readonly id = "opencode-zen";
  readonly displayName = "OpenCode Zen";

  getModels(): string[] {
    return [
      "kimi-k2.5-free",
      "kimi-k2.5",
      "gpt-5.2-codex",
      "gpt-5.1-codex",
      "minimax-m2.5-free",
    ];
  }

  validateConfig(apiKey: string, baseUrl: string): string | undefined {
    if (!apiKey) {
      return "API key is required. Set it in Settings → Lorebyte → Api Key.";
    }
    if (!baseUrl) {
      return "API base URL is required. Set it in Settings → Lorebyte → Api Base Url.";
    }
    try {
      new URL(this.normalizeUrl(baseUrl));
    } catch {
      return `Invalid API base URL: "${baseUrl}". Must be a valid HTTP(S) URL.`;
    }
    return undefined;
  }

  private normalizeUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  /** Derive the base (e.g. https://opencode.ai/zen/v1) from the configured URL. */
  private baseFrom(configuredUrl: string): string {
    const url = this.normalizeUrl(configuredUrl);
    return url.replace(/\/chat\/completions\/?$/, "").replace(/\/+$/, "");
  }

  async fetchRemoteModels(apiKey: string, baseUrl: string): Promise<string[]> {
    const base = this.baseFrom(baseUrl);
    const url = new URL(`${base}/models`);
    const text = await httpRequest(url, "GET", {
      Authorization: `Bearer ${apiKey}`,
    });
    const data = JSON.parse(text) as {
      data?: { id: string }[];
    };
    return (data.data ?? []).map((m) => m.id);
  }

  async chatCompletion(
    options: ChatCompletionOptions,
    apiKey: string,
    baseUrl: string
  ): Promise<ChatCompletionResponse> {
    const base = this.baseFrom(baseUrl);
    const url = new URL(`${base}/chat/completions`);

    const body = JSON.stringify({
      model: options.model,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? 0.3,
      ...(options.maxTokens && { max_tokens: options.maxTokens }),
    });

    const json = await httpRequest(
      url,
      "POST",
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body
    );

    const data = JSON.parse(json) as {
      choices?: { message?: { content?: string } }[];
      model?: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenCode Zen API");
    }

    return {
      content,
      model: data.model ?? options.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: data.usage.total_tokens ?? 0,
          }
        : undefined,
    };
  }
}
