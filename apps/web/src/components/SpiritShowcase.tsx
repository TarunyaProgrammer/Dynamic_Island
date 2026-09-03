import React, { useState } from "react";
import { Sparkles, MessageSquare, Zap, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export const SpiritShowcase: React.FC = () => {
  const [selectedSpell, setSelectedSpell] = useState(0);
  const [spiritEmote, setSpiritEmote] = useState<string | null>(null);

  const spells = [
    {
      prompt: "Start a 25m focus sprint on LeetCode",
      reply: "Timer locked in! ✦ 25 minutes of deep algorithmic focus begins now in your Dynamic Island. No tabs, no distractions. Let's crush it! ✨",
      action: 'Started 25m Focus Sprint on "LeetCode"',
    },
    {
      prompt: "Create habit: Morning Gym 4 times a week",
      reply: 'Boom! Created habit "Morning Gym" (4x/week). Streak protection active. I will make sure your flame stays burning bright! 🔥',
      action: 'Created Habit Goal "Morning Gym" (4d / week)',
    },
    {
      prompt: "How is my momentum rhythm this week?",
      reply: "You are surging! You have a 14-day streak on SaaS Deep Work and 85% of your LeetCode milestone is cleared. You are in the top 5% of consistency this month. ✦",
      action: "Analyzed 6 Active Goal Cadences",
    },
  ];

  const handlePetMascot = () => {
    const emotes = ["✨", "🔥", "🎉", "🌱", "💡", "⚡"];
    const random = emotes[Math.floor(Math.random() * emotes.length)];
    setSpiritEmote(random);
    setTimeout(() => setSpiritEmote(null), 1000);
  };

  return (
    <section id="spirit" style={{ padding: "80px 0", position: "relative" }}>
      <div className="container">
        <div
          className="glass-panel"
          style={{
            padding: "clamp(32px, 5vw, 64px)",
            borderRadius: "32px",
            border: "1px solid rgba(255, 122, 0, 0.2)",
            background: "radial-gradient(ellipse at 80% 20%, rgba(255, 122, 0, 0.1) 0%, rgba(14, 16, 25, 0.85) 70%)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Spirit Character & Value */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content", padding: "4px 12px", borderRadius: "100px", backgroundColor: "rgba(255, 122, 0, 0.15)", border: "1px solid rgba(255, 122, 0, 0.3)", color: "var(--accent-solar)", fontSize: "11px", fontWeight: 700 }}>
              <Sparkles size={12} />
              <span>THE BEACON SPIRIT ENGINE</span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(30px, 4vw, 42px)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              An Autonomous Companion,{" "}
              <span className="gradient-solar">Not Just Another Chatbox.</span>
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>
              Beacon Spirit lives directly inside your hardware notch. Tap the mascot or speak natural language commands. It directly executes actions on your Mac: scheduling timers, logging progress, and synthesizing insights without interrupting your workflow.
            </p>

            {/* Click to Pet Spirit */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
              <div
                onClick={handlePetMascot}
                className="spirit-float"
                style={{
                  width: "68px",
                  height: "54px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 122, 0, 0.18)",
                  border: "1px solid rgba(255, 122, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: "0 0 24px rgba(255, 122, 0, 0.25)",
                }}
                title="Click to pet Beacon Spirit!"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "14px", borderRadius: "4px", backgroundColor: "#ffffff" }} />
                  <div style={{ width: "8px", height: "14px", borderRadius: "4px", backgroundColor: "#ffffff" }} />
                </div>
                {spiritEmote && (
                  <span style={{ position: "absolute", top: "-18px", right: "-6px", fontSize: "20px" }}>
                    {spiritEmote}
                  </span>
                )}
              </div>

              <div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "block" }}>
                  Beacon Spirit
                </span>
                <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 500 }}>
                  Ready to conquer goals ✦ (Tap to interact)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Prompt Spell Simulator */}
          <div
            style={{
              backgroundColor: "rgba(10, 11, 16, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Interactive Action Spells
              </span>
              <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                ● Online (0.9s Latency)
              </span>
            </div>

            {/* Quick Spells Pill Switcher */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {spells.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSpell(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: selectedSpell === idx ? "rgba(255, 122, 0, 0.18)" : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid",
                    borderColor: selectedSpell === idx ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.06)",
                    color: selectedSpell === idx ? "#ffffff" : "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>"{s.prompt}"</span>
                  <ArrowRight size={13} style={{ opacity: selectedSpell === idx ? 1 : 0.4 }} />
                </button>
              ))}
            </div>

            {/* Simulated Live Companion Output Bubble */}
            <div
              style={{
                backgroundColor: "rgba(18, 21, 32, 0.9)",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>✨</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-solar)" }}>Beacon Spirit Response:</span>
              </div>

              <p style={{ fontSize: "13px", color: "#ffffff", lineHeight: 1.5 }}>
                {spells[selectedSpell].reply}
              </p>

              {/* Action Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  width: "fit-content",
                }}
              >
                <CheckCircle2 size={12} />
                <span>{spells[selectedSpell].action}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
