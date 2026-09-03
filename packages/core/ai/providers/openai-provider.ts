// packages/core/ai/providers/openai-provider.ts - Direct OpenAI Provider
import { BaseAIProvider } from './base-provider';
import { AIProviderId, AIRequest, AIResponse, ConnectionResult, IntelligenceProfile, ToolCall } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  readonly id: AIProviderId = 'openai';
  readonly name = 'OpenAI';

  private readonly baseUrl = 'https://api.openai.com/v1/chat/completions';

  resolveModel(profile: IntelligenceProfile, override?: string): string {
    if (override && override.trim()) {
      return override.trim();
    }
    switch (profile) {
      case 'fast':
        return 'gpt-4o-mini';
      case 'powerful':
        return 'gpt-4o';
      case 'balanced':
      default:
        return 'gpt-4o-mini';
    }
  }

  async testConnection(): Promise<ConnectionResult> {
    const start = Date.now();
    try {
      const apiKey = await this.getApiKey();
      const testModel = 'gpt-4o-mini';

      const res = await this.fetchWithTimeout(
        this.baseUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        },
        12000
      );

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          latencyMs,
          error: `OpenAI returned HTTP ${res.status}: ${errorText.slice(0, 120)}`,
          modelUsed: testModel,
        };
      }

      return {
        success: true,
        latencyMs,
        modelUsed: testModel,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err.message || 'Failed to connect to OpenAI',
      };
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = await this.getApiKey();
    const model = this.resolveModel(request.profile || 'balanced', request.modelOverride);

    const formattedMessages = request.messages.map((m) => {
      const baseMsg: Record<string, any> = {
        role: m.role,
        content: m.content || '',
      };
      if (m.name) baseMsg.name = m.name;
      if (m.toolCallId) baseMsg.tool_call_id = m.toolCallId;
      if (m.toolCalls && m.toolCalls.length > 0) {
        baseMsg.tool_calls = m.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        }));
      }
      return baseMsg;
    });

    const body: Record<string, any> = {
      model,
      messages: formattedMessages,
      temperature: request.temperature ?? 0.3,
    };

    if (request.maxTokens) {
      body.max_tokens = request.maxTokens;
    }

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const res = await this.fetchWithTimeout(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI error (${res.status}): ${errorText}`);
    }

    const json = await res.json();
    const choice = json.choices?.[0];

    if (!choice) {
      throw new Error('OpenAI response contained no choices.');
    }

    const rawMessage = choice.message || {};
    const text = rawMessage.content || '';
    const parsedToolCalls: ToolCall[] = [];

    if (rawMessage.tool_calls && Array.isArray(rawMessage.tool_calls)) {
      for (const tc of rawMessage.tool_calls) {
        let args: Record<string, any> = {};
        try {
          args = typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments;
        } catch {
          args = {};
        }

        parsedToolCalls.push({
          id: tc.id || `tc_${Math.random().toString(36).slice(2, 9)}`,
          name: tc.function?.name || '',
          arguments: args,
        });
      }
    }

    return {
      text,
      toolCalls: parsedToolCalls.length > 0 ? parsedToolCalls : undefined,
      modelUsed: json.model || model,
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
          }
        : undefined,
    };
  }
}
