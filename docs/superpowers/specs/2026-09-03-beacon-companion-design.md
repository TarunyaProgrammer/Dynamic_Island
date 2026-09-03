# Beacon Companion — Cross-Surface Presence Design

**Date:** 2026-09-03  
**Status:** Proposed for implementation  
**Scope:** Electron renderer surfaces: Main, Tray, and Dynamic Island

## Goal

Introduce a single, deterministic Beacon companion character that gives the Electron app a calm, recognizable presence across its three existing renderer surfaces. The companion should feel alive through rare eye and body motion, communicate state primarily through expression and glow, and remain useful without an LLM or chat UI.

The first implementation establishes the visual language and state plumbing. It does not add dialogue generation, a text chat box, Rive, or a new animation runtime.

## Product invariants

- The body is an almost-black organic pebble/orb and remains visually simple.
- The eyes are the personality: off-white, minimal, and free of pupils, mouth, nose, or decorative facial features.
- Beacon light appears behind the body as a restrained halo, never as a neon body fill.
- Animation is rare and meaningful. Idle motion must be subtle enough to read as presence rather than distraction.
- Text provides factual context; expression and glow provide emotional/state context.
- Normal interactions remain silent. Existing meaningful-event audio stays opt-in through the current audio utility.
- The same component and state vocabulary are used on Main, Tray, and Dynamic Island, with size-specific layout only at the surface boundary.
- Reduced-motion preferences disable continuous breathing and randomized blinking while preserving readable static states.

## User-visible behavior

### States

The pure state model supports:

```ts
type CompanionState =
  | 'idle'
  | 'greeting'
  | 'thinking'
  | 'celebrating'
  | 'concerned'
  | 'sleeping'
  | 'error';
```

Initial behavior for this slice:

- `idle`: default state; low-contrast halo, open eyes, subtle breathing and occasional blink.
- `greeting`: short entry transition when a surface first mounts; eyes open into the normal idle pose.
- `thinking`: reserved for asynchronous companion-aware actions and rendered by a slight eye offset plus violet halo.
- `celebrating`: short transient state after a successful progress increment, milestone toggle, goal completion, or goal creation; eye brightness and halo expand briefly.
- `concerned`: available for a future at-risk/trajectory signal; uses a restrained amber halo and slightly narrowed/angled eyes.
- `sleeping`: static closed eyes and dim halo; no automatic idle animation.
- `error`: static concerned eyes with a restrained rose halo and a factual error message supplied by the surface.

Each surface may select the same state based on its local action, but transient state changes must also be broadcast through the Electron main process so open surfaces can react coherently. A surface that is not visible may simply apply the next state when it mounts.

### Motion

- Body breathing: approximately 1.2% scale change over a 4–6 second cycle.
- Blink: randomized 2–7 second interval, 120–180ms total, with vertical eye compression rather than a snap.
- Celebration: one short 200–250ms halo/eye response; no confetti or repeated bounce.
- Greeting: one short open/settle sequence.
- All timers and subscriptions are cleaned up on unmount.

## Architecture

### Shared renderer component

Create `apps/renderer/src/components/BeaconCompanion.tsx` as the only visual implementation. It owns:

- Inline SVG body and eyes so shape and expression scale cleanly from Island to Main.
- A halo layer behind the body driven by CSS custom properties.
- State-specific eye pose and halo color mapping supplied by a pure helper.
- `aria-label` and a non-animated readable state label for accessibility and diagnostics.
- A `prefers-reduced-motion` media query path.

The component accepts surface-neutral props such as:

```ts
interface BeaconCompanionProps {
  state?: CompanionState;
  size?: 'tiny' | 'compact' | 'regular' | 'large';
  label?: string;
  className?: string;
}
```

The component does not import Electron, call IPC, read goals, or perform domain mutations.

### Pure state and visual mapping

Create a small pure module alongside the component, such as `companion-state.ts`, containing:

- `CompanionState` and visual pose types.
- State-to-eye/halo mapping.
- Transient-state duration constants.
- Helpers that derive a default state from renderer facts (for example, active focus or a successful local action) without depending on React or Electron.

This module is unit-testable without a DOM.

### React integration hook

Create a `useCompanion` hook that:

- Starts with `greeting`, then settles to `idle`.
- Exposes `celebrate()` and `setState()` for surface actions.
- Subscribes to a typed companion event from `window.beacon`.
- Clears the transient-state timeout and IPC subscription on unmount.
- Uses one active transient state at a time; a newer meaningful event replaces an older transient state rather than queueing animation spam.

The hook is the only renderer integration layer. `BeaconCompanion` remains presentational.

### Electron event path

Add a shared IPC channel and typed preload methods for companion events:

```ts
type CompanionEvent = {
  state: CompanionState;
  source: 'main' | 'tray' | 'island';
  message?: string;
};
```

Renderer action flow:

```text
surface action
  -> GoalService mutation through existing typed IPC
  -> successful result
  -> companion.emit(state = celebrating)
  -> Electron main broadcasts event to loaded renderer windows
  -> Main / Tray / Island useCompanion instances render the same state
```

The event is a transient UI signal, not database state. The main process owns fan-out only; it does not know visual pose details. Existing goal-change events remain the source of truth for data refresh.

If a renderer event cannot be delivered because a window is closed or not yet loaded, no error should be surfaced to the user. The originating surface still completes its local transition.

## Surface integration

### Main workspace

Place a `regular` companion in the existing greeting/summary area beside the greeting copy. It should occupy a compact horizontal block and not push the goal list below the fold. Existing metrics remain primary. Goal create, increment, milestone toggle, and complete handlers emit `celebrating` only after the mutation succeeds.

### Tray Quick Hub

Place a `compact` companion beside the progress summary header. Keep the fast-glance goal list and quick increment controls unchanged. The companion should not increase the tray window height; use the existing header’s available horizontal space or a compact two-column summary row.

### Dynamic Island

Use the `tiny` companion as the collapsed Island’s visual anchor, replacing the current reliance on the Beacon logo for identity while preserving the progress percentage/ring. In expanded mode, use the `compact` companion in the top bar or goal column without changing the fixed 660×180 window contract. Goal, focus, and media tabs remain functional and visually dominant when selected.

### Command Palette

No visible companion is required in this slice. The shared event type must be forward-compatible with it, but the palette remains optimized for keyboard command density.

## Error handling and accessibility

- Companion event broadcast failures are logged at debug level only and never block a goal mutation.
- Component timers are cancellable and cannot update state after unmount.
- `prefers-reduced-motion: reduce` renders stable poses and disables breathing/blink loops.
- The companion has an accessible label such as `Beacon companion: celebrating`; decorative SVG paths are hidden from redundant screen-reader traversal.
- Color is not the sole state indicator: state labels and the related surface message remain available.
- Existing context isolation and `nodeIntegration: false` settings remain unchanged.

## Testing and verification

Add tests for:

- Complete state-to-visual mapping for every `CompanionState`.
- Transient-state timeout behavior and replacement of an older transient state.
- Cleanup of timer and companion-event listeners on unmount.
- Preload/main IPC typing and broadcast registration.
- Existing goal actions still resolve before emitting celebration.

Verification commands:

```bash
npm test
npm run build
```

Manual Electron verification should confirm:

1. Main, Tray, and Island show the same black-body/off-white-eyes character at different sizes.
2. All three surfaces can remain open while a goal action produces a synchronized celebration.
3. Island remains fixed at 660×180 and its existing tabs/buttons still work.
4. Reduced motion removes the idle animation without removing state feedback.
5. No new companion animation or normal goal action produces sound by default.

## Out of scope

- LLM or chat functionality.
- Voice or spoken responses.
- Persistent companion state in SQLite.
- Rive or another animation runtime.
- Full trajectory-risk detection and automatic `concerned` prompts.
- Automatic sleep/wake detection from system idle state.
- A visible palette companion.
- New mascot artwork files or external bitmap assets.
