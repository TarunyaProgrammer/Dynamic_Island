// packages/core/ai/tools/definitions.ts - Canonical Beacon AI Tool Schemas
import { ToolDefinition } from '../types';

export const BEACON_TOOLS: ToolDefinition[] = [
  {
    name: 'create_goal',
    description: 'Create a new personal goal, habit, or commitment in Beacon.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Descriptive title of the goal (e.g. "Gym", "LeetCode practice", "Read Clean Code").',
        },
        paradigm: {
          type: 'string',
          enum: ['habit', 'accumulative', 'deadline', 'duration', 'milestone', 'avoidance'],
          description: 'Tracking paradigm. "habit" for recurring days/sessions, "accumulative" for monotonic totals, "duration" for time budgets, "deadline" for date targets.',
        },
        targetValue: {
          type: 'number',
          description: 'Target quantity (e.g. 5 for 5 days/sessions, 100 for 100 problems, 40 for 40 hours).',
        },
        unit: {
          type: 'string',
          description: 'Measurement unit (e.g. "days/week", "sessions", "problems", "hours", "pages").',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'total'],
          description: 'Period for habit/duration goals (defaults to "weekly" if flexible sessions per week).',
        },
        area: {
          type: 'string',
          description: 'Category/Area e.g. "Health", "Learning", "Career", "Finance", "Personal".',
        },
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'normal', 'low'],
          description: 'Priority level (defaults to "normal").',
        },
        flexibleCount: {
          type: 'number',
          description: 'For habit goals: number of required days/sessions per period (e.g. 5 days a week).',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_goal',
    description: 'Update properties, target, or schedule of an existing goal.',
    parameters: {
      type: 'object',
      properties: {
        goalId: {
          type: 'string',
          description: 'The unique ID of the goal to update (or goal name if ID unknown).',
        },
        targetValue: {
          type: 'number',
          description: 'New target value.',
        },
        name: {
          type: 'string',
          description: 'Updated name of the goal.',
        },
        flexibleCount: {
          type: 'number',
          description: 'Updated flexible sessions count per week/period.',
        },
        status: {
          type: 'string',
          enum: ['active', 'paused', 'completed', 'archived'],
          description: 'New status for the goal.',
        },
      },
      required: ['goalId'],
    },
  },
  {
    name: 'log_progress',
    description: 'Record progress or log a completed session/check-in for a goal.',
    parameters: {
      type: 'object',
      properties: {
        goalId: {
          type: 'string',
          description: 'The unique ID or name of the goal to log progress for.',
        },
        delta: {
          type: 'number',
          description: 'Amount to increment progress by (e.g. 1 for habit check-in, 45 for 45 mins). Defaults to 1.',
        },
        note: {
          type: 'string',
          description: 'Optional note describing what was accomplished.',
        },
      },
      required: ['goalId'],
    },
  },
  {
    name: 'start_focus',
    description: 'Start a high-focus deep work timer sprint in Beacon.',
    parameters: {
      type: 'object',
      properties: {
        durationMinutes: {
          type: 'number',
          description: 'Sprint duration in minutes (defaults to 25 mins).',
        },
        goalId: {
          type: 'string',
          description: 'Optional goal ID or goal name to link this focus session to.',
        },
      },
    },
  },
  {
    name: 'query_goals',
    description: 'Query existing goals, active streaks, and current progress metrics.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'paused', 'completed', 'archived'],
          description: 'Filter goals by status (defaults to "active").',
        },
        area: {
          type: 'string',
          description: 'Filter goals by area (e.g. "Health", "Career").',
        },
      },
    },
  },
  {
    name: 'get_stats',
    description: 'Fetch Beacon overall productivity stats, total goals, and momentum velocity.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
