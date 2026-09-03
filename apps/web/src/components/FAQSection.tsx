import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Beacon drain my MacBook battery?",
      a: "No. Beacon was engineered from the ground up for energy conservation. When the notch is collapsed, rendering throttles to 0 FPS and idle CPU drops to under 0.1%. It has zero background web-view bloat.",
    },
    {
      q: "What if my Mac doesn't have a camera notch (e.g. Mac mini, Studio, or iMac)?",
      a: "Beacon features automatic screen geometry detection. If your Mac doesn't have a physical camera notch, Beacon renders a floating Dynamic Island capsule pinned at the top center of your display with full hover and click interactions.",
    },
    {
      q: "How does the Razorpay checkout and license delivery work?",
      a: "Payment is processed through Razorpay's 256-bit encrypted gateway supporting UPI, Indian & international Credit/Debit cards, NetBanking, and Apple Pay. The moment payment is verified, your unique license key is generated on screen and emailed to your inbox.",
    },
    {
      q: "Is my personal data and habit schedule kept private?",
      a: "Yes, 100%. Beacon does not require an account, has zero cloud tracking, and stores all your data in a local SQLite database in Write-Ahead Logging (WAL) mode right on your physical hard drive.",
    },
    {
      q: "Can I use one license on multiple personal Macs?",
      a: "Yes. A Pioneer Lifetime License grants you activation rights on up to 3 personal Mac computers (work laptop, personal MacBook, desktop Mac).",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 30-day unconditional money-back guarantee. If Beacon doesn't earn its place on your Mac, email us for a 100% refund, no questions asked.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "90px 0", backgroundColor: "var(--bg-canvas-subtle)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="eyebrow-wispr" style={{ display: "block", marginBottom: "12px" }}>
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2
            className="serif-headline"
            style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              color: "var(--text-ink)",
            }}
          >
            Everything you need to know.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: isOpen ? "var(--shadow-card)" : "var(--shadow-sm)",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
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
                    color: "var(--text-ink)",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--accent-forest)"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                      flexShrink: 0,
                      marginLeft: "16px",
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 20px 24px",
                      fontSize: "14px",
                      color: "var(--text-body)",
                      lineHeight: 1.65,
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "16px",
                    }}
                  >
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
