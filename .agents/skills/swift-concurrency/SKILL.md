---
name: typescript-concurrency-state
description: >
  Use when designing or debugging asynchronous workflows in Beacon — covering Node.js event
  loop concurrency, SQLite WAL transactions, multi-window IPC synchronization, atomic state
  updates, and memory leak prevention in long-running daemon processes.
---

# Beacon — TypeScript Concurrency & Asynchronous State

Beacon runs as a continuous desktop process with multiple Electron renderers communicating
via IPC to a central domain service backed by SQLite. This skill defines how to manage
concurrency, async event streams, and database locks safely without UI freezes.

---

## Architecture Concurrency Model

1. **Main Process (Single Threaded Node.js Event Loop)**:
   - Owns the SQLite database (`better-sqlite3` synchronous API).
   - Owns domain services (`GoalService`, `UndoManager`, `FocusManager`).
   - Dispatches IPC messages to renderers.
2. **Renderer Processes (Chromium WebFrames)**:
   - Run independently on separate Chromium processes.
   - Communicate strictly asynchronously with Main via `window.beacon` ContextBridge.
3. **Database Concurrency**:
   - `better-sqlite3` is synchronous and blocking. Because SQLite WAL mode is enabled (`PRAGMA journal_mode = WAL`), reads and writes do not block each other across reader transactions.
   - Operations inside `GoalService` are kept sub-millisecond to avoid starving the Node.js event loop.

---

## Safe Asynchronous Patterns

### 1. Atomic Mutations with Event Broadcast
All mutations must be single-source-of-truth in the main process domain service, then broadcast to all windows:

```ts
// packages/core/services/goal-service.ts
public incrementGoal(id: string, delta?: number): Goal | null {
  // 1. Synchronous atomic SQLite write
  const goal = this.repository.getGoalById(id);
  if (!goal) return null;

  const inc = delta ?? goal.defaultIncrement;
  const newCurrent = goal.currentValue + inc;
  
  this.repository.updateGoal({ ...goal, currentValue: newCurrent });
  this.repository.saveProgressEvent({
    id: crypto.randomUUID(),
    goalId: id,
    previousValue: goal.currentValue,
    newValue: newCurrent,
    delta: inc,
    resultingValue: newCurrent,
    timestamp: new Date().toISOString(),
  });

  // 2. Broadcast change event to all subscribers (windows/tray)
  this.notifySubscribers('goal:updated', goal);
  return goal;
}
```

### 2. Multi-Window Broadcast via IPC
Never maintain isolated state in individual renderers. Renderers are pure visual views over the main process state:

```ts
// apps/main/ipc/goalHandlers.ts
goalService.subscribe((event, data) => {
  mainWindow?.webContents.send(IPC_CHANNELS.EVENT_GOALS_CHANGED, data);
  islandWindow?.webContents.send(IPC_CHANNELS.EVENT_GOALS_CHANGED, data);
  trayWindow?.webContents.send(IPC_CHANNELS.EVENT_GOALS_CHANGED, data);
  paletteWindow?.webContents.send(IPC_CHANNELS.EVENT_GOALS_CHANGED, data);
});
```

### 3. Avoiding Race Conditions in Focus Timer
Timer intervals should track target end timestamps (`endTime`), not accumulated seconds, to avoid drift when macOS suspends background timers:

```ts
// packages/core/activities/focus-manager.ts
export class FocusManager {
  private timer: NodeJS.Timeout | null = null;
  private targetEndTime: number = 0;

  startSession(durationMinutes: number, goalId?: string): void {
    this.targetEndTime = Date.now() + durationMinutes * 60 * 1000;
    
    this.timer = setInterval(() => {
      const remainingMs = Math.max(0, this.targetEndTime - Date.now());
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      this.emitTick(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        this.completeSession();
      }
    }, 1000);
  }
}
```

---

## Common Pitfalls & Rules

1. **Never use `fs.readFileSync` or slow sync loops in IPC handlers**:
   - Keep IPC handlers $< 5\text{ms}$ execution time.
2. **Always unregister IPC listeners in React `useEffect` cleanups**:
   - Avoid accumulating zombie callback listeners on hot reload.
3. **No circular IPC loops**:
   - Renderer calls `ipcRenderer.invoke('goal:increment')` $\rightarrow$ Main updates SQLite $\rightarrow$ Main emits `EVENT_GOALS_CHANGED` $\rightarrow$ Renderer updates React state.
