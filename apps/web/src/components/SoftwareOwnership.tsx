import React from "react";
import { X, Check, ShieldCheck } from "lucide-react";

export const SoftwareOwnership: React.FC = () => {
  return (
    <section id="manifesto" style={{ padding: "90px 0", backgroundColor: "var(--bg-canvas-subtle)" }}>
      <div className="container" style={{ maxWidth: "960px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="eyebrow-wispr" style={{ display: "block", marginBottom: "12px" }}>
            THE OLD-SCHOOL PROMISE
          </span>
          <h2 className="serif-headline" style={{ fontSize: "clamp(32px, 4.5vw, 50px)", marginBottom: "14px" }}>
            Software you own,<br />
            <span className="serif-italic">not software you rent.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            We believe your productivity tools should belong to you, not be held hostage by a recurring monthly subscription.
          </p>
        </div>

        {/* 2-Column Comparison Table */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Column 1: Typical SaaS Tracker */}
          <div
            style={{
              padding: "32px",
              borderRadius: "16px",
              backgroundColor: "rgba(25, 26, 25, 0.03)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Modern SaaS Trackers
              </span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>~$144 / year</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", color: "var(--text-body)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <X size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Monthly charges forever; stops working the minute you cancel</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <X size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Mandatory cloud accounts; your private habits stored on external servers</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <X size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Heavy web wrappers consuming 8–15% CPU and draining your MacBook battery</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <X size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Cannot log habits without an active internet connection</span>
              </div>
            </div>
          </div>

          {/* Column 2: Beacon Heirloom License */}
          <div
            style={{
              padding: "32px",
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "2px solid var(--accent-obsidian)",
              boxShadow: "0 12px 36px rgba(13, 82, 63, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={18} color="var(--accent-obsidian)" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-obsidian)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Beacon Lifetime
                </span>
              </div>
              <span style={{ fontSize: "13px", color: "var(--accent-obsidian)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                $29 Once
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", color: "var(--text-ink)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <Check size={17} color="var(--accent-obsidian)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Pay once, own forever:</strong> Permanent personal license</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <Check size={17} color="var(--accent-obsidian)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>100% Private SQLite WAL:</strong> No tracking, zero telemetry</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <Check size={17} color="var(--accent-obsidian)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>0.1% Idle CPU:</strong> Hardware-native power efficiency</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <Check size={17} color="var(--accent-obsidian)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Fully Offline:</strong> Works seamlessly on planes and cabins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
