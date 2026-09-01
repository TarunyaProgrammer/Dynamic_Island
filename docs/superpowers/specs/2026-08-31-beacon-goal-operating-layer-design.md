# Beacon: Goal Operating Layer for macOS — Design Specification

**Status**: Draft / Under Review  
**Date**: 2026-08-31  
**Author**: Tarunya K ([@TarunyaProgrammer](https://github.com/TarunyaProgrammer))  
**Target Platform**: macOS 15.0+ (Sequoia), Swift 6, SwiftUI + AppKit  

---

## 1. Executive Summary & Core Philosophy

**Beacon** is a lightweight, high-performance **Goal Operating Layer for macOS**. It is intentionally distinct from traditional task managers, habit trackers, and bloated project management suites ("Notion in the menu bar"). 

### Core Product Tenet
> **Beacon keeps your important goals visible and lets you update their progress from anywhere on macOS with almost zero friction.**

Beacon optimizes for a **glance → update → move on** interaction loop:
1. **Glance**: Instantly observe current progress and trajectory from the Menu Bar or Dynamic Island notch overlay without opening a heavy workspace.
2. **Update**: Increment numbers, toggle milestones, or log progress in `< 2 seconds` via menu bar popovers, hover cards, or global keyboard shortcuts (`⌘ + Shift + B`).
3. **Move on**: Immediate auto-dismissal; zero interruption to the user's primary deep-work workflow.

---

## 2. Core Architectural Principles

### 2.1 Unified Command System (Single Source of Truth)
Every mutation across all present and future user interfaces (Menu Bar, Dynamic Island, Keyboard Shortcut Palette, Main Management Window, macOS Widgets, CLI) dispatches an identical, strongly typed **Command** to the central **Domain Engine**. No surface implements ad-hoc mutation logic.

```
                   ┌───────────────────────────────┐
                   │         Beacon Domain         │
                   └───────────────┬───────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │    Command Engine (Service)   │
                   └───────────────┬───────────────┘
                                   │
       ┌───────────────┬───────────┴───────────┬───────────────┐
       ▼               ▼                       ▼               ▼
 ┌───────────┐   ┌───────────┐           ┌───────────┐   ┌───────────┐
 │ Menu Bar  │   │  Dynamic  │           │ Command   │   │   Main    │
 │ Quick Hub │   │  Island   │           │  Palette  │   │  Window   │
 └─────┬─────┘   └─────┬─────┘           └─────┬─────┘   └─────┬─────┘
       │               │                       │               │
       └───────────────┴───────────┬───────────┴───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │      GoalStore (@Observable)  │
                   └───────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │   Local-First Storage Engine  │
                   └───────────────────────────────┘
```

### 2.2 Event Sourcing & Audit Stream
Instead of simply mutating an in-memory integer (`currentValue = 42`), Beacon writes an immutable `ProgressEvent` to an append-only event stream for every increment, decrement, and milestone change. 
- **Undo / Redo (`⌘Z`)**: Straightforward reversal by popping the event stream.
- **Historical Velocity**: Calculates progress trajectory ("On track", "Behind by ~3 days") from actual event deltas rather than synthetic guess-work.

### 2.3 Strict Separation of Concerns
- **Domain Layer (`Beacon/Core/Goals/`)**: Pure Swift models, commands, reducers, and validators. Zero AppKit/SwiftUI dependency.
- **Persistence Layer (`beacon/Infrastructure/Persistence/`)**: Local-first repository protocol with atomic file writes and JSON export/import.
- **Surfaces Layer (`beacon/Surfaces/`)**: Thin UI adapters (SwiftUI views, AppKit status item popovers, Dynamic Island surface cards) that observe `GoalStore` and dispatch `GoalCommand`s.

---

## 3. Domain Data Model

```swift
import Foundation

// MARK: - Progress Type Primitive
public enum ProgressType: String, Codable, Sendable, CaseIterable {
    case numeric       // e.g. 42 / 100 hours
    case percentage    // e.g. 73%
    case count         // e.g. 7 / 20 books
    case binary        // e.g. Done / Not Done (0 or 1)
    case milestone     // e.g. 4 / 7 milestones completed
}

// MARK: - Goal Status
public enum GoalStatus: String, Codable, Sendable, CaseIterable {
    case active
    case completed
    case archived
}

// MARK: - Core Goal Entity
public struct Goal: Identifiable, Codable, Sendable, Equatable {
    public let id: UUID
    public var title: String
    public var description: String?
    public var progressType: ProgressType
    public var targetValue: Double
    public var currentValue: Double
    public var unit: String?            // e.g. "hours", "books", "contributions"
    public var startDate: Date
    public var deadline: Date?
    public var status: GoalStatus
    public var category: String?        // e.g. "Career", "Health", "OSS"
    public var milestones: [Milestone]
    public var defaultIncrement: Double // e.g. 1.0, 5.0, 0.5
    public var createdAt: Date
    public var updatedAt: Date

    public var progressFraction: Double {
        guard targetValue > 0 else { return status == .completed ? 1.0 : 0.0 }
        return min(1.0, max(0.0, currentValue / targetValue))
    }

    public var progressPercent: Int {
        Int((progressFraction * 100.0).rounded())
    }
}

// MARK: - Milestone Entity
public struct Milestone: Identifiable, Codable, Sendable, Equatable {
    public let id: UUID
    public let goalId: UUID
    public var title: String
    public var isCompleted: Bool
    public var targetContribution: Double? // Value added to goal currentValue upon completion
    public var completedAt: Date?
}

// MARK: - Progress Event (Event-Sourced History)
public struct ProgressEvent: Identifiable, Codable, Sendable, Equatable {
    public let id: UUID
    public let goalId: UUID
    public let delta: Double             // e.g. +2.0, -1.0
    public let resultingValue: Double
    public let timestamp: Date
    public let note: String?
}
```

---

## 4. Unified Command Architecture

### 4.1 Commands
```swift
public enum GoalCommand: Sendable, Equatable {
    case createGoal(draft: GoalDraft)
    case updateGoal(id: UUID, update: GoalUpdateDraft)
    case deleteGoal(id: UUID)
    case archiveGoal(id: UUID)
    
    case incrementProgress(goalId: UUID, delta: Double, note: String?)
    case setProgress(goalId: UUID, absoluteValue: Double, note: String?)
    case completeGoal(id: UUID)
    
    case addMilestone(goalId: UUID, title: String, contribution: Double?)
    case toggleMilestone(goalId: UUID, milestoneId: UUID)
    case deleteMilestone(goalId: UUID, milestoneId: UUID)
    
    case undo
    case redo
}
```

### 4.2 Goal Service & Command Reducer
```swift
@MainActor
public final class GoalService {
    private let repository: GoalRepositoryProtocol
    private let store: GoalStore
    private var undoStack: [ProgressEvent] = []
    private var redoStack: [ProgressEvent] = []

    public init(repository: GoalRepositoryProtocol, store: GoalStore) {
        self.repository = repository
        self.store = store
    }

    public func execute(_ command: GoalCommand) async throws {
        switch command {
        case .createGoal(let draft):
            let goal = draft.build()
            store.goals.append(goal)
            try await repository.saveGoals(store.goals)
            
        case .incrementProgress(let goalId, let delta, let note):
            guard let index = store.goals.firstIndex(where: { $0.id == goalId }) else { return }
            var goal = store.goals[index]
            goal.currentValue = max(0, goal.currentValue + delta)
            if goal.currentValue >= goal.targetValue && goal.targetValue > 0 {
                goal.status = .completed
            }
            goal.updatedAt = Date()
            store.goals[index] = goal
            
            let event = ProgressEvent(
                id: UUID(),
                goalId: goalId,
                delta: delta,
                resultingValue: goal.currentValue,
                timestamp: Date(),
                note: note
            )
            store.events.append(event)
            undoStack.append(event)
            
            try await repository.saveGoals(store.goals)
            try await repository.appendEvent(event)
            
        // ... (exhaustive implementations for all GoalCommand cases)
        }
    }
}
```

---

## 5. CRUD & Surface Capability Matrix

| Operation | Menu Bar Quick Hub | Dynamic Island Surface | Command Palette (`⌘⇧B`) | Main Window | CLI (Future) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Create Goal** | ✅ (Quick Add Popover) | — | ✅ (`> new ...`) | ✅ (Full Form) | ✅ |
| **View Active Goals** | ✅ (Compact List) | ✅ (Top 3 Cards) | ✅ (Search Filter) | ✅ (Full Grid) | ✅ |
| **Quick Increment (`+1`)** | ✅ (1-Click Button) | ✅ (1-Click Button) | ✅ (`> +1 [goal]`) | ✅ | ✅ |
| **Set Progress Value** | ✅ (Inline Stepper) | — | ✅ (`> set [v]`) | ✅ | ✅ |
| **Toggle Milestone** | ✅ (Expandable Row) | — | ✅ (`> done [m]`) | ✅ | ✅ |
| **Mark Complete** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit / Configure Goal** | ✅ (Sheet) | — | — | ✅ | ✅ |
| **Delete / Archive** | ✅ (Context Menu) | — | — | ✅ | ✅ |
| **View Event History** | — | — | — | ✅ (Timeline) | ✅ |

---

## 6. Surfaces & Interaction Design

### 6.1 Menu Bar Quick Hub (Primary Surface)
- **Status Item**: Renders overall today's progress percentage (`68%`) or compact Beacon logo with mini circular gauge.
- **Click Popover**:
  - **Header**: Today's aggregated progress bar + active goals count (`4/7 Active`).
  - **Goal Row**:
    - Title + Category tag (e.g. `Rust Book • Learn Rust`).
    - Progress Bar / Ring (`42 / 100 hrs • 42%`).
    - Instant Action Capsule: `+1h` or `+1` button that executes without closing the popover.
    - Expand Arrow: Reveals pending milestones and quick notes.
  - **Footer**: `+ Quick Add` button, `⌘⇧B` shortcut hint, and settings gear.

### 6.2 Dynamic Island & Notch Surface (Secondary Glanceable Hub)
- **Passive State**:
  - Floating pill on non-notch Macs or notch-integrated pill: `◉ 4/7 goals • 68%`.
- **Hover / Expanded State**:
  - Drops down smoothly with spring animation.
  - Displays top prioritized active goals with mini progress bars and quick `+1` increment buttons.
  - Auto-collapses on mouse leave with configurable delay.

### 6.3 Global Keyboard Command Palette (`⌘ + Shift + B`)
- Floating spotlight-style modal:
  - Text input supporting natural syntax:
    - `+2 Rust` (increments Rust goal by 2)
    - `done ownership` (completes milestone)
    - `new Read 20 books` (drafts new goal)
  - Keyboard navigation with `↑ / ↓` and `↵` execution.
  - Instant dismissal upon execution.

### 6.4 Main Goal Workspace Window
- Comprehensive dashboard:
  - Goal cards grouped by status / category.
  - Milestone reordering and weight configuration.
  - Activity stream history timeline with timestamps and delta logs.
  - JSON data export / import controls.

---

## 7. Local-First Persistence Engine

```swift
public protocol GoalRepositoryProtocol: Sendable {
    func loadGoals() async throws -> [Goal]
    func saveGoals(_ goals: [Goal]) async throws
    func loadEvents(for goalId: UUID?) async throws -> [ProgressEvent]
    func appendEvent(_ event: ProgressEvent) async throws
    func exportJSON() async throws -> Data
    func importJSON(_ data: Data) async throws
}
```

- **File Storage**: Stored locally in `~/Library/Application Support/com.beacon.beacon/goals.json` and `events.json`.
- **Atomic Operations**: Safe disk writes using `FileManager.default.replaceItemAt` via temporary file swaps to prevent corruption during unexpected shutdowns.
- **Zero Cloud Requirement**: 100% offline, zero account creation, zero tracking.

---

## 8. Phased Implementation Roadmap

### Phase 1: Core Goal Domain & Persistence Engine (v0.1)
- [ ] Implement `Goal`, `Milestone`, `ProgressEvent`, and `ProgressType` models.
- [ ] Implement `GoalCommand` enum and `GoalService` command reducer.
- [ ] Implement `JSONGoalRepository` with atomic disk persistence.
- [ ] Author exhaustive XCTest suite (`GoalServiceTests`, `GoalReducerTests`, `RepositoryTests`).

### Phase 2: Menu Bar Quick Hub & Interactive Popover (v0.1)
- [ ] Build `MenuBarGoalPopoverView` (compact glance list, instant increment buttons, milestone check toggles).
- [ ] Integrate with `MenuBarController` status item.
- [ ] Build `QuickAddGoalView` modal sheet.

### Phase 3: Global Shortcut & Command Palette (v0.1)
- [ ] Implement `⌘ + Shift + B` global keyboard listener via `KeyboardShortcuts`.
- [ ] Build floating `CommandPaletteWindowController` with quick command parser.

### Phase 4: Dynamic Island Surface Integration (v0.2)
- [ ] Register `GoalWidget` conforming to `BeaconWidget` into `WidgetRegistry`.
- [ ] Render compact pill metrics (`◉ 4/7 goals • 68%`) and expanded island goal cards.

### Phase 5: Historical Analytics & Velocity Trajectory (v0.2+)
- [ ] Implement velocity estimation: `(deadline + progress + event log velocity = expected trajectory)`.
- [ ] Add "On Track" / "Behind" status badge.
- [ ] Activity history timeline in Main Window.

---

## 9. Verification & Quality Gates

- **Concurrency**: 100% Swift 6 strict concurrency checks without warnings.
- **Unit Tests**: Minimum 90% code coverage on `GoalService`, command execution, and JSON repository persistence.
- **Latency**: All command executions must settle and persist to disk in `< 10ms`.
- **UI Responsiveness**: Menu Bar popover and Dynamic Island expand transitions run at 60/120 FPS ProMotion without main-thread hitches.
