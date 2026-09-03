# Beacon Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build one production-grade Beacon companion with deterministic state, typed Electron fan-out, and consistent Main, Tray, and Dynamic Island integrations.

**Architecture:** Keep the visual companion presentational and Electron-free. Put the shared state/event contract in `shared/`, validate renderer-originated events in the main process, and expose only typed `emit`/subscription methods through the existing context-isolated preload bridge. A renderer hook owns lifecycle, transient-state timing, event deduplication, and local fallback behavior.

**Tech Stack:** Electron 34, TypeScript strict mode, React 19, Vite 6, Vitest 3, inline SVG, CSS animations, existing `window.beacon` IPC bridge.

---

## File map

Create:

- `shared/companion.ts` and `shared/companion.test.ts` — runtime validation and contract tests.
- `apps/renderer/src/components/companion-state.ts` and `.test.ts` — pure state-to-pose mapping.
- `apps/renderer/src/components/BeaconCompanion.tsx` and `.css` — accessible SVG and animation.
- `apps/renderer/src/hooks/companion-controller.ts` and `.test.ts` — timer-safe transient state.
- `apps/renderer/src/hooks/useCompanion.ts` — React/Electron adapter.

Modify:

- `shared/types.ts`, `shared/ipc-channels.ts` — cross-process contract.
- `apps/preload/types.ts`, `apps/preload/index.ts` — typed secure bridge.
- `apps/main/ipc/goalHandlers.ts` — validated event fan-out.
- `apps/renderer/src/surfaces/MainAppView.tsx`, `TrayPopoverView.tsx`, and `DynamicIslandView.tsx` — surface integration.

## Task 1: Define and test the shared contract

**Files:** `shared/types.ts`, `shared/ipc-channels.ts`, `shared/companion.ts`, `shared/companion.test.ts`

- [x] **Step 1: Add shared types and channels.**

Add to `shared/types.ts`:

```ts
export type CompanionState = 'idle' | 'greeting' | 'thinking' | 'celebrating' | 'concerned' | 'sleeping' | 'error';
export type CompanionSource = 'main' | 'tray' | 'island';
export interface CompanionEvent {
  id: string;
  state: CompanionState;
  source: CompanionSource;
  message?: string;
  occurredAt: string;
}
```

Add to `IPC_CHANNELS`:

```ts
COMPANION_EMIT: 'beacon:companion:emit',
EVENT_COMPANION_CHANGED: 'beacon:event:companion-changed',
```

- [x] **Step 2: Write validation tests first.**

`shared/companion.test.ts` must verify that `makeCompanionEvent('celebrating', 'main', 'Goal completed')` creates a valid event, that missing/invalid ids, timestamps, states, sources, and messages over 160 characters are rejected, and that an omitted message is accepted.

- [x] **Step 3: Run the focused test and verify it fails.**

Run: `npx vitest run shared/companion.test.ts`

Expected: FAIL because `shared/companion.ts` is not implemented.

- [x] **Step 4: Implement safe construction and validation.**

Create `shared/companion.ts` with these exports:

```ts
import { CompanionEvent, CompanionSource, CompanionState } from './types';

const states: readonly CompanionState[] = ['idle', 'greeting', 'thinking', 'celebrating', 'concerned', 'sleeping', 'error'];
const sources: readonly CompanionSource[] = ['main', 'tray', 'island'];

export function isCompanionEvent(value: unknown): value is CompanionEvent {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  const validMessage = event.message === undefined || (typeof event.message === 'string' && event.message.length <= 160);
  return typeof event.id === 'string' && event.id.length > 0 && event.id.length <= 128
    && typeof event.state === 'string' && states.includes(event.state as CompanionState)
    && typeof event.source === 'string' && sources.includes(event.source as CompanionSource)
    && typeof event.occurredAt === 'string' && !Number.isNaN(Date.parse(event.occurredAt))
    && validMessage;
}

export function makeCompanionEvent(state: CompanionState, source: CompanionSource, message?: string): CompanionEvent {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    state,
    source,
    occurredAt: new Date().toISOString(),
    ...(message === undefined ? {} : { message: message.slice(0, 160) }),
  };
}
```

- [x] **Step 5: Run tests and commit.**

Run: `npx vitest run shared/companion.test.ts` — Expected: PASS.

```bash
git add shared/types.ts shared/ipc-channels.ts shared/companion.ts shared/companion.test.ts
git commit -m "feat(companion): add shared event contract"
```

## Task 2: Add secure Electron fan-out

**Files:** `apps/preload/types.ts`, `apps/preload/index.ts`, `apps/main/ipc/goalHandlers.ts`

- [x] **Step 1: Extend `BeaconApi`.**

Import `CompanionEvent` and add:

```ts
companion: { emit: (event: CompanionEvent) => Promise<void> };
onCompanionChanged: (callback: (event: CompanionEvent) => void) => () => void;
```

- [x] **Step 2: Implement the minimal preload bridge.**

Add to the `api` object in `apps/preload/index.ts`:

```ts
companion: {
  emit: (event: CompanionEvent) => ipcRenderer.invoke(IPC_CHANNELS.COMPANION_EMIT, event),
},
onCompanionChanged: (callback: (event: CompanionEvent) => void) => {
  const handler = (_event: Electron.IpcRendererEvent, value: CompanionEvent) => callback(value);
  ipcRenderer.on(IPC_CHANNELS.EVENT_COMPANION_CHANGED, handler);
  return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_COMPANION_CHANGED, handler);
},
```

Keep arbitrary channel access out of the bridge and preserve context isolation/node integration settings.

- [x] **Step 3: Validate and broadcast from main.**

Import `CompanionEvent` and `isCompanionEvent` into `apps/main/ipc/goalHandlers.ts`. Add a `broadcastCompanionChanged(event)` loop over `BrowserWindow.getAllWindows()` that checks both `!win.isDestroyed()` and `!win.webContents.isDestroyed()` before calling `webContents.send(IPC_CHANNELS.EVENT_COMPANION_CHANGED, event)`. Register:

```ts
ipcMain.handle(IPC_CHANNELS.COMPANION_EMIT, (_event, value: unknown) => {
  if (!isCompanionEvent(value)) throw new Error('Invalid companion event');
  broadcastCompanionChanged(value);
});
```

The handler must not persist the event or let a failed broadcast affect a goal mutation.

- [x] **Step 4: Typecheck and commit.**

Run: `npx tsc --noEmit` — Expected: PASS.

```bash
git add apps/preload/types.ts apps/preload/index.ts apps/main/ipc/goalHandlers.ts
git commit -m "feat(companion): add typed Electron event fan-out"
```

## Task 3: Build and test the pure renderer state model

**Files:** `apps/renderer/src/components/companion-state.ts`, `companion-state.test.ts`

- [x] **Step 1: Write tests for all seven states.**

Test that every state returns a non-empty label, hex halo color, positive eye radii, and one of the supported animation modes. Test that only `greeting`, `thinking`, and `celebrating` are transient, and that sleeping/error have distinct readable labels and poses.

- [x] **Step 2: Implement the mapping.**

Export `COMPANION_STATES`, `CompanionEyePose`, `CompanionVisual`, `COMPANION_TRANSIENT_DURATIONS_MS`, `getCompanionVisual(state)`, and `isTransientCompanionState(state)`. Use these exact timing values: greeting 700ms, thinking 1200ms, celebrating 850ms. Map halo colors to cyan, violet, emerald, amber, neutral, and rose; use narrowed/angled eyes for concerned/error and compressed eyes for sleeping.

- [x] **Step 3: Run tests and commit.**

Run: `npx vitest run apps/renderer/src/components/companion-state.test.ts` — Expected: PASS.

```bash
git add apps/renderer/src/components/companion-state.ts apps/renderer/src/components/companion-state.test.ts
git commit -m "feat(companion): add deterministic visual state model"
```

## Task 4: Add lifecycle-safe transient state

**Files:** `apps/renderer/src/hooks/companion-controller.ts`, `.test.ts`, `useCompanion.ts`

- [x] **Step 1: Write fake-timer tests.**

Test `createCompanionController(onStateChange)` for greeting-to-idle, celebration replacing an existing transient timeout, and `dispose()` preventing post-disposal callbacks. Use Vitest fake timers.

- [x] **Step 2: Implement the controller.**

Export `CompanionSnapshot`, `CompanionController`, and `createCompanionController`. `transition(state, message?)` must clear the old timeout, notify once, schedule idle using the shared duration map for transient states, and ignore callbacks after disposal.

- [x] **Step 3: Implement `useCompanion(source)`.**

The hook must create one controller per mounted surface, subscribe to `window.beacon.onCompanionChanged`, deduplicate event ids with a bounded 64-entry set, expose `state`, `message`, `setState`, and `celebrate`, apply local state before invoking IPC, and catch/log IPC errors. Cleanup must unsubscribe and dispose.

- [x] **Step 4: Run tests/typecheck and commit.**

Run: `npx vitest run apps/renderer/src/hooks/companion-controller.test.ts && npx tsc --noEmit` — Expected: PASS.

```bash
git add apps/renderer/src/hooks/companion-controller.ts apps/renderer/src/hooks/companion-controller.test.ts apps/renderer/src/hooks/useCompanion.ts
git commit -m "feat(companion): add lifecycle-safe renderer state hook"
```

## Task 5: Build the production visual component

**Files:** `apps/renderer/src/components/BeaconCompanion.tsx`, `BeaconCompanion.css`

- [x] **Step 1: Implement the accessible inline SVG.**

Export `BeaconCompanionProps` with `state?: CompanionState`, `size?: 'tiny' | 'compact' | 'regular' | 'large'`, `label?: string`, and `className?: string`. Render a transparent wrapper with `role="img"`, an accessible label, a halo behind the body, a black organic pebble path, and two off-white ellipse eyes. Set `data-state` on the wrapper and mark the SVG artwork `aria-hidden="true"`. Use `getCompanionVisual(state)` for every pose/color decision.

- [x] **Step 2: Add cleaned-up blink scheduling.**

Use a `useEffect` timeout loop with a 2–7 second delay. Compress both eyes for 120ms, then schedule the next blink. Stop the loop for `sleeping` and `prefers-reduced-motion: reduce`. Clear both timers in cleanup and never update state after cleanup.

- [x] **Step 3: Add component-only CSS.**

Define stable size classes, 4–6 second breathing capped at 1.2% scale, entry/thinking/celebration animations, `--companion-halo-color`, and a reduced-motion media query that disables transforms while preserving readable state color/labels. Apply `will-change` only to body/halo animation targets.

- [x] **Step 4: Run build and commit.**

Run: `npx tsc --noEmit && npm run build` — Expected: PASS with a generated renderer bundle.

```bash
git add apps/renderer/src/components/BeaconCompanion.tsx apps/renderer/src/components/BeaconCompanion.css
git commit -m "feat(companion): add accessible animated character"
```

## Task 6: Integrate Main and Tray

**Files:** `apps/renderer/src/surfaces/MainAppView.tsx`, `apps/renderer/src/surfaces/TrayPopoverView.tsx`

- [x] **Step 1: Add Main’s regular companion.**

Import `BeaconCompanion` and `useCompanion`; initialize `const companion = useCompanion('main')`. Place `<BeaconCompanion state={companion.state} size="regular" label={companion.message} />` in the existing greeting/summary row without increasing the workspace minimum height or displacing the metrics hierarchy.

- [x] **Step 2: Await Main mutations before celebration.**

Convert create, increment, milestone-toggle, and complete handlers to `async`; await the existing `useGoals` mutation promise, then call `companion.celebrate(...)`, existing light feedback, and existing meaningful-event sound. Do not emit celebration on rejection; leave edit-only updates without celebration.

- [x] **Step 3: Add Tray’s compact companion.**

Initialize `const companion = useCompanion('tray')` and place `<BeaconCompanion state={companion.state} size="compact" label={companion.message} />` beside the current progress summary while keeping the 380×480 window contract.

- [x] **Step 4: Await Tray mutations before celebration.**

Replace inline increment/complete/milestone callbacks with named async handlers. Await each existing `useGoals` mutation and then call `companion.celebrate` with a concise message. Creation follows the same order after `createGoal` resolves.

- [x] **Step 5: Run verification and commit.**

Run: `npx tsc --noEmit && npx vitest run` — Expected: PASS.

```bash
git add apps/renderer/src/surfaces/MainAppView.tsx apps/renderer/src/surfaces/TrayPopoverView.tsx
git commit -m "feat(companion): integrate main and tray surfaces"
```

## Task 7: Integrate Dynamic Island without changing its window contract

**Files:** `apps/renderer/src/surfaces/DynamicIslandView.tsx`

- [x] **Step 1: Add Island companion state.**

Import `BeaconCompanion` and `useCompanion`, then initialize `const companion = useCompanion('island')`.

- [x] **Step 2: Use the tiny companion as collapsed identity.**

Place a `tiny` companion in the collapsed top bar while retaining the existing progress percentage/ring. Preserve tab/button semantics, keyboard navigation, pointer-event behavior, and `setIslandExpanded` calls.

- [x] **Step 3: Use the compact companion in expanded content.**

Place a `compact` companion in the existing expanded goal presentation while preserving the 3-column grid, goal/focus/media content, and all controls. Do not change `IslandWindowController.W`, `IslandWindowController.H`, or the fixed 660×180 assumption.

- [x] **Step 4: Await Island goal mutations before celebration.**

Create named async handlers for primary-goal increment/decrement and completion buttons plus keyboard `+`/`-` actions. Await the mutation, then call `companion.celebrate`. Leave focus and media commands behaviorally unchanged.

- [x] **Step 5: Run verification and commit.**

Run: `npx tsc --noEmit && npx vitest run` — Expected: PASS.

```bash
git add apps/renderer/src/surfaces/DynamicIslandView.tsx
git commit -m "feat(companion): anchor the Dynamic Island surface"
```

## Task 8: Full production verification

**Files:** all Task 1–7 files; verify `apps/main/windows/IslandWindow.ts`

- [x] **Step 1: Run the complete automated checks.**

Run:

```bash
npm test
npm run build
git diff --check HEAD~8..HEAD
```

Expected: all tests pass, strict typecheck/preload/Vite build pass, and no whitespace errors are reported.

- [x] **Step 2: Audit the Electron boundary.**

Confirm every changed BrowserWindow still uses `contextIsolation: true` and `nodeIntegration: false`; confirm renderer code imports no Electron module; confirm the only new bridge methods are `companion.emit` and `onCompanionChanged`.

- [x] **Step 3: Manually verify all surfaces.**

With Electron running, verify Main, Tray, and Island show the same black-body/off-white-eyes character at their intended sizes; a successful goal action produces one synchronized celebration; Island remains 660×180; existing tabs/buttons work; reduced motion removes continuous animation; and normal goal actions remain silent.

- [x] **Step 4: Review the final diff.**

Check for duplicated companion markup, unbounded timers/listeners, unhandled mutation rejection paths, layout overflow, hard-coded state colors outside the mapping module, and changes outside the approved companion scope.

## Plan self-review

- Spec coverage: shared visual identity, state vocabulary, blink/breathe timing, cross-window IPC, Main/Tray/Island integration, reduced motion, accessibility, error handling, security boundary, and automated/manual verification each have a task.
- Completeness scan: no unfilled placeholder or unspecified implementation step is required; every task names exact files, commands, expected results, and interfaces.
- Type consistency: `CompanionState`, `CompanionSource`, and `CompanionEvent` are defined in `shared/types.ts`; preload and renderer modules consume those names; controller snapshots use `CompanionState`; the component consumes `getCompanionVisual`.
- Scope check: chat, Rive, persistence, automatic risk detection, sleep detection, and Command Palette visuals remain excluded as defined by the approved spec.
