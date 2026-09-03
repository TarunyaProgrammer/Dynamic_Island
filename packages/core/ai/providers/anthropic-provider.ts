// packages/core/ai/providers/anthropic-provider.ts - Direct Anthropic Claude Provider
import { BaseAIProvider } from './base-provider';
import { AIProviderId, AIRequest, AIResponse, ConnectionResult, IntelligenceProfile, ToolCall } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  readonly id: AIProviderId = 'anthropic';
  readonly name = 'Anthropic';

  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';

  resolveModel(profile: IntelligenceProfile, override?: string): string {
    if (override && override.trim()) {
      return override.trim();
    }
    switch (profile) {
      case 'fast':
        return 'claude-3-5-haiku-20241022';
      case 'powerful':
        return 'claude-3-5-sonnet-20241022';
      case 'balanced':
      default:
        return 'claude-3-5-sonnet-20241022';
    }
  }

  async testConnection(): Promise<ConnectionResult> {
    const start = Date.now();
    try {
      const apiKey = await this.getApiKey();
      const testModel = 'claude-3-5-haiku-20241022';

      const res = await this.fetchWithTimeout(
        this.baseUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
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
          error: `Anthropic returned HTTP ${res.status}: ${errorText.slice(0, 120)}`,
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
        error: err.message || 'Failed to connect to Anthropic',
      };
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = await this.getApiKey();
    const model = this.resolveModel(request.profile || 'balanced', request.modelOverride);

    let systemText = '';
    const messages: any[] = [];

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemText += (systemText ? '\n\n' : '') + msg.content;
      } else if (msg.role === 'tool') {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: msg.toolCallId || 'call_0',
              content: msg.content,
            },
          ],
        });
      } else if (msg.role === 'assistant') {
        const blocks: any[] = [];
        if (msg.content) {
          blocks.push({ type: 'text', text: msg.content });
        }
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            blocks.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            });
          }
        }
        messages.push({
          role: 'assistant',
          content: blocks.length > 0 ? blocks : msg.content || '',
        });
      } else {
        messages.push({
          role: 'user',
          content: msg.content,
        });
      }
    }

    const body: Record<string, any> = {
      model,
      messages,
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature ?? 0.3,
    };

    if (systemText) {
      body.system = systemText;
    }

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    const res = await this.fetchWithTimeout(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Anthropic error (${res.status}): ${errorText}`);
    }

    const json = await res.json();
    let text = '';
    const parsedToolCalls: ToolCall[] = [];

    if (Array.isArray(json.content)) {
      for (const block of json.content) {
        if (block.type === 'text') {
          text += block.text;
        } else if (block.type === 'tool_use') {
          parsedToolCalls.push({
            id: block.id,
            name: block.name,
            arguments: block.input || {},
          });
        }
      }
    }

    return {
      text,
      toolCalls: parsedToolCalls.length > 0 ? parsedToolCalls : undefined,
      modelUsed: json.model || model,
      usage: json.usage
        ? {
            promptTokens: json.usage.input_tokens || 0,
            completionTokens: json.usage.output_tokens || 0,
            totalTokens: (json.usage.input_tokens || 0) + (json.usage.output_tokens || 0),
          }
        : undefined,
    };
  }
}
