# Browser Media Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement task-by-task.

**Goal:** Reliably show and control the exact Chrome tab/frame playing media, while retaining an honest macOS native-player/AppleScript fallback.

**Architecture:** A user-installed MV3 extension is the primary Chrome integration. It observes real browser media within explicitly granted sites and talks only to Beacon's authenticated loopback bridge. `MediaService` resolves browser snapshots and native Music/Spotify snapshots, then exposes only confirmed capability-aware state to the UI. AppleScript remains a best-effort fallback for native Music/Spotify and supported Chrome services, never a claim of reliable general browser detection.

**Security stance:** Beacon creates a fresh pairing token per launch. The app exposes it only during an intentional setup action; the extension passes it over loopback, stores no page text, and has no blanket host permission. Broad arbitrary-site media observation is requested as an optional Chrome permission through the extension's own user gesture, with clear explanation and revocation instructions.

## User experience

1. When media controls are opened without a paired extension, Beacon shows: **“For reliable Chrome controls, install Beacon Media Companion.”**
2. The explanation says: **“macOS lets apps ask Chrome about tabs, but Chrome and many sites can refuse or hide player state. That can select the wrong tab or no tab at all. The companion reads only playback state in sites you approve and sends it directly to Beacon on this Mac.”**
3. The setup card has **Install extension**, **Pair with Beacon**, **Use native fallback**, and a link to privacy details. The install button opens the Chrome Web Store once published; local development uses a clearly labelled Load Unpacked flow.
4. Native Apple Music/Spotify remain available without the extension. Chrome fallback is labelled **Limited detection** and never reports a fake playing state or optimistic command result.
5. Media buttons are disabled independently when a command is unsupported, unpaired, stale, or failed; their tooltips name the recovery action.

## Tasks

### 1. Define state and protocol contracts

Modify `shared/types.ts` to add source identity, availability (`ready | extension-unpaired | fallback-limited | target-gone | permission-denied | failed`), per-command capabilities, and a human-safe setup reason to `MediaActivityState`. Add protocol DTOs shared only by the main process and extension build. Cover resolver precedence, stale identities, and no-playing fallback with tests.

### 2. Complete `BrowserMediaBridge`

Replace its stub command path with authenticated pairing, bounded message validation, session registry, request IDs, per-target serialized commands, confirmation timeout, disconnection cleanup, and subscriptions. Start/stop it once with the Electron lifecycle—never per renderer or IPC registration. Make the connection details and pairing token available only through an explicit main-process setup request.

### 3. Build and package MV3 extension

Create `apps/browser-media-companion/` with manifest, service worker, media observer, pairing page, popup, and production build script. Start with explicit supported origins; separately offer optional active-tab permission for arbitrary sites. Observe `HTMLMediaElement` events in each frame; identity is Chrome tab/window/frame IDs, never array positions. Commands reach only the identified target and return observed outcomes. `next`/`previous` report unsupported unless a site adapter confirms it.

### 4. Rework `MediaService`

Inject the bridge and `MediaTargetResolver`. Remove browser JXA URL scanning as a primary path. Keep native Music/Spotify adapters and repair script interpolation so TypeScript source selection is passed as data, never JXA `this`. Treat Chrome JXA as low-confidence fallback only, preserve errors, and return unchanged state unless a native command confirms. Never flip `isPlaying` optimistically.

### 5. Wire app lifecycle, IPC, and setup UI

Construct the bridge in `apps/main/index.ts`, pass it to handler registration/MediaService, and dispose it on quit. Add narrow IPC endpoints for media setup status, an intentional pairing bundle, and opening the install page. Expose them from preload. Add a setup sheet accessed from Media—not a permission prompt at app launch—and render status/capabilities in `DynamicIslandView`.

### 6. Verify

Automated tests: malformed/wrong-token bridge input; pair/reconnect; arbitrary-site media snapshot; two playing tabs; stale tab close/navigation; command confirmation/timeout; paused native Spotify versus playing Chrome; no optimistic toggle; native AppleScript denied. Manual macOS acceptance: Chrome playing arbitrary video, YouTube, Spotify Web, multiple windows/profiles/tabs, PiP, sleep/wake, revoked extension permission, no extension, and denied macOS Automation.

## Files expected to change

- `shared/types.ts`, `shared/ipc-channels.ts`
- `packages/core/services/media-service.ts`, `media-target-resolver.ts`, tests
- `apps/main/media/BrowserMediaBridge.ts`, tests; `apps/main/index.ts`; `apps/main/ipc/goalHandlers.ts`
- `apps/preload/index.ts`, `apps/preload/types.ts`
- `apps/renderer/src/hooks/useMedia.ts`, `apps/renderer/src/surfaces/DynamicIslandView.tsx`, a new media-setup component
- New `apps/browser-media-companion/` extension package and build configuration
