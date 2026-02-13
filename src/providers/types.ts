export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  readonly id: string;
  readonly displayName: string;
  chatCompletion(
    options: ChatCompletionOptions,
    apiKey: string,
    baseUrl: string
  ): Promise<ChatCompletionResponse>;
  fetchRemoteModels(apiKey: string, baseUrl: string): Promise<string[]>;
  validateConfig(apiKey: string, baseUrl: string): string | undefined;
}
