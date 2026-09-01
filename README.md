<div align="center">
  <img src="docs/Beacon.png" width="108" alt="Beacon logo">

  # Beacon

  **A Dynamic Island-Style Live Hub for macOS**  
  *Engineered & Maintained by [Tarunya K](https://github.com/TarunyaProgrammer)*

  [![macOS 15+](https://img.shields.io/badge/macOS-15%2B-black?logo=apple&logoColor=white)](https://www.apple.com/macos/)
  [![Swift 6](https://img.shields.io/badge/Swift-6-f05138?logo=swift&logoColor=white)](https://swift.org)
  [![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
  [![GitHub](https://img.shields.io/badge/Repository-TarunyaProgrammer%2FDynamic__Island-blue?logo=github)](https://github.com/TarunyaProgrammer/Dynamic_Island)
</div>

---

**Beacon** is a native macOS live hub that brings an interactive, pill-shaped Dynamic Island interface to the top center of your screen. On MacBooks with a physical notch, Beacon seamlessly anchors inside the notch area. On non-notch screens, it floats as an elegant standalone dynamic island.

Hover or click to expand. Get real-time insight into your AI usage quotas, live media playback and synchronized lyrics, calendar events, and custom developer widgets — all without breaking your active workflow.

> [!NOTE]
> Beacon uses dedicated macOS windowing APIs (`kCGStatusWindowLevel`), screen capture audio analysis, and deep system integrations outside the Mac App Store sandbox. Distribution is provided directly via GitHub Releases.

---

## Key Highlights

### 🏝️ Interactive Island Surface
- Smart geometry engine automatically adapts to physical hardware notches or standalone displays.
- Fluid hover-to-expand, auto-collapse delays, and Metal SDF visual transitions.
- Lightweight menu bar companion with full status controls.

### 🎵 Real-Time Media & Synced Lyrics
- Detects playback across **Spotify**, **Apple Music**, and **YouTube Music**.
- Real-time album artwork, transport controls (play/pause/skip), and animated audio waveforms.
- Synchronized timecoded lyrics fetched dynamically via [LRCLIB](https://lrclib.net).

### 🤖 AI Usage & Quota Monitor
- Multi-provider quota telemetry for **Claude**, **Codex**, **OpenAI**, and **OpenRouter**.
- Real-time cost estimates, token velocity tracking, and reset countdowns.

### 🧩 Modular Widget Presets
- User-defined widget layout presets powered by `BeaconWidget` registry architecture.
- Modular cards for calendar, system status, now playing, and AI metrics.

---

## Requirements

| Requirement | Specification |
|---|---|
| **Operating System** | macOS 15.0 (Sequoia) or later |
| **Toolchain** | Xcode 16+ & Swift 6 |
| **Architecture** | Universal (Apple Silicon & Intel) |
| **Maintainer** | Tarunya K ([@TarunyaProgrammer](https://github.com/TarunyaProgrammer)) |

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/TarunyaProgrammer/Dynamic_Island.git
cd Dynamic_Island
```

### 2. Build and Run in Xcode
```bash
open Beacon.xcodeproj
```

### 3. Command-Line Workflows
```bash
# Verify dev environment and setup hooks
just setup

# Build Debug binary
just build

# Run comprehensive test suite
just test

# Format Swift code
just format
```

---

## Architecture Overview

```
Beacon Architecture
 ├── UI Layer (SwiftUI)
 │    ├─ CompactPillView      — Minimal island pill and hover triggers
 │    ├─ ExpandedIslandView   — Modular expanded surface and card grid
 │    ├─ DesignSystem         — Unified visual tokens (SF Pro, radii, ultraDark vibrancy)
 │    └─ SettingsView         — Preferences and widget arrangement
 │
 ├── Core State & Services
 │    ├─ AppState             — Single source of truth (@Observable)
 │    ├─ PresetStore          — Widget preset layouts and persistence
 │    ├─ WidgetRegistry       — Dynamic widget registration and lifecycle
 │    └─ RefreshScheduler     — Concurrent background telemetry coordinator
 │
 └── System Integration (AppKit)
      ├─ IslandWindow         — Transparent NSWindow overlay management
      ├─ NotchDetector        — Hardware notch geometry detection
      ├─ MediaRemoteBridge    — Media session event dispatch
      └─ AudioCaptureService  — ScreenCaptureKit audio waveform analysis
```

---

## Contributing & License

- **License**: Beacon is licensed under a strict proprietary license. See [LICENSE](LICENSE) for full legal terms.
- **Contributions**: Pull requests and code submissions are subject to strict quality and licensing requirements. See [CONTRIBUTING.md](CONTRIBUTING.md) before submitting code.

---

<div align="center">
  <sub>Created with ❤️ by <b>Tarunya K</b> • <a href="https://github.com/TarunyaProgrammer">@TarunyaProgrammer</a></sub>
</div>
