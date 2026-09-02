---
name: electron-window-management
description: >
  Use when creating, configuring, or debugging Electron BrowserWindow instances in Beacon —
  covering frameless transparent overlays (Dynamic Island), tray popovers, always-on-top
  windows, multi-space support, mouse-event passthrough, and screen geometry detection.
  This skill replaces the old AppKit/NSWindow control skill.
---

# Beacon — Electron Window Management

Beacon runs four concurrent BrowserWindow surfaces. Each has unique window-level, frame,
and interaction requirements. This skill documents the exact patterns used in `apps/main/windows/`.

---

## Window Inventory

| Surface | Class | Key Properties |
|---|---|---|
| Main App | `MainWindow.ts` | Standard resizable, min 780×540 |
| Tray Popover | `TrayPopoverWindow.ts` | Frameless, vibrancy, `alwaysOnTop` |
| Dynamic Island | `IslandWindow.ts` | Transparent, frameless, `alwaysOnTop`, click-through |
| Command Palette | `PaletteWindow.ts` | Frameless, `alwaysOnTop`, centered, keyboard-driven |

---

## Transparent Frameless Overlay (Dynamic Island)

```ts
// apps/main/windows/IslandWindow.ts
import { BrowserWindow, screen } from 'electron';

export class IslandWindowController {
  private window: BrowserWindow | null = null;

  create(preloadPath: string, rendererUrl?: string): BrowserWindow {
    const { x, width } = screen.getPrimaryDisplay().workAreaSize;

    this.window = new BrowserWindow({
      x: Math.round(width / 2 - 200),
      y: 0,
      width: 400,
      height: 40,
      transparent: true,
      frame: false,
      hasShadow: false,
      resizable: false,
      alwaysOnTop: true,
      // Equivalent of .canJoinAllSpaces + .stationary
      visibleOnAllWorkspaces: true,
      skipTaskbar: true,
      focusable: false,           // Click-through when collapsed
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    // Keep above full-screen apps (equivalent of statusBar + 1)
    this.window.setAlwaysOnTop(true, 'screen-saver');
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    return this.window;
  }

  /** Enable mouse interaction when expanded */
  expand(height: number): void {
    this.window?.setFocusable(true);
    this.window?.setIgnoreMouseEvents(false);
    this.window?.setSize(400, height, true);  // true = animate
  }

  /** Return to pass-through pill */
  collapse(): void {
    this.window?.setSize(400, 40, true);
    this.window?.setFocusable(false);
    this.window?.setIgnoreMouseEvents(true, { forward: true }); // forward=true: still receive hover
  }
}
```

### Key Options Explained

| Option | Purpose | Equivalent to (AppKit) |
|---|---|---|
| `transparent: true` | Allows CSS `background: transparent` to be truly transparent | `isOpaque = false`, `backgroundColor = .clear` |
| `frame: false` | No title bar | `.borderless` style mask |
| `visibleOnAllWorkspaces: true` | Show on every Space | `.canJoinAllSpaces` + `.stationary` |
| `setAlwaysOnTop('screen-saver')` | Float above full-screen apps | `.statusBar + 1` window level |
| `setIgnoreMouseEvents(true, { forward: true })` | Pass clicks through, but receive hover | `hitTest → nil` (passthrough) |
| `skipTaskbar: true` | Hide from Dock / Mission Control | `.ignoresCycle` |
| `visibleOnFullScreen: true` | Stay visible when other app goes full-screen | `.fullScreenAuxiliary` |

---

## Tray Popover (Vibrancy / Blur)

```ts
// apps/main/windows/TrayPopoverWindow.ts
import { BrowserWindow, Tray } from 'electron';

export class TrayPopoverController {
  private window: BrowserWindow | null = null;

  toggle(trayBounds: Electron.Rectangle, preloadPath: string): void {
    if (this.window?.isVisible()) {
      this.window.hide();
      return;
    }

    if (!this.window) {
      this.window = new BrowserWindow({
        width: 360,
        height: 480,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        hasShadow: true,
        // macOS sheet-style background blur
        vibrancy: 'under-window',
        visualEffectState: 'active',
        transparent: true,
        webPreferences: {
          preload: preloadPath,
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      // Auto-hide when loses focus
      this.window.on('blur', () => this.window?.hide());
    }

    // Position above tray icon
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - 180);
    const y = trayBounds.y - 490;
    this.window.setPosition(x, y, false);
    this.window.showInactive();
  }
}
```

---

## Screen Change Monitoring

```ts
import { screen } from 'electron';

// Re-position Island when display configuration changes
screen.on('display-added', () => repositionIsland());
screen.on('display-removed', () => repositionIsland());
screen.on('display-metrics-changed', (_event, _display, changedMetrics) => {
  if (changedMetrics.includes('workArea') || changedMetrics.includes('scaleFactor')) {
    repositionIsland();
  }
});

function repositionIsland() {
  const primary = screen.getPrimaryDisplay();
  const centerX = Math.round(primary.workAreaSize.width / 2 - 200);
  islandWindow?.setPosition(centerX, 0, false);
}
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| `focusable: false` prevents keyboard input | Call `setFocusable(true)` before expanding, `false` after collapsing |
| Transparent window shows white flash on creation | Load URL/file before `show()`. Use `show: false` option and call `.show()` after `ready-to-show` |
| `alwaysOnTop` doesn't float above full-screen | Must use level `'screen-saver'` or `'floating'` AND set `visibleOnFullScreen: true` |
| Window appears on wrong display | Use `screen.getPrimaryDisplay()` or `screen.getDisplayNearestPoint()` |
| Click-through doesn't work for hover effects | Pass `{ forward: true }` to `setIgnoreMouseEvents` |
| Popover doesn't close on outside click | Handle `blur` event: `window.on('blur', () => window.hide())` |

---

## IPC: Resize from Renderer

The renderer signals window size changes via IPC (the renderer cannot call native APIs directly):

```ts
// apps/main/ipc/goalHandlers.ts
ipcMain.on('island:expand', (_event, height: number) => {
  islandController.expand(height);
});
ipcMain.on('island:collapse', () => {
  islandController.collapse();
});
```

```ts
// apps/renderer/src/surfaces/DynamicIslandView.tsx
window.beacon.send('island:expand', 220);
window.beacon.send('island:collapse');
```
