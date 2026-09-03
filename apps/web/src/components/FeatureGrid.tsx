import React from "react";
import { 
  Flame, 
  TrendingUp, 
  CalendarClock, 
  ListChecks, 
  Hourglass, 
  ShieldAlert, 
  Command, 
  Database, 
  Headphones, 
  Sparkles,
  Zap
} from "lucide-react";

export const FeatureGrid: React.FC = () => {
  const paradigms = [
    {
      icon: Flame,
      color: "var(--accent-solar)",
      name: "Habit Engine",
      subtitle: "Daily & Weekly Streaks",
      description: "Build unstoppable momentum with streak freezing, milestone popups, and automated cadence tracking.",
      badge: "Cadence Guard",
    },
    {
      icon: TrendingUp,
      color: "var(--accent-cyan)",
      name: "Accumulative Targets",
      subtitle: "Metrics & Problems Solved",
      description: "Track numeric progress (e.g. 500 LeetCode problems, 100km run) with instant notch quick-increment pills.",
      badge: "Quick Log",
    },
    {
      icon: CalendarClock,
      color: "#ec4899",
      name: "Deadline Burn-down",
      subtitle: "Projects & Product Launches",
      description: "Keep ship dates top-of-mind with real-time countdowns, pacing indicators, and velocity alerts.",
      badge: "Pacing Alerts",
    },
    {
      icon: ListChecks,
      color: "var(--accent-emerald)",
      name: "Milestone Roadmaps",
      subtitle: "Checklists & Phased Work",
      description: "Break gargantuan projects into bite-sized sequential phases with satisfying audio chimes.",
      badge: "Atomic Steps",
    },
    {
      icon: Hourglass,
      color: "#f59e0b",
      name: "Duration Sprints",
      subtitle: "Deep Work Hours Tracked",
      description: "Accumulate hours in the zone. Integrates directly with FocusManager for automated tracking.",
      badge: "Focus Hours",
    },
    {
      icon: ShieldAlert,
      color: "#6366f1",
      name: "Avoidance Guardian",
      subtitle: "Break Destructive Habits",
      description: "Count days clean from doom-scrolling, caffeine, or distractions with relapse logging.",
      badge: "Clean Streaks",
    },
  ];

  return (
    <section id="features" style={{ padding: "80px 0", position: "relative" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ENGINEERED FOR REAL HUMAN BEHAVIOR
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
            }}
          >
            The 6 Goal Paradigms
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "640px", margin: "10px auto 0 auto" }}>
            Most habit apps force you into daily checkboxes. Beacon supports 6 distinct psychological models engineered for high-performance builders.
          </p>
        </div>

        {/* 6 Paradigms Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          {paradigms.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} color={p.color} />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: p.color,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{p.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{p.subtitle}</span>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* macOS Deep System Integration Banners */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          <div className="glass-panel" style={{ padding: "28px", display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(255, 122, 0, 0.12)", border: "1px solid rgba(255, 122, 0, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Command size={24} color="var(--accent-solar)" />
            </div>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Global Menu Bar & Hotkey (⌘⇧B)</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Summon your goals from any space or full-screen app. Toggle between compact tray popover and full dashboard in 0 milliseconds.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "28px", display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Database size={24} color="var(--accent-emerald)" />
            </div>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Private SQLite WAL Architecture</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Zero mandatory accounts, zero cloud telemetry. Your progress is stored locally in ACID-compliant SQLite on your physical drive.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "28px", display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(192, 132, 252, 0.12)", border: "1px solid rgba(192, 132, 252, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Headphones size={24} color="var(--accent-purple)" />
            </div>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Apple Music & Spotify Sync</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Control your deep focus soundtrack straight from the notch without leaving your code editor or browser tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
