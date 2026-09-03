import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Beacon drain my MacBook battery?",
      a: "Not at all. Beacon was engineered from the ground up for energy conservation. When the notch is collapsed, rendering throttles to 0 FPS and idle CPU drops to under 0.1%. It has zero background web-view bloat.",
    },
    {
      q: "What if my Mac doesn't have a camera notch (e.g. Mac mini, Studio, or older MacBook)?",
      a: "Beacon has native notch-geometry adaptation. If your Mac doesn't have a physical camera notch, Beacon renders a gorgeous, floating Dynamic Island pill pinned at the top center of your display with full hover and click interactions.",
    },
    {
      q: "How does the Razorpay checkout and license delivery work?",
      a: "Payment is processed through Razorpay's 256-bit encrypted gateway supporting UPI, Indian & international Credit/Debit cards, NetBanking, and Apple Pay. The moment payment is verified, your unique license key is generated on screen and emailed to your inbox.",
    },
    {
      q: "Is my personal data and habit schedule kept private?",
      a: "Yes, 100%. Beacon does not require an account, has zero cloud tracking, and stores all your data in a local SQLite database in Write-Ahead Logging (WAL) mode right on your physical drive.",
    },
    {
      q: "Can I use one license on multiple personal Macs?",
      a: "Yes! A Pioneer Lifetime License grants you activation rights on up to 3 personal Mac computers (work machine, personal laptop, desktop Mac).",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day no-questions-asked money-back guarantee. If Beacon doesn't dramatically improve your daily focus, simply reach out to support and we will issue a full refund immediately.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "80px 0", position: "relative" }}>
      <div className="container" style={{ maxWidth: "780px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
            }}
          >
            Everything You Need to Know
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="glass-panel"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  backgroundColor: isOpen ? "rgba(22, 26, 40, 0.85)" : "rgba(18, 21, 32, 0.6)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--accent-solar)"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s var(--ease-spring)",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 20px 24px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
