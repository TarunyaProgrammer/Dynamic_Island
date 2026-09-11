# Foundation and Today Implementation Plan

> **For agentic workers:** Execute in order with tests after every task. Do not begin reminders, EventKit, sync, or onboarding in this release.

**Goal:** Turn Beacon from a goal library into a quiet daily execution layer: users select up to three goal-owned next actions, start focus or mark them done, and safely plan the rest for later.

**Architecture:** New normalized Action and Today Plan repositories sit beside `SQLiteGoalRepository`; pure services own all mutation and subscription behavior. The Electron main process exposes typed IPC, while renderer surfaces consume a `useToday` hook. Reminder-policy tables are created now but have no scheduler or notification behavior until Release 2.

**Tech Stack:** TypeScript, better-sqlite3/WAL, Electron IPC/context isolation, React 19, Vitest.

---

## File map

- `shared/types.ts`: action, plan, reminder policy, and local-date DTOs.
- `shared/ipc-channels.ts`, `apps/preload/{index,types}.ts`: typed Today API and change broadcast.
- `packages/core/time/local-date.ts`: injectable local date/time helpers; no DOM/Electron imports.
- `packages/database/schema.ts`: idempotent DDL and indexes for `goal_actions`, `today_plans`, `today_plan_actions`, and `goal_reminder_policies`.
- `packages/database/repository/{action,today-plan}-repository.ts`: persistence boundaries.
- `packages/core/services/{action,today}-service.ts`: validation, mutation, ordering, cap recommendation, subscriptions.
- `apps/main/ipc/goalHandlers.ts`: construct services, broadcast Today changes, and register IPC.
- `apps/renderer/src/hooks/useToday.ts`: renderer data/actions.
- `apps/renderer/src/components/{TodayView,ActionEditorModal,EndOfDaySheet}.tsx`: Today UI.
- `apps/renderer/src/surfaces/{MainAppView,TrayPopoverView,CommandPaletteView}.tsx`: wire default Today, tray actions, and commands.

## Task 1: Shared contracts and local time

- [x] Add `GoalAction` with `open | completed | skipped | archived`, goal ID, title, planned date, optional schedule/estimate, source, and timestamps.
- [x] Add `TodayPlan`, `TodayPlanEntry`, and inactive `ReminderPolicy` contracts.
- [x] Create `local-date.ts` with `toLocalDate(date, timeZone?)` using `Intl.DateTimeFormat(...).formatToParts`; default to system timezone and test an Asia/Kolkata near-midnight case.
- [x] Replace `toISOString().slice(0, 10)` in GoalService check-in paths with the utility.
- [x] Add failing/passing tests in `packages/core/time/local-date.test.ts` and GoalService tests.

## Task 2: Schema and repositories

- [x] Add FK-cascading normalized tables and indexes. `today_plan_actions` stores `plan_date`, `action_id`, `sort_order`, `bucket` (`today | later`) with one row/action/date. `goal_reminder_policies` is one row/goal and is deliberately unused.
- [x] Add migration-safe `CREATE TABLE IF NOT EXISTS` DDL; no destructive migration.
- [x] Implement `SQLiteActionRepository` and `SQLiteTodayPlanRepository`; validate action ownership on plan entry writes.
- [x] Test create/update/complete action, plan ordering, and goal cascade deletion in memory.

## Task 3: Pure action and Today services

- [x] `ActionService.create/update/complete/skip/archive/listForGoal`; reject blank titles and completed-action mutation.
- [x] `TodayService.getPlan`, `planAction`, `moveToLater`, `complete`, `skip`, and `reschedule`.
- [x] Enforce one highlighted Today action per goal; the fourth item is retained but placed in Later. Do not treat unfinished actions as missed.
- [x] Both services expose subscriptions; all mutation results contain updated entities.
- [x] Unit-test three-action recommendation, per-goal enforcement, stable sort ordering, and compassionate reschedule/skip semantics.

## Task 4: Main-process API and focus linkage

- [x] Add `ACTIONS_*`, `TODAY_*`, and `EVENT_TODAY_CHANGED` IPC channels.
- [x] Construct repositories/services in `registerIpcHandlers`; publish scoped updates to all surfaces.
- [x] Register focused IPC input validation and return DTOs only.
- [x] Extend focus start to accept an optional action ID after validating it belongs to the goal; store action linkage in the focus-session state without changing goal numeric progress behavior.
- [x] Add IPC-oriented tests with service stubs where practical.

## Task 5: Today UI and command surfaces

- [x] Make `Today` the default Main view; preserve Goals and Focus.
- [x] Render top three commitments, Later, a small add-action modal, Start, Done, Skip, and Reschedule actions. Calendar context is an opt-in extension.
- [x] Tray shows the first three Today actions with Start/Done; empty state offers plan creation.
- [x] Palette parses `today`, `plan <goal>: <action>`, `done <action>`, and `focus <action> <minutes>m`; maintain existing goal search and AI fallback.
- [x] Add keyboard accessibility, meaningful empty states, and loading/error paths.

## Task 6: Verification

- [x] Run `npm test` and `npm run build`.
- [x] Manual runtime verification: Electron main, tray surfaces, and Island displays connect; service tests cover create → plan → linked focus validation → complete/skip/reschedule synchronization.
- [x] Verify legacy databases with only existing goal tables migrate without data loss.
