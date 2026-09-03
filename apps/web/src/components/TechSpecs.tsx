import React from "react";
import { Cpu, HardDrive, Zap, ShieldCheck } from "lucide-react";

export const TechSpecs: React.FC = () => {
  const specs = [
    {
      icon: Cpu,
      title: "0.1% Idle CPU Usage",
      detail: "Hardware-accelerated Electron runtime with idle process suspension. You won't see it on your battery monitor.",
    },
    {
      icon: Zap,
      title: "<16ms Native HUD Latency",
      detail: "Snappy 60fps spring transitions mapped directly to macOS display refresh rates (ProMotion 120Hz supported).",
    },
    {
      icon: HardDrive,
      title: "45 MB RAM Footprint",
      detail: "Lightweight isolated multi-window architecture. Closes and unloads hidden surfaces when not actively in use.",
    },
    {
      icon: ShieldCheck,
      title: "100% Offline-First Architecture",
      detail: "No mandatory cloud accounts or trackers. Everything persists locally via better-sqlite3 with WAL journaling.",
    },
  ];

  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <div className="container">
        <div style={{ maxWidth: "680px", marginBottom: "40px" }}>
          <span className="tag-tech" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <span className="dot" />
            ENGINEERED EFFICIENCY
          </span>
          <h2 className="display-headline" style={{ fontSize: "clamp(26px, 3.5vw, 42px)", marginBottom: "12px" }}>
            Engineered to respect your Mac's battery.
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px" }}>
            We built Beacon because bloated Electron menu apps that chew 15% CPU are unacceptable.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {specs.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="card-hardware">
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-hairline)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Icon size={16} color="var(--accent-solar)" />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
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
