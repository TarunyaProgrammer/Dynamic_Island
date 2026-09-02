---
name: beacon-activity-media-engine
description: >
  Use when designing or debugging activity tracking, Focus timers, and media playback
  controls in Beacon — covering ActivityEngine, FocusManager, and MediaService.
---

# Beacon — Activity & Media Engine

Beacon embeds ambient productivity and media control into the top Dynamic Island overlay
and the Main App Focus Dashboard.

---

## Core Systems

### 1. FocusManager (`packages/core/activities/focus-manager.ts`)
- Manages high-resolution focus sprint sessions (e.g. 25-minute Pomodoro intervals).
- Synchronizes countdown state across Island, Tray, and Main Window.
- Automatically logs duration progress towards linked goals upon session completion.

### 2. MediaService (`packages/core/services/media-service.ts`)
- Provides playback control integration (Play, Pause, Skip Next, Previous).
- Tracks playback progress, duration, track title, artist, and album artwork.
- Broadcasts real-time now-playing changes to the Dynamic Island waveform visualizer.

### 3. ActivityEngine (`packages/core/activities/activity-engine.ts`)
- Aggregates activity feeds, session metrics, and daily goal completion events.
- Produces timeline data for the Main Workspace Activity Stream.
