import React from "react";
import { Apple, ArrowRight, Check, Flame, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onOpenPricing: () => void;
  onDownloadTrial: () => void;
  currency: "INR" | "USD";
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenPricing,
  onDownloadTrial,
  currency,
}) => {
  const priceDisplay = currency === "INR" ? "₹2,499" : "$29";

  return (
    <section
      id="hero"
      style={{
        paddingTop: "150px",
        paddingBottom: "80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
          <span className="eyebrow-titanium">
            BEACON DYNAMIC ISLAND FOR MACOS
          </span>
        </div>

        {/* Master Serif Headline */}
        <h1
          className="serif-headline"
          style={{
            fontSize: "clamp(42px, 6.8vw, 76px)",
            marginBottom: "24px",
            color: "var(--text-ink)",
          }}
        >
          Don't break flow,<br />
          <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>
            just glance.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-subhead"
          style={{
            fontSize: "clamp(16px, 2.2vw, 19px)",
            maxWidth: "600px",
            margin: "0 auto 36px auto",
          }}
        >
          Transform your MacBook notch into an ambient hardware heads-up display. Track daily quotas, focus sprints, and streaks with zero distance from your work.
        </p>

        {/* Call to Actions: Obsidian Hardware Button + Clean White Outline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-obsidian"
            style={{ padding: "14px 28px", fontSize: "15px" }}
          >
            <Apple size={17} />
            <span>Get started on macOS</span>
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-white"
            style={{ padding: "14px 24px", fontSize: "15px" }}
          >
            <span>Pioneer Lifetime — {priceDisplay}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Trust Footnote */}
        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "40px" }}>
          Universal macOS binary (Apple Silicon M1/M2/M3/M4 & Intel) • 30-day money-back guarantee
        </span>

        {/* Floating Context Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div className="floating-obsidian-badge">
            <Check size={14} color="#10b981" />
            <span>Logged +10 LeetCode</span>
          </div>

          <div className="floating-white-badge">
            <Flame size={14} color="var(--accent-solar)" />
            <span>14-day Deep Work Streak</span>
          </div>
        </div>
      </div>
    </section>
  );
};
