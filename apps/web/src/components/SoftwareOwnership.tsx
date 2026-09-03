import React from "react";
import { X, Check, ShieldCheck } from "lucide-react";

export const SoftwareOwnership: React.FC = () => {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <div className="container" style={{ maxWidth: "920px" }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <span className="tag-tech" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <span className="dot" />
            THE OLD-SCHOOL PROMISE
          </span>
          <h2 className="display-headline" style={{ fontSize: "clamp(26px, 3.5vw, 40px)", marginBottom: "12px" }}>
            Software you own, not software you rent.
          </h2>
          <p className="text-subhead" style={{ fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
            We believe your productivity tools should belong to you, not be held hostage by a monthly subscription.
          </p>
        </div>

        {/* 2-Column Comparison Table */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Column 1: Typical SaaS Tracker */}
          <div
            style={{
              padding: "28px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Modern SaaS Trackers
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>~$144 / year</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Monthly charges forever; stops working the day you cancel</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Mandatory cloud accounts; your habits stored on external servers</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Heavy web wrappers consuming 8–15% CPU in the background</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Cannot log habits without an active internet connection</span>
              </div>
            </div>
          </div>

          {/* Column 2: Beacon Heirloom License */}
          <div
            style={{
              padding: "28px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 122, 0, 0.04)",
              border: "1px solid rgba(255, 122, 0, 0.4)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 122, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} color="var(--accent-solar)" />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--accent-solar)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Beacon Lifetime
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                $29 Once
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px", color: "#ffffff" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Pay once, own forever:</strong> Permanent personal license</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>100% Private SQLite WAL:</strong> No tracking, zero telemetry</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>0.1% Idle CPU:</strong> Native macOS power efficiency</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Fully Offline:</strong> Works on planes, trains, and offline cabins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
