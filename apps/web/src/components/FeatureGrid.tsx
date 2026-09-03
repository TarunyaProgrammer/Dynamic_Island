import React from "react";
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  ListChecks, 
  Hourglass, 
  ShieldAlert,
  Command,
  Database,
  Headphones
} from "lucide-react";

interface Paradigm {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  name: string;
  type: string;
  desc: string;
}

export const FeatureGrid: React.FC = () => {
  const paradigms: Paradigm[] = [
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
      icon: Calendar,
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
    <section id="features" style={{ padding: "100px 0", backgroundColor: "var(--bg-canvas)" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: "780px", marginBottom: "52px" }}>
          <span className="eyebrow-titanium" style={{ display: "block", marginBottom: "12px" }}>
            SIX BEHAVIORAL PARADIGMS
          </span>
          <h2 className="serif-headline" style={{ fontSize: "clamp(32px, 4.8vw, 52px)", marginBottom: "16px" }}>
            Engineered for how humans<br />
            <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>actually form habits.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "17px" }}>
            Most trackers force every ambition into a flat daily checkbox. Beacon separates habits, quotas, deadlines, and deep work hours into dedicated psychological models.
          </p>
        </div>

        {/* 6 Editorial White Cards with Generous Apple-Grade Padding */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
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
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "220px",
                }}
              >
                <div>
                  {/* Top Row: Icon + Type Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "#0F1117",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(15, 17, 23, 0.2)",
                      }}
                    >
                      <Icon size={20} color="var(--accent-solar)" />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text-amber-contrast)",
                        backgroundColor: "rgba(217, 119, 6, 0.08)",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        border: "1px solid rgba(217, 119, 6, 0.15)",
                      }}
                    >
                      {p.type}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "19px",
                      fontWeight: 800,
                      color: "var(--text-ink)",
                      marginBottom: "10px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Trio with Generous Padding */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#0F1117",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(15, 17, 23, 0.18)",
              }}
            >
              <Command size={18} color="var(--accent-solar)" />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                Global Hotkey (⌘⇧B)
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>
                Summon your active goals or log increments instantly from any desktop space or full-screen app.
              </p>
            </div>
          </div>

          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#0F1117",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(15, 17, 23, 0.18)",
              }}
            >
              <Database size={18} color="var(--accent-solar)" />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                100% Local SQLite WAL
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>
                Zero telemetry, zero mandatory accounts. Your streaks live securely on your hard drive.
              </p>
            </div>
          </div>

          <div className="card-editorial" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#0F1117",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(15, 17, 23, 0.18)",
              }}
            >
              <Headphones size={18} color="var(--accent-solar)" />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "4px" }}>
                Apple Music & Spotify
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: 1.55, margin: 0 }}>
                Media controls inside the notch HUD keep you locked in flow without breaking focus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
