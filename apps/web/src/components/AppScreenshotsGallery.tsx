import React, { useState } from "react";
import { LayoutDashboard, Sparkles, Terminal, AppWindow, ArrowRight } from "lucide-react";

export const AppScreenshotsGallery: React.FC = () => {
  const tabs = [
    {
      id: "dashboard",
      label: "Main Dashboard",
      icon: LayoutDashboard,
      image: "/assets/dashboard-full.png",
      title: "Full Command Center",
      description: "Manage commitments, deep work velocity, and weekly rhythm from a clutter-free obsidian dashboard.",
      callouts: ["6 Goal Paradigms", "Deep Work Waveform", "Weekly Momentum Pacing"],
    },
    {
      id: "island",
      label: "Hardware Dynamic Island",
      icon: AppWindow,
      image: "/assets/dynamic-island-desktop.png",
      title: "Zero-Distance Notch HUD",
      description: "Snaps seamlessly beneath your MacBook camera notch. Hover or tap to reveal active timers and progress rings.",
      callouts: ["Apple Notch Integration", "Interactive Quick Increments", "7-Day Calendar Strip"],
    },
    {
      id: "hub",
      label: "Menu Bar Hub",
      icon: AppWindow,
      image: "/assets/menubar-hub.png",
      title: "Instant Menu Bar Popover",
      description: "One click from your macOS menu bar gives you instant glanceability without losing your focus state.",
      callouts: ["0ms Display Latency", "Quick Progress Logging", "Status At A Glance"],
    },
    {
      id: "command",
      label: "Command Engine",
      icon: Terminal,
      image: "/assets/command-engine.png",
      title: "Spotlight-Speed Input",
      description: "Summon the command palette from anywhere with keyboard shortcuts to query or update any habit instantly.",
      callouts: ["Fuzzy Search", "Keyboard-First Ergonomics", "Natural Language Commands"],
    },
    {
      id: "spirit",
      label: "Spirit AI Companion",
      icon: Sparkles,
      image: "/assets/spirit-companion-chat.png",
      title: "Autonomous Spirit Engine",
      description: "Speak directly to Beacon Spirit powered by Google Gemini with sub-second latency and natural speech pacing.",
      callouts: ["Sub-second Latency (~930ms)", "Action Spells", "Word-by-Word Streaming"],
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const current = tabs[activeTab];

  return (
    <section id="gallery" style={{ padding: "80px 0", position: "relative" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            SEE BEACON IN ACTION
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
            }}
          >
            Crafted Exclusively for macOS
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "620px", margin: "10px auto 0 auto" }}>
            Every surface is tailored to look and feel like an authentic, first-party Apple experience.
          </p>
        </div>

        {/* Gallery Tabs Switcher */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          {tabs.map((t, idx) => {
            const Icon = t.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  backgroundColor: isActive ? "rgba(255, 122, 0, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: "1px solid",
                  borderColor: isActive ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.08)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={15} color={isActive ? "var(--accent-solar)" : "currentColor"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Screenshot Display Frame */}
        <div
          className="glass-panel"
          style={{
            padding: "20px",
            borderRadius: "24px",
            backgroundColor: "#0d0f16",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 32px rgba(255,122,0,0.15)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Header Description */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "12px 16px 20px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
                {current.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {current.description}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {current.callouts.map((c, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 122, 0, 0.12)",
                    color: "var(--accent-solar)",
                    border: "1px solid rgba(255, 122, 0, 0.25)",
                  }}
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshot Image Frame */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#07080b",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={current.image}
              alt={current.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "680px",
                objectFit: "contain",
                display: "block",
              }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
