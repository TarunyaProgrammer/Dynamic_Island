import React from "react";
import { Apple, Check, ArrowRight, Sparkles, Activity } from "lucide-react";

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
        paddingTop: "70px",
        paddingBottom: "80px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ position: "relative", zIndex: 5 }}>
        {/* Wispr Flow Eyebrow */}
        <div style={{ marginBottom: "20px" }}>
          <span className="eyebrow-wispr">
            BEACON DYNAMIC ISLAND FOR MACOS
          </span>
        </div>

        {/* Master Headline (Garamond Editorial Serif + Italic Accent) */}
        <h1
          className="serif-headline"
          style={{
            fontSize: "clamp(46px, 7vw, 84px)",
            maxWidth: "880px",
            margin: "0 auto 24px auto",
          }}
        >
          Don't break flow,<br />
          <span className="serif-italic">just glance.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-subhead"
          style={{
            maxWidth: "620px",
            margin: "0 auto 36px auto",
          }}
        >
          The zero-latency Dynamic Island for your Mac that turns your camera notch into an intentional peripheral HUD for active goals, habit streaks, and focus sprints.
        </p>

        {/* Wispr Flow Signature Lilac Pill CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <button
            type="button"
            onClick={onDownloadTrial}
            className="btn-lilac"
            style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "10px" }}
          >
            <Apple size={17} />
            <span>Get started on macOS</span>
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-white"
            style={{ padding: "14px 24px", fontSize: "15px", borderRadius: "10px" }}
          >
            <span>Pioneer Lifetime ({currency === "INR" ? "₹2,499" : "$29"})</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Sub-CTA Compatibility Note */}
        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "40px" }}>
          Available for macOS Sonoma, Sequoia & Monterey • Apple Silicon (M1–M4) & Intel
        </span>

        {/* Floating Wispr-Style Interactive Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Green Forest Badge (Like Wispr Flow's Removed Umm) */}
          <div className="floating-forest-badge">
            <Check size={15} strokeWidth={2.5} />
            <span>Logged +10 LeetCode</span>
          </div>

          {/* White Waveform / Streak Pill */}
          <div className="floating-waveform-badge">
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ width: "3px", height: "12px", backgroundColor: "var(--text-ink)", borderRadius: "2px" }} />
              <span style={{ width: "3px", height: "18px", backgroundColor: "var(--accent-solar)", borderRadius: "2px" }} />
              <span style={{ width: "3px", height: "8px", backgroundColor: "var(--text-ink)", borderRadius: "2px" }} />
              <span style={{ width: "3px", height: "15px", backgroundColor: "var(--text-ink)", borderRadius: "2px" }} />
              <span style={{ width: "3px", height: "10px", backgroundColor: "var(--accent-solar)", borderRadius: "2px" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>14-day Deep Work Streak</span>
          </div>
        </div>
      </div>
    </section>
  );
};
