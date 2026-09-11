# Multi-Display Dynamic Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow Beacon's Dynamic Island stealth notch overlay to appear on every connected monitor in extended desktop mode, with independent hover expansion, click passthrough when contracted, and automatic display hotplugging.

**Architecture:** Refactor `IslandWindowController` from managing a single `BrowserWindow` to managing a `Map<number, BrowserWindow>` indexed by `display.id`. Use `BrowserWindow.fromWebContents(event.sender)` in the IPC layer to route expand/collapse requests to the exact monitor whose notch was interacted with. Automatically synchronize windows when displays are added, removed, or resized.

**Tech Stack:** Electron 34 (`screen`, `BrowserWindow`), TypeScript 5.7, Node.js.

---

### Task 1: Refactor `IslandWindowController` for Display Mapping

**Files:**
- Modify: `apps/main/windows/IslandWindow.ts`

- [ ] **Step 1: Update class properties and constructor state**
  Replace single window reference with:
  ```ts
  private windows = new Map<number, BrowserWindow>();
  private isExpandedMap = new Map<number, boolean>();
  private collapseTimeouts = new Map<number, NodeJS.Timeout>();
  private screenListenersAttached = false;
  private preloadPath = '';
  private rendererUrl?: string;
  ```

- [ ] **Step 2: Add window factory method for a specific display**
  Implement `createWindowForDisplay(display: Electron.Display): BrowserWindow`:
  - Calculate initial collapsed coordinates:
    ```ts
    const x = Math.round(display.bounds.x + (display.bounds.width - IslandWindowController.COLLAPSED_W) / 2);
    const y = display.bounds.y;
    ```
  - Create BrowserWindow with `resizable: true`, `alwaysOnTop: true ('pop-up-menu')`, `transparent: true`, `skipTaskbar: true`.
  - Load `?surface=island&displayId=${display.id}`.
  - Register `closed` listener to clean up maps.

- [ ] **Step 3: Implement display synchronization (`syncDisplays`)**
  Implement `syncDisplays()`:
  - Retrieve all displays from `screen.getAllDisplays()`.
  - Add missing displays by calling `createWindowForDisplay`.
  - Remove disconnected displays by closing and deleting from map.
  - Reposition existing displays to match current coordinates.

- [ ] **Step 4: Implement sender-aware expansion and repositioning**
  Implement `setExpandedForSender(sender: Electron.WebContents, expanded: boolean)`:
  - Find window matching `BrowserWindow.fromWebContents(sender)`.
  - Identify its `display.id`.
  - If `expanded`: immediately expand that window to `EXPANDED_W × EXPANDED_H` centered on its display bounds, and focus it.
  - If `!expanded`: wait 300ms (for CSS transition), then shrink that window to `COLLAPSED_W × COLLAPSED_H` centered on its display bounds.

- [ ] **Step 5: Attach screen change events**
  In `createOrShow`:
  - Cache `preloadPath` and `rendererUrl`.
  - Call `syncDisplays()`.
  - If not attached, subscribe to `screen.on('display-added')`, `screen.on('display-removed')`, `screen.on('display-metrics-changed')` calling `syncDisplays()`.

---

### Task 2: Route IPC via WebContents Sender in `goalHandlers.ts`

**Files:**
- Modify: `apps/main/ipc/goalHandlers.ts`

- [ ] **Step 1: Update `ISLAND_SET_EXPANDED` IPC handler**
  Pass `event.sender` to `setExpandedForSender`:
  ```ts
  ipcMain.handle(IPC_CHANNELS.ISLAND_SET_EXPANDED, (event, expanded: boolean) => {
    islandWindow.setExpandedForSender(event.sender, expanded);
  });
  ```

- [ ] **Step 2: Maintain backward compatibility**
  Ensure `toggle` and `getWindow` methods still exist for menu bar actions and tests (e.g. `getWindow()` returns the primary display window).

---

### Task 3: Build & Verification

**Files:**
- Check: `apps/main/windows/IslandWindow.ts`
- Check: `apps/main/ipc/goalHandlers.ts`

- [ ] **Step 1: Verify TypeScript compilation and bundling**
  Run:
  ```bash
  npm run build
  ```
  Expected: Clean exit code 0, 0 type errors.

- [ ] **Step 2: Run test suite**
  Run:
  ```bash
  npm test
  ```
  Expected: All 69 tests pass.

- [ ] **Step 3: Manual multi-monitor verification**
  - Verify notch appears on primary display.
  - Verify notch appears on secondary display.
  - Hover primary: expands primary only.
  - Hover secondary: expands secondary only.
  - Disconnect / reconnect external monitor: overlay updates automatically without crashing.
