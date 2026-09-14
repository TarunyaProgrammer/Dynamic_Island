# Remove Media Controls Design

## Goal

Remove Beacon's media-control feature completely so the product no longer observes,
controls, displays, or advertises playback from browser or native media players.

## Scope

Remove the browser companion extension, its loopback bridge, the core media service
and resolver, associated IPC/preload/shared contracts, Dynamic Island media mode,
packaging permissions used solely by media automation, tests, and product copy that
promises playback controls.

Keep the generic `ActivityEngine`, focus timers, goal tracking, responsiveness CSS
`@media` rules, and non-playback references to social media or unrelated media.

## Architecture

`BeaconApplication` will no longer create, start, or stop `BrowserMediaBridge`.
`registerGoalHandlers` will only coordinate goals, focus, settings, activity, and AI;
there will be no media IPC handlers or media change event. The preload bridge and
renderer global types will expose no media methods or subscription.

The Dynamic Island will have only `goal` and `focus` tabs. Its keyboard navigation
and compact/expanded layouts will be adjusted to preserve the existing focus flow
without a missing media state. The generic activity type remains unchanged because
it is domain-level vocabulary and existing activity-engine tests exercise it
independently of playback control.

## Removal Boundaries

- Delete the entire `apps/browser-media-companion/` source tree.
- Delete the BrowserMediaBridge and its test.
- Delete MediaService, MediaTargetResolver, and their tests.
- Remove only the app packaging privacy strings that describe media automation.
- Update first-party marketing simulator/copy and product context that explicitly
  advertises notch playback controls.

## Verification

- A repository search finds no Beacon playback-control contracts, browser companion
  references, or `useMedia` imports.
- Typecheck/build and the unit suite pass.
- The Dynamic Island can switch between Goal and Focus using its visible controls
  and keyboard navigation, with no media tab or media-specific keyboard behavior.
