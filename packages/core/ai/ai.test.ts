// packages/core/ai/ai.test.ts - Comprehensive AI Engine Test Suite
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '@database/schema';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { GoalService } from '../services/goal-service';
import { ActivityEngine } from '../activities/activity-engine';
import { FocusSessionManager } from '../activities/focus-manager';
import {
  AIConfig,
  AIOrchestrator,
  AIProvider,
  AnthropicProvider,
  GeminiProvider,
  OpenAIProvider,
  OpenRouterProvider,
  ToolExecutor,
} from './index';
import { BEACON_TOOLS } from './tools/definitions';

describe('Beacon AI Engine', () => {
  let db: Database.Database;
  let goalRepo: SQLiteGoalRepository;
  let goalService: GoalService;
  let activityEngine: ActivityEngine;
  let focusManager: FocusSessionManager;
  let toolExecutor: ToolExecutor;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
    goalRepo = new SQLiteGoalRepository(db);
    goalService = new GoalService(goalRepo);
    activityEngine = new ActivityEngine();
    focusManager = new FocusSessionManager(goalService, activityEngine);
    toolExecutor = new ToolExecutor(goalService, focusManager);
  });

  describe('Provider Model Resolution', () => {
    it('OpenRouter resolves correct models per profile', () => {
      const p = new OpenRouterProvider(async () => 'fake-key');
      expect(p.resolveModel('fast')).toBe('openai/gpt-4o-mini');
      expect(p.resolveModel('powerful')).toBe('anthropic/claude-3.5-sonnet');
      expect(p.resolveModel('balanced')).toBe('anthropic/claude-3.5-sonnet');
      expect(p.resolveModel('custom', 'deepseek/deepseek-r1')).toBe('deepseek/deepseek-r1');
    });

    it('OpenAI resolves correct models per profile', () => {
      const p = new OpenAIProvider(async () => 'fake-key');
      expect(p.resolveModel('fast')).toBe('gpt-4o-mini');
      expect(p.resolveModel('powerful')).toBe('gpt-4o');
      expect(p.resolveModel('balanced')).toBe('gpt-4o-mini');
      expect(p.resolveModel('custom', 'gpt-4.5-preview')).toBe('gpt-4.5-preview');
    });

    it('Gemini resolves correct models per profile', () => {
      const p = new GeminiProvider(async () => 'fake-key');
      expect(p.resolveModel('fast')).toBe('gemini-flash-lite-latest');
      expect(p.resolveModel('powerful')).toBe('gemini-pro-latest');
      expect(p.resolveModel('balanced')).toBe('gemini-flash-latest');
    });

    it('Anthropic resolves correct models per profile', () => {
      const p = new AnthropicProvider(async () => 'fake-key');
      expect(p.resolveModel('fast')).toBe('claude-3-5-haiku-20241022');
      expect(p.resolveModel('powerful')).toBe('claude-3-5-sonnet-20241022');
      expect(p.resolveModel('balanced')).toBe('claude-3-5-sonnet-20241022');
    });
  });

  describe('Tool Definitions', () => {
    it('defines 6 canonical tools with valid schemas', () => {
      expect(BEACON_TOOLS).toHaveLength(6);
      const names = BEACON_TOOLS.map((t) => t.name);
      expect(names).toContain('create_goal');
      expect(names).toContain('update_goal');
      expect(names).toContain('log_progress');
      expect(names).toContain('start_focus');
      expect(names).toContain('query_goals');
      expect(names).toContain('get_stats');
    });
  });

  describe('Tool Executor', () => {
    it('creates a habit goal via create_goal tool call', async () => {
      const result = await toolExecutor.execute({
        id: 'call_1',
        name: 'create_goal',
        arguments: {
          name: 'Gym Workout',
          paradigm: 'habit',
          flexibleCount: 5,
          unit: 'sessions/week',
          area: 'Health',
        },
      });

      expect(result.success).toBe(true);
      expect(result.output.status).toBe('created');
      expect(result.output.goal.name).toBe('Gym Workout');

      const goals = goalService.listGoals();
      expect(goals).toHaveLength(1);
      expect(goals[0].name).toBe('Gym Workout');
      expect(goals[0].targetValue).toBe(5);
    });

    it('logs progress on existing goal by name', async () => {
      const created = goalService.createGoal({
        name: 'LeetCode Practice',
        targetValue: 100,
        paradigm: 'accumulative',
      });

      const result = await toolExecutor.execute({
        id: 'call_2',
        name: 'log_progress',
        arguments: {
          goalId: 'LeetCode Practice',
          delta: 2,
          note: 'Solved Two Sum and Add Two Numbers',
        },
      });

      expect(result.success).toBe(true);
      expect(result.output.status).toBe('progress_logged');
      expect(result.output.goal.currentValue).toBe(2);

      const refreshed = goalService.getGoal(created.id);
      expect(refreshed?.currentValue).toBe(2);
    });

    it('starts a deep work focus session', async () => {
      const goal = goalService.createGoal({
        name: 'SaaS App',
        targetValue: 40,
        paradigm: 'duration',
      });

      const result = await toolExecutor.execute({
        id: 'call_3',
        name: 'start_focus',
        arguments: {
          durationMinutes: 30,
          goalId: 'SaaS App',
        },
      });

      expect(result.success).toBe(true);
      expect(result.output.status).toBe('focus_started');
      expect(result.output.durationMinutes).toBe(30);
      expect(result.output.goalId).toBe(goal.id);

      const focusState = focusManager.getState();
      expect(focusState.isActive).toBe(true);
      expect(focusState.durationSeconds).toBe(30 * 60);
      focusManager.stop();
    });

    it('queries active goals', async () => {
      goalService.createGoal({ name: 'Book Reading', targetValue: 10 });
      goalService.createGoal({ name: 'Meditation', targetValue: 7 });

      const result = await toolExecutor.execute({
        id: 'call_4',
        name: 'query_goals',
        arguments: { status: 'active' },
      });

      expect(result.success).toBe(true);
      expect(result.output.goals).toHaveLength(2);
    });
  });

  describe('AI Orchestrator Execution Loop', () => {
    it('executes tool call and synthesizes friendly companion response', async () => {
      let turn = 0;
      const mockProvider: AIProvider = {
        id: 'openrouter',
        name: 'OpenRouter',
        isConfigured: vi.fn(async () => true),
        testConnection: vi.fn(async () => ({ success: true })),
        resolveModel: () => 'mock-model',
        supports: () => true,
        generate: vi.fn(async () => {
          turn++;
          if (turn === 1) {
            // First turn: Model emits tool call
            return {
              text: '',
              modelUsed: 'mock-model',
              toolCalls: [
                {
                  id: 'call_mock_1',
                  name: 'create_goal',
                  arguments: {
                    name: 'Morning Run',
                    paradigm: 'habit',
                    flexibleCount: 4,
                  },
                },
              ],
            };
          } else {
            // Second turn: Model confirms execution in companion persona
            return {
              text: 'Boom! I have created your Morning Run habit for 4 days a week. Time to lace up!',
              modelUsed: 'mock-model',
            };
          }
        }),
      };

      const config: AIConfig = { activeProvider: 'openrouter', profile: 'balanced' };
      const orchestrator = new AIOrchestrator(toolExecutor, async () => config);
      orchestrator.registerProvider(mockProvider);

      const result = await orchestrator.processUserPrompt('I want to run 4 days a week');

      expect(result.reply).toContain('Boom! I have created your Morning Run habit');
      expect(result.actionsTaken).toHaveLength(1);
      expect(result.actionsTaken[0]).toContain('Created goal "Morning Run"');
      expect(result.toolCallsExecuted).toHaveLength(1);
      expect(result.toolCallsExecuted[0].success).toBe(true);

      // Verify the goal was actually created in SQLite
      const goals = goalService.listGoals();
      expect(goals).toHaveLength(1);
      expect(goals[0].name).toBe('Morning Run');
    });
  });
});
