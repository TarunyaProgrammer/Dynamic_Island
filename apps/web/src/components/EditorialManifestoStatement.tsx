import React from "react";
import { Sparkles, Flame, ShieldCheck } from "lucide-react";

export const EditorialManifestoStatement: React.FC = () => {
  return (
    <section
      id="anti-slop"
      style={{
        padding: "120px 0 100px 0",
        backgroundColor: "var(--bg-canvas)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ maxWidth: "880px" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "28px", padding: "6px 14px", borderRadius: "100px", backgroundColor: "rgba(15, 17, 23, 0.05)", border: "1px solid var(--border-subtle)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-ink)" }}>
          <ShieldCheck size={13} color="var(--accent-solar)" />
          <span>A REJECTION OF MODERN SOFTWARE RENT</span>
        </div>

        {/* Master Editorial Typographic Lockup with Dynamic Island Pills */}
        <div
          style={{
            display: "inline-block",
            textAlign: "center",
            margin: "0 auto",
            userSelect: "none",
          }}
        >
          {/* Line 1: Escape + Island Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              lineHeight: 1.05,
              fontSize: "clamp(30px, 6.8vw, 84px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-ink)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <span>Escape</span>
            <div
              style={{
                width: "clamp(100px, 14vw, 150px)",
                height: "clamp(42px, 6vw, 64px)",
                borderRadius: "9999px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(15, 17, 23, 0.18)",
                border: "2px solid rgba(15, 17, 23, 0.1)",
                display: "inline-block",
                verticalAlign: "middle",
                backgroundColor: "#0B0D13",
                transform: "translateY(-4px)",
              }}
            >
              <img
                src="/assets/misty-hills-ambient.jpg"
                alt="macOS atmospheric landscape"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* Line 2: the generic */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              lineHeight: 1.05,
              fontSize: "clamp(30px, 6.8vw, 84px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-ink)",
              fontFamily: "var(--font-sans)",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--accent-solar)",
              }}
            >
              the
            </span>
            <span>subscription</span>
          </div>

          {/* Line 3: spark + AI + notch pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              lineHeight: 1.05,
              fontSize: "clamp(30px, 6.8vw, 84px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-ink)",
              fontFamily: "var(--font-sans)",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: "clamp(110px, 15vw, 160px)",
                height: "clamp(42px, 6vw, 64px)",
                borderRadius: "9999px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(15, 17, 23, 0.18)",
                border: "2px solid rgba(217, 119, 6, 0.4)",
                display: "inline-block",
                verticalAlign: "middle",
                backgroundColor: "#0B0D13",
                transform: "translateY(-4px)",
              }}
            >
              <img
                src="/assets/macbook-notch-mockup.jpg"
                alt="Hardware Dynamic Island"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <span>slop.</span>
          </div>
        </div>

        {/* Narrative Subhead */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "var(--text-body)",
            maxWidth: "620px",
            margin: "36px auto 0 auto",
            lineHeight: 1.6,
          }}
        >
          Your Mac is an Apple Silicon masterpiece. It shouldn't be running four bloated Electron web apps burning 15% CPU just to track your daily habits. Beacon was built on an older, better philosophy: <strong>Pay once. Own forever. Zero cloud lock-in.</strong>
        </p>
      </div>
    </section>
  );
};
