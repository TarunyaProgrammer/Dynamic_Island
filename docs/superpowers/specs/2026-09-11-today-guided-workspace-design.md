# Today Guided Workspace Design

## Purpose

Make Today the dependable place to start work: every open action is visible, three deliberate commitments remain prominent, and Beacon welcomes the user with a calm circular presence.

## Problem

`TodayView` resolves and renders only action IDs stored in `today_plan_actions`. An open action can exist in `goal_actions` without a same-day plan entry, making it valid data that is invisible in Today. This happens for actions created through sources that do not explicitly call `TodayService.planAction`.

## Experience

Today uses the approved **Guided day** direction.

- A compact date label, time-aware greeting, and one-line daily prompt form the header.
- A large, circular, smiling Beacon sits alongside the greeting. Its halo remains subtle and respects reduced-motion preferences.
- The first three planned, open actions are the `Today focus` list. They use the existing complete, focus, and options actions.
- `All open actions` follows the focus list. It contains every remaining open action, including actions with no plan entry. Unplanned actions have a `Bring to Today` control; when the three-commitment capacity is full, the existing service policy places the item in `Later today` instead.
- `Later today` remains collapsible so the primary workspace remains calm.
- Empty state remains actionable: it explains that no actions exist, with one button to add the first action.

## Data and State

### Action visibility

`useToday` must load both:

1. the date-scoped `TodayPlan`, and
2. all open actions for active goals.

The renderer derives lists without duplicating persistence:

- `focusActions`: open actions in the plan’s `today` bucket;
- `laterActions`: open actions in the plan’s `later` bucket;
- `unplannedActions`: open actions whose IDs are absent from the plan;
- completed counts: plan entries whose actions are completed.

The action repository gains a narrow `listOpenForGoalIds(goalIds)` query. The main-process actions list IPC endpoint exposes it. `useToday` receives active goal IDs, refreshes when Today changes, and returns the full open-action inventory.

### Creation policy

Actions deliberately created with the existing `Add to Today` control continue to call `planAction` immediately. No migration mutates historical actions: they appear in `All open actions`, and the user decides which one to bring forward.

## Circular Beacon

`BeaconCompanion` keeps its public API and state visuals. Its SVG viewport, body path, eye coordinates, and size classes change from a horizontal oval to a circular geometry.

- All variants retain the same semantic role, label, interaction behavior, and animation names.
- The circular body fills a square SVG viewport with appropriate safe padding for its optical halo.
- Eye positions are centered horizontally with a comfortable gap; smiling and tickled poses retain their expression at the tiny Island size.
- The larger Today instance uses `size="large"`, `state="smiling"`, and does not play audio automatically.

## Accessibility and Failure States

- Today lists retain semantic section labels and readable button names.
- Controls are keyboard reachable and retain existing focus indicators.
- Loading keeps the existing preparation message.
- A failed inventory request preserves the currently loaded plan/actions and shows an inline, retryable error rather than replacing the page with a blank state.
- Reduced motion disables continuous companion movement but not the visual greeting.

## Testing

- Repository test: open actions across active goals are returned in a stable order.
- Hook-adjacent pure list derivation test: planned focus, later, completed, and unplanned actions partition correctly with no duplicates.
- Today service test: planning an unplanned action still applies the three-commitment and one-goal rules.
- Companion state test: circular viewBox/body contract remains stable across visual states.

## Out of Scope

- Automatic prioritization or AI selection of the three commitments.
- Changing action completion or rescheduling semantics.
- A database migration for old unplanned actions.
- New sound behavior for the companion.
