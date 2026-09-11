# Beacon Interactive Surface Audit and Design

**Date:** 2026-09-11
**Status:** Approved for implementation planning
**Scope:** Renderer styling and interactive surfaces, plus the Dynamic Island Electron window and IPC boundary.

---

## 1. Goal

Make Beacon's Main workspace, Tray Quick Hub, Command Palette, and Dynamic Island feel like one calm, native macOS goal layer. The work fixes verified interaction defects while establishing a compact, accessible design foundation. It does not change routes, persistence models, goal semantics, or user-authored data.

## 2. Audit Findings

### 2.1 Verified baseline

- `npm run build` passes.
- `npm test -- --reporter=verbose` passes: 28 files and 100 tests.
- The current worktree contains substantial user changes. This project work must not overwrite, reformat, or discard unrelated edits.

### 2.2 Dynamic Island state mismatch

`DynamicIslandView` tracks expansion locally while `IslandWindowController` independently changes native bounds after a separate timeout. The renderer begins a 280 ms CSS transition and the native window contracts after 300 ms. Pointer leave, blur, Escape, and a new hover request can race across those two independent clocks.

The controller also leaves an Island window focusable while collapsed. That does not match the intended passive, glanceable collapsed state and can compete with the app the user was working in.

### 2.3 Island information density and semantics

The expanded 660 x 180 Island renders an active tab plus a calendar strip and an overall-progress card in parallel. This crowds goal, focus, and media content into a height designed for a quick interaction. Several icon-only actions use title text but no accessible name. The overall-progress card uses a click handler on a non-semantic `div`.

### 2.4 Shared interaction debt

- Shared button classes and multiple local styles use `transition: all`.
- Modal, picker, and menu behavior is implemented independently, leaving inconsistent Escape dismissal, focus restoration, labelling, and status feedback.
- Global styles remove native outlines and replace some, but not all, focus states. Controls with inline `outline: none` are especially easy to regress.
- Compact controls do not consistently specify disabled, loading, and error feedback.

## 3. Design Read

Beacon remains a preserve-first desktop redesign for frequent macOS users. It uses a dark atmospheric canvas, restrained Solar Amber for active or focused states, native system typography, 6 to 14 px geometry, and low-motion feedback. Visual density remains purposeful enough for a desktop utility, while each glanceable surface exposes one primary decision at a time.

## 4. Shared Design Foundation

### 4.1 Tokens and geometry

Keep the existing dark palette and define the following contract in the renderer token layer:

- Surfaces and elevation derive from the existing app, surface, elevated, hover, and border tokens.
- Solar Amber is the only interactive accent. It communicates active progress, a keyboard focus ring, and meaningful focus-session state.
- Controls use a 6 px radius, small panels use 10 px, and major panels use 14 px. Buttons use the smallest radius appropriate to their function, not a navigation-pill default.
- Shadows are limited to low-opacity depth where an overlay needs separation. Borders and tonal surfaces carry most hierarchy.

### 4.2 Shared interaction primitives

The common stylesheet will provide:

- primary, secondary, ghost, and icon button variants;
- compact segmented controls for mutually exclusive views;
- standard panel, empty-state, and inline-status treatments;
- visible keyboard focus that is never removed without an equivalent replacement;
- named transition properties limited to `background-color`, `border-color`, `color`, `opacity`, and `transform`;
- a `prefers-reduced-motion` fallback that removes motion without hiding state changes.

Interactive elements must use semantic buttons or links. Icon-only controls require an `aria-label`. Text that can be long must have `min-width: 0` and truncation where the surface has fixed bounds.

### 4.3 Dialog and transient UI behavior

Modal dialogs, menus, and pickers will use one behavior contract:

- focus moves into an opened modal and returns to its invoking control when it closes;
- Escape dismisses cancellable overlays;
- each dialog has an accessible title or explicit accessible name;
- form errors appear beside the field they describe;
- async feedback uses an `aria-live="polite"` status message;
- destructive actions keep their existing confirmation or undo path.

## 5. Surface Treatment

### 5.1 Main workspace

The Main workspace preserves its routes, view selection, goal data, focus functions, calendar/reminder access, and AI configuration. It adopts the shared action styles and panel hierarchy so headers, cards, inline editors, empty states, and dialogs feel related without a wholesale layout rewrite.

### 5.2 Tray Quick Hub

The Tray remains the shortest path to an update. It uses compact controls with clear active and focus states, safe scroll containment, blur dismissal that does not interrupt internal clicks, and an explicit empty/error presentation rather than a blank panel.

### 5.3 Command Palette

The palette remains keyboard-first. Its active result must be visually and programmatically identifiable, keyboard navigation must not lose focus, and loading or no-result states must keep the current query visible and offer a useful recovery action.

### 5.4 Dynamic Island content hierarchy

The collapsed Island stays a 200 x 32 status line. The expanded Island stays 660 x 180 but changes from a three-column mini-dashboard to a focused shell:

1. a compact header with the active context and tab switcher;
2. exactly one goal, focus, or media panel with its immediate action;
3. a small contextual summary only when it serves the selected tab.

The calendar strip and overall-progress card no longer compete with the active panel. Goal progress, timer controls, and media controls retain their current commands. When there is no active goal, a clear, labelled action routes into the Main workspace to create one.

## 6. Dynamic Island Window State Contract

`IslandWindowController` becomes the only authority for the native state of each display's Island. Each display independently occupies one of four states: `collapsed`, `expanding`, `expanded`, or `collapsing`.

### 6.1 Transition ownership

1. The renderer sends an expansion or collapse request for its own `WebContents`.
2. The controller resolves the display from that sender, clears that display's previous transition timer, and updates bounds and interaction policy for only that window.
3. The renderer reflects the requested state without scheduling a competing native-bounds timer.
4. The controller returns or emits the resolved state only when acknowledgement is necessary. It never applies a primary-display fallback to a secondary-display request.

### 6.2 Per-state native behavior

| State | Bounds | Focus | Mouse behavior |
| --- | --- | --- | --- |
| Collapsed | 200 x 32 | Non-focusable | Pass through outside the visible Island hit area |
| Expanding | 660 x 180 | Focusable only after the pointer or keyboard interaction enters the expanded shell | Interactive shell enabled |
| Expanded | 660 x 180 | Focusable | Interactive shell enabled |
| Collapsing | 660 x 180 until the renderer transition finishes | Releases focus before final contracted bounds | Ignores stale hover events and accepts a new expand request |

The exact Electron mouse policy must preserve the existing visible 200 x 32 affordance. The implementation must verify this policy on a real macOS display before broadening it to all displays.

### 6.3 Collapse sources

Pointer leave, Escape, and loss of focus all call the same renderer request function. New expansion requests cancel any pending collapse. Controller teardown and display removal clear timers before the window is destroyed.

### 6.4 Multi-display invariants

- A request from Display B can only change the window, timer, focus state, and bounds for Display B.
- A hotplug or display metrics change repositions each Island using that display's current bounds and current state.
- External displays retain a top-edge floating capsule treatment. Notched displays retain the top-edge masking treatment.

## 7. Error, Empty, and Loading States

- A failed quick update shows a short inline status and leaves the original action available for retry.
- A missing goal, media session, or focus target shows a concise next action rather than dead controls.
- Async actions retain their visible labels while pending and prevent duplicate submissions.
- State changes caused by shortcuts, focus ticks, or cross-surface broadcasts are announced only when they alter the user's current context. Routine ticks remain silent.

## 8. Files and Boundaries

Primary planned areas:

- `apps/renderer/src/styles/tokens.css` and `apps/renderer/src/styles/global.css`: shared tokens, interactions, reduced-motion policy, and overlay behavior.
- `apps/renderer/src/surfaces/MainAppView.tsx`, `TrayPopoverView.tsx`, `CommandPaletteView.tsx`, and `DynamicIslandView.tsx`: semantic control use, surface hierarchy, and surface-specific keyboard/empty/loading behavior.
- Shared renderer components that presently own modal, picker, or action styles: bring them onto the foundation only when their current behavior is in scope.
- `apps/main/windows/IslandWindow.ts`, `apps/main/ipc/goalHandlers.ts`, `apps/preload/index.ts`, and `apps/preload/types.ts`: only the sender-scoped Island transition contract requires a bridge change.

No database schema, repository, core goal-service, route, shortcut identifier, or primary navigation label is in scope.

## 9. Verification

### 9.1 Automated checks

- Add focused tests around sender-to-display resolution, timer cancellation, state transitions, and destroyed-window safety in the Island controller.
- Add renderer-focused tests for the shared keyboard and accessible-name behavior where the current test setup supports them.
- Run `npm run build` and `npm test` after each completed implementation slice.

### 9.2 Manual desktop checks

1. At 200 x 32, the Island is unobtrusive, does not retain keyboard focus, and does not block clicks outside its visible area.
2. Hover or click expands only the interacted display's Island. Repeated entry, leave, Escape, and blur do not clip or leave the window stuck at an incorrect size.
3. On a secondary display, expansion, collapse, and hotplug events never alter the primary display Island.
4. Every actionable control on Main, Tray, Palette, and Island is reachable with the keyboard and has a visible focus indicator.
5. Reduced-motion mode removes nonessential animation without delaying state changes.
6. Long goal, action, artist, and media names truncate cleanly within their respective surface bounds.
7. Modal and picker focus returns to the invoking control after close, and destructive actions remain protected.

## 10. Out of Scope

- Replacing the project icon, name, core visual identity, or primary navigation labels.
- Rewriting goal paradigms, focus persistence, media integration, reminders, AI behavior, or database code.
- Adding a new renderer framework, component library, or animation dependency.
- Changing work unrelated to the files above in the existing dirty worktree.
