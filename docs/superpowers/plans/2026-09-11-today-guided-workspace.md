# Today Guided Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface every open action in Today while preserving three explicit daily commitments, then make Today a circular-Beacon-led daily workspace.

**Architecture:** Extend the action repository and typed IPC bridge with one open-actions inventory query. Keep plan membership in `TodayService`; derive focus, later, and unplanned action groups in one pure renderer helper. Update the reusable SVG companion geometry rather than creating a Today-only mascot.

**Tech Stack:** Electron 34, TypeScript, React 19, Vitest, better-sqlite3.

---

### Task 1: Expose open action inventory for active goals

**Files:**
- Modify: `packages/database/repository/action-repository.ts`
- Modify: `packages/database/repository/repository.test.ts`
- Modify: `apps/main/ipc/goalHandlers.ts`
- Modify: `shared/ipc-channels.ts`
- Modify: `apps/preload/index.ts`
- Modify: `apps/preload/types.ts`

- [ ] **Step 1: Write the failing repository test**

Add a test that saves open and completed actions for two active-goal IDs and a third unrelated goal, then expects `listOpenForGoalIds(['goal-a', 'goal-b'])` to return only the two open matching actions ordered by `updatedAt DESC`.

```ts
expect(actions.listOpenForGoalIds(['goal-a', 'goal-b']).map((action) => action.id))
  .toEqual(['open-newer', 'open-older']);
```

- [ ] **Step 2: Run the repository test to verify it fails**

Run: `npx vitest run packages/database/repository/repository.test.ts`

Expected: FAIL because `listOpenForGoalIds` does not exist.

- [ ] **Step 3: Add the repository query**

Add this interface method and implementation, returning an empty array for no goal IDs without issuing invalid SQL:

```ts
listOpenForGoalIds(goalIds: readonly string[]): GoalAction[];

listOpenForGoalIds(goalIds: readonly string[]): GoalAction[] {
  if (goalIds.length === 0) return [];
  const placeholders = goalIds.map(() => '?').join(', ');
  const rows = this.db.prepare(
    `SELECT * FROM goal_actions WHERE status = 'open' AND goal_id IN (${placeholders}) ORDER BY updated_at DESC`,
  ).all(...goalIds) as Row[];
  return rows.map(mapRow);
}
```

- [ ] **Step 4: Add a minimal typed IPC route**

Add `ACTIONS_LIST_OPEN_FOR_GOALS: 'beacon:actions:list-open-for-goals'`, expose `actions.listOpenForGoals(goalIds)`, and handle it with `actionService.listOpenForGoalIds(goalIds)`. Add this explicit service forwarding method:

```ts
listOpenForGoalIds(goalIds: readonly string[]): GoalAction[] {
  return this.actions.listOpenForGoalIds(goalIds);
}
```

- [ ] **Step 5: Run the repository test and typecheck**

Run: `npx vitest run packages/database/repository/repository.test.ts && npm run build`

Expected: PASS and production typecheck succeeds.

- [ ] **Step 6: Commit**

```bash
git add packages/database/repository/action-repository.ts packages/database/repository/repository.test.ts apps/main/ipc/goalHandlers.ts shared/ipc-channels.ts apps/preload/index.ts apps/preload/types.ts packages/core/services/action-service.ts
git commit -m "feat: expose open action inventory"
```

### Task 2: Derive complete Today action groups

**Files:**
- Create: `apps/renderer/src/components/today-action-groups.ts`
- Create: `apps/renderer/src/components/today-action-groups.test.ts`
- Modify: `apps/renderer/src/hooks/useToday.ts`

- [ ] **Step 1: Write the failing pure derivation test**

Create four open actions and one completed action with plan entries in `today` and `later`. Assert the helper partitions each action once and places the unreferenced open action in `unplanned`.

```ts
expect(deriveTodayActionGroups(actions, plan)).toMatchObject({
  focus: [expect.objectContaining({ id: 'focus' })],
  later: [expect.objectContaining({ id: 'later' })],
  unplanned: [expect.objectContaining({ id: 'unplanned' })],
  completedFocusCount: 1,
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run apps/renderer/src/components/today-action-groups.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement `deriveTodayActionGroups`**

Sort plan entries by `sortOrder`, map entries to existing actions, and return `{ focus, later, unplanned, completedFocusCount, plannedFocusCount }`. Open actions missing from the plan must be `unplanned`; completed actions contribute only to `completedFocusCount` when their plan bucket is `today`.

- [ ] **Step 4: Update `useToday` to load inventory**

Change the hook signature to accept active goal IDs. During one refresh, load the plan and `window.beacon.actions.listOpenForGoals(goalIds)`, then retain completed planned actions by resolving only plan IDs absent from the open inventory. Store the deduplicated result and refresh when Today broadcasts.

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run apps/renderer/src/components/today-action-groups.test.ts && npm run build`

Expected: PASS and production typecheck succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/renderer/src/components/today-action-groups.ts apps/renderer/src/components/today-action-groups.test.ts apps/renderer/src/hooks/useToday.ts apps/renderer/src/surfaces/MainAppView.tsx
git commit -m "fix: show unplanned actions in Today"
```

### Task 3: Implement the guided Today workspace

**Files:**
- Modify: `apps/renderer/src/components/TodayView.tsx`
- Modify: `apps/renderer/src/surfaces/MainAppView.tsx`

- [ ] **Step 1: Use the pure action groups in `TodayView`**

Replace inline filters with `deriveTodayActionGroups`. Render the three named sections in order: `Today focus`, `All open actions`, and collapsible `Later today`.

- [ ] **Step 2: Add the greeting block**

Render `<BeaconCompanion state="smiling" size="large" interactive={false} />` alongside the existing time-aware greeting. Use the existing dark tokens, a hairline border, 16px radius, and no new sound behavior.

- [ ] **Step 3: Add recovery controls**

Render unplanned action rows with `Bring to Today`, which calls the existing `onMoveToday` callback. In `MainAppView`, wire it to `today.planAction(id)`. If capacity is full, existing `TodayService.planAction` places it in `later`; label the result `Later today` after the refresh.

- [ ] **Step 4: Preserve complete states**

When `focus` is empty but `unplanned` exists, do not render the empty-day CTA. Render it only when all three open groups are empty. Keep keyboard-accessible names on Complete, Focus, More, and Bring to Today.

- [ ] **Step 5: Run focused tests and build**

Run: `npx vitest run apps/renderer/src/components/today-action-groups.test.ts packages/core/services/today-service.test.ts && npm run build`

Expected: PASS and Today builds with all actions visibly classified.

- [ ] **Step 6: Commit**

```bash
git add apps/renderer/src/components/TodayView.tsx apps/renderer/src/surfaces/MainAppView.tsx
git commit -m "feat: redesign guided Today workspace"
```

### Task 4: Make the Beacon companion circular

**Files:**
- Modify: `apps/renderer/src/components/BeaconCompanion.tsx`
- Modify: `apps/renderer/src/components/BeaconCompanion.css`
- Modify: `apps/renderer/src/components/companion-state.ts`
- Modify: `apps/renderer/src/components/companion-state.test.ts`

- [ ] **Step 1: Write a failing geometry contract test**

Export a small `COMPANION_VIEWBOX` and assert it is square. Assert baseline eye X positions remain symmetric about the viewBox center.

```ts
expect(COMPANION_VIEWBOX).toBe('0 0 100 100');
expect(visual.leftEye.cx + visual.rightEye.cx).toBe(100);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run apps/renderer/src/components/companion-state.test.ts`

Expected: FAIL because the circular geometry contract is absent.

- [ ] **Step 3: Change shared companion geometry**

Use a square `0 0 100 100` SVG viewBox, body circle centered at `(50, 50)` with safe visual padding, and eye coordinates centered around `50`. Change all companion size classes to square dimensions, retaining existing animation class names and reduced-motion behavior.

- [ ] **Step 4: Run component tests and build**

Run: `npx vitest run apps/renderer/src/components/companion-state.test.ts && npm run build`

Expected: PASS and all existing surfaces receive the circular companion.

- [ ] **Step 5: Commit**

```bash
git add apps/renderer/src/components/BeaconCompanion.tsx apps/renderer/src/components/BeaconCompanion.css apps/renderer/src/components/companion-state.ts apps/renderer/src/components/companion-state.test.ts
git commit -m "feat: make Beacon companion circular"
```

### Task 5: Full verification

**Files:**
- No source changes expected.

- [ ] **Step 1: Run all automated verification**

Run: `npm run build && npm test`

Expected: production build succeeds and every Vitest suite passes.

- [ ] **Step 2: Manually verify the Today flow**

1. Create an action outside Today; open Today and confirm it appears under `All open actions`.
2. Select `Bring to Today`; confirm it appears under focus, or Later today when the focus capacity is full.
3. Create through `Add to Today`; confirm it appears immediately in focus or Later today.
4. Confirm the circular Beacon is visually centered and its controls remain silent on page load.
