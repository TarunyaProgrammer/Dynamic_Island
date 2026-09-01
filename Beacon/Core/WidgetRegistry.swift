import Foundation
import SwiftUI

struct AnyBeaconWidget: Identifiable, @unchecked Sendable {
    let id: String
    let displayName: String
    let icon: String
    let supportedSizes: Set<WidgetSize>

    private let _body: (WidgetSize) -> AnyView

    init<W: BeaconWidget>(_ widget: W) {
        id = widget.id
        displayName = widget.displayName
        icon = widget.icon
        supportedSizes = widget.supportedSizes
        _body = { size in widget.body(size: size) }
    }

    @MainActor func body(size: WidgetSize) -> AnyView {
        _body(size)
    }
}

@MainActor
@Observable
final class WidgetRegistry {
    private var storage: [String: AnyBeaconWidget] = [:]
    private var insertionOrder: [String] = []

    var allWidgets: [AnyBeaconWidget] {
        insertionOrder.compactMap { storage[$0] }
    }

    func register(_ widget: some BeaconWidget) {
        if storage[widget.id] == nil {
            insertionOrder.append(widget.id)
        }
        storage[widget.id] = AnyBeaconWidget(widget)
    }

    func widget(forId id: String) -> AnyBeaconWidget? {
        storage[id]
    }
}
