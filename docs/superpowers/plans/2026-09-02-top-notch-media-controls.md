# Top-Notch Media Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Beacon’s Dynamic Island control the actual active media session without selecting, focusing, or guessing the wrong Chrome tab.

**Architecture:** A pure resolver selects one stable target from native-player and browser-extension session reports. A Manifest V3 Chrome companion measures and controls media inside an exact tab/frame; Electron validates its authenticated loopback messages and updates the renderer only after command confirmation.

**Tech Stack:** TypeScript 5.7, Electron 34, React 19, Vitest 3, Chrome Manifest V3, localhost WebSocket bridge.

---

## File structure

- Create `packages/core/services/media-target-resolver.ts` and `packages/core/services/media-target-resolver.test.ts` for deterministic target ranking.
- Modify `packages/core/services/media-service.ts` to remove URL-first browser JXA commands and use target-aware adapters.
- Create `apps/main/media/BrowserMediaBridge.ts` and its tests for the authenticated local transport.
- Create `apps/browser-media-companion/` for the MV3 extension, background registry, and media observer.
- Modify `shared/types.ts`, preload types/bridge, IPC handlers, `useMedia`, and `DynamicIslandView` for confirmed availability state.

### Task 1: Extract and test media target resolution

**Files:**
- Create: `packages/core/services/media-target-resolver.ts`
- Test: `packages/core/services/media-target-resolver.test.ts`

- [ ] **Step 1: Write failing tests for two playing YouTube tabs, a paused native Spotify app versus an active browser tab, stale target invalidation, and frontmost-tab tie-breaking.**

```ts
it('keeps the confirmed YouTube tab when two Chrome tabs are playing', () => {
  const resolver = new MediaTargetResolver();
  resolver.confirm({ id: 'chrome:1:9:0', kind: 'browser', isPlaying: true, activityAt: 20 });
  expect(resolver.resolve([
    { id: 'chrome:1:9:0', kind: 'browser', isPlaying: true, activityAt: 20 },
    { id: 'chrome:2:3:0', kind: 'browser', isPlaying: true, activityAt: 21 },
  ])?.id).toBe('chrome:1:9:0');
});
```

- [ ] **Step 2: Run `npm test -- packages/core/services/media-target-resolver.test.ts`; expect failure because the resolver does not exist.**

- [ ] **Step 3: Implement `MediaCandidate` and `MediaTargetResolver`.**

```ts
export interface MediaCandidate {
  id: string;
  kind: 'native' | 'browser';
  isPlaying: boolean;
  activityAt: number;
  isFrontmost?: boolean;
  isActiveTab?: boolean;
}
```

Score playing candidates first, then the last confirmed candidate, frontmost window, active tab, and latest real media event. Use a paused candidate only when no candidate is playing.

- [ ] **Step 4: Run the targeted test again; expect PASS.**
- [ ] **Step 5: Commit with `git add packages/core/services/media-target-resolver* && git commit -m "feat(media): resolve one stable playback target"`.**

### Task 2: Remove unsafe browser AppleScript routing

**Files:**
- Modify: `packages/core/services/media-service.ts`
- Test: `packages/core/services/media-target-resolver.test.ts`

- [ ] **Step 1: Add a regression test where the first Chrome tab is paused but a later Chrome tab is playing; expect the later tab ID.**
- [ ] **Step 2: Delete the Chrome/Safari/Arc/Brave URL loops and every `execute`, tab activation, `keystroke("k")`, and `Shift+N` fallback.**
- [ ] **Step 3: Define a typed result contract.**

```ts
export type MediaCommandStatus =
  | 'confirmed' | 'unsupported' | 'target-gone' | 'permission-denied' | 'failed';
```

Only set `confirmed` after a result reports the same requested target ID and the expected post-command state. Retain native Spotify/Music support, but do not allow a paused native app to mask browser playback and never flip `currentState.isPlaying` optimistically.

- [ ] **Step 4: Run `npm test -- packages/core/services/media-target-resolver.test.ts && npm run build`; expect PASS and no type errors.**
- [ ] **Step 5: Commit with `git add packages/core/services/media-service.ts packages/core/services/media-target-resolver.test.ts && git commit -m "fix(media): stop targeting browser tabs by URL order"`.**

### Task 3: Build the authenticated Electron bridge

**Files:**
- Create: `apps/main/media/BrowserMediaBridge.ts`
- Create: `apps/main/media/BrowserMediaBridge.test.ts`
- Modify: `apps/main/ipc/goalHandlers.ts`

- [ ] **Step 1: Write tests rejecting incorrect pairing tokens, unknown message types, unmatched request IDs, stale target IDs, and non-loopback peers.**
- [ ] **Step 2: Implement localhost-only startup with a fresh random per-launch token, a 64 KB message limit, protocol-version guard, request IDs, and schema validation.**
- [ ] **Step 3: Expose `subscribeSessions` and `command(targetId, command)`. Route command replies only when both request and target IDs match.**
- [ ] **Step 4: Construct the bridge in `goalHandlers.ts`, pass it to `MediaService`, and dispose it during application cleanup. Renderer code must not access the listener.**
- [ ] **Step 5: Run `npm test -- apps/main/media/BrowserMediaBridge.test.ts`; expect PASS.**
- [ ] **Step 6: Commit with `git add apps/main/media apps/main/ipc/goalHandlers.ts && git commit -m "feat(media): add authenticated browser media bridge"`.**

### Task 4: Implement the scoped Chrome companion

**Files:**
- Create: `apps/browser-media-companion/manifest.json`
- Create: `apps/browser-media-companion/src/background.ts`
- Create: `apps/browser-media-companion/src/content/media-observer.ts`
- Create: `apps/browser-media-companion/src/content/service-adapters.ts`

- [ ] **Step 1: Create an MV3 manifest with `tabs` and `storage`, and only YouTube, YouTube Music, Spotify Web, SoundCloud, Twitch, and Netflix host patterns; do not use `<all_urls>`.**
- [ ] **Step 2: In the content observer, subscribe to `play`, `pause`, `timeupdate`, `durationchange`, `volumechange`, `ended`, and unload. Report tab/frame identity, title, actual playing state, finite duration, current time, volume, and event time.**
- [ ] **Step 3: Handle commands only for the addressed tab/frame. `playPause` waits for the real `play`/`pause` event; volume reports its clamped observed value. Return `unsupported` for next/previous when no verified service adapter exists.**
- [ ] **Step 4: In the background worker, annotate sessions with `tabs.Tab.audible`, active-tab, and focused-window data. Invalidate sessions on tab removal, navigation, and disconnect.**
- [ ] **Step 5: Load the extension manually, pair it explicitly, and check Chrome’s permission UI. Expected: only supported origins are listed and no tab/window is focused by a command.**
- [ ] **Step 6: Commit with `git add apps/browser-media-companion && git commit -m "feat(media): add scoped Chrome media companion"`.**

### Task 5: Render only confirmed top-notch state

**Files:**
- Modify: `shared/types.ts`
- Modify: `apps/preload/types.ts`
- Modify: `apps/preload/index.ts`
- Modify: `apps/renderer/src/hooks/useMedia.ts`
- Modify: `apps/renderer/src/surfaces/DynamicIslandView.tsx`

- [ ] **Step 1: Add `availability: 'ready' | 'unpaired' | 'unsupported' | 'target-gone' | 'failed'` plus optional command capability flags to `MediaActivityState`.**
- [ ] **Step 2: Change `useMedia` to preserve the last confirmed state on IPC failure rather than treating a button press as success.**
- [ ] **Step 3: Disable unavailable buttons and provide precise titles, e.g. `Connect the Beacon Media Companion to control Chrome playback`; disable next/previous individually when unsupported.**
- [ ] **Step 4: Run `npm test && npm run build`; expect all tests and typecheck to pass.**
- [ ] **Step 5: Commit with `git add shared apps/preload apps/renderer/src/hooks/useMedia.ts apps/renderer/src/surfaces/DynamicIslandView.tsx && git commit -m "fix(island): render only confirmed media controls"`.**

### Task 6: Run the acceptance matrix

**Files:**
- Modify: `docs/release.md`

- [ ] **Step 1: Verify four Chrome YouTube windows plus Spotify Web: begin playback in a non-first tab and confirm play/pause touches only that tab without focusing Chrome.**
- [ ] **Step 2: Verify two active players, paused native Spotify, tab close/reload, PiP, extension disconnect, denied pairing, volume 0/100, and sleep/wake.**
- [ ] **Step 3: Record results in `docs/release.md`, run `npm test && npm run build`, and commit with `git add docs/release.md && git commit -m "docs(release): record media control verification"`.**

## Plan self-review

- Tasks 1–2 remove the faulty first-URL approach and native-player precedence bug.
- Tasks 3–4 add the supported, least-privilege browser integration needed for exact playback state.
- Task 5 prevents the top-notch from reporting an unconfirmed action.
- Task 6 covers the multi-window, permission, lifecycle, and volume scenarios stated in the specification.
