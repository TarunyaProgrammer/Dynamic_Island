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
  Headphones 
} from "lucide-react";

export const FeatureGrid: React.FC = () => {
  const paradigms = [
    {
      icon: Flame,
      name: "Habit Streaks",
      type: "Daily Cadence",
      desc: "Daily rituals with automatic weekend pauses and streak freeze protection. Perfect for meditation, reading, and morning runs.",
    },
    {
      icon: TrendingUp,
      name: "Accumulative Targets",
      type: "Numeric Quotas",
      desc: "Log continuous numeric counts without opening the main window. Ideal for 100 LeetCode problems, 50 sales calls, or $10k MRR.",
    },
    {
      icon: CalendarClock,
      name: "Deadline Burn-Down",
      type: "Fixed Dates",
      desc: "Live countdown velocity for product launches, thesis submissions, and hackathons. Pacing indicators keep you ahead of the clock.",
    },
    {
      icon: ListChecks,
      name: "Milestone Roadmaps",
      type: "Phased Projects",
      desc: "Multi-stage roadmaps broken into atomic steps. Hear a native macOS completion chime as you complete each phase.",
    },
    {
      icon: Hourglass,
      name: "Duration Sprints",
      type: "Time Tracking",
      desc: "Accumulate deep work hours automatically. Snaps to your Focus timer without needing third-party pomodoro plugins.",
    },
    {
      icon: ShieldAlert,
      name: "Avoidance Guardian",
      type: "Clean Days",
      desc: "Track consecutive days free from distractions, social media loops, or bad habits, with constructive recovery logs.",
    },
  ];

  return (
    <section id="features" style={{ padding: "80px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: "680px", marginBottom: "48px" }}>
          <span className="tag-tech" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <span className="dot" />
            THE 6 BEHAVIORAL PARADIGMS
          </span>
          <h2
            className="display-headline"
            style={{
              fontSize: "clamp(26px, 3.5vw, 42px)",
              marginBottom: "14px",
            }}
          >
            Built around how people actually form habits.
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px" }}>
            Most trackers force every ambition into a flat daily checkbox. Beacon separates habits, quotas, deadlines, and deep-work hours into dedicated psychological models.
          </p>
        </div>

        {/* 6 Clean Minimalist Hardware Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {paradigms.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="card-hardware"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "180px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid var(--border-hairline)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color="var(--accent-solar)" />
                    </div>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {p.type}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: "6px",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Trio */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="card-hardware" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <Command size={20} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Global Hotkey (⌘⇧B)
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Summon your active goals or log increments instantly from any desktop space or full-screen app.
              </p>
            </div>
          </div>

          <div className="card-hardware" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <Database size={20} color="#ededed" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Local SQLite Database
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Zero telemetry, zero cloud lock-in. Your habits and streaks live locally on your SSD in SQLite WAL mode.
              </p>
            </div>
          </div>

          <div className="card-hardware" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <Headphones size={20} color="#ededed" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Now Playing Sync
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Media controls for Apple Music and Spotify right inside the notch HUD while you stay in the zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
