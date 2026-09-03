import React from "react";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

export const FounderLetter: React.FC = () => {
  return (
    <section
      style={{
        padding: "100px 0",
        backgroundColor: "var(--bg-canvas)",
      }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="eyebrow-wispr">
            THE BEACON MANIFESTO
          </span>
        </div>

        {/* Paper Container */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "24px",
            padding: "clamp(32px, 6vw, 60px)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2
            className="serif-headline"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "var(--text-ink)",
              marginBottom: "28px",
            }}
          >
            A letter on why we refuse to sell you a subscription.
          </h2>

          <div
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              color: "var(--text-body)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <p>
              Like you, I love my Mac. I bought an Apple Silicon machine because it represents the highest standard of industrial design, quiet power, and battery efficiency on earth.
            </p>

            <p>
              Over the last few years, productivity software took a wrong turn. Everything became a monthly rent: $15 a month for a calendar, $12 a month for a to-do list, $20 a month for a timer. Worse, these apps started chewing 15% of your CPU in the background, forcing mandatory cloud logins, and storing your private daily ambitions on someone else's server.
            </p>

            <p>
              <strong style={{ color: "var(--text-ink)" }}>We built Beacon on an older, better philosophy:</strong> The timeless tradition of classic Mac software like Things, BBEdit, and Panic's Transmit.
            </p>

            {/* 3 Core Commitments */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                margin: "16px 0",
                padding: "24px",
                borderRadius: "16px",
                backgroundColor: "var(--bg-canvas-subtle)",
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <CheckCircle2 size={19} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "var(--text-ink)", display: "block", fontSize: "15px" }}>
                    Pay Once, Own It Forever
                  </strong>
                  <span style={{ fontSize: "14px", color: "var(--text-body)" }}>
                    No recurring credit card charges. When you buy Beacon, your license key is permanent. It runs on all your personal Macs.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <CheckCircle2 size={19} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "var(--text-ink)", display: "block", fontSize: "15px" }}>
                    Zero Cloud Lock-in & 100% Local Storage
                  </strong>
                  <span style={{ fontSize: "14px", color: "var(--text-body)" }}>
                    Your goals, notes, and habits live in a local SQLite file on your physical Mac. If your Wi-Fi dies, or if our servers vanish tomorrow, your Beacon keeps running forever.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <CheckCircle2 size={19} color="var(--accent-forest)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "var(--text-ink)", display: "block", fontSize: "15px" }}>
                    30-Day "No Questions Asked" Full Refund
                  </strong>
                  <span style={{ fontSize: "14px", color: "var(--text-body)" }}>
                    If Beacon doesn't earn its permanent place on your MacBook notch within 30 days, send me an email and I will refund 100% of your money.
                  </span>
                </div>
              </div>
            </div>

            <p>
              Great software should feel like a fine mechanical watch: reliable, unobtrusive, and built to outlast trends. That is my personal commitment to you.
            </p>

            {/* Founder Sign-off */}
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "22px", color: "var(--text-ink)", display: "block" }}>
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
                    color: "var(--text-body)",
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-canvas-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontWeight: 600,
                  }}
                >
                  <span>GitHub @tarunyaprogrammer</span>
                  <ArrowUpRight size={13} />
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
                    color: "var(--text-body)",
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-canvas-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontWeight: 600,
                  }}
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
