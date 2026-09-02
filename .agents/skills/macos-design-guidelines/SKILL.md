---
name: macos-desktop-hig
description: >
  Use when designing or refining macOS user experiences in Beacon — covering Menu Bar
  popover layouts, notch adaptation, dark glassmorphic tokens, keyboard shortcuts (⌘⇧B, ⌘Z),
  native system sounds, and accessibility guidelines.
---

# Beacon — macOS Desktop Human Interface Guidelines (HIG)

Beacon is engineered to feel like an authentic, first-party macOS utility.
This skill defines the interaction ergonomics and design principles required for Beacon.

---

## Ergonomic & Visual Principles

1. **Sub-2-Second Interaction Budget**:
   - The primary goal of Beacon is to let users glance at progress or record a `+1` increment and immediately return to deep work.
   - Any interaction requiring more than 2 clicks or 3 seconds of navigation is considered an anti-pattern.

2. **Liquid Notch & Floating Island Positioning**:
   - On MacBooks with physical display notches, the Island seamlessly masks the camera housing with a 0-radius top border.
   - On external displays or non-notch Macs, it renders as a floating glass capsule with rounded borders (`border-radius: 20px`).

3. **Dark Glassmorphic Aesthetics**:
   - Backgrounds: Translucent dark glass (`rgba(18, 18, 24, 0.85)` + `backdrop-filter: blur(24px)`).
   - Borders: 1px hairline subtle borders (`rgba(255, 255, 255, 0.08)`).
   - Accents: Emerald (`#34d399`), Amber (`#fbbf24`), Rose (`#f43f5e`), Indigo (`#6366f1`).

---

## Keyboard Ergonomics

| Shortcut | Scope | Action |
|---|---|---|
| `⌘ + Shift + B` | Global OS | Toggle Spotlight-style Command Palette |
| `⌘ + Z` | In-App | Undo last progress mutation |
| `⌘ + Shift + Z` | In-App | Redo progress mutation |
| `Esc` | In-App | Dismiss palette / collapse Dynamic Island |
| `Enter` | Palette / Modal | Submit action or execute command |

---

## Haptic Audio Feedback

Audio feedback is subtle, soft, and non-intrusive (Web Audio API synthetic synthesizer):
- **Click / Increment**: High-frequency short ping (`800Hz` $\rightarrow$ `1200Hz`, 40ms).
- **Completion / Milestone**: Harmonic chime chord (`523Hz`, `659Hz`, `784Hz`, 300ms).
- **Undo**: Descending low blip (`600Hz` $\rightarrow$ `300Hz`, 60ms).
