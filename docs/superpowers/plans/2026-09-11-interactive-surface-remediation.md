# Beacon Interactive Surface Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the Dynamic Island interaction contract and apply one accessible, calm visual foundation across Beacon's Main workspace, Tray Quick Hub, Command Palette, and Island.

**Architecture:** Preserve routes, data flows, and IPC commands. Extract pure Island layout and input-policy helpers so native behavior is testable, then make the Electron controller the sole owner of bounds, focusability, mouse pass-through, and native timing. The renderer surfaces consume shared CSS primitives and replace non-semantic interaction containers with buttons.

**Tech Stack:** Electron 34, TypeScript 5, React 19, Vite, Vitest, native CSS.

---

## File Map

- Create: apps/main/windows/islandWindowLayout.ts - pure Island dimensions, display centering, and input policy.
- Create: apps/main/windows/islandWindowLayout.test.ts - isolated policy tests.
- Modify: apps/main/windows/IslandWindow.ts - sender-scoped bounds, focus, pass-through, and timers.
- Modify: apps/renderer/src/styles/tokens.css and apps/renderer/src/styles/global.css - shared interaction primitives.
- Modify: apps/renderer/src/surfaces/DynamicIslandView.tsx - single semantic active panel.
- Modify: apps/renderer/src/surfaces/TrayPopoverView.tsx and CommandPaletteView.tsx - semantic controls, feedback, errors.
- Modify: apps/renderer/src/surfaces/MainAppView.tsx and the four Main-surface dialog components - consistent controls, loading state, Escape and focus restoration.

## Task 1: Create Testable Island Layout Policy

**Files:**

- Create: apps/main/windows/islandWindowLayout.ts
- Test: apps/main/windows/islandWindowLayout.test.ts

- [ ] **Step 1: Write the failing test.**

~~~ts
import { describe, expect, it } from 'vitest';
import {
  COLLAPSED_ISLAND_SIZE,
  EXPANDED_ISLAND_SIZE,
  islandBoundsFor,
  islandNativePolicyFor,
} from './islandWindowLayout';

const display = { x: -1440, y: 24, width: 1440, height: 900 };

describe('Island window layout', () => {
  it('centres both layouts on the requested display', () => {
    expect(islandBoundsFor(display, 'collapsed')).toEqual({
      x: -820, y: 24,
      width: COLLAPSED_ISLAND_SIZE.width,
      height: COLLAPSED_ISLAND_SIZE.height,
    });
    expect(islandBoundsFor(display, 'expanded')).toEqual({
      x: -1050, y: 24,
      width: EXPANDED_ISLAND_SIZE.width,
      height: EXPANDED_ISLAND_SIZE.height,
    });
  });

  it('keeps the collapsed Island passive but forwards hover', () => {
    expect(islandNativePolicyFor('collapsed')).toEqual({
      focusable: false, ignoreMouseEvents: true, forwardMouseEvents: true,
    });
  });

  it('makes only the expanded Island interactive', () => {
    expect(islandNativePolicyFor('expanded')).toEqual({
      focusable: true, ignoreMouseEvents: false, forwardMouseEvents: false,
    });
  });
});
~~~

- [ ] **Step 2: Run the test to prove it fails.**

Run: npx vitest run apps/main/windows/islandWindowLayout.test.ts

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure policy module.**

~~~ts
export type IslandVisualState = 'collapsed' | 'expanded';

export interface DisplayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const COLLAPSED_ISLAND_SIZE = { width: 200, height: 32 };
export const EXPANDED_ISLAND_SIZE = { width: 660, height: 180 };
export const ISLAND_TRANSITION_MS = 280;

export const islandBoundsFor = (
  display: DisplayBounds,
  state: IslandVisualState,
): DisplayBounds => {
  const size = state === 'expanded'
    ? EXPANDED_ISLAND_SIZE
    : COLLAPSED_ISLAND_SIZE;

  return {
    x: Math.round(display.x + (display.width - size.width) / 2),
    y: display.y,
    width: size.width,
    height: size.height,
  };
};

export const islandNativePolicyFor = (state: IslandVisualState) => ({
  focusable: state === 'expanded',
  ignoreMouseEvents: state === 'collapsed',
  forwardMouseEvents: state === 'collapsed',
});
~~~

- [ ] **Step 4: Verify the test passes.**

Run: npx vitest run apps/main/windows/islandWindowLayout.test.ts

Expected: PASS with 3 tests.

- [ ] **Step 5: Commit the isolated policy.**

~~~bash
git add apps/main/windows/islandWindowLayout.ts apps/main/windows/islandWindowLayout.test.ts
git commit -m "test(island): cover display-local window policy"
~~~

## Task 2: Make the Island Controller the Sole Native-State Owner

**Files:**

- Modify: apps/main/windows/IslandWindow.ts
- Modify: apps/main/windows/islandWindowLayout.test.ts

- [ ] **Step 1: Extend the policy test with the shared duration.**

~~~ts
import { ISLAND_TRANSITION_MS } from './islandWindowLayout';

it('uses the 280 ms renderer-to-native transition duration', () => {
  expect(ISLAND_TRANSITION_MS).toBe(280);
});
~~~

- [ ] **Step 2: Run it before wiring the controller.**

Run: npx vitest run apps/main/windows/islandWindowLayout.test.ts

Expected: PASS after Task 1, proving the timing is centralized before controller refactoring.

- [ ] **Step 3: Add controller helpers that consume the pure policy.**

In IslandWindow.ts, import IslandVisualState, ISLAND_TRANSITION_MS, islandBoundsFor, and islandNativePolicyFor. Replace duplicated coordinate math with:

~~~ts
private applyNativePolicy(win: BrowserWindow, state: IslandVisualState): void {
  const policy = islandNativePolicyFor(state);
  win.setFocusable(policy.focusable);
  win.setIgnoreMouseEvents(policy.ignoreMouseEvents, {
    forward: policy.forwardMouseEvents,
  });
}

private setBoundsForState(
  display: Display,
  win: BrowserWindow,
  state: IslandVisualState,
): void {
  win.setBounds(islandBoundsFor(display.bounds, state), false);
}
~~~

- [ ] **Step 4: Update creation, expansion, collapse, and display lifecycle behavior.**

Use collapsed policy on initial window creation. On expansion, clear only the target display timer, set expanded bounds, apply interactive policy, and do not call win.focus() from hover expansion. On collapse, apply passive policy immediately and schedule the 200 x 32 bounds update for ISLAND_TRANSITION_MS. Reuse setBoundsForState in repositionWindow, hotplug cleanup, and delayed contraction. Keep existing sender-aware IPC routing and do not alter shared IPC channel names.

- [ ] **Step 5: Verify focused behavior and types.**

Run: npx vitest run apps/main/windows/islandWindowLayout.test.ts && npx tsc --noEmit

Expected: PASS with no TypeScript errors.

- [ ] **Step 6: Commit the native-state refactor.**

~~~bash
git add apps/main/windows/IslandWindow.ts apps/main/windows/islandWindowLayout.ts apps/main/windows/islandWindowLayout.test.ts
git commit -m "fix(island): centralize native window state"
~~~

## Task 3: Establish Shared Tokens and Interaction Primitives

**Files:**

- Modify: apps/renderer/src/styles/tokens.css
- Modify: apps/renderer/src/styles/global.css

- [ ] **Step 1: Add stable semantic tokens.**

Add these token declarations without replacing the current dark palette:

~~~css
--radius-control: 6px;
--radius-panel: 10px;
--radius-surface: 14px;
--duration-fast: 160ms;
--duration-standard: 240ms;
--focus-ring: 0 0 0 2px rgb(255 122 0 / 0.5);
--surface-overlay: rgb(18 20 26 / 0.96);
~~~

Set existing transition tokens from the duration tokens and the existing easing token.

- [ ] **Step 2: Replace every shared transition: all declaration.**

Use this exact transition declaration for shared interactive classes:

~~~css
transition:
  background-color var(--transition-fast),
  border-color var(--transition-fast),
  color var(--transition-fast),
  opacity var(--transition-fast),
  transform var(--transition-fast);
~~~

- [ ] **Step 3: Add reusable surface and focus primitives.**

~~~css
.btn-icon {
  inline-size: 30px;
  block-size: 30px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
}

.surface-shell {
  background: var(--surface-overlay);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-surface);
  box-shadow: var(--shadow-sm);
}

.surface-panel {
  min-width: 0;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel);
}

.segmented-control {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  background: var(--tab-container-bg);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-control);
}

.status-message {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

:where(button, [role='button'], input, select, textarea):focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
~~~

Add overscroll-behavior: contain to modal content. Keep the existing reduced-motion rule but limit it to the reduced-motion media query.

- [ ] **Step 4: Verify no broad transitions remain in shared styles.**

Run: rg -n "transition:\s*all" apps/renderer/src/styles

Expected: no results.

- [ ] **Step 5: Build and commit.**

Run: npm run build

Expected: production bundles succeed.

~~~bash
git add apps/renderer/src/styles/tokens.css apps/renderer/src/styles/global.css
git commit -m "style: add shared accessible surface primitives"
~~~

## Task 4: Recompose the Dynamic Island

**Files:**

- Modify: apps/renderer/src/surfaces/DynamicIslandView.tsx

- [ ] **Step 1: Create a single renderer request function and clean up its UI-intent timer.**

~~~ts
const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const requestExpanded = useCallback((next: boolean) => {
  if (collapseTimer.current) {
    clearTimeout(collapseTimer.current);
    collapseTimer.current = null;
  }
  setIsExpanded(next);
  void window.beacon.windows.setIslandExpanded(next);
}, []);

useEffect(() => () => {
  if (collapseTimer.current) clearTimeout(collapseTimer.current);
}, []);
~~~

Use requestExpanded(false) for Escape and blur. Keep the 600 ms leave grace period only before sending a collapse request. Native bounds timing must remain only in IslandWindowController.

- [ ] **Step 2: Replace the three-column dashboard with semantic active content.**

Use an outer non-interactive container, a section with aria-label="Beacon Dynamic Island", a nav with aria-label="Island context", and one selected content section with aria-live="polite". Retain goal, focus, and media tabs, but remove the permanent calendar and overall-progress columns. Each selected tab gets the full content width and only its immediate actions.

- [ ] **Step 3: Replace non-semantic interactions and name all icon controls.**

Use buttons, never clickable divs. The no-goal state uses a visible button labelled Create a goal in Beacon. Add aria-label props to Main workspace, decrement progress, complete goal, previous, play/pause, next, add 5 minutes, and stop controls. Use btn-icon for icon-only controls, segmented-control for tabs, surface-shell for the outer expanded Island, and surface-panel for the selected content.

- [ ] **Step 4: Apply fixed-width text safety and remove decorative emoji.**

Every flexible content wrapper has minWidth: 0. Goal, artist, album, and action text uses whiteSpace: nowrap, overflow: hidden, and textOverflow: ellipsis. Replace emoji-only status marks with the already imported icon set.

- [ ] **Step 5: Verify source constraints and build.**

Run: rg -n -U "<div[\s\S]{0,500}onClick=|transition:\s*'all'|transition:\s*\"all\"" apps/renderer/src/surfaces/DynamicIslandView.tsx && npm run build

Expected: no scan matches and build succeeds.

- [ ] **Step 6: Commit the Island renderer update.**

~~~bash
git add apps/renderer/src/surfaces/DynamicIslandView.tsx
git commit -m "fix(island): simplify active context and semantics"
~~~

## Task 5: Harden Tray and Command Palette

**Files:**

- Modify: apps/renderer/src/surfaces/TrayPopoverView.tsx
- Modify: apps/renderer/src/surfaces/CommandPaletteView.tsx

- [ ] **Step 1: Convert Palette suggestion and result rows to buttons.**

Replace the clickable AI suggestion and every clickable goal-result div with button elements. Result buttons retain the existing pointer-selected state, use aria-current={isSelected ? 'true' : undefined}, and use min-width: 0 text wrappers. The AI suggestion uses aria-label={'Ask Beacon Companion: ' + query.trim()}.

- [ ] **Step 2: Separate Palette AI response, error, and autoclose handling.**

Add aiError and an autoCloseTimer ref. Clear both before a new prompt. In the catch branch, call setAiError with error instanceof Error ? error.message : 'Beacon could not complete that request. Try again.'. Clear the timeout on unmount. Render AI progress and failure as role="status" aria-live="polite", retain the query, and never close the palette after an error.

- [ ] **Step 3: Apply shared styles and accessible names to Tray.**

Use surface-shell on the root and surface-panel for goal and Today action rows. Add aria-label="Open Main Workspace" to the external-link control. Add aria labels built from each action title to Start focus, Done, Skip, and complete-goal controls.

- [ ] **Step 4: Make Tray quick actions recoverable.**

Add quickActionError state. Wrap increment, complete, and milestone changes with:

~~~ts
setQuickActionError(null);
try {
  await incrementProgress(goalId);
  companion.celebrate('Progress logged');
} catch (error) {
  setQuickActionError(
    error instanceof Error ? error.message : 'Progress could not be logged. Try again.',
  );
}
~~~

Render the error once after the summary with role="status" and aria-live="polite".

- [ ] **Step 5: Build and commit.**

Run: npm run build

Expected: build succeeds.

~~~bash
git add apps/renderer/src/surfaces/TrayPopoverView.tsx apps/renderer/src/surfaces/CommandPaletteView.tsx
git commit -m "fix(surfaces): harden tray and palette interactions"
~~~

## Task 6: Normalize Main Workspace and Dialog Behavior

**Files:**

- Modify: apps/renderer/src/surfaces/MainAppView.tsx
- Modify: apps/renderer/src/components/ConfirmationModal.tsx
- Modify: apps/renderer/src/components/GoalEditorModal.tsx
- Modify: apps/renderer/src/components/ActionEditorModal.tsx
- Modify: apps/renderer/src/components/ReminderPolicyModal.tsx

- [ ] **Step 1: Normalize Main controls.**

Use segmented-control on the status tabs and aria-pressed on each selected status button. Add aria-label="Search goals" and name="goal-search" to the search input. Add aria-label="Clear goal search" to its icon button. Replace every local broad transition with an explicit background-color, border-color, color, opacity, and transform list.

- [ ] **Step 2: Replace text-only loading with a stable semantic skeleton.**

Replace the Loading goals... block with three non-interactive surface-panel skeletons matching a goal-card header. Wrap them in aria-busy="true" aria-live="polite" and keep the visible text Loading goals… for assistive technology and visual status.

- [ ] **Step 3: Implement Escape and focus restoration in every listed Main dialog.**

Each dialog receives a container ref and tabIndex={-1}. When opening, capture document.activeElement if it is an HTMLElement, then focus the dialog. While open, attach a keydown listener that handles Escape and calls onClose. On cleanup, remove the listener and refocus the saved opener when opener.isConnected is true. The confirmation dialog skips Escape only while its confirm action is saving.

- [ ] **Step 4: Attach semantic dialog names and scroll containment.**

Each dialog heading receives a unique id used by aria-labelledby. Keep aria-modal="true". Ensure scrollable dialog content has overscrollBehavior: 'contain' and every visible close button has an explicit aria-label.

- [ ] **Step 5: Build and run the surface scan.**

Run: npm run build && rg -n -U "<div[\s\S]{0,500}onClick=|transition:\s*'all'|transition:\s*\"all\"" apps/renderer/src/surfaces/MainAppView.tsx apps/renderer/src/surfaces/TrayPopoverView.tsx apps/renderer/src/surfaces/CommandPaletteView.tsx apps/renderer/src/surfaces/DynamicIslandView.tsx

Expected: build succeeds and the scan has no results.

- [ ] **Step 6: Commit the workspace and dialog changes.**

~~~bash
git add apps/renderer/src/surfaces/MainAppView.tsx apps/renderer/src/components/ConfirmationModal.tsx apps/renderer/src/components/GoalEditorModal.tsx apps/renderer/src/components/ActionEditorModal.tsx apps/renderer/src/components/ReminderPolicyModal.tsx
git commit -m "fix(accessibility): normalize workspace dialogs and controls"
~~~

## Task 7: Complete Regression and Multi-Display Verification

**Files:**

- Modify: only files needed for a defect reproduced during this verification pass.

- [ ] **Step 1: Run the full regression suite.**

Run: npm test && npm run build

Expected: all current tests and the new Island policy test pass; TypeScript and both production bundles are clean.

- [ ] **Step 2: Run static interaction checks.**

Run: rg -n "transition:\s*all|outline:\s*none" apps/renderer/src/styles apps/renderer/src/surfaces

Expected: no broad transitions. Any outline removal appears only beside a focus-visible replacement.

- [ ] **Step 3: Manually verify all four surfaces.**

Run: npm run dev

Verify:

1. Main: view tabs, goal search, clear search, modals, Escape, and focus restoration.
2. Tray: quick increment, complete, Today start, done, and skip actions, including retry after a rejected mutation.
3. Palette: arrows change the current result, Enter invokes it, AI failure remains visible, and Escape closes it.
4. Single-display Island: collapsed Island does not steal focus; hover expands it; only one active content panel appears; leave and Escape collapse it without clipping.
5. Two-display Island: one display's hover, expansion, collapse, or hotplug does not modify the other display's bounds.
6. Reduced motion: state changes remain immediate and leave no window at an incorrect size.

- [ ] **Step 4: Commit verification-driven corrections only when needed.**

If the manual pass reproduces a defect, add one new numbered task to this plan before editing. That task must name the exact changed files, provide a failing reproduction, and include its own focused commit. Do not create a verification commit when no source changes are needed.
