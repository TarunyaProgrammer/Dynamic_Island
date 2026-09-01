# Beacon — Minimalist macOS Goal Operating Layer

## Project Overview

**Beacon** is a fast, minimalist macOS goal and progress operating layer built on **Electron, TypeScript, React 19, Vite, and SQLite**.

Designed to replace heavyweight goal management dashboards, Beacon embeds progress tracking directly into the macOS desktop workflow via:
- A glanceable **Dynamic Island top-notch overlay**
- An instant-access **Menu Bar Quick Hub**
- A global Spotlight-style **Command Palette (`⌘ + Shift + B`)**
- A full-featured **Main Goal Workspace Window**

**Author & Maintainer**: [Tarunya K](https://github.com/TarunyaProgrammer)  
**Repository**: [https://github.com/TarunyaProgrammer/Dynamic_Island](https://github.com/TarunyaProgrammer/Dynamic_Island)

---

## Tech Stack

- **Runtime & Desktop**: Electron 34+, Node.js 22+
- **Language**: TypeScript 5.8+ (Strict Mode)
- **UI Framework**: React 19 + Vite 6
- **Database & Persistence**: SQLite (`better-sqlite3`) with WAL mode & atomic transactions
- **Testing**: Vitest 3+
- **Packaging**: `electron-builder` (Universal macOS `.dmg` & `.zip`)
- **Bundle ID**: `com.beacon.beacon`

---

## Build & Run Workflows

```bash
# Install dependencies
npm install

# Start development server with Vite hot reloading
npm run dev

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Typecheck and build production bundles
npm run build

# Package standalone macOS installer (.dmg)
npm run package
```

---

## Architecture & Layout

Beacon is organized into strict, decoupled layers:

```text
Beacon
├── apps/
│   ├── main/                    # Electron Main Process (Lifecycle, Window Controllers, Tray, Shortcuts, IPC)
│   ├── preload/                 # Secure Context Bridge (window.beacon API, contextIsolation: true)
│   └── renderer/                # React 19 + Vite Frontend (Surface Router & Components)
│
├── packages/
│   ├── core/                    # Pure Domain Logic & Services (GoalService, UndoManager, Models)
│   └── database/                # SQLite Relational Persistence (better-sqlite3, Migrations, Repositories)
│
└── shared/                      # Shared DTOs, Enums, and IPC Channel Constants
```

### Module Responsibilities

| Module | Path | Responsibility |
|---|---|---|
| **Core Domain** | `packages/core/` | Domain entities (`GoalEntity`, `MilestoneEntity`, `ProgressEventEntity`), `GoalService` (single source of truth mutations), `UndoManager` stack. Zero Electron/DOM dependencies. |
| **Database** | `packages/database/` | `DatabaseConnection` (WAL mode), relational DDL `schema.ts`, `SQLiteGoalRepository`, `SettingsRepository`. |
| **Main Process** | `apps/main/` | Window managers (`MainWindowController`, `TrayPopoverController`, `IslandWindowController`, `PaletteWindowController`), `TrayController`, `ShortcutManager`, native notifications, and IPC dispatch. |
| **Preload Bridge** | `apps/preload/` | Strongly typed context isolation bridge exposing `window.beacon` to React renderers. |
| **Renderer Surfaces** | `apps/renderer/` | Surface router (`?surface=main | tray | island | palette`), React components (`GoalCard`, `GoalProgressRing`, `MilestoneList`, `GoalEditorModal`, `ActivityTimeline`), tokens & glassmorphism. |
| **Shared** | `shared/` | Cross-process TypeScript models (`Goal`, `Milestone`, `ProgressEvent`, `AppSettings`) and `IPC_CHANNELS`. |

---

## Core Product Loop & Command Model

- **Glance $\rightarrow$ Update $\rightarrow$ Move On**: All progress mutations (e.g. `+1h`, `+1 book`, `done milestone`) must execute in $< 2$ seconds.
- **Single Source of Truth**: All UI surfaces dispatch commands to `GoalService` via typed IPC. When a mutation occurs, `GoalService` broadcasts `EVENT_GOALS_CHANGED`, keeping the Tray, Dynamic Island, Command Palette, and Main Window instantly synchronized.
- **Local-First & Offline**: All data resides in `~/Library/Application Support/Beacon/beacon.sqlite`.

---

## Engineering & Quality Guidelines

1. **Keep Core Pure**: Never import Electron, DOM, or React libraries inside `packages/core` or `packages/database`.
2. **Context Isolation**: Always keep `contextIsolation: true` and `nodeIntegration: false`. Expose only minimal, strictly typed methods in `apps/preload/`.
3. **Automated Testing**: Any domain logic or repository changes must be accompanied by Vitest unit tests in `packages/core/` and `packages/database/`.
4. **Design Tokens**: Adhere to Apple Human Interface Guidelines and dark glassmorphic styling tokens in `apps/renderer/src/styles/tokens.css`.
