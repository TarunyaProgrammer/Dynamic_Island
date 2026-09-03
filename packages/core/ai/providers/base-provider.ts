// packages/core/ai/providers/base-provider.ts - Abstract Base Provider
import { AICapability, AIProvider, AIProviderId, AIRequest, AIResponse, ConnectionResult, IntelligenceProfile } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: AIProviderId;
  abstract readonly name: string;

  constructor(protected getApiKeyFn: () => Promise<string | null>) {}

  async isConfigured(): Promise<boolean> {
    const key = await this.getApiKeyFn();
    return !!key && key.trim().length > 0;
  }

  abstract resolveModel(profile: IntelligenceProfile, override?: string): string;

  abstract testConnection(): Promise<ConnectionResult>;

  abstract generate(request: AIRequest): Promise<AIResponse>;

  supports(capability: AICapability): boolean {
    switch (capability) {
      case 'tool-calling':
      case 'structured-output':
        return true;
      case 'streaming':
        return false;
      default:
        return false;
    }
  }

  protected async getApiKey(): Promise<string> {
    const key = await this.getApiKeyFn();
    if (!key || !key.trim()) {
      throw new Error(`API key for ${this.name} is not configured.`);
    }
    return key.trim();
  }

  protected async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${this.name} timed out after ${Math.round(timeoutMs / 1000)}s.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
