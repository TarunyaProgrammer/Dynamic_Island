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
      desc: "Daily rituals with automatic weekend pauses and streak freeze protection. Perfect for reading, workouts, and morning code.",
    },
    {
      icon: TrendingUp,
      name: "Accumulative Targets",
      type: "Numeric Quotas",
      desc: "Log continuous counts directly from the notch without opening the app window. Ideal for 100 LeetCode problems or $10k MRR.",
    },
    {
      icon: CalendarClock,
      name: "Deadline Burn-Down",
      type: "Fixed Dates",
      desc: "Live countdown velocity for ship dates, thesis submissions, and product launches. Pacing alerts keep you ahead of the clock.",
    },
    {
      icon: ListChecks,
      name: "Milestone Roadmaps",
      type: "Phased Projects",
      desc: "Break massive multi-week projects into sequential phases. Hear a satisfying native macOS chime as you clear each phase.",
    },
    {
      icon: Hourglass,
      name: "Duration Sprints",
      type: "Time in Flow",
      desc: "Accumulate deep work hours automatically. Snaps directly to your Focus timer without needing third-party Pomodoro plugins.",
    },
    {
      icon: ShieldAlert,
      name: "Avoidance Guardian",
      type: "Clean Streaks",
      desc: "Track consecutive days free from distractions, social media loops, or bad habits, with constructive relapse logging.",
    },
  ];

  return (
    <section id="features" style={{ padding: "90px 0" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: "680px", marginBottom: "48px" }}>
          <span className="eyebrow-wispr" style={{ display: "block", marginBottom: "12px" }}>
            THE 6 BEHAVIORAL PARADIGMS
          </span>
          <h2
            className="serif-headline"
            style={{
              fontSize: "clamp(32px, 4.5vw, 52px)",
              marginBottom: "16px",
            }}
          >
            Built around how people<br />
            <span className="serif-italic">actually form habits.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "17px" }}>
            Most trackers force every ambition into a flat daily checkbox. Beacon separates habits, quotas, deadlines, and deep work hours into dedicated psychological models.
          </p>
        </div>

        {/* 6 Editorial White Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          {paradigms.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="card-editorial"
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
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bg-canvas-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={19} color="var(--accent-forest)" />
                    </div>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600 }}>
                      {p.type}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text-ink)",
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6 }}>
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
            gap: "20px",
          }}
        >
          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "24px" }}>
            <Command size={22} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                Global Hotkey (⌘⇧B)
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55 }}>
                Summon your active goals or log increments instantly from any desktop space or full-screen app.
              </p>
            </div>
          </div>

          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "24px" }}>
            <Database size={22} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                100% Local SQLite WAL
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55 }}>
                Zero telemetry, zero mandatory accounts. Your streaks live securely on your hard drive.
              </p>
            </div>
          </div>

          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "24px" }}>
            <Headphones size={22} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                Apple Music & Spotify
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55 }}>
                Media controls inside the notch HUD keep you locked in flow without breaking focus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
