import React from "react";
import { Cpu, HardDrive, Zap, ShieldCheck } from "lucide-react";

export const TechSpecs: React.FC = () => {
  const specs = [
    {
      icon: Cpu,
      title: "0.1% Idle CPU Usage",
      detail: "Hardware-accelerated Electron runtime with idle process suspension. It won't register on your macOS battery monitor.",
    },
    {
      icon: Zap,
      title: "<16ms Native HUD Latency",
      detail: "Snappy 60fps spring transitions mapped directly to macOS display refresh rates (ProMotion 120Hz supported).",
    },
    {
      icon: HardDrive,
      title: "45 MB RAM Footprint",
      detail: "Isolated multi-window architecture. Closes and unloads hidden surfaces when not actively in use.",
    },
    {
      icon: ShieldCheck,
      title: "100% Offline-First Architecture",
      detail: "No mandatory cloud accounts or trackers. Everything persists locally via better-sqlite3 with WAL journaling.",
    },
  ];

  return (
    <section id="specs" style={{ padding: "90px 0", backgroundColor: "var(--bg-canvas-subtle)" }}>
      <div className="container">
        <div style={{ maxWidth: "680px", marginBottom: "44px" }}>
          <span className="eyebrow-wispr" style={{ display: "block", marginBottom: "12px" }}>
            ENGINEERED EFFICIENCY
          </span>
          <h2 className="serif-headline" style={{ fontSize: "clamp(30px, 4.5vw, 48px)", marginBottom: "12px" }}>
            Engineered to respect<br />
            <span className="serif-italic">your Mac's battery.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px" }}>
            We built Beacon because bloated menu apps that chew 15% CPU are unacceptable on Apple Silicon.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {specs.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#0F1117",
                    boxShadow: "0 2px 8px rgba(15, 17, 23, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={18} color="var(--accent-solar)" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "6px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.55 }}>
                  {s.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
