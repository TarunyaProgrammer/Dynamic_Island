# Beacon — macOS Dynamic Island-style Live Hub

## Project Overview

**Beacon** is a native macOS live hub that resides at the top center of your screen. Designed to integrate seamlessly with the MacBook hardware notch (or float as a standalone pill on non-notch displays), Beacon provides instant access to real-time AI quota tracking, developer status, media playback with synchronized lyrics, calendar events, and custom modular widgets.

**Author & Maintainer**: [Tarunya K](https://github.com/TarunyaProgrammer)  
**Repository**: [https://github.com/TarunyaProgrammer/Dynamic_Island](https://github.com/TarunyaProgrammer/Dynamic_Island)

### Architectural References & Prior Art
- [Boring Notch](https://github.com/TheBoredTeam/boring.notch) — Dynamic Island UI patterns & Now Playing integration
- [NotchDrop](https://github.com/Lakr233/NotchDrop) — Transparent window level control & notch boundary detection
- [CodexBar](https://github.com/steipete/CodexBar) — Multi-provider AI usage monitoring & provider isolation design

---

## Tech Stack

- **Language**: Swift 6 (Strict Concurrency enabled), macOS 15.0+ (Sequoia)
- **UI Framework**: SwiftUI + AppKit (low-level floating window and level management)
- **Build System**: Xcode 16+, `.xcodeproj` configuration
- **Target Architectures**: Universal binary (Apple Silicon arm64 & Intel x86_64)
- **Bundle ID**: `com.beacon.beacon`

---

## Build & Run Workflows

```bash
# Open in Xcode
open Beacon.xcodeproj

# Build from Command Line (Debug)
xcodebuild -scheme Beacon -configuration Debug build

# Run Unit Tests
xcodebuild -scheme Beacon -configuration Debug test

# Fast Workflows with `just`
just build     # Build Debug binary
just test      # Run full test suite
just format    # Format Swift code in-place using swift-format
just lint      # Lint Swift code
just run       # Inline build and run (⌘R equivalent)
```

---

## Architecture

Three-layer architectural pattern:

```
UI Layer (SwiftUI)
  ├─ CompactPillView     — Minimal pill interface & hover trigger
  ├─ ExpandedIslandView  — Modular card grid & expanded surface
  ├─ DesignSystem        — Unified visual tokens (radii, grid, vibrancy)
  └─ SettingsView        — Preferences & widget configuration

Core Layer (State & Domain)
  ├─ AppState            — Single source of truth (@Observable)
  ├─ EventBus            — Decoupled asynchronous event broadcasting
  ├─ Preferences         — Type-safe Defaults persistence wrapper
  ├─ RefreshScheduler    — Actor-based periodic background update loop
  └─ NotificationService — User notifications via UNUserNotificationCenter

Integration Layer (AppKit / Window Management)
  ├─ IslandWindow        — Transparent NSWindow floating overlay
  ├─ NotchDetector       — Hardware notch detection and geometry measurement
  ├─ IslandGeometry      — Responsive frame calculation per screen/mode
  └─ MouseEventMonitor   — Global hover, drag, and click event tracking
```

> **Integration Layer**:
> `Beacon/Vendor/NookSurface/` handles window chrome, notch shape adapting, geometry, and hover animations. `Beacon/Island/NookBridge.swift` serves as the clean adapter bridging `NookSurface` with `AppState`.

---

## Module Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| **App** | `Beacon/App/` | Application entrypoint, `AppDelegate`, menu bar status item, Sparkle updater |
| **Core** | `Beacon/Core/` | `AppState`, `EventBus`, `KeychainHelper`, `PresetStore`, `RefreshScheduler`, `LoginItemManager` |
| **Island** | `Beacon/Island/` | `IslandHost`, `NookBridge`, screen location, and surface geometry adaptation |
| **Vendor** | `Beacon/Vendor/` | Vendored open-source modules (`NookSurface`). Any modifications are marked with `// Modified for Beacon:` |
| **UI** | `Beacon/UI/` | SwiftUI views, card components, `DesignSystem`, and `SettingsView` |
| **Features** | `Beacon/Features/` | Self-contained feature modules: `NowPlaying/`, `AIUsage/`, `Calendar/` |
| **Providers** | `Beacon/Providers/` | AI telemetry providers: `Claude/`, `Codex/`, `OpenAI/`, `OpenRouter/` |

---

## Widget Preset System (Core Architectural Principle)

### Tabs = Presets (Not Feature Switches)
Tabs in Beacon are **not** hardcoded feature toggles (e.g. Music vs. AI). They represent user-defined **widget layout presets**.

### Features Must Be Implemented as Widgets
New features must conform to `BeaconWidget` and be registered at startup:

```swift
// Pattern for adding new widget capabilities:
nonisolated struct DevStatusWidget: BeaconWidget {
    let id = "devStatus"
    let supportedSizes: Set<WidgetSize> = [.compact, .standard]
    func body(size: WidgetSize) -> AnyView {
        AnyView(DevStatusView())
    }
}

// In AppDelegate:
appState.widgetRegistry.register(DevStatusWidget())
```

### Core Widget Infrastructure (Do Not Break or Remove)

| File | Purpose |
|------|---------|
| `Beacon/Core/PresetStore.swift` | Preset CRUD operations + `Defaults` persistence |
| `Beacon/Core/WidgetLayout.swift` | `WidgetPlacement`, `PresetLayout`, and size constraints |
| `Beacon/Core/WidgetRegistry.swift` | Dynamic widget registration and lookup |
| `Beacon/Core/WidgetProtocol.swift` | `BeaconWidget` protocol definitions |

---

## Engineering & Coding Conventions

### Swift Style
- Follow official **Swift API Design Guidelines**.
- Types use `UpperCamelCase`; variables, properties, and functions use `lowerCamelCase`.
- The product name is **Beacon**. Avoid redundant prefixes on types within modules.

### Concurrency (Swift 6)
- `@MainActor`: Required for all UI-touching classes (`AppState`, stores, view controllers, view models).
- `Sendable`: All data types crossing concurrency/actor boundaries must be `Sendable`.
- `@Observable`: Used for modern SwiftUI state management. Avoid legacy `ObservableObject` / `@Published`.
- `actor`: Used for shared state requiring isolated concurrent access (e.g., `RefreshScheduler`, `LyricsStore`).

### AppKit + SwiftUI Interop
- Surface window management, level placement (`kCGStatusWindowLevel`), and multi-display tracking -> **AppKit**.
- Visual cards, settings, and widget rendering -> **SwiftUI**.
- SwiftUI views are hosted inside AppKit windows via `NSHostingController`.
- `AppState` is passed down the SwiftUI tree via `@Environment` or direct injection.

### Error Handling
- Leverage Swift typed throws where applicable.
- Provider errors are captured in `ProviderStatus.error(String)`.
- User-facing error notifications propagate through `AppState.latestError`.

---

## Design System & UX Standards

### Anti-AI-Slop & Craftsmanship Standards
- Avoid generic, bland, or robotic layouts.
- Follow craft-focused principles from `.agents/skills/hallmark/`.

### Design Tokens (`UI/DesignSystem.swift`)
- **Grid Unit**: 4pt baseline grid.
- **Corner Radii**: Pill `17pt` (continuous), Cards `28pt` (continuous).
- **Typography**: Apple System Fonts (`SF Pro` / `SF Mono`) exclusively.
- **Materials**: `NSVisualEffectView` with `.ultraDark` vibrancy (deep macOS translucent blur).
- **Spring Animations**:
  - `beaconSpring`: `.spring(response: 0.32, dampingFraction: 0.82)` — Standard interactive transitions
  - `beaconExpand`: `.spring(response: 0.35, dampingFraction: 0.86)` — Island expansion
  - `beaconSubtle`: `.easeInOut(duration: 0.2)` — Micro-interactions

---

## Dependencies

| Dependency | Purpose | Integration |
|------------|---------|-------------|
| **Defaults** | Type-safe `UserDefaults` persistence | SPM |
| **swift-log** | High-performance structured logging | SPM |
| **Sparkle** | Automated updater framework | SPM |
| **NookSurface** | Hardware notch geometry & smooth surface mechanics | Vendored (`Beacon/Vendor/NookSurface/`) |
| **LyricsKit** | Synchronized lyrics parsing and search | SPM |
| **CryptoSwift** | Cryptographic token operations | SPM |

---

## Release & Distribution

- **GitHub Releases**: Signed `.dmg` installer packages published via GitHub Actions.
- **Sparkle Auto-Updates**: Seamless over-the-air updates via `appcast.xml`.
- **Sandbox Policy**: Not distributed on Mac App Store due to custom window levels and audio telemetry requirements.

---

## Notifications

Critical events (such as AI usage quota warnings or CI build notifications) are sent to the macOS Notification Center via `UNUserNotificationCenter`.
- Sound effects: System default or customizable audio alert selected in Settings.
