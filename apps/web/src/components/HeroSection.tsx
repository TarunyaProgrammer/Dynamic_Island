import React from "react";
import { ArrowRight, Download, Sparkles, Zap, Shield, Cpu, Play } from "lucide-react";

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
        paddingTop: "72px",
        paddingBottom: "80px",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Radiant Space Glows */}
      <div
        className="radial-glow"
        style={{
          width: "600px",
          height: "400px",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 122, 0, 0.14)",
        }}
      />
      <div
        className="radial-glow"
        style={{
          width: "450px",
          height: "300px",
          top: "120px",
          right: "10%",
          backgroundColor: "rgba(56, 189, 248, 0.08)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        {/* Shimmer Announcement Pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", marginBottom: "24px" }} className="badge-shimmer">
          <Sparkles size={14} color="var(--accent-solar)" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-solar)", letterSpacing: "0.02em" }}>
            BEACON 1.0 FOR MACOS IS LIVE
          </span>
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#ffffff" }}>
            Apple Silicon & Intel
          </span>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
            maxWidth: "960px",
            margin: "0 auto 20px auto",
          }}
          className="gradient-title"
        >
          Turn Your MacBook Notch Into an{" "}
          <span className="gradient-solar">Intentional Living Companion.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "var(--text-secondary)",
            maxWidth: "680px",
            margin: "0 auto 36px auto",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Stop losing hours to context-switching. Beacon transforms your idle camera notch into an ultra-fast hardware HUD, habit engine, and offline AI companion that keeps deep focus burning bright.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}
        >
          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-solar"
            style={{ padding: "14px 28px", fontSize: "15px" }}
          >
            <span>Get Pioneer Lifetime — {currency === "INR" ? "₹2,499" : "$29"}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={onDownloadTrial}
            className="btn-ghost-glass"
            style={{ padding: "14px 24px", fontSize: "15px" }}
          >
            <Download size={16} />
            <span>Download Free DMG (v1.0)</span>
          </button>
        </div>

        {/* Trust & Architecture Metrics Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(12px, 3vw, 36px)",
            flexWrap: "wrap",
            padding: "16px 24px",
            maxWidth: "820px",
            margin: "0 auto",
            backgroundColor: "rgba(18, 21, 32, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "16px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={14} color="var(--accent-solar)" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>0.1% CPU</span>
            <span>Zero Battery Drain</span>
          </div>
          <span style={{ opacity: 0.2 }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} color="var(--accent-emerald)" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>100% Local</span>
            <span>SQLite WAL Storage</span>
          </div>
          <span style={{ opacity: 0.2 }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={14} color="var(--accent-cyan)" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>⌘⇧B Shortcut</span>
            <span>Instant Global Popover</span>
          </div>
        </div>
      </div>
    </section>
  );
};
