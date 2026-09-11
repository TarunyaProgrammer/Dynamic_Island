// apps/main/ipc/aiHandlers.ts - Electron IPC Bridge for AI Orchestrator & Credentials
import { ipcMain } from '@electron-bridge';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import {
  AIConfig,
  AIConfigSummary,
  AIOrchestrator,
  AIPromptResult,
  AIProviderId,
  AnthropicProvider,
  ChatMessage,
  ConnectionResult,
  GeminiProvider,
  OpenAIProvider,
  OpenRouterProvider,
  ToolExecutor,
} from '@core/ai';
import { GoalService } from '@core/services/goal-service';
import { FocusManager } from '@core/activities/focus-manager';
import { SettingsRepository } from '@database/repository/settings-repository';
import { CredentialRepository } from '@database/repository/credential-repository';
import { SecureCredentialManager } from '../services/SecureCredentialManager';

const DEFAULT_AI_CONFIG: AIConfig = {
  activeProvider: 'openrouter',
  profile: 'balanced',
};

export function registerAIHandlers(
  goalService: GoalService,
  focusManager: FocusManager,
  settingsRepo: SettingsRepository,
  credentialRepo: CredentialRepository,
  broadcastGoalsChanged: () => void
): { orchestrator: AIOrchestrator; credentialManager: SecureCredentialManager } {
  const credentialManager = new SecureCredentialManager(credentialRepo);

  const getAIConfig = async (): Promise<AIConfig> => {
    const raw = (settingsRepo as any).db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get('ai_config') as { value: string } | undefined;

    if (!raw) return { ...DEFAULT_AI_CONFIG };
    try {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw.value) };
    } catch {
      return { ...DEFAULT_AI_CONFIG };
    }
  };

  const saveAIConfig = (partial: Partial<AIConfig>): AIConfig => {
    const raw = (settingsRepo as any).db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get('ai_config') as { value: string } | undefined;

    let current = { ...DEFAULT_AI_CONFIG };
    if (raw) {
      try {
        current = { ...current, ...JSON.parse(raw.value) };
      } catch {}
    }

    const updated = { ...current, ...partial };
    const stmt = (settingsRepo as any).db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run('ai_config', JSON.stringify(updated));
    return updated;
  };

  // Instantiate Tool Executor & Orchestrator
  const toolExecutor = new ToolExecutor(goalService, focusManager);
  const orchestrator = new AIOrchestrator(toolExecutor, getAIConfig);

  // Register the 4 core BYOK providers
  const openRouter = new OpenRouterProvider(() => credentialManager.getApiKey('openrouter'));
  const openAI = new OpenAIProvider(() => credentialManager.getApiKey('openai'));
  const gemini = new GeminiProvider(() => credentialManager.getApiKey('gemini'));
  const anthropic = new AnthropicProvider(() => credentialManager.getApiKey('anthropic'));

  orchestrator.registerProvider(openRouter);
  orchestrator.registerProvider(openAI);
  orchestrator.registerProvider(gemini);
  orchestrator.registerProvider(anthropic);

  const buildSummary = async (): Promise<AIConfigSummary> => {
    const config = await getAIConfig();
    const providersList: AIConfigSummary['availableProviders'] = [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        isConfigured: await credentialManager.hasApiKey('openrouter'),
        recommended: true,
      },
      {
        id: 'openai',
        name: 'OpenAI',
        isConfigured: await credentialManager.hasApiKey('openai'),
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        isConfigured: await credentialManager.hasApiKey('gemini'),
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        isConfigured: await credentialManager.hasApiKey('anthropic'),
      },
    ];

    const hasActiveKey = await credentialManager.hasApiKey(config.activeProvider);

    return {
      ...config,
      hasKey: hasActiveKey,
      availableProviders: providersList,
    };
  };

  // IPC Handlers
  ipcMain.handle(IPC_CHANNELS.AI_GET_CONFIG, async () => {
    return buildSummary();
  });

  ipcMain.handle(IPC_CHANNELS.AI_UPDATE_CONFIG, async (_, partial: Partial<AIConfig>) => {
    saveAIConfig(partial);
    return buildSummary();
  });

  ipcMain.handle(IPC_CHANNELS.AI_SET_KEY, async (_, provider: AIProviderId, key: string) => {
    await credentialManager.setApiKey(provider, key);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.AI_REMOVE_KEY, async (_, provider: AIProviderId) => {
    return credentialManager.removeApiKey(provider);
  });

  ipcMain.handle(IPC_CHANNELS.AI_TEST_CONNECTION, async (_, providerId: AIProviderId): Promise<ConnectionResult> => {
    const provider = orchestrator.getProvider(providerId);
    if (!provider) {
      return { success: false, error: `Provider ${providerId} not found` };
    }
    return provider.testConnection();
  });

  ipcMain.handle(
    IPC_CHANNELS.AI_EXECUTE_PROMPT,
    async (_, prompt: string, history: ChatMessage[] = []): Promise<AIPromptResult> => {
      const result = await orchestrator.processUserPrompt(prompt, history);

      // If goals were created/updated, trigger a broadcast
      if (result.actionsTaken.length > 0) {
        broadcastGoalsChanged();
      }

      return result;
    }
  );

  return { orchestrator, credentialManager };
}
