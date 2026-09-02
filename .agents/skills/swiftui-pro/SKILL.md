---
name: electron-ipc-architecture
description: >
  Use when designing or modifying IPC communication channels, preload bridges, and
  cross-process messaging in Beacon — enforcing Context Isolation, TypeScript type safety,
  and bidirectional event synchronization.
---

# Beacon — Electron IPC & Bridge Architecture

Beacon strictly isolates the Chromium renderer processes from Node.js system APIs.
All communication flows through typed IPC contracts defined in `shared/ipc-channels.ts`
and exposed safely via `apps/preload/index.ts`.

---

## Architecture Flow

```text
[React UI Component]
       │  (calls window.beacon.getGoals())
       ▼
[Preload ContextBridge (apps/preload/index.ts)]
       │  (ipcRenderer.invoke(IPC_CHANNELS.GOALS_LIST))
       ▼
[Main Process IPC Router (apps/main/ipc/goalHandlers.ts)]
       │  (invokes GoalService.listGoals())
       ▼
[Core Domain Engine (packages/core/services/goal-service.ts)]
       │  (executes SQLite query via SQLiteGoalRepository)
       ▼
[SQLite DB (packages/database/)]
```

---

## Implementing a New IPC Channel

### 1. Define Constant in `shared/ipc-channels.ts`
```ts
export const IPC_CHANNELS = {
  GOAL_CHECK_IN: 'beacon:goal-check-in',
  EVENT_GOALS_CHANGED: 'beacon:event-goals-changed',
} as const;
```

### 2. Expose in Preload (`apps/preload/index.ts`)
```ts
contextBridge.exposeInMainWorld('beacon', {
  checkIn: (goalId: string, state: string, value?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.GOAL_CHECK_IN, goalId, state, value),
  onGoalsChanged: (callback: (goals: Goal[]) => void) => {
    const handler = (_: any, data: Goal[]) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
  },
});
```

### 3. Handle in Main Process (`apps/main/ipc/goalHandlers.ts`)
```ts
ipcMain.handle(IPC_CHANNELS.GOAL_CHECK_IN, async (_event, goalId, state, value) => {
  return goalService.checkIn(goalId, {
    date: new Date().toISOString().split('T')[0],
    state,
    value: value ?? 1,
  });
});
```

---

## Security Invariants

1. **Context Isolation**: Must remain `contextIsolation: true` and `nodeIntegration: false` on all BrowserWindow instances.
2. **Never expose `ipcRenderer` directly**: Always expose explicit, parameterized helper functions.
3. **Validate All Inputs**: Treat all data coming from the renderer as untrusted input. Validate IDs and numeric bounds in domain handlers before writing to SQLite.
