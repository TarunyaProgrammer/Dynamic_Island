# Beacon EventKit helper

`BeaconEventKitHelper.swift` is a deliberately small, read-only EventKit process.
It requests Calendar or Reminders access only after a user invokes the corresponding
Today action. It never creates, moves, or deletes Apple Calendar events.

Build it with `npm run build:eventkit`. The command requires full Xcode selected with
`xcode-select`; it deliberately rejects Command Line Tools because a mismatched Swift
compiler and macOS SDK cannot compile Swift modules reliably. After installing a
matching Xcode release, select it with `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.

The packaged binary is copied as `BeaconEventKitHelper` and is called only through
`AppleCalendarService`. Apple Reminder imports remain explicit in the renderer and
are deduplicated by their EventKit identifier.
