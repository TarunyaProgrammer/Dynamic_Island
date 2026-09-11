# Beacon automation

Beacon exposes local actions through the `beacon://` URL scheme. All mutations
go through the same domain services as the UI, so Today, the tray, Island, undo
history, and future sync operations stay consistent.

## macOS Shortcuts

In Shortcuts, add an **Open URLs** action and use one of these URLs:

```text
beacon://today
beacon://goal/<goal-id>
beacon://goal/<goal-id>/increment?amount=1
beacon://action/<action-id>/plan
beacon://action/<action-id>/done
```

The app is brought forward on the matching surface after each URL runs. IDs are
intentionally explicit: Shortcuts never guesses which similarly named goal or
action you meant.

## CLI

`scripts/beacon-cli.js` produces these same local URLs:

```text
node scripts/beacon-cli.js today
node scripts/beacon-cli.js action <action-id> done
```
