# Beacon Daily Execution Roadmap

**Product outcome:** Beacon is the quiet layer between a user's intentions and their work—not another task database or a full personal productivity operating system.

## Product guardrail: one loop, five surfaces

Every core feature must strengthen this loop:

```text
Goals → Next actions → Today → Focus → Done → Review
```

The Main app mirrors that order in its navigation: **Today, Goals, Focus, Review**. Today is intentionally sparse: a date and greeting, at most three deliberate commitments, and direct Start Focus / Mark Done controls. Calendar context, reminders, exports, and analytics are supporting disclosures or settings—not competing dashboard modules.

Before adding a feature, ask whether it helps the user know what matters, know the next action, start, stay out of the way, or return for context. If it does none of those, it does not belong in Beacon's core.

## Delivery order

| Release | User-visible outcome | Existing Beacon systems reused | Explicitly excluded |
| --- | --- | --- | --- |
| 1. Today | Choose and complete up to three goal-owned next actions today. | `GoalService`, goal health, FocusSessionManager, ActivityEngine, tray, command palette. | General task manager, nested projects, shared lists. |
| 2. Gentle check-ins | One quiet, actionable nudge for an opted-in commitment. | `CheckIn`, HabitEvaluator, StreakEngine, HealthCalculator, NotificationService. | Nagging sequences, punishment language. |
| 3. Apple context | Calendar context and explicit Reminders import. | Typed IPC, SettingsRepository, main-process services, Today actions. | Automatically converting meetings into tasks; silent calendar writes. |
| 4. First value | New users create a meaningful first Today plan in under two minutes. | Goal creation, FocusDashboardView, palette, tray. | AI or calendar setup as a prerequisite. |
| 5. Weekly reset | A short local review turns actual data into one next-week adjustment. | Progress events, checks-ins, goal health, focus activity. | Leaderboards, broken-streak framing. |
| 6. Data trust | Backups, export, restore preview, and recovery. | SQLite/WAL, settings surface, Electron dialogs. | Syncing a live SQLite file through a folder provider. |
| 7. Automation | Quick actions from Shortcuts, URLs, palette, then CLI. | GoalService command semantics, broadcasts, history. | Arbitrary shell execution. |
| 8. Sync/mobile | A small iPhone companion after durable conflict-safe sync exists. | Versioned domain types and export schema. | Desktop feature parity on day one. |

## Surface contracts

| Surface | User job | Must lead with | Must not become |
| --- | --- | --- | --- |
| Today | Decide and act now | Three commitments, the goal-owned next action, Start / Done | An activity feed or analytics dashboard |
| Goals | Maintain the underlying commitments | Progress, Next action, primary action | A hidden second Today screen |
| Focus | Do deliberate work | One goal/action, clock, Pause/End | A dashboard of rings, metrics, or competing panels |
| Review | Adjust gently | Commitments kept, strongest momentum, friction, one adjustment | A chart gallery or scorecard |
| Menu bar / Island | Glance and act quickly | Current action/focus state, one-tap actions | A miniature main workspace |

The iPhone companion, when justified by sync, begins with only **Today, Quick Log, Focus, and Reminders**. The Mac remains the planning machine; the phone is the continuity machine.

## Shared foundation required before Release 1

Add `GoalAction` (a concrete next action owned by a goal), `TodayPlan`, `ReminderPolicy`, `ExternalReference`, and immutable `Review` DTOs in `shared/types.ts`. Add normalized SQLite tables and repositories; do not serialize these collections into `Goal` JSON. Each service subscribes/broadcasts through the existing typed IPC pattern, while EventKit, notifications, files, and automation remain in `apps/main/`.

Introduce a local-date utility before scheduling. UTC date derivation (`toISOString().slice(0, 10)`) is wrong near midnight for a local-first app.

## Behaviour contracts

### Today

- Today recommends three commitments; further actions are available but visually placed under Later.
- A goal contributes at most one highlighted next action. Starting focus links it to its goal and action; only the focus manager logs duration.
- Completing an action never increments a numeric goal unless the user deliberately defines that link.
- End-of-day choices are reschedule, skip with a reason, or leave unplanned—never automatic failure.
- The tray shows the top one to three actions, each with Start or Done. The palette accepts `today`, `plan <goal>: <action>`, `done <action>`, and `focus <action> 45m`.

### Reminders

- Nothing notifies by default. Reminder policy must express intent: an exact time, a free calendar window, only if not started, or never. The initial shipped scheduler supports the explicit-time form; the other forms require their own policy states and tests before they are presented.
- Notification actions are Done, Snooze one hour, Skip today, and Open Beacon.
- Rest, travel, and sick skips preserve the product's compassionate trajectory model.

### Calendar and Reminders

- Deliver read-only EventKit calendar context first; show events behind actions but never create tasks from them.
- Reminders imports are user-selected, linked to a goal, and retain a source ID so duplicates are impossible.
- Later write-back requires an explicit calendar/start/end choice and a conflict-resolution sheet. Beacon never moves meetings silently.

### Backup and sync

- SQLite backups checkpoint or use SQLite's backup API; a copied main database without its WAL is invalid.
- Archives exclude AI credentials. Restore first creates a backup, validates a manifest, previews impact, then applies atomically.
- Multi-device sync uses an append-only operation log, tombstones, device IDs, and conflict handling. It must not sync `beacon.sqlite` through iCloud Drive/Dropbox.
- The operation log records durable goal lifecycle, action, Today-plan, reminder-policy, milestone, check-in, progress-event, and focus-session mutations. Portable JSON export includes it along with focus-session history, so restore preserves sync context as well as visible data.

## Primary implementation boundaries

- `packages/core/services/action-service.ts`, `today-service.ts`, `review-service.ts`: pure domain behavior.
- `packages/database/repository/*`: actions, plans, integrations, reviews.
- `apps/main/integrations/*`, `notifications/*`, `data/*`, `automation/*`: platform integrations only.
- `apps/renderer/src/components/TodayView.tsx`, `ActionEditorModal.tsx`, `EndOfDaySheet.tsx`, `WeeklyReviewView.tsx`, data/integration settings: user-facing surfaces.

## Success measures (local-only, opt-in)

First action created, first action completed, first focus linked to an action, and week-one return. Do not add remote behavioural tracking by default.
