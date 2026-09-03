import React, { useState, useEffect } from "react";
import { Check, Shield, ArrowRight, ShieldCheck, Key, Laptop, Apple, ArrowUpRight, Zap, Clock, Users } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: () => void;
  currency: "INR" | "USD";
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, currency }) => {
  const isINR = currency === "INR";
  const priceDisplay = isINR ? "₹2,499" : "$29";
  const regularPriceDisplay = isINR ? "₹4,199" : "$49";
  const savingsDisplay = isINR ? "Save ₹1,700" : "Save $20 (40% OFF)";

  // Persistent 24-Hour Pioneer Launch Countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 }; // Rollover
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section id="pricing" style={{ padding: "100px 0", backgroundColor: "var(--bg-canvas)" }}>
      <div className="container" style={{ maxWidth: "880px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px", padding: "5px 12px", borderRadius: "100px", backgroundColor: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.2)" }}>
            <Zap size={13} color="var(--accent-solar)" />
            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-amber-contrast)" }}>
              PIONEER COHORT ALLOCATION
            </span>
          </div>

          <h2 className="serif-headline" style={{ fontSize: "clamp(34px, 4.8vw, 54px)", marginBottom: "14px" }}>
            Invest once in your flow.<br />
            <span className="serif-italic" style={{ color: "var(--accent-solar)" }}>Keep it for the rest of your career.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
            No subscriptions. No recurring charges. One payment secures permanent lifetime access across every Mac you own.
          </p>
        </div>

        {/* Pure Optical White Pricing Card with Obsidian Frame & Launch Urgency */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            border: "2px solid var(--accent-obsidian)",
            boxShadow: "0 20px 60px rgba(15, 17, 23, 0.12), 0 0 30px rgba(217, 119, 6, 0.08)",
            padding: "clamp(24px, 5vw, 44px)",
            position: "relative",
          }}
        >
          {/* 24-Hour Pioneer Launch Urgency Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: "#0F1117",
              color: "#FFFFFF",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em" }}>
                Pioneer Launch Window
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-solar)" }}>
              <Clock size={13} />
              <span>
                {formatPad(timeLeft.hours)}:{formatPad(timeLeft.minutes)}:{formatPad(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Card Top Row: Edition on Left, Interactive Discount Pill on Right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-amber-contrast)" }}>
              Pioneer Lifetime Edition
            </span>

            <a
              href="https://x.com/tarunyakesh"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "100px",
                backgroundColor: "rgba(15, 17, 23, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-ink)",
                fontSize: "11px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              title="Students & indie developers: DM Tarunya on X for personal discounts"
            >
              <span style={{ color: "var(--text-amber-contrast)", fontWeight: 700 }}>Student / Indie?</span>
              <span>DM for discount</span>
              <ArrowUpRight size={12} color="var(--text-muted)" />
            </a>
          </div>

          {/* Psychological Price Anchoring */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(50px, 7vw, 68px)",
                fontWeight: 600,
                color: "var(--text-ink)",
                lineHeight: 1,
              }}
            >
              {priceDisplay}
            </span>

            <span
              style={{
                fontSize: "20px",
                color: "var(--text-muted)",
                textDecoration: "line-through",
                fontWeight: 500,
              }}
            >
              {regularPriceDisplay}
            </span>

            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {savingsDisplay}
            </span>
          </div>

          {/* Scarcity Progress Bar */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Users size={12} />
                <span>384 of 500 Pioneer licenses claimed</span>
              </span>
              <span style={{ color: "var(--text-amber-contrast)" }}>76% Reserved</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-canvas-subtle)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: "76%", height: "100%", backgroundColor: "var(--accent-solar)", borderRadius: "3px" }} />
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--text-body)", marginBottom: "26px", lineHeight: 1.55 }}>
            Instant access to the complete Beacon suite: Dynamic Island notch overlay, Menu Bar hub, 6 goal models, on-device offline intelligence, and universal Apple Silicon binaries.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginBottom: "30px", fontSize: "14px" }}>
            {[
              "Permanent lifetime license — Never see a recurring bill",
              "Install on all your personal Macs (Apple Silicon M1-M4 & Intel)",
              "Dynamic Island notch HUD + Menu Bar hub + Spotlight Command Engine",
              "All 6 behavioral paradigms (Habits, Deadlines, Sprints, Quotas)",
              "100% private offline SQLite WAL database (No tracking or cloud accounts)",
              "Apple Music & Spotify playback integration directly in notch",
              "Free feature updates and maintenance releases across version 1.x",
              "Instant automated license key delivery on-screen & via email",
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
            <span>Claim Pioneer Lifetime License — {priceDisplay}</span>
            <ArrowRight size={16} />
          </button>

          {/* Unconditional 30-Day Risk Reversal Guarantee */}
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
            <ShieldCheck size={28} color="var(--accent-obsidian)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-ink)", display: "block" }}>
                Unconditional 30-Day Money-Back Guarantee
              </strong>
              <span style={{ color: "var(--text-body)" }}>
                Test Beacon in your actual daily work. If it doesn't recover at least 30 minutes of broken flow every day, email us within 30 days for an instant, no-questions refund. Keep your streak data.
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
            <span>256-bit SSL Secure Checkout</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Key size={15} color="var(--accent-solar)" />
            <span>Instant License Key Delivery</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Laptop size={15} color="var(--accent-solar)" />
            <span>Universal Mac Binary (M1-M4)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
