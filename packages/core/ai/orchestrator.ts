// packages/core/ai/orchestrator.ts - Central AI Orchestration Engine
import { AIConfig, AIPromptResult, AIProvider, AIProviderId, ChatMessage, ToolExecutionResult } from './types';
import { ToolExecutor } from './tools/executor';
import { BEACON_TOOLS } from './tools/definitions';

export class AIOrchestrator {
  private providers: Map<AIProviderId, AIProvider> = new Map();

  constructor(
    private toolExecutor: ToolExecutor,
    private configGetter: () => Promise<AIConfig>
  ) {}

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: AIProviderId): AIProvider | undefined {
    return this.providers.get(id);
  }

  async processUserPrompt(userPrompt: string, history: ChatMessage[] = []): Promise<AIPromptResult> {
    const config = await this.configGetter();
    const provider = this.providers.get(config.activeProvider) || this.providers.get('openrouter');

    if (!provider) {
      throw new Error(`AI Provider "${config.activeProvider}" is not registered.`);
    }

    const isConfigured = await provider.isConfigured();
    if (!isConfigured) {
      throw new Error(`API key for ${provider.name} is not set. Please configure it in Beacon Settings.`);
    }

    const now = new Date();
    const systemPrompt = `You are the Beacon Companion, an ambient, intelligent personal productivity partner integrated into macOS.
Current Date/Time: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
Tone: Warm, concise, inspiring, and direct. Avoid generic corporate fluff.
Directives:
1. When the user asks to create, update, log, track, or query goals or start a focus timer, ALWAYS invoke the appropriate tool.
2. If the user refers to a goal by name (e.g. "Gym", "LeetCode"), pass the goal name in the tool call.
3. If no tool is required (e.g. general motivation or reflection), answer succinctly in 1-3 sentences.
4. After tools execute, confirm the accomplishment with positive energy and state the updated progress or streak.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: userPrompt },
    ];

    const actionsTaken: string[] = [];
    const toolCallsExecuted: ToolExecutionResult[] = [];

    // First Turn: Model may emit text or tool calls
    let response = await provider.generate({
      messages,
      tools: BEACON_TOOLS,
      profile: config.profile,
      modelOverride: config.customModel,
      temperature: 0.2,
    });

    // If tool calls were generated, execute them safely
    if (response.toolCalls && response.toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: response.text || '',
        toolCalls: response.toolCalls,
      });

      for (const tc of response.toolCalls) {
        const result = await this.toolExecutor.execute(tc);
        toolCallsExecuted.push(result);

        // Record friendly action text
        if (result.success) {
          if (tc.name === 'create_goal') {
            actionsTaken.push(`Created goal "${result.output.goal?.name}" (${result.output.goal?.targetValue} ${result.output.goal?.period})`);
          } else if (tc.name === 'log_progress') {
            actionsTaken.push(`Logged progress on "${result.output.goal?.name}" (${result.output.goal?.currentValue}/${result.output.goal?.targetValue})`);
          } else if (tc.name === 'update_goal') {
            actionsTaken.push(`Updated goal "${result.output.goal?.name}"`);
          } else if (tc.name === 'start_focus') {
            actionsTaken.push(`Started ${result.output.durationMinutes}m focus sprint${result.output.goalName ? ` on "${result.output.goalName}"` : ''}`);
          }
        }

        messages.push({
          role: 'tool',
          name: tc.name,
          toolCallId: tc.id,
          content: JSON.stringify(result.success ? result.output : { error: result.error }),
        });
      }

      // Second Turn: Let the model summarize the execution in its Companion persona
      response = await provider.generate({
        messages,
        profile: config.profile,
        modelOverride: config.customModel,
        temperature: 0.3,
      });
    }

    return {
      reply: response.text || 'All set!',
      actionsTaken,
      toolCallsExecuted,
    };
  }
}
