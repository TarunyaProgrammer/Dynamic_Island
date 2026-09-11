# Multi-Display Dynamic Island Overlay Design

**Date:** 2026-09-08
**Status:** Approved for implementation
**Scope:** Electron Main Process (`IslandWindowController`, `goalHandlers.ts`) and Display Lifecycle Management

---

## 1. Goal

Enable Beacon's Dynamic Island stealth notch overlay to appear on **all connected displays** (both built-in MacBook displays and external monitors) in extended desktop mode. Each monitor receives its own top-notch overlay that:
1. Renders at the top center of its respective screen.
2. Collapses to a compact `200×32px` stealth notch at rest, releasing all underlying screen space for native clicks.
3. Expands to `660×180px` independently on hover or click when the user interacts with that monitor.
4. Shares real-time goal, streak, focus timer, and media state with all other surfaces via Beacon's existing SQLite and broadcast IPC architecture.
5. Reacts automatically to monitor connection, disconnection, and resolution changes (display hotplugging).

---

## 2. Invariants & Guardrails

1. **Independent Hover & Expansion**: Hovering or expanding the notch on Display A does *not* force Display B to expand. Display B remains in its compact `200×32px` notch state.
2. **Click-Passthrough Integrity**: Contracted notches occupy strictly `200×32px` on their display. No transparent click-blocking window frame extends beyond the notch bounds while contracted.
3. **Hardware & External Notch Consistency**: On external displays (which lack a physical camera notch), the `200×32px` notch renders with a discreet rounded pill aesthetic flush with the top edge, giving external monitors the same Apple Dynamic Island experience.
4. **Single Source of Truth**: All windows render `dist/index.html?surface=island`. They read from the same local SQLite database and receive identical broadcast IPC events (`EVENT_GOALS_CHANGED`, `EVENT_FOCUS_TICK`, etc.). Logging progress on Monitor B instantly reflects on Monitor A and the Main window.
5. **Zero Memory Leaks on Hotplug**: Adding or removing displays must cleanly create and destroy `BrowserWindow` instances, disposing of webContents, event listeners, and collapse timers.

---

## 3. Architecture & Components

```
                    ┌──────────────────────────────┐
                    │      Electron Main Loop      │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   IslandWindowController    │
                    │                             │
                    │ windows: Map<displayId, win>│
                    │ expanded: Map<displayId, b> │
                    │ timers: Map<displayId, t>   │
                    └──────┬───────────────┬──────┘
                           │               │
            ┌──────────────▼──────┐ ┌──────▼──────────────┐
            │   BrowserWindow     │ │    BrowserWindow    │
            │ (Primary Display)   │ │  (External Display) │
            │ displayId: 1        │ │  displayId: 2       │
            └─────────────────────┘ └─────────────────────┘
```

### 3.1 IslandWindowController Multi-Window Pool
Replace the single `window: BrowserWindow | null` reference with:
- `windows: Map<number, BrowserWindow>` — mapping `display.id` to its active `BrowserWindow`.
- `isExpandedMap: Map<number, boolean>` — tracking expanded/collapsed state per display.
- `collapseTimeouts: Map<number, NodeJS.Timeout>` — tracking independent 300ms contraction timers per display.

### 3.2 Display Synchronization (`syncDisplays`)
On startup and on any screen lifecycle event:
- Query `screen.getAllDisplays()`.
- Identify newly added displays: instantiate a new `BrowserWindow` using `createWindowForDisplay(display)`.
- Identify removed displays: gracefully close, destroy, and remove windows whose `display.id` is no longer present in `getAllDisplays()`.
- Existing displays: call `repositionWindow(display, window)` to update position if `bounds` or `scaleFactor` changed.

### 3.3 Dynamic Bounds Per Display
For any given display:
- **Collapsed**:
  - `width`: `COLLAPSED_W` (200px)
  - `height`: `COLLAPSED_H` (32px)
  - `x`: `Math.round(display.bounds.x + (display.bounds.width - COLLAPSED_W) / 2)`
  - `y`: `display.bounds.y`
- **Expanded**:
  - `width`: `EXPANDED_W` (660px)
  - `height`: `EXPANDED_H` (180px)
  - `x`: `Math.round(display.bounds.x + (display.bounds.width - EXPANDED_W) / 2)`
  - `y`: `display.bounds.y`

### 3.4 Sender-Aware IPC Routing
When a renderer triggers expansion or contraction:
```ts
ipcMain.handle(IPC_CHANNELS.ISLAND_SET_EXPANDED, (event, expanded: boolean) => {
  islandWindow.setExpandedForSender(event.sender, expanded);
});
```
`setExpandedForSender(sender: WebContents, expanded: boolean)`:
1. Resolves `const targetWindow = BrowserWindow.fromWebContents(sender)`.
2. Locates the `displayId` corresponding to `targetWindow` in `this.windows`.
3. Manages only that window's bounds, focus, and collapse timers.
4. Leaves all other windows completely untouched.

---

## 4. Screen Lifecycle Handling

The controller listens to:
1. `screen.on('display-added', ...)`: Triggers `syncDisplays()`.
2. `screen.on('display-removed', ...)`: Triggers `syncDisplays()`.
3. `screen.on('display-metrics-changed', ...)`: Triggers `syncDisplays()`.

Listeners are registered once upon initialization and detached on application quit.

---

## 5. Renderer Process Impact

Because IPC handles sender resolution automatically via `event.sender`:
- The existing [`DynamicIslandView.tsx`](file:///Users/tarunyakesh/Desktop/Beacon%20-%20Starup/apps/renderer/src/surfaces/DynamicIslandView.tsx) component requires **zero breaking changes** to its IPC calls (`window.beacon.windows.setIslandExpanded`).
- Each window independently handles its local hover, mouse enter/leave, backdrop clicks, and blur listeners.
- Real-time goals and focus session state update across all windows through the existing `useGoals` and `useActivities` hooks.

---

## 6. Verification Plan

1. **Unit & Build Validation**:
   - `npm run build`: Verify TypeScript compilation and bundling.
   - `npm test`: Verify zero regressions in core services.
2. **Single Display Baseline**:
   - Verify correct positioning and smooth 200×32 to 660×180 expansion on the primary screen.
3. **Multi-Display Extended Mode**:
   - Verify that an overlay notch appears at the top center of each connected display.
   - Hover the notch on Display 1: Display 1 expands, Display 2 stays contracted.
   - Hover the notch on Display 2: Display 2 expands, Display 1 stays contracted.
   - Test mouse clicks behind contracted notches on both displays to verify zero click obstruction.
4. **Display Hotplugging**:
   - Disconnect secondary monitor: window closes without error.
   - Reconnect secondary monitor: window reappears automatically and functions immediately.
