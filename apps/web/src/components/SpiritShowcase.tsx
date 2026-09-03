import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const SpiritShowcase: React.FC = () => {
  const [selectedSpell, setSelectedSpell] = useState(0);
  const [spiritEmote, setSpiritEmote] = useState<string | null>(null);

  const spells = [
    {
      prompt: "Start a 25m focus sprint on LeetCode",
      reply: "Timer locked in. 25 minutes of deep focus begins in your Dynamic Island. Notifications silenced.",
      action: 'Started 25m Focus Sprint on "LeetCode"',
    },
    {
      prompt: "Create habit: Morning Gym 4 times a week",
      reply: 'Created habit "Morning Gym" (4x/week). Streak freeze protection active for weekends.',
      action: 'Created Habit Goal "Morning Gym" (4d / week)',
    },
    {
      prompt: "How is my momentum rhythm this week?",
      reply: "Strong momentum. You have a 14-day streak on SaaS Deep Work and 85% of your LeetCode quota cleared.",
      action: "Analyzed 6 Active Goal Cadences",
    },
  ];

  const handlePetMascot = () => {
    const emotes = ["✨", "🔥", "🌱", "💡", "⚡"];
    const random = emotes[Math.floor(Math.random() * emotes.length)];
    setSpiritEmote(random);
    setTimeout(() => setSpiritEmote(null), 1200);
  };

  return (
    <section id="spirit" style={{ padding: "80px 0" }}>
      <div className="container">
        {/* Editorial White Showcase Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
            padding: "clamp(32px, 5vw, 56px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Spirit Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <span className="eyebrow-wispr" style={{ display: "block" }}>
              ON-DEVICE GEMINI INTELLIGENCE
            </span>

            <h2
              className="serif-headline"
              style={{
                fontSize: "clamp(32px, 4.5vw, 48px)",
                color: "var(--text-ink)",
              }}
            >
              An autonomous companion,<br />
              <span className="serif-italic">not another chatbox.</span>
            </h2>

            {/* High-Contrast Accessible Body Copy */}
            <p
              style={{
                color: "var(--text-body)",
                fontSize: "16px",
                lineHeight: 1.65,
                fontWeight: 400,
              }}
            >
              Beacon Spirit lives directly inside your hardware notch. Tap the mascot or speak natural language commands. It directly executes actions on your Mac: scheduling timers, logging progress, and synthesizing insights without interrupting your workflow.
            </p>

            {/* Click to Pet Spirit */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handlePetMascot}
                style={{
                  width: "64px",
                  height: "50px",
                  borderRadius: "14px",
                  backgroundColor: "#0B0D13",
                  border: "2px solid rgba(255, 122, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.2s ease",
                }}
                title="Tap to interact with Beacon Spirit"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "12px", borderRadius: "3px", backgroundColor: "#ffffff" }} />
                  <div style={{ width: "6px", height: "12px", borderRadius: "3px", backgroundColor: "#ffffff" }} />
                </div>
                {spiritEmote && (
                  <span style={{ position: "absolute", top: "-20px", right: "-6px", fontSize: "20px" }}>
                    {spiritEmote}
                  </span>
                )}
              </button>

              <div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-ink)", display: "block" }}>
                  Beacon Spirit
                </span>
                <span style={{ fontSize: "13px", color: "var(--accent-solar)", fontWeight: 600 }}>
                  Ready to assist • Tap to interact
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Dark Console */}
          <div
            style={{
              backgroundColor: "#0D0F16",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9EA5B6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Interactive Action Commands
              </span>
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                ● Local (0.8s Latency)
              </span>
            </div>

            {/* Command Buttons with Clear Contrast */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {spells.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSpell(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: selectedSpell === idx ? "rgba(255, 122, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid",
                    borderColor: selectedSpell === idx ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.08)",
                    color: selectedSpell === idx ? "#FFFFFF" : "#CBD1DE",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span>"{s.prompt}"</span>
                  <ArrowRight size={14} color={selectedSpell === idx ? "var(--accent-solar)" : "#9EA5B6"} />
                </button>
              ))}
            </div>

            {/* Companion Output Bubble */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-solar)" }}>
                  Beacon Spirit Response:
                </span>
              </div>

              <p style={{ fontSize: "14px", color: "#EDEDED", lineHeight: 1.5, margin: 0 }}>
                {spells[selectedSpell].reply}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#10B981",
                  backgroundColor: "rgba(16, 185, 129, 0.14)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  width: "fit-content",
                }}
              >
                <CheckCircle2 size={13} />
                <span>{spells[selectedSpell].action}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
