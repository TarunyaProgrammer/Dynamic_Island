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
        return 'gemini-flash-lite-latest';
      case 'powerful':
        return 'gemini-pro-latest';
      case 'balanced':
      default:
        return 'gemini-3.5-flash';
    }
  }

  getCandidateModels(profile: IntelligenceProfile, override?: string): string[] {
    if (override && override.trim()) {
      return [override.trim(), 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];
    }
    switch (profile) {
      case 'fast':
        return ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-flash-latest'];
      case 'powerful':
        return ['gemini-3.5-flash', 'gemini-pro-latest', 'gemini-flash-latest'];
      case 'balanced':
      default:
        return ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    }
  }

  async testConnection(): Promise<ConnectionResult> {
    const start = Date.now();
    try {
      const apiKey = await this.getApiKey();
      const candidates = this.getCandidateModels('balanced');
      let lastErrorMessage = '';
      let successfulModel = '';

      for (const testModel of candidates) {
        try {
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
            10000
          );

          if (res.ok) {
            successfulModel = testModel;
            break;
          }

          const errorText = await res.text();
          let message = `HTTP ${res.status}`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed?.error?.message) {
              message = parsed.error.message;
            }
          } catch {
            message = errorText.slice(0, 120);
          }
          lastErrorMessage = message;

          // If upstream temporary issue (503 high demand, 429 rate spike, 404 deprecated alias, 500), try next candidate
          if (res.status === 503 || res.status === 429 || res.status === 404 || res.status >= 500) {
            continue;
          } else {
            return {
              success: false,
              latencyMs: Date.now() - start,
              error: `Gemini: ${message}`,
              modelUsed: testModel,
            };
          }
        } catch (e: any) {
          lastErrorMessage = e.message;
        }
      }

      if (successfulModel) {
        return {
          success: true,
          latencyMs: Date.now() - start,
          modelUsed: successfulModel,
        };
      }

      return {
        success: false,
        latencyMs: Date.now() - start,
        error: `Gemini: ${lastErrorMessage || 'All candidate models unavailable'}`,
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
    const candidateModels = this.getCandidateModels(request.profile || 'balanced', request.modelOverride);

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
      } else if (msg.role === 'assistant' && msg.rawParts && msg.rawParts.length > 0) {
        contents.push({
          role: 'model',
          parts: msg.rawParts,
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

    let successfulJson: any = null;
    let successfulModel = candidateModels[0];
    let lastError: any = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const url = `${this.apiBase}/${model}:generateContent?key=${apiKey}`;

      try {
        const res = await this.fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
          16000
        );

        if (res.ok) {
          successfulJson = await res.json();
          successfulModel = model;
          break;
        }

        const errorText = await res.text();
        const status = res.status;
        lastError = new Error(`Google Gemini error (${status}): ${errorText}`);

        // If 503 (high demand), 429 (rate spike), 404, or 500, failover to next model
        if ((status === 503 || status === 429 || status === 404 || status >= 500) && i < candidateModels.length - 1) {
          console.warn(`[GeminiProvider] Model ${model} returned HTTP ${status}. Auto-failing over to ${candidateModels[i + 1]}...`);
          continue;
        }

        throw lastError;
      } catch (err: any) {
        lastError = err;
        if (i < candidateModels.length - 1) {
          console.warn(`[GeminiProvider] Model ${model} failed (${err.message}). Auto-failing over to ${candidateModels[i + 1]}...`);
          continue;
        }
        throw err;
      }
    }

    if (!successfulJson) {
      throw lastError || new Error('All Gemini model candidates exhausted.');
    }

    const candidate = successfulJson.candidates?.[0];
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
      modelUsed: successfulModel,
      rawParts: candidate.content?.parts,
      usage: successfulJson.usageMetadata
        ? {
            promptTokens: successfulJson.usageMetadata.promptTokenCount || 0,
            completionTokens: successfulJson.usageMetadata.candidatesTokenCount || 0,
            totalTokens: successfulJson.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }
}
