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
  getModels(): string[];
  chatCompletion(
    options: ChatCompletionOptions,
    apiKey: string,
    baseUrl: string
  ): Promise<ChatCompletionResponse>;
  validateConfig(apiKey: string, baseUrl: string): string | undefined;
}
