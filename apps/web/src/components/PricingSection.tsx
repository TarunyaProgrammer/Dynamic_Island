import React from "react";
import { Check, Shield, ArrowRight, ShieldCheck, RefreshCw, Key, Laptop } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: () => void;
  currency: "INR" | "USD";
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, currency }) => {
  const isINR = currency === "INR";
  const priceDisplay = isINR ? "₹2,499" : "$29";

  return (
    <section id="pricing" style={{ padding: "90px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="tag-tech" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <span className="dot" />
            PERMANENT LIFETIME LICENSE
          </span>
          <h2 className="display-headline" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: "12px" }}>
            Simple, honest pricing.
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px", maxWidth: "540px", margin: "0 auto" }}>
            No subscriptions. No upsells. One single payment for lifetime access across all your personal Macs.
          </p>
        </div>

        {/* Pricing Card */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "rgba(14, 16, 23, 0.95)",
            borderRadius: "18px",
            border: "1px solid rgba(255, 122, 0, 0.4)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 122, 0, 0.12)",
            padding: "clamp(28px, 5vw, 40px)",
            position: "relative",
          }}
        >
          {/* Top Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-solar)" }}>
              Pioneer Edition (v1.0)
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              macOS 12+ (Universal)
            </span>
          </div>

          {/* Price Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(42px, 6vw, 56px)",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {priceDisplay}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>
              one-time payment
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.5 }}>
            Full access to all 5 native macOS surfaces, the 6 behavioral goal engines, and the offline Gemini companion.
          </p>

          {/* Core Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px", fontSize: "13px" }}>
            {[
              "Lifetime personal license (Use on all your personal Macs)",
              "Dynamic Island notch overlay + Menu Bar hub + Raycast palette",
              "All 6 goal paradigms (Habits, Deadlines, Milestones, Quotas)",
              "100% private offline SQLite WAL database (No accounts)",
              "Apple Music & Spotify media controller integration",
              "Free updates and maintenance patches for all of version 1.x",
              "Instant license key delivery via email and on-screen",
            ].map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Check size={16} color="var(--accent-solar)" style={{ flexShrink: 0 }} />
                <span style={{ color: "var(--text-primary)" }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Big CTA */}
          <button
            type="button"
            onClick={onSelectPlan}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "10px", marginBottom: "20px" }}
          >
            <span>Buy Beacon Pioneer — {priceDisplay}</span>
            <ArrowRight size={16} />
          </button>

          {/* Guarantee Seal Box */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-hairline)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <ShieldCheck size={24} color="var(--accent-solar)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "12px", lineHeight: 1.5 }}>
              <strong style={{ color: "#ffffff", display: "block" }}>
                30-Day Money-Back Guarantee
              </strong>
              <span style={{ color: "var(--text-muted)" }}>
                Try Beacon risk-free. If it doesn't transform your daily focus on your Mac, email us within 30 days for an immediate 100% refund.
              </span>
            </div>
          </div>
        </div>

        {/* Security / Payment Trust Marks */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "32px",
            fontSize: "12px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} color="var(--accent-solar)" />
            <span>256-bit SSL Encrypted Payment</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Key size={14} color="#ededed" />
            <span>Instant License Key</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Laptop size={14} color="#ededed" />
            <span>Universal Mac Binary</span>
          </div>
        </div>
      </div>
    </section>
  );
};
