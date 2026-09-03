import React from "react";
import { Cpu, HardDrive, BatteryCharging, Zap, ShieldCheck, Gauge } from "lucide-react";

export const TechSpecs: React.FC = () => {
  const specs = [
    {
      metric: "0.1%",
      label: "Idle CPU Utilization",
      desc: "Zero timer thrashing. Built with aggressive frame-rate throttling down to 0fps when collapsed.",
      icon: Cpu,
      color: "var(--accent-solar)",
    },
    {
      metric: "45 MB",
      label: "Memory Footprint",
      desc: "10x lighter than typical bloated web wrappers. Optimized garbage collection with zero memory leaks.",
      icon: Gauge,
      color: "var(--accent-cyan)",
    },
    {
      metric: "< 16 ms",
      label: "Hotkey Latency (⌘⇧B)",
      desc: "Pre-warmed headless window textures ensure instantaneous display without hitching.",
      icon: Zap,
      color: "#ec4899",
    },
    {
      metric: "100%",
      label: "Offline & Air-gapped",
      desc: "Local SQLite database operating in WAL mode. Your sensitive routines never touch external servers.",
      icon: ShieldCheck,
      color: "var(--accent-emerald)",
    },
  ];

  return (
    <section id="specs" style={{ padding: "80px 0", position: "relative" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            HIGH PERFORMANCE HARDWARE INTEGRATION
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
            Built for macOS Purists
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "10px auto 0 auto" }}>
            Engineered with strict respect for macOS Human Interface Guidelines and zero tolerance for background battery drain.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {specs.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Icon size={24} color={s.color} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>macOS 12+</span>
                </div>

                <div style={{ margin: "8px 0" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "36px",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "-0.03em",
                      display: "block",
                    }}
                  >
                    {s.metric}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
