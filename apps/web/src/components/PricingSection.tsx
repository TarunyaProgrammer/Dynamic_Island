import React from "react";
import { Check, Shield, ArrowRight, ShieldCheck, Key, Laptop, Apple } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: () => void;
  currency: "INR" | "USD";
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, currency }) => {
  const isINR = currency === "INR";
  const priceDisplay = isINR ? "₹2,499" : "$29";

  return (
    <section id="pricing" style={{ padding: "100px 0", backgroundColor: "var(--bg-canvas)" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="eyebrow-titanium" style={{ display: "block", marginBottom: "12px" }}>
            SIMPLE, HONEST PRICING
          </span>
          <h2 className="serif-headline" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", marginBottom: "14px" }}>
            Invest once in your focus.<br />
            <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>Keep it for life.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px", maxWidth: "520px", margin: "0 auto" }}>
            No subscriptions. No upsells. One single payment for lifetime access across all your personal Macs.
          </p>
        </div>

        {/* Pure Optical White Pricing Card with Obsidian Frame */}
        <div
          style={{
            maxWidth: "580px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            border: "2px solid var(--accent-obsidian)",
            boxShadow: "0 16px 44px rgba(15, 17, 23, 0.1), 0 0 24px rgba(217, 119, 6, 0.08)",
            padding: "clamp(32px, 5vw, 44px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent-solar)" }}>
              Pioneer Lifetime Edition
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              macOS 12+ (Universal)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(48px, 6vw, 64px)",
                fontWeight: 600,
                color: "var(--text-ink)",
                lineHeight: 1,
              }}
            >
              {priceDisplay}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: 500 }}>
              one-time purchase
            </span>
          </div>

          <p style={{ fontSize: "14px", color: "var(--text-body)", marginBottom: "28px", lineHeight: 1.5 }}>
            Instant access to the Dynamic Island notch HUD, Menu Bar hub, 6 goal models, and offline Gemini AI.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px", fontSize: "14px" }}>
            {[
              "Permanent lifetime license (Use on all your personal Macs)",
              "Dynamic Island notch overlay + Menu Bar popover + Command palette",
              "All 6 goal paradigms (Habits, Deadlines, Milestones, Quotas)",
              "100% private offline SQLite WAL database (No accounts)",
              "Apple Music & Spotify media controller integration",
              "Free updates and maintenance releases for all of version 1.x",
              "Instant license key delivery via email and on-screen",
            ].map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0 }} />
                <span style={{ color: "var(--text-ink)" }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Master Obsidian Checkout Button */}
          <button
            type="button"
            onClick={onSelectPlan}
            className="btn-obsidian"
            style={{ width: "100%", padding: "16px", fontSize: "15px", borderRadius: "12px", marginBottom: "20px" }}
          >
            <Apple size={17} />
            <span>Buy Beacon Pioneer — {priceDisplay}</span>
            <ArrowRight size={16} />
          </button>

          {/* 30-Day Guarantee Box */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-canvas-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <ShieldCheck size={26} color="var(--accent-obsidian)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-ink)", display: "block" }}>
                30-Day Money-Back Guarantee
              </strong>
              <span style={{ color: "var(--text-body)" }}>
                Try Beacon on your Mac. If it doesn't transform how you manage your day, email us within 30 days for a full, unconditional refund.
              </span>
            </div>
          </div>
        </div>

        {/* Security & Verification Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "36px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={15} color="var(--accent-solar)" />
            <span>256-bit SSL Encrypted Payment</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Key size={15} color="var(--accent-solar)" />
            <span>Instant License Key</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Laptop size={15} color="var(--accent-solar)" />
            <span>Universal Mac Binary</span>
          </div>
        </div>
      </div>
    </section>
  );
};
