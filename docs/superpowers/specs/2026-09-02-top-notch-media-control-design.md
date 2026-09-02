# Beacon Top-Notch Media Control Design

## Purpose

Make the Dynamic Island media controls reliably operate the media session the user
actually intends, including multiple Chrome windows, multiple YouTube tabs, and
Spotify Web. The top-notch must never silently claim a command worked when it
targeted the wrong player or could not reach the player.

## Scope

This design covers the media controls in Beacon's Dynamic Island. It preserves
native Spotify and Apple Music control and adds reliable Chrome web-media control.
It does not add a general browser automation feature, capture audio, or control
unsupported websites.

## Chosen Architecture

Beacon will use a small, opt-in Chrome Manifest V3 companion extension connected
to the Electron main process through an authenticated loopback channel. Mature
desktop products use this separation because a browser extension is the supported
boundary for inspecting and controlling web-page media; AppleScript URL scanning
cannot identify which of several matching tabs is playing and Chrome may deny
JavaScript Apple Events.

The extension receives permission only for supported media origins and Chrome tab
metadata. It reports actual HTML media state from the exact frame/tab in which it
is running. Beacon resolves one target and sends commands back using the immutable
browser-window-tab-frame identity supplied by Chrome.

The existing JXA integration remains only for native Spotify and Apple Music.
It is not used to inject JavaScript into browser tabs, activate browser windows,
or synthesize site keyboard shortcuts.

## Components

### Browser Media Companion

The extension contains a background service worker and narrowly scoped content
scripts for YouTube, YouTube Music, Spotify Web, SoundCloud, Twitch, and Netflix.
Each script observes native `HTMLMediaElement` events (`play`, `pause`,
`timeupdate`, `durationchange`, `volumechange`, `ended`) and sends a normalized
session snapshot to the service worker.

The service worker combines that snapshot with Chrome's tab/window identity,
visibility, active-tab status, and audible metadata. It forwards session updates
to Beacon and routes a Beacon command only to the matching tab/frame. Commands
return a structured result based on the observed post-command state, not merely
on successful message delivery.

Where a service's player is not exposed as a normal media element, the companion
uses a small, versioned service adapter. The adapter is responsible only for that
service's stable semantic controls: play/pause, next, previous, and volume when
supported. An adapter reports `unsupported` rather than falling back to keyboard
shortcuts or a guessed DOM element.

### Authenticated Local Bridge

Electron creates a localhost-only bridge at startup with a fresh per-launch secret.
The extension pairs through an explicit user action, then includes the secret in
every message. The bridge accepts no non-loopback connection, rate-limits messages,
validates their schema, and invalidates the secret when Beacon exits. No browsing
history, page contents, or credentials leave the Mac.

### Media Target Resolver

`MediaService` stores a `ResolvedMediaTarget` separate from renderer state. It
contains source kind, app/browser identity, Chrome window/tab/frame IDs when
applicable, stable session ID, service name, last confirmed playback state, and
last confirmation time.

On every session update, the resolver ranks candidates as follows:

1. A currently playing target that was previously confirmed by Beacon.
2. Any currently playing target in the frontmost application/window.
3. Any currently playing target in an active tab.
4. Any other currently playing target, ordered by most recent real media activity.
5. A previously controlled paused target, only when no session is playing.

Native Spotify or Apple Music can win only when actually playing. A paused native
player must never mask an actively playing browser session. If two sessions remain
equally ranked, Beacon keeps the existing resolved target rather than oscillating.

### Dynamic Island Contract

The top-notch renders the last confirmed `MediaActivityState` and sends its buttons
to the resolved target. A command is reflected in the UI only after the bridge or
native adapter confirms the expected state transition. If confirmation does not
arrive within a short bounded window, Beacon retains the old state and presents a
clear unavailable/error affordance rather than toggling optimistically.

When no supported, paired player exists, controls are disabled with concise setup
copy. This prevents misleading controls without adding a session picker to the
glanceable top-notch interface.

## Complex Cases and Required Behaviour

| Situation | Required behaviour |
| --- | --- |
| Four YouTube windows and Spotify Web are open | Only the highest-ranked actual playing session is displayed and controlled; the command includes its exact tab/window/frame identity. |
| Two videos are playing | Keep the previously confirmed target unless another session is in the frontmost active tab/window; never alternate on polling order. |
| A video is paused while another tab plays | The playing tab wins. |
| Native Spotify is open but paused | It cannot displace a browser session that is playing. |
| A tab navigates, closes, reloads, enters PiP, or changes frame | Its session is invalidated; the resolver immediately re-evaluates candidates. |
| An ad, live stream, or unknown duration is playing | Playback controls still work; progress UI omits an invalid/unbounded duration. |
| Spotify Web cannot expose a durable control | The Spotify adapter reports unsupported for that command; Beacon does not issue a generic keypress. |
| The extension is disabled, unpaired, or disconnected | Browser candidates are unavailable; native apps still work and the Island exposes a setup/reconnect state. |
| A stale command reply arrives after target change | The resolver discards it using command and session IDs. |
| Rapid repeated button clicks | Commands are serialized per resolved target and duplicate in-flight commands are coalesced. |

## Protocol and Safety Rules

Every bridge message has a protocol version, request ID, source/session ID, and
validated payload. Command results use `confirmed`, `unsupported`, `target-gone`,
`permission-denied`, or `failed`; they never use an unqualified success string.
The main process treats extension messages as untrusted input and limits them to
the published media schema.

Browser permissions are requested only during explicit setup. The extension has no
`<all_urls>` host permission, no access to arbitrary page text, and no background
automation when Beacon is not connected. Beacon uses no private macOS MediaRemote
APIs, so the app remains compatible with normal macOS distribution and signing.

## Testing

Unit tests cover resolver ordering, target stickiness, command serialization,
stale responses, candidate invalidation, and native-vs-browser precedence.
Bridge integration tests cover schema rejection, pairing, reconnection, command
routing, and confirmation timeouts. Extension tests cover normalized media events
and each service adapter's supported/unsupported outcomes. A manual test matrix
covers multiple Chrome windows/profiles, YouTube, Spotify Web, native Spotify,
Apple Music, Safari unaffected behavior, tab closure, sleep/wake, and extension
permission denial.

## Delivery Sequence

1. Extract and test the pure target resolver in `packages/core`.
2. Replace unsafe browser JXA scanning/control with the resolver's native adapter
   boundary and explicit unavailable states.
3. Add the authenticated bridge and Chrome extension pairing flow.
4. Add supported-service adapters, then execute the multi-window manual matrix.

