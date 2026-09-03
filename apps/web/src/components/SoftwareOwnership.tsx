import React from "react";
import { Check, X, ShieldCheck, Heart, Sparkles, DollarSign } from "lucide-react";

export const SoftwareOwnership: React.FC = () => {
  return (
    <section id="manifesto" style={{ padding: "100px 0", backgroundColor: "var(--bg-canvas)" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <span className="eyebrow-titanium" style={{ display: "block", marginBottom: "12px" }}>
            A RETURN TO HONEST SOFTWARE
          </span>
          <h2 className="serif-headline" style={{ fontSize: "clamp(34px, 5vw, 56px)", marginBottom: "16px" }}>
            Software you own.<br />
            <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>Not another monthly rent check.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "17px", maxWidth: "600px", margin: "0 auto" }}>
            The modern web turned simple desktop utilities into endless recurring subscriptions. Beacon is engineered on an older, honorable philosophy.
          </p>
        </div>

        {/* Psychological Contrast Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            alignItems: "stretch",
          }}
        >
          {/* Column 1: The Modern SaaS Trap */}
          <div
            style={{
              padding: "36px",
              borderRadius: "24px",
              backgroundColor: "rgba(15, 17, 23, 0.03)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <X size={18} color="#EF4444" />
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  The Modern SaaS Trap
                </span>
              </div>

              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", marginBottom: "8px", fontFamily: "var(--font-serif)" }}>
                $180 – $900+
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                $15/month billed every year of your career.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--text-body)" }}>
                {[
                  "Cancel your subscription and they lock you out of your historical streaks",
                  "Forces all your private habits and journal entries into remote corporate cloud servers",
                  "Burns 15% laptop CPU running heavy Electron web wrappers inside Chrome instances",
                  "Price hikes every 18 months under the guise of 'AI features' you never asked for",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <X size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <span style={{ lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "32px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.06)", fontSize: "12px", color: "#DC2626", fontWeight: 600 }}>
              Psychological toll: Ongoing subscription anxiety and zero real ownership.
            </div>
          </div>

          {/* Column 2: The Beacon Sovereign Ownership */}
          <div
            className="card-editorial"
            style={{
              padding: "36px",
              border: "2px solid var(--accent-obsidian)",
              boxShadow: "0 16px 44px rgba(15, 17, 23, 0.1), 0 0 24px rgba(217, 119, 6, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: "18px", right: "20px", fontSize: "11px", fontWeight: 800, color: "var(--accent-solar)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Permanent Asset
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <ShieldCheck size={18} color="var(--accent-solar)" />
                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent-solar)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Beacon Sovereign Ownership
                </span>
              </div>

              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", marginBottom: "8px", fontFamily: "var(--font-serif)" }}>
                $29 once. Forever.
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                One payment for lifetime personal usage on every Mac you own.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--text-ink)" }}>
                {[
                  "Permanent software license — You own this tool like a physical Swiss watch",
                  "100% private offline SQLite database directly on your SSD (Zero cloud telemetry)",
                  "Ultralight Apple Silicon native binary (0.1% CPU idle, zero battery drain)",
                  "All updates and maintenance releases throughout version 1.x included for free",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <span style={{ lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "32px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(217, 119, 6, 0.08)", fontSize: "12px", color: "var(--text-amber-contrast)", fontWeight: 700 }}>
              Calculated savings: Over $871+ saved over 5 years compared to recurring trackers.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
