import Foundation

protocol AIProvider: Identifiable, Sendable {
    var id: String { get }
    var displayName: String { get }
    var brandColorHex: String { get }
    var icon: String { get }
    var isConfigured: Bool { get }

    func fetchUsage() async throws -> AIUsageData
}

enum UsageSource: String, Sendable {
    case anthropicOAuth
    case chatgptOAuth
    case localEstimate
    case cachedOAuth
}

struct AIUsageData: Sendable {
    var session: UsageTier?
    var weekly: UsageTier?
    var daily: UsageTier?
    var cost: CostInfo?
    var chartData: [DailyUsage]?
    var modelBreakdown: [ModelUsage]?
    var planName: String?
    var lastUpdated: Date?
    var warningMessage: String?
    var isStale: Bool = false
}

struct UsageTier: Sendable {
    var usedFraction: Double  // 0.0–1.0 = usage (0=unused, 1=fully exhausted)
    var resetsAt: Date?
    var label: String
    var source: UsageSource
    var periodDuration: TimeInterval? = nil  // session=5h, weekly=7d

    var remainingFraction: Double { max(0, 1.0 - min(1, usedFraction)) }
    var usedPercent: Int { Int((min(1, max(0, usedFraction)) * 100).rounded()) }
    var remainingPercent: Int { max(0, 100 - usedPercent) }

    func paceInfo(now: Date = Date()) -> PaceInfo? {
        guard let resetsAt, let periodDuration,
            resetsAt > now, periodDuration > 0
        else { return nil }
        let remaining = resetsAt.timeIntervalSince(now)
        let elapsed = periodDuration - remaining
        guard elapsed > 60 else { return nil }  // Unstable if elapsed time is under 1 minute
        let rate = usedFraction / elapsed
        let projectedTotal = usedFraction + rate * remaining
        if projectedTotal <= 1.0 {
            return PaceInfo(surplusFraction: 1.0 - projectedTotal, exhaustionDate: nil)
        } else {
            let timeToExhaustion = (1.0 - usedFraction) / rate
            return PaceInfo(
                surplusFraction: -(projectedTotal - 1.0),
                exhaustionDate: now.addingTimeInterval(timeToExhaustion)
            )
        }
    }
}

struct PaceInfo: Sendable {
    var surplusFraction: Double  // Positive = surplus rate, Negative = deficit rate
    var exhaustionDate: Date?  // Projected exhaustion date (only when exceeding quota rate)
    var willSurvive: Bool { exhaustionDate == nil }
    var surplusPercent: Int { Int((max(0, surplusFraction) * 100).rounded()) }
}

struct CostInfo: Sendable {
    var todayUSD: Double
    var thirtyDayUSD: Double
    var todayTokens: Int
    var thirtyDayTokens: Int
}

struct DailyUsage: Sendable, Identifiable {
    var id: Date { date }
    var date: Date
    var costUSD: Double
    var inputTokens: Int
    var outputTokens: Int
}

struct ModelUsage: Sendable, Identifiable {
    var id: String { modelName }
    var modelName: String
    var costUSD: Double
    var totalTokens: Int
}
