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

3. **Dual Atmospheric Dark & Crystalline Light Aesthetics**:
   - Dark mode signature: `#0B0C10` app bg, `#12141A` surface, `#191C24` elevated (`backdrop-filter: blur(24px)`).
   - Light mode crystalline: `#F5F6F8` app bg, `#FFFFFF` surface, `#ECEEF2` elevated.
   - Borders: 1px hairline subtle borders (`var(--border-subtle)`).
   - Accents: Electric Blue-Violet (`#7C6CFF`), Soft Cyan (`#5AC8FA`), Emerald (`#10B981`), Amber (`#F59E0B`), Rose (`#EF4444`).

4. **Visual Metaphor — Light, Not Fire**:
   - Beacon owns **Light**, not fire.
   - Use luminous rays (`✦`), beams, and subtle 200–250ms optical halos (`• ╱│╲ ╱ │ ╲`).
   - Never use fire emojis, arcade XP, or loud confetti.

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
- **Default Mode**: **Silent by default** for normal clicks and increments.
- **Three Modes**: `Silent` (completely quiet), `Subtle` (only milestone completions & timer finish), `Full` (tactile micro-pops).
- **Completion Chime**: Soft harmonic sine chime chord resembling a warm lamp turning on (`528Hz` resonant base, 400ms soft decay). Never loud arcade beeps.
