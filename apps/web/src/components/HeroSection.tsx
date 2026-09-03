import React from "react";
import { ArrowRight, Download, Terminal, Shield, Cpu } from "lucide-react";

interface HeroSectionProps {
  onOpenPricing: () => void;
  onDownloadTrial: () => void;
  currency: "INR" | "USD";
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenPricing, onDownloadTrial, currency }) => {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: "60px",
        paddingBottom: "50px",
        borderBottom: "1px solid var(--border-hairline)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
          {/* Release Eyebrow */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "100px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-hairline)",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--accent-solar)" }} />
              <span style={{ color: "#ffffff", fontWeight: 600 }}>Beacon 1.0</span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <span>Universal macOS DMG (Apple Silicon & Intel)</span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="display-headline"
            style={{
              fontSize: "clamp(36px, 5.2vw, 68px)",
              marginBottom: "20px",
            }}
          >
            The Dynamic Island your Mac was missing.
          </h1>

          {/* Subtext (Human, Direct, Real) */}
          <p
            className="text-subhead"
            style={{
              maxWidth: "640px",
              margin: "0 auto 36px auto",
            }}
          >
            Glance at daily goals, tap to increment streaks, and run focus sprints right from the MacBook notch. 100% offline, zero accounts, and 0.1% idle CPU.
          </p>

          {/* Direct CTA Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "40px",
            }}
          >
            <button
              type="button"
              onClick={onOpenPricing}
              className="btn-primary"
            >
              <span>Get Pioneer Lifetime — {currency === "INR" ? "₹2,499" : "$29"}</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={onDownloadTrial}
              className="btn-secondary"
            >
              <Download size={15} />
              <span>Download Free DMG</span>
            </button>
          </div>

          {/* Clean Technical Specs Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              fontSize: "12px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Cpu size={14} color="var(--accent-solar)" />
              <span>0.1% CPU Idle</span>
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={14} color="#ededed" />
              <span>100% Local SQLite WAL</span>
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={14} color="#ededed" />
              <span>⌘⇧B Global Hotkey</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
