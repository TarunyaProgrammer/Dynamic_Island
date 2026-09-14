# Remove Media Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every Beacon playback-control capability and its browser companion while retaining focus and generic activity tracking.

**Architecture:** Delete the media subsystem at its roots rather than stubbing it. Main-process startup, IPC, preload, shared contracts, and the Dynamic Island will no longer contain media paths; the Island switches only between Goal and Focus. The generic `ActivityEngine` is left intact.

**Tech Stack:** Electron 34, TypeScript 5.8, React 19, Vite, Vitest.

---

## File structure

- Delete: `apps/browser-media-companion/` — the standalone Chrome extension and its protocol tests.
- Delete: `apps/main/media/BrowserMediaBridge.ts` and `.test.ts` — loopback extension transport.
- Delete: `packages/core/services/media-service.ts`, `.test.ts`, `media-target-resolver.ts`, and `.test.ts` — playback discovery, control, and target-selection domain code.
- Modify: `apps/main/index.ts` — remove bridge lifecycle ownership.
- Modify: `apps/main/ipc/goalHandlers.ts` — keep focus/activity handling; remove media construction, broadcasts, and handlers.
- Modify: `shared/ipc-channels.ts`, `shared/types.ts`, `apps/preload/index.ts`, `apps/preload/types.ts` — remove media-only contracts.
- Modify: `apps/renderer/src/surfaces/DynamicIslandView.tsx` — retain the Goal and Focus UI only.
- Modify: `package.json` — remove only media-specific macOS privacy strings.
- Modify: `apps/web/src/types/index.ts`, `apps/web/src/components/IslandSimulator.tsx`, `apps/web/src/components/PricingSection.tsx`, `apps/web/src/components/FeatureGrid.tsx`, and `apps/web/BEACON_CONTEXT.md` — stop showing or promising the removed capability.

### Task 1: Remove the media execution path

**Files:**
- Modify: `apps/main/index.ts`
- Modify: `apps/main/ipc/goalHandlers.ts`
- Modify: `shared/ipc-channels.ts`
- Modify: `shared/types.ts`
- Modify: `apps/preload/index.ts`
- Modify: `apps/preload/types.ts`

- [ ] **Step 1: Confirm the media contract has no non-media consumers**

Run: `rg -n 'MediaService|BrowserMediaBridge|MEDIA_|onMediaChanged|window\.beacon\.media|MediaActivityState' apps packages shared`

Expected: only the files named in this task, the media hook/surface, and media-specific tests appear.

- [ ] **Step 2: Remove the main-process dependencies and lifecycle calls**

In `apps/main/index.ts`, delete the `BrowserMediaBridge` import and the member:

```ts
private browserMediaBridge = new BrowserMediaBridge();
```

Delete its `start()` call, remove its argument from `registerIpcHandlers`, and delete its cleanup `stop()` call. The remaining registration call must end with `this.dailyServices`.

- [ ] **Step 3: Remove media construction, broadcasts, and IPC handlers**

In `apps/main/ipc/goalHandlers.ts`, remove the `MediaService` and `BrowserMediaBridge` imports; remove the optional `browserMediaBridge` parameter; delete:

```ts
const mediaService = new MediaService(activityEngine, browserMediaBridge);
const broadcastMediaChanged = (state: any) => {
  safeBroadcast(IPC_CHANNELS.EVENT_MEDIA_CHANGED, state);
};
mediaService.subscribe(broadcastMediaChanged);
```

Delete the full `// macOS Media Handlers` block, including pairing clipboard handlers. Keep the focus handler immediately before it and the file's closing brace intact. Remove `clipboard` from the Electron import if no other handler uses it.

- [ ] **Step 4: Delete the shared and preload media API shapes**

Delete the `MEDIA_*` constants and `EVENT_MEDIA_CHANGED` from `shared/ipc-channels.ts`; delete `MediaActivityState` from `shared/types.ts`; delete the `media` object and `onMediaChanged` listener from both preload files. The public bridge must continue to expose only existing non-media APIs.

- [ ] **Step 5: Typecheck this boundary**

Run: `npm run build`

Expected: it may fail only at remaining renderer/media files slated for Task 2; there must be no error from a malformed IPC/preload/shared contract.

### Task 2: Remove the actual media implementation and Dynamic Island mode

**Files:**
- Delete: `apps/browser-media-companion/`
- Delete: `apps/main/media/BrowserMediaBridge.ts`
- Delete: `apps/main/media/BrowserMediaBridge.test.ts`
- Delete: `packages/core/services/media-service.ts`
- Delete: `packages/core/services/media-service.test.ts`
- Delete: `packages/core/services/media-target-resolver.ts`
- Delete: `packages/core/services/media-target-resolver.test.ts`
- Delete: `apps/renderer/src/hooks/useMedia.ts`
- Modify: `apps/renderer/src/surfaces/DynamicIslandView.tsx`

- [ ] **Step 1: Remove files that exclusively implement playback**

Delete exactly the paths listed above. Do not delete `packages/core/activities/activity-engine.ts` or its test: it is also used for focus activities.

- [ ] **Step 2: Simplify Dynamic Island state to Goal and Focus**

In `DynamicIslandView.tsx`, remove `useMedia`, the media state/control destructuring, artwork/pairing state, `copyBrowserPairingDetails`, and all media-only Lucide imports (`Music`, `Pause`, `Play`, `SkipBack`, `SkipForward`, `Volume2`). Change the tab state to:

```ts
const [activeTab, setActiveTab] = useState<'goal' | 'focus'>('goal');
```

Replace cyclic tab navigation with two-way toggling:

```ts
setActiveTab((prev) => (prev === 'goal' ? 'focus' : 'goal'));
```

Delete the Space-key media-control branch and the Media tab button. Delete the entire `{activeTab === 'media' && (...)}` playback panel, including artwork, pairing, transport, progress, and volume UI. Retain the Goal and Focus panels and their collapse-timer calls.

- [ ] **Step 3: Run focused static verification**

Run: `rg -n 'useMedia|mediaState|MediaActivityState|BrowserMediaBridge|MediaService|MEDIA_|EVENT_MEDIA_CHANGED|media companion|Media Controls' apps packages shared`

Expected: no matches. A zero exit status is not required because `rg` returns 1 when nothing matches.

- [ ] **Step 4: Run the desktop checks**

Run: `npm test -- --run`

Expected: PASS, with deleted media-specific suites absent and the activity-engine suite still present.

Run: `npm run build`

Expected: PASS.

### Task 3: Remove distribution permissions and product promises

**Files:**
- Modify: `package.json`
- Modify: `apps/web/src/types/index.ts`
- Modify: `apps/web/src/components/IslandSimulator.tsx`
- Modify: `apps/web/src/components/PricingSection.tsx`
- Modify: `apps/web/src/components/FeatureGrid.tsx`
- Modify: `apps/web/BEACON_CONTEXT.md`

- [ ] **Step 1: Remove automation descriptions used solely for playback**

From `build.mac.extendInfo` in `package.json`, delete only:

```json
"NSAppleEventsUsageDescription": "Beacon needs automation permission to detect currently playing tracks and provide media playback controls in the Dynamic Island.",
"NSSystemAdministrationUsageDescription": "Beacon needs permission to provide global keyboard shortcuts and ambient media controls.",
```

Keep accessibility, notifications, calendar, and reminders descriptions.

- [ ] **Step 2: Make the site simulator represent the shipped Island**

Change `NotchTab` to:

```ts
export type NotchTab = "beacon" | "focus";
```

In `IslandSimulator.tsx`, remove the Media selector button and the `activeTab === "media"` mock track panel. Remove the now-unused `Music2` icon import. Goal and Focus preview behavior stays unchanged.

- [ ] **Step 3: Stop selling removed functionality**

Remove the Apple Music/Spotify feature string from `PricingSection.tsx`, remove the Apple Music & Spotify feature card from `FeatureGrid.tsx`, and replace the media-controls clause in `apps/web/BEACON_CONTEXT.md` with wording that describes Goal and Focus controls only.

- [ ] **Step 4: Verify full removal without false positives**

Run:

```bash
rg -n -i 'media controls|media companion|playback integration|now playing|browser-media-companion|BrowserMediaBridge|MediaService|useMedia|MediaActivityState' . --glob '!node_modules/**' --glob '!docs/superpowers/**'
```

Expected: no matches. Do not treat CSS `@media` or unrelated social-media references as failures.

- [ ] **Step 5: Run the full acceptance suite**

Run: `npm test -- --run && npm run build`

Expected: both commands exit 0.

- [ ] **Step 6: Review the intended diff and commit**

Run: `git diff --check && git status --short`

Expected: only media-removal code/deletions, the approved documentation, and pre-existing user-owned untracked files are shown. Stage only removal-related paths, then commit:

```bash
git commit -m "refactor: remove media controls"
```
