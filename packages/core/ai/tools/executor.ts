// packages/core/ai/tools/executor.ts - Strict Tool Execution Guard
import { GoalService } from '../../services/goal-service';
import { FocusManager } from '../../activities/focus-manager';
import { ToolCall, ToolExecutionResult } from '../types';
import { GoalDraft, GoalParadigm, GoalPeriod } from '@shared/types';

export class ToolExecutor {
  constructor(
    private goalService: GoalService,
    private focusManager?: FocusManager
  ) {}

  async execute(toolCall: ToolCall): Promise<ToolExecutionResult> {
    try {
      switch (toolCall.name) {
        case 'create_goal': {
          const args = toolCall.arguments;
          const paradigm: GoalParadigm = (args.paradigm as GoalParadigm) || 'habit';
          const period: GoalPeriod = (args.period as GoalPeriod) || (paradigm === 'habit' ? 'weekly' : 'daily');
          const targetValue = Number(args.targetValue) || Number(args.flexibleCount) || 5;

          const draft: GoalDraft = {
            name: String(args.name).trim(),
            paradigm,
            targetValue,
            currentValue: 0,
            unit: args.unit || (paradigm === 'habit' ? 'days/week' : 'units'),
            period,
            area: args.area || 'Personal',
            priority: args.priority || 'normal',
            scheduleConfig:
              paradigm === 'habit'
                ? {
                    flexibleCount: Number(args.flexibleCount) || targetValue,
                  }
                : undefined,
          };

          const created = this.goalService.createGoal(draft);
          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: {
              status: 'created',
              goal: {
                id: created.id,
                name: created.name,
                targetValue: created.targetValue,
                paradigm: created.paradigm,
                period: created.period,
              },
            },
          };
        }

        case 'update_goal': {
          const args = toolCall.arguments;
          const goal = this.resolveGoal(args.goalId);
          if (!goal) {
            throw new Error(`Goal could not be found with ID or name "${args.goalId}".`);
          }

          const updateDraft: Record<string, any> = {};
          if (args.name) updateDraft.name = String(args.name).trim();
          if (args.targetValue !== undefined) updateDraft.targetValue = Number(args.targetValue);
          if (args.status) updateDraft.status = args.status;
          if (args.flexibleCount !== undefined) {
            updateDraft.scheduleConfig = {
              ...(goal.scheduleConfig || {}),
              flexibleCount: Number(args.flexibleCount),
            };
          }

          const updated = this.goalService.updateGoal(goal.id, updateDraft);
          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: {
              status: 'updated',
              goal: {
                id: updated.id,
                name: updated.name,
                targetValue: updated.targetValue,
                status: updated.status,
              },
            },
          };
        }

        case 'log_progress': {
          const args = toolCall.arguments;
          const goal = this.resolveGoal(args.goalId);
          if (!goal) {
            throw new Error(`Goal could not be found with ID or name "${args.goalId}".`);
          }

          const delta = args.delta !== undefined ? Number(args.delta) : 1;
          const updated = this.goalService.incrementProgress(goal.id, delta, args.note);

          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: {
              status: 'progress_logged',
              goal: {
                id: updated.id,
                name: updated.name,
                currentValue: updated.currentValue,
                targetValue: updated.targetValue,
                streak: updated.streakConfig?.currentStreak || 0,
              },
            },
          };
        }

        case 'start_focus': {
          if (!this.focusManager) {
            throw new Error('FocusManager is not available in current environment.');
          }

          const args = toolCall.arguments;
          const duration = Number(args.durationMinutes) || 25;
          let linkedGoalId: string | undefined = undefined;

          if (args.goalId) {
            const goal = this.resolveGoal(args.goalId);
            if (goal) linkedGoalId = goal.id;
          }

          const session = this.focusManager.start(duration, linkedGoalId);
          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: {
              status: 'focus_started',
              durationMinutes: duration,
              goalId: linkedGoalId,
              goalName: session.goalName,
            },
          };
        }

        case 'query_goals': {
          const args = toolCall.arguments;
          const goals = this.goalService.listGoals(args.status || 'active');
          const filtered = args.area
            ? goals.filter((g) => g.area?.toLowerCase() === String(args.area).toLowerCase())
            : goals;

          const compact = filtered.map((g) => ({
            id: g.id,
            name: g.name,
            currentValue: g.currentValue,
            targetValue: g.targetValue,
            unit: g.unit,
            streak: g.streakConfig?.currentStreak || 0,
            health: g.health?.status || 'on_track',
          }));

          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: { goals: compact },
          };
        }

        case 'get_stats': {
          const stats = this.goalService.getStats();
          return {
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            success: true,
            output: { stats },
          };
        }

        default:
          throw new Error(`Unknown tool: ${toolCall.name}`);
      }
    } catch (err: any) {
      return {
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        success: false,
        output: null,
        error: err.message || 'Execution error',
      };
    }
  }

  private resolveGoal(idOrName: string) {
    if (!idOrName) return null;
    const direct = this.goalService.getGoal(idOrName);
    if (direct) return direct;

    // Search by name case-insensitively
    const all = this.goalService.listGoals();
    const query = idOrName.toLowerCase().trim();
    return all.find((g) => g.name.toLowerCase().trim() === query) ||
           all.find((g) => g.name.toLowerCase().includes(query)) ||
           null;
  }
}
