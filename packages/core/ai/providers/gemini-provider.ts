// packages/core/ai/providers/gemini-provider.ts - Direct Google Gemini Provider
import { BaseAIProvider } from './base-provider';
import { AIProviderId, AIRequest, AIResponse, ConnectionResult, IntelligenceProfile, ToolCall } from '../types';

export class GeminiProvider extends BaseAIProvider {
  readonly id: AIProviderId = 'gemini';
  readonly name = 'Google Gemini';

  private readonly apiBase = 'https://generativelanguage.googleapis.com/v1beta/models';

  resolveModel(profile: IntelligenceProfile, override?: string): string {
    if (override && override.trim()) {
      return override.trim();
    }
    switch (profile) {
      case 'fast':
        return 'gemini-2.0-flash';
      case 'powerful':
        return 'gemini-1.5-pro';
      case 'balanced':
      default:
        return 'gemini-1.5-flash';
    }
  }

  async testConnection(): Promise<ConnectionResult> {
    const start = Date.now();
    try {
      const apiKey = await this.getApiKey();
      const testModel = 'gemini-1.5-flash';
      const url = `${this.apiBase}/${testModel}:generateContent?key=${apiKey}`;

      const res = await this.fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 5 },
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
          error: `Gemini returned HTTP ${res.status}: ${errorText.slice(0, 120)}`,
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
        error: err.message || 'Failed to connect to Google Gemini',
      };
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = await this.getApiKey();
    const model = this.resolveModel(request.profile || 'balanced', request.modelOverride);
    const url = `${this.apiBase}/${model}:generateContent?key=${apiKey}`;

    let systemInstructionText = '';
    const contents: any[] = [];

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemInstructionText += (systemInstructionText ? '\n\n' : '') + msg.content;
      } else if (msg.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_response',
                response: { output: msg.content },
              },
            },
          ],
        });
      } else {
        const parts: any[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.arguments,
              },
            });
          }
        }
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      }
    }

    const body: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.3,
      },
    };

    if (request.maxTokens) {
      body.generationConfig.maxOutputTokens = request.maxTokens;
    }

    if (systemInstructionText) {
      body.systemInstruction = {
        parts: [{ text: systemInstructionText }],
      };
    }

    if (request.tools && request.tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: request.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Gemini error (${res.status}): ${errorText}`);
    }

    const json = await res.json();
    const candidate = json.candidates?.[0];

    if (!candidate) {
      throw new Error('Gemini response contained no candidates.');
    }

    let text = '';
    const parsedToolCalls: ToolCall[] = [];

    if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          text += part.text;
        }
        if (part.functionCall) {
          parsedToolCalls.push({
            id: `call_${Math.random().toString(36).slice(2, 9)}`,
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          });
        }
      }
    }

    return {
      text,
      toolCalls: parsedToolCalls.length > 0 ? parsedToolCalls : undefined,
      modelUsed: model,
      usage: json.usageMetadata
        ? {
            promptTokens: json.usageMetadata.promptTokenCount || 0,
            completionTokens: json.usageMetadata.candidatesTokenCount || 0,
            totalTokens: json.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }
}
