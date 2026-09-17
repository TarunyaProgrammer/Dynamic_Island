# Settings Runtime Repair Design

## Goal

Make every non-license control on Beacon's Settings screen truthful and immediately effective. A setting must either change the live application and persist the change, or be explicitly unavailable; no control may silently be a database-only preference.

## Scope

This repair covers Open at Login, notification badge, Dynamic Island position / delay / opacity / workspace visibility / calendar visibility, theme, sound, the global shortcut, calendar recovery, data export/import/delete actions, and update-check messaging. License activation and validation are intentionally excluded.

## Root Cause

`SettingsView` currently writes most controls through generic `SETTINGS_UPDATE`. That writes SQLite and broadcasts a renderer event, but no main-process component applies those settings to Electron windows, Dock APIs, shortcut registration, or the Island renderer. Several presentation actions are also connected to the wrong handler or a placeholder handler.

## Architecture

Add a main-process `SettingsRuntimeController` that owns application of settings which require Electron APIs. It will receive typed, validated settings updates from the settings IPC handler, apply native effects atomically where possible, and return the canonical persisted settings. `SettingsRepository` remains persistence-only.

`IslandWindowController` will expose focused methods for settings it owns: opacity, workspace visibility, and position-aware reflow. Position-aware layout will place `notch` islands at the display top edge and `floating` islands below the menu bar, centered on each display. The renderer remains responsible for its own interaction timing and content, consuming settings via `useSettings`.

## Open at Login

- New installations default to launch-at-login enabled.
- At first app readiness, Beacon enables the macOS login item only when the database does not contain an explicit user choice. Existing explicit opt-outs stay opted out.
- The native login-item state is queried when settings load and after a toggle, then persisted and broadcast so the UI never drifts from macOS.
- Login launches (`wasOpenedAtLogin`) initialise the tray and Island but do not foreground the main window. Normal launches retain the existing main-window behavior.
- When disabled, the General screen shows a compact, non-blocking friction notice: "Friction to your goals increases when Beacon does not open at login," with a single **Enable Open at Login** action. Users may still explicitly opt out.

## Settings Behavior

| Setting | Immediate effect |
| --- | --- |
| Notification Badge | Clears any Dock badge when disabled; the notification path only sets a badge when enabled. |
| Island Position | Reflows every display's Island between top-edge notch and a centered floating position. |
| Auto-Collapse Delay | Controls the Island renderer's hover-leave timer. |
| Island Opacity | Applies `BrowserWindow.setOpacity` to every Island window. |
| Show in All Spaces | Applies `setVisibleOnAllWorkspaces` to every Island window. |
| Calendar in Island | Hides calendar status, tab, and event pill immediately without stopping calendar synchronization. |
| Theme | Applies a data attribute to each renderer document; dark is explicit and system follows `prefers-color-scheme`, using the existing dual token palette. |
| Sound Mode | Synchronizes the persisted setting to each renderer sound engine; silent remains the default. |
| Global Shortcut | Validates and attempts registration before persistence; an unavailable shortcut returns an error and leaves the prior shortcut active. |

## Action Repairs

- Apple Calendar's recovery button opens the native Calendar privacy pane instead of quitting Beacon.
- Export actions treat a cancelled macOS file dialog as cancellation, not success.
- Delete All Data becomes a typed, main-process command that creates a safety backup, clears Beacon-owned tables in a transaction, broadcasts refresh events, and does not quit the application.
- The update button reports that update checks are not configured rather than claiming that the installed build is current.

## Boundaries and Errors

- The renderer never receives raw Electron APIs.
- Every new IPC method has a shared channel, an explicit preload method, and a `BeaconApi` type.
- Renderer controls expose a small inline failure state when an operation is rejected. Settings are only visually committed after the canonical result returns.
- OS-only behavior is guarded by `process.platform === 'darwin'`; test doubles cover the native contract without requiring a macOS login session.

## Verification

- Unit-test default and explicit-choice handling for Open at Login, and that its canonical native result is persisted/broadcast.
- Unit-test validation and rollback behavior for global-shortcut registration.
- Unit-test Island settings application against fake windows and position calculations.
- Unit-test destructive-data reset creates a backup and clears only Beacon tables.
- Extend renderer tests for the friction notice and Calendar visibility / collapse-delay behavior.
- Run the focused test suites, full `npm test`, and `npm run build`; manually verify a packaged macOS build for login-item registration, quiet login start, Dock badge, workspace changes, and System Settings deep link.
