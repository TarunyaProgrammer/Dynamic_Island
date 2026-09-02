---
name: beacon-multi-paradigm-engine
description: >
  Use when creating, evaluating, or extending goal types, schedules, streaks, and health metrics
  in Beacon — covering the 6 goal paradigms (Habit, Accumulative, Deadline, Milestone,
  Duration, Avoidance), StreakEngine, and HealthCalculator.
---

# Beacon — Multi-Paradigm Goal Engine

Beacon separates Goal Definition from Tracking Method, Schedule, Progress Rules, Streaks, and Health.
This skill documents how domain models in `packages/core/` evaluate and calculate progress across paradigms.

---

## The 6 Goal Paradigms

| Paradigm | Tracking Method | Schedule / Frequency | Completion / Health Criteria |
|---|---|---|---|
| **`habit`** | Check-in / Session count | Daily, Weekly (e.g. 5x/wk), Rest Days | Sessions logged vs required in current period |
| **`accumulative`** | Numeric counter / units | Ongoing / Total | `currentValue / targetValue` percentage |
| **`deadline`** | Target date + value | Due by timestamp | Target velocity vs actual pace (`ahead / on_track / at_risk / behind`) |
| **`milestone`** | Ordered check-items | Sequential or weighted tasks | % of weighted milestones completed |
| **`duration`** | Minutes / Hours focus | Daily/weekly time quota | Accumulated active focus minutes |
| **`avoidance`** | Abstinence count | Daily sobriety/break streak | Continuous days without relapse check-in |

---

## Core Domain Services

### 1. HabitEvaluator (`packages/core/services/habit-evaluator.ts`)
- Calculates period boundaries (start and end of current week/day).
- Determines if today is a scheduled rest day (`targetDaysPerWeek < 7`).
- Generates 7-day dot grids for UI visualization.

### 2. StreakEngine (`packages/core/services/streak-engine.ts`)
- Evaluates streaks across `daily`, `scheduled`, and `period_threshold` modes.
- Prevents breaking weekly streaks on planned rest days.
- Preserves `bestStreak` records across resets.

### 3. HealthCalculator (`packages/core/services/health-calculator.ts`)
- For deadlines: computes expected velocity based on elapsed time vs total time.
- Returns enum: `'on_track' | 'ahead' | 'at_risk' | 'behind' | 'completed' | 'paused'`.

---

## Invariants

1. **Pure Functions**: Evaluators and Calculators are pure, deterministic functions without side effects.
2. **Immutable History**: Progress events and check-ins are append-only time series records.
