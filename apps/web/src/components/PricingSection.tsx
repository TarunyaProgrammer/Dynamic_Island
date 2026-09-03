import React from "react";
import { PricingPlan } from "../types";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  currency: "INR" | "USD";
  onSelectPlan: (plan: PricingPlan) => void;
  onDownloadTrial: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ currency, onSelectPlan, onDownloadTrial }) => {
  const plans: PricingPlan[] = [
    {
      id: "annual",
      name: "Annual Pass",
      tagline: "For steady focus and committed builders",
      priceUSD: 19,
      priceINR: 1499,
      billingPeriod: "/ year",
      features: [
        "Unlimited Goals (All 6 Paradigms)",
        "Dynamic Island notch overlay",
        "Interactive Spirit Companion",
        "Apple Music & Spotify controller",
        "Global Hotkey (⌘⇧B) popover",
        "Standard email support",
      ],
      ctaLabel: "Get Annual Pass",
    },
    {
      id: "lifetime",
      name: "Pioneer Lifetime",
      tagline: "Pay once, own Beacon forever with zero recurring fees",
      priceUSD: 29,
      priceINR: 2499,
      billingPeriod: "one-time payment",
      popular: true,
      badge: "MOST POPULAR • FIRST 500 PIONEERS",
      features: [
        "Everything in Annual Pass, forever",
        "Lifetime free updates & major version drops",
        "Zero subscription fees for life",
        "Priority VIP Discord access",
        "Offline local AI companion engine",
        "Commercial use on up to 3 personal Macs",
        "14-Day full refund guarantee",
      ],
      ctaLabel: "Unlock Lifetime Access",
    },
  ];

  return (
    <section id="pricing" style={{ padding: "100px 0", position: "relative" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            SIMPLE, TRANSPARENT INVESTMENT
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
            }}
          >
            Own Your Focus. <span className="gradient-solar">Zero Subscription Fatigue.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "10px auto 0 auto" }}>
            One payment today gives you permanent lifetime ownership of Beacon on macOS.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            maxWidth: "920px",
            margin: "0 auto 40px auto",
          }}
        >
          {plans.map((p) => {
            const isLifetime = p.id === "lifetime";
            const price = currency === "INR" ? `₹${p.priceINR.toLocaleString()}` : `$${p.priceUSD}`;

            return (
              <div
                key={p.id}
                className="glass-panel"
                style={{
                  padding: "36px 32px",
                  borderRadius: "28px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "28px",
                  border: isLifetime ? "1.5px solid var(--accent-solar)" : "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: isLifetime ? "0 20px 60px rgba(0,0,0,0.8), 0 0 32px var(--accent-solar-glow)" : "var(--shadow-card)",
                }}
              >
                {/* Popular Badge */}
                {p.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "4px 14px",
                      borderRadius: "100px",
                      backgroundColor: "var(--accent-solar)",
                      color: "#07080b",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 14px var(--accent-solar-glow)",
                    }}
                  >
                    {p.badge}
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "6px" }}>{p.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", minHeight: "38px" }}>{p.tagline}</p>

                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "20px 0" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "48px",
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {price}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                      {p.billingPeriod}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {p.features.map((feat, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: isLifetime ? "rgba(255, 122, 0, 0.2)" : "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={11} color={isLifetime ? "var(--accent-solar)" : "#ffffff"} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Checkout Trigger */}
                <button
                  type="button"
                  onClick={() => onSelectPlan(p)}
                  className={isLifetime ? "btn-solar" : "btn-ghost-glass"}
                  style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "14px" }}
                >
                  <span>{p.ctaLabel}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Free Trial Banner */}
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            padding: "20px 28px",
            borderRadius: "18px",
            backgroundColor: "rgba(18, 21, 32, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "block" }}>
              Just want to test it on your Mac first?
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Download the free trial version with 3 active goals and full Dynamic Island support.
            </span>
          </div>

          <button
            type="button"
            onClick={onDownloadTrial}
            className="btn-ghost-glass"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <span>Download Free DMG</span>
          </button>
        </div>

        {/* Security & Guarantee Trust Bar */}
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <Shield size={14} color="var(--accent-emerald)" />
          <span>Secured by <b>Razorpay 256-Bit SSL</b> Gateway</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>Instant License Key Delivery</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>14-Day No-Questions-Asked Refund Guarantee</span>
        </div>
      </div>
    </section>
  );
};
