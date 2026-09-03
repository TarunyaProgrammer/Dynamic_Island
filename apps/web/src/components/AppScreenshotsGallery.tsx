import React, { useState } from "react";
import { 
  LayoutDashboard, 
  AppWindow, 
  Terminal, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface AppSurface {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  image: string;
  highlights: string[];
}

export const AppScreenshotsGallery: React.FC = () => {
  const surfaces: AppSurface[] = [
    {
      id: "dashboard",
      name: "Main Dashboard",
      title: "Obsidian Command Center on MacBook Pro",
      description: "Manage long-term commitments, deep work velocity, and weekly pacing from an ultra-clean dark dashboard.",
      icon: LayoutDashboard,
      image: "/assets/macbook-dashboard-mockup.jpg",
      highlights: ["6 Goal Paradigms", "Weekly Rhythm Spline", "Compounding Momentum"],
    },
    {
      id: "notch",
      name: "Hardware Dynamic Island",
      title: "MacBook Camera Notch HUD",
      description: "Snaps directly to the Apple MacBook display camera notch. Expands smoothly with native spring physics when hovered.",
      icon: AppWindow,
      image: "/assets/macbook-notch-mockup.jpg",
      highlights: ["Zero Pixel Waste", "Live Goal Counter", "Focus Sprint Integration"],
    },
    {
      id: "menubar",
      name: "Menu Bar Hub",
      title: "macOS System Tray Popover",
      description: "Instant access to all active goals and fast-log buttons right from the macOS top status bar.",
      icon: AppWindow,
      image: "/assets/macbook-menubar-mockup.jpg",
      highlights: ["One-Click Quick Log", "Global Habit Overview", "Active Streaks Strip"],
    },
    {
      id: "command",
      name: "Command Engine",
      title: "Spotlight / Raycast Keyboard HUD",
      description: "Hit ⌘⇧B anywhere in macOS. Type '+10 LeetCode' to increment progress without ever lifting your hands from the keyboard.",
      icon: Terminal,
      image: "/assets/macbook-command-mockup.jpg",
      highlights: ["⌘⇧B Global Hotkey", "Natural Language Parse", "0ms Activation"],
    },
    {
      id: "spirit",
      name: "Spirit AI Companion",
      title: "Private Offline Gemini Intelligence",
      description: "Ask for goal adjustments, psychological re-framing, or sprint encouragement. 100% private to your Mac.",
      icon: Sparkles,
      image: "/assets/spirit-companion-clean.png",
      highlights: ["On-Device Gemini AI", "Psychological Coaching", "Context Aware"],
    },
  ];

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const activeSurface = surfaces.find((s) => s.id === activeTab) || surfaces[0];

  return (
    <section id="gallery" style={{ padding: "80px 0" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow-wispr" style={{ display: "block", marginBottom: "12px" }}>
            SEE BEACON IN ACTION
          </span>
          <h2
            className="serif-headline"
            style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              marginBottom: "12px",
            }}
          >
            Crafted exclusively for macOS.<br />
            <span className="serif-italic">On your actual MacBook.</span>
          </h2>
          <p className="text-subhead" style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Every surface is tailored to look and feel like an authentic, first-party Apple experience on Liquid Retina displays.
          </p>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          {surfaces.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeTab;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(s.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  backgroundColor: isActive ? "var(--accent-forest)" : "#FFFFFF",
                  border: isActive ? "1px solid var(--accent-forest)" : "1px solid var(--border-subtle)",
                  color: isActive ? "#FFFFFF" : "var(--text-body)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isActive ? "0 4px 14px rgba(13, 82, 63, 0.25)" : "var(--shadow-sm)",
                }}
              >
                <Icon size={15} color={isActive ? "#FFFFFF" : "var(--text-muted)"} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Surface Showcase Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Top Bar of Card */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "8px 12px 20px 12px",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-ink)", marginBottom: "4px" }}>
                {activeSurface.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-body)" }}>
                {activeSurface.description}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {activeSurface.highlights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: "100px",
                    backgroundColor: "var(--bg-canvas-subtle)",
                    color: "var(--accent-forest)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>

          {/* Photorealistic MacBook Screen Frame */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#0B0D13",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 40px rgba(25, 26, 25, 0.08)",
            }}
          >
            <img
              src={activeSurface.image}
              alt={activeSurface.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "680px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
