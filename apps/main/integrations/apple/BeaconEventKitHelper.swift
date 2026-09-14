import EventKit
import Foundation

struct CalendarEvent: Codable { let id: String; let title: String; let start: String; let end: String; let calendar: String }
struct Reminder: Codable { let id: String; let title: String; let dueDate: String?; let list: String }

func output<T: Encodable>(_ value: T) { let encoder = JSONEncoder(); encoder.outputFormatting = [.sortedKeys]; print(String(data: try! encoder.encode(value), encoding: .utf8)!) }
func fail(_ message: String) -> Never { FileHandle.standardError.write(Data(message.utf8)); exit(1) }
func waitForAccess(_ request: (@escaping (Bool, Error?) -> Void) -> Void) -> Bool {
  let semaphore = DispatchSemaphore(value: 0)
  var granted = false
  request { ok, _ in granted = ok; semaphore.signal() }
  semaphore.wait()
  return granted
}

// EventKit has no replacement on macOS 13. The call is reached only on that
// release; macOS 14+ takes the full-access API below.
@available(macOS, introduced: 10.8, deprecated: 14.0)
func legacyAccess(_ store: EKEventStore, _ entity: EKEntityType) -> Bool {
  waitForAccess { completion in store.requestAccess(to: entity, completion: completion) }
}

func access(_ store: EKEventStore, _ entity: EKEntityType) -> Bool {
  if #available(macOS 14.0, *) {
    return entity == .event
      ? waitForAccess { completion in store.requestFullAccessToEvents(completion: completion) }
      : waitForAccess { completion in store.requestFullAccessToReminders(completion: completion) }
  }
  return legacyAccess(store, entity)
}

let args = CommandLine.arguments
let store = EKEventStore()
let iso = ISO8601DateFormatter()

func parseISO8601(_ string: String) -> Date? {
  if let d = iso.date(from: string) { return d }
  let withFrac = ISO8601DateFormatter()
  withFrac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return withFrac.date(from: string)
}

guard args.count >= 2 else { fail("Expected calendar or reminders command") }

if args[1] == "calendar" {
  guard args.count == 4, let start = parseISO8601(args[2]), let end = parseISO8601(args[3]) else { fail("Calendar requires ISO start and end") }
  guard access(store, .event) else { fail("Calendar access was not granted") }
  let predicate = store.predicateForEvents(withStart: start, end: end, calendars: nil)
  let events = store.events(matching: predicate).map { event in CalendarEvent(id: event.eventIdentifier, title: event.title ?? "Untitled event", start: iso.string(from: event.startDate), end: iso.string(from: event.endDate), calendar: event.calendar.title) }
  output(events)
} else if args[1] == "reminders" {
  guard access(store, .reminder) else { fail("Reminders access was not granted") }
  let semaphore = DispatchSemaphore(value: 0); var found: [EKReminder] = []
  store.fetchReminders(matching: store.predicateForIncompleteReminders(withDueDateStarting: nil, ending: nil, calendars: nil)) { reminders in found = reminders ?? []; semaphore.signal() }; semaphore.wait()
  output(found.map { reminder in Reminder(id: reminder.calendarItemIdentifier, title: reminder.title ?? "Untitled reminder", dueDate: reminder.dueDateComponents.flatMap { Calendar.current.date(from: $0) }.map(iso.string), list: reminder.calendar.title) })
} else { fail("Unknown command") }
