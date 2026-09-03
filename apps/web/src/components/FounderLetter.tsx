import React from "react";
import { ShieldCheck, HeartHandshake, CheckCircle2, Lock, ArrowUpRight } from "lucide-react";

export const FounderLetter: React.FC = () => {
  return (
    <section
      style={{
        padding: "100px 0",
        borderBottom: "1px solid var(--border-hairline)",
        backgroundColor: "#07080b",
      }}
    >
      <div className="container" style={{ maxWidth: "820px" }}>
        {/* Section Pill */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              padding: "4px 12px",
              borderRadius: "100px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            THE BEACON MANIFESTO
          </span>
        </div>

        {/* Letter Container (Classic Editorial Paper / Obsidian Board) */}
        <div
          style={{
            backgroundColor: "rgba(18, 20, 28, 0.5)",
            border: "1px solid var(--border-hairline-bright)",
            borderRadius: "16px",
            padding: "clamp(32px, 5vw, 56px)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3.2vw, 36px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
              marginBottom: "28px",
            }}
          >
            A letter on why we refuse to sell you a subscription.
          </h2>

          <div
            style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <p>
              Like you, I love my Mac. I bought an Apple Silicon machine because it represents the highest standard of industrial design, responsiveness, and hardware battery efficiency on earth.
            </p>

            <p>
              Over the last few years, software took a wrong turn. Everything became a monthly rent: $15 a month for a calendar, $12 a month for a to-do list, $20 a month for a timer. Worse, these apps started chewing 15% of your CPU in the background, forcing mandatory cloud logins, and storing your private daily ambitions on someone else's server.
            </p>

            <p>
              <strong style={{ color: "#ffffff" }}>We built Beacon on an older, better philosophy:</strong> The timeless tradition of classic Mac software like Things, BBEdit, and Panic's Transmit.
            </p>

            {/* 3 Core Commitments */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                margin: "16px 0",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                border: "1px solid var(--border-hairline)",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={18} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "#ffffff", display: "block", fontSize: "14px" }}>
                    Pay Once, Own It Forever
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    No recurring credit card charges. When you buy Beacon, your license key is permanent. It runs on all your personal Macs.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={18} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "#ffffff", display: "block", fontSize: "14px" }}>
                    Zero Cloud Lock-in & 100% Local Storage
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Your goals, notes, and habits live in a local SQLite file on your physical Mac. If your Wi-Fi dies, or if our servers vanish tomorrow, your Beacon keeps running forever.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={18} color="var(--accent-solar)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "#ffffff", display: "block", fontSize: "14px" }}>
                    30-Day "No Questions Asked" Full Refund
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    If Beacon doesn't earn its permanent place on your MacBook notch within 30 days, send me a single email and I will refund 100% of your money.
                  </span>
                </div>
              </div>
            </div>

            <p>
              Great software should feel like a fine mechanical watch: reliable, unobtrusive, and built to outlast trends. That is my personal commitment to you.
            </p>

            {/* Founder Sign-off */}
            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-hairline)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "17px", color: "#ffffff", display: "block" }}>
                  Tarunya Kesharwani
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Creator & Architect of Beacon
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <a
                  href="https://github.com/tarunyaprogrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-hairline)",
                  }}
                >
                  <span>GitHub @tarunyaprogrammer</span>
                  <ArrowUpRight size={12} />
                </a>

                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-hairline)",
                  }}
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
