// packages/core/ai/types.ts - Core AI Abstraction Layer for Beacon

export type AIProviderId = 'openrouter' | 'openai' | 'gemini' | 'anthropic' | 'local';

export type IntelligenceProfile = 'balanced' | 'fast' | 'powerful' | 'custom';

export type AICapability = 'tool-calling' | 'structured-output' | 'streaming';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProviderId;
  contextWindow?: number;
}

export interface ConnectionResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  modelUsed?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
  rawParts?: any[];
}

export interface ToolPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: ToolPropertySchema;
  properties?: Record<string, ToolPropertySchema>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolPropertySchema>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolExecutionResult {
  toolCallId: string;
  toolName: string;
  success: boolean;
  output: any;
  error?: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  profile?: IntelligenceProfile;
  modelOverride?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  toolCalls?: ToolCall[];
  modelUsed: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  rawParts?: any[];
}

export interface AIProvider {
  id: AIProviderId;
  name: string;
  isConfigured(): Promise<boolean>;
  testConnection(): Promise<ConnectionResult>;
  generate(request: AIRequest): Promise<AIResponse>;
  supports(capability: AICapability): boolean;
  resolveModel(profile: IntelligenceProfile, override?: string): string;
}

export interface AIConfig {
  activeProvider: AIProviderId;
  profile: IntelligenceProfile;
  customModel?: string;
}

export interface AIConfigSummary extends AIConfig {
  hasKey: boolean;
  availableProviders: {
    id: AIProviderId;
    name: string;
    isConfigured: boolean;
    recommended?: boolean;
  }[];
}

export interface AIPromptResult {
  reply: string;
  actionsTaken: string[];
  toolCallsExecuted: ToolExecutionResult[];
}
