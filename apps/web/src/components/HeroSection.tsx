import React from "react";
import { Apple, ArrowRight, Check, Flame, Users, Sparkles } from "lucide-react";

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
        paddingTop: "160px",
        paddingBottom: "100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `
          linear-gradient(180deg, rgba(246, 246, 248, 0.35) 0%, rgba(246, 246, 248, 0.85) 60%, var(--bg-canvas) 100%),
          url('/assets/misty-hills-ambient.jpg')
        `,
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container" style={{ maxWidth: "1100px", position: "relative", zIndex: 2 }}>
        {/* Eyebrow with Social Proof */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "6px 14px", borderRadius: "100px", backgroundColor: "rgba(255, 255, 255, 0.85)", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(15, 17, 23, 0.04)" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          <span className="eyebrow-titanium">
            PIONEER LAUNCH COHORT • 384 MACS RUNNING BEACON
          </span>
        </div>

        {/* Master Serif Headline */}
        <h1
          className="serif-headline"
          style={{
            fontSize: "clamp(46px, 7.2vw, 84px)",
            marginBottom: "24px",
            color: "var(--text-ink)",
            letterSpacing: "-0.03em",
          }}
        >
          Never break flow.<br />
          <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>
            Just glance at your notch.
          </span>
        </h1>

        {/* High-Converting Psychological Subtitle */}
        <p
          className="text-subhead"
          style={{
            fontSize: "clamp(17px, 2.2vw, 20px)",
            maxWidth: "700px",
            margin: "0 auto 40px auto",
          }}
        >
          Every window switch costs 23 minutes of deep focus to recover. Beacon turns your MacBook notch into an ambient heads-up display—keeping your streaks, quotas, and focus sprints in your peripheral vision without stealing attention.
        </p>

        {/* Call to Actions: Obsidian Hardware Button + Clean White Outline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-obsidian"
            style={{ padding: "15px 32px", fontSize: "15px" }}
          >
            <Apple size={17} />
            <span>Get Pioneer Lifetime — {priceDisplay}</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-white"
            style={{ padding: "15px 28px", fontSize: "15px" }}
          >
            <span>See Live Interactive Demo</span>
          </button>
        </div>

        {/* Trust & Guarantee Micro-Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap", marginBottom: "44px" }}>
          <span>Universal macOS Binary (M1-M4 & Intel)</span>
          <span>•</span>
          <span>Zero Monthly Fees</span>
          <span>•</span>
          <span>30-Day Money-Back Guarantee</span>
        </div>

        {/* Floating Context Proof Badges */}
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
            <span>Logged +10 LeetCode in 1 Glance</span>
          </div>

          <div className="floating-white-badge">
            <Flame size={14} color="var(--accent-solar)" />
            <span>14-day Deep Work Streak Active</span>
          </div>
        </div>
      </div>
    </section>
  );
};
